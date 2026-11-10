// Skin dei tile: terreno e oggetti ridisegnati nello stile dell'icona (luce dall'alto-sinistra, ombre morbide, dettagli piccoli che variano da tile a tile).
// Erba con ciuffi di diversa altezza che ondeggiano e fiorellini, acqua con onde e riflessi, sabbia con increspature, neve con dune e scintille, ecc.
import { hash2 } from '../core/Util.js';
import { WALL_PALS, ROOF_PALS } from './TownStyles.js';
const S = 16;
// palette delle scogliere per ambiente: 0 roccia, 1 canyon, 2 vulcano, 3 neve, 4 altopiano, 5 arenaria
export const CLIFF_PAL = [['#b07868', '#d89a86', '#6e4440'], ['#b05a34', '#dc8050', '#6e3020'], ['#5a4044', '#8a6064', '#2e1e22'], ['#8196bc', '#c4d6f0', '#42587f'], ['#8c8c70', '#bcbc9a', '#54543c'], ['#c8a468', '#ecca8e', '#8a6a38'], ['#d8d0bc', '#f4eedc', '#8c8470']];
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const rnd = (v, i, s = 5) => hash2(v * 13 + i * 3 + s, i * 7 + v * 5 + s, s);
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a, b, f) => { const A = hx(a), B = hx(b); return '#' + A.map((q, i) => Math.round(q + (B[i] - q) * f).toString(16).padStart(2, '0')).join(''); };
const lite = (c, f = 0.3) => mix(c, '#ffffff', f), dark = (c, f = 0.3) => mix(c, '#10081a', f);
const ri = (v, i, n, s) => Math.floor(rnd(v, i, s) * n);
function patches(g, v, n, col, s0 = 1) { for (let i = 0; i < n; i++) R(g, col, ri(v, i, 15, s0), ri(v, i, 15, s0 + 1), 2 + ri(v, i, 3, s0 + 2), 1 + ri(v, i, 2, s0 + 3)); }

export const SKINS = {
  grass(g, c, f, v, def) {
    const jungle = def && def.tuft === 'jungle', dead = def && def.tuft === 'dead', magic = def && def.tuft === 'magic';
    R(g, c[0], 0, 0, S, S); patches(g, v, 3, c[2], 1); patches(g, v, 4, c[1], 7);
    const blade = dead ? '#b8a070' : magic ? '#b8a8ff' : jungle ? lite(c[1], 0.1) : lite(c[1], 0.2);
    for (let i = 0; i < 7; i++) {
      const x = 1 + ri(v, i, 13, 20), y = 5 + ri(v, i, 10, 21), h = 2 + ri(v, i, 3, 22) + (jungle ? 1 : 0), lean = ((f + i + v) & 3) === 0 ? 1 : 0, lh = ri(v, i, 2, 23);
      R(g, c[2], x, y, 1, 1);
      R(g, c[1], x, y - h + 1, 1, h); R(g, blade, x + lean * (h > 2 ? 1 : 0), y - h, 1, 1);                       // lama centrale con punta più chiara che segue il vento
      if (h > 2) { R(g, c[1], x - 1, y - h + 2 + lh, 1, h - 2 - lh); R(g, c[1], x + 1, y - h + 2, 1, h - 2); R(g, blade, x - 1 - lean, y - h + 2 + lh, 1, 1); }
    }
    if (rnd(v, 99, 9) < (dead ? 0.05 : 0.16)) { const x = 2 + ri(v, 5, 11, 30), y = 3 + ri(v, 6, 9, 31), col = magic ? ['#ff9aff', '#9affff'][v & 1] : ['#ffffff', '#ffe060', '#ff9ac0', '#c0a0ff'][v & 3]; R(g, '#2e6a2a', x, y + 1, 1, 2); R(g, col, x - 1, y, 3, 1); R(g, col, x, y - 1, 1, 3); R(g, '#ffd040', x, y, 1, 1); }   // fiorellino
  },
  dirt(g, c, f, v) {
    R(g, c[0], 0, 0, S, S); patches(g, v, 4, c[2], 3); patches(g, v, 3, c[1], 9);
    for (let i = 0; i < 4; i++) { const x = 1 + ri(v, i, 12, 40), y = 2 + ri(v, i, 11, 41); R(g, c[2], x, y + 2, 3, 1); R(g, c[1], x, y, 2, 2); R(g, lite(c[1], 0.3), x, y, 1, 1); }   // sassolini con ombra
    if (rnd(v, 7, 8) < 0.5) { const x = 2 + ri(v, 8, 10, 42), y = 4 + ri(v, 9, 8, 43); R(g, c[2], x, y, 3, 1); R(g, c[2], x + 2, y + 1, 2, 1); R(g, c[2], x + 3, y + 2, 1, 2); }                // crepa
    if (rnd(v, 21, 6) < 0.35) { const x = ri(v, 3, 14, 44), y = ri(v, 4, 13, 45); R(g, '#5a8a3a', x, y, 1, 2); R(g, '#7aaa4a', x + 1, y, 1, 1); }                                          // ciuffo sul sentiero
  },
  sand(g, c, f, v) {
    R(g, c[0], 0, 0, S, S); patches(g, v, 3, c[1], 2);
    for (let i = 0; i < 3; i++) { const x = ri(v, i, 9, 50), y = 2 + i * 5 + ri(v, i, 2, 51); R(g, c[2], x, y + 1, 5, 1); R(g, c[2], x + 5, y, 2, 1); R(g, c[1], x + 1, y, 4, 1); }         // increspature del vento
    for (let i = 0; i < 6; i++) R(g, i & 1 ? c[2] : lite(c[1], 0.4), ri(v, i, 16, 52), ri(v, i, 16, 53), 1, 1);
    if (rnd(v, 3, 3) < 0.18) { const x = 3 + ri(v, 4, 10, 54), y = 4 + ri(v, 5, 8, 55); R(g, '#f4e8e0', x, y, 3, 2); R(g, '#d8b8b0', x, y + 1, 3, 1); R(g, '#fff', x, y, 1, 1); }   // conchiglia
  },
  snow(g, c, f, v) {
    R(g, c[0], 0, 0, S, S);
    for (let i = 0; i < 3; i++) { const x = ri(v, i, 8, 60), y = 2 + i * 5 + ri(v, i, 3, 61); R(g, c[2], x, y + 2, 7, 1); R(g, c[2], x + 7, y + 1, 3, 1); R(g, c[1], x + 1, y + 1, 6, 1); R(g, c[1], x + 2, y, 3, 1); }   // dune morbide: ombra azzurra sotto, luce sopra
    for (let i = 0; i < 4; i++) R(g, c[2], ri(v, i, 16, 62), ri(v, i, 16, 63), 1, 1);
    for (let i = 0; i < 2; i++) { const x = ri(v, i + 5, 14, 64), y = ri(v, i + 6, 14, 65); R(g, '#ffffff', x, y, 1, 1); if (((f + i + v) & 3) === 0) { R(g, '#ffffff', x - 1, y, 3, 1); R(g, '#ffffff', x, y - 1, 1, 3); } }   // scintille
  },
  swamp(g, c, f, v) {
    R(g, c[0], 0, 0, S, S); patches(g, v, 4, c[2], 4); patches(g, v, 3, c[1], 10);
    for (let i = 0; i < 2; i++) { const x = 2 + ri(v, i, 11, 70), y = 3 + ri(v, i, 9, 71); R(g, '#8ab060', x, y, 2, 1); R(g, '#a8d080', x + 1, y - 1, 1, 1); }      // bolle e alghe
    const x = 2 + ri(v, 9, 12, 72), y = 6 + ri(v, 8, 8, 73); R(g, '#2a3a1c', x, y, 1, 3); R(g, '#7aaa4a', x, y - 1, 1, 1);                                              // giunco
  },
  canyon(g, c, f, v) {
    R(g, c[0], 0, 0, S, S); for (let y = 2; y < S; y += 5) { R(g, c[2], 0, y + (v & 1), S, 1); R(g, c[1], 0, y - 1 + (v & 1), S, 1); }
    patches(g, v, 3, c[1], 12); for (let i = 0; i < 3; i++) R(g, c[2], ri(v, i, 15, 80), ri(v, i, 15, 81), 2, 1);
  },
  ice(g, c, f, v) {
    R(g, c[0], 0, 0, S, S); for (let i = 0; i < 3; i++) { const x = ri(v, i, 12, 90); R(g, c[1], x, 14 - i * 5, 2, 1); R(g, c[1], x + 1, 13 - i * 5, 2, 1); R(g, c[1], x + 2, 12 - i * 5, 2, 1); }   // riflessi diagonali
    R(g, c[2], 2 + ri(v, 4, 8, 91), 3 + ri(v, 5, 8, 92), 4, 1); R(g, c[2], 5 + ri(v, 6, 6, 93), 4 + ri(v, 7, 6, 94), 1, 3);
    if (((f + v) & 3) === 0) R(g, '#ffffff', ri(v, 1, 14, 95), ri(v, 2, 14, 96), 1, 1);
  },
  ash(g, c, f, v) {
    R(g, c[0], 0, 0, S, S); patches(g, v, 4, c[1], 5); patches(g, v, 2, c[2], 8);
    for (let i = 0; i < 2; i++) { const x = ri(v, i, 15, 100), y = ri(v, i, 15, 101); R(g, ((f + i + v) & 3) === 0 ? '#ffd060' : '#a8402a', x, y, 1, 1); }   // braci
    if (rnd(v, 4, 4) < 0.4) R(g, '#5a5058', ri(v, 5, 12, 102), ri(v, 6, 12, 103), 3, 1);
  },
  cave(g, c, f, v) {
    R(g, c[0], 0, 0, S, S); patches(g, v, 4, c[2], 6); patches(g, v, 3, c[1], 14);
    for (let i = 0; i < 3; i++) { const x = ri(v, i, 12, 110), y = ri(v, i, 12, 111); R(g, c[2], x, y + 2, 3, 1); R(g, c[1], x, y, 2, 2); }
  },
  water(g, c, f, v, def) {
    const lava = def && def.liquid === 'lava', deep = def && def.liquid === 'deep';
    R(g, c[0], 0, 0, S, S);
    if (deep) patches(g, v, 4, c[2], 5);
    for (let r = 0; r < 4; r++) {
      const y = r * 4 + 1, x = (r * 5 + v * 3 + (f & 3) * 2) % 14, o = ((f + r) & 1);
      R(g, c[1], x, y + o, 4, 1); R(g, c[1], (x + 8) % 14, y + 2 - o, 3, 1); R(g, c[2], x + 1, y + 1 + o, 3, 1);
      if (!lava && ((f + r + v) & 3) === 0) R(g, '#ffffff', (x + 2) % 15, y - 1, 1, 1);                              // riflessi che brillano
    }
    if (lava) { for (let i = 0; i < 2; i++) R(g, '#3a1408', ri(v, i, 13, 120), ri(v, i + 3, 13, 121), 3, 2); if (((f + v) & 3) === 1) R(g, '#fff0a0', ri(v, 9, 14, 122), ri(v, 8, 14, 123), 1, 1); }
    R(g, c[2], 0, S - 1, S, 1);
  },
  cobble(g, c, f, v) {
    R(g, c[2], 0, 0, S, S);
    const rows = [[0, 2, 5], [6, 5, 6], [11, 1, 5]];
    for (const [y, off, h] of rows) for (let x = -off; x < S; x += 8) { const w = 7, sh = rnd(v, x + y, 3) * 0.12; const base = mix(c[0], '#ffffff', sh); R(g, base, Math.max(0, x), y, w, h - 1); R(g, c[1], Math.max(0, x), y, w, 1); R(g, c[1], Math.max(0, x), y, 1, h - 1); R(g, dark(c[0], 0.15), Math.max(0, x) + w - 1, y + 1, 1, h - 2); }
    if (rnd(v, 12, 4) < 0.3) R(g, '#5a8a4a', ri(v, 1, 14, 130), ri(v, 2, 14, 131), 2, 1);                             // muschio fra le pietre
  },
  tiles(g, c, f, v) {
    R(g, c[0], 0, 0, S, S); R(g, c[2], 0, 0, S, 1); R(g, c[2], 0, 8, S, 1); R(g, c[2], 0, 0, 1, 8); R(g, c[2], 8, 8, 1, 8); R(g, c[1], 1, 1, 6, 1); R(g, c[1], 9, 9, 6, 1); R(g, c[1], 1, 1, 1, 6); R(g, c[1], 9, 9, 1, 6);
    R(g, dark(c[0], 0.12), 7, 2, 1, 5); R(g, dark(c[0], 0.12), 15, 10, 1, 5); patches(g, v, 2, lite(c[0], 0.08), 4); if (rnd(v, 3, 6) < 0.3) { R(g, c[2], 3 + ri(v, 4, 4, 140), 3, 3, 1); R(g, c[2], 5, 4, 1, 2); }   // lastre con scheggiature
  },
  planks(g, c, f, v) {
    R(g, c[0], 0, 0, S, S);
    for (let y = 0; y < S; y += 4) { R(g, c[2], 0, y + 3, S, 1); if ((y / 4 + v) % 2) R(g, lite(c[0], 0.07), 0, y, S, 3); R(g, c[1], 0, y, S, 1); const x = (y * 3 + v * 5) % 12; R(g, c[2], x, y + 1, 4, 1); R(g, c[2], x + 7 > 15 ? 0 : x + 7, y + 2, 1, 1); }
    for (const [x, y] of [[1, 1], [14, 5], [1, 9], [14, 13]]) R(g, dark(c[0], 0.45), x, y, 1, 1);                         // chiodi
    R(g, c[2], 8 + (v & 3), 0, 1, 3); R(g, c[2], 3 + ((v >> 1) & 3), 8, 1, 3);
  },
  brick(g, c, f, v0, def) {
    const E = (v0 & 256) !== 0, M = E ? v0 & 15 : 0, v = E ? (v0 >> 4) & 7 : v0, pal = E ? (v0 >> 9) & 63 : 0; if (pal && def && def.palwall && WALL_PALS[pal]) c = WALL_PALS[pal];   // palette della città   // maschera di bordo: 1 tetto sopra, 2 terreno libero sotto, 4 spigolo destro, 8 spigolo sinistro
    R(g, c[0], 0, 0, S, S);
    for (let y = 0; y < S; y += 4) {
      R(g, c[2], 0, y, S, 1); const off = ((y / 4) % 2) * 4;
      for (let x = off; x < S + 8; x += 8) { R(g, c[2], x, y, 1, 4); const t = rnd(v, x + y * 3, 7); if (t < 0.28) R(g, lite(c[0], 0.1), x + 1, y + 1, 6, 2); else if (t > 0.78) R(g, dark(c[0], 0.1), x + 1, y + 1, 6, 2); R(g, c[1], x + 1, y + 1, 4, 1); }
    }
    R(g, c[1], 0, 0, S, 1); R(g, dark(c[0], 0.2), 0, S - 1, S, 1);
    { const wm = E ? (v0 >> 21) & 7 : 0, base = c[0];
      if (wm === 1) { R(g, lite(base, 0.28), 0, 0, S, S); const bm = '#4a2c1a'; R(g, bm, 0, 0, S, 2); R(g, bm, 0, 7, S, 2); R(g, bm, 0, 14, S, 2); R(g, bm, 0, 0, 2, S); R(g, bm, 7, 0, 2, S); R(g, bm, 14, 0, 2, S); for (let i = 0; i < 7; i++) { R(g, bm, 2 + i, 2 + i, 1, 1); R(g, bm, 9 + i, 2 + i, 1, 1); } R(g, lite(bm, 0.25), 0, 0, S, 1); }
      else if (wm === 2) { R(g, dark(base, 0.12), 0, 0, S, S); const o = (v & 1) * 3; for (let y = 0; y < S; y += 5) { R(g, dark(base, 0.4), 0, y + 4, S, 1); for (let x = (y / 5 % 2) * 4 - o; x < S; x += 8) { R(g, dark(base, 0.4), Math.max(0, x), y, 1, 5); R(g, lite(base, 0.2), Math.max(0, x) + 1, y, 6, 1); } } }
      else if (wm === 3) { R(g, base, 0, 0, S, S); for (let x = 0; x < S; x += 4) { R(g, dark(base, 0.35), x, 0, 1, S); R(g, lite(base, 0.15), x + 1, 0, 1, S); if (rnd(v, x, 31) < 0.4) R(g, dark(base, 0.2), x + 2, 3 + ((x * 5) % 9), 1, 2); } }
      else if (wm === 4) { R(g, lite(base, 0.1), 0, 0, S, S); for (let i = 0; i < 6; i++) R(g, rnd(v, i, 33) < 0.5 ? lite(base, 0.2) : dark(base, 0.12), ri(v, i, 14, 34), ri(v, i, 12, 35), 2, 1); R(g, dark(base, 0.25), 0, 13, S, 3); R(g, '#2a1a10', 3, 0, 1, 2); R(g, '#2a1a10', 12, 0, 1, 2); } }
    if (rnd(v, 5, 5) < 0.25) { R(g, '#5a8a4a', ri(v, 1, 14, 150), ri(v, 2, 8, 151) + 6, 2, 1); R(g, '#7aaa5a', ri(v, 1, 14, 150) + 1, ri(v, 2, 8, 151) + 5, 1, 1); }   // muschio
    if (M & 1) { R(g, 'rgba(10,4,24,.46)', 0, 0, S, 2); R(g, 'rgba(10,4,24,.28)', 0, 2, S, 2); R(g, 'rgba(10,4,24,.13)', 0, 4, S, 2); }           // ombra della gronda del tetto sulla parete
    if (M & 2) { const fd = dark(c[0], 0.28); R(g, fd, 0, 12, S, 4); R(g, lite(fd, 0.22), 0, 12, S, 1); for (let x = 0; x < S; x += 5) R(g, dark(fd, 0.3), x + (v & 3), 13, 1, 3); R(g, '#14081a', 0, 15, S, 1); }   // zoccolo di pietra
    if (M & 4) { R(g, 'rgba(10,4,24,.3)', 14, 0, 2, 16); R(g, 'rgba(10,4,24,.4)', 15, 0, 1, 16); }                                                  // spigolo in ombra (lato destro)
    if (M & 8) { R(g, 'rgba(255,255,255,.16)', 0, 0, 2, 16); }                                                                                      // spigolo in luce (lato sinistro)
  },
  roof(g, c, f, v0, def) {
    const E = (v0 & 256) !== 0, M = E ? v0 & 15 : 15, v = E ? (v0 >> 4) & 7 : v0, pal = E ? (v0 >> 9) & 63 : 0; if (pal && def && def.palroof && ROOF_PALS[pal]) c = ROOF_PALS[pal];   // maschera: 1 tetto a nord, 2 a sud, 4 a est, 8 a ovest (senza maschera: tetto interno)
    R(g, c[0], 0, 0, S, S);
    for (let y = 0; y < S; y += 4) { const off = ((y / 4) % 2) * 2; for (let x = off - 4; x < S; x += 4) { const t = rnd(v, x * 3 + y, 8); R(g, t < 0.2 ? lite(c[0], 0.08) : c[0], Math.max(0, x), y, 4, 3); R(g, c[1], Math.max(0, x) + 1, y, 3, 1); R(g, c[2], Math.max(0, x), y + 3, 4, 1); R(g, c[2], Math.max(0, x) + 3, y + 1, 1, 2); } }
    { const rs = E ? (v0 >> 18) & 7 : 0;
      if (rs === 1) { R(g, dark(c[0], 0.05), 0, 0, S, S); R(g, c[1], 0, 0, S, 2); R(g, c[2], 0, 2, S, 1); R(g, c[1], 0, S - 3, S, 2); R(g, c[2], 0, S - 1, S, 1); R(g, c[1], 0, 0, 2, S); R(g, c[1], S - 2, 0, 2, S); for (let x = 3; x < 13; x += 3) R(g, dark(c[0], 0.18), x, 4, 1, 8); if (rnd(v, 3, 36) < 0.5) { R(g, '#2a2a30', 5, 5, 6, 5); R(g, '#5a5a66', 5, 5, 6, 1); } }
      else if (rs === 2) { R(g, c[0], 0, 0, S, S); for (let x = 0; x < S; x += 4) { R(g, c[1], x, 0, 2, S); R(g, c[2], x + 2, 0, 1, S); R(g, lite(c[1], 0.3), x, 0, 1, S); } for (let y = 3; y < S; y += 4) R(g, dark(c[0], 0.3), 0, y, S, 1); R(g, lite(c[1], 0.5), 0, 0, S, 1); }
      else if (rs === 3) { const st = '#c8a85a'; R(g, st, 0, 0, S, S); for (let x = 0; x < S; x += 2) { const h = 6 + ((x * 7 + v * 3) % 8); R(g, rnd(v, x, 37) < 0.5 ? lite(st, 0.18) : dark(st, 0.2), x, 0, 1, h); R(g, dark(st, 0.35), x + 1, h - 1, 1, 2); } for (let y = 4; y < S; y += 5) R(g, dark(st, 0.25), 0, y, S, 1); } }
    R(g, lite(c[1], 0.25), 0, 0, S, 1);
    if (!(M & 1)) { R(g, '#14081a', 0, 0, S, 1); R(g, lite(c[1], 0.45), 0, 1, S, 1); R(g, lite(c[1], 0.2), 0, 2, S, 1); }                       // colmo: bordo scuro e cresta in luce
    if (!(M & 2)) { R(g, lite(c[1], 0.2), 0, 11, S, 1); R(g, dark(c[0], 0.3), 0, 12, S, 3); R(g, dark(c[0], 0.55), 0, 15, S, 1); for (let x = 1; x < S; x += 4) R(g, dark(c[0], 0.45), x, 13, 1, 2); }   // gronda: spessore del tetto con ombra
    if (!(M & 4)) { R(g, dark(c[0], 0.32), 13, 0, 3, 16); R(g, '#14081a', 15, 0, 1, 16); }                                                          // piano laterale in ombra
    if (!(M & 8)) { R(g, '#14081a', 0, 0, 1, 16); R(g, lite(c[1], 0.3), 1, 0, 1, 16); }                                                             // lato in luce
  },
  rock(g, c, f, v) {
    R(g, 'rgba(0,0,0,.25)', 2, 13, 12, 2); R(g, c[2], 2, 5, 12, 8); R(g, c[0], 2, 3, 12, 9); R(g, c[0], 3, 2, 9, 2); R(g, c[1], 4, 3, 7, 2); R(g, c[1], 3, 5, 3, 3); R(g, lite(c[1], 0.3), 5, 3, 3, 1);
    R(g, c[2], 9, 8, 5, 4); R(g, dark(c[2], 0.3), 7, 6, 1, 3); R(g, dark(c[2], 0.3), 8, 9, 3, 1);
    if (v & 1) { R(g, '#5a8a4a', 3, 2, 3, 1); R(g, '#7aaa5a', 4, 1, 1, 1); }
  },
  fence(g, c, f, v) {
    R(g, 'rgba(0,0,0,.2)', 0, 14, S, 2); R(g, c[0], 0, 6, S, 2); R(g, c[1], 0, 6, S, 1); R(g, c[2], 0, 8, S, 1); R(g, c[0], 0, 10, S, 2); R(g, c[1], 0, 10, S, 1); R(g, c[2], 0, 12, S, 1);
    for (let x = 1; x < S; x += 5) { R(g, c[0], x, 3, 3, 12); R(g, c[1], x, 3, 1, 12); R(g, c[2], x + 2, 3, 1, 12); R(g, c[1], x + 1, 2, 1, 1); R(g, c[2], x, 14, 3, 1); }
  },
  door(g, c, f, v) {
    R(g, c[2], 2, 1, 12, 15); R(g, c[0], 3, 2, 10, 14); R(g, c[0], 4, 1, 8, 1);
    for (let x = 3; x < 13; x += 3) { R(g, c[1], x, 3, 1, 13); R(g, c[2], x + 2, 3, 1, 13); }
    R(g, '#3a3a44', 3, 5, 10, 1); R(g, '#3a3a44', 3, 11, 10, 1); R(g, '#6a6a76', 3, 5, 10, 1);                             // fasce di ferro
    R(g, '#e8c060', 10, 9, 2, 2); R(g, '#fff0a0', 10, 9, 1, 1); R(g, '#8a6a34', 2, 15, 12, 1);                              // maniglia e soglia
    R(g, 'rgba(0,0,0,.38)', 3, 2, 10, 2); R(g, 'rgba(0,0,0,.28)', 3, 4, 1, 12); R(g, '#14081a', 2, 0, 12, 1); R(g, lite(c[1], 0.3), 1, 15, 14, 1); R(g, '#6a6a76', 1, 16 - 1, 14, 1);   // vano: architrave, ombra interna, gradino
  },
  tree(g, c, f, v) {
    R(g, 'rgba(0,0,0,.25)', 3, 13, 10, 2); R(g, c[2], 7, 9, 3, 6); R(g, dark(c[2], 0.3), 9, 9, 1, 6);
    R(g, c[0], 2, 3, 12, 8); R(g, c[0], 3, 1, 10, 3); R(g, c[1], 4, 1, 7, 6); R(g, lite(c[1], 0.25), 5, 2, 3, 2); R(g, c[1], 3, 5, 4, 3); R(g, dark(c[0], 0.25), 9, 7, 5, 3);
    for (let i = 0; i < 4; i++) R(g, lite(c[1], 0.15), 3 + ri(v, i, 9, 160), 2 + ri(v, i, 7, 161), 1, 1);
  },
  pine(g, c, f, v) {
    R(g, c[2], 7, 12, 2, 3); R(g, c[0], 6, 2, 4, 3); R(g, c[0], 4, 5, 8, 3); R(g, c[0], 2, 8, 12, 4); R(g, c[1], 6, 2, 2, 2); R(g, c[1], 5, 5, 3, 2); R(g, c[1], 3, 8, 4, 2); R(g, dark(c[0], 0.3), 9, 6, 3, 1); R(g, dark(c[0], 0.3), 9, 10, 4, 1); R(g, '#f0f6ff', 5, 4, 2, 1); R(g, '#f0f6ff', 7, 7, 2, 1);
  },
  bonfire(g, c, f) {   // falò: tronchi incrociati e tre lingue di fuoco che danzano (4 frame), braci e scintille
    R(g, 'rgba(0,0,0,.28)', 2, 13, 12, 2); R(g, '#3a2418', 2, 11, 12, 3); R(g, '#5a3a22', 3, 11, 10, 1); R(g, '#3a2418', 4, 9, 8, 2);
    const h1 = 8 + (f % 3), h2 = 6 + ((f + 1) % 3), h3 = 5 + ((f + 2) % 3);
    for (const [x, h, w] of [[3, h2, 3], [11, h3, 3], [6, h1, 4]]) { R(g, '#d8340e', x, 11 - h, w, h); R(g, '#ff8a1e', x + 1, 12 - h, w - 1, h - 1); R(g, '#ffe060', x + 1, 13 - h, 1, Math.max(1, h - 4)); }
    R(g, '#fff0a0', 7 + (f & 1), 3 - (f & 1), 1, 1); R(g, '#ff9a30', 4 + ((f + 1) & 1) * 7, 2 + (f & 2), 1, 1);
  },
  torch(g, c, f) {
    R(g, '#3a2418', 7, 8, 2, 8); R(g, '#6a4a2a', 7, 8, 1, 8); R(g, '#5a5a66', 6, 7, 4, 2);
    const h = 5 + (f % 3); R(g, '#d8340e', 6, 7 - h, 4, h); R(g, '#ff8a1e', 7, 8 - h, 2, h - 1); R(g, '#ffe060', 7, 9 - h, 1, Math.max(1, h - 3)); R(g, '#ff9a30', 5 + (f & 1) * 5, 2 + (f & 1), 1, 1);
  },
  lantern(g, c, f) {
    R(g, '#3a2a1c', 7, 9, 2, 7); R(g, '#241a10', 5, 2, 6, 1); R(g, '#241a10', 6, 1, 4, 1); R(g, '#6a3a1a', 5, 3, 6, 6); R(g, c[1], 6, 4, 4, 4); R(g, '#fff0b0', 7, 5, 2, 2 + (f & 1)); R(g, '#241a10', 5, 9, 6, 1); R(g, c[2], 5, 6, 1, 1); R(g, c[2], 10, 6, 1, 1);
  },
  thicket(g, c, f, v) {   // siepe/fitto cespuglio: masse di foglie a tre toni, bacche e fiorellini
    R(g, 'rgba(0,0,0,.25)', 1, 13, 14, 2);
    for (const [x, y, w, h] of [[1, 5, 8, 8], [7, 4, 8, 9], [3, 2, 9, 7], [0, 8, 6, 5], [10, 8, 6, 5]]) { R(g, c[2], x, y + 1, w, h); R(g, c[0], x, y, w, h - 1); R(g, c[1], x + 1, y, Math.max(2, w - 4), 2); }
    for (let i = 0; i < 6; i++) R(g, lite(c[1], 0.25), 2 + ri(v, i, 12, 170), 3 + ri(v, i, 8, 171), 2, 1);
    if (rnd(v, 3, 3) < 0.5) for (let i = 0; i < 3; i++) R(g, ['#e8505a', '#ffe060', '#ff9ac0'][(v + i) % 3], 3 + ri(v, i, 10, 172), 5 + ri(v, i, 6, 173), 1, 1);
  },
  logwall(g, c, f, v) {   // tronchi caduti accatastati (barriera da spiaggia e da bosco): corteccia, anelli sul taglio, muschio
    R(g, 'rgba(0,0,0,.28)', 0, 14, 16, 2);
    for (const [y, off] of [[2, 0], [8, 2]]) { R(g, c[2], 0, y + 1, 16, 6); R(g, c[0], 0, y, 16, 5); R(g, c[1], 0, y, 16, 1); for (let x = off; x < 16; x += 5) R(g, c[2], x, y + 1, 1, 4); R(g, lite(c[1], 0.2), 1, y + 3, 4, 1); }
    R(g, '#d8b070', 0, 3, 3, 4); R(g, '#a07040', 1, 4, 1, 2); R(g, '#d8b070', 13, 9, 3, 4); R(g, '#a07040', 14, 10, 1, 2);
    if (rnd(v, 2, 4) < 0.5) { R(g, '#5a8a4a', 5 + ri(v, 1, 6, 174), 2, 4, 1); R(g, '#7aaa5a', 6 + ri(v, 1, 6, 174), 1, 2, 1); }
  },
  dunewall(g, c, f, v) {   // cresta di duna: continua da tile a tile (cresta a y≈6 ai bordi), lato in luce a sinistra, lato in ombra a destra, increspature
    R(g, c[0], 0, 0, S, S);
    for (let x = 0; x < S; x++) { const crest = 5 + Math.round(Math.sin((x + 0.5) / 16 * 6.283) * 1.6); R(g, c[1], x, crest, 1, 2); R(g, '#fff4c8', x, crest, 1, 1); R(g, c[2], x, crest + 2 + (x > 8 ? 1 : 0), 1, 16 - crest - 2); if (x % 5 === 1) R(g, c[2], x, crest + 5, 4, 1); R(g, c[0], x, 0, 1, crest); }
    R(g, 'rgba(255,255,255,.18)', 0, 7, S, 1); patches(g, v, 2, c[2], 14); R(g, 'rgba(60,40,10,.25)', 0, 13, S, 3);
  },
  driftwall(g, c, f, v) {   // cumulo di neve: massa soffice con ombra azzurra sotto e scintille
    R(g, c[0], 0, 0, S, S);
    for (let x = 0; x < S; x++) { const crest = 4 + Math.round(Math.sin((x + 0.5) / 16 * 6.283) * 1.4); R(g, c[0], x, 0, 1, crest); R(g, c[1], x, crest, 1, 2); R(g, c[2], x, crest + 3 + (x > 8 ? 1 : 0), 1, 16 - crest - 3); }
    for (let i = 0; i < 3; i++) R(g, '#ffffff', ri(v, i, 14, 176), ri(v, i, 12, 177) + 2, 1, 1);
    R(g, 'rgba(120,150,200,.3)', 0, 12, S, 4);
  },
  searock(g, c, f, v) {
    const fo = 0.5 + 0.5 * Math.sin(f * 1.6 + v);   // spuma che pulsa
    R(g, 'rgba(255,255,255,' + (0.35 + 0.25 * fo) + ')', 1, 12, 14, 3); R(g, 'rgba(255,255,255,.55)', 2, 11, 12, 1); R(g, 'rgba(10,40,90,.35)', 2, 14, 12, 2);
    const w = 8 + (v & 3);   // corpo a gradoni, contorno scuro come nelle scogliere
    R(g, dark(c[2], 0.6), 8 - (w >> 1) - 1, 5, w + 2, 8); R(g, c[0], 8 - (w >> 1), 6, w, 7); R(g, dark(c[0], 0.2), 8 - (w >> 1), 10, w, 3); R(g, dark(c[2], 0.6), 6 - (v & 1), 3, 6 + (v & 1), 3); R(g, c[1], 7 - (v & 1), 4, 4 + (v & 1), 2);
    R(g, lite(c[1], 0.3), 8 - (w >> 1), 6, w, 1); for (let x = 8 - (w >> 1); x < 8 + (w >> 1); x += 3) R(g, dark(c[0], 0.35), x, 7, 1, 5);
    R(g, c[2], 8 + (w >> 1) - 2, 6, 2, 7);
  },
  cliff(g, c0, f, v0) {
    // Stile Pokémon: parete a squame sovrapposte con contorno scuro (ogni squama ha luce in alto e ombra sotto), orlo scuro sul bordo dell'altopiano, fianchi a corda diagonale
    const E = (v0 & 256) !== 0, M = E ? v0 & 15 : 1, vv = E ? (v0 >> 4) & 7 : 0, pal = E ? (v0 >> 9) & 15 : 0, P = CLIFF_PAL[pal % CLIFF_PAL.length], c = [P[0], P[1], P[2]];   // M: 1 piano alto a nord (faccia), 2 a sud (dorso), 4 a est, 8 a ovest (lati)
    const rim = dark(c[2], 0.72), fl = E ? (v0 >> 15) & 3 : 0, lowerRow = (fl & 1) !== 0, contDown = (fl & 2) !== 0;
    const scales = (y0, y1, off0) => {   // file di squame sfalsate: curva di fondo con contorno
      for (let row = y0; row < y1; row += 8) {
        const off = ((row - y0) / 8 % 2) * 4 + off0;
        for (let x = 0; x < S; x++) {
          const lx = (x + off) % 8, yb = row + 3 + Math.round(2.6 * Math.sin(Math.PI * (lx + 0.5) / 8));
          for (let y = row; y < Math.min(S, row + 8); y++) {
            let col;
            if (y < yb - 1) col = y <= row + 1 ? lite(c[1], 0.1) : c[0];
            else if (y === yb - 1) col = lite(c[0], 0.08);
            else if (y === yb) col = rim;
            else col = y > yb + 2 ? dark(c[2], 0.15) : c[2];
            if (lx === 0 && y < yb) col = dark(c[0], 0.25);   // fianco della squama
            R(g, col, x, y, 1, 1);
          }
        }
      }
    };
    if (M & 1 && lowerRow) {   // seconda riga della parete: squame e base in ombra con pietrisco
      scales(0, 16, vv & 3); R(g, 'rgba(20,6,12,.2)', 0, 8, S, 3); R(g, 'rgba(20,6,12,.38)', 0, 12, S, 4); patches(g, vv, 3, c[2], 15);
    } else if (M & 1) {   // FACCIA: orlo alto, poi squame
      R(g, c[0], 0, 0, S, S); scales(2, 16, vv & 3);
      R(g, rim, 0, 0, S, 1); R(g, lite(c[1], 0.45), 0, 1, S, 1); R(g, rim, 0, 2, S, 1);
      for (let x = 1; x < S; x += 2 + (vv & 1)) R(g, lite(c[1], 0.25), x, 1, 1, 1);
      if (!contDown) { R(g, 'rgba(20,6,12,.2)', 0, 10, S, 3); R(g, 'rgba(20,6,12,.38)', 0, 13, S, 3); patches(g, vv, 2, c[2], 15); }
    } else if (M & 12) {   // FIANCO: corda diagonale con orlo scuro verso l'altopiano
      const left = (M & 8) !== 0, x0 = left ? 0 : 6, x1 = left ? 10 : 16;
      for (let y = 0; y < S; y++) for (let x = x0; x < x1; x++) {
        const d = (x + (left ? y : -y) + 32) % 6;
        R(g, d < 2 ? lite(c[1], 0.1) : d < 4 ? c[0] : c[2], x, y, 1, 1);
        if (d === 3) R(g, rim, x, y, 1, 1);
      }
      R(g, rim, left ? 10 : 5, 0, 1, S); R(g, lite(c[1], 0.4), left ? 9 : 6, 0, 1, S);
      R(g, rim, left ? 0 : 15, 0, 1, S); R(g, 'rgba(20,6,12,.3)', 0, 12, S, 4);
    } else {   // DORSO: cresta a squame con orlo
      scales(4, 16, vv & 3); R(g, rim, 0, 3, S, 1); R(g, lite(c[1], 0.4), 0, 4, S, 1); R(g, 'rgba(20,6,12,.3)', 0, 12, S, 4);
      for (let x = 0; x < S; x++) { const h2 = (rnd(vv, x, 6) * 3) | 0; R(g, c[1], x, 2 + h2, 1, 1); R(g, rim, x, 1 + h2, 1, 1); }
    }
  },
  // ---- finestre: otto forme (rettangolare, ad arco, tonda, doppia, con persiane, a rombi, feritoia, larga) ----
  winlit(g, c, f, v0, def) { windowTile(g, c, f, v0, def, 'lit'); },
  windark(g, c, f, v0, def) { windowTile(g, c, f, v0, def, 'dark'); },
  winshut(g, c, f, v0, def) { windowTile(g, c, f, v0, def, 'shut'); },
  // ---- arredi con volume: piano superiore chiaro, fronte in ombra, gambe, ombra a terra ----
  table(g, c, f, v) {
    R(g, 'rgba(12,5,28,.28)', 1, 13, 15, 3); R(g, dark(c[0], 0.45), 2, 9, 2, 6); R(g, dark(c[0], 0.45), 12, 9, 2, 6); R(g, c[2], 1, 8, 14, 2);                       // gambe e traversa
    R(g, c[0], 0, 4, 16, 5); R(g, lite(c[1], 0.25), 0, 3, 16, 3); R(g, lite(c[1], 0.5), 1, 3, 14, 1); R(g, dark(c[0], 0.3), 0, 9, 16, 1);                          // piano e spessore
    const k = (v & 3); if (k === 0) { R(g, '#f4f0e8', 5, 4, 6, 1); R(g, '#c8283a', 6, 3, 2, 2); } else if (k === 1) { R(g, '#e8e0d0', 3, 3, 4, 2); R(g, '#8a5a2c', 10, 3, 3, 2); } else if (k === 2) { R(g, '#d8c8a0', 2, 3, 12, 2); R(g, '#c8283a', 2, 3, 12, 1); } else { R(g, '#6ac8f0', 6, 2, 2, 3); R(g, '#e8c060', 10, 3, 3, 2); }
  },
  shelf(g, c, f, v) {
    R(g, c[2], 0, 0, S, S); R(g, c[0], 1, 1, 14, 14); R(g, lite(c[0], 0.2), 0, 0, S, 2); R(g, dark(c[0], 0.4), 0, 14, S, 2); R(g, lite(c[1], 0.3), 0, 0, 1, S); R(g, 'rgba(0,0,0,.3)', 15, 0, 1, S);   // cornice con luce a sinistra
    for (const y0 of [2, 8]) { R(g, 'rgba(0,0,0,.32)', 2, y0 + 5, 12, 1); R(g, dark(c[0], 0.5), 2, y0 + 5, 12, 1); for (let i = 0; i < 6; i++) { const col = ['#c8283a', '#2a4a8a', '#2a7a4a', '#d8a830', '#6a3a9a', '#e8e0d0'][(v + i + y0) % 6], hh = 3 + ((v + i * 5) % 3); R(g, col, 2 + i * 2, y0 + 5 - hh, 2, hh); R(g, lite(col, 0.35), 2 + i * 2, y0 + 5 - hh, 1, hh); } }
    R(g, '#e8c870', 11, 3, 3, 2); R(g, '#ffffff', 11, 3, 1, 1);
  },
  bed(g, c, f, v) {
    R(g, 'rgba(12,5,28,.3)', 0, 14, 16, 2); R(g, dark(c[2], 0.2), 0, 1, 16, 14); R(g, c[2], 0, 0, 16, 4); R(g, lite(c[2], 0.3), 0, 0, 16, 1);                               // testiera
    R(g, c[0], 1, 4, 14, 10); R(g, lite(c[1], 0.35), 1, 4, 14, 2); R(g, '#fffdf4', 2, 4, 6, 3); R(g, '#d8d0c0', 2, 6, 6, 1);                                          // materasso e cuscino
    R(g, c[1], 1, 8, 14, 6); for (let x = 3; x < 14; x += 4) R(g, dark(c[1], 0.2), x, 8, 1, 6); R(g, dark(c[1], 0.3), 1, 13, 14, 1); R(g, lite(c[1], 0.3), 1, 8, 14, 1);   // coperta con pieghe
  },
  barrel(g, c) {
    R(g, 'rgba(12,5,28,.3)', 2, 13, 13, 3); R(g, c[0], 3, 3, 10, 11); R(g, lite(c[1], 0.4), 4, 3, 2, 11); R(g, c[1], 6, 3, 2, 11); R(g, dark(c[0], 0.3), 10, 3, 3, 11); R(g, dark(c[0], 0.5), 12, 3, 1, 11);   // fasce di luce e ombra come su un cilindro
    R(g, '#4a3a2a', 3, 5, 10, 1); R(g, '#4a3a2a', 3, 11, 10, 1); R(g, '#8a8a96', 3, 6, 10, 1); R(g, '#8a8a96', 3, 12, 10, 1); R(g, lite(c[1], 0.3), 4, 2, 8, 2); R(g, c[2], 5, 2, 6, 1);   // cerchi e coperchio
  },
  crate(g, c) {
    R(g, 'rgba(12,5,28,.3)', 1, 13, 15, 3); R(g, lite(c[1], 0.3), 1, 3, 13, 3); R(g, c[2], 14, 4, 1, 10); R(g, c[0], 1, 6, 13, 8); R(g, c[1], 1, 6, 13, 1); R(g, dark(c[0], 0.35), 1, 13, 13, 1);   // piano superiore chiaro, fronte in ombra
    R(g, c[2], 1, 9, 13, 1); R(g, c[2], 7, 6, 1, 8); R(g, '#8a8a96', 1, 6, 2, 2); R(g, '#8a8a96', 12, 6, 2, 2); R(g, '#8a8a96', 1, 12, 2, 2); R(g, '#8a8a96', 12, 12, 2, 2);
  },
};
// varianti d'arredo per civiltà: il codice stile sta nei bit 8-10 di v (0 = originale). Cambiano palette del legno e forma
const FURN_PALS = [null, ['#7a4a2a', '#a8703c', '#4a2a14'], ['#e8dcc0', '#fff4d8', '#a89870'], ['#3a5a3a', '#6a9a5a', '#1e3a22'], ['#8a2a2a', '#c85a3a', '#4a1414'], ['#5a5a6a', '#8a8a9a', '#2e2e3a'], ['#c8a05a', '#eed08a', '#7a5a22'], ['#2a3a6a', '#4a6aa8', '#141e3a']];
for (const k of ['table', 'shelf', 'bed', 'barrel', 'crate']) {
  const orig = SKINS[k];
  SKINS[k] = (g, c, f, v, def) => {
    const sty = (v >> 8) & 7, vv = v & 255; if (!sty) return orig(g, c, f, vv, def);
    orig(g, FURN_PALS[sty], f, vv, def);
    if (k === 'table' && (sty & 1)) { R(g, dark(FURN_PALS[sty][0], 0.3), 0, 4, 2, 5); R(g, dark(FURN_PALS[sty][0], 0.3), 14, 4, 2, 5); R(g, lite(FURN_PALS[sty][1], 0.3), 2, 3, 12, 1); }          // piano ovale
    if (k === 'table' && sty === 2) { R(g, 'rgba(12,5,28,.28)', 2, 11, 12, 4); R(g, FURN_PALS[2][0], 1, 6, 14, 3); R(g, lite(FURN_PALS[2][1], 0.2), 1, 5, 14, 1); }                       // tavolo basso (chabudai)
    if (k === 'shelf' && (sty & 2)) { R(g, FURN_PALS[sty][2], 7, 0, 2, S); }                                                          // montante centrale
    if (k === 'bed' && sty === 4) { R(g, '#c8283a', 1, 8, 14, 6); R(g, '#e8c060', 1, 8, 14, 1); }                                        // coperta rossa
    if (k === 'barrel' && sty === 6) { R(g, '#4a2a14', 4, 8, 8, 1); }
  };
}
function windowTile(g, c, f, v0, def, kind) {
  SKINS.brick(g, c, f, v0, def);
  const E = (v0 & 256) !== 0, ws = E ? (v0 >> 15) & 7 : 0, pal = E ? (v0 >> 9) & 63 : 0, wc = (pal && def && def.palwall && WALL_PALS[pal]) || c, frame = dark(wc[2], 0.45), glass = kind === 'lit' ? '#ffd878' : '#28344a', hi = kind === 'lit' ? '#fff4b8' : '#5a78a0';
  const pane = (x, y, w, h) => { R(g, frame, x - 1, y - 1, w + 2, h + 2); if (kind === 'shut') { R(g, '#6a4a28', x, y, w, h); R(g, '#8a6a3a', x, y, 1, h); R(g, '#3a2a14', x + (w >> 1), y, 1, h); for (let yy = y + 2; yy < y + h; yy += 2) R(g, '#4a3018', x, yy, w, 1); } else { R(g, glass, x, y, w, h); R(g, hi, x, y, Math.max(1, w >> 1), 2); } };
  if (ws === 0) { pane(4, 3, 8, 9); if (kind !== 'shut') { R(g, frame, 7, 3, 2, 9); R(g, frame, 4, 7, 8, 1); } }
  else if (ws === 1) { pane(5, 4, 6, 8); if (kind === 'shut') { R(g, frame, 5, 3, 6, 1); } else { R(g, frame, 6, 2, 4, 1); R(g, glass, 6, 3, 4, 1); R(g, frame, 7, 4, 2, 8); } }
  else if (ws === 2) { for (let y = 0; y < 9; y++) { const dy = y - 4, w = Math.round(Math.sqrt(Math.max(0, 20 - dy * dy))); R(g, frame, 8 - w - 1, 3 + y, w * 2 + 2, 1); R(g, kind === 'shut' ? '#6a4a28' : glass, 8 - w, 3 + y, w * 2, 1); } if (kind !== 'shut') { R(g, hi, 5, 4, 2, 2); R(g, frame, 8, 3, 1, 9); R(g, frame, 4, 7, 9, 1); } }
  else if (ws === 3) { pane(3, 3, 4, 9); pane(9, 3, 4, 9); }
  else if (ws === 4) { pane(5, 3, 6, 9); R(g, '#3a8a5a', 1, 3, 3, 9); R(g, '#5ac080', 1, 3, 1, 9); R(g, '#3a8a5a', 12, 3, 3, 9); R(g, '#5ac080', 14, 3, 1, 9); for (let y = 4; y < 12; y += 2) { R(g, '#2a6a44', 1, y, 3, 1); R(g, '#2a6a44', 12, y, 3, 1); } }
  else if (ws === 5) { pane(4, 3, 8, 9); if (kind !== 'shut') for (let i = 0; i < 4; i++) { R(g, frame, 4 + i * 2, 3 + i * 2, 1, 1); R(g, frame, 11 - i * 2, 3 + i * 2, 1, 1); R(g, frame, 4 + i * 2, 11 - i * 2, 1, 1); R(g, frame, 11 - i * 2, 11 - i * 2, 1, 1); } }
  else if (ws === 6) { pane(7, 2, 2, 11); }
  else { pane(2, 6, 12, 5); if (kind !== 'shut') { R(g, frame, 8, 6, 1, 5); R(g, frame, 5, 6, 1, 5); R(g, frame, 11, 6, 1, 5); } }
  R(g, lite(wc[1], 0.35), 2, 12, 12, 1); R(g, dark(wc[2], 0.3), 2, 13, 12, 1);   // davanzale
}
