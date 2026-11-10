// Sprite dei luoghi sacri (pixel art, stile dell'icona: contorni scuri, luce dall'alto-sinistra, ombra a destra, piccole animazioni).
// Ogni funzione disegna con i piedi in (x, y). Usate come "decorazioni" attorno ai santuari (vedi world/Sacred.js).
import { FACADE } from './FacadeSprites.js';
import { LANDMARKS } from './LandmarkSprites.js';
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const OUT = '#14081a';
const shade = (g, x, y, w, h, c = 'rgba(20,8,26,.28)') => R(g, c, x, y, w, h);

function torii(g, x, y, t, c) {
  // due pilastri con base nera, trave bassa (nuki), trave alta curva (kasagi) con tavola centrale (gakuzuka)
  for (const sx of [-20, 16]) {
    R(g, OUT, x + sx - 1, y - 34, 8, 35); R(g, c[0], x + sx, y - 34, 6, 33); R(g, c[1], x + sx, y - 34, 2, 33); shade(g, x + sx + 4, y - 34, 2, 33);
    R(g, '#241028', x + sx - 2, y - 4, 10, 5); R(g, '#3a1a40', x + sx - 2, y - 4, 10, 1);
  }
  R(g, OUT, x - 19, y - 27, 38, 5); R(g, c[0], x - 18, y - 26, 36, 3); R(g, c[1], x - 18, y - 26, 36, 1);                       // nuki
  R(g, OUT, x - 27, y - 41, 54, 8); R(g, '#241028', x - 26, y - 40, 52, 3); R(g, c[0], x - 24, y - 37, 48, 3); R(g, c[1], x - 24, y - 37, 48, 1);   // kasagi
  R(g, OUT, x - 29, y - 44, 6, 6); R(g, '#241028', x - 28, y - 43, 4, 3); R(g, OUT, x + 23, y - 44, 6, 6); R(g, '#241028', x + 24, y - 43, 4, 3);    // estremità rialzate
  R(g, OUT, x - 4, y - 33, 9, 8); R(g, c[2], x - 3, y - 32, 7, 6); R(g, '#14081a', x - 1, y - 31, 3, 4);                       // targa
  const gl = 0.35 + 0.25 * Math.sin(t * 2.4); g.globalAlpha = gl; R(g, c[2], x - 2, y - 30, 5, 2); g.globalAlpha = 1;
}
function buddha(g, x, y, t, stone) {
  const body = stone ? '#9a9aa8' : '#e0b038', lit = stone ? '#c8c8d4' : '#ffe080', dark = stone ? '#5a5a68' : '#9a6a18', robe = stone ? '#7a7a8a' : '#c8283a';
  const pulse = 0.2 + 0.12 * Math.sin(t * 2); g.globalAlpha = pulse; R(g, stone ? '#e8e8ff' : '#ffe8a0', x - 38, y - 28, 14, 14); g.globalAlpha = 1;   // alone attorno al capo
  R(g, OUT, x - 36, y - 5, 74, 6); R(g, '#5a4a6a', x - 35, y - 4, 72, 4); R(g, '#8a7a9a', x - 35, y - 4, 72, 1);               // basamento
  R(g, OUT, x - 30, y - 17, 66, 13); R(g, body, x - 29, y - 16, 64, 11); R(g, lit, x - 29, y - 16, 64, 2);                      // corpo disteso
  for (let i = -26; i < 32; i += 5) { R(g, robe, x + i, y - 14, 2, 9); R(g, dark, x + i + 2, y - 12, 1, 7); }                   // pieghe della veste
  R(g, OUT, x - 35, y - 25, 12, 14); R(g, body, x - 34, y - 24, 10, 12); R(g, lit, x - 34, y - 24, 10, 2);                      // testa
  R(g, '#241428', x - 34, y - 26, 10, 3); for (let i = 0; i < 5; i++) R(g, '#241428', x - 34 + i * 2, y - 27 - (i & 1), 2, 2); R(g, body, x - 31, y - 29, 4, 3);   // ricci e ushnisha
  R(g, dark, x - 31, y - 19, 2, 1); R(g, dark, x - 27, y - 19, 2, 1); R(g, '#a83a3a', x - 30, y - 15, 3, 1);                    // occhi chiusi e sorriso
  R(g, body, x - 24, y - 22, 3, 8); R(g, OUT, x - 24, y - 15, 3, 1);                                                          // orecchio lungo
  R(g, OUT, x - 26, y - 19, 18, 6); R(g, body, x - 25, y - 18, 16, 4); R(g, lit, x - 25, y - 18, 16, 1);                        // braccio che sostiene la testa
  R(g, OUT, x + 33, y - 15, 9, 10); R(g, body, x + 34, y - 14, 7, 8); R(g, dark, x + 36, y - 14, 1, 8);                       // piedi
  shade(g, x - 28, y - 8, 64, 3);
}
function maya(g, x, y, t, obs) {
  const st = obs ? '#3a3a4c' : '#8a9a6a', lit = obs ? '#6a6a88' : '#b8c890', dk = obs ? '#1a1a28' : '#4a5a3a', tq = obs ? '#a05aff' : '#40c0a0';
  R(g, OUT, x - 14, y - 8, 28, 9); R(g, st, x - 13, y - 7, 26, 7); R(g, lit, x - 13, y - 7, 26, 1);                             // gradoni
  R(g, OUT, x - 11, y - 15, 22, 8); R(g, st, x - 10, y - 14, 20, 7); R(g, lit, x - 10, y - 14, 20, 1);
  R(g, OUT, x - 8, y - 22, 16, 8); R(g, st, x - 7, y - 21, 14, 7); R(g, lit, x - 7, y - 21, 14, 1);
  for (let i = -9; i <= 7; i += 4) { R(g, dk, x + i, y - 6, 2, 1); R(g, dk, x + i + 1, y - 13, 2, 1); }                         // greche incise
  R(g, OUT, x - 7, y - 36, 14, 15); R(g, st, x - 6, y - 35, 12, 13); R(g, lit, x - 6, y - 35, 12, 2);                           // volto-totem
  R(g, tq, x - 5, y - 31, 3, 3); R(g, tq, x + 2, y - 31, 3, 3); R(g, '#14081a', x - 4, y - 30, 1, 1); R(g, '#14081a', x + 3, y - 30, 1, 1);   // occhi
  R(g, dk, x - 3, y - 26, 6, 3); R(g, '#e8e0c8', x - 2, y - 26, 1, 2); R(g, '#e8e0c8', x + 1, y - 26, 1, 2);                   // bocca con denti
  R(g, '#d83a3a', x - 9, y - 41, 4, 6); R(g, tq, x - 5, y - 44, 4, 9); R(g, '#f0c040', x - 1, y - 46, 3, 11); R(g, tq, x + 2, y - 44, 4, 9); R(g, '#d83a3a', x + 5, y - 41, 4, 6);   // copricapo di piume
  const gl = 0.4 + 0.4 * Math.sin(t * 3); g.globalAlpha = gl; R(g, tq, x - 5, y - 31, 3, 1); R(g, tq, x + 2, y - 31, 3, 1); g.globalAlpha = 1;
}
function cross(g, x, y, t) {
  R(g, OUT, x - 11, y - 5, 22, 6); R(g, '#8a8a96', x - 10, y - 4, 20, 4); R(g, '#b8b8c4', x - 10, y - 4, 20, 1);
  R(g, OUT, x - 8, y - 9, 16, 5); R(g, '#9a9aa6', x - 7, y - 8, 14, 3);
  R(g, OUT, x - 3, y - 36, 7, 28); R(g, '#a8a8b4', x - 2, y - 35, 5, 27); R(g, '#d0d0dc', x - 2, y - 35, 2, 27); shade(g, x + 2, y - 35, 1, 27);                // fusto
  R(g, OUT, x - 10, y - 30, 21, 7); R(g, '#a8a8b4', x - 9, y - 29, 19, 5); R(g, '#d0d0dc', x - 9, y - 29, 19, 1);                // braccio
  for (const [dx, dy] of [[-6, -34], [-6, -25], [4, -34], [4, -25]]) R(g, OUT, x + dx, y + dy, 3, 3);                           // anello celtico
  R(g, '#5a8a4a', x - 9, y - 6, 3, 2); R(g, '#5a8a4a', x + 5, y - 5, 4, 2); R(g, '#7aaa5a', x - 2, y - 20, 2, 1);                 // muschio
  const f = Math.floor(t * 6) % 3; R(g, '#f6e8c8', x - 13, y - 5, 2, 4); R(g, '#ffb040', x - 13, y - 7 - (f & 1), 2, 2); R(g, '#f6e8c8', x + 11, y - 5, 2, 4); R(g, '#ffb040', x + 11, y - 7 - (f === 1 ? 1 : 0), 2, 2);   // due candele
}
function dolmen(g, x, y, t) {
  R(g, OUT, x - 14, y - 22, 4, 23); R(g, '#7a7a86', x - 13, y - 21, 2, 21); R(g, '#a8a8b4', x - 13, y - 21, 1, 21); R(g, '#4a4a56', x - 11, y - 21, 1, 21);
  R(g, OUT, x + 9, y - 22, 4, 23); R(g, '#7a7a86', x + 10, y - 21, 2, 21); R(g, '#a8a8b4', x + 10, y - 21, 1, 21);
  R(g, OUT, x - 18, y - 29, 36, 8); R(g, '#8a8a96', x - 17, y - 28, 34, 6); R(g, '#b8b8c4', x - 17, y - 28, 34, 1); shade(g, x - 17, y - 24, 34, 2);   // lastra superiore
  R(g, '#5a8a4a', x - 12, y - 29, 6, 2); R(g, '#7aaa5a', x + 2, y - 29, 5, 1);                                              // muschio e licheni
  const gl = 0.45 + 0.4 * Math.sin(t * 2.6); g.globalAlpha = gl; R(g, '#80f0c0', x - 2, y - 26, 1, 3); R(g, '#80f0c0', x - 4, y - 24, 5, 1); R(g, '#80f0c0', x + 3, y - 26, 1, 3); g.globalAlpha = 1;   // rune
  R(g, '#241428', x - 7, y - 4, 14, 4); R(g, '#3a2a40', x - 6, y - 3, 12, 2);                                                  // soglia scura della tomba
}
function menhir(g, x, y, t) {
  R(g, OUT, x - 5, y - 26, 11, 27); R(g, '#7a7a86', x - 4, y - 25, 9, 25); R(g, '#a8a8b4', x - 4, y - 25, 3, 25); shade(g, x + 2, y - 25, 3, 25);
  R(g, OUT, x - 3, y - 29, 7, 4); R(g, '#7a7a86', x - 2, y - 28, 5, 3);
  g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2.2 + x); for (const [dx, dy] of [[-1, -20], [1, -19], [1, -17], [-1, -16], [-2, -15]]) R(g, '#80f0c0', x + dx, y + dy, 1, 1); g.globalAlpha = 1;   // spirale incisa
}
function stupa(g, x, y, t) {
  R(g, OUT, x - 13, y - 6, 27, 7); R(g, '#c8b898', x - 12, y - 5, 25, 5); R(g, '#e8dcc0', x - 12, y - 5, 25, 1);
  R(g, OUT, x - 10, y - 11, 21, 6); R(g, '#d8c8a8', x - 9, y - 10, 19, 5);
  for (let i = 0; i < 9; i++) { const w = 17 - i * 1.6, yy = y - 12 - i * 2; R(g, OUT, x - w / 2 - 1, yy - 2, w + 3, 3); R(g, '#f4ecd8', x - w / 2, yy - 1, w + 1, 2); }   // cupola a gradini
  R(g, OUT, x - 1, y - 40, 4, 12); R(g, '#f0c040', x, y - 39, 2, 10); R(g, '#c8283a', x - 3, y - 33, 8, 2);                  // guglia dorata
  R(g, '#d83a3a', x - 8, y - 14, 3, 6); R(g, '#40a0d0', x + 5, y - 14, 3, 6);                                                // bandierine di preghiera
  const w = Math.sin(t * 3) * 1; R(g, '#ffe080', x - 9 + w, y - 16, 2, 1); R(g, '#ffe080', x + 7 - w, y - 16, 2, 1);
}
function lantern(g, x, y, t) {
  R(g, OUT, x - 5, y - 4, 11, 5); R(g, '#8a8a96', x - 4, y - 3, 9, 3);
  R(g, OUT, x - 2, y - 12, 5, 9); R(g, '#9a9aa6', x - 1, y - 11, 3, 8);
  R(g, OUT, x - 6, y - 21, 13, 10); R(g, '#7a7a86', x - 5, y - 20, 11, 8); const f = 0.7 + 0.3 * Math.sin(t * 9 + x); g.globalAlpha = f; R(g, '#ffc860', x - 3, y - 19, 7, 5); g.globalAlpha = 1; R(g, '#fff0b0', x - 1, y - 18, 3, 3);
  R(g, OUT, x - 8, y - 25, 17, 5); R(g, '#8a8a96', x - 7, y - 24, 15, 3); R(g, '#b8b8c4', x - 7, y - 24, 15, 1);
  const gl = 0.12 + 0.08 * Math.sin(t * 9 + x); g.globalAlpha = gl; R(g, '#ffd060', x - 12, y - 24, 25, 22); g.globalAlpha = 1;
}
const PAL = { red: ['#c8283a', '#e8505a', '#f0c040'], ice: ['#7ab8e8', '#c8ecff', '#ffffff'], mystic: ['#7a4ae8', '#b898ff', '#ffe890'], stone: ['#8a8a98', '#b8b8c8', '#d8d8e8'], black: ['#3a2a3a', '#6a4a6a', '#c8a050'] };

export const SACRED = {
  torii: (g, x, y, t) => torii(g, x, y, t, PAL.red), torii_ice: (g, x, y, t) => torii(g, x, y, t, PAL.ice), torii_mystic: (g, x, y, t) => torii(g, x, y, t, PAL.mystic), torii_stone: (g, x, y, t) => torii(g, x, y, t, PAL.stone),
  buddha: (g, x, y, t) => buddha(g, x, y, t, false), buddha_stone: (g, x, y, t) => buddha(g, x, y, t, true),
  maya: (g, x, y, t) => maya(g, x, y, t, false), maya_obsidian: (g, x, y, t) => maya(g, x, y, t, true),
  cross, dolmen, menhir, stupa, lantern,
  hit: () => {},   // pilastro invisibile: serve solo a dare collisione alle parti piene di una decorazione
};
Object.assign(SACRED, FACADE);   // dettagli di facciata: stesso registro delle decorazioni
Object.assign(SACRED, LANDMARKS);   // monumenti unici delle città
