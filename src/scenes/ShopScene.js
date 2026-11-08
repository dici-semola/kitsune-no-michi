import { W, H } from '../core/Game.js';
import { ITEMS, SHOPS, SLOTS } from '../data/items.js';
import { check } from '../systems/Script.js';
import { panel, text, list, nav, wrap } from '../engine/UI.js';
import { drawItemIcon } from '../engine/Sprites.js';

const SELL_RATE = 0.4;

// Mercati, fabbri, farmacie: compra e vendi. I prezzi di vendita sono il 40% del valore.
export class ShopScene {
  constructor(o) { this.o = o; this.overlay = true; this.mode = 0; this.sel = 0; this.msg = ''; }
  enter() { this.shop = SHOPS[this.o.shopId]; }

  rows() {
    const st = this.game.state;
    if (this.mode === 0) {
      return this.shop.stock.filter(([, , c]) => check(c, st)).map(([id, price]) => ({ id, price: price ?? ITEMS[id].price }));
    }
    return Object.keys(st.inv.items)
      .filter((id) => ITEMS[id].cat !== 'story' && !st.inv.isEquipped(id) && Math.floor(ITEMS[id].price * SELL_RATE) > 0)
      .map((id) => ({ id, price: Math.floor(ITEMS[id].price * SELL_RATE), n: st.inv.count(id) }));
  }

  update() {
    const inp = this.game.input, st = this.game.state;
    if (inp.pressed('cancel')) { inp.audio?.sfx('back'); this.game.scenes.pop(); return; }
    if (inp.pressed('left') || inp.pressed('right')) { this.mode ^= 1; this.sel = 0; this.msg = ''; }
    const rows = this.rows();
    if (this.sel >= rows.length) this.sel = Math.max(0, rows.length - 1);
    if (rows.length) this.sel = nav(inp, rows.length, this.sel);
    if (!inp.pressed('confirm') || !rows.length) return;
    const r = rows[this.sel], def = ITEMS[r.id];
    if (this.mode === 0) {
      if (def.cat === 'gear' && st.inv.has(r.id)) this.msg = 'Lo possiedi già.';
      else if (st.inv.gold < r.price) this.msg = 'Monete insufficienti.';
      else if (st.give(r.id, 1) > 0) { st.inv.gold -= r.price; this.msg = `Acquistato: ${def.n}`; inp.audio?.sfx('coin'); }
      else this.msg = 'Inventario pieno.';
    } else {
      inp.audio?.sfx('coin'); st.inv.remove(r.id, 1); st.inv.gold += r.price; this.msg = `Venduto: ${def.n} (+${r.price})`;
    }
  }

  render(g) {
    const st = this.game.state, rows = this.rows();
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, H);
    panel(g, 20, 14, W - 40, H - 28);
    text(g, this.shop.n, 34, 22, '#ffd0a0', { font: 'bold 10px monospace' });
    text(g, `¥ ${st.inv.gold}`, W - 34, 22, '#ffd860', { align: 'right' });
    text(g, (this.mode === 0 ? '[ COMPRA ]  vendi' : ' compra  [ VENDI ]') + '    ←/→ cambia   Invio conferma   Esc esci', 34, 36, '#a8a0b8');
    if (!rows.length) text(g, 'Niente da mostrare.', 40, 60, '#999');
    list(g, rows, this.sel, 30, 54, 226, 13, 14, (r, x, y, on) => {
      drawItemIcon(g, ITEMS[r.id], x, y);
      const afford = this.mode === 1 || st.inv.gold >= r.price;
      text(g, ITEMS[r.id].n + (r.n ? ` x${r.n}` : ''), x + 14, y + 1, afford ? (on ? '#fff' : '#e8dcc8') : '#8a7a7a');
      text(g, `${r.price}¥`, x + 218, y + 1, afford ? '#ffd860' : '#7a6a3a', { align: 'right' });
    });
    if (rows[this.sel]) {
      const def = ITEMS[rows[this.sel].id], x = 270;
      text(g, def.n, x, 56, '#fff', { font: 'bold 9px monospace' });
      wrap(g, def.desc, 170).forEach((ln, i) => text(g, ln, x, 70 + i * 10, '#d8c8b0'));
      let y = 104;
      if (def.use?.hp) text(g, `Cura ${def.use.hp} PV`, x, (y += 11), '#ff9090');
      if (def.use?.ki) text(g, `Ki +${def.use.ki}`, x, (y += 11), '#90b0ff');
      if (def.slot) {
        text(g, `Slot: ${def.slot}`, x, (y += 11), '#aaa');
        for (const [k, l] of [['atk', 'ATT'], ['def', 'DIF'], ['hp', 'PV'], ['ki', 'KI']]) if (def[k]) text(g, `${l} +${def[k]}`, x, (y += 11), '#a0e8a0');
        const cur = st.inv.equip[def.slot] && ITEMS[st.inv.equip[def.slot]];
        if (cur) text(g, `Equipaggiato: ${cur.n}`, x, (y += 13), '#888');
      }
      text(g, `Possiedi: ${st.inv.count(def.id)}`, x, H - 52, '#aaa');
    }
    text(g, this.msg, 34, H - 34, '#ffe8b0');
    void SLOTS;
  }
}
