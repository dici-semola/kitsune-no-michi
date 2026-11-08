import { ITEMS, CATS, SLOTS, RECIPES } from '../data/items.js';

const CAPS = { food: 30, potion: 30, gear: 40, material: 50, story: Infinity }; // slot distinti per categoria
const STACK = 99;

export class Inventory {
  constructor() {
    this.items = {};
    this.gold = 60;
    this.equip = { weapon: null, bow: null, armor: null, mask: null, charm: null, suit: null };
    for (const [slot, id] of [['weapon', 'katana_starter'], ['armor', 'kimono_tradizionale'], ['mask', 'maschera_kitsune']]) {
      this.items[id] = 1; this.equip[slot] = id;
    }
  }
  count(id) { return this.items[id] || 0; }
  has(id, n = 1) { return this.count(id) >= n; }
  distinct(cat) { return Object.keys(this.items).filter((id) => ITEMS[id].cat === cat).length; }

  // Ritorna la quantità effettivamente aggiunta (0 se pieno).
  add(id, n = 1) {
    const def = ITEMS[id];
    if (!def) throw new Error('Oggetto sconosciuto: ' + id);
    if (!this.items[id] && this.distinct(def.cat) >= CAPS[def.cat]) return 0;
    const added = Math.min(n, (def.cap || STACK) - this.count(id));
    if (added > 0) this.items[id] = this.count(id) + added;
    return added;
  }
  remove(id, n = 1) {
    if (this.count(id) < n) return false;
    this.items[id] -= n;
    if (this.items[id] <= 0) {
      delete this.items[id];
      for (const s of SLOTS) if (this.equip[s] === id) this.equip[s] = null;
    }
    return true;
  }
  list(cat) {
    return Object.keys(this.items).filter((id) => ITEMS[id].cat === cat)
      .map((id) => ({ id, n: this.items[id], def: ITEMS[id] }))
      .sort((a, b) => a.def.n.localeCompare(b.def.n));
  }

  equipItem(id) {
    const def = ITEMS[id];
    if (!def?.slot || !this.has(id)) return false;
    this.equip[def.slot] = id;
    return true;
  }
  unequip(slot) { this.equip[slot] = null; }
  isEquipped(x) {
    if (SLOTS.includes(x)) return !!this.equip[x];
    return SLOTS.some((s) => this.equip[s] === x);
  }
  bonus(stat) {
    let v = 0;
    for (const s of SLOTS) { const id = this.equip[s]; if (id) v += ITEMS[id][stat] || 0; }
    return v;
  }
  bow() { return ITEMS[this.equip.bow] || null; }
  weapon() { return ITEMS[this.equip.weapon] || { atk: 2, reach: 18, spd: 1 }; }

  canCraft(r) { return Object.entries(r.in).every(([id, n]) => this.has(id, n)); }
  craft(r) {
    if (!this.canCraft(r)) return false;
    const def = ITEMS[r.out];
    if (!this.items[r.out] && this.distinct(def.cat) >= CAPS[def.cat]) return false;
    for (const [id, n] of Object.entries(r.in)) this.remove(id, n);
    this.add(r.out, r.n);
    return true;
  }
  recipes() { return RECIPES; }

  serialize() { return { items: this.items, gold: this.gold, equip: this.equip }; }
  restore(d) { this.items = { ...d.items }; this.gold = d.gold; this.equip = { ...this.equip, ...d.equip }; }
}

export { CATS };
