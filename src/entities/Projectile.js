import { Entity } from './Entity.js';
import { overlap, angDiff } from '../core/Util.js';

// Proiettile generico: fuoco del giocatore, Fiamma Nera (inseguitrice), orbi/frecce/laser dei nemici.
export class Projectile extends Entity {
  constructor(o) {
    const r = o.r || 3;
    super(o.x - r, o.y - r, r * 2, r * 2);
    Object.assign(this, { vx: o.vx, vy: o.vy, r, dmg: o.dmg, team: o.team, life: o.life ?? 3, kind: o.kind || 'orb', pierce: o.pierce || 0,
      burn: o.burn || 0, poison: o.poison || 0, maxRange: o.maxRange || 0, ammo: o.ammo || null, travel: 0, fx: o.fx || null, homing: o.homing || null, owner: o.owner, col: o.col || '#ff5060', kb: o.kb ?? 60, status: o.status || null, splash: o.splash || null, elem: o.elem || null });
    this.solid = false; this.isProjectile = true; this.projectile = true;
    this.hit = new Set(); this.trail = [];
  }

  update(dt, sc) {
    this.t += dt;
    this.life -= dt;
    this.travel += Math.hypot(this.vx, this.vy) * dt;
    if (this.life <= 0) { this.dead = true; this.pop(sc); return; }
    if (this.homing) this.steer(dt, sc);
    // movimento a sub-step, bloccato solo da tile solidi (alberi, muri, rocce...)
    const n = Math.ceil(Math.hypot(this.vx, this.vy) * dt / 4) || 1;
    for (let i = 0; i < n; i++) {
      this.x += (this.vx * dt) / n; this.y += (this.vy * dt) / n;
      if (this.world.map.blockedRect({ x: this.cx - 1, y: this.cy - 1, w: 2, h: 2 }, this)) {
        if (this.team === 'player' && (this.kind === 'fire' || this.ammo === 'freccia_fuoco')) sc.hitBarriers(this.cx + this.vx * 0.03, this.cy + this.vy * 0.03, 12, 'fire', 1);
        if (this.team === 'player' && this.kind === 'ice') sc.hitBarriers(this.cx + this.vx * 0.03, this.cy + this.vy * 0.03, 12, 'ice', 1);
        this.dead = true; this.pop(sc); sc.spark(this.cx, this.cy, this.kind === 'black' ? '#a060ff' : this.kind === 'ice' ? '#d8f4ff' : this.kind === 'water' ? '#8ac8ff' : '#ffb040', 3); return;
      }
    }
    for (const o of this.world.hash.query(this)) if (o.isProp && o.solid && !o.dead) { this.dead = true; sc.spark(this.cx, this.cy, '#d8c8a0', 3); return; } // si pianta negli oggetti solidi
    if (this.kind === 'fire' || this.kind === 'black') { this.trail.push([this.cx, this.cy]); if (this.trail.length > (this.kind === 'black' ? 10 : 4)) this.trail.shift(); }
    // bersagli
    if (this.team === 'player') {
      for (const e of this.world.enemies()) {
        if (this.hit.has(e) || !overlap(this, e)) continue;
        this.hit.add(e);
        const fall = this.maxRange ? 1 - 0.5 * Math.min(1, this.travel / this.maxRange) : 1; // più lontano = meno danno
        e.hurt(this.dmg * fall, this.owner, { kb: this.kb, burn: this.burn, burnDps: this.dmg * 0.25, poison: this.poison, proj: true, status: this.status, elem: this.elem });
        sc.spark(this.cx, this.cy, this.kind === 'black' ? '#a060ff' : '#ffb040', 5);
        if (this.kind === 'black') sc.shake(3);
        if (this.pierce-- <= 0) { this.dead = true; this.pop(sc); return; }
      }
    } else {
      const p = this.world.player;
      if (p && !p.dead && overlap(this, p)) {
        const r = p.hurt(this.dmg, this);
        if (r) {
          if (r === 'blocked' && this.team === 'player') return; // proiettile rimandato indietro da una parata
          this.dead = true; sc.spark(this.cx, this.cy, this.col, 4);
          if (r === true && this.fx) {
            if (this.fx[0] === 'pull' && this.owner) p.shove(this.owner.cx - p.cx, this.owner.cy - p.cy, 300);
            else p.debuff(this.fx[0], this.fx[1] || 2, 3);
          }
        }
      }
    }
  }

  // Esplosione di schizzi (sfere d'acqua): bagna e danneggia i nemici vicini, spegne le fiamme.
  pop(sc) {
    if (!this.splash || this._popped) return; this._popped = true;
    const sp = this.splash;
    sc.ring(this.cx, this.cy, sp.r, '#8ac8ff'); sc.spark(this.cx, this.cy, '#bfe4ff', 8); sc.audio.sfx('splash');
    for (const e of this.world.enemies()) {
      if (e.dead || e.dormant || Math.hypot(e.cx - this.cx, e.cy - this.cy) > sp.r) continue;
      e.hurt(sp.dmg, this.owner, { kb: 90, status: sp.status, elem: 'water' });
    }
  }

  // Fiamma Nera: insegue il bersaglio; se muore ne cerca un altro finché dura.
  steer(dt, sc) {
    const h = this.homing;
    if (!h.target || h.target.dead) h.target = this.world.nearest(this.cx, this.cy, 260, (e) => e.isEnemy && !e.dead && !e.dormant);
    const sp = Math.min(h.max || 170, Math.hypot(this.vx, this.vy) + 120 * dt);
    let a = Math.atan2(this.vy, this.vx);
    if (h.target) {
      const want = Math.atan2(h.target.cy - this.cy, h.target.cx - this.cx);
      const d = angDiff(want, a);
      a += Math.max(-h.turn * dt, Math.min(h.turn * dt, d));
    }
    this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp;
  }

  draw(g, cx, cy) {
    const x = Math.round(this.cx - cx), y = Math.round(this.cy - cy);
    switch (this.kind) {
      case 'fire': {
        const k = Math.max(0.3, this.life / 0.45), r = 3 + (1 - k) * 4;
        g.globalAlpha = 0.85; g.fillStyle = '#ff4020'; g.fillRect(x - r, y - r, r * 2, r * 2);
        g.fillStyle = '#ffa030'; g.fillRect(x - r + 1, y - r + 1, r * 2 - 2, r * 2 - 2);
        g.fillStyle = '#ffe080'; g.fillRect(x - 1, y - 1, 3, 3); g.globalAlpha = 1;
        break;
      }
      case 'black': {
        for (let i = 0; i < this.trail.length; i++) {
          const [tx, ty] = this.trail[i];
          g.globalAlpha = (i + 1) / this.trail.length * 0.5; g.fillStyle = '#6a2aff';
          g.fillRect(Math.round(tx - cx) - 2, Math.round(ty - cy) - 2, 4, 4);
        }
        g.globalAlpha = 1;
        g.fillStyle = '#7a3aff'; g.fillRect(x - 5, y - 5, 10, 10);
        g.fillStyle = '#14081e'; g.fillRect(x - 4, y - 4, 8, 8);
        g.fillStyle = '#c090ff'; g.fillRect(x - 1 + (Math.floor(this.t * 12) & 1), y - 2, 2, 4);
        break;
      }
      case 'ice': {
        g.fillStyle = 'rgba(160,230,255,.35)'; g.fillRect(x - 6, y - 6, 12, 12);
        g.fillStyle = '#e8faff'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#7ac8f0'; g.fillRect(x - 5, y - 1, 10, 2); g.fillRect(x - 1, y - 5, 2, 10); g.fillStyle = '#fff'; g.fillRect(x - 1, y - 1, 2, 2);
        break;
      }
      case 'water': {
        g.fillStyle = 'rgba(90,168,255,.4)'; g.fillRect(x - 6, y - 6, 12, 12);
        g.fillStyle = '#5aa8ff'; g.fillRect(x - 4, y - 4, 8, 8); g.fillStyle = '#b8e0ff'; g.fillRect(x - 3, y - 3, 3, 3); g.fillStyle = '#2d6cb8'; g.fillRect(x + 1, y + 1, 3, 3);
        break;
      }
      case 'arrowp': {
        const a = Math.atan2(this.vy, this.vx), c = { freccia_fuoco: '#ff8030', freccia_veleno: '#70e050', freccia_magica: '#a080ff' }[this.ammo];
        if (c) { g.fillStyle = c; g.globalAlpha = 0.5; g.fillRect(x - 3, y - 3, 6, 6); g.globalAlpha = 1; }
        g.save(); g.translate(x, y); g.rotate(a);
        g.fillStyle = '#c8a870'; g.fillRect(-6, -0.5, 11, 1); g.fillStyle = c || '#ddd'; g.fillRect(4, -1.5, 3, 3); g.fillStyle = '#eee'; g.fillRect(-7, -1.5, 2, 3);
        g.restore();
        break;
      }
      case 'arrow': {
        const a = Math.atan2(this.vy, this.vx);
        g.save(); g.translate(x, y); g.rotate(a);
        g.fillStyle = '#e8d8a0'; g.fillRect(-5, -0.5, 10, 1); g.fillStyle = '#ccc'; g.fillRect(4, -1.5, 2, 3);
        g.restore();
        break;
      }
      case 'laser': {
        const a = Math.atan2(this.vy, this.vx);
        g.save(); g.translate(x, y); g.rotate(a);
        g.fillStyle = '#ff3fa4'; g.fillRect(-6, -1, 12, 2); g.fillStyle = '#fff'; g.fillRect(-4, -0.5, 8, 1);
        g.restore();
        break;
      }
      case 'web': g.fillStyle = '#d8d8d8'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#888'; g.fillRect(x - 1, y - 1, 2, 2); break;
      default:
        g.globalAlpha = 0.35; g.fillStyle = this.col; g.fillRect(x - 5, y - 5, 10, 10); g.globalAlpha = 1;
        g.fillStyle = this.col; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#fff'; g.fillRect(x - 1, y - 1, 2, 2);
    }
  }
}
