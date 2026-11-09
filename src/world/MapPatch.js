// Sistema di patch delle mappe: i dati scritti dal Map Editor (map-editor/data/*.json) vengono compilati in src/data/mapPatches.js
// e applicati qui sopra alla mappa generata dal codice. Il generatore resta la base, la patch è solo la differenza:
// niente seconda copia delle mappe che possa diventare incoerente, e le mappe originali non si perdono mai.
//
// Formato di una patch (v1), tutto opzionale tranne v e map:
//  cells   [[x, y, g, o, p], ...]   g = terreno, o = oggetto (0 = rimuovi), p = fisica; -1 = invariato
//                                    p: 0 = standard, 1 = SOLIDO forzato (anche per chi vola), 2 = LIBERO forzato (le barriere di progressione restano)
//  rules   { g: {tileId: 'free'|'block'}, o: {...} }   fisica per tipo di tile, valida su tutta la mappa (le celle esplicite hanno la precedenza)
//  props   { add: [{uid, ...def}], del: [chiave], mod: {chiave: {campi}} }
//  spawns  { add: [...], del: [chiave], mod: {chiave: {...}} }
//  portals { add: [...], del: [chiave], mod: {chiave: {...}} }
//  anchors { nome: {x,y} | null }
//  boss    {id,x,y} | null
//  npcs    { id: {x,y,solid?,del?,clone?} }
//  seed    solo Limbo: le celle valgono solo per quel seed (le regole valgono sempre)
export const PATCH_VERSION = 1;
export const emptyPatch = (map) => ({ v: PATCH_VERSION, map, cells: [], rules: { g: {}, o: {} }, props: { add: [], del: [], mod: {} }, spawns: { add: [], del: [], mod: {} }, portals: { add: [], del: [], mod: {} }, anchors: {}, boss: undefined, npcs: {} });

// chiave stabile di un elemento della mappa generata (le liste sono deterministiche, ma un indice cambierebbe se il generatore cambia)
export function keyed(list, keyFn) {
  const seen = new Map();
  return list.map((it) => { let k = keyFn(it); const n = seen.get(k) || 0; seen.set(k, n + 1); if (n) k += '#' + n; return [k, it]; });
}
export const propKey = (d) => (d.id ? `${d.type}:${d.id}` : `${d.type}@${d.x},${d.y}`);
export const spawnKey = (s) => `spawn@${s.x},${s.y},${s.table}`;
export const portalKey = (p) => `portal:${p.to}@${p.x},${p.y}`;

// patch id di una mappa: il Limbo ha una patch per ciascuna delle 5 conformazioni
export const patchIdOf = (m) => (m.id === 'limbo' ? `limbo~${m.limbo ? m.limbo.cfg : (m.def.cfg ?? 0)}` : m.id);

const clone = (o) => JSON.parse(JSON.stringify(o));

// Liste di entità della mappa (oggetti, spawn, portali, ancore, boss) = lista generata + modifiche della patch
export function applyEntities(m, P) {
  const edit = (list, keyFn, E) => {
    if (!E) return list;
    const del = new Set(E.del || []), mod = E.mod || {}, out = [];
    for (const [k, it] of keyed(list, keyFn)) { if (del.has(k)) continue; out.push(mod[k] ? { ...it, ...clone(mod[k]) } : it); }
    for (const a of E.add || []) { const c = clone(a); delete c.uid; out.push(c); }
    return out;
  };
  m.props = edit(m.props, propKey, P.props);
  m.spawns = edit(m.spawns, spawnKey, P.spawns);
  m.portals = edit(m.portals, portalKey, P.portals);
  for (const [name, a] of Object.entries(P.anchors || {})) { if (a) m.anchors[name] = { x: a.x, y: a.y }; else delete m.anchors[name]; }
  if (P.boss === null) m.boss = null; else if (P.boss) m.boss = { ...(m.boss || {}), ...clone(P.boss) };
}

export function applyPatch(m, P) {
  if (!P || P.v !== PATCH_VERSION) return m;
  const n = m.w * m.h;
  const seedOk = P.seed == null || !m.limbo || P.seed === m.limbo.seed;
  const rules = P.rules || {};
  const hasRules = Object.keys(rules.g || {}).length || Object.keys(rules.o || {}).length;
  if (hasRules || (P.cells && P.cells.length)) { if (!m.phys) m.phys = new Uint8Array(n); }
  // 1) regole per tipo di tile
  if (hasRules && m.phys) {
    const code = (v) => (v === 'free' ? 2 : v === 'block' ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const ro = rules.o && m.obj[i] ? code(rules.o[m.obj[i]]) : 0;
      const rg = rules.g ? code(rules.g[m.ground[i]]) : 0;
      if (ro) m.phys[i] = ro; else if (rg) m.phys[i] = rg;
    }
  }
  // 2) celle esplicite (terreno, oggetto, fisica)
  if (seedOk) for (const [x, y, g, o, p] of P.cells || []) {
    if (!m.inb(x, y)) continue;
    const i = y * m.w + x;
    if (g >= 0) m.ground[i] = g;
    if (o >= 0) m.obj[i] = o;
    if (p >= 0) m.phys[i] = p;
  }
  applyEntities(m, P);
  m.patched = true;
  return m;
}

// PNG: la loro posizione è nei dati globali (NPCS[id].at); la patch la sovrascrive con una posizione assoluta sulla mappa.
const NPC_ORIG = new Map(), NPC_MADE = new Set();
export function resetNpcs(NPCS) {
  for (const id of NPC_MADE) delete NPCS[id];
  NPC_MADE.clear();
  for (const [id, o] of NPC_ORIG) { if (NPCS[id]) { NPCS[id].at = o.at; if (o.solid === undefined) delete NPCS[id].solid; else NPCS[id].solid = o.solid; } }
}
export function applyNpcPatches(NPCS, patches) {
  resetNpcs(NPCS);
  for (const P of Object.values(patches || {})) {
    if (!P || !P.npcs) continue;
    for (const [id, e] of Object.entries(P.npcs)) {
      if (e.clone && !NPCS[id]) {
        if (!NPCS[e.clone]) continue;
        NPCS[id] = { ...NPCS[e.clone], n: e.n || NPCS[e.clone].n }; NPC_MADE.add(id);
      }
      const d = NPCS[id]; if (!d) continue;
      if (!NPC_ORIG.has(id) && !NPC_MADE.has(id)) NPC_ORIG.set(id, { at: d.at, solid: d.solid });
      const map = String(P.map).replace(/~.*/, '');
      if (e.del) d.at = { ...d.at, map: '__rimosso__' };
      else if (e.x !== undefined) d.at = { map, x: e.x, y: e.y };
      if (e.solid !== undefined) d.solid = e.solid;
    }
  }
}

// Validazione di una mappa già patchata (usata dall'editor prima di "Applica al gioco" e dai test)
export function validateMap(m, ctx = {}) {
  const errs = [], warns = [];
  const { DEFS, MAPS } = ctx;
  for (let i = 0; i < m.w * m.h; i++) {
    if (DEFS && (!DEFS[m.ground[i]] || DEFS[m.ground[i]].obj)) { errs.push(`terreno non valido in ${i % m.w},${(i / m.w) | 0}: ${m.ground[i]}`); break; }
    if (DEFS && m.obj[i] && (!DEFS[m.obj[i]] || !DEFS[m.obj[i]].obj)) { errs.push(`oggetto non valido in ${i % m.w},${(i / m.w) | 0}: ${m.obj[i]}`); break; }
  }
  const inb = (e) => m.inb(e.x, e.y);
  for (const p of m.props) if (!inb(p)) errs.push(`oggetto "${propKey(p)}" fuori mappa (${p.x},${p.y})`);
  for (const s of m.spawns) if (!inb(s)) errs.push(`spawn fuori mappa (${s.x},${s.y})`);
  for (const p of m.portals) { if (!inb(p)) errs.push(`portale fuori mappa (${p.x},${p.y})`); if (MAPS && !MAPS[p.to]) errs.push(`portale verso mappa inesistente: ${p.to}`); }
  for (const [k, a] of Object.entries(m.anchors)) if (!inb(a)) errs.push(`ancora "${k}" fuori mappa`);
  if (m.boss && !inb(m.boss)) errs.push('boss fuori mappa');
  const start = m.anchors.entry || m.anchors.start;
  if (start && !m.passable(start.x, start.y, null)) errs.push(`il punto di ingresso (${start.x},${start.y}) non è percorribile`);
  if (start && m.passable(start.x, start.y, null)) {
    const seen = m.floodWalk(start.x, start.y, null);
    for (const p of m.portals) if (inb(p) && !seen[p.y * m.w + p.x] && !m.passable(p.x, p.y, null)) { /* portale su cella solida: raggiungibile dai vicini */ }
    const near = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => m.inb(x + dx, y + dy) && seen[(y + dy) * m.w + x + dx]);
    for (const p of m.portals) if (inb(p) && !near(p.x, p.y)) warns.push(`portale verso ${p.to} (${p.x},${p.y}) non raggiungibile a piedi dall'ingresso`);
    if (m.boss && inb(m.boss) && !near(m.boss.x, m.boss.y)) warns.push('il boss non è raggiungibile a piedi dall\'ingresso');
  }
  return { errs, warns };
}
