// INTERNI DI LONGXI (anteprima): pilastri laccati, pannelli di calce, lanterne di carta. Dimensioni proporzionali all'esterno (larghezza 2x, profondità 1,5x).
// Regola anti-sovrapposizione: sulla parete di fondo ogni oggetto sta centrato in un "pannello" fra due pilastri e più stretto del pannello.
import { R, lite, dark, mix, OUT, exitCue } from './BuildingSkins.js';
import { cnLantern } from './BuildingSkinsCN.js';
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const hw = Math.round(Math.sqrt(r * r - y * y)); R(g, c, cx - hw, cy + y, hw * 2 + 1, 1); } };
let W = 192, H = 128; const WALL = 40;
export const ROOM_SIZE_CN = { locanda: { ext: [8, 6], tiles: [16, 9] }, bottega: { ext: [8, 6], tiles: [16, 9] }, sala: { ext: [11, 7], tiles: [22, 10] }, casa: { ext: [6, 6], tiles: [12, 9] } };
const shadow = (g) => { R(g, 'rgba(10,4,24,.4)', 0, WALL, W, 3); R(g, 'rgba(10,4,24,.2)', 0, WALL + 3, W, 4); R(g, 'rgba(10,4,24,.22)', 0, WALL, 5, H - WALL); R(g, 'rgba(10,4,24,.22)', W - 5, WALL, 5, H - WALL); };
const frame = (g) => { R(g, OUT, 0, 0, W, 3); R(g, OUT, 0, H - 3, W, 3); R(g, OUT, 0, 0, 3, H); R(g, OUT, W - 3, 0, 3, H); };
function back(g) {   // parete di fondo con pilastri; restituisce i centri dei pannelli
  const n = Math.max(2, Math.round(W / 64)), pitch = W / n, c = [];
  R(g, '#f0e8d8', 0, 0, W, WALL); R(g, '#3a2218', 0, 0, W, 6); R(g, '#e8c040', 0, 6, W, 1); for (let x = 4; x < W - 4; x += 5) { R(g, ((x / 5) | 0) % 2 ? '#2a5a9a' : '#2a8a6a', x, 7, 4, 4); } R(g, '#a8302a', 0, WALL - 6, W, 6); R(g, dark('#a8302a', 0.4), 0, WALL - 2, W, 2); R(g, OUT, 0, WALL - 1, W, 1);
  for (let i = 0; i <= n; i++) { const x = Math.round(i * pitch) - (i === n ? 5 : i === 0 ? 0 : 2); R(g, '#b8302a', x, 0, 5, WALL); R(g, lite('#b8302a', 0.25), x, 0, 1, WALL); R(g, dark('#b8302a', 0.4), x + 4, 0, 1, WALL); }
  for (let i = 0; i < n; i++) c.push(Math.round(i * pitch + pitch / 2));
  return c;
}
function floor(g, c1, c2) { for (let y = WALL; y < H; y += 16) for (let x = 0; x < W; x += 16) { R(g, c2, x, y, 16, 16); R(g, mix(c1, c2, rnd(x, y) * 0.5), x + 1, y + 1, 14, 14); R(g, lite(c1, 0.15), x + 1, y + 1, 14, 1); } }
const scroll = (g, cx) => { R(g, OUT, cx - 11, 4, 22, 32); R(g, '#e8d8a8', cx - 10, 5, 20, 30); R(g, '#8a2a2a', cx - 10, 5, 20, 3); R(g, '#8a2a2a', cx - 10, 32, 20, 3); for (const [y, w] of [[12, 12], [17, 8], [22, 12], [27, 6]]) R(g, '#2a2a34', cx - w / 2, y, w, 2); R(g, '#c8302a', cx + 4, 26, 4, 4); };
const window2 = (g, cx) => { R(g, OUT, cx - 14, 6, 28, 28); R(g, '#3a2218', cx - 13, 7, 26, 26); R(g, '#7a1e1e', cx - 12, 8, 24, 24); for (let i = -24; i < 24; i += 6) for (let k = 0; k < 24; k++) { const px = cx - 12 + i + k, px2 = cx - 12 + i + 24 - k; if (px > cx - 12 && px < cx + 11) R(g, '#e8c8a0', px, 8 + k, 1, 1); if (px2 > cx - 12 && px2 < cx + 11) R(g, '#e8c8a0', px2, 8 + k, 1, 1); } };
const shelf = (g, cx, w = 44, cols = ['#3a8a6a', '#c89a2a', '#f4ecd4', '#8a3a2a']) => { const x = cx - w / 2; R(g, OUT, x, 5, w, 31); R(g, '#7a4a2a', x + 1, 6, w - 2, 29); for (const yy of [6, 21]) { R(g, '#4a2a14', x + 2, yy + 13, w - 4, 2); for (let i = 0; i < (w - 6) / 8; i++) { R(g, OUT, x + 3 + i * 8, yy + 4, 7, 10); R(g, cols[(i + yy) % 4], x + 4 + i * 8, yy + 5, 5, 8); R(g, '#e8c040', x + 4 + i * 8, yy + 5, 5, 1); } } };
const rack = (g, cx, w = 50) => { const x = cx - w / 2; R(g, OUT, x, 5, w, 31); R(g, '#7a4a2a', x + 1, 6, w - 2, 29); for (let i = 0; i < (w - 6) / 7; i++) { R(g, i % 2 ? '#c8d4e8' : '#a8b4c8', x + 4 + i * 7, 8, 3, 24); R(g, '#e8c040', x + 3 + i * 7, 28, 5, 2); R(g, '#b8302a', x + 4 + i * 7, 30, 3, 4); } R(g, '#4a2a14', x + 2, 14, w - 4, 2); };
const stool = (g, x, y) => { R(g, OUT, x, y, 9, 9); R(g, '#c8302a', x + 1, y + 1, 7, 4); R(g, '#e8c040', x + 1, y + 1, 7, 1); R(g, '#7a2a1a', x + 3, y + 5, 3, 4); };
const roundTable = (g, x, y, r = 12) => { R(g, 'rgba(10,4,24,.3)', x - r, y + 6, r * 2 + 4, 5); R(g, OUT, x - 2, y + 2, 4, 9); R(g, '#7a2a1a', x - 1, y + 3, 2, 8); for (let j = -r / 2; j <= r / 2; j++) { const hw = Math.round(Math.sqrt(r * r / 4 - j * j) * 2); R(g, OUT, x - hw - 1, y - 6 + j + 5, 2 * hw + 2, 1); R(g, '#a8482a', x - hw, y - 6 + j + 5, 2 * hw, 1); } R(g, '#f4ecd4', x - 4, y - 4, 3, 3); R(g, '#3a8a6a', x + 3, y - 3, 4, 3); };
const counter = (g, x, y, w) => { R(g, 'rgba(10,4,24,.3)', x + 2, y + 27, w, 4); R(g, OUT, x, y, w + 2, 28); R(g, '#7a2a1a', x + 1, y + 1, w, 26); R(g, '#a8482a', x + 1, y + 1, w, 6); R(g, '#e8c040', x + 1, y + 7, w, 1); R(g, '#4a1a0a', x + 1, y + 20, w, 6); };
const screen4 = (g, x, y) => { for (let i = 0; i < 4; i++) { R(g, OUT, x + i * 14, y, 15, 34); R(g, '#e8d8a8', x + i * 14 + 1, y + 1, 13, 32); R(g, '#7a2a1a', x + i * 14 + 1, y + 1, 13, 3); R(g, ['#3a8a6a', '#c8302a', '#2a5a9a', '#c89a2a'][i], x + i * 14 + 4, y + 10, 7, 12); } };
const bed = (g, x, y) => { R(g, 'rgba(10,4,24,.3)', x, y + 40, 40, 3); R(g, OUT, x, y, 40, 42); R(g, '#7a2a1a', x + 1, y + 1, 38, 8); R(g, '#e8c040', x + 1, y + 1, 38, 1); R(g, '#f4ecd4', x + 4, y + 11, 14, 9); R(g, '#c8302a', x + 3, y + 20, 34, 20); R(g, lite('#c8302a', 0.25), x + 3, y + 20, 34, 2); for (let i = 0; i < 4; i++) R(g, '#e8c040', x + 8 + i * 8, y + 26, 3, 3); };
const wardrobe = (g, x, y) => { R(g, 'rgba(10,4,24,.3)', x, y + 40, 34, 3); R(g, OUT, x, y, 34, 42); R(g, '#7a2a1a', x + 1, y + 1, 32, 40); R(g, '#a8482a', x + 1, y + 1, 32, 3); R(g, '#4a1a0a', x + 17, y + 3, 1, 38); R(g, '#e8c040', x + 13, y + 20, 2, 4); R(g, '#e8c040', x + 20, y + 20, 2, 4); R(g, '#e8c040', x + 4, y + 8, 8, 8); R(g, '#e8c040', x + 22, y + 8, 8, 8); };
const rugC = (g, x, y, w, h, c = '#a8302a') => { R(g, OUT, x, y, w, h); R(g, c, x + 1, y + 1, w - 2, h - 2); R(g, '#e8c040', x + 3, y + 3, w - 6, 1); R(g, '#e8c040', x + 3, y + h - 4, w - 6, 1); R(g, dark(c, 0.3), x + 5, y + 5, w - 10, h - 10); disc(g, x + w / 2, y + h / 2, Math.min(w, h) / 5, '#e8c040'); disc(g, x + w / 2, y + h / 2, Math.min(w, h) / 8, c); };
const incense = (g, x, y) => { R(g, OUT, x, y + 6, 14, 12); R(g, '#a8842a', x + 1, y + 7, 12, 10); R(g, '#e8c040', x + 1, y + 7, 12, 2); R(g, '#c8302a', x + 4, y, 1, 7); R(g, '#c8302a', x + 8, y - 2, 1, 9); R(g, 'rgba(220,220,230,.45)', x + 3, y - 6, 2, 6); };
const drum = (g, x, y) => { R(g, 'rgba(10,4,24,.3)', x, y + 20, 22, 3); R(g, OUT, x + 2, y + 14, 3, 8); R(g, OUT, x + 17, y + 14, 3, 8); disc(g, x + 11, y + 9, 10, OUT); disc(g, x + 11, y + 9, 9, '#a8302a'); disc(g, x + 11, y + 9, 6, '#e8d8b0'); R(g, '#e8c040', x + 2, y + 8, 18, 1); };
const lanternAt = (g, x, y) => cnLantern(g, x, y);
const door = (g) => exitCue(g, W / 2, W, H);
export function drawRoomCN(g, kind) {
  const [tw, th] = ROOM_SIZE_CN[kind].tiles; W = tw * 16; H = WALL + th * 16; const cx = W / 2;
  if (kind === 'locanda') {
    const p = back(g); floor(g, '#a8a8b4', '#6a6a78'); shadow(g); scroll(g, p[0]); window2(g, p[1]); shelf(g, p[2], 44, ['#f4ecd4', '#3a8a6a', '#c89a2a']); scroll(g, p[3]);
    counter(g, 10, 62, 100); for (let i = 0; i < 4; i++) stool(g, 22 + i * 24, 98);
    for (let i = 0; i < 4; i++) { R(g, '#f4ecd4', 20 + i * 22, 58, 5, 5); R(g, '#3a8a6a', 26 + i * 22, 56, 6, 7); }   // servizi da tè sul bancone
    screen4(g, W - 74, 46); for (const [tx, ty] of [[W - 66, 120], [W - 130, 132], [cx - 20, 150]]) { roundTable(g, tx, ty, 12); stool(g, tx - 24, ty - 4); stool(g, tx + 16, ty - 4); }
    rugC(g, cx - 40, 108, 60, 28, '#a8302a'); lanternAt(g, 64, 42); lanternAt(g, 168, 42); lanternAt(g, cx - 4, 88); door(g);
  } else if (kind === 'bottega') {
    const p = back(g); floor(g, '#a8a8b4', '#6a6a78'); shadow(g); shelf(g, p[0], 44, ['#3a8a6a', '#c89a2a', '#8a3a2a']); window2(g, p[1]); scroll(g, p[2]); shelf(g, p[3], 44, ['#f4ecd4', '#c89a2a', '#3a8a6a']);
    counter(g, 40, 66, 176); R(g, OUT, cx - 18, 56, 36, 10); R(g, '#7a2a1a', cx - 17, 57, 34, 8); for (let i = 0; i < 6; i++) { R(g, '#e8c040', cx - 14 + i * 5, 58, 2, 6); R(g, '#f4ecd4', cx - 14 + i * 5, 60, 2, 1); }   // pallottoliere
    for (const [sx, sy] of [[8, 112], [W - 42, 112]]) { R(g, 'rgba(10,4,24,.3)', sx, sy + 24, 34, 3); R(g, OUT, sx, sy, 34, 26); R(g, '#c8a860', sx + 1, sy + 1, 32, 24); R(g, '#e8d090', sx + 1, sy + 1, 32, 4); R(g, '#8a6a30', sx + 4, sy + 10, 26, 1); R(g, '#8a3a2a', sx + 12, sy + 14, 10, 4); }
    for (const [bx, by] of [[cx - 50, 128], [cx + 30, 128]]) { R(g, OUT, bx, by, 24, 20); R(g, '#a87a3a', bx + 1, by + 1, 22, 18); for (let k = 0; k < 5; k++) R(g, '#c89a5a', bx + 3 + k * 4, by + 2, 2, 16); }
    lanternAt(g, 70, 44); lanternAt(g, W - 78, 44); door(g);
  } else if (kind === 'sala') {
    const p = back(g); for (let y = WALL; y < H; y += 16) for (let x = 0; x < W; x += 16) { R(g, '#4a3a2a', x, y, 16, 16); R(g, mix('#a88a5a', '#8a6a3a', rnd(x, y) * 0.8), x + 1, y + 1, 14, 14); R(g, '#c8aa7a', x + 1, y + 1, 14, 1); } shadow(g);
    rack(g, p[0]); scroll(g, p[1]); window2(g, p[2]); window2(g, p[3]); scroll(g, p[4]); rack(g, p[5]);
    R(g, OUT, cx - 36, WALL + 6, 72, 22); R(g, '#7a2a1a', cx - 35, WALL + 7, 70, 20); R(g, '#a8482a', cx - 35, WALL + 7, 70, 4); R(g, '#e8c040', cx - 35, WALL + 11, 70, 1);   // pedana della maestra
    R(g, OUT, cx - 9, WALL - 6, 18, 22); R(g, '#c89a2a', cx - 8, WALL - 5, 16, 20); R(g, '#e8c860', cx - 8, WALL - 5, 16, 3); R(g, '#a8302a', cx - 5, WALL + 2, 10, 10);   // seggio
    incense(g, cx - 30, WALL + 10); incense(g, cx + 16, WALL + 10); drum(g, cx - 120, WALL + 44); drum(g, cx + 98, WALL + 44);
    for (const [mx, my] of [[cx - 100, WALL + 76], [cx - 50, WALL + 76], [cx + 20, WALL + 76], [cx + 70, WALL + 76], [cx - 100, WALL + 118], [cx - 50, WALL + 118], [cx + 20, WALL + 118], [cx + 70, WALL + 118]]) rugC(g, mx, my, 40, 28, '#3a6a8a');   // stuoie per l'addestramento
    lanternAt(g, 100, WALL + 4); lanternAt(g, W - 110, WALL + 4); door(g);
  } else if (kind === 'casa') {
    const p = back(g); floor(g, '#a8a8b4', '#6a6a78'); shadow(g); scroll(g, p[0]); window2(g, p[1]);
    R(g, OUT, p[2] - 20, 4, 40, 34); R(g, '#7a2a1a', p[2] - 19, 5, 38, 32); R(g, '#e8c040', p[2] - 19, 5, 38, 2); R(g, '#f4ecd4', p[2] - 6, 10, 12, 14); R(g, '#c8302a', p[2] - 4, 12, 8, 3); incense(g, p[2] - 7, 28);   // altarino di famiglia
    bed(g, 10, 52); wardrobe(g, W - 44, 52); roundTable(g, cx, 112, 14); stool(g, cx - 30, 108); stool(g, cx + 22, 108); rugC(g, cx - 34, 126, 68, 28, '#a8302a');
    lanternAt(g, 64, 44); lanternAt(g, W - 76, 44); door(g);
  }
  frame(g);
}
