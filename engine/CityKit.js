// KIT PARAMETRICO PER LE CITTÀ RESTANTI (anteprima): Augusta, Sahar, Portomarea, Kuru, Zeroquartier, Coralia, Khaz-Dum, Nethermere.
// Ogni città ha il suo stile (materiali, tetti, porte, finestre, extra) e riusa le stesse regole di proporzione e di non sovrapposizione.
import { R, lite, dark, mix, OUT } from './BuildingSkins.js';
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
export const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const hw = Math.round(Math.sqrt(r * r - y * y)); R(g, c, cx - hw, cy + y, hw * 2 + 1, 1); } };
export const hdisc = (g, cx, cy, r, c) => { for (let y = -r; y <= 0; y++) { const hw = Math.round(Math.sqrt(r * r - y * y)); R(g, c, cx - hw, cy + y, hw * 2 + 1, 1); } };
export const CITIES = ['augusta', 'sahar', 'portomarea', 'kuru', 'zeroquartier', 'coralia', 'khaz_dum', 'nethermere'];
export const STY = {
  augusta: { name: 'Augusta Imperialis', title: 'città imperiale romana', wall: { k: 'marble', c: '#ece6d6', a: '#c8bca0' }, roof: { k: 'hip', p: 'tile', c: '#c0583a', trim: '#e8d8b0' }, door: { k: 'arch', c: '#a87a3a' }, win: 'arch', extra: 'columns', lamp: '#e8c860', glow: '255,200,120', ground: '#8aa860', accent: '#a82a2a', paving: ['marble', 'travertine', 'mosaic', 'cobble', 'brick', 'moss'] },
  sahar: { name: 'Sahar', title: 'città del deserto', wall: { k: 'adobe', c: '#d8b078', a: '#b08850' }, roof: { k: 'flat', p: 'none', c: '#c89a60', trim: '#e8d0a0' }, door: { k: 'arch', c: '#2a5a8a' }, win: 'lattice', extra: 'dome', lamp: '#f0b040', glow: '255,180,90', ground: '#e0c890', accent: '#c8503a', paving: ['sand', 'sandstone', 'tiles', 'cobble', 'brick', 'dune'] },
  portomarea: { name: 'Porto Marea', title: 'città portuale', wall: { k: 'planks', c: '#e8e4d8', a: '#2a5a9a' }, roof: { k: 'gable', p: 'slate', c: '#3a5a7a', trim: '#c8d8e8' }, door: { k: 'rect', c: '#2a4a7a' }, win: 'shutters', extra: 'rope', lamp: '#ffd878', glow: '255,220,140', ground: '#8a8a94', accent: '#c03030', paving: ['cobble', 'planks', 'slab', 'brick', 'wet', 'shell'] },
  kuru: { name: 'Kuru', title: 'villaggio tribale', wall: { k: 'logs', c: '#8a5a2a', a: '#c8a84a' }, roof: { k: 'cone', p: 'straw', c: '#c8a84a', trim: '#8a6a2a' }, door: { k: 'curtain', c: '#c8503a' }, win: 'none', extra: 'skulls', lamp: '#ff9a40', glow: '255,150,60', ground: '#5aa048', accent: '#40b0d8', paving: ['earth', 'bark', 'sand', 'moss', 'leaves', 'ash'] },
  zeroquartier: { tall: 1, name: 'Zero-Quartier', title: 'distretto cyberpunk', wall: { k: 'metal', c: '#3a3a48', a: '#ff3fa4' }, roof: { k: 'flat', p: 'panel', c: '#2a2a38', trim: '#40e0ff' }, door: { k: 'slide', c: '#5a5a70' }, win: 'neon', extra: 'neon', lamp: '#40e0ff', glow: '64,224,255', ground: '#4a4a58', accent: '#ff3fa4', paving: ['grate', 'neon', 'concrete', 'metal', 'circuit', 'wet'] },
  coralia: { name: 'Coralia', title: 'insediamento su isola', wall: { k: 'bamboo', c: '#c8a860', a: '#e87a6a' }, roof: { k: 'hip', p: 'straw', c: '#d8b870', trim: '#a88840' }, door: { k: 'curtain', c: '#3aa0b0' }, win: 'round', extra: 'stilts', lamp: '#ffd878', glow: '255,220,140', ground: '#e8d8a0', accent: '#e87a6a', paving: ['planks', 'sand', 'shell', 'coral', 'bamboo', 'rope'] },
  khaz_dum: { name: 'Khaz-Dum', title: 'città nanica', wall: { k: 'stone', c: '#8a8a98', a: '#e8a030' }, roof: { k: 'flat', p: 'stone', c: '#6a6a78', trim: '#e8a030' }, door: { k: 'iron', c: '#5a4a3a' }, win: 'slit', extra: 'forge', lamp: '#ff9a30', glow: '255,140,50', ground: '#5a5a66', accent: '#e8a030', paving: ['rock', 'flagstone', 'rune', 'ember', 'brick', 'slab'] },
  nethermere: { name: 'Nethermere', title: 'città sotterranea', wall: { k: 'adobe', c: '#5a4a6a', a: '#8a7aaa' }, roof: { k: 'dome', p: 'cap', c: '#7a3a9a', trim: '#c080e0' }, door: { k: 'arch', c: '#2a1a3a' }, win: 'glow', extra: 'mushrooms', lamp: '#80ffd0', glow: '120,255,200', ground: '#3a3048', accent: '#80ffd0', paving: ['rock', 'moss', 'spore', 'slab', 'cobble', 'crystal'] },
};
export const variantK = (id, i) => { const S = STY[id]; return { up: S.tall ? [30, 58, 42, 72][i % 4] : 0, roofC: mix(S.roof.c, [S.accent, '#3a5a7a', '#6a8a4a', '#8a6a3a'][i % 4], 0.35), wallC: mix(S.wall.c, ['#ffffff', '#e8d0a0', '#c8d0e0', '#d8c8b0'][i % 4], 0.3) }; };
const MT = 20;
const roofPattern = (g, S, x, y, c, t, y0) => {   // un pixel di tetto
  const p = S.roof.p; let col = c;
  if (p === 'tile') { const q = (x + 4) % 5; col = q === 0 ? dark(c, 0.28) : q === 1 ? lite(c, 0.12) : c; if (y0 % 6 === 5) col = dark(c, 0.4); }
  else if (p === 'slate') { const q = (x + (Math.floor(y0 / 3) % 2) * 3) % 6; col = y0 % 3 === 2 ? dark(c, 0.38) : y0 % 3 === 0 ? lite(c, 0.14) : c; if (q === 0) col = dark(col, 0.22); }
  else if (p === 'straw') { col = rnd(x, y0 >> 1) < 0.5 ? lite(c, 0.18) : dark(c, 0.2); if ((x + y0) % 7 === 0) col = dark(c, 0.4); }
  else if (p === 'stone') { col = (x % 9 === 0 || y0 % 6 === 5) ? dark(c, 0.35) : rnd(x >> 3, y0 >> 3) < 0.5 ? lite(c, 0.08) : c; }
  else if (p === 'panel') { col = (x % 8 === 0 || y0 % 5 === 4) ? dark(c, 0.5) : c; }
  else if (p === 'cap') { col = rnd(x >> 1, y0 >> 1) < 0.2 ? lite(c, 0.3) : (y0 % 7 === 6 ? dark(c, 0.3) : c); }
  return col;
};
function windowK(g, S, x, y, w, h) {
  const k = S.win; if (k === 'none') return;
  if (k === 'arch') { R(g, OUT, x - 1, y - 1, w + 2, h + 2); R(g, '#2a2230', x, y, w, h); R(g, '#7ab0d8', x + 1, y + 1, w - 2, h - 2); R(g, '#c8302a', x, y + h - 2, w, 2); for (let i = 0; i < 3; i++) R(g, OUT, x + (w >> 1) - 2 + i, y - 2 + (i === 1 ? -1 : 0), 1, 1); }
  else if (k === 'lattice') { R(g, OUT, x - 1, y - 1, w + 2, h + 2); R(g, '#5a3a1a', x, y, w, h); for (let i = 0; i < w; i += 3) R(g, '#c8a060', x + i, y + 1, 1, h - 2); for (let j = 0; j < h; j += 3) R(g, '#c8a060', x + 1, y + j, w - 2, 1); R(g, '#2a5a8a', x - 1, y - 2, w + 2, 2); }
  else if (k === 'shutters') { R(g, OUT, x - 5, y - 1, w + 10, h + 2); R(g, '#2a5a9a', x - 4, y, 4, h); R(g, '#2a5a9a', x + w, y, 4, h); R(g, OUT, x, y, w, h); R(g, '#9ad0f0', x + 1, y + 1, w - 2, h - 2); R(g, '#f4ecd4', x + (w >> 1), y + 1, 1, h - 2); R(g, '#f4ecd4', x + 1, y + (h >> 1), w - 2, 1); R(g, '#8a5a34', x - 1, y + h, w + 2, 2); }
  else if (k === 'neon') { R(g, OUT, x - 1, y - 1, w + 2, h + 2); R(g, '#10101a', x, y, w, h); R(g, S.accent, x + 1, y + 1, w - 2, 1); R(g, '#40e0ff', x + 1, y + h - 2, w - 2, 1); for (let i = 3; i < w - 2; i += 4) R(g, '#ff3fa4', x + i, y + 3, 2, h - 6); R(g, 'rgba(255,63,164,.2)', x - 3, y - 3, w + 6, h + 6); }
  else if (k === 'round') { disc(g, x + (w >> 1), y + (h >> 1), (w >> 1) + 1, OUT); disc(g, x + (w >> 1), y + (h >> 1), w >> 1, '#8a5a34'); disc(g, x + (w >> 1), y + (h >> 1), (w >> 1) - 2, '#9ae0e8'); R(g, '#8a5a34', x + 1, y + (h >> 1), w - 2, 1); }
  else if (k === 'slit') { R(g, OUT, x + (w >> 1) - 2, y - 1, 5, h + 2); R(g, '#ffb040', x + (w >> 1) - 1, y, 3, h); R(g, 'rgba(255,170,60,.25)', x + (w >> 1) - 5, y - 3, 11, h + 6); }
  else if (k === 'glow') { disc(g, x + (w >> 1), y + (h >> 1), (w >> 1) + 1, OUT); disc(g, x + (w >> 1), y + (h >> 1), w >> 1, '#80ffd0'); disc(g, x + (w >> 1) - 1, y + (h >> 1) - 1, 2, '#e8fff4'); R(g, 'rgba(120,255,200,.25)', x - 4, y - 4, w + 8, h + 8); }
}
function doorK(g, S, cx, base) {
  const k = S.door.k, c = S.door.c, dh = 27, dw = 18, dy = base - 6 - dh;
  if (k === 'curtain') { R(g, OUT, cx - dw / 2 - 1, dy - 2, dw + 2, dh + 2); R(g, '#3a2210', cx - dw / 2, dy - 1, dw, dh + 1); for (let i = 0; i < dw; i += 3) R(g, i % 6 ? c : lite(c, 0.25), cx - dw / 2 + i, dy + 2, 3, dh - 3); R(g, '#e8c040', cx - dw / 2, dy + 2, dw, 2); R(g, dark(c, 0.4), cx - dw / 2, dy + dh - 4, dw, 2); R(g, OUT, cx - 1, dy + 4, 2, dh - 6); return; }
  if (k === 'slide') { R(g, OUT, cx - dw / 2 - 2, dy - 2, dw + 4, dh + 2); R(g, '#40e0ff', cx - dw / 2 - 1, dy - 1, dw + 2, 1); R(g, c, cx - dw / 2, dy, dw / 2 - 1, dh); R(g, lite(c, 0.15), cx + 1, dy, dw / 2 - 1, dh); R(g, '#10101a', cx - 1, dy, 2, dh); R(g, S.accent, cx - dw / 2 + 2, dy + 10, 3, 6); R(g, 'rgba(64,224,255,.25)', cx - 12, dy + dh, 24, 4); return; }
  if (k === 'iron') { R(g, OUT, cx - dw / 2 - 2, dy - 4, dw + 4, dh + 4); R(g, '#a8a8b8', cx - dw / 2 - 1, dy - 3, dw + 2, dh + 3); R(g, OUT, cx - dw / 2, dy - 1, dw, dh + 1); R(g, c, cx - dw / 2 + 1, dy, dw - 2, dh); for (let r = 0; r < 4; r++) { R(g, '#6a6a78', cx - dw / 2 + 1, dy + 4 + r * 6, dw - 2, 2); } for (const sx of [-6, 0, 5]) R(g, '#e8a030', cx + sx, dy + 6, 2, 2); R(g, dark(c, 0.4), cx, dy, 1, dh); R(g, 'rgba(255,140,50,.3)', cx - 8, dy + dh, 16, 4); return; }
  R(g, OUT, cx - dw / 2 - 2, dy - 6, dw + 4, dh + 6); R(g, mix(S.wall.c, '#ffffff', 0.2), cx - dw / 2 - 1, dy - 5, dw + 2, dh + 5);
  if (k === 'arch') { for (let i = 0; i < 7; i++) { const hw = Math.round((dw / 2) * Math.sqrt(1 - ((6 - i) / 7) * ((6 - i) / 7))); R(g, OUT, cx - hw - 1, dy - 7 + i, 2 * hw + 2, 1); R(g, c, cx - hw, dy - 7 + i, 2 * hw, 1); } R(g, OUT, cx - dw / 2, dy, dw, dh); R(g, c, cx - dw / 2 + 1, dy, dw - 2, dh); }
  else { R(g, OUT, cx - dw / 2, dy - 1, dw, dh + 1); R(g, c, cx - dw / 2 + 1, dy, dw - 2, dh); }
  R(g, dark(c, 0.4), cx, dy - 2, 1, dh + 2); for (let y = dy + 3; y < dy + dh - 2; y += 5) R(g, dark(c, 0.3), cx - dw / 2 + 1, y, dw - 2, 1); R(g, '#e8c040', cx + 3, dy + 14, 2, 2);
}
function wallK(g, S, W, wy, H, i0 = 0) {
  const c = S.wall.c, a = S.wall.a, k = S.wall.k, bh = H - wy - 1; R(g, OUT, 0, wy - 1, W, bh + 2); R(g, c, 1, wy, W - 2, bh);
  if (k === 'marble') { for (let y = wy + 9; y < H - 6; y += 12) R(g, a, 1, y, W - 2, 1); for (let x = 6; x < W - 6; x += 12) for (let y = wy + 2; y < H - 8; y += 12) R(g, lite(c, 0.12), x, y, 5, 1); }
  else if (k === 'adobe') { for (let i = 0; i < W * 0.6; i++) R(g, rnd(i, 3) < 0.5 ? lite(c, 0.1) : dark(c, 0.1), 2 + Math.floor(rnd(i, 4) * (W - 6)), wy + 2 + Math.floor(rnd(i, 5) * (bh - 8)), 3, 1); for (let x = 3; x < W - 6; x += 17) R(g, '#4a2a1a', x, wy + 2, 1, 2); R(g, a, 1, wy + 4, W - 2, 1); R(g, dark(c, 0.22), 1, H - 12, W - 2, 6); }
  else if (k === 'planks') { for (let x = 1; x < W - 2; x += 5) { R(g, dark(c, 0.12), x + 4, wy, 1, bh - 5); R(g, lite(c, 0.1), x, wy, 1, bh - 5); } R(g, a, 1, wy + 3, W - 2, 3); R(g, a, 1, H - 10, W - 2, 2); }
  else if (k === 'logs') { for (let y = wy; y < H - 6; y += 5) { R(g, dark(c, 0.35), 1, y + 4, W - 2, 1); R(g, lite(c, 0.18), 1, y, W - 2, 1); for (let x = 3 + (y % 10); x < W - 4; x += 10) disc(g, x, y + 2, 1, dark(c, 0.3)); } R(g, a, 1, wy + 8, W - 2, 3); for (let x = 5; x < W - 6; x += 8) { R(g, dark(a, 0.3), x, wy + 9, 3, 1); } }
  else if (k === 'metal') { for (let y = wy + 3; y < H - 6; y += 8) R(g, dark(c, 0.4), 1, y, W - 2, 1); for (let x = 8; x < W - 6; x += 16) R(g, dark(c, 0.4), x, wy, 1, bh - 5); R(g, a, 1, wy + 3, W - 2, 2); R(g, 'rgba(255,63,164,.3)', 1, wy + 5, W - 2, 3); R(g, '#40e0ff', 1, H - 12, W - 2, 1); for (let x = 12; x < W - 12; x += 24) { R(g, '#ff3fa4', x, wy + 12, 6, 1); R(g, '#40e0ff', x + 8, wy + 16, 4, 1); } }
  else if (k === 'bamboo') { for (let x = 1; x < W - 2; x += 4) { R(g, mix(c, '#8ab04a', 0.3), x, wy, 3, bh - 5); R(g, lite(c, 0.25), x, wy, 1, bh - 5); } for (let y = wy + 10; y < H - 6; y += 12) R(g, dark(c, 0.4), 1, y, W - 2, 1); R(g, a, 1, wy + 3, W - 2, 2); }
  else if (k === 'stone') { for (let y = wy; y < H - 6; y += 6) { R(g, dark(c, 0.35), 1, y + 5, W - 2, 1); for (let x = 1 + ((y - wy) / 6 % 2) * 6; x < W - 2; x += 12) R(g, dark(c, 0.35), x, y, 1, 6); } R(g, a, 1, wy + 8, W - 2, 2); for (let x = 6; x < W - 8; x += 14) { R(g, '#ffb040', x, wy + 9, 2, 1); R(g, '#ffb040', x + 2, wy + 11, 1, 2); R(g, '#ffb040', x + 4, wy + 9, 2, 1); } }
  R(g, OUT, 0, H - 6, W, 6); R(g, mix(c, '#6a6a74', 0.5), 1, H - 5, W - 2, 4); R(g, lite(c, 0.2), 1, H - 5, W - 2, 1);
}
function roofK(g, S, W, roofH, eave, o) {
  const R0 = S.roof, c = o.roofC || R0.c, kind = R0.k;
  if (kind === 'flat') { const ph = 12; R(g, OUT, -3, roofH - ph + eave - 2, W + 6, ph + 4); R(g, c, -2, roofH - ph + eave - 1, W + 4, ph + 2); for (let x = -2; x < W + 2; x++) for (let y = 0; y < ph + 2; y++) R(g, roofPattern(g, S, x, y, c, 0, y), x, roofH - ph + eave - 1 + y, 1, 1); R(g, R0.trim, -2, roofH - ph + eave - 1, W + 4, 2); R(g, dark(c, 0.5), -2, roofH + eave, W + 4, 1); for (let x = 0; x < W; x += 10) { R(g, OUT, x, roofH - ph + eave - 7, 6, 7); R(g, lite(c, 0.1), x + 1, roofH - ph + eave - 6, 4, 6); } return; }
  for (let y = 0; y < roofH + eave; y++) {
    const t = Math.min(1, y / roofH); let l;
    if (kind === 'cone') l = Math.round((W / 2 - 4) * (1 - Math.pow(t, 0.9))) - 8 * t * t; else if (kind === 'dome') l = Math.round((W / 2) * (1 - Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2))))); else if (kind === 'gable') l = Math.round(14 * (1 - t) - 1 * t); else l = Math.round(10 * (1 - t) - 4 * t * t);
    const r = W - l; R(g, OUT, l - 1, y, r - l + 2, 1); for (let x = l; x < r; x++) R(g, roofPattern(g, S, x, y, c, t, y), x, y, 1, 1);
    R(g, dark(c, 0.5), r - 3, y, 3, 1); R(g, lite(c, 0.25), l, y, 2, 1);
  }
  R(g, R0.trim, -4, roofH + eave - 1, W + 8, 2);
}
export function drawHouseK(g, id, tw, o = {}) {
  const S = STY[id], up = o.up || 0; g.save(); g.translate(0, MT - up);
  const W = tw * 16, roofH = o.roofH || (S.roof.k === 'flat' ? 16 : 30), eave = 5, wallH = 38 + up, H = roofH + eave + wallH, wy = roofH + eave, wc = o.wallC;
  const SS = wc ? { ...S, wall: { ...S.wall, c: wc } } : S;
  g.save(); g.globalAlpha = 0.26; g.fillStyle = '#0a0418'; g.beginPath(); g.moveTo(4, H); g.lineTo(W + 4, H); g.lineTo(W + 16, H - 8); g.lineTo(W + 16, wy - 6); g.lineTo(W + 4, wy); g.fill(); g.restore();
  wallK(g, SS, W, wy, H); const cx = Math.round(W / 2); doorK(g, SS, cx, H);
  const wins = tw >= 6 ? [cx - 32, cx + 32] : [cx - 26, cx + 26];
  if (up) { const xs = []; for (let x = 8; x + 12 <= W - 8; x += 20) xs.push(x); for (let y = wy + 8; y + 14 <= H - 36; y += 20) for (const x of xs) windowK(g, SS, x, y, 12, 14); for (const wx of wins) if (wx - 8 > 4 && wx + 8 < W - 4) windowK(g, SS, wx - 6, H - 36 + 4, 12, 14); }
  else for (const wx of wins) if (wx - 8 > 4 && wx + 8 < W - 4) windowK(g, SS, wx - 6, wy + 8, 12, 14);
  roofK(g, SS, W, roofH, eave, o);
  if (up) { const a = Math.round(W * 0.28), b = Math.round(W * 0.72), y0 = roofH - 12 + eave - 14; R(g, OUT, a - 1, y0 - 1, b - a + 2, 16); R(g, '#2a2a38', a, y0, b - a, 15); for (let x = a + 3; x < b - 3; x += 6) R(g, '#40e0ff', x, y0 + 4, 3, 5); R(g, SS.accent, a, y0, b - a, 1); R(g, 'rgba(255,63,164,.25)', a - 3, y0 - 3, b - a + 6, 4); }
  // extra caratteristici dello stile
  const x = SS.extra;
  if (x === 'columns') { for (const dx of [-30, -20, 20, 30]) { const px = cx + dx - 3; R(g, OUT, px - 1, wy + 2, 8, H - wy - 6); R(g, '#f4eee0', px, wy + 3, 6, H - wy - 9); R(g, '#c8bca0', px + 4, wy + 3, 2, H - wy - 9); R(g, '#ffffff', px, wy + 3, 1, H - wy - 9); R(g, OUT, px - 2, wy + 1, 10, 3); R(g, '#e8dcc0', px - 1, wy + 2, 8, 2); } R(g, OUT, cx - 36, wy - 8, 72, 8); for (let i = 0; i < 12; i++) R(g, '#e8dcc0', cx - 35 + i * 6, wy - 7, 5, 6); for (let i = 0; i < 18; i++) { R(g, OUT, cx - 18 + i, wy - 22 + Math.abs(i - 9), 1, 1); } R(g, '#e8dcc0', cx - 17, wy - 14, 34, 6); R(g, OUT, cx - 17, wy - 15, 34, 1); R(g, '#c8302a', cx - 4, wy - 12, 8, 3); }
  else if (x === 'dome') { hdisc(g, cx, roofH - 8, 11, OUT); for (let y = -11; y <= 0; y++) { const hw = Math.round(Math.sqrt(121 - y * y)); R(g, y < -6 ? '#f0ead0' : '#e0d8b8', cx - hw + 1, roofH - 8 + y, hw * 2 - 1, 1); } R(g, '#2a8aa0', cx - 10, roofH - 9, 20, 2); R(g, OUT, cx - 1, roofH - 28, 2, 9); R(g, '#e8c040', cx - 1, roofH - 28, 2, 2); for (const px of [-W / 2 + 6, W / 2 - 14]) { R(g, OUT, cx + px, roofH - 20, 8, 10); R(g, '#e0d8b8', cx + px + 1, roofH - 19, 6, 9); } R(g, '#c8503a', 2, wy - 2, W - 4, 3); for (let i = 3; i < W - 6; i += 8) R(g, ((i / 8) | 0) % 2 ? '#2a5a8a' : '#e8c040', i, wy + 1, 4, 3); }
  else if (x === 'rope') { for (let i = 0; i < W - 8; i += 6) { R(g, '#c8a860', 4 + i, wy + 1, 3, 1); R(g, '#a88840', 5 + i, wy + 2, 3, 1); } R(g, OUT, W - 12, wy + 6, 8, 12); R(g, '#8a8a98', W - 11, wy + 7, 6, 10); R(g, '#c03030', W - 9, wy + 9, 2, 2); }
  else if (x === 'neon') { R(g, SS.accent, 0, wy - 1, W, 1); R(g, '#40e0ff', 0, H - 8, W, 1); R(g, OUT, W - 14, -6, 2, 14); R(g, '#9a9aaa', W - 14, -6, 2, 14); R(g, '#ff3fa4', W - 15, -7, 4, 2); R(g, OUT, 8, -3, 14, 8); R(g, '#40e0ff', 9, -2, 12, 6); R(g, 'rgba(64,224,255,.3)', 5, -6, 20, 14); }
  else if (x === 'stilts') { for (const px of [6, W / 2 - 3, W - 12]) { R(g, OUT, px, H, 6, 14); R(g, '#8a6a3a', px + 1, H, 4, 14); } R(g, 'rgba(60,150,200,.5)', 0, H + 6, W, 8); R(g, 'rgba(255,255,255,.35)', 4, H + 8, 10, 1); R(g, 'rgba(255,255,255,.35)', W - 20, H + 10, 10, 1); for (let i = 0; i < 4; i++) disc(g, 10 + i * (W / 4), wy + 6, 2, '#f0a0a0'); }
  else if (x === 'skulls') { for (const dx of [-12, 0, 12]) { disc(g, cx + dx, wy + 2, 3, OUT); disc(g, cx + dx, wy + 2, 2, '#f4ecd4'); R(g, OUT, cx + dx - 1, wy + 2, 1, 1); R(g, OUT, cx + dx + 1, wy + 2, 1, 1); } for (const dx of [-W / 2 + 6, W / 2 - 10]) { R(g, OUT, cx + dx, wy + 6, 4, 22); R(g, '#8a5a2a', cx + dx + 1, wy + 7, 2, 20); R(g, '#40b0d8', cx + dx - 2, wy + 10, 8, 3); R(g, '#e8c040', cx + dx - 2, wy + 15, 8, 2); } }
  else if (x === 'forge') { R(g, OUT, W - 24, -8, 12, 22); R(g, '#6a6a78', W - 23, -7, 10, 20); R(g, '#9a9aa8', W - 23, -7, 10, 2); for (let i = 0; i < 4; i++) { g.globalAlpha = 0.55 - i * 0.12; R(g, '#d8d4d8', W - 22 + i * 2, -14 - i * 5, 5 + i, 5 + i); } g.globalAlpha = 1; R(g, 'rgba(255,140,50,.18)', cx - 18, wy + 18, 36, 20); }
  else if (x === 'mushrooms') { for (const [mx, my, r, cc] of [[10, 12, 8, '#c060e0'], [W - 18, 10, 6, '#60e0c0'], [W / 2 + 8, 6, 5, '#e060a0']]) { R(g, OUT, mx - 1, my + r - 1, 4, 12); R(g, '#e8e0f0', mx, my + r, 2, 10); disc(g, mx + 1, my, r + 1, OUT); disc(g, mx + 1, my, r, cc); R(g, '#ffffff', mx - 2, my - 3, 2, 2); R(g, 'rgba(160,255,230,.18)', mx - r - 3, my - r - 3, 2 * r + 8, 2 * r + 8); } }
  g.restore();
}
// ---- locali e edifici pubblici: stessa casa con insegna, oggetti e un elemento che identifica il ruolo ----
const sign = (g, S, x, y, ic) => { R(g, OUT, x - 8, y - 2, 18, 2); R(g, '#5a4a3a', x - 7, y - 1, 16, 1); R(g, OUT, x - 1, y, 2, 3); R(g, OUT, x - 5, y + 3, 16, 14); R(g, S.accent, x - 4, y + 4, 14, 12); R(g, lite(S.accent, 0.3), x - 4, y + 4, 14, 1); ic(g, x - 1, y + 6); };
const icon = { cup(g, x, y) { R(g, '#f4ecd4', x + 1, y + 1, 5, 5); R(g, '#f4ecd4', x + 6, y + 2, 2, 3); R(g, '#8a5a2c', x + 1, y + 6, 5, 1); }, coin(g, x, y) { R(g, '#8a6a10', x + 2, y, 4, 8); R(g, '#8a6a10', x, y + 2, 8, 4); R(g, '#f0c040', x + 2, y + 1, 4, 6); R(g, '#f0c040', x + 1, y + 2, 6, 4); }, flag(g, x, y) { R(g, '#3a2a1a', x + 1, y, 1, 9); R(g, '#f4ecd4', x + 2, y, 6, 5); R(g, '#c8302a', x + 2, y + 2, 6, 1); } };
const barrel = (g, x, y, c = '#8a5a2c') => { R(g, OUT, x, y, 10, 12); R(g, c, x + 1, y + 1, 8, 10); R(g, lite(c, 0.25), x + 2, y + 1, 2, 10); R(g, '#4a3a2a', x + 1, y + 3, 8, 1); R(g, '#4a3a2a', x + 1, y + 8, 8, 1); };
const crate = (g, x, y, c = '#a8742f') => { R(g, OUT, x, y, 11, 10); R(g, c, x + 1, y + 1, 9, 8); R(g, dark(c, 0.3), x + 1, y + 4, 9, 1); R(g, dark(c, 0.4), x + 5, y + 1, 1, 8); };
const jar = (g, x, y, c) => { R(g, OUT, x, y + 3, 10, 12); R(g, c, x + 1, y + 4, 8, 10); R(g, lite(c, 0.3), x + 2, y + 4, 2, 10); R(g, OUT, x + 2, y, 6, 4); R(g, '#e8c040', x + 3, y + 1, 4, 2); };
const table = (g, S, x, y) => { R(g, 'rgba(10,4,24,.28)', x, y + 11, 22, 3); R(g, OUT, x + 2, y + 6, 3, 8); R(g, OUT, x + 17, y + 6, 3, 8); R(g, OUT, x, y + 2, 22, 7); R(g, dark(S.wall.a, 0.2), x + 1, y + 3, 20, 5); R(g, lite(S.wall.a, 0.3), x + 1, y + 3, 20, 1); R(g, '#f4ecd4', x + 4, y, 4, 3); R(g, S.accent, x + 12, y, 5, 3); };
const banner = (g, S, x, y) => { R(g, OUT, x, y, 12, 30); R(g, S.accent, x + 1, y + 1, 10, 28); R(g, '#e8c040', x + 1, y + 1, 10, 2); disc(g, x + 6, y + 14, 3, '#f4ecd4'); R(g, S.accent, x + 5, y + 13, 2, 2); };
const lampK = (g, S, x, y) => { R(g, OUT, x + 3, y - 6, 1, 6); disc(g, x + 4, y + 5, 5, OUT); disc(g, x + 4, y + 5, 4, S.lamp); R(g, '#fff8e0', x + 2, y + 3, 2, 3); R(g, `rgba(${S.glow},.14)`, x - 8, y - 4, 26, 26); };
const SHIFT = { augusta: 0, sahar: 34, portomarea: 24, kuru: 14, zeroquartier: 8, coralia: 14, khaz_dum: 24, nethermere: 36 };
export function drawShopK(g, id, kind, twOv) {
  const S = STY[id], tw = twOv || (kind === 'hall' ? 11 : 8), W = tw * 16, roofH = S.roof.k === 'flat' ? 16 : 30, H = roofH + 5 + 38, wy = roofH + 5 + MT, base = H + MT, cx = Math.round(W / 2);
  const palette = { locanda: 0, bottega: 1, hall: 2 }[kind] || 0;
  const up = S.tall ? { locanda: 52, bottega: 40, hall: 100 }[kind] || 0 : 0;
  drawHouseK(g, id, tw, { up, roofC: kind === 'hall' ? lite(S.roof.c, 0.12) : palette === 1 ? mix(S.roof.c, S.accent, 0.35) : undefined });
  if (kind === 'locanda') { sign(g, S, W + 10, wy - 4, icon.cup); table(g, S, 4, base - 16); table(g, S, W - 26, base - 16); lampK(g, S, cx - 20, wy + 8); lampK(g, S, cx + 12, wy + 8); }
  else if (kind === 'bottega') { sign(g, S, W + 10, wy - 4, icon.coin); crate(g, 4, base - 14); jar(g, 16, base - 18, S.accent); jar(g, W - 26, base - 18, S.wall.a); crate(g, W - 15, base - 14, '#8a6a30'); lampK(g, S, cx - 14, wy + 6); }
  else if (kind === 'hall') { banner(g, S, 20, wy + 6); banner(g, S, W - 32, wy + 6); for (let i = 0; i < 3; i++) { R(g, '#8a8478', cx - 14 - i * 3, base - 4 + i * 2, 28 + i * 6, 2); R(g, '#c0baa8', cx - 14 - i * 3, base - 4 + i * 2, 28 + i * 6, 1); } lampK(g, S, cx - 40, wy + 10); lampK(g, S, cx + 32, wy + 10);
    g.save(); g.translate(0, SHIFT[id] + (id === 'zeroquartier' ? MT - up : 0));
    if (id === 'augusta') { for (const dx of [-W / 2 + 8, W / 2 - 22]) { R(g, OUT, cx + dx, base - 26, 14, 22); R(g, '#ece6d6', cx + dx + 1, base - 25, 12, 20); disc(g, cx + dx + 7, base - 30, 5, OUT); disc(g, cx + dx + 7, base - 30, 4, '#ece6d6'); } }
    if (id === 'sahar') { hdisc(g, cx, -4, 16, OUT); for (let y = -16; y <= 0; y++) { const hw = Math.round(Math.sqrt(256 - y * y)); R(g, '#f0ead0', cx - hw + 1, -4 + y, hw * 2 - 1, 1); } R(g, '#2a8aa0', cx - 15, -5, 30, 3); R(g, OUT, cx - 1, -28, 2, 10); R(g, '#e8c040', cx - 1, -28, 2, 3); }
    if (id === 'portomarea') { R(g, OUT, cx - 9, -12, 18, 24); R(g, '#e8e4d8', cx - 8, -11, 16, 22); disc(g, cx, -2, 6, OUT); disc(g, cx, -2, 5, '#f4ecd4'); R(g, '#2a2a34', cx, -6, 1, 5); R(g, '#2a2a34', cx, -2, 4, 1); R(g, OUT, cx - 1, -22, 2, 12); R(g, '#c03030', cx + 1, -21, 9, 5); }
    if (id === 'kuru') { for (const dx of [-24, 18]) { R(g, OUT, cx + dx, -6, 3, 20); R(g, '#8a5a2a', cx + dx + 1, -5, 1, 18); R(g, '#f4ecd4', cx + dx - 3, -10, 9, 5); R(g, OUT, cx + dx - 4, -11, 11, 1); } }
    if (id === 'zeroquartier') { R(g, OUT, cx - 14, -22, 28, 20); R(g, '#10101a', cx - 13, -21, 26, 18); for (let i = 0; i < 5; i++) { R(g, ['#ff3fa4', '#40e0ff', '#ffe040', '#40ff90', '#ff3fa4'][i], cx - 11 + i * 5, -19 + (i % 2) * 4, 3, 10 - (i % 2) * 4); } R(g, 'rgba(64,224,255,.25)', cx - 20, -28, 40, 32); }
    if (id === 'coralia') { for (const dx of [-W / 2 + 4, W / 2 - 14]) { R(g, OUT, cx + dx, 2, 10, 14); R(g, '#f0a0a0', cx + dx + 1, 3, 8, 12); R(g, '#e87a6a', cx + dx + 3, 6, 4, 6); } }
    if (id === 'khaz_dum') { R(g, OUT, cx - 20, -10, 40, 14); R(g, '#6a6a78', cx - 19, -9, 38, 12); for (let i = 0; i < 38; i += 6) R(g, '#e8a030', cx - 18 + i, -7, 3, 8); R(g, 'rgba(255,140,50,.2)', cx - 28, -16, 56, 30); }
    if (id === 'nethermere') { hdisc(g, cx, -8, 22, OUT); for (let y = -22; y <= 0; y++) { const hw = Math.round(Math.sqrt(484 - y * y)); R(g, rnd(y, 3) < 0.2 ? '#d090f0' : '#8a40aa', cx - hw + 1, -8 + y, hw * 2 - 1, 1); } for (const [dx, dy] of [[-10, -12], [4, -16], [12, -8]]) disc(g, cx + dx, dy, 2, '#f0d8ff'); R(g, 'rgba(160,255,230,.15)', cx - 30, -34, 60, 40); }
    g.restore();
  }
}
