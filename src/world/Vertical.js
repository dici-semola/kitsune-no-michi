// Sviluppo verticale dell'ambiente: rocce -> montagne a piani, alberi -> silhouette alte e varie per bioma, monumenti -> sprite alti.
// Importante: SOLO grafica. Ogni cella solida resta solida e ogni cella libera resta libera, quindi connettività e collisioni sono identiche a prima
// (la collisione di un albero alto è il tronco, cioè il suo tile di base; la chioma è disegnata sopra senza bloccare).
import { T, DEFS, MTN } from '../data/tiles.js';
import { BIOME_IDS } from '../data/world.js';
import { hash2 } from '../core/Util.js';

const H = (x, y, s = 0) => hash2(x * 7 + s, y * 13 + s * 3, 11);
const ROCKY = new Set([T.ROCK, T.CANYONWALL, T.ICEWALL, T.HELLROCK, T.OBSIDIAN, T.VOLCANOCONE]);
const COLD = new Set(['snow', 'tundra', 'mountain']);

function palOf(tile, biome) {
  if (tile === T.CANYONWALL) return 'canyon';
  if (tile === T.ICEWALL) return 'ice';
  if (tile === T.HELLROCK || tile === T.OBSIDIAN || tile === T.VOLCANOCONE) return 'volcano';
  if (biome === 'volcano') return 'volcano';
  if (biome === 'canyon' || biome === 'badlands') return 'canyon';
  return COLD.has(biome) ? 'snow' : 'rock';
}

export function verticalize(m) {
  const w = m.w, h = m.h, n = w * h, obj = m.obj, protect = new Uint8Array(n);
  // celle da non toccare: città, ancore, portali, oggetti interattivi
  for (let i = 0; i < n; i++) if (m.safe[i]) protect[i] = 1;
  const guard = (x, y, r = 1) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (m.inb(x + i, y + j)) protect[(y + j) * w + x + i] = 1; };
  for (const a of Object.values(m.anchors)) guard(a.x, a.y, 1);
  for (const p of m.portals) guard(p.x, p.y, 1);
  for (const p of m.props) guard(p.x, p.y, 0);
  const biomeAt = (i) => BIOME_IDS[m.zone[i]] || 'meadow';
  const st = { mountain: 0, trees: 0, mont: 0, bush: 0 };

  // ---- 1) montagne: cluster di rocce, piani più alti dietro (nord) e più bassi davanti (sud) ----
  const seen = new Uint8Array(n);
  for (let i0 = 0; i0 < n; i0++) {
    if (seen[i0] || !ROCKY.has(obj[i0])) continue;
    const comp = [i0]; seen[i0] = 1;
    for (let q = 0; q < comp.length; q++) {
      const i = comp[q], x = i % w, y = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const ni = ny * w + nx; if (!seen[ni] && ROCKY.has(obj[ni])) { seen[ni] = 1; comp.push(ni); } }
    }
    if (comp.length < 4) continue;                                        // rocce isolate: restano massi singoli
    for (const i of comp) {
      if (protect[i]) continue;
      const x = i % w, y = (i / w) | 0;
      let depth = 0; for (let k = 1; k <= 4; k++) { const j = i + k * w; if (y + k < h && ROCKY.has(obj[j])) depth = k; else break; }
      let up = 0; for (let k = 1; k <= 4; k++) { const j = i - k * w; if (y - k >= 0 && ROCKY.has(obj[j])) up = k; else break; }
      // più "profonda" è la cella (più roccia davanti a sud) più è alta; la riga più a nord di una massa spesso diventa una cresta con picco
      const r = H(x, y);
      let tall = depth === 0 ? (r < 0.5 ? 8 : 16) : depth === 1 ? (r < 0.5 ? 16 : 32) : depth === 2 ? (r < 0.4 ? 32 : 48) : 48;
      if (up === 0 && depth >= 1 && r > 0.6) tall = 48;                      // cresta: picchi sul bordo settentrionale
      else if (comp.length < 9) tall = Math.min(tall, 16);                   // gruppi piccoli: colline basse
      obj[i] = MTN[palOf(obj[i], biomeAt(i))][tall]; st.mountain++;
    }
  }

  // ---- 2) vegetazione ----
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, o = obj[i];
    if (protect[i] || !o) continue;
    const b = biomeAt(i), r = H(x, y, 3), r2 = H(x, y, 5);
    let to = 0;
    if (o === T.TREE || o === T.GIANTTREE) {
      if (o === T.GIANTTREE) to = T.OAKANCIENT;
      else if (COLD.has(b)) to = r < 0.35 ? T.PINE24 : r < 0.7 ? T.PINE32S : T.PINE40S;
      else if (b === 'swamp' || b === 'haunted') to = r < 0.5 ? T.TWISTED24 : T.TWISTED32;
      else if (b === 'jade' || b === 'ancient') to = r < 0.3 ? T.CYPRESS24 : r < 0.6 ? T.CYPRESS32 : r < 0.8 ? T.OAK32 : T.TREE;
      else if (b === 'tropical' || b === 'ocean') to = r < 0.3 ? T.TROPIC24 : r < 0.6 ? T.TROPIC32 : r < 0.8 ? T.PALM28 : T.PALM36;
      else if (b === 'forest' || b === 'enchanted') to = r < 0.25 ? T.OAK24 : r < 0.5 ? T.OAK32 : r < 0.72 ? T.PINE32 : r < 0.85 ? T.PINE40 : T.TREE;
      else to = r < 0.4 ? T.OAK24 : r < 0.65 ? T.OAK32 : r < 0.8 ? T.CYPRESS24 : T.TREE;
    } else if (o === T.PINE) to = COLD.has(b) ? (r < 0.4 ? T.PINE32S : T.PINE40S) : (r < 0.4 ? T.PINE32 : T.PINE40);
    else if (o === T.PALM) to = r < 0.5 ? T.PALM28 : T.PALM36;
    else if (o === T.DEADTREE) to = r < 0.5 ? T.TWISTED24 : T.TWISTED32;
    if (to) { obj[i] = to; st.trees++; }
    void r2;
  }
  // alberi monumentali: tre celle di bosco affiancate (stessa riga) diventano un solo albero secolare dalla chioma larga; solo il tronco centrale è solido
  let last = -99;
  for (let y = 3; y < h - 3; y++) for (let x = 3; x < w - 3; x++) {
    const i = y * w + x, b = biomeAt(i);
    if (!(b === 'forest' || b === 'enchanted' || b === 'ancient' || b === 'jade' || b === 'meadow') || protect[i] || H(x, y, 9) < 0.985) continue;
    if (x - last < 24) continue;
    const L = i - 1, R = i + 1; if (protect[L] || protect[R] || protect[i]) continue;
    const ok = (j) => !protect[j] && (DEFS[obj[j]] ? DEFS[obj[j]].tall > 0 || obj[j] === T.TREE : !obj[j]) && !(obj[j] && DEFS[obj[j]].barrier);
    if (!ok(L) || !ok(R) || !ok(i)) continue;
    // lascia libera la riga sotto il tronco: il monumento non deve chiudere un passaggio
    if (m.passable(x, y + 1, null) === false && obj[i + w] && DEFS[obj[i + w]].solid) continue;
    obj[L] = T.MONTREE_L; obj[i] = T.MONTREE_M; obj[R] = T.MONTREE_R; last = x; st.mont++;
  }
  // ---- 3) vegetazione bassa: cespugli (non bloccano) vicino ai boschi ----
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x; if (obj[i] || protect[i]) continue;
    const g = m.ground[i]; if (g !== T.GRASS && g !== T.JUNGLE && g !== T.MAGICGRASS && g !== T.DEADGRASS) continue;
    const b = biomeAt(i); if (b === 'desert' || b === 'snow' || b === 'canyon') continue;
    let near = false; for (const j of [i - 1, i + 1, i - w, i + w]) if (obj[j] && DEFS[obj[j]].tall > 0) near = true;
    if (near ? H(x, y, 21) < 0.16 : H(x, y, 23) < 0.012) { obj[i] = H(x, y, 25) < 0.5 ? T.BUSH : T.BUSH2; st.bush++; }
  }
  // ---- 4) monumenti: pagode, statue e colonne diventano sprite alti ----
  for (let i = 0; i < n; i++) {
    const o = obj[i]; if (!o) continue;
    if (o === T.PAGODA) obj[i] = T.PAGODA_T; else if (o === T.STATUE) obj[i] = T.STATUE_T; else if (o === T.COLUMN) obj[i] = T.PCOLUMN;
  }
  m.vertical = st;
  return m;
}
