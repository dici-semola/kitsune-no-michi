// Controlli touch (joystick + pulsanti virtuali ridimensionabili) e mouse, disegnati su una seconda canvas a tutta finestra.
// Traduce tutto in "tasti virtuali" per Input: il resto del gioco non sa se si gioca con tastiera, mouse o dita.
import { W, H } from './Game.js';

const KEY = 'kitsune_touch';
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// dx,dy = distanza dall'angolo in basso a destra (unità u); hold = tasto tenuto premuto finché dura il tocco
const WORLD_BTN = [
  { id: 'att', label: 'Att', code: 'KeyJ', dx: 75, dy: 75, r: 36 },
  { id: 'dif', label: 'Dif', code: 'KeyU', dx: 165, dy: 55, r: 26, hold: 1 },
  { id: 'arc', label: 'Arco', code: 'KeyB', dx: 150, dy: 130, r: 26, hold: 1 },
  { id: 'sch', label: 'Sch', code: 'KeyV', dx: 80, dy: 150, r: 26 },
  { id: 'usa', label: 'Usa', code: 'KeyE', dx: 228, dy: 115, r: 22 },
  { id: 'scat', label: 'Scat', code: 'KeyK', dx: 238, dy: 40, r: 19 },
  { id: 'fuo', label: 'Fuoco', code: 'KeyL', dx: 168, dy: 202, r: 19 },
  { id: 'ner', label: 'Nera', code: 'KeyH', dx: 92, dy: 218, r: 19 },
  { id: 'cav', label: 'Mont', code: 'KeyM', dx: 240, dy: 178, r: 17 },
  { id: 'cur', label: 'Cura', code: 'KeyF', dx: 28, dy: 205, r: 17 },
];
// angolo in alto a destra
const TOP_BTN = [
  { id: 'menu', label: 'Menu', code: 'KeyI', tx: 34, r: 18 }, { id: 'map', label: 'Mappa', code: 'KeyY', tx: 82, r: 18 },
  { id: 'arm', label: 'Arma', code: 'KeyT', tx: 130, r: 18 }, { id: 'amm', label: 'Frec', code: 'KeyG', tx: 178, r: 18 },
  { id: 'bom', label: 'Bomba', code: 'KeyZ', tx: 226, r: 18 }, { id: 'ele', label: 'Elem', code: 'KeyP', tx: 274, r: 18 },
];

export class Touch {
  constructor(game, canvas) {
    this.game = game; this.cv = canvas; this.g = canvas.getContext('2d');
    this.pts = new Map(); this.stick = { x: 0, y: 0 }; this.touchSeen = false;
    this.mode = 'auto'; this.scale = 1;
    try { const s = JSON.parse(localStorage.getItem(KEY) || '{}'); if (s.mode) this.mode = s.mode; if (s.scale) this.scale = s.scale; } catch { /* default */ }
    if (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) this.touchSeen = true;
    for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) canvas.addEventListener(ev, (e) => this[ev](e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  }
  save() { try { localStorage.setItem(KEY, JSON.stringify({ mode: this.mode, scale: this.scale })); } catch { /* ignora */ } }
  get visible() { return this.mode === 'on' || (this.mode === 'auto' && this.touchSeen); }
  cycleMode() { this.mode = { auto: 'on', on: 'off', off: 'auto' }[this.mode]; this.save(); }
  cycleScale() { this.scale = this.scale >= 1.4 ? 0.7 : Math.round((this.scale + 0.15) * 100) / 100; this.save(); }

  get inWorld() { return this.game.scenes.top?.constructor.name === 'WorldScene'; }
  u() { const w = this.cv.clientWidth, h = this.cv.clientHeight; return clamp(Math.min(w, h * 1.4) / 560, 0.7, 1.4) * this.scale; }

  // Elenco pulsanti con posizione assoluta (px CSS) per la modalità corrente
  layout() {
    const w = this.cv.clientWidth, h = this.cv.clientHeight, u = this.u(), out = [];
    if (this.inWorld) {
      for (const b of WORLD_BTN) out.push({ ...b, x: w - b.dx * u, y: h - b.dy * u, R: b.r * u });
      for (const b of TOP_BTN) out.push({ ...b, x: w - b.tx * u, y: 30 * u, R: b.r * u });
      this.stickC = { x: 100 * u, y: h - 105 * u, R: 62 * u };
    } else {
      const c = { x: 105 * u, y: h - 110 * u };
      for (const [id, code, ox, oy] of [['u', 'ArrowUp', 0, -50], ['d', 'ArrowDown', 0, 50], ['l', 'ArrowLeft', -50, 0], ['r', 'ArrowRight', 50, 0]]) out.push({ id, label: { u: '▲', d: '▼', l: '◄', r: '►' }[id], code, x: c.x + ox * u, y: c.y + oy * u, R: 27 * u });
      out.push({ id: 'ok', label: 'OK', code: 'Enter', x: w - 75 * u, y: h - 90 * u, R: 36 * u });
      out.push({ id: 'ind', label: 'Indietro', code: 'Escape', x: w - 165 * u, y: h - 60 * u, R: 28 * u });
      out.push({ id: 'q', label: 'Q', code: 'KeyQ', x: w - 70 * u, y: h - 180 * u, R: 18 * u });
      out.push({ id: 'rr', label: 'R', code: 'KeyR', x: w - 130 * u, y: h - 180 * u, R: 18 * u });
      this.stickC = null;
    }
    return out;
  }
  hit(x, y) { return this.layout().find((b) => Math.hypot(x - b.x, y - b.y) <= b.R * 1.15); }

  pos(e) { const r = this.cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  // coordinate del mouse nello spazio logico del gioco (480x270)
  logical(e) { const r = this.game.canvas.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H]; }

  pointerdown(e) {
    const inp = this.game.input;
    this.game.audio.unlock();
    if (e.pointerType === 'mouse') {
      const [lx, ly] = this.logical(e); inp.mouse = { x: lx, y: ly, t: performance.now() };
      if (e.button === 2) { inp.vset('KeyB', true); this.pts.set(e.pointerId, { mouseKey: 'KeyB' }); }
      else if (e.button === 0) { const b = this.visible && this.hit(...this.pos(e)); if (b) this.press(e, b); else { inp.vset(this.inWorld ? 'KeyJ' : 'Enter', true); this.pts.set(e.pointerId, { mouseKey: this.inWorld ? 'KeyJ' : 'Enter' }); } }
      return;
    }
    this.touchSeen = true; try { this.cv.setPointerCapture?.(e.pointerId); } catch { /* evento sintetico */ }
    const [x, y] = this.pos(e), b = this.hit(x, y);
    if (b) this.press(e, b);
    else if (this.stickC && Math.hypot(x - this.stickC.x, y - this.stickC.y) < this.stickC.R * 1.8) { this.pts.set(e.pointerId, { stick: true }); this.moveStick(x, y); }
    e.preventDefault();
  }
  press(e, b) {
    const top = this.game.scenes.top;
    if (b.id === 'ok' && top?.constructor.name === 'CreatorScene' && top.sel === 0 && !top.editing) top.focusName();
    this.game.input.vset(b.code, true); this.pts.set(e.pointerId, { btn: b }); if (!b.hold) setTimeout(() => this.game.input.vset(b.code, false), 90); }
  moveStick(x, y) {
    const c = this.stickC; if (!c) return;
    let dx = (x - c.x) / c.R, dy = (y - c.y) / c.R; const l = Math.hypot(dx, dy);
    if (l > 1) { dx /= l; dy /= l; }
    this.stick = { x: dx, y: dy };
    const inp = this.game.input, T = 0.32;
    inp.vset('KeyD', dx > T); inp.vset('KeyA', dx < -T); inp.vset('KeyS', dy > T); inp.vset('KeyW', dy < -T);
  }
  pointermove(e) {
    const inp = this.game.input;
    if (e.pointerType === 'mouse') { const [lx, ly] = this.logical(e); inp.mouse = { x: lx, y: ly, t: performance.now() }; return; }
    const p = this.pts.get(e.pointerId);
    if (p?.stick) { const [x, y] = this.pos(e); this.moveStick(x, y); }
  }
  pointerup(e) {
    const p = this.pts.get(e.pointerId), inp = this.game.input;
    if (!p) return;
    if (p.stick) { this.stick = { x: 0, y: 0 }; for (const k of ['KeyA', 'KeyD', 'KeyW', 'KeyS']) inp.vset(k, false); }
    if (p.btn?.hold) inp.vset(p.btn.code, false);
    if (p.mouseKey) inp.vset(p.mouseKey, false);
    this.pts.delete(e.pointerId);
  }
  pointercancel(e) { this.pointerup(e); }

  render() {
    const g = this.g, cv = this.cv, dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    if (cv.width !== Math.round(cv.clientWidth * dpr) || cv.height !== Math.round(cv.clientHeight * dpr)) { cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
    if (!this.visible) return;
    const btns = this.layout(), pressed = new Set([...this.pts.values()].filter((p) => p.btn).map((p) => p.btn.id));
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (this.stickC) {
      const c = this.stickC;
      g.fillStyle = 'rgba(20,16,32,.35)'; g.beginPath(); g.arc(c.x, c.y, c.R, 0, 6.283); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = 'rgba(255,230,200,.55)'; g.beginPath(); g.arc(c.x + this.stick.x * c.R * 0.6, c.y + this.stick.y * c.R * 0.6, c.R * 0.42, 0, 6.283); g.fill();
    }
    for (const b of btns) {
      const on = pressed.has(b.id);
      g.fillStyle = on ? 'rgba(255,200,160,.6)' : 'rgba(20,16,32,.42)'; g.beginPath(); g.arc(b.x, b.y, b.R, 0, 6.283); g.fill();
      g.strokeStyle = on ? '#fff' : 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#fff'; g.font = `bold ${Math.max(9, Math.round(b.R * 0.5))}px sans-serif`; g.fillText(b.label, b.x, b.y);
    }
  }
}
