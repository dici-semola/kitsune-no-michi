// SKIN DEI LIVELLI IN ALTEZZA (anteprima): un "piano" intero per ogni ambiente, non più un tile alla volta.
// Un piano è: superficie (pavimentazione dell'altopiano con bordo smussato e orlo), parete di altezza a 2 file (materiale, luce dall'alto-sinistra, orlo sporgente con ombra,
// base in ombra), fianchi con spessore e ombra portata sul livello inferiore, e un collegamento al piano di sotto (scala, rampa o sentiero).
// Tutto è fatto a pezzi da 16x16 che si ripetono in modo continuo (il disegno dipende dalle coordinate di mondo), così si può applicare alla mappa a livelli (m.lvl).
import { R, lite, dark, mix, OUT } from './BuildingSkins.js';
const rnd = (a, b = 0, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const sh = (c, k) => (k >= 0 ? lite(c, Math.min(0.9, k)) : dark(c, Math.min(0.9, -k)));
const S = 16;

// ---------------- specifiche per ambiente ----------------
// top: [base, luce, ombra] e tipo di superficie; face: [medio, luce, ombra] e tipo di parete; lip: orlo sull'altopiano; steps: tipo di scala e colori
export const SPECS = {
  meadow: { n: 'Prateria', top: { c: ['#5aa84a', '#7ac860', '#3f8232'], k: 'grass' }, face: { c: ['#a2724a', '#c8905e', '#5e3e28'], k: 'strata' }, lip: { k: 'grass', c: '#6ac452' }, steps: { k: 'wood', c: ['#b88a50', '#d8aa70', '#6a4226'] } },
  forest: { n: 'Foresta', top: { c: ['#3f8a3a', '#5aa84a', '#2a6a2e'], k: 'leaf' }, face: { c: ['#7a5a3a', '#a07a4a', '#3e2a1a'], k: 'roots' }, lip: { k: 'leaf', c: '#4a9a3e' }, steps: { k: 'wood', c: ['#a8743c', '#c8945a', '#5a3a1c'] } },
  swamp: { n: 'Palude', top: { c: ['#6a7a42', '#8a9a52', '#46562c'], k: 'mud' }, face: { c: ['#6a5a3a', '#8a7a4c', '#3a3020'], k: 'mud' }, lip: { k: 'moss', c: '#7a9a3a' }, steps: { k: 'wood', c: ['#7a6a40', '#9a8a58', '#3e3220'] } },
  desert: { n: 'Deserto', top: { c: ['#e2c77e', '#f0dc9c', '#caab60'], k: 'sand' }, face: { c: ['#d8a860', '#f0c880', '#8a6030'], k: 'layers' }, lip: { k: 'sand', c: '#eed793' }, steps: { k: 'ramp', c: ['#e8c880', '#f6dc9c', '#b08840'] } },
  dunes: { n: 'Dune', top: { c: ['#ecd08c', '#f8e4a8', '#d4b46c'], k: 'dune' }, face: { c: ['#e0b878', '#f4d498', '#a88048'], k: 'layers' }, lip: { k: 'sand', c: '#f8e4a8' }, steps: { k: 'ramp', c: ['#ecd08c', '#faeab4', '#b89050'] } },
  canyon: { n: 'Canyon', top: { c: ['#c8744a', '#e09060', '#8a4a2a'], k: 'clay' }, face: { c: ['#b8603a', '#e08a5a', '#6a2e1a'], k: 'layers' }, lip: { k: 'clay', c: '#d88458' }, steps: { k: 'stone', c: ['#c8805a', '#e8a078', '#7a3e24'] } },
  badlands: { n: 'Terre aride', top: { c: ['#b89868', '#d0b080', '#8a7048'], k: 'crack' }, face: { c: ['#c09068', '#e8d0a0', '#6a4a30'], k: 'layers' }, lip: { k: 'clay', c: '#d0b080' }, steps: { k: 'stone', c: ['#b89868', '#d8b888', '#6a5030'] } },
  snow: { n: 'Neve', top: { c: ['#eef4fa', '#ffffff', '#c4d6ea'], k: 'snow' }, face: { c: ['#9ab8e0', '#d4e8fc', '#4a68a0'], k: 'ice' }, lip: { k: 'snow', c: '#ffffff' }, steps: { k: 'ice', c: ['#b8d4f0', '#e8f4ff', '#6a88b8'] } },
  tundra: { n: 'Tundra', top: { c: ['#c8d6c8', '#e2ece2', '#9aae9a'], k: 'frost' }, face: { c: ['#8a98a8', '#b8c6d6', '#48566a'], k: 'blocks' }, lip: { k: 'snow', c: '#eef4f8' }, steps: { k: 'stone', c: ['#9aa8b8', '#c8d4e0', '#566274'] } },
  mountain: { n: 'Montagna', top: { c: ['#8f919b', '#a8abb6', '#6c6e7a'], k: 'rock' }, face: { c: ['#7c7e8a', '#a4a7b4', '#3e404c'], k: 'blocks' }, lip: { k: 'rock', c: '#a4a7b4' }, steps: { k: 'stone', c: ['#8a8c98', '#b0b3c0', '#4a4c58'] } },
  plateau: { n: 'Altopiano', top: { c: ['#a8a470', '#c4c088', '#807c50'], k: 'dry' }, face: { c: ['#b0a078', '#d4c498', '#6a5c3c'], k: 'strata' }, lip: { k: 'dry', c: '#b8b47c' }, steps: { k: 'stone', c: ['#b0a078', '#d4c498', '#6a5c3c'] } },
  volcano: { n: 'Vulcano', top: { c: ['#4a3c3e', '#6a5656', '#2a2022'], k: 'ash' }, face: { c: ['#3a3236', '#5a4e54', '#1c1618'], k: 'basalt' }, lip: { k: 'ash', c: '#5a4a4a' }, steps: { k: 'basalt', c: ['#4a4046', '#6a5e66', '#221c20'] } },
  jade: { n: 'Giada', top: { c: ['#4aa070', '#6ac090', '#2a7050'], k: 'leaf' }, face: { c: ['#5a8a6a', '#82b494', '#2e5040'], k: 'moss' }, lip: { k: 'leaf', c: '#58b078' }, steps: { k: 'stone', c: ['#7aa88a', '#a4cdb0', '#3a6048'] } },
  tropical: { n: 'Tropici', top: { c: ['#52b44e', '#74d466', '#368a38'], k: 'grass' }, face: { c: ['#9a7a52', '#c0a070', '#52402a'], k: 'moss' }, lip: { k: 'leaf', c: '#62c458' }, steps: { k: 'wood', c: ['#c8a868', '#e8c888', '#7a5a2a'] } },
  enchanted: { n: 'Bosco incantato', top: { c: ['#5aa0a8', '#80c8c8', '#3a7888'], k: 'magic' }, face: { c: ['#6a5a9a', '#a090d8', '#342a5a'], k: 'crystal' }, lip: { k: 'magic', c: '#8adcd0' }, steps: { k: 'glow', c: ['#7a6ab8', '#b8a8f0', '#3a2e66'] } },
  haunted: { n: 'Terre infestate', top: { c: ['#6a6a58', '#86866e', '#44443a'], k: 'dead' }, face: { c: ['#4e4a52', '#726c78', '#242228'], k: 'bone' }, lip: { k: 'dead', c: '#7a7a62' }, steps: { k: 'stone', c: ['#5e5a62', '#827c88', '#2c2a30'] } },
  ancient: { n: 'Rovine antiche', top: { c: ['#d4ccb8', '#ece6d6', '#a49c88'], k: 'marble' }, face: { c: ['#cfc7b2', '#f0eadc', '#7e7662'], k: 'ashlar' }, lip: { k: 'marble', c: '#f0eadc' }, steps: { k: 'marble', c: ['#dcd4c0', '#f6f0e2', '#8a826e'] } },
  ocean: { n: 'Scogliera sul mare', top: { c: ['#8f8a80', '#aaa59a', '#68645c'], k: 'rock' }, face: { c: ['#6e6a66', '#948f8a', '#34322e'], k: 'blocks' }, lip: { k: 'rock', c: '#aaa59a' }, steps: { k: 'stone', c: ['#8a8680', '#b0aba4', '#48443e'] }, wet: 1 },
};
export const ORDER = Object.keys(SPECS);

// ---------------- superficie dell'altopiano ----------------
export function topColor(sp, X, Y) {
  const [b, l, d] = sp.top.c, r = rnd(X, Y, 1), r2 = rnd(X >> 1, Y >> 1, 2); let c = b;
  switch (sp.top.k) {
    case 'grass': c = r < 0.22 ? l : r < 0.3 ? d : b; if (r2 < 0.06 && X % 3 === 0) c = sh(l, 0.12); break;
    case 'leaf': c = r < 0.2 ? d : r < 0.3 ? l : b; if (r2 < 0.08) c = mix(b, '#a8743c', 0.45); break;
    case 'mud': c = r < 0.25 ? d : r < 0.33 ? l : b; if ((X * 3 + Y * 5) % 23 < 2) c = '#3a4a50'; break;
    case 'sand': c = ((X + Y * 2) % 9 < 1 ? l : (X * 2 - Y) % 11 < 1 ? d : r < 0.1 ? l : b); break;
    case 'dune': c = (Math.sin(X * 0.4 + Y * 0.16) > 0.6 ? l : Math.sin(X * 0.4 + Y * 0.16) < -0.7 ? d : b); break;
    case 'clay': c = r < 0.15 ? d : (Y % 7 === 0 && r2 < 0.5 ? l : b); break;
    case 'crack': c = ((X + Math.floor(rnd(X >> 3, Y >> 3) * 4)) % 11 === 0 || (Y + Math.floor(rnd(Y >> 3, X >> 3) * 4)) % 9 === 0) ? d : (r < 0.15 ? l : b); break;
    case 'snow': c = r < 0.1 ? d : r < 0.3 ? l : b; if ((X * 5 + Y * 3) % 31 === 0) c = '#ffffff'; break;
    case 'frost': c = r < 0.2 ? l : r < 0.3 ? d : b; if (r2 < 0.1) c = mix(b, '#ffffff', 0.5); break;
    case 'rock': c = ((X >> 3) + (Y >> 3)) % 2 ? (r < 0.3 ? d : b) : (r < 0.3 ? l : mix(b, l, 0.4)); if (X % 8 === 0 || Y % 8 === 0) c = sh(d, 0.05); break;
    case 'dry': c = r < 0.2 ? d : r < 0.3 ? l : b; if (r2 < 0.05) c = '#6a8a3a'; break;
    case 'ash': c = r < 0.2 ? d : r < 0.27 ? l : b; if ((X * 7 + Y * 3) % 41 === 0) c = '#c8501a'; break;
    case 'magic': c = r < 0.18 ? l : r < 0.28 ? d : b; if (rnd(X >> 2, Y >> 2, 4) < 0.05 && (X + Y) % 2 === 0) c = '#e8d8ff'; break;
    case 'dead': c = r < 0.25 ? d : r < 0.33 ? l : b; break;
    case 'marble': c = ((X >> 4) + (Y >> 4)) % 2 ? mix(b, l, 0.5) : b; if (X % 16 === 0 || Y % 16 === 0) c = d; else if ((X + Y * 3) % 29 === 0) c = sh(b, -0.12); break;
    default: c = b;
  }
  return c;
}

// ---------------- parete (faccia sud) ----------------
// X = x di mondo in pixel, Y = y in pixel dall'orlo superiore della parete, H = altezza totale della parete
export function faceColor(sp, X, Y, H) {
  const [m, l, d] = sp.face.c, r = rnd(X, Y, 3); let c = m;
  switch (sp.face.k) {
    case 'strata': { const yy = Y + Math.round(Math.sin(X * 0.3 + Math.floor(Y / 6) * 1.9) * 1.3), b = Math.floor(yy / 6), v = rnd(b, 7); c = v < 0.34 ? m : v < 0.67 ? sh(m, 0.1) : sh(m, -0.1); if (yy % 6 === 5) c = sh(d, 0.12); else if (yy % 6 === 0) c = sh(l, 0.1); if (rnd(X >> 3, b, 9) < 0.3 && X % 8 === 3) c = sh(d, 0.2); break; }
    case 'layers': { const yy = Y + Math.round(Math.sin(X * 0.22 + Y * 0.05) * 2), b = Math.floor(yy / 5), v = rnd(b, 11); c = v < 0.3 ? m : v < 0.6 ? l : v < 0.8 ? mix(m, d, 0.4) : sh(m, 0.06); if (yy % 5 === 4) c = sh(d, 0.15); if (rnd(X >> 2, b, 13) < 0.1) c = sh(c, 0.1); break; }
    case 'blocks': { const row = Math.floor(Y / 8), off = (row % 2) * 6, bx = Math.floor((X + off) / 12), lx = (X + off) % 12, ly = Y % 8, v = rnd(bx, row, 5); c = v < 0.5 ? m : v < 0.8 ? sh(m, 0.08) : sh(m, -0.08); if (ly === 7 || lx === 11) c = sh(d, 0.1); else if (ly === 0) c = sh(l, 0.06); else if (lx === 0) c = sh(l, -0.05); if (r < 0.08) c = sh(c, -0.1); break; }
    case 'ashlar': { const row = Math.floor(Y / 8), off = (row % 2) * 8, bx = Math.floor((X + off) / 16), lx = (X + off) % 16, ly = Y % 8; c = rnd(bx, row, 5) < 0.5 ? m : sh(m, 0.05); if (ly === 7 || lx === 15) c = sh(d, 0.1); else if (ly === 0) c = l; if ((X * 5 + Y * 11) % 37 === 0) c = sh(d, 0.25); if (row === 0 && ly < 3) c = ly === 1 ? '#e8c860' : c; break; }
    case 'basalt': { const col = Math.floor(X / 6), lx = X % 6, cb = rnd(col, 3), len = 10 + cb * 12; c = lx === 0 ? sh(l, -0.05) : lx === 5 ? d : m; if (lx === 1) c = sh(m, 0.1); if (Y > len + (col % 3) * 3) c = sh(d, -0.1); if (rnd(col, Math.floor(Y / 6), 8) < 0.04 && lx > 0 && lx < 5) c = '#d8601c'; if (Y % 9 === 8 && lx > 0) c = sh(c, -0.12); break; }
    case 'ice': { const row = Math.floor(Y / 8), off = (row % 2) * 5, bx = Math.floor((X + off) / 10), lx = (X + off) % 10, ly = Y % 8; c = rnd(bx, row, 6) < 0.5 ? m : sh(m, 0.1); if (ly === 7 || lx === 9) c = sh(d, 0.05); else if (ly === 0 || lx === 0) c = sh(l, 0.1); if ((lx + ly) % 7 === 0 && ly > 0 && lx > 0) c = sh(l, 0.15); break; }
    case 'roots': { c = r < 0.2 ? sh(m, -0.1) : r < 0.32 ? sh(m, 0.08) : m; const rx = Math.floor(X / 5), rl = rnd(rx, 3), wob = Math.round(Math.sin(Y * 0.5 + rx * 2) * 1); if ((X + wob) % 5 === 2 && Y > 3 && Y < 5 + rl * (H - 8)) c = X % 10 < 5 ? '#5a3a20' : '#6a4a2a'; if ((X + wob) % 5 === 1 && Y > 3 && Y < 5 + rl * (H - 8)) c = sh(c, 0.12); if (Y % 7 === 6) c = sh(d, 0.2); break; }
    case 'mud': { const yy = Y + Math.round(Math.sin(X * 0.4) * 1.4); c = r < 0.25 ? sh(m, -0.1) : m; if (yy % 7 === 6) c = sh(d, 0.15); const dx = Math.floor(X / 6); if (rnd(dx, 4) < 0.35 && X % 6 === 2 && Y > 6 && Y < 10 + rnd(dx, 5) * 12) c = sh(l, 0.05); break; }
    case 'moss': { c = r < 0.2 ? sh(m, -0.08) : r < 0.3 ? sh(m, 0.08) : m; const row = Math.floor(Y / 9), off = (row % 2) * 6, lx = (X + off) % 12, ly = Y % 9; if (ly === 8 || lx === 11) c = sh(d, 0.1); if (rnd(Math.floor(X / 3), row, 12) < 0.3 && ly < 4) c = '#58a050'; if (rnd(X >> 2, Y >> 2, 14) < 0.1) c = '#7ac060'; break; }
    case 'crystal': { const d1 = (X + Y) % 9, d2 = (X - Y + 90) % 11; c = d1 < 3 ? sh(m, 0.1) : d1 < 5 ? m : sh(m, -0.1); if (d2 === 0) c = sh(l, 0.1); if (d1 === 0 && rnd(X, Y, 15) < 0.25) c = '#f0e8ff'; break; }
    case 'bone': { c = r < 0.22 ? sh(m, -0.1) : r < 0.3 ? sh(m, 0.1) : m; const row = Math.floor(Y / 8), off = (row % 2) * 7, lx = (X + off) % 14, ly = Y % 8; if (ly === 7 || lx === 13) c = sh(d, 0.15); if (rnd(Math.floor(X / 14), row, 16) < 0.12 && ly > 1 && ly < 6 && lx > 2 && lx < 10) c = '#d8d0c0'; break; }
    default: c = m;
  }
  if (sp.wet && Y > H - 7) c = mix(c, '#2a4a6a', 0.35);
  // gradiente: più luce subito sotto l'orlo, ombra verso la base
  const t = Y / H; return sh(c, 0.12 - 0.36 * t * t - 0.06 * t);
}

// ---------------- pezzi da 16x16 ----------------
// facePiece: 16 px di parete sud, riga row (0 = sotto l'orlo) di rows righe; capL/capR: estremità (spigolo esterno)
export function facePiece(g, sp, x, y, X, row, rows, cap = 0) {
  const H = rows * S;
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const Y = row * S + j, XX = X + i; let c = faceColor(sp, XX, Y, H);
    if (cap & 1) { const e = i; if (e < 2) c = e === 0 ? OUT : sh(c, -0.3); else if (e < 4) c = sh(c, 0.1 - e * 0.02); }   // spigolo ovest
    if (cap & 2) { const e = S - 1 - i; if (e < 2) c = e === 0 ? OUT : sh(c, -0.4); else if (e < 5) c = sh(c, -0.18 + (e - 2) * 0.04); }  // spigolo est: in ombra
    R(g, c, x + i, y + j, 1, 1);
  }
  if (row === 0) {   // orlo sporgente: ciuffo/cappello del materiale d'orlo con ombra sotto
    const lc = sp.lip.c;
    for (let i = 0; i < S; i++) { const XX = X + i, len = 2 + Math.floor(rnd(XX, 1, 21) * 3), edgeL = (cap & 1) && i < 2, edgeR = (cap & 2) && i > 13; if (edgeL || edgeR) continue;
      for (let j = 0; j < len; j++) R(g, j === 0 ? lite(lc, 0.25) : j === len - 1 ? dark(lc, 0.25) : lc, x + i, y + j, 1, 1); R(g, 'rgba(10,6,16,.35)', x + i, y + len, 1, 1); R(g, 'rgba(10,6,16,.18)', x + i, y + len + 1, 1, 2); }
  }
  if (row === rows - 1) { R(g, 'rgba(8,4,16,.28)', x, y + 12, S, 2); R(g, 'rgba(8,4,16,.5)', x, y + 14, S, 2); for (let i = 0; i < S; i++) if (rnd(X + i, 2, 22) < 0.22) R(g, sh(sp.face.c[2], 0.05), x + i, y + 15 - (rnd(X + i, 3, 23) < 0.5 ? 1 : 0), 1, 1); }   // base: ombra di contatto e pietrisco
}
// sidePiece: fianco di un altopiano. dir 'W' = l'altopiano è a ovest della cella (fianco est del piano), 'E' = a est. Mostra lo spessore della parete e proietta l'ombra sul livello basso
export function sidePiece(g, sp, x, y, X, Y, dir, last = false) {
  // dir 'W': la cella sta a OVEST dell'altopiano (il fianco affacciato a ovest, illuminato, sta sul suo lato destro); dir 'E': a EST (fianco in ombra, sul lato sinistro)
  const wd = 8, x0 = dir === 'W' ? S - wd : 0;
  for (let j = 0; j < S; j++) for (let i = 0; i < wd; i++) {
    const depth = dir === 'W' ? wd - 1 - i : i;   // 0 = bordo lontano dall'altopiano
    let c = faceColor(sp, X + 3 + i * 2, Y + j + 2, 32);
    c = sh(c, dir === 'W' ? 0.1 - depth * 0.03 : -0.22 + depth * 0.02);
    R(g, depth === 0 ? OUT : c, x + x0 + i, y + j, 1, 1);
  }
  const ex = dir === 'W' ? x + x0 : x + x0 + wd;
  if (dir === 'W') { R(g, lite(sp.top.c[1], 0.1), x + S - 1, y, 1, S); } else { R(g, 'rgba(8,4,16,.28)', x + wd, y, 4, S); R(g, 'rgba(8,4,16,.14)', x + wd + 4, y, 4, S); }
  void ex;
  if (last) { R(g, 'rgba(8,4,16,.32)', x + x0, y + 11, wd, 5); }
}
export function backPiece(g, sp, x, y, X) {   // dorso: cresta dell'altopiano visto da dietro
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const t = j / S; let c = faceColor(sp, X + i, j + 5, 24); if (j < 5) c = sh(sp.top.c[1], -0.1 + j * 0.03); R(g, j === 4 ? OUT : c, x + i, y + j, 1, 1); }
  R(g, 'rgba(8,4,16,.35)', x, y + 11, S, 5);
}
// scala/rampa nella parete: rows righe, row = riga; 'k' = tipo
export function stairsPiece(g, sp, x, y, X, row, rows) {
  const [m, l, d] = sp.steps.c, k = sp.steps.k, H = rows * S, n = H / 4;
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { R(g, faceColor(sp, X + i, row * S + j, H), x + i, y + j, 1, 1); }   // si parte dalla parete
  if (k === 'ramp') {   // rampa in pendenza dolce: sabbia/terra con ombreggiatura e bordi di roccia
    for (let j = 0; j < S; j++) for (let i = 2; i < S - 2; i++) { const Y = row * S + j, t = Y / H, wave = Math.sin((i + Y * 0.6) * 0.8) > 0.8; let c = mix(l, m, t); if (wave) c = sh(c, -0.08); if (rnd(X + i, Y, 31) < 0.12) c = sh(c, 0.08); R(g, c, x + i, y + j, 1, 1); }
    R(g, OUT, x + 1, y, 1, S); R(g, OUT, x + S - 2, y, 1, S); R(g, 'rgba(8,4,16,.3)', x + 2, y, 2, S); R(g, 'rgba(255,255,255,.15)', x + S - 4, y, 1, S);
    if (row === rows - 1) R(g, 'rgba(8,4,16,.25)', x + 2, y + 13, S - 4, 3);
    return;
  }
  for (let j = 0; j < S; j++) {
    const Y = row * S + j, t = Math.floor(Y / 4), ty = Y % 4;   // 4 px per gradino: 2 di pedata luminosa, 2 di alzata in ombra
    for (let i = 2; i < S - 2; i++) {
      let c;
      if (ty < 2) { c = ty === 0 ? sh(l, 0.15) : l; if (k === 'wood') { c = ((i + (t % 2) * 4) % 8 === 0) ? sh(m, -0.2) : c; } else if (k === 'ice') { c = (i + ty * 3) % 6 === 0 ? '#ffffff' : c; } else if (k === 'glow') { c = ty === 0 ? '#e8d8ff' : sh(l, 0.1); } else { c = rnd(X + i, t, 33) < 0.15 ? sh(c, -0.08) : c; } }
      else { c = ty === 2 ? m : d; if (k === 'wood' && i % 5 === 0) c = sh(c, -0.12); if (k === 'basalt' && ty === 2 && rnd(i, t, 34) < 0.2) c = '#c8501a'; if (k === 'glow' && ty === 2) c = sh(m, 0.1); }
      R(g, c, x + i, y + j, 1, 1);
    }
    R(g, OUT, x + 1, y + j, 1, 1); R(g, OUT, x + S - 2, y + j, 1, 1);   // stringhe laterali
  }
  R(g, sh(d, -0.2), x + 2, y, 1, S); R(g, 'rgba(8,4,16,.35)', x + 2, y, 2, S);   // ombra del lato sinistro
  if (k === 'wood') { for (const px of [x + 1, x + S - 2]) { R(g, OUT, px - 1, y, 3, S); R(g, '#8a5a2c', px, y, 1, S); } if (row === 0) { R(g, OUT, x, y - 3, 3, 5); R(g, l, x + 1, y - 2, 1, 3); R(g, OUT, x + S - 3, y - 3, 3, 5); R(g, l, x + S - 2, y - 2, 1, 3); } }
  if (k === 'glow') { R(g, 'rgba(180,150,255,.18)', x, y, S, S); }
  if (row === rows - 1) { R(g, 'rgba(8,4,16,.3)', x + 2, y + 13, S - 4, 3); }
}
// superficie: bordo dell'altopiano. edges: 1 nord, 2 sud, 4 est, 8 ovest (lati sul vuoto)
export function topPiece(g, sp, x, y, X, Y, edges = 0) {
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) R(g, topColor(sp, X + i, Y + j), x + i, y + j, 1, 1);
  const hi = lite(sp.top.c[1], 0.1), lo = dark(sp.top.c[2], 0.2);
  if (edges & 1) { R(g, OUT, x, y, S, 1); R(g, hi, x, y + 1, S, 1); }
  if (edges & 8) { R(g, OUT, x, y, 1, S); R(g, hi, x + 1, y, 1, S); }
  if (edges & 4) { R(g, OUT, x + S - 1, y, 1, S); R(g, lo, x + S - 2, y, 1, S); R(g, 'rgba(8,4,16,.14)', x + S - 4, y, 2, S); }
  if (edges & 2) { R(g, lo, x, y + S - 2, S, 1); R(g, 'rgba(8,4,16,.16)', x, y + S - 4, S, 2); }
}
// terreno basso (per la composizione): stessa pelle ma più scura/umida
export function lowColor(sp, X, Y) { return dark(topColor(sp, X, Y), 0.18); }

// ---------------- composizione di un piano (anteprima) ----------------
// disegna un altopiano tw x th (superficie) con parete di rows righe, fianchi, spigoli e scale (stairs = colonne in tile dove la parete ha la scala)
export function drawTerrace(g, sp, tx, ty, tw, th, rows = 2, stairs = []) {
  const x = tx * S, y = ty * S;
  for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) topPiece(g, sp, x + i * S, y + j * S, (tx + i) * S, (ty + j) * S, (j === 0 ? 1 : 0) | (j === th - 1 ? 2 : 0) | (i === 0 ? 8 : 0) | (i === tw - 1 ? 4 : 0));
  for (let r = 0; r < rows; r++) for (let i = 0; i < tw; i++) { const px = x + i * S, py = y + (th + r) * S; if (stairs.includes(i)) stairsPiece(g, sp, px, py, (tx + i) * S, r, rows); else facePiece(g, sp, px, py, (tx + i) * S, r, rows, (i === 0 ? 1 : 0) | (i === tw - 1 ? 2 : 0)); }
  for (let j = 0; j < th + rows; j++) { sidePiece(g, sp, x - S, y + j * S, (tx - 1) * S, j * S, 'W', j === th + rows - 1); sidePiece(g, sp, x + tw * S, y + j * S, (tx + tw) * S, j * S, 'E', j === th + rows - 1); }
}
// ombra portata della parete sul livello inferiore (a sud e a est, luce da alto-sinistra)
export function castShadow(g, x, y, w, h) { R(g, 'rgba(8,4,16,.22)', x, y, w, 6); R(g, 'rgba(8,4,16,.12)', x, y + 6, w, 5); }
