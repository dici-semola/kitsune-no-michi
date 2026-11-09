import { W, H } from '../core/Game.js';
import { text, nav, panel } from '../engine/UI.js';
import { Save } from '../systems/GameState.js';
import { SlotScene } from './SlotScene.js';
import { CreatorScene } from './CreatorScene.js';
import { WorldScene } from './WorldScene.js';

export class TitleScene {
  constructor() { this.sel = 0; this.t = 0; this.help = false; this.petals = Array.from({ length: 40 }, (_, i) => ({ x: (i * 53) % W, y: (i * 31) % H, s: 0.5 + (i % 5) / 5 })); }
  enter() { this.game.audio.play('title'); }
  items() { return Save.any() ? ['Nuova partita', 'Continua', 'Importa salvataggio', 'Comandi'] : ['Nuova partita', 'Importa salvataggio', 'Comandi']; }
  update(dt) {
    const inp = this.game.input, items = this.items();
    this.t += dt;
    for (const p of this.petals) { p.y += 14 * p.s * dt; p.x += Math.sin(this.t + p.s * 6) * 8 * dt; if (p.y > H) { p.y = -4; p.x = Math.random() * W; } }
    if (this.help) { if (inp.pressed('confirm') || inp.pressed('cancel')) this.help = false; return; }
    this.sel = nav(inp, items.length, this.sel);
    if (!inp.pressed('confirm')) return;
    this.game.input.audio?.sfx('confirm');
    const it = items[this.sel];
    if (it === 'Nuova partita') this.game.scenes.replace(new CreatorScene());
    else if (it === 'Continua') this.game.scenes.push(new SlotScene({ mode: 'load', onPick: (slot) => {
      const s = Save.read(this.game.resetBus(), slot);
      if (s) { this.game.state = s; this.game.scenes.replace(new WorldScene(), { mapId: s.map, pos: s.pos }); }
    } }));
    else if (it === 'Importa salvataggio') importSave(this.game, (s) => { this.game.state = s; this.game.scenes.replace(new WorldScene(), { mapId: s.map, pos: s.pos }); });
    else this.help = true;
  }
  render(g) {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#1a0a2e'); gr.addColorStop(0.6, '#5a1a3a'); gr.addColorStop(1, '#c8402a');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // luna rossa
    g.fillStyle = '#ff5a40'; g.beginPath(); g.arc(360, 90, 46, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ff8a60'; g.beginPath(); g.arc(352, 82, 38, 0, Math.PI * 2); g.fill();
    // montagne e torii
    g.fillStyle = '#1a0a1e';
    g.beginPath(); g.moveTo(0, H); g.lineTo(0, 190); g.lineTo(70, 140); g.lineTo(140, 190); g.lineTo(210, 150); g.lineTo(300, 200); g.lineTo(380, 160); g.lineTo(480, 200); g.lineTo(480, H); g.fill();
    g.fillStyle = '#c8283a'; g.fillRect(60, 170, 6, 50); g.fillRect(104, 170, 6, 50); g.fillRect(52, 164, 66, 6); g.fillRect(58, 176, 54, 3);
    // maschera kitsune
    g.fillStyle = '#f6f2ea'; g.fillRect(222, 120, 36, 40); g.fillRect(218, 100, 12, 24); g.fillRect(250, 100, 12, 24);
    g.fillStyle = '#c8283a'; g.fillRect(218, 100, 12, 4); g.fillRect(250, 100, 12, 4); g.fillRect(226, 134, 10, 3); g.fillRect(244, 134, 10, 3); g.fillRect(236, 148, 8, 3);
    for (const p of this.petals) { g.fillStyle = 'rgba(255,170,190,.8)'; g.fillRect(p.x, p.y, 2, 2); }
    text(g, 'KITSUNE NO MICHI', W / 2, 24, '#ffe8d0', { align: 'center', font: 'bold 22px monospace' });
    text(g, 'La Via della Volpe — RPG d\'avventura', W / 2, 52, '#f0c8d0', { align: 'center' });
    if (this.help) return this.renderHelp(g);
    const items = this.items();
    items.forEach((it, i) => {
      const on = i === this.sel, y = 190 + i * 16;
      text(g, (on ? '▶ ' : '  ') + it, W / 2, y, on ? '#fff' : '#e8c8d0', { align: 'center', font: on ? 'bold 10px monospace' : '9px monospace' });
    });
  }
  renderHelp(g) {
    panel(g, 90, 70, 300, 150);
    const L = ['WASD / Frecce  Muoversi', 'J / Spazio  Attacco katana (combo a 3 colpi)', 'K / Shift  Scatto (Dash)', 'L  Soffio di fuoco', 'H  Fiamma Nera',
      'E / Invio  Parla e interagisci', 'M  Monta / smonta', 'F  Cura rapida', 'I / Tab  Menu    Esc  Sistema/Salva', '?debug nell\'URL: F1 cheat, F2 mappa, F3 god'];
    L.forEach((l, i) => text(g, l, 104, 82 + i * 13, '#f0e0d0'));
  }
}

// Importa un file di salvataggio (.json) scelto dall'utente
export function importSave(game, done) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => { const f = inp.files[0]; if (!f) return; f.text().then((t) => { const s = Save.importText(game.resetBus(), t); if (s) { Save.write(s, 'auto'); done(s); } else game.bus.emit('toast', 'File di salvataggio non valido.'); }); };
  inp.click();
}
