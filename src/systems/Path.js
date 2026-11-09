// Ricerca di percorso a tile (BFS a 4 vicini) usata da nemici e boss quando l'inseguimento in linea retta si blocca dietro un ostacolo.
// Usa la stessa passable() del gioco, quindi rispetta alberi, rocce, acqua profonda, fisica forzata e le capacità di chi si muove (volo, nuoto...).
const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
export function findPath(m, sx, sy, gx, gy, mover, maxNodes = 2500) {
  if (!m.inb(sx, sy) || !m.inb(gx, gy)) return null;
  const w = m.w, start = sy * w + sx, goal = gy * w + gx, prev = new Map([[start, -1]]), q = [start];
  let found = start === goal;
  // se la cella obiettivo è bloccata (giocatore contro un muro) si accetta una cella adiacente raggiungibile
  const near = (i) => { const x = i % w, y = (i / w) | 0; return Math.abs(x - gx) + Math.abs(y - gy) <= 1; };
  for (let h = 0; h < q.length && q.length < maxNodes && !found; h++) {
    const c = q[h], x = c % w, y = (c / w) | 0;
    for (const [dx, dy] of NB) {
      const nx = x + dx, ny = y + dy; if (!m.inb(nx, ny)) continue; const ni = ny * w + nx;
      if (prev.has(ni) || !m.passable(nx, ny, mover)) continue;
      prev.set(ni, c); q.push(ni); if (ni === goal || near(ni)) { found = true; prev.set(-2, ni); break; }
    }
  }
  if (!found) return null;
  let cur = prev.has(-2) ? prev.get(-2) : goal; const out = [];
  while (cur !== -1 && cur !== undefined) { out.push({ x: cur % w, y: (cur / w) | 0 }); cur = prev.get(cur); }
  return out.reverse();
}
