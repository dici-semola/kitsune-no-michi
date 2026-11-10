// INTERNI PARAMETRICI DELLE CITTÀ RESTANTI (anteprima): stesse dimensioni proporzionali all'esterno (2x larghezza, 1,5x profondità), stesso schema a pannelli senza sovrapposizioni.
import { R, lite, dark, mix, OUT, exitCue } from './BuildingSkins.js';
import { STY, disc } from './CityKit.js';
import { paveK, propK } from './UrbanKit.js';
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
let W = 192, H = 128; const WALL = 40;
export const ROOM_SIZE_K = { locanda: { ext: [8, 6], tiles: [16, 9] }, bottega: { ext: [8, 6], tiles: [16, 9] }, sala: { ext: [11, 7], tiles: [22, 10] }, casa: { ext: [6, 6], tiles: [12, 9] } };
const shadow = (g) => { R(g, 'rgba(10,4,24,.4)', 0, WALL, W, 3); R(g, 'rgba(10,4,24,.2)', 0, WALL + 3, W, 4); R(g, 'rgba(10,4,24,.22)', 0, WALL, 5, H - WALL); R(g, 'rgba(10,4,24,.22)', W - 5, WALL, 5, H - WALL); };
const frame = (g) => { R(g, OUT, 0, 0, W, 3); R(g, OUT, 0, H - 3, W, 3); R(g, OUT, 0, 0, 3, H); R(g, OUT, W - 3, 0, 3, H); };
function back(g, S) {
  const n = Math.max(2, Math.round(W / 64)), pitch = W / n, c = [], wc = S.wall.c, a = S.wall.a;
  R(g, wc, 0, 0, W, WALL);
  if (S.wall.k === 'planks' || S.wall.k === 'bamboo' || S.wall.k === 'logs') for (let x = 0; x < W; x += 5) { R(g, dark(wc, 0.15), x + 4, 0, 1, WALL); R(g, lite(wc, 0.12), x, 0, 1, WALL); }
  else if (S.wall.k === 'stone' || S.wall.k === 'marble') for (let y = 0; y < WALL; y += 8) { R(g, dark(wc, 0.25), 0, y + 7, W, 1); for (let x = (y / 8 % 2) * 8; x < W; x += 16) R(g, dark(wc, 0.25), x, y, 1, 8); }
  else if (S.wall.k === 'metal') { for (let y = 6; y < WALL; y += 8) R(g, dark(wc, 0.4), 0, y, W, 1); for (let x = 12; x < W; x += 24) { R(g, '#ff3fa4', x, 10, 8, 1); R(g, '#40e0ff', x + 10, 18, 5, 1); } }
  else for (let i = 0; i < W * 0.3; i++) R(g, rnd(i, 3) < 0.5 ? lite(wc, 0.08) : dark(wc, 0.1), Math.floor(rnd(i, 4) * W), 4 + Math.floor(rnd(i, 5) * (WALL - 10)), 3, 1);
  R(g, a, 0, 0, W, 5); R(g, lite(a, 0.2), 0, 0, W, 1); R(g, a, 0, WALL - 6, W, 5); R(g, dark(a, 0.4), 0, WALL - 2, W, 2); R(g, OUT, 0, WALL - 1, W, 1);
  for (let i = 0; i <= n; i++) { const x = Math.round(i * pitch) - (i === n ? 5 : i === 0 ? 0 : 2); const pc = S.wall.k === 'marble' ? '#f4eee0' : S.wall.k === 'metal' ? '#5a5a70' : S.wall.k === 'stone' ? '#9a9aa8' : dark(a, 0.1); R(g, pc, x, 0, 5, WALL); R(g, lite(pc, 0.3), x, 0, 1, WALL); R(g, dark(pc, 0.4), x + 4, 0, 1, WALL); if (id0 === 'nethermere') { R(g, 'rgba(120,255,200,.2)', x - 2, 0, 9, WALL); } }
  for (let i = 0; i < n; i++) c.push(Math.round(i * pitch + pitch / 2));
  return c;
}
let id0 = '';
const floor = (g, S) => { for (let y = WALL; y < H; y += 16) for (let x = 0; x < W; x += 16) paveK(g, S.paving[0], x, y, (x + y) >> 4, id0); };
const windowK = (g, S, cx) => { const k = S.win; R(g, OUT, cx - 14, 6, 28, 28); if (k === 'neon') { R(g, '#10101a', cx - 13, 7, 26, 26); for (let i = 0; i < 4; i++) R(g, i % 2 ? '#40e0ff' : '#ff3fa4', cx - 11, 10 + i * 6, 22, 2); R(g, 'rgba(255,63,164,.2)', cx - 16, 4, 32, 32); } else if (k === 'glow') { disc(g, cx, 20, 13, OUT); disc(g, cx, 20, 12, '#80ffd0'); disc(g, cx - 3, 16, 4, '#e8fff4'); R(g, 'rgba(120,255,200,.25)', cx - 18, 2, 36, 36); } else if (k === 'slit') { R(g, '#1a1018', cx - 13, 7, 26, 26); R(g, '#ffb040', cx - 3, 8, 6, 24); R(g, 'rgba(255,170,60,.25)', cx - 10, 6, 20, 28); } else if (k === 'round') { disc(g, cx, 20, 13, OUT); disc(g, cx, 20, 12, '#8a5a34'); disc(g, cx, 20, 10, '#9ae0e8'); R(g, '#8a5a34', cx - 10, 20, 20, 1); R(g, '#8a5a34', cx, 10, 1, 20); } else if (k === 'lattice') { R(g, '#5a3a1a', cx - 13, 7, 26, 26); for (let i = 0; i < 26; i += 4) R(g, '#c8a060', cx - 13 + i, 8, 1, 24); for (let j = 0; j < 26; j += 4) R(g, '#c8a060', cx - 12, 7 + j, 24, 1); R(g, '#2a5a8a', cx - 13, 7, 26, 3); } else { R(g, '#2a2230', cx - 13, 7, 26, 26); R(g, '#7ab0d8', cx - 12, 8, 24, 24); R(g, '#c8e8fa', cx - 12, 8, 24, 8); R(g, '#3a2a22', cx - 1, 8, 2, 24); R(g, '#3a2a22', cx - 12, 19, 24, 2); if (k === 'shutters') { R(g, '#2a5a9a', cx - 18, 6, 5, 28); R(g, '#2a5a9a', cx + 13, 6, 5, 28); } } };
const banner = (g, S, cx) => { R(g, OUT, cx - 11, 4, 22, 32); R(g, S.accent, cx - 10, 5, 20, 30); R(g, '#e8c040', cx - 10, 5, 20, 3); R(g, '#e8c040', cx - 10, 32, 20, 3); disc(g, cx, 20, 6, '#f4ecd4'); disc(g, cx, 20, 3, S.accent); };
const shelf = (g, S, cx, w = 44) => { const x = cx - w / 2; R(g, OUT, x, 5, w, 31); R(g, dark(S.wall.a, 0.2), x + 1, 6, w - 2, 29); for (const yy of [6, 21]) { R(g, dark(S.wall.a, 0.45), x + 2, yy + 13, w - 4, 2); for (let i = 0; i < (w - 6) / 8; i++) { R(g, OUT, x + 3 + i * 8, yy + 4, 7, 10); R(g, [S.accent, '#e8c040', '#f4ecd4', S.wall.a][(i + yy) % 4], x + 4 + i * 8, yy + 5, 5, 8); } } };
const rack = (g, S, cx, w = 50) => { const x = cx - w / 2; R(g, OUT, x, 5, w, 31); R(g, dark(S.wall.a, 0.2), x + 1, 6, w - 2, 29); for (let i = 0; i < (w - 6) / 7; i++) { R(g, i % 2 ? '#c8d4e8' : '#a8b4c8', x + 4 + i * 7, 8, 3, 24); R(g, '#e8c040', x + 3 + i * 7, 28, 5, 2); } };
const lampAt = (g, S, x, y) => { R(g, OUT, x + 3, y - 6, 1, 6); disc(g, x + 4, y + 5, 5, OUT); disc(g, x + 4, y + 5, 4, S.lamp); R(g, '#fff8e0', x + 2, y + 3, 2, 3); R(g, `rgba(${S.glow},.14)`, x - 8, y - 4, 26, 26); };
const stool = (g, S, x, y) => { R(g, OUT, x, y, 9, 9); R(g, S.accent, x + 1, y + 1, 7, 4); R(g, lite(S.accent, 0.3), x + 1, y + 1, 7, 1); R(g, dark(S.wall.a, 0.3), x + 3, y + 5, 3, 4); };
const roundTable = (g, S, x, y, r = 12) => { R(g, 'rgba(10,4,24,.3)', x - r, y + 6, r * 2 + 4, 5); R(g, OUT, x - 2, y + 2, 4, 9); R(g, dark(S.wall.a, 0.3), x - 1, y + 3, 2, 8); for (let j = -r / 2; j <= r / 2; j++) { const hw = Math.round(Math.sqrt(r * r / 4 - j * j) * 2); R(g, OUT, x - hw - 1, y - 6 + j + 5, 2 * hw + 2, 1); R(g, mix(S.wall.a, '#ffffff', 0.2), x - hw, y - 6 + j + 5, 2 * hw, 1); } R(g, '#f4ecd4', x - 4, y - 4, 3, 3); R(g, S.accent, x + 3, y - 3, 4, 3); };
const counter = (g, S, x, y, w) => { R(g, 'rgba(10,4,24,.3)', x + 2, y + 27, w, 4); R(g, OUT, x, y, w + 2, 28); R(g, dark(S.wall.a, 0.25), x + 1, y + 1, w, 26); R(g, lite(S.wall.a, 0.2), x + 1, y + 1, w, 6); R(g, S.accent, x + 1, y + 7, w, 1); R(g, dark(S.wall.a, 0.5), x + 1, y + 20, w, 6); };
const rug = (g, S, x, y, w, h) => { R(g, OUT, x, y, w, h); R(g, S.accent, x + 1, y + 1, w - 2, h - 2); R(g, '#e8c040', x + 3, y + 3, w - 6, 1); R(g, '#e8c040', x + 3, y + h - 4, w - 6, 1); R(g, dark(S.accent, 0.3), x + 5, y + 5, w - 10, h - 10); disc(g, x + w / 2, y + h / 2, Math.min(w, h) / 5, '#e8c040'); };
const bed = (g, S, x, y) => { R(g, 'rgba(10,4,24,.3)', x, y + 40, 40, 3); R(g, OUT, x, y, 40, 42); R(g, dark(S.wall.a, 0.25), x + 1, y + 1, 38, 8); R(g, '#f4ecd4', x + 4, y + 11, 14, 9); R(g, S.accent, x + 3, y + 20, 34, 20); R(g, lite(S.accent, 0.25), x + 3, y + 20, 34, 2); };
const wardrobe = (g, S, x, y) => { R(g, 'rgba(10,4,24,.3)', x, y + 40, 34, 3); R(g, OUT, x, y, 34, 42); R(g, dark(S.wall.a, 0.2), x + 1, y + 1, 32, 40); R(g, lite(S.wall.a, 0.2), x + 1, y + 1, 32, 3); R(g, dark(S.wall.a, 0.5), x + 17, y + 3, 1, 38); R(g, '#e8c040', x + 13, y + 20, 2, 4); R(g, '#e8c040', x + 20, y + 20, 2, 4); };
const exitC = (g) => exitCue(g, W / 2, W, H);
function accents(g, S, id, kind) {   // un elemento caratteristico della città, sempre in uno spazio libero lungo il bordo inferiore
  const y = H - 54, xs = [14, W - 40];
  const put = (n, x, yy) => propK(g, id, n, x, yy);
  if (id === 'augusta') { for (const x of [10, W - 30]) { R(g, OUT, x, 44, 12, H - 62); R(g, '#f4eee0', x + 1, 45, 10, H - 64); R(g, '#c8bca0', x + 7, 45, 3, H - 64); } }
  else if (id === 'sahar') { for (const [x, yy] of [[14, y], [W - 44, y + 4]]) { R(g, OUT, x, yy, 26, 12); R(g, '#c8503a', x + 1, yy + 1, 24, 10); R(g, '#e8c040', x + 1, yy + 1, 24, 2); } }
  else if (id === 'portomarea') { put('barrel', 10, y); put('net', W - 38, y - 4); }
  else if (id === 'kuru') { put('drum', 12, y); put('totem', W - 30, y - 12); }
  else if (id === 'zeroquartier') { put('holo', 14, y); put('vending', W - 36, y - 6); }
  else if (id === 'coralia') { for (const x of xs) { R(g, OUT, x, y, 28, 14); R(g, '#e87a6a', x + 1, y + 1, 26, 12); for (let i = 0; i < 26; i += 4) R(g, '#c8a860', x + 1 + i, y + 1, 1, 12); } }
  else if (id === 'khaz_dum') { put('anvil', 12, y); put('forgepot', W - 36, y - 2); }
  else if (id === 'nethermere') { put('mushroom', 12, y - 2); put('crystal', W - 34, y - 2); }
}
export function drawRoomK(g, id, kind) {
  id0 = id; const S = STY[id], [tw, th] = ROOM_SIZE_K[kind].tiles; W = tw * 16; H = WALL + th * 16; const cx = W / 2, p = back(g, S);
  floor(g, S); shadow(g);
  if (kind === 'locanda') {
    banner(g, S, p[0]); windowK(g, S, p[1]); shelf(g, S, p[2]); banner(g, S, p[3]);
    counter(g, S, 10, 62, 100); for (let i = 0; i < 4; i++) stool(g, S, 22 + i * 24, 98); for (let i = 0; i < 4; i++) { R(g, '#f4ecd4', 20 + i * 22, 58, 5, 5); R(g, S.accent, 26 + i * 22, 56, 6, 7); }
    for (const [tx, ty] of [[W - 66, 112], [W - 130, 126], [cx - 20, 146]]) { roundTable(g, S, tx, ty, 12); stool(g, S, tx - 24, ty - 4); stool(g, S, tx + 16, ty - 4); }
    rug(g, S, cx - 40, 108, 60, 28); lampAt(g, S, 64, 42); lampAt(g, S, 168, 42);
  } else if (kind === 'bottega') {
    shelf(g, S, p[0]); windowK(g, S, p[1]); banner(g, S, p[2]); shelf(g, S, p[3]);
    counter(g, S, 40, 66, 176); for (const [sx, sy] of [[8, 112], [W - 42, 112]]) { R(g, OUT, sx, sy, 34, 26); R(g, '#c8a860', sx + 1, sy + 1, 32, 24); R(g, '#e8d090', sx + 1, sy + 1, 32, 4); R(g, S.accent, sx + 12, sy + 14, 10, 4); }
    for (const [bx, by] of [[cx - 50, 128], [cx + 30, 128]]) { R(g, OUT, bx, by, 24, 20); R(g, '#a87a3a', bx + 1, by + 1, 22, 18); }
    lampAt(g, S, 70, 44); lampAt(g, S, W - 78, 44);
  } else if (kind === 'sala') {
    rack(g, S, p[0]); banner(g, S, p[1]); windowK(g, S, p[2]); windowK(g, S, p[3]); banner(g, S, p[4]); rack(g, S, p[5]);
    R(g, OUT, cx - 36, WALL + 6, 72, 22); R(g, dark(S.wall.a, 0.25), cx - 35, WALL + 7, 70, 20); R(g, lite(S.wall.a, 0.2), cx - 35, WALL + 7, 70, 4); R(g, '#e8c040', cx - 35, WALL + 11, 70, 1);
    R(g, OUT, cx - 9, WALL - 6, 18, 22); R(g, '#c89a2a', cx - 8, WALL - 5, 16, 20); R(g, '#e8c860', cx - 8, WALL - 5, 16, 3); R(g, S.accent, cx - 5, WALL + 2, 10, 10);
    for (const [mx, my] of [[cx - 100, WALL + 76], [cx - 50, WALL + 76], [cx + 20, WALL + 76], [cx + 70, WALL + 76], [cx - 100, WALL + 118], [cx - 50, WALL + 118], [cx + 20, WALL + 118], [cx + 70, WALL + 118]]) rug(g, S, mx, my, 40, 28);
    lampAt(g, S, 100, WALL + 4); lampAt(g, S, W - 110, WALL + 4);
  } else if (kind === 'casa') {
    banner(g, S, p[0]); windowK(g, S, p[1]); shelf(g, S, p[2], 40);
    bed(g, S, 10, 52); wardrobe(g, S, W - 44, 52); roundTable(g, S, cx, 112, 14); stool(g, S, cx - 30, 108); stool(g, S, cx + 22, 108); rug(g, S, cx - 34, 126, 68, 28);
    lampAt(g, S, 64, 44); lampAt(g, S, W - 76, 44);
  }
  if (kind !== 'casa' && kind !== 'sala') accents(g, S, id, kind);
  exitC(g); frame(g);
}
