// LONGXI (villaggio cinese): edifici monoblocco con pilastri laccati rossi, pannelli bianchi, grate a losanghe, tetti smaltati con gronde rialzate e colmo dorato.
import { R, lite, dark, mix, OUT } from './BuildingSkins.js';
const MT = 18;
const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const hw = Math.round(Math.sqrt(r * r - y * y)); R(g, c, cx - hw, cy + y, hw * 2 + 1, 1); } };
export function cnLantern(g, x, y) { R(g, OUT, x + 3, y - 6, 1, 6); disc(g, x + 4, y + 5, 5, OUT); disc(g, x + 4, y + 5, 4, '#d8302a'); R(g, '#f08060', x + 2, y + 2, 2, 3); R(g, '#e8c040', x + 2, y, 5, 1); R(g, '#e8c040', x + 2, y + 10, 5, 1); R(g, 'rgba(255,120,80,.12)', x - 8, y - 4, 26, 26); }
function lattice(g, x, y, w, h) { R(g, OUT, x - 1, y - 1, w + 2, h + 2); R(g, '#3a2218', x, y, w, h); R(g, '#7a1e1e', x + 1, y + 1, w - 2, h - 2); for (let i = -h; i < w; i += 4) { for (let k = 0; k < h; k++) { const px = x + i + k, px2 = x + i + h - k; if (px > x && px < x + w - 1) R(g, '#e8c8a0', px, y + k, 1, 1); if (px2 > x && px2 < x + w - 1) R(g, '#e8c8a0', px2, y + k, 1, 1); } } R(g, '#3a2218', x, y, w, 1); R(g, '#3a2218', x, y + h - 1, w, 1); }
export function drawCnHouse(g, tw, o = {}) {
  g.save(); g.translate(0, MT);
  const roof = o.roof || '#2a8a6a', wall = o.wall || '#f0e8d8', pil = o.pillar || '#b8302a', W = tw * 16, roofH = o.roofH || 30, eave = 5, wallH = 38, H = roofH + eave + wallH, wy = roofH + eave;
  g.save(); g.globalAlpha = 0.26; g.fillStyle = '#0a0418'; g.beginPath(); g.moveTo(4, H); g.lineTo(W + 4, H); g.lineTo(W + 18, H - 8); g.lineTo(W + 18, wy - 6); g.lineTo(W + 4, wy); g.fill(); g.restore();
  // muro: pannelli di intonaco fra pilastri rossi, mensole colorate sotto la gronda, zoccolo di pietra
  R(g, OUT, 0, wy - 1, W, H - wy + 1); R(g, wall, 1, wy, W - 2, H - wy - 1);
  for (let x = 0; x < W - 2; x += 16) { R(g, pil, x, wy, 4, H - wy - 6); R(g, lite(pil, 0.25), x, wy, 1, H - wy - 6); R(g, dark(pil, 0.4), x + 3, wy, 1, H - wy - 6); } R(g, pil, W - 5, wy, 4, H - wy - 6); R(g, dark(pil, 0.4), W - 2, wy, 1, H - wy - 6);
  for (let x = 4; x < W - 6; x += 5) { R(g, ((x / 5) | 0) % 2 ? '#2a5a9a' : '#2a8a6a', x, wy, 4, 5); R(g, '#e8c040', x, wy + 5, 4, 1); }
  R(g, OUT, 0, H - 6, W, 6); R(g, '#8a8a94', 1, H - 5, W - 2, 4); R(g, '#b0b0ba', 1, H - 5, W - 2, 1); for (let x = 4; x < W - 2; x += 8) R(g, '#6a6a74', x, H - 5, 1, 4);
  const cx = Math.round(W / 2), dh = 28, dw = 20, dy = H - 6 - dh;
  R(g, OUT, cx - dw / 2 - 2, dy - 6, dw + 4, dh + 6); R(g, '#3a2218', cx - dw / 2 - 1, dy - 5, dw + 2, 4); R(g, '#e8c040', cx - 6, dy - 4, 12, 2);   // architrave con targa dorata
  R(g, OUT, cx - dw / 2, dy - 1, dw, dh + 1); R(g, '#c02a2a', cx - dw / 2 + 1, dy, dw - 2, dh); R(g, dark('#c02a2a', 0.4), cx, dy, 1, dh); for (let r = 0; r < 4; r++) for (const sx of [-6, -2, 3, 7]) R(g, '#e8c040', cx + sx, dy + 4 + r * 6, 2, 2); R(g, '#e8c040', cx - 3, dy + 14, 2, 3); R(g, '#e8c040', cx + 1, dy + 14, 2, 3);
  const wins = tw >= 6 ? [cx - 32, cx + 32] : [cx - 28, cx + 28];   // due finestre ai lati della porta, mai a contatto con lanterne e stendardi
  for (const wx of wins) { if (wx - 9 > 6 && wx + 9 < W - 6) lattice(g, wx - 9, wy + 10, 18, 18); }
  // tetto smaltato: file di tegole lungo la falda, bordo dorato, estremità rialzate e colmo con ornamenti
  for (let y = 0; y < roofH + eave; y++) {
    const t = Math.min(1, y / roofH), l = Math.round(16 * Math.pow(1 - t, 1.4) - 8 * t * t), r = W - l; R(g, OUT, l - 1, y, r - l + 2, 1);
    for (let x = l; x < r; x++) { const col = (x + 4) % 5; let c = roof; if (col === 0) c = dark(roof, 0.28); else if (col === 1) c = lite(roof, 0.12); if (y % 6 === 5) c = dark(roof, 0.4); R(g, c, x, y, 1, 1); }
    R(g, dark(roof, 0.5), r - 3, y, 3, 1); R(g, lite(roof, 0.3), l, y, 2, 1);
  }
  R(g, '#e8c040', -7, roofH + eave - 2, W + 14, 2); R(g, '#a8842a', -7, roofH + eave, W + 14, 1);                       // bordo dorato della gronda
  for (const ex of [-9, W + 4]) { R(g, OUT, ex, roofH + eave - 8, 5, 8); R(g, roof, ex + 1, roofH + eave - 7, 3, 6); R(g, '#e8c040', ex + 1, roofH + eave - 8, 3, 1); }   // punte rialzate
  R(g, OUT, 10, -3, W - 20, 4); R(g, '#e8c040', 11, -2, W - 22, 2); R(g, '#a8842a', 11, 0, W - 22, 1);
  for (const ex of [7, W - 13]) { R(g, OUT, ex, -10, 7, 9); R(g, '#e8c040', ex + 1, -9, 5, 7); R(g, '#fff0a0', ex + 2, -9, 2, 2); R(g, '#a8842a', ex + 1, -3, 5, 1); }   // ornamenti del colmo
  R(g, 'rgba(10,4,24,.5)', 0, wy + 6, W, 3); R(g, 'rgba(10,4,24,.2)', 0, wy + 9, W, 3);
  if (o.lanterns !== false) { cnLantern(g, 4, wy + 8); cnLantern(g, W - 12, wy + 8); }
  g.restore();
}
// ---- locale, bottega e sala (aree reali: 8x6, 8x6, 11x7) ----
const sign = (g, x, y, c1, c2) => { R(g, OUT, x - 1, y, 12, 32); R(g, c1, x, y + 1, 10, 30); R(g, '#e8c040', x, y + 1, 10, 2); R(g, '#e8c040', x, y + 29, 10, 2); R(g, c2, x + 3, y + 8, 4, 2); R(g, c2, x + 2, y + 13, 6, 2); R(g, c2, x + 4, y + 10, 2, 8); R(g, c2, x + 2, y + 20, 6, 2); R(g, c2, x + 3, y + 22, 4, 2); };
const stool = (g, x, y) => { R(g, OUT, x, y, 9, 9); R(g, '#c8302a', x + 1, y + 1, 7, 4); R(g, '#e8c040', x + 1, y + 1, 7, 1); R(g, '#7a2a1a', x + 3, y + 5, 3, 4); };
const tableCN = (g, x, y) => { R(g, 'rgba(10,4,24,.28)', x, y + 11, 22, 3); R(g, OUT, x + 2, y + 6, 3, 8); R(g, OUT, x + 17, y + 6, 3, 8); R(g, OUT, x, y + 2, 22, 7); R(g, '#7a2a1a', x + 1, y + 3, 20, 5); R(g, '#a8482a', x + 1, y + 3, 20, 1); R(g, '#f4ecd4', x + 4, y, 4, 3); R(g, '#3a8a6a', x + 12, y, 5, 3); };
const jar = (g, x, y, c) => { R(g, OUT, x, y + 3, 10, 12); R(g, c, x + 1, y + 4, 8, 10); R(g, lite(c, 0.3), x + 2, y + 4, 2, 10); R(g, OUT, x + 2, y, 6, 4); R(g, '#e8c040', x + 3, y + 1, 4, 2); };
const lion = (g, x, y) => { R(g, 'rgba(10,4,24,.28)', x - 1, y + 21, 18, 3); R(g, OUT, x, y + 14, 16, 8); R(g, '#9a9aa6', x + 1, y + 15, 14, 6); R(g, '#c0c0cc', x + 1, y + 15, 14, 1); disc(g, x + 8, y + 7, 7, OUT); disc(g, x + 8, y + 7, 6, '#a8a8b4'); R(g, '#e8e8f0', x + 4, y + 4, 3, 3); R(g, '#e8e8f0', x + 9, y + 4, 3, 3); R(g, OUT, x + 5, y + 5, 1, 1); R(g, OUT, x + 10, y + 5, 1, 1); R(g, '#6a6a76', x + 6, y + 10, 4, 2); R(g, '#c8302a', x + 6, y + 11, 4, 1); };
const incense = (g, x, y) => { R(g, 'rgba(10,4,24,.28)', x, y + 20, 18, 3); R(g, OUT, x + 2, y + 10, 14, 11); R(g, '#a8842a', x + 3, y + 11, 12, 9); R(g, '#e8c040', x + 3, y + 11, 12, 2); R(g, OUT, x + 1, y + 6, 16, 6); R(g, '#c8a040', x + 2, y + 7, 14, 4); R(g, '#3a2a1a', x + 4, y + 6, 10, 2); for (const dx of [6, 9, 12]) { R(g, '#c8302a', x + dx, y, 1, 7); R(g, 'rgba(220,220,230,.45)', x + dx - 1, y - 6, 2, 6); } };
export function drawCnShop(g, kind, twOv) {
  const P = { locanda: { tw: 8, roof: '#2a8a6a' }, bottega: { tw: 8, roof: '#2a5a9a', wall: '#f4ecd0' }, sala: { tw: 11, roof: '#c89a2a', roofH: 28, wall: '#f6eedc' } }[kind], tw = twOv || P.tw, W = tw * 16, roofH = P.roofH || 30, H = roofH + 5 + 38, wy = roofH + 5 + MT, base = H + MT, cx = Math.round(W / 2);
  drawCnHouse(g, tw, { ...P, lanterns: kind === 'sala' ? false : true });
  if (kind === 'locanda') { sign(g, W + 6, wy - 6, '#c8302a', '#f0d070'); tableCN(g, 4, base - 16); stool(g, 6, base - 6); tableCN(g, W - 28, base - 16); stool(g, W - 14, base - 6); R(g, 'rgba(235,235,240,.5)', W - 40, 2, 4, 5); }
  else if (kind === 'bottega') { sign(g, W + 6, wy - 6, '#2a5a9a', '#f0d070'); for (let i = 0; i < 5; i++) { R(g, '#d8302a', 14 + i * 7, wy + 5, 2, 8 + (i % 2) * 3); R(g, '#e8402a', 13 + i * 7, wy + 12 + (i % 2) * 3, 4, 3); } jar(g, 4, base - 18, '#3a8a6a'); jar(g, 16, base - 17, '#c89a2a'); jar(g, W - 26, base - 18, '#3a8a6a'); jar(g, W - 14, base - 17, '#8a3a2a'); }
  else if (kind === 'sala') {
    // secondo tetto sopra il primo: una sala a due livelli
    // secondo livello: appoggiato sopra il colmo del primo tetto (il piano superiore affonda di 12 px nelle tegole, così non c'è nessun distacco)
    const x0 = cx - 40, rw = 80, DY = 14;
    R(g, OUT, x0 + 8, -6 + DY, rw - 16, 20); R(g, '#f6eedc', x0 + 9, -5 + DY, rw - 18, 18); for (let x = x0 + 9; x < x0 + rw - 12; x += 14) R(g, '#b8302a', x, -5 + DY, 4, 18);   // piano superiore con pilastri
    for (let y = 0; y < 22; y++) { const t = y / 22, l = Math.round(10 * Math.pow(1 - t, 1.4) - 8 * t * t), c0 = '#c89a2a'; R(g, OUT, x0 + l - 1, -26 + DY + y, rw - 2 * l + 2, 1); for (let x = x0 + l; x < x0 + rw - l; x++) R(g, (x + 4) % 5 === 0 ? dark(c0, 0.28) : (y % 6 === 5 ? dark(c0, 0.4) : c0), x, -26 + DY + y, 1, 1); }
    R(g, '#e8c040', x0 - 6, -6 + DY, rw + 12, 2); R(g, OUT, x0 + 10, -29 + DY, rw - 20, 4); R(g, '#e8c040', x0 + 11, -28 + DY, rw - 22, 2);
    lion(g, 6, base - 26); lion(g, W - 22, base - 26); incense(g, cx + 18, base - 6);
    for (const bx of [24, W - 36]) { R(g, OUT, bx, wy + 6, 12, 28); R(g, '#c8302a', bx + 1, wy + 7, 10, 26); R(g, '#e8c040', bx + 3, wy + 12, 6, 6); R(g, '#e8c040', bx + 1, wy + 7, 10, 1); }
    for (let i = 0; i < 3; i++) { R(g, '#8a8a94', cx - 14 - i * 3, base - 4 + i * 2, 28 + i * 6, 2); R(g, '#c0c0cc', cx - 14 - i * 3, base - 4 + i * 2, 28 + i * 6, 1); }
  }
}
