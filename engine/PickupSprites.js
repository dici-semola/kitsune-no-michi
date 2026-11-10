// Raccoglibili sul terreno: ogni oggetto ha il suo aspetto riconoscibile (bacche su un ramoscello, erba con fiorellini, funghi luminosi, pepite di minerale,
// cristalli, sabbia con schegge di vetro, carbone, corallo, ossa...). Piccolo brillio periodico per segnalare che si possono prendere.
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a, b, f) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
const lite = (c, f = 0.35) => mix(c, '#ffffff', f), dark = (c, f = 0.35) => mix(c, '#1a0a24', f);

function berries(g, x, y, col) {
  R(g, '#2e6a2a', x - 1, y - 4, 2, 4); R(g, '#3e8a3a', x - 5, y - 6, 4, 2); R(g, '#3e8a3a', x + 1, y - 7, 4, 2); R(g, '#5ac05a', x - 5, y - 6, 2, 1); R(g, '#5ac05a', x + 1, y - 7, 2, 1); R(g, '#2e6a2a', x - 3, y - 8, 4, 2);
  for (const [dx, dy] of [[-4, -3], [-1, -5], [2, -4], [4, -2], [-2, -1], [0, -2]]) { R(g, dark(col, 0.45), x + dx, y + dy, 3, 3); R(g, col, x + dx, y + dy, 2, 2); R(g, lite(col, 0.7), x + dx, y + dy, 1, 1); }
}
function herb(g, x, y) {
  R(g, '#2e6a2a', x - 1, y - 3, 2, 3); for (const [dx, h, l] of [[-4, 6, -1], [-2, 8, 0], [0, 9, 0], [2, 7, 1], [4, 5, 1]]) { R(g, '#3a9a3a', x + dx, y - h, 2, h - 2); R(g, '#6ad060', x + dx, y - h, 1, h - 3); R(g, '#8af080', x + dx + l, y - h, 1, 1); }
  R(g, '#ffffff', x - 1, y - 11, 3, 2); R(g, '#ffd0e8', x, y - 12, 1, 4); R(g, '#ffe060', x, y - 10, 1, 1);
}
function mushroom(g, x, y, t) {
  const gl = 0.25 + 0.2 * Math.sin(t * 3); g.globalAlpha = gl; R(g, '#a0e8ff', x - 8, y - 12, 16, 12); g.globalAlpha = 1;
  for (const [dx, h, w] of [[-4, 6, 6], [2, 8, 7], [-1, 4, 4]]) { R(g, '#e8f0f4', x + dx, y - h + 3, 2, h - 3); R(g, '#3a8aa8', x + dx - (w >> 1) + 1, y - h, w, 3); R(g, '#7adaf8', x + dx - (w >> 1) + 1, y - h, w - 2, 1); R(g, '#e8fcff', x + dx, y - h + 1, 1, 1); }
}
function nugget(g, x, y, col, spark) {
  R(g, dark(col, 0.5), x - 5, y - 3, 11, 4); R(g, col, x - 5, y - 5, 10, 5); R(g, lite(col, 0.35), x - 4, y - 6, 5, 2); R(g, col, x - 2, y - 8, 5, 3); R(g, lite(col, 0.55), x - 1, y - 8, 2, 1); R(g, dark(col, 0.3), x + 2, y - 4, 4, 3);
  R(g, spark, x - 3, y - 4, 1, 1); R(g, spark, x + 1, y - 6, 1, 1);
}
function crystal(g, x, y, col, t) {
  for (const [dx, h, w] of [[-4, 6, 3], [-1, 10, 4], [3, 7, 3]]) { R(g, dark(col, 0.5), x + dx - 1, y - h - 1, w + 2, h + 1); R(g, col, x + dx, y - h, w, h); R(g, lite(col, 0.6), x + dx, y - h, 1, h - 1); R(g, dark(col, 0.25), x + dx + w - 1, y - h + 2, 1, h - 2); }
  if (Math.sin(t * 4) > 0.7) { R(g, '#ffffff', x + 1, y - 10, 1, 1); R(g, '#ffffff', x, y - 9, 3, 1); }
}
function sandpile(g, x, y) { R(g, '#b89a52', x - 6, y - 2, 13, 2); R(g, '#e2c77e', x - 5, y - 4, 11, 3); R(g, '#f4e2a8', x - 3, y - 5, 6, 2); for (const [dx, dy] of [[-3, -5], [1, -4], [3, -6]]) { R(g, '#bfe8ff', x + dx, y + dy, 2, 3); R(g, '#ffffff', x + dx, y + dy, 1, 1); } }
function lumps(g, x, y, col, glint) { for (const [dx, dy, w, h] of [[-5, -3, 5, 4], [0, -5, 5, 5], [-2, -7, 4, 3]]) { R(g, dark(col, 0.5), x + dx - 1, y + dy - 1, w + 2, h + 2); R(g, col, x + dx, y + dy, w, h); R(g, lite(col, 0.3), x + dx, y + dy, w - 2, 1); } R(g, glint, x - 3, y - 4, 1, 1); R(g, glint, x + 2, y - 3, 1, 1); }
function wood(g, x, y) { for (const [dy, off] of [[-3, 0], [-6, 2]]) { R(g, '#4a2e18', x - 6 + off, y + dy - 1, 13, 5); R(g, '#7a5230', x - 6 + off, y + dy, 13, 3); R(g, '#a07444', x - 6 + off, y + dy, 13, 1); R(g, '#d8b070', x + 5 + off, y + dy, 2, 3); } }
function dust(g, x, y, t) { R(g, '#4a2a8a', x - 5, y - 2, 11, 2); R(g, '#7a4ae8', x - 4, y - 4, 9, 3); for (let i = 0; i < 4; i++) { const tw = Math.sin(t * 3 + i * 1.7) > 0.2; R(g, tw ? '#ffffff' : '#ffe890', x - 4 + i * 3, y - 5 - (i & 1) * 3, 1, 1); if (tw) { R(g, '#ffe890', x - 5 + i * 3, y - 5 - (i & 1) * 3, 3, 1); } } }
function coral(g, x, y) { R(g, '#8a1a2a', x - 1, y - 4, 3, 4); for (const [dx, h] of [[-4, 7], [-1, 10], [2, 8], [5, 5]]) { R(g, '#c8283a', x + dx, y - h, 2, h - 1); R(g, '#ff6a7a', x + dx, y - h, 1, h - 2); R(g, '#ff9aa8', x + dx - 1, y - h, 1, 1); R(g, '#ff9aa8', x + dx + 2, y - h + 1, 1, 1); } }
function bones(g, x, y) { R(g, '#d8d0b8', x - 6, y - 3, 11, 2); R(g, '#f4eed8', x - 6, y - 4, 3, 2); R(g, '#f4eed8', x + 3, y - 2, 3, 3); R(g, '#d8d0b8', x - 2, y - 7, 2, 6); R(g, '#f4eed8', x - 3, y - 8, 4, 2); R(g, '#1a0a24', x - 3, y - 7, 1, 1); R(g, '#1a0a24', x, y - 7, 1, 1); }
function chip(g, x, y, t) { R(g, '#141828', x - 5, y - 6, 11, 8); R(g, '#2a3a5a', x - 4, y - 5, 9, 6); for (let i = 0; i < 3; i++) { R(g, '#6a7a9a', x - 7, y - 5 + i * 2, 2, 1); R(g, '#6a7a9a', x + 5, y - 5 + i * 2, 2, 1); } R(g, Math.sin(t * 6) > 0 ? '#2ee6ff' : '#ff3fa4', x - 1, y - 4, 3, 3); }

const COL = { ferro_grezzo: ['#8a8a96', '#d8d8e4'], rame: ['#c8703a', '#ffd0a0'], carbone: ['#2a2430', '#8a7aa0'], zolfo: ['#e8d030', '#ffffff'], salnitro: ['#d8e0e8', '#ffffff'], componente_elettrico: ['#4a6a8a', '#2ee6ff'], cenere_yomi: ['#6a5a78', '#ff7a30'] };
export function drawPickup(g, item, x, y, t) {
  item = item || '';
  if (/bacche/.test(item)) berries(g, x, y, /rosse|rossa/.test(item) ? '#e8505a' : /gial/.test(item) ? '#f0c040' : '#3a62e8');
  else if (/erba|radic|foglia/.test(item)) herb(g, x, y);
  else if (/fungo|funghi/.test(item)) mushroom(g, x, y, t);
  else if (/legno/.test(item)) wood(g, x, y);
  else if (/polvere_stelle|stelle/.test(item)) dust(g, x, y, t);
  else if (/ghiaccio/.test(item)) crystal(g, x, y, '#9ad8f8', t);
  else if (/cristallo/.test(item)) crystal(g, x, y, /neon/.test(item) ? '#ff5ad0' : '#a07aff', t);
  else if (/sabbia/.test(item)) sandpile(g, x, y);
  else if (/corallo/.test(item)) coral(g, x, y);
  else if (/^osso|osso_/.test(item)) bones(g, x, y);
  else if (/chip/.test(item)) chip(g, x, y, t);
  else if (COL[item]) { if (item === 'carbone' || item === 'cenere_yomi') lumps(g, x, y, COL[item][0], COL[item][1]); else nugget(g, x, y, COL[item][0], COL[item][1]); }
  else nugget(g, x, y, '#9a9aa8', '#ffe080');
  const k = (t * 0.5) % 1; if (k < 0.18) { g.globalAlpha = 1 - k / 0.18; R(g, '#ffffff', x + 6, y - 12, 1, 3); R(g, '#ffffff', x + 5, y - 11, 3, 1); g.globalAlpha = 1; }   // brillio periodico
}
