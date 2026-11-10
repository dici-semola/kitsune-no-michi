// Identità visiva di ogni città: palette dei muri e dei tetti, forma delle finestre. Ogni luogo ha le sue combinazioni, così nessuna città somiglia a un'altra.
// Gli indici (1..) puntano a WALL_PALS / ROOF_PALS (0 = colori originali del tile); la scelta per edificio è deterministica.
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a, b, f) => { const A = hx(a), B = hx(b); return '#' + A.map((q, i) => Math.round(q + (B[i] - q) * f).toString(16).padStart(2, '0')).join(''); };
const tri = (b) => [b, mix(b, '#ffffff', 0.2), mix(b, '#1a0a24', 0.32)];
export const WALL_PALS = [null, ...['#f2e8d0', '#fbf7ee', '#e8c88a', '#d89a74', '#d8b98a', '#b8d0e0', '#b8d0a8', '#e8b8b8', '#a8a8b4', '#8a6a4a', '#c8604a', '#f0d868', '#c8b8e0', '#88c0c0', '#f0c8a8', '#6a7a8a', '#e0e0d0', '#c0a070', '#9a5a3a', '#d8d0b8', '#7a8a6a', '#e8d0e8', '#b09070', '#f4e0b0'].map(tri)];
export const ROOF_PALS = [null, ...['#b02a2a', '#2a4a8a', '#2a7a4a', '#4a5060', '#c8a050', '#6a3a9a', '#d8a830', '#2a2a34', '#2a8a8a', '#d86a2a', '#8a2a4a', '#5a7a3a', '#a04a2a', '#3a5a9a', '#e0c070', '#7a2a2a', '#4a8a6a', '#8a6a4a', '#c0402a', '#32506a', '#9a8a60', '#5a3a2a', '#c85a8a', '#3a3a5a'].map(tri)];
// per città: muri, tetti (indici), finestre (0 rett., 1 ad arco, 2 tonda, 3 doppia stretta, 4 con persiane, 5 a rombi, 6 feritoia, 7 larga e bassa)
export const TOWN_STYLE = {
  hinomura: { walls: [1, 2, 20], roofs: [1, 4, 8], win: [0, 4, 3], rs: 2, wm: 1 },        // villaggio giapponese: intonaco chiaro, tetti rossi e di paglia
  silvaneth: { walls: [7, 20, 15], roofs: [3, 11, 17], win: [1, 2, 5], rs: 3, wm: 1 },     // elfi: pareti verdi e legno, tetti verdi, finestre ad arco e tonde
  aurelburg: { walls: [4, 11, 18], roofs: [2, 13, 20], win: [1, 0, 7], rs: 0, wm: 2 },     // capitale europea: mattone e arenaria, tetti blu e ardesia
  longxi: { walls: [10, 12, 22], roofs: [6, 9, 16], win: [5, 2, 3], rs: 2, wm: 0 },        // città del drago: rosso e oro, tetti dorati e verdi
  sahar: { walls: [5, 17, 24], roofs: [5, 18, 21], win: [6, 1, 7], rs: 1, wm: 4 },         // deserto: arenaria e adobe, tetti piatti e scuri, feritoie
  kuru: { walls: [14, 8, 13], roofs: [5, 16, 18], win: [2, 4, 7], rs: 3, wm: 3 },          // tropicale: colori vivaci, paglia
  augusta: { walls: [16, 2, 24], roofs: [12, 7, 23], win: [1, 1, 5], rs: 0, wm: 2 },       // impero: marmo, tetti dorati e viola
  portomarea: { walls: [6, 9, 22], roofs: [14, 11, 19], win: [2, 3, 4], rs: 0, wm: 3 },    // porto: azzurro, legno, tetti blu navy
  zeroquartier: { walls: [9, 15, 21], roofs: [8, 22, 24], win: [7, 6, 5], rs: 1, wm: 2 },  // città futura: grigi e metallo, neon
  coralia: { walls: [8, 19, 14], roofs: [10, 22, 5], win: [2, 2, 3], rs: 1, wm: 4 },       // isola corallina: rosa e conchiglia
  khaz_dum: { walls: [9, 21, 23], roofs: [8, 20, 24], win: [6, 6, 7], rs: 1, wm: 2 }, nethermere: { walls: [15, 21, 9], roofs: [24, 20, 8], win: [6, 2, 6] },
};
export function styleOf(town, h) {
  let st = TOWN_STYLE[town]; if (!st) { let a = 7; for (let i = 0; i < (town || '').length; i++) a = (a * 31 + (town || '').charCodeAt(i)) | 0; const r = (n) => 1 + (Math.abs(a * (n + 3)) % 24); st = { walls: [r(1), r(2), r(3)], roofs: [r(4), r(5), r(6)], win: [Math.abs(a) % 8, Math.abs(a >> 3) % 8, Math.abs(a >> 6) % 8] }; }
  const pick = (l, k) => l[Math.floor(h * 997 * (k + 1)) % l.length];
  return { wall: pick(st.walls, 1), roof: pick(st.roofs, 2), ws: pick(st.win, 3), rs: st.rs ?? (Math.floor(h * 331) % 4), wm: st.wm ?? (Math.floor(h * 577) % 5) };
}
