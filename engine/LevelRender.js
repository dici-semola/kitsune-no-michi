// RENDERING DEI LIVELLI IN ALTEZZA NEL GIOCO: applica le skin di LevelSkins.js alla mappa a livelli (m.lvl): superficie dei piani, pareti a 2 file con spigoli, fianchi, dorsi e scale/rampe.
// Le collisioni non cambiano (restano quelle dei tile CLIFF/STEPS): qui si decide solo come si disegnano. I pezzi da 16x16 sono cotti una volta e messi in cache.
import { T } from '../data/tiles.js';
import { BIOME_IDS } from '../data/world.js';
import { SPECS, topPiece, facePiece, sidePiece, backPiece, stairsPiece } from './LevelSkins.js';

const S = 16;
const NATURAL = new Set([T.GRASS, T.SAND, T.SNOW, T.CANYON, T.ASH, T.JUNGLE, T.MAGICGRASS, T.DEADGRASS, T.SWAMP, T.STONE, T.TIMEFLOOR].filter((x) => x !== undefined));
const CACHE = new Map();
function bake(key, fn) {
  let c = CACHE.get(key); if (c) return c;
  c = document.createElement('canvas'); c.width = S; c.height = S; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); CACHE.set(key, c); return c;
}
const LV = new WeakMap();
export function getLevels(m) {
  if (!m || !m.lvl) return null;
  let r = LV.get(m); if (r) return r;
  const w = m.w, L = m.lvl, at = (x, y) => (m.inb(x, y) ? L[y * w + x] : 0), isC = (x, y) => m.inb(x, y) && m.obj[y * w + x] === T.CLIFF;
  const specAt = (x, y) => SPECS[BIOME_IDS[m.zone[Math.max(0, Math.min(m.h - 1, y)) * w + Math.max(0, Math.min(w - 1, x))]]] || SPECS.meadow;
  const key = (sp) => sp.n;
  const faceRow0 = (x, y) => isC(x, y) && at(x, y - 1) > at(x, y);
  r = {
    // superficie dell'altopiano: solo sui terreni naturali (strade, pavimenti e città mantengono il proprio disegno)
    top(tx, ty) {
      const i = ty * w + tx, l = L[i]; if (!l || !NATURAL.has(m.ground[i]) || m.safe[i]) return null;
      const sp = specAt(tx, ty), e = (at(tx, ty - 1) < l ? 1 : 0) | (at(tx, ty + 1) < l ? 2 : 0) | (at(tx + 1, ty) < l ? 4 : 0) | (at(tx - 1, ty) < l ? 8 : 0);
      return bake(`t:${key(sp)}:${tx & 7}:${ty & 7}:${e}:${l}`, (g) => { topPiece(g, sp, 0, 0, (tx & 7) * S, (ty & 7) * S, e); if (l > 1) { g.fillStyle = `rgba(255,248,224,${0.05 * (l - 1)})`; g.fillRect(0, 0, S, S); } });
    },
    // pezzi di parete, fianchi e dorsi sulle celle CLIFF
    cliff(tx, ty) {
      const i = ty * w + tx, me = L[i], N = at(tx, ty - 1) > me, B = at(tx, ty + 1) > me, E = at(tx + 1, ty) > me, W = at(tx - 1, ty) > me, upC = isC(tx, ty - 1), downC = isC(tx, ty + 1), X = (tx & 7) * S;
      if (!N && !E && !W && !B) {   // celle d'angolo (spigoli esterni del piano)
        const fE = faceRow0(tx + 1, ty), fW = faceRow0(tx - 1, ty);
        if (fE || fW) { const sp = specAt(fE ? tx + 1 : tx - 1, ty - 2), rows = downC ? 2 : 1, cap = fE ? 1 : 2; return bake(`f:${key(sp)}:${tx & 7}:0:${rows}:${cap}`, (g) => facePiece(g, sp, 0, 0, X, 0, rows, cap)); }
        if (upC) { const e1 = faceRow0(tx + 1, ty - 1), w1 = faceRow0(tx - 1, ty - 1), sp = specAt(tx + (e1 ? 1 : -1), ty - 3); if (e1 || w1) return bake(`f:${key(sp)}:${tx & 7}:1:2:${e1 ? 1 : 2}`, (g) => facePiece(g, sp, 0, 0, X, 1, 2, e1 ? 1 : 2)); }
        if (isC(tx, ty + 1) || isC(tx + 1, ty) || isC(tx - 1, ty)) { const sp = specAt(tx, ty + 2); return bake(`b:${key(sp)}:${tx & 7}`, (g) => backPiece(g, sp, 0, 0, X)); }
      }
      if (N || (!E && !W && !B && upC)) {   // parete (faccia sud del piano)
        const row = N ? 0 : 1, y0 = ty - row, sp = specAt(tx, y0 - 1), rows = (row === 1 || downC) ? 2 : 1;
        const cap = (!faceRow0(tx - 1, y0) ? 1 : 0) | (!faceRow0(tx + 1, y0) ? 2 : 0);
        return bake(`f:${key(sp)}:${tx & 7}:${row}:${rows}:${cap}`, (g) => facePiece(g, sp, 0, 0, X, row, rows, cap));
      }
      if (E || W) { const sp = specAt(E ? tx + 1 : tx - 1, ty), dir = E ? 'W' : 'E', last = !isC(tx, ty + 1) && !(at(tx, ty + 1) > me); return bake(`s:${key(sp)}:${dir}:${ty & 3}:${last ? 1 : 0}`, (g) => sidePiece(g, sp, 0, 0, X, (ty & 3) * S, dir, last)); }
      if (B) { const sp = specAt(tx, ty + 1); return bake(`b:${key(sp)}:${tx & 7}`, (g) => backPiece(g, sp, 0, 0, X)); }
      return null;
    },
    // scale e rampe tra un piano e quello inferiore
    stairs(tx, ty) {
      const i = ty * w + tx; if (!m.rampCells || !m.rampCells[i]) return null;
      const up = m.rampCells[i - w] ? 1 : 0, down = m.rampCells[i + w] ? 1 : 0, up2 = m.rampCells[i - 2 * w] ? 1 : 0, down2 = m.rampCells[i + 2 * w] ? 1 : 0;
      let row = 0, rows = 1;   // lunghezza della scalinata: 1, 2 o 3+ file (le centrali non hanno la base in ombra)
      if (up && down) { row = 1; rows = 3; } else if (!up && down) { row = 0; rows = down2 ? 3 : 2; } else if (up && !down) { row = up2 ? 2 : 1; rows = up2 ? 3 : 2; }
      let y0 = ty - row; const sp = specAt(tx, y0 - 1), X = (tx & 7) * S;
      return bake(`st:${key(sp)}:${tx & 7}:${row}:${rows}`, (g) => stairsPiece(g, sp, 0, 0, X, row, rows));
    },
  };
  LV.set(m, r); return r;
}
