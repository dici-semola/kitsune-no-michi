import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { BOMBS } from '../data/crafting.js';

// Esplosivo lanciato: volo ad arco, miccia lampeggiante, esplosione ad area con danno differenziato per tipo.
export class Bomb extends Entity {
  constructor(id, sx, sy, tx, ty, owner) {
    super(sx - 3, sy - 3, 6, 6);
    this.id = id; this.def = BOMBS[id]; this.owner = owner; this.solid = false; this.isBomb = true;
    this.sx = sx; this.sy = sy; this.tx = tx; this.ty = ty; this.fly = 0.42; this.fuse = this.def.fuse; this.px = sx; this.py = sy; this.h0 = 0;
  }
  get cx() { return this.px; }
  get cy() { return this.py; }
  get feetY() { return this.py + 2; }
  update(dt, sc) {
    this.t += dt;
    if (this.t < this.fly) {
      const k = this.t / this.fly;
      this.px = this.sx + (this.tx - this.sx) * k; this.py = this.sy + (this.ty - this.sy) * k; this.h0 = Math.sin(k * Math.PI) * 18;
    } else { this.px = this.tx; this.py = this.ty; this.h0 = 0; }
    if (this.t >= this.fuse) this.explode(sc);
  }
  explode(sc) {
    if (this.dead) return; this.dead = true;
    const d = this.def, x = this.px, y = this.py;
    sc.audio.sfx('explode'); sc.shake(d.r > 50 ? 8 : 5);
    sc.addFx(0.35, (g, cx, cy, k) => { g.globalAlpha = (1 - k) * 0.85; g.fillStyle = d.col; g.beginPath(); g.arc(x - cx, y - cy, d.r * (0.35 + k * 0.65), 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - cx, y - cy, d.r * 0.4 * (1 - k), 0, 6.283); g.fill(); g.globalAlpha = 1; });
    sc.ring(x, y, d.r, '#fff'); sc.ring(x, y, d.r * 0.7, d.col); sc.spark(x, y, d.col, 18); sc.spark(x, y, '#ffe8a0', 10);
    for (const e of this.world.enemies()) {
      if (e.dead || e.dormant) continue;
      const dist = Math.hypot(e.cx - x, e.cy - y); if (dist > d.r + 4) continue;
      const fall = 1 - 0.45 * Math.min(1, dist / d.r);
      e.hurt(d.dmg * fall, { cx: x, cy: y }, { kb: 170, burn: d.burn || 0, burnDps: d.burn ? 6 : 0, elem: 'bomb' });
    }
    if (d.shards) {
      for (let i = 0; i < d.shards; i++) {
        const a = (i / d.shards) * 6.283 + Math.random() * 0.2;
        this.world.add(new Projectile({ x, y, vx: Math.cos(a) * 250, vy: Math.sin(a) * 250, r: 2, dmg: 16, team: 'player', kind: 'orb', life: 0.45, col: '#e8e8f0', kb: 90, owner: this.owner }));
      }
    }
    sc.hitBarriers(x, y, d.r, d.barrier, 1);
  }
  draw(g, cx, cy) {
    const x = Math.round(this.px - cx), y = Math.round(this.py - cy - this.h0);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x - 3, Math.round(this.py - cy) + 1, 6, 2);
    const blink = this.t > this.fly && Math.floor(this.t * (8 + this.t * 8)) % 2 === 0;
    g.fillStyle = '#16161c'; g.fillRect(x - 3, y - 6, 6, 6); g.fillStyle = blink ? '#ff4040' : '#444'; g.fillRect(x - 3, y - 6, 6, 1);
    g.fillStyle = '#c8a870'; g.fillRect(x, y - 9, 1, 3); g.fillStyle = blink ? '#fff' : '#ffb040'; g.fillRect(x - 1 + (Math.floor(this.t * 20) & 1), y - 10, 2, 2);
  }
}
