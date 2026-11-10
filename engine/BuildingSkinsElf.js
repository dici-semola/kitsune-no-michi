// SILVANETH (città degli elfi nella foresta): edifici monoblocco di legno vivo e foglie, tetti a cupola di foglie, finestre tonde, porte ad arco, liane e lanterne.
import { R, lite, dark, mix, OUT } from './BuildingSkins.js';
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const MT = 12;
function disc(g, cx, cy, r, c) { for (let y = -r; y <= r; y++) { const hw = Math.round(Math.sqrt(r * r - y * y)); R(g, c, cx - hw, cy + y, hw * 2 + 1, 1); } }
function roundWin(g, cx, cy, o) { disc(g, cx, cy, 8, OUT); disc(g, cx, cy, 7, o.ring || '#8a5a34'); disc(g, cx, cy, 5, '#9ae0d8'); R(g, '#d8fff4', cx - 3, cy - 4, 4, 2); R(g, o.ring || '#8a5a34', cx - 5, cy, 11, 1); R(g, o.ring || '#8a5a34', cx, cy - 5, 1, 11); R(g, '#3a8a40', cx - 8, cy + 6, 4, 2); R(g, '#e8a0d0', cx - 7, cy + 5, 2, 2); R(g, '#3a8a40', cx + 5, cy + 5, 4, 2); R(g, '#f0e060', cx + 6, cy + 4, 2, 2); }
function archDoor(g, cx, base, c, vine) { const dh = 28, dy = base - 6 - dh; R(g, OUT, cx - 9, dy - 1, 18, dh + 1); R(g, '#d8c8a0', cx - 8, dy, 16, dh); for (let i = 0; i < 6; i++) { const hw = Math.round(Math.sqrt(36 - (6 - i) * (6 - i)) * 1.3); R(g, OUT, cx - 9 + 8 - hw - 1, dy - 5 + i, hw * 2 + 2, 1); R(g, '#d8c8a0', cx - hw, dy - 5 + i, hw * 2, 1); }
  R(g, OUT, cx - 6, dy + 2, 12, dh - 2); R(g, c, cx - 5, dy + 3, 10, dh - 3); for (let i = 0; i < 6; i++) { const hw = Math.round(Math.sqrt(25 - (5 - i) * (5 - i)) * 1.1); R(g, c, cx - hw, dy - 2 + i, hw * 2, 1); } R(g, dark(c, 0.35), cx, dy + 2, 1, dh - 3); R(g, '#e8c040', cx + 2, dy + 14, 2, 2);
  for (let i = 0; i < dh; i += 3) { R(g, '#3a8a40', cx - 9 + (i % 2), dy + i, 2, 2); R(g, '#3a8a40', cx + 8 - (i % 2), dy + i + 1, 2, 2); } R(g, '#e8a0d0', cx - 9, dy + 6, 2, 2); R(g, '#f0e060', cx + 8, dy + 12, 2, 2); R(g, '#8a847a', cx - 11, base - 4, 22, 2); }
function lantern(g, x, y) { R(g, OUT, x + 3, y - 6, 1, 6); R(g, OUT, x, y, 8, 11); R(g, '#7affd0', x + 1, y + 1, 6, 9); R(g, '#d8fff0', x + 2, y + 2, 2, 4); R(g, '#2a6a5a', x + 1, y + 1, 6, 1); R(g, '#2a6a5a', x + 1, y + 9, 6, 1); R(g, 'rgba(120,255,210,.12)', x - 8, y - 4, 24, 24); }
export function drawElfHouse(g, tw, o = {}) {
  g.save(); g.translate(0, MT);
  const leaf = o.leaf || '#3a8a4a', wood = o.wood || '#d8bc88', W = tw * 16, roofH = o.roofH || 30, eave = 5, wallH = 38, H = roofH + eave + wallH, wy = roofH + eave;
  g.save(); g.globalAlpha = 0.26; g.fillStyle = '#0a1a18'; g.beginPath(); g.moveTo(4, H); g.lineTo(W, H); g.lineTo(W + 14, H - 8); g.lineTo(W + 14, wy - 6); g.lineTo(W, wy); g.fill(); g.restore();
  // muro di tronchi verticali con fascia intagliata a liane
  R(g, OUT, 0, wy - 1, W, H - wy + 1); R(g, wood, 1, wy, W - 2, H - wy - 1);
  for (let x = 1; x < W - 2; x += 5) { R(g, dark(wood, 0.22), x + 4, wy, 1, H - wy - 5); R(g, lite(wood, 0.18), x, wy, 1, H - wy - 5); if (rnd(x, 3) < 0.3) R(g, dark(wood, 0.3), x + 2, wy + 6 + Math.floor(rnd(x, 4) * 20), 1, 3); }
  R(g, o.band || '#3a6a4a', 1, wy + 3, W - 2, 4); for (let x = 3; x < W - 4; x += 6) { R(g, '#7ad090', x, wy + 4, 3, 1); R(g, '#e8f8e8', x + 1, wy + 5, 1, 1); } R(g, OUT, 1, wy + 2, W - 2, 1); R(g, OUT, 1, wy + 7, W - 2, 1);
  R(g, OUT, 0, H - 6, W, 6); R(g, '#7a766c', 1, H - 5, W - 2, 4); for (let x = 1; x < W - 2; x += 6) { R(g, rnd(x, 9) < 0.5 ? '#5a8a4a' : '#9a948a', x, H - 5, 5, 4); } R(g, '#3a8a40', 1, H - 6, W - 2, 1);
  const cx = Math.round(W / 2); archDoor(g, cx, H, o.door || '#7a4a2a');
  const wins = o.wins ? o.wins.map((x) => (x < 0 ? W + x : x)) : (tw >= 8 ? [16, cx - 32, cx + 32, W - 16] : tw >= 5 ? [16, W - 16] : [14, W - 14]); for (const wx of wins) roundWin(g, wx, wy + 18, o);
  // tetto a cupola di foglie sovrapposte
  for (let y = 0; y < roofH + eave; y++) {
    const t = Math.min(1, y / roofH), l = Math.round(22 * (1 - Math.sqrt(t)) - 4 * t * t), r = W - l; R(g, OUT, l - 1, y, r - l + 2, 1);
    const band = Math.floor(y / 4), inB = y % 4;
    for (let x = l; x < r; x++) { const sc = (x + (band % 2) * 4) % 8, k = Math.min(sc, 7 - sc); let c = leaf; if (inB === 3) c = dark(leaf, 0.4); else if (inB === 0) c = lite(leaf, 0.2); else if (k === 0) c = dark(leaf, 0.25); if (rnd(x, band) < 0.1) c = lite(c, 0.12); R(g, c, x, y, 1, 1); }
    R(g, dark(leaf, 0.5), r - 3, y, 3, 1); R(g, lite(leaf, 0.3), l, y, 2, 1);
  }
  for (let i = 0; i < 4; i++) { R(g, OUT, -3 + i, roofH + eave - 5 - i * 0, 1, 1); }   // punte arricciate sulla gronda
  R(g, OUT, -4, roofH + eave - 6, 5, 3); R(g, leaf, -3, roofH + eave - 5, 3, 1); R(g, OUT, W - 1, roofH + eave - 6, 5, 3); R(g, leaf, W, roofH + eave - 5, 3, 1);
  R(g, 'rgba(10,26,20,.5)', 0, wy, W, 3); R(g, 'rgba(10,26,20,.22)', 0, wy + 3, W, 3);
  // cappello del colmo: fiore e lanterna
  R(g, OUT, W / 2 - 3, -6, 6, 8); R(g, '#8a5a34', W / 2 - 2, -5, 4, 6); R(g, '#e8a0d0', W / 2 - 3, -9, 6, 4); R(g, '#f8d0f0', W / 2 - 2, -9, 3, 2);
  if (o.lantern) lantern(g, cx + 14, wy + 8); if (o.vines !== false) { for (let i = 0; i < 18; i += 2) { R(g, '#2a7a3a', W - 6 - (i % 4), wy + i, 2, 2); } R(g, '#f0e060', W - 8, wy + 10, 2, 2); R(g, '#e8a0d0', W - 6, wy + 4, 2, 2); }
  g.restore();
}

// ---- negozi ed edifici pubblici di Silvaneth ----
const sign = (g, x, y, draw) => { R(g, OUT, x - 8, y - 3, 16, 2); R(g, '#6a4226', x - 7, y - 2, 14, 1); R(g, OUT, x - 1, y - 1, 2, 4); disc(g, x, y + 10, 9, OUT); disc(g, x, y + 10, 8, '#8a5a34'); disc(g, x, y + 10, 6, '#e8d8a8'); draw(g, x - 5, y + 5); };
const antlers = (g, x, y) => { R(g, '#6a4226', x + 4, y + 6, 2, 4); for (const s of [-1, 1]) { R(g, '#8a5a34', x + 5 + s * 2, y + 3, 1, 4); R(g, '#8a5a34', x + 5 + s * 3, y + 1, 1, 3); R(g, '#8a5a34', x + 5 + s * 4, y, 1, 2); R(g, '#8a5a34', x + 5 + s * 1, y + 2, 1, 1); } };
const herb = (g, x, y) => { R(g, '#2a7a3a', x + 4, y, 2, 10); R(g, '#3aa04a', x + 2, y + 1, 3, 3); R(g, '#3aa04a', x + 5, y + 3, 3, 3); R(g, '#3aa04a', x + 2, y + 5, 3, 3); R(g, '#e8a0d0', x + 4, y - 1, 2, 2); };
const bow = (g, x, y) => { R(g, '#6a4226', x + 2, y, 1, 2); R(g, '#8a5a34', x + 3, y + 2, 1, 6); R(g, '#8a5a34', x + 2, y + 8, 1, 2); R(g, '#f4ecd4', x + 5, y + 1, 1, 8); R(g, '#c8d4e8', x + 1, y + 5, 7, 1); R(g, '#c8283a', x, y + 4, 2, 3); };
const book = (g, x, y) => { R(g, '#2a4a8a', x + 1, y + 1, 8, 8); R(g, '#4a6aba', x + 1, y + 1, 8, 2); R(g, '#f4ecd4', x + 2, y + 3, 6, 5); R(g, '#2a4a8a', x + 5, y + 3, 1, 5); R(g, '#e8c040', x + 3, y + 4, 2, 1); };
function treeIcon(g, x, y) { R(g, '#6a4226', x + 4, y + 5, 2, 5); disc(g, x + 5, y + 3, 4, '#2a7a3a'); R(g, '#7ad090', x + 3, y + 1, 3, 2); }
function bush(g, x, y) { R(g, 'rgba(10,26,20,.3)', x, y + 9, 14, 3); disc(g, x + 7, y + 5, 6, OUT); disc(g, x + 7, y + 5, 5, '#2a7a3a'); R(g, '#5aba6a', x + 4, y + 2, 4, 2); R(g, '#e8a0d0', x + 9, y + 4, 2, 2); R(g, '#f0e060', x + 3, y + 6, 2, 2); }
function table(g, x, y) { R(g, 'rgba(10,26,20,.3)', x, y + 11, 18, 3); R(g, OUT, x + 1, y + 6, 3, 7); R(g, OUT, x + 14, y + 6, 3, 7); R(g, OUT, x, y + 2, 18, 6); R(g, '#c8a070', x + 1, y + 3, 16, 4); R(g, '#e8c898', x + 1, y + 3, 16, 1); R(g, '#f4ecd4', x + 3, y, 3, 3); R(g, '#c8a040', x + 11, y + 1, 3, 2); }
function target(g, x, y) { R(g, OUT, x + 8, y + 14, 3, 14); R(g, '#6a4226', x + 9, y + 15, 1, 12); disc(g, x + 10, y + 8, 10, OUT); disc(g, x + 10, y + 8, 9, '#e8e0d0'); disc(g, x + 10, y + 8, 7, '#c8283a'); disc(g, x + 10, y + 8, 5, '#e8e0d0'); disc(g, x + 10, y + 8, 3, '#c8283a'); R(g, '#f0c040', x + 10, y + 8, 1, 1); R(g, '#8a5a34', x + 3, y + 7, 9, 1); R(g, '#c8d4e8', x + 2, y + 7, 2, 1); }
function bookstack(g, x, y) { R(g, OUT, x, y + 6, 14, 8); R(g, '#2a4a8a', x + 1, y + 7, 12, 3); R(g, '#c8283a', x + 2, y + 10, 10, 3); R(g, OUT, x + 2, y + 1, 11, 6); R(g, '#2a7a4a', x + 3, y + 2, 9, 4); R(g, '#e8c040', x + 5, y + 3, 5, 1); }

export function drawElfShop(g, kind, twOv) {
  const P = {
    locanda: { tw: 6, leaf: '#2a7a5a', wood: '#c8a070', band: '#6a4a2a', door: '#5a3220', wins: [16, -16] },
    guaritrice: { tw: 4, leaf: '#6ab070', wood: '#f0e8d0', band: '#c87aa0', ring: '#c8a070', wins: [14] },
    arcieria: { tw: 5, leaf: '#4a6a2a', wood: '#a88050', band: '#2a4a2a', door: '#4a2a1c', wins: [] },
    biblioteca: { tw: 6, leaf: '#2a6a8a', wood: '#e0d0b0', band: '#4a5a9a', ring: '#4a5a9a', door: '#2a3a6a', wins: [28, -28] },
    consiglio: { tw: 8, leaf: '#3a9a4a', wood: '#e8d8b0', band: '#e8c040', door: '#5a3220', roofH: 28, wins: [] },
  }[kind], tw = twOv || P.tw, W = tw * 16, roofH = P.roofH || 30, H = roofH + 5 + 38, wy = roofH + 5 + MT, base = H + MT, cx = Math.round(W / 2);
  drawElfHouse(g, tw, { ...P, wins: P.wins && twOv ? (kind === 'locanda' ? [16, 44, -44, -16] : kind === 'biblioteca' ? [28, -28] : P.wins) : P.wins });
  if (kind === 'locanda') { sign(g, W + 10, wy + 2, antlers); table(g, 4, base - 16); table(g, W - 22, base - 16); lantern(g, cx - 16, wy + 20); lantern(g, cx + 10, wy + 20); }
  else if (kind === 'guaritrice') { sign(g, W + 10, wy + 2, herb); for (let i = 0; i < 4; i++) { R(g, '#4a6a3a', 6 + i * 6, wy + 8, 1, 4); R(g, i % 2 ? '#7aaa5a' : '#c8a050', 4 + i * 6, wy + 12, 5, 5); } bush(g, 2, base - 14); bush(g, W - 16, base - 14); }
  else if (kind === 'arcieria') { sign(g, W + 10, wy + 2, bow); target(g, W - 22, base - 30); R(g, OUT, 6, base - 22, 14, 18); R(g, '#6a4226', 7, base - 21, 12, 16); for (let i = 0; i < 3; i++) { R(g, '#c8d4e8', 9 + i * 4, base - 26, 1, 8); R(g, '#c8283a', 8 + i * 4, base - 27, 3, 2); } }
  else if (kind === 'biblioteca') { sign(g, W + 10, wy + 2, book); bookstack(g, 4, base - 18); bookstack(g, W - 20, base - 18); for (const bx of [4, W - 10]) { R(g, OUT, bx, wy + 10, 6, 20); R(g, '#4a5a9a', bx + 1, wy + 11, 4, 18); R(g, '#e8c040', bx + 2, wy + 16, 2, 4); } }
  else if (kind === 'consiglio') {
    R(g, OUT, cx - 22, -26, 44, 40); R(g, '#7a5a3a', cx - 21, -25, 42, 38); for (let i = 0; i < 8; i++) { R(g, dark('#7a5a3a', 0.3), cx - 20 + i * 5, -24, 1, 36); R(g, lite('#7a5a3a', 0.2), cx - 21 + i * 5, -24, 1, 36); }   // tronco-torre dell'albero del consiglio
    for (const [dx, dy, r] of [[-18, -28, 12], [0, -36, 15], [18, -28, 12], [-8, -22, 10], [10, -22, 10]]) { disc(g, cx + dx, dy, r + 1, OUT); }
    for (const [dx, dy, r] of [[-18, -28, 12], [0, -36, 15], [18, -28, 12], [-8, -22, 10], [10, -22, 10]]) { disc(g, cx + dx, dy, r, '#3a9a4a'); disc(g, cx + dx - 2, dy - 2, r - 4, '#5aba6a'); R(g, '#a8f0b0', cx + dx - 4, dy - 6, 4, 2); }
    for (let i = 0; i < 10; i++) R(g, i % 3 ? '#e8a0d0' : '#f8f8e8', cx - 26 + ((i * 11) % 52), -40 + ((i * 7) % 24), 2, 2);
    disc(g, cx, -4, 8, OUT); disc(g, cx, -4, 7, '#c8a070'); disc(g, cx, -4, 5, '#9ae0d8'); R(g, '#8a5a34', cx - 5, -4, 11, 1); R(g, '#8a5a34', cx, -9, 1, 11);   // oculo del consiglio
    for (const bx of [22, W - 36]) { R(g, OUT, bx, wy + 6, 14, 30); R(g, '#2a7a4a', bx + 1, wy + 7, 12, 28); treeIcon(g, bx + 2, wy + 14); R(g, '#e8c040', bx + 1, wy + 33, 12, 2); }
    for (let i = 0; i < 3; i++) { R(g, '#8a847a', cx - 14 - i * 3, base - 4 + i * 2, 30 + i * 6, 2); R(g, '#5a8a4a', cx - 14 - i * 3, base - 4 + i * 2, 30 + i * 6, 1); }
  }
}
