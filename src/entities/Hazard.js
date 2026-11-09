import { Entity } from './Entity.js';
import { dist } from '../core/Util.js';

// Pericoli a terra creati da nemici e boss.
//  boom  : cerchio telegrafato che esplode dopo `delay`
//  beam  : raggio rettilineo (len x w) telegrafato, colpisce dopo `delay`
//  fire / poison / ice : pozze persistenti (danno, veleno, rallentamento)
//  pull  : vortice che attira il giocatore verso il centro
//  wind  : raffica che spinge il giocatore nella direzione `ang`
export class Hazard extends Entity {
  constructor(o) {
    super(o.x - 2, o.y - 2, 4, 4);
    Object.assign(this, { kind: o.kind, px: o.x, py: o.y, r: o.r || 16, delay: o.delay || 0, life: o.life || 0.3, dmg: o.dmg || 0,
      ang: o.ang || 0, len: o.len || 0, wd: o.w || 8, col: o.col || '#ff4060', fired: false, acc: 0 });
    this.solid = false; this.isHazard = true;
  }
  get cx() { return this.px; }
  get cy() { return this.py; }
  get feetY() { return this.py - 40; } // disegnato sopra il terreno, sotto le entità

  hits(p) {
    if (this.kind === 'beam') {
      const dx = p.cx - this.px, dy = p.cy - this.py, c = Math.cos(this.ang), s = Math.sin(this.ang);
      const along = dx * c + dy * s, across = Math.abs(-dx * s + dy * c);
      return along > -4 && along < this.len && across < this.wd / 2 + 4;
    }
    return dist(p.cx, p.cy, this.px, this.py) < this.r + 4;
  }

  update(dt, sc) {
    this.t += dt;
    const p = this.world.player;
    if (!p || p.dead) return;
    const active = this.t >= this.delay;
    switch (this.kind) {
      case 'boom': case 'beam':
        if (active && !this.fired) {
          this.fired = true;
          if (this.hits(p)) p.hurt(this.dmg, { cx: this.px, cy: this.py });
          sc.spark(this.px, this.py, this.col, this.kind === 'boom' ? 10 : 4);
          if (this.kind === 'boom') { sc.ring(this.px, this.py, this.r, this.col); sc.audio.sfx('explode'); } else sc.audio.sfx('zap');
          sc.shake(2);
        }
        if (this.t > this.delay + 0.25) this.dead = true;
        break;
      case 'fire': case 'poison': case 'ice':
        if (!active) break;
        this.acc += dt;
        if (this.acc >= 0.4 && this.hits(p)) {
          this.acc = 0;
          if (this.kind === 'fire') p.hurt(this.dmg || 4, { cx: this.px, cy: this.py });
          else if (this.kind === 'poison') p.debuff('poison', 3, this.dmg || 3);
          else p.debuff('slow', 1.2);
        }
        if (this.t > this.delay + this.life) this.dead = true;
        break;
      case 'pull':
        if (!active) break;
        if (this.hits(p)) { const d = dist(p.cx, p.cy, this.px, this.py) || 1; p.shove(this.px - p.cx, this.py - p.cy, 70); if (d < 14) { this.acc += dt; if (this.acc > 0.5) { this.acc = 0; p.hurt(this.dmg, { cx: this.px, cy: this.py }); } } }
        if (this.t > this.delay + this.life) this.dead = true;
        break;
      case 'wind':
        if (active) p.shove(Math.cos(this.ang), Math.sin(this.ang), 95);
        if (this.t > this.delay + this.life) this.dead = true;
        break;
    }
  }

  draw(g, cx, cy) {
    const x = Math.round(this.px - cx), y = Math.round(this.py - cy), warn = this.t < this.delay;
    const pulse = 0.5 + 0.5 * Math.sin(this.t * 24);
    switch (this.kind) {
      case 'boom': {
        if (warn) { g.fillStyle = `rgba(255,50,70,${0.15 + 0.2 * pulse})`; g.beginPath(); g.arc(x, y, this.r, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(255,120,130,.8)'; g.beginPath(); g.arc(x, y, this.r * Math.min(1, this.t / this.delay), 0, 6.283); g.stroke(); }
        else { g.fillStyle = this.col; g.globalAlpha = 0.6; g.beginPath(); g.arc(x, y, this.r, 0, 6.283); g.fill(); g.globalAlpha = 1; }
        break;
      }
      case 'beam': {
        g.save(); g.translate(x, y); g.rotate(this.ang);
        if (warn) { g.fillStyle = `rgba(255,60,90,${0.12 + 0.18 * pulse})`; g.fillRect(0, -this.wd / 2, this.len, this.wd); g.fillStyle = 'rgba(255,200,200,.6)'; g.fillRect(0, -0.5, this.len, 1); }
        else { g.fillStyle = this.col; g.fillRect(0, -this.wd / 2, this.len, this.wd); g.fillStyle = '#fff'; g.fillRect(0, -1, this.len, 2); }
        g.restore(); break;
      }
      case 'fire': case 'poison': case 'ice': {
        if (warn) break;
        const c = { fire: ['rgba(255,110,30,.5)', '#ffd060'], poison: ['rgba(90,200,60,.45)', '#c8ff80'], ice: ['rgba(150,220,255,.45)', '#ffffff'] }[this.kind];
        g.fillStyle = c[0]; g.beginPath(); g.ellipse(x, y, this.r, this.r * 0.6, 0, 0, 6.283); g.fill();
        g.fillStyle = c[1]; g.fillRect(x - 3 + Math.round(Math.sin(this.t * 6 + this.px) * 4), y - 2 - Math.floor((this.t * 8) % 5), 2, 2);
        break;
      }
      case 'pull': {
        if (warn) break;
        g.strokeStyle = 'rgba(120,200,255,.7)';
        for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x, y, this.r * (1 - ((this.t * 1.2 + i / 3) % 1)), 0, 6.283); g.stroke(); }
        break;
      }
      case 'wind': {
        if (warn) break;
        g.fillStyle = 'rgba(220,240,255,.7)';
        for (let i = 0; i < 6; i++) { const k = (this.t * 3 + i / 6) % 1; g.fillRect(x + Math.cos(this.ang) * (k * 120 - 60) + (i - 3) * 8, y + Math.sin(this.ang) * (k * 120 - 60) + (i % 3) * 10 - 10, 7, 1); }
        break;
      }
    }
  }
}
