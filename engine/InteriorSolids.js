// COLLISIONI E PNG DEGLI INTERNI CON SKIN (Kit delle otto città nuove, Silvaneth, Longxi).
// Ogni stanza è lo sprite disegnato da InteriorKit / InteriorSkinsElf / InteriorSkinsCN (larghezza tw*16, parete di fondo 40 px, pavimento th*16) posato nella mappa
// con 8 px di margine in alto: la mappa ha 3 file di parete (48 px) e th file di pavimento; l'ultima fila è la porta con la rientranza di uscita.
// Qui sono elencate le impronte a terra dei mobili (x, y, larghezza, altezza in pixel della skin): ogni tile coperta almeno 6 px in entrambe le direzioni diventa solida.
export const WALL_ROWS = 3;
export const SKIN_MARGIN = 8;                 // la skin è posata 8 px sotto il bordo alto della mappa
export const ROOM = { kit: { locanda: [16, 9], bottega: [16, 9], sala: [22, 10], casa: [12, 9] }, elf: { locanda: [16, 9], bottega: [16, 9], consiglio: [22, 10], casa: [12, 9] }, cn: { locanda: [16, 9], bottega: [16, 9], sala: [22, 10], casa: [12, 9] } };
export const kindOf = (fam, role) => ({ inn: 'locanda', shop: 'bottega', hall: fam === 'elf' ? 'consiglio' : 'sala', house: 'casa' })[role];
const rt = (x, y, r) => [x - r, y - 2, 2 * r, 12];                 // tavolo rotondo (impronta)
// accenti dei kit (oggetti di città lungo il bordo inferiore di locanda e bottega), posizione (x, y) e misure
const ACC = { augusta: (W, H) => [[10, 60, 12, H - 80], [W - 30, 60, 12, H - 80]], sahar: (W, H) => [[14, H - 54, 26, 12], [W - 44, H - 50, 26, 12]], portomarea: (W, H) => [[10, H - 54, 24, 24], [W - 38, H - 58, 28, 24]], kuru: (W, H) => [[12, H - 54, 22, 22], [W - 30, H - 66, 16, 34]], zeroquartier: (W, H) => [[14, H - 54, 18, 24], [W - 36, H - 60, 20, 30]], coralia: (W, H) => [[14, H - 54, 28, 14], [W - 40, H - 54, 28, 14]], khaz_dum: (W, H) => [[12, H - 54, 22, 22], [W - 36, H - 56, 22, 22]], nethermere: (W, H) => [[12, H - 56, 22, 24], [W - 34, H - 56, 22, 24]] };
export function solids(fam, kind, id) {
  const [tw, th] = ROOM[fam][kind], W = tw * 16, H = 40 + th * 16, cx = W / 2; const S = [];
  if (fam === 'kit' || fam === 'cn') {
    if (kind === 'locanda') { S.push([10, 70, 102, 22], rt(W - 66, 112, 12), rt(W - 130, 126, 12), rt(cx - 20, 146, 12)); if (fam === 'cn') { S.length = 0; S.push([10, 70, 102, 22], [W - 74, 64, 60, 16], rt(W - 66, 120, 12), rt(W - 130, 132, 12), rt(cx - 20, 150, 12)); } }
    else if (kind === 'bottega') S.push([40, 70, 178, 24], [8, 114, 34, 24], [W - 42, 114, 34, 24], [cx - 50, 130, 24, 18], [cx + 30, 130, 24, 18]);
    else if (kind === 'sala') { S.push([cx - 36, 52, 72, 16]); if (fam === 'cn') S.push([cx - 30, 56, 14, 12], [cx + 16, 56, 14, 12], [cx - 120 + 2, 92, 18, 14], [cx + 98 + 2, 92, 18, 14]); }
    else if (kind === 'casa') S.push([10, 66, 40, 28], [W - 44, 68, 34, 26], rt(cx, 112, 14));
    if (fam === 'kit' && (kind === 'locanda' || kind === 'bottega') && ACC[id]) S.push(...ACC[id](W, H));
  } else if (fam === 'elf') {
    if (kind === 'locanda') S.push([8, 76, 98, 24], [W - 46, 62, 34, 18], [W - 90, 62, 34, 18], rt(W - 64, 114, 12), rt(cx - 4, 140, 12), [cx - 18, 50, 36, 20], [10, 126, 28, 26]);
    else if (kind === 'bottega') S.push([38, 84, 180, 26], [8, 100, 18, 28], [W - 28, 100, 18, 28], [cx - 36, 124, 24, 22]);
    else if (kind === 'consiglio') { S.push([78, 62, 36, 8], [W - 114, 62, 36, 8], [cx - 30, 64, 60, 12], [cx - 11, 40, 22, 22]); for (const [bx, by] of [[cx - 110, 124], [cx + 50, 124], [cx - 110, 156], [cx + 50, 156]]) for (const o of [0, 30]) S.push([bx + o, by, 28, 10]); }
    else if (kind === 'casa') S.push([10, 68, 34, 18], [W - 44, 68, 34, 18], rt(cx, 100, 14), [10, 128, 28, 26], [W - 44, 126, 30, 28]);
  }
  return S;
}
// tile solide se coperta per almeno 6 px in entrambe le direzioni; coordinate di mappa = coordinate della skin con +8 px in verticale
export function solidTiles(fam, kind, id) {
  const [tw, th] = ROOM[fam][kind], rows = th + WALL_ROWS, out = new Set();
  for (const [x, y, w, h] of solids(fam, kind, id)) {
    const y0 = y + SKIN_MARGIN;
    for (let ty = Math.floor(y0 / 16); ty <= Math.floor((y0 + h - 1) / 16); ty++) for (let tx = Math.floor(x / 16); tx <= Math.floor((x + w - 1) / 16); tx++) {
      if (tx < 0 || tx >= tw || ty < WALL_ROWS || ty >= rows - 1) continue;
      const ox = Math.min(x + w, (tx + 1) * 16) - Math.max(x, tx * 16), oy = Math.min(y0 + h, (ty + 1) * 16) - Math.max(y0, ty * 16);
      if (ox >= 6 && oy >= 6) out.add(tx + ',' + ty);
    }
  }
  return out;
}
// posizione (tile) del PNG principale della stanza: l'oste dietro il bancone, il mercante dietro il suo, l'anziano davanti alla pedana
// L'oste e il mercante stanno accanto all'estremità del bancone (raggiungibili, a un passo dal bancone), l'anziano davanti alla pedana: la posizione si ricava dalle impronte
export function npcSpot(fam, kind, id, role) {
  const [tw, th] = ROOM[fam][kind], rows = th + WALL_ROWS, sol = solidTiles(fam, kind, id), cx = tw >> 1;
  const free = (x, y) => x >= 0 && x < tw && y >= WALL_ROWS && y < rows - 1 && !sol.has(x + ',' + y);
  const seen = new Set([cx + ',' + (rows - 2)]), q = [[cx, rows - 2]];
  for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (free(nx, ny) && !seen.has(k)) { seen.add(k); q.push([nx, ny]); } } }
  const ok = (x, y) => free(x, y) && seen.has(x + ',' + y);
  if (role === 'hall') { for (const [x, y] of [[cx, 6], [cx, 5], [cx, 7], [cx - 1, 6], [cx + 1, 6]]) if (ok(x, y)) return [x, y]; return [cx, rows - 4]; }
  // bancone = prima impronta: si cerca una tile libera e raggiungibile accanto alle sue estremità, vicino alla sua fila
  const c = solids(fam, kind, id)[0], x0 = Math.floor(c[0] / 16), x1 = Math.floor((c[0] + c[2] - 1) / 16), yr = Math.floor((c[1] + SKIN_MARGIN + c[3] / 2) / 16);
  for (const [x, y] of [[x1 + 1, yr], [x0 - 1, yr], [x1 + 1, yr + 1], [x0 - 1, yr + 1], [x1 + 1, yr - 1], [x0 - 1, yr - 1]]) if (ok(x, y)) return [x, y];
  for (const y of [yr + 2, yr + 3]) for (let x = x0; x <= x1; x++) if (ok(x, y)) return [x, y];
  return [cx, rows - 4];
}
