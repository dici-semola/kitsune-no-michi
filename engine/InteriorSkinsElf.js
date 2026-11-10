// INTERNI DI SILVANETH (anteprima): legno vivo, radici e lanterne lunari. Dimensioni proporzionali all'esterno: larghezza 2x, profondità 1,5x.
import { R, lite, dark, mix, OUT, exitCue } from './BuildingSkins.js';
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const hw = Math.round(Math.sqrt(r * r - y * y)); R(g, c, cx - hw, cy + y, hw * 2 + 1, 1); } };
let W = 192, H = 128; const WALL = 40;
export const ROOM_SIZE_ELF = { locanda: { ext: [8, 6], tiles: [16, 9] }, bottega: { ext: [8, 6], tiles: [16, 9] }, consiglio: { ext: [11, 7], tiles: [22, 10] }, casa: { ext: [6, 6], tiles: [12, 9] } };
const shadow = (g) => { R(g, 'rgba(10,26,20,.4)', 0, WALL, W, 3); R(g, 'rgba(10,26,20,.2)', 0, WALL + 3, W, 4); R(g, 'rgba(10,26,20,.22)', 0, WALL, 5, H - WALL); R(g, 'rgba(10,26,20,.22)', W - 5, WALL, 5, H - WALL); };
const frame = (g) => { R(g, OUT, 0, 0, W, 3); R(g, OUT, 0, H - 3, W, 3); R(g, OUT, 0, 0, 3, H); R(g, OUT, W - 3, 0, 3, H); };
function wall(g, wood, band) { R(g, wood, 0, 0, W, WALL); for (let x = 0; x < W; x += 5) { R(g, dark(wood, 0.2), x + 4, 0, 1, WALL - 6); R(g, lite(wood, 0.16), x, 0, 1, WALL - 6); } R(g, band, 0, 8, W, 4); for (let x = 3; x < W - 4; x += 6) { R(g, '#7ad090', x, 9, 3, 1); R(g, '#e8f8e8', x + 1, 10, 1, 1); } R(g, dark(wood, 0.5), 0, WALL - 6, W, 6); R(g, dark(wood, 0.3), 0, 0, W, 4); R(g, OUT, 0, WALL - 1, W, 1); for (let x = 12; x < W - 8; x += 40) { R(g, '#2a7a3a', x, 4, 2, 24); R(g, '#3aa04a', x + 2, 14, 3, 3); R(g, '#3aa04a', x - 3, 20, 3, 3); R(g, '#f8c0e0', x + 1, 26, 2, 2); } }
function floor(g, c1, c2) { for (let y = WALL; y < H; y += 8) { R(g, mix(c1, c2, rnd(y, 1) * 0.7), 0, y, W, 7); R(g, lite(c1, 0.2), 0, y, W, 1); R(g, dark(c1, 0.45), 0, y + 7, W, 1); for (let x = (y / 8 % 3) * 22 + 10; x < W; x += 66) R(g, dark(c1, 0.45), x, y, 1, 7); } for (let i = 0; i < W / 24; i++) { R(g, '#3a8a40', 6 + i * 24 + (i * 7) % 9, WALL + 4 + (i * 13) % (H - WALL - 10), 3, 1); } }
function roundWin(g, cx, cy, r = 11) { disc(g, cx, cy, r + 2, OUT); disc(g, cx, cy, r + 1, '#8a5a34'); disc(g, cx, cy, r - 1, '#9ae0d8'); R(g, '#d8fff4', cx - r + 3, cy - r + 3, 5, 3); R(g, '#8a5a34', cx - r + 1, cy, 2 * r - 2, 1); R(g, '#8a5a34', cx, cy - r + 1, 1, 2 * r - 2); R(g, '#3a8a40', cx - r, cy + r - 2, 5, 2); R(g, '#e8a0d0', cx - r + 1, cy + r - 4, 2, 2); }
function lantern(g, x, y) { R(g, 'rgba(120,255,210,.12)', x - 10, y - 4, 28, 28); R(g, OUT, x + 3, y - 8, 1, 8); R(g, OUT, x, y, 8, 11); R(g, '#7affd0', x + 1, y + 1, 6, 9); R(g, '#d8fff0', x + 2, y + 2, 2, 4); R(g, '#2a6a5a', x + 1, y + 1, 6, 1); R(g, '#2a6a5a', x + 1, y + 9, 6, 1); }
function trunk(g, x, h) { R(g, OUT, x - 1, 0, 26, h + 12); R(g, '#7a5a3a', x, 0, 24, h + 10); for (let i = 0; i < 8; i++) { R(g, dark('#7a5a3a', 0.3), x + 2 + i * 3, 0, 1, h + 8); R(g, lite('#7a5a3a', 0.2), x + 1 + i * 3, 0, 1, h + 8); } R(g, OUT, x - 6, h + 6, 36, 8); R(g, '#5a3a22', x - 5, h + 7, 34, 6); R(g, 'rgba(10,26,20,.3)', x - 6, h + 14, 36, 4); R(g, '#3a8a40', x + 2, h + 4, 5, 2); R(g, '#e8a0d0', x + 16, h + 3, 2, 2); }
function roundTable(g, x, y, r = 12) { R(g, 'rgba(10,26,20,.3)', x - r, y + 6, r * 2 + 4, 5); R(g, OUT, x - 2, y + 2, 4, 9); R(g, '#7a5a3a', x - 1, y + 3, 2, 8); for (let j = -r / 2; j <= r / 2; j++) { const hw = Math.round(Math.sqrt(r * r / 4 - j * j) * 2); R(g, OUT, x - hw - 1, y - 6 + j + 5, 2 * hw + 2, 1); R(g, '#d8aa70', x - hw, y - 6 + j + 5, 2 * hw, 1); } R(g, '#f4ecd4', x - 4, y - 4, 3, 3); R(g, '#c8a040', x + 3, y - 3, 3, 3); }
function stool(g, x, y) { R(g, OUT, x, y, 9, 9); R(g, '#b88a50', x + 1, y + 1, 7, 4); R(g, '#d8aa70', x + 1, y + 1, 7, 1); R(g, '#7a5a3a', x + 3, y + 5, 3, 4); }
function bedElf(g, x, y, c) { R(g, 'rgba(10,26,20,.3)', x, y + 30, 34, 3); R(g, OUT, x, y, 34, 32); R(g, '#b88a50', x + 1, y + 1, 32, 6); R(g, '#d8aa70', x + 1, y + 1, 32, 1); R(g, '#f4ecd4', x + 3, y + 8, 12, 8); R(g, '#d8d0c0', x + 3, y + 14, 12, 2); R(g, c, x + 2, y + 16, 30, 14); R(g, lite(c, 0.25), x + 2, y + 16, 30, 2); for (let i = 0; i < 4; i++) R(g, dark(c, 0.25), x + 6 + i * 7, y + 18, 3, 3); R(g, '#7ad090', x + 22, y + 22, 6, 3); }
function shelf(g, x, y, w, h) { R(g, OUT, x, y, w, h); R(g, '#7a5a3a', x + 1, y + 1, w - 2, h - 2); for (const yy of [y + 2, y + 2 + (h - 4) / 2]) { R(g, '#4a3220', x + 2, yy + (h - 4) / 2 - 2, w - 4, 2); for (let i = 0; i < (w - 4) / 4; i++) { R(g, ['#f4ecd4', '#7affd0', '#e8c040', '#f0a0d0'][i % 4], x + 3 + i * 4, yy + (h - 4) / 2 - 7, 3, 5); } } }
function door(g, cx) { exitCue(g, cx, W, H); }
export function drawRoomElf(g, kind) {
  // Regola: ogni elemento sulla parete di fondo ha una sua fascia orizzontale (scaffali, finestre, tronchi, stendardi non si toccano mai) e i mobili stanno sotto i 44 px di parete.
  const [tw, th] = ROOM_SIZE_ELF[kind].tiles; W = tw * 16; H = WALL + th * 16; const cx = W / 2;
  if (kind === 'locanda') {
    wall(g, '#c8a070', '#6a4a2a'); floor(g, '#a8743c', '#8a5a2c'); shadow(g);
    shelf(g, 10, 8, 54, 28); roundWin(g, 90, 22, 11); trunk(g, cx - 12, 56); roundWin(g, W - 90, 22, 11); shelf(g, W - 64, 8, 54, 28);
    R(g, 'rgba(10,26,20,.3)', 10, 100, 96, 5); R(g, OUT, 8, 64, 98, 36); R(g, '#8a5a34', 9, 65, 96, 34); R(g, '#d8aa70', 9, 65, 96, 6); R(g, '#4a3220', 9, 90, 96, 8); for (let i = 0; i < 5; i++) { R(g, '#c8a040', 16 + i * 18, 58, 3, 7); R(g, '#f4ecd4', 24 + i * 18, 58, 5, 7); }
    for (let i = 0; i < 4; i++) stool(g, 18 + i * 24, 106);
    bedElf(g, W - 46, 48, '#2a7a5a'); bedElf(g, W - 90, 48, '#7a3a5a');
    for (const [tx, ty] of [[W - 64, 114], [cx - 4, 140]]) { roundTable(g, tx, ty, 12); stool(g, tx - 24, ty - 4); stool(g, tx + 16, ty - 4); }
    R(g, OUT, 10, 126, 28, 26); R(g, '#7a5a3a', 11, 127, 26, 24); R(g, '#4a3220', 11, 136, 26, 1); for (let i = 0; i < 3; i++) R(g, '#f4ecd4', 14 + i * 8, 130, 5, 5);
    lantern(g, 40, 44); lantern(g, cx + 30, 48); lantern(g, 160, 100); door(g, cx);
  } else if (kind === 'bottega') {
    wall(g, '#a88050', '#2a4a2a'); floor(g, '#a8743c', '#8a5a2c'); shadow(g); roundWin(g, cx, 24, 12);
    for (const rx of [14, W - 78]) { R(g, OUT, rx, 6, 64, 30); R(g, '#7a5a3a', rx + 1, 7, 62, 28); for (let i = 0; i < 6; i++) { R(g, '#6a4226', rx + 4 + i * 10, 8, 3, 26); R(g, '#e8d8a8', rx + 7 + i * 10, 12, 1, 18); R(g, '#c8d4e8', rx + 2, 14 + i * 3, 60, 1); } }
    R(g, 'rgba(10,26,20,.3)', 40, 112, 176, 5); R(g, OUT, 38, 66, 180, 44); R(g, '#8a5a34', 39, 67, 178, 42); R(g, '#d8aa70', 39, 67, 178, 6); R(g, '#4a3220', 39, 98, 178, 10); for (let i = 0; i < 7; i++) { R(g, '#f0c850', 50 + i * 24, 54, 8, 12); R(g, '#c8a040', 51 + i * 24, 52, 6, 3); }
    for (const mx of [6, W - 30]) { R(g, 'rgba(10,26,20,.3)', mx - 2, 124, 28, 4); R(g, OUT, mx + 4, 84, 14, 44); R(g, '#7a5a3a', mx + 10, 88, 2, 38); R(g, '#3a9a5a', mx + 2, 90, 18, 24); R(g, '#5aba7a', mx + 2, 90, 18, 3); R(g, '#e8d8a8', mx + 6, 76, 10, 10); R(g, OUT, mx + 5, 75, 12, 2); }
    R(g, OUT, cx - 36, 124, 24, 22); R(g, '#2a5a3a', cx - 35, 125, 22, 20); R(g, '#f4ecd4', cx - 30, 130, 12, 8);
    lantern(g, 84, 40); lantern(g, W - 92, 40); door(g, cx);
  } else if (kind === 'consiglio') {
    wall(g, '#e8d8b0', '#e8c040'); for (let y = WALL; y < H; y += 16) for (let x = 0; x < W; x += 16) { R(g, '#6a8a5a', x, y, 16, 16); R(g, mix('#a8c898', '#88a878', rnd(x, y) * 0.8), x + 1, y + 1, 14, 14); R(g, '#c8e0b8', x + 1, y + 1, 14, 1); } shadow(g);
    shelf(g, 8, 8, 38, 28); trunk(g, 84, 56); trunk(g, W - 108, 56); shelf(g, W - 46, 8, 38, 28);
    for (const bx of [50, W - 70]) { R(g, OUT, bx, 4, 3, 36); R(g, '#c8a040', bx + 1, 4, 1, 36); R(g, OUT, bx + 3, 6, 14, 30); R(g, '#2a7a4a', bx + 4, 7, 12, 28); disc(g, bx + 10, 20, 4, '#7ad090'); R(g, '#e8c040', bx + 4, 33, 12, 2); }
    disc(g, cx, 18, 16, OUT); disc(g, cx, 18, 14, '#8a5a34'); disc(g, cx, 18, 12, '#9ae0d8'); disc(g, cx, 18, 6, '#e8f8c8'); R(g, '#8a5a34', cx - 12, 18, 24, 2); R(g, '#8a5a34', cx - 1, 6, 2, 24);
    R(g, '#2a7a4a', cx - 14, WALL + 34, 28, H - WALL - 56); R(g, '#3aa060', cx - 14, WALL + 34, 3, H - WALL - 56); R(g, '#e8c040', cx - 14, WALL + 34, 28, 1);
    R(g, OUT, cx - 30, WALL + 14, 60, 18); R(g, '#7a5a3a', cx - 29, WALL + 15, 58, 16); R(g, '#b88a50', cx - 29, WALL + 15, 58, 4); R(g, '#5a3a22', cx - 29, WALL + 24, 58, 6);
    R(g, OUT, cx - 11, WALL - 4, 22, 22); R(g, '#7a5a3a', cx - 10, WALL - 3, 20, 20); R(g, '#3aa04a', cx - 7, WALL, 14, 10); R(g, '#5aba6a', cx - 7, WALL, 14, 3); R(g, '#e8a0d0', cx - 4, WALL - 2, 4, 3);
    for (const [bx, by] of [[cx - 110, WALL + 84], [cx + 50, WALL + 84], [cx - 110, WALL + 116], [cx + 50, WALL + 116]]) for (const o of [0, 30]) { R(g, 'rgba(10,26,20,.3)', bx + o, by + 10, 28, 3); R(g, OUT, bx + o, by, 28, 10); R(g, '#b88a50', bx + o + 1, by + 1, 26, 8); R(g, '#d8aa70', bx + o + 1, by + 1, 26, 1); }
    lantern(g, 130, 44); lantern(g, W - 138, 44); door(g, cx);
  } else if (kind === 'casa') {
    wall(g, '#d0c090', '#8a3a5a'); floor(g, '#a8743c', '#8a5a2c'); shadow(g);
    shelf(g, 8, 8, 28, 28); roundWin(g, 54, 22, 10); R(g, OUT, cx - 24, 4, 48, 40); R(g, '#8a847a', cx - 23, 5, 46, 38); for (let r = 0; r < 8; r++) R(g, '#6a665c', cx - 23, 8 + r * 5, 46, 1); R(g, OUT, cx - 12, 22, 24, 22); R(g, '#1a0a08', cx - 11, 23, 22, 21); R(g, '#ff7a30', cx - 6, 36, 12, 6); R(g, '#ffd060', cx - 3, 38, 6, 3); roundWin(g, W - 54, 22, 10);
    bedElf(g, 10, 54, '#2a5a8a'); bedElf(g, W - 44, 54, '#7a3a5a'); roundTable(g, cx, 100, 14); stool(g, cx - 30, 96); stool(g, cx + 22, 96);
    R(g, OUT, 10, 128, 28, 26); R(g, '#7a5a3a', 11, 129, 26, 24); R(g, '#4a3220', 11, 137, 26, 1);
    R(g, OUT, W - 44, 126, 30, 28); R(g, '#b88a50', W - 43, 127, 28, 26); for (let i = 0; i < 6; i++) R(g, ['#2a7a5a', '#7a3a5a', '#e8c040'][i % 3], W - 42 + i * 4, 130, 3, 20);
    lantern(g, 62, 50); lantern(g, 126, 50); door(g, cx);
  }
  frame(g);
}
