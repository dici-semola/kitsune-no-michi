import { Entity } from './Entity.js';
import { dist } from '../core/Util.js';
import { drawItemIcon } from '../engine/Sprites.js';
import { ITEMS } from '../data/items.js';

// Monete e oggetti lasciati dai nemici: si raccolgono avvicinandosi.
export class Pickup extends Entity {
  constructor(x, y, o) {
    super(x - 3, y - 3, 6, 6);
    this.solid = false; this.item = o.item || null; this.gold = o.gold || 0; this.age = 0;
  }
  update(dt, sc) {
    super.update(dt);
    this.age += dt;
    const p = this.world.player;
    if (!p || p.dead || this.age < 0.4) return;
    const d = dist(this.cx, this.cy, p.cx, p.cy);
    if (d < 48) { this.x += ((p.cx - this.cx) / d) * 90 * dt; this.y += ((p.cy - this.cy) / d) * 90 * dt; }
    if (d < 9) {
      if (this.gold) { sc.audio.sfx('coin'); sc.state.inv.gold += this.gold; sc.floatText(p.cx, p.y - 8, `+${this.gold}¥`, '#ffd860'); }
      else if (this.item) { if (sc.state.give(this.item, 1) <= 0) return; sc.audio.sfx('pickup'); }
      this.dead = true;
    }
    if (this.age > 60) this.dead = true;
  }
  draw(g, cx, cy) {
    const x = Math.round(this.cx - cx), y = Math.round(this.cy - cy - 3 - Math.sin(this.t * 5) * 1.5);
    if (this.gold) { g.fillStyle = '#7a5a10'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#ffd860'; g.fillRect(x - 2, y - 2, 4, 4); }
    else drawItemIcon(g, ITEMS[this.item], x - 5, y - 5);
  }
}
