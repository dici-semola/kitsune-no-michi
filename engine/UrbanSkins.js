// ARREDO URBANO DI HINOMURA (anteprima): pavimentazioni, cancelli e oggetti in giro. Ogni elemento è disegnato a 16 px per tile.
import { R, lite, dark, mix, OUT } from './BuildingSkins.js';
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

// ---- pavimentazioni: tile 16x16 ----
export const PAVE = {
  dirt(g, x, y, s = 0) {   // strada di terra battuta con sassolini e solchi
    R(g, '#b8905a', x, y, 16, 16); for (let i = 0; i < 10; i++) { const px = x + Math.floor(rnd(s, i) * 15), py = y + Math.floor(rnd(s, i + 40) * 15); R(g, i % 3 ? '#a47e4a' : '#d0aa72', px, py, 2, 1); }
    for (let i = 0; i < 3; i++) R(g, '#8a6a3c', x + Math.floor(rnd(s, i + 80) * 12), y + Math.floor(rnd(s, i + 90) * 14), 3, 2);
  },
  flag(g, x, y, s = 0) {   // lastricato irregolare in pietra chiara
    R(g, '#6a665c', x, y, 16, 16);
    const rows = [[0, 5, [6, 5, 5]], [5, 5, [4, 7, 5]], [10, 6, [7, 4, 5]]]; let r0 = 0;
    for (const [yy, h, ws] of rows) { let xx = 0; for (const w of ws) { const sh = rnd(s + r0, xx); R(g, mix('#b8b2a4', '#8a8478', sh * 0.6), x + xx, y + yy, w - 1, h - 1); R(g, '#d8d2c4', x + xx, y + yy, w - 1, 1); R(g, '#8a8478', x + xx, y + yy + h - 2, w - 1, 1); xx += w; } r0++; }
  },
  cobble(g, x, y, s = 0) {   // ciottoli rotondi sfalsati con un po' di muschio
    R(g, '#5a564e', x, y, 16, 16); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const ox = (r % 2) * 2, px = x + c * 4 + ox - 1, py = y + r * 4, t = rnd(s + r, c); R(g, mix('#a09a8c', '#7a766c', t), px + 1, py, 3, 3); R(g, '#c8c2b4', px + 1, py, 3, 1); R(g, '#6a665c', px + 1, py + 3, 3, 1); }
    if (rnd(s, 7) < 0.35) { R(g, '#5a8a4a', x + 3, y + 7, 2, 1); R(g, '#7aaa5a', x + 4, y + 6, 1, 1); }
  },
  plank(g, x, y, s = 0) {   // passerella di legno con chiodi
    R(g, '#4a2a14', x, y, 16, 16); for (let r = 0; r < 4; r++) { const c = mix('#a8743c', '#8a5a2c', rnd(s, r) * 0.6); R(g, c, x, y + r * 4, 16, 3); R(g, '#d09858', x, y + r * 4, 16, 1); R(g, '#5a3a1c', x + 2 + (r % 2) * 8, y + r * 4 + 1, 1, 1); R(g, '#5a3a1c', x + 13 - (r % 2) * 8, y + r * 4 + 1, 1, 1); }
  },
  gravel(g, x, y, s = 0) {   // ghiaia rastrellata del giardino con onde
    R(g, '#e0d8c0', x, y, 16, 16); for (let r = 0; r < 4; r++) { R(g, '#c8bea0', x, y + r * 4 + 1, 16, 1); R(g, '#f4eed8', x, y + r * 4 + 2, 16, 1); } for (let i = 0; i < 6; i++) R(g, '#b0a688', x + Math.floor(rnd(s, i) * 15), y + Math.floor(rnd(s, i + 9) * 15), 1, 1);
  },
  step(g, x, y, s = 0) { PAVE.gravel(g, x, y, s); R(g, OUT, x + 3, y + 4, 10, 8); R(g, '#9a948a', x + 4, y + 5, 8, 6); R(g, '#c8c2b4', x + 4, y + 5, 8, 1); R(g, '#6a665c', x + 4, y + 10, 8, 1); },
};
// bordo tra strada e prato: striscia d'erba sfumata sopra e sotto
export function roadEdge(g, x, y, w, top) { for (let i = 0; i < w; i += 2) { R(g, '#4a9040', x + i, y + (top ? 0 : 14), 2, 2); R(g, '#68b858', x + i + 1, y + (top ? 1 : 13), 1, 1); } }

// ---- cancelli ----
export function drawTorii(g, x, y) {   // torii rosso 3x4 tile
  R(g, 'rgba(10,4,24,.28)', x + 40, y + 52, 14, 4);
  for (const px of [x + 6, x + 34]) { R(g, OUT, px - 1, y + 10, 10, 46); R(g, '#c8283a', px, y + 10, 8, 45); R(g, '#e85a4a', px, y + 10, 2, 45); R(g, '#8a1a24', px + 6, y + 10, 2, 45); R(g, OUT, px - 2, y + 52, 12, 4); R(g, '#3a3a44', px - 1, y + 53, 10, 3); }
  R(g, OUT, x + 6, y + 22, 36, 6); R(g, '#c8283a', x + 7, y + 23, 34, 4); R(g, '#e85a4a', x + 7, y + 23, 34, 1);          // nuki
  R(g, OUT, x - 2, y + 4, 52, 8); R(g, '#1a1a22', x - 1, y + 5, 50, 6); R(g, '#3a3a46', x - 1, y + 5, 50, 1); R(g, OUT, x - 5, y + 2, 6, 4); R(g, OUT, x + 47, y + 2, 6, 4);   // kasagi con punte rialzate
  R(g, OUT, x + 4, y + 11, 40, 4); R(g, '#c8283a', x + 5, y + 12, 38, 2);                                                  // shimaki
  R(g, '#f0c040', x + 21, y + 18, 6, 4); R(g, OUT, x + 21, y + 17, 6, 1);                                                 // targa
}
export function drawVillageGate(g, x, y, open) {   // cancello di legno con tettoia, 4x4 tile
  R(g, 'rgba(10,4,24,.28)', x + 54, y + 56, 14, 6);
  for (const px of [x + 2, x + 50]) { R(g, OUT, px - 1, y + 14, 14, 50); R(g, '#6a4226', px, y + 15, 12, 48); R(g, '#8a5a34', px, y + 15, 3, 48); R(g, '#4a2a16', px + 9, y + 15, 3, 48); R(g, '#3a3a44', px, y + 58, 12, 6); R(g, '#7a7a86', px, y + 58, 12, 1); }
  for (let i = 0; i < 64; i++) { const t = Math.abs(i - 32) / 32; R(g, OUT, x + i - 2, y + 4 + Math.round(t * t * 5) - 4 + 4, 1, 12); }
  for (let yy = 0; yy < 12; yy++) { const l = x - 4 + Math.round(yy * 0.2), r = x + 68 - Math.round(yy * 0.2); R(g, OUT, l, y + yy, r - l, 1); for (let xx = l + 1; xx < r - 1; xx++) R(g, yy % 4 === 3 ? '#4a4a58' : (xx + Math.floor(yy / 4) * 3) % 6 === 0 ? '#5a5a68' : '#6a6a78', xx, y + yy, 1, 1); }
  R(g, '#9a9aaa', x - 3, y, 70, 1); R(g, OUT, x - 4, y + 12, 72, 1); R(g, 'rgba(10,4,24,.4)', x + 8, y + 13, 48, 4);
  if (open) { for (const [dx0, w] of [[x + 14, 5], [x + 45, 5]]) { R(g, OUT, dx0 - 1, y + 17, w + 2, 46); R(g, '#8a5a34', dx0, y + 18, w, 44); R(g, '#3a3a44', dx0 + 1, y + 28, 1, 2); } R(g, '#a89870', x + 20, y + 40, 24, 22); }
  else { R(g, OUT, x + 13, y + 17, 38, 46); R(g, '#8a5a34', x + 14, y + 18, 18, 44); R(g, '#7a4c2c', x + 32, y + 18, 18, 44); R(g, '#3a2210', x + 31, y + 18, 2, 44); for (let i = 0; i < 4; i++) for (const bx of [18, 26, 38, 46]) R(g, '#a8a8b8', x + bx, y + 24 + i * 9, 2, 2); R(g, '#3a3a44', x + 14, y + 36, 36, 2); R(g, '#3a3a44', x + 14, y + 52, 36, 2); }
}
export function drawBambooFence(g, x, y, n = 3) { for (let i = 0; i < n * 16; i += 4) { R(g, OUT, x + i, y + 2, 4, 14); R(g, '#8ab04a', x + i + 1, y + 3, 2, 12); R(g, '#c0d878', x + i + 1, y + 3, 1, 12); if (i % 8 === 0) R(g, '#5a7a2a', x + i + 1, y + 8, 3, 1); } R(g, OUT, x, y + 5, n * 16, 3); R(g, '#8a5a34', x, y + 6, n * 16, 1); R(g, OUT, x, y + 11, n * 16, 3); R(g, '#8a5a34', x, y + 12, n * 16, 1); R(g, 'rgba(10,4,24,.25)', x, y + 15, n * 16, 2); }
export function drawHedge(g, x, y, n = 3) { for (let i = 0; i < n * 16; i += 3) { const h = 3 + Math.floor(rnd(i, 3) * 3); R(g, OUT, x + i, y + 4 - h + 2, 4, 14 + h - 2); } R(g, '#2a6a30', x, y + 5, n * 16, 11); for (let i = 0; i < n * 16; i += 2) { R(g, rnd(i, 5) < 0.5 ? '#3a8a40' : '#4aa050', x + i, y + 5 + Math.floor(rnd(i, 6) * 4), 2, 3); } R(g, '#6ac060', x, y + 5, n * 16, 1); R(g, 'rgba(10,4,24,.3)', x, y + 14, n * 16, 3); }

// ---- oggetti in giro ----
export const PROPS = {
  toro(g, x, y) { R(g, 'rgba(10,4,24,.28)', x + 4, y + 28, 12, 3); R(g, OUT, x + 4, y + 22, 8, 8); R(g, '#8a847a', x + 5, y + 23, 6, 6); R(g, OUT, x + 6, y + 12, 4, 11); R(g, '#a8a296', x + 7, y + 12, 2, 11); R(g, OUT, x + 3, y + 8, 10, 6); R(g, '#9a948a', x + 4, y + 9, 8, 4); R(g, '#ffd878', x + 6, y + 10, 4, 2); R(g, OUT, x + 1, y + 4, 14, 5); R(g, '#8a847a', x + 2, y + 5, 12, 3); R(g, '#c8c2b4', x + 2, y + 5, 12, 1); R(g, OUT, x + 6, y + 1, 4, 4); R(g, '#a8a296', x + 7, y + 2, 2, 2); },
  well(g, x, y) { R(g, 'rgba(10,4,24,.28)', x + 2, y + 26, 22, 4); R(g, OUT, x + 2, y + 14, 20, 14); R(g, '#8a847a', x + 3, y + 15, 18, 12); for (let i = 0; i < 3; i++) R(g, '#6a665c', x + 3, y + 18 + i * 3, 18, 1); R(g, '#a8a296', x + 3, y + 15, 18, 2); R(g, '#1a3a5a', x + 5, y + 17, 14, 3); R(g, OUT, x + 2, y + 2, 3, 14); R(g, OUT, x + 19, y + 2, 3, 14); R(g, '#6a4226', x + 3, y + 3, 1, 12); R(g, '#6a4226', x + 20, y + 3, 1, 12); R(g, OUT, x, y, 24, 5); R(g, '#8a2a24', x + 1, y + 1, 22, 3); R(g, '#c8483a', x + 1, y + 1, 22, 1); R(g, '#d8c8a0', x + 11, y + 5, 1, 7); R(g, OUT, x + 9, y + 11, 5, 4); R(g, '#8a5a34', x + 10, y + 12, 3, 2); },
  chozuya(g, x, y) { R(g, 'rgba(10,4,24,.28)', x + 1, y + 14, 16, 3); R(g, OUT, x + 1, y + 6, 15, 9); R(g, '#8a847a', x + 2, y + 7, 13, 7); R(g, '#a8a296', x + 2, y + 7, 13, 1); R(g, '#3a7aaa', x + 3, y + 8, 11, 4); R(g, '#7ac0e0', x + 4, y + 9, 4, 1); R(g, OUT, x + 12, y + 1, 3, 8); R(g, '#8ab04a', x + 12, y + 2, 2, 6); R(g, '#6a4226', x + 3, y + 5, 7, 1); R(g, '#e8e0d0', x + 4, y + 3, 5, 3); R(g, '#8a5a34', x + 8, y + 2, 1, 6); },
  board(g, x, y) { R(g, 'rgba(10,4,24,.28)', x + 1, y + 22, 16, 3); R(g, OUT, x + 2, y + 10, 3, 14); R(g, OUT, x + 13, y + 10, 3, 14); R(g, '#6a4226', x + 3, y + 11, 1, 12); R(g, '#6a4226', x + 14, y + 11, 1, 12); R(g, OUT, x, y, 18, 13); R(g, '#8a5a34', x + 1, y + 1, 16, 11); R(g, '#f0e4c0', x + 2, y + 2, 6, 8); R(g, '#e8d8a8', x + 10, y + 2, 6, 5); R(g, '#c8283a', x + 4, y + 4, 2, 2); R(g, '#2a2a34', x + 11, y + 3, 4, 1); R(g, '#2a2a34', x + 11, y + 5, 3, 1); R(g, '#2a2a34', x + 3, y + 7, 4, 1); R(g, OUT, x - 1, y - 2, 20, 3); R(g, '#9a4a2a', x, y - 1, 18, 1); },
  barrels(g, x, y) { R(g, 'rgba(10,4,24,.28)', x, y + 16, 24, 3); for (const [bx, by] of [[0, 6], [11, 6], [5, 0]]) { R(g, OUT, x + bx, y + by, 12, 14); R(g, '#a8743c', x + bx + 1, y + by + 1, 10, 12); R(g, '#d09858', x + bx + 2, y + by + 1, 2, 12); R(g, '#7a5028', x + bx + 8, y + by + 1, 3, 12); R(g, '#4a3a2a', x + bx + 1, y + by + 3, 10, 1); R(g, '#4a3a2a', x + bx + 1, y + by + 9, 10, 1); R(g, '#f0e4c0', x + bx + 4, y + by + 5, 4, 3); R(g, '#c8283a', x + bx + 5, y + by + 6, 2, 1); } },
  bench(g, x, y) { R(g, 'rgba(10,4,24,.28)', x, y + 12, 22, 3); R(g, OUT, x + 1, y + 6, 3, 8); R(g, OUT, x + 18, y + 6, 3, 8); R(g, OUT, x, y + 3, 22, 5); R(g, '#a8743c', x + 1, y + 4, 20, 3); R(g, '#d09858', x + 1, y + 4, 20, 1); R(g, '#5a3a1c', x + 2, y + 7, 18, 1); },
  hay(g, x, y) { R(g, 'rgba(10,4,24,.28)', x, y + 14, 20, 3); R(g, OUT, x + 1, y + 3, 18, 13); R(g, '#d8b848', x + 2, y + 4, 16, 11); for (let i = 0; i < 8; i++) R(g, rnd(i, 4) < 0.5 ? '#f0d870' : '#b89828', x + 3 + i * 2, y + 5 + (i % 3) * 3, 1, 4); R(g, '#8a2a24', x + 2, y + 8, 16, 1); R(g, '#8a2a24', x + 2, y + 12, 16, 1); },
  nobori(g, x, y) { R(g, 'rgba(10,4,24,.28)', x + 2, y + 28, 8, 3); R(g, OUT, x + 3, y, 3, 30); R(g, '#6a4226', x + 4, y + 1, 1, 28); R(g, OUT, x + 5, y + 2, 10, 24); R(g, '#c8283a', x + 6, y + 3, 8, 22); R(g, '#f4ecd4', x + 8, y + 6, 4, 4); R(g, '#f4ecd4', x + 8, y + 13, 4, 2); R(g, '#f4ecd4', x + 9, y + 18, 2, 4); R(g, '#8a1a24', x + 13, y + 3, 1, 22); },
  bonsai(g, x, y) { R(g, 'rgba(10,4,24,.28)', x, y + 14, 14, 3); R(g, OUT, x + 2, y + 9, 11, 7); R(g, '#3a5a8a', x + 3, y + 10, 9, 5); R(g, '#5a7aaa', x + 3, y + 10, 9, 1); R(g, OUT, x + 7, y + 4, 3, 7); R(g, '#6a4226', x + 8, y + 5, 1, 5); for (const [cx, cy, w] of [[1, 1, 7], [6, 0, 8], [9, 3, 5]]) { R(g, OUT, x + cx - 1, y + cy - 1, w + 2, 6); R(g, '#2a7a3a', x + cx, y + cy, w, 4); R(g, '#4aa050', x + cx + 1, y + cy, w - 3, 1); } },
  hokora(g, x, y) { R(g, 'rgba(10,4,24,.28)', x + 1, y + 20, 18, 4); R(g, OUT, x + 2, y + 12, 16, 10); R(g, '#8a847a', x + 3, y + 13, 14, 8); R(g, '#a8a296', x + 3, y + 13, 14, 1); R(g, OUT, x + 4, y + 6, 12, 8); R(g, '#8a5a34', x + 5, y + 7, 10, 6); R(g, '#2a1a10', x + 8, y + 9, 4, 4); R(g, '#f4ecd4', x + 9, y + 10, 2, 2); R(g, OUT, x, y + 1, 20, 7); R(g, '#4a4a58', x + 1, y + 2, 18, 5); R(g, '#7a7a88', x + 1, y + 2, 18, 1); R(g, '#c8283a', x + 7, y + 14, 6, 1); },
  cart(g, x, y) { R(g, 'rgba(10,4,24,.28)', x, y + 18, 28, 4); R(g, OUT, x + 2, y + 6, 24, 12); R(g, '#8a5a34', x + 3, y + 7, 22, 10); R(g, '#a8743c', x + 3, y + 7, 22, 2); R(g, '#5a3a1c', x + 3, y + 12, 22, 1); for (const wx of [x + 4, x + 20]) { R(g, OUT, wx, y + 10, 8, 8); R(g, '#6a4226', wx + 1, y + 11, 6, 6); R(g, '#c8a060', wx + 3, y + 13, 2, 2); } R(g, '#e8c040', x + 6, y + 3, 5, 4); R(g, '#c8483a', x + 12, y + 2, 5, 5); R(g, '#7ac040', x + 18, y + 3, 5, 4); R(g, OUT, x + 25, y + 11, 6, 2); R(g, '#8a5a34', x + 26, y + 11, 5, 1); },
  signpost(g, x, y) { R(g, 'rgba(10,4,24,.28)', x + 2, y + 22, 10, 3); R(g, OUT, x + 5, y + 4, 4, 20); R(g, '#6a4226', x + 6, y + 5, 2, 18); R(g, OUT, x, y + 2, 14, 7); R(g, '#a8743c', x + 1, y + 3, 12, 5); R(g, '#f0e4c0', x + 3, y + 4, 6, 1); R(g, '#c8283a', x + 10, y + 5, 2, 2); R(g, OUT, x + 4, y + 11, 11, 6); R(g, '#a8743c', x + 5, y + 12, 9, 4); R(g, '#f0e4c0', x + 6, y + 13, 5, 1); },
};
