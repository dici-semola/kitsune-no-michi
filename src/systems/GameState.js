import { Inventory } from './Inventory.js';
import { QuestLog } from './Quests.js';
import { ABILITY_DEFS } from '../data/abilities.js';
import { AMMO_MAX, ITEMS, AMMO } from '../data/items.js';
import { QUESTS } from '../data/quests.js';
import { ENEMIES } from '../data/enemies.js';
import { BOMBS } from '../data/crafting.js';
import { MAPS } from '../data/world.js';
import { getMap, mapIds } from '../world/Generators.js';

let _chests = 0;
const totalChests = () => _chests ||= mapIds().reduce((n, id) => n + getMap(id).props.filter((p) => p.type === 'chest').length, 0);

// Curva XP: il livello sale SOLO uccidendo mostri.
export const xpNeed = (l) => Math.floor(14 * Math.pow(l, 1.45));
export const MAX_LEVEL = 50;
export const EXPLORE_CELL = 8;
// Doni iniziali scelti nella creazione del personaggio
export const GIFTS = {
  equilibrio: { n: 'Equilibrio', d: '+8 PV, +8 Ki, +4% velocità', hp: 8, ki: 8, spd: 0.04 },
  vigore: { n: 'Vigore', d: '+24 PV massimi, guardia +15', hp: 24, grd: 15 },
  spirito: { n: 'Spirito', d: '+24 Ki massimo', ki: 24 },
  agilita: { n: 'Agilità', d: '+8% velocità, +20 stamina', spd: 0.08, sta: 20 },
};
// Flag di trama che avviano automaticamente la missione principale successiva
const AUTO_QUEST = { machine_on: 'm6_neoedo', 'boss:kamios': 'm7_yomi', 'boss:enma': 'm8_finale' };

export class GameState {
  constructor(bus) {
    this.bus = bus;
    this.name = 'Akane';
    this.look = { hair: 0, skin: 0, red: 0, mask: 0, gender: 0, style: 0 };
    this.gift = 'equilibrio'; this.stamina = 100; this.guardPts = 60; this.bombSel = null; this.recipesSeen = new Set(); this.deaths = 0; this.limbo = null; this.limboCycles = 0; this.lastLimboCfg = -1; this.deathPos = null; this.weaponMode = 'katana'; this.ammoSel = 0; this.camp = null;
    this.level = 1; this.xp = 0; this.bonusHp = 0;
    this.inv = new Inventory();
    this.hp = this.maxHp; this.ki = this.maxKi; this.guardPts = this.maxGuard;
    this.flags = new Set();
    this.quests = new QuestLog();
    this.abilities = new Set();
    this.map = 'overworld'; this.pos = null;
    this.minutes = 7 * 60;
    this.mount = null;
    this.kills = {};            // bestiario
    this.visited = new Set();   // aree visitate (completismo)
    this.seen = new Set();      // oggetti ottenuti almeno una volta
    this.secrets = [];          // luoghi segreti rivelati da spiriti e oracoli: {map,x,y,n}
    this.explored = {};         // mappa -> Set di celle 8x8 esplorate (nebbia di guerra)
    this.buffs = [];            // {stat,val,t}
    this.respawn = { map: 'overworld', anchor: 'start' };
    this.playtime = 0;
    this.postgame = false;
    this.attach();
  }

  // Collega gli eventi di gioco al registro missioni.
  attach() {
    this.bus.on('kill', (p) => this.quests.event('kill', p, this));
    this.bus.on('talk', (p) => this.quests.event('talk', p, this));
    this.bus.on('enter', (p) => this.quests.event('enter', p, this));
  }

  get maxHp() { return 60 + (this.level - 1) * 8 + this.bonusHp + this.inv.bonus('hp') + (GIFTS[this.gift]?.hp || 0); }
  get maxKi() { return 40 + this.level * 2 + this.inv.bonus('ki') + (GIFTS[this.gift]?.ki || 0); }
  // Resistenza della guardia: cresce con il livello, il dono 'vigore' e l'equipaggiamento (stat 'guard')
  get maxGuard() { return 60 + Math.floor((this.level - 1) * 1.5) + (GIFTS[this.gift]?.grd || 0) + (this.inv ? this.inv.bonus('guard') : 0); }
  get maxStamina() { return 100 + (GIFTS[this.gift]?.sta || 0); }
  get speedBonus() { return GIFTS[this.gift]?.spd || 0; }
  ammoReady() { return AMMO.some((a) => this.inv.has(a)); }
  cycleAmmo() { for (let i = 1; i <= AMMO.length; i++) { const n = (this.ammoSel + i) % AMMO.length; if (this.inv.has(AMMO[n])) { this.ammoSel = n; return; } } }
  ammoName() { const t = AMMO.find((a, i) => i === this.ammoSel && this.inv.has(a)) || AMMO.find((a) => this.inv.has(a)); return t ? `${ITEMS[t].n} x${this.inv.count(t)} (${this.inv.ammoTotal()}/${AMMO_MAX})` : 'nessuna'; }
  buff(stat) { return this.buffs.filter((b) => b.stat === stat).reduce((a, b) => a + b.val, 0); }
  get atk() { return Math.round((4 + this.level * 2.2 + this.inv.bonus('atk')) * (1 + this.buff('atk'))); }
  get def() { return Math.round((this.level * 0.8 + this.inv.bonus('def')) * (1 + this.buff('def'))); }
  get hour() { return this.minutes / 60; }
  isNight() { const h = this.hour; return h >= 22 || h < 5; }

  // ---- Nebbia di guerra: la mappa mostra solo ciò che il giocatore ha visto ----
  revealAt(map, tx, ty, r = 11) {
    const set = (this.explored[map.id] ||= new Set()), cw = Math.ceil(map.w / EXPLORE_CELL);
    const x0 = Math.max(0, Math.floor((tx - r) / EXPLORE_CELL)), x1 = Math.min(cw - 1, Math.floor((tx + r) / EXPLORE_CELL));
    const y0 = Math.max(0, Math.floor((ty - r) / EXPLORE_CELL)), y1 = Math.min(Math.ceil(map.h / EXPLORE_CELL) - 1, Math.floor((ty + r) / EXPLORE_CELL));
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      if (Math.hypot(cx * EXPLORE_CELL + 4 - tx, cy * EXPLORE_CELL + 4 - ty) <= r + 4) set.add(cy * cw + cx);
    }
  }
  revealAll(map) {
    const set = (this.explored[map.id] ||= new Set()), n = Math.ceil(map.w / EXPLORE_CELL) * Math.ceil(map.h / EXPLORE_CELL);
    for (let i = 0; i < n; i++) set.add(i);
  }
  isExplored(map, tx, ty) {
    const set = this.explored[map.id];
    return !!set && set.has(Math.floor(ty / EXPLORE_CELL) * Math.ceil(map.w / EXPLORE_CELL) + Math.floor(tx / EXPLORE_CELL));
  }

  hasFlag(f) { return this.flags.has(f); }
  setFlag(f) {
    if (this.flags.has(f)) return;
    this.flags.add(f);
    this.bus.emit('flag', f);
    const next = AUTO_QUEST[f];
    if (next) this.quests.start(next, this);
    this.checkUnlocks();
    this.quests.recheck(this);
  }

  give(id, n = 1) {
    const added = this.inv.add(id, n);
    if (added > 0) {
      this.seen.add(id);
      this.bus.emit('toast', `${ITEMS[id].n}${added > 1 ? ' x' + added : ''}`);
      this.quests.recheck(this);
    } else this.bus.emit('toast', `Inventario pieno: ${ITEMS[id].n}`);
    return added;
  }

  // Il livello dipende solo dall'XP guadagnato uccidendo mostri.
  addXp(n) {
    if (this.level >= MAX_LEVEL) return;
    this.xp += n;
    while (this.level < MAX_LEVEL && this.xp >= xpNeed(this.level)) {
      this.xp -= xpNeed(this.level);
      this.level++;
      this.hp = this.maxHp; this.ki = this.maxKi;
      this.bus.emit('toast', `Livello ${this.level}! PV massimi ${this.maxHp}`);
      this.bus.emit('levelup', this.level);
      this.checkUnlocks();
    }
  }

  // Un'abilità si sblocca quando livello E progresso di trama sono entrambi soddisfatti.
  checkUnlocks() {
    for (const a of Object.values(ABILITY_DEFS)) {
      if (this.abilities.has(a.id)) continue;
      if (this.level >= a.unlock.level && this.flags.has(a.unlock.flag)) {
        this.abilities.add(a.id);
        this.bus.emit('toast', `Nuova abilità: ${a.n} [${a.key}]`);
      }
    }
  }

  // Usa cibo/pozione. Ritorna il testo dell'effetto o null.
  // Esplosivi posseduti (ordine del catalogo) e selezione corrente
  bombList() { return Object.keys(BOMBS).filter((id) => this.inv.count(id) > 0); }
  bombCurrent() { const l = this.bombList(); if (!l.length) return null; if (!this.bombSel || !l.includes(this.bombSel)) this.bombSel = l[0]; return this.bombSel; }
  cycleBomb() { const l = this.bombList(); if (!l.length) { this.bombSel = null; return; } const i = l.indexOf(this.bombSel); this.bombSel = l[(i + 1) % l.length]; }
  bombName() { const id = this.bombCurrent(); return id ? `${BOMBS[id].n} x${this.inv.count(id)}` : 'nessuno'; }
  useItem(id) {
    const def = ITEMS[id];
    if (!def?.use || !this.inv.has(id)) return null;
    const u = def.use, out = [];
    if (u.hp) { const h = Math.min(u.hp, this.maxHp - this.hp); this.hp += h; out.push(`+${Math.round(h)} PV`); }
    if (u.ki) { const k = Math.min(u.ki, this.maxKi - this.ki); this.ki += k; out.push(`+${Math.round(k)} Ki`); }
    if (u.buff) { this.buffs = this.buffs.filter((b) => b.stat !== u.buff.stat); this.buffs.push({ stat: u.buff.stat, val: u.buff.val, t: u.buff.dur, el: u.buff.el }); out.push(def.n); }
    if (u.cure) out.push('Curato');
    if (!out.length) return null;
    this.inv.remove(id, 1);
    return out.join('  ');
  }
  tick(dt) {
    for (const b of this.buffs) b.t -= dt;
    this.buffs = this.buffs.filter((b) => b.t > 0);
    this.playtime += dt;
  }

  // Percentuale di completamento per il post-game esplorabile all'infinito.
  completion() {
    const maps = Object.keys(MAPS);
    const bosses = Object.keys(ENEMIES).filter((k) => ENEMIES[k].boss);
    const parts = {
      Aree: [maps.filter((m) => this.visited.has(m)).length, maps.length],
      Boss: [bosses.filter((b) => this.flags.has('boss:' + b)).length, bosses.length],
      Bestiario: [Object.keys(ENEMIES).filter((k) => this.kills[k]).length, Object.keys(ENEMIES).length],
      Missioni: [this.quests.ids('done').length, Object.keys(QUESTS).length],
      Oggetti: [this.seen.size, Object.keys(ITEMS).length],
      Forzieri: [[...this.flags].filter((f) => f.startsWith('chest:')).length, totalChests()],
    };
    let a = 0, b = 0;
    for (const [x, y] of Object.values(parts)) { a += Math.min(x, y) / y; b++; }
    return { parts, pct: Math.floor((a / b) * 100) };
  }

  serialize() {
    return {
      v: 1, name: this.name, look: this.look, level: this.level, xp: this.xp, bonusHp: this.bonusHp, hp: this.hp, ki: this.ki,
      flags: [...this.flags], inv: this.inv.serialize(), quests: this.quests.serialize(), abilities: [...this.abilities],
      map: this.map, pos: this.pos, minutes: this.minutes, kills: this.kills, visited: [...this.visited], seen: [...this.seen],
      respawn: this.respawn, playtime: this.playtime, postgame: this.postgame, gift: this.gift, secrets: this.secrets, stamina: this.stamina, guardPts: this.guardPts, bombSel: this.bombSel, recipesSeen: [...this.recipesSeen], deaths: this.deaths, limbo: this.limbo, limboCycles: this.limboCycles, lastLimboCfg: this.lastLimboCfg, deathPos: this.deathPos, weaponMode: this.weaponMode, ammoSel: this.ammoSel, camp: this.camp,
      explored: Object.fromEntries(Object.entries(this.explored).map(([k, v]) => [k, [...v]])),
    };
  }
  // Valori numerici sempre finiti e nei limiti (un NaN/null salvato non deve bloccare guardia, barre o movimento)
  sanitize() {
    const num = (v, def, lo = -Infinity, hi = Infinity) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def);
    this.level = Math.round(num(this.level, 1, 1, 999)); this.xp = num(this.xp, 0, 0); this.bonusHp = num(this.bonusHp, 0, 0);
    this.hp = num(this.hp, this.maxHp, 1, this.maxHp); this.ki = num(this.ki, this.maxKi, 0, this.maxKi);
    this.stamina = num(this.stamina, 100, 0, this.maxStamina); this.guardPts = num(this.guardPts, this.maxGuard, 0, this.maxGuard);
    this.minutes = num(this.minutes, 7 * 60, 0, 1440); if (!this.kills || typeof this.kills !== 'object') this.kills = {}; this.playtime = num(this.playtime, 0, 0);
    if (!this.look || typeof this.look !== 'object') this.look = { hair: 0, skin: 0, red: 0, mask: 0, gender: 0, style: 0 };
    if (typeof this.name !== 'string' || !this.name) this.name = 'Akane';
    if (!this.map) this.map = 'overworld';
    if (this.camp && !(this.camp.map && Number.isFinite(this.camp.x) && Number.isFinite(this.camp.y))) this.camp = null;
    if (this.pos && !(Number.isFinite(this.pos.x) && Number.isFinite(this.pos.y))) this.pos = null;
    return this;
  }
  static restore(bus, d) {
    const s = new GameState(bus);
    Object.assign(s, { name: d.name, look: d.look, level: d.level, xp: d.xp, bonusHp: d.bonusHp, hp: d.hp, ki: d.ki, map: d.map, pos: d.pos,
      minutes: d.minutes, kills: d.kills, respawn: d.respawn, playtime: d.playtime, postgame: d.postgame,
      gift: d.gift || 'equilibrio', stamina: d.stamina ?? 100, guardPts: d.guardPts ?? 60, bombSel: d.bombSel || null, deaths: d.deaths || 0, limbo: d.limbo || null, limboCycles: d.limboCycles || 0, lastLimboCfg: d.lastLimboCfg ?? -1, deathPos: d.deathPos || null, weaponMode: d.weaponMode || 'katana', ammoSel: d.ammoSel || 0, camp: d.camp || null });
    s.recipesSeen = new Set(d.recipesSeen || []);
    s.look = { gender: 0, style: 0, ...d.look }; s.secrets = d.secrets || [];
    s.flags = new Set(d.flags); s.visited = new Set(d.visited); s.seen = new Set(d.seen); s.abilities = new Set(d.abilities);
    s.explored = Object.fromEntries(Object.entries(d.explored || {}).map(([k, v]) => [k, new Set(v)]));
    s.inv.restore(d.inv); s.quests.restore(d.quests);
    s.sanitize();
    return s;
  }
}

// Salvataggi persistenti nel browser (localStorage): slot 'auto' + 3 slot manuali.
// Ogni scrittura conserva la versione precedente come backup e include un checksum: se il file principale è danneggiato si ripristina il backup.
const PREFIX = 'kitsune_save_v2_', OLD = 'kitsune_no_michi_save_v1';
export const SLOTS_LIST = ['auto', 's1', 's2', 's3'];
const sum = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return h >>> 0; };
const unwrap = (raw) => { try { const o = JSON.parse(raw); if (o && typeof o.d === 'string' && o.c === sum(o.d)) return { meta: o.m, data: JSON.parse(o.d) }; } catch { /* danneggiato */ } return null; };
export const Save = {
  has(slot = 'auto') { return !!this.peek(slot) || (slot === 'auto' && this.legacy()); },
  legacy() { try { return !!localStorage.getItem(OLD); } catch { return false; } },
  peek(slot) { // metadati dello slot, senza caricare la partita
    try { const o = unwrap(localStorage.getItem(PREFIX + slot)) || unwrap(localStorage.getItem(PREFIX + slot + '_bak')); return o ? o.meta : null; } catch { return null; }
  },
  any() { return SLOTS_LIST.some((s) => this.peek(s)) || this.legacy(); },
  write(state, slot = 'auto') {
    try {
      if (!state || !state.inv || !Number.isFinite(state.level)) return false; // mai sovrascrivere un salvataggio valido con dati incompleti
      const d = JSON.stringify(state.serialize());
      const meta = { name: state.name, level: state.level, map: state.map, t: Date.now(), play: Math.floor(state.playtime), gender: state.look.gender, pct: state.completion().pct };
      const out = JSON.stringify({ v: 2, m: meta, d, c: sum(d) });
      const prev = localStorage.getItem(PREFIX + slot);
      const put = () => { if (prev && unwrap(prev)) localStorage.setItem(PREFIX + slot + '_bak', prev); localStorage.setItem(PREFIX + slot, out); };
      try { put(); } catch (e) { localStorage.removeItem(PREFIX + slot + '_bak'); localStorage.setItem(PREFIX + slot, out); } // memoria piena: si rinuncia al backup, non al salvataggio
      if (localStorage.getItem(PREFIX + slot) !== out) return false; // verifica di lettura
      this.lastOk = Date.now();
      return true;
    } catch { return false; }
  },
  read(bus, slot = 'auto') {
    try {
      const o = unwrap(localStorage.getItem(PREFIX + slot)) || unwrap(localStorage.getItem(PREFIX + slot + '_bak'));
      if (o) return GameState.restore(bus, o.data);
      if (slot === 'auto' && this.legacy()) return GameState.restore(bus, JSON.parse(localStorage.getItem(OLD))); // compatibilità con il vecchio formato
    } catch { /* ignora */ }
    return null;
  },
  // esportazione/importazione come file JSON (per spostare i progressi tra dispositivi)
  exportText(state) { const d = JSON.stringify(state.serialize()); return JSON.stringify({ game: 'kitsune-no-michi', v: 2, d, c: sum(d) }); },
  importText(bus, text) { try { const o = JSON.parse(text); if (o.game !== 'kitsune-no-michi' || o.c !== sum(o.d)) return null; return GameState.restore(bus, JSON.parse(o.d)); } catch { return null; } },
};
