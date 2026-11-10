// APPLICAZIONE DELLE PIANTE APPROVATE (Augusta, Sahar, Porto Marea, Kuru, Zero-Quartier, Coralia, Khaz-Dum, Nethermere).
// La geometria viene da TownPlans.planTown (viali allineati ai cancelli veri, piazza con elemento centrale, file di edifici con sentiero davanti alla porta,
// case in file regolari, decorative sul fondo); qui la si scrive sulla mappa. Mura e cancelli restano quelli del generatore (stesso centro, stessi lati).
import { T } from '../data/tiles.js';
import { buildingAt, poi, quartersFor } from './Generators.js';
import { planTown } from './TownPlans.js';

const rnd = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const PLAZA_TILE = { arena: T.MARBLEFLOOR, bonfire: T.DIRT, lagoon: T.WATER };
const FILL = { arena: [T.PINE], oasis: [T.PALM, T.STALL], fountain_anchor: [T.CRATE, T.BARREL, T.STALL], bonfire: [T.TOTEM, T.PALM], holo: [T.HOLO], lagoon: [T.PALM, T.BARREL], forge_lava: [T.FORGE, T.CRYSTAL], mushroom_lake: [T.MUSHROOM, T.CRYSTAL] };

export function stampGenPlan(m, s, c, ox, oy, st) {
  const W = s.w, H = s.h, p = planTown(W, H, c.center), road = c.road || c.ground, cu = W >> 1, cv = H >> 1;
  const put = (u, v, g, o) => { const x = ox + u, y = oy + v; if (u < 0 || v < 0 || u >= W || v >= H || !m.inb(x, y)) return; if (g !== null) m.setG(x, y, g); if (o !== undefined) m.setO(x, y, o); };
  const paint = (u, v, w, h, g = road) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(u + i, v + j, g, 0); };
  const grid = Array.from({ length: H }, () => new Uint8Array(W));   // 1 = strada/piazza/edificio con margine, 2 = oggetto
  // 1) terreno ripulito dentro le mura (l'anello e i cancelli restano), poi viali e strade
  for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) put(u, v, c.ground, 0);
  for (const [u, v, w, h] of p.avenues.concat(p.streets)) { paint(u, v, w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (grid[v + j] && u + i < W) grid[v + j][u + i] = 1; }
  // 2) piazza centrale: pavimento a ellisse e suo elemento caratteristico
  const pl = PLAZA_TILE[c.center] ?? T.COBBLE, inEl = (u, v, rx, ry) => { const dx = (u + 0.5 - cu) / rx, dy = (v + 0.5 - cv) / ry; return dx * dx + dy * dy <= 1; };
  for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (inEl(u, v, p.rx, p.ry)) { put(u, v, pl, 0); grid[v][u] = 1; }
  const onAve = (u, v) => (u >= p.AV && u <= p.AV + 1) || (v >= p.HV && v <= p.HV + 1);
  const bridge = (len) => { for (let i = -len; i <= len; i++) for (const d of [-1, 0]) { put(cu + i, cv + d, T.BRIDGE, 0); put(cu + d, cv + i, T.BRIDGE, 0); } };
  switch (c.center) {
    case 'arena':
      for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (inEl(u, v, 5, 3.6)) put(u, v, T.SAND, 0);
      for (let a = 0; a < 24; a++) { const an = a / 24 * 6.283, u = Math.round(cu + Math.cos(an) * (p.rx - 1.5)), v = Math.round(cv + Math.sin(an) * (p.ry - 1.5)); if (!onAve(u, v) && a % 6 !== 0) put(u, v, null, T.COLUMN); }
      put(cu - 3, cv - 3, null, T.STATUE); put(cu + 3, cv - 3, null, T.STATUE); put(cu - 3, cv + 3, null, T.STATUE); put(cu + 3, cv + 3, null, T.STATUE); break;
    case 'oasis':
      for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (inEl(u, v, 3.5, 2.5) && !onAve(u, v)) put(u, v, T.WATER, 0);
      for (let a = 0; a < 8; a++) { const an = a / 8 * 6.283, u = Math.round(cu + Math.cos(an) * 6.5), v = Math.round(cv + Math.sin(an) * 4.8); if (!onAve(u, v)) put(u, v, null, T.PALM); } break;
    case 'fountain_anchor': put(cu - 1, cv - 1, null, T.FOUNTAIN); put(cu, cv - 1, null, T.FOUNTAIN); put(cu - 1, cv, null, T.FOUNTAIN); put(cu, cv, null, T.FOUNTAIN); break;
    case 'bonfire': put(cu - 3, cv - 3, null, T.BONFIRE); for (const [dx, dy] of [[-5, -4], [5, -4], [-5, 4], [5, 4]]) put(cu + dx, cv + dy, null, T.TOTEM); break;
    case 'holo': for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) put(cu + dx, cv + dy, null, T.HOLO); break;
    case 'lagoon':
      for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (inEl(u, v, 4.5, 4.5)) put(u, v, T.WATER, 0);
      for (let i = -7; i <= 6; i++) for (const d of [-1, 0]) { put(cu + i, cv + d, T.DOCK, 0); put(cu + d, cv + i, T.DOCK, 0); } break;
    case 'forge_lava':
      for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (inEl(u, v, 3.5, 2.8)) put(u, v, T.LAVA, 0);
      bridge(6); put(cu - 8, cv - 4, null, T.FORGE); put(cu + 7, cv - 4, null, T.FORGE); break;
    case 'mushroom_lake':
      for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (inEl(u, v, 4.5, 3.5)) put(u, v, T.WATER, 0);
      bridge(6); for (let a = 0; a < 10; a++) { const an = a / 10 * 6.283, u = Math.round(cu + Math.cos(an) * 8), v = Math.round(cv + Math.sin(an) * 6.5); if (!onAve(u, v)) put(u, v, null, T.MUSHROOM); } break;
  }
  const quarters = quartersFor(c.style), quarter = (x, y) => (y < oy + cv ? 0 : 2) + (x < ox + cu ? 0 : 1);   // quartieri: stessi stili alternati di prima (identità della città)
  // 3) edifici: sentiero davanti alla porta fino alla strada, poi l'edificio vero (ruolo) o la casa chiusa; le decorative sono blocchi pieni
  for (const b of p.b) {
    const target = b.door === 'HV' ? p.HV : b.door === 'SS' ? p.sS : typeof b.door === 'number' ? b.door : null, px = b.u + (b.w >> 1) - 1;
    if (target != null && target > b.v + b.h) paint(px, b.v + b.h, 3, target - (b.v + b.h));
    for (let j = b.v - 1; j < b.v + b.h + 1; j++) for (let i = b.u - 1; i < b.u + b.w + 1; i++) if (grid[j] && i >= 0 && i < W && !grid[j][i]) grid[j][i] = 1;
    if (['hall', 'inn', 'shop', 'house'].includes(b.role)) buildingAt(m, ox + b.u, oy + b.v, b.w, b.h, `${s.id}_${b.role}`, st, road);
    else if (b.role === 'casa') { const q = quarter(ox + b.u, oy + b.v); buildingAt(m, ox + b.u, oy + b.v, b.w, b.h, `house_${ox + b.u}_${oy + b.v}`, (quarters[q] || quarters[0]).style, road, { shut: true }); (m.houses ||= []).push({ x: ox + b.u, y: oy + b.v, w: b.w, h: b.h, q, town: null }); }
    else { const qs = (quarters[quarter(ox + b.u, oy + b.v)] || quarters[0]).style; for (let j = 0; j < b.h; j++) for (let i = 0; i < b.w; i++) put(b.u + i, b.v + j, road, j < 2 ? qs.roof : qs.wall); }
  }
  // 4) arredi su tile libere e a distanza: lampioni lungo i viali, panche attorno alla piazza, casse e botti ai lati di locanda e bottega,
  //    bacheca accanto alla sala, pozzo e carretto, e la fascia nord vuota riempita con gli elementi tipici della città
  const free = (u, v, r = 1) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const a = grid[v + j] && grid[v + j][u + i]; if (a === undefined || a !== 0) return false; } return true; };
  const taken = [], ok = (u, v, r = 1, d = 3) => free(u, v, r) && !taken.some(([a, b]) => Math.abs(a - u) < d && Math.abs(b - v) < d);
  const drop = (t, u, v) => { taken.push([u, v]); grid[v][u] = 2; put(u, v, null, t); };
  for (const [u, v] of p.lamps) { grid[v][u] = 2; put(u, v, null, T.LANTERN); }
  for (let a = 0; a < 8; a++) { const an = a / 8 * 6.283 + 0.39, u = Math.round(cu + Math.cos(an) * (p.rx + 2)), v = Math.round(cv + Math.sin(an) * (p.ry + 2)); if (ok(u, v)) drop(T.BENCH, u, v); }
  for (const b of p.b) { if ((b.role === 'shop' || b.role === 'inn') && ok(b.u + b.w + 1, b.v + b.h - 2)) drop(b.role === 'shop' ? T.CRATE : T.BARREL, b.u + b.w + 1, b.v + b.h - 2); if (b.role === 'hall' && ok(b.u - 3, b.v + b.h - 2)) drop(T.SIGN, b.u - 3, b.v + b.h - 2); }
  const extra = [T.WELL, T.CART, T.FLOWERS, T.FLOWERS]; let k = 0;
  for (let v = 2; v < H - 2; v++) for (let u = 2; u < W - 2; u++) if (rnd(u, v + 7) < 0.012 && ok(u, v, 2)) drop(extra[k++ % extra.length], u, v);
  if (p.sN == null) { const fill = FILL[c.center] || [T.FLOWERS]; let f = 0; for (let v = 3; v < p.civicV - 2; v += 3) for (let u = 3; u < W - 3; u += 4) { const uu = u + Math.floor(rnd(u, v) * 3), vv = v + Math.floor(rnd(v, u) * 2); if (ok(uu, vv, 1)) drop(fill[f++ % fill.length], uu, vv); } }
  if (c.center === 'arena') for (let v = 4; v < H - 1; v += 3) for (let u = 3; u < W - 3; u += 3) if (rnd(u, v + 3) < 0.4 && ok(u, v, 2, 5)) drop(T.PINE, u, v);   // pini marittimi nelle aree aperte
  poi(m, ox + cu, oy + cv, c.name, 'town'); m.anchors['town_' + s.id] = { x: ox + cu, y: oy + Math.min(H - 2, cv + p.ry + 1) };
}
