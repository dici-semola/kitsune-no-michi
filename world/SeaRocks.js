// Scogli in mare: ammassi di roccia con un anello di acqua bassa e spuma (come le scogliere dei giochi Game Boy). Si posano dopo tutte le altre trasformazioni.
import { T } from '../data/tiles.js';
import { BIOME_IDS } from '../data/world.js';
export function seaRocks(m) {
  let n = 0, tries = 0; const placed = [], idx = (x, y) => y * m.w + x;
  while (n < 110 && tries++ < 6000) {
    const x = 6 + Math.floor(m.rng() * (m.w - 12)), y = 6 + Math.floor(m.rng() * (m.h - 12)), cs = [[0, 0]];
    let ok = true; for (let j = -5; j <= 5 && ok; j++) for (let i = -5; i <= 5; i++) { const xx = x + i, yy = y + j, k = idx(xx, yy); if (BIOME_IDS[m.zone[k]] !== 'ocean' || m.ground[k] !== T.DEEP || m.obj[k] || m.safeAt(xx, yy)) { ok = false; break; } }
    if (!ok || placed.some((q) => Math.hypot(q.x - x, q.y - y) < 9)) continue;
    const size = 1 + Math.floor(m.rng() * 4); for (let c = 1; c < size; c++) cs.push([Math.floor(m.rng() * 3) - 1, Math.floor(m.rng() * 3) - 1]);
    for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) if (cs.some(([a, b]) => Math.hypot(i - a, j - b) < 2.4)) m.setG(x + i, y + j, T.WATER);
    for (const [a, b] of cs) m.setO(x + a, y + b, T.SEAROCK);
    placed.push({ x, y }); n++;
  }
  m.seaRocks = n;
}
