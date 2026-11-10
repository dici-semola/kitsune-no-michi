// Protagonista: pixel art in stile dell'icona (maschera di kitsune bianca con segni rossi, orecchie a punta, occhi stretti con riflesso dorato),
// abiti da anime giapponese (spadaccino magico, kimono, miko, ronin errante, principe kitsune), luce dall'alto-sinistra, pieghe, galloni e piccole animazioni:
// sciarpa e code che ondeggiano, occhi che brillano, scintille magiche. Il contorno scuro lo aggiunge il chiamante (Sprites.drawOutlined).
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a, b, f) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
const dark = (c, f = 0.35) => mix(c, '#1a0a24', f), lite = (c, f = 0.35) => mix(c, '#ffffff', f);
const GOLD = '#f0c040', EYE = '#14081a';

export const OUTFITS = [
  { n: 'Spadaccino magico', skirt: 'hakama', sleeve: 'wide', trim: GOLD, extra: 'scarf' },
  { n: 'Kimono', skirt: 'straight', sleeve: 'long', trim: '#ffd8e8', extra: 'bow' },
  { n: 'Miko mistica', skirt: 'hakama', sleeve: 'wide', trim: '#c8283a', extra: 'ribbon' },
  { n: 'Ronin errante', skirt: 'hakama', sleeve: 'narrow', trim: '#8a7a6a', extra: 'cape' },
  { n: 'Principe kitsune', skirt: 'hakama', sleeve: 'wide', trim: GOLD, extra: 'tail' },
];
// maschere: [volto, ombra, segni, occhi, riflesso]
const MASKS = [
  ['#f6f0e6', '#d6cec0', '#c8283a', EYE, GOLD],
  ['#f6f0e6', '#d6cec0', '#c8283a', EYE, GOLD],
  ['#f6f0e6', '#d6cec0', GOLD, EYE, '#ffffff'],
  ['#2e2438', '#1a1226', '#a05aff', '#ff4060', '#ffd0d8'],
];

function tail(g, x, y, c, tip, t, k) {
  const w = Math.round(Math.sin(t * 2.4 + k) * 1.5);
  R(g, c, x, y, 4, 8); R(g, c, x + 1 + w, y - 3, 4, 5); R(g, c, x + 2 + w, y - 6, 3, 4); R(g, tip, x + 2 + w, y - 8, 3, 3); R(g, lite(c, 0.4), x, y, 1, 7);
}

function mask(g, x, by, L, dir, t) {
  const M = MASKS[L.mask % 4], [face, shade, mark, eye, glint] = M, blink = Math.floor(t * 0.9) % 7 === 0 && (t * 0.9) % 1 > 0.7;
  if (dir === 1) { // di spalle: orecchie e nuca
    R(g, face, x - 5, by - 34, 3, 4); R(g, face, x + 2, by - 34, 3, 4); R(g, mark, x - 5, by - 34, 2, 1); R(g, mark, x + 3, by - 34, 2, 1);
    return;
  }
  // orecchie a punta con interno colorato
  for (const s of [-1, 1]) {
    const ex = s < 0 ? x - 5 : x + 2;
    R(g, face, ex + (s < 0 ? 0 : 2), by - 35, 1, 1); R(g, face, ex + (s < 0 ? 0 : 1), by - 34, 2, 1); R(g, face, ex, by - 33, 3, 1); R(g, face, ex, by - 32, 3, 3);
    R(g, mark, ex + (s < 0 ? 1 : 1), by - 33, 1, 3);
  }
  R(g, face, x - 4, by - 29, 8, 7); R(g, shade, x + 2, by - 29, 2, 7); R(g, lite(face, 0.5), x - 4, by - 29, 3, 1);          // volto con luce a sinistra
  R(g, mark, x - 2, by - 29, 4, 1); R(g, mark, x - 1, by - 28, 2, 1); if (L.mask === 1) { R(g, mark, x - 3, by - 28, 1, 3); R(g, mark, x + 2, by - 28, 1, 3); }  // triangolo sulla fronte
  R(g, mark, x - 4, by - 25, 2, 1); R(g, mark, x + 2, by - 25, 2, 1); R(g, mark, x - 4, by - 24, 1, 1); R(g, mark, x + 3, by - 24, 1, 1);   // guance
  if (L.mask === 1) { R(g, mark, x - 4, by - 26, 1, 1); R(g, mark, x + 3, by - 26, 1, 1); }
  if (!blink) { R(g, eye, x - 3, by - 27, 1, 1); R(g, eye, x - 2, by - 26, 1, 1); R(g, eye, x + 2, by - 27, 1, 1); R(g, eye, x + 1, by - 26, 1, 1); R(g, glint, x - 2, by - 26, 1, 1); R(g, glint, x + 1, by - 26, 1, 1); }
  else { R(g, eye, x - 3, by - 26, 2, 1); R(g, eye, x + 1, by - 26, 2, 1); }
  R(g, eye, x - 1, by - 24, 2, 1);                                                                                           // naso
}

function figure(g, x, y, L, dir, fr, t) {
  const O = OUTFITS[L.outfit % OUTFITS.length], s = fr & 1, by = y - (s ? 1 : 0), sway = Math.sin(t * 3.1), sw = sway > 0.35 ? 1 : sway < -0.35 ? -1 : 0, back = dir === 1;
  const top = L.top, bot = L.bottom, sash = dark(bot, 0.35), trim = O.trim, skin = L.skin;
  // alle spalle: coda (principe), mantello (ronin), code della maschera "nove code"
  if (O.extra === 'tail' || L.mask === 2) { tail(g, x + 5, by - 14, '#f6f0e6', O.extra === 'tail' ? '#ff9a50' : GOLD, t, 0); if (L.mask === 2) tail(g, x - 9, by - 15, '#f6f0e6', GOLD, t, 2); }
  if (O.extra === 'cape') { R(g, dark(top, 0.3), x - 7, by - 21, 14, 17 + sw); R(g, dark(top, 0.5), x - 7, by - 6 + sw, 14, 2); R(g, '#8a7a6a', x - 7, by - 21, 14, 2); }
  // piedi (geta/zori) e gambe
  R(g, '#2a1a30', x - 4, y - 2 - (s ? 1 : 0), 3, 2); R(g, '#2a1a30', x + 1, y - 2 - (s ? 0 : 1), 3, 2); R(g, '#5a3a4a', x - 4, y - 2 - (s ? 1 : 0), 3, 1); R(g, '#5a3a4a', x + 1, y - 2 - (s ? 0 : 1), 3, 1);
  // gonna / hakama: pieghe scure e lembo che ondeggia
  for (let k = 0; k < 10; k++) {
    const half = O.skirt === 'hakama' ? 5 + Math.floor(k / 3) : 5 - (k > 7 ? 1 : 0), off = k > 5 ? sw : 0, yy = by - 12 + k, c = O.skirt === 'hakama' ? bot : mix(top, bot, k > 6 ? 0.85 : k > 3 ? 0.25 : 0);
    R(g, c, x - half + off, yy, half * 2, 1); R(g, dark(c, 0.3), x + half - 3 + off, yy, 3, 1); R(g, lite(c, 0.18), x - half + off, yy, 2, 1);
    if (O.skirt === 'hakama' && (k % 2 === 0)) { R(g, dark(c, 0.22), x - 2 + off, yy, 1, 1); R(g, dark(c, 0.22), x + 2 + off, yy, 1, 1); }
  }
  if (O.skirt === 'straight') { for (const [dx, dy] of [[-3, 5], [2, 7], [-1, 8]]) R(g, '#ffd8e8', x + dx, by - 12 + dy, 2, 1); }                  // fiori di ciliegio sul lembo
  R(g, trim, x - 6, by - 3, 12, 1);                                                                                         // gallone al lembo
  // busto e obi
  R(g, top, x - 5, by - 21, 10, 9); R(g, dark(top, 0.25), x + 3, by - 21, 2, 9); R(g, lite(top, 0.3), x - 5, by - 21, 2, 8);
  if (!back) { R(g, lite(top, 0.55), x - 2, by - 21, 4, 2); R(g, skin, x - 1, by - 21, 2, 2); R(g, dark(top, 0.3), x - 1, by - 19, 1, 6); R(g, trim, x - 1, by - 19, 1, 1); }  // colletto a V
  R(g, sash, x - 5, by - 14, 10, 3); R(g, lite(sash, 0.3), x - 5, by - 14, 10, 1); R(g, trim, x - 5, by - 12, 10, 1);
  if (!back) { R(g, GOLD, x - 1, by - 14, 2, 3); R(g, '#8a5a10', x, by - 13, 1, 1); }
  if (O.extra === 'bow' || back && O.extra === 'tail') { R(g, sash, x - 4, by - 16, 8, 4); R(g, lite(sash, 0.35), x - 4, by - 16, 8, 1); R(g, sash, x - 3, by - 11, 2, 5 + sw); R(g, sash, x + 1, by - 11, 2, 5 - sw); }   // fiocco dell'obi
  if (O.extra === 'ribbon') { R(g, '#ffffff', x - 8, by - 8, 1, 4 + sw); R(g, '#ffffff', x + 7, by - 8, 1, 4 - sw); R(g, GOLD, x - 8, by - 9, 1, 1); R(g, GOLD, x + 7, by - 9, 1, 1); }  // campanelle e shide
  // maniche: larghe, lunghe (furisode) o strette; braccia che oscillano
  const sl = O.sleeve === 'long' ? 13 : O.sleeve === 'wide' ? 9 : 6, sw0 = O.sleeve === 'narrow' ? 2 : 4, aL = s ? 1 : 0, aR = s ? 0 : 1;
  for (const [sx, a, sg] of [[x - 5 - sw0, aL, -1], [x + 5, aR, 1]]) {
    R(g, top, sx, by - 20 + a, sw0, sl); R(g, dark(top, sg < 0 ? 0.05 : 0.25), sx + (sg < 0 ? 0 : sw0 - 1), by - 20 + a, 1, sl); R(g, trim, sx, by - 20 + a + sl - 1, sw0, 1); R(g, lite(top, 0.35), sx, by - 20 + a, sw0, 1);
    if (O.sleeve === 'narrow') R(g, skin, sx, by - 20 + a + sl, sw0, 2); else R(g, skin, sx + (sg < 0 ? 1 : 0), by - 20 + a + sl, 2, 1);
  }
  // fodero della katana al fianco
  R(g, '#241426', x - 9, by - 15, 2, 9); R(g, '#c8283a', x - 9, by - 15, 2, 1); R(g, GOLD, x - 9, by - 13, 2, 1);
  // collo e testa
  R(g, skin, x - 4, by - 29, 8, 8);
  // capelli: calotta, ciuffi e lunghezza secondo lo stile
  const hr = L.hair, hl = lite(hr, 0.3), hd = dark(hr, 0.3);
  if (back) { R(g, hr, x - 5, by - 32, 10, 11); R(g, hd, x + 2, by - 32, 3, 11); R(g, hl, x - 4, by - 31, 3, 1); }
  else { R(g, hr, x - 5, by - 32, 10, 4); R(g, hl, x - 4, by - 32, 4, 1); R(g, hd, x + 2, by - 29, 3, 1); R(g, hr, x - 5, by - 29, 1, 6); R(g, hr, x + 4, by - 29, 1, 6); R(g, hr, x - 5, by - 28, 3, 2); R(g, hr, x + 2, by - 28, 3, 2); }
  if (L.style === 1) { const lh = 13 + sw; R(g, hr, x - 6, by - 29, 2, lh); R(g, hr, x + 4, by - 29, 2, lh - sw * 2); R(g, hd, x + 5, by - 29, 1, lh - sw * 2); R(g, hl, x - 6, by - 29, 1, lh); if (back) { R(g, hr, x - 5, by - 21, 10, 8 + sw); R(g, hd, x + 2, by - 21, 3, 8 + sw); } }
  if (L.style === 2) { R(g, hr, x + 4, by - 31, 3, 6); R(g, hr, x + 5 + sw, by - 25, 2, 7); R(g, hl, x + 4, by - 31, 1, 6); R(g, '#c8283a', x + 4, by - 26, 3, 1); }   // codino con nastro
  if (O.extra === 'bow' || L.gender === 1 && L.style !== 2) { R(g, hr, x - 3, by - 35, 6, 3); R(g, hl, x - 3, by - 35, 3, 1); R(g, GOLD, x + 2, by - 34, 1, 2); R(g, '#ff9ac0', x + 3, by - 35, 2, 2); }   // chignon con kanzashi e fiore
  if (O.extra === 'ribbon') { R(g, '#ffffff', x - 5, by - 31, 10, 1); R(g, '#c8283a', x + 4, by - 31, 2, 3); }
  mask(g, x, by, L, dir, t);
  // sciarpa magica che ondeggia (spadaccino) e scintille
  if (O.extra === 'scarf') { const w = Math.round(Math.sin(t * 4) * 1.5); R(g, '#c8283a', x - 5, by - 22, 10, 2); R(g, '#e8505a', x - 5, by - 22, 10, 1); R(g, '#c8283a', x + 4, by - 22, 2, 7 + w); R(g, '#a0182c', x + 5 + (w > 0 ? 1 : 0), by - 15 + w, 2, 3); }
  if (O.extra === 'scarf' || O.extra === 'tail') for (let i = 0; i < 3; i++) { const a = t * 2.2 + i * 2.1, px = x + Math.round(Math.cos(a) * 10), py = by - 16 + Math.round(Math.sin(a) * 6) - i * 2; R(g, i === 1 ? '#fff' : '#7affea', px, py, 1, 1); }
  if (O.extra === 'tail') { const b = Math.round(Math.sin(t * 3)); R(g, '#ff7a30', x - 11, by - 24 + b, 2, 3); R(g, '#ffd060', x - 11, by - 26 + b, 2, 2); R(g, '#fff0b0', x - 11, by - 27 + b, 1, 1); }   // fuoco fatuo
}

// vista di profilo (verso destra): corpo più stretto, muso della maschera in avanti
function side(g, x, y, L, fr, t) {
  const O = OUTFITS[L.outfit % OUTFITS.length], s = fr & 1, by = y - (s ? 1 : 0), sw = Math.round(Math.sin(t * 3.1)), top = L.top, bot = L.bottom, sash = dark(bot, 0.35), M = MASKS[L.mask % 4], trim = O.trim;
  if (O.extra === 'tail' || L.mask === 2) tail(g, x - 8, by - 13, '#f6f0e6', O.extra === 'tail' ? '#ff9a50' : GOLD, t, 1);
  if (O.extra === 'cape') { R(g, dark(top, 0.3), x - 8, by - 21, 6, 17 + sw); R(g, '#8a7a6a', x - 8, by - 21, 6, 2); }
  R(g, '#2a1a30', x - 3 + (s ? 2 : -1), y - 2, 4, 2); R(g, '#2a1a30', x - 3 + (s ? -1 : 2), y - 2 - (s ? 0 : 1), 4, 2);
  for (let k = 0; k < 10; k++) { const half = O.skirt === 'hakama' ? 4 + Math.floor(k / 4) : 4, yy = by - 12 + k, c = O.skirt === 'hakama' ? bot : mix(top, bot, k > 6 ? 0.85 : 0); R(g, c, x - half + (k > 5 ? sw : 0), yy, half * 2, 1); R(g, dark(c, 0.3), x + half - 3, yy, 3, 1); R(g, lite(c, 0.18), x - half, yy, 2, 1); }
  R(g, trim, x - 5, by - 3, 10, 1);
  R(g, top, x - 4, by - 21, 8, 9); R(g, dark(top, 0.25), x + 2, by - 21, 2, 9); R(g, lite(top, 0.3), x - 4, by - 21, 2, 8);
  R(g, sash, x - 4, by - 14, 8, 3); R(g, trim, x - 4, by - 12, 8, 1); R(g, GOLD, x + 2, by - 14, 2, 3);
  if (O.extra === 'bow') { R(g, sash, x - 7, by - 16, 4, 6); R(g, lite(sash, 0.35), x - 7, by - 16, 4, 1); }
  if (O.extra === 'ribbon') { R(g, '#ffffff', x - 7, by - 9, 1, 4 + sw); R(g, GOLD, x - 7, by - 10, 1, 1); }
  const sl = O.sleeve === 'long' ? 13 : O.sleeve === 'wide' ? 9 : 6, a = s ? 2 : -1;
  R(g, top, x - 2 + a, by - 20, 4, sl); R(g, dark(top, 0.25), x + 1 + a, by - 20, 1, sl); R(g, trim, x - 2 + a, by - 20 + sl - 1, 4, 1); R(g, L.skin, x - 1 + a, by - 20 + sl, 2, 1);
  R(g, '#241426', x - 6, by - 13, 2, 9); R(g, GOLD, x - 6, by - 11, 2, 1);
  R(g, L.skin, x - 3, by - 29, 7, 8);
  const hr = L.hair, hl = lite(hr, 0.3), hd = dark(hr, 0.3);
  R(g, hr, x - 4, by - 32, 8, 4); R(g, hl, x - 3, by - 32, 4, 1); R(g, hr, x - 5, by - 29, 3, 7); R(g, hd, x - 5, by - 27, 2, 5);
  if (L.style === 1) { const lh = 13 + sw; R(g, hr, x - 6, by - 29, 3, lh); R(g, hd, x - 6, by - 27, 1, lh - 2); }
  if (L.style === 2) { R(g, hr, x - 7, by - 31, 3, 6); R(g, hr, x - 8 + sw, by - 25, 2, 7); R(g, '#c8283a', x - 7, by - 26, 3, 1); }
  if (O.extra === 'bow' || L.gender === 1 && L.style !== 2) { R(g, hr, x - 3, by - 35, 5, 3); R(g, GOLD, x + 1, by - 34, 1, 2); R(g, '#ff9ac0', x + 2, by - 35, 2, 2); }
  if (O.extra === 'ribbon') { R(g, '#ffffff', x - 4, by - 31, 8, 1); R(g, '#c8283a', x - 5, by - 31, 2, 3); }
  // maschera di profilo: muso allungato, orecchio, occhio con riflesso
  const [face, shade, mark, eye, glint] = M; R(g, face, x - 3, by - 34, 3, 5); R(g, face, x - 3, by - 35, 1, 1); R(g, mark, x - 2, by - 33, 1, 3);
  R(g, face, x - 3, by - 29, 8, 6); R(g, shade, x - 3, by - 24, 8, 1); R(g, lite(face, 0.5), x - 2, by - 29, 3, 1); R(g, face, x + 5, by - 26, 2, 3); R(g, eye, x + 6, by - 26, 1, 1);
  R(g, mark, x - 1, by - 29, 3, 1); R(g, mark, x - 1, by - 25, 3, 1); R(g, eye, x + 2, by - 27, 2, 1); R(g, glint, x + 3, by - 27, 1, 1);
  if (O.extra === 'scarf') { const w = Math.round(Math.sin(t * 4) * 1.5); R(g, '#c8283a', x - 5, by - 22, 9, 2); R(g, '#c8283a', x - 8, by - 21, 3, 6 + w); R(g, '#a0182c', x - 8, by - 15 + w, 3, 3); }
  if (O.extra === 'scarf' || O.extra === 'tail') for (let i = 0; i < 3; i++) { const q = t * 2.2 + i * 2.1, px = x + Math.round(Math.cos(q) * 9), py = by - 16 + Math.round(Math.sin(q) * 6) - i * 2; R(g, i === 1 ? '#fff' : '#7affea', px, py, 1, 1); }
  if (O.extra === 'tail') { const b = Math.round(Math.sin(t * 3)); R(g, '#ff7a30', x - 3, by - 38 + b, 2, 3); R(g, '#ffd060', x - 3, by - 40 + b, 2, 2); }
}

// L: { hair, skin, bottom, top, outfit, style, gender, mask }; dir: 0 giù, 1 su, 2 sinistra, 3 destra
export function drawPlayerFigure(g, x, y, L, dir, fr, t) {
  if (dir === 2) { g.save(); g.translate(x, 0); g.scale(-1, 1); side(g, 0, y, L, fr, t); g.restore(); }
  else if (dir === 3) side(g, x, y, L, fr, t);
  else figure(g, x, y, L, dir, fr, t);
}
