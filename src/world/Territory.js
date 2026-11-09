// Generatore dei territori esterni (vedi data/territori.js). Deterministico dal seed, pensato per mappe grandi (640x576):
//  - terra/mare con coste irregolari, mare basso (percorribile) negli arcipelaghi
//  - biomi in sequenza con FASCE DI TRANSIZIONE graduali (niente confini netti) e vegetazione mista
//  - dorsali montuose a creste (poi rese verticali da Vertical.js), con valichi
//  - laghi, strade che collegano i luoghi, rovine, accampamenti, circoli di pietre, torri, grotte segrete, santuari con skin di territorio
import { T, DEFS } from '../data/tiles.js';
import { MAPS, BIOME_IDS, SHRINES } from '../data/world.js';
import { TERRITORI } from '../data/territori.js';
import { fbm } from '../core/Util.js';
import { box, ring, blob, carve, idx, poi, addSpawns, stampShrine } from './Generators.js';

const BI = (name) => BIOME_IDS.indexOf(name);
// per ogni bioma: terreno, albero, densità, ornamenti, tipo di cresta
const BIO = {
  meadow: { g: [T.GRASS], tree: T.TREE, td: 0.03, deco: [[T.FLOWERS, 0.05], [T.BUSH, 0.012]] },
  forest: { g: [T.GRASS], tree: T.TREE, td: 0.27, giant: 0.0035, deco: [[T.BUSH, 0.03]] },
  enchanted: { g: [T.MAGICGRASS], tree: T.TREE, td: 0.13, deco: [[T.MUSHROOM, 0.03], [T.CRYSTAL, 0.004], [T.FLOWERS, 0.03]] },
  ancient: { g: [T.GRASS, T.COBBLE], tree: T.TREE, td: 0.05, deco: [[T.RUBBLE, 0.02], [T.COLUMN, 0.006], [T.BUSH, 0.02]] },
  swamp: { g: [T.SWAMP], tree: T.DEADTREE, td: 0.055, pool: 0.5, deco: [[T.BUSH, 0.02]] },
  haunted: { g: [T.DEADGRASS], tree: T.DEADTREE, td: 0.1, deco: [[T.GRAVE, 0.012], [T.BONES, 0.01]] },
  desert: { g: [T.SAND], tree: T.CACTUS, td: 0.012, rock: 0.008 },
  dunes: { g: [T.SAND], tree: T.PALM, td: 0.0015, rock: 0.004 },
  badlands: { g: [T.CANYON, T.DIRT], tree: T.CACTUS, td: 0.004, rock: 0.012, ridge: T.CANYONWALL, rs: 0.95 },
  canyon: { g: [T.CANYON], tree: T.CACTUS, td: 0.004, ridge: T.CANYONWALL, rs: 0.935 },
  plateau: { g: [T.DIRT, T.STONE], tree: T.TREE, td: 0.012, rock: 0.02, ridge: T.ROCK, rs: 0.945 },
  mountain: { g: [T.STONE, T.DIRT], tree: T.PINE, td: 0.02, rock: 0.03, ridge: T.ROCK, rs: 0.925 },
  tundra: { g: [T.SNOW], tree: T.PINE, td: 0.035, ridge: T.ICEWALL, rs: 0.945, lake: T.ICE },
  snow: { g: [T.SNOW], tree: T.PINE, td: 0.11, ridge: T.ICEWALL, rs: 0.94, lake: T.ICE },
  volcano: { g: [T.ASH], tree: 0, rock: 0.012, ridge: T.HELLROCK, rs: 0.935, lava: 0.5 },
  jade: { g: [T.GRASS], tree: T.BAMBOO, td: 0.14, deco: [[T.BUSH, 0.02]] },
  tropical: { g: [T.JUNGLE], tree: T.PALM, td: 0.15, deco: [[T.BUSH, 0.03], [T.FLOWERS, 0.03]] },
};

export function genTerritory(m, def) {
  const { w, h } = m, seed = def.seed, rng = m.rng, N = w * h, D = TERRITORI[def.territory], K = D.biomes.length, arch = D.sea === 'archipelago';
  const land = new Uint8Array(N), tag = new Uint8Array(N);       // tag: biome index (0..K-1)
  // 1) terra/mare e bioma di ogni cella
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, edge = Math.min(x, y, w - 1 - x, h - 1 - y);
    const cont = fbm(x * 0.0055 + 3, y * 0.0055 + 8, seed + 1, 3), isl = arch ? fbm(x * 0.03, y * 0.03, seed + 11, 3) : 0.5;
    let L = (arch ? 0.28 + (isl - 0.45) * 1.7 + (cont - 0.5) * 0.6 : 0.52 + (cont - 0.5) * 1.6) + (Math.min(1, edge / 60) - 0.6) * 0.62;
    land[i] = L > 0.42 ? 1 : 0;
    // bioma lungo un gradiente liscio + rumore ad alta frequenza = fasce di transizione miste (non lineari)
    const g1 = fbm(x * 0.0042 + 40, y * 0.0042 + 17, seed + 2, 3), n2 = fbm(x * 0.045, y * 0.045, seed + 3, 2);
    const u = Math.min(0.999, Math.max(0, 0.5 + (g1 - 0.5) * 1.5 + ((x / w + y / h) / 2 - 0.5) * 1.7 + (n2 - 0.5) * 0.3));   // 0..1 lungo il gradiente, con rumore per le fasce miste
    tag[i] = Math.min(K - 1, Math.floor(u * K)); m.zone[i] = BI(D.biomes[tag[i]]);
    // terreno base
    const bio = BIO[D.biomes[tag[i]]];
    if (L > 0.42) {
      let gt = bio.g[(Math.floor(x / 5) + Math.floor(y / 7)) % bio.g.length];
      if (L < 0.47) gt = T.SAND;                                            // spiaggia
      m.ground[i] = gt;
    } else m.ground[i] = L > (arch ? 0.12 : 0.34) ? T.WATER : T.DEEP;   // mare basso (percorribile) vicino alla costa; negli arcipelaghi quasi ovunque
  }
  // 2) elementi per bioma: vegetazione a densità graduale, ornamenti, rocce
  for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) {
    const i = y * w + x; if (!land[i] || m.ground[i] === T.SAND) continue;
    const name = D.biomes[tag[i]], bio = BIO[name], r = rng();
    const dens = fbm(x * 0.08, y * 0.08, seed + 5, 2);                       // radure e boschi: la densità varia nello spazio
    if (bio.tree && r < bio.td * (0.25 + dens * 1.6)) m.obj[i] = bio.tree;
    else if (bio.giant && r < bio.giant) m.obj[i] = T.GIANTTREE;
    else if (bio.rock && r < bio.rock) m.obj[i] = T.ROCK;
    else if (bio.deco) for (const [tile, p] of bio.deco) if (rng() < p) { m.obj[i] = tile; break; }
  }
  // 3) dorsali montuose a cresta: bande sottili dove il rumore "ridge" è alto; i valichi restano dove il rumore si abbassa
  for (let y = 4; y < h - 4; y++) for (let x = 4; x < w - 4; x++) {
    const i = y * w + x; if (!land[i]) continue; const bio = BIO[D.biomes[tag[i]]]; if (!bio.ridge) continue;
    const rid = 1 - Math.abs(fbm(x * 0.012 + 90, y * 0.012 + 33, seed + 7, 3) * 2 - 1), wob = fbm(x * 0.05, y * 0.05, seed + 8, 2);
    if (rid > bio.rs + 0.1 + (1 - wob) * 0.04 - 0.1 && (wob > 0.3)) { m.obj[i] = bio.ridge; if (rid > bio.rs + 0.12 && y + 1 < h) m.obj[i + w] = bio.ridge; }
  }
  // 4) acqua interna: laghi (con isole di terra), paludi, laghi di lava e ghiaccio. Il centro profondo è piccolo: la riva resta camminabile
  for (let y = 6; y < h - 6; y++) for (let x = 6; x < w - 6; x++) {
    const i = y * w + x; if (!land[i]) continue; const name = D.biomes[tag[i]], bio = BIO[name];
    const lk = fbm(x * 0.022 + 120, y * 0.022 + 55, seed + 9, 3);
    if (lk < 0.24 && !(bio.ridge && m.obj[i])) { m.obj[i] = 0; const dp = lk < 0.13; m.ground[i] = bio.lava && lk < 0.2 ? T.LAVA : dp ? T.DEEP : bio.lake ? T.ICE : T.WATER; }
    else if (bio.pool && lk < 0.34 && rng() < bio.pool) { m.obj[i] = 0; m.ground[i] = T.WATER; }
    else if (bio.lava && lk < 0.3 && rng() < 0.35) { m.obj[i] = 0; m.ground[i] = T.LAVA; }
  }
  // 5) approdo, strade e luoghi
  const free = (x, y) => m.inb(x, y) && land[idx(m, x, y)] && !DEFS[m.g(x, y)].liquid;
  const clearRect = (x, y, rw, rh, g) => { for (let j = y; j < y + rh; j++) for (let i = x; i < x + rw; i++) if (m.inb(i, j)) { m.setO(i, j, 0); if (g != null) m.setG(i, j, g); } };
  // approdo sulla costa meridionale: primo punto di terra libero scendendo dal centro
  let ex = w >> 1, ey = h - 30; for (let r = 0; r < 260; r += 2) { let ok = false; for (const dx of [0, r, -r]) for (let y = h - 14; y > h - 160; y--) if (free(ex + dx, y) && free(ex + dx + 2, y) && land[idx(m, ex + dx, y - 8)]) { ex += dx; ey = y; ok = true; break; } if (ok) break; }
  clearRect(ex - 4, ey - 6, 9, 9, T.SAND); m.setO(ex, ey + 1, T.PORTAL);
  m.portals.push({ x: ex, y: ey + 1, to: def.exit.to, anchor: def.exit.anchor }); m.anchors.entry = { x: ex, y: ey - 2 }; m.anchors.start = m.anchors.entry; poi(m, ex, ey + 1, 'Approdo (ritorno al mondo principale)', 'exit');
  // luoghi di interesse sparsi con distanza minima
  const spots = [{ x: ex, y: ey - 2, r: 20 }], pick = (minD, tries = 800) => { for (let k = 0; k < tries; k++) { const x = 40 + Math.floor(rng() * (w - 80)), y = 40 + Math.floor(rng() * (h - 80)); if (!free(x, y) || !free(x + 6, y + 5) || !free(x - 6, y - 5) || spots.some((s) => Math.hypot(s.x - x, s.y - y) < Math.max(minD, s.r))) continue; spots.push({ x, y, r: 0 }); return { x, y }; } return null; };
  const kinds = ['camp', 'shrine', 'ruins', 'stones', 'tower', 'grotto', 'ruins', 'camp', 'shrine', 'stones', 'grotto', 'ruins', 'tower', 'shrine', 'camp', 'grotto', 'ruins', 'stones'];
  const places = []; for (const k of kinds) { const p = pick(46); if (p) places.push({ kind: k, ...p }); }
  { const ap = pick(70, 2500); if (ap && D.boss) places.push({ kind: 'arena', ...ap }); }   // arena del guardiano (missione extra post storia)
  const chest = (n, x, y, tier) => m.props.push({ type: 'chest', id: `${m.id}_c${n}`, x, y, loot: [[tier > 1 ? 'pozione_vita_l' : 'pozione_vita_m', 1 + (n % 2)], [['ferro_grezzo', 'erba_medicinale', 'carbone', 'perla_grezza'][n % 4], 2 + (n % 3)]], gold: 120 + (n % 5) * 60 });
  const sign = (x, y, text) => m.props.push({ type: 'sign', sprite: 'sign', x, y, text });
  let n = 0;
  for (const p of places) {
    const { x, y } = p, name = D.biomes[tag[idx(m, x, y)]]; n++;
    if (p.kind === 'ruins') { // rovina antica: muri a pezzi, colonne spezzate, un forziere e un monito
      clearRect(x - 5, y - 4, 11, 9, T.COBBLE); ring(m, x - 5, y - 4, 11, 9, T.RUINWALL); for (let k = 0; k < 7; k++) m.setO(x - 5 + Math.floor(rng() * 11), y - 4 + (rng() < 0.5 ? 0 : 8), 0); m.setO(x, y + 4, 0); m.setO(x - 1, y + 4, 0);
      for (const [dx, dy] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) m.setO(x + dx, y + dy, rng() < 0.5 ? T.BROKENCOL : T.COLUMN); chest(n, x, y, 1); sign(x - 1, y + 3, 'Pietre antiche, scalpellate da una mano che non conosciamo. Qualcosa riposa qui sotto.'); poi(m, x, y, 'Rovine antiche', 'poi');
    } else if (p.kind === 'camp') { // accampamento abbandonato: tende, barili, falò spento e un baule dimenticato
      clearRect(x - 4, y - 3, 9, 7, T.PAVE_EARTH); m.setO(x - 2, y - 1, T.TENT); m.setO(x + 2, y - 1, T.TENT); m.setO(x, y + 1, T.CAMPFIRE); m.setO(x + 3, y + 1, T.BARREL); m.setO(x - 3, y + 2, T.CRATE); chest(n, x + 1, y - 2, 1); m.anchors.poi_camp = m.anchors.poi_camp || { x, y: y + 3 }; poi(m, x, y, 'Accampamento', 'poi');
      sign(x + 2, y + 3, 'Il fuoco è ancora tiepido. Chi viveva qui se n\'è andato in fretta.');
    } else if (p.kind === 'stones') { // circolo di pietre: totem e obelischi attorno a un forziere segreto
      clearRect(x - 5, y - 5, 11, 11, T.PAVE_IRR); for (let a = 0; a < 10; a++) { const ang = (a / 10) * 6.283; m.setO(x + Math.round(Math.cos(ang) * 4), y + Math.round(Math.sin(ang) * 4), a % 3 === 0 ? T.OBELISK : T.TOTEM); } m.setO(x + 4, y, 0); chest(n, x, y, 2); poi(m, x, y, 'Circolo di pietre', 'poi');
    } else if (p.kind === 'tower') { // torre di guardia in rovina, alta
      clearRect(x - 3, y - 3, 7, 7, T.COBBLE); m.setO(x, y - 1, T.TOWER_T); m.setO(x - 2, y + 1, T.BROKENCOL); m.setO(x + 2, y + 1, T.RUBBLE); sign(x + 1, y + 2, 'Torre di vedetta di un regno dimenticato.'); chest(n, x - 1, y + 2, 1); poi(m, x, y, 'Torre in rovina', 'poi');
    } else if (p.kind === 'grotto') { // luogo segreto: una macchia di rocce con un unico varco e due forzieri nascosti
      clearRect(x - 4, y - 4, 9, 9, T.STONE); ring(m, x - 4, y - 4, 9, 9, BIO[name].ridge || T.ROCK); m.setO(x - 4, y, 0); m.setO(x - 4, y - 1, 0); chest(n, x - 2, y - 1, 2); chest(n + 50, x + 2, y + 1, 2); poi(m, x, y, 'Luogo segreto', 'secret');
    } else if (p.kind === 'shrine') { // santuario con l'aspetto del territorio
      clearRect(x - 6, y - 5, 13, 11, null); stampShrine(m, `${m.id}_${n}`, x, y, 'Santuario'); shrineSkin(m, x, y, D.shrine, rng);
      sign(x + 2, y + 4, 'Un santuario isolato. L\'aria qui è ferma, come se ascoltasse.'); poi(m, x, y, 'Santuario', 'shrine');
    } else if (p.kind === 'arena') { // arena del guardiano: piazza lastricata con colonne, il boss dorme al centro
      clearRect(x - 7, y - 6, 15, 13, T.COBBLE); for (let k = 0; k < 10; k++) { const ang = (k / 10) * 6.283; m.setO(x + Math.round(Math.cos(ang) * 6.5), y + Math.round(Math.sin(ang) * 5.5), k % 2 ? T.BROKENCOL : T.COLUMN); }
      for (const [dx, dy] of [[0, 6], [1, 6], [-1, 6], [7, 0], [-7, 0], [0, -6]]) m.setO(x + dx, y + dy, 0);   // varchi in ogni direzione
      m.boss = { id: D.boss.id, x, y }; m.anchors.boss = { x, y }; poi(m, x, y, 'Arena di ' + D.boss.n, 'boss'); sign(x + 2, y + 5, 'Qui veglia ' + D.boss.n + '. Chi lo sfida non torna indietro con facilità.');
    }
  }
  // strade: l'approdo si collega ai luoghi più vicini (catena del vicino più prossimo), come sentieri battuti
  const nodes = [m.anchors.entry, ...places.map((p) => ({ x: p.x, y: p.y + 2 }))]; const done = [nodes[0]], rest = nodes.slice(1);
  while (rest.length) { let bi = 0, bd = 1e9, from = null; rest.forEach((q, qi) => done.forEach((d) => { const dd = Math.hypot(q.x - d.x, q.y - d.y); if (dd < bd) { bd = dd; bi = qi; from = d; } })); const q = rest.splice(bi, 1)[0]; done.push(q);
    const pts = [[from.x, from.y]], steps = Math.max(2, Math.floor(bd / 26)); for (let s = 1; s < steps; s++) { const u = s / steps; pts.push([Math.round(from.x + (q.x - from.x) * u + (rng() - 0.5) * 10), Math.round(from.y + (q.y - from.y) * u + (rng() - 0.5) * 10)]); } pts.push([q.x, q.y]);
    carve(m, pts, 2, D.biomes.includes('desert') || D.biomes.includes('dunes') ? T.PAVE_SAND : D.biomes.includes('snow') ? T.PAVE_ICE : T.PAVE_EARTH); }
  // 6) nemici per bioma (tabella per cella) e punti segnaposto
  const protectSpots = places.map((p) => ({ x: p.x, y: p.y }));
  addSpawns(m, 1800, (x, y) => BIOME_IDS[m.zone[idx(m, x, y)]] || 'meadow', { minFrom: [m.anchors.entry, ...protectSpots], minDist: 12 });
  m.territory = { places: places.length, id: def.territory };
  void MAPS; void SHRINES; void box; void blob;
}

// Santuario con skin del territorio: edera e vegetazione, rovina, pietra alta, sabbia monumentale, ghiaccio, mistico luminoso, vulcanico
export function shrineSkin(m, x, y, skin, rng) {
  const put = (dx, dy, t) => { if (m.inb(x + dx, y + dy) && !m.obj[idx(m, x + dx, y + dy)]) m.setO(x + dx, y + dy, t); }, floor = (g) => { for (let j = -4; j <= 5; j++) for (let i = -5; i <= 5; i++) if (!m.obj[idx(m, x + i, y + j)] && m.inb(x + i, y + j)) m.setG(x + i, y + j, g); };
  if (skin === 'ivy') { floor(T.PAVE_IRR); for (const [dx, dy] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) put(dx, dy, T.OAK32); for (let k = 0; k < 16; k++) put(Math.round((rng() - 0.5) * 10), Math.round((rng() - 0.5) * 8), rng() < 0.5 ? T.BUSH : T.BUSH2); put(-3, 0, T.BROKENCOL); put(3, 0, T.PCOLUMN); }
  else if (skin === 'ruin') { floor(T.COBBLE); for (const [dx, dy] of [[-4, -2], [4, -2], [-4, 2], [4, 2]]) put(dx, dy, T.BROKENCOL); put(-2, -4, T.RUBBLE); put(2, -4, T.RUBBLE); put(0, 4, T.RUBBLE); put(-5, 0, T.RUINWALL); put(5, 1, T.RUINWALL); }
  else if (skin === 'stone') { floor(T.STONE); for (const [dx, dy] of [[-4, -3], [4, -3], [-5, 1], [5, 1]]) put(dx, dy, T.OBELISK); put(0, -4, T.PINNACLE); }
  else if (skin === 'desert') { floor(T.PAVE_SAND); for (const [dx, dy] of [[-4, -2], [4, -2], [-4, 3], [4, 3]]) put(dx, dy, T.PCOLUMN); put(-5, 0, T.OBELISK); put(5, 0, T.OBELISK); put(0, -4, T.STATUE_T); }
  else if (skin === 'ice') { floor(T.PAVE_ICE); for (const [dx, dy] of [[-4, -3], [4, -3], [-5, 1], [5, 1], [-3, 4], [3, 4]]) put(dx, dy, T.ICEWALL); put(-2, -3, T.PINE40S); put(2, -3, T.PINE32S); put(0, -4, T.PINNACLE); }
  else if (skin === 'mystic') { floor(T.GOLDFLOOR); for (const [dx, dy] of [[-4, -2], [4, -2], [-4, 3], [4, 3]]) put(dx, dy, T.PEARL); put(-5, 0, T.CRYSTAL); put(5, 0, T.CRYSTAL); put(0, -4, T.PINNACLE); for (let k = 0; k < 6; k++) put(Math.round((rng() - 0.5) * 10), Math.round((rng() - 0.5) * 8), T.MUSHROOM); }
  else if (skin === 'volcano') { floor(T.ASH); for (const [dx, dy] of [[-4, -3], [4, -3], [-5, 1], [5, 1]]) put(dx, dy, T.OBSIDIAN); put(-3, 4, T.BRAZIER); put(3, 4, T.BRAZIER); for (const [dx, dy] of [[-6, 3], [6, 3]]) if (m.inb(x + dx, y + dy)) { m.setG(x + dx, y + dy, T.LAVA); m.setO(x + dx, y + dy, 0); } }
}

// Passaggi dal mondo principale: un portale in una baia vicino a ciascuna città di riferimento (richiede un livello minimo, come avviso)
export function stampTerritoryGates(m) {
  const used = m.portals.map((p) => ({ x: p.x, y: p.y }));
  for (const [id, D] of Object.entries(TERRITORI)) {
    const A = m.anchors['town_' + D.gate.town]; if (!A) continue;
    const seen = m.floodWalk(A.x, A.y, null); let best = null, bd = 1e9;
    for (let y = A.y - 110; y < A.y + 110; y++) for (let x = A.x - 110; x < A.x + 110; x++) {
      if (!m.inb(x, y)) continue; const i = idx(m, x, y), d = Math.hypot(x - A.x, y - A.y) + (m.ground[i] === T.WATER ? 0 : m.ground[i] === T.SAND ? 10 : 25);   // preferenza: baia in acqua bassa, poi spiaggia, poi qualunque riva sul mare profondo
      if (d < 12 || m.obj[i] || !seen[i] || m.safe[i] || !m.passable(x, y, null)) continue;
      if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => m.g(x + dx, y + dy) === T.DEEP)) continue;
      if (used.some((u) => Math.hypot(u.x - x, u.y - y) < 14)) continue;
      if (d < bd) { bd = d; best = [x, y]; }
    }
    if (!best) continue; const [x, y] = best; used.push({ x, y }); m.setO(x, y, T.PORTAL);
    m.portals.push({ x, y, to: id, anchor: 'entry', req: [['flag', 'game_cleared'], ['level', D.gate.level]], deny: `Il passaggio per ${D.n} è chiuso: si apre solo dopo aver concluso la storia principale, e serve almeno il livello ${D.gate.level}.` });
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dy]) => m.passable(x + dx, y + dy, null)) || [0, 1]; m.anchors['door_' + id] = { x: x + nb[0], y: y + nb[1] };
    poi(m, x, y, `Imbarco per ${D.n}`, 'stairs');
  }
}
