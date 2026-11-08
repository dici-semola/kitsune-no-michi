// Generatore del mondo aperto 640x576 (20x la mappa originale) e delle città-caverna.
// Logica topografica: regni = diagramma di Voronoi deformato dal rumore (nessun centro, nessun anello);
// i CONFINI tra regni sollevano catene montuose con valichi naturali; i fiumi scendono dai monti al mare seguendo il potenziale del terreno;
// le strade usano A* e attraversano i fiumi con ponti; i luoghi di interesse sorgono nei biomi adatti.
import { T, DEFS } from '../data/tiles.js';
import { MAPS, TOWNS, OUTPOSTS, SHRINES, PATHS, ENTRANCES, BUILDINGS_OW, DIVE, OW_STABLE, OW_PROPS, CHEST_LOOT, BIOME_IDS } from '../data/world.js';
import { REALMS, REALM_ELEV, HEART, POIS, ROADS, NEW_SITES, CIVS, CITYMAP_SITES, SECRET_CHESTS, B } from '../data/realm.js';
import { SPAWN_TABLES } from '../data/enemies.js';
import { fbm, hash2 } from '../core/Util.js';
import * as G from './Generators.js';
import { placeBarriers } from './Barriers.js';
import { FORAGE_EXTRA, CHEST_EXTRA } from '../data/crafting.js';

// Generators.js importa questo modulo (dipendenza ciclica): quindi le funzioni condivise si leggono solo al momento della chiamata
const box = (...a) => G.box(...a), ring = (...a) => G.ring(...a), blob = (...a) => G.blob(...a), carve = (...a) => G.carve(...a), clearGround = (...a) => G.clearGround(...a);
const idx = (...a) => G.idx(...a), setZone = (...a) => G.setZone(...a), poi = (...a) => G.poi(...a), addSpawns = (...a) => G.addSpawns(...a);
const buildingAt = (...a) => G.buildingAt(...a), stampTown = (...a) => G.stampTown(...a), stampOutpost = (...a) => G.stampOutpost(...a);
const stampEntrance = (...a) => G.stampEntrance(...a), stampShrine = (...a) => G.stampShrine(...a);
const MOUNT_THR = { mountain: 0.5, snow: 0.56, tundra: 0.58, volcano: 0.54, canyon: 0.6, badlands: 0.64, plateau: 0.72 };
const OBST = { mountain: T.ROCK, snow: T.ICEWALL, tundra: T.ICEWALL, volcano: T.OBSIDIAN, canyon: T.CANYONWALL, badlands: T.CANYONWALL };
const SOLID_TREES = new Set([T.TREE, T.PINE, T.CACTUS, T.GIANTTREE, T.DEADTREE, T.BAMBOO, T.PALM, T.MUSHROOM]);

// ---------------------------------------------------------------------------------------------
// Terreno per bioma: ritorna [terreno, oggetto]
function paintCell(name, x, y, E, r, seed) {
  const n = fbm(x * 0.09, y * 0.09, seed + 3, 2);
  switch (name) {
    case 'meadow': return [T.GRASS, r < 0.03 ? T.TREE : r < 0.038 ? T.ROCK : 0];
    case 'forest': return [T.GRASS, (n > 0.45 && r < 0.6) || r < 0.05 ? T.TREE : r < 0.07 ? T.ROCK : 0];
    case 'swamp': { const g = n > 0.6 ? T.WATER : T.SWAMP; return [g, g === T.SWAMP ? (r < 0.08 ? T.DEADTREE : r < 0.1 ? T.TREE : 0) : 0]; }
    case 'desert': return [T.SAND, r < 0.02 ? T.CACTUS : r < 0.03 ? T.ROCK : 0];
    case 'snow': return [n > 0.68 ? T.ICE : T.SNOW, r < 0.08 ? T.PINE : r < 0.11 ? T.ROCK : 0];
    case 'canyon': return [T.CANYON, fbm(x * 0.07, y * 0.07, seed + 77, 2) > 0.58 ? T.CANYONWALL : r < 0.02 ? T.ROCK : 0];
    case 'ancient': return [T.GRASS, r < 0.05 ? T.GIANTTREE : n > 0.4 && r < 0.5 ? T.TREE : r < 0.54 ? T.ROCK : 0];
    case 'enchanted': return [T.MAGICGRASS, r < 0.16 ? T.TREE : r < 0.2 ? T.MUSHROOM : 0];
    case 'haunted': return [T.DEADGRASS, r < 0.12 ? T.DEADTREE : r < 0.125 ? T.GRAVE : r < 0.14 ? T.RUBBLE : 0];
    case 'volcano': { const lava = fbm(x * 0.05, y * 0.05, seed + 31, 2) > 0.7; return [lava ? T.LAVA : n > 0.5 ? T.OBSIDIANFLOOR : T.ASH, lava ? 0 : r < 0.05 ? T.OBSIDIAN : r < 0.056 ? T.VOLCANOCONE : 0]; }
    case 'jade': { const pond = fbm(x * 0.06, y * 0.06, seed + 41, 2) > 0.7; return [pond ? T.WATER : T.GRASS, pond ? 0 : n > 0.5 && r < 0.45 ? T.BAMBOO : r < 0.03 ? T.TREE : 0]; }
    case 'plateau': return [T.GRASS, r < 0.012 ? T.COLUMN : r < 0.03 ? T.ROCK : r < 0.05 ? T.TREE : 0];
    case 'tundra': return [n > 0.62 ? T.ICE : T.SNOW, r < 0.03 ? T.PINE : r < 0.05 ? T.ROCK : 0];
    case 'dunes': return [T.SAND, r < 0.005 ? T.CACTUS : r < 0.012 ? T.ROCK : 0];
    case 'badlands': return [T.CANYON, fbm(x * 0.06, y * 0.06, seed + 51, 2) > 0.6 ? T.CANYONWALL : r < 0.03 ? T.ROCK : 0];
    case 'tropical': { const lag = fbm(x * 0.07, y * 0.07, seed + 61, 2) > 0.72; return [lag ? T.WATER : T.JUNGLE, lag ? 0 : r < 0.1 ? T.PALM : r < 0.18 ? T.TREE : 0]; }
    case 'mountain': return [E > 0.62 ? T.SNOW : T.GRASS, r < 0.07 ? T.PINE : r < 0.1 ? T.ROCK : 0];
    default: return [T.GRASS, 0];
  }
}

// ---------------------------------------------------------------------------------------------
// Coordinate dei punti di ingresso (usate dalle strade)
function gatePt(key) {
  const [id, side] = key.split(':');
  if (id === 'poi') { const p = POIS.find((q) => q.id === side); return [p.x, p.y + 4]; }
  const t = TOWNS[id];
  if (t.kind) return { s: [t.x + (t.w >> 1), t.y + t.h + 1], n: [t.x + (t.w >> 1), t.y - 2], w: [t.x - 2, t.y + (t.h >> 1)], e: [t.x + t.w + 1, t.y + (t.h >> 1)] }[side];
  const vx = t.x + t.w / 2 - 1, hy = t.y + t.h / 2 - 1;
  return { s: [vx, t.y + t.h + 1], n: [vx, t.y - 2], w: [t.x - 2, hy], e: [t.x + t.w + 1, hy] }[side];
}

// A* su griglia grossolana 4x4: preferisce strade già esistenti, evita montagne e città, attraversa i fiumi con ponti
function roadPath(m, A, Bp) {
  const CS = 4, cw = Math.ceil(m.w / CS), ch = Math.ceil(m.h / CS);
  const cost = (cx, cy) => {
    const i = Math.min(m.h - 1, cy * CS + 2) * m.w + Math.min(m.w - 1, cx * CS + 2), gd = DEFS[m.ground[i]], o = m.obj[i];
    let c = gd.liquid === 'deep' ? 14 : gd.liquid === 'shallow' ? 3 : gd.liquid === 'lava' ? 60 : 1;
    if (m.ground[i] === T.DIRT || m.ground[i] === T.BRIDGE || m.ground[i] === T.COBBLE) c = 0.5;
    if (o && DEFS[o].solid) c += SOLID_TREES.has(o) ? 1.4 : 8;
    if (m.safe[i]) c += 25;
    return c;
  };
  const sx = Math.floor(A[0] / CS), sy = Math.floor(A[1] / CS), tx = Math.floor(Bp[0] / CS), ty = Math.floor(Bp[1] / CS);
  const g = new Float32Array(cw * ch).fill(1e9), from = new Int32Array(cw * ch).fill(-1), closed = new Uint8Array(cw * ch);
  const heap = []; // min-heap [f, idx]
  const push = (f, v) => { heap.push([f, v]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let s = i; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === i) break; [heap[s], heap[i]] = [heap[i], heap[s]]; i = s; } } return top; };
  const s0 = sy * cw + sx; g[s0] = 0; push(0, s0);
  let n = 0;
  while (heap.length && n++ < 160000) {
    const [, c] = pop();
    if (closed[c]) continue; closed[c] = 1;
    const cx = c % cw, cy = (c / cw) | 0;
    if (cx === tx && cy === ty) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
      const ni = ny * cw + nx; if (closed[ni]) continue;
      const ng = g[c] + cost(nx, ny);
      if (ng < g[ni]) { g[ni] = ng; from[ni] = c; push(ng + 0.5 * (Math.abs(nx - tx) + Math.abs(ny - ty)), ni); }
    }
  }
  const t0 = ty * cw + tx;
  if (from[t0] < 0 && t0 !== s0) return null;
  const cells = []; for (let c = t0; c >= 0; c = from[c]) { cells.push([(c % cw) * CS + 2, ((c / cw) | 0) * CS + 2]); if (c === s0) break; }
  cells.reverse();
  const pts = [[A[0], A[1]], [cells[0][0], A[1]], [cells[0][0], cells[0][1]]];
  for (const p of cells) { const q = pts[pts.length - 1], q2 = pts[pts.length - 2]; if ((q[0] === q2[0] && q[0] === p[0]) || (q[1] === q2[1] && q[1] === p[1])) pts[pts.length - 1] = p; else pts.push(p); }
  const L = pts[pts.length - 1]; pts.push([L[0], Bp[1]], [Bp[0], Bp[1]]);
  return pts;
}

// ---------------------------------------------------------------------------------------------
// Insediamenti delle civiltà
const ROLE_SIZE = { inn: [8, 6], shop: [8, 6], hall: [11, 7], house: [6, 6] };
function decoBuilding(m, bx, by, bw, bh, st) {
  for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) { m.setO(bx + i, by + j, j < 2 ? st.roof : st.wall); }
}
function stampCiv(m, s, offX = 0, offY = 0) {
  const c = s.civ, W = s.w, H = s.h, ox = s.x + offX, oy = s.y + offY, st = c.style, rng = m.rng;
  const sid = m.safeNames.push(c.name) - 1, cx = ox + (W >> 1), cy = oy + (H >> 1);
  if (s.island) { // isola artificiale con laguna e barriera di acque basse
    blob(m, cx, cy, (Math.max(W, H) >> 1) + 6, (x, y) => { if (DEFS[m.g(x, y)].liquid !== 'shallow') { m.setG(x, y, T.WATER); m.setO(x, y, 0); } });
    blob(m, cx, cy, (Math.max(W, H) >> 1) + 2, (x, y) => { m.setG(x, y, T.SAND); m.setO(x, y, 0); });
  }
  box(m, ox - 2, oy - 2, W + 4, H + 4, c.ground, 0);
  for (let j = oy - 1; j < oy + H + 1; j++) for (let i = ox - 1; i < ox + W + 1; i++) if (m.inb(i, j)) m.safe[idx(m, i, j)] = sid;
  if (c.road && c.road !== c.ground) { box(m, ox, cy - 1, W, 2, c.road, 0); box(m, cx - 1, oy, 2, H, c.road, 0); }
  if (c.wallRing) {
    ring(m, ox - 1, oy - 1, W + 2, H + 2, c.wallRing);
    for (const side of s.gates) for (let k = 0; k < 2; k++) {
      const [gx, gy] = side === 's' ? [cx - 1 + k, oy + H] : side === 'n' ? [cx - 1 + k, oy - 1] : side === 'w' ? [ox - 1, cy - 1 + k] : [ox + W, cy - 1 + k];
      m.setO(gx, gy, T.GATE_OPEN); m.setG(gx, gy, c.road || c.ground); m.gates.push({ x: gx, y: gy, town: s.id });
    }
  } else for (const side of s.gates) { /* città aperte: nessuna cinta */ void side; }
  // edifici su due file
  const row1 = ['inn', 'shop', 'hall'].filter((r) => s.roles.includes(r)), row2 = ['house'].filter((r) => s.roles.includes(r));
  const place = (roles, y, deco) => {
    const sizes = roles.map((r) => ROLE_SIZE[r]), n = roles.length + deco, tot = sizes.reduce((a, b) => a + b[0], 0) + deco * 7;
    const gap = Math.max(1, Math.floor((W - tot) / (n + 1)));
    let x = ox + gap;
    roles.forEach((r, i) => { buildingAt(m, x, y, sizes[i][0], sizes[i][1], `${s.id}_${r}`, st, c.road || c.ground); x += sizes[i][0] + gap; });
    for (let d = 0; d < deco; d++) { decoBuilding(m, x, y, 7, 6, st); x += 7 + gap; }
  };
  place(row1, oy + 2, 0); place(row2, oy + H - 9, Math.max(0, Math.floor((W - 12) / 11)));
  // elementi centrali e decorazioni caratteristiche
  const Pt = (a, b) => (m.inb(a, b) ? 1 : 0);
  const scatter = (tile, n, ok = () => true) => { for (let k = 0, t = 0; k < n && t < n * 30; t++) { const x = ox + 1 + Math.floor(rng() * (W - 2)), y = oy + 1 + Math.floor(rng() * (H - 2)); if (!m.obj[idx(m, x, y)] && ok(x, y) && !(Math.abs(y - cy) < 3) && Math.abs(x - cx) > 2) { m.setO(x, y, tile); k++; } } };
  const free = (x, y) => m.ground[idx(m, x, y)] !== (c.road || -1);
  switch (c.center) {
    case 'pond_pagoda': // laghetto con isola, pagoda e ponti
      blob(m, cx, cy, 7, (x, y) => { m.setG(x, y, T.WATER); m.setO(x, y, 0); }); blob(m, cx, cy, 3, (x, y) => m.setG(x, y, T.GRASS));
      box(m, cx - 1, cy - 1, 2, 2, null, T.PAGODA); box(m, cx - 8, cy - 1, 17, 2, null, 0); for (let x = cx - 8; x <= cx + 8; x++) for (const yy of [cy - 1, cy]) if (DEFS[m.g(x, yy)].liquid) m.setG(x, yy, T.BRIDGE);
      break;
    case 'arena': // anfiteatro: anello di colonne con sabbia al centro
      for (let a = 0; a < 24; a++) { const ang = (a / 24) * 6.283, x = Math.round(cx + Math.cos(ang) * 9), y = Math.round(cy + Math.sin(ang) * 6); if (a % 6 !== 0) m.setO(x, y, T.COLUMN); }
      blob(m, cx, cy, 5, (x, y) => { if (Math.hypot(x - cx, (y - cy) * 1.4) < 6) m.setG(x, y, T.SAND); }); m.setO(cx, cy, T.STATUE);
      break;
    case 'pond_lamps': // stagno nel bosco con lampade e funghi luminosi
      blob(m, cx, cy, 5, (x, y) => { m.setG(x, y, T.WATER); m.setO(x, y, 0); }); for (const [dx, dy] of [[-7, -3], [7, -3], [-7, 3], [7, 3]]) m.setO(cx + dx, cy + dy, T.ELVENLAMP);
      break;
    case 'oasis':
      blob(m, cx, cy, 4, (x, y) => { m.setG(x, y, T.WATER); m.setO(x, y, 0); }); for (let a = 0; a < 8; a++) m.setO(Math.round(cx + Math.cos(a * 0.785) * 7), Math.round(cy + Math.sin(a * 0.785) * 5), T.PALM);
      break;
    case 'fountain_anchor': box(m, cx - 1, cy - 1, 2, 2, null, T.FOUNTAIN); break;
    case 'bonfire': m.setO(cx, cy, T.BONFIRE); for (const [dx, dy] of [[-5, -4], [5, -4], [-5, 4], [5, 4]]) m.setO(cx + dx, cy + dy, T.TOTEM); break;
    case 'holo': box(m, cx - 1, cy - 1, 2, 2, null, T.HOLO); break;
    case 'lagoon': blob(m, cx, cy, 4, (x, y) => { m.setG(x, y, T.WATER); m.setO(x, y, 0); }); box(m, cx - 6, cy - 1, 13, 2, T.DOCK, 0); box(m, cx - 1, cy - 6, 2, 13, T.DOCK, 0); break;
    case 'forge_lava': blob(m, cx, cy, 4, (x, y) => { m.setG(x, y, T.LAVA); m.setO(x, y, 0); }); box(m, cx - 6, cy - 1, 13, 2, T.BRIDGE, 0); for (const dx of [-8, 8]) m.setO(cx + dx, cy - 3, T.FORGE); break;
    case 'mushroom_lake': blob(m, cx, cy, 5, (x, y) => { m.setG(x, y, T.WATER); m.setO(x, y, 0); }); for (let a = 0; a < 10; a++) m.setO(Math.round(cx + Math.cos(a * 0.628) * 8), Math.round(cy + Math.sin(a * 0.628) * 6), T.MUSHROOM); box(m, cx - 6, cy - 1, 13, 2, T.BRIDGE, 0); break;
  }
  for (const d of c.decor || []) {
    if (d === 'bamboo') { for (const [x, y] of [[ox + 2, oy + 12], [ox + W - 4, oy + 12], [ox + 2, oy + H - 12], [ox + W - 4, oy + H - 12]]) for (let k = 0; k < 6; k++) if (!m.obj[idx(m, x + (k % 3), y + (k >> 1))]) m.setO(x + (k % 3), y + (k >> 1), T.BAMBOO); }
    if (d === 'redlamps') for (let x = ox + 3; x < ox + W - 2; x += 6) { m.setO(x, cy - 2, T.LANTERN); m.setO(x, cy + 2, T.LANTERN); }
    if (d === 'statues') for (let x = ox + 6; x < ox + W - 4; x += 9) if (Math.abs(x - cx) > 3) { m.setO(x, cy - 2, T.STATUE); m.setO(x, cy + 2, T.STATUE); }
    if (d === 'aqueduct') for (let x = ox - 8; x < ox + W + 8; x += 3) { if (m.inb(x, oy - 4)) { m.setG(x, oy - 4, T.MARBLEFLOOR); m.setO(x, oy - 4, T.COLUMN); m.setO(x + 1, oy - 5, T.TILEROOF); m.setO(x + 2, oy - 4, T.COLUMN); } }
    if (d === 'mushrooms') scatter(T.MUSHROOM, 22, free);
    if (d === 'giant_trees') scatter(T.GIANTTREE, 10, free);
    if (d === 'palms') scatter(T.PALM, 16, free);
    if (d === 'tents') for (let x = ox + 5; x < ox + W - 4; x += 8) if (Math.abs(x - cx) > 3) m.setO(x, cy - 2, T.STALL);
    if (d === 'totems') scatter(T.TOTEM, 6, free);
    if (d === 'neontowers') for (const [x, y] of [[ox + 2, oy + 11], [ox + W - 6, oy + 11]]) { box(m, x, y, 4, 6, null, T.NEONWALL); m.setO(x + 1, y + 6, T.HOLO); }
    if (d === 'holosigns') for (let x = ox + 4; x < ox + W - 3; x += 7) { m.setO(x, cy - 2, T.HOLO); }
    if (d === 'walkways') { box(m, ox + 2, cy - 1, W - 4, 2, T.DOCK, 0); }
    if (d === 'crates') for (let k = 0; k < 8; k++) { const x = cx - 10 + k * 3; if (!m.obj[idx(m, x, oy + H - 2)]) m.setO(x, oy + H - 2, k % 2 ? T.CRATE : T.BARREL); }
    if (d === 'ships') { // molo con navi: serve mare a sud (garantito dal generatore)
      box(m, cx - 8, oy + H, 16, 12, T.DOCK, 0);
      for (const [dx, dy] of [[-12, 3], [10, 5]]) { box(m, cx + dx, oy + H + dy, 3, 2, null, T.SHIP); box(m, cx + dx - 1, oy + H + dy - 1, 5, 4, T.WATER, null); box(m, cx + dx, oy + H + dy, 3, 2, null, T.SHIP); }
    }
    if (d === 'lighthouse') { box(m, ox + W - 4, oy + H - 3, 2, 2, T.COBBLE, null); box(m, ox + W - 4, oy + H - 3, 2, 3, null, T.LIGHTHOUSE); }
  }
  if (s.civ === CIVS.cn || s.civ === CIVS.imp || s.civ === CIVS.cyb) { /* nessuna variante extra */ }
  G.densify(m, { ox, oy, W, H, road: c.road || c.ground, quarters: G.quartersFor(c.style), rng, floorOk: c.road && c.road !== c.ground ? (g) => g !== c.road : null });
  poi(m, cx, cy, c.name, 'town');
  m.anchors['town_' + s.id] = { x: cx - 3, y: cy + 3 };
  void Pt;
}
export { stampCiv };

// ---------------------------------------------------------------------------------------------
// Luoghi di interesse con decorazioni caratteristiche
function stampPOI(m, p) {
  const { x, y } = p, rng = m.rng;
  const area = (w2, h2, g) => { for (let j = -h2; j <= h2; j++) for (let i = -w2; i <= w2; i++) { if (DEFS[m.g(x + i, y + j)].liquid || DEFS[m.g(x + i, y + j)].solid) m.setG(x + i, y + j, g); else m.setG(x + i, y + j, g); m.setO(x + i, y + j, 0); } };
  const scat = (tile, n, w2, h2, avoid = 3) => { for (let k = 0, t = 0; k < n && t < n * 20; t++) { const px = x + Math.floor((rng() * 2 - 1) * w2), py = y + Math.floor((rng() * 2 - 1) * h2); if (Math.abs(px - x) < avoid && py > y - 4) continue; if (!m.obj[idx(m, px, py)]) { m.setO(px, py, tile); k++; } } };
  const entrance = (wall, floor) => { if (p.map) stampEntrance(m, { id: p.map, x, y, req: p.req, deny: p.deny, wall, floor, name: p.n }); };
  poi(m, x, y, p.n, p.kind === 'fairy' || p.kind === 'isletwreck' ? 'shrine' : 'dungeon');
  switch (p.kind) {
    case 'graveyard':
      area(13, 8, T.DEADGRASS); ring(m, x - 13, y - 4, 27, 14, T.FENCE); m.setO(x, y + 9, 0); m.setO(x + 1, y + 9, 0);
      for (let gy = y + 1; gy <= y + 7; gy += 3) for (let gx = x - 10; gx <= x + 10; gx += 3) if (Math.abs(gx - x) > 1) m.setO(gx, gy, T.GRAVE);
      scat(T.DEADTREE, 8, 11, 7); entrance(T.WALL, T.STONE); break;
    case 'castle':
      area(14, 8, T.STONE); ring(m, x - 14, y - 6, 29, 17, T.WALL); for (const [cx2, cy2] of [[x - 15, y - 7], [x + 13, y - 7], [x - 15, y + 9], [x + 13, y + 9]]) box(m, cx2, cy2, 3, 3, null, T.TOWER);
      for (let k = 0; k < 4; k++) m.setO(x + 2 + k * 2, y + 10, 0); m.setO(x - 2, y + 10, 0); m.setO(x - 1, y + 10, 0); m.setO(x, y + 10, 0); m.setO(x + 1, y + 10, 0);
      scat(T.RUBBLE, 14, 12, 7); scat(T.BANNER, 4, 12, 7); entrance(T.WALL, T.STONE); break;
    case 'ruins':
      area(11, 6, T.MARBLEFLOOR); for (let k = 0; k < 14; k++) { const px = x - 10 + Math.floor(rng() * 21), py = y + 2 + Math.floor(rng() * 6); if (Math.abs(px - x) > 1) m.setO(px, py, rng() < 0.6 ? T.COLUMN : T.RUBBLE); }
      m.setO(x - 6, y + 1, T.STATUE); m.setO(x + 6, y + 1, T.STATUE); entrance(T.MARBLE, T.MARBLEFLOOR); break;
    case 'buried':
      area(11, 6, T.SAND); scat(T.COLUMN, 5, 10, 5); scat(T.RUBBLE, 8, 10, 5); entrance(T.ADOBE, T.SAND); break;
    case 'volcano':
      area(13, 10, T.OBSIDIANFLOOR); blob(m, x, y - 9, 5, (px, py) => { m.setG(px, py, T.LAVA); m.setO(px, py, 0); });
      for (let a = 0; a < 16; a++) m.setO(Math.round(x + Math.cos(a * 0.3927) * 8), Math.round(y - 9 + Math.sin(a * 0.3927) * 7), T.VOLCANOCONE);
      entrance(T.OBSIDIAN, T.OBSIDIANFLOOR); break;
    case 'stones': // cerchio di menhir con portale al regno degli spiriti (solo di notte)
      area(9, 9, T.MAGICGRASS);
      for (let a = 0; a < 8; a++) { const px = Math.round(x + Math.cos(a * 0.785) * 6), py = Math.round(y - 5 + Math.sin(a * 0.785) * 5); m.setO(px, py, T.ROCK); }
      m.setO(x, y - 5, T.PORTAL); m.portals.push({ x, y: y - 5, to: p.map, anchor: 'entry', req: p.req, deny: p.deny }); m.anchors['door_' + p.map] = { x, y: y - 3 }; break;
    case 'fairy': // sorgente sacra tra funghi luminosi: santuario naturale
      area(7, 6, T.MAGICGRASS); for (let a = 0; a < 12; a++) m.setO(Math.round(x + Math.cos(a * 0.5236) * 6), Math.round(y + Math.sin(a * 0.5236) * 5), T.MUSHROOM);
      blob(m, x, y, 2, (px, py) => { m.setG(px, py, T.WATER); }); stampShrine(m, 'sorgente', x - 4, y + 1, 'Sorgente Sacra'); break;
    case 'dragon':
      area(13, 7, T.MARBLEFLOOR); for (const dx of [-8, 8]) box(m, x + dx, y + 1, 2, 2, null, T.PAGODA); for (const dx of [-5, 5, -11, 11]) m.setO(x + dx, y + 5, T.STATUE);
      scat(T.BAMBOO, 16, 14, 8, 6); entrance(T.WALLCN, T.MARBLEFLOOR); break;
    case 'glacier':
      area(10, 6, T.SNOW); scat(T.ICEWALL, 10, 10, 6); scat(T.PINE, 8, 11, 7); entrance(T.ICEWALL, T.ICE); break;
    case 'dwarfgate':
      area(10, 6, T.STONE); for (const dx of [-5, 5]) m.setO(x + dx, y + 1, T.FORGE); entrance(T.DWARFWALL, T.STONE); break;
    case 'tunnel':
      area(8, 5, T.ASH); scat(T.GRAVE, 4, 7, 4); entrance(T.HELLROCK, T.ASH); break;
    case 'isletwreck': // isolotto con relitto e tesoro, raggiungibile solo a nuoto o col delfino
      blob(m, x, y, 9, (px, py) => { m.setG(px, py, T.DEEP); m.setO(px, py, 0); }); blob(m, x, y, 4, (px, py) => { m.setG(px, py, T.SAND); });
      box(m, x - 2, y - 1, 3, 2, null, T.SHIP); m.props.push({ type: 'chest', id: 'faro_morto', x: x + 2, y: y + 1, loot: [['perla_grezza', 3], ['anima_cristallizzata', 1]], gold: 400 }); break;
  }
}

// ---------------------------------------------------------------------------------------------
export function genOverworld(m, def) {
  const { w, h } = m, seed = def.seed, rng = m.rng, N = w * h;
  const realm = new Uint8Array(N), elev = new Float32Array(N), land = new Float32Array(N), prot = new Uint8Array(N), forceSea = new Uint8Array(N);
  const sites = Object.values(TOWNS);
  const mark = (arr, x0, y0, ww, hh, v = 1) => { for (let j = Math.max(0, y0); j < Math.min(h, y0 + hh); j++) for (let i = Math.max(0, x0); i < Math.min(w, x0 + ww); i++) arr[j * w + i] = v; };
  for (const s of sites) mark(prot, s.x - 7, s.y - 7, s.w + 14, s.h + 14);
  for (const o of OUTPOSTS) mark(prot, o.x - 5, o.y - 5, o.w + 10, o.h + 10);
  for (const p of POIS) if (p.kind !== 'isletwreck') mark(prot, p.x - 16, p.y - 14, 33, 30);
  for (const e of ENTRANCES) mark(prot, e.x - 8, e.y - 8, 17, 14);
  mark(prot, DIVE.x - 10, DIVE.y - 10, 21, 21, 0);
  const port = TOWNS.portomarea; mark(forceSea, port.x - 8, port.y + port.h + 2, port.w + 16, 24);   // baia del porto
  const isl = TOWNS.coralia; mark(forceSea, isl.x - 14, isl.y - 14, isl.w + 28, isl.h + 28);          // arcipelago di Coralia
  mark(forceSea, 376, 540, 26, 22);                                                                    // isolotto del faro morto
  const bord = new Float32Array(N);

  // 1) regni, terra/mare, quota
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const wx = x + (fbm(x * 0.011, y * 0.011, seed + 1, 2) - 0.5) * 54, wy = y + (fbm(x * 0.011 + 70, y * 0.011 + 9, seed + 2, 2) - 0.5) * 54;
    let d1 = 1e9, d2 = 1e9, b = 0, bi = 0;
    REALMS.forEach((r, ri) => { const d = Math.hypot(wx - r.x, wy - r.y) / r.wt; if (d < d1) { d2 = d1; d1 = d; b = r.b; bi = ri; } else if (d < d2) d2 = d; });
    realm[i] = bi; m.zone[i] = b; bord[i] = d2 - d1;
    const edge = Math.min(x, y, w - 1 - x, h - 1 - y), cont = fbm(x * 0.0042 + 11, y * 0.0042 + 5, seed + 4, 3);
    let L = 0.5 + (cont - 0.5) * 2.0 + (Math.min(1, edge / 70) - 0.55) * 0.5;
    if (y > 470) L -= ((y - 470) / 180) * 0.34;
    const hb = Math.max(0, Math.min(1, Math.min(x - HEART.x, HEART.x + HEART.w - x, y - HEART.y, HEART.y + HEART.h - y) / 16));
    L += hb * 0.5;
    if (prot[i]) L = Math.max(L, 0.62);
    if (forceSea[i]) L = Math.min(L, 0.3);
    land[i] = L;
    const name = BIOME_IDS[b], ridge = Math.max(0, 1 - bord[i] / 16);
    let E = 0.38 * fbm(x * 0.011, y * 0.011, seed + 7, 3) + 0.2 * fbm(x * 0.045, y * 0.045, seed + 8, 2) + 0.5 * ridge + (REALM_ELEV[name] || 0) + (1 - y / h) * 0.08;
    const pass = fbm(x * 0.035 + 5, y * 0.035 + 9, seed + 9, 2);
    if (pass < 0.4 && ridge > 0) E -= (0.4 - pass) * 0.95; // valichi naturali tra le catene
    elev[i] = E;
  }
  // 2) pittura dei biomi con montagne (barriere) e coste
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, L = land[i], b = m.zone[i], name = BIOME_IDS[b];
    if (L < 0.5) { m.ground[i] = L < 0.4 ? T.DEEP : T.WATER; m.zone[i] = B.ocean; continue; }
    if (L < 0.545) { m.ground[i] = T.SAND; continue; }
    const [g, o] = paintCell(name, x, y, elev[i], rng(), seed);
    m.ground[i] = g; m.obj[i] = o;
    const thr = MOUNT_THR[name] ?? 0.74;
    if (!prot[i] && elev[i] > thr) { m.obj[i] = OBST[name] || T.ROCK; if (elev[i] > thr + 0.16 && (name === 'mountain' || name === 'snow' || name === 'tundra')) m.ground[i] = T.SNOW; }
    const nl = fbm(x * 0.045, y * 0.045, seed + 21, 2);
    if (!prot[i] && nl > 0.74 && name !== 'canyon' && name !== 'badlands' && name !== 'desert' && name !== 'dunes') { m.ground[i] = nl > 0.78 ? T.DEEP : T.WATER; m.obj[i] = 0; }
  }
  // 3) fiumi: nascono tra i monti e scendono verso il mare lungo il potenziale del terreno
  const srcs = [];
  for (let t = 0; t < 9000 && srcs.length < 30; t++) {
    const x = 30 + Math.floor(rng() * (w - 60)), y = 30 + Math.floor(rng() * (h - 60)), i = y * w + x;
    if (land[i] > 0.6 && elev[i] > 0.55 && elev[i] < 0.8 && !prot[i] && srcs.every((s) => (s[0] - x) ** 2 + (s[1] - y) ** 2 > 55 * 55)) srcs.push([x, y]);
  }
  let riverCells = 0;
  for (const [sx, sy] of srcs) {
    let x = sx, y = sy; const vis = new Set();
    for (let step = 0; step < 1100; step++) {
      vis.add(y * w + x);
      if (!prot[y * w + x]) { m.setG(x, y, T.DEEP); m.setO(x, y, 0); riverCells++; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (y + dy) * w + x + dx; if (m.inb(x + dx, y + dy) && m.ground[k] !== T.DEEP && !prot[k] && !DEFS[m.ground[k]].liquid) { m.ground[k] = T.WATER; m.obj[k] = 0; } } }
      if (land[y * w + x] < 0.5) break;
      let best = null, bv = 1e9;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if ((!dx && !dy) || !m.inb(nx, ny) || vis.has(ny * w + nx)) continue;
        const v = land[ny * w + nx] + 0.22 * elev[ny * w + nx] + (hash2(nx, ny, seed) - 0.5) * 0.018;
        if (v < bv) { bv = v; best = [nx, ny]; }
      }
      if (!best) break;
      [x, y] = best;
    }
  }
  m.riverCells = riverCells;

  // 4) strutture della terra di Hinomoto (traslata), poi nuovi insediamenti e luoghi
  for (const p of PATHS) carve(m, p, 2);
  for (const t of sites) { if (t.kind) stampCiv(m, t); else stampTown(m, Object.keys(TOWNS).find((k) => TOWNS[k] === t)); }
  for (const o of OUTPOSTS) stampOutpost(m, o);
  for (const e of ENTRANCES) stampEntrance(m, e);
  for (const b of BUILDINGS_OW) { clearGround(m, b.x - 1, b.y - 1, b.w + 2, b.h + 3, T.GRASS); buildingAt(m, b.x, b.y, b.w, b.h, b.id, b.style, T.DIRT); }
  for (const s of SHRINES) stampShrine(m, s.id, s.x, s.y);
  for (const p of POIS) stampPOI(m, p);
  // isolotto delle immersioni (anello d'acqua profonda)
  blob(m, DIVE.x, DIVE.y, 8, (x, y) => { m.setG(x, y, T.DEEP); m.setO(x, y, 0); setZone(m, x, y, B.ocean); });
  blob(m, DIVE.x, DIVE.y, 3, (x, y) => m.setG(x, y, T.SAND));
  m.setO(DIVE.x, DIVE.y, T.PORTAL);
  m.portals.push({ x: DIVE.x, y: DIVE.y, to: DIVE.to, anchor: 'entry', req: DIVE.req, deny: DIVE.deny });
  m.anchors.door_ryugu = { x: DIVE.x, y: DIVE.y + 2 };
  poi(m, DIVE.x, DIVE.y, 'Isolotto degli Abissi', 'dungeon');
  // recinto della stalla
  const S = OW_STABLE;
  clearGround(m, S.x, S.y, S.w, S.h, T.GRASS); box(m, S.x, S.y, S.w, S.h, T.GRASS, 0); ring(m, S.x, S.y, S.w, S.h, T.FENCE);
  for (let k = 0; k < S.gap[2]; k++) m.setO(S.gap[0], S.gap[1] + k, 0);
  poi(m, S.x + 4, S.y + 3, 'Stalla di Daigo', 'building');
  for (const p of OW_PROPS) { clearGround(m, p.x, p.y, 1, 1, T.GRASS); m.props.push({ ...p }); }
  m.anchors.start ||= { x: TOWNS.hinomura.x + 17, y: TOWNS.hinomura.y + 16 };

  // 5) strade tra insediamenti e luoghi (A*): collegano il mondo con ponti e valichi
  m.roads = 0;
  for (const [a, b] of ROADS) {
    const A = gatePt(a), Bp = gatePt(b);
    if (!A || !Bp) continue;
    const pts = roadPath(m, A, Bp);
    if (pts) { carve(m, pts, 2); m.roads++; }
  }

  // 6) tesori: forzieri sparsi nei biomi, tesori dei luoghi segreti, tasche nascoste tra i monti (solo aquila)
  for (const [id, x, y, loot] of [['secret_elisa', 80, 424, [['anima_cristallizzata', 1], ['pozione_vita_m', 2]]], ['secret_soldato', 140, 498, [['katana_acciaio', 1]]], ['secret_bimba', 100, 452, [['polvere_stelle', 2], ['elisir_ferro', 1]]], ['secret_oracolo', 112, 150, [['frammento_tempo', 1], ['pozione_ki_l', 1]]]]) {
    clearGround(m, x, y, 1, 1, T.GRASS); m.props.push({ type: 'chest', id, x, y, loot, gold: 250, secret: 1 });
  }
  const st = m.anchors.start, seen = m.floodWalk(st.x, st.y, null), placed = [];
  for (let k = 0, t = 0; k < 90 && t < 9000; t++) {
    const x = 4 + Math.floor(rng() * (w - 8)), y = 4 + Math.floor(rng() * (h - 8)), i = idx(m, x, y);
    if (!seen[i] || m.safe[i] || m.obj[i] || DEFS[m.ground[i]].liquid || m.ground[i] === T.BRIDGE) continue;
    if (placed.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < 22 * 22)) continue;
    const name = BIOME_IDS[m.zone[i]], table = CHEST_LOOT[name] || CHEST_LOOT.meadow;
    const far = Math.hypot(x - st.x, y - st.y);
    const tbl = [...table, ...CHEST_EXTRA.filter((_, j) => (j + name.length + k) % 4 === 0)];
    m.props.push({ type: 'chest', id: 'ow_ch' + k, x, y, loot: tbl[Math.floor(rng() * tbl.length)], gold: 20 + Math.floor(rng() * 60 + far * 0.5) });
    placed.push({ x, y }); k++;
  }
  // oggetti raccoglibili (erbe, funghi, minerali) legati al bioma: ingredienti per pozioni e armi
  const FORAGE = { forest: ['erba_medicinale', 'fungo_luna', 'bacche_blu'], ancient: ['legno_duro', 'fungo_luna', 'erba_medicinale'], enchanted: ['polvere_stelle', 'fungo_luna', 'bacche_blu'], swamp: ['erba_medicinale', 'fungo_luna'],
    desert: ['sabbia_vetro'], dunes: ['sabbia_vetro', 'cristallo_grezzo'], snow: ['ghiaccio_eterno', 'bacche_blu'], tundra: ['ghiaccio_eterno'], volcano: ['carbone', 'cenere_yomi'], mountain: ['ferro_grezzo', 'cristallo_grezzo'],
    canyon: ['ferro_grezzo', 'rame'], badlands: ['rame', 'chip_neon'], jade: ['bacche_blu', 'erba_medicinale'], tropical: ['bacche_blu', 'corallo_rosso'], haunted: ['fungo_luna', 'osso'], meadow: ['erba_medicinale', 'bacche_blu'], plateau: ['ferro_grezzo', 'erba_medicinale'] };
  for (const [b, list] of Object.entries(FORAGE_EXTRA)) FORAGE[b] = [...(FORAGE[b] || []), ...list];
  for (let k = 0, t = 0; k < 330 && t < 24000; t++) {
    const x = 4 + Math.floor(rng() * (w - 8)), y = 4 + Math.floor(rng() * (h - 8)), i = idx(m, x, y);
    if (!seen[i] || m.safe[i] || m.obj[i] || DEFS[m.ground[i]].liquid || m.ground[i] === T.BRIDGE) continue;
    const list = FORAGE[BIOME_IDS[m.zone[i]]]; if (!list) continue;
    const item = list[Math.floor(rng() * list.length)], ore = ['ferro_grezzo', 'rame', 'cristallo_grezzo', 'sabbia_vetro', 'carbone', 'zolfo', 'salnitro', 'cristallo_ghiaccio', 'componente_elettrico'].includes(item);
    m.props.push({ type: 'item', id: 'forage' + k, sprite: ore ? 'ore' : 'herb', item, x, y }); k++;
  }
  let pockets = 0;
  for (let t = 0; t < 60000 && pockets < SECRET_CHESTS; t++) { // radure nascoste dentro le masse montuose
    const x = 20 + Math.floor(rng() * (w - 40)), y = 20 + Math.floor(rng() * (h - 40));
    let ok = true;
    for (let j = -3; j <= 3 && ok; j++) for (let i = -3; i <= 3; i++) { const k = idx(m, x + i, y + j); if (!m.obj[k] || !DEFS[m.obj[k]].solid || SOLID_TREES.has(m.obj[k]) || m.safe[k] || prot[k]) { ok = false; break; } }
    if (!ok || placed.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < 30 * 30)) continue;
    box(m, x - 2, y - 2, 5, 5, T.MAGICGRASS, 0);
    m.props.push({ type: 'chest', id: 'secret_k' + pockets, x, y, loot: [['frammento_tempo', 1], ['pozione_vita_l', 1], ['anima_cristallizzata', 1]], gold: 500, secret: 1 });
    m.setO(x - 2, y - 2, T.CRYSTAL); m.setO(x + 2, y + 2, T.CRYSTAL); placed.push({ x, y }); pockets++;
  }
  m.pockets = pockets;

  m.realm = realm; placeBarriers(m, realm);
  // 7) creature per regione (la rigenerazione e il caricamento a chunk avvengono nella scena)
  const anchors = Object.values(m.anchors);
  addSpawns(m, 2600, (x, y) => { const z = BIOME_IDS[m.zone[idx(m, x, y)]]; return z === 'ocean' ? 'ocean' : SPAWN_TABLES[z] ? z : 'meadow'; }, { minFrom: anchors, minDist: 12 });
}

// ---------------------------------------------------------------------------------------------
// Città-caverna (nani, sotterranea): caverna ellittica con una città dentro
export function genCityMap(m, def) {
  const c = CITYMAP_SITES[m.id], { w, h } = m, rng = m.rng;
  const wallT = m.id === 'khaz_dum' ? T.DWARFWALL : T.ROCK;
  box(m, 0, 0, w, h, c.ground, 0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (x - w / 2) / (w / 2 - 3), dy = (y - h / 2) / (h / 2 - 3), r = Math.hypot(dx, dy) + (fbm(x * 0.12, y * 0.12, def.seed, 2) - 0.5) * 0.18;
    if (r > 1) { m.setO(x, y, wallT); m.setG(x, y, T.CAVE); }
  }
  const S = { id: m.id, civ: c, x: 24, y: 14, w: 42, h: 36, gates: [], roles: ['inn', 'shop', 'hall', 'house'] };
  stampCiv(m, S);
  const cx = S.x + (S.w >> 1), cy = S.y + (S.h >> 1);
  m.anchors.plaza = { x: cx - 3, y: cy + 3 };
  // ingresso a sud della caverna
  box(m, cx - 2, S.y + S.h, 4, h - (S.y + S.h) - 3, c.road, 0);
  const ex = def.exit;
  m.setO(cx, h - 4, T.ARCH); m.setG(cx, h - 4, c.road);
  m.portals.push({ x: cx, y: h - 4, to: ex.to, anchor: ex.anchor || 'door_' + m.id });
  m.anchors.entry = { x: cx, y: h - 6 };
  poi(m, cx, h - 4, 'Uscita', 'exit');
  m.props.push({ type: 'shrine', id: m.id, x: cx + 3, y: h - 6 }); m.anchors['shrine_' + m.id] = { x: cx, y: h - 6 };
  for (let k = 0; k < 14; k++) { const x = 6 + Math.floor(rng() * (w - 12)), y = 6 + Math.floor(rng() * (h - 12)); if (!m.obj[idx(m, x, y)] && !m.safe[idx(m, x, y)] && m.passable(x, y, null)) m.setO(x, y, m.id === 'nethermere' ? T.MUSHROOM : T.CRYSTAL); }
  m.safe.fill(0); for (let j = S.y - 1; j < S.y + S.h + 1; j++) for (let i = S.x - 1; i < S.x + S.w + 1; i++) m.safe[idx(m, i, j)] = 1; // la città è zona sicura
  m.safeNames[1] = c.name;
}

// ---------------------------------------------------------------------------------------------
// Regno degli Spiriti: isole eteree sospese, abitate da anime buone e ostili
export function genSpirit(m, def) {
  const { w, h } = m, rng = m.rng;
  box(m, 0, 0, w, h, T.VOID, 0);
  const hub = [w >> 1, h >> 1, 10], isl = [[18, 16, 7], [w - 19, 16, 7], [18, h - 17, 7], [w - 19, h - 17, 7], [w >> 1, 10, 5]];
  const fill = (x, y, r) => blob(m, x, y, r, (px, py) => { m.setG(px, py, Math.hypot(px - x, py - y) > r - 2 ? T.TIMEFLOOR : T.MAGICGRASS); });
  fill(...hub); for (const i of isl) fill(...i);
  for (const i of isl) { const [x1, y1] = i; for (let t = 0; t <= 1; t += 0.01) box(m, Math.round(hub[0] + (x1 - hub[0]) * t) - 1, Math.round(hub[1] + (y1 - hub[1]) * t) - 1, 3, 3, T.TIMEFLOOR, 0); }
  for (const [x, y, r] of [hub, ...isl]) for (let k = 0; k < r * 2; k++) { const a = rng() * 6.283, px = Math.round(x + Math.cos(a) * (r - 2)), py = Math.round(y + Math.sin(a) * (r - 2)); if (m.g(px, py) === T.MAGICGRASS && !m.obj[idx(m, px, py)]) m.setO(px, py, rng() < 0.5 ? T.MUSHROOM : T.CRYSTAL); }
  const ex = def.exit;
  m.setO(hub[0], hub[1] + 7, T.PORTAL); m.portals.push({ x: hub[0], y: hub[1] + 7, to: ex.to, anchor: ex.anchor });
  m.anchors.entry = { x: hub[0], y: hub[1] + 5 };
  poi(m, hub[0], hub[1] + 7, 'Ritorno', 'exit');
  m.props.push({ type: 'shrine', id: m.id, x: hub[0] + 3, y: hub[1] + 4 }); m.anchors['shrine_' + m.id] = { x: hub[0], y: hub[1] + 5 };
  isl.forEach(([x, y], k) => m.props.push({ type: 'chest', id: `spirit_c${k}`, x, y, loot: [['essenza_spirito', 2], ['anima_cristallizzata', 1], ['pozione_vita_l', 1]], gold: 300 }));
  addSpawns(m, 36, () => 'spirit', { minFrom: [m.anchors.entry], minDist: 9 });
  m.safe.fill(0);
}
void MAPS; void NEW_SITES;
