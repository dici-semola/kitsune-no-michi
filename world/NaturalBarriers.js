// Barriere naturali coerenti con l'ambiente: le creste rocciose generate ai confini dei biomi diventano, secondo il luogo, dune di sabbia, rovine, cactus,
// siepi, tronchi accatastati, mangrovie, bambù, cumuli di neve o resti antichi. Solo le montagne vere, i canyon e i vulcani restano di roccia.
// Ogni sostituto è SOLIDO come la roccia che rimpiazza: collisioni e connettività non cambiano (il test lo verifica).
import { T, DEFS } from '../data/tiles.js';
import { BIOME_IDS } from '../data/world.js';
import { hash2 } from '../core/Util.js';

const ROCKISH = new Set([T.ROCK, T.CANYONWALL, T.ICEWALL, T.OBSIDIAN, T.HELLROCK, T.VOLCANOCONE]);
const H = (x, y, s) => hash2(x * 7 + s, y * 13 + s * 3, 29);
const solid = (t) => t && DEFS[t] && DEFS[t].solid;
// per bioma: elenco [tile, peso]
const PICK = {
  meadow: [[T.THICKET, 5], [T.LOGWALL, 1], [T.ROCK, 2]], plateau: [[T.ROCK, 5], [T.THICKET, 2], [T.WALL, 1]], forest: [[T.THICKET, 4], [T.GIANTTREE, 2], [T.LOGWALL, 2], [T.ROCK, 1]],
  enchanted: [[T.GIANTTREE, 3], [T.CRYSTAL, 3], [T.THICKET, 2]], ancient: [[T.RUINWALL, 4], [T.GIANTTREE, 2], [T.THICKET, 2], [T.ROCK, 1]], jade: [[T.BAMBOO, 6], [T.ROCK, 2]],
  swamp: [[T.TWISTED32, 4], [T.THICKET, 3], [T.BOULDER, 1]], haunted: [[T.TWISTED32, 3], [T.BARETREE, 3], [T.RUINWALL, 2]], tropical: [[T.TROPIC32, 4], [T.PALM36, 3], [T.THICKET, 3]],
  desert: [[T.DUNEWALL, 6], [T.RUINWALL, 1], [T.CACTUS, 3]], dunes: [[T.DUNEWALL, 8], [T.CACTUS, 2]], snow: [[T.ICEWALL, 3], [T.DRIFTWALL, 4], [T.PINE, 3]], tundra: [[T.DRIFTWALL, 4], [T.ICEWALL, 2], [T.PINE, 3]],
  badlands: [[T.CANYONWALL, 6], [T.CACTUS, 1], [T.RUINWALL, 1]],
};
const SHORE = [[T.LOGWALL, 4], [T.PALM36, 3], [T.BOULDER, 2], [T.THICKET, 1]];
const SHORE_COLD = [[T.DRIFTWALL, 1]], SHORE_DRY = [[T.DUNEWALL, 4], [T.BOULDER, 3], [T.CACTUS, 1]];
function weighted(list, r) { let tot = 0; for (const [, w] of list) tot += w; r *= tot; for (const [t, w] of list) { if ((r -= w) <= 0) return t; } return list[0][0]; }

export function diversifyBarriers(m) {
  const w = m.w, h = m.h, obj = m.obj, protect = new Uint8Array(w * h); let n = 0, shore = 0; const kinds = {};
  for (let i = 0; i < w * h; i++) if (m.safe[i]) protect[i] = 1;
  const guard = (x, y, r = 1) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (m.inb(x + i, y + j)) protect[(y + j) * w + x + i] = 1; };
  for (const a of Object.values(m.anchors)) guard(a.x, a.y, 1); for (const p of m.portals) guard(p.x, p.y, 1); for (const p of m.props) guard(p.x, p.y, 0);
  const nearWater = (x, y) => { for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) { const X = x + i, Y = y + j; if (!m.inb(X, Y)) continue; const g = m.ground[Y * w + X]; if (g === T.WATER || g === T.DEEP) return true; } return false; };
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, o = obj[i]; if (!ROCKISH.has(o) || protect[i]) continue;
    const name = BIOME_IDS[m.zone[i]] || 'meadow', g = m.ground[i];
    if ((name === 'mountain' || name === 'volcano' || name === 'canyon') && g !== T.SAND && !(name === 'mountain' && nearWater(x, y))) continue;   // montagne, vulcani e canyon veri restano di roccia, ma non sulla spiaggia
    const cold = name === 'snow' || name === 'tundra', coastal = g === T.SAND || nearWater(x, y);
    // cluster: i pezzi vicini scelgono lo stesso tipo (zone 6x6), con un po' di variazione cella per cella
    const zr = H(x >> 2, y >> 2, 3), cr = H(x, y, 5), r = cr < 0.22 ? cr * 4.5 : zr;
    let pick = coastal ? weighted(cold ? SHORE_COLD : (name === 'badlands' || name === 'canyon') ? SHORE_DRY : SHORE, r) : weighted(PICK[name] || [[T.THICKET, 1]], r);
    if (name === 'volcano' || name === 'canyon') pick = T.BOULDER;   // sulla riva di un vulcano o di un canyon: massi bassi
    if (!solid(pick)) pick = o;
    if (pick !== o) { obj[i] = pick; n++; if (coastal) shore++; kinds[pick] = (kinds[pick] || 0) + 1; }
  }
  m.naturalBarriers = { changed: n, shore, kinds }; return n;
}
