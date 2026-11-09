import { W, H } from '../core/Game.js';
import { text } from '../engine/UI.js';

export class DeathScene {
  constructor(o) { this.o = o; this.overlay = true; this.t = 0; }
  enter() { this.game.audio.play(null); this.game.audio.sfx('death'); }
  update(dt) {
    this.t += dt;
    if (this.t > 1.2 && this.game.input.pressed('confirm')) { this.game.scenes.pop(); this.o.onRetry(); }
  }
  render(g) {
    g.fillStyle = `rgba(40,0,10,${Math.min(0.85, this.t * 0.8)})`; g.fillRect(0, 0, W, H);
    if (this.t > 0.6) {
      text(g, this.game.state.look.gender ? 'Sei stata sconfitta' : 'Sei stato sconfitto', W / 2, H / 2 - 16, '#ff6070', { align: 'center', font: 'bold 16px monospace' });
      const o = this.o;
      if (o.limbo) { text(g, 'La terza morte. La tua anima scivola fuori dal mondo…', W / 2, H / 2 + 10, '#c8d0ff', { align: 'center' }); text(g, 'LIMBO', W / 2, H / 2 + 24, '#fff', { align: 'center', font: 'bold 12px monospace' }); }
      else if (o.inLimbo) text(g, 'Anche nel Limbo si può cadere: ricomincia dalla Soglia (la prova resta).', W / 2, H / 2 + 10, '#c8d0ff', { align: 'center' });
      else { text(g, 'Il Filo ti riporta all\'ultimo luogo sicuro (−10% monete).', W / 2, H / 2 + 10, '#e8c8c8', { align: 'center' }); if (o.deaths) text(g, `Anime perdute: ${o.deaths}/3 — alla terza, il Limbo ti reclama.`, W / 2, H / 2 + 22, o.deaths >= 2 ? '#ffb0b0' : '#c8a8a8', { align: 'center' }); }
    }
    if (this.t > 1.2) text(g, '[Invio] Riprova', W / 2, H / 2 + 30, '#fff', { align: 'center' });
  }
}
