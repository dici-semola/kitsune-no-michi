import { Entity } from './Entity.js';
import { drawProp } from '../engine/Sprites.js';
import { check } from '../systems/Script.js';
import { text } from '../engine/UI.js';
import { ITEMS } from '../data/items.js';

// Oggetti interattivi della mappa: cartelli, forzieri, sigilli/indovinelli, console, oggetti da raccogliere.
export class Prop extends Entity {
  constructor(def, x, y) {
    super(x, y, 14, 8);
    this.def = def; this.isProp = true;
    this.sprite = def.sprite || def.type;
    this.solid = def.solid !== undefined ? !!def.solid : def.type !== 'item'; // `solid` può essere impostato dal Map Editor
  }
  get opened() {
    const t = this.def.type, sc = this.world.scene;
    if (t === 'chest') return sc.state.flags.has('chest:' + this.def.id);
    if (t === 'rune' || t === 'heart' || t === 'horn') return sc.limboLit(this);
    return false;
  }

  update(dt, sc) {
    super.update(dt);
    if (this.def.life && (this.life = (this.life ?? this.def.life) - dt) <= 0) { this.dead = true; sc.spark(this.cx, this.cy - 6, '#ffffff', 8); return; } // tesoro evento: svanisce
    if (this.def.hideIf && check(this.def.hideIf, sc.state)) { this.dead = true; sc.spark(this.cx, this.cy, '#ffd860', 10); }
  }

  interact(sc) {
    const d = this.def, st = sc.state;
    switch (d.type) {
      case 'sign': sc.say('Cartello', d.text); break;
      case 'dlg': sc.startDialogue(d.dlg, this); break;
      case 'horse': sc.say('Cavallo', 'Il cavallo sbuffa. Ne puoi acquistare uno dallo stalliere Daigo.'); break;
      case 'chest': {
        if (this.opened) { sc.say('Forziere', 'È vuoto.'); break; }
        st.setFlag('chest:' + d.id); sc.audio.sfx('chest');
        if (d.gold) { st.inv.gold += d.gold; sc.toast(`+${d.gold} monete`); }
        for (const [id, n] of d.loot || []) st.give(id, n);
        if (d.note) sc.say('Forziere', d.note);
        sc.spark(this.cx, this.cy - 6, '#ffd860', 8);
        break;
      }
      case 'item':
        st.give(d.item, 1); this.dead = true; break;
      case 'rune': case 'clue': case 'heart': case 'horn': sc.limboInteract(this); break;
      case 'shrine': {
        st.hp = st.maxHp; st.ki = st.maxKi; st.buffs = st.buffs.filter((b) => b.stat === 'revive');
        st.respawn = { map: sc.mapId, anchor: 'shrine_' + d.id };
        sc.autosave(); sc.spark(this.cx, this.cy - 8, '#ffe8a0', 14); sc.ring(this.cx, this.cy, 30, '#ffe8a0');
        sc.toast('Santuario: PV e Ki ripristinati. Punto di rinascita salvato.');
        sc.audio?.sfx('shrine');
        break;
      }
      case 'elevator': {
        const nodes = { a: { s: 'Ascensore', t: 'A quale piano vuoi andare?', choices: [...d.floors.map((f) => ({ t: f.n, fx: [['tp', f.to, f.anchor]] })), { t: 'Annulla' }] } };
        sc.startDialogue({ start: [{ go: 'a' }], nodes });
        break;
      }
    }
  }

  draw(g, cx, cy) {
    const x = Math.round(this.cx - cx), y = Math.round(this.feetY - cy);
    drawProp(g, this.sprite, x, y, this.t, this.opened);
    if (this.def.type === 'item' || (this.def.type === 'chest' && !this.opened)) {
      text(g, '·', x - 1, y - 20 - Math.sin(this.t * 4) * 2, '#ffe080');
    }
  }
}
export { ITEMS };
