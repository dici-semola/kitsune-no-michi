import { SpatialHash } from './Collision.js';
import { overlap, dist } from '../core/Util.js';

// Contenitore di entità + query spaziali + test di collisione contro mappa ed entità solide.
export class World {
  constructor(map, scene) {
    this.map = map;
    this.scene = scene;
    this.list = [];
    this.queue = [];
    this.hash = new SpatialHash(32);
    this.player = null;
  }
  add(e) { e.world = this; this.queue.push(e); return e; }

  flush() { if (this.queue.length) { this.list.push(...this.queue); this.queue.length = 0; } }
  update(dt) {
    this.flush();
    this.rehash();
    for (const e of this.list) if (!e.dead) e.update(dt, this.scene);
    this.list = this.list.filter((e) => !e.dead);
  }
  rehash() {
    this.hash.clear();
    for (const e of this.list) if (!e.dead) this.hash.insert(e);
  }

  // Test di blocco: mappa + entità solide (esclusi quelli in `ign`).
  blocked(r, mover, ign) {
    if (this.map.blockedRect(r, mover)) return true;
    if (!mover || !mover.solid || mover.flying) return false;
    for (const o of this.hash.query(r)) {
      if (o !== mover && o.solid && !o.dead && !(ign && ign.includes(o)) && overlap(r, o)) return true;
    }
    return false;
  }
  solidOverlaps(e) {
    if (!e.solid) return [];
    return this.hash.query(e).filter((o) => o !== e && o.solid && !o.dead && overlap(e, o));
  }

  query(r) { return this.hash.query(r); }
  near(x, y, rad, pred) {
    const r = { x: x - rad, y: y - rad, w: rad * 2, h: rad * 2 };
    return this.list.filter((e) => !e.dead && (!pred || pred(e)) && dist(x, y, e.cx, e.cy) <= rad);
  }
  nearest(x, y, rad, pred) {
    let best = null, bd = rad;
    for (const e of this.list) {
      if (e.dead || (pred && !pred(e))) continue;
      const d = dist(x, y, e.cx, e.cy);
      if (d <= bd) { bd = d; best = e; }
    }
    return best;
  }
  enemies() { return this.list.filter((e) => e.isEnemy && !e.dead && !e.dormant); }
}
