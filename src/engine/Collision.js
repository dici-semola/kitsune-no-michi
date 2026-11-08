import { overlap } from '../core/Util.js';

// Hash spaziale a griglia per query rapide su AABB.
export class SpatialHash {
  constructor(cs = 32) { this.cs = cs; this.m = new Map(); }
  clear() { this.m.clear(); }
  key(x, y) { return (y + 64) * 2048 + (x + 64); }
  insert(e) {
    const cs = this.cs;
    const x0 = Math.floor(e.x / cs), x1 = Math.floor((e.x + e.w) / cs);
    const y0 = Math.floor(e.y / cs), y1 = Math.floor((e.y + e.h) / cs);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = this.key(x, y);
      let a = this.m.get(k);
      if (!a) this.m.set(k, (a = []));
      a.push(e);
    }
  }
  query(r, out = []) {
    const cs = this.cs;
    const x0 = Math.floor(r.x / cs), x1 = Math.floor((r.x + r.w) / cs);
    const y0 = Math.floor(r.y / cs), y1 = Math.floor((r.y + r.h) / cs);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const a = this.m.get(this.key(x, y));
      if (a) for (const e of a) if (!out.includes(e)) out.push(e);
    }
    return out;
  }
}

// Movimento a assi separati con sub-step (max 4px) -> niente tunneling nei muri.
// Ritorna {hitX,hitY}. Le collisioni con altre entità solide valgono solo se
// non ci si stava già sovrapponendo (evita blocchi in spawn/knockback).
export function moveEntity(e, dx, dy, world) {
  const ign = world.solidOverlaps(e);
  const axis = (ax, ay) => {
    const n = Math.ceil(Math.max(Math.abs(ax), Math.abs(ay)) / 4);
    if (!n) return false;
    const sx = ax / n, sy = ay / n;
    for (let i = 0; i < n; i++) {
      e.x += sx; e.y += sy;
      if (world.blocked(e, e, ign)) { e.x -= sx; e.y -= sy; return true; }
    }
    return false;
  };
  const hitX = axis(dx, 0);
  const hitY = axis(0, dy);
  return { hitX, hitY };
}

export { overlap };
