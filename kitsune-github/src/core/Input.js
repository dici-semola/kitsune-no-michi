// Mappatura azioni -> tasti. Le scene leggono solo azioni astratte.
export const BIND = {
  up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  attack: ['KeyJ', 'Space'], dash: ['KeyK', 'ShiftLeft', 'ShiftRight'], fire: ['KeyL'], black: ['KeyH'],
  interact: ['KeyE', 'Enter'], menu: ['KeyI', 'Tab'], mount: ['KeyM'], quick: ['KeyF'], pause: ['Escape'],
  confirm: ['Enter', 'KeyE', 'Space', 'KeyJ'], cancel: ['Escape', 'KeyX', 'KeyI', 'Tab'],
  sub: ['KeyQ'], sub2: ['KeyR'],
  mute: ['KeyN'], throw: ['KeyZ'], elem: ['KeyP'], bombsel: ['KeyO'], defend: ['KeyU', 'KeyC'], dodge: ['KeyV'], bow: ['KeyB'], weapon: ['KeyT'], ammo: ['KeyG'], map: ['KeyY'],
  debug1: ['F1'], debug2: ['F2'], debug3: ['F3'],
};
const PREVENT = new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F1', 'F2', 'F3']);

export class Input {
  constructor() {
    this.down = new Set();
    this.edge = new Set();
    this.vdown = new Set();          // tasti virtuali (touch/mouse)
    this.mouse = { x: 240, y: 135, t: -1e9 };
    if (typeof addEventListener !== 'undefined') {
      addEventListener('keydown', (e) => {
        if (!e.repeat) this.edge.add(e.code);
        this.down.add(e.code);
        if (PREVENT.has(e.code)) e.preventDefault();
      });
      addEventListener('keyup', (e) => this.down.delete(e.code));
      addEventListener('blur', () => this.down.clear());
    }
  }
  held(a) { return BIND[a].some((k) => this.down.has(k) || this.vdown.has(k)); }
  vset(code, on) { if (on) { if (!this.vdown.has(code)) this.edge.add(code); this.vdown.add(code); } else this.vdown.delete(code); }
  // direzione di mira del mouse rispetto a un punto dello schermo logico (solo se il mouse è stato usato di recente)
  aimFrom(sx, sy) { if (performance.now() - this.mouse.t > 4000) return null; const dx = this.mouse.x - sx, dy = this.mouse.y - sy, l = Math.hypot(dx, dy); return l > 6 ? { x: dx / l, y: dy / l } : null; }
  pressed(a) { return BIND[a].some((k) => this.edge.has(k)); }
  axis() {
    const x = (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0);
    const y = (this.held('down') ? 1 : 0) - (this.held('up') ? 1 : 0);
    return [x, y];
  }
  endStep() { this.edge.clear(); }
  // Utility per i test headless
  press(code, hold = false) { this.edge.add(code); if (hold) this.down.add(code); }
  release(code) { this.down.delete(code); }
}
