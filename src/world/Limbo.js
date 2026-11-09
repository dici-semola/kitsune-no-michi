// Generatore del Limbo: 5 conformazioni ambientali ben distinte, ognuna con una disposizione diversa ad ogni ciclo (seed).
// Tutte garantiscono un percorso dall'ingresso a ogni oggetto della prova (BFS) e ospitano una qualsiasi delle tre prove.
import { T, DEFS } from '../data/tiles.js';
import { MAPS } from '../data/world.js';
import { NPCS } from '../data/npcs.js';
import { DIALOGUES } from '../data/dialogues.js';
import { LIMBO_CFG, TRIALS, TRIAL_NAMES, RUNES } from '../data/limbo.js';
import { mulberry32, fbm } from '../core/Util.js';
import { box, ring, blob, idx, poi, addSpawns, dropMap } from './Generators.js';

const W = 96, H = 72;
const ART = { sole: 'il Sole', luna: 'la Luna', stella: 'la Stella', fiore: 'il Fiore' };

// Prepara la definizione della mappa 'limbo' (seed/configurazione/prova) e scarta la copia in cache.
export function prepareLimbo(info) {
  Object.assign(MAPS.limbo, { cfg: info.cfg, seed: info.seed, trial: info.trial });
  dropMap('limbo');
  const t = info.trial;
  DIALOGUES.limbo_guida = {
    start: [{ go: 'a' }],
    nodes: {
      a: { s: 'Psicopompo', t: ['Sei sospeso tra la vita e la morte, {name}. Il Limbo non è una punizione: è una soglia.', `Qui il paesaggio cambia ogni volta. Questa volta si chiama «${LIMBO_CFG[info.cfg].n}».`], next: 'prova' },
      prova: { s: 'Psicopompo', t: t === 'enigma' ? 'Quattro rune dormono tra le nebbie e tre lapidi ricordano l\'ordine in cui si accesero. Leggile tutte, poi tocca le rune nell\'ordine giusto.' : t === 'cuore' ? 'In una cripta riposa il Cuore della Rinascita. Un Guardiano lo veglia: abbattilo e prendi il Cuore dall\'altare.' : 'Cerca il Corno d\'Ossa nell\'arena e suonalo: tre orde di morti verranno a prenderti. Sopravvivi a tutte e il passaggio si aprirà.', choices: [{ t: 'Capito' }, { t: 'Ripeti', next: 'a' }] },
    },
  };
}

export function genLimbo(m, def) {
  const cfg = def.cfg ?? 0, trial = def.trial || 'enigma', seed = def.seed || 1, rng = mulberry32(seed * 977 + cfg * 31);
  const w = m.w, h = m.h, R = (a, b) => a + Math.floor(rng() * (b - a + 1));
  m.limbo = { cfg, trial, seed };
  box(m, 0, 0, w, h, T.LIMBOGRND, 0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (fbm(x * 0.13, y * 0.13, seed + 5, 2) > (cfg === 1 ? 0.52 : 0.64)) m.setG(x, y, T.LIMBOCRACK);
  const entry = { x: 9, y: Math.floor(h / 2) + R(-6, 6) };
  const free = (x, y) => m.inb(x, y) && !m.obj[idx(m, x, y)] && !DEFS[m.g(x, y)].liquid;
  const nearEntry = (x, y, r = 6) => Math.hypot(x - entry.x, y - entry.y) < r;
  const clearArea = (cx, cy, r, g = null) => blob(m, cx, cy, r, (x, y) => { if (m.inb(x, y)) { m.setO(x, y, 0); if (g != null) m.setG(x, y, g); } });
  const pool = (cx, cy, r) => blob(m, cx, cy, r, (x, y) => { if (!nearEntry(x, y, 7) && m.inb(x, y)) { m.setG(x, y, T.BLOOD); m.setO(x, y, 0); } });
  const path = (x0, y0, x1, y1, wd = 2) => { // sentiero tortuoso che ripulisce gli ostacoli
    let x = x0, y = y0;
    for (let n = 0; n < 400 && (Math.abs(x - x1) > 1 || Math.abs(y - y1) > 1); n++) {
      for (let j = 0; j < wd; j++) for (let i = 0; i < wd; i++) { if (m.inb(x + i, y + j)) { m.setO(x + i, y + j, 0); if (m.g(x + i, y + j) !== T.BLOOD) m.setG(x + i, y + j, T.LIMBOPATH); else m.setG(x + i, y + j, T.LIMBOPATH); } }
      const dx = Math.sign(x1 - x), dy = Math.sign(y1 - y);
      if (rng() < 0.55) x += dx || (rng() < 0.5 ? 1 : -1); else y += dy || (rng() < 0.5 ? 1 : -1);
      x = Math.max(3, Math.min(w - 4, x)); y = Math.max(3, Math.min(h - 4, y));
    }
  };
  const ruin = (x, y, rw, rh, gapSide = 2, miss = 0.3) => { // edificio in rovina con un varco
    ring(m, x, y, rw, rh, T.RUINWALL);
    for (let i = 0; i < rw; i++) for (const yy of [y, y + rh - 1]) if (rng() < miss && i > 0 && i < rw - 1) m.setO(x + i, yy, 0);
    for (let j = 1; j < rh - 1; j++) for (const xx of [x, x + rw - 1]) if (rng() < miss) m.setO(xx, y + j, 0);
    const gx = x + (rw >> 1); if (gapSide === 2) { m.setO(gx, y + rh - 1, 0); m.setO(gx + 1, y + rh - 1, 0); } else { m.setO(x, y + (rh >> 1), 0); }
    box(m, x + 1, y + 1, rw - 2, rh - 2, T.LIMBOPATH, null);
  };
  const scatter = (tile, n, ok = () => true) => { for (let k = 0, t = 0; k < n && t < n * 30; t++) { const x = 4 + R(0, w - 9), y = 4 + R(0, h - 9); if (free(x, y) && !nearEntry(x, y, 7) && ok(x, y)) { m.setO(x, y, tile); k++; } } };

  // ---- le cinque conformazioni ----
  if (cfg === 0) { // Foresta dei dannati: fitta, con sentieri e pozze
    for (let y = 3; y < h - 3; y++) for (let x = 3; x < w - 3; x++) if (fbm(x * 0.1, y * 0.1, seed + 11, 2) > 0.5 && rng() < 0.6) m.setO(x, y, T.BARETREE);
    for (let k = 0; k < 6; k++) pool(R(16, w - 12), R(8, h - 8), R(3, 5));
    for (let k = 0; k < 3; k++) ruin(R(24, w - 24), R(10, h - 20), 6, 5, 2, 0.3);
    for (let k = 0; k < 4; k++) path(entry.x, entry.y, R(w - 24, w - 8), R(8, h - 8));
  } else if (cfg === 1) { // Distesa della disperazione: piana aperta, rocce, grandi pozze
    for (let y = 3; y < h - 3; y++) for (let x = 3; x < w - 3; x++) if (fbm(x * 0.07, y * 0.07, seed + 13, 3) > 0.64) m.setO(x, y, T.LIMBOROCK);
    scatter(T.BARETREE, 7);
    for (let k = 0; k < 3; k++) pool(R(22, w - 16), R(14, h - 14), R(7, 10));
    path(entry.x, entry.y, w - 10, R(14, h - 14), 3);
  } else if (cfg === 2) { // Cimitero dimenticato: tombe, mausolei, cripte
    for (let f = 0; f < 3; f++) { const fx = 18 + f * 24 + R(-2, 2), fy = 8 + (f % 2) * 26 + R(-3, 3); for (let j = 0; j < 9; j++) for (let i = 0; i < 6; i++) if (rng() < 0.88) m.setO(fx + i * 3, fy + j * 2, T.GRAVE); }
    for (let k = 0; k < 4; k++) { const mx = R(20, w - 14), my = R(6, h - 12); box(m, mx, my, 3, 2, T.LIMBOPATH, T.MAUSOLEUM); m.setO(mx + 1, my + 1, T.MAUSOLEUM); }
    for (let k = 0; k < 3; k++) ruin(R(24, w - 22), R(8, h - 18), 8, 6, 2, 0.1);
    scatter(T.BARETREE, 22);
    path(entry.x, entry.y, w - 10, R(14, h - 14), 3);
  } else if (cfg === 3) { // Rovine dell'aldilà: edifici distrutti, colonne, archi, sentieri di pietra
    for (let k = 0; k < 8; k++) ruin(R(18, w - 20), R(6, h - 16), R(7, 11), R(6, 9), 2, 0.38);
    for (let r = 0; r < 4; r++) { const yy = 10 + r * 16; path(4, yy, w - 5, yy, 2); }
    for (let c = 0; c < 4; c++) { const xx = 22 + c * 18; path(xx, 4, xx, h - 5, 2); }
    for (let x = 14; x < w - 8; x += 12) for (let r = 0; r < 4; r++) { const yy = 10 + r * 16; if (free(x, yy - 1)) m.setO(x, yy - 1, T.ARCHRUIN); }
    scatter(T.BROKENCOL, 34); scatter(T.BARETREE, 6); scatter(T.RUBBLE, 14);
  } else { // Valle degli scheletri: ossa, resti di guerrieri, accampamenti
    for (let y = 3; y < h - 3; y++) for (let x = 3; x < w - 3; x++) { const band = Math.min(y, h - 1 - y); if (band < 14 && fbm(x * 0.1, y * 0.1, seed + 17, 2) > 0.38 && !(x % 31 < 5)) m.setO(x, y, T.LIMBOROCK); }
    scatter(T.BONES, 150); scatter(T.SKULLPILE, 40); scatter(T.BARETREE, 28);
    m.limbo.camps = [];
    for (let k = 0; k < 3; k++) {
      const cx = R(28, w - 14), cy = R(22, h - 22); clearArea(cx, cy, 5, T.LIMBOCRACK);
      m.setO(cx, cy, T.BONFIRE); m.setO(cx - 3, cy - 2, T.HUT); m.setO(cx + 3, cy - 2, T.HUT); m.setO(cx - 2, cy + 3, T.SKULLPILE);
      m.limbo.camps.push({ x: cx, y: cy + 2 });
      for (let q = 0; q < 4; q++) m.spawns.push({ x: cx + R(-4, 4), y: cy + R(2, 5), table: 'limbo', aquatic: false });
    }
    path(entry.x, entry.y, w - 10, R(24, h - 24), 3);
  }
  // confine nebbioso e area di arrivo
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.min(x, y, w - 1 - x, h - 1 - y); if (d < 2 + Math.floor(fbm(x * 0.2, y * 0.2, seed + 3, 2) * 3)) { m.setO(x, y, T.LIMBOWALL); m.setG(x, y, T.LIMBOGRND); } }
  clearArea(entry.x, entry.y, 5, T.LIMBOPATH);
  m.anchors.entry = { x: entry.x, y: entry.y }; m.anchors.start = m.anchors.entry;
  path(entry.x, entry.y, w >> 1, h >> 1, 2); // garantisce un corridoio verso il centro
  path(w >> 1, h >> 1, w - 12, Math.floor(h / 2) + R(-10, 10), 2);

  // ---- raggiungibilità: tutto ciò che serve alla prova sta nella componente connessa all'ingresso ----
  const reach = new Uint8Array(w * h), q = [[entry.x, entry.y]]; reach[entry.y * w + entry.x] = 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!m.inb(nx, ny) || reach[ny * w + nx] || !m.passable(nx, ny, null)) continue; reach[ny * w + nx] = 1; q.push([nx, ny]); } }
  m.limbo.reach = reach;
  const taken = [];
  const pick = (minE, minO, openR = 1) => {
    for (let t = 0; t < 4000; t++) {
      const x = 8 + R(0, w - 16), y = 8 + R(0, h - 16);
      if (!reach[y * w + x] || Math.hypot(x - entry.x, y - entry.y) < minE || taken.some(([a, b]) => Math.hypot(a - x, b - y) < minO) || DEFS[m.g(x, y)].liquid) continue;
      let ok = true; for (let j = -openR; j <= openR && ok; j++) for (let i = -openR; i <= openR; i++) if (!m.passable(x + i, y + j, null)) { ok = false; break; }
      if (!ok) continue; taken.push([x, y]); return { x, y };
    }
    // ripiego: ripulisce un'area vicino al centro
    const x = (w >> 1) + R(-12, 12), y = (h >> 1) + R(-8, 8); clearArea(x, y, 3, T.LIMBOPATH); path(entry.x, entry.y, x, y, 2); taken.push([x, y]); return { x, y };
  };
  // tesori esclusivi del Limbo
  for (let k = 0; k < 3; k++) { const p = pick(14, 12); m.props.push({ type: 'chest', id: `lch_${seed}_${k}`, x: p.x, y: p.y, loot: k === 0 ? [['essenza_limbo', 2], ['osso_spettrale', 2]] : k === 1 ? [['osso_spettrale', 3], ['anima_cristallizzata', 1]] : [['essenza_limbo', 1], ['cristallo_ghiaccio', 2], ['componente_elettrico', 1]], gold: 120 + k * 60 }); }
  if (trial === 'enigma') {
    const ids = RUNES.map((r) => r.id); for (let i = ids.length - 1; i > 0; i--) { const j = R(0, i); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    const seq = ids.slice(0, 3); m.limbo.seq = seq;
    for (const id of RUNES.map((r) => r.id)) { const p = pick(18, 16); m.props.push({ type: 'rune', id: 'rune_' + id, glyph: id, sprite: 'rune:' + id, x: p.x, y: p.y }); }
    const lines = [`Per prima si accese ${ART[seq[0]]}.`, `Dopo ${ART[seq[0]]} brillò ${ART[seq[1]]}.`, `Per ultima si accese ${ART[seq[2]]}: allora la porta si aprì.`];
    lines.forEach((t, i) => { const p = pick(12, 12); m.props.push({ type: 'clue', id: 'clue_' + i, sprite: 'clue', x: p.x, y: p.y, text: `Lapide ${['I', 'II', 'III'][i]}: «${t}»` }); });
    m.limbo.objective = 'Leggi le tre lapidi e tocca le rune nell\'ordine giusto.';
  } else if (trial === 'cuore') {
    const p = pick(26, 14, 1), cw = 11, ch = 9, cx = Math.max(6, Math.min(w - cw - 6, p.x - 5)), cy = Math.max(6, Math.min(h - ch - 6, p.y - 4));
    box(m, cx - 1, cy - 1, cw + 2, ch + 2, T.LIMBOPATH, 0); ring(m, cx, cy, cw, ch, T.RUINWALL); box(m, cx + 1, cy + 1, cw - 2, ch - 2, T.LIMBOPATH, 0);
    m.setO(cx + (cw >> 1), cy + ch - 1, 0); m.setO(cx + (cw >> 1) + 1, cy + ch - 1, 0); m.setO(cx + 2, cy, T.MAUSOLEUM); m.setO(cx + cw - 3, cy, T.MAUSOLEUM);
    path(cx + (cw >> 1), cy + ch + 1, entry.x, entry.y, 2); path(cx + (cw >> 1), cy + ch, cx + (cw >> 1), cy + ch + 3, 2);
    m.props.push({ type: 'heart', id: 'cuore', sprite: 'heartaltar', x: cx + (cw >> 1), y: cy + 3 });
    m.limbo.crypt = { x: cx + (cw >> 1), y: cy + 5, gx: cx + (cw >> 1), gy: cy + 3 };
    m.limbo.objective = 'Entra nella cripta, abbatti il Guardiano e prendi il Cuore dall\'altare.';
    taken.push([cx + (cw >> 1), cy + 4]);
  } else {
    const p = pick(22, 14, 2); clearArea(p.x, p.y, 8, T.LIMBOCRACK);
    m.props.push({ type: 'horn', id: 'corno', sprite: 'horn', x: p.x, y: p.y });
    m.limbo.horn = { x: p.x, y: p.y };
    for (let k = 0; k < 3; k++) { const a = rng() * 6.283; m.limbo.horn['s' + k] = { x: Math.round(p.x + Math.cos(a) * 9), y: Math.round(p.y + Math.sin(a) * 6) }; }
    m.limbo.objective = 'Suona il Corno d\'Ossa e sopravvivi alle tre orde.';
  }
  poi(m, entry.x, entry.y, 'Soglia del Limbo', 'town');
  addSpawns(m, trial === 'orda' ? 8 : 22, () => 'limbo', { minFrom: [entry, ...taken.map(([x, y]) => ({ x, y }))], minDist: 16 });
  m.limbo.spawnsFixed = m.spawns.length;
  m.limbo.name = LIMBO_CFG[cfg].n; m.limbo.trialName = TRIAL_NAMES[trial];
  void TRIALS;
}

export const limboSignature = (m) => { // conteggio degli elementi caratteristici: le 5 conformazioni devono differire in modo netto
  const c = { alberi: 0, sangue: 0, tombe: 0, rovine: 0, ossa: 0, rocce: 0, mausolei: 0, colonne: 0 };
  for (let i = 0; i < m.w * m.h; i++) {
    const o = m.obj[i], g = m.ground[i];
    if (o === T.BARETREE) c.alberi++; else if (o === T.GRAVE) c.tombe++; else if (o === T.RUINWALL) c.rovine++; else if (o === T.BONES || o === T.SKULLPILE) c.ossa++; else if (o === T.LIMBOROCK) c.rocce++; else if (o === T.MAUSOLEUM) c.mausolei++; else if (o === T.BROKENCOL || o === T.ARCHRUIN) c.colonne++;
    if (g === T.BLOOD) c.sangue++;
  }
  return c;
};
