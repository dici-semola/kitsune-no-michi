// Varietà architettonica e urbana, applicata DOPO la generazione e mantenendo disposizione, collisioni e collegamenti:
//  - pavimentazioni diverse per ogni città (terra battuta, ciottoli irregolari, lastre, mosaici, legno, sabbia...) con piazze distinte
//  - arredi urbani (barili, casse, panchine, carretti, bancarelle) ridotti e tenuti dove hanno senso (vicino a negozi, locande, piazze)
//  - monumenti verticali per ogni città (pagode, obelischi, statue, torri, alberi monumentali, totem)
//  - santuari con aspetto legato al territorio, in una radura più isolata
//  - interni: muri nel materiale della città, pareti spesse nei luoghi freddi/sotterranei, focolari, colonne e stendardi nelle sale imperiali, scaffali nei negozi
import { addSacred, SACRED_OF_BIOME } from './Sacred.js';
import { T, DEFS } from '../data/tiles.js';
import { TOWNS, SHRINES } from '../data/world.js';
import { NPCS } from '../data/npcs.js';
import { hash2 } from '../core/Util.js';
import { styleOf } from '../engine/TownStyles.js';
import { shrineSkin } from './Territory.js';
import { box, idx } from './Generators.js';

const H = (x, y, s = 0) => hash2(x * 11 + s, y * 17 + s * 5, 23);

// città -> come cambiano le pavimentazioni (terreno originale -> [principale, accento]) e quale piazza
const PAVING = {
  hinomura: { map: { [T.DIRT]: [T.PAVE_EARTH, T.PAVE_IRR], [T.COBBLE]: [T.PAVE_IRR, T.PAVE_EARTH] }, plaza: T.PAVE_IRR },
  aurelburg: { map: { [T.COBBLE]: [T.PAVE_IRR, T.PAVE_SLAB], [T.DIRT]: [T.PAVE_IRR, T.PAVE_SLAB], [T.STONE]: [T.PAVE_SLAB, T.PAVE_IRR] }, plaza: T.PAVE_MOSAIC },
  longxi: { map: { [T.COBBLE]: [T.PAVE_SLAB, T.PAVE_RED] }, plaza: T.PAVE_RED },
  augusta: { map: { [T.MARBLEFLOOR]: [T.PAVE_SLAB, T.GOLDFLOOR] }, plaza: T.PAVE_MOSAIC },
  silvaneth: { map: { [T.DOCK]: [T.PAVE_WOOD, T.PAVE_WOOD] }, plaza: T.PAVE_WOOD },
  sahar: { map: { [T.SAND]: [T.PAVE_SAND, T.SAND] }, plaza: T.PAVE_SAND },
  portomarea: { map: { [T.COBBLE]: [T.PAVE_IRR, T.PAVE_RED] }, plaza: T.PAVE_RED },
  kuru: { map: { [T.DIRT]: [T.PAVE_EARTH, T.PAVE_EARTH] }, plaza: T.PAVE_EARTH },
  coralia: { map: { [T.DOCK]: [T.PAVE_WOOD, T.PAVE_WOOD] }, plaza: T.PAVE_WOOD },
  khaz_dum: { map: { [T.STONE]: [T.PAVE_IRR, T.PAVE_SLAB] }, plaza: T.PAVE_SLAB },
  nethermere: { map: { [T.STONE]: [T.PAVE_IRR, T.PAVE_IRR] }, plaza: T.PAVE_IRR },
};
// monumenti per città: [tile, dx, dy] rispetto al centro (cx,cy); si posano solo su celle libere e non sulle strade principali
const MONUMENTS = {
  aurelburg: [[T.STATUE_T, -6, -3], [T.STATUE_T, 6, -3], [T.TOWER_T, -14, -8]],
  longxi: [[T.PAGODA_T, -9, -4], [T.PAGODA_T, 9, -4]],
  augusta: [[T.OBELISK, -7, 2], [T.OBELISK, 7, 2], [T.STATUE_T, -3, 6], [T.STATUE_T, 3, 6]],
  silvaneth: [[T.OAKANCIENT, -9, -3], [T.OAKANCIENT, 9, -3], [T.OAKANCIENT, 0, -9]],
  sahar: [[T.OBELISK, -6, -2], [T.OBELISK, 6, -2], [T.PALM36, -9, 3], [T.PALM36, 9, 3]],
  portomarea: [[T.STATUE_T, -7, 3], [T.TOWER_T, 12, -6]],
  kuru: [[T.TOTEM, -5, -2], [T.TOTEM, 5, -2], [T.PALM36, 0, -7]],
  khaz_dum: [[T.TOWER_T, -9, -5], [T.TOWER_T, 9, -5], [T.PINNACLE, 0, -6]],
  nethermere: [[T.PINNACLE, -7, 0], [T.PINNACLE, 7, 0]],
  hinomura: [],
};
const CLUTTER = new Set([T.BARREL, T.CRATE, T.BENCH, T.CART, T.STALL]);

export function civVariety(m) {
  const st = { paved: 0, clutterCut: 0, monuments: 0 };
  for (const [id, T0] of Object.entries(TOWNS)) {
    const A = m.anchors['town_' + id] || { x: T0.x + (T0.w >> 1), y: T0.y + (T0.h >> 1) }, cx = A.x, cy = A.y - 2;
    const pv = PAVING[id], x0 = T0.x - 1, y0 = T0.y - 1, x1 = T0.x + T0.w + 1, y1 = T0.y + T0.h + 1;
    // luoghi dove gli arredi restano: attorno alle porte di locande e negozi
    const keep = Object.entries(m.anchors).filter(([k]) => k.startsWith('door_' + id + '_') && /_(inn|shop)$/.test(k)).map(([, a]) => a);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (!m.inb(x, y)) continue; const i = idx(m, x, y);
      if (pv) { const v = pv.map[m.ground[i]]; if (v) { m.ground[i] = H(x, y, 3) < 0.82 ? v[0] : v[1]; st.paved++; } }
      if (CLUTTER.has(m.obj[i]) && id !== 'hinomura') {   // Hinomura: l'ha già riordinata l'utente a mano
        const near = keep.some((a) => Math.hypot(a.x - x, a.y - y) < 8) || (m.obj[i] === T.BENCH && Math.hypot(cx - x, cy - y) < 9);
        if (!near && H(x, y, 9) < 0.6) { m.obj[i] = 0; st.clutterCut++; }
      }
    }
    // piazza centrale: pavimento distinto
    if (pv) for (let y = cy - 3; y <= cy + 3; y++) for (let x = cx - 5; x <= cx + 5; x++) if (m.inb(x, y) && !DEFS[m.ground[idx(m, x, y)]].liquid && !m.obj[idx(m, x, y)] && (Math.abs(x - cx) + Math.abs(y - cy) < 8)) m.ground[idx(m, x, y)] = pv.plaza;
    for (const [tile, dx, dy] of MONUMENTS[id] || []) { const x = cx + dx, y = cy + dy; if (m.inb(x, y) && !m.obj[idx(m, x, y)] && m.passable(x, y, null) && !DEFS[m.ground[idx(m, x, y)]].liquid) { m.obj[idx(m, x, y)] = tile; st.monuments++; } }
  }
  return st;
}

// i santuari del mondo principale prendono l'aspetto del loro territorio e stanno in una radura più isolata
const SKIN_OF = { forest: 'ivy', enchanted: 'mystic', jade: 'mystic', ancient: 'ruin', haunted: 'ruin', swamp: 'ruin', mountain: 'stone', plateau: 'stone', canyon: 'stone', desert: 'desert', dunes: 'desert', badlands: 'desert', snow: 'ice', tundra: 'ice', volcano: 'volcano', tropical: 'ivy', meadow: 'ivy' };
// Santuari troppo vicini: se ne tiene uno ogni minD tile. Hanno la precedenza quelli degli avamposti (dentro i luoghi abitati), poi quelli dell'elenco SHRINES;
// l'ancora di un santuario eliminato punta al più vicino rimasto (vecchi salvataggi), il segnaposto sulla mappa sparisce.
export function thinShrines(m, minD = 50) {
  const order = new Map(SHRINES.map((s, i) => [s.id, i + 1])), all = m.props.filter((p) => p.type === 'shrine').sort((a, b) => (order.get(a.id) || 0) - (order.get(b.id) || 0));
  const kept = []; let dropped = 0;
  for (const p of all) { if (kept.some((k) => Math.hypot(k.x - p.x, k.y - p.y) < minD)) { dropped++; m.props.splice(m.props.indexOf(p), 1); if (m.pois) m.pois = m.pois.filter((q) => !(q.kind === 'shrine' && Math.abs(q.x - p.x) <= 1 && Math.abs(q.y - p.y) <= 1)); const nn = kept.reduce((b, k) => (Math.hypot(k.x - p.x, k.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? k : b), kept[0]); if (m.anchors['shrine_' + nn.id]) m.anchors['shrine_' + p.id] = { ...m.anchors['shrine_' + nn.id] }; } else kept.push(p); }
  m.shrinesDropped = dropped; return dropped;
}
export function shrineSkins(m) {
  thinShrines(m, 50); let n = 0;
  for (const p of m.props) {
    if (p.type !== 'shrine') continue; const x = p.x, y = p.y, bi = m.biomeAt(x, y), skin = SKIN_OF[bi] || 'ivy', seed = (x * 31 + y) | 0;
    let s = seed; const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    // radura isolata: via gli alberi e gli oggetti nel raggio di 6 (le celle solide vicine al santuario restano per non aprire varchi sulle barriere)
    const r0 = m.realm ? m.realm[idx(m, x, y)] : 0, sameRealm = (X, Y) => !m.realm || [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => m.inb(X + dx, Y + dy) && m.realm[idx(m, X + dx, Y + dy)] === r0);
    for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) { const X = x + i, Y = y + j; if (!m.inb(X, Y) || Math.hypot(i, j) > 6.3 || !sameRealm(X, Y)) continue; const o = m.obj[idx(m, X, Y)]; if (o && DEFS[o].solid && !DEFS[o].barrier && (DEFS[o].tall > 0 || o === T.TREE || o === T.PINE || o === T.PALM)) m.obj[idx(m, X, Y)] = 0; }
    shrineSkin(m, x, y, skin, rng); addSacred(m, x, y, SACRED_OF_BIOME[bi] || 'torii'); n++;
  }
  return n;
}

// Interni: materiali e disposizioni coerenti con la città e con la funzione dell'edificio
const COLD = new Set(['khaz_dum', 'nethermere']);
export function interiorVariety(m, def) {
  const id = m.id, town = id.split('_')[0], t = TOWNS[town], civ = t && t.civ, w = m.w, h = m.h; let n = 0;
  const wall = civ && civ.style && civ.style.wall; const role = (id.match(/_(inn|shop|hall|house)$/) || [])[1] || (/smith|forge/.test(id) ? 'smith' : /inn/.test(id) ? 'inn' : /market|shop|pharma/.test(id) ? 'shop' : '');
  const entry = m.anchors.entry || { x: w >> 1, y: h - 2 }, protectCol = (x, y) => Math.abs(x - entry.x) <= 1 && y >= h - 5;
  const nearPortal = (x, y) => m.portals.some((p) => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1) || m.props.some((p) => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1);
  const freeCell = (x, y) => m.inb(x, y) && !m.obj[idx(m, x, y)] && !protectCol(x, y) && !nearPortal(x, y) && x > 1 && y > 1 && x < w - 2 && y < h - 2;
  if (wall && wall !== T.BUILD) { for (let x = 0; x < w; x++) for (const y of [0, h - 1]) if (m.obj[idx(m, x, y)] === T.BUILD) m.obj[idx(m, x, y)] = wall; for (let y = 0; y < h; y++) for (const x of [0, w - 1]) if (m.obj[idx(m, x, y)] === T.BUILD) m.obj[idx(m, x, y)] = wall; n++; }
  const nearNpc = (x, y) => Object.values(NPCS).some((q) => q.at && q.at.map === id && typeof q.at.x === 'number' && Math.abs(q.at.x - x) <= 1 && Math.abs(q.at.y - y) <= 1);
  if (COLD.has(town)) { // parete di fondo spessa (due file di roccia) e pilastri agli angoli: i corridoi laterali e la riga d'ingresso restano liberi
    for (let x = 2; x < w - 2; x++) if (m.inb(x, 2) && !m.obj[idx(m, x, 2)] && !nearPortal(x, 2) && !nearNpc(x, 2) && Math.abs(x - entry.x) > 1) m.obj[idx(m, x, 2)] = T.DWARFWALL;
    n++;
  }
  const put = (x, y, o) => { if (freeCell(x, y)) { m.obj[idx(m, x, y)] = o; n++; } };
  if (role === 'inn' && COLD.has(town)) { put((w >> 1) - 1, 2, T.FORGE); put((w >> 1) + 1, 2, T.FORGE); }          // focolare per il freddo
  if (role === 'shop' && !COLD.has(town)) for (let x = 3; x < w - 3; x++) if (!nearNpc(x, 2)) put(x, 2, T.SHELF);   // scaffali sul fondo, mai sui corridoi laterali
  if (role === 'hall' && (town === 'augusta' || civ && civ.title && /imperial/i.test(civ.title))) { for (const x of [3, w - 4]) for (const y of [3, h - 5]) put(x, y, T.PCOLUMN); put(2, 2, T.IMPBANNER); put(w - 3, 2, T.IMPBANNER); }
  if (role === 'hall' && town !== 'augusta') { put(2, 2, T.BANNER); put(w - 3, 2, T.BANNER); }
  if (role === 'house' && civ) { if (COLD.has(town) || town === 'kuru' || town === 'coralia') { put(2, 2, T.BARREL); put(w - 3, 3, T.CRATE); } else put(w - 3, 2, T.FLOWERS); }  // case semplici o più ricche in base al luogo
  if (role === 'smith') { put(w - 3, 2, T.FORGE); put(w - 5, 2, T.WORKBENCH); put(2, 2, T.BARREL); put(3, 2, T.BARREL); }
  if (role === 'inn' && town === 'portomarea') { put(2, 3, T.BARREL); put(3, 3, T.BARREL); put(w - 3, 3, T.CRATE); }
  // arredi più ricchi (tutti di bordo o non bloccanti: nessun corridoio si chiude): tappeto centrale, piante, lanterne e arazzi lungo il fondo
  if (w >= 9 && h >= 7 && ['inn', 'hall', 'house', 'shop', 'smith'].includes(role)) {
    const cx = w >> 1, cy = (h >> 1) + 1;
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 2; x <= cx + 2; x++) if (m.inb(x, y) && !m.obj[idx(m, x, y)] && !nearPortal(x, y)) { m.setG(x, y, T.RUG); n++; }
    for (const [x, y] of [[2, h - 3], [w - 3, h - 3]]) if (!nearNpc(x, y)) put(x, y, T.FLOWERS);
    for (const x of [4, w - 5]) if (!nearNpc(x, 2)) put(x, 2, role === 'smith' ? T.TORCH ?? T.LANTERN : T.LANTERN);
    if (role === 'hall' || role === 'inn') for (const x of [6, w - 7]) if (!nearNpc(x, 2) && w >= 13) put(x, 2, T.BANNER);
  }
  n += interiorShape(m, id, w, h, entry, wall || T.BUILD);
  m.variety = n; void box;
  return n;
}

// Tetti: ogni edificio (componente connessa di celle-tetto) riceve un tetto di una famiglia di varianti scelta dalla sua posizione. Stessa solidità, stesso ingombro.
export function roofVariety(m) {
  const fam = { [T.ROOF]: [T.ROOF, T.ROOF_BLUE, T.ROOF_GREEN, T.ROOF_SLATE], [T.TILEROOF]: [T.TILEROOF, T.ROOF_THATCH, T.ROOF_PURPLE, T.ROOF_SLATE], [T.ROOFEU]: [T.ROOFEU, T.ROOF_SLATE, T.ROOF, T.ROOF_GREEN], [T.ROOFCN]: [T.ROOFCN, T.ROOF_GOLD, T.ROOF_BLUE, T.ROOF_PURPLE] };
  const w = m.w, h = m.h, seen = new Uint8Array(w * h); let n = 0;
  for (let i0 = 0; i0 < w * h; i0++) {
    const base = m.obj[i0]; if (seen[i0] || !fam[base] || m.safe[i0] === 0) continue;
    const comp = [i0]; seen[i0] = 1; let minI = i0;
    for (let q = 0; q < comp.length; q++) { const i = comp[q], x = i % w, y = (i / w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!seen[j] && m.obj[j] === base) { seen[j] = 1; comp.push(j); if (j < minI) minI = j; } } }
    if (comp.length > 120) continue;   // non un edificio: lascia stare
    const list = fam[base], pick = list[Math.floor(hash2(minI % w, (minI / w) | 0, 41) * list.length) % list.length];
    if (pick !== base) { for (const i of comp) m.obj[i] = pick; n++; }
    // identità della città: palette del tetto e dei muri sottostanti, forma delle finestre (un edificio = un insieme coerente)
    const mx = minI % w, my = (minI / w) | 0, town = Object.entries(TOWNS).find(([, t]) => mx >= t.x - 2 && mx <= t.x + t.w + 2 && my >= t.y - 2 && my <= t.y + t.h + 2);
    if (town) {
      if (!m.rp) { m.rp = new Uint8Array(w * h); m.wp = new Uint8Array(w * h); m.ws = new Uint8Array(w * h); m.rs = new Uint8Array(w * h); m.wm = new Uint8Array(w * h); }
      const sty = styleOf(town[0], hash2(mx * 3 + 5, my * 7 + 1, 83)); for (const i of comp) { m.rp[i] = sty.roof; m.rs[i] = sty.rs; }
      for (const i of comp) { const x = i % w, y0 = (i / w) | 0; for (let dy = 1; dy <= 4; dy++) { const j = (y0 + dy) * w + x; if (y0 + dy >= h) break; const od = DEFS[m.obj[j]]; if (!od || !od.palwall) break; m.wp[j] = sty.wall; m.ws[j] = sty.ws; m.wm[j] = sty.wm; } }
    }
  }
  m.roofs = n; return n;
}

// Facciate: ogni porta di una città riceve un dettaglio scelto dalla funzione dell'edificio (insegna, noren, tenda a righe, lanterne, fioriere, bandiere, edera)
// e in molti casi un camino con il fumo sul tetto. Sono decorazioni senza collisione: il passaggio non cambia.
export function facadeVariety(m) {
  const ROLE = { inn: ['lanterns', 'sign_inn', 'noren', 'flowers'], shop: ['awning', 'sign_shop', 'flowers', 'noren'], smith: ['sign_smith', 'banners_blue', 'lanterns'], hall: ['banners_gold', 'banners_blue', 'lanterns', 'sign_hall'], house: ['flowers', 'ivy', 'noren', 'lanterns', 'awning', 'sign_house'] };
  const roofIds = new Set([T.ROOF, T.ROOFEU, T.ROOFCN, T.TILEROOF, T.ROOF_BLUE, T.ROOF_GREEN, T.ROOF_SLATE, T.ROOF_THATCH, T.ROOF_GOLD, T.ROOF_PURPLE]);
  const kinds = new Set(); let n = 0, ch = 0; const used = [];
  for (const p of m.portals) {
    if (!m.inb(p.x, p.y) || !m.safe[idx(m, p.x, p.y)] || typeof p.to !== 'string') continue;
    if (used.some((u) => Math.abs(u[0] - p.x) < 3 && Math.abs(u[1] - p.y) < 2)) continue; used.push([p.x, p.y]);
    const mid = p.to, role = (mid.match(/_(inn|shop|hall|house)$/) || [])[1] || (/smith|forge|fucina/.test(mid) ? 'smith' : /inn|locanda/.test(mid) ? 'inn' : /market|shop|pharma|stall/.test(mid) ? 'shop' : 'house');
    const list = ROLE[role] || ROLE.house, h = hash2(p.x * 3 + 1, p.y * 5 + 2, 77), pick = list[Math.floor(h * list.length) % list.length];
    const col = Math.floor(hash2(p.x, p.y, 91) * 6), kind = /^(noren|awning)/.test(pick) ? pick.replace(/\d*$/, '') + '_' + col : pick === 'flowers' ? 'flowers_' + (col % 3) : pick;
    m.props.push({ type: 'deco', id: `fac_${p.x}_${p.y}`, sprite: kind, x: p.x, y: p.y, solid: false }); kinds.add(kind.replace(/_\d+$/, '')); n++;
    { const gi = idx(m, p.x, p.y + 1); if (m.inb(p.x, p.y + 1) && !m.obj[gi] && !DEFS[m.ground[gi]].liquid) m.ground[gi] = T.STEPS; }   // gradino rialzato davanti alla porta
    if (role !== 'shop' && hash2(p.x, p.y, 13) < 0.65) {   // camino sul tetto sopra la porta
      for (let dy = 1; dy <= 9; dy++) { const o = m.obj[idx(m, p.x + 1, p.y - dy)]; if (roofIds.has(o) && !roofIds.has(m.obj[idx(m, p.x + 1, p.y - dy - 1)])) { m.props.push({ type: 'deco', id: `chim_${p.x}_${p.y}`, sprite: 'chimney', x: p.x + 1, y: p.y - dy, solid: false }); ch++; break; } }
    }
  }
  m.facades = n; m.chimneys = ch; m.facadeKinds = [...kinds]; return n;
}

// Monumento unico di ogni città: piantato nei pressi della piazza, su una cella libera e raggiungibile, con collisione solo alla base.
import { LANDMARK_OF } from '../engine/LandmarkSprites.js';
export function townLandmarks(m) {
  const w = m.w, out = []; const used = Object.keys(m.anchors).filter((k) => /^travel_/.test(k)).map((k) => m.anchors[k]);
  for (const [town, sprite] of Object.entries(LANDMARK_OF)) {
    const A = m.anchors['town_' + town]; if (!A) continue; let best = null, bs = 1e9;
    for (let y = A.y - 14; y <= A.y + 14; y++) for (let x = A.x - 14; x <= A.x + 14; x++) {
      if (!m.inb(x, y) || !m.inb(x + 1, y + 1) || !m.inb(x - 1, y)) continue; const d = Math.hypot(x - A.x, y - A.y); if (d < 4 || d > 12) continue;
      let ok = true; for (let j = -1; j <= 1 && ok; j++) for (let i = -1; i <= 1; i++) { const k = idx(m, x + i, y + j); if (m.obj[k] || !m.passable(x + i, y + j, null) || DEFS[m.ground[k]].liquid) { ok = false; break; } }
      if (!ok || used.some((u) => Math.hypot(u.x - x, u.y - y) < 4) || m.portals.some((p) => Math.hypot(p.x - x, p.y - y) < 3) || m.props.some((p) => Math.hypot(p.x - x, p.y - y) < 2)) continue;
      const sc = Math.abs(d - 7) + (m.safe[idx(m, x, y)] ? 0 : 6); if (sc < bs) { bs = sc; best = [x, y]; }
    }
    if (!best) continue; const [x, y] = best; used.push({ x, y });
    if (sprite === 'triumph_arch') { m.props.push({ type: 'deco', id: 'land_' + town, sprite, x, y, solid: false }, { type: 'deco', id: 'land_' + town + '_a', sprite: 'hit', x: x - 2, y }, { type: 'deco', id: 'land_' + town + '_b', sprite: 'hit', x: x + 1, y }); }
    else m.props.push({ type: 'deco', id: 'land_' + town, sprite, x, y, w: 22, h: 10 });
    out.push(town);
  }
  m.landmarks = out; return out.length;
}

// Forme diverse: non tutti gli interni sono rettangoli. Secondo l'edificio un angolo viene murato (pianta a L), oppure c'è una nicchia sul fondo, un tramezzo con
// passaggio, o una fila di colonne. Si prova la forma e la si tiene solo se ogni PNG, oggetto, scala e uscita resta raggiungibile (altrimenti si torna indietro).
export function interiorShape(m, id, w, h, entry, wallT) {
  const hs = hash2(id.length * 17 + id.charCodeAt(id.length - 1), id.charCodeAt(0) * 3 + 5, 97), kind = hs < 0.2 ? 'rect' : hs < 0.45 ? 'L' : hs < 0.62 ? 'nicchia' : hs < 0.8 ? 'tramezzo' : 'colonne';
  m.shape = 'rect'; if (kind === 'rect' || w < 10 || h < 8 || id === 'int_smith') return 0;   // la Fucina resta rettangolare: è la mappa di prova dell'editor
  const saved = []; const set = (x, y, o) => { if (!m.inb(x, y)) return; const i = idx(m, x, y); saved.push([i, m.obj[i], m.ground[i]]); m.obj[i] = o; };
  const npcs = Object.values(NPCS).filter((q) => q.at && q.at.map === id && typeof q.at.x === 'number'), occupied = (x, y) => npcs.some((q) => Math.abs(q.at.x - x) <= 1 && Math.abs(q.at.y - y) <= 1) || m.portals.some((p) => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1) || m.props.some((p) => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1) || Math.abs(x - entry.x) <= 1 && y >= h - 4;
  const left = hash2(id.length, 9, 3) < 0.5, cw = Math.max(3, Math.floor(w * 0.28)), ch = Math.max(3, Math.floor(h * 0.4));
  if (kind === 'L') { const x0 = left ? 0 : w - cw, y0 = 0; for (let y = y0; y < y0 + ch; y++) for (let x = x0; x < x0 + cw; x++) if (occupied(x, y) && !(x === 0 || y === 0 || x === w - 1)) { saved.length = 0; return 0; } for (let y = y0; y < y0 + ch; y++) for (let x = x0; x < x0 + cw; x++) set(x, y, wallT); }
  else if (kind === 'nicchia') { const cx = w >> 1; for (let x = 1; x < w - 1; x++) { if (x >= cx - 2 && x <= cx + 2) continue; if (!occupied(x, 3) && !m.obj[idx(m, x, 3)]) set(x, 3, wallT); } for (const x of [cx - 3, cx + 3]) if (!occupied(x, 2)) set(x, 2, T.PILLAR); }
  else if (kind === 'tramezzo') { const px = left ? Math.floor(w * 0.35) : Math.ceil(w * 0.65), gy = h - 6; for (let y = 1; y < h - 3; y++) { if (y >= gy - 1 && y <= gy + 1) continue; if (!occupied(px, y) && !m.obj[idx(m, px, y)]) set(px, y, wallT); } }
  else { for (const x of [Math.floor(w * 0.25), Math.floor(w * 0.5), Math.floor(w * 0.75)]) { const y = Math.floor(h * 0.45); if (!occupied(x, y) && !m.obj[idx(m, x, y)] && Math.abs(x - entry.x) > 1) set(x, y, T.PILLAR); } }
  if (!saved.length) return 0;
  // verifica di raggiungibilità: ogni PNG, oggetto, uscita e scala deve restare raggiungibile dall'ingresso
  const seen = m.floodWalk(entry.x, entry.y, null), near = (x, y) => seen[y * w + x] || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => m.inb(x + dx, y + dy) && seen[(y + dy) * w + x + dx]);
  const need = [...npcs.map((q) => [q.at.x, q.at.y]), ...m.props.map((p) => [p.x, p.y]), ...m.portals.map((p) => [p.x, p.y])];
  if (need.some(([x, y]) => m.inb(x, y) && !near(x, y))) { for (let k = saved.length - 1; k >= 0; k--) { const [i, o, g] = saved[k]; m.obj[i] = o; m.ground[i] = g; } return 0; }
  m.shape = kind; return saved.length;
}
