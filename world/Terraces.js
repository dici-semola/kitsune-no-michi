// Livelli in altezza: dove il terreno sale verso monti e altopiani (ma prima di diventare roccia piena) nascono terrazze a uno o due gradini. I bordi hanno una parete
// di scogliera visibile (faccia a sud, lati a est/ovest, dorso a nord) e si sale solo da rampe di scalini, come nei dislivelli dei giochi a tre quarti.
// Vale anche per promontori e scogliere sul mare: l'altopiano che finisce sull'acqua o sulla spiaggia ha la sua parete.
// Le rampe sono garantite: ogni zona alta resta raggiungibile (un controllo di connessione riapre scalini dove serve).
import { T, DEFS } from '../data/tiles.js';
import { BIOME_IDS } from '../data/world.js';
import { hash2, fbm } from '../core/Util.js';
import { TileMap } from '../engine/TileMap.js';

const THR = { mountain: 0.5, snow: 0.56, tundra: 0.58, volcano: 0.54, canyon: 0.6, badlands: 0.64, plateau: 0.72 };
export const CLIFF_BIOME = { mountain: 0, snow: 3, tundra: 3, volcano: 2, canyon: 1, badlands: 1, plateau: 4, desert: 5, dunes: 5, ancient: 6 };
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const ROCKY = new Set(['mountain', 'plateau', 'canyon', 'badlands', 'snow', 'tundra', 'volcano', 'ancient']);
const HILLY = new Set(['meadow', 'forest', 'jade', 'tropical', 'enchanted', 'haunted']);

export function terraces(m) {
  const w = m.w, h = m.h, E = m.elev; if (!E) return null;
  const lvl = new Uint8Array(w * h), protect = new Uint8Array(w * h), n = w * h;
  for (let i = 0; i < n; i++) if (m.safe[i]) protect[i] = 1;
  const guard = (x, y, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (m.inb(x + i, y + j)) protect[(y + j) * w + x + i] = 1; };
  for (const a of Object.values(m.anchors)) guard(a.x, a.y, 3); for (const p of m.portals) guard(p.x, p.y, 3); for (const p of m.props) guard(p.x, p.y, 2);
  const liquid = (i) => { const d = DEFS[m.ground[i]]; return d && d.liquid; };
  const eligible = (i) => { if (protect[i] || liquid(i)) return false; const o = m.obj[i]; return !(o && DEFS[o] && DEFS[o].solid); };
  // 1) quote: nei biomi rocciosi curve di livello dai quantili della quota (3 livelli, anelli concentrici attorno ai picchi e ai crateri); nei biomi dolci colline da rumore
  const per = {}; for (let i = 0; i < n; i++) { const nm = BIOME_IDS[m.zone[i]]; if (ROCKY.has(nm) && eligible(i)) (per[nm] = per[nm] || []).push(E[i]); }
  const Q = {}; for (const [nm, arr] of Object.entries(per)) { const a = Float32Array.from(arr).sort(); const q = (f) => a[Math.min(a.length - 1, Math.floor(a.length * f))]; Q[nm] = [q(0.38), q(0.6), q(0.8)]; }
  const seed = (m.def && m.def.seed) || 7;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, nm = BIOME_IDS[m.zone[i]]; if (!eligible(i)) continue;
    if (Q[nm]) { const e = E[i], q = Q[nm]; lvl[i] = e >= q[2] ? 3 : e >= q[1] ? 2 : e >= q[0] ? 1 : 0; }
    else if (HILLY.has(nm)) { const v = fbm(x * 0.026 + 31, y * 0.026 + 17, seed + 5, 3); lvl[i] = v > 0.74 ? 2 : v > 0.63 ? 1 : 0; }
  }
  // 2) niente salti di quota ai confini fra biomi (sarebbero separazioni finte): in una fascia attorno al confine il terreno scende a quota 0
  const RING = [[7, 0], [-7, 0], [0, 7], [0, -7], [5, 5], [-5, 5], [5, -5], [-5, -5]];
  for (let y = 7; y < h - 7; y++) for (let x = 7; x < w - 7; x++) { const i = y * w + x; if (!lvl[i]) continue; const nm = BIOME_IDS[m.zone[i]]; for (const [dx, dy] of RING) { const nb = BIOME_IDS[m.zone[(y + dy) * w + x + dx]]; if (nb !== nm && !(ROCKY.has(nb) && ROCKY.has(nm))) { lvl[i] = 0; break; } } }
  // 3) filtro di maggioranza 5x5 (due passate) e eliminazione degli altipiani minuscoli
  for (let pass = 0; pass < 2; pass++) { const L2 = Uint8Array.from(lvl); for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) { const i = y * w + x; if (protect[i]) continue; const c = [0, 0, 0, 0]; for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) c[lvl[(y + j) * w + x + k]]++; let b = lvl[i], bc = c[b]; for (let q = 0; q < 4; q++) if (c[q] > bc + 3) { b = q; bc = c[q]; } L2[i] = b; } lvl.set(L2); }
  for (let L = 3; L >= 1; L--) { const seen = new Uint8Array(n); for (let i0 = 0; i0 < n; i0++) { if (seen[i0] || lvl[i0] < L) continue; const q = [i0]; seen[i0] = 1; for (let qi = 0; qi < q.length; qi++) { const i = q[qi], x = i % w, y = (i / w) | 0; for (const [dx, dy] of NB) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= w || Y >= h) continue; const k = Y * w + X; if (!seen[k] && lvl[k] >= L) { seen[k] = 1; q.push(k); } } } if (q.length < 70) for (const i of q) lvl[i] = L - 1; } }
  // 3) pareti di scogliera sul lato più basso di ogni gradino; rampe ogni tanto
  let cliffs = 0, ramps = 0; const cliffCells = [];
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, l = lvl[i]; if (!l) continue;
    for (const [dx, dy] of NB) {
      const j = (y + dy) * w + x + dx; if (lvl[j] >= l || protect[j] || (m.obj[j] && DEFS[m.obj[j]] && DEFS[m.obj[j]].solid)) continue;
      m.obj[j] = T.CLIFF; cliffCells.push(j); cliffs++;
      if (dy === 1 && y + 2 < h) { const k = j + w; if (lvl[k] < l && !protect[k] && !(m.obj[k] && DEFS[m.obj[k]] && DEFS[m.obj[k]].solid)) { m.obj[k] = T.CLIFF; cliffCells.push(k); cliffs++; } }   // parete a due righe: sembra davvero alta
    }
  }
  // spigoli: dove un fianco e una parete (o un dorso) si incontrano in diagonale resta un vuoto; si aggiungono le celle d'angolo (parete a due file a sud, dorso a nord)
  { const okC = (k) => k >= 0 && k < n && m.obj[k] !== T.CLIFF && !protect[k] && !(m.obj[k] && DEFS[m.obj[k]] && DEFS[m.obj[k]].solid), add = (k) => { if (okC(k)) { m.obj[k] = T.CLIFF; cliffCells.push(k); cliffs++; } };
    for (let y = 2; y < h - 3; y++) for (let x = 2; x < w - 2; x++) {
      const i = y * w + x, l = lvl[i]; if (!l) continue;
      for (const dx of [-1, 1]) { const sideC = m.obj[i + dx] === T.CLIFF && lvl[i + dx] < l, faceC = m.obj[i + w] === T.CLIFF && lvl[i + w] < l, backC = m.obj[i - w] === T.CLIFF && lvl[i - w] < l;
        if (sideC && faceC && lvl[i + w + dx] < l) { add(i + w + dx); if (m.obj[i + 2 * w] === T.CLIFF) add(i + 2 * w + dx); }
        if (sideC && backC && lvl[i - w + dx] < l) add(i - w + dx); }
    } }
  const rampCells = new Uint8Array(n), open1 = (j) => { m.obj[j] = 0; m.ground[j] = T.STEPS; rampCells[j] = 1; for (const k of [j + w, j - w]) if (k >= 0 && k < n && m.obj[k] === T.CLIFF && lvl[k] === lvl[j]) { m.obj[k] = 0; m.ground[k] = T.STEPS; rampCells[k] = 1; } };
  const ramp = (j) => { open1(j); ramps++; const e = j + 1; if (e % w !== 0 && m.obj[e] === T.CLIFF && lvl[e] === lvl[j] && !protect[e]) open1(e); };   // la rampa attraversa tutta la parete ed è larga due tile quando c'è spazio   // la rampa attraversa tutta la parete
  const picked = new Set();
  for (const j of cliffCells) { const x = j % w, y = (j / w) | 0; if (hash2(x * 5 + 1, y * 3 + 2, 61) < 0.07 && ![...picked].some((q) => Math.abs((q % w) - x) + Math.abs(((q / w) | 0) - y) < 8)) { picked.add(j); ramp(j); } }
  // 4) connessione: ogni zona percorribile deve essere raggiungibile; dove una zona resta isolata si apre una rampa nella parete che la separa
  const saveB = TileMap.ignoreBarriers; TileMap.ignoreBarriers = true;
  try {
    const s = m.anchors.start || m.anchors.entry || Object.values(m.anchors)[0];
    for (let round = 0; round < 6; round++) {
      const seen = m.floodWalk(s.x, s.y, null), comp = new Int32Array(n).fill(-1); let nc = 0, opened = 0;
      for (let i0 = 0; i0 < n; i0++) {
        if (seen[i0] || comp[i0] >= 0 || !m.passable(i0 % w, (i0 / w) | 0, null) || liquid(i0)) continue;
        const q = [i0]; comp[i0] = nc; let hit = -1;
        for (let qi = 0; qi < q.length; qi++) {
          const i = q[qi], x = i % w, y = (i / w) | 0;
          for (const [dx, dy] of NB) {
            const X = x + dx, Y = y + dy; if (X < 1 || Y < 1 || X >= w - 1 || Y >= h - 1) continue; const j = Y * w + X;
            if (m.obj[j] === T.CLIFF && hit < 0) { for (const [ex, ey] of NB) { const X2 = X + ex, Y2 = Y + ey; if (X2 < 0 || Y2 < 0 || X2 >= w || Y2 >= h) continue; const k = Y2 * w + X2; if (seen[k] && m.passable(X2, Y2, null) && !liquid(k)) { hit = j; break; } } }
            if (!seen[j] && comp[j] < 0 && m.passable(X, Y, null) && !liquid(j)) { comp[j] = nc; q.push(j); }
          }
        }
        nc++; if (hit >= 0 && q.length >= 3) { ramp(hit); opened++; }
      }
      if (!opened) break;
    }
  } finally { TileMap.ignoreBarriers = saveB; }
  m.lvl = lvl; m.rampCells = rampCells; m.terrace = { cliffs, ramps };
  return m.terrace;
}
