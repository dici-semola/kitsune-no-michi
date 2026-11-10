import { Entity } from './Entity.js';
import { drawProp } from '../engine/Sprites.js';
import { check } from '../systems/Script.js';
import { text } from '../engine/UI.js';
import { ITEMS } from '../data/items.js';

// Oggetti interattivi della mappa: cartelli, forzieri, sigilli/indovinelli, console, oggetti da raccogliere.
export class Prop extends Entity {
  constructor(def, x, y) {
    const bw = def.w || 14, bh = def.h || 8; super(x - (bw - 14) / 2, y - (bh - 8), bw, bh);   // decorazioni larghe (statue, torii): il centro resta sul tile
    this.def = def; this.isProp = true;
    this.sprite = def.type === 'item' && def.item && def.sprite !== 'cat' ? 'pk:' + def.item : def.sprite || def.type;   // i raccoglibili hanno uno sprite per ogni oggetto
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
    if (this.openT > 0) this.openT += dt; if (this.shakeT > 0) this.shakeT -= dt;
    if (this.def.life && (this.life = (this.life ?? this.def.life) - dt) <= 0) { this.dead = true; sc.spark(this.cx, this.cy - 6, '#ffffff', 8); return; } // tesoro evento: svanisce
    if (this.def.hideIf && check(this.def.hideIf, sc.state)) { this.dead = true; sc.spark(this.cx, this.cy, '#ffd860', 10); }
  }

  interact(sc) {
    const d = this.def, st = sc.state;
    switch (d.type) {
      case 'sign': this.shakeT = 0.3; sc.puff(this.cx, this.feetY - 8, '#e8d8b0', 2); sc.say('Cartello', d.text); break;
      case 'dlg': sc.startDialogue(d.dlg, this); break;
      case 'horse': sc.say('Cavallo', 'Il cavallo sbuffa. Ne puoi acquistare uno dallo stalliere Daigo.'); break;
      case 'chest': {
        if (this.opened) { sc.say('Forziere', 'È vuoto.'); break; }
        st.setFlag('chest:' + d.id); sc.audio.sfx('chest');
        this.openT = 0.0001; sc.pillar(this.cx, this.feetY - 4, d.secret ? '176,138,255' : '255,232,160', 50, 1.0); sc.sparkleUp(this.cx, this.feetY - 8, '#ffe080', 10, 8); if (d.gold) sc.coinBurst(this.cx, this.feetY - 8, 6);
        if (d.gold) { st.inv.gold += d.gold; sc.toast(`+${d.gold} monete`); }
        for (const [id, n] of d.loot || []) st.give(id, n);
        if (d.note) sc.say('Forziere', d.note);
        sc.spark(this.cx, this.cy - 6, '#ffd860', 8);
        break;
      }
      case 'item':
        st.give(d.item, 1); this.dead = true; sc.flyItem(this.cx, this.feetY - 6, d.sprite === 'ore' ? '#ffe080' : d.sprite === 'cat' ? '#e8a850' : '#9affb0'); break;
      case 'rune': case 'clue': case 'heart': case 'horn': sc.limboInteract(this); break;
      case 'shrine': {
        st.hp = st.maxHp; st.ki = st.maxKi; st.buffs = st.buffs.filter((b) => b.stat === 'revive');
        st.respawn = { map: sc.mapId, anchor: 'shrine_' + d.id };
        sc.autosave(); sc.spark(this.cx, this.cy - 8, '#ffe8a0', 14); sc.ring(this.cx, this.cy, 30, '#ffe8a0');
        sc.toast('Santuario: PV e Ki ripristinati. Punto di rinascita salvato.');
        sc.audio?.sfx('shrine');
        sc.pillar(this.cx, this.feetY - 2, '255,232,160', 70, 1.4); sc.petals(this.cx, this.feetY - 6); sc.sparkleUp(this.cx, this.feetY - 8, '#ffe8a0', 12, 10);
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
    const sh = this.shakeT > 0 ? Math.round(Math.sin(this.shakeT * 60) * 1.5) : 0, op = this.opened ? (this.openT > 0 ? Math.min(1, this.openT / 0.35) : 1) : 0;   // il cartello trema, il coperchio si alza piano
    drawProp(g, this.sprite, x + sh, y, this.t, op);
    if (this.def.type === 'item' || (this.def.type === 'chest' && !this.opened)) {
      text(g, '·', x - 1, y - 20 - Math.sin(this.t * 4) * 2, '#ffe080');
    }
  }
}
export { ITEMS };
