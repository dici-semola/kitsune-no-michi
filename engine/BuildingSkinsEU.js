// AURELBURG (capitale europea): edifici monoblocco in mattoni e pietra, tetti ripidi di ardesia con abbaini, cantonali in pietra, persiane e fioriere.
import { R, lite, dark, mix, OUT } from './BuildingSkins.js';
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const MT = 10;   // margine in alto per camini e torri

function window2(g, x, y, o) {   // finestra con persiane, davanzale e fioriera
  const sh = o.shutter || '#2a6a4a';
  R(g, OUT, x - 5, y - 1, 24, 19); R(g, sh, x - 4, y, 4, 15); R(g, dark(sh, 0.25), x - 4, y, 1, 15); R(g, sh, x + 14, y, 4, 15); R(g, dark(sh, 0.25), x + 17, y, 1, 15);
  for (let i = 0; i < 3; i++) { R(g, dark(sh, 0.3), x - 3, y + 3 + i * 4, 2, 1); R(g, dark(sh, 0.3), x + 15, y + 3 + i * 4, 2, 1); }
  R(g, '#b8b2a4', x, y, 14, 3); R(g, '#d8d2c4', x, y, 14, 1);                       // architrave in pietra
  R(g, OUT, x, y + 3, 14, 12); R(g, '#7ab0d8', x + 1, y + 4, 12, 10); R(g, '#b8e0f4', x + 1, y + 4, 12, 3); R(g, '#3a2a22', x + 6, y + 4, 2, 10); R(g, '#3a2a22', x + 1, y + 8, 12, 1);
  R(g, '#b8b2a4', x - 1, y + 14, 16, 2); R(g, '#8a847a', x - 1, y + 16, 16, 1);       // davanzale
  R(g, OUT, x - 1, y + 15, 16, 5); R(g, '#6a4226', x, y + 16, 14, 3); const fc = o.flowers || ['#e83a5a', '#f0c030', '#e8e0f0'];
  for (let i = 0; i < 7; i++) { R(g, '#3a8a40', x + i * 2, y + 14, 2, 2); R(g, fc[i % fc.length], x + i * 2, y + 13, 2, 2); }
}
export function drawEuroHouse(g, tw, o = {}) {
  g.save(); g.translate(0, MT);
  const brick = o.brick || '#a8553a', roofC = o.roof || '#4a5a7a', stone = o.stone || '#b8b2a4', W = tw * 16, roofH = o.roofH || 30, eave = 3, wallH = 40, H = roofH + eave + wallH, wy = roofH + eave;
  g.save(); g.globalAlpha = 0.28; g.fillStyle = '#0a0418'; g.beginPath(); g.moveTo(4, H); g.lineTo(W, H); g.lineTo(W + 14, H - 8); g.lineTo(W + 14, wy - 6); g.lineTo(W, wy); g.fill(); g.restore();
  // muro
  R(g, OUT, 0, wy - 1, W, H - wy + 1);
  if (o.timber) { R(g, '#ece4cc', 1, wy, W - 2, H - wy - 5); for (let x = 1; x < W - 2; x += 16) R(g, '#4a2a1c', x, wy, 3, H - wy - 5); R(g, '#4a2a1c', 1, wy + 2, W - 2, 3); R(g, '#4a2a1c', 1, wy + 20, W - 2, 2); for (let x = 1; x < W - 18; x += 16) { for (let i = 0; i < 14; i++) R(g, '#4a2a1c', x + 3 + i, wy + 5 + Math.floor(i * 1.0), 1, 1); } }
  else { R(g, brick, 1, wy, W - 2, H - wy - 1); for (let y = wy; y < H - 5; y += 4) { R(g, dark(brick, 0.35), 1, y + 3, W - 2, 1); const off = ((y - wy) / 4 % 2) * 4; for (let x = 1 + off; x < W - 2; x += 8) R(g, dark(brick, 0.35), x, y, 1, 4); for (let x = 1 + off; x < W - 2; x += 8) if (rnd(x, y) < 0.3) R(g, lite(brick, 0.1), x + 1, y, 6, 2); } }
  for (let y = wy + 2; y < H - 8; y += 8) { const k = ((y - wy) / 8) | 0; R(g, k % 2 ? dark(stone, 0.1) : stone, 1, y, 5, 7); R(g, k % 2 ? stone : dark(stone, 0.1), W - 6, y, 5, 7); R(g, '#d8d2c4', 1, y, 5, 1); R(g, '#d8d2c4', W - 6, y, 5, 1); }   // cantonali
  R(g, OUT, 0, H - 6, W, 6); R(g, '#8a847a', 1, H - 5, W - 2, 4); R(g, '#a8a296', 1, H - 5, W - 2, 1); for (let x = 3; x < W - 2; x += 7) R(g, '#5a564c', x, H - 5, 1, 4);
  // finestre e porta
  const dx = Math.round(W / 2) - 8; let pos = tw >= 5 ? [dx - 40, dx - 20, dx + 26, dx + 46] : [dx - 22, dx + 24]; if (tw >= 6) { pos = []; for (let x = dx - 28; x >= 10; x -= 26) pos.push(x); for (let x = dx + 28; x <= W - 30; x += 26) pos.push(x); }
  for (const px of pos) if (px > 6 && px < W - 20) window2(g, px, wy + 6, o);
  const dh = 27, dy = H - 6 - dh;
  R(g, OUT, dx - 2, dy - 4, 20, dh + 4); R(g, stone, dx - 1, dy - 3, 18, dh + 3); R(g, '#d8d2c4', dx - 1, dy - 3, 18, 1);
  R(g, OUT, dx, dy - 1, 16, dh); R(g, o.door || '#5a3220', dx + 1, dy, 14, dh - 1); for (let y = dy + 1; y < dy + dh - 1; y += 4) R(g, dark(o.door || '#5a3220', 0.35), dx + 1, y, 14, 1); R(g, dark(o.door || '#5a3220', 0.4), dx + 8, dy, 1, dh - 1);
  R(g, '#e8c040', dx + 12, dy + 14, 2, 2); R(g, '#7ab0d8', dx + 3, dy + 3, 4, 5); R(g, '#7ab0d8', dx + 9, dy + 3, 4, 5);   // maniglia e vetrini
  R(g, '#a8a296', dx - 3, H - 4, 22, 2); R(g, '#d8d2c4', dx - 3, H - 4, 22, 1);                                   // gradino
  // tetto ripido di ardesia (squame)
  for (let y = 0; y < roofH + eave; y++) {
    const t = Math.min(1, y / roofH), l = Math.round(14 * (1 - t) - 1 * t), r = W - l; R(g, OUT, l - 1, y, r - l + 2, 1);
    const band = Math.floor(y / 3), inB = y % 3;
    for (let x = l; x < r; x++) { const sc = (x + (band % 2) * 3) % 6; let c = roofC; if (inB === 2) c = dark(roofC, 0.38); else if (inB === 0) c = lite(roofC, 0.14); if (sc === 0) c = dark(c, 0.22); R(g, c, x, y, 1, 1); }
    R(g, dark(roofC, 0.5), r - 3, y, 3, 1); R(g, lite(roofC, 0.28), l, y, 2, 1);
  }
  R(g, OUT, 13, 0, W - 26, 2); R(g, dark(roofC, 0.5), 14, 1, W - 28, 1);                                          // colmo
  R(g, 'rgba(10,4,24,.5)', 0, wy, W, 3); R(g, 'rgba(10,4,24,.22)', 0, wy + 3, W, 3);
  // abbaino centrale
  if (o.dormer !== false) { const cx = Math.round(W / 2) - 8, cy = Math.round(roofH * 0.28);
    R(g, OUT, cx - 1, cy + 7, 18, 14); R(g, brick, cx, cy + 8, 16, 12); R(g, OUT, cx + 2, cy + 10, 12, 10); R(g, '#7ab0d8', cx + 3, cy + 11, 10, 8); R(g, '#b8e0f4', cx + 3, cy + 11, 10, 2); R(g, '#3a2a22', cx + 7, cy + 11, 2, 8); R(g, stone, cx + 1, cy + 19, 14, 1);
    for (let k = 0; k < 8; k++) { const half = k + 1; R(g, OUT, cx + 8 - half - 1, cy + k, 2 * half + 2, 1); R(g, k % 3 === 2 ? dark(roofC, 0.3) : lite(roofC, 0.12), cx + 8 - half, cy + k, 2 * half, 1); } }
  // comignolo in mattoni
  const cxm = o.chimneyX !== undefined ? o.chimneyX : W - (tw <= 4 ? 18 : 30); R(g, OUT, cxm - 1, -7, 12, 24); R(g, brick, cxm, -6, 10, 22); R(g, lite(brick, 0.2), cxm, -6, 3, 22); R(g, dark(brick, 0.3), cxm + 7, -6, 3, 22); for (let y = -4; y < 14; y += 4) R(g, dark(brick, 0.4), cxm, y, 10, 1); R(g, OUT, cxm - 2, -9, 14, 4); R(g, stone, cxm - 1, -8, 12, 2); R(g, '#14081a', cxm + 2, -8, 6, 1);
  g.restore();
}

// ---- negozi e edifici pubblici di Aurelburg ----
const mug = (g, x, y) => { R(g, '#f4ecd4', x + 1, y + 2, 5, 5); R(g, '#c8a050', x + 1, y + 2, 5, 1); R(g, '#f4ecd4', x + 6, y + 3, 2, 3); R(g, '#ffffff', x + 2, y, 1, 1); R(g, '#ffffff', x + 4, y + 1, 1, 1); };
function ironSign(g, x, y, bg, draw) { R(g, OUT, x - 10, y - 2, 18, 2); R(g, '#3a3a46', x - 10, y - 1, 18, 1); R(g, OUT, x - 3, y, 2, 3); R(g, OUT, x + 5, y, 2, 3); R(g, OUT, x - 5, y + 3, 16, 14); R(g, bg, x - 4, y + 4, 14, 12); R(g, lite(bg, 0.25), x - 4, y + 4, 14, 1); R(g, dark(bg, 0.3), x - 4, y + 15, 14, 1); draw(g, x - 1, y + 6); }
const gear = (g, x, y) => { R(g, '#8a6a20', x + 2, y, 3, 8); R(g, '#8a6a20', x, y + 2, 7, 3); R(g, '#e8c040', x + 1, y + 1, 5, 5); R(g, '#3a2a18', x + 3, y + 3, 1, 1); R(g, '#8a6a20', x + 1, y + 1, 1, 1); R(g, '#8a6a20', x + 5, y + 5, 1, 1); };
const bread = (g, x, y) => { R(g, '#8a5a2c', x, y + 2, 9, 5); R(g, '#d09858', x + 1, y + 1, 7, 5); R(g, '#f0c880', x + 2, y + 1, 4, 2); R(g, '#8a5a2c', x + 3, y + 3, 1, 2); R(g, '#8a5a2c', x + 5, y + 3, 1, 2); };
const anvil = (g, x, y) => { R(g, '#2a2a34', x, y + 1, 8, 2); R(g, '#4a4a58', x + 1, y + 3, 6, 2); R(g, '#2a2a34', x + 3, y + 5, 3, 3); R(g, '#8a8a9a', x, y + 1, 8, 1); };
function barrelEU(g, x, y) { R(g, OUT, x, y, 11, 13); R(g, '#8a5a2c', x + 1, y + 1, 9, 11); R(g, '#b88444', x + 2, y + 1, 2, 11); R(g, '#4a3a2a', x + 1, y + 3, 9, 1); R(g, '#4a3a2a', x + 1, y + 9, 9, 1); R(g, '#5a3a1c', x + 8, y + 1, 2, 11); }
function crateEU(g, x, y, c, fruit) { R(g, OUT, x, y, 12, 11); R(g, '#a8742f', x + 1, y + 1, 10, 9); R(g, '#7a5028', x + 1, y + 5, 10, 1); for (let i = 0; i < 4; i++) R(g, fruit[i % fruit.length], x + 2 + i * 2, y - 1 + (i % 2), 3, 3); }
function awningEU(g, x, y, w, c1, c2) { for (let i = 0; i < w; i += 5) { R(g, OUT, x + i, y, 5, 13); const c = (i / 5) % 2 ? c2 : c1; R(g, c, x + i, y + 1, 5, 10); R(g, dark(c, 0.25), x + i, y + 10, 5, 1); } R(g, OUT, x, y - 1, w, 1); R(g, OUT, x, y + 11, w, 2); for (let i = 0; i < w; i += 5) { R(g, OUT, x + i, y + 11, 5, 1); R(g, (i / 5) % 2 ? c2 : c1, x + i + 1, y + 11, 3, 2); } R(g, 'rgba(10,4,24,.35)', x, y + 13, w, 4); }
function lampEU(g, x, y) { R(g, OUT, x, y, 3, 28); R(g, '#2a2a34', x + 1, y + 2, 1, 26); R(g, OUT, x - 3, y - 6, 9, 9); R(g, '#ffd878', x - 2, y - 5, 7, 7); R(g, '#fff0b0', x - 1, y - 4, 3, 3); R(g, '#2a2a34', x - 3, y - 7, 9, 2); }

export function drawShopEU(g, kind, twOv) {
  const P = {
    locanda: { tw: 6, roof: '#7a2a2a', brick: '#b8704a', shutter: '#8a2a2a', door: '#4a2a1c', timber: true },
    mercato: { tw: 6, roof: '#2a6a4a', brick: '#c8a060', shutter: '#e8e0d0', door: '#6a4226' },
    laboratorio: { tw: 6, roof: '#3a8a7a', brick: '#6a6a78', shutter: '#b8742a', stone: '#8a8a98', door: '#3a3a46', dormer: false },
    municipio: { tw: 8, roof: '#2a3a5a', brick: '#c8c0ae', stone: '#e0dccc', shutter: '#2a3a5a', door: '#3a2a22', dormer: false, roofH: 28 },
    fabbro: { tw: 5, roof: '#3a3a48', brick: '#7a7468', stone: '#a8a296', shutter: '#3a2a22', door: '#3a2a22', dormer: false },
  }[kind], tw = twOv || P.tw, W = tw * 16, roofH = P.roofH || 30, H = roofH + 3 + 40, wy = roofH + 3 + MT, base = H + MT, dx = Math.round(W / 2) - 8;
  drawEuroHouse(g, tw, { ...P, chimneyX: kind === 'municipio' ? W - 20 : kind === 'laboratorio' ? 18 : W - 30 });
  if (kind === 'locanda') {
    ironSign(g, dx + 38, wy + 4, '#4a2a1c', mug); ironSign(g, dx - 30, wy + 4, '#4a2a1c', mug);
    barrelEU(g, 4, base - 15); barrelEU(g, 16, base - 15); R(g, OUT, W - 34, base - 12, 28, 6); R(g, '#8a5a34', W - 33, base - 11, 26, 4); R(g, OUT, W - 32, base - 7, 3, 7); R(g, OUT, W - 12, base - 7, 3, 7);
  } else if (kind === 'mercato') {
    awningEU(g, 6, wy + 22, 34, '#2a8a4a', '#f4ecd4'); awningEU(g, W - 40, wy + 22, 34, '#2a8a4a', '#f4ecd4');
    ironSign(g, dx + 6, wy - 8, '#3a2a18', (g, x, y) => { R(g, '#8a6a10', x + 2, y, 5, 9); R(g, '#8a6a10', x, y + 2, 9, 5); R(g, '#f0c040', x + 2, y + 1, 5, 7); R(g, '#f0c040', x + 1, y + 2, 7, 5); R(g, '#8a6a10', x + 4, y + 3, 1, 3); });
    crateEU(g, 8, base - 13, '#a8742f', ['#e8402a', '#f0c030', '#7ac040']); crateEU(g, 22, base - 13, '#a8742f', ['#f0a030', '#e8402a']); crateEU(g, W - 38, base - 13, '#a8742f', ['#7ac040', '#f0c030']); crateEU(g, W - 24, base - 13, '#8a6a30', ['#e8e0d0', '#e8402a']);
  } else if (kind === 'laboratorio') {
    ironSign(g, dx + 36, wy + 4, '#2a3a4a', gear);
    for (let i = 0; i < 3; i++) { R(g, OUT, 8 + i * 4, wy + 2, 3, 40); R(g, '#c8803a', 9 + i * 4, wy + 3, 1, 38); }   // tubi di rame lungo la parete
    R(g, OUT, 6, wy + 20, 17, 3); R(g, '#c8803a', 7, wy + 21, 15, 1);
    R(g, OUT, W / 2 - 14, 4, 28, 12); R(g, '#b8e8e0', W / 2 - 12, 2, 24, 12); R(g, 'rgba(255,255,255,.5)', W / 2 - 10, 3, 8, 3); R(g, '#3a8a7a', W / 2 - 12, 13, 24, 2);   // cupola di vetro sul tetto
    R(g, 'rgba(120,255,160,.4)', W - 36, wy + 4, 18, 22); R(g, '#8affb0', W - 33, wy + 8, 12, 12);                                                                          // finestra che brilla di verde
    for (let i = 0; i < 4; i++) { g.globalAlpha = 0.5 - i * 0.1; R(g, '#d8d4d8', 20 + i * 2, -4 - i * 5, 4 + i, 4 + i); } g.globalAlpha = 1;
    barrelEU(g, W - 18, base - 15);
  } else if (kind === 'municipio') {
    // torre dell'orologio: nasce dalla facciata e attraversa il tetto (fusto alto fino alla cornice di base), con ombra sulle falde
    R(g, 'rgba(10,4,24,.3)', W / 2 + 18, -20, 6, 50); R(g, OUT, W / 2 - 19, -26, 38, 56); R(g, '#c8c0ae', W / 2 - 18, -25, 36, 54); R(g, '#e0dccc', W / 2 - 18, -25, 36, 2); R(g, '#a8a296', W / 2 + 12, -23, 6, 52);
    for (let y = -17; y < 22; y += 6) { R(g, '#a8a296', W / 2 - 18, y + 5, 30, 1); for (let x = W / 2 - 18 + ((y / 6 | 0) % 2) * 6; x < W / 2 + 12; x += 12) R(g, '#a8a296', x, y, 1, 6); }
    R(g, OUT, W / 2 - 22, 26, 44, 6); R(g, '#e0dccc', W / 2 - 21, 27, 42, 4); R(g, '#a8a296', W / 2 - 21, 30, 42, 1); R(g, 'rgba(10,4,24,.4)', W / 2 - 22, 32, 44, 4);   // cornice di base che poggia sul tetto
    R(g, OUT, W / 2 - 11, -20, 22, 22); R(g, '#f4ecd4', W / 2 - 10, -19, 20, 20); R(g, '#3a2a22', W / 2, -18, 1, 9); R(g, '#3a2a22', W / 2, -10, 7, 1); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; R(g, '#3a2a22', Math.round(W / 2 + Math.cos(a) * 8), Math.round(-9 + Math.sin(a) * 8), 1, 1); }
    for (let k = 0; k < 8; k++) { R(g, OUT, W / 2 - 18 + k * 2 - 1, -34 + (8 - k) - 1, 36 - k * 4 + 2, 1); } R(g, '#2a3a5a', W / 2 - 18, -26, 36, 1);
    R(g, OUT, W / 2 - 1, -42, 2, 14); R(g, '#c8283a', W / 2 + 1, -41, 10, 6);                                                  // bandiera
    for (let i = 0; i < 3; i++) { R(g, '#a8a296', dx - 8 - i * 3, base - 4 + i * 2, 32 + i * 6, 2); R(g, '#d8d2c4', dx - 8 - i * 3, base - 4 + i * 2, 32 + i * 6, 1); }   // scalinata
    for (const bx of [24, W - 38]) { R(g, OUT, bx, wy + 6, 14, 30); R(g, '#c8283a', bx + 1, wy + 7, 12, 28); R(g, '#f0c040', bx + 5, wy + 12, 4, 6); R(g, '#8a1a24', bx + 10, wy + 7, 3, 28); }
  } else if (kind === 'fabbro') {
    R(g, '#ff7a30', W - 26, wy + 8, 12, 10); R(g, '#ffd060', W - 24, wy + 10, 8, 6);
    ironSign(g, dx + 30, wy + 4, '#3a2a22', anvil);
    for (let i = 0; i < 4; i++) { g.globalAlpha = 0.55 - i * 0.12; R(g, '#d8d4d8', W - 28 + i * 2, -6 - i * 5, 4 + i, 4 + i); } g.globalAlpha = 1;
    barrelEU(g, 4, base - 15);
  }
}
export { lampEU };

// ---- edifici monumentali di Aurelburg (aree reali: cattedrale 6x7, torre 6x7, castello 6x8). Disegnati nel riquadro dell'area (0,0) = angolo alto-sinistro ----
const stoneWall = (g, x, y, w, h, c = '#b8b2a4') => { R(g, OUT, x - 1, y - 1, w + 2, h + 1); R(g, c, x, y, w, h); for (let yy = y; yy < y + h; yy += 5) { R(g, dark(c, 0.3), x, yy + 4, w, 1); const o = ((yy - y) / 5 % 2) * 5; for (let xx = x + o; xx < x + w; xx += 10) R(g, dark(c, 0.3), xx, yy, 1, 5); } R(g, lite(c, 0.25), x, y, 2, h); R(g, dark(c, 0.3), x + w - 3, y, 3, h); };
const cone = (g, cx, y, hw, hgt, c) => { for (let i = 0; i < hgt; i++) { const w = Math.round(hw * (i + 1) / hgt); R(g, OUT, cx - w - 1, y + i, 2 * w + 2, 1); R(g, i % 3 === 2 ? dark(c, 0.35) : (i % 3 === 0 ? lite(c, 0.12) : c), cx - w, y + i, 2 * w, 1); R(g, lite(c, 0.3), cx - w, y + i, 1, 1); R(g, dark(c, 0.5), cx + w - 2, y + i, 2, 1); } };
const lancet = (g, x, y, w, h, glass) => { R(g, OUT, x - 1, y - 1, w + 2, h + 2); R(g, glass, x, y, w, h); for (let i = 0; i < w / 2; i++) { R(g, '#b8b2a4', x + i, y - 1 + 0, 1, 1); } R(g, '#3a2a22', x + w / 2, y, 1, h); R(g, '#3a2a22', x, y + h / 2, w, 1); R(g, 'rgba(255,255,255,.35)', x + 1, y + 1, 2, h - 2); };
const pointedDoor = (g, cx, base, w, h, c) => { R(g, OUT, cx - w / 2 - 2, base - h - 2, w + 4, h + 2); R(g, '#d8d2c4', cx - w / 2 - 1, base - h - 1, w + 2, h + 1); R(g, OUT, cx - w / 2, base - h + 2, w, h - 2); R(g, c, cx - w / 2 + 1, base - h + 3, w - 2, h - 3); for (let i = 0; i < 6; i++) { const hw = Math.round((w / 2 - 1) * (i + 1) / 6); R(g, c, cx - hw, base - h + 3 - 6 + i, hw * 2, 1); R(g, OUT, cx - hw - 1, base - h + 3 - 6 + i, 1, 1); R(g, OUT, cx + hw, base - h + 3 - 6 + i, 1, 1); } R(g, dark(c, 0.4), cx, base - h + 1, 1, h - 1); for (let y = base - h + 6; y < base - 3; y += 6) R(g, '#3a3a46', cx - w / 2 + 1, y, w - 2, 1); R(g, '#e8c040', cx + 3, base - h / 2, 2, 2); };
const battlements = (g, x, y, w, c = '#b8b2a4') => { for (let i = 0; i < w; i += 8) { R(g, OUT, x + i - 1, y, 8, 8); R(g, c, x + i, y + 1, 6, 7); R(g, lite(c, 0.25), x + i, y + 1, 6, 1); } };
const flagAt = (g, x, y, c) => { R(g, OUT, x, y, 2, 14); R(g, '#c8a040', x, y + 1, 1, 12); R(g, OUT, x + 2, y + 1, 12, 8); R(g, c, x + 3, y + 2, 10, 6); R(g, dark(c, 0.3), x + 3, y + 6, 10, 2); };

export function drawCathedral(g) {   // 6x7 tile = 96x112
  const W = 96, base = 112; g.save(); g.globalAlpha = 0.26; g.fillStyle = '#0a0418'; g.beginPath(); g.moveTo(4, base); g.lineTo(W, base); g.lineTo(W + 14, base - 8); g.lineTo(W + 14, 30); g.lineTo(W, 36); g.fill(); g.restore();
  stoneWall(g, 24, 44, 48, 62, '#c8c2b4');                       // navata
  for (let i = 0; i < 26; i++) { const w = Math.round(25 * (i + 1) / 26); R(g, OUT, 48 - w - 1, 18 + i, 2 * w + 2, 1); R(g, i === 25 ? OUT : '#c8c2b4', 48 - w, 18 + i, 2 * w, 1); for (let x = 48 - w + 2; x < 48 + w - 2; x += 10) R(g, '#a8a296', x + (i % 5 === 0 ? 5 : 0), 18 + i, 1, 1); R(g, lite('#c8c2b4', 0.3), 48 - w, 18 + i, 1, 1); R(g, dark('#c8c2b4', 0.35), 48 + w - 2, 18 + i, 2, 1); }
  R(g, OUT, 47, 8, 2, 12); R(g, '#e8c040', 47, 9, 2, 10); R(g, '#e8c040', 44, 12, 8, 2);   // croce
  for (const x0 of [0, 72]) { stoneWall(g, x0, 36, 24, 70, '#b8b2a4'); cone(g, x0 + 12, 8, 16, 28, '#4a5a7a'); R(g, OUT, x0 + 11, 2, 2, 8); R(g, '#e8c040', x0 + 11, 3, 2, 6); battlements(g, x0 - 0, 34, 24, '#b8b2a4'); lancet(g, x0 + 8, 52, 8, 16, '#7ab0d8'); lancet(g, x0 + 8, 76, 8, 12, '#d8a0e0'); }
  R(g, OUT, 36, 24, 24, 24); R(g, '#d8d2c4', 37, 25, 22, 22);    // rosone
  for (let y = -10; y <= 10; y++) { const hw = Math.round(Math.sqrt(100 - y * y)); R(g, OUT, 48 - hw - 1, 36 + y, 2 * hw + 2, 1); }
  for (let y = -9; y <= 9; y++) { const hw = Math.round(Math.sqrt(81 - y * y)); R(g, '#3a5a9a', 48 - hw, 36 + y, 2 * hw, 1); }
  for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4; R(g, '#e8c040', 48 + Math.round(Math.cos(ang) * 4), 36 + Math.round(Math.sin(ang) * 4), 1, 1); R(g, '#e8c040', 48 + Math.round(Math.cos(ang) * 8), 36 + Math.round(Math.sin(ang) * 8), 1, 1); } R(g, '#c8283a', 45, 33, 6, 6); R(g, '#e8c040', 47, 35, 2, 2);
  pointedDoor(g, 48, base - 4, 18, 34, '#5a3220');
  for (let i = 0; i < 3; i++) { R(g, '#a8a296', 22 - i * 3, base - 4 + i * 2, 52 + i * 6, 2); R(g, '#d8d2c4', 22 - i * 3, base - 4 + i * 2, 52 + i * 6, 1); }
  for (const bx of [22, 70]) { R(g, OUT, bx, 60, 4, 46); R(g, '#a8a296', bx + 1, 60, 2, 46); }
}
export function drawTowerBuilding(g) {   // torre (6x7 = 96x112): torre di pietra rotonda con tetto conico, terrazzino e muretto basso
  const base = 112; g.save(); g.globalAlpha = 0.26; g.fillStyle = '#0a0418'; g.beginPath(); g.moveTo(20, base); g.lineTo(76, base); g.lineTo(90, base - 8); g.lineTo(90, 30); g.lineTo(76, 36); g.fill(); g.restore();
  stoneWall(g, 18, 40, 60, 66, '#a8a296'); for (let y = 44; y < 104; y += 12) R(g, 'rgba(10,4,24,.12)', 18, y, 60, 1);
  R(g, OUT, 14, 36, 68, 6); R(g, '#c8c2b4', 15, 37, 66, 4); battlements(g, 18, 28, 60, '#a8a296');
  cone(g, 48, -2, 36, 30, '#2a3a5a'); R(g, OUT, 47, -12, 2, 12); flagAt(g, 49, -12, '#c8283a');
  lancet(g, 44, 50, 8, 16, '#7ab0d8'); lancet(g, 24, 70, 7, 12, '#7ab0d8'); lancet(g, 65, 70, 7, 12, '#7ab0d8');
  pointedDoor(g, 48, base - 4, 14, 26, '#4a2a1c'); R(g, OUT, 46, 66, 4, 4); R(g, '#e8c040', 47, 67, 2, 2);
  for (let i = 0; i < 3; i++) { R(g, '#8a847a', 38 - i * 3, base - 4 + i * 2, 20 + i * 6, 2); R(g, '#c8c2b4', 38 - i * 3, base - 4 + i * 2, 20 + i * 6, 1); }
  R(g, OUT, 2, 98, 14, 8); R(g, '#6a4226', 3, 99, 12, 6); R(g, OUT, 80, 98, 14, 8); R(g, '#6a4226', 81, 99, 12, 6);   // casse accanto alla torre
}
export function drawCastle(g) {   // castello (6x8 = 96x128): mastio centrale con torri d'angolo, mura merlate e portone con saracinesca
  const base = 128; g.save(); g.globalAlpha = 0.26; g.fillStyle = '#0a0418'; g.beginPath(); g.moveTo(4, base); g.lineTo(96, base); g.lineTo(110, base - 8); g.lineTo(110, 40); g.lineTo(96, 46); g.fill(); g.restore();
  stoneWall(g, 24, 40, 48, 40, '#a8a296'); battlements(g, 24, 32, 48, '#a8a296'); flagAt(g, 46, 8, '#2a3a8a'); stoneWall(g, 38, 20, 20, 14, '#b8b2a4'); cone(g, 48, 4, 14, 16, '#2a3a5a');
  stoneWall(g, 6, 78, 84, 40, '#b8b2a4'); battlements(g, 6, 70, 84, '#b8b2a4');
  for (const x0 of [0, 70]) { stoneWall(g, x0, 36, 26, 82, '#a8a296'); cone(g, x0 + 13, 6, 18, 30, '#7a2a2a'); R(g, OUT, x0 + 12, -2, 2, 10); flagAt(g, x0 + 13, -4, '#c8283a'); lancet(g, x0 + 9, 50, 8, 14, '#7ab0d8'); lancet(g, x0 + 9, 76, 8, 12, '#7ab0d8'); R(g, OUT, x0 + 10, 100, 6, 10); R(g, '#14081a', x0 + 11, 101, 4, 8); }
  R(g, OUT, 32, 78, 32, 40); R(g, '#a8a296', 33, 79, 30, 8); for (let i = 0; i < 32; i++) { const t = Math.abs(i - 16) / 16; R(g, OUT, 32 + i, 86 + Math.round(t * t * 6) - 6, 1, 1); }
  R(g, OUT, 35, 86, 26, 32); R(g, '#1a1220', 36, 87, 24, 31); for (let i = 0; i < 24; i += 4) R(g, '#5a5a66', 37 + i, 87, 1, 20); R(g, '#5a5a66', 36, 97, 24, 1); R(g, '#5a5a66', 36, 105, 24, 1); R(g, '#8a8a98', 36, 87, 24, 1); R(g, OUT, 44, 76, 8, 8); R(g, '#c8283a', 45, 77, 6, 6); R(g, '#e8c040', 47, 79, 2, 2);
  for (let i = 0; i < 3; i++) { R(g, '#8a847a', 30 - i * 3, base - 10 + i * 3, 36 + i * 6, 2); R(g, '#c8c2b4', 30 - i * 3, base - 10 + i * 3, 36 + i * 6, 1); }
}
export function drawSideGate(g) {   // varco laterale (aperture ovest/est): torri di guardia da lato con feritoie e bandiera, 2x3 tile
  const w = 32, h = 56; g.save(); g.globalAlpha = 0.26; g.fillStyle = '#0a0418'; g.fillRect(w - 2, h - 6, 12, 6); g.restore();
  stoneWall(g, 2, 14, w - 4, h - 14, '#a8a296'); battlements(g, 2, 6, w - 4, '#a8a296'); flagAt(g, w / 2 - 1, -8, '#c8283a');
  R(g, OUT, w / 2 - 2, 22, 4, 10); R(g, '#14081a', w / 2 - 1, 23, 2, 8); R(g, OUT, 8, h - 20, 16, 20); R(g, '#1a1220', 9, h - 19, 14, 19); for (let i = 0; i < 14; i += 3) R(g, '#5a5a66', 10 + i, h - 19, 1, 12);
}

// ---- MURA ESTERNE DI AURELBURG: arenaria calda (si stacca dai sampietrini grigi), parete alta 32 px con merli, camminamento in alto e contrafforti ----
const WALL_C = '#c8844a', WALL_M = '#8a4a2a', WALL_TOP = '#e8c090';
export function drawWallFace(g, x, y, i = 0) {   // tile orizzontale: (x,y) = angolo alto-sinistro del tile; il disegno sale di 28 px sopra il tile
  const top = y - 38;
  R(g, 'rgba(10,4,24,.3)', x, y + 16, 16, 5);                                                             // ombra a terra
  R(g, OUT, x, top + 6, 16, 48); R(g, WALL_C, x, top + 8, 16, 46);                                             // parete
  for (let yy = top + 8; yy < y + 16; yy += 6) { R(g, WALL_M, x, yy + 5, 16, 1); const o = (((yy - top) / 6 | 0) % 2) * 5 + (i % 2) * 2; for (let xx = x + o; xx < x + 16; xx += 10) R(g, WALL_M, xx, yy, 1, 6); if (((yy + i) % 4) === 0) R(g, lite(WALL_C, 0.12), x + 2 + (i % 3) * 3, yy + 1, 5, 3); }
  R(g, lite(WALL_C, 0.25), x, top + 8, 16, 2);                                                                  // luce sul bordo
  R(g, dark(WALL_C, 0.45), x, y + 10, 16, 6); R(g, OUT, x, y + 15, 16, 1);                                       // zoccolo in ombra
  R(g, OUT, x, top, 16, 8); R(g, WALL_TOP, x, top + 1, 16, 5); R(g, lite(WALL_TOP, 0.3), x, top + 1, 16, 1); R(g, '#8a6a4a', x, top + 5, 16, 1);           // camminamento in alto
  if (i % 2 === 0) { R(g, OUT, x + 1, top - 5, 6, 7); R(g, WALL_C, x + 2, top - 4, 4, 6); R(g, WALL_TOP, x + 2, top - 4, 4, 1); R(g, WALL_M, x + 2, top, 4, 1); }   // merlo
  else { R(g, OUT, x + 9, top - 5, 6, 7); R(g, WALL_C, x + 10, top - 4, 4, 6); R(g, WALL_TOP, x + 10, top - 4, 4, 1); R(g, WALL_M, x + 10, top, 4, 1); }
}
export function drawWallTop(g, x, y, side) {   // tile verticale (lato est/ovest): si vede il camminamento dall'alto con i parapetti
  R(g, OUT, x, y, 16, 16); R(g, WALL_TOP, x + 1, y, 14, 16); R(g, '#b89870', x + 1, y + 12, 14, 4);
  R(g, OUT, side < 0 ? x : x + 12, y, 4, 16); R(g, WALL_C, side < 0 ? x + 1 : x + 12, y, 3, 16); R(g, lite(WALL_C, 0.25), side < 0 ? x + 1 : x + 12, y, 1, 16);
  for (let yy = 0; yy < 16; yy += 8) { R(g, OUT, side < 0 ? x - 2 : x + 14, y + yy, 4, 6); R(g, WALL_C, side < 0 ? x - 1 : x + 14, y + yy + 1, 3, 4); }
  R(g, WALL_M, x + 3, y + 7, 10, 1); R(g, '#d8b080', x + 4, y + 3, 8, 1);
  const fx = side < 0 ? x + 16 : x - 5; R(g, OUT, fx, y, 5, 16); R(g, dark(WALL_C, 0.35), fx + (side < 0 ? 0 : 1), y, 4, 16); for (let yy = 0; yy < 16; yy += 6) R(g, dark(WALL_C, 0.6), fx + (side < 0 ? 0 : 1), y + yy + 5, 4, 1);   // faccia interna in ombra: dà spessore
}
export function drawCornerTower(g, x, y) {   // torre d'angolo 3x3 tile (48x48) con tetto conico che sale di 48 px
  R(g, 'rgba(10,4,24,.3)', x + 4, y + 44, 48, 6);
  R(g, OUT, x + 3, y - 4, 42, 52); R(g, WALL_C, x + 4, y - 3, 40, 50); for (let yy = y - 3; yy < y + 44; yy += 6) { R(g, WALL_M, x + 4, yy + 5, 40, 1); const o = ((yy / 6 | 0) % 2) * 5; for (let xx = x + 4 + o; xx < x + 44; xx += 10) R(g, WALL_M, xx, yy, 1, 6); }
  R(g, lite(WALL_C, 0.25), x + 4, y - 3, 6, 50); R(g, dark(WALL_C, 0.35), x + 36, y - 3, 8, 50); R(g, dark(WALL_C, 0.5), x + 4, y + 36, 40, 10);
  R(g, OUT, x + 20, y + 4, 8, 14); R(g, '#14081a', x + 21, y + 5, 6, 12); R(g, OUT, x + 8, y + 22, 6, 10); R(g, '#14081a', x + 9, y + 23, 4, 8);
  cone(g, x + 24, y - 40, 26, 38, '#7a2a2a'); R(g, OUT, x + 23, y - 52, 2, 14); R(g, '#c8283a', x + 25, y - 51, 9, 5);
}
