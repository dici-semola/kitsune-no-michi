// Monumenti unici: ogni città ha il suo (torre della campana, albero degli elfi, torre dell'orologio, drago di pietra, obelisco, totem, arco di trionfo,
// monumento dell'ancora, pilone al neon, guglia di corallo...). Origine = piedi al centro; animati con vento, fiamme, ingranaggi e riflessi.
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const OUT = '#14081a';
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mx = (a, b, f) => { const A = hx(a), B = hx(b); return '#' + A.map((q, i) => Math.round(q + (B[i] - q) * f).toString(16).padStart(2, '0')).join(''); };
const lt = (c, f = 0.3) => mx(c, '#ffffff', f), dk = (c, f = 0.3) => mx(c, '#14081a', f);
const box = (g, x, y, w, h, c) => { R(g, OUT, x - 1, y - 1, w + 2, h + 2); R(g, c, x, y, w, h); R(g, lt(c, 0.3), x, y, w, 1); R(g, lt(c, 0.18), x, y, 1, h); R(g, dk(c, 0.28), x + w - 1, y, 1, h); R(g, dk(c, 0.35), x, y + h - 1, w, 1); };

const bell_tower = (g, x, y, t) => {
  box(g, x - 11, y - 6, 22, 6, '#8a8a96');                                                   // basamento di pietra
  for (const dx of [-9, 6]) box(g, x + dx, y - 34, 4, 28, '#a0522d');                       // montanti di legno
  box(g, x - 9, y - 20, 18, 3, '#8a4a28'); box(g, x - 9, y - 8, 18, 2, '#8a4a28');          // traversi
  for (let i = -1; i <= 1; i++) { R(g, '#c8283a', x + i * 6 - 1, y - 33, 2, 4); }
  R(g, OUT, x - 15, y - 42, 30, 8); R(g, '#2a7a5a', x - 14, y - 41, 28, 6); R(g, '#4aa87a', x - 14, y - 41, 28, 1); R(g, OUT, x - 11, y - 46, 22, 6); R(g, '#2a7a5a', x - 10, y - 45, 20, 4); R(g, '#4aa87a', x - 10, y - 45, 20, 1);   // tetto a due piani
  R(g, '#f0c040', x - 1, y - 49, 2, 3);
  const sw = Math.round(Math.sin(t * 2.2) * 3); R(g, '#3a2418', x - 1, y - 33, 2, 5); R(g, OUT, x - 5 + sw, y - 29, 11, 11); R(g, '#d8a830', x - 4 + sw, y - 28, 9, 9); R(g, '#f8d868', x - 4 + sw, y - 28, 3, 9); R(g, '#8a6a18', x + 2 + sw, y - 24, 3, 5); R(g, '#3a2418', x - 1 + sw, y - 19, 2, 2);   // campana che oscilla
  if (Math.abs(Math.sin(t * 2.2)) > 0.97) { R(g, '#fff', x + 7, y - 24, 1, 1); }
};
const elf_tree = (g, x, y, t) => {
  box(g, x - 5, y - 26, 10, 26, '#6a4a2a'); R(g, '#4a2e18', x - 8, y - 4, 16, 4); R(g, '#8a6a3a', x - 8, y - 4, 16, 1);
  for (const [dx, dy, r] of [[-12, -34, 9], [0, -42, 12], [12, -34, 9], [-4, -52, 9], [7, -48, 7]]) { for (let j = -r; j <= r; j++) { const w2 = Math.round(Math.sqrt(r * r - j * j)); R(g, '#1f6a3a', x + dx - w2, y + dy + j, w2 * 2, 1); } for (let j = -r; j < 0; j++) { const w2 = Math.round(Math.sqrt(r * r - j * j) * 0.7); R(g, '#3a9a5a', x + dx - w2 - 2, y + dy + j, w2, 1); } }
  for (let i = 0; i < 7; i++) { const lx = x - 15 + i * 5, ly = y - 30 - ((i * 7) % 12), fl = 0.6 + 0.4 * Math.sin(t * 3 + i); R(g, '#8a6a3a', lx, ly - 4, 1, 4); R(g, OUT, lx - 2, ly, 5, 6); R(g, '#a8f0c8', lx - 1, ly + 1, 3, 4); g.globalAlpha = 0.25 * fl; R(g, '#a8ffd0', lx - 5, ly - 3, 11, 12); g.globalAlpha = 1; }
  for (let i = 0; i < 5; i++) { const e = (t * 0.4 + i / 5) % 1; g.globalAlpha = 1 - e; R(g, '#d8ffe8', x - 14 + i * 7 + Math.sin(e * 6 + i) * 3, y - 20 - e * 30, 1, 1); g.globalAlpha = 1; }
};
const clock_tower = (g, x, y, t) => {
  box(g, x - 9, y - 40, 18, 40, '#b86a4a'); for (let j = 0; j < 8; j++) R(g, dk('#b86a4a', 0.2), x - 8 + (j & 1) * 4, y - 36 + j * 5, 8, 1);
  box(g, x - 11, y - 4, 22, 4, '#8a8a96'); R(g, '#3a2a1c', x - 3, y - 12, 6, 12); R(g, '#e8c870', x - 2, y - 11, 4, 11);
  R(g, OUT, x - 8, y - 38, 16, 16); R(g, '#f4f0e0', x - 7, y - 37, 14, 14); R(g, '#c8a060', x - 7, y - 37, 14, 1); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; R(g, '#3a2a1c', x + Math.round(Math.cos(a) * 5.5) - 0, y - 30 + Math.round(Math.sin(a) * 5.5), 1, 1); }
  const mn = (t * 0.6) % 6.283, hr = (t * 0.05) % 6.283; for (let k = 1; k <= 5; k++) R(g, '#14081a', x + Math.round(Math.sin(mn) * k), y - 30 - Math.round(Math.cos(mn) * k), 1, 1); for (let k = 1; k <= 3; k++) R(g, '#c8283a', x + Math.round(Math.sin(hr) * k), y - 30 - Math.round(Math.cos(hr) * k), 1, 1);
  for (let i = 0; i < 6; i++) { R(g, OUT, x - 11 + i * 2, y - 44 - i, 22 - i * 4, 1); } R(g, OUT, x - 11, y - 44, 22, 6); R(g, '#2a4a8a', x - 10, y - 43, 20, 4); R(g, '#4a62c8', x - 10, y - 43, 20, 1); R(g, OUT, x - 7, y - 49, 14, 6); R(g, '#2a4a8a', x - 6, y - 48, 12, 4); R(g, '#f0c040', x - 1, y - 53, 2, 4); const w = Math.round(Math.sin(t * 3)); R(g, '#c8283a', x + 1, y - 52, 5 + w, 3);
};
const dragon_statue = (g, x, y, t) => {
  box(g, x - 12, y - 8, 24, 8, '#c8a060'); R(g, '#8a6a38', x - 12, y - 4, 24, 1);
  const body = '#2a7a5a'; for (let i = 0; i < 9; i++) { const a = i * 0.9, bx = x + Math.round(Math.sin(a) * 9), by = y - 10 - i * 3; R(g, OUT, bx - 4, by - 1, 9, 6); R(g, body, bx - 3, by, 7, 4); R(g, lt(body, 0.3), bx - 3, by, 7, 1); R(g, '#f0c040', bx - 1, by - 1 - (i & 1), 2, 1); }
  R(g, OUT, x - 9, y - 40, 14, 9); R(g, body, x - 8, y - 39, 12, 7); R(g, lt(body, 0.3), x - 8, y - 39, 12, 1); R(g, '#f0c040', x - 9, y - 43, 2, 4); R(g, '#f0c040', x + 3, y - 43, 2, 4);
  const gl = 0.6 + 0.4 * Math.sin(t * 4); R(g, '#c8283a', x - 5, y - 37, 2, 2); R(g, '#c8283a', x, y - 37, 2, 2); g.globalAlpha = gl; R(g, '#ff7a5a', x - 5, y - 37, 1, 1); R(g, '#ff7a5a', x, y - 37, 1, 1); g.globalAlpha = 1; R(g, '#f4f0e8', x - 4, y - 33, 1, 2); R(g, '#f4f0e8', x + 1, y - 33, 1, 2);
  for (let i = 0; i < 3; i++) { const e = (t * 0.7 + i / 3) % 1; g.globalAlpha = 1 - e; R(g, '#ff9a50', x - 12 - e * 5, y - 36 - e * 4, 2, 2); g.globalAlpha = 1; }
};
const obelisk_well = (g, x, y, t) => {
  box(g, x - 8, y - 6, 16, 6, '#c8a060'); box(g, x - 5, y - 42, 10, 36, '#d8b878'); R(g, OUT, x - 4, y - 48, 8, 6); R(g, '#f0c040', x - 3, y - 47, 6, 4); R(g, '#fff0a0', x - 3, y - 47, 6, 1);
  for (let j = 0; j < 6; j++) { R(g, '#8a6a38', x - 3, y - 38 + j * 5, 6, 1); R(g, '#40c0a0', x - 1, y - 36 + j * 5, 2, 2); }
  g.globalAlpha = 0.25 + 0.2 * Math.sin(t * 2); R(g, '#fff0a0', x - 9, y - 52, 18, 8); g.globalAlpha = 1;
  box(g, x + 9, y - 10, 9, 10, '#a86a3a'); R(g, '#3a8aa8', x + 10, y - 9, 7, 2); for (let i = 0; i < 2; i++) { const e = (t * 1.2 + i * 0.5) % 1; g.globalAlpha = 1 - e; R(g, '#7ac8f0', x + 13 + i * 2, y - 12 - e * 6, 1, 2); g.globalAlpha = 1; }
};
const totem_pole = (g, x, y, t) => {
  box(g, x - 7, y - 5, 14, 5, '#8a6a3a'); const cols = ['#c8283a', '#2a7a4a', '#e8c040', '#2a4a8a', '#a05aff'];
  for (let i = 0; i < 5; i++) { const by = y - 10 - i * 8; box(g, x - 6, by, 12, 8, cols[i]); R(g, '#f4f0e8', x - 4, by + 2, 3, 2); R(g, '#f4f0e8', x + 1, by + 2, 3, 2); R(g, OUT, x - 3, by + 2, 1, 2); R(g, OUT, x + 2, by + 2, 1, 2); R(g, OUT, x - 2, by + 5, 4, 1); }
  for (const s of [-1, 1]) { R(g, '#f0c040', x + s * 8 - (s > 0 ? 0 : 2), y - 40, 2, 10); R(g, '#c8283a', x + s * 8 - (s > 0 ? 0 : 2), y - 44, 2, 4); R(g, '#40c0a0', x + s * 8 - (s > 0 ? 0 : 2), y - 36, 2, 4); }
  R(g, '#f0c040', x - 3, y - 54, 6, 4); R(g, '#c8283a', x - 1, y - 56, 2, 3); const w = Math.round(Math.sin(t * 3)); R(g, '#40c0a0', x + 6 + w, y - 50, 3, 1); R(g, '#e8c040', x - 9 - w, y - 48, 3, 1);
};
const triumph_arch = (g, x, y, t) => {
  for (const dx of [-17, 11]) { box(g, x + dx, y - 34, 6, 34, '#e0dcd4'); for (let j = 0; j < 5; j++) R(g, '#b4b0a8', x + dx + 1, y - 30 + j * 6, 4, 1); }
  box(g, x - 19, y - 42, 38, 9, '#f4f0e8'); R(g, '#f0c040', x - 18, y - 38, 36, 2); box(g, x - 15, y - 48, 30, 6, '#e0dcd4');
  R(g, OUT, x - 9, y - 54, 18, 6); R(g, '#f0c040', x - 8, y - 53, 16, 4); R(g, '#fff0a0', x - 8, y - 53, 16, 1);
  for (let i = 0; i < 4; i++) { const hx0 = x - 7 + i * 4; R(g, '#c8a040', hx0, y - 62 + (i & 1), 3, 4); R(g, '#f0c040', hx0, y - 62 + (i & 1), 1, 3); }   // quadriga
  g.globalAlpha = 0.18 + 0.1 * Math.sin(t * 2); R(g, '#fff0a0', x - 11, y - 30, 22, 28); g.globalAlpha = 1;
};
const anchor_monument = (g, x, y, t) => {
  box(g, x - 10, y - 7, 20, 7, '#8a8a96'); box(g, x - 2, y - 34, 4, 27, '#6a7a8a'); box(g, x - 8, y - 30, 16, 3, '#6a7a8a'); R(g, OUT, x - 5, y - 40, 10, 8); R(g, '#8a9aaa', x - 4, y - 39, 8, 6); R(g, '#3a4a5a', x - 2, y - 38, 4, 4);
  for (const s of [-1, 1]) { for (let k = 0; k < 6; k++) { const a = k * 0.5, px = x + s * (8 - Math.round(Math.sin(a) * 8)), py = y - 12 + Math.round(Math.cos(a) * -2) - k; R(g, '#6a7a8a', px - 1, py, 3, 2); } R(g, '#8a9aaa', x + s * 8 - 2, y - 8, 4, 3); }
  R(g, '#c8a060', x + 12, y - 18, 8, 8); R(g, OUT, x + 11, y - 19, 10, 10); R(g, '#a8743a', x + 12, y - 18, 8, 8); const r = t * 0.8; for (let i = 0; i < 8; i++) { const a = r + i * 0.785; R(g, '#f0c040', x + 16 + Math.round(Math.cos(a) * 5), y - 14 + Math.round(Math.sin(a) * 5), 1, 1); } R(g, '#f0c040', x + 15, y - 15, 2, 2);
  const gx = x - 14 + ((t * 8) % 28); R(g, '#f4f0e8', gx, y - 46 + Math.round(Math.sin(t * 6) * 1), 3, 1); R(g, '#f4f0e8', gx + 2, y - 47, 2, 1);
};
const neon_tower = (g, x, y, t) => {
  box(g, x - 8, y - 5, 16, 5, '#3a3a4a'); box(g, x - 3, y - 40, 6, 35, '#5a5a6a'); for (let j = 0; j < 7; j++) R(g, '#2ee6ff', x - 1, y - 36 + j * 5, 2, 1);
  for (const [dy, c, w] of [[-34, '#ff3fa4', 20], [-26, '#2ee6ff', 16], [-18, '#a05aff', 18]]) { const fl = Math.sin(t * (5 + dy * 0.1)) > -0.8; if (fl) { g.globalAlpha = 0.3; R(g, c, x - w / 2 - 2, y + dy - 2, w + 4, 8); g.globalAlpha = 1; R(g, OUT, x - w / 2, y + dy, w, 5); R(g, c, x - w / 2 + 1, y + dy + 1, w - 2, 3); R(g, '#ffffff', x - w / 2 + 2, y + dy + 1, 3 + ((t * 6) | 0) % 5, 1); } }
  const ring = (t * 1.5) % 1; g.strokeStyle = `rgba(46,230,255,${1 - ring})`; g.beginPath(); g.ellipse(x, y - 44, 6 + ring * 8, 2 + ring * 3, 0, 0, 6.283); g.stroke(); R(g, '#2ee6ff', x - 1, y - 46, 2, 4);
};
const coral_spire = (g, x, y, t) => {
  box(g, x - 9, y - 5, 18, 5, '#e8d8d0'); for (const [dx, h, c] of [[-7, 22, '#ff6a7a'], [-3, 34, '#ff9aa8'], [1, 40, '#ffb0c0'], [5, 28, '#e8506a'], [8, 18, '#ff8a9a']]) { R(g, OUT, x + dx - 1, y - 5 - h - 1, 5, h + 1); R(g, c, x + dx, y - 5 - h, 3, h); R(g, lt(c, 0.5), x + dx, y - 5 - h, 1, h); R(g, lt(c, 0.5), x + dx - 2, y - 5 - h + 4, 2, 1); R(g, lt(c, 0.5), x + dx + 3, y - 5 - h + 8, 2, 1); }
  for (let i = 0; i < 4; i++) { const e = (t * 0.5 + i / 4) % 1; g.globalAlpha = (1 - e) * 0.9; g.strokeStyle = '#bfe8ff'; g.beginPath(); g.arc(x - 6 + i * 4 + Math.sin(e * 7 + i) * 2, y - 14 - e * 40, 1 + e * 2, 0, 6.283); g.stroke(); g.globalAlpha = 1; }
};
const anvil_statue = (g, x, y, t) => {
  box(g, x - 10, y - 6, 20, 6, '#6a6a78'); box(g, x - 7, y - 14, 14, 8, '#3a3a48'); box(g, x - 11, y - 20, 22, 6, '#4a4a5a'); R(g, OUT, x + 8, y - 22, 6, 4); R(g, '#4a4a5a', x + 9, y - 21, 5, 2);
  box(g, x - 2, y - 40, 4, 20, '#8a6a3a'); box(g, x - 8, y - 46, 16, 7, '#6a6a78'); const k = (t * 2) % 1; if (k < 0.3) { R(g, '#ffd060', x - 6 + k * 20, y - 24 - k * 10, 1, 1); R(g, '#ff7a30', x - 3 + k * 16, y - 26 - k * 8, 1, 1); }
  g.globalAlpha = 0.3 + 0.2 * Math.sin(t * 5); R(g, '#ff7a30', x - 6, y - 22, 12, 3); g.globalAlpha = 1;
};
const glow_mushroom = (g, x, y, t) => {
  box(g, x - 4, y - 24, 8, 24, '#d8d0e0'); for (const [dx, dy, r, c] of [[0, -28, 14, '#5a8ae8'], [-12, -18, 8, '#a05aff'], [12, -16, 7, '#40c0a0']]) { for (let j = -r / 2; j < 2; j++) { const w2 = Math.round(Math.sqrt(Math.max(0, r * r - (j * 2) * (j * 2)))); R(g, OUT, x + dx - w2 - 1, y + dy + j - 1, w2 * 2 + 2, 3); R(g, c, x + dx - w2, y + dy + j, w2 * 2, 1); } R(g, lt(c, 0.6), x + dx - 3, y + dy - r / 2, 3, 1); }
  for (let i = 0; i < 6; i++) { const e = (t * 0.4 + i / 6) % 1; g.globalAlpha = (1 - e) * 0.9; R(g, '#c8f0ff', x - 14 + i * 5 + Math.sin(e * 5 + i) * 2, y - 14 - e * 30, 1, 1); g.globalAlpha = 1; }
  g.globalAlpha = 0.18 + 0.1 * Math.sin(t * 2); R(g, '#a0d0ff', x - 18, y - 40, 36, 30); g.globalAlpha = 1;
};
export const LANDMARKS = { bell_tower, elf_tree, clock_tower, dragon_statue, obelisk_well, totem_pole, triumph_arch, anchor_monument, neon_tower, coral_spire, anvil_statue, glow_mushroom };
export const LANDMARK_OF = { hinomura: 'bell_tower', silvaneth: 'elf_tree', aurelburg: 'clock_tower', longxi: 'dragon_statue', sahar: 'obelisk_well', kuru: 'totem_pole', augusta: 'triumph_arch', portomarea: 'anchor_monument', zeroquartier: 'neon_tower', coralia: 'coral_spire', khaz_dum: 'anvil_statue', nethermere: 'glow_mushroom' };
