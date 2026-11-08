import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { TRAITS, EXTRA_ATK } from './traits.js';
import { ENEMIES } from '../data/enemies.js';
import { drawMonster } from '../engine/Sprites.js';
import { dist } from '../core/Util.js';

// Libreria di attacchi riusabile da nemici comuni e boss (quelli speciali stanno in traits.js).
//  range = distanza massima per iniziare l'attacco, wind = telegrafo (s), rec = recupero (s)
const ATK = {
  slash: { wind: 0.4, rec: 0.5, run(e) { e.comboLeft = e.def.hits || (e.def.boss ? 3 : 2); e.comboGap = 0; } },
  charge: { range: 130, wind: 0.55, rec: 0.7, run(e, sc) { const p = e.world.player; const d = dist(e.cx, e.cy, p.cx, p.cy) || 1; e.chargeV = [(p.cx - e.cx) / d, (p.cy - e.cy) / d]; e.chargeT = 0.45; } },
  shoot: { range: 150, wind: 0.4, rec: 0.4, run(e, sc) { e.fire(sc, false); } },
  ring: { range: 180, wind: 0.7, rec: 0.8, run(e, sc) { e.fire(sc, true); } },
  slam: { range: 56, wind: 0.8, rec: 0.8, run(e, sc) { e.aoe(sc, 44 * e.sz * 0.8 + 10); } },
  summon: { range: 220, wind: 0.9, rec: 0.6, run(e, sc) { e.summon(sc); } },
  ...EXTRA_ATK,
};
export const ATK_NAMES = Object.keys(ATK);
const AI_ATKS = { contact: [], combo: ['slash'], ranged: ['shoot'], charger: ['charge'] };

export class Enemy extends Entity {
  constructor(id, x, y, o = {}) {
    const def = ENEMIES[id];
    const sz = def.size || 1;
    super(x, y, Math.round(10 * Math.min(sz, 1.6)), Math.round(8 * Math.min(sz, 1.6)));
    this.id = id; this.def = def; this.isEnemy = true;
    const scale = o.scale || 1;
    this.hpMax = Math.round(def.hp * scale); this.hp = this.hpMax; this.atk = Math.round(def.atk * scale);
    this.sz = sz; this.rad = 6 * sz;
    this.state = 'idle'; this.home = { x, y }; this.cd = 1 + Math.random(); this.dir = 0;
    this.hurtT = 0; this.poisonT = 0; this.poisonDps = 0; this.poisonAcc = 0; this.burnT = 0; this.burnDps = 0; this.burnAcc = 0; this.kbx = 0; this.kby = 0; this.frozenT = 0; this.paraT = 0; this.wetT = 0; this.slowT = 0;
    this.windT = 0; this.actT = 0; this.recT = 0; this.cur = null; this.tele = null;
    this.comboLeft = 0; this.comboGap = 0; this.chargeT = 0; this.chargeV = [0, 0];
    this.phase = 0; this.dormant = !!o.dormant; this.minions = [];
    this.aggro = def.boss ? 200 : 110;
    this.wt = 0; this.wv = [0, 0]; this.hpShow = 0;
    this.speedMul = 1; this.atkMul = 1; this.q = []; this.tr = {}; this.flying = false;
    this.T = TRAITS[def.trait] || null;
    // flag letti da TileMap.passable
    this.avoidSafe = true;
    this.waterOnly = !!def.aquatic;
    const floater = ['wisp', 'bird', 'drone', 'bat', 'tengu', 'jelly', 'dragon'].includes(def.shape);
    this.swimDeep = floater || !!def.aquatic; this.lavaProof = floater;
    this.T?.init?.(this);
  }

  get atks() {
    if (this.def.boss) return this.def.phases[this.phase].atks;
    return this.def.atks || AI_ATKS[this.def.ai] || [];
  }
  get speed() { return this.def.spd * (this.def.boss ? this.def.phases[this.phase].spd || 1 : 1) * this.speedMul * (this.slowT > 0 ? 0.45 : 1); }
  // Esegue `fn` tra `delay` secondi (attacchi a più tempi dei boss)
  later(delay, fn) { this.q.push({ t: delay, fn }); }

  update(dt, sc) {
    if (this.dead) return;
    this.t += dt;
    const p = this.world.player;
    if (!p) return;
    if (this.dormant) { this.T?.wake?.(this, p, sc); return; }
    if (!this.def.boss && Math.abs(this.cx - p.cx) + Math.abs(this.cy - p.cy) > 560) return; // fuori portata: congelato
    this.hurtT -= dt; this.cd -= dt; this.hpShow -= dt;
    for (const j of this.q) { j.t -= dt; if (j.t <= 0) { j.done = true; j.fn(); } }
    if (this.q.length) this.q = this.q.filter((j) => !j.done);
    if (this.burnT > 0) {
      this.burnT -= dt; this.burnAcc += dt;
      if (this.burnAcc >= 0.5) { this.burnAcc = 0; this.damage(this.burnDps * 0.5, sc, '#ff8030', true); if (this.dead) return; }
    }
    if (this.poisonT > 0) {
      this.poisonT -= dt; this.poisonAcc += dt;
      if (this.poisonAcc >= 0.5) { this.poisonAcc = 0; this.damage(this.poisonDps * 0.5, sc, '#80e060', false); if (this.dead) return; }
    }
    if (Math.abs(this.kbx) + Math.abs(this.kby) > 2) {
      this.move(this.kbx * dt, this.kby * dt);
      const k = Math.pow(0.003, dt); this.kbx *= k; this.kby *= k;
    }
    if (this.wetT > 0) { this.wetT -= dt; if (this.burnT > 0) { this.burnT = 0; } }
    if (this.slowT > 0) this.slowT -= dt;
    if (this.frozenT > 0 || this.paraT > 0) { // congelato o paralizzato: niente IA, niente attacchi
      this.frozenT -= dt; this.paraT -= dt;
      if (this.state === 'wind' || this.state === 'act') { this.state = 'rec'; this.recT = 0.4; this.tele = null; this.chargeT = 0; }
      return;
    }
    if (this.def.boss) { // cambio fase
      const r = this.hp / this.hpMax;
      const ph = this.def.phases.reduce((acc, f, i) => (r <= f.at ? i : acc), 0);
      if (ph > this.phase) { this.phase = ph; sc.shake(5); sc.floatText(this.cx, this.y - 20, '!!', '#ff4060'); sc.audio.sfx('roar'); this.cd = 0.5; this.T?.phase?.(this, sc, ph); }
    }
    const d = dist(this.cx, this.cy, p.cx, p.cy);
    if (this.T?.tick?.(this, dt, sc, p, d)) return;
    switch (this.state) {
      case 'idle': this.idle(dt, d, p); break;
      case 'chase': this.chase(dt, d, p, sc); break;
      case 'wind':
        this.windT -= dt; this.face = this.dirTo(p);
        if (this.windT <= 0) { this.tele = null; ATK[this.cur].run(this, sc); this.state = 'act'; this.actT = 0.15; }
        break;
      case 'act': this.act(dt, p, sc); break;
      case 'rec': this.recT -= dt; if (this.recT <= 0) this.state = 'chase'; break;
    }
    // danno da contatto
    const touching = Math.abs(this.cx - p.cx) < this.w / 2 + p.w / 2 && Math.abs(this.cy - p.cy) < this.h / 2 + p.h / 2;
    if (touching && (this.def.ai === 'contact' || this.chargeT > 0 || (this.def.boss && this.state !== 'wind'))) {
      this.strike(p, this.atk * (this.chargeT > 0 ? 1.3 : this.def.boss ? 0.6 : 1));
    }
  }

  // Colpisce il giocatore (applicando moltiplicatori e hook dei tratti)
  strike(p, dmg) {
    const r = p.hurt(dmg * this.atkMul, this);
    if (r === true) { this.T?.hitPlayer?.(this, this.world.scene, p); return true; }
    return !!r;
  }

  dirTo(p) { const d = dist(this.cx, this.cy, p.cx, p.cy) || 1; return { x: (p.cx - this.cx) / d, y: (p.cy - this.cy) / d }; }
  setDir() { this.dir = Math.abs(this.face.x) > Math.abs(this.face.y) ? (this.face.x < 0 ? 2 : 3) : (this.face.x < 0 ? 2 : 3); }

  idle(dt, d, p) {
    if (d < this.aggro) { this.state = 'chase'; return; }
    this.wt -= dt;
    if (this.wt <= 0) { this.wt = 1 + Math.random() * 2; const a = Math.random() * 6.28; this.wv = Math.random() < 0.5 ? [0, 0] : [Math.cos(a), Math.sin(a)]; }
    const sp = this.speed * 0.3;
    if (Math.hypot(this.x - this.home.x, this.y - this.home.y) > 48) this.wv = [Math.sign(this.home.x - this.x) * 0.7, Math.sign(this.home.y - this.y) * 0.7];
    if (this.wv[0] || this.wv[1]) { this.move(this.wv[0] * sp * dt, this.wv[1] * sp * dt); this.face = { x: this.wv[0], y: this.wv[1] }; this.setDir(); }
  }

  chase(dt, d, p, sc) {
    // abbandono dell'inseguimento se troppo lontano
    if (d > this.aggro * 2.2 && !this.def.boss) { this.state = 'idle'; return; }
    const dir = this.dirTo(p);
    this.face = dir; this.setDir();
    let mx = 0, my = 0;
    const sh = this.def.shoot, custom = this.T?.steer?.(this, dt, sc, p, d, dir);
    if (custom) { mx = custom.mx; my = custom.my; }
    else if (this.def.ai === 'ranged') {
      const pref = (sh?.range || 120) * 0.65;
      if (d < pref * 0.6) { mx = -dir.x; my = -dir.y; } else if (d > pref * 1.2) { mx = dir.x; my = dir.y; } else { mx = -dir.y * 0.6; my = dir.x * 0.6; }
    } else if (d > (this.def.reach || 18) * 0.8) { mx = dir.x; my = dir.y; }
    const sp = this.speed;
    if (mx || my) {
      const r = this.move(mx * sp * dt, my * sp * dt);
      if (r.hitX && !r.hitY) this.move(0, Math.sign(my || dir.y || 1) * sp * dt);
      else if (r.hitY && !r.hitX) this.move(Math.sign(mx || dir.x || 1) * sp * dt, 0);
    }
    // scelta attacco
    if (this.cd <= 0) {
      const list = this.atks.slice().sort(() => Math.random() - 0.5);
      for (const name of list) {
        const a = ATK[name];
        const range = name === 'slash' ? (this.def.reach || 20) + 6 : name === 'shoot' ? (sh?.range || a.range) : a.range;
        if (d <= range) { this.beginAttack(name, sc); break; }
      }
    }
  }

  beginAttack(name, sc) {
    const a = ATK[name];
    this.cur = name; this.state = 'wind'; this.windT = a.wind / (this.def.boss ? this.def.phases[this.phase].spd || 1 : 1);
    this.tele = name === 'slam' ? { type: 'circle', r: 44 * this.sz * 0.8 + 10 }
      : name === 'charge' ? { type: 'line' } : name === 'ring' ? { type: 'circle', r: 22 } : { type: 'flash' };
  }

  act(dt, p, sc) {
    if (this.cur === 'slash' && this.comboLeft > 0) {
      this.comboGap -= dt;
      if (this.comboGap <= 0) {
        this.comboLeft--; this.comboGap = 0.28;
        const reach = this.def.reach || 20, f = this.dirTo(p); this.face = f;
        this.move(f.x * 5, f.y * 5); // piccolo affondo
        const hx = this.cx + f.x * reach * 0.6, hy = this.cy + f.y * reach * 0.6;
        sc.slash(this.cx, this.cy, Math.atan2(f.y, f.x), reach, Math.PI * 0.7, false, '#ff7080');
        if (dist(hx, hy, p.cx, p.cy) < reach * 0.8 + 5) this.strike(p, this.atk);
      }
      if (this.comboLeft <= 0 && this.comboGap < 0.1) this.endAct(ATK.slash.rec);
      return;
    }
    if (this.cur === 'charge' && this.chargeT > 0) {
      this.chargeT -= dt;
      const r = this.move(this.chargeV[0] * 210 * dt, this.chargeV[1] * 210 * dt);
      if ((r.hitX && Math.abs(this.chargeV[0]) > 0.5) || (r.hitY && Math.abs(this.chargeV[1]) > 0.5)) { this.chargeT = 0; sc.shake(2); this.T?.bump?.(this, sc); }
      if (this.chargeT <= 0) this.endAct(ATK.charge.rec);
      return;
    }
    this.actT -= dt;
    if (this.actT <= 0 && !this.q.length) this.endAct(ATK[this.cur]?.rec || 0.4);
  }
  endAct(rec) {
    const name = this.cur;
    this.state = 'rec'; this.recT = rec; this.chargeT = 0;
    this.cd = (this.def.boss ? 0.5 : 1.0) + Math.random() * (this.def.shoot?.cd || 1.2) * (this.def.boss ? 0.6 : 1);
    this.T?.after?.(this, this.world.scene, name);
  }

  // over: {n, spread} per sovrascrivere il numero di proiettili (es. teste dell'idra)
  fire(sc, ring, over = {}) {
    const sh = { ...(this.def.shoot || { kind: 'orb', spd: 80, n: 1, spread: 0 }), ...over };
    const p = this.world.player, base = Math.atan2(p.cy - this.cy, p.cx - this.cx);
    const full = ring || sh.ring;
    sc.audio.sfx('shoot');
    const n = full ? (this.def.boss ? 14 : sh.n || 8) : sh.n || 1;
    const off = Math.random() * 0.4;
    for (let i = 0; i < n; i++) {
      const a = full ? off + (i / n) * Math.PI * 2 : n === 1 ? base : base + ((i / (n - 1)) - 0.5) * (sh.spread || 0.4) * 2;
      sc.world.add(new Projectile({
        x: this.cx, y: this.cy - 4, vx: Math.cos(a) * sh.spd, vy: Math.sin(a) * sh.spd, r: sh.kind === 'arrow' || sh.kind === 'laser' ? 2 : 3,
        dmg: this.atk * 0.8 * this.atkMul, team: 'enemy', life: 3.2, kind: sh.kind, col: this.def.col[2], owner: this, fx: sh.fx,
      }));
    }
  }
  aoe(sc, r) {
    const p = this.world.player;
    sc.shake(5); sc.audio.sfx('explode');
    sc.ring(this.cx, this.cy, r, '#ff5060');
    if (dist(this.cx, this.cy, p.cx, p.cy) < r) this.strike(p, this.atk * 1.4);
  }
  summon(sc) {
    this.minions = this.minions.filter((m) => !m.dead);
    if (this.minions.length >= 4) return;
    for (let i = 0; i < 2; i++) {
      const m = sc.spawnEnemy(this.def.summon, this.cx + (i ? 24 : -24), this.cy + 16);
      if (m) { m.state = 'chase'; m.noLoot = true; this.minions.push(m); }
    }
  }

  damage(n, sc, col = '#fff', fire = false) {
    this.hp -= n; this.hpShow = 3;
    sc.floatText(this.cx, this.y - 6, String(Math.max(1, Math.round(n))), col);
    if (this.hp <= 0) {
      if (this.T?.die?.(this, sc, fire)) { this.hp = Math.max(this.hp, 1); return; } // resurrezione
      this.dead = true; sc.onKill(this);
    }
  }
  // Stati elementali: i boss resistono (durate ridotte); il bagnato prolunga gelo e paralisi.
  applyStatus(s) {
    const res = this.def.boss ? 0.35 : 1, wet = this.wetT > 0 ? 1.5 : 1;
    if (s.freeze) this.frozenT = Math.max(this.frozenT, s.freeze * res * wet);
    if (s.para) this.paraT = Math.max(this.paraT, s.para * res);
    if (s.slow) this.slowT = Math.max(this.slowT, s.slow * res);
    if (s.wet) this.wetT = Math.max(this.wetT, s.wet);
  }
  hurt(dmg, src, o = {}) {
    if (this.dead || this.dormant) return;
    const sc = this.world.scene;
    if (this.T?.hurt) dmg = this.T.hurt(this, dmg, src, o, sc);
    if (dmg <= 0) return;
    if (this.frozenT > 0 && !o.status && o.elem !== 'bomb') { dmg *= 1.4; this.frozenT = Math.min(this.frozenT, 0.3); sc.spark(this.cx, this.cy, '#d8f4ff', 6); } // il ghiaccio si frantuma
    if (o.elem === 'lightning' && this.wetT > 0) dmg *= 1; // il bonus del bagnato è applicato da chi lancia il fulmine
    if (o.status) this.applyStatus(o.status);
    this.hurtT = 0.12;
    if (o.poison) { this.poisonT = Math.max(this.poisonT, o.poison); this.poisonDps = Math.max(this.poisonDps, dmg * 0.18); }
    if (o.burn) { this.burnT = Math.max(this.burnT, o.burn); this.burnDps = Math.max(this.burnDps, o.burnDps || dmg * 0.2); }
    if (src && o.kb) {
      const dx = this.cx - src.cx, dy = this.cy - src.cy, l = Math.hypot(dx, dy) || 1, k = o.kb * (this.def.boss ? 0.1 : 1);
      this.kbx = (dx / l) * k; this.kby = (dy / l) * k;
    }
    if (this.state === 'idle') this.state = 'chase';
    sc.audio.sfx('hit');
    this.damage(dmg, sc, dmg > 25 ? '#ffe060' : '#fff');
  }

  draw(g, cx, cy) {
    if (this.T?.hidden?.(this)) { // sotto terra: solo un mucchietto di sabbia
      g.fillStyle = 'rgba(200,170,100,.6)'; g.fillRect(Math.round(this.cx - cx) - 4, Math.round(this.feetY - cy) - 2, 8, 2); return;
    }
    const lift = this.tr.air ? 9 : 0;
    const x = Math.round(this.cx - cx), y = Math.round(this.feetY - cy - lift);
    const sz = this.sz;
    if (lift) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 5, Math.round(this.feetY - cy) - 2, 10, 2); }
    // telegrafo
    if (this.tele && this.state === 'wind') {
      const a = 0.25 + 0.2 * Math.sin(this.t * 30);
      g.fillStyle = `rgba(255,60,80,${a})`;
      if (this.tele.type === 'circle') { g.beginPath(); g.arc(x, y - 4, this.tele.r, 0, Math.PI * 2); g.fill(); }
      else if (this.tele.type === 'line') {
        g.save(); g.translate(x, y - 4); g.rotate(Math.atan2(this.face.y, this.face.x)); g.fillRect(0, -4, 130, 8); g.restore();
      }
    }
    const flash = this.hurtT > 0 || (this.state === 'wind' && Math.floor(this.t * 16) % 2 === 0);
    const alpha = this.tr.ghost ? 0.38 : this.tr.down > 0 ? 0.5 : null;
    const col = this.tr.stat ? ['#7a7a80', '#9a9aa0', '#5a5a60'] : this.def.col;
    drawMonster(g, x, y, this.def.shape, col, Math.floor(this.t * 6), { size: sz, flash, dir: this.dir, vis: this.def.vis, tr: this.tr, alpha, t: this.t });
    if (this.poisonT > 0) { g.fillStyle = '#80e060'; g.fillRect(x + 2 + (Math.floor(this.t * 9) % 4), y - 12 * sz, 2, 2); }
    if (this.frozenT > 0) { g.fillStyle = 'rgba(170,230,255,.55)'; g.fillRect(x - 7 * sz, y - 15 * sz, 14 * sz, 15 * sz); g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(x - 5 * sz, y - 14 * sz, 3, 6); }
    if (this.paraT > 0 && Math.floor(this.t * 20) % 2) { g.fillStyle = '#fff060'; g.fillRect(x - 6 * sz, y - 10 * sz, 2, 8); g.fillRect(x + 4 * sz, y - 14 * sz, 2, 6); g.fillRect(x - 2, y - 17 * sz, 4, 2); }
    if (this.wetT > 0) { g.fillStyle = '#6ab8ff'; g.fillRect(x - 5 + (Math.floor(this.t * 6) % 3) * 3, y - 12 * sz + (Math.floor(this.t * 9) % 4) * 2, 2, 3); }
    if (this.burnT > 0) { g.fillStyle = '#ff8030'; g.fillRect(x - 3 + (Math.floor(this.t * 12) % 4), y - 14 * sz, 2, 2); }
    if (this.tr.stun > 0) { for (let i = 0; i < 3; i++) { const a = this.t * 6 + i * 2.1; g.fillStyle = '#ffe060'; g.fillRect(x + Math.round(Math.cos(a) * 7), y - 18 * sz + Math.round(Math.sin(a) * 2), 2, 2); } }
    if (this.tr.guard) { g.strokeStyle = '#80f0ff'; g.beginPath(); g.arc(x + (this.face.x > 0 ? 8 : -8), y - 10, 8, -1.2, 1.2, this.face.x < 0); g.stroke(); }
    if (!this.def.boss && this.hpShow > 0) {
      const w = 16, top = y - 18 * sz;
      g.fillStyle = '#000'; g.fillRect(x - w / 2 - 1, top - 1, w + 2, 4);
      g.fillStyle = '#802030'; g.fillRect(x - w / 2, top, w, 2);
      g.fillStyle = '#ff5060'; g.fillRect(x - w / 2, top, Math.max(0, (w * this.hp) / this.hpMax), 2);
    }
  }
}
