import { Bomb } from './Bomb.js';
import { castElement } from '../abilities/Elements.js';
import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { drawPlayerSprite, drawMount, shadow, TOPS, SKIN } from '../engine/Sprites.js';
import { MOUNTS } from '../data/mounts.js';
import { AMMO } from '../data/items.js';
import { WEAR } from '../data/scudi.js';
import { angDiff, TS } from '../core/Util.js';

const WEAPON_COL = { katana_kitsune: ['#ff7a30', '#ffd060'], katana_tempesta: ['#80c8ff', '#e8f8ff'], masamune_cremisi: ['#ff3050', '#ffc0c8'], katana_acciaio: ['#c8e0ff', '#ffffff'], katana_ferro: ['#d8e4f4', '#ffffff'] };
export const GUARD_MAX = 3.0;  // durata massima di una guardia continua (s)
export const GUARD_CD = 0.9;    // recupero dopo che la guardia si è esaurita (s)
const TRAIL_LIFE = 0.22;        // vita di un'immagine della scia del dash (s)

// Protagonista: katana (combo a 3 colpi), difesa/parata, schivata, arco con frecce speciali, abilità, mezzi di trasporto.
export class Player extends Entity {
  constructor(x, y, state) {
    super(x, y, 10, 8);
    this.state = state; this.isPlayer = true;
    this.dir = 0; this.walk = 0;
    this.atkT = 0; this.atkDur = 0.2; this.atkCd = 0; this.atkHit = true; this.combo = 0; this.comboT = 0; this.swingAng = 0;
    this.inv = 0; this.flash = 0; this.kbx = 0; this.kby = 0;
    this.dash = null; this.afterimg = [];
    this.slowT = 0; this.stunT = 0; this.invertT = 0; this.poisonT = 0; this.poisonDps = 3; this.poisonAcc = 0;
    this.guard = false; this.guardT = 0; this.guardCd = 0; this.guardLatch = false; this.gRegT = 0; this.gBroken = false; this.gBreakFx = 0; this.parryFx = 0; this.dodge = null; this.stT = 0;
    this.drawing = false; this.draw_ = 0; this.aim = { x: 0, y: 1 };
  }
  // Flag letti da TileMap.passable per decidere dove si può camminare
  get mount() { return this.state.mount ? MOUNTS[this.state.mount] : null; }
  get flying() { return !!this.mount?.flying; }
  get waterOnly() { return !!this.mount?.water; }
  get swimDeep() { return !!this.mount?.water; }
  get lavaProof() { return this.state.buff('fireimm') > 0; }

  // Alterazioni di stato inflitte da nemici e boss
  debuff(kind, t, v = 0) {
    if (kind === 'slow') this.slowT = Math.max(this.slowT, t);
    else if (kind === 'stun' || kind === 'freeze') { this.stunT = Math.max(this.stunT, t); this.world.scene.audio.sfx('freeze'); }
    else if (kind === 'invert') this.invertT = Math.max(this.invertT, t);
    else if (kind === 'poison') { this.poisonT = Math.max(this.poisonT, t); this.poisonDps = Math.max(v || 3, 2); }
  }
  shove(dx, dy, spd) { const l = Math.hypot(dx, dy) || 1; this.kbx = (dx / l) * spd; this.kby = (dy / l) * spd; }
  spend(n, delay = 0.7) { this.state.stamina = Math.max(0, this.state.stamina - n); this.stT = delay; }

  update(dt, sc) {
    super.update(dt);
    const inp = sc.game.input, st = this.state;
    this.atkCd -= dt; this.comboT -= dt; this.dashChainT = (this.dashChainT || 0) - dt; this.inv -= dt; this.flash -= dt; this.parryFx -= dt;
    this.releaseT = Math.max(0, (this.releaseT || 0) - dt); this.slowT -= dt; this.stunT -= dt; this.gBreakFx -= dt; this.gRegT -= dt; this.guardCd -= dt; this.invertT -= dt; this.stT -= dt;
    if (this.poisonT > 0) {
      this.poisonT -= dt; this.poisonAcc += dt;
      if (this.poisonAcc >= 0.5) { this.poisonAcc = 0; const d = Math.min(Math.max(0, st.hp - 1), this.poisonDps * 0.5); if (d > 0) { st.hp -= d; sc.floatText(this.cx, this.y - 10, String(Math.round(d)), '#80e060'); } }
    }
    st.ki = Math.min(st.maxKi, st.ki + 2.5 * dt);
    if (this.stT <= 0 && !this.guard && !this.drawing) st.stamina = Math.min(st.maxStamina, st.stamina + 30 * dt);
    if (!Number.isFinite(st.guardPts)) st.guardPts = st.maxGuard; // un valore corrotto non deve mai bloccare la difesa
    // la guardia si rigenera quando non è in uso (più lentamente se rotta)
    if (!this.guard && this.gRegT <= 0) {
      st.guardPts = Math.min(st.maxGuard, st.guardPts + (this.gBroken ? 9 : 16) * dt);
      if (this.gBroken && st.guardPts >= st.maxGuard * 0.4) this.gBroken = false;
    }
    { const gd = sc.map.groundDefAt(this.cx, this.cy); if (gd.push && !this.dash && !this.dodge && !this.state.mount) this.move(gd.push[0] * dt, gd.push[1] * dt); } // correnti marine
    if (this.dash || this.dodge) { this.guard = false; this.guardLatch = this.guardLatch || inp.held('defend'); }
    if (this.dash) { this.updateDash(dt, sc); this.pruneTrail(dt); return; }
    if (this.dodge) { this.updateDodge(dt, sc); this.pruneTrail(dt); return; }
    this.pruneTrail(dt);

    if (Math.abs(this.kbx) + Math.abs(this.kby) > 2) {
      this.move(this.kbx * dt, this.kby * dt);
      const k = Math.pow(0.002, dt); this.kbx *= k; this.kby *= k;
    }
    let [ax, ay] = inp.axis();
    if (this.invertT > 0) { ax = -ax; ay = -ay; }
    if (this.stunT > 0) { this.guard = false; this.guardLatch = inp.held('defend'); this.drawing = false; this.atkT = 0; return; }
    const can = !st.mount;

    // difesa: tieni premuto; la pressione iniziale (primi 0,2 s) è una parata perfetta.
    // Ogni attivazione dura al massimo GUARD_MAX secondi; poi la guardia cala da sola e serve rilasciare il comando e attendere il recupero.
    const was = this.guard, hold = inp.held('defend');
    this.noShieldT = (this.noShieldT || 0) - dt;
    if (hold && !st.shield && can && this.noShieldT <= 0) { this.noShieldT = 2.5; sc.floatText(this.cx, this.y - 14, 'Serve uno scudo', '#bfe0ff'); sc.audio.sfx('error'); }   // la difesa si fa solo con uno scudo equipaggiato
    if (!hold) this.guardLatch = false;
    this.guard = can && hold && !!st.shield && !this.guardLatch && this.guardCd <= 0 && !this.gBroken && st.guardPts > 0 && !this.drawing && this.atkT <= 0;
    if (this.guard && was && this.guardT >= GUARD_MAX) { this.guard = false; this.guardLatch = true; this.guardCd = GUARD_CD; sc.audio.sfx('back'); sc.floatText(this.cx, this.y - 14, 'Guardia esaurita', '#bfe0ff'); }
    if (was && !this.guard) { this.gRegT = 0.9; if (!this.guardLatch && !this.gBroken) this.guardCd = Math.max(this.guardCd, 0.25); } // breve pausa anche al rilascio: niente "tap" infinito
    if (this.guard) this.guardT = was ? this.guardT + dt : 0;
    if (this.guard && !was) sc.audio.sfx('select');
    else if (!this.guard && !was) this.guardT = 0;

    // arco
    const lockMove = this.updateBow(dt, sc, inp, can, [ax, ay]);

    // schivata
    if (can && inp.pressed('dodge') && st.stamina >= 18 && !this.drawing) {
      let dx = ax, dy = ay;
      if (!dx && !dy) { dx = this.face.x; dy = this.face.y; }
      const l = Math.hypot(dx, dy) || 1;
      this.dodge = { dx: dx / l, dy: dy / l, left: 58 }; this.inv = Math.max(this.inv, 0.32);
      this.spend(18); this.guard = false; sc.audio.sfx('dash'); this.afterimg.length = 0;
      return;
    }

    const moving = (ax || ay) && !lockMove;
    if (moving) {
      const l = Math.hypot(ax, ay); ax /= l; ay /= l;
      if (!this.drawing) { this.face = { x: ax, y: ay }; this.dir = Math.abs(ax) > Math.abs(ay) ? (ax < 0 ? 2 : 3) : (ay < 0 ? 1 : 0); }
    }
    const mt = this.mount;
    let sp = 72 * (mt ? mt.speed : 1) * (1 + st.buff('spd') + st.speedBonus) * sc.atmo.speedMul();
    if (this.atkT > 0) sp *= 0.5;
    if (this.slowT > 0) sp *= 0.5;
    if (this.guard) sp *= 0.45;
    if (this.drawing) sp *= 0.4;
    if (!mt?.flying && !mt?.water) { const gd = sc.map.groundDefAt(this.cx, this.cy); if (gd.slow) sp *= gd.slow; }
    if (moving) { const px0 = this.cx, py0 = this.cy; this.move(ax * sp * dt, ay * sp * dt); this.walk += dt * (mt ? 12 : 9); if (!mt) this.stepFx(sc, Math.hypot(this.cx - px0, this.cy - py0)); }

    if (this.atkT > 0) {
      this.atkT -= dt;
      if (!this.atkHit && this.atkT <= this.atkDur * 0.5) { this.atkHit = true; this.doHit(sc); }
    }
    // cambio arma / munizioni
    if (inp.pressed('weapon')) { if (!st.inv.bow()) sc.toast('Non possiedi un arco.'); else { st.weaponMode = st.weaponMode === 'bow' ? 'katana' : 'bow'; sc.toast(st.weaponMode === 'bow' ? 'Arco in mano (J = tiro rapido, B = mira)' : 'Katana in mano'); sc.audio.sfx('select'); } }
    if (inp.pressed('ammo')) {
      if (st.weaponMode === 'bow' || !st.bombList().length) { st.cycleAmmo(); sc.toast(`Frecce: ${st.ammoName()}`); } else { st.cycleBomb(); sc.toast(`Esplosivo: ${st.bombName()}`); }
      sc.audio.sfx('select');
    }
    if (inp.pressed('bombsel')) { st.cycleBomb(); sc.toast(`Esplosivo: ${st.bombName()}`); sc.audio.sfx('select'); }
    if (can && inp.pressed('throw') && !this.guard) this.throwBomb(sc, inp, [ax, ay]);
    if (can && inp.pressed('elem') && !this.guard) castElement(sc, this);
    this.elemCd = (this.elemCd || 0) - dt; this.bombCd = (this.bombCd || 0) - dt;
    // azioni di combattimento (non in sella)
    if (st.mount) { if (['attack', 'dash', 'fire', 'black', 'bow', 'defend'].some((k) => inp.pressed(k))) sc.toast('Smonta (M) per combattere.'); return; }
    if (inp.pressed('attack') && st.weaponMode !== 'bow' && !this.guard && !this.drawing) this.attack(sc);
    if (inp.pressed('dash')) sc.abilities.tryUse('dash', sc);
    if (inp.pressed('fire')) sc.abilities.tryUse('fire', sc);
    if (inp.pressed('black')) sc.abilities.tryUse('black', sc);
  }

  // ---------------------------------------------------------------- arco
  updateBow(dt, sc, inp, can, axis) {
    const st = this.state, bow = st.inv.bow();
    const want = can && bow && inp.held('bow') && !this.guard;
    if (want && !this.drawing) {
      if (!st.ammoReady()) { if (inp.pressed('bow')) sc.toast('Frecce esaurite: compra o raccogli altre frecce.'); return false; }
      this.drawing = true; this.draw_ = 0; sc.audio.sfx('select');
    }
    if (!this.drawing) {
      if (can && bow && st.weaponMode === 'bow' && inp.pressed('attack') && this.atkCd <= 0 && !this.guard && st.ammoReady()) { this.aimNow(sc, inp, axis, false); this.shoot(sc, 0.5); this.atkCd = 0.4; }
      return false;
    }
    if (!want) { // rilascio
      this.drawing = false;
      if (this.draw_ > 0.12) this.shoot(sc, Math.min(1, this.draw_ / bow.draw));
      this.draw_ = 0; return false;
    }
    this.draw_ += dt;
    return this.aimNow(sc, inp, axis, true);
  }
  // Lancia l'esplosivo selezionato verso la direzione di mira (max ~80 px).
  throwBomb(sc, inp, axis) {
    const st = this.state;
    if ((this.bombCd || 0) > 0) return;
    const id = st.bombCurrent();
    if (!id) { sc.toast('Nessun esplosivo: costruiscili al Banco da lavoro (serve polvere nera).'); return; }
    this.aimNow(sc, inp, axis, false);
    const a = Math.atan2(this.aim.y, this.aim.x), reach = 70;
    let tx = this.cx + Math.cos(a) * reach, ty = this.cy + Math.sin(a) * reach;
    // se un muro sbarra la traiettoria, la bomba cade appena prima
    for (let d = 8; d <= reach; d += 8) { const px = this.cx + Math.cos(a) * d, py = this.cy + Math.sin(a) * d; if (sc.map.blockedRect({ x: px - 1, y: py - 1, w: 2, h: 2 }, { projectile: true })) { tx = this.cx + Math.cos(a) * (d - 8); ty = this.cy + Math.sin(a) * (d - 8); break; } }
    st.inv.remove(id, 1); if (!st.inv.has(id)) st.bombSel = null;
    this.world.add(new Bomb(id, this.cx, this.cy - 4, tx, ty, this));
    this.bombCd = 0.5; this.face = { x: Math.cos(a), y: Math.sin(a) }; this.atkT = 0; sc.audio.sfx('dash');
  }
  // Aggiorna la direzione di mira: mouse > stick > direzione corrente, con leggero aiuto sui nemici vicini. Ritorna true se lo stick serve per mirare.
  aimNow(sc, inp, axis, holding) {
    const m = inp.aimFrom(this.cx - sc.cam.x, this.cy - sc.cam.y);
    let a = m, lock = false;
    if (!a) {
      if (axis[0] || axis[1]) { const l = Math.hypot(axis[0], axis[1]); a = { x: axis[0] / l, y: axis[1] / l }; lock = holding; } else a = this.face;
      const best = sc.world.nearest(this.cx, this.cy, 240, (e) => e.isEnemy && !e.dead && !e.dormant && Math.abs(angDiff(Math.atan2(e.cy - this.cy, e.cx - this.cx), Math.atan2(a.y, a.x))) < 0.45);
      if (best) { const dx = best.cx - this.cx, dy = best.cy - this.cy, l = Math.hypot(dx, dy) || 1; a = { x: dx / l, y: dy / l }; }
    }
    this.aim = a; this.face = a;
    this.dir = Math.abs(a.x) > Math.abs(a.y) ? (a.x < 0 ? 2 : 3) : (a.y < 0 ? 1 : 0);
    return lock;
  }
  shoot(sc, charge) {
    const st = this.state, bow = st.inv.bow(); this.releaseT = 0.22; this.relCharge = charge;
    let type = AMMO[st.ammoSel];
    if (!st.inv.has(type)) type = AMMO.find((a) => st.inv.has(a));
    if (!type) { sc.toast('Frecce esaurite.'); return; }
    st.inv.remove(type, 1);
    const sp = 150 + 220 * charge, range = bow.range * (0.45 + 0.55 * charge), a = this.aim;
    sc.world.add(new Projectile({
      x: this.cx + a.x * 6, y: this.cy - 3 + a.y * 6, vx: a.x * sp, vy: a.y * sp, r: 2, life: range / sp + 0.05, team: 'player', kind: 'arrowp', owner: this,
      dmg: st.atk * bow.pow * (0.4 + 0.9 * charge), maxRange: range, ammo: type, pierce: type === 'freccia_magica' ? 1 : 0,
      burn: type === 'freccia_fuoco' ? 3 : 0, poison: type === 'freccia_veleno' ? 5 : 0, kb: 40 + 60 * charge,
      homing: type === 'freccia_magica' ? { target: null, turn: 2.2, max: sp } : null,
    }));
    this.spend(4, 0.5); sc.audio.sfx('bow');
  }

  // ---------------------------------------------------------------- katana
  attack(sc) {
    if (this.atkCd > 0) return;
    const w = this.state.inv.weapon();
    this.combo = this.comboT > 0 ? (this.combo + 1) % 3 : 0;
    this.comboT = 0.55;
    this.atkDur = 0.22 / (w.spd || 1);
    this.atkT = this.atkDur; this.atkCd = this.atkDur + 0.05; this.atkHit = false;
    this.dashStrike = (this.dashChainT || 0) > 0; this.dashChainT = 0;   // fendente in scatto: vale di più se segue subito uno scatto
    if (this.dashStrike) { this.combo = 2; this.atkDur = 0.26 / (w.spd || 1); this.atkT = this.atkDur; this.atkCd = this.atkDur + 0.05; }
    this.swingAng = Math.atan2(this.face.y, this.face.x);
    this.world.scene.audio.sfx(this.combo === 2 ? 'slash2' : 'slash');
  }
  // Colpo in arco davanti al giocatore; devia anche i proiettili nemici.
  doHit(sc) {
    const st = this.state, w = st.inv.weapon();
    const big = this.combo === 2;
    const reach = (w.reach || 22) + (big ? 6 : 0) + (this.dashStrike ? 6 : 0), arc = big ? Math.PI * 0.9 : Math.PI * 0.65;
    const dmg = st.atk * (big ? 1.5 : 1) * (this.dashStrike ? 1.7 : 1);
    if (this.dashStrike) { sc.floatText(this.cx, this.y - 12, 'Fendente in scatto!', '#ffd24a'); sc.shake(2.5); }
    sc.slash(this.cx, this.cy, this.swingAng, reach, arc, big, (WEAPON_COL[this.state.inv.weapon().id] || ['#e8eef8'])[0]);
    let hits = 0;
    for (const e of this.world.list) {
      if (e.dead) continue;
      const dx = e.cx - this.cx, dy = e.cy - this.cy, d = Math.hypot(dx, dy);
      if (d > reach + (e.rad || 5)) continue;
      if (d > 8 && Math.abs(angDiff(Math.atan2(dy, dx), this.swingAng)) > arc / 2) continue;
      if (e.isEnemy && !e.dormant) { e.hurt(dmg * (0.9 + Math.random() * 0.2), this, { kb: 80 + this.combo * 50 }); hits++; }
      else if (e.isProjectile && e.team === 'enemy') { e.dead = true; sc.spark(e.cx, e.cy, '#fff', 4); }
    }
    if (sc.hitBarriers(this.cx + this.face.x * reach * 0.6, this.cy + this.face.y * reach * 0.6, reach * 0.5, 'katana') ) hits++;
    if (hits) sc.shake(big ? 3 : 1.5);
  }

  // ---------------------------------------------------------------- scatto e schivata
  startDash(dx, dy, dist, onEnd) {
    this.dash = { dx, dy, left: dist, onEnd };
    this.inv = Math.max(this.inv, 0.35 + dist / 320);
    this.afterimg.length = 0; this.guard = false;
  }
  updateDash(dt, sc) {
    const d = this.dash;
    const step = Math.min(d.left, 320 * dt);
    const r = this.move(d.dx * step, d.dy * step);
    d.left -= step;
    this.trail(6);
    if ((this.dashPuffT = (this.dashPuffT || 0) - dt) <= 0) { this.dashPuffT = 0.035; sc.puff(this.cx, this.feetY - 1, '#e8e0d0', 2); }   // polvere dello scatto
    this.walk += dt * 20;
    if (d.left <= 0.5 || (r.hitX && Math.abs(d.dx) > 0.5) || (r.hitY && Math.abs(d.dy) > 0.5)) {
      this.dash = null; d.onEnd?.(sc);
    }
  }
  // Scia del dash: ogni immagine ha un'età e svanisce in 0,22 s, poi viene eliminata (prima restava ferma sul posto finché non c'era un altro dash)
  trail(max) { this.afterimg.push({ x: this.cx, y: this.feetY, dir: this.dir, age: 0 }); while (this.afterimg.length > max) this.afterimg.shift(); }
  pruneTrail(dt) { for (const a of this.afterimg) a.age += dt; this.afterimg = this.afterimg.filter((a) => a.age < TRAIL_LIFE); }
  updateDodge(dt, sc) {
    const d = this.dodge, step = Math.min(d.left, 210 * dt);
    const r = this.move(d.dx * step, d.dy * step);
    d.left -= step;
    this.trail(5);
    this.walk += dt * 18;
    if (d.left <= 0.5 || (r.hitX && Math.abs(d.dx) > 0.5) || (r.hitY && Math.abs(d.dy) > 0.5)) this.dodge = null;
  }

  // ---------------------------------------------------------------- danni
  // Ritorna true (danno subito), 'blocked' (parato/bloccato) o false (invulnerabile).
  hurt(dmg, src) {
    const sc = this.world.scene, st = this.state;
    if (this.inv > 0 || this.dead || sc.god) return false;
    if (this.guard && src && src.cx !== undefined) {
      const sx = src.cx - this.cx, sy = src.cy - this.cy, l = Math.hypot(sx, sy) || 1;
      if ((sx * this.face.x + sy * this.face.y) / l > 0) { // l'attacco arriva da davanti
        if (this.guardT < 0.2) { // parata perfetta: nessun danno, il nemico barcolla, i proiettili tornano indietro
          this.inv = 0.5; this.parryFx = 0.4; sc.audio.sfx('parry'); sc.shake(2); sc.ring(this.cx + this.face.x * 10, this.cy, 22, '#80f0ff');
          sc.floatText(this.cx, this.y - 14, 'PARATA!', '#80f0ff');
          if (src.isEnemy) { src.state = 'rec'; src.recT = 1.3; src.cd = 1.3; src.chargeT = 0; src.comboLeft = 0; src.kbx = -sx / l * 120; src.kby = -sy / l * 120; }
          else if (src.isProjectile) { src.team = 'player'; src.owner = this; src.vx *= -1.3; src.vy *= -1.3; src.hit = new Set(); src.life = 2; }
          st.guardPts = Math.min(st.maxGuard, st.guardPts + 12);
          return 'blocked';
        }
        // peso del colpo: leggero 1x, pesante (carica/schianto/AoE) 1,8x, speciale di boss 3x
        const cur = src.cur, boss = !!(src.def && src.def.boss);
        const w = src.breaker ? 3 : (boss && cur && cur !== 'slash' && cur !== 'shoot') ? 3 : (src.chargeT > 0 || cur === 'slam' || cur === 'charge' || src.heavy) ? 1.8 : 1;
        const cost = Math.max(5, dmg * 0.9 * w);
        st.guardPts = Math.max(0, st.guardPts - cost); this.gRegT = 1.4; this.inv = 0.3; sc.audio.sfx('block'); sc.spark(this.cx + this.face.x * 8, this.cy, '#9ad0ff', 5);
        const real = Math.round(dmg * (1 - (st.shield ? st.shield.res : 0) / 100)); this.wearShield(sc, w);
        if (real > 0) st.hp -= real;
        this.kbx = -sx / l * (40 + 25 * w); this.kby = -sy / l * (40 + 25 * w);
        if (st.guardPts <= 0) this.breakGuard(sc);
        if (st.hp <= 0) this.die(sc);
        return 'blocked';
      }
    }
    const real = Math.max(1, Math.round(dmg - st.def * 0.5));
    st.hp -= real; this.inv = 0.9; this.flash = 0.15; sc.lastHit = sc.time;
    sc.impact(this.cx, this.cy - 6, 0, '#ff6070', real > st.maxHp * 0.15); sc.vignette('255,40,60', 0.32); sc.puff(this.cx, this.feetY, '#e8d8c8', 3);
    if (src) {
      const dx = this.cx - (src.cx ?? this.cx), dy = this.cy - (src.cy ?? this.cy), l = Math.hypot(dx, dy) || 1;
      this.kbx = (dx / l) * 130; this.kby = (dy / l) * 130;
    }
    sc.audio.sfx('hurt');
    sc.floatText(this.cx, this.y - 12, `-${real}`, '#ff6070');
    sc.shake(3); this.drawing = false; this.draw_ = 0;
    if (st.hp <= 0) this.die(sc);
    return true;
  }
  // Interazione con il terreno: impronte che svaniscono (neve, sabbia, fango), polvere, ciuffi d'erba che saltano, onde e schizzi nell'acqua
  stepFx(sc, d) {
    this.stepD = (this.stepD || 0) + d; if (this.stepD < 7) return; this.stepD = 0; this.stepSide = !this.stepSide;
    const m = sc.map, tx = Math.floor(this.cx / TS), ty = Math.floor(this.feetY / TS), gid = m.g(tx, ty), def = m.groundDefAt ? m.groundDefAt(this.cx, this.feetY) : null, T = sc.TILES, fx = this.cx, fy = this.feetY - 1;
    const f = this.face, nx = -f.y, ny = f.x, ox = nx * (this.stepSide ? 2.2 : -2.2), oy = ny * (this.stepSide ? 1.2 : -1.2);
    const kind = def && def.liquid === 'shallow' ? 'water' : def && def.liquid ? null : sc.groundKind ? sc.groundKind(gid) : null;
    if (kind === 'snow' || kind === 'sand' || kind === 'mud') { sc.prints.push({ x: fx + ox, y: fy + oy, a: Math.atan2(f.y, f.x), t: 0, life: kind === 'sand' ? 5 : 7, kind }); if (sc.prints.length > 120) sc.prints.shift(); sc.puff(fx - f.x * 3, fy, kind === 'snow' ? '#f4f8ff' : '#e8d098', 2); }
    else if (kind === 'grass') { if (Math.random() < 0.55) sc.blades(fx + ox, fy, 2 + (Math.random() * 2 | 0)); }
    else if (kind === 'water') { sc.ring(fx, fy, 5, '#e8f4ff'); sc.puff(fx, fy - 1, '#cfe8ff', 3); }
  }
  // Usura dello scudo: ogni colpo parato consuma durata (di più se il colpo è pesante e se il materiale soffre il luogo: legno nel fuoco, metallo nell'umido)
  wearShield(sc, w) {
    const st = this.state, sh = st.shield; if (!sh) return;
    const biome = sc.biomeHere ? sc.biomeHere() : '', f = (WEAR[sh.mat] || {})[biome] || 1;
    const left = (st.shieldDur[sh.id] ?? sh.dur) - w * f; st.shieldDur[sh.id] = left;
    if (f > 1 && !this.wearWarned) { this.wearWarned = true; sc.toast(sh.mat === 'wood' ? 'Il calore consuma lo scudo di legno.' : 'L\'umidità arrugginisce lo scudo.'); }
    if (left <= 0) { st.inv.remove(sh.id, 1); delete st.shieldDur[sh.id]; sc.toast(`${sh.n} si è rotto!`); sc.floatText(this.cx, this.y - 20, 'SCUDO ROTTO', '#ff9060'); sc.audio.sfx('gbreak'); st.guardPts = 0; this.guard = false; this.guardLatch = true; }
  }
  // Guardia spezzata: postura rotta, stordimento, guardia bloccata finché non si rigenera al 40%
  breakGuard(sc) {
    this.guard = false; this.gBroken = true; this.stunT = 1.2; this.gBreakFx = 0.7; this.gRegT = 1.8; this.inv = 0; this.state.guardPts = 0;
    sc.floatText(this.cx, this.y - 14, 'GUARDIA ROTTA!', '#ff9060'); sc.audio.sfx('gbreak'); sc.shake(5);
    for (let i = 0; i < 3; i++) sc.ring(this.cx + this.face.x * 10, this.cy, 10 + i * 8, '#9ad0ff');
    sc.spark(this.cx + this.face.x * 10, this.cy, '#cfe8ff', 14);
  }
  die(sc) {
    const st = this.state;
    if (st.buff('revive')) {
      st.buffs = st.buffs.filter((b) => b.stat !== 'revive');
      st.hp = Math.round(st.maxHp * 0.5); sc.toast('La Fenice ti rialza!'); sc.spark(this.cx, this.cy, '#ffb040', 20);
    } else { st.hp = 0; sc.onPlayerDeath(); }
  }

  // ---------------------------------------------------------------- disegno
  // Entrata in portali, porte e scale: il personaggio ruota e si rimpicciolisce nel vortice, scompare varcando la porta, scende le scale
  draw(g, cx, cy, sc) {
    const f = sc && sc.fade, k = f && f.dir > 0 && f.kind ? Math.min(1, f.a) : 0;
    if (!k) return this.draw0(g, cx, cy, sc);
    const x = Math.round(this.cx - cx), y = Math.round(this.feetY - cy);
    g.save(); g.translate(x, y - 10);
    if (f.kind === 'warp') { g.rotate(k * 7); g.scale(1 - k * 0.92, 1 - k * 0.92); g.globalAlpha = 1 - k * 0.5; }
    else if (f.kind === 'door') { g.scale(1 - k * 0.12, 1 - k * 0.12); g.translate(0, -k * 3); g.globalAlpha = 1 - k * 0.85; }
    else if (f.kind === 'stairs') { g.translate(0, k * 8); g.globalAlpha = 1 - k * 0.8; }
    g.translate(-x, -(y - 10)); this.draw0(g, cx, cy, sc); g.restore();
    if (f.kind === 'warp' && sc.puff && Math.random() < 0.5) sc.puff(this.cx, this.feetY - 10, Math.random() < 0.5 ? '#b08aff' : '#4cf0ff', 1);
  }
  draw0(g, cx, cy, sc) {
    if (this.inv > 0 && !this.dash && !this.dodge && !(this.parryFx > 0) && Math.floor(this.t * 20) % 2 === 0) return;
    let x = Math.round(this.cx - cx), y = Math.round(this.feetY - cy);
    if (this.atkT > 0 && !this.mount) { const lg = Math.sin(Math.PI * (1 - this.atkT / this.atkDur)) * 3; x += Math.round(this.face.x * lg); y += Math.round(this.face.y * lg * 0.6); }   // affondo del corpo durante il fendente
    if (this.releaseT > 0 && !this.mount) { x -= Math.round(this.aim.x * this.releaseT * 9); y -= Math.round(this.aim.y * this.releaseT * 5); }   // contraccolpo al rilascio della corda
    for (const a of this.afterimg) { // scia: solo se il dash è in corso o appena finito, sempre sfumata; mai sopra il personaggio
      const k = 1 - a.age / TRAIL_LIFE; if (k <= 0 || Math.hypot(a.x - this.cx, a.y - this.feetY) < 4) continue;
      g.globalAlpha = k * 0.3;
      drawPlayerSprite(g, Math.round(a.x - cx), Math.round(a.y - cy), this.state.look, a.dir, 1);
    }
    g.globalAlpha = 1;
    const mt = this.mount, mk = this.state.mount;
    // linea di mira dell'arco
    if (this.drawing) {
      const bow = this.state.inv.bow(), ch = Math.min(1, this.draw_ / bow.draw), range = bow.range * (0.45 + 0.55 * ch);
      for (let d = 14; d < range; d += 9) { g.fillStyle = `rgba(255,240,180,${0.55 * (1 - d / range)})`; g.fillRect(Math.round(x + this.aim.x * d), Math.round(y - 8 + this.aim.y * d), 2, 2); }
      g.strokeStyle = ch >= 1 ? '#ffe060' : '#ffffff'; g.beginPath(); g.arc(x, y - 10, 14, -Math.PI / 2, -Math.PI / 2 + ch * Math.PI * 2); g.stroke();
    }
    if (mt) {
      const lift = mt.flying ? 12 + Math.sin(this.t * 4) * 2 : 0;
      if (mt.flying) shadow(g, x, y, 16);
      drawMount(g, mk, x, y - lift, this.dir, this.t);
      drawPlayerSprite(g, x, y - lift - (mk === 'dolphin' ? 2 : 6), this.state.look, this.dir, 0);
    } else {
      if (this.dodge) g.globalAlpha = 0.65;
      drawPlayerSprite(g, x + (this.gBreakFx > 0 ? Math.round(Math.sin(this.t * 60) * 2) : 0), y + (this.guard ? 1 : 0), this.state.look, this.dir, Math.floor(this.walk), { flash: this.flash > 0 || this.gBreakFx > 0.45 });
      g.globalAlpha = 1;
    }
    // aureola luminosa: segno dell'anima sospesa tra vita e morte (solo nel Limbo). Segue il capo, con un lieve ondeggiare e pulsare.
    if (this.world.scene.map.type === 'limbo') {
      const bob = Math.sin(this.t * 3) * 1.2 + (Math.floor(this.walk) & 1 ? 0.6 : 0), hy = y - 36 + bob, pulse = 0.5 + 0.5 * Math.sin(this.t * 4);
      g.save();
      const gr = g.createRadialGradient(x, hy, 1, x, hy, 16); gr.addColorStop(0, `rgba(255,235,150,${0.55 + pulse * 0.25})`); gr.addColorStop(1, 'rgba(255,235,150,0)');
      g.fillStyle = gr; g.fillRect(x - 16, hy - 16, 32, 32);
      g.lineWidth = 2; g.strokeStyle = `rgba(255,214,90,${0.7 + pulse * 0.3})`; g.beginPath(); g.ellipse(x, hy, 7, 2.6, 0, 0, 6.283); g.stroke();
      g.lineWidth = 1; g.strokeStyle = '#fff8d0'; g.beginPath(); g.ellipse(x, hy - 0.5, 7, 2.6, 0, Math.PI, Math.PI * 2); g.stroke();
      g.restore();
    }
    // scudo di difesa
    if (this.guard || this.parryFx > 0) {
      const a = Math.atan2(this.face.y, this.face.x), perfect = this.guardT < 0.2 || this.parryFx > 0;
      const gr = this.state.guardPts / this.state.maxGuard;
      g.strokeStyle = perfect ? '#ffffff' : gr < 0.3 ? '#ff9060' : '#7ab8ff'; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y - 10, 15, a - 1, a + 1); g.stroke();
      g.fillStyle = perfect ? 'rgba(200,250,255,.35)' : 'rgba(120,180,255,.2)'; g.beginPath(); g.moveTo(x, y - 10); g.arc(x, y - 10, 15, a - 1, a + 1); g.fill(); g.lineWidth = 1;
      if (this.guard) { // postura difensiva: lama tenuta di traverso davanti al corpo, e barra della durata residua
        if (this.state.shield) this.drawShield(g, x + this.face.x * 9, y - 9 + this.face.y * 5, a, this.state.shield, perfect);
        const left = Math.max(0, 1 - this.guardT / GUARD_MAX);
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x - 9, y + 3, 18, 3); g.fillStyle = left < 0.25 ? '#ff9060' : '#9ad0ff'; g.fillRect(x - 8, y + 4, Math.round(16 * left), 1);
      }
    }
    // postura rotta: scintille e barcollamento
    if (this.gBreakFx > 0 || (this.gBroken && this.stunT > 0)) {
      const k = Math.max(0, this.gBreakFx) / 0.7;
      g.strokeStyle = `rgba(255,150,90,${0.4 + k * 0.5})`; g.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const a = i * 1.047 + this.t * 6, r = 8 + (1 - k) * 12; g.beginPath(); g.moveTo(x + Math.cos(a) * r, y - 10 + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * (r + 4), y - 10 + Math.sin(a) * (r + 4)); g.stroke(); }
    }
    // arco: teso e puntato mentre si mira, vibrante dopo il rilascio, abbassato in mano quando è l'arma attiva
    if (!mt && this.state.weaponMode === 'bow') {   // faretra sulla schiena con le penne delle frecce
      const qx = x + (this.dir === 2 ? 5 : this.dir === 3 ? -5 : 4), qy = y - 27; g.fillStyle = '#14081a'; g.fillRect(qx - 2, qy - 1, 6, 12); g.fillStyle = '#6a4220'; g.fillRect(qx - 1, qy, 4, 10); g.fillStyle = '#8a5a2c'; g.fillRect(qx - 1, qy, 1, 10); g.fillStyle = '#c8283a'; g.fillRect(qx, qy + 3, 3, 1);
      g.fillStyle = '#f4f0e8'; g.fillRect(qx - 1, qy - 3, 1, 3); g.fillStyle = '#c8283a'; g.fillRect(qx + 1, qy - 4, 1, 4); g.fillStyle = '#f4f0e8'; g.fillRect(qx + 3, qy - 2, 1, 2);
      if (this.drawing && this.draw_ < 0.2) { const k = this.draw_ / 0.2, hx = x + this.aim.x * 5, hy = y - 10 + this.aim.y * 3, ax = qx + (hx - qx) * k, ay = qy - 3 + (hy - qy + 3) * k, an = Math.atan2(hy - qy, hx - qx) * k + (-1.2) * (1 - k);   // la mano prende la freccia dalla faretra
        g.save(); g.translate(ax, ay); g.rotate(an); g.fillStyle = '#d8c090'; g.fillRect(-5, 0, 11, 1); g.fillStyle = '#e8eef8'; g.fillRect(6, -1, 3, 3); g.fillStyle = '#c8283a'; g.fillRect(-5, -1, 3, 1); g.fillRect(-5, 1, 3, 1); g.restore(); }
    }
    if (!mt && (this.drawing || this.releaseT > 0 || this.state.weaponMode === 'bow')) {
      const aimA = this.drawing || this.releaseT > 0 ? Math.atan2(this.aim.y, this.aim.x) : Math.atan2(this.face.y, this.face.x) + 0.55;
      const ch = this.drawing ? Math.min(1, this.draw_ / (this.state.inv.bow().draw || 0.7)) : 0;
      this.drawBow(g, x, y - 10, aimA, ch, this.releaseT > 0 ? this.releaseT / 0.22 : 0, this.drawing && this.draw_ >= 0.2, this.drawing || this.releaseT > 0 ? 7 : 5);
      if (this.drawing || this.releaseT > 0) {   // postura da arciere: braccio dell'arco teso in avanti, braccio della corda che tira fino alla guancia (e scatta indietro al rilascio)
        const ax = this.aim.x, ay = this.aim.y, px = -ay, py = ax, top = TOPS[(this.state.look.top | 0) % TOPS.length], skin = SKIN[this.state.look.skin % SKIN.length], rel = this.releaseT > 0 ? this.releaseT / 0.22 : 0;
        const sF = [x + px * 4 + ax * 2, y - 19 + py * 2], gr = [x + ax * 10, y - 10 + ay * 6], sB = [x - px * 4, y - 19 - py * 2], pullK = this.drawing ? Math.min(1, this.draw_ / 0.5) : 0, hand = [x + ax * (9 - 11 * pullK - (1 - rel) * 4 * (this.releaseT > 0 ? 1 : 0)), y - 10 + ay * (6 - 3 * pullK) - 1];
        const limb = (p0, p1, mid) => { g.lineCap = 'round'; g.strokeStyle = '#14081a'; g.lineWidth = 4.4; g.beginPath(); g.moveTo(p0[0], p0[1]); if (mid) g.lineTo(mid[0], mid[1]); g.lineTo(p1[0], p1[1]); g.stroke(); g.strokeStyle = top; g.lineWidth = 3; g.beginPath(); g.moveTo(p0[0], p0[1]); if (mid) g.lineTo(mid[0], mid[1]); g.lineTo(p1[0], p1[1]); g.stroke(); g.fillStyle = skin; g.fillRect(Math.round(p1[0]) - 1, Math.round(p1[1]) - 1, 3, 3); };
        limb(sF, gr); limb(sB, hand, [sB[0] + (hand[0] - sB[0]) * 0.5 - px * 2, sB[1] + (hand[1] - sB[1]) * 0.5 + 2]); g.lineCap = 'butt'; g.lineWidth = 1;
      }
    }
    // primo piano: l'erba alta si piega attorno alle gambe, l'acqua forma onde, in acqua profonda si nuota con il corpo immerso
    if (!mt && sc && sc.map && sc.groundKind) {
      const gid = sc.map.g(Math.floor(this.cx / TS), Math.floor(this.feetY / TS)), gk = sc.groundKind(gid), gd = sc.map.groundDefAt ? sc.map.groundDefAt(this.cx, this.feetY) : null;
      if (gk === 'grass') { for (let i = 0; i < 6; i++) { const bx = x - 7 + i * 3 + Math.round(Math.sin(this.t * 7 + i * 1.7) * (Math.floor(this.walk) & 1 ? 1.2 : 0.6)); g.fillStyle = '#14081a'; g.fillRect(bx - 1, y - 5, 3, 6); g.fillStyle = i & 1 ? '#4a9a3a' : '#5ab04a'; g.fillRect(bx, y - 4, 1, 5); g.fillStyle = '#9ae070'; g.fillRect(bx, y - 5, 1, 1); } }
      else if (gd && gd.liquid === 'shallow') { const k = (this.t * 1.6) % 1; g.strokeStyle = `rgba(230,244,255,${0.8 - k * 0.6})`; g.beginPath(); g.ellipse(x, y - 1, 5 + k * 6, 2 + k * 2, 0, 0, 6.283); g.stroke(); g.fillStyle = 'rgba(70,130,210,.55)'; g.fillRect(x - 6, y - 3, 12, 4); }
      else if (gd && gd.liquid === 'deep') { g.fillStyle = 'rgba(40,100,190,.78)'; g.fillRect(x - 9, y - 11, 18, 14); g.fillStyle = 'rgba(190,225,255,.7)'; g.fillRect(x - 9, y - 11, 18, 1); for (let i = 0; i < 2; i++) { const k = (this.t * 1.3 + i * 0.5) % 1; g.strokeStyle = `rgba(230,244,255,${0.8 - k * 0.7})`; g.beginPath(); g.ellipse(x, y - 10, 6 + k * 8, 2 + k * 2.5, 0, 0, 6.283); g.stroke(); } }
    }
    // indicatori delle alterazioni di stato
    const ic = [[this.poisonT > 0, '#80e060'], [this.slowT > 0, '#60a0ff'], [this.stunT > 0, '#ffe060'], [this.invertT > 0, '#ff3fa4']].filter((q) => q[0]);
    ic.forEach((q, i) => { g.fillStyle = '#000'; g.fillRect(x - ic.length * 3 + i * 6 - 1, y - 38, 6, 6); g.fillStyle = q[1]; g.fillRect(x - ic.length * 3 + i * 6, y - 37, 4, 4); });
    // katana durante il fendente: impugnatura, guardia dorata, lama con filo luminoso e scia colorata; carica indietro, poi taglio
    if (this.atkT > 0 && !mt) {
      const p = 1 - this.atkT / this.atkDur, over = this.combo === 2, arc = over ? Math.PI * 0.95 : Math.PI * 0.7, sgn = this.combo % 2 === 1 ? -1 : 1;
      const wind = p < 0.18 ? -0.16 * Math.sin(p / 0.18 * Math.PI / 2) : 0, sw = p < 0.18 ? 0 : 1 - Math.pow(1 - (p - 0.18) / 0.82, 2.2);
      const a = this.swingAng - sgn * arc / 2 + sgn * arc * (sw + wind);
      const wpn = this.state.inv.weapon(), len = (wpn.reach || 22) * 0.95, col = WEAPON_COL[wpn.id] || ['#e8eef8', '#ffffff'];
      if (!this.swTrail) this.swTrail = []; this.swTrail.push(a); if (this.swTrail.length > 9) this.swTrail.shift();
      for (let i = 0; i < this.swTrail.length; i++) { const k = (i + 1) / this.swTrail.length; g.globalAlpha = 0.55 * k * k; g.strokeStyle = col[0]; g.lineWidth = 1 + 4 * k; g.beginPath(); g.arc(x, y - 9, len * 0.78, this.swTrail[i] - 0.1, this.swTrail[i] + 0.02); g.stroke(); }
      g.globalAlpha = 1; g.lineWidth = 1;
      this.lastSwA = a; this.lastSwLen = len; this.lastSwCol = col;
      const ex = p < 0.2 ? 0.25 + 0.75 * (p / 0.2) : 1;   // sguainata: la lama esce dal fodero nel primo quinto del colpo
      if (p < 0.12) { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(x + Math.round(Math.cos(a) * 6), y - 9 + Math.round(Math.sin(a) * 6), 2, 2); }   // bagliore dell'acciaio
      this.drawArms(g, x, y - 9, a, len * ex, p);
      this.drawKatana(g, x, y - 9, a, len * ex, col, p);
      this.drawHands(g, x, y - 9, a);
    } else if (this.swTrail && this.swTrail.length) { this.swTrail.length = 0; this.sheathT = 0.22; }
    if (!(this.atkT > 0) && this.sheathT > 0 && !mt) {   // rinfoderata: la lama rientra e torna al fianco
      this.sheathT -= 1 / 60; const k = 1 - Math.max(0, this.sheathT) / 0.22, hipA = Math.atan2(this.face.y, this.face.x) + (this.face.x >= 0 ? 2.5 : -2.5);
      this.drawKatana(g, x, y - 9, this.lastSwA + (hipA - this.lastSwA) * k, (this.lastSwLen || 20) * (1 - k * 0.9), this.lastSwCol || ['#e8eef8', '#fff'], 1);
    }
  }
  // Braccia della katana: due segmenti dalle spalle alle mani sull'impugnatura (la mano avanzata segue il taglio, quella di dietro la sostiene); la manica prende il colore della veste
  drawArms(g, x, y, a, len, p) {
    const sleeve = (this.state.look && this.state.look.top !== undefined) ? ['#c8283a', '#e8c040', '#3a6ab0', '#4a9a5a', '#a05ac8', '#e8e0d0', '#d07a2a'][this.state.look.top % 7] : '#c8283a';
    const ca = Math.cos(a), sa = Math.sin(a), ext = 1 + Math.sin(Math.min(1, p) * Math.PI) * 0.35;
    const hands = [[ca * 3 * ext, sa * 3 * ext], [ca * 8 * ext, sa * 8 * ext]];   // mano di dietro e mano davanti
    const shoulders = [[-3, 1], [3, 1]];
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      const sx = x + shoulders[i][0], sy = y + shoulders[i][1], hx = x + hands[i][0], hy = y + hands[i][1], mx = (sx + hx) / 2 + (i ? 1 : -1) * Math.sin(a) * -1.2, my = (sy + hy) / 2 + (i ? 1 : -1) * Math.cos(a) * 1.2;
      g.strokeStyle = '#14081a'; g.lineWidth = 3.6; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(mx, my, hx, hy); g.stroke();
      g.strokeStyle = sleeve; g.lineWidth = 2.4; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(mx, my, hx, hy); g.stroke();
    }
    g.restore();
  }
  drawHands(g, x, y, a) {
    const ca = Math.cos(a), sa = Math.sin(a); g.fillStyle = '#14081a'; g.fillRect(Math.round(x + ca * 3) - 2, Math.round(y + sa * 3) - 2, 4, 4); g.fillRect(Math.round(x + ca * 8) - 2, Math.round(y + sa * 8) - 2, 4, 4);
    g.fillStyle = '#f0c8a0'; g.fillRect(Math.round(x + ca * 3) - 1, Math.round(y + sa * 3) - 1, 2, 2); g.fillRect(Math.round(x + ca * 8) - 1, Math.round(y + sa * 8) - 1, 2, 2);
  }
  drawKatana(g, x, y, a, len, col, p) {
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = '#241426'; g.fillRect(-3, -1, 9, 3);                                   // impugnatura (tsuka)
    g.fillStyle = '#c8283a'; for (let i = -3; i < 6; i += 3) g.fillRect(i, -1, 1, 3);   // avvolgimento
    g.fillStyle = '#f0c040'; g.fillRect(6, -3, 2, 7); g.fillStyle = '#b8902a'; g.fillRect(6, 3, 2, 1);   // guardia (tsuba)
    g.fillStyle = '#7a8aa8'; g.fillRect(8, 0, len, 2);                                   // dorso della lama
    g.fillStyle = col[1]; g.fillRect(8, -1, len, 1);                                     // filo luminoso
    g.fillStyle = '#c8d4e8'; g.fillRect(9, 0, len - 2, 1);
    g.fillStyle = col[1]; g.beginPath(); g.moveTo(8 + len, -1); g.lineTo(8 + len + 4, 1); g.lineTo(8 + len, 2); g.fill();   // punta
    g.globalAlpha = 0.5 + 0.5 * Math.sin(p * 18); g.fillStyle = '#fff'; g.fillRect(8 + Math.floor(len * (0.3 + 0.5 * p)), -1, 2, 1); g.globalAlpha = 1;   // luccichio che scorre sulla lama
    g.restore();
  }
  // arco: legno con impugnatura rossa, punte dorate, corda che si tende (e vibra al rilascio), freccia incoccata con punta e penne
  drawBow(g, x, y, a, ch, vib, nocked, off) {
    g.save(); g.translate(x, y); g.rotate(a); g.translate(off, 0);
    const pull = ch * 8, tremble = ch >= 1 ? Math.sin(this.t * 70) * 0.5 : 0;
    g.lineCap = 'round';
    g.strokeStyle = '#4a2a10'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(2, -12); g.quadraticCurveTo(13 - ch * 2.6, 0, 2, 12); g.stroke();
    g.strokeStyle = '#a8742f'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(2, -12); g.quadraticCurveTo(13 - ch * 2.6, 0, 2, 12); g.stroke();
    g.strokeStyle = '#e0b070'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(3, -8); g.quadraticCurveTo(9 - ch * 2, 0, 3, 8); g.stroke();
    g.fillStyle = '#c8283a'; g.fillRect(8 - ch * 1.8, -2, 2, 4);                         // impugnatura
    g.fillStyle = '#f0c040'; g.fillRect(1, -14, 2, 2); g.fillRect(1, 12, 2, 2);            // punte dorate
    const sx = 2 - pull + (vib > 0 ? Math.sin(vib * 40) * vib * 3 : 0);
    g.strokeStyle = '#f4f0e8'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(2, -12); g.lineTo(sx, tremble); g.lineTo(2, 12); g.stroke();
    if (nocked) {
      g.strokeStyle = '#d8c090'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, tremble); g.lineTo(sx + 20, tremble); g.stroke();     // asta
      g.fillStyle = '#e8eef8'; g.beginPath(); g.moveTo(sx + 20, tremble - 2); g.lineTo(sx + 21, tremble); g.lineTo(sx + 20, tremble + 2); g.fill();   // punta
      g.fillStyle = '#c8283a'; g.fillRect(sx, tremble - 2, 3, 1); g.fillRect(sx, tremble + 1, 3, 1);                                      // penne
      if (ch >= 1) { g.strokeStyle = `rgba(255,224,96,${0.5 + 0.4 * Math.sin(this.t * 16)})`; g.lineWidth = 1; g.beginPath(); g.arc(sx + 19, tremble, 4, 0, 6.283); g.stroke(); }   // carica piena: punta che brilla
    }
    g.restore();
  }
  // scudo: forma, colori e stemma secondo il materiale; si crepa quando la durata è bassa
  drawShield(g, x, y, a, sh, flash) {
    const col = sh.col || ['#8a5a2a', '#4a2a10', '#d8c070'], ratio = Math.max(0, Math.min(1, (this.state.shieldDur[sh.id] ?? sh.dur) / sh.dur));
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
    g.fillStyle = flash ? '#ffffff' : col[1]; g.beginPath(); g.ellipse(0, 0, 11, 8, 0, 0, 6.283); g.fill();
    g.fillStyle = flash ? '#e8ffff' : col[0]; g.beginPath(); g.ellipse(0, 0, 9, 6.2, 0, 0, 6.283); g.fill();
    g.fillStyle = col[2]; g.fillRect(-1, -5, 2, 10); g.fillRect(-6, -1, 12, 2);                                  // croce dello stemma
    g.fillStyle = col[1]; g.beginPath(); g.arc(0, 0, 2.4, 0, 6.283); g.fill(); g.fillStyle = col[2]; g.fillRect(-1, -1, 2, 2);   // borchia centrale
    if (sh.mat === 'mystic' || sh.mat === 'stone') { g.globalAlpha = 0.35 + 0.25 * Math.sin(this.t * 5); g.strokeStyle = col[2]; g.beginPath(); g.ellipse(0, 0, 12, 9, 0, 0, 6.283); g.stroke(); g.globalAlpha = 1; }
    if (ratio < 0.35) { g.strokeStyle = '#1a0a14'; g.lineWidth = 1; g.beginPath(); g.moveTo(-5, -4); g.lineTo(-1, 0); g.lineTo(-4, 3); g.moveTo(1, 0); g.lineTo(5, 4); g.stroke(); }   // crepe
    g.restore();
  }
}
export { TS };
