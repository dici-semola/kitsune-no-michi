import { W, H } from '../core/Game.js';
import { DIALOGUES } from '../data/dialogues.js';
import { check, run } from '../systems/Script.js';
import { panel, text, wrap, nav } from '../engine/UI.js';

// Sostituisce nome e parole accordate al sesso del protagonista
export function fill(s, st) {
  const f = st.look?.gender === 1;
  return s.replaceAll('{name}', st.name).replaceAll('{figliolo}', f ? 'figliola' : 'figliolo').replaceAll('{ragazzo}', f ? 'ragazza' : 'ragazzo')
    .replaceAll('{piccolo}', f ? 'piccola' : 'piccolo').replaceAll('{giovane}', 'giovane').replaceAll('{caro}', f ? 'cara' : 'caro').replaceAll('{o}', f ? 'a' : 'o');
}

// Sistema di dialogo testuale a grafo con scelte, condizioni ed effetti (vedi data/dialogues.js).
export class DialogueScene {
  constructor(o) { this.o = o; this.overlay = true; this.after = []; this.t = 0; }

  enter() {
    const st = this.game.state, o = this.o;
    this.dlg = typeof o.dlg === 'string' ? DIALOGUES[o.dlg] || DIALOGUES.default : o.dlg;
    if (o.npc?.id) this.game.bus.emit('talk', { npc: o.npc.id }); // le quest possono avanzare/completarsi qui
    const s = this.dlg.start.find((e) => check(e.if, st)) || this.dlg.start[this.dlg.start.length - 1];
    this.go(s.go);
  }

  ctx(immediate) {
    return { state: this.game.state, bus: this.game.bus, scene: this.o.scene, defer: (f) => (immediate ? f() : this.after.push(f)) };
  }

  go(id) {
    const n = this.dlg.nodes[id];
    if (!n) { this.close(); return; }
    this.node = n;
    this.pages = (Array.isArray(n.t) ? n.t : [n.t]).map((s) => fill(s, this.game.state));
    this.pi = 0; this.ch = 0; this.sel = 0;
    run(n.fx, this.ctx(false));
    this.choices = (n.choices || []).filter((c) => check(c.if, this.game.state));
  }

  close() {
    this.game.scenes.pop();
    this.o.onEnd?.();
    for (const f of this.after) f();
  }

  update(dt) {
    const inp = this.game.input;
    this.t += dt;
    const before = Math.floor(this.ch);
    this.ch += dt * 70;
    if (Math.floor(this.ch) > before && Math.floor(this.ch / 2) !== Math.floor(before / 2) && this.ch < this.pages[this.pi].length) inp.audio?.sfx('blip', (this.node.s || '').length % 5);
    const page = this.pages[this.pi], full = this.ch >= page.length, last = this.pi === this.pages.length - 1;
    if (full && last && this.choices.length) this.sel = nav(inp, this.choices.length, this.sel);
    if (!inp.pressed('confirm')) return;
    inp.audio?.sfx('confirm');
    if (!full) { this.ch = page.length; return; }
    if (!last) { this.pi++; this.ch = 0; return; }
    if (this.choices.length) {
      const c = this.choices[this.sel];
      run(c.fx, this.ctx(!!c.next)); // se il dialogo prosegue, negozi/teletrasporti partono subito
      if (c.next) this.go(c.next); else this.close();
      return;
    }
    if (this.node.next) this.go(this.node.next); else this.close();
  }

  render(g) {
    const x = 10, y = H - 86, w = W - 20, h = 80;
    panel(g, x, y, w, h);
    if (this.node.s) {
      panel(g, x + 8, y - 11, Math.max(60, this.node.s.length * 5 + 14), 14);
      text(g, this.node.s, x + 14, y - 8, '#ffd0a0');
    }
    const page = this.pages[this.pi];
    let rem = Math.floor(this.ch);
    wrap(g, page, w - 24).forEach((ln, i) => {
      if (rem > 0) text(g, ln.slice(0, rem), x + 12, y + 10 + i * 11, '#fff');
      rem -= ln.length + 1;
    });
    const full = this.ch >= page.length, last = this.pi === this.pages.length - 1;
    if (full && last && this.choices.length) {
      const cw = Math.max(...this.choices.map((c) => c.t.length)) * 5 + 28, ch = this.choices.length * 12 + 10;
      panel(g, W - 10 - cw, y - ch - 4, cw, ch);
      this.choices.forEach((c, i) => {
        const on = i === this.sel;
        if (on) { g.fillStyle = 'rgba(200,40,58,.55)'; g.fillRect(W - 8 - cw, y - ch + 1 + i * 12, cw - 4, 12); }
        text(g, (on ? '▶ ' : '  ') + c.t, W - 6 - cw, y - ch + 3 + i * 12, on ? '#fff' : '#d8c8b0');
      });
    } else if (full && Math.floor(this.t * 3) % 2 === 0) text(g, '▼', x + w - 16, y + h - 14, '#ffd0a0');
  }
}
