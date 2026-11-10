// COLLEGAMENTO DELLE SKIN AL GIOCO: strato di sprite a blocco unico per le dodici città (Hinomura, Aurelburg, Silvaneth, Longxi, Augusta, Sahar, Porto Marea, Kuru,
// Zero-Quartier, Coralia, Khaz-Dum, Nethermere). Le collisioni restano quelle dei tile: qui si cambia solo il disegno.
// Per ogni mappa si costruisce (una volta) un oggetto { hide, pave, paves, spr }:
//   hide  : celle i cui oggetti NON vanno disegnati come tile (edifici, mura, lampioni, ecc. ora sono sprite);
//   pave  : celle del terreno da disegnare con la pavimentazione della città (indice in paves);
//   spr   : sprite ordinati per profondità (base in pixel), disegnati fra i tile e le entità.
import { TOWNS } from '../data/world.js';
import { NEW_SITES, CITYMAP_SITES } from '../data/realm.js';
import { T } from '../data/tiles.js';
import { planTown } from '../world/TownPlans.js';
import { ELF_BUILDINGS } from '../world/ElfPlan.js';
import { CN_BUILDINGS } from '../world/CnPlan.js';
import { STY, drawHouseK, drawShopK, variantK } from './CityKit.js';
import { paveK, faceK, topK, towerK, gateK, propK } from './UrbanKit.js';
import { drawHinomuraHouse, drawShop } from './BuildingSkins.js';
import { PAVE, PROPS, drawTorii, drawVillageGate } from './UrbanSkins.js';
import { drawEuroHouse, drawShopEU, drawCathedral, drawTowerBuilding, drawCastle, drawSideGate, drawWallFace, drawWallTop, drawCornerTower } from './BuildingSkinsEU.js';
import { PAVE_EU, PROPS_EU, drawCityGate } from './UrbanSkinsEU.js';
import { drawElfHouse, drawElfShop } from './BuildingSkinsElf.js';
import { PAVE_ELF, PROPS_ELF, drawHedgeWall, drawElfGate } from './UrbanSkinsElf.js';
import { drawCnHouse, drawCnShop } from './BuildingSkinsCN.js';
import { PAVE_CN, PROPS_CN, drawCnWallFace, drawCnWallTop, drawCnCornerTower, drawCnGate } from './UrbanSkinsCN.js';
import { drawPalace } from './PalaceSkin.js';
import { drawRoomK } from './InteriorKit.js';
import { drawRoomElf } from './InteriorSkinsElf.js';
import { drawRoomCN } from './InteriorSkinsCN.js';
import { ROOM, SKIN_MARGIN } from './InteriorSolids.js';

const TS = 16;
const KIT = ['augusta', 'sahar', 'portomarea', 'kuru', 'zeroquartier', 'coralia', 'khaz_dum', 'nethermere'];

// ---------- cottura degli sprite: si disegna su una tela di lavoro, si ritaglia il rettangolo utile e si misura l'ancora (centro e base della parte opaca) ----------
const SW = 760, SH = 560, OX = 200, OY = 300;
let work = null;
const BAKE = new Map();
function bake(key, fn) {
  let r = BAKE.get(key); if (r) return r;
  if (!work) { work = document.createElement('canvas'); work.width = SW; work.height = SH; }
  const g = work.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, SW, SH); g.save(); g.translate(OX, OY); fn(g); g.restore();
  const d = g.getImageData(0, 0, SW, SH).data; let x0 = SW, y0 = SH, x1 = -1, y1 = -1, ob = -1, ox0 = SW, ox1 = -1, oy0 = SH;
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const a = d[(y * SW + x) * 4 + 3]; if (!a) continue; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (a > 200) { if (y > ob) ob = y; if (y < oy0) oy0 = y; if (x < ox0) ox0 = x; if (x > ox1) ox1 = x; } }
  if (x1 < 0) { r = { c: document.createElement('canvas'), dx: 0, dy: 0, ax: 0, ab: 0 }; r.c.width = r.c.height = 1; BAKE.set(key, r); return r; }
  const c = document.createElement('canvas'); c.width = x1 - x0 + 1; c.height = y1 - y0 + 1; c.getContext('2d').drawImage(work, -x0, -y0);
  r = { c, dx: x0 - OX, dy: y0 - OY, ax: (ox0 + ox1) / 2 - OX, ab: ob - OY + 1, ox0: ox0 - OX, ox1: ox1 - OX + 1, oy0: oy0 - OY }; BAKE.set(key, r); return r;
}

// ---------- strato ----------
const CACHE = new WeakMap();
export function getSkin(m) {
  if (!m || !m.id) return null;
  let s = CACHE.get(m); if (s !== undefined) return s;
  s = null;
  try { s = buildSkin(m); } catch (e) { console.warn('skin città non costruita:', e && e.stack || e); s = null; }
  CACHE.set(m, s); return s;
}

function rectOf(m, id) {
  if (m.id === 'overworld') { const t = TOWNS[id]; if (t) return { x: t.x, y: t.y, w: t.w, h: t.h, ext: t.ext || 0 }; const s = NEW_SITES[id]; if (s) return { x: s.x, y: s.y, w: s.w, h: s.h, ext: 0 }; }
  if (m.id === 'khaz_dum' || m.id === 'nethermere') return id === m.id ? { x: 18, y: 12, w: 54, h: 40, ext: 0 } : null;
  return null;
}
// interno con skin: lo sprite della stanza copre tutta la mappa (pavimento, parete di fondo, mobili); i tile restano solo come collisioni
function interiorSkin(m) {
  const { fam, kind, id } = m.def.skin, [tw, th] = ROOM[fam][kind], W = tw * 16, H = 40 + th * 16, t = document.createElement('canvas'); t.width = W; t.height = H; const g = t.getContext('2d'); g.imageSmoothingEnabled = false;
  if (fam === 'kit') drawRoomK(g, id, kind); else if (fam === 'elf') drawRoomElf(g, kind); else drawRoomCN(g, kind);
  const bg = document.createElement('canvas'); bg.width = m.w * TS; bg.height = m.h * TS; const b = bg.getContext('2d'); b.imageSmoothingEnabled = false; b.drawImage(t, 0, 0, W, 1, 0, 0, W, SKIN_MARGIN); b.drawImage(t, 0, SKIN_MARGIN);
  const n = m.w * m.h; return { m, hide: new Uint8Array(n).fill(1), pave: new Uint8Array(n), paves: [null], spr: [], tiles: new Map(), bld: [], bg };
}
function buildSkin(m) {
  if (m.def && m.def.skin) return interiorSkin(m);
  const towns = m.id === 'overworld' ? ['hinomura', 'aurelburg', 'silvaneth', 'longxi', ...KIT.filter((k) => NEW_SITES[k])] : (m.id === 'khaz_dum' || m.id === 'nethermere' ? [m.id] : []);
  if (!towns.length) return null;
  const n = m.w * m.h, S = { m, hide: new Uint8Array(n), pave: new Uint8Array(n), paves: [null], spr: [], tiles: new Map(), n: 0 };
  const add = (by, key, fn, x, y) => { const img = bake(key, fn); S.spr.push({ by, img, x, y }); S.n++; };
  S.add = add; S.bld = [];
  S.addB = (by, key, fn, x, y, fp) => { const img = bake(key, fn); S.spr.push({ by, img, x, y }); S.n++; S.bld.push({ ...fp, by, img, x, y }); };
  const hideRect = (x, y, w, h) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (m.inb(i, j)) S.hide[j * m.w + i] = 1; };
  S.hideRect = hideRect;
  for (const id of towns) { const r = rectOf(m, id); if (!r) continue; const f = KIT.includes(id) ? kitTown : id === 'hinomura' ? hinomura : id === 'aurelburg' ? aurelburg : id === 'silvaneth' ? silvaneth : longxi; f(S, m, id, r); }
  if (m.palace) palaceSkin(S, m);
  S.spr.sort((a, b) => a.by - b.by);
  return S;
}
export function paveTile(S, k, tx, ty) {
  const v = (tx * 3 + ty * 5) & 7, key = k * 8 + v; let c = S.tiles.get(key);
  if (!c) { c = document.createElement('canvas'); c.width = c.height = TS; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; S.paves[k](g, 0, 0, v); S.tiles.set(key, c); }
  return c;
}
const paveIndex = (S, fn) => { S.paves.push(fn); return S.paves.length - 1; };

// ---------- elementi comuni ----------
// oggetti (lampioni, panche, pozzi…): ogni tile-oggetto riconosciuto viene nascosto e sostituito dallo sprite, ancorato al centro-base della tile
function props(S, m, r, map, big = {}, pad = 1) {
  const seen = new Set();
  for (let y = r.y - pad; y < r.y + r.h + pad; y++) for (let x = r.x - pad; x < r.x + r.w + pad; x++) {
    if (!m.inb(x, y)) continue; const i = y * m.w + x, o = m.obj[i], e = o && (map[o] || (o === T.LAMPPOST && (map[T.LANTERN] || map[T.ELVENLAMP]))); if (!e || seen.has(i)) continue;
    const [key, fn] = e;
    if (big[o]) {   // gruppi 2x2 (fontana): disegnati una volta sola, centrati sul gruppo
      const w = big[o]; for (let j = 0; j < w; j++) for (let k = 0; k < w; k++) { const q = (y + j) * m.w + x + k; if (m.obj[q] === o) { seen.add(q); S.hide[q] = 1; } }
      const img = bake('p:' + key, fn); S.spr.push({ k: 'p', by: (y + w) * TS - 2, img, x: x * TS + w * 8 - img.ax, y: (y + w) * TS - 3 - img.ab });
      continue;
    }
    seen.add(i); S.hide[i] = 1; const img = bake('p:' + key, fn); S.spr.push({ k: 'p', by: (y + 1) * TS - 1, img, x: x * TS + 8 - img.ax, y: (y + 1) * TS - 3 - img.ab });
  }
}
// muro perimetrale: facce orizzontali, lati verticali, torri d'angolo, cancelli ai lati reali; le celle vengono nascoste
function ring(S, m, id, r, fam) {
  const gates = (m.gates || []).filter((q) => q.town === id), gset = new Set(gates.map((q) => q.x + ',' + q.y));
  const E = r.ext || 0, x0 = r.x - 1 - E, y0 = r.y - 1 - E, x1 = r.x + r.w + E, y1 = r.y + r.h + E, cx = r.x + (r.w >> 1), cy = r.y + (r.h >> 1);
  const has = { n: gates.some((q) => q.y === y0), s: gates.some((q) => q.y === y1), w: gates.some((q) => q.x === x0), e: gates.some((q) => q.x === x1) };
  for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) if (m.inb(x, y)) S.hide[y * m.w + x] = 1;
  for (let y = y0; y <= y1; y++) for (const x of [x0, x1]) if (m.inb(x, y)) S.hide[y * m.w + x] = 1;
  for (const q of gates) if (m.inb(q.x, q.y)) S.hide[q.y * m.w + q.x] = 1;
  const F = fam;
  for (let x = x0; x <= x1; x++) for (const y of [y0, y1]) { if (gset.has(x + ',' + y)) continue; S.add((y + 1) * TS + 20, id + ':face:' + (x & 3), (g) => F.face(g, x & 3), x * TS, y * TS); }
  for (let y = y0 + 1; y < y1; y++) for (const x of [x0, x1]) { if (gset.has(x + ',' + y)) continue; const side = x === x0 ? -1 : 1; S.add((y + 1) * TS + 2, id + ':top:' + side, (g) => F.top(g, side), x * TS, y * TS); }
  for (const [u, v] of F.corners(x0, y0, x1, y1)) S.add((v + 3) * TS + 4, id + ':tower', (g) => F.tower(g), u * TS, v * TS);
  for (const s of ['n', 's']) if (has[s]) { const row = s === 'n' ? y0 : y1, gx = cx; S.add((row + 1) * TS + 24, id + ':gate', (g) => F.gate(g), (gx) * TS + F.gateDx, (row + 1) * TS + F.gateDy); }
  for (const s of ['w', 'e']) if (has[s]) F.sideGate(S, id, s === 'w' ? x0 : x1, cy);
}

// ---------- città a kit (otto nuove) ----------
function kitTown(S, m, id, r) {
  const p = planTown(r.w, r.h, id === 'augusta' ? 'arena' : ({ sahar: 'oasis', portomarea: 'fountain_anchor', kuru: 'bonfire', zeroquartier: 'holo', coralia: 'lagoon', khaz_dum: 'forge_lava', nethermere: 'mushroom_lake' })[id]);
  const sty = STY[id], flat = sty.roof.k === 'flat', base = 20 + (flat ? 16 : 30) + 5 + 38;
  p.b.forEach((b, i) => {
    const x = (r.x + b.u) * TS, bottom = (r.y + b.v + b.h) * TS, shift = b.w % 2 === 0 ? 8 : 0; S.hideRect(r.x + b.u, r.y + b.v, b.w, b.h);
    const key = `${id}:${b.role}:${b.role === 'casa' || b.role === 'deco' || b.role === 'house' ? i % 4 : 0}`;
    const fn = b.role === 'hall' ? (g) => drawShopK(g, id, 'hall', 11) : b.role === 'inn' ? (g) => drawShopK(g, id, 'locanda', 8) : b.role === 'shop' ? (g) => drawShopK(g, id, 'bottega', 8) : b.role === 'deco' ? (g) => drawHouseK(g, id, 7, variantK(id, (i % 4) + 1)) : (g) => drawHouseK(g, id, b.w, variantK(id, i % 4));
    S.addB(bottom, key, fn, x + shift, bottom - base, { town: id, role: b.role, fx: r.x + b.u, fy: r.y + b.v, fw: b.w, fh: b.h });
  });
  // pavimentazioni: la piazza (ellisse) e le strade
  const pl = paveIndex(S, (g, x, y, s) => paveK(g, sty.paving[1], x, y, s, id)), rd = paveIndex(S, (g, x, y, s) => paveK(g, sty.paving[0], x, y, s, id));
  const cu = r.x + (r.w >> 1), cv = r.y + (r.h >> 1), civ = (NEW_SITES[id] && NEW_SITES[id].civ) || CITYMAP_SITES[id], roadTile = civ.road || civ.ground;
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { if (!m.inb(x, y)) continue; const i = y * m.w + x, dx = (x + 0.5 - cu) / p.rx, dy = (y + 0.5 - cv) / p.ry; const g0 = m.ground[i]; if (g0 === T.WATER || g0 === T.LAVA || g0 === T.BRIDGE) continue; if (id === 'coralia') S.pave[i] = rd; else if (dx * dx + dy * dy <= 1) S.pave[i] = pl; else if (g0 === roadTile) S.pave[i] = rd; }   // a Coralia le passerelle restano di legno anche in piazza
  // oggetti
  const L = (name) => [id + ':' + name, (g) => propK(g, id, name, 0, 0)];
  const map = { [T.LANTERN]: L('lamp'), [T.BENCH]: L('bench'), [T.WELL]: L('well'), [T.CART]: L('cart'), [T.CRATE]: L('crate'), [T.BARREL]: L('barrel'), [T.SIGN]: L('board'), [T.STATUE]: L('statue'), [T.FOUNTAIN]: L('fountain'), [T.PALM]: L('palm'), [T.TOTEM]: L('totem'), [T.BONFIRE]: L('bonfire'), [T.HOLO]: L('holo'), [T.FORGE]: L('forgepot'), [T.MUSHROOM]: L('mushroom'), [T.CRYSTAL]: L('crystal'), [T.PINE]: L('pine') };
  props(S, m, r, map, { [T.FOUNTAIN]: 2 });
  // mura, torri e cancelli (dove la città li ha)
  if ((m.gates || []).some((q) => q.town === id)) ring(S, m, id, r, kitRing(id));
}
function kitRing(id) {
  return {
    face: (g, i) => faceK(g, id, 0, 0, i), top: (g, side) => topK(g, id, 0, 0, side), tower: (g) => towerK(g, id, 0, 0), gate: (g) => gateK(g, id, 0, 0), gateDx: -48, gateDy: -66,
    corners: (x0, y0, x1, y1) => [[x0 - 1, y0 - 1], [x1, y0 - 1], [x0 - 1, y1], [x1, y1]].map(([u, v]) => [u - 0.5, v - 1.25]),
    sideGate: (S, id2, x, cy) => { for (const vv of [cy - 2, cy + 1]) S.add((vv + 1) * TS + 60, id2 + ':lamp', (g) => propK(g, id2, 'lamp', 0, 0), x * TS + 4, (vv + 1) * TS - 36); },
  };
}

// ---------- Hinomura ----------
const JP_KIND = { int_inn: 'locanda', int_smith: 'fabbro', int_pharma: 'speziale' };
const JP_PAL = [{}, { roof: '#3a6a8a', wall: '#f0e8d0', ridge: '#c8d4dc' }, { roof: '#6a5a3a', wall: '#d8c8a0', ridge: '#c8b078' }];
function hinomura(S, m, id, r) {
  const t = TOWNS[id], E = t.ext || 0;
  for (const b of t.buildings) { const x = (r.x + b.x) * TS, bottom = (r.y + b.y + b.h) * TS, base = 24 + (b.w - 4) * 3 + 4 + 38 + 8, k = JP_KIND[b.id]; S.hideRect(r.x + b.x, r.y + b.y, b.w, b.h); S.addB(bottom, `jp:${b.id}:${b.w}`, (g) => { if (k) drawShop(g, k, b.w); else drawHinomuraHouse(g, b.w, 0, { chimneyX: b.w * 16 - 26 }); }, x + (b.w % 2 === 0 ? 8 : 0), bottom - base, { town: id, role: b.id, fx: r.x + b.x, fy: r.y + b.y, fw: b.w, fh: b.h }); }
  for (const q of m.houses || []) { if (q.x < r.x - 2 || q.x > r.x + r.w + 2 || q.y < r.y - 2 || q.y > r.y + r.h + 2) continue; const bottom = (q.y + q.h) * TS, base = 24 + (q.w - 4) * 3 + 4 + 38 + 8; S.hideRect(q.x, q.y, q.w, q.h); S.addB(bottom, `jp:h:${q.w}:${q.q % 3}`, (g) => drawHinomuraHouse(g, q.w, 0, { ...JP_PAL[q.q % 3], chimneyX: q.w * 16 - 26 }), q.x * TS, bottom - base, { town: id, role: 'casa', fx: q.x, fy: q.y, fw: q.w, fh: q.h }); }
  const dirt = paveIndex(S, (g, x, y, s) => PAVE.dirt(g, x, y, s));
  for (let y = r.y - 4; y < r.y + r.h + 4; y++) for (let x = r.x - 4; x < r.x + r.w + 4; x++) if (m.inb(x, y) && m.ground[y * m.w + x] === T.DIRT) S.pave[y * m.w + x] = dirt;
  // cancelli di legno, torii a nord, lanterne di pietra a ovest
  const GT = (m.gates || []).filter((q) => q.town === id);
  for (const side of ['n', 's']) { const L = GT.filter((q) => (side === 'n' ? q.y === r.y - 1 - E : q.y === r.y + r.h + E)); if (L.length === 2) { const x = L[0].x * TS, y = L[0].y * TS; for (const q of L) S.hide[q.y * m.w + q.x] = 1; S.add(y + 16, 'jp:gate', (g) => drawVillageGate(g, 0, 0, true), x + 16 - 32, y + 16 - 64); if (side === 'n') S.add(y - 20, 'jp:torii', (g) => drawTorii(g, 0, 0), x + 16 - 24, y - 4 * 16 - 8); } }
  { const L = GT.filter((q) => q.x === r.x - 1 - E); if (L.length === 2) for (const q of L) S.hide[q.y * m.w + q.x] = 1; }
  props(S, m, r, { [T.LANTERN]: ['jp:toro', (g) => PROPS.toro(g, 0, 0)], [T.WELL]: ['jp:well', (g) => PROPS.well(g, 0, 0)], [T.SIGN]: ['jp:board', (g) => PROPS.board(g, 0, 0)], [T.BENCH]: ['jp:bench', (g) => PROPS.bench(g, 0, 0)], [T.CART]: ['jp:cart', (g) => PROPS.cart(g, 0, 0)] });
}

// ---------- Aurelburg ----------
const EU_KIND = { int_lab: 'laboratorio', int_market: 'mercato', int_inn_eu: 'locanda', int_hall: 'municipio' };
const EU_Q = [{ brick: '#a8553a', roof: '#4a5a7a', shutter: '#2a6a4a' }, { brick: '#c8a060', roof: '#6a3a2a', shutter: '#2a4a8a', flowers: ['#f06aa0', '#fff0a0'] }, { timber: true, roof: '#4a5a4a', shutter: '#8a2a2a' }, { brick: '#8a8478', roof: '#2a3a5a', shutter: '#b8742a', stone: '#c8c2b4' }];
function aurelburg(S, m, id, r) {
  const t = TOWNS[id];
  for (const b of t.buildings) { const x = (r.x + b.x) * TS, top = (r.y + b.y) * TS, bottom = top + b.h * TS, k = EU_KIND[b.id]; S.hideRect(r.x + b.x, r.y + b.y, b.w, b.h);
    if (k) { const roofH = k === 'municipio' ? 28 : 30, base = roofH + 3 + 40 + 10; S.addB(bottom, `eu:${k}`, (g) => drawShopEU(g, k, b.w), x, bottom - base, { town: id, role: b.id, fx: r.x + b.x, fy: r.y + b.y, fw: b.w, fh: b.h }); }
    else { const fp = { town: id, role: b.id, fx: r.x + b.x, fy: r.y + b.y, fw: b.w, fh: b.h }; if (b.id === 'int_cathedral') S.addB(bottom, 'eu:cat', (g) => drawCathedral(g), x, top, fp); else if (b.id === 'int_tower') S.addB(bottom, 'eu:tow', (g) => drawTowerBuilding(g), x, top, fp); else if (b.id === 'int_castle') S.addB(bottom, 'eu:cas', (g) => drawCastle(g), x, top, fp); } }
  for (const q of m.houses || []) { if (q.x < r.x - 2 || q.x > r.x + r.w + 2 || q.y < r.y - 2 || q.y > r.y + r.h + 2) continue; const bottom = (q.y + q.h) * TS, ch = ((q.x * 7 + q.y * 3) % 3 === 0) ? 8 : undefined; S.hideRect(q.x, q.y, q.w, q.h); S.addB(bottom, `eu:h:${q.w}:${q.q % 4}:${ch ? 1 : 0}`, (g) => drawEuroHouse(g, q.w, { ...EU_Q[q.q % 4], chimneyX: ch }), q.x * TS, bottom - 83, { town: id, role: 'casa', fx: q.x, fy: q.y, fw: q.w, fh: q.h }); }
  const sett = paveIndex(S, (g, x, y, s) => PAVE_EU.sett(g, x, y, s)), chk = paveIndex(S, (g, x, y, s) => PAVE_EU.checker(g, x, y, s));
  for (let y = r.y - 10; y < r.y + r.h + 10; y++) for (let x = r.x - 10; x < r.x + r.w + 10; x++) { if (!m.inb(x, y)) continue; const i = y * m.w + x, g0 = m.ground[i]; if (g0 === T.PAVE_IRR || g0 === T.PAVE_SLAB) S.pave[i] = sett; else if (g0 === T.PAVE_MOSAIC) S.pave[i] = chk; }
  ring(S, m, id, r, {
    face: (g, i) => drawWallFace(g, 0, 0, i), top: (g, side) => drawWallTop(g, 0, 0, side), tower: (g) => drawCornerTower(g, 0, 0), gate: (g) => drawCityGate(g, 0, 0), gateDx: -44, gateDy: -66,
    corners: (x0, y0, x1, y1) => [[x0 - 1, y0 - 1], [x1 - 1, y0 - 1], [x0 - 1, y1 - 1], [x1 - 1, y1 - 1]],
    sideGate: (S2, id2, x, cy) => { S2.add((cy - 1) * TS + 40, 'eu:sg', (g) => drawSideGate(g), x * TS - 8, cy * TS - 16 - 56); S2.add((cy + 1) * TS + 40, 'eu:sg', (g) => drawSideGate(g), x * TS - 8, cy * TS + 16); },
  });
  props(S, m, r, { [T.LANTERN]: ['eu:lamp', (g) => PROPS_EU.lamp(g, 0, 0)], [T.BENCH]: ['eu:bench', (g) => PROPS_EU.bench(g, 0, 0)], [T.FOUNTAIN]: ['eu:fountain', (g) => PROPS_EU.fountain(g, 0, 0)], [T.CART]: ['eu:cart', (g) => PROPS_EU.cart(g, 0, 0)], [T.BARREL]: ['eu:barrels', (g) => PROPS_EU.barrels(g, 0, 0)], [T.SIGN]: ['eu:board', (g) => PROPS_EU.board(g, 0, 0)], [T.STATUE]: ['eu:statue', (g) => PROPS_EU.statue(g, 0, 0)] }, { [T.FOUNTAIN]: 2 });
}

// ---------- Silvaneth ----------
const ELF_KIND = { hall: 'consiglio', inn: 'locanda', shop: 'arcieria' };
const LEAF = ['#3a8a4a', '#5aa8a0', '#a86a3a', '#6a9a3a', '#2a7a5a', '#8aa84a'], WOOD = ['#d8bc88', '#e8dcc0', '#c8a878', '#d0c090'];
function silvaneth(S, m, id, r) {
  for (const [role, u, v, w, h] of ELF_BUILDINGS) { const x = (r.x + u) * TS, bottom = (r.y + v + h) * TS, k = ELF_KIND[role], roofH = k === 'consiglio' ? 28 : 30, base = roofH + 5 + 38 + 12, sh = w % 2 === 0 ? 8 : 0; S.hideRect(r.x + u, r.y + v, w, h);
    S.addB(bottom, `elf:${role}:${w}:${u % 6}`, (g) => { if (k) drawElfShop(g, k, w); else if (role === 'deco') drawElfHouse(g, w, { leaf: ['#6a9a3a', '#2a7a5a', '#a86a3a'][(u / 10 | 0) % 3], wood: '#d0c090' }); else drawElfHouse(g, w, { leaf: LEAF[(u * 7) % 6], wood: WOOD[(u * 3) % 4] }); }, x + sh, bottom - base, { town: id, role, fx: r.x + u, fy: r.y + v, fw: w, fh: h }); }
  const glow = paveIndex(S, (g, x, y, s) => PAVE_ELF.glow(g, x, y, s)), boards = paveIndex(S, (g, x, y, s) => PAVE_ELF.boards(g, x, y, s)), stones = paveIndex(S, (g, x, y, s) => PAVE_ELF.stones(g, x, y, s));
  for (let y = r.y - 3; y < r.y + r.h + 3; y++) for (let x = r.x - 3; x < r.x + r.w + 3; x++) { if (!m.inb(x, y)) continue; const i = y * m.w + x, g0 = m.ground[i]; if (g0 === T.WOOD || g0 === T.DOCK) S.pave[i] = boards; else if (g0 === T.COBBLE) S.pave[i] = stones; else if (g0 === T.MAGICGRASS || g0 === T.GRASS) S.pave[i] = glow; }
  // siepe viva con tre aperture (nord e sud con arco, est libera)
  const x0 = r.x - 2, x1 = r.x + r.w + 1, y0 = r.y - 2, y1 = r.y + r.h + 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!(x === x0 || x === x1 || y === y0 || y === y1) || !m.inb(x, y)) continue; const i = y * m.w + x; if (m.obj[i] === T.THICKET || (m.obj[i] && m.obj[i] === T.THICKET)) { S.hide[i] = 1; S.add((y + 1) * TS + 8, 'elf:hedge:' + (x & 1), (g) => drawHedgeWall(g, 0, 0, 1), x * TS - ((x === x0 || x === x1) && y !== y0 && y !== y1 ? 8 : 0), y * TS - 4); } }
  for (const v of [y0, y1]) { const by = (v + 1) * TS + 3; S.add(by + 1, 'elf:gate', (g) => drawElfGate(g, 0, 0), (r.x + 35) * TS - 29, by - 64); }
  props(S, m, r, { [T.ELVENLAMP]: ['elf:lamp', (g) => PROPS_ELF.moonlamp(g, 0, 0)], [T.BENCH]: ['elf:bench', (g) => PROPS_ELF.bench(g, 0, 0)], [T.MUSHROOM]: ['elf:mush', (g) => PROPS_ELF.mushrooms(g, 0, 0)], [T.GIANTTREE]: ['elf:tree', (g) => PROPS_ELF.gianttree(g, 0, 0)] }, {}, 3);
}

// ---------- Longxi ----------
const CN_KIND = { hall: 'sala', inn: 'locanda', shop: 'bottega' };
function longxi(S, m, id, r) {
  CN_BUILDINGS.forEach(([role, u, v, w, h]) => { const x = (r.x + u) * TS, bottom = (r.y + v + h) * TS, k = CN_KIND[role], roofH = k === 'sala' ? 28 : 30, base = roofH + 5 + 38 + 18, sh = w % 2 === 0 ? 8 : 0; S.hideRect(r.x + u, r.y + v, w, h);
    S.addB(bottom, `cn:${role}:${w}:${u % 4}`, (g) => { if (k) drawCnShop(g, k, w); else if (role === 'deco') drawCnHouse(g, w, { roof: ['#2a8a6a', '#7a7a8a', '#2a5a9a'][(u / 10 | 0) % 3], wall: '#f0e0c0' }); else drawCnHouse(g, w, { roof: ['#2a8a6a', '#2a5a9a', '#7a7a8a', '#c89a2a'][(u * 3) % 4] }); }, x + sh, bottom - base, { town: id, role, fx: r.x + u, fy: r.y + v, fw: w, fh: h }); });
  const slab = paveIndex(S, (g, x, y, s) => PAVE_CN.slab(g, x, y, s)), br = paveIndex(S, (g, x, y, s) => PAVE_CN.bridge(g, x, y, s));
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { if (!m.inb(x, y)) continue; const i = y * m.w + x, g0 = m.ground[i]; if (g0 === T.BRIDGE) S.pave[i] = br; else if (g0 === (NEW_SITES.longxi.civ.road || NEW_SITES.longxi.civ.ground)) S.pave[i] = slab; }
  ring(S, m, id, r, {
    face: (g, i) => drawCnWallFace(g, 0, 0, i), top: (g, side) => drawCnWallTop(g, 0, 0, side), tower: (g) => drawCnCornerTower(g, 0, 0), gate: (g) => drawCnGate(g, 0, 0), gateDx: -48, gateDy: -66,
    corners: (x0, y0, x1, y1) => [[x0 - 2, y0 - 2], [x1 - 1, y0 - 2], [x0 - 2, y1 - 1], [x1 - 1, y1 - 1]],
    sideGate: (S2, id2, x, cy) => { for (const vv of [cy - 2, cy + 1]) S2.add((vv + 1) * TS + 60, 'cn:lamp', (g) => PROPS_CN.lanternpost(g, 0, 0), x * TS + 3, (vv + 1) * TS - 36 + 12); },
  });
  props(S, m, r, { [T.LANTERN]: ['cn:lamp', (g) => PROPS_CN.lanternpost(g, 0, 0)], [T.BENCH]: ['cn:bench', (g) => PROPS_CN.bench(g, 0, 0)], [T.SIGN]: ['cn:board', (g) => PROPS_CN.board(g, 0, 0)], [T.WELL]: ['cn:well', (g) => PROPS_CN.well(g, 0, 0)], [T.CART]: ['cn:cart', (g) => PROPS_CN.cart(g, 0, 0)] });
}

// ---------- Domus Imperiale (sprite a blocco unico sulla rupe di Augusta) ----------
function palaceSkin(S, m) {
  const P = m.palace; if (!P || !P.sprite) return;
  const { ox, oy, cx } = P, originX = (cx - 14) * TS, bottomRow = oy + 21, originY = bottomRow * TS - 248;
  for (let y = oy; y < oy + 26; y++) for (let x = cx - 14; x <= cx + 14; x++) if (m.inb(x, y) && m.obj[y * m.w + x] !== T.CLIFF) S.hide[y * m.w + x] = 1;
  void ox;
  S.add(bottomRow * TS + 6, 'palace', (g) => drawPalace(g), originX, originY);
}
