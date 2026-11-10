// Limbo: contatore delle morti (persistente), ingresso, prove di ritorno alla vita (enigma / cuore / orde) e rinascita nel centro abitato più vicino.
import { TS } from '../core/Util.js';
import { MAPS, TOWNS, OUTPOSTS } from '../data/world.js';
import { ENEMIES } from '../data/enemies.js';
import { LIMBO_CFG, TRIALS, TRIAL_NAMES, WAVES, RUNES } from '../data/limbo.js';
import { getMap } from '../world/Generators.js';
import { prepareLimbo } from '../world/Limbo.js';

// I nemici del Limbo si adeguano al livello del giocatore (punti vita E danni): a livello 1 sono al 40%, a livello 10 al 75%, a livello 20 al 120%, tetto 150%.
export const limboScale = (level) => Math.max(0.4, Math.min(1.5, 0.3 + 0.045 * level));
import { Enemy } from '../entities/Enemy.js';
import { DEFS } from '../data/tiles.js';

export const DEATHS_FOR_LIMBO = 3;
const art = (id) => ({ sole: 'il Sole', luna: 'la Luna', stella: 'la Stella', fiore: 'il Fiore' }[id]);

// ---------------------------------------------------------------- morti
// Registra una morte nel mondo dei vivi. Ritorna 'limbo' alla terza morte consecutiva, altrimenti 'normal'.
export function registerDeath(sc) {
  const st = sc.state, p = sc.player;
  st.deathPos = { map: sc.mapId, x: Math.floor(p.cx / TS), y: Math.floor(p.cy / TS) };
  st.deaths = (st.deaths || 0) + 1;
  return st.deaths >= DEATHS_FOR_LIMBO ? 'limbo' : 'normal';
}
// Il conteggio si azzera quando ti riprendi davvero: livello, boss abbattuto, riposo in locanda, ritorno dal Limbo.
export function resetDeaths(sc, why) { if (sc.state.deaths) { sc.state.deaths = 0; if (why) sc.toast(why); } }

// ---------------------------------------------------------------- ingresso
export function chooseConfig(st, rnd = Math.random) {
  const opts = LIMBO_CFG.map((c) => c.id).filter((i) => i !== st.lastLimboCfg);   // mai due volte di fila la stessa
  return opts[Math.floor(rnd() * opts.length)];
}
export function enterLimbo(sc) {
  const st = sc.state, cfg = chooseConfig(st), seed = 1 + Math.floor(Math.random() * 1e6);
  const trial = TRIALS[(st.limboCycles + cfg + seed) % TRIALS.length];
  st.limbo = { cfg, seed, trial, progress: { step: 0, clues: [], guardianDead: false, heart: false, wave: 0, state: 'idle', done: false } };
  st.lastLimboCfg = cfg; st.limboCycles++; st.deaths = 0; st.mount = null; st.buffs = [];
  st.hp = st.maxHp; st.ki = st.maxKi; st.stamina = st.maxStamina; st.guardPts = st.maxGuard;
  sc.fade.cb = null;
  sc.load('limbo', 'entry');
  sc.fade = { a: 1, dir: -1, cb: null };
}

// ---------------------------------------------------------------- allestimento della mappa
export function setup(sc) {
  const L = sc.state.limbo, m = sc.map; if (!L || !m.limbo) return;
  sc.hordeAlive = new Set(); sc.limboT = 0; sc.limboEnd = 0;
  const P = L.progress;
  if (L.trial === 'cuore' && !P.heart) {
    const LSC = { scale: limboScale(sc.state.level) }, c = m.limbo.crypt, g = new Enemy('guardiano_cripta', c.gx * TS, (c.gy + 1) * TS, LSC); sc.world.add(g); g.dormant = false; sc.limboGuardian = g;
    for (const [dx, dy] of [[-3, 1], [3, 1]]) { const e = new Enemy('guerriero_scheletrico', (c.gx + dx) * TS, (c.gy + 1 + dy) * TS, LSC); sc.world.add(e); e.dormant = false; }
  }
  if (L.trial === 'orda' && !P.done) { P.state = 'idle'; if (P.wave > 0) P.wave = P.wave; }
}

export function objective(sc) {
  const L = sc.state.limbo, m = sc.map; if (!L) return '';
  const P = L.progress, name = TRIAL_NAMES[L.trial];
  if (P.done) return `${name}: completata. La luce ti chiama…`;
  if (L.trial === 'enigma') { const seen = P.clues.length; return `${name}: lapidi lette ${seen}/3 · rune ${P.step}/3`; }
  if (L.trial === 'cuore') return `${name}: ${P.guardianDead ? 'prendi il Cuore dall\'altare' : 'abbatti il Guardiano nella cripta'}`;
  const alive = sc.hordeAlive ? sc.hordeAlive.size : 0;
  return `${name}: ${P.state === 'idle' && P.wave === 0 ? 'suona il Corno d\'Ossa' : `orda ${Math.min(WAVES.length, P.wave)}/${WAVES.length} · nemici ${alive}`}`;
}

// ---------------------------------------------------------------- aggiornamento (orde, fine prova)
export function update(sc, dt) {
  const L = sc.state.limbo; if (!L || sc.map.type !== 'limbo') return;
  const P = L.progress; sc.limboT = (sc.limboT || 0) + dt;
  if (P.done) {
    sc.limboEnd = (sc.limboEnd || 0) + dt;
    if (sc.limboEnd > 1.6 && !sc.rebirthStarted) { sc.rebirthStarted = true; sc.startRebirth(); }
    return;
  }
  if (L.trial === 'orda' && P.state === 'wave') {
    for (const e of [...sc.hordeAlive]) if (e.dead) sc.hordeAlive.delete(e);
    if (!sc.hordeAlive.size) {
      if (P.wave >= WAVES.length) { complete(sc); } else { P.state = 'pause'; sc.waveT = 3; sc.toast(`Orda ${P.wave} sconfitta! La prossima sta arrivando…`); }
    }
  } else if (L.trial === 'orda' && P.state === 'pause') {
    sc.waveT -= dt; if (sc.waveT <= 0) spawnWave(sc);
  }
}

export function spawnWave(sc) {
  const L = sc.state.limbo, m = sc.map, P = L.progress, horn = m.limbo.horn; if (!horn) return;
  const list = WAVES[P.wave]; if (!list) return;
  P.wave++; P.state = 'wave'; sc.hordeAlive = new Set();
  sc.toast(`Orda ${P.wave}/${WAVES.length}: i morti si levano!`); sc.shake(5); sc.audio.sfx('roar');
  list.forEach((id, i) => {
    const a = (i / list.length) * 6.283 + P.wave, r = 70 + (i % 3) * 14;
    let tx = Math.round(horn.x + Math.cos(a) * r / TS * 1.0), ty = Math.round(horn.y + Math.sin(a) * r / TS * 0.8);
    const t = sc.freeTile(m, tx, ty);
    const e = new Enemy(id, t.x * TS, t.y * TS, { scale: limboScale(sc.state.level) }); sc.world.add(e); e.dormant = false; e.state = 'chase'; e.aggro = 400; sc.hordeAlive.add(e);
    sc.spark(t.x * TS + 8, t.y * TS + 8, '#d8d0b8', 8);
  });
}

export function onKill(sc, e) {
  const L = sc.state.limbo; if (!L || sc.map.type !== 'limbo') return;
  if (e.id === 'guardiano_cripta') { L.progress.guardianDead = true; sc.toast('Il Guardiano crolla. L\'altare ti attende.'); }
  sc.hordeAlive?.delete(e);
}

// ---------------------------------------------------------------- interazioni con gli elementi della prova
export function lit(sc, prop) {
  const L = sc.state.limbo; if (!L) return false;
  const P = L.progress, d = prop.def;
  if (d.type === 'rune') { const i = (sc.map.limbo.seq || []).indexOf(d.glyph); return i >= 0 && i < P.step; }
  if (d.type === 'heart') return P.heart;
  if (d.type === 'horn') return P.state === 'wave' || P.done;
  return false;
}
export function interact(sc, prop) {
  const L = sc.state.limbo, st = sc.state, d = prop.def, m = sc.map; if (!L) return;
  const P = L.progress, seq = m.limbo.seq || [];
  if (P.done) { sc.toast('La luce ti avvolge già…'); return; }
  if (d.type === 'clue') {
    const i = Number(d.id.slice(5)); if (!P.clues.includes(i)) P.clues.push(i);
    sc.say('Lapide', d.text); sc.audio.sfx('select'); return;
  }
  if (d.type === 'rune') {
    if (L.trial !== 'enigma') return;
    if (P.clues.length < 3) { sc.toast('La runa è muta… forse le lapidi sanno qualcosa (ne hai lette ' + P.clues.length + '/3).'); return; }
    if (d.glyph === seq[P.step]) {
      P.step++; sc.audio.sfx('quest'); sc.ring(prop.cx, prop.cy, 26, '#fff7a0'); sc.spark(prop.cx, prop.cy - 8, '#fff7a0', 10);
      sc.toast(`Runa ${art(d.glyph)} accesa (${P.step}/3)`);
      if (P.step >= seq.length) complete(sc);
    } else {
      P.step = 0; sc.audio.sfx('hurt'); sc.shake(4); sc.floatText(prop.cx, prop.cy - 18, 'Ordine sbagliato!', '#ff6070'); sc.toast('Le rune si spengono. Ricomincia dalla prima.');
      for (let k = 0; k < 2; k++) { const t = sc.freeTile(m, Math.floor(prop.cx / TS) + (k ? 2 : -2), Math.floor(prop.cy / TS) + 2); const e = new Enemy('soldato_scheletrico', t.x * TS, t.y * TS, { scale: limboScale(sc.state.level) }); sc.world.add(e); e.dormant = false; e.state = 'chase'; }
    }
    return;
  }
  if (d.type === 'heart') {
    if (L.trial !== 'cuore') return;
    if (!P.guardianDead) { sc.toast('Il Guardiano veglia ancora sul Cuore: abbattilo.'); sc.shake(2); return; }
    P.heart = true; st.give('cuore_rinascita', 1); sc.audio.sfx('chest'); sc.spark(prop.cx, prop.cy - 10, '#ff4060', 16); sc.toast('Hai preso il Cuore della Rinascita!');
    complete(sc); return;
  }
  if (d.type === 'horn') {
    if (L.trial !== 'orda') return;
    if (P.state === 'idle' && P.wave === 0) { sc.audio.sfx('roar'); spawnWave(sc); } else if (P.state === 'wave') sc.toast('Le orde sono già qui!');
  }
}
export function complete(sc) {
  const L = sc.state.limbo; if (!L || L.progress.done) return;
  L.progress.done = true; sc.limboEnd = 0; sc.rebirthStarted = false; sc.audio.sfx('quest'); sc.toast('La prova è superata. La luce dei vivi ti chiama…');
}

// ---------------------------------------------------------------- rinascita: centro abitato più vicino al luogo della morte
function overworldPoint(pos, fallback) {
  const ow = getMap('overworld');
  let id = pos.map, x = pos.x, y = pos.y;
  for (let hops = 0; id !== 'overworld' && hops < 8; hops++) {
    let def = MAPS[id]; if (!def) break;
    while (def.prev && MAPS[def.prev]) { id = def.prev; def = MAPS[id]; }               // livelli di dungeon → primo livello
    const to = def.exit && def.exit.to; if (!to) break;
    if (to === 'overworld') {
      const a = def.exit.anchor && ow.anchors[def.exit.anchor];
      if (a) return { x: a.x, y: a.y };
      const po = ow.portals.find((q) => q.to === id); if (po) return { x: po.x, y: po.y };
      break;
    }
    id = to;
  }
  if (id === 'overworld') return { x, y };
  return fallback;
}
export function settlements() {
  const ow = getMap('overworld'), out = [];
  for (const [k, t] of Object.entries(TOWNS)) { const a = ow.anchors['town_' + k]; out.push({ id: k, n: t.n, cx: t.x + (t.w >> 1), cy: t.y + (t.h >> 1), tile: a || { x: t.x + (t.w >> 1), y: t.y + (t.h >> 1) } }); }
  for (const o of OUTPOSTS) { const a = ow.anchors['door_' + o.buildings[0].id]; out.push({ id: o.id, n: o.n, cx: o.x + (o.w >> 1), cy: o.y + (o.h >> 1), tile: a || { x: o.x + (o.w >> 1), y: o.y + (o.h >> 1) } }); }
  return out;
}
export function nearestSettlement(pos, fallbackPos) {
  const p = overworldPoint(pos, fallbackPos || { x: 300, y: 290 });
  let best = null, bd = 1e12;
  for (const s of settlements()) { const d = (s.cx - p.x) ** 2 + (s.cy - p.y) ** 2; if (d < bd) { bd = d; best = s; } }
  return best;
}
// Tile sicuro (nella zona protetta, non solido, non liquido) il più vicino possibile al punto desiderato
export function safeSpawn(sc, s) {
  const m = getMap('overworld'), sid = m.safeAt(s.tile.x, s.tile.y);
  for (let r = 0; r < 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const x = s.tile.x + dx, y = s.tile.y + dy;
    if (!m.inb(x, y) || !m.passable(x, y, null) || DEFS[m.g(x, y)].liquid || m.o(x, y)) continue;
    if (sid && m.safeAt(x, y) !== sid) continue;
    let open = true; for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!m.passable(x + ax, y + ay, null)) open = false;
    if (open) return { x, y };
  }
  return { x: s.tile.x, y: s.tile.y };
}
export function rebirth(sc) {
  const st = sc.state, from = st.deathPos || { map: 'overworld', x: 300, y: 290 };
  const s = nearestSettlement(from), pos = safeSpawn(sc, s);
  st.limbo = null; st.deaths = 0; st.hp = st.maxHp; st.ki = st.maxKi; st.stamina = st.maxStamina; st.guardPts = st.maxGuard; st.buffs = []; st.mount = null;
  st.respawn = { map: 'overworld', anchor: 'town_' + s.id };
  sc.taken = new Set(); sc.hordeAlive = null; sc.limboGuardian = null;
  sc.load('overworld', null, pos);
  sc.fade = { a: 0, dir: -1, cb: null };
  sc.toast(`Sei tornato tra i vivi a ${s.n}.`);
  return { s, pos };
}
export { RUNES };
void ENEMIES;
