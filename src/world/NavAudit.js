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

// Riparazione di raggiungibilità (dopo le patch dell'editor): ogni forziere raggiungibile solo "dall'interno della roccia" riceve un sentiero stretto
// (1 tile, scavato nella roccia fino alla più vicina zona percorribile; sull'acqua una banchina, sulla lava una passerella di pietra); i raccoglibili irraggiungibili vengono tolti. Esenti: i luoghi pensati
// per essere raggiunti diversamente (isolotto del faro morto: a nuoto o col delfino).
export function repairReach(m, { skip = ['faro_morto'] } = {}) {
  const w = m.w, h = m.h, s = entryOf(m), res = { carved: [], removed: [] }, saveB = TileMap.ignoreBarriers;
  TileMap.ignoreBarriers = true;   // le barriere di progressione sono volute: si ripara solo ciò che resta chiuso anche a barriere aperte
  try { return repairInner(m, skip, w, h, s, res); } finally { TileMap.ignoreBarriers = saveB; }
}
function repairInner(m, skip, w, h, s, res) {
  let seen = m.floodWalk(s.x, s.y, null);
  const nearSeen = (x, y) => near(m, seen, x, y);
  for (const p of m.props.slice()) {
    if (p.type !== 'chest' && p.type !== 'item') continue;
    if (!m.inb(p.x, p.y) || nearSeen(p.x, p.y) || skip.includes(p.id)) continue;
    if (p.type === 'item') { m.props.splice(m.props.indexOf(p), 1); res.removed.push(p.id); continue; }
    // ricerca in ampiezza (4 direzioni) attraverso roccia, alberi e terra; mai acqua, lava, città o ancore
    const prev = new Int32Array(w * h).fill(-2), q = [p.y * w + p.x]; prev[q[0]] = -1; let hit = -1;
    for (let qi = 0; qi < q.length && hit < 0 && qi < 250000; qi++) {
      const i = q[qi], x = i % w, y = (i / w) | 0;
      for (const [dx, dy] of NB) {
        const nx = x + dx, ny = y + dy; if (nx < 2 || ny < 2 || nx >= w - 2 || ny >= h - 2) continue; const j = ny * w + nx; if (prev[j] !== -2) continue;
        if (m.safe[j]) continue;
        prev[j] = i; if (seen[j] && m.passable(nx, ny, null)) { hit = j; break; } q.push(j);
      }
    }
    if (hit < 0) { res.removed.push('IMPOSSIBILE:' + p.id); continue; }
    for (let i = prev[hit]; i >= 0; i = prev[i]) { const x = i % w, y = (i / w) | 0; m.setO(x, y, 0); const gd = DEFS[m.ground[i]]; if (gd.liquid) m.setG(x, y, m.ground[i] === 8 ? 6 : 63); else if (gd.solid) m.setG(x, y, 6); }   // lava -> pietra, acqua -> ponte (63 = banchina), roccia -> pietra
    res.carved.push(p.id); seen = m.floodWalk(s.x, s.y, null);
  }
  return res;
}
