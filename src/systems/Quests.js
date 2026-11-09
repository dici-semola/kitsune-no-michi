import { QUESTS } from '../data/quests.js';
import { run } from './Script.js';

// Registro missioni: stato per quest = {st:'active'|'done', p:[progressi]}
export class QuestLog {
  constructor() { this.s = {}; }
  status(id) { return this.s[id]?.st || 'inactive'; }
  ids(st) { return Object.keys(this.s).filter((id) => this.s[id].st === st); }

  start(id, state) {
    if (this.s[id] || !QUESTS[id]) return;
    this.s[id] = { st: 'active', p: QUESTS[id].obj.map(() => 0) };
    state.bus.emit('toast', `Nuova missione: ${QUESTS[id].title}`);
    this.recheck(state);
  }

  // Restituisce {cur, need, done} per l'obiettivo i.
  progress(id, i, state) {
    const o = QUESTS[id].obj[i], q = this.s[id], p = q?.p[i] || 0;
    switch (o.t) {
      case 'kill': return { cur: Math.min(p, o.n), need: o.n, done: p >= o.n };
      case 'have': { const need = o.n || 1, cur = Math.min(state.inv.count(o.item), need); return { cur, need, done: cur >= need }; }
      case 'boss': { const d = state.flags.has('boss:' + o.boss); return { cur: +d, need: 1, done: d }; }
      case 'flag': { const d = state.flags.has(o.flag); return { cur: +d, need: 1, done: d }; }
      default: return { cur: p ? 1 : 0, need: 1, done: !!p }; // talk, reach
    }
  }
  firstOpen(id, state) {
    const n = QUESTS[id].obj.length;
    for (let i = 0; i < n; i++) if (!this.progress(id, i, state).done) return i;
    return -1;
  }

  // type: 'kill' {id} | 'talk' {npc} | 'enter' {map}
  event(type, payload, state) {
    for (const id of this.ids('active')) {
      const i = this.firstOpen(id, state);
      if (i < 0) continue;
      const o = QUESTS[id].obj[i], q = this.s[id];
      if (type === 'kill' && o.t === 'kill' && (o.enemy === 'any' || o.enemy === payload.id)) q.p[i]++;
      else if (type === 'talk' && o.t === 'talk' && o.npc === payload.npc) q.p[i] = 1;
      else if (type === 'enter' && o.t === 'reach' && o.map === payload.map) q.p[i] = 1;
    }
    this.recheck(state);
  }

  recheck(state) {
    for (const id of this.ids('active')) if (this.firstOpen(id, state) < 0) this.complete(id, state);
  }

  complete(id, state) {
    const q = QUESTS[id];
    if (this.s[id].st === 'done') return;
    if (q.obj.some((o) => o.take)) for (const o of q.obj) if (o.t === 'have') state.inv.remove(o.item, o.n || 1);
    this.s[id].st = 'done';
    const r = q.reward || {};
    const fx = [];
    if (r.gold) fx.push(['gold', r.gold]);
    if (r.maxHp) fx.push(['maxhp', r.maxHp]);
    for (const [it, n] of r.items || []) fx.push(['give', it, n]);
    for (const f of r.flags || []) fx.push(f.startsWith('mount:') ? ['mount', f.slice(6)] : ['flag', f]);
    state.bus.emit('toast', `Missione completata: ${q.title}`);
    state.bus.emit('questdone', id);
    run(fx, { state, bus: state.bus });
  }

  // Segnalino sopra gli NPC: '!' missione disponibile, '?' obiettivo di consegna/dialogo.
  marker(npc, state) {
    for (const id of Object.keys(QUESTS)) {
      const q = QUESTS[id], st = this.status(id);
      if (st === 'inactive' && q.giver === npc && this.available(id, state)) return '!';
      if (st === 'active') {
        const i = this.firstOpen(id, state);
        if (i >= 0 && QUESTS[id].obj[i].t === 'talk' && QUESTS[id].obj[i].npc === npc) return '?';
      }
    }
    return null;
  }
  available(id, state) {
    switch (id) {
      case 'm2_fox': return state.flags.has('omen_done');
      case 'm3_capitale': return state.flags.has('fox_done');
      case 'm4_frammenti': case 'm5_macchina': return state.flags.has('ottokar_met');
      case 'm6_neoedo': return state.flags.has('machine_on');
      case 'm7_yomi': return state.flags.has('boss:kamios');
      case 'm8_finale': return state.flags.has('boss:enma');
      default: return true;
    }
  }

  serialize() { return this.s; }
  restore(d) { this.s = JSON.parse(JSON.stringify(d)); }
}
