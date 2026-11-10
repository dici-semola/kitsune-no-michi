// PIANTA DI SILVANETH (approvata dall'utente): croce di viali di assi con piazza a pietre e laghetto, due file di case (nord e sud),
// sala, locanda e bottega ai lati del viale, siepe viva come confine con tre aperture (nord e sud con arco, est libera). Nessuna sovrapposizione: ogni edificio ha almeno
// 1 tile di spazio ai lati e dietro, davanti il sentiero della porta. Coordinate (u,v) relative all'angolo alto-sinistro della città 70x53.
import { T } from '../data/tiles.js';
import { buildingAt, poi } from './Generators.js';

export const ELF_W = 70, ELF_H = 53;
const AV = 34, HV = 25;                                        // viale verticale (2 tile da u=34) e asse orizzontale (2 tile da v=25)
export const ELF_BUILDINGS = [                                  // [ruolo, u, v, w, h]
  ['hall', 11, 14, 11, 7], ['inn', 48, 15, 8, 6], ['shop', 58, 15, 8, 6],
  ...[4, 14, 24, 40, 50, 60].map((u, i) => [i === 0 ? 'house' : 'casa', u, 3, 6, 6]),
  ...[4, 14, 24, 40, 50, 60].map((u) => ['deco', u, 38, 7, 6]),
];
export const ELF_LAMPS = [[32, 5], [37, 5], [32, 13], [37, 13], [32, 41], [37, 41], [32, 50], [37, 50], [12, 24], [20, 24], [46, 24], [56, 24], [66, 24], [28, 22], [42, 22], [28, 30], [42, 30]];
const MUSH = [[2, 13], [66, 13], [2, 49], [66, 49]], BENCH = [[26, 18], [42, 18], [26, 34], [42, 34]], TREES = [[1, 21], [68, 31], [1, 34], [68, 19]];

export function stampElfPlan(m, s, c, ox, oy, st) {
  const W = ELF_W, H = ELF_H, road = c.road, put = (u, v, g, o) => { const x = ox + u, y = oy + v; if (!m.inb(x, y)) return; if (g !== null) m.setG(x, y, g); if (o !== undefined) m.setO(x, y, o); };
  const paint = (u, v, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(u + i, v + j, road, 0); };
  // 1) prato incantato e strade
  for (let v = -3; v < H + 3; v++) for (let u = -3; u < W + 3; u++) put(u, v, c.ground, 0);
  paint(AV, -3, 2, H + 6); paint(0, HV, W + 2, 2); paint(0, 10, W, 2); paint(0, 45, W, 2);
  // 2) piazza a pietre (cerchio di raggio 10) e laghetto (raggio 5)
  for (let v = -10; v <= 10; v++) for (let u = -10; u <= 10; u++) if (u * u + v * v <= 100) put(35 + u, 26 + v, T.COBBLE, 0);
  for (let v = -5; v <= 5; v++) for (let u = -5; u <= 5; u++) if (u * u + v * v <= 26) put(35 + u, 26 + v, T.WATER, 0);
  // 3) edifici con il sentiero davanti alla porta
  for (const [role, u, v, w, h] of ELF_BUILDINGS) {
    const target = role === 'hall' || role === 'inn' || role === 'shop' ? HV : role === 'deco' ? 45 : 10, px = u + (w >> 1) - 1;
    paint(px, v + h, 3, target - (v + h));
    if (role === 'hall' || role === 'inn' || role === 'shop' || role === 'house') buildingAt(m, ox + u, oy + v, w, h, `${s.id}_${role}`, st, road);
    else if (role === 'casa') buildingAt(m, ox + u, oy + v, w, h, `house_${ox + u}_${oy + v}`, st, road, { shut: true });
    else for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(u + i, v + j, road, j < 2 ? st.roof : st.wall);
  }
  // 4) arredi con spazio fra loro
  for (const [u, v] of ELF_LAMPS) put(u, v, null, T.ELVENLAMP);
  for (const [u, v] of MUSH) put(u, v, null, T.MUSHROOM);
  for (const [u, v] of BENCH) put(u, v, null, T.BENCH);
  for (const [u, v] of TREES) put(u, v, null, T.GIANTTREE);
  // 5) confine: siepe viva, aperture a nord/sud (4 tile, con arco) e a est (4 tile libere); ovest chiuso
  for (let u = -2; u <= W + 1; u++) for (const v of [-2, H + 1]) if (!(u >= 33 && u <= 36)) put(u, v, c.ground, T.THICKET);
  for (let v = -2; v <= H + 1; v++) for (const u of [-2, W + 1]) if (!(u > 0 && v >= 24 && v <= 27)) put(u, v, c.ground, T.THICKET);
  for (let u = 33; u <= 36; u++) for (const v of [-2, H + 1]) put(u, v, road, 0);
  poi(m, ox + 35, oy + 26, c.name, 'town'); m.anchors['town_' + s.id] = { x: ox + 35, y: oy + 33 };   // punto libero sulla piazza, a sud del laghetto
}
