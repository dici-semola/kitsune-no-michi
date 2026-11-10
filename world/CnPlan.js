// PIANTA DI LONGXI (approvata dall'utente): croce di viali con laghetto, isola e due ponti; vie del nord e del sud; sala, locanda e bottega a nord dell'asse con sentiero davanti alla porta;
// sei case a nord e quattro decorative a sud; mura, torri d'angolo e cancelli restano quelli del generatore. Nessuna sovrapposizione (controllata nell'anteprima).
// Coordinate (u,v) relative all'angolo alto-sinistro della città 64x48.
import { T } from '../data/tiles.js';
import { buildingAt, poi } from './Generators.js';

export const CN_W = 64, CN_H = 48;
const AV = 31, HV = 23, SN = 10, SS = 36;
export const CN_BUILDINGS = [   // [ruolo, u, v, w, h]
  ['hall', 6, 13, 11, 7], ['inn', 43, 14, 8, 6], ['shop', 53, 14, 8, 6],
  ...[3, 12, 21, 37, 46, 55].map((u, i) => [i === 0 ? 'house' : 'casa', u, 3, 6, 6]),
  ...[3, 12, 44, 53].map((u) => ['deco', u, 27, 7, 6]),
];
export const CN_LAMPS = [[4, 22], [8, 22], [14, 22], [18, 22], [22, 22], [42, 22], [52, 22], [60, 22], [4, 25], [8, 25], [14, 25], [20, 25], [46, 25], [52, 25], [58, 25], [29, 9], [34, 9], [29, 38], [34, 38]];

export function stampCnPlan(m, s, c, ox, oy, st) {
  const W = CN_W, H = CN_H, road = c.road, put = (u, v, g, o) => { const x = ox + u, y = oy + v; if (!m.inb(x, y)) return; if (g !== null) m.setG(x, y, g); if (o !== undefined) m.setO(x, y, o); };
  const paint = (u, v, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(u + i, v + j, road, 0); };
  // 1) terreno dentro le mura ripulito, poi strade
  for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) put(u, v, c.ground, 0);
  paint(AV, 0, 2, H); paint(0, HV, W, 2); paint(0, SN, W, 2); paint(0, SS, W, 2);
  // 2) laghetto (raggio 7) con isola (raggio 3), pagoda e due ponti a croce
  for (let v = -7; v <= 7; v++) for (let u = -7; u <= 7; u++) if (u * u + v * v <= 51) put(32 + u, 24 + v, T.WATER, 0);
  for (let v = -3; v <= 3; v++) for (let u = -3; u <= 3; u++) if (u * u + v * v <= 9) put(32 + u, 24 + v, T.GRASS, 0);
  for (let i = -8; i <= 8; i++) for (const d of [-1, 0]) { put(32 + i, 24 + d, T.BRIDGE, 0); put(32 + d, 24 + i, T.BRIDGE, 0); }
  put(34, 22, null, T.PAGODA);
  // 3) edifici con il sentiero davanti alla porta
  for (const [role, u, v, w, h] of CN_BUILDINGS) {
    const target = role === 'hall' || role === 'inn' || role === 'shop' ? HV : role === 'deco' ? SS : SN;
    paint(u + (w >> 1) - 1, v + h, 3, target - (v + h));
    if (role === 'hall' || role === 'inn' || role === 'shop' || role === 'house') buildingAt(m, ox + u, oy + v, w, h, `${s.id}_${role}`, st, road);
    else if (role === 'casa') buildingAt(m, ox + u, oy + v, w, h, `house_${ox + u}_${oy + v}`, st, road, { shut: true });
    else for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(u + i, v + j, road, j < 2 ? st.roof : st.wall);
  }
  // 4) arredi con spazio fra loro
  for (const [u, v] of CN_LAMPS) put(u, v, null, T.LANTERN);
  for (const [u, v] of [[22, 19], [40, 19], [22, 28], [40, 28]]) put(u, v, null, T.BENCH);
  put(28, 15, null, T.SIGN); put(61, 33, null, T.WELL); put(21, 30, null, T.CART);
  for (const u of [54, 55, 56]) put(u, 39, null, T.STALL);
  for (const [u, v] of [[4, 40], [22, 40], [14, 40], [46, 40]]) put(u, v, null, T.FLOWERS);
  for (const [u, v0, n] of [[1, 13, 3], [62, 14, 3], [1, 40, 3], [62, 40, 3]]) for (let k = 0; k < n; k++) put(u, v0 + k, null, T.BAMBOO);
  poi(m, ox + 32, oy + 24, c.name, 'town'); m.anchors['town_' + s.id] = { x: ox + 32, y: oy + 33 };   // punto libero sul viale, a sud del laghetto
}
