// DOMUS IMPERIALE DI AUGUSTA IMPERIALIS: skin a blocco unico (anteprima). Tempio-palazzo greco in marmo con colonnato ionico, capitelli e fregio dorati,
// frontone con gruppo scultoreo in oro, grande scalinata, statue greche in marmo fuori e dentro, lato destro in prospettiva per dare volume.
// Funzioni: drawPalace(g) esterno (origine = angolo alto-sinistro, 500x276), statueG(g,x,y,kind,flip) statua con plinto, drawPalaceHall(g) sala del trono.
import { R, lite, dark, mix, OUT, exitCue } from './BuildingSkins.js';

const MA = '#f4f0e4', MB = '#dcd6c6', MC = '#b8b09e', MD = '#8c8473', GOLD = '#e8c040', GD = '#b0801a', GL = '#fff2a8', RED = '#a8242a', PUR = '#5a2a6a';
const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const hw = Math.round(Math.sqrt(r * r - y * y)); R(g, c, cx - hw, cy + y, hw * 2 + 1, 1); } };
const line = (g, c, x0, y0, x1, y1, w = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) R(g, c, Math.round(x0 + (x1 - x0) * i / n - w / 2), Math.round(y0 + (y1 - y0) * i / n - w / 2), w, w); };
const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

// ---------------- statue greche (x = centro, y = base del plinto) ----------------
export const STATUES = ['athena', 'hoplite', 'discobolo', 'imperatore', 'oratrice'];
export function statueG(g, x, y, kind = 'athena', flip = 1) {
  const f = flip, X = (dx) => x + dx * f;
  R(g, 'rgba(10,4,24,.3)', x - 14, y - 2, 34, 5);
  // plinto in marmo con fascia d'oro
  R(g, OUT, x - 13, y - 13, 26, 14); R(g, MB, x - 12, y - 12, 24, 12); R(g, MA, x - 12, y - 12, 24, 2); R(g, MC, x + 6, y - 10, 6, 10); R(g, GOLD, x - 12, y - 8, 24, 1); R(g, GD, x - 12, y - 7, 24, 1);
  R(g, OUT, x - 11, y - 16, 22, 4); R(g, MA, x - 10, y - 15, 20, 3);
  const b = y - 16;   // piano del piede
  const body = (c1, c2) => ({ l: c1, d: c2 });
  const L = MA, M = '#e4dfd0', S = MC;
  const limb = (x0, y0, x1, y1, w = 4) => { line(g, OUT, X(x0), y0, X(x1), y1, w + 2); line(g, M, X(x0), y0, X(x1), y1, w); line(g, L, X(x0) - 1, y0, X(x1) - 1, y1, 1); };
  const head = (hx, hy) => { disc(g, X(hx), hy, 5, OUT); disc(g, X(hx), hy, 4, L); R(g, S, X(hx) + 1, hy - 1, 2, 4); };
  if (kind === 'athena') {
    // peplo lungo con pieghe, egida dorata, elmo con cimiero, lancia e scudo
    R(g, OUT, x - 9, b - 28, 18, 29); R(g, M, x - 8, b - 27, 16, 27); for (let k = -6; k <= 6; k += 3) R(g, k % 2 ? S : L, x + k, b - 22, 1, 22); R(g, S, x + 3, b - 27, 5, 27);
    R(g, OUT, x - 7, b - 42, 14, 16); R(g, L, x - 6, b - 41, 12, 14); R(g, GOLD, x - 6, b - 36, 12, 2); R(g, GD, x - 6, b - 34, 12, 1); disc(g, x, b - 33, 1, GD);
    head(0, b - 47); R(g, OUT, x - 5, b - 55, 10, 5); R(g, GOLD, x - 4, b - 54, 8, 3); R(g, GD, x - 4, b - 54, 8, 1); line(g, OUT, x, b - 56, X(6), b - 61, 3); line(g, GOLD, x, b - 56, X(6), b - 61, 1); R(g, RED, X(5), b - 61, 3, 5);
    R(g, OUT, X(11), b - 60, 4, 62); R(g, MD, X(12), b - 59, 2, 60); R(g, GOLD, X(11), b - 66, 4, 7);   // lancia con punta dorata
    disc(g, X(-12), b - 22, 8, OUT); disc(g, X(-12), b - 22, 7, GOLD); disc(g, X(-12), b - 22, 5, '#fff6c8'); disc(g, X(-12), b - 22, 2, GD);   // scudo
    limb(8, b - 38, 11, b - 28, 3);
  } else if (kind === 'hoplite') {
    limb(-3, b - 24, -4, b, 5); limb(3, b - 24, 4, b, 5);   // gambe nude
    R(g, OUT, x - 8, b - 36, 16, 14); R(g, M, x - 7, b - 35, 14, 12); R(g, GOLD, x - 7, b - 25, 14, 1); for (let k = -5; k <= 5; k += 3) R(g, S, x + k, b - 34, 1, 9);   // tunica corta con bordo oro
    R(g, OUT, x - 7, b - 46, 14, 12); R(g, L, x - 6, b - 45, 12, 10); R(g, S, x + 2, b - 43, 4, 8); R(g, GOLD, x - 6, b - 44, 12, 1);
    head(0, b - 52); R(g, OUT, x - 6, b - 60, 12, 6); R(g, MD, x - 5, b - 59, 10, 4); R(g, GOLD, x - 5, b - 59, 10, 1); line(g, OUT, x - 3, b - 61, X(-2), b - 69, 4); line(g, RED, x - 3, b - 61, X(-2), b - 69, 2);   // elmo con cresta
    R(g, OUT, X(11), b - 62, 4, 64); R(g, MD, X(12), b - 61, 2, 62); R(g, GOLD, X(11), b - 68, 4, 7); limb(7, b - 44, 11, b - 32, 3);
    disc(g, X(-12), b - 30, 9, OUT); disc(g, X(-12), b - 30, 8, MC); disc(g, X(-12), b - 30, 6, GOLD); disc(g, X(-12), b - 30, 3, GD); limb(-7, b - 44, -9, b - 34, 3);
  } else if (kind === 'discobolo') {
    limb(5, b - 22, 8, b - 11, 5); limb(8, b - 11, 11, b, 5); limb(1, b - 22, -6, b - 10, 5); limb(-6, b - 10, -12, b - 1, 4);   // gambe in torsione
    line(g, OUT, X(2), b - 22, X(8), b - 34, 11); line(g, M, X(2), b - 22, X(8), b - 34, 9); line(g, L, X(1), b - 22, X(7), b - 34, 2); line(g, S, X(5), b - 22, X(11), b - 34, 2);   // torso
    head(11, b - 38); limb(8, b - 33, -7, b - 44, 3); limb(-7, b - 44, -10, b - 52, 3);   // braccio indietro
    disc(g, X(-11), b - 55, 5, OUT); disc(g, X(-11), b - 55, 4, MC); disc(g, X(-11), b - 55, 2, GOLD);   // disco
    limb(9, b - 31, 14, b - 24, 3);
  } else if (kind === 'imperatore') {
    R(g, OUT, x - 10, b - 30, 20, 31); R(g, M, x - 9, b - 29, 18, 29); R(g, L, x - 9, b - 29, 5, 29); for (let k = -6; k <= 7; k += 3) R(g, S, x + k, b - 20, 1, 20);   // toga
    line(g, S, x - 8, b - 38, x + 8, b - 24, 3); R(g, OUT, x - 8, b - 44, 16, 16); R(g, M, x - 7, b - 43, 14, 14); R(g, GOLD, x - 7, b - 41, 14, 2);   // cintura/fascia in oro
    head(0, b - 49); for (let k = -4; k <= 4; k += 2) R(g, GOLD, x + k, b - 54 + Math.abs(k) / 2, 2, 2); R(g, GD, x - 4, b - 53, 8, 1);   // corona d'alloro
    limb(9, b - 41, 15, b - 52, 4); R(g, GOLD, X(14), b - 56, 4, 4);   // braccio alzato con globo d'oro
    limb(-8, b - 41, -10, b - 31, 3); R(g, GL, X(-14), b - 34, 4, 8); R(g, GD, X(-14), b - 28, 4, 1);   // rotolo
  } else {   // oratrice: veste con pieghe, braccio alzato che regge una corona d'oro
    R(g, OUT, x - 8, b - 30, 16, 31); R(g, M, x - 7, b - 29, 14, 29); R(g, L, x - 7, b - 29, 4, 29); for (let k = -5; k <= 6; k += 3) R(g, S, x + k, b - 22, 1, 22);
    R(g, OUT, x - 6, b - 44, 12, 16); R(g, M, x - 5, b - 43, 10, 14); R(g, GOLD, x - 5, b - 37, 10, 1);
    head(0, b - 49); R(g, OUT, x - 6, b - 53, 12, 3); R(g, M, x - 5, b - 52, 10, 2); disc(g, x, b - 54, 3, OUT); disc(g, x, b - 54, 2, M);   // chignon
    limb(7, b - 42, 11, b - 56, 3); disc(g, X(11), b - 59, 4, OUT); disc(g, X(11), b - 59, 3, GOLD); disc(g, X(11), b - 59, 1, '#2a1a10');
    limb(-7, b - 42, -9, b - 30, 3); R(g, OUT, X(-12), b - 34, 5, 9); R(g, '#c8603a', X(-11), b - 33, 3, 7);   // anfora
  }
}

// ---------------- esterno ----------------
const W = 448, DEPTH = 44, PEDY = 20, BASEY = 248;   // larghezza fronte, profondità del lato, apice del frontone, linea del terreno
const colX = (i) => 22 + i * ((W - 44 - 18) / 9);    // sinistra di ciascuna delle 10 colonne frontali

function column(g, x, top, bot, w = 18) {
  R(g, OUT, x - 1, top, w + 2, bot - top + 1);
  for (let i = 0; i < w; i++) { const t = i / (w - 1); const c = t < 0.2 ? '#ffffff' : t < 0.45 ? MA : t < 0.7 ? MB : t < 0.88 ? MC : MD; R(g, c, x + i, top + 1, 1, bot - top - 1); if (i % 4 === 2) R(g, t < .6 ? MB : MC, x + i, top + 10, 1, bot - top - 22); }
  // base e capitello ionico dorato
  R(g, OUT, x - 3, bot - 8, w + 6, 9); R(g, MB, x - 2, bot - 7, w + 4, 6); R(g, MA, x - 2, bot - 7, w + 4, 2); R(g, MC, x + w - 3, bot - 6, 5, 5);
  R(g, OUT, x - 4, top - 14, w + 8, 16); R(g, MA, x - 3, top - 13, w + 6, 3); R(g, GOLD, x - 2, top - 10, w + 4, 8); R(g, GL, x - 2, top - 10, w + 4, 1); R(g, GD, x - 2, top - 3, w + 4, 2);
  for (const vx of [x - 4, x + w - 1]) { disc(g, vx + 2, top - 4, 5, OUT); disc(g, vx + 2, top - 4, 4, GOLD); disc(g, vx + 2, top - 4, 2, GD); R(g, GL, vx, top - 7, 2, 2); }
}

export function drawPalace(g) {
  const cx = W / 2, slope = 0.25;
  // ombra a terra
  R(g, 'rgba(10,4,24,.28)', 8, BASEY + 4, W - 4, 10);
  // ---- tetto dietro il frontone (marmo con coppi) ----
  for (let x = 6; x < W - 6; x++) {
    const ay = PEDY + Math.abs(x - cx) * slope; R(g, OUT, x, ay - 17, 1, 2); R(g, x % 8 < 2 ? '#d8c0a4' : '#c8a888', x, ay - 15, 1, 15); if (x % 8 === 0) R(g, '#a88a6a', x, ay - 15, 1, 15);
  }
  // ---- frontone ----
  for (let x = 6; x < W - 6; x++) { const ay = PEDY + Math.abs(x - cx) * slope; R(g, OUT, x, ay, 1, 76 - ay + 1); R(g, '#cfc4b0', x, ay + 5, 1, 76 - ay - 5); R(g, MA, x, ay, 1, 5); R(g, GOLD, x, ay + 1, 1, 1); }
  R(g, 'rgba(10,4,24,.12)', 14, 60, W - 28, 16);
  // gruppo scultoreo dorato nel timpano: figura centrale seduta in trono, divinità ai lati, figure sdraiate agli angoli
  const fig = (fx, fy, h, kind) => { const c = GOLD; if (kind === 'sit') { R(g, OUT, fx - 9, fy - 22, 18, 24); R(g, GD, fx - 8, fy - 21, 16, 22); R(g, c, fx - 7, fy - 20, 14, 20); disc(g, fx, fy - 30, 5, OUT); disc(g, fx, fy - 30, 4, GL); R(g, OUT, fx - 12, fy - 2, 24, 4); R(g, GD, fx - 11, fy - 1, 22, 2); line(g, c, fx + 7, fy - 20, fx + 14, fy - 32, 2); R(g, GL, fx + 13, fy - 35, 3, 3); }
    else if (kind === 'stand') { R(g, OUT, fx - 4, fy - h, 8, h + 1); R(g, c, fx - 3, fy - h + 1, 6, h - 1); R(g, GD, fx + 1, fy - h + 5, 2, h - 6); disc(g, fx, fy - h - 3, 3, OUT); disc(g, fx, fy - h - 3, 2, GL); line(g, c, fx - 3, fy - h + 4, fx - 8, fy - h - 4, 2); }
    else { R(g, OUT, fx - 14, fy - 7, 28, 8); R(g, c, fx - 13, fy - 6, 26, 6); R(g, GD, fx - 13, fy - 2, 26, 2); disc(g, fx - 14, fy - 10, 3, OUT); disc(g, fx - 14, fy - 10, 2, GL); line(g, c, fx - 8, fy - 6, fx - 4, fy - 12, 2); } };
  fig(cx, 74, 0, 'sit'); fig(cx - 46, 74, 24, 'stand'); fig(cx + 46, 74, 24, 'stand'); fig(cx - 80, 74, 18, 'stand'); fig(cx + 80, 74, 18, 'stand'); fig(cx - 120, 74, 0, 'lie'); fig(cx + 120, 74, 0, 'lie'); fig(cx - 158, 74, 0, 'lie'); fig(cx + 158, 74, 0, 'lie');
  // cornice obliqua con bordo oro e antefisse
  for (let x = 4; x < W - 4; x++) { const ay = PEDY + Math.abs(x - cx) * slope; R(g, GOLD, x, ay - 2, 1, 2); R(g, GD, x, ay - 3, 1, 1); R(g, GL, x, ay - 2, 1, 1); if (x % 10 === 0) { R(g, OUT, x - 1, ay - 8, 4, 7); R(g, GOLD, x, ay - 7, 2, 5); } }
  // acroteri: palmetta dorata al vertice e sugli angoli
  const pal = (px, py, s) => { R(g, OUT, px - 3, py - 4, 7, 6); R(g, GD, px - 2, py - 3, 5, 5); for (let a = -3; a <= 3; a++) { line(g, OUT, px, py - 3, px + a * s, py - 3 - (8 - Math.abs(a)) * s * 1.6, 4); line(g, GOLD, px, py - 3, px + a * s, py - 3 - (8 - Math.abs(a)) * s * 1.6, 2); } R(g, GL, px - 1, py - 4, 2, 2); };
  pal(cx, PEDY - 6, 2); pal(8, PEDY + 73 * 0 + (cx - 0) * slope - 6, 1); pal(W - 8, PEDY + cx * slope - 6, 1);
  // ---- trabeazione: cornice orizzontale, fregio con triglifi e metope dorate, architrave con iscrizione ----
  R(g, OUT, 2, 76, W - 4, 8); R(g, MA, 3, 77, W - 6, 6); R(g, GOLD, 3, 77, W - 6, 1); R(g, MC, 3, 82, W - 6, 1); for (let x = 6; x < W - 8; x += 6) R(g, MB, x, 79, 3, 3);
  R(g, OUT, 6, 84, W - 12, 20); R(g, MB, 7, 85, W - 14, 18);
  for (let x = 12, i = 0; x < W - 22; x += 20, i++) { R(g, MC, x, 85, 8, 18); for (let q = 0; q < 3; q++) R(g, dark(MC, 0.4), x + 1 + q * 3, 87, 1, 14); R(g, GD, x + 12, 88, 6, 12); R(g, GOLD, x + 13, 89, 4, 10); R(g, GL, x + 14, 90, 1, 3); disc(g, x + 15, 94, 1, GD); }
  R(g, OUT, 6, 104, W - 12, 15); R(g, MA, 7, 105, W - 14, 13); R(g, MC, 7, 116, W - 14, 2);
  for (let x = 40; x < W - 40; x += 5) { if (rnd(x, 2) < 0.8) R(g, GOLD, x, 109 + (rnd(x, 3) < 0.3 ? 1 : 0), 3, 5); }   // iscrizione dorata
  R(g, GOLD, 7, 105, W - 14, 1); R(g, GOLD, 7, 117, W - 14, 1);
  // ---- parete della cella visibile tra le colonne ----
  R(g, OUT, 20, 119, W - 40, BASEY - 119 - 24); R(g, '#cfc7b4', 21, 120, W - 42, BASEY - 119 - 26);
  for (let y = 126; y < BASEY - 40; y += 14) { R(g, '#bdb5a2', 21, y, W - 42, 1); for (let x = 22 + ((y / 14 | 0) % 2) * 20; x < W - 24; x += 40) R(g, '#bdb5a2', x, y, 1, 14); }
  R(g, 'rgba(10,4,24,.30)', 21, 120, W - 42, 22); R(g, 'rgba(10,4,24,.14)', 21, 142, W - 42, 18);   // ombra del soffitto del portico
  R(g, GOLD, 21, 150, W - 42, 2); R(g, GD, 21, 152, W - 42, 1);   // fascia d'oro continua
  // portale: cornice marmorea, architrave dorato, battenti di bronzo e oro, due leoni ai lati
  const dw = 50, dh = 74, dx0 = cx - dw / 2, dy0 = BASEY - 24 - dh;
  R(g, OUT, dx0 - 10, dy0 - 14, dw + 20, dh + 14); R(g, MA, dx0 - 9, dy0 - 13, dw + 18, dh + 13); R(g, MC, dx0 + dw + 4, dy0 - 10, 4, dh + 10);
  R(g, GOLD, dx0 - 9, dy0 - 13, dw + 18, 4); R(g, GL, dx0 - 9, dy0 - 13, dw + 18, 1); for (let k = 0; k < dw + 18; k += 6) { R(g, GD, dx0 - 9 + k, dy0 - 9, 3, 1); }
  R(g, OUT, dx0 - 1, dy0, dw + 2, dh); R(g, '#2a1c10', dx0, dy0 + 1, dw, dh - 1);
  for (const [bx, lt] of [[dx0, 1], [cx, 0]]) { R(g, '#8a5a24', bx + 1, dy0 + 2, dw / 2 - 2, dh - 3); R(g, '#a8742f', bx + 1, dy0 + 2, 3, dh - 3); for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 2; c2++) { R(g, GD, bx + 5 + c2 * 11, dy0 + 6 + r * 22, 9, 17); R(g, GOLD, bx + 6 + c2 * 11, dy0 + 7 + r * 22, 7, 15); R(g, GL, bx + 7 + c2 * 11, dy0 + 8 + r * 22, 2, 5); disc(g, bx + 9 + c2 * 11, dy0 + 17 + r * 22, 1, GD); } void lt; }
  R(g, OUT, cx - 1, dy0, 2, dh); disc(g, cx - 3, dy0 + 38, 2, GOLD); disc(g, cx + 3, dy0 + 38, 2, GOLD);
  for (const sx of [-1, 1]) { const lx = cx + sx * (dw / 2 + 20); R(g, OUT, lx - 9, BASEY - 24 - 30, 18, 31); R(g, '#c8a040', lx - 8, BASEY - 24 - 29, 16, 29); R(g, GL, lx - 8, BASEY - 24 - 29, 16, 3); disc(g, lx, BASEY - 24 - 30, 6, OUT); disc(g, lx, BASEY - 24 - 30, 5, '#d8b050'); R(g, '#3a2210', lx - 2, BASEY - 24 - 32, 1, 1); R(g, '#3a2210', lx + 2, BASEY - 24 - 32, 1, 1); R(g, '#e8d8b0', lx - 7, BASEY - 24 - 6, 14, 6); }
  // stendardi imperiali appesi tra le colonne (porpora con frange dorate)
  for (const sx of [-1, 1]) { const bx = cx + sx * 118 - 7; R(g, OUT, bx - 1, 156, 16, 62); R(g, PUR, bx, 157, 14, 58); R(g, '#7a3a8a', bx, 157, 4, 58); R(g, GOLD, bx, 157, 14, 3); for (let k = 0; k < 14; k += 2) R(g, GOLD, bx + k, 215, 1, 4); disc(g, bx + 7, 178, 5, OUT); disc(g, bx + 7, 178, 4, GOLD); disc(g, bx + 7, 178, 2, PUR); R(g, GOLD, bx + 6, 190, 2, 14); }
  // nicchie con statue nella parete (visibili tra le colonne)
  for (const sx of [-1, 1]) { const nx = cx + sx * 170; R(g, OUT, nx - 15, 158, 30, 66); R(g, '#8a8070', nx - 14, 159, 28, 65); R(g, '#6a6254', nx - 14, 159, 28, 8); R(g, GOLD, nx - 15, 156, 30, 2); }
  // ---- colonne frontali ----
  for (let i = 0; i < 10; i++) column(g, Math.round(colX(i)), 134, BASEY - 24 + 0, 18);
  // ---- stilobate: tre gradini che corrono su tutta la fronte, con bordo dorato ----
  for (let s = 0; s < 3; s++) { const y = BASEY - 24 + s * 8, x0 = 6 - s * 4, w = W - 12 + s * 8; R(g, OUT, x0, y, w, 9); R(g, MA, x0 + 1, y + 1, w - 2, 3); R(g, MB, x0 + 1, y + 4, w - 2, 4); R(g, GOLD, x0 + 1, y + 1, w - 2, 1); R(g, MC, x0 + w - 8, y + 4, 7, 4); }
  // grande scalinata centrale con tappeto rosso
  for (let s = 0; s < 5; s++) { const y = BASEY - 2 + s * 5, hw = 60 + s * 4; R(g, OUT, cx - hw, y, hw * 2, 6); R(g, s % 2 ? MB : MA, cx - hw + 1, y + 1, hw * 2 - 2, 4); R(g, GOLD, cx - hw + 1, y + 1, hw * 2 - 2, 1); R(g, RED, cx - 20, y + 1, 40, 5); R(g, GOLD, cx - 21, y + 1, 1, 5); R(g, GOLD, cx + 20, y + 1, 1, 5); }
  // bracieri d'oro su treppiedi ai lati della scalinata
  for (const sx of [-1, 1]) { const bx = cx + sx * 78; R(g, OUT, bx - 7, BASEY - 18, 14, 3); line(g, OUT, bx - 5, BASEY - 17, bx - 2, BASEY - 5, 3); line(g, OUT, bx + 5, BASEY - 17, bx + 2, BASEY - 5, 3); line(g, GD, bx - 5, BASEY - 17, bx - 2, BASEY - 5, 1); line(g, GD, bx + 5, BASEY - 17, bx + 2, BASEY - 5, 1);
    R(g, OUT, bx - 9, BASEY - 25, 18, 8); R(g, GOLD, bx - 8, BASEY - 24, 16, 6); R(g, GL, bx - 8, BASEY - 24, 16, 1); for (let k = 0; k < 3; k++) { R(g, '#ff7a30', bx - 4 + k * 3, BASEY - 33 + (k % 2) * 3, 3, 9 - (k % 2) * 3); R(g, '#ffe080', bx - 3 + k * 3, BASEY - 29, 1, 5); } R(g, 'rgba(255,170,60,.22)', bx - 14, BASEY - 40, 28, 28); }
  // statue greche in marmo sul piazzale davanti al palazzo, su plinti
  const ky = BASEY + 32, order = ['athena', 'hoplite', 'discobolo', 'imperatore', 'oratrice'];
  [[-100, 0, 1], [-150, 1, 1], [-200, 2, 1], [100, 0, -1], [150, 3, -1], [200, 4, -1]].forEach(([dx, k, fl]) => statueG(g, cx + dx, ky, order[k], fl));
  // statue nelle nicchie della parete e sul fianco
  for (const [sx, k] of [[-1, 4], [1, 3]]) statueG(g, cx + sx * 170, 222, order[k], -sx);
}

// ---------------- interno: sala del trono ----------------
export const HALL_TILES = [44, 24];   // sala interna (tile)
export function drawPalaceHall(g) {
  const TW = HALL_TILES[0] * 16, TH = HALL_TILES[1] * 16, BW = 64, W = TW, H = TH + BW, cx = W / 2;
  // pavimento in marmo a scacchi con bordo a meandro d'oro
  for (let ty = 0; ty < HALL_TILES[1]; ty++) for (let tx = 0; tx < HALL_TILES[0]; tx++) { const c = (tx + ty) % 2 ? '#e4dfd0' : '#cfc8b6'; R(g, c, tx * 16, BW + ty * 16, 16, 16); R(g, 'rgba(255,255,255,.18)', tx * 16, BW + ty * 16, 16, 1); R(g, 'rgba(10,4,24,.10)', tx * 16, BW + ty * 16 + 15, 16, 1); if (rnd(tx, ty) < 0.25) R(g, 'rgba(10,4,24,.06)', tx * 16 + 3, BW + ty * 16 + 4, 8, 1); }
  const border = (x0, y0, w, h) => { R(g, GD, x0, y0, w, 3); R(g, GOLD, x0, y0 + 1, w, 1); for (let i = 0; i < w; i += 6) { R(g, GD, x0 + i, y0 + 3, 3, 1); } };
  R(g, GD, 16, BW + 16, W - 32, 3); R(g, GOLD, 16, BW + 17, W - 32, 1); R(g, GD, 16, H - 28, W - 32, 3); R(g, GOLD, 16, H - 27, W - 32, 1); R(g, GD, 16, BW + 16, 3, H - BW - 28); R(g, GD, W - 19, BW + 16, 3, H - BW - 28); R(g, GOLD, 17, BW + 16, 1, H - BW - 28); R(g, GOLD, W - 18, BW + 16, 1, H - BW - 28);
  for (let i = 22; i < W - 22; i += 8) { R(g, GD, i, BW + 20, 4, 1); R(g, GD, i, H - 32, 4, 1); }
  // mosaico circolare con aquila davanti al trono
  disc(g, cx, BW + 190, 66, GD); disc(g, cx, BW + 190, 64, '#d8d0bc'); disc(g, cx, BW + 190, 54, GOLD); disc(g, cx, BW + 190, 52, '#2a3a5a'); for (let a = 0; a < 24; a++) { const an = a / 24 * 6.283; R(g, GOLD, Math.round(cx + Math.cos(an) * 59), Math.round(BW + 190 + Math.sin(an) * 59), 3, 3); }
  
  // tappeto porpora dalla porta al trono
  R(g, OUT, cx - 31, BW + 24, 62, H - BW - 40); R(g, RED, cx - 30, BW + 25, 60, H - BW - 42); R(g, '#c8343a', cx - 24, BW + 25, 48, H - BW - 42); R(g, GOLD, cx - 30, BW + 25, 2, H - BW - 42); R(g, GOLD, cx + 28, BW + 25, 2, H - BW - 42);
  for (let y = BW + 32; y < H - 36; y += 16) { R(g, GOLD, cx - 12, y, 24, 1); disc(g, cx, y + 6, 3, GOLD); disc(g, cx, y + 6, 1, RED); }
  // ---- parete di fondo: marmo, fregio d'oro, nicchie con statue, abside con trono ----
  R(g, OUT, 0, 0, W, BW); R(g, '#d8d2c2', 0, 1, W, BW - 1); for (let x = 0; x < W; x += 32) { R(g, '#c4bca8', x, 12, 1, BW - 14); } R(g, '#c4bca8', 0, 40, W, 1);
  R(g, GOLD, 0, 0, W, 6); R(g, GD, 0, 6, W, 2); for (let x = 3; x < W; x += 9) { R(g, GD, x, 2, 4, 2); } R(g, 'rgba(10,4,24,.16)', 0, 8, W, 8);
  for (const nx of [60, 130, 200, 260, 444, 504, 574, 644]) { if (Math.abs(nx - cx) < 70) continue; R(g, OUT, nx - 15, 14, 30, 50); R(g, '#8a8070', nx - 14, 15, 28, 49); R(g, '#6a6254', nx - 14, 15, 28, 7); R(g, GOLD, nx - 15, 12, 30, 2); disc(g, nx, 40, 10, OUT); disc(g, nx, 40, 9, GD); disc(g, nx, 40, 7, GOLD); disc(g, nx, 40, 4, '#8a3a5a'); R(g, GL, nx - 5, 35, 2, 2); }
  // abside centrale
  R(g, OUT, cx - 62, 6, 124, 58); R(g, '#6a2a4a', cx - 61, 7, 122, 57); R(g, '#8a3a5a', cx - 61, 7, 122, 10); for (let i = 0; i < 122; i += 8) R(g, '#4a1a30', cx - 61 + i, 17, 3, 47); R(g, GOLD, cx - 62, 6, 124, 3);
  R(g, OUT, cx - 21, 22, 42, 40); R(g, GD, cx - 20, 23, 40, 38); R(g, GOLD, cx - 19, 24, 38, 18); R(g, GL, cx - 19, 24, 38, 2); R(g, GOLD, cx - 19, 44, 38, 16); R(g, '#3a1a5a', cx - 14, 30, 28, 26);   // trono
  disc(g, cx, 36, 5, OUT); disc(g, cx, 36, 4, GOLD); R(g, GL, cx - 1, 33, 2, 2); line(g, GD, cx - 8, 30, cx - 2, 38, 2); line(g, GD, cx + 8, 30, cx + 2, 38, 2); R(g, OUT, cx - 22, 58, 44, 4);
  for (let s = 0; s < 3; s++) { R(g, OUT, cx - 52 + s * 6, 64 + s * 7 - 7, 104 - s * 12, 8); R(g, s % 2 ? MB : MA, cx - 51 + s * 6, 65 + s * 7 - 7, 102 - s * 12, 5); R(g, GOLD, cx - 51 + s * 6, 65 + s * 7 - 7, 102 - s * 12, 1); }
  for (const sx of [-1, 1]) { const ax = cx + sx * 78; R(g, OUT, ax - 6, 26, 12, 34); R(g, GOLD, ax - 5, 27, 10, 32); R(g, PUR, ax - 3, 30, 6, 24); disc(g, ax, 38, 2, GOLD); }
  // colonne e statue sulle due navate (sorte per profondità)
  const items = [];
  for (let k = 0; k < 4; k++) for (const sx of [-1, 1]) { const x = cx + sx * 150, y = BW + 96 + k * 84; items.push([y, () => { R(g, 'rgba(10,4,24,.25)', x - 8, y - 1, 26, 6); R(g, OUT, x - 9, y - 66, 18, 68); for (let i = 0; i < 16; i++) R(g, i < 3 ? '#fff' : i < 7 ? MA : i < 11 ? MB : i < 14 ? MC : MD, x - 8 + i, y - 65, 1, 64); R(g, OUT, x - 11, y - 8, 22, 9); R(g, MA, x - 10, y - 7, 20, 6); R(g, GOLD, x - 11, y - 77, 22, 11); R(g, GL, x - 11, y - 77, 22, 1); R(g, GD, x - 11, y - 68, 22, 2); for (const vx of [x - 12, x + 8]) { disc(g, vx + 2, y - 72, 4, OUT); disc(g, vx + 2, y - 72, 3, GOLD); disc(g, vx + 2, y - 72, 1, GD); } }]);
    const sx2 = cx + sx * 232; items.push([y + 2, () => statueG(g, sx2, y + 2, STATUES[(k + (sx > 0 ? 2 : 0)) % 5], -sx)]); const sx3 = cx + sx * 100; if (k % 2 === 0) items.push([y + 40, () => statueG(g, sx3, y + 40, STATUES[(k + 1 + (sx > 0 ? 3 : 0)) % 5], -sx)]); }
  for (const sx of [-1, 1]) { const bx = cx + sx * 74, y = BW + 230; items.push([y, () => { line(g, OUT, bx - 7, y - 16, bx - 3, y, 3); line(g, OUT, bx + 7, y - 16, bx + 3, y, 3); line(g, GD, bx - 7, y - 16, bx - 3, y, 1); line(g, GD, bx + 7, y - 16, bx + 3, y, 1); R(g, OUT, bx - 10, y - 24, 20, 9); R(g, GOLD, bx - 9, y - 23, 18, 7); for (let k = 0; k < 3; k++) { R(g, '#ff7a30', bx - 4 + k * 3, y - 33 + (k % 2) * 3, 3, 9 - (k % 2) * 3); R(g, '#ffe080', bx - 3 + k * 3, y - 28, 1, 4); } R(g, 'rgba(255,170,60,.2)', bx - 18, y - 44, 36, 40); }]); }
  items.sort((a, b) => a[0] - b[0]); for (const [, fn] of items) fn();
  exitCue(g, cx, W, H);
}
