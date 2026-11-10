import { W, H } from '../core/Game.js';
import { text } from '../engine/UI.js';
import { drawPlayerSprite } from '../engine/Sprites.js';

// Sequenza di rinascita: l'ambiente si illumina, una luce mistica avvolge l'anima, si intensifica, lo schermo si fa bianco,
// il giocatore viene trasportato nel mondo dei vivi e la luce si dirada. ~7 secondi, saltabile solo dopo il teletrasporto.
export class RebirthScene {
  constructor(o) { this.o = o; this.overlay = true; this.t = 0; this.tp = false; this.done = false; this.parts = Array.from({ length: 40 }, (_, i) => ({ a: i * 0.6, r: 30 + (i * 7) % 60, s: 12 + (i % 7) * 4 })); }
  enter() { this.game.audio.play(null); this.game.audio.sfx('rebirth'); }
  update(dt) {
    this.t += dt;
    const sc = this.o.sc;
    if (this.t > 4.6 && !this.tp) { this.tp = true; this.res = this.o.onTeleport(); this.game.audio.sfx('levelup'); }
    if (this.t > 7.2) { this.done = true; this.game.scenes.pop(); }
  }
  render(g) {
    const t = this.t, sc = this.o.sc, p = sc.player;
    const x = Math.round(p.cx - sc.cam.x), y = Math.round(p.cy - sc.cam.y);
    if (t < 4.6) {
      // 1) l'ambiente si illumina leggermente  2) luce mistica attorno al personaggio  3) intensità crescente
      const k1 = Math.min(1, t / 1.2), k2 = Math.max(0, Math.min(1, (t - 1) / 2.4)), k3 = Math.max(0, Math.min(1, (t - 3) / 1.6));
      g.fillStyle = `rgba(255,248,220,${0.16 * k1 + 0.1 * k3})`; g.fillRect(0, 0, W, H);
      const R = 18 + k2 * 70 + k3 * 90, gr = g.createRadialGradient(x, y - 10, 2, x, y - 10, R);
      gr.addColorStop(0, `rgba(255,255,255,${0.55 + 0.4 * k3})`); gr.addColorStop(0.5, `rgba(255,236,160,${0.35 * k2 + 0.3 * k3})`); gr.addColorStop(1, 'rgba(255,220,120,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      // colonna di luce e particelle che salgono
      g.fillStyle = `rgba(255,252,230,${0.25 * k2 + 0.3 * k3})`; g.fillRect(x - 5 - k3 * 6, 0, 10 + k3 * 12, y);
      for (const q of this.parts) { const yy = y - ((t * q.s + q.r) % 120), xx = x + Math.sin(q.a + t * 2) * (8 + k2 * 14); g.globalAlpha = 0.3 + 0.5 * k2; g.fillStyle = '#fff6c0'; g.fillRect(Math.round(xx), Math.round(yy), 2, 2); }
      g.globalAlpha = 1;
      // 4) animazione di rinascita: l'anima sale e si ricompone avvolta dalla luce
      if (t > 2.6) { const rise = Math.min(1, (t - 2.6) / 1.4); g.globalAlpha = 0.6; drawPlayerSprite(g, x, y - 6 - rise * 10, sc.state.look, 0, 0); g.globalAlpha = 1; for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(255,255,255,${0.6 - i * 0.15})`; g.beginPath(); g.arc(x, y - 10, 10 + ((t * 40 + i * 16) % 48), 0, 6.283); g.stroke(); } }
      // 5) lo schermo viene illuminato
      const f = Math.max(0, (t - 3.6) / 1.0); g.fillStyle = `rgba(255,255,255,${Math.min(1, f * f)})`; g.fillRect(0, 0, W, H);
    } else {
      // dopo il teletrasporto: schermo bianco che si dirada, titolo
      const k = Math.max(0, 1 - (t - 4.6) / 2.4);
      g.fillStyle = `rgba(255,255,255,${k})`; g.fillRect(0, 0, W, H);
      const a = Math.min(1, (t - 4.9) / 0.6) * Math.min(1, (7.2 - t) / 0.8);
      if (a > 0) { g.globalAlpha = a; text(g, 'RINASCITA', W / 2, H / 2 - 20, '#6a5a2a', { align: 'center', font: 'bold 18px monospace', shadow: false }); if (this.res) text(g, this.res.s.n, W / 2, H / 2 + 2, '#8a7a4a', { align: 'center', shadow: false }); g.globalAlpha = 1; }
    }
  }
}
