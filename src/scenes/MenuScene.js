import { W, H } from '../core/Game.js';
import { ITEMS, RECIPES, SLOTS, SLOT_NAMES, AMMO } from '../data/items.js';
import { QUESTS } from '../data/quests.js';
import { ABILITY_DEFS } from '../data/abilities.js';
import { ENEMIES } from '../data/enemies.js';
import { panel, text, list, nav, wrap, bar } from '../engine/UI.js';
import { drawItemIcon, drawPlayerSprite } from '../engine/Sprites.js';
import { Save, xpNeed, EXPLORE_CELL, GIFTS } from '../systems/GameState.js';
import { SlotScene } from './SlotScene.js';
import { importSave } from './TitleScene.js';
import { MAPS } from '../data/world.js';
import { DEFS } from '../data/tiles.js';
import { STATIONS } from '../data/crafting.js';
import { check } from '../systems/Script.js';
import { getMap, mapIds } from '../world/Generators.js';

const TABS = [['hero', 'Eroe'], ['food', 'Cibi'], ['potion', 'Pozio.'], ['gear', 'Equip.'], ['material', 'Mater.'], ['story', 'Trama'], ['craft', 'Craft'], ['quests', 'Miss.'], ['map', 'Mappa'], ['abil', 'Abilità'], ['extra', 'Extra'], ['sistema', 'Sistema']];
const STATS = [['atk', 'Attacco'], ['def', 'Difesa'], ['hp', 'PV max'], ['ki', 'Ki max'], ['reach', 'Portata'], ['spd', 'Velocità']];

// Menu principale: inventario per categoria, equipaggiamento, crafting, missioni, abilità, completismo, sistema.
export class MenuScene {
  constructor() { this.overlay = true; this.tab = 0; this.sel = 0; this.msg = ''; this.confirmTitle = false; this.imgs = {}; this.t = 0; }
  enter(p = {}) {
    this.scene = p.scene;
    if (p.tab) this.tab = TABS.findIndex((t) => t[0] === p.tab);
  }
  get key() { return TABS[this.tab][0]; }
  get st() { return this.game.state; }

  rows() {
    const st = this.st, k = this.key;
    switch (k) {
      case 'craft': return RECIPES.filter((r) => !r.unlock || this.st.recipesSeen.has(r.out) || check(r.unlock, this.st));
      case 'quests': return [...st.quests.ids('active'), ...st.quests.ids('done')];
      case 'hero': return [];
      case 'abil': return Object.values(ABILITY_DEFS);
      case 'map': return this.visitedMaps();
      case 'sistema': return ['Salva partita', 'Carica ultimo salvataggio', 'Torna al titolo', `Musica: ${this.game.audio.music ? 'sì' : 'no'}`, `Effetti sonori: ${this.game.audio.fx ? 'sì' : 'no'}`, `Controlli touch: ${{ auto: 'automatici', on: 'sempre', off: 'nascosti' }[this.game.touch?.mode || 'auto']}`, `Dimensione pulsanti: ${Math.round((this.game.touch?.scale || 1) * 100)}%`, 'Esporta salvataggio (file)', 'Importa salvataggio (file)', 'Chiudi'];
      case 'extra': return Object.keys(ENEMIES).filter((k) => st.kills[k]);
      default: return st.inv.list(k);
    }
  }

  update(dt) {
    this.t += dt || 0;
    const inp = this.game.input, st = this.st;
    if (inp.pressed('cancel')) { inp.audio?.sfx('back'); this.game.scenes.pop(); return; }
    if (inp.pressed('right') || inp.pressed('left')) inp.audio?.sfx('select');
    if (inp.pressed('right')) { this.tab = (this.tab + 1) % TABS.length; this.sel = 0; this.msg = ''; }
    if (inp.pressed('left')) { this.tab = (this.tab + TABS.length - 1) % TABS.length; this.sel = 0; this.msg = ''; }
    const rows = this.rows();
    if (this.sel >= rows.length) this.sel = Math.max(0, rows.length - 1);
    if (rows.length) this.sel = nav(inp, rows.length, this.sel);
    if (!inp.pressed('confirm') || !rows.length) return;
    inp.audio?.sfx('confirm');
    const r = rows[this.sel], k = this.key;
    if (k === 'potion' && r.def.bomb) {
      st.bombSel = r.id; this.msg = `Esplosivo selezionato: ${r.def.n} (lancia con Z)`;
    } else if (k !== 'craft' && r.def && r.def.use && r.def.use.camp) {
      this.msg = this.scene.campToggle();
    } else if (k === 'food' || k === 'potion') {
      const m = st.useItem(r.id);
      this.msg = m ? `${r.def.n}: ${m}` : 'Nessun effetto ora.';
    } else if (k === 'gear') {
      if (r.def.ammo) { st.ammoSel = AMMO.indexOf(r.id); this.msg = `Frecce selezionate: ${r.def.n}`; }
      else if (st.inv.isEquipped(r.id)) { st.inv.unequip(r.def.slot); this.msg = `Rimosso: ${r.def.n}`; }
      else { st.inv.equipItem(r.id); st.hp = Math.min(st.hp, st.maxHp); this.msg = `Equipaggiato: ${r.def.n}`; }
    } else if (k === 'craft') {
      if (r.station && !this.scene.nearStation(r.station)) { this.msg = `Serve un ${STATIONS[r.station]} vicino a te.`; return; }
      this.msg = st.inv.craft(r) ? (st.seen.add(r.out), `Creato: ${ITEMS[r.out].n}`) : 'Materiali insufficienti (o inventario pieno).';
    } else if (k === 'sistema') this.system(this.sel);
  }

  system(i) {
    const sc = this.scene, st = this.st;
    if (i !== 2) this.confirmTitle = false;
    if (i === 0) this.game.scenes.push(new SlotScene({ mode: 'save', onPick: (slot) => { sc.state.minutes = sc.atmo.minutes; this.msg = Save.write(sc.state, slot) ? 'Partita salvata.' : 'Salvataggio non riuscito (memoria piena?)'; } }));
    else if (i === 1) this.game.scenes.push(new SlotScene({ mode: 'load', onPick: (slot) => {
      const s = Save.read(this.game.resetBus(), slot);
      if (!s) { this.msg = 'Nessun salvataggio.'; return; }
      this.game.state = s;
      this.game.scenes.replace(new sc.constructor(), { mapId: s.map, pos: s.pos });
    } }));
    else if (i === 7) { // esporta: scarica un file JSON (o lo condivide dal telefono)
      sc.state.minutes = sc.atmo.minutes;
      const blob = new Blob([Save.exportText(sc.state)], { type: 'application/json' }), file = new File([blob], `kitsune-${sc.state.name}.json`, { type: 'application/json' });
      if (navigator.canShare?.({ files: [file] })) navigator.share({ files: [file], title: 'Salvataggio Kitsune no Michi' }).catch(() => {});
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
      this.msg = 'Salvataggio esportato.';
    } else if (i === 8) importSave(this.game, (s) => { this.game.state = s; this.game.scenes.replace(new sc.constructor(), { mapId: s.map, pos: s.pos }); });
    else if (i === 2) {
      if (!this.confirmTitle) { this.confirmTitle = true; this.msg = 'I progressi non salvati andranno persi. Premi di nuovo per confermare.'; return; }
      this.game.scenes.replace(new this.game.screens.Title());
    } else if (i === 3) this.game.audio.toggleMusic();
    else if (i === 4) this.game.audio.toggleFx();
    else if (i === 5) this.game.touch?.cycleMode();
    else if (i === 6) this.game.touch?.cycleScale();
    else this.game.scenes.pop();
    void st;
  }

  render(g) {
    const st = this.st;
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, 0, W, H);
    panel(g, 8, 8, W - 16, H - 16);
    TABS.forEach(([, n], i) => {
      const x = 10 + i * 38.5, on = i === this.tab;
      if (on) { g.fillStyle = 'rgba(200,40,58,.7)'; g.fillRect(x - 2, 12, 38, 12); }
      text(g, n, x, 14, on ? '#fff' : '#a898b0');
    });
    text(g, `Lv ${st.level}  PV ${Math.ceil(st.hp)}/${st.maxHp}  Ki ${Math.floor(st.ki)}/${st.maxKi}  ATT ${st.atk}  DIF ${st.def}  ¥${st.inv.gold}`, 16, H - 24, '#e8d8c0');
    text(g, '←/→ scheda   ↑/↓ scegli   Invio usa/equipa   Esc chiudi', W - 16, H - 24, '#8a7a9a', { align: 'right' });
    const rows = this.rows(), k = this.key, X2 = 238;
    if (k === 'hero') return this.renderHero(g);
    if (k === 'extra') return this.renderExtra(g, rows);
    if (k === 'map') return this.renderMap(g, rows);
    if (!rows.length) text(g, 'Vuoto.', 24, 40, '#888');
    list(g, rows, this.sel, 16, 34, 214, 13, 14, (r, x, y, on) => this.rowDraw(g, k, r, x, y, on));
    const r = rows[this.sel];
    if (r) this.detail(g, k, r, X2);
    text(g, this.msg, 16, H - 38, '#ffe8b0');
  }

  rowDraw(g, k, r, x, y, on) {
    const st = this.st, c = on ? '#fff' : '#e8dcc8';
    if (r.def) {
      drawItemIcon(g, r.def, x, y);
      text(g, r.def.n, x + 14, y + 1, c);
      text(g, st.inv.isEquipped(r.id) ? 'E' : `x${r.n}`, x + 204, y + 1, st.inv.isEquipped(r.id) ? '#80ff90' : '#aaa', { align: 'right' });
    } else if (k === 'craft') {
      const ok = st.inv.canCraft(r) && (!r.station || this.scene.nearStation(r.station));
      text(g, `${ITEMS[r.out].n}${r.n > 1 ? ' x' + r.n : ''}`, x + 2, y + 1, ok ? c : '#8a7a7a');
    } else if (k === 'quests') {
      const q = QUESTS[r], done = st.quests.status(r) === 'done';
      text(g, (done ? '✔ ' : q.main ? '★ ' : '• ') + q.title, x + 2, y + 1, done ? '#80a080' : c);
    } else if (k === 'abil') {
      text(g, (st.abilities.has(r.id) ? '✔ ' : '✖ ') + r.n, x + 2, y + 1, st.abilities.has(r.id) ? c : '#8a7a7a');
    } else text(g, r, x + 2, y + 1, c);
  }

  detail(g, k, r, x) {
    const st = this.st;
    if (r.def) {
      const d = r.def;
      text(g, d.n, x, 36, '#fff', { font: 'bold 9px monospace' });
      wrap(g, d.desc, 224).forEach((ln, i) => text(g, ln, x, 50 + i * 10, '#d8c8b0'));
      let y = 84;
      if (d.use?.hp) text(g, `Cura ${d.use.hp} PV`, x, (y += 11), '#ff9090');
      if (d.use?.ki) text(g, `Ki +${d.use.ki}`, x, (y += 11), '#90b0ff');
      if (d.use?.buff) text(g, `Potenziamento ${d.use.buff.dur}s`, x, (y += 11), '#e0c070');
      if (d.slot) {
        text(g, `${SLOT_NAMES[d.slot]}`, x, (y += 11), '#aaa');
        const cur = ITEMS[st.inv.equip[d.slot]];
        for (const [s, l] of STATS) {
          if (d[s] === undefined && !(cur && cur[s])) continue;
          const diff = (d[s] || 0) - (cur?.[s] || 0);
          text(g, `${l}: ${d[s] || 0}${cur && cur.id !== d.id ? (diff >= 0 ? `  (+${diff})` : `  (${diff})`) : ''}`, x, (y += 11), diff > 0 ? '#80ff90' : diff < 0 ? '#ff9090' : '#ddd');
        }
        if (d.suit) text(g, 'Consente di immergersi negli abissi', x, (y += 11), '#80d0ff');
      }
      if (d.price) text(g, `Valore: ${d.price}¥`, x, H - 52, '#aaa');
    } else if (k === 'craft') {
      const out = ITEMS[r.out];
      text(g, `${out.n}${r.n > 1 ? ' x' + r.n : ''}`, x, 36, '#fff', { font: 'bold 9px monospace' });
      wrap(g, out.desc, 224).forEach((ln, i) => text(g, ln, x, 50 + i * 10, '#d8c8b0'));
      let y = 76;
      if (r.station) text(g, `${STATIONS[r.station]}: ${this.scene.nearStation(r.station) ? 'vicino ✔' : 'non vicino ✖'}`, x, (y += 0), this.scene.nearStation(r.station) ? '#80ff90' : '#ffb070');
      for (const [id, n] of Object.entries(r.in)) {
        const have = st.inv.count(id);
        text(g, `${ITEMS[id].n}: ${have}/${n}`, x, (y += 11), have >= n ? '#80ff90' : '#ff9090');
      }
    } else if (k === 'quests') {
      const q = QUESTS[r], done = st.quests.status(r) === 'done';
      text(g, q.title, x, 36, '#fff', { font: 'bold 9px monospace' });
      text(g, q.act + (done ? ' · COMPLETATA' : ''), x, 48, '#c8a0e0');
      let y = 54;
      wrap(g, q.desc, 224).forEach((ln, i) => text(g, ln, x, (y += 10), '#d8c8b0'));
      y += 6;
      q.obj.forEach((o, i) => {
        const p = st.quests.progress(r, i, st);
        const ok = done || p.done;
        wrap(g, `${ok ? '✔' : '○'} ${o.text}${p.need > 1 && !ok ? ` (${p.cur}/${p.need})` : ''}`, 224).forEach((ln) => text(g, ln, x, (y += 10), ok ? '#80a080' : '#ffe8b0'));
      });
    } else if (k === 'abil') {
      const has = st.abilities.has(r.id);
      text(g, `${r.n}  [${r.key}]`, x, 36, has ? '#fff' : '#999', { font: 'bold 9px monospace' });
      wrap(g, r.desc, 224).forEach((ln, i) => text(g, ln, x, 50 + i * 10, '#d8c8b0'));
      text(g, `Costo Ki: ${r.ki}   Ricarica: ${r.cd}s`, x, 96, '#90b0ff');
      text(g, has ? 'SBLOCCATA' : 'BLOCCATA — requisiti:', x, 112, has ? '#80ff90' : '#ff9090');
      if (!has) {
        text(g, `${st.level >= r.unlock.level ? '✔' : '○'} Livello ${r.unlock.level} (attuale ${st.level})`, x, 124, '#e8dcc8');
        text(g, `${st.flags.has(r.unlock.flag) ? '✔' : '○'} ${r.hint.split('+')[1].trim()}`, x, 136, '#e8dcc8');
      }
    } else if (k === 'sistema') {
      text(g, `Tempo di gioco: ${Math.floor(st.playtime / 60)} min`, x, 40, '#d8c8b0');
      text(g, st.postgame ? 'Post-game: mondo esplorabile all\'infinito' : 'Storia in corso', x, 52, '#c8a0e0');
    }
  }

  // ---------------- Mappa del gioco (solo luoghi visitati/esplorati) ----------------
  visitedMaps() {
    const st = this.st, cur = this.scene.mapId;
    const order = mapIds();
    return [...st.visited].filter((id) => MAPS[id]).sort((a, b) => (b === cur) - (a === cur) || (b === 'overworld') - (a === 'overworld') || order.indexOf(a) - order.indexOf(b));
  }
  exploredPct(id) {
    const m = getMap(id), set = this.st.explored[id];
    if (!set) return 0;
    this.totals ||= {};
    if (!this.totals[id]) { // celle che contengono almeno un tile percorribile
      let n = 0; const cw = Math.ceil(m.w / EXPLORE_CELL), ch = Math.ceil(m.h / EXPLORE_CELL);
      for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
        let ok = false;
        for (let j = 0; j < EXPLORE_CELL && !ok; j += 3) for (let i = 0; i < EXPLORE_CELL && !ok; i += 3) if (m.passable(cx * EXPLORE_CELL + i, cy * EXPLORE_CELL + j, null)) ok = true;
        if (ok) n++;
      }
      this.totals[id] = Math.max(1, n);
    }
    return Math.min(100, Math.round((set.size / this.totals[id]) * 100));
  }
  mapImage(id) {
    const m = getMap(id), set = this.st.explored[id] || new Set(), key = id + ':' + set.size;
    if (this.imgs[key]) return this.imgs[key];
    const PW = 232, PH = 164, s = Math.min(PW / m.w, PH / m.h, 4);
    const iw = Math.ceil(m.w * s), ih = Math.ceil(m.h * s), cw = Math.ceil(m.w / EXPLORE_CELL);
    const cv = document.createElement('canvas'); cv.width = iw; cv.height = ih;
    const c = cv.getContext('2d');
    c.fillStyle = '#07040c'; c.fillRect(0, 0, iw, ih);
    for (let py = 0; py < ih; py++) for (let px = 0; px < iw; px++) {
      const tx = Math.min(m.w - 1, Math.floor(px / s)), ty = Math.min(m.h - 1, Math.floor(py / s));
      if (!set.has(Math.floor(ty / EXPLORE_CELL) * cw + Math.floor(tx / EXPLORE_CELL))) {
        if (((px + py) & 3) === 0) { c.fillStyle = '#120c1c'; c.fillRect(px, py, 1, 1); }
        continue;
      }
      const i = ty * m.w + tx, o = m.obj[i];
      c.fillStyle = o ? DEFS[o].c[DEFS[o].solid ? 0 : 1] : DEFS[m.ground[i]].c[0];
      c.fillRect(px, py, 1, 1);
    }
    this.imgs[key] = { cv, s, iw, ih };
    return this.imgs[key];
  }
  renderMap(g, rows) {
    const st = this.st, cur = this.scene.mapId;
    text(g, 'Luoghi visitati', 16, 30, '#ffd0a0');
    list(g, rows, this.sel, 16, 42, 214, 13, 13, (id, x, y, on) => {
      text(g, (id === cur ? '◆ ' : '  ') + MAPS[id].n.slice(0, 30), x, y + 1, on ? '#fff' : '#e8dcc8');
      text(g, this.exploredPct(id) + '%', x + 204, y + 1, '#8ad0a0', { align: 'right' });
    });
    const id = rows[this.sel];
    if (!id) return;
    const m = getMap(id), im = this.mapImage(id), X = 236, Y = 38;
    panel(g, X - 3, Y - 3, 236, 168, { bg: 'rgba(5,3,10,.9)' });
    const ox = X + Math.floor((232 - im.iw) / 2), oy = Y + Math.floor((164 - im.ih) / 2);
    g.drawImage(im.cv, ox, oy);
    // punti d'interesse: solo se la loro cella è stata esplorata
    const COL = { town: '#ff5a5a', outpost: '#ffa040', dungeon: '#c070ff', shrine: '#ffe060', stairs: '#ffffff', boss: '#ff2040', building: '#e8e0d0', portal: '#40f0ff', exit: '#60ff80' };
    const shown = [];
    for (const p of m.pois) {
      if (!st.isExplored(m, p.x, p.y)) continue;
      const px = Math.round(ox + (p.x + 0.5) * im.s), py = Math.round(oy + (p.y + 0.5) * im.s);
      g.fillStyle = '#000'; g.fillRect(px - 2, py - 2, 5, 5);
      g.fillStyle = COL[p.kind] || '#fff';
      if (p.kind === 'dungeon' || p.kind === 'boss') { g.fillRect(px - 1, py - 2, 3, 5); g.fillRect(px - 2, py - 1, 5, 3); } else g.fillRect(px - 1, py - 1, 3, 3);
      if (p.kind === 'town' || p.kind === 'outpost' || p.kind === 'dungeon') shown.push([px, py, p.n]);
    }
    for (const q of st.secrets) if (q.map === id) { const px = Math.round(ox + (q.x + 0.5) * im.s), py = Math.round(oy + (q.y + 0.5) * im.s); g.fillStyle = '#000'; g.fillRect(px - 3, py - 3, 7, 7); g.fillStyle = '#ffd860'; g.fillRect(px - 2, py - 2, 5, 5); shown.push([px, py, q.n]); }
    for (const [px, py, n] of shown) text(g, n.length > 18 ? n.slice(0, 17) + '…' : n, Math.max(X, Math.min(X + 232 - n.length * 4.6, px + 4)), py - 4, '#fff');
    if (id === cur) { // posizione del giocatore
      const p = this.scene.player, px = Math.round(ox + (p.cx / 16) * im.s), py = Math.round(oy + (p.cy / 16) * im.s);
      if (Math.floor(this.t * 4) % 2 === 0) { g.fillStyle = '#fff'; g.fillRect(px - 2, py - 2, 5, 5); g.fillStyle = '#e03040'; g.fillRect(px - 1, py - 1, 3, 3); }
    }
    text(g, `${m.def.n} — esplorato ${this.exploredPct(id)}%`, X, Y + 168, '#c8b8d8');
    const legend = [['town', 'Città'], ['outpost', 'Avamposto'], ['dungeon', 'Dungeon'], ['shrine', 'Santuario'], ['stairs', 'Scale'], ['building', 'Edificio']];
    legend.forEach(([k, n], i) => { g.fillStyle = COL[k]; g.fillRect(X + (i % 3) * 78, Y + 180 + Math.floor(i / 3) * 10, 4, 4); text(g, n, X + 7 + (i % 3) * 78, Y + 178 + Math.floor(i / 3) * 10, '#9a8aa8'); });
  }

  // ---------------- Scheda personaggio ----------------
  renderHero(g) {
    const st = this.st, W2 = 232;
    panel(g, 14, 32, W2, 186, { bg: 'rgba(10,6,18,.9)' });
    g.save(); g.translate(60, 112); g.scale(3, 3); drawPlayerSprite(g, 0, 0, st.look, 0, 0); g.restore();
    text(g, st.name, 100, 44, '#fff', { font: 'bold 11px monospace' });
    text(g, `${st.look.gender ? 'Donna' : 'Uomo'} · Livello ${st.level}`, 100, 58, '#ffd0a0');
    text(g, `Dono: ${GIFTS[st.gift]?.n || '-'}`, 100, 70, '#c8b8d0');
    text(g, `Monete: ${st.inv.gold}`, 100, 82, '#ffd860');
    const rows = [['Salute', `${Math.ceil(st.hp)} / ${st.maxHp}`], ['Ki', `${Math.floor(st.ki)} / ${st.maxKi}`], ['Stamina', `${Math.floor(st.stamina)} / ${st.maxStamina}`], ['Attacco', st.atk], ['Difesa', st.def],
      ['Velocità', `+${Math.round((st.speedBonus + st.buff('spd')) * 100)}%`], ['XP', `${st.xp} / ${xpNeed(st.level)}`]];
    rows.forEach(([a, b], i) => { text(g, a, 24, 126 + i * 12, '#c8b8d0'); text(g, String(b), 130, 126 + i * 12, '#fff'); });
    const e = st.inv.equip, N = (id) => (id ? ITEMS[id].n : '—');
    const eq = [['Arma', e.weapon], ['Arco', e.bow], ['Veste', e.armor], ['Maschera', e.mask], ['Talismano', e.charm], ['Tuta', e.suit]];
    panel(g, 252, 32, 214, 186, { bg: 'rgba(10,6,18,.9)' });
    text(g, 'Equipaggiamento', 260, 38, '#ffd0a0');
    eq.forEach(([a, id], i) => { text(g, a, 260, 54 + i * 13, '#c8b8d0'); text(g, N(id).slice(0, 24), 322, 54 + i * 13, id ? '#fff' : '#777'); });
    text(g, `Frecce: ${st.ammoName()}`, 260, 136, '#bfe0ff');
    text(g, `Arma in mano: ${st.weaponMode === 'bow' ? 'arco' : 'katana'}`, 260, 148, '#bfe0ff');
    text(g, `Nemici sconfitti: ${Object.values(st.kills).reduce((a, b) => a + b, 0)}`, 260, 164, '#d8c8b0');
    text(g, `Tempo di gioco: ${Math.floor(st.playtime / 60)} min`, 260, 176, '#d8c8b0');
    text(g, `Luogo: ${MAPS[st.map]?.n || st.map}`.slice(0, 34), 260, 188, '#d8c8b0');
    text(g, 'Difesa [U]  Schivata [V]  Arco [B]', 260, 204, '#8a7a9a');
  }

  renderExtra(g, rows) {
    const st = this.st, c = st.completion();
    text(g, `Completamento: ${c.pct}%`, 16, 32, '#ffd0a0', { font: 'bold 11px monospace' });
    let y = 52;
    for (const [n, [a, b]] of Object.entries(c.parts)) {
      text(g, n, 16, y, '#e8dcc8'); text(g, `${Math.min(a, b)}/${b}`, 92, y, '#aaa');
      bar(g, 134, y + 2, 84, 5, Math.min(a, b) / b, '#60c880');
      y += 15;
    }
    text(g, `XP: ${st.xp}/${xpNeed(st.level)}   Tempo: ${Math.floor(st.playtime / 60)} min`, 16, y + 4, '#e8c040');
    text(g, `Bestiario (${rows.length}/${Object.keys(ENEMIES).length})`, 236, 32, '#ffd0a0');
    if (!rows.length) text(g, 'Nessun nemico sconfitto.', 236, 48, '#888');
    list(g, rows, this.sel, 236, 44, 224, 12, 8, (id, x, yy, on) => {
      text(g, ENEMIES[id].n.slice(0, 28), x, yy + 1, on ? '#fff' : '#e8dcc8');
      text(g, `x${st.kills[id]}`, x + 214, yy + 1, '#aaa', { align: 'right' });
    });
    const e = ENEMIES[rows[this.sel]];
    if (e) {
      panel(g, 232, 148, 232, 72, { bg: 'rgba(10,6,18,.9)' });
      text(g, e.n, 240, 153, '#fff', { font: 'bold 9px monospace' });
      text(g, `PV ${e.hp}  ATT ${e.atk}  XP ${e.xp}${e.boss ? '  · BOSS' : ''}`, 240, 164, '#ffd0a0');
      wrap(g, e.tip || '', 216).slice(0, 4).forEach((ln, i) => text(g, ln, 240, 176 + i * 10, '#d8c8b0'));
    }
    void SLOTS;
  }
}
