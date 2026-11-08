import { moveEntity } from '../engine/Collision.js';

// Base di ogni oggetto dinamico. (x,y) = angolo in alto a sinistra dell'hitbox ai piedi.
export class Entity {
  constructor(x, y, w = 10, h = 8) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.solid = true; this.dead = false; this.t = 0;
    this.face = { x: 0, y: 1 };
    this.world = null;
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get feetY() { return this.y + this.h; }
  update(dt) { this.t += dt; }
  draw() {}
  move(dx, dy) { return moveEntity(this, dx, dy, this.world); }
}
