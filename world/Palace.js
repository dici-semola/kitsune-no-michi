// Dimora imperiale di Augusta Imperialis: un palazzo monumentale ispirato al Partenone, reinterpretato come domus del sovrano.
// Frontone a gradoni dorato, colonnato (colonne alte con capitelli dorati), cella in marmo, terrazza con BALCONE CERIMONIALE, due rampe di scalinata,
// statue alte, bracieri, stendardi imperiali, giardini con cipressi e una piazza lastricata con fontana e obelischi. Solo celle di tile del gioco.
import { T } from '../data/tiles.js';
import { box } from './Generators.js';
import { BIOME_IDS } from '../data/world.js';

const put = (m, x, y, o) => { if (m.inb(x, y)) m.setO(x, y, o); };
const floor = (m, x, y, w, h, g) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (m.inb(i, j)) { m.setG(i, j, g); m.setO(i, j, 0); } };

// (ox,oy) = angolo alto-sinistro del recinto; larghezza 33, profondità 30. Ritorna i punti notevoli.
export function buildPalace(m, ox, oy) {
  const W = 33, D = 30, cx = ox + (W >> 1);
  floor(m, ox, oy, W, D, T.PAVE_SLAB);
  // giardini laterali (fuori dal piedistallo) con cipressi, cespugli e fontanelle
  for (const gx of [ox, ox + W - 7]) { floor(m, gx, oy + 4, 7, D - 5, T.GRASS); for (const [dx, dy] of [[1, 0], [5, 0], [1, 6], [5, 6], [3, 12], [1, 18], [5, 18]]) put(m, gx + dx, oy + 6 + dy, (dx + dy) % 2 ? T.CYPRESS32 : T.CYPRESS24); for (const [dx, dy] of [[3, 2], [3, 9], [3, 16], [0, 21], [6, 21]]) put(m, gx + dx, oy + 7 + dy, (dx + dy) % 2 ? T.BUSH : T.BUSH2); put(m, gx + 3, oy + 14, T.FOUNTAIN); }
  const px = ox + 7, pw = W - 14, y0 = oy + 1;                              // piedistallo del tempio: pw = 19
  floor(m, px, y0 + 4, pw, 6, T.GOLDFLOOR);                                    // terrazza cerimoniale (stilobate)
  // frontone a gradoni: apice dorato e quattro livelli, fregio alla base
  for (let k = 0; k < 4; k++) { const half = 1 + k * 3 - (k === 3 ? 1 : 0); for (let x = cx - half; x <= cx + half; x++) put(m, x, y0 + k, k === 0 && x === cx ? T.PEDIMENT_CREST : T.PEDIMENT); }
  for (let x = px; x < px + pw; x++) put(m, x, y0 + 4, T.PEDIMENT);
  // cella (muro di fondo in marmo) con ingresso ad arco al centro
  for (let x = px; x < px + pw; x++) { put(m, x, y0 + 5, T.MARBLE); put(m, x, y0 + 6, T.MARBLE); }
  put(m, cx, y0 + 6, T.ARCH); put(m, cx - 1, y0 + 6, T.PCOLUMN); put(m, cx + 1, y0 + 6, T.PCOLUMN);
  for (const x of [cx - 4, cx + 4, cx - 7, cx + 7]) put(m, x, y0 + 5, T.PINNACLE);                          // pinnacoli sul fregio
  // colonnato: colonne alte con capitello dorato ogni due celle, l'ingresso centrale resta aperto
  const yc = y0 + 7;
  for (let x = px; x < px + pw; x += 2) if (Math.abs(x - cx) > 2) put(m, x, yc, T.PCOLUMN_GOLD);
  // balcone cerimoniale al centro della terrazza (parapetto dorato) con due rampe di scalinata ai lati
  const yb = y0 + 10;                                                          // riga del parapetto/balcone
  floor(m, cx - 2, yb, 5, 1, T.GOLDFLOOR); for (let x = cx - 2; x <= cx + 2; x++) put(m, x, yb, T.GOLDRAIL);
  floor(m, cx - 7, y0 + 10, 4, 1, T.GOLDFLOOR); floor(m, cx + 4, y0 + 10, 4, 1, T.GOLDFLOOR);
  for (let r = 0; r < 6; r++) { floor(m, cx - 8 - (r > 3 ? 1 : 0), y0 + 10 + r, 5 + (r > 3 ? 1 : 0), 1, T.STEPS); floor(m, cx + 4, y0 + 10 + r, 5 + (r > 3 ? 1 : 0), 1, T.STEPS); }
  floor(m, cx - 2, yb + 1, 5, 5, T.GOLDFLOOR);                                      // pianerottolo sotto il balcone
  // statue, bracieri e stendardi
  for (const s of [-1, 1]) { put(m, cx + s * 11, yc + 4, T.STATUE_T); put(m, cx + s * 11, y0 + 8, T.IMPBANNER); put(m, cx + s * 9, yc + 1, T.BRAZIER); put(m, cx + s * 5, y0 + 16, T.BRAZIER); put(m, cx + s * 3, yc + 5, T.STATUE_T); put(m, cx + s * 12, y0 + 15, T.STATUE_T); }
  // piazza lastricata davanti alla scalinata: mosaico centrale, fontana, obelischi, lampioni, panchine
  const yp = y0 + 17;
  floor(m, ox + 7, yp, W - 14, oy + D - yp, T.PAVE_MOSAIC);
  for (let x = ox + 7; x < ox + W - 7; x++) for (let y = yp; y < oy + D; y++) if ((x + y) % 7 === 0) m.setG(x, y, T.PAVE_SLAB);
  put(m, cx, yp + 4, T.FOUNTAIN); for (const s of [-1, 1]) { put(m, cx + s * 8, yp + 2, T.OBELISK); put(m, cx + s * 6, yp + 9, T.LAMPPOST); put(m, cx + s * 3, yp + 7, T.BENCH); put(m, cx + s * 9, yp + 9, T.CYPRESS24); }
  put(m, cx - 4, yp + 1, T.BRAZIER); put(m, cx + 4, yp + 1, T.BRAZIER);
  const gateY = oy + D - 1;
  return { cx, ox, oy, W, D, stairs: { x: cx, y: yb + 6 }, balcony: { x: cx, y: yb - 1 }, rail: yb, plaza: { x: cx, y: yp + 8 }, gate: { x: cx, y: gateY } };
}

// Stampa il palazzo dentro Augusta Imperialis, a nord della cinta, e collega la piazza al cancello settentrionale.
export function stampPalaceInAugusta(m, T0) {
  if (!T0) return null;
  const W = 33, D = 30, ox = T0.x + (T0.w >> 1) - 16, oy = T0.y - D - 8;   // il centro del palazzo allineato al cancello nord; 6 righe in più per la parete della rupe e la scalinata
  if (oy < 4) return null;
  const info = buildPalace(m, ox, oy);
  m.palace = { ox, oy, W, D, cx: info.cx, gateY: T0.y - 1 };
  // lo sprite a blocco unico (TownSkins/PalaceSkin) sostituisce il tempio fatto di tile: si ripulisce la zona e si pone un blocco pieno (invisibile) come corpo del tempio
  { const cx = info.cx; for (let y = oy; y < oy + 26; y++) for (let x = cx - 14; x <= cx + 14; x++) if (m.inb(x, y) && m.obj[y * m.w + x]) m.setO(x, y, 0);
    for (let y = oy + 12; y <= oy + 20; y++) for (let x = cx - 13; x <= cx + 12; x++) m.setO(x, y, T.MARBLE);
    m.palace.sprite = true; m.anchors.palace_stairs = { x: cx, y: oy + 23 }; m.anchors.palace_balcony = { x: cx, y: oy + 9 }; m.anchors.palace_plaza = { x: cx, y: oy + 27 }; }
  if (!m.palace.sprite) { m.anchors.palace_stairs = info.stairs; m.anchors.palace_balcony = info.balcony; m.anchors.palace_plaza = info.plaza; }
  m.pois.push({ x: info.cx, y: oy + 8, n: 'Domus Imperiale', kind: 'town' });
  // passaggio lastricato fra la piazza del palazzo e il cancello nord della città
  box(m, info.cx - 1, oy + D + 6, 3, Math.max(1, T0.y - 1 - (oy + D + 6)), T.PAVE_SLAB, 0);
  return info;
}

// ACROPOLI: il palazzo sta su un'alta rupe a picco sul mare (dietro e ai lati) e sopra la città (davanti). Il pianoro è a quota 2; la rupe ha una parete a cinque righe a sud,
// un dorso a nord e lati a est/ovest (stessa logica visiva dei dislivelli delle mappe orografiche: la variante della parete dipende dai livelli vicini). Si sale solo dalla grande scalinata al centro.
export function palaceCliff(m) {
  const P = m.palace; if (!P || !m.lvl) return null;
  const { ox, oy, W, D, cx } = P, x0 = ox - 1, x1 = ox + W, y0 = oy - 1, y1 = oy + D, w = m.w, ancient = Math.max(0, BIOME_IDS.indexOf('ancient'));
  const at = (x, y) => y * w + x;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!m.inb(x, y)) continue; m.lvl[at(x, y)] = 2; if (x === x0 || x === x1 || y === y0 || y === y1) { m.setG(x, y, T.PAVE_SLAB); m.setO(x, y, 0); } }
  const cliff = (x, y) => { if (!m.inb(x, y)) return; const i = at(x, y); m.lvl[i] = 0; m.setO(x, y, T.CLIFF); m.zone[i] = ancient; };
  for (let x = x0; x <= x1; x++) { cliff(x, y0 - 1); for (let k = 1; k <= 5; k++) cliff(x, y1 + k); }   // dorso a nord, parete a sud (cinque righe: sembra davvero alta)
  for (let y = y0; y <= y1; y++) { cliff(x0 - 1, y); cliff(x1 + 1, y); }                                 // lati
  m.rampCells = m.rampCells || new Uint8Array(m.w * m.h);
  for (let k = 1; k <= 5; k++) for (let x = cx - 2; x <= cx + 1; x++) { const i = at(x, y1 + k); m.setO(x, y1 + k, 0); m.setG(x, y1 + k, T.STEPS); m.lvl[i] = 1; m.rampCells[i] = 1; }   // grande scalinata (con la skin delle scale)
  for (let x = cx - 2; x <= cx + 1; x++) { m.setG(x, y1 + 6, T.PAVE_SLAB); m.setO(x, y1 + 6, 0); }
  m.palace.cliff = true; return m.palace;
}
