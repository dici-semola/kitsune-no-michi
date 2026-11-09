import { W, H } from '../core/Game.js';
import { TS } from '../core/Util.js';
import { DEFS } from '../data/tiles.js';
import { getMap } from '../world/Generators.js';
import { getTile, variantOf, drawHumanoid, drawPlayerSprite } from '../engine/Sprites.js';
import { text } from '../engine/UI.js';

// CINEMATICA FINALE: dopo l'ultimo boss il protagonista torna nella capitale imperiale in festa, sale la scalinata della Domus Imperiale,
// raggiunge il balcone cerimoniale, la folla lo acclama e lui si inchina. Totalmente automatica: l'input viene ignorato (nessuna scena sotto riceve update).
const T_DARK = 3.5, T_FADE = 3.0, T_WALK = 15.5, T_TURN = 2.0, T_ROAR = 4.5, T_BOW = 3.2, T_END = 9.5;
const LOOKS = { top: ['#c8283a', '#e8c040', '#3a6ab0', '#4a9a5a', '#a05ac8', '#e8e0d0', '#d07a2a'], bottom: ['#3a3a5a', '#5a3a2a', '#2a4a4a', '#6a4a8a', '#4a4a4a'], hair: ['#2a1a10', '#5a3a1a', '#b8862e', '#9a9a9a', '#1a1a2a'], skin: ['#f4d4b0', '#e8bc90', '#c89868', '#a87850'] };
const pick = (a, r) => a[Math.floor(r * a.length) % a.length];
const smooth = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };

export class FinaleScene {
  constructor(o) { this.o = o; this.overlay = false; this.t = 0; this.parts = []; this.fire = []; this.nextFire = 18; this.nextClap = 0; this.ended = false; }
  enter() {
    const g = this.game; this.map = getMap('capitale_festa'); const m = this.map, f = m.finale; this.info = f; this.look = g.state.look;
    // folla: file ai lati dell'asse centrale della piazza (il passaggio resta libero) e sotto la scalinata
    let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    this.crowd = [];
    for (let y = f.plaza.y - 12; y <= m.h - 5; y += 2) for (let x = f.cx - 11; x <= f.cx + 11; x++) {
      if (Math.abs(x - f.cx) < 2 || rnd() > 0.55 || (y < f.plaza.y - 8 && Math.abs(x - f.cx) < 9)) continue;
      this.crowd.push({ x: x * TS + 8 + (rnd() - 0.5) * 6, y: y * TS + 12, ph: rnd() * 6, look: { top: pick(LOOKS.top, rnd()), bottom: pick(LOOKS.bottom, rnd()), hair: pick(LOOKS.hair, rnd()), skin: pick(LOOKS.skin, rnd()) }, jump: rnd() * 0.6 + 0.4 });
    }
    // percorso del protagonista: piazza -> piè della rampa sinistra -> terrazza -> balcone
    const s = f.stairs, b = f.balcony; const bottom = { x: f.cx * TS + 8, y: (m.h - 5) * TS + 8 };
    this.path = [bottom, { x: (f.cx - 6) * TS + 8, y: (s.y + 1) * TS + 8 }, { x: (f.cx - 6) * TS + 8, y: (b.y + 1) * TS + 8 }, { x: f.cx * TS + 8, y: (b.y) * TS + 8 }];
    this.lens = []; let L = 0; for (let i = 1; i < this.path.length; i++) { const l = Math.hypot(this.path[i].x - this.path[i - 1].x, this.path[i].y - this.path[i - 1].y); this.lens.push(l); L += l; } this.L = L;
    this.pos = { ...this.path[0] }; this.dir = 1;
    g.audio.play('finale'); this.cx = this.pos.x - W / 2; this.cy = this.pos.y - H / 2 - 20;
    this.tWalk0 = T_DARK + T_FADE; this.tTurn0 = this.tWalk0 + T_WALK; this.tRoar0 = this.tTurn0 + T_TURN; this.tBow0 = this.tRoar0 + T_ROAR; this.tEnd0 = this.tBow0 + T_BOW;
    this.total = this.tEnd0 + T_END; this.fx = [];
  }
  hero(k) { // posizione lungo il percorso a velocità costante
    let d = k * this.L; for (let i = 0; i < this.lens.length; i++) { if (d <= this.lens[i]) { const a = this.path[i], b = this.path[i + 1], u = d / this.lens[i]; return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, seg: i, dx: b.x - a.x, dy: b.y - a.y }; } d -= this.lens[i]; }
    const last = this.path[this.path.length - 1]; return { x: last.x, y: last.y, seg: 99, dx: 0, dy: 0 };
  }
  update(dt) {
    this.t += dt; const t = this.t, A = this.game.audio;
    if (t > this.tWalk0 && t < this.tTurn0) { const k = smooth((t - this.tWalk0) / T_WALK) * 0.4 + ((t - this.tWalk0) / T_WALK) * 0.6, h = this.hero(Math.min(1, k)); this.pos = { x: h.x, y: h.y }; this.walk = (this.walk || 0) + dt * 8; this.dir = Math.abs(h.dx) > Math.abs(h.dy) ? (h.dx < 0 ? 2 : 3) : (h.dy < 0 ? 1 : 0); }
    else if (t >= this.tTurn0) { this.dir = 0; this.walk = 0; }
    // camera: segue il protagonista dolcemente, poi inquadra il balcone dal basso verso l'alto
    const m = this.map, tx = this.pos.x - W / 2, ty = this.pos.y - H / 2 - (t > this.tTurn0 ? -20 : 14);
    this.cx += (tx - this.cx) * Math.min(1, dt * 2.2); this.cy += (ty - this.cy) * Math.min(1, dt * 2.2);
    this.cx = Math.max(0, Math.min(m.w * TS - W, this.cx)); this.cy = Math.max(0, Math.min(m.h * TS - H, this.cy));
    // suoni: folla, applausi, fanfara
    this.nextClap -= dt; if (t > T_DARK + 1 && this.nextClap <= 0) { this.nextClap = 0.12 + Math.random() * 0.22; A.sfx('clap'); }
    if (t > this.tWalk0 - 0.2 && !this.cheered) { this.cheered = true; A.sfx('cheer'); }
    if (t > this.tRoar0 && !this.roared) { this.roared = true; A.sfx('cheer'); A.sfx('levelup'); }
    if (t > this.tBow0 && !this.bowed) { this.bowed = true; A.sfx('cheer'); }
    // coriandoli e fuochi d'artificio
    if (t > this.tWalk0 && this.parts.length < 90) for (let i = 0; i < 2; i++) this.parts.push({ x: this.cx + Math.random() * W, y: this.cy - 4, vx: (Math.random() - 0.5) * 16, vy: 20 + Math.random() * 28, c: ['#ff3fa4', '#ffd24a', '#4cd8ff', '#8aff7a', '#ffffff', '#ff7a30'][(Math.random() * 6) | 0], life: 5 + Math.random() * 3, ph: Math.random() * 6 });
    for (const p of this.parts) { p.life -= dt; p.x += (p.vx + Math.sin(t * 2 + p.ph) * 8) * dt; p.y += p.vy * dt; } this.parts = this.parts.filter((p) => p.life > 0 && p.y < this.cy + H + 8);
    this.nextFire -= dt; if (t > this.tRoar0 - 2 && this.nextFire <= 0) { this.nextFire = 0.45 + Math.random() * 0.5; const x = this.cx + 40 + Math.random() * (W - 80), y = this.cy + 20 + Math.random() * 70, c = ['#ff3fa4', '#ffd24a', '#4cd8ff', '#8aff7a', '#ffffff'][(Math.random() * 5) | 0]; this.fire.push({ x, y, t: 0, c, n: 22 }); A.sfx('ding'); }
    for (const f of this.fire) f.t += dt; this.fire = this.fire.filter((f) => f.t < 1.6);
    if (t >= this.total && !this.ended) { this.ended = true; this.game.scenes.pop(); this.o.onEnd && this.o.onEnd(); }
  }
  render(g) {
    const m = this.map, t = this.t, cx = Math.round(this.cx), cy = Math.round(this.cy), fr = Math.floor(t * 3) & 3;
    g.fillStyle = '#05030a'; g.fillRect(0, 0, W, H);
    const x0 = Math.max(0, cx >> 4), x1 = Math.min(m.w - 1, (cx + W) >> 4), y0 = Math.max(0, cy >> 4), y1 = Math.min(m.h - 1, (cy + H) >> 4);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) { const id = m.ground[ty * m.w + tx], d = DEFS[id]; g.drawImage(getTile(id, d.anim ? fr : 0, (tx * 7 + ty * 13) & 3), tx * TS - cx, ty * TS - cy); }
    // persone ordinate per profondità fra gli oggetti
    const people = this.crowd.map((c) => ({ y: c.y, c })); people.push({ y: this.pos.y + 6, hero: true }); people.sort((a, b) => a.y - b.y);
    let pi = 0; const yT = Math.min(m.h - 1, y1 + 4);
    for (let ty = y0; ty <= yT + 1; ty++) {
      if (ty <= yT) for (let tx = x0; tx <= x1; tx++) { const id = m.obj[ty * m.w + tx]; if (!id) continue; const d = DEFS[id]; if (ty > y1 && !(d.tall > (ty - y1 - 1) * TS)) continue; g.drawImage(getTile(id, d.anim ? fr : 0, variantOf(d, tx, ty)), tx * TS - cx, ty * TS - cy - (d.tall || 0)); }
      while (pi < people.length && people[pi].y < (ty + 1) * TS) { this.drawPerson(g, people[pi], cx, cy, t); pi++; }
    }
    while (pi < people.length) { this.drawPerson(g, people[pi], cx, cy, t); pi++; }
    // luce del giorno festoso
    g.fillStyle = 'rgba(255,225,160,.08)'; g.fillRect(0, 0, W, H);
    for (const p of this.parts) { g.fillStyle = p.c; g.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), 2, 1 + ((p.ph * 10) | 0) % 2); }
    for (const f of this.fire) { const k = f.t / 1.6, r = 6 + k * 34; g.globalAlpha = 1 - k; g.fillStyle = f.c; for (let i = 0; i < f.n; i++) { const a = (i / f.n) * 6.283; g.fillRect(Math.round(f.x - cx + Math.cos(a) * r), Math.round(f.y - cy + Math.sin(a) * r + k * k * 20), 2, 2); } g.globalAlpha = 1; }
    // didascalie e dissolvenze
    const cap = (s, a, b) => { const k = Math.min((t - a) / 0.8, (b - t) / 0.8); if (k > 0) { g.globalAlpha = Math.min(1, k); text(g, s, W / 2, H - 30, '#fff4d0', { align: 'center', font: 'bold 11px monospace' }); g.globalAlpha = 1; } };
    cap('Augusta Imperialis è in festa.', this.tWalk0 + 0.5, this.tWalk0 + 6);
    cap('Il portatore della maschera sale alla Domus Imperiale.', this.tWalk0 + 6.5, this.tTurn0 - 0.5);
    cap('Gloria! Gloria al portatore della maschera!', this.tRoar0, this.tBow0 + 1);
    if (t < T_DARK) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = Math.min(1, t / 0.8) * Math.min(1, (T_DARK - t) / 0.8); text(g, 'Il Tempo si ricuce.', W / 2, H / 2 - 6, '#e8d8ff', { align: 'center', font: 'bold 14px monospace' }); text(g, 'La volpe torna a casa.', W / 2, H / 2 + 12, '#b8a8d8', { align: 'center' }); g.globalAlpha = 1; }
    else if (t < T_DARK + T_FADE) { g.fillStyle = `rgba(0,0,0,${1 - smooth((t - T_DARK) / T_FADE)})`; g.fillRect(0, 0, W, H); }
    if (t > this.tEnd0 + T_END - 3) { g.fillStyle = `rgba(255,248,226,${Math.min(1, (t - (this.tEnd0 + T_END - 3)) / 3)})`; g.fillRect(0, 0, W, H); }
  }
  drawPerson(g, e, cx, cy, t) {
    if (e.hero) {
      const x = Math.round(this.pos.x - cx), y = Math.round(this.pos.y - cy), bow = t > this.tBow0 && t < this.tEnd0 ? Math.sin(Math.min(1, (t - this.tBow0) / T_BOW) * Math.PI) : 0;
      g.save(); g.translate(x, y); g.rotate(bow * 0.55); drawPlayerSprite(g, 0, bow * 1.5, this.look, this.dir, Math.floor((this.walk || 0))); g.restore();
      if (t > this.tTurn0 && t < this.tBow0) { g.fillStyle = 'rgba(255,230,150,.18)'; g.beginPath(); g.arc(x, y - 12, 20 + Math.sin(t * 4) * 2, 0, 6.283); g.fill(); }
      return;
    }
    const c = e.c, on = t > this.tWalk0 - 0.3, hop = on ? Math.max(0, Math.sin(t * (4 + c.jump * 3) + c.ph)) * 3 * c.jump * (t > this.tRoar0 ? 1.6 : 1) : 0, x = Math.round(c.x - cx), y = Math.round(c.y - cy - hop);
    drawHumanoid(g, x, y, c.look, 0, Math.floor(t * 4 + c.ph) & 1, {});
    if (on) { const w = Math.sin(t * 9 + c.ph) > 0; g.fillStyle = c.look.skin; g.fillRect(x - 6, y - 24 - (w ? 2 : 0), 2, 6); g.fillRect(x + 4, y - 24 - (w ? 0 : 2), 2, 6); }
  }
}
