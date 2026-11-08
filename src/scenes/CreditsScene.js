import { W, H } from '../core/Game.js';
import { text } from '../engine/UI.js';

const LINES = [
  ['KITSUNE NO MICHI', 'title'], ['La Via della Volpe', 'sub'], '',
  'Il Re Senza Tempo è caduto.', 'Il Filo del Destino è di nuovo intero,', 'e un\'alba nuova sorge su Hinomoto.', '',
  'Ad Hinomura, Genzō accende una lanterna per ogni anima ritrovata.', 'Ad Aurelburg, Ottokar giura di non toccare mai più una macchina del tempo.',
  'A Neo-Edo, le luci al neon tremano... e poi si fanno più calde.', 'Rin guarda il cielo: per la prima volta, è lo stesso di ieri.', '',
  ['— Il mondo resta aperto —', 'sub'],
  'Esplora ogni bioma, completa le missioni, sconfiggi ogni boss,', 'riempi il bestiario, trova ogni forziere.', 'I mostri torneranno: la strada della volpe non finisce mai.', '',
  ['Grazie per aver giocato', 'title'], '', '[Invio] per continuare',
];

export class CreditsScene {
  constructor(o) { this.o = o; this.y = H + 10; this.t = 0; }
  enter() { this.game.audio.play('credits'); }
  update(dt) {
    this.t += dt; this.y -= dt * (this.game.input.held('down') ? 80 : 22);
    const end = this.y + LINES.length * 14 < 30;
    if (end || (this.t > 3 && this.game.input.pressed('cancel'))) this.finish();
    if (this.t > 3 && this.game.input.pressed('confirm') && end) this.finish();
  }
  finish() { if (this.done) return; this.done = true; this.game.scenes.pop(); this.o.onEnd?.(); }
  render(g) {
    g.fillStyle = '#07040e'; g.fillRect(0, 0, W, H);
    // stelle
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * ((i * 37 + Math.floor(this.t * 2)) % 5) / 5})`; g.fillRect((i * 97) % W, (i * 53) % H, 1, 1); }
    LINES.forEach((l, i) => {
      const y = this.y + i * 14;
      if (y < -14 || y > H) return;
      if (Array.isArray(l)) text(g, l[0], W / 2, y, l[1] === 'title' ? '#ffd0a0' : '#c8a8e0', { align: 'center', font: l[1] === 'title' ? 'bold 14px monospace' : 'bold 9px monospace' });
      else text(g, l, W / 2, y, '#e8e0f0', { align: 'center' });
    });
  }
}
