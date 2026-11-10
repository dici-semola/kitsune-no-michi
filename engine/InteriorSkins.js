// INTERNI DI HINOMURA (anteprima): stanza 12x8 tile (192x128 px) con parete di fondo alta, pavimento proprio e arredi che identificano il luogo.
import { R, lite, dark, mix, OUT, exitCue } from './BuildingSkins.js';
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const W = 192, H = 128, WALL = 40;
function shadowWalls(g) { R(g, 'rgba(10,4,24,.4)', 0, WALL, W, 3); R(g, 'rgba(10,4,24,.2)', 0, WALL + 3, W, 4); R(g, 'rgba(10,4,24,.22)', 0, WALL, 5, H - WALL); R(g, 'rgba(10,4,24,.22)', W - 5, WALL, 5, H - WALL); }
function frame(g) { R(g, OUT, 0, 0, W, 3); R(g, OUT, 0, H - 3, W, 3); R(g, OUT, 0, 0, 3, H); R(g, OUT, W - 3, 0, 3, H); }
function plasterWall(g, c, beam) { R(g, c, 0, 0, W, WALL); for (let x = 0; x < W; x += 8) R(g, dark(c, 0.06), x + 3, 4, 1, WALL - 10); R(g, beam, 0, 0, W, 5); R(g, lite(beam, 0.2), 0, 0, W, 1); R(g, beam, 0, WALL - 6, W, 4); R(g, lite(beam, 0.2), 0, WALL - 6, W, 1); for (let x = 0; x < W; x += 48) R(g, beam, x, 0, 4, WALL); R(g, OUT, 0, WALL - 2, W, 2); }
function shoji(g, x, y, w, h) { R(g, OUT, x - 1, y - 1, w + 2, h + 2); R(g, '#5a3a28', x, y, w, h); R(g, '#f4ecd4', x + 1, y + 1, w - 2, h - 2); for (let i = x + 6; i < x + w - 1; i += 6) R(g, '#5a3a28', i, y + 1, 1, h - 2); R(g, '#5a3a28', x + 1, y + h / 2, w - 2, 1); R(g, 'rgba(255,230,160,.35)', x + 1, y + 1, w - 2, 3); }
function tatami(g, x0, y0, w, h) { for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 32) { const px = x0 + x, py = y0 + y; R(g, '#4a5a2a', px, py, 32, 16); R(g, '#c8c078', px + 1, py + 1, 30, 14); R(g, '#d8d088', px + 1, py + 1, 30, 1); for (let i = 3; i < 30; i += 3) R(g, '#b8b068', px + i, py + 2, 1, 12); R(g, '#3a4a2a', px, py, 32, 1); R(g, '#2a3a1e', px + 1, py + 15, 30, 1); } }
function lantern(g, x, y) { R(g, OUT, x + 3, y - 8, 1, 8); R(g, OUT, x, y, 8, 11); R(g, '#c8283a', x + 1, y + 1, 6, 9); R(g, '#ffd878', x + 2, y + 3, 4, 5); R(g, '#f0c040', x + 1, y + 1, 6, 1); R(g, '#f0c040', x + 1, y + 9, 6, 1); R(g, 'rgba(255,200,100,.12)', x - 8, y - 4, 24, 22); }
function cushion(g, x, y, c = '#8a2a4a') { R(g, OUT, x, y, 12, 8); R(g, c, x + 1, y + 1, 10, 6); R(g, lite(c, 0.25), x + 1, y + 1, 10, 1); R(g, dark(c, 0.3), x + 1, y + 6, 10, 1); R(g, '#f0c040', x + 5, y + 3, 2, 2); }
function lowTable(g, x, y, w) { R(g, 'rgba(10,4,24,.3)', x + 1, y + 11, w, 3); R(g, OUT, x, y + 2, w + 2, 11); R(g, '#8a5a34', x + 1, y + 3, w, 6); R(g, '#c8905a', x + 1, y + 3, w, 2); R(g, '#5a3a1c', x + 1, y + 9, w, 2); R(g, '#f4ecd4', x + 5, y + 4, 5, 3); R(g, '#3a7aaa', x + 14, y + 4, 4, 3); }
function chest(g, x, y) { R(g, 'rgba(10,4,24,.3)', x, y + 23, 30, 3); R(g, OUT, x, y, 30, 24); R(g, '#7a4a2a', x + 1, y + 1, 28, 22); R(g, '#a8743c', x + 1, y + 1, 28, 2); for (let r = 0; r < 3; r++) { R(g, '#5a3a1c', x + 3, y + 4 + r * 7, 24, 1); R(g, '#c8a840', x + 13, y + 6 + r * 7, 4, 2); R(g, OUT, x + 12, y + 5 + r * 7, 6, 1); } }
function pot(g, x, y) { R(g, OUT, x, y, 12, 10); R(g, '#3a3a46', x + 1, y + 1, 10, 8); R(g, '#7a7a8a', x + 1, y + 1, 10, 1); R(g, '#ff9a40', x + 3, y - 2, 6, 3); }
export function drawRoom(g, kind) {
  if (kind === 'casa') {
    plasterWall(g, '#ece0c4', '#5a3a28'); tatami(g, 0, WALL, W, H - WALL); shadowWalls(g);
    shoji(g, 16, 8, 32, 24); shoji(g, 144, 8, 32, 24);
    R(g, OUT, 80, 6, 34, 4); R(g, '#8a2a24', 81, 7, 32, 2);   // trave decorata
    for (let i = 0; i < 5; i++) { R(g, '#e08a30', 84 + i * 6, 12, 4, 6); R(g, OUT, 85 + i * 6, 10, 1, 3); }   // cachi appesi ad essiccare
    R(g, '#8a847a', 100, 20, 0, 0);
    chest(g, 6, 46); R(g, OUT, 40, 44, 22, 14); R(g, '#c8a860', 41, 45, 20, 12); for (let i = 0; i < 4; i++) { R(g, '#f4ecd4', 43 + i * 5, 47, 3, 6); R(g, '#3a7aaa', 43 + i * 5, 47, 3, 2); }   // mensola con ceramiche
    // irori: focolare centrale con pentola appesa
    R(g, OUT, 74, 62, 44, 34); R(g, '#6a4226', 76, 64, 40, 30); R(g, '#3a2a22', 80, 68, 32, 22); R(g, '#8a847a', 82, 70, 28, 18); R(g, '#e8e0d0', 84, 72, 24, 14);
    R(g, '#ff7a30', 92, 76, 8, 5); R(g, '#ffd060', 94, 77, 4, 3); R(g, '#3a2a22', 88, 82, 16, 2);
    R(g, OUT, 95, 40, 2, 28); R(g, '#3a3a46', 90, 62, 12, 8); R(g, '#7a7a8a', 90, 62, 12, 1);
    lowTable(g, 20, 78, 28); cushion(g, 12, 90); cushion(g, 40, 92); cushion(g, 128, 74, '#2a4a8a'); cushion(g, 146, 84, '#2a4a8a'); lowTable(g, 128, 86, 30);
    R(g, OUT, 150, 46, 36, 14); R(g, '#e8e0d0', 151, 47, 34, 12); R(g, '#c8283a', 151, 47, 34, 4); R(g, '#ffffff', 154, 52, 14, 3);   // futon arrotolato
    lantern(g, 56, 24); exitCue(g, W / 2, W, H);   // noren all'ingresso
  } else if (kind === 'fabbro') {
    R(g, '#8a8478', 0, 0, W, WALL); for (let y = 0; y < WALL; y += 8) { R(g, '#5a564c', 0, y + 7, W, 1); for (let x = (y / 8 % 2) * 8; x < W; x += 16) R(g, '#5a564c', x, y, 1, 8); } R(g, '#3a2a22', 0, 0, W, 5); R(g, OUT, 0, WALL - 2, W, 2);
    for (let y = WALL; y < H; y += 16) for (let x = 0; x < W; x += 16) { R(g, '#6a665c', x, y, 16, 16); R(g, mix('#a09a8c', '#7a766c', rnd(x, y) * 0.7), x + 1, y + 1, 14, 14); R(g, '#c8c2b4', x + 1, y + 1, 14, 1); }
    shadowWalls(g);
    // forgia
    R(g, OUT, 8, 4, 52, 46); R(g, '#6a665c', 10, 18, 48, 30); R(g, '#8a847a', 10, 18, 48, 3); R(g, OUT, 20, 28, 28, 18); R(g, '#1a0a08', 21, 29, 26, 16); R(g, '#c83a10', 24, 38, 20, 6); R(g, '#ff7a30', 28, 36, 12, 6); R(g, '#ffd060', 31, 38, 6, 3); R(g, 'rgba(255,140,50,.18)', 0, 20, 70, 50);
    R(g, '#4a4a58', 18, 6, 32, 14); R(g, '#6a6a78', 18, 6, 32, 2); R(g, OUT, 30, 0, 8, 8);
    // incudine e ceppo
    R(g, 'rgba(10,4,24,.3)', 80, 88, 30, 4); R(g, OUT, 86, 76, 18, 14); R(g, '#8a5a34', 88, 78, 14, 10); R(g, OUT, 78, 62, 34, 6); R(g, '#3a3a46', 79, 63, 32, 4); R(g, '#8a8a9a', 79, 63, 32, 1); R(g, OUT, 86, 68, 18, 10); R(g, '#2a2a34', 88, 69, 14, 8); R(g, '#5a5a6a', 88, 69, 14, 1); R(g, '#ff7a30', 110, 63, 3, 2);
    R(g, OUT, 114, 70, 3, 14); R(g, '#8a5a34', 115, 71, 1, 12); R(g, OUT, 110, 68, 10, 5); R(g, '#5a5a6a', 111, 69, 8, 3);   // martello
    // mantice e mola
    R(g, OUT, 64, 26, 14, 16); R(g, '#8a5a34', 65, 27, 12, 14); R(g, '#3a2a22', 65, 31, 12, 1); R(g, '#3a2a22', 65, 36, 12, 1);
    R(g, OUT, 158, 60, 22, 22); R(g, '#7a7a86', 160, 62, 18, 18); R(g, '#a8a8b8', 164, 66, 10, 10); R(g, '#3a3a46', 168, 70, 2, 2);
    // rastrelliera e banco
    R(g, OUT, 100, 10, 56, 24); R(g, '#6a4a2a', 101, 11, 54, 22); for (let i = 0; i < 6; i++) { R(g, i % 2 ? '#c8d4e8' : '#a8b4c8', 106 + i * 8, 8, 3, 22); R(g, '#f0c040', 105 + i * 8, 28, 5, 2); R(g, '#8a2a2a', 106 + i * 8, 30, 3, 3); }
    R(g, OUT, 150, 96, 36, 16); R(g, '#8a5a34', 151, 97, 34, 14); R(g, '#c8905a', 151, 97, 34, 3); R(g, '#c8d4e8', 156, 91, 22, 2); R(g, '#f0c040', 154, 92, 4, 3);
    R(g, OUT, 8, 84, 16, 20); R(g, '#8a5a34', 9, 85, 14, 18); R(g, '#3a7aaa', 10, 86, 12, 3); R(g, '#4a3a2a', 9, 92, 14, 1); R(g, '#4a3a2a', 9, 98, 14, 1);
    exitCue(g, W / 2, W, H);
    lantern(g, 120, 22);
  } else if (kind === 'locanda') {
    plasterWall(g, '#e8d0a0', '#5a3220');
    for (let y = WALL; y < H; y += 8) { R(g, mix('#a8743c', '#8a5a2c', rnd(y, 1) * 0.6), 0, y, W, 7); R(g, '#d09858', 0, y, W, 1); R(g, '#4a2a14', 0, y + 7, W, 1); for (let x = (y / 8 % 3) * 20 + 10; x < W; x += 60) R(g, '#4a2a14', x, y, 1, 7); }
    shadowWalls(g);
    // scaffale di botti e giare dietro il bancone
    R(g, OUT, 8, 8, 100, 28); R(g, '#6a4226', 9, 9, 98, 26); R(g, '#8a5a34', 9, 21, 98, 2);
    for (let i = 0; i < 6; i++) { R(g, OUT, 12 + i * 15, 10, 12, 12); R(g, '#a8743c', 13 + i * 15, 11, 10, 10); R(g, '#d09858', 14 + i * 15, 11, 2, 10); R(g, '#4a3a2a', 13 + i * 15, 14, 10, 1); R(g, '#4a3a2a', 13 + i * 15, 18, 10, 1); }
    for (let i = 0; i < 8; i++) { R(g, i % 2 ? '#f4ecd4' : '#3a7aaa', 12 + i * 12, 26, 6, 8); R(g, OUT, 12 + i * 12, 25, 6, 1); }
    R(g, OUT, 124, 6, 44, 30); R(g, '#f0e4c0', 126, 8, 40, 26); R(g, '#c8283a', 126, 8, 40, 4); R(g, '#2a2a34', 132, 16, 28, 1); R(g, '#2a2a34', 132, 20, 22, 1); R(g, '#2a2a34', 132, 24, 26, 1);   // menù
    // bancone lungo
    R(g, 'rgba(10,4,24,.3)', 14, 70, 110, 4); R(g, OUT, 12, 48, 114, 24); R(g, '#8a5a34', 13, 49, 112, 22); R(g, '#c8905a', 13, 49, 112, 5); R(g, '#5a3a1c', 13, 66, 112, 4); for (let i = 0; i < 6; i++) { R(g, '#f4ecd4', 20 + i * 18, 44, 5, 5); R(g, '#3a7aaa', 28 + i * 18, 45, 4, 4); }
    for (let i = 0; i < 5; i++) { R(g, OUT, 18 + i * 22, 78, 10, 12); R(g, '#a8743c', 19 + i * 22, 79, 8, 4); R(g, '#6a4226', 22 + i * 22, 83, 2, 6); }   // sgabelli
    // tavoli bassi con cuscini
    lowTable(g, 140, 62, 30); cushion(g, 132, 78); cushion(g, 156, 80); lowTable(g, 140, 96, 30); cushion(g, 132, 106, '#2a4a8a'); cushion(g, 160, 108, '#2a4a8a');
    // focolare con pentola
    R(g, OUT, 150, 40, 28, 18); R(g, '#6a665c', 151, 41, 26, 16); R(g, '#1a0a08', 154, 46, 20, 10); R(g, '#ff7a30', 160, 50, 8, 5); R(g, '#ffd060', 162, 52, 4, 2); pot(g, 158, 36);
    lantern(g, 30, 24); lantern(g, 106, 24); lantern(g, 176, 26); lantern(g, 70, 90);
    R(g, OUT, 4, 56, 12, 50); for (let i = 0; i < 6; i++) { R(g, '#a8743c', 5, 58 + i * 8, 10, 7); R(g, '#5a3a1c', 5, 64 + i * 8, 10, 1); }   // scala per le camere
    exitCue(g, W / 2, W, H);
  }
  shadowWalls; frame(g);
}
