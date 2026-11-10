// Transizioni logiche fra ambienti: i confini fra biomi non sono più linee nette. Vicino al bordo il terreno si mescola a chiazze (come in natura), compare
// una vegetazione di passaggio, e gli accostamenti che non esistono in natura (neve contro deserto, ghiaccio contro mare tropicale, vulcano contro neve...)
// passano per una fascia intermedia di steppa asciutta, brughiera e rocce basse. Sulle coste fredde la spiaggia diventa ghiaccio e neve, sulle coste di
// canyon e vulcano compare una fascia di sabbia o cenere.
import { T, DEFS } from '../data/tiles.js';
import { BIOME_IDS } from '../data/world.js';
import { hash2 } from '../core/Util.js';

const H = (x, y, s) => hash2(x * 7 + s, y * 13 + s * 3, 53);
const GROUND = { meadow: T.GRASS, forest: T.GRASS, ancient: T.GRASS, plateau: T.GRASS, jade: T.GRASS, mountain: T.GRASS, desert: T.SAND, dunes: T.SAND, snow: T.SNOW, tundra: T.SNOW, volcano: T.ASH, canyon: T.CANYON, badlands: T.CANYON, swamp: T.SWAMP, haunted: T.DEADGRASS, enchanted: T.MAGICGRASS, tropical: T.JUNGLE };
const VEG = { meadow: [T.TREE, T.BUSH], forest: [T.TREE, T.PINE], ancient: [T.TREE, T.RUBBLE], plateau: [T.ROCK], jade: [T.TREE, T.BAMBOO], mountain: [T.PINE], desert: [T.CACTUS], dunes: [T.CACTUS], snow: [T.PINE], tundra: [T.PINE], volcano: [T.OBSIDIAN], canyon: [T.CACTUS], badlands: [T.CACTUS], swamp: [T.DEADTREE], haunted: [T.DEADTREE], enchanted: [T.TREE], tropical: [T.PALM, T.TREE] };
const COLD = new Set(['snow', 'tundra']), HOT = new Set(['desert', 'dunes', 'badlands', 'volcano', 'tropical', 'canyon']);
const incompatible = (a, b) => (COLD.has(a) && HOT.has(b)) || (COLD.has(b) && HOT.has(a)) || (a === 'swamp' && (b === 'canyon' || b === 'badlands' || b === 'desert')) || (b === 'swamp' && (a === 'canyon' || a === 'badlands' || a === 'desert'));
const RING = [[8, 0], [-8, 0], [0, 8], [0, -8], [6, 6], [-6, 6], [6, -6], [-6, -6]], RING2 = [[13, 0], [-13, 0], [0, 13], [0, -13], [9, 9], [-9, 9], [9, -9], [-9, -9]];

export function blendBiomes(m) {
  const w = m.w, h = m.h, prot = new Uint8Array(w * h); let blended = 0, belt = 0, coast = 0;
  for (let i = 0; i < w * h; i++) if (m.safe[i]) prot[i] = 1;
  const guard = (x, y, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (m.inb(x + i, y + j)) prot[(y + j) * w + x + i] = 1; };
  for (const a of Object.values(m.anchors)) guard(a.x, a.y, 2); for (const p of m.portals) guard(p.x, p.y, 2); for (const p of m.props) guard(p.x, p.y, 1);
  const wet = (g) => g === T.WATER || g === T.DEEP, liquid = (i) => { const d = DEFS[m.ground[i]]; return d && d.liquid; };
  const nearWet = (x, y, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const X = x + i, Y = y + j; if (m.inb(X, Y) && wet(m.ground[Y * w + X])) return true; } return false; };
  const src = Uint8Array.from(m.ground), out = Uint16Array.from(m.obj);
  for (let y = 3; y < h - 3; y++) for (let x = 3; x < w - 3; x++) {
    const i = y * w + x; if (prot[i] || liquid(i)) continue; const name = BIOME_IDS[m.zone[i]]; if (!name || !GROUND[name]) continue;
    // 1) fascia di bordo: quanti dei punti attorno appartengono a un altro bioma (e quale)
    let cnt = 0, other = null; const tally = {};
    for (const [dx, dy] of RING) { if (!m.inb(x + dx, y + dy)) continue; const k = (y + dy) * w + x + dx, nb = BIOME_IDS[m.zone[k]]; if (nb && nb !== name && GROUND[nb] && !wet(src[k])) { cnt++; tally[nb] = (tally[nb] || 0) + 1; } }
    let wide = false;
    if (!cnt) { for (const [dx, dy] of RING2) { if (!m.inb(x + dx, y + dy)) continue; const k = (y + dy) * w + x + dx, nb = BIOME_IDS[m.zone[k]]; if (nb && nb !== name && GROUND[nb] && incompatible(name, nb) && !wet(src[k])) { cnt++; tally[nb] = (tally[nb] || 0) + 1; wide = true; } } }
    if (cnt) {
      let best = 0; for (const [nb, c] of Object.entries(tally)) if (c > best) { best = c; other = nb; }
      const f = cnt / 8, r1 = H(x >> 1, y >> 1, 3), r2 = H(x, y, 5);
      if (incompatible(name, other)) {   // fascia intermedia: steppa secca, brughiera e rocce basse, mai un confine netto
        if (r1 < 0.4 + f * 0.5) { m.ground[i] = r2 < 0.55 ? T.DEADGRASS : r2 < 0.8 ? T.DIRT : T.GRASS; belt++; if (!out[i] && r2 > 0.9 && !wide) out[i] = T.BOULDER; }
      } else if (r1 < f * 0.95) { m.ground[i] = GROUND[other]; blended++; if (!out[i] && r2 < 0.1 + f * 0.1 && VEG[other] && !wide) { const v = VEG[other][Math.floor(r2 * 97) % VEG[other].length]; if (!(DEFS[v] && DEFS[v].tall && 0)) out[i] = v; } }
    }
    // 2) coste: i climi freddi, di canyon e di vulcano non hanno la spiaggia dorata
    const g0 = src[i];
    if (g0 === T.SAND && nearWet(x, y, 2)) {
      if (COLD.has(name)) { m.ground[i] = H(x, y, 7) < 0.45 ? T.ICE : T.SNOW; coast++; }
      else if (name === 'volcano') { m.ground[i] = T.ASH; coast++; }
    } else if ((name === 'canyon' || name === 'badlands') && g0 === T.CANYON && nearWet(x, y, 2)) { m.ground[i] = T.SAND; coast++; }
  }
  // spiagge (zona oceano) accanto a un bioma freddo: neve e ghiaccio, non sabbia dorata
  for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) { const i = y * w + x; if (m.ground[i] !== T.SAND || prot[i]) continue; let cold = false; for (let j = -3; j <= 3 && !cold; j++) for (let k = -3; k <= 3; k++) { const X = x + k, Y = y + j; if (!m.inb(X, Y)) continue; const nb = BIOME_IDS[m.zone[Y * w + X]]; if (COLD.has(nb) && !wet(m.ground[Y * w + X])) { cold = true; break; } } if (cold) { m.ground[i] = H(x, y, 17) < 0.4 ? T.ICE : T.SNOW; coast++; } }
  // lastre di ghiaccio sulla riva fredda: l'acqua bassa vicino alla neve gela a chiazze
  for (let y = 4; y < h - 4; y++) for (let x = 4; x < w - 4; x++) { const i = y * w + x; if (src[i] !== T.WATER || prot[i]) continue; let cold = false; for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) { const nb = BIOME_IDS[m.zone[(y + dy) * w + x + dx]]; if (COLD.has(nb) && !wet(src[(y + dy) * w + x + dx])) { cold = true; break; } } if (cold && H(x >> 1, y >> 1, 11) < 0.4) { m.ground[i] = T.ICE; coast++; } }
  for (let i = 0; i < w * h; i++) m.obj[i] = out[i];
  m.blend = { blended, belt, coast }; return m.blend;
}
