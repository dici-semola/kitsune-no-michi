// Generatori procedurali (deterministici dal seed) per ogni tipo di mappa.
// Il mondo è vasto ma pesa poche righe di dati: la struttura narrativa vive in data/world.js.
import { T, DEFS, WINDOW_OF } from '../data/tiles.js';
import { MAPS, TOWNS, OUTPOSTS, SHRINES, PATHS, ENTRANCES, BUILDINGS_OW, DIVE, OW_STABLE, OW_PROPS, CHEST_LOOT, THEMES, BIOME_IDS } from '../data/world.js';
import { NPCS } from '../data/npcs.js';
import { TileMap } from '../engine/TileMap.js';
import { genOverworld, genCityMap, genSpirit } from './Overworld.js';
import { genLimbo } from './Limbo.js';
import { mulberry32, fbm, strHash } from '../core/Util.js';
import { PATCHES } from '../data/mapPatches.js';
import '../data/thalassa.js';
import { verticalize } from './Vertical.js';
import { buildPalace, stampPalaceInAugusta } from './Palace.js';
import { genTerritory, stampTerritoryGates } from './Territory.js';
import { repairReach } from './NavAudit.js';
import { civVariety, shrineSkins, interiorVariety } from './Variety.js';
import '../data/territori.js';
import { applyPatch, applyNpcPatches, resetNpcs, patchIdOf } from './MapPatch.js';

const cache = new Map();
export const mapIds = () => Object.keys(MAPS);
export const dropMap = (id) => cache.delete(id);
export const GEN_OPTS = { vertical: true, variety: true };   // i test lo spengono per confrontare le collisioni con e senza sviluppo verticale

export function getMap(id) {
  if (!cache.has(id)) cache.set(id, build(id));
  return cache.get(id);
}

// Mappa generata dal solo codice, senza le modifiche del Map Editor (per l'editor stesso e per il confronto originale/modificata)
export function buildBase(id) { return build(id, false); }
applyNpcPatches(NPCS, PATCHES);
export const reapplyNpcPatches = (patches = PATCHES) => applyNpcPatches(NPCS, patches);

function build(id, patched = true) {
  const def = MAPS[id];
  if (!def) throw new Error('Mappa sconosciuta: ' + id);
  if (!def.biome) def.biome = def.type === 'interior' ? 'interior' : def.type;
  const m = new TileMap(def.w, def.h);
  m.id = id; m.def = def;
  m.rng = mulberry32(def.seed || strHash(id));
  resetNpcs(NPCS);                         // la generazione vede sempre le posizioni originali dei PNG: le mappe non dipendono dalle patch
  GEN[def.gen](m, def);
  if (def.gen === 'overworld') { stampPalaceInAugusta(m, TOWNS.augusta); stampDive2(m); stampTerritoryGates(m); if (GEN_OPTS.variety) { civVariety(m); shrineSkins(m); } if (GEN_OPTS.vertical) verticalize(m); }
  else if (def.gen === 'territory' && GEN_OPTS.vertical) verticalize(m);
  if (def.type === 'interior' && GEN_OPTS.variety) interiorVariety(m, def);   // sviluppo verticale (solo grafica: stessa collisione)
  if (patched) { applyPatch(m, PATCHES[patchIdOf(m)]); applyNpcPatches(NPCS, PATCHES); } // modifiche del Map Editor (map-editor/data -> src/data/mapPatches.js)
  if (def.gen === 'overworld') m.repair = repairReach(m);   // forzieri sigillati nella roccia: sentiero scavato; raccoglibili irraggiungibili: tolti
  return m;
}

// ---------- helpers ----------
export const box = (m, x, y, w, h, g, o) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    if (g != null) m.setG(i, j, g);
    if (o != null) m.setO(i, j, o);
  }
};
export const ring = (m, x, y, w, h, o) => {
  for (let i = x; i < x + w; i++) { m.setO(i, y, o); m.setO(i, y + h - 1, o); }
  for (let j = y; j < y + h; j++) { m.setO(x, j, o); m.setO(x + w - 1, j, o); }
};
export const blob = (m, cx, cy, r, fn) => {
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) fn(cx + i, cy + j);
};
// Sentiero: ripulisce gli oggetti; sull'acqua diventa ponte.
export function carve(m, pts, wd = 2, tile = T.DIRT) {
  const paint = (x, y) => {
    for (let j = 0; j < wd; j++) for (let i = 0; i < wd; i++) {
      const gx = x + i, gy = y + j;
      if (!m.inb(gx, gy)) continue;
      m.setO(gx, gy, 0); (m.roadSet ||= new Set()).add(gy * m.w + gx);
      m.setG(gx, gy, DEFS[m.g(gx, gy)].liquid || DEFS[m.g(gx, gy)].solid ? T.BRIDGE : tile);
    }
  };
  for (let k = 0; k < pts.length - 1; k++) {
    let [x, y] = pts[k];
    const [x1, y1] = pts[k + 1];
    const sx = Math.sign(x1 - x), sy = Math.sign(y1 - y);
    paint(x, y);
    while (x !== x1 || y !== y1) {
      if (x !== x1) x += sx; else y += sy;
      paint(x, y);
    }
  }
}
export const clearGround = (m, x, y, w, h, fallback = T.DIRT) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    m.setO(i, j, 0);
    const g = DEFS[m.g(i, j)];
    if (g.liquid || g.solid) m.setG(i, j, fallback);
  }
};
export const idx = (m, x, y) => y * m.w + x;
export const setZone = (m, x, y, z) => { if (m.inb(x, y)) m.zone[idx(m, x, y)] = z; };
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const poi = (m, x, y, n, kind) => m.pois.push({ x, y, n, kind });

export function addSpawns(m, n, tableOf, { minFrom = [], minDist = 12 } = {}) {
  let tries = 0;
  while (m.spawns.length < n && tries++ < n * 40) {
    const x = 2 + Math.floor(m.rng() * (m.w - 4)), y = 2 + Math.floor(m.rng() * (m.h - 4));
    if (m.safeAt(x, y)) continue;
    const gdef = DEFS[m.g(x, y)];
    const table = tableOf(x, y);
    if (!table) continue;
    const aquatic = table === 'ocean';
    if (aquatic) { if (!gdef.liquid || gdef.liquid === 'lava') continue; }
    else if (!m.passable(x, y, null) || gdef.liquid) continue;
    if (minFrom.some((a) => dist2(a, { x, y }) < minDist * minDist)) continue;
    let nearSafe = false;
    for (const [dx, dy] of [[8, 0], [-8, 0], [0, 8], [0, -8]]) if (m.safeAt(x + dx, y + dy)) nearSafe = true;
    if (nearSafe) continue;
    m.spawns.push({ x, y, table, aquatic });
  }
}

// Santuario: cura, salva, fissa il punto di rinascita
export function stampShrine(m, id, x, y, name = 'Santuario') {
  box(m, x - 1, y - 1, 3, 3, T.STONE, 0);
  clearGround(m, x - 1, y + 2, 3, 1, T.DIRT);
  m.props.push({ type: 'shrine', id, x, y });
  m.anchors['shrine_' + id] = { x, y: y + 2 };
  poi(m, x, y, name, 'shrine');
}

const quartersFor = (style) => {
  if (style === 'jp') return [{ style: { wall: T.BUILD, roof: T.ROOF }, kind: 'mercato' }, { style: { wall: T.BUILD, roof: T.ROOFCN }, kind: 'popolare' }, { style: { wall: T.BUILD, roof: T.ROOF }, kind: 'artigiani' }, { style: { wall: T.BUILD, roof: T.ROOFEU }, kind: 'giardini' }];
  if (style === 'eu') return [{ style: { wall: T.MARBLE, roof: T.TILEROOF }, kind: 'giardini' }, { style: { wall: T.BUILDEU, roof: T.ROOFEU }, kind: 'mercato' }, { style: { wall: T.ADOBE, roof: T.TILEROOF }, kind: 'popolare' }, { style: { wall: T.BUILDEU, roof: T.TILEROOF }, kind: 'artigiani' }];
  const alt = style.roof === T.TILEROOF ? T.ROOFEU : T.TILEROOF;
  return [{ style, kind: 'mercato' }, { style: { wall: style.wall, roof: alt }, kind: 'popolare' }, { style, kind: 'artigiani' }, { style: { wall: style.wall, roof: alt }, kind: 'giardini' }];
};
export { quartersFor };

// ---------- Overworld ----------
const hsh = (x, y, k = 0) => { let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) % 100; };
// Edifici con facciata credibile: finestre (illuminate/buie/con imposte), balconi, colonne all'ingresso, porta e insegna.
// opts.shut: porta chiusa (casa non visitabile); opts.sign: insegna commerciale accanto all'ingresso.
export function buildingAt(m, bx, by, bw, bh, id, style, road, opts = {}) {
  const wall = typeof style === 'object' ? style.wall : style === 'jp' ? T.BUILD : T.BUILDEU, roof = typeof style === 'object' ? style.roof : style === 'jp' ? T.ROOF : T.ROOFEU;
  for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) { m.setG(bx + i, by + j, road); m.setO(bx + i, by + j, j < 2 ? roof : wall); }
  const dc = bw >> 1, dx = bx + dc, dy = by + bh - 1, wins = WINDOW_OF[wall];
  if (wins) {
    for (const j of [bh - 2, bh - 4]) {
      if (j < 2) continue;
      for (let i = 1; i < bw - 1; i += 2) {
        if (j === bh - 2 && i === dc) continue;
        const r = hsh(bx + i, by + j, 7);
        if (j === bh - 4 && bh >= 8 && bw >= 6 && i === dc && hsh(bx, by, 3) < 60) { m.setO(bx + i, by + j, T.BALCONY); continue; }
        m.setO(bx + i, by + j, r < 55 ? wins[0] : r < 85 ? wins[1] : wins[2]);
      }
    }
  }
  if (bw >= 7 && (wall === T.MARBLE || wall === T.WALLCN || wall === T.TOWER || wall === T.CATHEDRAL || /hall|castle|cath/.test(id))) { m.setO(bx + 1, dy, T.COLUMN); m.setO(bx + bw - 2, dy, T.COLUMN); }
  m.setO(dx, dy, opts.shut ? T.DOORSHUT : T.DOOR);
  box(m, bx, by + bh, bw, 2, road, 0);
  if (opts.sign || /inn|shop|smith|store|market|tavern|pharm/.test(id)) { if (!m.obj[idx(m, bx + bw - 1, by + bh)]) m.setO(bx + bw - 1, by + bh, T.SIGN); }
  if (opts.shut) return;
  m.anchors['door_' + id] = { x: dx, y: dy + 1 };
  m.portals.push({ x: dx, y: dy, to: id, anchor: 'entry' });
  poi(m, dx, dy, MAPS[id].n, 'building');
}

// Casa di quartiere: stessa facciata, porta chiusa, nessun interno.
export const houseAt = (m, bx, by, bw, bh, style, road) => buildingAt(m, bx, by, bw, bh, 'house_' + bx + '_' + by, style, road, { shut: true });

// Riempie un insediamento di case, arredi urbani e illuminazione. `quarters` assegna a ciascun quartiere (NO, NE, SO, SE) uno stile
// architettonico e un carattere (mercato, popolare, artigiani, giardini) con arredi propri.
export function densify(m, o) {
  const { ox, oy, W, H, road, quarters, floorOk } = o, rng = mulberry32(strHash(m.id + ':' + o.ox + ':' + o.oy)), cx = ox + (W >> 1), cy = oy + (H >> 1);
  const npcPts = [];
  for (const n of Object.values(NPCS)) {
    const a = n.at; if (!a || a.map !== m.id) continue;
    if (a.town && TOWNS[a.town]) npcPts.push({ x: TOWNS[a.town].x + a.x, y: TOWNS[a.town].y + a.y });
    else if (a.x !== undefined && a.anchor === undefined) npcPts.push({ x: a.x, y: a.y });
    else if (a.anchor && m.anchors[a.anchor]) npcPts.push({ x: m.anchors[a.anchor].x + (a.dx || 0), y: m.anchors[a.anchor].y + (a.dy || 0) });
  }
  const pts = [...npcPts, ...Object.values(m.anchors), ...m.portals, ...(m.props || []), ...(m.spawns || [])].filter((a) => a.x >= ox - 6 && a.x <= ox + W + 6 && a.y >= oy - 6 && a.y <= oy + H + 6);
  const free = (x0, y0, x1, y1) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!m.inb(x, y) || m.obj[idx(m, x, y)] || DEFS[m.g(x, y)].liquid || (floorOk && !floorOk(m.g(x, y)))) return false; }
    return true;
  };
  const quarter = (x, y) => (y < cy ? 0 : 2) + (x < cx ? 0 : 1);
  const placed = [];
  const tries = W * H * 2, maxHouses = Math.max(6, Math.floor((W * H) / 70));
  const why = { corr: 0, pts: 0, free: 0, ok: 0 }; (globalThis.__dens ||= {})[m.id + ox] = why; why.n = pts.length; why.s = pts.slice(0, 6).map((q) => q.x + ',' + q.y).join(' ');
  for (let t = 0; t < tries && placed.length < maxHouses; t++) {
    const bw = 5 + Math.floor(rng() * 4), bh = 5 + Math.floor(rng() * 4);
    // si campiona solo nei quadranti liberi dai viali centrali
    const xl = [ox + 2, cx - 2 - bw], xr = [cx + 2, ox + W - bw - 2], yt = [oy + 2, cy - 4 - bh], yb = [cy + 2, oy + H - bh - 4];
    const pick = (a, b) => { const ra = a[1] - a[0] >= 0, rb = b[1] - b[0] >= 0; if (!ra && !rb) return null; const r = ra && (!rb || rng() < 0.5) ? a : b; return r[0] + Math.floor(rng() * (r[1] - r[0] + 1)); };
    const x = pick(xl, xr), y = pick(yt, yb);
    if (x === null || y === null) { why.corr++; continue; }
    if (npcPts.some((a) => a.x >= x - 3 && a.x <= x + bw + 2 && a.y >= y - 3 && a.y <= y + bh + 4)) { why.pts++; continue; }
    if (pts.some((a) => a.x >= x && a.x <= x + bw - 1 && a.y >= y && a.y <= y + bh + 1)) { why.pts++; continue; }
    if (!free(x - 1, y - 1, x + bw, y + bh + 2)) { why.free++; continue; }
    why.ok++;
    const q = quarters[quarter(x, y)] || quarters[0];
    houseAt(m, x, y, bw, bh, q.style, road); placed.push([x, y, bw, bh, quarter(x, y)]);
  }
  // arredi: ogni quartiere ha un carattere
  const put = (x, y, tile) => { if (Math.abs(x - cx) <= 3 && Math.abs(y - cy) <= 4) return false; if (m.inb(x, y) && !m.obj[idx(m, x, y)] && !DEFS[m.g(x, y)].liquid && !pts.some((a) => a.x === x && a.y === y)) { m.setO(x, y, tile); return true; } return false; };
  const sprinkle = (qi, tile, n) => {
    for (let k = 0, tr = 0; k < n && tr < n * 40; tr++) {
      const x = ox + 2 + Math.floor(rng() * (W - 4)), y = oy + 2 + Math.floor(rng() * (H - 4));
      if (quarter(x, y) !== qi || Math.abs(x - cx) < 2 || Math.abs(y - cy) < 2) continue;
      if (placed.some(([bx, by, bw, bh]) => x >= bx - 1 && x <= bx + bw && y >= by - 1 && y <= by + bh + 1 && !(y > by + bh))) continue;
      if (put(x, y, tile)) k++;
    }
  };
  const area = Math.max(1, (W * H) / 600);
  quarters.forEach((q, qi) => {
    const kind = q.kind || 'popolare';
    if (kind === 'mercato') { sprinkle(qi, T.STALL, Math.round(4 * area)); sprinkle(qi, T.CART, Math.round(2 * area)); sprinkle(qi, T.CRATE, Math.round(3 * area)); sprinkle(qi, T.BARREL, Math.round(3 * area)); }
    else if (kind === 'artigiani') { sprinkle(qi, T.BARREL, Math.round(4 * area)); sprinkle(qi, T.CRATE, Math.round(4 * area)); sprinkle(qi, T.CART, Math.round(2 * area)); sprinkle(qi, T.WELL, 1); }
    else if (kind === 'giardini') { sprinkle(qi, T.FLOWERS, Math.round(8 * area)); sprinkle(qi, T.BENCH, Math.round(3 * area)); sprinkle(qi, T.STATUE, 1); sprinkle(qi, T.WELL, 1); }
    else { sprinkle(qi, T.FLOWERS, Math.round(5 * area)); sprinkle(qi, T.BENCH, Math.round(2 * area)); sprinkle(qi, T.WELL, 1); sprinkle(qi, T.BARREL, Math.round(2 * area)); }
  });
  // postazioni di crafting vicino alla piazza centrale: banco da lavoro (esplosivi) e tavolo alchemico (pozioni)
  for (const [tile, a0] of [[T.WORKBENCH, -0.8], [T.ALCHEMY, 2.4]]) {
    let done = false;
    for (let d = 5; d <= 16 && !done; d++) for (let k = 0; k < 14 && !done; k++) {
      const x = Math.round(cx + Math.cos(a0 + k * 0.45) * d), y = Math.round(cy + Math.sin(a0 + k * 0.45) * d * 0.8);
      if (m.inb(x, y) && !m.obj[idx(m, x, y)] && !DEFS[m.g(x, y)].liquid && !DEFS[m.g(x, y)].solid && !pts.some((a) => a.x === x && a.y === y) && !(floorOk && !floorOk(m.g(x, y))) && !placed.some(([bx, by, bw, bh]) => x >= bx - 1 && x <= bx + bw && y >= by - 1 && y <= by + bh + 2) && x > ox + 1 && x < ox + W - 2 && y > oy + 1 && y < oy + H - 2 && Math.abs(x - cx) > 2 && Math.abs(y - cy) > 2) { m.setO(x, y, tile); (m.stations ||= []).push({ x, y, tile }); done = true; }
    }
  }
  // lampioni lungo i viali (ai bordi della strada, non sulla strada) e torce ai cancelli
  for (let x = ox + 3; x < ox + W - 2; x += 6) { put(x, cy - 3, T.LAMPPOST); put(x + 3, cy + 2, T.LAMPPOST); }
  for (let y = oy + 3; y < oy + H - 2; y += 6) { put(cx - 3, y, T.LAMPPOST); put(cx + 2, y + 3, T.LAMPPOST); }
  for (const g of m.gates) {
    if (g.x < ox - 2 || g.x > ox + W + 2 || g.y < oy - 2 || g.y > oy + H + 2) continue;
    for (const [nx, ny] of [[g.x - 1, g.y], [g.x + 1, g.y], [g.x, g.y - 1], [g.x, g.y + 1]]) { const t = m.o(nx, ny); if (t === T.WALL || t === T.FENCE || t === T.TOWER || t === T.WALLCN || t === T.MARBLE || t === T.ELVENWALL || t === T.DWARFWALL) m.setO(nx, ny, T.TORCH); }
  }
  return placed.length;
}

// ---------- Overworld ----------
export function stampTown(m, key) {
  const t = TOWNS[key], ox = t.x, oy = t.y, W = t.w, H = t.h, jp = t.style === 'jp', E = t.ext || 0;
  const floor = jp ? T.GRASS : T.COBBLE, road = jp ? T.DIRT : T.COBBLE, wallT = jp ? T.FENCE : T.WALL;
  const sid = m.safeNames.push(t.n) - 1;
  box(m, ox - 1 - E, oy - 1 - E, W + 2 + 2 * E, H + 2 + 2 * E, floor, 0);
  for (let j = oy - 1 - E; j < oy + H + 1 + E; j++) for (let i = ox - 1 - E; i < ox + W + 1 + E; i++) { m.safe[idx(m, i, j)] = sid; setZone(m, i, j, 0); }
  ring(m, ox - 1 - E, oy - 1 - E, W + 2 + 2 * E, H + 2 + 2 * E, wallT);
  const vx = ox + W / 2 - 1, hy = oy + H / 2 - 1;
  box(m, vx, oy - E, 2, H + 2 * E, road, 0);
  box(m, ox - E, hy, W + 2 * E, 2, road, 0);
  for (const s of t.gates) {
    for (let k = 0; k < 2; k++) {
      const [gx, gy] = s === 's' ? [vx + k, oy + H + E] : s === 'n' ? [vx + k, oy - 1 - E] : s === 'w' ? [ox - 1 - E, hy + k] : [ox + W + E, hy + k];
      m.setO(gx, gy, T.GATE_OPEN); m.setG(gx, gy, road); // aperto alla generazione; WorldScene.updateGates() decide per l'ora
      m.gates.push({ x: gx, y: gy, town: key });
    }
  }
  for (const b of t.buildings) buildingAt(m, ox + b.x, oy + b.y, b.w, b.h, b.id, t.style, road);
  if (t.towers) for (const [tx, ty] of [[ox - 2 - E, oy - 2 - E], [ox + W - 1 + E, oy - 2 - E], [ox - 2 - E, oy + H - 1 + E], [ox + W - 1 + E, oy + H - 1 + E]]) { box(m, tx, ty, 3, 3, null, T.TOWER); poi(m, tx + 1, ty + 1, 'Torre', 'building'); }
  for (const [x, y] of t.stalls || []) m.setO(ox + x, oy + y, T.STALL);
  for (const [x, y] of t.lanterns || []) m.setO(ox + x, oy + y, T.LANTERN);
  for (const [x, y] of t.fountain || []) m.setO(ox + x, oy + y, T.FOUNTAIN);
  for (const [k, [x, y]] of Object.entries(t.anchors || {})) m.anchors[k] = { x: ox + x, y: oy + y };
  m.anchors['town_' + key] = { x: vx - 1, y: hy + 3 }; // un punto libero vicino al centro (la fontana può occupare il centro esatto)
  densify(m, { ox: ox - E, oy: oy - E, W: W + 2 * E, H: H + 2 * E, road, quarters: quartersFor(t.style), rng: m.rng, floorOk: jp ? (g) => g !== road : null });
  poi(m, vx, hy, t.n, 'town');
}

export function stampOutpost(m, o) {
  const { x: ox, y: oy, w: W, h: H } = o, jp = o.style === 'jp', road = jp ? T.DIRT : T.COBBLE;
  const sid = m.safeNames.push(o.n) - 1;
  clearGround(m, ox, oy, W, H, T.GRASS);
  for (let j = oy; j < oy + H; j++) for (let i = ox; i < ox + W; i++) m.safe[idx(m, i, j)] = sid;
  if (o.pond) { const [px, py, r] = o.pond; blob(m, ox + px, oy + py, r, (x, y) => { m.setG(x, y, T.WATER); m.setO(x, y, 0); }); }
  for (const b of o.buildings) buildingAt(m, ox + b.x, oy + b.y, b.w, b.h, b.id, o.style, road);
  for (const [x, y] of o.lanterns || []) m.setO(ox + x, oy + y, T.LANTERN);
  if (o.shrine) stampShrine(m, o.id, ox + o.shrine[0], oy + o.shrine[1], 'Santuario di ' + o.n);
  if (o.link) { const a = m.anchors['door_' + o.buildings[0].id]; carve(m, [[a.x, a.y + 1], [o.link[0], a.y + 1], [o.link[0], o.link[1]]], 2); }
  poi(m, ox + (W >> 1), oy + (H >> 1), o.n, 'outpost');
}

export function stampEntrance(m, e) {
  const { x, y } = e;
  clearGround(m, x - 4, y - 4, 9, 6);
  box(m, x - 3, y - 3, 7, 3, e.floor || T.DIRT, e.wall || T.ROCK);
  m.setO(x, y - 1, T.ARCH);
  m.anchors['door_' + e.id] = { x, y };
  m.portals.push({ x, y: y - 1, to: e.id, anchor: 'entry', req: e.req, deny: e.deny });
  poi(m, x, y - 1, e.name || MAPS[e.id].n, 'dungeon');
}

// ---------- Dungeon e alture (automi cellulari) con livelli collegati da scale ----------
function genCave(m, def) {
  const th = THEMES[def.theme], { w, h } = m, rng = m.rng, seed = def.seed;
  let a = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) a[y * w + x] = x < 2 || y < 2 || x >= w - 2 || y >= h - 2 ? 1 : rng() < th.fill ? 1 : 0;
  for (let it = 0; it < 4; it++) {
    const b = a.slice();
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      let n = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if ((i || j) && a[(y + j) * w + x + i]) n++;
      b[y * w + x] = n > 4 ? 1 : n < 4 ? 0 : a[y * w + x];
    }
    a = b;
  }
  // componente connessa più grande
  const lab = new Int32Array(w * h).fill(-1), sizes = [];
  for (let s = 0; s < w * h; s++) {
    if (a[s] || lab[s] >= 0) continue;
    const id = sizes.length; let cnt = 0; const q = [s]; lab[s] = id;
    for (let k = 0; k < q.length; k++) {
      const c = q[k]; cnt++;
      const x = c % w;
      for (const n of [c + 1, c - 1, c + w, c - w]) if (n >= 0 && n < w * h && !a[n] && lab[n] < 0 && Math.abs((n % w) - x) <= 1) { lab[n] = id; q.push(n); }
    }
    sizes.push(cnt);
  }
  const big = sizes.indexOf(Math.max(...sizes));
  for (let i = 0; i < w * h; i++) {
    m.ground[i] = th.floor;
    m.obj[i] = lab[i] === big ? 0 : th.wall;
  }
  // punto di arrivo = cella libera più in basso
  let E = null;
  for (let y = h - 3; y > 2 && !E; y--) for (let x = 2; x < w - 2 && !E; x++) if (lab[y * w + x] === big && Math.abs(x - w / 2) < w / 3) E = { x, y };
  E ||= { x: w >> 1, y: h - 4 };
  box(m, E.x - 2, E.y - 2, 5, 3, th.floor, 0);
  const anchor = { x: E.x, y: E.y - 1 };
  m.anchors.entry = anchor;
  if (def.prev) { // si arriva da un altro livello tramite scala
    const pdir = MAPS[def.prev].next?.dir || 'down';
    m.setO(E.x, E.y, pdir === 'down' ? T.STAIRS_UP : T.STAIRS_DOWN);
    m.portals.push({ x: E.x, y: E.y, to: def.prev, anchor: 'nx_' + m.id });
    poi(m, E.x, E.y, pdir === 'down' ? 'Scala verso l\'alto' : 'Scala verso il basso', 'stairs');
  } else {
    const ex = def.exit;
    m.setO(E.x, E.y, T.ARCH);
    m.portals.push({ x: E.x, y: E.y, to: ex.to, anchor: ex.anchor || 'door_' + m.id });
    poi(m, E.x, E.y, 'Uscita', 'exit');
  }

  // BFS dalle coordinate di arrivo
  const dist = new Int32Array(w * h).fill(-1);
  const q = [anchor.y * w + anchor.x]; dist[q[0]] = 0;
  for (let k = 0; k < q.length; k++) {
    const c = q[k];
    for (const n of [c + 1, c - 1, c + w, c - w]) if (n >= 0 && n < w * h && dist[n] < 0 && !m.obj[n] && Math.abs((n % w) - (c % w)) <= 1) { dist[n] = dist[c] + 1; q.push(n); }
  }
  // elementi "lontani": boss, scala successiva, ingressi verso altre mappe. Posizionati lontani tra loro.
  const feats = [];
  if (def.boss) feats.push({ k: 'boss' });
  if (def.next) feats.push({ k: 'next' });
  for (const g of def.gates || []) feats.push({ k: 'gate', g });
  const cand = q.filter((c) => { const x = c % w, y = (c / w) | 0; return dist[c] > 12 && x > 9 && y > 9 && x < w - 10 && y < h - 10; }).sort((p, r) => dist[r] - dist[p]);
  const picks = [];
  let spacing = Math.min(34, w / 3);
  for (const f of feats) {
    let cell = null;
    for (; spacing >= 6 && !cell; spacing -= 6) cell = cand.find((c) => picks.every((p) => dist2(p, { x: c % w, y: (c / w) | 0 }) >= spacing * spacing));
    spacing = Math.min(34, w / 3);
    cell ??= cand[0] ?? q[q.length - 1];
    const fx = cell % w, fy = (cell / w) | 0, P = { x: fx, y: fy };
    picks.push(P);
    if (f.k === 'boss') {
      const bx = Math.min(w - 9, Math.max(8, fx)), by = Math.min(h - 9, Math.max(8, fy));
      blob(m, bx, by, 6, (x, y) => { m.setG(x, y, th.floor); m.setO(x, y, 0); });
      m.anchors.boss = { x: bx, y: by }; m.boss = { id: def.boss, x: bx, y: by };
      poi(m, bx, by, 'Dimora del boss', 'boss');
    } else if (f.k === 'next') {
      blob(m, fx, fy, 3, (x, y) => { m.setG(x, y, th.floor); m.setO(x, y, 0); });
      m.setO(fx, fy, def.next.dir === 'down' ? T.STAIRS_DOWN : T.STAIRS_UP);
      m.portals.push({ x: fx, y: fy, to: def.next.id, anchor: 'entry' });
      m.anchors['nx_' + def.next.id] = { x: fx, y: fy + 1 };
      poi(m, fx, fy, def.next.dir === 'down' ? 'Scala verso il basso' : 'Scala verso l\'alto', 'stairs');
    } else {
      blob(m, fx, fy, 3, (x, y) => { m.setG(x, y, th.floor); m.setO(x, y, 0); });
      m.setO(fx, fy, T.ARCH);
      m.portals.push({ x: fx, y: fy, to: f.g.to, anchor: 'entry', req: f.g.req, deny: f.g.deny });
      m.anchors['door_' + f.g.to] = { x: fx, y: fy + 1 };
      poi(m, fx, fy, MAPS[f.g.to].n, 'dungeon');
    }
  }
  const bossAt = m.anchors.boss;

  // decorazioni
  const avoid = [anchor, ...picks];
  for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
    if (m.obj[idx(m, x, y)] || rng() > th.decoP) continue;
    if (avoid.some((p) => Math.hypot(x - p.x, y - p.y) < 8)) continue;
    m.setO(x, y, th.deco);
  }
  // pozze (lava/acqua/ghiaccio) senza spezzare la raggiungibilità
  if (th.pool) {
    const saved = [];
    for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
      const i = idx(m, x, y);
      if (m.obj[i] || fbm(x * 0.12, y * 0.12, seed) < th.pool.th) continue;
      if (avoid.some((p) => Math.hypot(x - p.x, y - p.y) < 8)) continue;
      saved.push([i, m.ground[i]]); m.ground[i] = th.pool.tile;
    }
    const seen2 = m.floodWalk(anchor.x, anchor.y);
    if (picks.some((p) => !seen2[p.y * w + p.x])) for (const [i, g] of saved) m.ground[i] = g;
  }
  // santuario di riposo all'arrivo, forzieri nei vicoli ciechi
  m.props.push({ type: 'shrine', id: m.id, x: anchor.x + 2, y: anchor.y });
  m.anchors['shrine_' + m.id] = { ...anchor };
  const seen = m.floodWalk(anchor.x, anchor.y);
  const dead = [];
  for (let y = 3; y < h - 3; y++) for (let x = 3; x < w - 3; x++) {
    if (!seen[idx(m, x, y)] || m.obj[idx(m, x, y)] || Math.hypot(x - anchor.x, y - anchor.y) < 12) continue;
    let n = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if ((i || j) && m.obj[idx(m, x + i, y + j)]) n++;
    if (n >= 6) dead.push({ x, y });
  }
  const loots = [[['pozione_vita_s', 2]], [['pozione_ki_s', 1], ['cristallo_grezzo', 2]], [['onigiri', 3]]];
  const extra = (def.props || []).slice();
  const nChest = 3 + Math.floor((w * h) / 4000);
  for (let k = 0; k < Math.min(nChest + extra.length, dead.length); k++) {
    const d = dead.splice(Math.floor(rng() * dead.length), 1)[0];
    const prop = extra.shift() || { type: 'chest', id: `${m.id}_c${k}`, loot: loots[k % loots.length], gold: 30 + 20 * k };
    m.props.push({ ...prop, x: d.x, y: d.y });
  }
  const min = [anchor, ...picks];
  addSpawns(m, def.mobs || Math.round((w * h) / 120), () => th.spawn, { minFrom: min, minDist: 11 });
  for (const s of m.spawns) if (!seen[idx(m, s.x, s.y)]) s.dead = true;
  m.spawns = m.spawns.filter((s) => !s.dead);
  void bossAt;
}

// ---------- Interni: piani, scale, ascensori, cantine ----------
function genInterior(m, def) {
  const { w, h } = m;
  box(m, 0, 0, w, h, def.floor, 0);
  ring(m, 0, 0, w, h, T.BUILD);
  if (def.shelves) for (let x = 1; x < w - 1; x++) m.setO(x, 1, T.SHELF);
  if (def.rug) box(m, def.rug[0], def.rug[1], def.rug[2], def.rug[3], T.RUG, 0);
  if (def.counter) for (let x = def.counter[0]; x <= def.counter[1]; x++) m.setO(x, def.counter[2], T.COUNTER);
  const put = (list, t) => { for (const [x, y] of list || []) m.setO(x, y, t); };
  put(def.tables, T.TABLE); put(def.beds, T.BED); put(def.lanterns, T.LANTERN);
  put(def.barrels, T.BARREL); put(def.crates, T.CRATE); put(def.pillars, T.PILLAR);
  if (def.machine) box(m, def.machine[0], def.machine[1], 2, 2, null, T.MACHINE);
  if (def.exit) {
    const cx = w >> 1, ex = def.exit;
    m.setO(cx, h - 1, T.DOOR);
    m.anchors.entry = { x: cx, y: h - 2 };
    m.portals.push({ x: cx, y: h - 1, to: ex.to, anchor: ex.anchor || 'door_' + m.id });
  }
  for (const s of def.stairs || []) { // scale: la stessa id compare nei due piani collegati
    m.setO(s.x, s.y, s.dir === 'up' ? T.STAIRS_UP : T.STAIRS_DOWN);
    m.anchors['st_' + s.id] = { x: s.x, y: s.y + 1 };
    m.portals.push({ x: s.x, y: s.y, to: s.to, anchor: 'st_' + s.id });
  }
  m.props = [];
  if (def.elevator) {
    const [ex, ey] = def.elevator;
    m.anchors.elev = { x: ex, y: ey + 1 };
    m.props.push({ type: 'elevator', x: ex, y: ey, floors: def.floors });
  }
  if (!m.anchors.entry) m.anchors.entry = m.anchors.elev || (def.stairs?.[0] && m.anchors['st_' + def.stairs[0].id]) || { x: w >> 1, y: h >> 1 };
  m.safeNames.push(def.n);
  m.safe.fill(1);
  for (const p of def.props || []) m.props.push({ ...p });
}

// ---------- Dimensione spazio-temporale ----------
function genParallel(m, def) {
  const { w, h } = m, N = def.nodes;
  box(m, 0, 0, w, h, T.VOID, 0);
  for (const [x, y, r] of Object.values(N)) blob(m, x, y, r, (i, j) => m.setG(i, j, T.TIMEFLOOR));
  for (const [a, b] of def.edges) {
    const [x0, y0] = N[a], [x1, y1] = N[b];
    for (let t = 0; t <= 1; t += 0.01) {
      const x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t);
      box(m, x - 1, y - 1, 3, 3, T.TIMEFLOOR, 0);
    }
  }
  for (const [x, y, r] of Object.values(N)) {
    for (let k = 0; k < r * 2; k++) {
      const ang = m.rng() * Math.PI * 2, px = Math.round(x + Math.cos(ang) * (r - 1)), py = Math.round(y + Math.sin(ang) * (r - 1));
      if (m.g(px, py) === T.TIMEFLOOR && m.rng() < 0.4 && Math.hypot(px - x, py - y) > 2.5) m.setO(px, py, T.CRYSTAL);
    }
  }
  for (const p of def.pads || []) {
    const [x, y] = N[p.node];
    m.setO(x, y, T.PORTAL); m.setG(x, y, T.TIMEFLOOR);
    m.portals.push({ x, y, to: p.to, anchor: p.anchor, req: p.req, deny: p.deny });
    m.anchors['from_' + p.node] = { x, y: y + 2 };
    poi(m, x, y, MAPS[p.to].n, 'portal');
  }
  if (N.hub) m.anchors.entry = { x: N.hub[0], y: N.hub[1] + 2 };
  else m.anchors.entry = { x: N.gate[0], y: N.gate[1] - 2 };
  if (def.boss) { const [x, y] = N.arena; m.boss = { id: def.boss, x, y }; m.anchors.boss = { x, y }; poi(m, x, y, 'Dimora del boss', 'boss'); }
  const centre = Object.values(N)[0];
  if (!def.boss) addSpawns(m, 40, () => 'parallel', { minFrom: [m.anchors.entry], minDist: 8 });
  else addSpawns(m, 10, () => 'parallel', { minFrom: [m.anchors.entry, { x: centre[0], y: centre[1] }], minDist: 8 });
}

// ---------- Metropoli cyberpunk (strade, grattacielo con ascensore, fogne) ----------
function genCyber(m, def) {
  const { w, h } = m, rng = m.rng, CS = 16;
  const BX = Math.floor(w / CS), BY = Math.floor(h / CS);
  box(m, 0, 0, w, h, T.STONE, 0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x % CS < 3 || y % CS < 3) m.setG(x, y, T.NEON);
  const plaza = [Math.floor(BX / 2), Math.floor(BY / 2)];
  for (let bx = 0; bx < BX; bx++) for (let by = 0; by < BY; by++) {
    if (bx === plaza[0] && by === plaza[1]) continue; // piazza centrale = arena del boss
    const x0 = bx * CS + 3, y0 = by * CS + 3;
    const bw = 8 + Math.floor(rng() * 4), bh = 8 + Math.floor(rng() * 4);
    const ox = x0 + 1 + Math.floor(rng() * (11 - bw)), oy = y0 + 1 + Math.floor(rng() * (11 - bh));
    box(m, ox, oy, bw, bh, null, T.NEONWALL);
    const door = (id) => {
      const dx = ox + (bw >> 1), dy = oy + bh - 1;
      m.setO(dx, dy, T.ARCH);
      box(m, dx - 1, dy + 1, 3, 1, T.STONE, 0);
      m.anchors['door_' + id] = { x: dx, y: dy + 1 };
      m.portals.push({ x: dx, y: dy, to: id, anchor: 'entry' });
      poi(m, dx, dy, MAPS[id].n, 'building');
    };
    if (bx === 1 && by === 1) door('int_neo_vendor');
    else if (bx === BX - 3 && by === BY - 2) door('int_neo_tower');
    else if (rng() < 0.5) m.setO(x0 + 6, y0 + 12, T.HOLO);
  }
  ring(m, 0, 0, w, h, T.NEONWALL);
  m.setO(8, 65, T.PORTAL);
  const ex = def.exit;
  m.portals.push({ x: 8, y: 65, to: ex.to, anchor: ex.anchor });
  m.anchors.entry = { x: 8, y: 66 };
  poi(m, 8, 65, 'Portale temporale', 'portal');
  // tombino verso le fogne (secondo livello, in basso)
  m.setO(30, 49, T.STAIRS_DOWN);
  m.portals.push({ x: 30, y: 49, to: 'neo_under', anchor: 'entry' });
  m.anchors.nx_neo_under = { x: 30, y: 50 };
  poi(m, 30, 49, 'Tombino · Fogne', 'stairs');
  const bxp = plaza[0] * CS + 3 + 6, byp = plaza[1] * CS + 3 + 6;
  m.anchors.boss = { x: bxp, y: byp };
  m.boss = { id: def.boss, x: bxp, y: byp };
  poi(m, bxp, byp, 'Piazza Centrale', 'boss');
  addSpawns(m, 150, () => 'cyber', { minFrom: [m.anchors.entry, m.anchors.boss], minDist: 12 });
}

// ---------- Oceano profondo (richiede tuta da sub) con scala verso il palazzo ----------
function genUnderwater(m, def) {
  const { w, h } = m;
  box(m, 0, 0, w, h, T.SEABED, 0);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) if (fbm(x * 0.1, y * 0.1, def.seed) > 0.64) m.setO(x, y, T.CORAL);
  ring(m, 0, 0, w, h, T.CORAL);
  const P = { x: 34, y: 16, w: 32, h: 22 };
  box(m, P.x - 1, P.y - 1, P.w + 2, P.h + 2, T.SEABED, 0);
  box(m, P.x, P.y, P.w, P.h, T.STONE, 0);
  ring(m, P.x, P.y, P.w, P.h, T.BUILD);
  for (let x = 48; x <= 51; x++) m.setO(x, P.y + P.h - 1, 0);
  for (const [px, py] of [[38, 20], [61, 20], [38, 32], [61, 32]]) m.setO(px, py, T.PILLAR);
  carve(m, [[8, h - 10], [8, h - 9], [50, h - 9], [50, P.y + P.h]], 3, T.SEABED);
  blob(m, 8, h - 7, 5, (x, y) => { m.setO(x, y, 0); });
  m.setO(8, h - 4, T.PORTAL);
  const ex = def.exit;
  m.portals.push({ x: 8, y: h - 4, to: ex.to, anchor: ex.anchor });
  m.anchors.entry = { x: 8, y: h - 6 };
  poi(m, 8, h - 4, 'Risalita', 'exit');
  const sx = 50, sy = 26;
  m.setO(sx, sy, T.STAIRS_DOWN);
  m.portals.push({ x: sx, y: sy, to: def.next.id, anchor: 'entry' });
  m.anchors['nx_' + def.next.id] = { x: sx, y: sy + 1 };
  poi(m, sx, sy, 'Scala verso la Sala del Trono', 'stairs');
  m.props.push({ type: 'shrine', id: m.id, x: 11, y: h - 6 });
  m.anchors['shrine_' + m.id] = { x: 8, y: h - 6 };
  addSpawns(m, 90, () => 'underwater', { minFrom: [m.anchors.entry, { x: sx, y: sy }], minDist: 10 });
}


// REGNO SOMMERSO: la città di Nereidia (case di conchiglia, palazzo della Regina, piazza di perle), giardini di corallo, rovine sommerse, canyon abissale,
// vortici e correnti che spingono il giocatore. Si raggiunge dal portale di risalita in basso; la scala a est porta agli Abissi.
function genThalassa(m, def) {
  const { w, h } = m, rng = m.rng;
  box(m, 0, 0, w, h, T.SEABED, 0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const f = fbm(x * 0.07, y * 0.07, def.seed + 3, 2); if (f > 0.62) m.setG(x, y, T.ABYSSFLOOR); else if (f < 0.3 && x > 20) m.setG(x, y, T.SAND); }
  const City = { x: 42, y: 32, w: 58, h: 40 }, free = (x, y) => m.inb(x, y) && !m.obj[idx(m, x, y)];
  const inCity = (x, y, pad = 0) => x >= City.x - pad && x < City.x + City.w + pad && y >= City.y - pad && y < City.y + City.h + pad;
  // giardini di corallo e alghe (nord e ovest), foresta di kelp
  for (let y = 3; y < h - 3; y++) for (let x = 3; x < w - 3; x++) {
    if (inCity(x, y, 3) || (x > 100 && x < 135 && y > 22 && y < 66)) continue;
    const f = fbm(x * 0.12, y * 0.12, def.seed + 9, 2), r = rng();
    if (f > 0.58 && r < 0.38) m.setO(x, y, [T.CORALT1, T.CORALT2, T.CORALFAN, T.CORALT1, T.CORALT2][(x * 3 + y) % 5]);
    else if (f > 0.46 && r < 0.2) m.setO(x, y, r < 0.1 ? T.KELP : T.SEAGRASS);
    else if (r < 0.012) m.setO(x, y, T.KELP);
  }
  ring(m, 0, 0, w, h, T.ABYSSROCK); ring(m, 1, 1, w - 2, h - 2, T.ABYSSROCK);
  // Nereidia: piazza lastricata a perle, zona sicura
  box(m, City.x, City.y, City.w, City.h, T.PAVE_MOSAIC, 0);
  for (let y = City.y; y < City.y + City.h; y++) for (let x = City.x; x < City.x + City.w; x++) if ((x + y) % 6 === 0) m.setG(x, y, T.PAVE_SLAB);
  const sid = m.safeNames.push('Nereidia') - 1; for (let y = City.y - 1; y <= City.y + City.h; y++) for (let x = City.x - 1; x <= City.x + City.w; x++) if (m.inb(x, y)) m.safe[idx(m, x, y)] = sid;
  const cx = City.x + (City.w >> 1), cy = City.y + (City.h >> 1), st = { wall: T.SHELLWALL, roof: T.SHELLROOF };
  buildingAt(m, cx - 10, City.y + 1, 20, 11, 'thalassa_hall', st, T.PAVE_MOSAIC);                    // palazzo della Regina
  buildingAt(m, City.x + 3, City.y + 6, 13, 8, 'thalassa_inn', st, T.PAVE_MOSAIC);
  buildingAt(m, City.x + City.w - 16, City.y + 6, 13, 8, 'thalassa_shop', st, T.PAVE_MOSAIC);
  for (let i = 0; i < 5; i++) houseAt(m, City.x + 4 + i * 11, City.y + City.h - 10, 8, 7, st, T.PAVE_MOSAIC);
  // piazza: perle su piedistallo, statue alte, colonne antiche e una grande perla centrale
  m.setO(cx, cy + 3, T.PEARL); for (const [dx, dy] of [[-8, 1], [8, 1], [-8, 7], [8, 7]]) m.setO(cx + dx, cy + dy, T.STATUE_T); for (const [dx, dy] of [[-5, 4], [5, 4], [-5, 8], [5, 8]]) m.setO(cx + dx, cy + dy, T.PEARL);
  for (const dx of [-13, 13]) for (const dy of [2, 8]) m.setO(cx + dx, cy + dy, T.TEMPLECOL); for (let x = City.x + 2; x < City.x + City.w - 2; x += 6) m.setO(x, City.y + City.h - 2, T.KELP);
  m.anchors.town_thalassa = { x: cx, y: cy + 5 }; poi(m, cx, cy + 3, 'Nereidia', 'town');
  // approdo (portale di risalita) e sentiero fino alla città
  carve(m, [[cx, h - 9], [cx, City.y + City.h]], 4, T.PAVE_SLAB); blob(m, cx, h - 8, 5, (x, y) => { m.setO(x, y, 0); m.setG(x, y, T.PAVE_SLAB); });
  m.setO(cx, h - 5, T.PORTAL); m.portals.push({ x: cx, y: h - 5, to: def.exit.to, anchor: def.exit.anchor }); m.anchors.entry = { x: cx, y: h - 7 }; poi(m, cx, h - 5, 'Risalita', 'exit');
  stampShrine(m, 'thalassa', cx - 8, h - 9, 'Santuario Perlato');
  // rovine sommerse (ovest): tempio crollato con colonne, statue e due forzieri
  const Rx = 10, Ry = 34; box(m, Rx - 2, Ry - 2, 30, 24, T.SEABED, 0); box(m, Rx, Ry, 26, 20, T.STONE, 0);
  ring(m, Rx, Ry, 26, 20, T.RUINWALL); for (const x of [Rx + 12, Rx + 13]) { m.setO(x, Ry + 19, 0); m.setO(x, Ry, 0); } for (let i = 0; i < 5; i++) m.setO(Rx + 4 + rng() * 18 | 0, Ry, 0);
  for (let x = Rx + 3; x < Rx + 24; x += 4) for (const y of [Ry + 4, Ry + 15]) m.setO(x, y, T.TEMPLECOL); m.setO(Rx + 12, Ry + 9, T.STATUE_T);
  m.props.push({ type: 'chest', id: 'thalassa_ruin1', x: Rx + 5, y: Ry + 10, loot: [['perla_grezza', 3], ['pozione_vita_m', 2]], gold: 220 }, { type: 'chest', id: 'thalassa_ruin2', x: Rx + 20, y: Ry + 10, loot: [['alga_marina', 4], ['freccia_magica', 5]], gold: 180 },
    { type: 'sign', sprite: 'sign', x: Rx + 12, y: Ry + 12, text: 'Incisione corrosa: «Qui riposano i custodi dei Tre Abissi. Chi disturba il Leviatano, disturba il mare.»' });
  carve(m, [[Rx + 12, Ry + 20], [Rx + 12, City.y + 10], [City.x, City.y + 10]], 3, T.SEABED);
  // vortici (anelli di correnti che girano) e una corrente rettilinea
  const vortex = (vx, vy, r) => { blob(m, vx, vy, r + 1, (x, y) => { m.setO(x, y, 0); const dx = x - vx, dy = y - vy, d = Math.hypot(dx, dy); if (d < 2 || d > r) return; const tx = -dy, ty = dx; m.setG(x, y, Math.abs(tx) > Math.abs(ty) ? (tx > 0 ? T.CURRENT_E : T.CURRENT_W) : (ty > 0 ? T.CURRENT_S : T.CURRENT_N)); }); m.setO(vx, vy, T.PEARL); poi(m, vx, vy, 'Vortice', 'poi'); };
  vortex(26, 16, 7); vortex(112, 84, 7); vortex(82, 14, 6);
  for (let x = 30; x < 70; x++) for (const y of [h - 14, h - 13]) { m.setO(x, y, 0); m.setG(x, y, T.CURRENT_E); }
  // canyon abissale (est): pareti scure, corridoio sinuoso verso la scala per gli Abissi
  for (let y = 22; y < 68; y++) for (let x = 102; x < 136; x++) { m.setG(x, y, T.ABYSSFLOOR); m.setO(x, y, fbm(x * 0.2, y * 0.2, def.seed + 1) > 0.5 ? T.ABYSSROCK : (rng() < 0.05 ? T.CRYSTAL : 0)); }
  const path = [[City.x + City.w, cy], [108, cy], [112, cy - 8], [120, cy - 10], [124, 36]]; carve(m, path, 4, T.ABYSSFLOOR);
  const sx = 124, sy = 34; m.setO(sx, sy, T.STAIRS_DOWN); m.portals.push({ x: sx, y: sy, to: def.next.id, anchor: 'entry' }); m.anchors['nx_' + def.next.id] = { x: sx, y: sy + 1 }; poi(m, sx, sy, 'Scala verso gli Abissi', 'stairs');
  carve(m, [[City.x + City.w - 1, cy], [City.x + City.w + 2, cy]], 4, T.PAVE_SLAB);
  addSpawns(m, 70, () => 'underwater', { minFrom: [m.anchors.entry, m.anchors.town_thalassa, { x: sx, y: sy }], minDist: 12 });
}


// Seconda immersione: una baia a pochi passi da Portomarea porta al regno sommerso di Thalassa (serve la tuta da sub, come per Ryūgū).
function stampDive2(m) {
  const A = m.anchors.town_portomarea; if (!A) return;
  const seen = m.floodWalk(A.x, A.y, null); let best = null, bd = 1e9;
  for (let y = A.y - 46; y < A.y + 46; y++) for (let x = A.x - 46; x < A.x + 46; x++) {
    if (!m.inb(x, y)) continue; const i = idx(m, x, y), d = Math.hypot(x - A.x, y - A.y);
    if (d < 9 || m.ground[i] !== T.WATER || m.obj[i] || !seen[i]) continue;
    if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => m.g(x + dx, y + dy) === T.DEEP)) continue;   // sul bordo del mare profondo
    if (d < bd) { bd = d; best = [x, y]; }
  }
  if (!best) return;
  const [x, y] = best; m.setO(x, y, T.PORTAL);
  m.portals.push({ x, y, to: 'thalassa', anchor: 'entry', req: [['equip', 'suit']], deny: 'Per immergersi nel regno sommerso servirebbe una tuta da sub.' });
  const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dy]) => m.passable(x + dx, y + dy, null)) || [0, 1];
  m.anchors.door_thalassa = { x: x + n[0], y: y + n[1] }; poi(m, x, y, 'Baia di Thalassa', 'stairs');
}

// Mappa della cinematica finale: la capitale in festa, con la Domus Imperiale, la scalinata e la piazza. Non fa parte del mondo giocabile.
function genFinale(m, def) {
  const w = m.w, h = m.h; box(m, 0, 0, w, h, T.PAVE_SLAB, 0);
  const info = buildPalace(m, (w - 33) >> 1, 1);
  // strade e case ai lati della piazza (solo decorazione: porte chiuse)
  for (const [bx, by, bw, bh, st] of [[2, 34, 9, 8, 'jp'], [2, 44, 9, 8, 'eu'], [w - 11, 34, 9, 8, 'eu'], [w - 11, 44, 9, 8, 'jp']]) { try { houseAt(m, bx, by, bw, bh, 'jp', T.PAVE_SLAB); } catch { /* stile non disponibile */ } void st; }
  for (let y = 31; y < h - 1; y += 4) for (const x of [14, w - 15]) m.setO(x, y, T.LAMPPOST);
  for (let x = 13; x < w - 12; x += 5) { m.setO(x, 33, T.IMPBANNER); }
  m.anchors.entry = { x: info.cx, y: h - 4 }; m.anchors.start = m.anchors.entry; m.anchors.palace_stairs = info.stairs; m.anchors.palace_balcony = info.balcony; m.anchors.palace_plaza = info.plaza;
  m.finale = info;
}
const GEN = { territory: genTerritory, thalassa: genThalassa, finale: genFinale, limbo: (...a) => genLimbo(...a), overworld: genOverworld, citymap: genCityMap, spirit: genSpirit, cave: genCave, interior: genInterior, parallel: genParallel, cyber: genCyber, underwater: genUnderwater };
