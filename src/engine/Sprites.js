// Tutta la grafica è procedurale (pixel art generata col Canvas): nessun asset esterno da caricare.
// Sostituire con spritesheet reali richiede solo di riscrivere queste funzioni.
import { DEFS } from '../data/tiles.js';
import { hash2 } from '../core/Util.js';
import { TALL_STYLE } from './TallSprites.js';

const S = 16;
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const rn = (v, i) => hash2(v * 13 + i, i * 7 + v, 5);

// ---------- TILE ----------
const STYLE = {
  speck(g, c, f, v) { R(g, c[0], 0, 0, S, S); for (let i = 0; i < 10; i++) R(g, c[1 + (i & 1)], (rn(v, i) * S) | 0, (rn(v, i + 30) * S) | 0, i % 4 ? 1 : 2, 1); },
  water(g, c, f) {
    R(g, c[0], 0, 0, S, S);
    for (let r = 0; r < 4; r++) for (let x = 0; x < S; x += 8) { const o = Math.round(Math.sin((x / 8 + f / 2 + r) * Math.PI)); R(g, c[1], (x + r * 3) % S, r * 4 + 1 + o, 4, 1); }
    R(g, c[2], 0, S - 1, S, 1);
  },
  tiles(g, c) { R(g, c[0], 0, 0, S, S); R(g, c[2], 0, 0, S, 1); R(g, c[2], 0, 8, S, 1); R(g, c[2], 0, 0, 1, 8); R(g, c[2], 8, 8, 1, 8); R(g, c[1], 1, 1, 6, 1); R(g, c[1], 9, 9, 6, 1); },
  planks(g, c) { R(g, c[0], 0, 0, S, S); for (let y = 0; y < S; y += 4) R(g, c[2], 0, y, S, 1); R(g, c[1], 3, 1, 5, 1); R(g, c[1], 9, 6, 5, 1); R(g, c[1], 2, 10, 5, 1); R(g, c[2], 7, 0, 1, 4); R(g, c[2], 12, 8, 1, 4); },
  neon(g, c, f) { R(g, c[0], 0, 0, S, S); R(g, c[1], 0, 7, S, 1); R(g, c[2], 0, 8, S, 1); R(g, c[2], (f * 4) % S, 0, 2, S); R(g, '#1c1740', 0, 0, S, 1); },
  void(g, c, f, v) { R(g, c[0], 0, 0, S, S); for (let i = 0; i < 5; i++) R(g, i % 2 ? c[1] : c[2], (rn(v, i) * S) | 0, (((rn(v, i + 9) * S) + f * i) % S) | 0, 1, 1); },
  bridge(g, c) { R(g, c[2], 0, 0, S, S); for (let y = 0; y < S; y += 4) { R(g, c[0], 0, y, S, 3); R(g, c[1], 0, y, S, 1); } },
  cobble(g, c, f, v) { R(g, c[0], 0, 0, S, S); for (let i = 0; i < 5; i++) { const x = (i % 3) * 5 + (i > 2 ? 2 : 0), y = ((i / 3) | 0) * 8 + (i % 2) * 2; R(g, c[1], x, y, 4, 3); R(g, c[2], x, y + 3, 4, 1); } },
  rug(g, c) { R(g, c[0], 0, 0, S, S); R(g, c[1], 0, 0, S, 1); R(g, c[1], 0, S - 1, S, 1); R(g, c[2], 3, 3, S - 6, S - 6); R(g, c[1], 7, 7, 2, 2); },
  time(g, c, f, v) { R(g, c[0], 0, 0, S, S); R(g, c[1], 0, ((f * 4) % S), S, 1); R(g, c[2], (rn(v, 1) * S) | 0, (rn(v, 2) * S) | 0, 2, 1); R(g, c[1], 0, 15, S, 1); },
  tree(g, c) { R(g, 'rgba(0,0,0,.25)', 3, 13, 10, 2); R(g, c[2], 7, 9, 3, 6); R(g, c[0], 2, 2, 12, 9); R(g, c[1], 4, 1, 8, 8); R(g, c[1], 3, 5, 4, 3); R(g, c[0], 9, 6, 4, 3); },
  rock(g, c) { R(g, c[2], 2, 11, 12, 3); R(g, c[0], 2, 4, 12, 9); R(g, c[1], 4, 3, 8, 4); R(g, c[1], 3, 6, 3, 3); R(g, c[2], 9, 9, 4, 3); },
  brick(g, c) { R(g, c[0], 0, 0, S, S); for (let y = 0; y < S; y += 4) { R(g, c[2], 0, y, S, 1); for (let x = ((y / 4) % 2) * 4; x < S; x += 8) R(g, c[2], x, y, 1, 4); } R(g, c[1], 0, 0, S, 1); },
  fence(g, c) { R(g, c[0], 0, 6, S, 3); R(g, c[2], 0, 9, S, 1); for (let x = 1; x < S; x += 5) { R(g, c[1], x, 2, 3, 13); R(g, c[2], x + 2, 2, 1, 13); } },
  door(g, c) { R(g, c[2], 2, 1, 12, 15); R(g, c[0], 3, 2, 10, 14); R(g, c[1], 4, 3, 3, 12); R(g, '#e8c060', 10, 9, 2, 2); },
  gate(g, c) { R(g, c[2], 0, 0, S, S); for (let x = 1; x < S; x += 4) R(g, c[0], x, 1, 3, 14); R(g, c[1], 0, 6, S, 2); },
  gateopen(g, c) { R(g, c[2], 0, 0, 2, S); R(g, c[2], 14, 0, 2, S); R(g, c[1], 0, 2, 2, 2); R(g, c[1], 14, 2, 2, 2); },
  roof(g, c) { R(g, c[0], 0, 0, S, S); for (let y = 0; y < S; y += 4) R(g, c[1], 0, y, S, 2); for (let y = 2; y < S; y += 4) for (let x = 0; x < S; x += 4) R(g, c[2], x, y + 1, 1, 1); },
  cactus(g, c) { R(g, c[0], 6, 3, 4, 11); R(g, c[1], 7, 3, 1, 10); R(g, c[0], 2, 6, 4, 2); R(g, c[0], 2, 4, 2, 4); R(g, c[0], 10, 8, 4, 2); R(g, c[0], 12, 5, 2, 5); R(g, c[2], 9, 4, 1, 10); },
  pine(g, c) { R(g, c[2], 7, 12, 2, 3); R(g, c[0], 6, 2, 4, 3); R(g, c[0], 4, 5, 8, 3); R(g, c[0], 2, 8, 12, 4); R(g, c[1], 6, 3, 2, 1); R(g, c[2], 3, 8, 3, 1); R(g, c[2], 9, 11, 4, 1); },
  neonwall(g, c, f) { R(g, c[0], 0, 0, S, S); for (let y = 2; y < S; y += 5) for (let x = 2; x < S; x += 5) R(g, (x + y + f) % 3 ? c[1] : c[2], x, y, 3, 2); R(g, c[2], 0, 0, S, 1); },
  coral(g, c) { R(g, c[2], 6, 8, 4, 6); R(g, c[0], 3, 3, 3, 8); R(g, c[0], 9, 2, 3, 9); R(g, c[1], 4, 3, 1, 6); R(g, c[1], 10, 2, 1, 7); R(g, c[0], 6, 5, 4, 3); },
  table(g, c) { R(g, c[2], 1, 5, 14, 9); R(g, c[0], 1, 4, 14, 8); R(g, c[1], 1, 4, 14, 1); },
  shelf(g, c) { R(g, c[0], 0, 0, S, S); R(g, c[2], 0, 7, S, 1); R(g, c[1], 0, 15, S, 1); for (let i = 0; i < 4; i++) { R(g, c[2], 1 + i * 4, 3, 3, 4); R(g, c[2], 2 + i * 4, 10, 2, 5); } },
  lantern(g, c) { R(g, c[0], 7, 9, 2, 6); R(g, c[0], 5, 2, 6, 1); R(g, c[1], 5, 3, 6, 6); R(g, c[2], 7, 4, 2, 4); R(g, c[0], 5, 9, 6, 1); },
  portal(g, c, f) { R(g, c[0], 3, 1, 10, 14); R(g, c[1], 4 + (f & 1), 2, 8 - (f & 1) * 2, 12); R(g, c[2], 6, 4 + (f % 3), 4, 6); },
  fountain(g, c, f) { R(g, c[2], 0, 4, S, 12); R(g, c[0], 1, 5, 14, 10); R(g, c[1], 3, 7 + (f & 1), 10, 6); R(g, c[2], 6, 2, 4, 5); R(g, '#d8f0ff', 7, 1 + (f & 1), 2, 3); },
  crystal(g, c) { R(g, c[2], 5, 6, 6, 8); R(g, c[0], 6, 2, 4, 12); R(g, c[1], 7, 3, 1, 8); R(g, c[0], 2, 8, 3, 6); R(g, c[0], 11, 9, 3, 5); },
  deadtree(g, c) { R(g, c[2], 7, 5, 3, 10); R(g, c[0], 7, 5, 2, 9); R(g, c[0], 3, 3, 2, 4); R(g, c[0], 4, 6, 4, 1); R(g, c[0], 10, 2, 2, 5); R(g, c[1], 9, 7, 4, 1); },
  holo(g, c, f) { R(g, c[0], 2, 1, 12, 13); R(g, (f & 1) ? c[1] : c[2], 3, 2, 10, 5); R(g, c[2], 3, 9, 10, 1); R(g, c[1], 5, 11, 6, 1); },
  bed(g, c) { R(g, c[2], 0, 2, S, 13); R(g, c[0], 1, 3, 14, 11); R(g, c[1], 1, 8, 14, 6); R(g, '#fff', 2, 4, 5, 3); },
  stall(g, c) { R(g, c[0], 0, 0, S, 5); for (let x = 0; x < S; x += 4) R(g, c[1], x, 0, 2, 5); R(g, c[2], 1, 5, 2, 10); R(g, c[2], 13, 5, 2, 10); R(g, '#a07040', 0, 9, S, 5); R(g, '#e8c040', 3, 7, 3, 2); R(g, '#d85030', 8, 7, 4, 2); },
  machine(g, c, f) { R(g, c[0], 0, 0, S, S); R(g, '#2a2a34', 1, 1, 14, 14); R(g, c[1], 3 + (f & 1), 3, 4, 4); R(g, c[2], 9, 3, 4, 4); R(g, c[2], 3, 9, 10, 2); R(g, c[1], 3, 12, 3, 2); },
  pagoda(g, c) { R(g, c[2], 3, 12, 10, 4); R(g, c[0], 4, 9, 8, 3); R(g, c[1], 2, 8, 12, 1); R(g, c[0], 5, 5, 6, 3); R(g, c[1], 3, 4, 10, 1); R(g, c[0], 6, 1, 4, 3); R(g, c[1], 7, 0, 2, 1); },
  statue(g, c) { R(g, c[2], 4, 13, 8, 3); R(g, c[0], 5, 6, 6, 8); R(g, c[1], 6, 2, 4, 4); R(g, c[1], 3, 7, 2, 5); R(g, c[1], 11, 7, 2, 5); },
  palm(g, c) { R(g, c[2], 7, 7, 2, 9); R(g, c[0], 2, 3, 12, 3); R(g, c[1], 4, 1, 8, 3); R(g, c[0], 1, 5, 4, 2); R(g, c[0], 11, 5, 4, 2); R(g, c[2], 6, 6, 4, 2); },
  hut(g, c) { R(g, c[2], 1, 6, 14, 9); R(g, c[0], 2, 7, 12, 8); R(g, c[1], 0, 3, 16, 3); R(g, c[1], 2, 1, 12, 3); R(g, c[2], 5, 9, 6, 6); },
  totem(g, c) { R(g, c[0], 5, 0, 6, 16); R(g, c[1], 5, 3, 6, 3); R(g, c[2], 5, 8, 6, 3); R(g, '#fff', 6, 4, 1, 1); R(g, '#fff', 9, 4, 1, 1); R(g, '#222', 7, 9, 2, 2); R(g, c[1], 2, 5, 3, 2); R(g, c[1], 11, 5, 3, 2); },
  ship(g, c) { R(g, c[2], 1, 9, 14, 5); R(g, c[0], 0, 8, 16, 3); R(g, c[2], 7, 0, 1, 9); R(g, c[1], 8, 1, 6, 6); R(g, c[1], 3, 3, 4, 4); },
  treehouse(g, c) { R(g, c[2], 6, 8, 4, 8); R(g, c[0], 0, 1, 16, 9); R(g, c[1], 2, 0, 12, 6); R(g, '#d8b070', 5, 9, 6, 4); R(g, '#ffe8a0', 7, 10, 2, 2); },
  grave(g, c) { R(g, 'rgba(0,0,0,.25)', 3, 14, 10, 2); R(g, c[2], 4, 4, 8, 11); R(g, c[0], 4, 3, 8, 11); R(g, c[1], 5, 4, 6, 1); R(g, c[2], 7, 6, 2, 5); R(g, c[2], 5, 8, 6, 1); },
  mushroom(g, c) { R(g, '#e8dcc0', 7, 9, 2, 6); R(g, c[0], 3, 4, 10, 6); R(g, c[1], 5, 5, 2, 2); R(g, c[1], 9, 6, 2, 2); R(g, c[2], 2, 10, 12, 1); },
  bamboo(g, c) { for (let i = 0; i < 3; i++) { R(g, c[i % 2], 3 + i * 4, 0, 3, 16); R(g, c[2], 3 + i * 4, 4, 3, 1); R(g, c[2], 3 + i * 4, 10, 3, 1); } R(g, c[1], 1, 2, 4, 1); R(g, c[1], 11, 6, 4, 1); },
  forge(g, c) { R(g, c[0], 0, 4, 16, 12); R(g, '#16121c', 2, 6, 12, 8); R(g, c[1], 4, 8, 8, 5); R(g, c[2], 6, 9, 4, 3); R(g, c[0], 6, 0, 4, 5); },
  banner(g, c) { R(g, '#6a4a2a', 7, 0, 2, 16); R(g, c[0], 3, 1, 10, 9); R(g, c[1], 6, 3, 4, 4); R(g, c[2], 3, 10, 2, 2); R(g, c[2], 11, 10, 2, 2); },
  cathedral(g, c) { R(g, c[0], 0, 0, S, S); R(g, c[2], 0, 15, S, 1); R(g, c[1], 5, 2, 6, 11); R(g, c[0], 7, 2, 2, 11); R(g, c[2], 5, 2, 6, 1); R(g, '#e84a6a', 7, 5, 2, 2); },
  rubble(g, c) { R(g, c[0], 3, 10, 5, 4); R(g, c[1], 5, 8, 4, 3); R(g, c[2], 9, 11, 4, 3); R(g, c[0], 11, 9, 3, 2); },
  bonfire(g, c, f) { R(g, c[0], 3, 12, 10, 3); R(g, c[0], 5, 10, 6, 2); R(g, c[1], 5, 4 - (f & 1), 6, 8); R(g, c[2], 7, 5, 2, 5); R(g, c[1], 4 + (f & 1), 8, 2, 3); },
  lighthouse(g, c, f) { R(g, c[0], 4, 4, 8, 12); R(g, c[1], 4, 7, 8, 2); R(g, c[1], 4, 12, 8, 2); R(g, '#333', 3, 2, 10, 2); R(g, c[2], 5, 0, 6, 3); R(g, f & 1 ? '#fff' : c[2], 7, 1, 2, 1); },
  stairsup(g, c) { R(g, c[2], 0, 0, S, S); for (let i = 0; i < 4; i++) { R(g, c[1], 2 + i, 12 - i * 3, 12 - i * 2, 3); R(g, c[0], 2 + i, 14 - i * 3, 12 - i * 2, 1); } R(g, '#ffe080', 7, 2, 2, 2); },
  stairsdown(g, c) { R(g, c[2], 0, 0, S, S); for (let i = 0; i < 4; i++) { R(g, c[1], 2 + i, 2 + i * 3, 12 - i * 2, 3); R(g, c[0], 2 + i, 4 + i * 3, 12 - i * 2, 1); } R(g, '#ffe080', 7, 13, 2, 2); },
  barrel(g, c) { R(g, 'rgba(0,0,0,.25)', 3, 13, 10, 2); R(g, c[0], 3, 3, 10, 11); R(g, c[1], 4, 3, 2, 11); R(g, c[2], 3, 5, 10, 1); R(g, c[2], 3, 11, 10, 1); },
  crate(g, c) { R(g, c[2], 2, 4, 12, 10); R(g, c[0], 3, 5, 10, 8); R(g, c[1], 3, 5, 10, 1); R(g, c[2], 3, 8, 10, 1); R(g, c[2], 7, 5, 1, 8); },
  pillar(g, c) { R(g, c[2], 4, 13, 8, 2); R(g, c[0], 5, 2, 6, 11); R(g, c[1], 6, 2, 2, 11); R(g, c[2], 4, 1, 8, 2); },
  sign(g, c) { R(g, c[2], 7, 8, 2, 8); R(g, c[2], 2, 2, 12, 7); R(g, c[1], 3, 3, 10, 5); R(g, c[0], 4, 4, 5, 1); R(g, c[0], 4, 6, 7, 1); },
  lamppost(g, c) { R(g, c[0], 7, 5, 2, 11); R(g, c[0], 5, 14, 6, 2); R(g, c[0], 4, 1, 8, 1); R(g, c[1], 5, 2, 6, 4); R(g, c[2], 7, 3, 2, 2); R(g, c[0], 5, 6, 6, 1); },
  bench(g, c) { R(g, 'rgba(0,0,0,.2)', 1, 13, 14, 2); R(g, c[2], 2, 10, 2, 4); R(g, c[2], 12, 10, 2, 4); R(g, c[0], 1, 8, 14, 3); R(g, c[1], 1, 8, 14, 1); R(g, c[0], 1, 4, 14, 3); R(g, c[1], 1, 4, 14, 1); },
  well(g, c) { R(g, c[2], 3, 2, 2, 8); R(g, c[2], 11, 2, 2, 8); R(g, c[2], 2, 1, 12, 2); R(g, c[0], 2, 8, 12, 7); R(g, c[1], 4, 9, 8, 3); R(g, '#a8a8b4', 2, 8, 12, 1); R(g, '#d8c8a0', 7, 3, 1, 5); },
  cart(g, c) { R(g, 'rgba(0,0,0,.22)', 1, 13, 14, 2); R(g, c[0], 1, 6, 12, 5); R(g, c[1], 2, 5, 10, 2); R(g, c[2], 13, 8, 3, 1); R(g, '#2a2a30', 3, 11, 4, 4); R(g, '#6a6a74', 4, 12, 2, 2); R(g, '#d8b050', 4, 3, 3, 2); R(g, '#c04a30', 8, 3, 3, 2); },
  torch(g, c, f) { R(g, c[0], 7, 7, 2, 9); R(g, c[1], 6, 3 - (f & 1), 4, 5); R(g, c[2], 7, 4, 2, 3); },
  flowers(g, c, f, v) { for (let i = 0; i < 6; i++) { const x = 1 + ((i * 5 + v) % 13), y = 3 + ((i * 7) % 10); R(g, c[0], x, y + 2, 1, 3); R(g, i % 2 ? c[1] : c[2], x - 1, y, 3, 2); } },
  doorshut(g, c) { R(g, c[2], 2, 1, 12, 15); R(g, c[0], 3, 2, 10, 14); R(g, c[1], 4, 3, 3, 12); R(g, '#222', 10, 9, 2, 2); R(g, '#8a8a94', 3, 6, 10, 1); R(g, '#8a8a94', 3, 11, 10, 1); },
  balcony(g, c) { R(g, c[0], 0, 0, S, S); R(g, '#1c1a28', 3, 1, 10, 8); R(g, '#e8c870', 4, 2, 8, 6); R(g, c[2], 3, 5, 10, 1); R(g, c[1], 0, 9, S, 2); R(g, c[2], 0, 11, S, 1); for (let x = 1; x < S; x += 3) R(g, c[2], x, 11, 1, 5); R(g, '#e8508a', 3, 9, 2, 1); R(g, '#f0d040', 9, 9, 2, 1); },
  winlit(g, c) { STYLE.brick(g, c); R(g, '#3a2a1c', 4, 3, 8, 9); R(g, '#ffd878', 5, 4, 6, 7); R(g, '#fff0b0', 5, 4, 6, 2); R(g, '#3a2a1c', 7, 4, 2, 7); R(g, '#3a2a1c', 5, 7, 6, 1); R(g, c[2], 3, 12, 10, 1); },
  windark(g, c) { STYLE.brick(g, c); R(g, '#3a2a1c', 4, 3, 8, 9); R(g, '#28344a', 5, 4, 6, 7); R(g, '#4a5c7a', 5, 4, 2, 2); R(g, '#3a2a1c', 7, 4, 2, 7); R(g, '#3a2a1c', 5, 7, 6, 1); R(g, c[2], 3, 12, 10, 1); },
  winshut(g, c) { STYLE.brick(g, c); R(g, '#4a3018', 4, 3, 8, 9); R(g, '#6a4a28', 5, 4, 3, 7); R(g, '#6a4a28', 9, 4, 2, 7); R(g, '#2a1a0c', 8, 4, 1, 7); R(g, c[2], 3, 12, 10, 1); },
  boulder(g, c) { R(g, 'rgba(0,0,0,.28)', 0, 13, 16, 3); R(g, c[2], 0, 4, 16, 10); R(g, c[0], 1, 2, 14, 11); R(g, c[1], 3, 2, 8, 3); R(g, c[1], 2, 5, 4, 3); R(g, c[2], 10, 8, 5, 5); R(g, c[2], 5, 11, 6, 2); },
  boulderc(g, c) { STYLE.boulder(g, c); R(g, '#1c1814', 7, 3, 1, 4); R(g, '#1c1814', 6, 6, 1, 3); R(g, '#1c1814', 8, 8, 1, 4); R(g, '#1c1814', 4, 9, 3, 1); R(g, '#1c1814', 10, 5, 3, 1); },
  rubblew(g, c) { R(g, 'rgba(0,0,0,.25)', 0, 13, 16, 3); R(g, c[2], 0, 3, 16, 11); R(g, c[0], 1, 2, 6, 6); R(g, c[1], 2, 2, 4, 2); R(g, c[0], 8, 4, 7, 7); R(g, c[1], 9, 4, 5, 2); R(g, c[0], 2, 9, 6, 5); R(g, c[2], 8, 11, 7, 3); R(g, '#e8c84a', 12, 7, 2, 2); },
  rubblewc(g, c) { STYLE.rubblew(g, c); R(g, '#1c1814', 7, 4, 1, 6); R(g, '#1c1814', 5, 9, 4, 1); R(g, '#1c1814', 11, 5, 1, 4); R(g, '#ffa030', 7, 5, 1, 2); },
  iceblk(g, c, f) { R(g, c[2], 0, 2, 16, 13); R(g, c[0], 1, 1, 14, 13); R(g, c[1], 2, 2, 5, 8); R(g, c[1], 9, 3, 3, 3); R(g, '#fff', 3, 3, 1, 4); R(g, c[2], 11, 9, 4, 5); },
  iceblkc(g, c) { STYLE.iceblk(g, c); R(g, '#3a6a90', 8, 2, 1, 5); R(g, '#3a6a90', 6, 7, 3, 1); R(g, '#3a6a90', 9, 8, 1, 5); },
  bargate(g, c) { R(g, c[0], 0, 0, 16, 16); R(g, '#16161c', 2, 2, 12, 14); for (let x = 3; x < 14; x += 3) R(g, c[1], x, 2, 2, 14); R(g, c[1], 2, 4, 12, 1); R(g, c[1], 2, 11, 12, 1); R(g, c[2], 7, 7, 3, 3); },
  brokenbr(g, c) { R(g, 'rgba(10,30,60,.45)', 0, 0, 16, 16); R(g, c[0], 0, 6, 5, 4); R(g, c[1], 0, 6, 5, 1); R(g, c[0], 11, 6, 5, 4); R(g, c[1], 11, 6, 5, 1); R(g, c[2], 6, 8, 2, 6); R(g, c[0], 7, 4, 4, 2); R(g, c[2], 3, 11, 3, 1); R(g, '#e8d0a0', 5, 3, 6, 2); },
  workbench(g, c) { R(g, 'rgba(0,0,0,.22)', 0, 14, 16, 2); R(g, c[0], 0, 6, 16, 4); R(g, c[1], 0, 6, 16, 1); R(g, c[0], 1, 10, 2, 5); R(g, c[0], 13, 10, 2, 5); R(g, c[2], 3, 3, 4, 3); R(g, '#e0a040', 9, 4, 3, 2); R(g, '#c04a30', 11, 2, 2, 4); R(g, '#222', 4, 4, 2, 1); },
  alchemy(g, c, f) { R(g, 'rgba(0,0,0,.22)', 0, 14, 16, 2); R(g, c[0], 1, 9, 14, 5); R(g, c[2], 3, 5, 3, 4); R(g, c[1], 4, 6, 1, 2); R(g, c[1], 8, 4 - (f & 1), 4, 6); R(g, '#f0fff0', 9, 5, 1, 2); R(g, c[2], 12, 7, 2, 2); R(g, c[1], 2, 2 + (f & 1), 1, 1); R(g, c[1], 6, 1, 1, 1); },
  limbocrack(g, c, f, v) { R(g, c[0], 0, 0, S, S); R(g, c[2], 2 + (v % 5), 0, 1, 5); R(g, c[2], 3 + (v % 5), 5, 3, 1); R(g, c[2], 6 + (v % 4), 6, 1, 6); R(g, c[2], 3, 11, 5, 1); R(g, c[1], 10, 3, 3, 1); },
  blood(g, c, f) { R(g, c[0], 0, 0, S, S); for (let r = 0; r < 3; r++) { const o = Math.round(Math.sin((f / 2 + r) * Math.PI)); R(g, c[1], 2 + r * 4 + o, 3 + r * 4, 5, 1); } R(g, c[2], 0, S - 1, S, 1); R(g, '#b02a30', 11, 2 + (f & 1), 2, 1); },
  baretree(g, c) { R(g, 'rgba(0,0,0,.25)', 3, 14, 10, 2); R(g, c[0], 7, 6, 3, 9); R(g, c[1], 7, 6, 1, 9); R(g, c[0], 4, 3, 2, 5); R(g, c[0], 5, 6, 3, 1); R(g, c[0], 10, 2, 2, 6); R(g, c[0], 9, 6, 3, 1); R(g, c[0], 2, 1, 1, 3); R(g, c[0], 13, 4, 1, 3); R(g, c[2], 6, 10, 1, 4); R(g, c[0], 6, 0, 2, 4); },
  mausoleum(g, c) { R(g, c[2], 0, 15, S, 1); R(g, c[0], 1, 4, 14, 11); R(g, c[1], 1, 4, 14, 1); R(g, c[0], 0, 2, 16, 3); R(g, c[1], 0, 2, 16, 1); R(g, '#000', 5, 8, 6, 7); R(g, c[2], 5, 7, 6, 1); R(g, c[1], 7, 1, 2, 2); },
  bones(g, c, f, v) { R(g, c[1], 2 + (v % 3), 9, 5, 1); R(g, c[0], 3 + (v % 3), 8, 1, 1); R(g, c[0], 6 + (v % 3), 10, 1, 1); R(g, c[1], 9, 5, 3, 1); R(g, c[0], 10, 4, 1, 3); R(g, c[2], 5, 12, 5, 1); R(g, c[1], 11, 11, 2, 2); },
  skullpile(g, c) { R(g, 'rgba(0,0,0,.25)', 2, 14, 12, 2); R(g, c[2], 1, 8, 14, 6); R(g, c[0], 2, 8, 5, 5); R(g, c[0], 9, 8, 5, 5); R(g, c[1], 5, 4, 6, 6); R(g, '#16161c', 6, 6, 1, 2); R(g, '#16161c', 9, 6, 1, 2); R(g, '#16161c', 7, 9, 2, 1); R(g, '#16161c', 3, 10, 1, 1); R(g, '#16161c', 11, 10, 1, 1); },
  brokencol(g, c) { R(g, 'rgba(0,0,0,.25)', 3, 14, 10, 2); R(g, c[2], 4, 13, 8, 2); R(g, c[0], 5, 7, 6, 6); R(g, c[1], 6, 7, 2, 6); R(g, c[2], 5, 6, 6, 1); R(g, c[0], 6, 5, 3, 1); R(g, c[2], 11, 12, 3, 2); },
  arch(g, c) { R(g, c[0], 0, 2, S, 14); R(g, c[1], 3, 5, 10, 11); R(g, c[2], 2, 2, 12, 2); R(g, '#000', 5, 7, 6, 9); },
};

Object.assign(STYLE, TALL_STYLE);
// variante del tile in base alla posizione; le montagne usano un ciclo di 8 tile per formare dorsali continue
export const variantOf = (def, tx, ty) => (def.st === 'mtn' ? (tx + ty * 3) & 7 : (tx * 7 + ty * 13) & 3);
const tileCache = new Map();
export function getTile(id, frame = 0, v = 0) {
  const k = id | (frame << 8) | (v << 12);
  let c = tileCache.get(k);
  if (c) return c;
  const def = DEFS[id], th = def.tall || 0;           // tile alti: il canvas è più alto della base, il disegno sale verso l'alto (y negativo)
  c = mk(S, S + th);
  const cg = c.getContext('2d'); if (th) cg.translate(0, th);
  STYLE[def.st](cg, def.c, frame, v, def);
  tileCache.set(k, c);
  return c;
}

// ---------- PERSONAGGI ----------
export const HAIR = ['#b8862e', '#a8761f', '#9a6a28', '#c89a3c']; // biondo caldo scuro
export const SKIN = ['#f4d4b0', '#e8bc90', '#c89868'];
export const REDS = ['#c8283a', '#a81c30', '#8a1428'];
export const MASKS = ['Classica', 'Bande rosse', 'Nove code', 'Ombra'];

export function shadow(g, x, y, w = 10) { R(g, 'rgba(0,0,0,.28)', x - w / 2, y - 2, w, 3); }

// dir: 0 giù, 1 su, 2 sinistra, 3 destra. fr = frame di camminata.
// Opzioni di aspetto (o): hat/straw/turban/helm/bandana, beard, goggles/glasses, wild/spiky/bun/long/bald, robot, ears, tails(n),
// cape, scarf, apron, robe, staff, medal, glow(r,g,b), small.
export function drawHumanoid(g, x, y, p, dir, fr = 0, o = {}) {
  const l = fr & 1;
  shadow(g, x, y);
  const sc = o.small ? 0.8 : 1;
  if (sc !== 1) { g.save(); g.translate(x, y); g.scale(sc, sc); x = 0; y = 0; }
  if (o.glow) { g.fillStyle = `rgba(${o.glow},.22)`; g.beginPath(); g.arc(x, y - 14, 15, 0, 6.283); g.fill(); }
  if (o.cape) R(g, o.capeCol || '#3a4a8a', x - 6, y - 18, 12, 15);
  if (o.tails) for (let i = 0; i < o.tails; i++) { const k = i - (o.tails - 1) / 2, tx = x + Math.round(k * 4) - 1, ty = y - 12 - Math.round(7 - Math.abs(k) * 1.1); R(g, p.hair, tx, ty, 3, 8); R(g, '#fff', tx, ty - 1, 3, 2); }
  if (o.ghost) { for (let i = 0; i < 4; i++) R(g, p.bottom, x - 6 + i * 3, y - 6 + (i & 1), 3, 6 - (i & 1) * 2); }
  else { R(g, '#2a1a14', x - 4, y - 4, 3, 4 - l); R(g, '#2a1a14', x + 1, y - 4, 3, 3 + l); }
  R(g, p.bottom, x - 5, y - 11, 10, 7);
  if (o.robe) R(g, p.bottom, x - 6, y - 12, 12, 11);
  R(g, p.top, x - 5, y - 18, 10, 8);
  R(g, p.sash, x - 5, y - 12, 10, 2);
  if (o.apron) { R(g, '#f0ece0', x - 4, y - 11, 8, 8); R(g, '#c8c0b0', x - 4, y - 11, 8, 1); }
  R(g, p.top, x - 7, y - 17, 2, 7); R(g, p.top, x + 5, y - 17, 2, 7);
  R(g, p.skin, x - 7, y - 10, 2, 2); R(g, p.skin, x + 5, y - 10, 2, 2);
  if (o.scarf) { R(g, o.scarfCol || '#c03030', x - 5, y - 19, 10, 2); R(g, o.scarfCol || '#c03030', x + 3, y - 18, 2, 6); }
  if (o.medal) R(g, '#ffd060', x - 3, y - 16, 2, 2);
  if (o.staff) { R(g, '#8a6a3a', x + 8, y - 28, 1, 28); R(g, o.staffCol || '#ffd060', x + 7, y - 31, 3, 3); }
  R(g, p.skin, x - 4, y - 25, 8, 7);
  if (!o.bald) {
    if (dir === 1) R(g, p.hair, x - 5, y - 27, 10, 9);
    else { R(g, p.hair, x - 5, y - 27, 10, 4); R(g, p.hair, x - 5, y - 24, 1, 4); R(g, p.hair, x + 4, y - 24, 1, 4); }
  } else if (dir === 1) R(g, p.skin, x - 4, y - 26, 8, 7);
  if (dir !== 1) {
    if (dir === 0) { R(g, '#222', x - 3, y - 22, 1, 2); R(g, '#222', x + 2, y - 22, 1, 2); }
    else R(g, '#222', dir === 2 ? x - 3 : x + 2, y - 22, 1, 2);
    if (o.eyepatch) R(g, '#111', x - 4, y - 23, 3, 3);
  }
  if (o.pointy) { R(g, p.skin, x - 7, y - 25, 3, 2); R(g, p.skin, x + 4, y - 25, 3, 2); }
  if (o.long) { R(g, p.hair, x - 6, y - 25, 2, 13); R(g, p.hair, x + 4, y - 25, 2, 13); }
  if (o.bun) R(g, p.hair, x - 2, y - 31, 4, 4);
  if (o.spiky) for (let i = 0; i < 3; i++) R(g, p.hair, x - 4 + i * 3, y - 31, 2, 4);
  if (o.hat) R(g, '#7a5a2a', x - 6, y - 28, 12, 3);
  if (o.straw) { R(g, '#e0c068', x - 8, y - 27, 16, 2); R(g, '#c8a048', x - 4, y - 30, 8, 3); }
  if (o.turban) { R(g, o.turbanCol || '#e8e0f0', x - 5, y - 30, 10, 5); R(g, '#d8a030', x - 1, y - 28, 2, 2); }
  if (o.bandana) R(g, o.bandanaCol || '#c03030', x - 5, y - 27, 10, 2);
  if (o.helm) { R(g, '#8a8a98', x - 5, y - 28, 10, 4); R(g, '#c8c8d0', x - 1, y - 30, 2, 3); }
  if (o.beard && dir !== 1) R(g, '#e8e8e8', x - 3, y - 20, 6, 3);
  if (o.goggles && dir !== 1) { R(g, '#2ee6ff', x - 4, y - 24, 3, 2); R(g, '#2ee6ff', x + 1, y - 24, 3, 2); }
  if (o.glasses && dir !== 1) { R(g, '#222', x - 4, y - 23, 3, 3); R(g, '#222', x + 1, y - 23, 3, 3); R(g, '#9ad0f0', x - 3, y - 22, 1, 1); R(g, '#9ad0f0', x + 2, y - 22, 1, 1); }
  if (o.wild) R(g, p.hair, x - 6, y - 28, 12, 2);
  if (o.robot) { R(g, '#ff3fa4', x - 3, y - 23, 6, 2); R(g, '#8a9ab0', x - 1, y - 30, 2, 4); }
  if (o.ears) { R(g, p.top, x - 5, y - 30, 2, 4); R(g, p.top, x + 3, y - 30, 2, 4); R(g, '#d02030', x - 5, y - 30, 2, 1); R(g, '#d02030', x + 3, y - 30, 2, 1); }
  if (sc !== 1) g.restore();
}

export function drawPlayerSprite(g, x, y, look, dir, fr, o = {}) {
  const red = REDS[look.red % REDS.length];
  const pal = { top: '#f4f0e8', bottom: red, sash: '#7a0e1e', hair: HAIR[look.hair % HAIR.length], skin: SKIN[look.skin % SKIN.length] };
  // fodero della katana (dietro il corpo)
  R(g, '#1b1b24', x + (dir === 2 ? 4 : -7), y - 13, 2, 10);
  drawHumanoid(g, x, y, pal, dir, fr, { long: look.style === 1, robe: look.gender === 1 });
  if (look.style === 2) { R(g, pal.hair, x + 3, y - 25, 3, 9); R(g, pal.hair, x + 4, y - 17, 2, 3); }
  if (look.gender === 1) R(g, red, x - 2, y - 12, 4, 3); // fiocco dell'obi
  // maschera kitsune
  if (dir !== 1) {
    R(g, '#f6f2ea', x - 4, y - 25, 8, 7);
    R(g, '#f6f2ea', x - 5, y - 30, 3, 5); R(g, '#f6f2ea', x + 2, y - 30, 3, 5); // orecchie
    R(g, red, x - 5, y - 30, 3, 1); R(g, red, x + 2, y - 30, 3, 1);
    const eye = dir === 0 ? [x - 3, x + 1] : dir === 2 ? [x - 3, x - 1] : [x + 1, x + 3];
    for (const ex of eye) R(g, red, ex, y - 23, 2, 1);
    const m = look.mask % MASKS.length;
    if (m === 1) { R(g, red, x - 4, y - 21, 1, 2); R(g, red, x + 3, y - 21, 1, 2); }
    if (m === 2) { R(g, red, x - 1, y - 25, 2, 3); R(g, red, x - 3, y - 25, 1, 2); R(g, red, x + 2, y - 25, 1, 2); }
    if (m === 3) { R(g, '#3a2a3a', x - 4, y - 25, 8, 1); R(g, red, x - 1, y - 20, 2, 1); }
    R(g, red, x - 1, y - 21, 2, 1);
  } else R(g, red, x - 4, y - 22, 8, 1);
  // elsa
  R(g, '#c8283a', x + (dir === 2 ? 4 : -7), y - 15, 2, 3);
  // fascia hakama bianca
  R(g, '#f4f0e8', x - 5, y - 8, 10, 1);
  if (o.flash) { g.globalAlpha = 0.6; R(g, '#fff', x - 6, y - 30, 12, 30); g.globalAlpha = 1; }
}

// Mostri: disegnati con origine ai piedi e rivolti a DESTRA (specchiati con dir=2), scalati da `size`.
// Ogni creatura ha una sagoma propria + accessori (`vis`) che la rendono riconoscibile.
const MON = {
  blob(g, c, f) { const s = f & 1; R(g, c[0], -6, -8 + s, 12, 8 - s); R(g, c[1], -5, -10 + s, 10, 4); R(g, c[2], -3, -6, 2, 2); R(g, c[2], 1, -6, 2, 2); },
  wisp(g, c, f) { const s = (f & 1); R(g, c[1], -3, -14 - s, 6, 8); R(g, c[0], -5, -10, 10, 7); R(g, c[2], -2, -11, 4, 4); R(g, c[0], -2, -4, 4, 4 + s); R(g, c[1], -1, -17 - s, 2, 3); },
  beast(g, c, f) { const l = f & 1; R(g, c[2], -6, -3, 3, 3 - l); R(g, c[2], 3, -3, 3, 2 + l); R(g, c[0], -7, -9, 14, 7); R(g, c[1], -7, -9, 14, 2); R(g, c[0], 5, -12, 7, 6); R(g, c[2], 6, -9, 1, 1); R(g, c[2], 10, -9, 1, 1); R(g, c[1], 5, -14, 2, 3); R(g, c[1], 10, -14, 2, 3); },
  tanuki(g, c, f) { const l = f & 1; R(g, '#222', -5, -2, 3, 2 - l); R(g, '#222', 2, -2, 3, 1 + l); R(g, c[0], -7, -11, 14, 10); R(g, c[1], -4, -9, 8, 7); R(g, c[0], -5, -19, 10, 8); R(g, c[0], -6, -21, 3, 3); R(g, c[0], 3, -21, 3, 3); R(g, c[2], -5, -16, 10, 3); R(g, '#fff', -3, -16, 2, 2); R(g, '#fff', 1, -16, 2, 2); R(g, c[0], 6, -7, 5, 4); R(g, c[2], 8, -7, 1, 4); },
  boar(g, c, f) { const l = f & 1; R(g, c[2], -8, -3, 3, 3 - l); R(g, c[2], 3, -3, 3, 2 + l); R(g, c[0], -10, -13, 18, 11); R(g, c[1], -10, -13, 18, 3); R(g, c[0], 7, -11, 7, 8); R(g, c[1], 11, -8, 4, 4); R(g, '#111', 14, -7, 1, 1); R(g, c[1], -8, -16, 3, 3); R(g, c[1], -4, -15, 3, 2); R(g, c[2], 8, -12, 2, 2); },
  wolf(g, c, f) { const l = f & 1; R(g, c[2], -9, -3, 2, 3 - l); R(g, c[2], -4, -3, 2, 2 + l); R(g, c[2], 3, -3, 2, 3 - l); R(g, c[2], 7, -3, 2, 2 + l); R(g, c[0], -10, -10, 18, 7); R(g, c[1], -10, -10, 18, 2); R(g, c[0], 6, -14, 7, 6); R(g, c[0], 11, -11, 4, 3); R(g, c[1], 7, -17, 2, 4); R(g, c[1], 11, -17, 2, 4); R(g, c[2], 9, -12, 1, 1); R(g, c[1], -15, -12 - (f & 1), 6, 3); },
  tengu(g, c, f) { const w = (f & 1) ? -3 : 1; R(g, c[1], -14, -18 + w, 9, 4); R(g, c[1], 5, -18 + w, 9, 4); R(g, c[0], -5, -17, 10, 12); R(g, '#d03030', -4, -26, 8, 8); R(g, '#d03030', 4, -22, 6, 3); R(g, '#fff', -2, -23, 2, 2); R(g, c[2], -5, -28, 10, 3); R(g, '#222', -3, -5, 2, 5); R(g, '#222', 1, -5, 2, 5); },
  kappa(g, c, f) { const l = f & 1; R(g, c[0], -4, -3, 3, 3 - l); R(g, c[0], 1, -3, 3, 2 + l); R(g, c[0], -5, -13, 10, 11); R(g, c[2], -7, -14, 4, 9); R(g, '#e8d8a0', -4, -10, 8, 5); R(g, c[0], -4, -21, 8, 8); R(g, c[2], 3, -17, 4, 2); R(g, '#fff', 0, -18, 2, 2); R(g, c[0], 5, -12, 5, 3); },
  frog(g, c, f) { const h = (f & 1) ? 2 : 0; R(g, c[0], -9, -4, 3, 4); R(g, c[0], 6, -4, 3, 4); R(g, c[0], -7, -9 - h, 14, 8); R(g, c[1], -5, -6 - h, 10, 4); R(g, c[1], -6, -13 - h, 4, 4); R(g, c[1], 2, -13 - h, 4, 4); R(g, c[2], -5, -12 - h, 2, 2); R(g, c[2], 3, -12 - h, 2, 2); },
  skeleton(g, c, f) { const l = f & 1; R(g, c[1], -3, -4, 2, 4 - l); R(g, c[1], 1, -4, 2, 3 + l); R(g, c[0], -4, -12, 8, 8); R(g, c[1], -4, -12, 8, 1); R(g, c[1], -3, -19, 6, 6); R(g, c[2], -2, -17, 1, 2); R(g, c[2], 1, -17, 1, 2); },
  spider(g, c, f) { const l = (f & 1) * 2; for (let i = 0; i < 4; i++) { R(g, c[1], -9, -7 + i * 2 - l, 4, 1); R(g, c[1], 5, -7 + i * 2 + l, 4, 1); } R(g, c[0], -5, -9, 10, 6); R(g, c[2], -3, -8, 2, 2); R(g, c[2], 1, -8, 2, 2); },
  scorpion(g, c, f) { const l = (f & 1); for (let i = 0; i < 3; i++) { R(g, c[1], -6 + i * 4, -2, 1, 2 + l); } R(g, c[0], -8, -7, 14, 5); R(g, c[1], -8, -7, 14, 1); R(g, c[1], 5, -10, 6, 3); R(g, c[1], 5, -5, 6, 3); R(g, c[2], 10, -10, 2, 2); R(g, c[0], -11, -10, 3, 5); R(g, c[0], -10, -14, 3, 4); R(g, c[2], -7, -17, 3, 3); R(g, '#111', 3, -6, 1, 1); },
  mummy(g, c, f) { const l = f & 1; R(g, c[0], -4, -3, 3, 3 - l); R(g, c[0], 1, -3, 3, 2 + l); R(g, c[0], -5, -17, 10, 15); for (let y = -16; y < -3; y += 3) R(g, c[1], -5, y, 10, 1); R(g, c[0], -4, -25, 8, 8); R(g, '#ff4040', -1, -22, 2, 2); R(g, '#ff4040', 2, -22, 2, 2); R(g, c[0], 5, -16, 7, 3); R(g, c[1], 10, -14, 3, 6 + l); },
  yeti(g, c, f) { const l = f & 1; R(g, '#334', -5, -3, 4, 3 - l); R(g, '#334', 1, -3, 4, 2 + l); R(g, c[0], -8, -19, 16, 17); R(g, c[1], -8, -19, 16, 4); R(g, c[0], -13, -17, 5, 13); R(g, c[0], 8, -17, 5, 13); R(g, c[1], -6, -28, 12, 10); R(g, c[2], -4, -24, 8, 5); R(g, '#fff', -3, -20, 1, 2); R(g, '#fff', 2, -20, 1, 2); R(g, '#111', -2, -25, 1, 1); R(g, '#111', 1, -25, 1, 1); },
  bat(g, c, f) { const w = (f & 1) ? -5 : 2; R(g, c[0], -3, -9, 6, 5); R(g, c[1], -11, -10 + w, 8, 5); R(g, c[1], 3, -10 + w, 8, 5); R(g, c[0], -3, -12, 2, 3); R(g, c[0], 1, -12, 2, 3); R(g, c[2], -2, -8, 1, 1); R(g, c[2], 1, -8, 1, 1); },
  bird(g, c, f) { const w = (f & 1) ? -4 : 2; R(g, c[0], -4, -10, 8, 6); R(g, c[1], -9, -10 + w, 5, 3); R(g, c[1], 4, -10 + w, 5, 3); R(g, c[2], 4, -9, 3, 1); R(g, c[0], 3, -12, 4, 4); R(g, c[2], 5, -11, 1, 1); },
  goblin(g, c, f) { const l = f & 1; R(g, '#222', -3, -3, 2, 3 - l); R(g, '#222', 1, -3, 2, 2 + l); R(g, c[0], -4, -11, 8, 9); R(g, c[2], -4, -8, 8, 2); R(g, c[1], -4, -18, 8, 7); R(g, c[1], -8, -17, 4, 3); R(g, c[1], 4, -17, 4, 3); R(g, '#ffe060', -2, -15, 1, 2); R(g, '#ffe060', 1, -15, 1, 2); },
  snake(g, c, f) { for (let i = 0; i < 6; i++) R(g, i % 2 ? c[0] : c[1], -9 + i * 3, -4 - Math.round(Math.sin((i + f) * 1.2) * 2), 4, 4); R(g, c[0], 8, -9, 5, 5); R(g, c[2], 11, -8, 1, 1); },
  golem(g, c) { R(g, c[0], -6, -16, 12, 14); R(g, c[1], -6, -16, 12, 3); R(g, c[0], -4, -22, 8, 6); R(g, c[2], -2, -20, 4, 2); R(g, c[1], -10, -14, 4, 10); R(g, c[1], 6, -14, 4, 10); R(g, c[2], -2, -10, 4, 2); },
  drone(g, c, f) { const s = f & 1; R(g, c[0], -6, -12 - s, 12, 6); R(g, c[1], -6, -12 - s, 12, 1); R(g, c[2], -2, -10 - s, 4, 2); R(g, c[1], -9, -13 - s, 3, 2); R(g, c[1], 6, -13 - s, 3, 2); R(g, c[0], -2, -6 - s, 4, 3); },
  fish(g, c, f) { const t = f & 1; R(g, c[0], -8, -9, 14, 6); R(g, c[1], -6, -5, 10, 2); R(g, c[0], 6, -10 - t, 4, 3); R(g, c[0], 6, -5 + t, 4, 3); R(g, c[0], -2, -13, 3, 4); R(g, c[2], -6, -8, 1, 1); },
  shark(g, c, f) { const t = f & 1; R(g, c[0], -12, -10, 22, 7); R(g, c[1], -10, -5, 18, 2); R(g, c[0], 8, -9, 5, 5); R(g, c[0], -16, -13 - t, 5, 4); R(g, c[0], -16, -6 + t, 5, 4); R(g, c[0], -3, -16, 3, 6); R(g, '#fff', 9, -6, 1, 2); R(g, '#fff', 11, -6, 1, 2); R(g, '#111', 8, -9, 1, 1); },
  jelly(g, c, f) { const w = f & 1; R(g, c[0], -7, -17, 14, 8); R(g, c[1], -5, -18, 10, 3); R(g, c[2], -2, -14, 4, 3); for (let i = 0; i < 4; i++) R(g, c[1], -6 + i * 4, -9, 2, 6 + ((i + w) & 1) * 2); },
  crab(g, c, f) { const l = f & 1; for (let i = 0; i < 3; i++) { R(g, c[1], -8 + i * 3, -3, 1, 3 - l); R(g, c[1], 3 + i * 3, -3, 1, 2 + l); } R(g, c[0], -7, -9, 14, 7); R(g, c[2], -5, -8, 10, 2); R(g, c[1], -12, -14 - l * 2, 5, 6); R(g, c[1], 7, -14 - l * 2, 5, 6); R(g, '#111', -3, -12, 1, 3); R(g, '#111', 2, -12, 1, 3); },
  ghost(g, c, f) { const w = f & 1; R(g, c[0], -6, -18, 12, 14); R(g, c[1], -5, -19, 10, 5); for (let i = 0; i < 4; i++) R(g, c[0], -6 + i * 3, -4, 3, 2 + ((i + w) & 1) * 2); R(g, '#111', -3, -15, 2, 3); R(g, '#111', 1, -15, 2, 3); R(g, c[2], -3, -14, 1, 1); R(g, c[2], 1, -14, 1, 1); R(g, c[0], -10, -15 + w, 4, 6); R(g, c[0], 6, -15 - w, 4, 6); },
  gaki(g, c, f) { const l = f & 1; R(g, c[1], -3, -4, 2, 4 - l); R(g, c[1], 1, -4, 2, 3 + l); R(g, c[0], -6, -13, 12, 10); R(g, c[2], -3, -8, 6, 4); R(g, c[1], -3, -20, 6, 7); R(g, '#ffe060', -2, -17, 1, 2); R(g, '#ffe060', 1, -17, 1, 2); R(g, c[1], -9, -13, 2, 8 + l); R(g, c[1], 7, -13, 2, 8 - l); },
  oni(g, c, f) { const l = f & 1; R(g, '#222', -5, -4, 3, 4 - l); R(g, '#222', 2, -4, 3, 3 + l); R(g, c[0], -6, -16, 12, 12); R(g, c[1], -6, -16, 12, 3); R(g, c[0], -4, -24, 8, 8); R(g, c[2], -3, -22, 2, 2); R(g, c[2], 1, -22, 2, 2); R(g, c[2], -5, -28, 2, 5); R(g, c[2], 3, -28, 2, 5); R(g, c[1], -9, -15, 3, 9); R(g, c[1], 6, -15, 3, 9); },
  cerberus(g, c, f) { const l = f & 1; R(g, '#111', -9, -3, 3, 3 - l); R(g, '#111', 5, -3, 3, 2 + l); R(g, c[0], -10, -11, 18, 8); R(g, c[1], -10, -11, 18, 2); for (const [dx, dy] of [[6, -17], [9, -13], [5, -9]]) { R(g, c[0], dx, dy, 6, 5); R(g, c[2], dx + 4, dy + 1, 1, 1); R(g, c[2], dx + 5, dy + 3, 2, 1); } R(g, c[2], -13, -12 - l, 4, 3); },
  ronin(g, c, f) { const l = f & 1; R(g, '#111', -4, -4, 3, 4 - l); R(g, '#111', 1, -4, 3, 3 + l); R(g, c[0], -5, -17, 10, 13); R(g, c[1], -5, -17, 10, 3); R(g, c[1], -9, -27, 18, 3); R(g, c[0], -4, -25, 8, 7); R(g, c[2], -3, -22, 6, 2); R(g, c[2], 6, -22, 2, 14); R(g, c[1], 5, -9, 4, 3); },
  mechdog(g, c, f) { const l = f & 1; R(g, c[1], -9, -4, 3, 4 - l); R(g, c[1], -3, -4, 3, 3 + l); R(g, c[1], 3, -4, 3, 4 - l); R(g, c[1], 7, -4, 3, 3 + l); R(g, c[0], -10, -11, 18, 7); R(g, c[1], -10, -11, 18, 1); R(g, c[0], 7, -15, 8, 6); R(g, c[2], 11, -13, 3, 2); R(g, c[1], -5, -15, 6, 4); R(g, c[2], 1, -14, 3, 2); R(g, c[1], -13, -14, 3, 1); },
  glitch(g, c, f) { const j = (n) => (((f * 7 + n * 13) % 5) - 2); R(g, c[0], -6 + j(1), -9, 12, 3); R(g, c[1], -5 + j(2), -12, 10, 3); R(g, c[2], -7 + j(3), -6, 14, 2); R(g, c[0], -4 + j(4), -15, 8, 3); R(g, c[1], -6 + j(5), -3, 12, 3); R(g, '#fff', -2 + j(6), -11, 2, 2); R(g, '#fff', 2 + j(7), -11, 2, 2); },
  specter(g, c, f) { const w = f & 1; R(g, c[0], -6, -19, 12, 15); for (let i = 0; i < 4; i++) R(g, c[0], -6 + i * 3, -4, 3, 2 + ((i + w) & 1) * 2); R(g, c[1], -4, -26, 8, 7); R(g, c[2], -3, -23, 2, 2); R(g, c[2], 1, -23, 2, 2); R(g, c[1], -10, -17, 4, 9); R(g, c[1], 6, -17, 4, 9); },
  sphinx(g, c, f) { const l = f & 1; R(g, c[0], -16, -3, 5, 3 - l); R(g, c[0], 10, -3, 5, 2 + l); R(g, c[0], -16, -14, 30, 11); R(g, c[1], -16, -14, 30, 3); R(g, c[0], 6, -26, 12, 14); R(g, c[1], 6, -24, 12, 3); R(g, c[2], 4, -29, 16, 4); R(g, c[2], 3, -26, 3, 12); R(g, '#111', 13, -20, 2, 2); R(g, c[0], -22, -10, 6, 3); R(g, c[1], 14, -9, 7, 4); },
  hydra(g, c, f, o) { const n = o.tr?.heads ?? 5; R(g, c[0], -13, -9, 26, 9); R(g, c[1], -13, -9, 26, 2); for (let i = 0; i < n; i++) { const x = -11 + i * (22 / Math.max(1, n - 1 || 1)), s = Math.sin(f * 0.7 + i) * 2, h = 18 + (i % 2) * 5; R(g, c[0], x - 1 + s, -9 - h, 3, h); R(g, c[1], x - 3 + s, -12 - h, 7, 5); R(g, c[2], x - 1 + s, -11 - h, 1, 1); R(g, c[2], x + 2 + s, -11 - h, 1, 1); } },
  krakenscorp(g, c, f) {
    // Kraken-Leviatano-Scorpione: cupola corazzata, due grandi chele, sei tentacoli ondulanti e una coda a pungiglione ad arco sul dorso
    for (let i = 0; i < 6; i++) { const x = -12 + i * 5; for (let k = 0; k < 9; k++) R(g, k % 3 ? c[1] : c[0], x + Math.round(Math.sin(f * 0.6 + i + k * 0.7) * 2), -8 + k, 3, 1); R(g, '#a8f0e8', x + Math.round(Math.sin(f * 0.6 + i + 6.3) * 2), -2, 1, 1); }
    R(g, c[0], -14, -22, 28, 15); R(g, c[0], -11, -27, 22, 6); R(g, c[0], -7, -30, 14, 4);
    R(g, c[1], -14, -22, 28, 2); R(g, c[1], -11, -27, 22, 1); for (let x = -12; x < 12; x += 5) R(g, c[1], x, -20, 2, 12);
    R(g, 'rgba(0,0,0,.28)', 4, -22, 10, 15);
    R(g, c[2], -7, -20, 4, 4); R(g, c[2], 3, -20, 4, 4); R(g, '#fff', -6, -19, 1, 1); R(g, '#fff', 4, -19, 1, 1);
    for (const sd of [-1, 1]) { const x = sd * 17, w = Math.round(Math.sin(f * 0.5) * 1.5); R(g, c[1], sd * 14 - (sd < 0 ? 5 : 0), -16, 5, 4); R(g, c[0], x - 3 + (sd < 0 ? -2 : 0), -22 + w, 7, 12); R(g, c[1], x - 3 + (sd < 0 ? -2 : 0), -22 + w, 7, 3); R(g, c[0], x - 1 + (sd < 0 ? -2 : 0), -25 + w, 3, 4); R(g, '#06101c', x - 1 + (sd < 0 ? -2 : 0), -18 + w, 2, 5); }
    const sw = Math.round(Math.sin(f * 0.4) * 2);
    for (const [x, y] of [[10, -24], [14, -31], [13, -39], [7, -45], [-1, -47], [-6, -44]]) { R(g, c[0], x + sw, y, 5, 5); R(g, c[1], x + sw, y, 5, 1); }
    R(g, c[2], -9 + sw, -42, 4, 6); R(g, '#fff', -8 + sw, -40, 1, 2); if (f & 1) R(g, 'rgba(120,255,230,.5)', -10 + sw, -44, 6, 10);
    for (let i = 0; i < 7; i++) R(g, '#7affea', -12 + ((i * 11 + f) % 26), -26 + (i * 5) % 18, 1, 1);
  },
  dragon(g, c, f) { for (let i = 0; i < 8; i++) { const y = Math.round(Math.sin((i + f) * 0.9) * 3); R(g, i % 2 ? c[0] : c[1], -18 + i * 4, -6 - y, 5, 6); R(g, c[2], -17 + i * 4, -9 - y, 2, 3); } R(g, c[0], 14, -16, 9, 9); R(g, c[2], 17, -14, 2, 2); R(g, c[1], 12, -20, 2, 5); R(g, c[1], 18, -20, 2, 5); R(g, c[2], 22, -11, 3, 1); R(g, c[1], 21, -6, 6, 1); },
  yukionna(g, c, f) { const w = f & 1; R(g, c[0], -6, -22, 12, 20); R(g, c[1], -8, -4, 16, 3 + w); R(g, '#e8f4ff', -4, -31, 8, 9); R(g, '#111', -2, -27, 1, 2); R(g, '#111', 1, -27, 1, 2); R(g, c[2], -5, -33, 10, 3); R(g, c[1], -12, -20, 5, 3); R(g, c[1], 7, -20, 5, 3); R(g, '#2a3a6a', -4, -32, 8, 2); },
};
const TOP = { krakenscorp: -50, ghost: -19, blob: -10, wisp: -17, beast: -14, tanuki: -21, boar: -16, wolf: -17, tengu: -28, kappa: -21, frog: -13, skeleton: -19, spider: -9, scorpion: -17, mummy: -25, yeti: -28, bat: -12, bird: -12, goblin: -18, snake: -9, golem: -22, drone: -14, fish: -13, shark: -16, jelly: -18, crab: -14, gaki: -20, oni: -28, cerberus: -17, ronin: -27, mechdog: -15, glitch: -15, specter: -26, sphinx: -29, hydra: -30, dragon: -20, yukionna: -33 };

// Accessori: dettagli distintivi sovrapposti alla sagoma (top = y della sommità)
const ACC = {
  horns(g, c, f, top) { R(g, c[2], -4, top - 3, 2, 5); R(g, c[2], 2, top - 3, 2, 5); },
  eyes_glow(g, c, f, top) { R(g, '#ff3040', 2, top + 6, 2, 1); R(g, '#ff3040', 5, top + 6, 2, 1); },
  tendrils(g, c, f) { for (let i = 0; i < 3; i++) R(g, c[0], -7 + i * 6, -3, 2, 3 + Math.round(Math.sin(f + i) * 1.5)); },
  leaf(g, c, f, top) { R(g, '#3ac04a', -2, top - 3, 5, 3); R(g, '#1a8a2a', 0, top - 4, 2, 1); },
  sack(g, c) { R(g, '#c8a050', -11, -14, 6, 7); R(g, '#8a6a30', -10, -15, 4, 1); R(g, '#ffd860', -9, -12, 2, 2); },
  tusks(g) { R(g, '#f0e8d0', 10, -7, 2, 4); R(g, '#f0e8d0', 7, -7, 2, 3); },
  warpaint(g, c) { R(g, c[2], -6, -10, 2, 5); R(g, c[2], -2, -11, 2, 6); },
  tails3(g, c, f) { for (let i = 0; i < 3; i++) { R(g, c[1], -9 - i * 2, -9 - i * 3 + Math.round(Math.sin(f + i)), 5, 3); R(g, c[2], -8 - i * 2, -8 - i * 3 + Math.round(Math.sin(f + i)), 2, 1); } },
  chains(g) { for (let i = 0; i < 4; i++) { R(g, '#bbb', -8 + i * 4, -4, 1, 4); R(g, '#888', -8 + i * 4, -1, 1, 1); } },
  fan(g) { R(g, '#e8d070', 8, -20, 7, 6); R(g, '#c03030', 10, -19, 3, 4); R(g, '#8a5a2a', 7, -15, 1, 6); },
  skull_mark(g) { R(g, '#e8e0c8', -2, -8, 4, 3); R(g, '#333', -1, -7, 1, 1); R(g, '#333', 1, -7, 1, 1); },
  eyes3(g, c, f, top) { R(g, c[2], -3, -8, 1, 1); R(g, c[2], 0, -8, 1, 1); R(g, c[2], 3, -8, 1, 1); },
  dish(g, c, f, top, o) { if (o.tr?.dish !== false) { R(g, '#60c0ff', -4, top - 1, 8, 2); R(g, '#c0f0ff', -3, top - 2, 6, 1); } },
  spots(g, c) { R(g, c[2], -4, -7, 2, 2); R(g, c[2], 1, -5, 2, 2); },
  weeds(g) { R(g, '#3a6a2a', -4, -20, 2, 4); R(g, '#3a6a2a', 2, -21, 2, 5); R(g, '#3a6a2a', -5, -10, 2, 6); },
  arm_hang(g, c) { R(g, c[0], 6, -12, 2, 9); },
  hieroglyph(g) { R(g, '#40e0c0', -2, -12, 4, 1); R(g, '#40e0c0', -1, -10, 2, 1); R(g, '#40e0c0', -3, -8, 6, 1); },
  headdress(g, c, f, top) { R(g, '#4060c0', -5, top - 2, 10, 3); R(g, '#f0d060', -5, top, 10, 1); },
  icicles(g) { for (let i = 0; i < 4; i++) R(g, '#e0f4ff', -9 + i * 4, -15 + (i & 1) * 2, 2, 4); },
  fangs(g, c, f, top) { R(g, '#fff', -3, top + 11, 1, 3); R(g, '#fff', 2, top + 11, 1, 3); },
  snowflake(g, c, f) { const t = Math.floor(f / 2) & 1; R(g, '#fff', 6, -20, t ? 3 : 1, t ? 1 : 3); R(g, '#fff', 7, -21 + t, 1, 3); R(g, '#bfefff', -8, -16, 2, 2); },
  halo(g, c, f, top) { g.strokeStyle = '#d8f4ff'; g.beginPath(); g.ellipse(0, top - 3, 6, 2, 0, 0, 6.283); g.stroke(); },
  core(g, c, f) { R(g, f & 1 ? '#ffd060' : '#ff8030', -2, -11, 4, 4); },
  moss(g) { R(g, '#4a8a3a', -5, -18, 5, 2); R(g, '#4a8a3a', 2, -14, 4, 2); },
  hood(g, c, f, top) { R(g, '#1a1a24', -5, top - 1, 10, 5); R(g, '#40405a', -5, top - 1, 10, 1); },
  bow(g) { R(g, '#8a6a3a', 7, -20, 1, 12); R(g, '#ddd', 8, -19, 1, 10); R(g, '#8a6a3a', 6, -21, 2, 1); R(g, '#8a6a3a', 6, -8, 2, 1); },
  ears_big(g, c) { R(g, c[0], -6, -14, 3, 5); R(g, c[0], 3, -14, 3, 5); },
  sparks(g, c, f) { for (let i = 0; i < 3; i++) R(g, '#ffff60', -8 + ((f * 5 + i * 7) % 17), -17 + ((f * 3 + i * 5) % 12), 1, 2); },
  skull_face(g, c, f, top) { R(g, '#f4f0e0', -2, top + 4, 5, 5); R(g, '#111', -1, top + 5, 1, 2); R(g, '#111', 1, top + 5, 1, 2); },
  flames(g, c, f) { for (let i = 0; i < 4; i++) R(g, f & 1 ? '#ffd060' : '#ff8030', -8 + i * 5, -4 - ((f + i) % 3) * 3, 2, 4); },
  rings(g, c, f) { g.strokeStyle = 'rgba(220,200,255,.8)'; g.beginPath(); g.arc(0, -10, 8 + (f % 4) * 2, 0, 6.283); g.stroke(); },
  scanner(g, c, f, top, o) { if (o.tr?.alert) return; g.fillStyle = 'rgba(255,40,40,.22)'; g.beginPath(); g.moveTo(5, -9); g.lineTo(48, -22 + Math.sin(f * 0.8) * 8); g.lineTo(48, 4 + Math.sin(f * 0.8) * 8); g.fill(); },
  eye(g, c, f) { R(g, '#ff3fa4', -3, -11, 6, 4); R(g, '#fff', -1 + (f & 1), -10, 2, 2); },
  ring(g, c, f) { g.strokeStyle = '#6a6ac0'; g.beginPath(); g.ellipse(0, -9, 14, 4, 0, 0, 6.283); g.stroke(); },
  crown(g, c, f, top) { R(g, '#ffd060', -5, top - 3, 10, 3); R(g, '#ffd060', -5, top - 5, 2, 2); R(g, '#ffd060', -1, top - 6, 2, 3); R(g, '#ffd060', 3, top - 5, 2, 2); },
  beard(g, c, f, top) { R(g, '#e8e0d0', -3, top + 9, 6, 6); },
  club(g, c) { R(g, '#6a4a2a', 9, -26, 3, 20); R(g, '#8a8a90', 8, -30, 5, 6); },
  chain(g) { for (let i = 0; i < 5; i++) R(g, '#aaa', -9, -14 + i * 3, 1, 2); },
  kitsune_mask(g, c, f, top) { R(g, '#f6f2ea', -4, top + 1, 8, 7); R(g, '#f6f2ea', -5, top - 3, 3, 5); R(g, '#f6f2ea', 2, top - 3, 3, 5); R(g, '#c8283a', -3, top + 4, 2, 1); R(g, '#c8283a', 1, top + 4, 2, 1); },
  cape(g, c, f, top) { R(g, '#3a1060', -11, top + 8, 5, 20 + (f & 1)); R(g, '#c8283a', -11, top + 8, 5, 1); },
  aura(g, c, f) { for (let i = 0; i < 6; i++) R(g, i & 1 ? '#c0a0ff' : '#8a4aff', -14 + ((f * 3 + i * 7) % 28), -30 + ((f * 5 + i * 11) % 28), 2, 2); },
  visor(g, c, f, top) { R(g, c[2], -3, top + 4, 6, 2); },
  crown_ice(g, c, f, top) { R(g, '#d8f4ff', -5, top - 3, 10, 2); R(g, '#fff', -4, top - 6, 2, 4); R(g, '#fff', 0, top - 7, 2, 5); R(g, '#fff', 3, top - 6, 2, 4); },
  bald(g) {}, ghostly(g) {}, torch(g, c, f) { R(g, '#6a4a2a', 5, -14, 2, 8); R(g, f & 1 ? '#ffd060' : '#ff8030', 4, -19, 4, 5); },
};
export const SHAPES = Object.keys(MON), ACC_NAMES = Object.keys(ACC);
export function drawMonster(g, x, y, shape, col, fr, o = {}) {
  const sz = o.size || 1;
  shadow(g, x, y, 10 * sz);
  g.save(); g.translate(x, y); g.scale((o.dir === 2 ? -1 : 1) * sz, sz);
  if (o.alpha != null) g.globalAlpha = o.alpha;
  if (o.flash) g.globalAlpha = Math.min(g.globalAlpha, 0.55);
  (MON[shape] || MON.blob)(g, col, fr, o);
  const top = TOP[shape] ?? -16;
  for (const a of o.vis || []) ACC[a]?.(g, col, fr, top, o);
  g.restore();
}

// Mezzi di trasporto (disegnati sotto il giocatore, origine ai piedi)
export function drawMount(g, kind, x, y, dir, t) {
  const f = Math.floor(t * 8) & 1;
  shadow(g, x, y + (kind === 'eagle' ? 12 : 0), 18);
  switch (kind) {
    case 'herb': R(g, '#3a9a3a', x - 4, y - 5, 3, 5); R(g, '#5ac05a', x - 1, y - 7, 3, 7); R(g, '#3a9a3a', x + 2, y - 4, 3, 4); R(g, '#ffd0e8', x - 1, y - 9 - (Math.floor(t * 3) & 1), 3, 2); break;
    case 'ore': R(g, '#6a6a78', x - 5, y - 6, 10, 6); R(g, '#9a9aa8', x - 3, y - 8, 6, 3); R(g, '#ffe080', x - 2 + (Math.floor(t * 4) % 3), y - 7, 2, 2); break;
    case 'clue': shadow(g, x, y, 12); R(g, '#5a5a64', x - 5, y - 14, 10, 14); R(g, '#7a7a86', x - 5, y - 14, 10, 2); R(g, '#34343e', x - 5, y - 3, 10, 3); R(g, '#c8c0a0', x - 3, y - 11, 6, 1); R(g, '#c8c0a0', x - 3, y - 8, 6, 1); R(g, '#c8c0a0', x - 3, y - 5, 4, 1); R(g, '#ffe8a0', x - 1, y - 18 - (Math.floor(t * 3) & 1), 2, 2); break;
    case 'heartaltar': shadow(g, x, y, 16); R(g, '#3a3a46', x - 8, y - 8, 16, 8); R(g, '#5a5a68', x - 6, y - 12, 12, 4); R(g, '#8a8a98', x - 6, y - 12, 12, 1); if (!open) { const b = Math.floor(t * 4) & 1; R(g, '#ff2a4a', x - 3, y - 17 - b, 6, 5); R(g, '#ff8aa0', x - 2, y - 16 - b, 2, 2); R(g, '#ff2a4a', x - 2, y - 18 - b, 4, 1); g.globalAlpha = 0.25; R(g, '#ff2a4a', x - 9, y - 22, 18, 14); g.globalAlpha = 1; } break;
    case 'horn': shadow(g, x, y, 16); R(g, '#d8d0b8', x - 7, y - 6, 14, 6); R(g, '#f0e8d0', x - 7, y - 6, 14, 1); R(g, '#6a6450', x - 7, y - 1, 14, 1); R(g, '#e8e0c8', x - 5, y - 14, 3, 8); R(g, '#e8e0c8', x + 2, y - 14, 3, 8); R(g, '#e8e0c8', x - 6, y - 16, 12, 3); if (!open) { g.globalAlpha = 0.3 + 0.2 * Math.sin(t * 4); R(g, '#ff3a3a', x - 8, y - 18, 16, 14); g.globalAlpha = 1; } break;
    case 'shrine': R(g, '#6a6a78', x - 6, y - 4, 12, 4); R(g, '#8a8a98', x - 4, y - 10, 8, 6); R(g, '#c8283a', x - 7, y - 16, 14, 3); R(g, '#c8283a', x - 5, y - 18, 10, 2); R(g, '#ffd870', x - 1, y - 9 - (Math.floor(t * 3) & 1), 2, 4); break;
    case 'elevator': R(g, '#3a3a50', x - 8, y - 20, 16, 20); R(g, '#8a8aa8', x - 6, y - 18, 5, 16); R(g, '#8a8aa8', x + 1, y - 18, 5, 16); R(g, '#2ee6ff', x - 2, y - 22, 4, 2); R(g, '#ff3fa4', x + 6, y - 12, 2, 2); break;
    case 'horse': R(g, '#7a4a28', x - 9, y - 12, 18, 8); R(g, '#7a4a28', x + (dir === 2 ? -13 : 6), y - 18, 6, 9); R(g, '#3a2210', x - 9, y - 4, 2, 4 - f); R(g, '#3a2210', x + 7, y - 4, 2, 3 + f); R(g, '#3a2210', x - 4, y - 4, 2, 3 + f); R(g, '#3a2210', x + 2, y - 4, 2, 4 - f); R(g, '#2a1608', x + (dir === 2 ? -9 : 4), y - 19, 3, 5); break;
    case 'eagle': R(g, '#d8b060', x - 6, y - 8, 12, 6); R(g, '#f0e0a0', x - 16, y - 12 - f * 3, 11, 4); R(g, '#f0e0a0', x + 5, y - 12 - f * 3, 11, 4); R(g, '#fff', x + 4, y - 11, 4, 4); R(g, '#e8a020', x + 7, y - 9, 3, 2); break;
    case 'dolphin': R(g, '#6a9ac8', x - 11, y - 8, 22, 7); R(g, '#c8e0f0', x - 8, y - 4, 16, 3); R(g, '#6a9ac8', x + 10, y - 9 - f * 2, 5, 3); R(g, '#4a7aa8', x - 2, y - 13, 4, 5); R(g, '#9ac8e8', x - 15, y - 8 + f, 5, 3); R(g, '#3a6a98', x - 12, y - 10, 4, 2); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x - 14, y - 1, 28, 1); break;
    case 'hoverbike': R(g, '#2a2a40', x - 10, y - 7, 20, 5); R(g, '#ff3fa4', x - 10, y - 8, 20, 1); R(g, '#2ee6ff', x - 9, y - 2 + f, 18, 1); R(g, '#5a5a80', x + 6, y - 11, 4, 5); break;
  }
}

// ---------- PROPS ----------
const RUNE_COL = { sole: '#ffd860', luna: '#a8c8ff', stella: '#ffffff', fiore: '#ff80c0' };
function drawRune(g, id, x, y, t, lit) {
  const col = RUNE_COL[id] || '#fff';
  shadow(g, x, y, 14); R(g, '#4a4a56', x - 6, y - 16, 12, 16); R(g, '#6a6a78', x - 6, y - 16, 12, 2); R(g, '#34343e', x - 6, y - 4, 12, 4);
  const a = lit ? 1 : 0.45 + 0.2 * Math.sin(t * 3);
  g.globalAlpha = a; g.fillStyle = col;
  if (id === 'sole') { R(g, col, x - 1, y - 12, 3, 3); R(g, col, x - 4, y - 11, 2, 1); R(g, col, x + 3, y - 11, 2, 1); R(g, col, x, y - 14, 1, 2); R(g, col, x, y - 8, 1, 2); }
  else if (id === 'luna') { R(g, col, x - 2, y - 13, 4, 1); R(g, col, x - 3, y - 12, 2, 4); R(g, col, x - 2, y - 8, 4, 1); R(g, col, x + 1, y - 12, 1, 1); }
  else if (id === 'stella') { R(g, col, x, y - 14, 1, 7); R(g, col, x - 3, y - 11, 7, 1); R(g, col, x - 2, y - 13, 1, 1); R(g, col, x + 2, y - 13, 1, 1); R(g, col, x - 2, y - 9, 1, 1); R(g, col, x + 2, y - 9, 1, 1); }
  else { R(g, col, x - 1, y - 12, 3, 3); R(g, col, x - 3, y - 11, 1, 1); R(g, col, x + 3, y - 11, 1, 1); R(g, col, x, y - 14, 1, 1); R(g, '#40a060', x, y - 9, 1, 4); }
  g.globalAlpha = 1;
  if (lit) { g.globalAlpha = 0.25 + 0.15 * Math.sin(t * 8); g.fillStyle = col; g.fillRect(x - 8, y - 18, 16, 20); g.globalAlpha = 1; }
}
export function drawProp(g, kind, x, y, t, open) {
  if (kind.startsWith('rune:')) { drawRune(g, kind.slice(5), x, y, t, open); return; }
  shadow(g, x, y, 12);
  switch (kind) {
    case 'chest': R(g, '#6a4220', x - 6, y - 8, 12, 8); R(g, open ? '#2a1a0a' : '#8a5a2c', x - 6, y - 10 - (open ? 2 : 0), 12, 3); R(g, '#e8c040', x - 1, y - 7, 2, 3); break;
    case 'sign': R(g, '#6a4220', x - 1, y - 6, 2, 6); R(g, '#a8733a', x - 7, y - 14, 14, 8); R(g, '#e8d8a8', x - 6, y - 13, 12, 1); R(g, '#e8d8a8', x - 6, y - 11, 8, 1); break;
    case 'seal': R(g, '#6a6a78', x - 8, y - 14, 16, 14); R(g, '#8a8a98', x - 8, y - 14, 16, 3); R(g, '#d83030', x - 3, y - 11, 6, 6); R(g, '#fff', x - 1, y - 9, 2, 2); break;
    case 'console': R(g, '#3a3a48', x - 8, y - 9, 16, 9); R(g, '#2ee6ff', x - 6, y - 8, 5, 3); R(g, '#ff6a2a', x + 2 + (Math.floor(t * 4) & 1), y - 8, 4, 3); R(g, '#8a8a98', x - 8, y - 9, 16, 1); break;
    case 'horse': R(g, '#7a4a28', x - 8, y - 12, 16, 8); R(g, '#7a4a28', x + 5, y - 17, 5, 8); R(g, '#3a2210', x - 8, y - 4, 2, 4); R(g, '#3a2210', x + 6, y - 4, 2, 4); R(g, '#3a2210', x - 3, y - 4, 2, 4); R(g, '#2a1608', x + 4, y - 18, 2, 4); break;
    case 'cat': R(g, '#e8a850', x - 4, y - 6, 8, 5); R(g, '#e8a850', x + 2, y - 9, 4, 4); R(g, '#e8a850', x + 2, y - 11, 1, 2); R(g, '#e8a850', x + 5, y - 11, 1, 2); R(g, '#222', x + 3, y - 8, 1, 1); break;
    default: R(g, '#a0a0b0', x - 5, y - 8, 10, 8);
  }
}

export function drawItemIcon(g, item, x, y) {
  const col = { food: '#e8a050', potion: '#6ac8f0', gear: '#c8c8d8', material: '#a8885a', story: '#e86a8a' }[item.cat];
  R(g, '#14101c', x, y, 10, 10); R(g, col, x + 1, y + 1, 8, 8); R(g, 'rgba(255,255,255,.4)', x + 1, y + 1, 8, 2);
}
