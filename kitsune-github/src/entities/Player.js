import { Bomb } from './Bomb.js';
import { castElement } from '../abilities/Elements.js';
import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { drawPlayerSprite, drawMount, shadow } from '../engine/Sprites.js';
import { MOUNTS } from '../data/mounts.js';
import { AMMO } from '../data/items.js';
import { angDiff, TS } from '../core/Util.js';

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
    this.guard = false; this.guardT = 0; this.gRegT = 0; this.gBroken = false; this.gBreakFx = 0; this.parryFx = 0; this.dodge = null; this.stT = 0;
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
    this.atkCd -= dt; this.comboT -= dt; this.inv -= dt; this.flash -= dt; this.parryFx -= dt;
    this.slowT -= dt; this.stunT -= dt; this.gBreakFx -= dt; this.gRegT -= dt; this.invertT -= dt; this.stT -= dt;
    if (this.poisonT > 0) {
      this.poisonT -= dt; this.poisonAcc += dt;
      if (this.poisonAcc >= 0.5) { this.poisonAcc = 0; const d = Math.min(Math.max(0, st.hp - 1), this.poisonDps * 0.5); if (d > 0) { st.hp -= d; sc.floatText(this.cx, this.y - 10, String(Math.round(d)), '#80e060'); } }
    }
    st.ki = Math.min(st.maxKi, st.ki + 2.5 * dt);
    if (this.stT <= 0 && !this.guard && !this.drawing) st.stamina = Math.min(st.maxStamina, st.stamina + 30 * dt);
    // la guardia si rigenera quando non è in uso (più lentamente se rotta)
    if (!this.guard && this.gRegT <= 0) {
      st.guardPts = Math.min(st.maxGuard, st.guardPts + (this.gBroken ? 9 : 16) * dt);
      if (this.gBroken && st.guardPts >= st.maxGuard * 0.4) this.gBroken = false;
    }
    if (this.dash) { this.updateDash(dt, sc); return; }
    if (this.dodge) { this.updateDodge(dt, sc); return; }

    if (Math.abs(this.kbx) + Math.abs(this.kby) > 2) {
      this.move(this.kbx * dt, this.kby * dt);
      const k = Math.pow(0.002, dt); this.kbx *= k; this.kby *= k;
    }
    let [ax, ay] = inp.axis();
    if (this.invertT > 0) { ax = -ax; ay = -ay; }
    if (this.stunT > 0) { this.guard = false; this.drawing = false; this.atkT = 0; return; }
    const can = !st.mount;

    // difesa: tieni premuto; la pressione iniziale (primi 0,2 s) è una parata perfetta
    const was = this.guard;
    this.guard = can && inp.held('defend') && !this.gBroken && st.guardPts > 0 && !this.drawing && this.atkT <= 0;
    if (was && !this.guard) this.gRegT = 0.9;
    if (this.guard) this.guardT = was ? this.guardT + dt : 0;
    if (this.guard && !was) sc.audio.sfx('select');

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
    if (moving) { this.move(ax * sp * dt, ay * sp * dt); this.walk += dt * (mt ? 12 : 9); }

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
    const st = this.state, bow = st.inv.bow();
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
    this.swingAng = Math.atan2(this.face.y, this.face.x);
    this.world.scene.audio.sfx(this.combo === 2 ? 'slash2' : 'slash');
  }
  // Colpo in arco davanti al giocatore; devia anche i proiettili nemici.
  doHit(sc) {
    const st = this.state, w = st.inv.weapon();
    const big = this.combo === 2;
    const reach = (w.reach || 22) + (big ? 6 : 0), arc = big ? Math.PI * 0.9 : Math.PI * 0.65;
    const dmg = st.atk * (big ? 1.5 : 1);
    sc.slash(this.cx, this.cy, this.swingAng, reach, arc, big);
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
    this.afterimg.length = 0;
  }
  updateDash(dt, sc) {
    const d = this.dash;
    const step = Math.min(d.left, 320 * dt);
    const r = this.move(d.dx * step, d.dy * step);
    d.left -= step;
    this.afterimg.push([this.cx, this.feetY]); if (this.afterimg.length > 6) this.afterimg.shift();
    this.walk += dt * 20;
    if (d.left <= 0.5 || (r.hitX && Math.abs(d.dx) > 0.5) || (r.hitY && Math.abs(d.dy) > 0.5)) {
      this.dash = null; d.onEnd?.(sc);
    }
  }
  updateDodge(dt, sc) {
    const d = this.dodge, step = Math.min(d.left, 210 * dt);
    const r = this.move(d.dx * step, d.dy * step);
    d.left -= step;
    this.afterimg.push([this.cx, this.feetY]); if (this.afterimg.length > 5) this.afterimg.shift();
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
        const real = Math.round(dmg * 0.1);
        if (real > 0) st.hp -= real;
        this.kbx = -sx / l * (40 + 25 * w); this.kby = -sy / l * (40 + 25 * w);
        if (st.guardPts <= 0) this.breakGuard(sc);
        if (st.hp <= 0) this.die(sc);
        return 'blocked';
      }
    }
    const real = Math.max(1, Math.round(dmg - st.def * 0.5));
    st.hp -= real; this.inv = 0.9; this.flash = 0.15;
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
  draw(g, cx, cy, sc) {
    if (this.inv > 0 && !this.dash && !this.dodge && !(this.parryFx > 0) && Math.floor(this.t * 20) % 2 === 0) return;
    const x = Math.round(this.cx - cx), y = Math.round(this.feetY - cy);
    for (let i = 0; i < this.afterimg.length; i++) {
      g.globalAlpha = (i + 1) / this.afterimg.length * 0.35;
      drawPlayerSprite(g, Math.round(this.afterimg[i][0] - cx), Math.round(this.afterimg[i][1] - cy), this.state.look, this.dir, 1);
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
      drawPlayerSprite(g, x + (this.gBreakFx > 0 ? Math.round(Math.sin(this.t * 60) * 2) : 0), y, this.state.look, this.dir, Math.floor(this.walk), { flash: this.flash > 0 || this.gBreakFx > 0.45 });
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
    }
    // postura rotta: scintille e barcollamento
    if (this.gBreakFx > 0 || (this.gBroken && this.stunT > 0)) {
      const k = Math.max(0, this.gBreakFx) / 0.7;
      g.strokeStyle = `rgba(255,150,90,${0.4 + k * 0.5})`; g.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const a = i * 1.047 + this.t * 6, r = 8 + (1 - k) * 12; g.beginPath(); g.moveTo(x + Math.cos(a) * r, y - 10 + Math.sin(a) * r); g.lineTo(x + Math.cos(a) * (r + 4), y - 10 + Math.sin(a) * (r + 4)); g.stroke(); }
    }
    // arco impugnato mentre si tende
    if (this.drawing) {
      const a = Math.atan2(this.aim.y, this.aim.x);
      g.save(); g.translate(x, y - 10); g.rotate(a);
      g.strokeStyle = '#a07040'; g.lineWidth = 2; g.beginPath(); g.arc(6, 0, 8, -1.2, 1.2); g.stroke(); g.lineWidth = 1;
      g.strokeStyle = '#eee'; g.beginPath(); g.moveTo(6 + 8 * Math.cos(-1.2), 8 * Math.sin(-1.2)); g.lineTo(6 - Math.min(1, this.draw_ / 0.7) * 7, 0); g.lineTo(6 + 8 * Math.cos(1.2), 8 * Math.sin(1.2)); g.stroke();
      g.restore();
    }
    // indicatori delle alterazioni di stato
    const ic = [[this.poisonT > 0, '#80e060'], [this.slowT > 0, '#60a0ff'], [this.stunT > 0, '#ffe060'], [this.invertT > 0, '#ff3fa4']].filter((q) => q[0]);
    ic.forEach((q, i) => { g.fillStyle = '#000'; g.fillRect(x - ic.length * 3 + i * 6 - 1, y - 38, 6, 6); g.fillStyle = q[1]; g.fillRect(x - ic.length * 3 + i * 6, y - 37, 4, 4); });
    // lama durante il fendente
    if (this.atkT > 0 && !mt) {
      const p = 1 - this.atkT / this.atkDur, arc = this.combo === 2 ? Math.PI * 0.9 : Math.PI * 0.65;
      const a = this.swingAng - arc / 2 + arc * p, len = (this.state.inv.weapon().reach || 22) * 0.9;
      g.save(); g.translate(x, y - 9); g.rotate(a);
      g.fillStyle = '#e8eef8'; g.fillRect(4, -1, len, 2); g.fillStyle = '#8a9ab0'; g.fillRect(4, 0, len, 1);
      g.fillStyle = '#c8283a'; g.fillRect(0, -1, 5, 2);
      g.restore();
    }
  }
}
export { TS };
