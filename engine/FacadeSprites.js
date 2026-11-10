// Dettagli di facciata: noren (tende di stoffa), tende a righe, lanterne di carta, insegne per mestiere, fioriere, edera, bandiere, camini col fumo.
// Origine (x, y) = piedi del tile della porta: il tile occupa x-8..x+8, y-14..y+2. Tutto animato leggermente (vento, fiamma, fumo).
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const OUT = '#14081a', COLS = [['#2a3a8a', '#4a62c8'], ['#a02a2a', '#d84a3a'], ['#2a7a4a', '#4aa86a'], ['#b88a20', '#e8c040'], ['#6a3a9a', '#9a6ad0'], ['#c05a8a', '#e88ab0']];

const noren = (i) => (g, x, y, t) => {
  const c = COLS[i % COLS.length], w = Math.round(Math.sin(t * 2 + i) * 1);
  R(g, '#3a2418', x - 8, y - 17, 16, 2); R(g, '#6a4a2a', x - 8, y - 17, 16, 1);                       // asta
  for (const px of [-7, -2, 3]) { R(g, OUT, x + px - 1, y - 15, 6, 11 + w); R(g, c[0], x + px, y - 15, 5, 10 + w); R(g, c[1], x + px, y - 15, 1, 10 + w); R(g, '#f4f0e8', x + px + 1 + (px === -2 ? 1 : 0), y - 12, 2, 2); }
};
const awning = (i) => (g, x, y, t) => {
  const c = COLS[i % COLS.length][1], w = Math.round(Math.sin(t * 1.6) * 0.6);
  R(g, OUT, x - 13, y - 21, 26, 9); for (let k = 0; k < 13; k++) { R(g, k & 1 ? '#f4f0e8' : c, x - 12 + k * 2, y - 20, 2, 6); R(g, k & 1 ? '#d8d0c0' : COLS[i % COLS.length][0], x - 12 + k * 2, y - 15 + (k & 1 ? w : 0), 2, 2); }
  R(g, '#241028', x - 13, y - 21, 26, 1);
};
const flowers = (i) => (g, x, y, t) => {
  for (const sx of [-17, 9]) { R(g, OUT, x + sx - 1, y - 4, 10, 6); R(g, '#8a5a2c', x + sx, y - 3, 8, 4); R(g, '#a8743a', x + sx, y - 3, 8, 1);
    for (let k = 0; k < 4; k++) { const fx = x + sx + 1 + k * 2, sw = Math.round(Math.sin(t * 2 + k + sx) * 0.7), col = ['#ff9ac0', '#ffe060', '#ffffff', '#c0a0ff', '#ff7a5a', '#80d0ff'][(i + k) % 6]; R(g, '#3a8a3a', fx, y - 6, 1, 3); R(g, col, fx - 1 + sw, y - 8 + (k & 1), 3, 2); R(g, '#ffd040', fx + sw, y - 8 + (k & 1), 1, 1); } }
};
const lanterns = (i) => (g, x, y, t) => {
  for (const sx of [-13, 11]) { const sw = Math.round(Math.sin(t * 1.8 + sx) * 1), fl = 0.65 + 0.35 * Math.sin(t * 8 + sx);
    R(g, '#3a2418', x + sx - 1, y - 20, 4, 1); R(g, '#3a2418', x + sx + 1, y - 19, 1, 3 + 0);
    R(g, OUT, x + sx - 3 + sw, y - 17, 8, 10); R(g, '#c8283a', x + sx - 2 + sw, y - 16, 6, 8); R(g, '#e8505a', x + sx - 2 + sw, y - 16, 2, 8); R(g, '#241028', x + sx - 2 + sw, y - 16, 6, 1); R(g, '#241028', x + sx - 2 + sw, y - 9, 6, 1);
    g.globalAlpha = fl * 0.7; R(g, '#ffe090', x + sx - 1 + sw, y - 14, 4, 4); g.globalAlpha = 0.12 * fl; R(g, '#ffd060', x + sx - 9 + sw, y - 22, 20, 20); g.globalAlpha = 1; }
};
const sign = (kind) => (g, x, y, t) => {
  const sw = Math.round(Math.sin(t * 1.5) * 1);
  R(g, '#3a2418', x + 8, y - 17, 10, 1); R(g, '#3a2418', x + 8, y - 17, 1, 4);
  R(g, OUT, x + 9 + sw, y - 14, 12, 12); R(g, '#8a5a2c', x + 10 + sw, y - 13, 10, 10); R(g, '#c8a060', x + 10 + sw, y - 13, 10, 1); R(g, '#d8b070', x + 11 + sw, y - 12, 8, 8);
  const X = x + 11 + sw, Y = y - 12;
  if (kind === 'inn') { R(g, '#6a4a2a', X + 1, Y + 5, 6, 1); R(g, '#c8283a', X + 1, Y + 3, 3, 2); R(g, '#f4f0e8', X + 4, Y + 3, 3, 2); R(g, '#6a4a2a', X + 1, Y + 6, 1, 1); R(g, '#6a4a2a', X + 6, Y + 6, 1, 1); }          // letto
  else if (kind === 'shop') { R(g, '#4a8ac8', X + 3, Y + 4, 3, 3); R(g, '#c8e8ff', X + 3, Y + 4, 1, 3); R(g, '#8a5a2c', X + 3, Y + 3, 3, 1); R(g, '#c8283a', X + 3, Y + 2, 3, 1); }                                  // ampolla
  else if (kind === 'smith') { R(g, '#3a3a48', X + 1, Y + 3, 6, 2); R(g, '#5a5a6a', X + 2, Y + 5, 4, 1); R(g, '#8a8a9a', X + 1, Y + 3, 2, 1); R(g, '#8a5a2c', X + 6, Y + 2, 1, 4); }                                    // incudine
  else if (kind === 'hall') { R(g, '#f0c040', X + 2, Y + 3, 4, 1); R(g, '#f0c040', X + 2, Y + 1, 1, 2); R(g, '#f0c040', X + 4, Y + 1, 1, 2); R(g, '#f0c040', X + 6, Y + 1, 1, 2); R(g, '#c8283a', X + 3, Y + 4, 2, 2); }       // corona
  else { R(g, '#c8283a', X + 2, Y + 2, 4, 4); R(g, '#f4f0e8', X + 3, Y + 3, 2, 2); }
};
const banners = (gold) => (g, x, y, t) => {
  for (const sx of [-15, 13]) { const sw = Math.round(Math.sin(t * 2.2 + sx) * 1); R(g, '#3a2418', x + sx - 1, y - 26, 6, 1); R(g, OUT, x + sx - 1 + sw, y - 25, 6, 17); R(g, gold ? '#b88a20' : '#2a3a8a', x + sx + sw, y - 24, 4, 15); R(g, gold ? '#f0c040' : '#c8283a', x + sx + sw, y - 24, 1, 15); R(g, '#f4f0e8', x + sx + 1 + sw, y - 20, 2, 3); R(g, gold ? '#f0c040' : '#f4f0e8', x + sx + sw, y - 10, 4, 1); }
};
const ivy = (g, x, y, t) => {
  for (let k = 0; k < 9; k++) { const sx = -14 + k * 1.2 + (k > 5 ? 20 : 0), len = 8 + (k * 7) % 12, sw = Math.round(Math.sin(t * 1.4 + k) * 0.8); R(g, '#2a6a2a', x + sx + sw, y - 24 + (k % 3) * 2, 1, len); for (let j = 0; j < len; j += 4) R(g, j & 4 ? '#4aa04a' : '#6ac85a', x + sx - 1 + sw, y - 23 + j + (k % 3) * 2, 3, 2); }
  R(g, '#ff9ac0', x - 12, y - 10, 1, 1); R(g, '#ffe060', x + 13, y - 15, 1, 1);
};
const chimney = (g, x, y, t) => {
  R(g, OUT, x - 4, y - 12, 9, 13); R(g, '#8a4a3a', x - 3, y - 11, 7, 11); R(g, '#b86a50', x - 3, y - 11, 2, 11); R(g, '#5a2a22', x + 2, y - 11, 2, 11); R(g, '#3a2018', x - 4, y - 13, 9, 2);
  for (let i = 0; i < 5; i++) { const e = (t * 0.45 + i / 5) % 1, px = x + Math.sin(e * 6 + i) * 3 + e * 6, py = y - 15 - e * 24; g.globalAlpha = (1 - e) * 0.75; R(g, e < 0.5 ? '#e8e8f0' : '#b8b8c8', px - e * 2, py, 3 + Math.round(e * 3), 3 + Math.round(e * 3)); g.globalAlpha = 1; }
};
export const FACADE = {
  noren_0: noren(0), noren_1: noren(1), noren_2: noren(2), noren_3: noren(3), noren_4: noren(4), noren_5: noren(5),
  awning_0: awning(0), awning_1: awning(1), awning_2: awning(2), awning_3: awning(3), awning_4: awning(4), awning_5: awning(5),
  flowers_0: flowers(0), flowers_1: flowers(2), flowers_2: flowers(4), lanterns: lanterns(0),
  sign_inn: sign('inn'), sign_shop: sign('shop'), sign_smith: sign('smith'), sign_hall: sign('hall'), sign_house: sign('house'),
  banners_blue: banners(false), banners_gold: banners(true), ivy, chimney,
};
