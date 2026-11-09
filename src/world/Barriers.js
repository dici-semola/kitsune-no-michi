// Sigilla i confini tra regni di "tier" diverso con barriere di progressione. Per costruzione ogni passaggio a piedi dal tier inferiore al
// superiore attraversa almeno una cella-barriera (si bloccano TUTTE le celle di confine percorribili), quindi non esistono scorciatoie.
import { T, DEFS } from '../data/tiles.js';
import { REALM_TIER, TIER_REQ, KINDS, gateDialogue } from '../data/gates.js';
import { NPCS } from '../data/npcs.js';
import { DIALOGUES } from '../data/dialogues.js';
import { poi } from './Generators.js';

const L = (top, bottom, hair, extra = {}) => ({ top, bottom, hair, skin: '#e8c49a', sash: '#6a4a2a', ...extra });
const PEOPLE_LOOKS = [L('#6a7a5a', '#4a3a2a', '#3a2a1a', { hat: 1 }), L('#8a5a4a', '#3a3a50', '#c8c8c0', { beard: 1, staff: 1 }), L('#5a6a8a', '#4a4a4a', '#2a2018', { scarf: 1, scarfCol: '#a05030' }),
  L('#7a6a4a', '#3a2a1a', '#4a3020', { apron: 1, bandana: 1 }), L('#7a8aa0', '#3a4050', '#222', { helm: 1 }), L('#a07a3a', '#5a3a2a', '#6a4a20', { straw: 1 })];
const walkable = (m, x, y) => {
  if (!m.inb(x, y)) return false;
  const i = y * m.w + x, o = m.obj[i], go = o ? DEFS[o] : null, gg = DEFS[m.ground[i]];
  return !(go && go.solid) && !gg.solid && gg.liquid !== 'deep' && gg.liquid !== 'lava';
};

export function placeBarriers(m, realm) {
  const { w, h } = m, tier = (x, y) => REALM_TIER[realm[y * w + x]] || 0;
  const mark = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const tb = tier(x, y);
    if (!tb || !walkable(m, x, y)) continue;
    for (let dy = -1; dy <= 1 && !mark[y * w + x]; dy++) for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || tier(x + dx, y + dy) >= tb || !walkable(m, x + dx, y + dy)) continue;
      mark[y * w + x] = tb; break;
    }
  }
  // cluster connessi (8-vicinato, salto di 2 celle) → una barriera ciascuno
  const seen = new Uint8Array(w * h), clusters = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (!mark[i] || seen[i]) continue;
    const cells = [], st = [[x, y]]; seen[i] = 1;
    while (st.length) {
      const [cx, cy] = st.pop(); cells.push([cx, cy]);
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = cx + dx, ny = cy + dy, k = ny * w + nx; if (nx >= 0 && ny >= 0 && nx < w && ny < h && mark[k] && !seen[k]) { seen[k] = 1; st.push([nx, ny]); } }
    }
    clusters.push({ cells, tier: mark[i] });
  }
  m.barriers = [];
  const roads = m.roadSet || new Set(), counters = { 1: 0, 2: 0, 3: 0 };
  // Un confine ha spesso molti varchi minuscoli: solo quelli con una strada (e almeno uno per regno) diventano "porte" apribili, gli altri
  // vengono richiusi in modo permanente (roccia o acque profonde), così il mondo resta navigabile ma senza scorciatoie.
  for (const c of clusters) c.road = c.cells.some(([x, y]) => roads.has(y * w + x));
  const doorOf = new Set(clusters.filter((c) => c.road));
  const best = {};
  for (const c of clusters) { const r = realm[c.cells[0][1] * w + c.cells[0][0]]; if (!best[r] || c.cells.length > best[r].cells.length) best[r] = c; }
  for (const r of Object.keys(best)) if (![...doorOf].some((c) => realm[c.cells[0][1] * w + c.cells[0][0]] === +r)) doorOf.add(best[r]);
  const permanent = (x, y) => { const i = y * w + x; if (DEFS[m.ground[i]].liquid) { m.ground[i] = T.DEEP; m.obj[i] = 0; } else m.obj[i] = T.ROCK; };
  let n = -1;
  for (const c0 of clusters) {
    if (!doorOf.has(c0)) { for (const [x, y] of c0.cells) permanent(x, y); continue; }
    n++;
    // la porta è un tratto breve attorno alla strada (o al centro); il resto del confine è sigillato per sempre
    const rc = c0.cells.filter(([x, y]) => roads.has(y * w + x)), ref = rc.length ? rc[rc.length >> 1] : c0.cells[c0.cells.length >> 1];
    const sorted = [...c0.cells].sort((a, b) => ((a[0] - ref[0]) ** 2 + (a[1] - ref[1]) ** 2) - ((b[0] - ref[0]) ** 2 + (b[1] - ref[1]) ** 2));
    const keep = Math.min(sorted.length, 10), c = { cells: sorted.slice(0, keep), tier: c0.tier };
    for (const [x, y] of sorted.slice(keep)) permanent(x, y);
    const water = c.cells.filter(([x, y]) => DEFS[m.ground[y * w + x]].liquid).length > c.cells.length / 2;
    const k = counters[c.tier]++;
    const kind = water ? 'plank' : c.tier === 1 ? 'boulder' : c.tier === 2 ? (k % 2 ? 'gate' : 'rubble') : (k % 2 ? 'rubble' : 'ice');
    const K = KINDS[kind], req = TIER_REQ[c.tier], id = `b${n}`;
    for (const [x, y] of c.cells) { m.setO(x, y, K.tile); if (water) m.setG(x, y, m.ground[y * w + x]); }
    const cx = Math.round(c.cells.reduce((a, q) => a + q[0], 0) / c.cells.length), cy = Math.round(c.cells.reduce((a, q) => a + q[1], 0) / c.cells.length);
    const b = { id, kind, tier: c.tier, req, cells: c.cells, cx, cy, hp: K.hits, realm: realm[c.cells[0][1] * w + c.cells[0][0]], who: ['Viandante', 'Pellegrino', 'Carovaniere', 'Boscaiolo', 'Guardia del passo', 'Mercante'][n % 6], n };
    m.barriers.push(b);
    poi(m, cx, cy, K.name.replace(/^un[a]? /, '').replace(/^./, (s) => s.toUpperCase()), 'barrier');
  }
  // Il guardiano sta sul lato "aperto" (tier inferiore), su un tile raggiungibile dall'inizio (barriere considerate aperte).
  const bt = new Set(Object.values(KINDS).flatMap((K) => [K.tile, K.crack].filter(Boolean)));
  const free2 = (x, y) => { if (!m.inb(x, y)) return false; const i = y * w + x, o = m.obj[i]; const go = o ? DEFS[o] : null, gg = DEFS[m.ground[i]]; return (!(go && go.solid) || bt.has(o)) && !gg.solid && gg.liquid !== 'deep' && gg.liquid !== 'lava'; };
  const st = m.anchors.start, reach = new Uint8Array(w * m.h), q = [[st.x, st.y]]; reach[st.y * w + st.x] = 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (free2(nx, ny) && !reach[ny * w + nx]) { reach[ny * w + nx] = 1; q.push([nx, ny]); } } }
  m.props = m.props.filter((p) => p.type !== 'item' || reach[p.y * w + p.x]); // risorse rimaste murate dai sigilli permanenti
  for (const b of m.barriers) {
    let spot = null, bd = 1e9;
    for (let r = 1; r < 10 && !spot; r++) for (const [x, y] of b.cells) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx, ny = y + dy; if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || !m.inb(nx, ny) || !reach[ny * w + nx] || !walkable(m, nx, ny) || tier(nx, ny) >= b.tier || DEFS[m.ground[ny * w + nx]].liquid || m.safe[ny * w + nx]) continue;
      const d = (nx - b.cx) ** 2 + (ny - b.cy) ** 2; if (d < bd) { bd = d; spot = [nx, ny]; }
    }
    if (!spot) continue;
    const nid = `gk_${b.id}`;
    NPCS[nid] = { n: b.who, look: PEOPLE_LOOKS[b.n % PEOPLE_LOOKS.length], quirk: b.kind === 'gate' ? ['patrol'] : ['bubble'], shouts: ['Il passo è sbarrato…'], at: { map: 'overworld', x: spot[0], y: spot[1] }, dialogue: `gate_${b.id}`, lantern: 1 };
    DIALOGUES[`gate_${b.id}`] = gateDialogue(b, b.who);
    b.npc = nid;
  }
  return m.barriers.length;
}
