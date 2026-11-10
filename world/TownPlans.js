// PIANIFICATORE DELLE PIANTE DEI CENTRI URBANI RESTANTI (Augusta, Sahar, Porto Marea, Kuru, Zero-Quartier, Coralia, Khaz-Dum, Nethermere).
// Parte dalle dimensioni reali del sito e dai cancelli veri: viali a croce allineati ai cancelli (stesso centro del generatore), una piazza centrale con il
// suo elemento caratteristico, fila civica (sala, locanda, bottega) sul viale, case in file regolari con sentiero davanti alla porta, decorative sul fondo.
// Ogni edificio ha almeno 2 tile di spazio ai lati; nessuna sovrapposizione (verificata da check()). Coordinate (u,v) relative all'angolo alto-sinistro.
export const SIZE = { hall: [11, 7], inn: [8, 6], shop: [8, 6], house: [6, 6], casa: [6, 6], deco: [7, 6] };
export const PLAZA = { arena: [11, 8], oasis: [9, 7], lagoon: [8, 8], fountain_anchor: [5, 5], bonfire: [7, 6], holo: [5, 5], forge_lava: [9, 6], mushroom_lake: [10, 9] };
const GAP = 3;

export function planTown(W, H, center, o = {}) {
  const AV = (W >> 1) - 1, HV = (H >> 1) - 1, cu = W >> 1, cv = H >> 1, [rx, ry] = PLAZA[center] || [5, 5];
  const out = { W, H, AV, HV, center, rx, ry, b: [], streets: [], lamps: [], paths: [] };
  const plaza = { u0: cu - rx, u1: cu + rx - 1, v0: cv - ry, v1: cv + ry - 1 };
  const queue = ['hall', 'inn', 'shop', 'house'];
  if (o.hallRight) { queue[0] = 'hall'; }
  let casas = 0;
  const filler = (i) => (i % 3 === 2 ? 'deco' : 'casa');
  // segmenti liberi di una fila (v..v+h-1): tolgo la fascia del viale (3 tile per lato) e la piazza se la fila la tocca
  const segments = (v, h) => {
    let segs = [[2, AV - 3], [AV + 4, W - 3]];
    if (v + h > plaza.v0 - 2 && v < plaza.v1 + 3) segs = segs.flatMap(([a, b]) => { const cut = [plaza.u0 - 2, plaza.u1 + 2]; if (cut[1] < a || cut[0] > b) return [[a, b]]; const r = []; if (cut[0] - 1 >= a) r.push([a, cut[0] - 1]); if (cut[1] + 1 <= b) r.push([cut[1] + 1, b]); return r; });
    return segs.filter(([a, b]) => b - a >= 5);
  };
  // riempie una fila: prende dalla coda gli elementi che stanno nel segmento (conservando l'ordine), poi distribuisce lo spazio in modo uniforme
  const fill = (v, pool, door, { civic = false, maxN = 99 } = {}) => {
    const hmax = Math.max(...pool.map((r) => SIZE[r][1])), segs = segments(v, hmax); let placed = 0;
    for (const [a, b] of segs) {
      const L = b - a + 1, take = []; let used = 0;
      for (const r of pool.slice()) { if (placed + take.length >= maxN) break; const w = SIZE[r][0]; if (used + w + (take.length ? GAP : 0) <= L) { take.push(r); used += w + (take.length > 1 ? GAP : 0); pool.splice(pool.indexOf(r), 1); } }
      if (!take.length) continue;
      const sum = take.reduce((s, r) => s + SIZE[r][0], 0), g = Math.max(GAP, Math.floor((L - sum) / (take.length + 1))); let u = a + Math.floor((L - sum - g * (take.length - 1)) / 2);
      for (const r of take) { out.b.push({ role: r, u, v, w: SIZE[r][0], h: SIZE[r][1], door }); u += SIZE[r][0] + g; }
      placed += take.length;
    }
    return placed;
  };
  const pool = (names) => names.slice();
  // file nord: civica (sala, locanda, bottega) a ridosso del viale orizzontale, eventuale fila di case più su
  const civicV = HV - 3 - SIZE.hall[1];
  const civicPool = ['hall', 'inn', 'shop'];
  fill(civicV, civicPool, 'HV', { civic: true });
  const hasN1 = civicV - 4 - 6 >= 3;
  const streetN = civicV - 4;
  let n1 = []; if (hasN1) { n1 = []; for (let i = 0; i < 12; i++) n1.push('casa'); fill(2, n1, streetN); out.streets.push([0, streetN, W, 2]); }
  // file sud: case in file, la prima è la casa del ruolo 'house'; strada sotto e decorative sul fondo
  const s1 = civicPool.concat(['house']); for (let i = 0; i < 12; i++) s1.push('casa');
  const s1V = HV + 5; fill(s1V, s1, 'SS');
  const streetS = s1V + 6 + 2; if (streetS + 2 <= H - 1) out.streets.push([0, streetS, W, 2]);
  const s2V = streetS + 2 + 2; if (s2V + 6 <= H - 1) { const dec = []; for (let i = 0; i < 12; i++) dec.push(i % 2 ? 'casa' : 'deco'); fill(s2V, dec, 'SS2'); }
  // viali
  out.civicV = civicV; out.sN = hasN1 ? streetN : null; out.sS = streetS + 2 <= H - 1 ? streetS : null;
  out.avenues = [[AV, 0, 2, H], [0, HV, W, 2]];
  out.plaza = plaza;
  // lampioni lungo i viali, ogni 6 tile, solo su tile libere
  const hit = (u, v) => out.b.some((q) => u >= q.u - 1 && u < q.u + q.w + 1 && v >= q.v - 1 && v < q.v + q.h + 1) || (u >= plaza.u0 - 1 && u <= plaza.u1 + 1 && v >= plaza.v0 - 1 && v <= plaza.v1 + 1);
  for (let u = 4; u < W - 3; u += 6) for (const v of [HV - 1, HV + 2]) if (!hit(u, v) && Math.abs(u - AV) > 2) out.lamps.push([u, v]);
  for (let v = 5; v < H - 3; v += 6) for (const u of [AV - 1, AV + 2]) if (!hit(u, v) && Math.abs(v - HV) > 2) out.lamps.push([u, v]);
  return out;
}

// controlli: sovrapposizioni, spazio minimo, ruoli obbligatori, dentro i confini, non sulla piazza e non sui viali
export function check(p) {
  const err = [], B = p.b;
  for (const r of ['hall', 'inn', 'shop', 'house']) if (B.filter((q) => q.role === r).length !== 1) err.push(`ruolo ${r}: ${B.filter((q) => q.role === r).length} (deve essere 1)`);
  B.forEach((a, i) => {
    if (a.u < 1 || a.v < 1 || a.u + a.w > p.W - 1 || a.v + a.h > p.H - 1) err.push(`${a.role}@${a.u},${a.v} fuori confine`);
    if (a.u < p.AV + 2 + 2 && a.u + a.w > p.AV - 2) err.push(`${a.role}@${a.u},${a.v} sul viale verticale`);
    if (a.v < p.HV + 2 + 2 && a.v + a.h > p.HV - 2 && (a.door !== 'HV' ? true : a.v + a.h > p.HV - 2)) { if (a.v + a.h > p.HV - 3 + 0 && a.v < p.HV + 4) err.push(`${a.role}@${a.u},${a.v} troppo vicino al viale orizzontale`); }
    const P = p.plaza; if (a.u < P.u1 + 2 && a.u + a.w > P.u0 - 1 && a.v < P.v1 + 2 && a.v + a.h > P.v0 - 1) err.push(`${a.role}@${a.u},${a.v} sulla piazza`);
    for (let j = i + 1; j < B.length; j++) { const c = B[j]; if (a.u < c.u + c.w + GAP && a.u + a.w + GAP > c.u && a.v < c.v + c.h + 1 && a.v + a.h + 1 > c.v) err.push(`${a.role}@${a.u},${a.v} troppo vicino a ${c.role}@${c.u},${c.v}`); }
  });
  return err;
}
