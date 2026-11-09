// Varietà architettonica e urbana, applicata DOPO la generazione e mantenendo disposizione, collisioni e collegamenti:
//  - pavimentazioni diverse per ogni città (terra battuta, ciottoli irregolari, lastre, mosaici, legno, sabbia...) con piazze distinte
//  - arredi urbani (barili, casse, panchine, carretti, bancarelle) ridotti e tenuti dove hanno senso (vicino a negozi, locande, piazze)
//  - monumenti verticali per ogni città (pagode, obelischi, statue, torri, alberi monumentali, totem)
//  - santuari con aspetto legato al territorio, in una radura più isolata
//  - interni: muri nel materiale della città, pareti spesse nei luoghi freddi/sotterranei, focolari, colonne e stendardi nelle sale imperiali, scaffali nei negozi
import { T, DEFS } from '../data/tiles.js';
import { TOWNS } from '../data/world.js';
import { NPCS } from '../data/npcs.js';
import { hash2 } from '../core/Util.js';
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
export function shrineSkins(m) {
  let n = 0;
  for (const p of m.props) {
    if (p.type !== 'shrine') continue; const x = p.x, y = p.y, bi = m.biomeAt(x, y), skin = SKIN_OF[bi] || 'ivy', seed = (x * 31 + y) | 0;
    let s = seed; const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    // radura isolata: via gli alberi e gli oggetti nel raggio di 6 (le celle solide vicine al santuario restano per non aprire varchi sulle barriere)
    const r0 = m.realm ? m.realm[idx(m, x, y)] : 0, sameRealm = (X, Y) => !m.realm || [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => m.inb(X + dx, Y + dy) && m.realm[idx(m, X + dx, Y + dy)] === r0);
    for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) { const X = x + i, Y = y + j; if (!m.inb(X, Y) || Math.hypot(i, j) > 6.3 || !sameRealm(X, Y)) continue; const o = m.obj[idx(m, X, Y)]; if (o && DEFS[o].solid && !DEFS[o].barrier && (DEFS[o].tall > 0 || o === T.TREE || o === T.PINE || o === T.PALM)) m.obj[idx(m, X, Y)] = 0; }
    shrineSkin(m, x, y, skin, rng); n++;
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
  m.variety = n; void box;
  return n;
}
