import { W, H } from '../core/Game.js';
import { panel, text, nav, list } from '../engine/UI.js';
import { Save, SLOTS_LIST } from '../systems/GameState.js';

const NAMES = { auto: 'Salvataggio automatico', s1: 'Slot 1', s2: 'Slot 2', s3: 'Slot 3' };
// Selezione dello slot di salvataggio: mode 'save' (solo slot manuali) o 'load'
export class SlotScene {
  constructor(o) { this.o = o; this.overlay = true; this.sel = 0; this.msg = ''; }
  get slots() { return this.o.mode === 'save' ? SLOTS_LIST.slice(1) : SLOTS_LIST.filter((s) => Save.peek(s) || (s === 'auto' && Save.legacy())); }
  update() {
    const inp = this.game.input, rows = this.slots;
    if (inp.pressed('cancel')) { inp.audio?.sfx('back'); this.game.scenes.pop(); return; }
    if (!rows.length) return;
    this.sel = nav(inp, rows.length, Math.min(this.sel, rows.length - 1));
    if (inp.pressed('confirm')) { inp.audio?.sfx('confirm'); const slot = rows[this.sel]; this.game.scenes.pop(); this.o.onPick(slot); }
  }
  render(g) {
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H);
    panel(g, 60, 40, W - 120, 190);
    text(g, this.o.mode === 'save' ? 'Salva partita' : 'Carica partita', 76, 50, '#ffd0a0', { font: 'bold 11px monospace' });
    const rows = this.slots;
    if (!rows.length) text(g, 'Nessun salvataggio trovato.', 76, 80, '#aaa');
    list(g, rows, this.sel, 70, 74, W - 140, 30, 5, (s, x, y, on) => {
      const m = Save.peek(s) || (s === 'auto' && Save.legacy() ? { name: '(vecchio salvataggio)', level: '?', map: '', play: 0 } : null);
      text(g, NAMES[s], x, y + 1, on ? '#fff' : '#e8dcc8');
      if (m) { text(g, `${m.name} · Lv ${m.level} · ${Math.floor((m.play || 0) / 60)} min${m.pct !== undefined ? ' · ' + m.pct + '%' : ''}`, x, y + 12, '#a8d8b8'); if (m.t) text(g, new Date(m.t).toLocaleString('it-IT').slice(0, 16), x + W - 150, y + 1, '#8a7a9a', { align: 'right' }); }
      else text(g, '— vuoto —', x, y + 12, '#777');
    });
    text(g, 'Invio conferma   Esc annulla', W / 2, 214, '#8a7a9a', { align: 'center' });
  }
}
