import { Entity } from './Entity.js';
import { drawHumanoid } from '../engine/Sprites.js';
import { memorable } from '../engine/NpcLooks.js';
import { text } from '../engine/UI.js';
import { dist } from '../core/Util.js';
import { check } from '../systems/Script.js';

// Ogni NPC ha uno o più "quirk": animazioni e comportamenti che ne definiscono la personalità.
// update(n,dt,sc,p,near) / lift(n) / under(n,g,x,y,sc) / over(n,g,x,y,sc)
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const tick = (n, key, dt, every) => { n.q[key] = (n.q[key] || 0) + dt; if (n.q[key] >= every) { n.q[key] = 0; return true; } return false; };

const QUIRKS = {
  smoke: { over(n, g, x, y) { for (let i = 0; i < 4; i++) { const k = (n.t * 0.5 + i / 4) % 1; R(g, `rgba(220,220,230,${0.7 - k * 0.7})`, x + 9 + Math.round(Math.sin(k * 8 + i) * 2), y - 6 - Math.round(k * 22), 2, 2); } R(g, '#8a4a2a', x + 8, y - 5, 3, 3); } },
  hammer: {
    update(n, dt, sc) { const ph = (n.t % 1.3) / 1.3; if (ph > 0.32 && !n.q.hit) { n.q.hit = 1; sc.spark(n.cx + 9, n.cy - 1, '#ffb040', 4); sc.audio.sfx('hit'); } if (ph < 0.32) n.q.hit = 0; },
    over(n, g, x, y) { const ph = (n.t % 1.3) / 1.3, a = ph < 0.32 ? -2.2 + (ph / 0.32) * 2.4 : 0.2 - (ph - 0.32) * 0.3; g.save(); g.translate(x + 6, y - 14); g.rotate(a); R(g, '#8a6a3a', 0, -1, 9, 2); R(g, '#9aa0b0', 8, -3, 5, 6); g.restore(); R(g, '#555', x + 8, y - 3, 8, 3); },
  },
  chop: {
    update(n, dt, sc) { const ph = (n.t % 1.1) / 1.1; if (ph > 0.3 && !n.q.hit) { n.q.hit = 1; sc.spark(n.cx + 11, n.cy + 2, '#c8a060', 3); sc.audio.sfx('hit'); } if (ph < 0.3) n.q.hit = 0; },
    over(n, g, x, y) { const ph = (n.t % 1.1) / 1.1, a = ph < 0.3 ? -2.4 + (ph / 0.3) * 2.6 : 0.2; g.save(); g.translate(x + 6, y - 14); g.rotate(a); R(g, '#7a5a2a', 0, -1, 9, 2); R(g, '#c0c4d0', 7, -4, 4, 7); g.restore(); R(g, '#9a6a3a', x + 9, y - 4, 8, 4); R(g, '#d8b070', x + 9, y - 4, 2, 4); },
  },
  puff: { over(n, g, x, y) { for (let i = 0; i < 3; i++) { const k = (n.t * 0.8 + i / 3) % 1; R(g, `rgba(120,230,120,${0.8 - k * 0.8})`, x - 12 + Math.round(Math.sin(k * 6 + i) * 3), y - 8 - Math.round(k * 14), 3, 3); } R(g, '#a07040', x - 11, y - 6, 5, 3); } },
  steam: { over(n, g, x, y) { R(g, '#e8e0d0', x + 8, y - 8, 4, 4); for (let i = 0; i < 2; i++) { const k = (n.t * 0.9 + i / 2) % 1; R(g, `rgba(255,255,255,${0.8 - k * 0.8})`, x + 9 + i, y - 10 - Math.round(k * 10), 2, 2); } } },
  bubble: { // fumetto con frasi tipiche quando il giocatore è vicino
    update(n, dt, sc, p, near) {
      n.q.say = Math.max(0, (n.q.say || 0) - dt); n.q.gap = (n.q.gap || 2) - dt;
      if (near < 110 && n.q.gap <= 0 && n.def.shouts) { n.q.gap = 7; n.q.say = 3; n.q.line = n.def.shouts[Math.floor(Math.random() * n.def.shouts.length)]; }
    },
    over(n, g, x, y) {
      if (!(n.q.say > 0)) return;
      g.font = '8px monospace'; const w = Math.ceil(g.measureText(n.q.line).width) + 8;
      R(g, '#000', x - w / 2 - 1, y - 49, w + 2, 13); R(g, '#fffdf0', x - w / 2, y - 48, w, 11); R(g, '#fffdf0', x - 1, y - 38, 3, 3);
      text(g, n.q.line, x, y - 47, '#2a1a10', { align: 'center', shadow: false });
    },
  },
  patrol: { // ronda avanti e indietro; si ferma se ti avvicini
    update(n, dt, sc, p, near) {
      if (near < 44) { n.vx = n.vy = 0; return; }
      if (Math.abs(n.x - n.home.x) > 26) n.q.d = n.x > n.home.x ? -1 : 1;
      n.q.d ||= 1; n.vx = n.q.d * 14; n.vy = 0;
      const r = n.move(n.vx * dt, 0); if (r.hitX) n.q.d = -n.q.d;
      n.dir = n.q.d < 0 ? 2 : 3; n.walk += dt * 6;
    },
  },
  shy: { // i kodama fuggono se ti avvicini troppo
    update(n, dt, sc, p, near) { if (near < 62 && near > 3) { const dx = n.cx - p.cx, dy = n.cy - p.cy, l = Math.hypot(dx, dy) || 1; n.move((dx / l) * 30 * dt, (dy / l) * 30 * dt); n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); n.walk += dt * 6; } },
  },
  hop: { lift(n) { return Math.abs(Math.sin(n.t * 5)) * 3; } },
  hover: { lift(n) { return 3 + Math.sin(n.t * 2) * 1.5; } },
  glitch: { // Rin: viene dal futuro, l'immagine sfarfalla con residui ciano e magenta
    under(n, g, x, y, sc, draw) { const j = Math.floor(n.t * 14) % 3 - 1; g.globalAlpha = 0.35; g.save(); g.translate(j * 2, 0); draw('#2ee6ff', -2); g.restore(); g.save(); g.translate(-j * 2, 0); draw('#ff3fa4', 2); g.restore(); g.globalAlpha = 1; },
    alpha(n) { return 0.75 + 0.25 * Math.sin(n.t * 31) * Math.sin(n.t * 7); },
  },
  orb: { over(n, g, x, y) { const c = Math.floor(n.t * 6) % 3; R(g, ['#c090ff', '#80d0ff', '#ff90d0'][c], x + 7, y - 11, 5, 5); R(g, '#fff', x + 8, y - 10, 1, 1); for (let i = 0; i < 3; i++) R(g, '#fff', x + 5 + ((n.t * 20 + i * 5) % 9), y - 14 - ((n.t * 12 + i * 7) % 8), 1, 1); } },
  screen: { over(n, g, x, y) { R(g, 'rgba(10,30,40,.85)', x + 6, y - 36, 16, 10); for (let i = 0; i < 4; i++) R(g, i % 2 ? '#2ee6ff' : '#60ff90', x + 8, y - 34 + i * 2, 3 + ((Math.floor(n.t * 8) + i * 3) % 10), 1); R(g, '#2ee6ff', x + 6, y - 36, 16, 1); } },
  robot: { update(n, dt, sc) { if (tick(n, 'st', dt, 3.2)) sc.spark(n.cx + 6, n.cy - 12, '#dde', 3); }, over(n, g, x, y) { R(g, Math.floor(n.t * 2) % 2 ? '#ff4060' : '#60ff90', x - 1, y - 33, 2, 2); } },
  orbit: {
    over(n, g, x, y) { const cols = n.def.orbit || ['#8ae8ff']; cols.forEach((c, i) => { const a = n.t * 1.6 + (i / cols.length) * 6.283; R(g, c, x + Math.round(Math.cos(a) * 13) - 1, y - 18 + Math.round(Math.sin(a) * 5) - 1, 3, 3); }); },
  },
  sparks: { update(n, dt, sc) { if (tick(n, 'sp', dt, 1.4)) { sc.spark(n.cx + 9, n.cy - 4, '#8ae8ff', 4); sc.audio.sfx('zap'); } } },
  rod: { over(n, g, x, y) { g.strokeStyle = '#ddd'; g.beginPath(); g.moveTo(x + 7, y - 16); g.lineTo(x + 28, y - 28); g.lineTo(x + 28, y + 2 + Math.sin(n.t * 2) * 1); g.stroke(); R(g, '#c03030', x + 27, y + 1 + Math.sin(n.t * 2) * 1, 3, 3); R(g, '#8a6a3a', x + 7, y - 17, 10, 1); } },
  pole: { over(n, g, x, y) { const s = Math.sin(n.t * 1.5) * 3; R(g, '#7a5a3a', x + 8 + s, y - 26, 1, 26); R(g, '#7a5a3a', x + 7 + s, y - 27, 3, 1); } },
  mist: { under(n, g, x, y) { for (let i = 0; i < 3; i++) R(g, `rgba(200,210,230,${0.25 - i * 0.05})`, x - 12 + Math.round(Math.sin(n.t + i) * 4), y - 2 + i, 24 - i * 4, 2); } },
  brush: { over(n, g, x, y) { const s = Math.sin(n.t * 5) * 3; R(g, '#a08060', x + 8 + s, y - 12, 4, 2); R(g, '#e8d8a8', x + 11 + s, y - 12, 2, 2); } },
  salute: { over(n, g, x, y) { if (Math.floor(n.t / 3) % 3 === 0) { R(g, n.def.look.top, x + 5, y - 24, 3, 8); R(g, n.def.look.skin, x + 5, y - 26, 3, 2); } } },
  mug: { over(n, g, x, y) { const b = Math.abs(Math.sin(n.t * 3)) * 2; R(g, '#e8c040', x + 7, y - 14 - b, 4, 5); R(g, '#fff', x + 7, y - 15 - b, 4, 1); } },
};

export class NPC extends Entity {
  // quando il personaggio gli parla: si volta, fa un saltello e compare una bolla (! ? ♪ cuore secondo il carattere)
  react(p) {
    const dx = p.cx - this.cx, dy = p.cy - this.cy; this.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
    const kinds = ['!', '?', 'note', 'heart', '!']; let h = 0; for (let i = 0; i < this.id.length; i++) h = (h * 31 + this.id.charCodeAt(i)) | 0; this.em = { t: 1.4, kind: kinds[Math.abs(h) % kinds.length] }; this.hopT = 0.35;
  }
  constructor(id, def, x, y) {
    super(x, y, 10, 8);
    this.id = id; this.def = def; this.isNPC = true;
    this.home = { x, y }; this.dir = 0; this.walk = 0; this.wt = 0; this.vx = 0; this.vy = 0;
    this.wander = def.wander || 0; this.q = {}; this.hidden = false; this.light = null;
    this.quirks = (def.quirk || []).map((k) => QUIRKS[k]).filter(Boolean);
    this.look2 = def.spirit || !def.look ? def.look : memorable(id, def);   // tratti riconoscibili per ogni persona
  }
  update(dt, sc) {
    if (this.em) { this.em.t -= dt; if (this.em.t <= 0) this.em = null; } if (this.hopT > 0) this.hopT -= dt;
    super.update(dt);
    const p = this.world.player, near = p ? dist(this.cx, this.cy, p.cx, p.cy) : 999;
    // orari: i venditori ambulanti chiudono la bancarella di notte; le guardie accendono la lanterna
    const h = sc.state.hour;
    if (this.def.hideIf && check(this.def.hideIf, sc.state)) { this.dead = true; sc.spark(this.cx, this.cy - 8, '#e8f0ff', 10); return; } // anima in pace / enigma risolto
    if (this.def.life && (this.life = (this.life ?? this.def.life) - dt) <= 0) { this.dead = true; sc.spark(this.cx, this.cy - 8, '#ffffff', 8); return; } // mercante di passaggio
    if (this.def.nightOnly) this.hidden = !sc.atmo.isNight();
    this.solid = !this.hidden && this.def.solid !== false; // solid:false impostabile dal Map Editor
    if (this.def.hours) this.hidden = h < this.def.hours[0] || h >= this.def.hours[1];
    this.light = this.def.lantern && sc.state.isNight() ? { r: 46, c: '255,190,90' } : null;
    if (this.hidden) return;
    for (const k of this.quirks) k.update?.(this, dt, sc, p, near);
    if (this.def.quirk?.includes('patrol')) return;
    if (near < 40) { // si volta verso il giocatore
      const dx = p.cx - this.cx, dy = p.cy - this.cy;
      this.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
      this.vx = this.vy = 0;
      return;
    }
    if (!this.wander) return;
    this.wt -= dt;
    if (this.wt <= 0) {
      this.wt = 0.8 + Math.random() * 2;
      if (Math.random() < 0.5) { this.vx = this.vy = 0; } else {
        const a = Math.random() * Math.PI * 2;
        this.vx = Math.cos(a) * 18; this.vy = Math.sin(a) * 18;
      }
    }
    const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt;
    if (Math.hypot(nx - this.home.x, ny - this.home.y) > this.wander) { this.vx = -this.vx; this.vy = -this.vy; }
    if (this.vx || this.vy) {
      const r = this.move(this.vx * dt, this.vy * dt);
      if (r.hitX || r.hitY) { this.vx = -this.vx; this.vy = -this.vy; }
      this.dir = Math.abs(this.vx) > Math.abs(this.vy) ? (this.vx < 0 ? 2 : 3) : (this.vy < 0 ? 1 : 0);
      this.walk += dt * 6;
    }
  }
  interact(sc) {
    if (this.hidden) { sc.toast(`${this.def.n}: «Torno all'alba.»`); return; }
    sc.startDialogue(this.def.dialogue || this.id, this);
  }

  draw(g, cx, cy, sc) {
    const x = Math.round(this.cx - cx), y = Math.round(this.feetY - cy);
    if (this.hidden && this.def.spirit) return;
    if (this.hidden) { text(g, 'zZ', x - 4, y - 22 - Math.round(Math.sin(this.t * 2) * 2), '#9ab', { shadow: false }); return; } // bancarella chiusa
    let lift = 0;
    for (const k of this.quirks) if (k.lift) lift = Math.max(lift, k.lift(this));
    const look = this.def.spirit ? { ...this.def.look, ghost: 1, glow: this.def.look.glow || (this.def.kind === 'natura' ? '150,255,190' : this.def.kind === 'buona' ? '180,210,255' : '200,200,255') } : this.look2;
    const fr = Math.floor(this.walk), yy = Math.round(y - lift - (this.def.spirit ? 4 + Math.sin(this.t * 2) * 2 : 0) - (this.hopT > 0 ? Math.sin((1 - this.hopT / 0.35) * Math.PI) * 3 : 0));
    for (const k of this.quirks) k.under?.(this, g, x, yy, sc, (tint, dx) => drawHumanoid(g, x + dx, yy, { ...look, top: tint, bottom: tint, hair: tint, skin: tint }, this.dir, fr, look));
    const alpha = this.quirks.reduce((a, k) => (k.alpha ? k.alpha(this) : a), 1);
    g.globalAlpha = this.def.spirit ? alpha * (0.55 + 0.15 * Math.sin(this.t * 3)) : alpha;
    drawHumanoid(g, x, yy, look, this.dir, fr, look);
    if (this.em) {   // bolla di reazione sopra la testa, che rimbalza e svanisce
      const k = 1 - this.em.t / 1.4, by = yy - 46 - Math.round(Math.abs(Math.sin(k * 9)) * (k < 0.4 ? 3 : 0)), a = Math.min(1, this.em.t * 3); g.globalAlpha = a;
      R(g, '#14081a', x - 6, by - 1, 13, 12); R(g, '#fffdf0', x - 5, by, 11, 10); R(g, '#14081a', x - 1, by + 10, 3, 2); R(g, '#fffdf0', x, by + 10, 1, 1);
      const kd = this.em.kind;
      if (kd === '!') { R(g, '#e8505a', x - 1, by + 2, 2, 4); R(g, '#e8505a', x - 1, by + 7, 2, 2); }
      else if (kd === '?') { R(g, '#4a8ac8', x - 2, by + 2, 4, 1); R(g, '#4a8ac8', x + 1, by + 3, 2, 2); R(g, '#4a8ac8', x - 1, by + 5, 2, 1); R(g, '#4a8ac8', x - 1, by + 7, 2, 2); }
      else if (kd === 'note') { R(g, '#6a3a9a', x - 1, by + 2, 1, 5); R(g, '#6a3a9a', x - 3, by + 6, 3, 2); R(g, '#6a3a9a', x, by + 2, 3, 1); }
      else { R(g, '#e8505a', x - 3, by + 3, 3, 2); R(g, '#e8505a', x + 1, by + 3, 3, 2); R(g, '#e8505a', x - 3, by + 4, 7, 2); R(g, '#e8505a', x - 2, by + 6, 5, 1); R(g, '#e8505a', x - 1, by + 7, 3, 1); }
      g.globalAlpha = 1;
    }
    g.globalAlpha = 1;
    if (this.def.lantern) { R(g, '#4a3a2a', x - 9, yy - 12, 1, 4); R(g, this.light ? '#ffd070' : '#8a7a5a', x - 11, yy - 9, 4, 4); }
    for (const k of this.quirks) k.over?.(this, g, x, yy, sc);
    const m = sc?.state.quests.marker(this.id, sc.state);
    if (m) text(g, m, x - 2, yy - 40 - Math.abs(Math.sin(this.t * 4)) * 3, m === '!' ? '#ffe040' : '#60e0ff');
  }
}
