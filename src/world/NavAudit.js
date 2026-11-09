// Controllo di navigabilità di una mappa: cosa è raggiungibile a piedi dall'ingresso, cosa no, dove i nemici/PNG/boss/portali rimarrebbero bloccati.
// Usa la stessa passable() del gioco (quindi alberi, rocce, acqua profonda, barriere e fisica forzata dell'editor).
import { DEFS } from '../data/tiles.js';
import { TileMap } from '../engine/TileMap.js';
import { TS } from '../core/Util.js';

const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
// la cella o una delle 4 adiacenti è raggiungibile (porte, cartelli e PNG si usano da vicino)
const near = (m, seen, x, y) => seen[y * m.w + x] || NB.some(([dx, dy]) => m.inb(x + dx, y + dy) && seen[(y + dy) * m.w + x + dx]);

export function entryOf(m) { return m.anchors.start || m.anchors.entry || Object.values(m.anchors)[0] || { x: m.w >> 1, y: m.h >> 1 }; }

// ctx.openBarriers: considera aperte le barriere di progressione (connettività finale del mondo)
export function audit(m, { npcs = [], openBarriers = true, mover = null } = {}) {
  const save = TileMap.ignoreBarriers, saveR = new Set(TileMap.openRealms);
  TileMap.ignoreBarriers = !!openBarriers;
  try {
    const s = entryOf(m), seen = m.floodWalk(s.x, s.y, mover);
    const R = { size: m.w * m.h, start: s, walkable: 0, reach: 0, unreachable: [], problems: [] };
    for (let i = 0; i < m.w * m.h; i++) if (m.passable(i % m.w, (i / m.w) | 0, mover)) { R.walkable++; if (seen[i]) R.reach++; }
    const chk = (kind, label, x, y) => { if (!m.inb(x, y)) { R.problems.push(`${kind} ${label} fuori mappa`); return; } if (!near(m, seen, x, y)) R.unreachable.push({ kind, label, x, y }); };
    for (const p of m.portals) chk('portale', p.to, p.x, p.y);
    for (const p of m.props) chk('oggetto', p.id || p.type, p.x, p.y);
    for (const n of npcs) chk('png', n.id, n.x, n.y);
    for (const [k, a] of Object.entries(m.anchors)) if (/^(shrine|door|town)_/.test(k) || k === 'boss') chk('ancora', k, a.x, a.y);
    if (m.boss) chk('boss', m.boss.id, m.boss.x, m.boss.y);
    // punti di comparsa nemici terrestri: devono poter raggiungere la parte camminabile principale
    let deadSpawns = 0; R.spawns = m.spawns.length;
    for (const sp of m.spawns) { if (sp.aquatic) continue; if (!near(m, seen, sp.x, sp.y)) { deadSpawns++; if (R.unreachable.length < 400) R.unreachable.push({ kind: 'spawn', label: sp.table, x: sp.x, y: sp.y }); } }
    R.deadSpawns = deadSpawns;
    // isolotti camminabili grandi (non raggiungibili): possibili aree "chiuse"
    R.seen = seen;
    return R;
  } finally { TileMap.ignoreBarriers = save; TileMap.openRealms = saveR; }
}

// Una cella in cui un NPC/oggetto è posato dev'essere percorribile (o sul bordo di una cella percorribile)
export function blockedAnchors(m) {
  const out = [];
  for (const [k, a] of Object.entries(m.anchors)) if (/^(shrine|door|town|entry|start)/.test(k) && m.inb(a.x, a.y) && !m.passable(a.x, a.y, null)) out.push({ k, x: a.x, y: a.y });
  return out;
}

// Prova di movimento reale: un rettangolo grande come il giocatore (10x8) attraversa il centro della cella.
export function bodyFits(m, x, y, mover = null, w = 10, h = 8) { return !m.blockedRect({ x: x * TS + 3, y: y * TS + 6, w, h }, mover); }
export { DEFS };
