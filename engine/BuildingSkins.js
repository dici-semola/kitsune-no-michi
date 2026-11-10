// EDIFICI MONOBLOCCO: ogni edificio è uno sprite unico (tetto con gronda sporgente, pareti, porta, finestre, zoccolo, ombra) invece di tasselli separati.
// Per ora è solo in anteprima (tests/gallery-buildings.html): non è ancora applicato al gioco finché le skin non vengono approvate una a una.
const OUT = '#2a1418';
const mix = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const lite = (c, t) => mix(c, '#ffffff', t), dark = (c, t) => mix(c, '#000000', t);
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

// Casa di Hinomura (villaggio giapponese): tetto a padiglione di tegole, gronda sporgente, pareti a intonaco con travi, shoji, base di pietra
export function drawHinomuraHouse(g, tw, th, o = {}) {
  g.save(); g.translate(0, 8);   // margine in alto: il camino sporge sopra il colmo
  const roof = o.roof || '#b5483a', wall = o.wall || '#e8dcc0', beam = o.beam || '#5a3a28', ridge = o.ridge || '#d8c8a0';
  const W = tw * 16, roofH = 24 + (tw - 4) * 3, eave = 4, wallH = 38, H = roofH + eave + wallH, wy = roofH + eave;   // altezza fissa: la parete è poco più alta del personaggio
  // ombra proiettata a terra (a est e a sud), con gradiente
  g.save(); g.globalAlpha = 0.28; g.fillStyle = '#0a0418'; g.beginPath(); g.moveTo(4, H); g.lineTo(W, H); g.lineTo(W + 14, H - 8); g.lineTo(W + 14, wy - 8); g.lineTo(W, wy); g.lineTo(W + 2, H); g.fill(); g.restore();
  // pareti
  R(g, OUT, 0, wy - 1, W, H - wy + 1); R(g, wall, 1, wy, W - 2, H - wy - 1);
  for (let x = 6; x < W - 2; x += 8) R(g, dark(wall, 0.08), x, wy + 2, 1, H - wy - 7);   // assi verticali
  R(g, beam, 1, wy, W - 2, 3); R(g, lite(beam, 0.25), 1, wy, W - 2, 1); R(g, beam, 1, H - 9, W - 2, 2);           // travi orizzontali
  for (let x = 1; x < W - 2; x += 16) R(g, beam, x, wy, 3, H - wy - 5);                                             // montanti
  R(g, beam, W - 4, wy, 3, H - wy - 5);
  // zoccolo di pietra
  R(g, OUT, 0, H - 6, W, 6); R(g, '#8a8478', 1, H - 5, W - 2, 4); for (let x = 1; x < W - 2; x += 6) R(g, '#5a564c', x, H - 5, 1, 4); R(g, '#a8a296', 1, H - 5, W - 2, 1);
  // porta scorrevole e finestre shoji
  const dx = Math.round(W / 2) - 8 + (o.doorX || 0), dh = 27, dy = H - 6 - dh;
  R(g, OUT, dx - 1, dy - 1, 18, dh + 1); R(g, beam, dx, dy, 16, dh); R(g, '#f4ecd4', dx + 1, dy + 1, 7, dh - 1); R(g, '#f4ecd4', dx + 9, dy + 1, 6, dh - 1);
  for (let y = dy + 1; y < dy + dh; y += 5) R(g, beam, dx + 1, y, 14, 1); R(g, beam, dx + 8, dy, 1, dh); R(g, beam, dx - 1, dy - 2, 18, 2);   // architrave
  const win = (x) => { const y0 = wy + 8; R(g, OUT, x - 1, y0 - 1, 14, 12); R(g, beam, x, y0, 12, 10); R(g, '#f4ecd4', x + 1, y0 + 1, 10, 8); R(g, beam, x + 5, y0 + 1, 1, 8); R(g, beam, x + 1, y0 + 5, 10, 1); R(g, 'rgba(0,0,0,.18)', x + 1, y0 + 1, 10, 2); };
  if (W >= 64) { win(8); win(W - 20); } else win(4 + (o.doorX || 0) * 0);
  // gronda e tetto a padiglione
  for (let y = 0; y < roofH + eave; y++) {
    const t = Math.min(1, y / roofH), l = Math.round(10 * (1 - t) - 3 * t), r = W - l;
    R(g, OUT, l - 1, y, r - l + 2, 1);
    const band = Math.floor(y / 4), inB = y % 4;
    for (let x = l; x < r; x++) { const sc = ((x + (band % 2) * 3) % 6); let c = roof; if (inB === 3) c = dark(roof, 0.42); else if (inB === 0) c = lite(roof, 0.12); if (sc === 0) c = dark(c, 0.25); if (y < 3) c = ridge; R(g, c, x, y, 1, 1); }
    R(g, dark(roof, 0.5), r - 3, y, 3, 1);                                                                          // falda destra in ombra
    R(g, lite(roof, 0.25), l, y, 2, 1);
  }
  R(g, OUT, 8, 0, W - 16, 1); R(g, lite(ridge, 0.3), 9, 1, W - 18, 1);
  R(g, 'rgba(10,4,24,.5)', 0, roofH + eave, W, 3); R(g, 'rgba(10,4,24,.25)', 0, roofH + eave + 3, W, 3);              // ombra della gronda sulla parete
  R(g, 'rgba(255,255,255,.12)', 1, wy, 2, H - wy - 6); R(g, 'rgba(10,4,24,.25)', W - 5, wy, 4, H - wy - 6);        // luce a ovest, ombra a est
  // comignolo (su tutte le case): canna in pietra con bordo chiaro, cappello e ombra sulla falda; la posizione cambia da casa a casa
  if (o.chimney !== false) { const cx = o.chimneyX !== undefined ? o.chimneyX : W - 28, cy = -3; R(g, 'rgba(10,4,24,.35)', cx + 10, cy + 8, 4, 12); R(g, OUT, cx - 1, cy - 2, 12, 20); R(g, '#7a7468', cx, cy, 10, 16); R(g, '#a8a296', cx, cy, 3, 16); R(g, '#5a564c', cx + 7, cy, 3, 16); R(g, OUT, cx - 2, cy - 3, 14, 3); R(g, '#8a8478', cx - 1, cy - 2, 12, 1); R(g, '#14081a', cx + 2, cy - 2, 6, 1); for (let y = cy + 3; y < cy + 15; y += 4) R(g, '#5a564c', cx, y, 10, 1); }
  g.restore();
}

// ---------------------------------------------------------------------------------------------
// NEGOZI: stessa struttura della casa, ma ognuno si riconosce a colpo d'occhio da insegna, tende, oggetti all'esterno e colori
const icon = {   // icone 9x9 dell'insegna
  anvil(g, x, y) { R(g, '#2a2a34', x + 1, y + 1, 7, 2); R(g, '#4a4a58', x + 2, y + 3, 5, 2); R(g, '#2a2a34', x + 3, y + 5, 3, 3); R(g, '#8a8a9a', x + 1, y + 1, 7, 1); R(g, '#ff7a30', x + 6, y, 2, 1); },
  leaf(g, x, y) { R(g, '#2a7a3a', x + 3, y, 3, 1); R(g, '#3aa04a', x + 2, y + 1, 5, 2); R(g, '#3aa04a', x + 1, y + 3, 7, 2); R(g, '#2a7a3a', x + 2, y + 5, 5, 1); R(g, '#1a5a28', x + 4, y + 2, 1, 6); R(g, '#c8283a', x + 6, y + 6, 2, 2); },
  cup(g, x, y) { R(g, '#f4ecd4', x + 1, y + 2, 5, 5); R(g, '#c8a050', x + 1, y + 2, 5, 1); R(g, '#f4ecd4', x + 6, y + 3, 2, 3); R(g, '#8a5a2c', x + 2, y + 7, 4, 1); R(g, '#ffffff', x + 2, y, 1, 1); R(g, '#ffffff', x + 4, y + 1, 1, 1); },
  coin(g, x, y) { R(g, '#8a6a10', x + 2, y, 5, 9); R(g, '#8a6a10', x, y + 2, 9, 5); R(g, '#f0c040', x + 2, y + 1, 5, 7); R(g, '#f0c040', x + 1, y + 2, 7, 5); R(g, '#fff0a0', x + 2, y + 2, 2, 2); R(g, '#8a6a10', x + 4, y + 3, 1, 3); },
  sword(g, x, y) { R(g, '#c8d4e8', x + 4, y, 1, 6); R(g, '#8a9ab8', x + 5, y + 1, 1, 5); R(g, '#f0c040', x + 2, y + 6, 5, 1); R(g, '#5a2a1c', x + 4, y + 7, 1, 2); R(g, '#8a2a2a', x + 1, y + 2, 3, 4); },
};
function hangingSign(g, x, y, ic, bg) {   // insegna appesa a una staffa
  R(g, OUT, x - 6, y - 2, 20, 2); R(g, OUT, x - 6, y - 2, 2, 5);
  R(g, OUT, x, y, 2, 3); R(g, OUT, x + 10, y, 2, 3); R(g, OUT, x - 2, y + 3, 16, 14); R(g, bg, x - 1, y + 4, 14, 12); R(g, lite(bg, 0.25), x - 1, y + 4, 14, 1); R(g, dark(bg, 0.3), x - 1, y + 15, 14, 1);
  icon[ic](g, x + 2, y + 6);
}
function lantern(g, x, y) { R(g, OUT, x, y - 4, 1, 4); R(g, OUT, x - 2, y, 6, 8); R(g, '#c8283a', x - 1, y + 1, 4, 6); R(g, '#ffd878', x, y + 2, 2, 4); R(g, '#f0c040', x - 1, y + 1, 4, 1); R(g, '#f0c040', x - 1, y + 6, 4, 1); }
function awning(g, x, y, w, c1, c2) {   // tenda a strisce
  for (let i = 0; i < w; i += 4) { R(g, OUT, x + i, y, 4, 12); R(g, (i / 4) % 2 ? c2 : c1, x + i, y + 1, 4, 9); R(g, dark((i / 4) % 2 ? c2 : c1, 0.25), x + i, y + 9, 4, 1); }
  R(g, OUT, x, y - 1, w, 1); R(g, OUT, x, y + 10, w, 2); R(g, 'rgba(10,4,24,.35)', x, y + 12, w, 4);
  for (let i = 0; i < w; i += 4) { R(g, OUT, x + i, y + 10, 4, 1); R(g, (i / 4) % 2 ? c2 : c1, x + i + 1, y + 10, 2, 2); }
}
function crate(g, x, y, c = '#a8742f') { R(g, OUT, x, y, 11, 10); R(g, c, x + 1, y + 1, 9, 8); R(g, dark(c, 0.3), x + 1, y + 4, 9, 1); R(g, lite(c, 0.25), x + 1, y + 1, 9, 1); R(g, dark(c, 0.4), x + 5, y + 1, 1, 8); }
function barrel(g, x, y) { R(g, OUT, x, y, 10, 12); R(g, '#8a5a2c', x + 1, y + 1, 8, 10); R(g, '#b88444', x + 2, y + 1, 2, 10); R(g, '#4a3a2a', x + 1, y + 3, 8, 1); R(g, '#4a3a2a', x + 1, y + 8, 8, 1); R(g, '#5a3a1c', x + 7, y + 1, 2, 10); }
function smoke(g, x, y) { for (let i = 0; i < 4; i++) { g.globalAlpha = 0.55 - i * 0.12; R(g, '#d8d4d8', x + i * 2 - (i % 2), y - i * 5, 4 + i, 4 + i); } g.globalAlpha = 1; }

// kind: 'fabbro' | 'speziale' | 'locanda' | 'bottega' | 'armeria'. Restituisce la larghezza in px.
export function drawShop(g, kind, o = {}) {
  const P = {
    fabbro: { tw: 5, roof: '#4a4a58', wall: '#9a9488', beam: '#3a2a22', ridge: '#7a7a88', chimney: true, chimneyX: 56 },
    speziale: { tw: 4, roof: '#3f8a4a', wall: '#f0ecd8', beam: '#4a6a3a', ridge: '#a8d098', chimney: false },
    locanda: { tw: 7, roof: '#9a4a2a', wall: '#e8d0a0', beam: '#5a3220', ridge: '#d8b878', chimney: true, chimneyX: 86 },
    bottega: { tw: 5, roof: '#c8a030', wall: '#f0e0b8', beam: '#6a4a28', ridge: '#f0d878', chimney: false },
    armeria: { tw: 5, roof: '#3a5a9a', wall: '#d8d4cc', beam: '#2a3a5a', ridge: '#b0c0e0', chimney: true, chimneyX: 12 },
  }[kind], tw = P.tw, W = tw * 16, roofH = 24 + (tw - 4) * 3, H = roofH + 4 + 38, wy = roofH + 4 + 8, base = H + 8;
  drawHinomuraHouse(g, tw, 0, { roof: P.roof, wall: P.wall, beam: P.beam, ridge: P.ridge, chimney: P.chimney, chimneyX: P.chimneyX });
  const dx = Math.round(W / 2) - 8, door = base - 6 - 27;
  if (kind === 'fabbro') {
    R(g, '#ff7a30', W - 19, wy + 9, 10, 8); R(g, '#ffd060', W - 17, wy + 11, 6, 4);                      // bagliore della forgia dalla finestra
    smoke(g, P.chimneyX + 1, 4);
    hangingSign(g, dx + 22, wy + 6, 'anvil', '#5a3a2a'); barrel(g, 6, base - 14); crate(g, 18, base - 11, '#6a5a4a');
    R(g, OUT, W - 24, base - 12, 14, 3); R(g, '#3a3a46', W - 23, base - 11, 12, 1); R(g, '#2a2a34', W - 22, base - 9, 10, 3); R(g, '#2a2a34', W - 19, base - 6, 4, 3);   // incudine all'aperto
  } else if (kind === 'speziale') {
    for (let i = 0; i < 4; i++) { R(g, '#4a6a3a', 8 + i * 6, wy + 2, 1, 5); R(g, i % 2 ? '#7aaa5a' : '#c8a050', 6 + i * 6, wy + 7, 5, 5); R(g, '#3a5a2a', 7 + i * 6, wy + 9, 3, 2); }   // mazzi di erbe appesi
    hangingSign(g, dx + 20, wy + 6, 'leaf', '#e8e0c0');
    R(g, OUT, 3, base - 12, 14, 8); R(g, '#8a5a2c', 4, base - 11, 12, 6); for (const x of [5, 9, 13]) { R(g, '#3aa04a', x, base - 16, 3, 5); R(g, x === 9 ? '#ff7aa0' : '#fff0a0', x + 1, base - 17, 2, 2); }   // fioriera
    R(g, OUT, W - 15, base - 10, 10, 8); R(g, '#e8e0d0', W - 14, base - 9, 8, 6); R(g, '#3a8a4a', W - 14, base - 9, 8, 2);
  } else if (kind === 'locanda') {
    lantern(g, dx - 8, wy + 6); lantern(g, dx + 24, wy + 6);
    R(g, OUT, dx - 1, door - 1, 18, 11); R(g, '#2a3a8a', dx, door, 16, 9); for (let x = dx + 4; x < dx + 16; x += 5) R(g, '#14081a', x, door, 1, 9); R(g, '#e8e0d0', dx + 5, door + 3, 6, 3);   // noren blu all'ingresso
    hangingSign(g, 8, wy + 4, 'cup', '#6a3a22'); hangingSign(g, W - 30, wy + 4, 'cup', '#6a3a22');
    R(g, OUT, 8, base - 10, 26, 6); R(g, '#8a5a2c', 9, base - 9, 24, 3); R(g, OUT, 10, base - 5, 3, 5); R(g, OUT, 29, base - 5, 3, 5);   // panca
    barrel(g, W - 24, base - 14); barrel(g, W - 14, base - 14);
  } else if (kind === 'bottega') {
    awning(g, 4, wy + 10, W - 8, '#c8283a', '#f4ecd4');
    hangingSign(g, W - 22, wy - 2, 'coin', '#3a2a18');
    R(g, OUT, 6, base - 17, 24, 14); R(g, '#a8742f', 7, base - 16, 22, 12); for (let i = 0; i < 6; i++) R(g, ['#e8402a', '#f0c030', '#7ac040', '#e8402a', '#f0a030', '#7ac040'][i], 8 + i * 3 + (i % 2), base - 20 + (i % 3), 3, 4);   // banco con frutta
    crate(g, W - 36, base - 12); crate(g, W - 24, base - 12, '#8a6a30'); R(g, '#e8e0d0', W - 33, base - 16, 5, 4); R(g, '#e0a030', W - 21, base - 16, 5, 4);
  } else if (kind === 'armeria') {
    hangingSign(g, dx + 20, wy + 6, 'sword', '#2a3a5a');
    R(g, OUT, 6, base - 22, 16, 18); R(g, '#6a4a2a', 7, base - 21, 14, 16); for (let i = 0; i < 3; i++) { R(g, '#c8d4e8', 9 + i * 4, base - 24, 2, 14); R(g, '#f0c040', 8 + i * 4, base - 11, 4, 1); }   // rastrelliera di spade
    R(g, OUT, W - 24, base - 18, 14, 14); R(g, '#8a2a2a', W - 23, base - 17, 12, 12); R(g, '#f0c040', W - 23, base - 17, 12, 1); R(g, '#f0c040', W - 18, base - 17, 2, 12);   // scudo esposto
  }
  return W;
}
// Uscita di una stanza: niente porta disegnata sul pavimento. Si suggerisce con la luce che entra dal bordo basso, uno zerbino e la soglia.
export function exitCue(g, cx, W, H) {
  // L'uscita è una rientranza nel muro perimetrale in basso, con l'ombra di una tile (16 px) che si proietta verso l'interno.
  const x = Math.round(cx), BW = 10;
  R(g, OUT, 0, H - BW, W, BW); R(g, '#3a3036', 0, H - BW + 1, W, BW - 2); R(g, '#5a4a50', 0, H - BW + 1, W, 1); for (let i = 0; i < W; i += 12) R(g, '#2a2228', i + 5, H - BW + 2, 1, BW - 4);   // zoccolo del muro in basso
  const lightMode = globalThis.__exitMode !== 'ombra';   // di default luce (variante B scelta dall'utente)
  for (let i = 0; i < 16; i++) { g.globalAlpha = (lightMode ? 0.42 : 0.5) * (1 - i / 16); const w = 30 + i * 1; R(g, lightMode ? '#fff0b0' : '#0a0418', x - Math.round(w / 2), H - BW - i - 1, w, 1); } g.globalAlpha = 1;   // ombra (o luce) di una tile verso l'interno
  R(g, OUT, x - 14, H - BW - 1, 28, BW + 1); R(g, '#16101a', x - 12, H - BW + 1, 24, BW - 1); R(g, '#fff2c0', x - 8, H - 3, 16, 1); R(g, '#e8d8a0', x - 6, H - 4, 12, 1);   // rientranza con la luce dell'esterno
  R(g, '#5a4a50', x - 14, H - BW - 1, 2, BW + 1); R(g, '#5a4a50', x + 12, H - BW - 1, 2, BW + 1);                                                                    // stipiti
}
export { R, lite, dark, mix, OUT };
