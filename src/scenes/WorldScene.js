import { W, H } from '../core/Game.js';
import { TS, clamp, pickWeighted } from '../core/Util.js';
import { T, DEFS } from '../data/tiles.js';
import { NPCS } from '../data/npcs.js';
import { ENEMIES, SPAWN_TABLES, NIGHT_TABLES } from '../data/enemies.js';
import { MOUNTS } from '../data/mounts.js';
import { TOWNS, ZONE_NAMES, MAPS } from '../data/world.js';
import { ABILITY_DEFS } from '../data/abilities.js';
import { getMap, mapIds } from '../world/Generators.js';
import { World } from '../engine/World.js';
import { isOpenWorld } from '../engine/TileMap.js';
import { Atmosphere } from '../engine/Atmosphere.js';
import { getTile, variantOf } from '../engine/Sprites.js';
import { text, bar, panel } from '../engine/UI.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { NPC } from '../entities/NPC.js';
import { Prop } from '../entities/Prop.js';
import { Pickup } from '../entities/Pickup.js';
import { AbilitySystem } from '../abilities/AbilitySystem.js';
import { check } from '../systems/Script.js';
import * as LS from '../systems/LimboSystem.js';
import { prepareLimbo } from '../world/Limbo.js';
import { RebirthScene } from './RebirthScene.js';
import { updateMelt } from '../abilities/Elements.js';
import { activeElement } from '../abilities/Elements.js';
import { ELEMENTS, BOMBS } from '../data/crafting.js';
import { RECIPES, ITEMS } from '../data/items.js';
import { applyBarriers, hitBarriers, barrierInteract, nearBarrierPrompt, openBarrier } from '../systems/BarrierSystem.js';
import { Save } from '../systems/GameState.js';
import { DialogueScene } from './DialogueScene.js';
import { MenuScene } from './MenuScene.js';
import { SleepScene } from './SleepScene.js';
import { BossFx } from '../engine/BossFx.js';
import { FinaleScene } from './FinaleScene.js';
import { ShopScene } from './ShopScene.js';
import { DeathScene } from './DeathScene.js';
import { CreditsScene } from './CreditsScene.js';

export class WorldScene {
  get map() { return this.world.map; }
  get player() { return this.world.player; }
  get audio() { return this.game.audio; }

  enter(p = {}) {
    const g = this.game;
    this.state = g.state;
    this.time = 0;
    this.atmo = new Atmosphere();
    this.atmo.minutes = this.state.minutes;
    this.abilities = new AbilitySystem();
    this.toasts = []; this.fxs = []; this.bossFx = []; this.timers = [];
    this.cam = { x: 0, y: 0, shake: 0 };
    this.fade = { a: 1, dir: -1, cb: null };
    this.banner = { text: '', t: 0 };
    this.god = false; this.boss = null; this.lockTile = -1; this.spawnT = 4; this.denyT = 0; this.zoneName = ''; this.gateT = 0;
    this.off = [
      g.bus.on('toast', (s) => this.toast(s)),
      g.bus.on('levelup', () => { LS.resetDeaths(this); this.ring(this.player.cx, this.player.cy, 40, '#ffe080'); this.audio.sfx('levelup'); }),
      g.bus.on('questdone', () => this.audio.sfx('quest')),
    ];
    this.load(p.mapId || this.state.map, p.anchor, p.pos);
  }
  exit() { this.off?.forEach((f) => f()); }
  resume() { this.updateGates(); }

  // ---------------------------------------------------------------- caricamento mappa
  load(id, anchor, pos) {
    const st = this.state;
    if (id === 'limbo' && st.limbo) prepareLimbo(st.limbo);
    const m = getMap(id);
    this.mapId = id;
    this.world = new World(m, this);
    st.map = id; st.visited.add(id);
    const a = pos || m.anchors[anchor] || m.anchors.entry || m.anchors.start || { x: 4, y: 4 };
    const p = new Player(a.x * TS + 3, a.y * TS + 6, st);
    this.world.add(p); this.world.player = p; this.world.flush();
    this.lockTile = this.tileKey(p);
    this.boss = null; this.taken = new Set();
    if (st.mount && !MOUNTS[st.mount].maps.includes(m.type)) st.mount = null;
    if (st.mount && this.world.blocked(p, p)) st.mount = null;
    applyBarriers(this, m); this.applyCamp(m);
    this.chunkMode = m.w * m.h > 60000; // mondi enormi: entità caricate a chunk attorno al giocatore
    if (this.chunkMode) { this.buildIndex(m); this.updateChunks(); this.eventT = 50 + Math.random() * 50; this.nightT = 5; }
    else { this.spawnNpcs(m); this.spawnProps(m); this.spawnEnemies(m); this.spawnBoss(m); }
    this.atmo.unlock();
    this.atmo.setMap(m, this.biomeHere());
    if (m.type === 'limbo') { this.atmo.lock('fog'); LS.setup(this); this.limboDust = Array.from({ length: 70 }, (_, i) => ({ x: (i * 97) % W, y: (i * 53) % H, s: 0.3 + (i % 5) * 0.2, a: i })); }
    this.updateGates();
    this.cam.x = p.cx - W / 2; this.cam.y = p.cy - H / 2; this.clampCam(m);
    this.zoneName = ''; this.checkZone(true);
    this.reveal(true);
    st.bus.emit('enter', { map: id });
  }

  resolveAt(at, m) {
    let { x, y } = at;
    if (at.town) { x += TOWNS[at.town].x; y += TOWNS[at.town].y; }
    else if (at.anchor) { const a = m.anchors[at.anchor]; x = a.x + (at.dx || 0); y = a.y + (at.dy || 0); }
    return this.freeTile(m, x, y);
  }
  freeTile(m, x, y) {
    for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const tx = x + dx, ty = y + dy, k = ty * m.w + tx;
      if (m.passable(tx, ty, null) && !this.taken.has(k) && !DEFS[m.g(tx, ty)].liquid) { this.taken.add(k); return { x: tx, y: ty }; }
    }
    return { x, y };
  }

  spawnNpcs(m) {
    for (const [id, d] of Object.entries(NPCS)) {
      if (d.at.map !== this.mapId || (d.if && !check(d.if, this.state))) continue;
      const t = this.resolveAt(d.at, m);
      this.world.add(new NPC(id, d, t.x * TS + 3, t.y * TS + 6));
    }
  }
  spawnProps(m) {
    for (const d of m.props) {
      if (d.showIf && !check(d.showIf, this.state)) continue;
      if (d.hideIf && check(d.hideIf, this.state)) continue;
      const t = this.freeTile(m, d.x, d.y);
      this.world.add(new Prop(d, t.x * TS + 1, t.y * TS + 6));
    }
  }
  // ---------------------------------------------------------------- caricamento a chunk (32x32 tile)
  buildIndex(m) {
    const CH = 32, idxm = new Map(), slot = (x, y) => { const k = Math.floor(y / CH) * 1000 + Math.floor(x / CH); let c = idxm.get(k); if (!c) idxm.set(k, (c = { spawns: [], props: [], npcs: [] })); return c; };
    for (const s of m.spawns) slot(s.x, s.y).spawns.push(s);
    if (m.boss) slot(m.boss.x, m.boss.y).boss = m.boss;   // il guardiano dorme nel suo chunk
    for (const d of m.props) { const t = this.freeTile(m, d.x, d.y); slot(t.x, t.y).props.push({ d, t }); }
    for (const [id, d] of Object.entries(NPCS)) if (d.at.map === this.mapId) { const t = this.resolveAt(d.at, m); slot(t.x, t.y).npcs.push({ id, d, t }); }
    this.CH = CH; this.chunkIndex = idxm; this.chunks = new Map(); this.chunkT = 0;
  }
  updateChunks() {
    const p = this.player, CH = this.CH, pcx = Math.floor(p.cx / TS / CH), pcy = Math.floor(p.cy / TS / CH), m = this.map;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = pcx + dx, cy = pcy + dy;
      if (cx < 0 || cy < 0 || cx * CH >= m.w || cy * CH >= m.h) continue;
      const key = cy * 1000 + cx;
      if (!this.chunks.has(key)) this.loadChunk(key, cx, cy);
    }
    for (const [key, c] of this.chunks) if (Math.abs(c.cx - pcx) > 2 || Math.abs(c.cy - pcy) > 2) { for (const e of c.ents) { e.dead = true; if (e === this.boss) this.boss = null; } this.chunks.delete(key); }
  }
  loadChunk(key, cx, cy) {
    const data = this.chunkIndex.get(key) || { spawns: [], props: [], npcs: [] }, ents = [], st = this.state, scale = (st.postgame ? 1.5 : 1) * (this.map.def.power || 1);
    for (const s of data.spawns) { if (this.campNear(s.x * TS, s.y * TS)) continue; const id = this.pickEnemy(s.table); if (id) { const e = this.world.add(new Enemy(id, s.x * TS + 3, s.y * TS + 6, { scale })); ents.push(e); for (let i = 1; i < (e.def.group || 1); i++) { const g2 = this.world.add(new Enemy(id, e.x + (i % 2 ? 10 : -10) * i, e.y + (i > 1 ? 8 : -4), { scale })); ents.push(g2); } } }
    for (const { d, t } of data.props) { if ((d.showIf && !check(d.showIf, st)) || (d.hideIf && check(d.hideIf, st))) continue; ents.push(this.world.add(new Prop(d, t.x * TS + 1, t.y * TS + 6))); }
    for (const { id, d, t } of data.npcs) { if ((d.if && !check(d.if, st)) || (d.hideIf && check(d.hideIf, st))) continue; ents.push(this.world.add(new NPC(id, d, t.x * TS + 3, t.y * TS + 6))); }
    if (data.boss && !st.flags.has('boss:' + data.boss.id) && !this.boss) { const b = new Enemy(data.boss.id, data.boss.x * TS, data.boss.y * TS, { dormant: true }); ents.push(this.world.add(b)); this.boss = b; }
    this.chunks.set(key, { cx, cy, ents });
  }
  // ---------------------------------------------------------------- notte, creature notturne ed eventi casuali
  nightLife(dt) {
    const p = this.player, night = this.atmo.isNight();
    if (!night) { for (const e of this.world.list) if (e.nocturnal && !e.dead) { e.dead = true; this.spark(e.cx, e.cy, '#e8f0ff', 8); } return; }
    this.nightT -= dt;
    if (this.nightT > 0) return;
    this.nightT = 5 + Math.random() * 5;
    if (this.world.list.filter((e) => e.nocturnal && !e.dead).length >= 7) return;
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * 6.283, r = 190 + Math.random() * 120, tx = Math.floor((p.cx + Math.cos(a) * r) / TS), ty = Math.floor((p.cy + Math.sin(a) * r) / TS), m = this.map;
      if (!m.inb(tx, ty) || m.safeAt(tx, ty) || !m.passable(tx, ty, null) || DEFS[m.g(tx, ty)].liquid) continue;
      const tbl = NIGHT_TABLES[m.biomeAt(tx, ty)] || NIGHT_TABLES.default, id = pickWeighted(Math.random, tbl);
      const e = id && this.spawnEnemy(id, tx * TS + 3, ty * TS + 6);
      if (e) { e.nocturnal = true; e.state = 'chase'; e.noLoot = false; return; }
    }
  }
  randomEvents(dt) {
    this.eventT -= dt;
    const p = this.player, m = this.map;
    if (this.eventT > 0 || m.safeAt(Math.floor(p.cx / TS), Math.floor(p.cy / TS))) return;
    this.eventT = 70 + Math.random() * 70;
    const night = this.atmo.isNight(), biome = this.biomeHere(), r = Math.random();
    const around = (fn, n, rad) => { for (let i = 0; i < n; i++) for (let t = 0; t < 8; t++) { const a = Math.random() * 6.283, tx = Math.floor((p.cx + Math.cos(a) * rad) / TS), ty = Math.floor((p.cy + Math.sin(a) * rad) / TS); if (m.inb(tx, ty) && m.passable(tx, ty, null) && !DEFS[m.g(tx, ty)].liquid && fn(tx, ty)) break; } };
    if (r < 0.34 && !night) { // mercante errante di passaggio
      around((tx, ty) => { this.world.add(new NPC('mercante_errante', { n: 'Mercante Errante', look: { top: '#a05a3a', bottom: '#4a4a5a', hair: '#8a8a8a', skin: '#d0a070', sash: '#e8c040', straw: 1, cape: 1, capeCol: '#6a3a2a', staff: 1 }, quirk: ['bubble'], shouts: ['Merci rare!', 'Solo per oggi!'], dialogue: 'viandante', life: 100, at: { map: this.mapId } }, tx * TS + 3, ty * TS + 6)); return true; }, 1, 90);
      this.toast('Un mercante errante si è fermato poco lontano...');
    } else if (r < 0.68) { // imboscata di creature della regione
      const tbl = SPAWN_TABLES[biome] || SPAWN_TABLES.meadow; let n = 0;
      around((tx, ty) => { const id = pickWeighted(Math.random, tbl), e = id && this.spawnEnemy(id, tx * TS + 3, ty * TS + 6); if (e) { e.state = 'chase'; e.noLoot = false; n++; } return false; }, 4, 120);
      if (n) { this.toast('Imboscata!'); this.audio.sfx('boss'); }
    } else { // forziere luminoso che appare e svanisce (tesoro)
      around((tx, ty) => { const pr = new Prop({ type: 'chest', id: 'evt' + Math.floor(this.time), x: tx, y: ty, loot: [['pozione_vita_m', 1], ['polvere_stelle', 1]], gold: 60 + Math.floor(Math.random() * 120), life: 120 }, tx * TS + 1, ty * TS + 6); this.world.add(pr); this.spark(pr.cx, pr.cy - 6, '#ffe080', 14); return true; }, 1, 100);
      this.toast(night ? 'Una luce bluastra baluginà tra gli alberi...' : 'Qualcosa luccica poco lontano...');
    }
  }
  revealSecret(map, x, y, name) {
    const st = this.state;
    if (!st.secrets.some((q) => q.map === map && q.x === x && q.y === y)) st.secrets.push({ map, x, y, n: name });
    st.revealAt(getMap(map), x, y, 14);
    this.toast(`Luogo segnato sulla mappa: ${name}`); this.audio.sfx('ding');
  }

  pickEnemy(table) { return pickWeighted(Math.random, SPAWN_TABLES[table] || []); }
  spawnEnemies(m) {
    const scale = m.type === 'limbo' ? LS.limboScale(this.state.level) : this.state.postgame ? 1.5 : 1;
    for (const s of m.spawns) {
      const id = this.pickEnemy(s.table);
      if (id) this.spawnGroup(this.world.add(new Enemy(id, s.x * TS + 3, s.y * TS + 6, { scale })));
    }
  }
  // Alcuni nemici (pipistrelli) arrivano in gruppo
  spawnGroup(e) {
    for (let i = 1; i < (e.def.group || 1); i++) {
      const m = this.spawnEnemy(e.id, e.x + (i % 2 ? 10 : -10) * i, e.y + (i > 1 ? 8 : -4));
      if (m) m.grouped = true;
    }
  }
  spawnBoss(m) {
    if (!m.boss || this.state.flags.has('boss:' + m.boss.id)) return;
    const e = new Enemy(m.boss.id, m.boss.x * TS, m.boss.y * TS, { dormant: true });
    this.world.add(e); this.boss = e;
  }
  spawnEnemy(id, x, y) {
    if (!ENEMIES[id]?.boss && this.campNear(x, y)) return null;   // niente comparse casuali intorno al campo
    const e = new Enemy(id, x, y, { scale: this.map.type === 'limbo' ? LS.limboScale(this.state.level) : (this.state.postgame ? 1.5 : 1) * (this.map.def.power || 1) });
    if (this.world.blocked(e, e)) return null;
    this.world.add(e);
    return e;
  }

  // ---------------------------------------------------------------- aggiornamento
  update(dt) {
    const g = this.game, inp = g.input, st = this.state;
    this.time += dt;
    // dissolvenze
    const f = this.fade;
    if (f.dir) {
      f.a += f.dir * dt * 3.5;
      if (f.dir > 0 && f.a >= 1) { f.a = 1; f.dir = -1; f.cb?.(); f.cb = null; }
      else if (f.dir < 0 && f.a <= 0) { f.a = 0; f.dir = 0; }
      if (f.dir > 0) return;
    }
    // menu / pausa
    if (inp.pressed('menu')) { g.scenes.push(new MenuScene(), { scene: this }); return; }
    if (inp.pressed('pause')) { g.scenes.push(new MenuScene(), { scene: this, tab: 'sistema' }); return; }
    if (g.debug) this.debugKeys();

    this.atmo.update(dt);
    st.minutes = this.atmo.minutes;
    this.saveT = (this.saveT || 0) - dt; if (this.saveT <= 0) { this.saveT = 45; this.autosave(); } // salvataggio periodico: su mobile la scheda può essere chiusa senza preavviso
    st.tick(dt);
    this.abilities.update(dt);
    this.world.update(dt);
    this.denyT -= dt;
    updateMelt(this); if (this.map.type === 'limbo') LS.update(this, dt);
    this.rcT = (this.rcT || 0) - dt; if (this.rcT <= 0) { this.rcT = 1; this.checkRecipes(); }

    const p = this.player;
    if (inp.pressed('interact') && !st.mount) this.interact();
    if (inp.pressed('mount')) this.toggleMount();
    if (inp.pressed('quick')) this.quickHeal();
    this.checkPortals();
    this.checkBossIntro();
    this.spawnManager(dt);
    this.updateMusic(dt);
    if (this.chunkMode) { this.chunkT -= dt; if (this.chunkT <= 0) { this.chunkT = 0.4; this.updateChunks(); } if (isOpenWorld(this.map.def)) { this.nightLife(dt); this.randomEvents(dt); } }
    this.revT = (this.revT || 0) - dt;
    if (this.revT <= 0) { this.revT = 0.25; this.reveal(false); }
    this.gateT -= dt;
    if (this.gateT <= 0) { this.gateT = 1; this.updateGates(); this.checkZone(false); }
    if (!st.isNight() && st.flags.has('gate_bribe')) st.flags.delete('gate_bribe');
    st.pos = { x: Math.floor(p.cx / TS), y: Math.floor(p.cy / TS) };

    // bioma -> meteo (overworld)
    if (isOpenWorld(this.map.def)) this.atmo.setBiome(this.biomeHere());

    // camera
    const tx = p.cx - W / 2, ty = p.cy - H / 2, k = Math.min(1, dt * 8);
    this.cam.x += (tx - this.cam.x) * k; this.cam.y += (ty - this.cam.y) * k;
    this.clampCam(this.map);
    this.cam.shake = Math.max(0, this.cam.shake - dt * 14);

    for (const t of this.toasts) t.t -= dt;
    this.toasts = this.toasts.filter((t) => t.t > 0);
    for (const x of this.fxs) x.t += dt;
    this.fxs = this.fxs.filter((x) => x.t < x.life);
    for (const b of this.bossFx) b.update(dt, this); this.bossFx = this.bossFx.filter((b) => !b.done); this.campTick(dt);
    for (const t of this.timers) { t.left -= dt; if (t.left <= 0) { t.fn(); t.dead = true; } } this.timers = this.timers.filter((t) => !t.dead);
    this.banner.t -= dt;
  }

  // Colonna sonora: dipende da luogo, ora del giorno, combattimento e boss.
  updateMusic(dt) {
    this.musicT = (this.musicT || 0) - dt;
    this.combatT = Math.max(0, (this.combatT || 0) - dt);
    if (this.musicT > 0) return;
    this.musicT = 0.4;
    const p = this.player;
    for (const e of this.world.list) {
      if (e.isEnemy && !e.dormant && !e.dead && !e.def.boss && ['chase', 'wind', 'act'].includes(e.state) && Math.hypot(e.cx - p.cx, e.cy - p.cy) < 170) { this.combatT = 4; break; }
    }
    this.audio.play(this.musicFor());
    this.audio.setAmb(this.ambFor());
  }
  ambFor() {
    const m = this.map, night = this.atmo.isNight();
    if (m.type === 'limbo') return 'limbo';
    if (m.type === 'interior') return null;
    if (m.type === 'cave' || m.type === 'underworld') return 'cave';
    if (!isOpenWorld(m.def) && m.type !== 'highland') return m.type === 'underwater' ? 'sea' : null;
    const z = this.biomeHere();
    if (z === 'ocean') return 'sea';
    if (['haunted'].includes(z)) return night ? 'haunted' : 'wind';
    if (night) return 'night';
    if (['swamp'].includes(z)) return 'swamp';
    if (['desert', 'dunes', 'badlands', 'snow', 'tundra', 'mountain', 'canyon', 'plateau'].includes(z)) return 'wind';
    return 'birds';
  }
  musicFor() {
    const m = this.map, b = this.boss;
    if (b && !b.dormant && !b.dead) return b.def.final ? 'boss_final' : 'boss';
    if (m.type === 'limbo') return 'underworld';
    if (m.type === 'interior') return m.id.startsWith('int_neo') ? 'cyber' : 'interior';
    if (this.combatT > 0) return 'battle';
    const night = this.atmo.isNight();
    if (isOpenWorld(m.def)) {
      const s = m.safeAt(Math.floor(this.player.cx / TS), Math.floor(this.player.cy / TS));
      if (s) { const n = m.safeNames[s]; const civ = { Hinomura: night ? 'hinomura_night' : 'hinomura', Aurelburg: 'aurelburg', Longxi: 'hinomura', 'Augusta Imperialis': 'aurelburg', Silvaneth: 'forest', Sahar: 'desert', 'Porto Marea': 'aurelburg', Kuru: 'hamlet', 'Zero-Quartier': 'cyber', Coralia: 'underwater' }[n]; return civ || 'hamlet'; }
      const z = this.biomeHere(), day = night ? 'field_night' : 'field';
      return { meadow: day, forest: night ? 'field_night' : 'forest', swamp: 'swamp', desert: 'desert', snow: 'snow', canyon: 'canyon', ocean: 'underwater', ancient: night ? 'cave' : 'forest', enchanted: 'forest', haunted: night ? 'underworld' : 'swamp', volcano: 'underworld', jade: night ? 'hinomura_night' : 'hamlet', plateau: night ? 'field_night' : 'aurelburg', tundra: 'snow', dunes: 'desert', badlands: 'canyon', tropical: night ? 'field_night' : 'hamlet', mountain: 'canyon' }[z] || day;
    }
    const bm = m.def.biome;
    return { cave: 'cave', underworld: 'underworld', cyber: 'cyber', parallel: 'parallel', underwater: 'underwater', snow: 'snow', canyon: 'canyon', spirit: 'parallel' }[bm] || 'cave';
  }

  // Aggiorna la nebbia di guerra: gli interni si rivelano subito, gli esterni man mano che si cammina.
  reveal(first) {
    const m = this.map, p = this.player;
    if (first && m.type === 'interior') this.state.revealAll(m);
    else this.state.revealAt(m, Math.floor(p.cx / TS), Math.floor(p.cy / TS), m.type === 'outdoor' ? 12 : 10);
  }

  clampCam(m) {
    const mw = m.w * TS, mh = m.h * TS;
    this.cam.x = mw <= W ? -(W - mw) / 2 : clamp(this.cam.x, 0, mw - W);
    this.cam.y = mh <= H ? -(H - mh) / 2 : clamp(this.cam.y, 0, mh - H);
  }

  tileKey(p) { return Math.floor((p.y + p.h / 2) / TS) * this.map.w + Math.floor(p.cx / TS); }
  biomeHere() {
    const p = this.player, m = this.map;
    return m.biomeAt(clamp(Math.floor(p.cx / TS), 0, m.w - 1), clamp(Math.floor(p.cy / TS), 0, m.h - 1));
  }

  checkZone(first) {
    const m = this.map, p = this.player;
    let name = m.def.n;
    if (m.type === 'limbo' && m.limbo) name = 'Limbo · ' + m.limbo.name;
    if (isOpenWorld(m.def)) {
      const tx = Math.floor(p.cx / TS), ty = Math.floor(p.cy / TS), s = m.safeAt(tx, ty);
      name = s ? m.safeNames[s] : ZONE_NAMES[this.biomeHere()] || name;
    }
    if (name !== this.zoneName) { this.zoneName = name; this.banner = { text: name, t: 3.2 }; }
  }

  checkPortals() {
    const p = this.player, m = this.map, st = this.state;
    const tx = Math.floor(p.cx / TS), ty = Math.floor((p.y + p.h / 2) / TS), key = ty * m.w + tx;
    if (key === this.lockTile) return;
    this.lockTile = -1;
    for (const po of m.portals) {
      if (po.x !== tx || po.y !== ty) continue;
      if (po.req && !check(po.req, st)) {
        if (this.denyT <= 0) { this.toast(po.deny || 'Non puoi entrare.'); this.denyT = 2; this.audio.sfx('error'); }
        p.kbx = -p.face.x * 140; p.kby = -p.face.y * 140;
        return;
      }
      const ot = m.o(tx, ty);
      this.transition(po.to, po.anchor, ot === T.STAIRS_UP || ot === T.STAIRS_DOWN ? 'stairs' : ot === T.PORTAL ? 'warp' : 'door');
      return;
    }
  }

  transition(mapId, anchor, sound = 'warp') {
    if (this.fade.cb || this.fade.dir > 0) return;
    this.audio.sfx(sound);
    this.fade = { a: 0, dir: 1, cb: () => { this.load(mapId, anchor); this.autosave(); } };
  }
  autosave() {
    const st = this.state; if (!st || !this.atmo || this.player?.dead || !(st.hp > 0)) return false;
    st.minutes = this.atmo.minutes;
    const ok = Save.write(st);
    if (!ok && !this.saveWarned) { this.saveWarned = true; this.toast('Salvataggio automatico non riuscito (memoria piena o bloccata). Usa Menu > Sistema per esportare.'); }
    if (ok) this.saveWarned = false;
    return ok;
  }

  updateGates() {
    const m = this.map, st = this.state;
    if (!m.gates.length) return;
    const night = st.isNight() && !st.flags.has('gate_bribe');
    const p = this.player, ptx = Math.floor(p.cx / TS), pty = Math.floor(p.cy / TS);
    for (const gt of m.gates) m.setO(gt.x, gt.y, !night || (gt.x === ptx && gt.y === pty) ? T.GATE_OPEN : T.GATE);
  }

  // Rigenerazione continua dei nemici: il mondo resta "vivo" all'infinito (post-game incluso).
  spawnManager(dt) {
    const m = this.map;
    if (!m.spawns.length || this.chunkMode) return;
    this.spawnT -= dt;
    if (this.spawnT > 0) return;
    this.spawnT = 3 + Math.random() * 2;
    const alive = this.world.list.filter((e) => e.isEnemy && !e.def.boss && !e.noLoot).length;
    if (alive >= m.spawns.length) return;
    const p = this.player;
    for (let i = 0; i < 10; i++) { // prova più punti: quelli occupati da nemici vivi vengono scartati
      const s = m.spawns[Math.floor(Math.random() * m.spawns.length)];
      if (Math.hypot(s.x * TS - p.cx, s.y * TS - p.cy) < 260) continue;
      if (this.campNear(s.x * TS, s.y * TS)) continue;   // il campo tiene lontane le comparse casuali
      const id = this.pickEnemy(s.table);
      const ox = Math.floor(Math.random() * 7) - 3, oy = Math.floor(Math.random() * 7) - 3; // attorno al punto, che può essere occupato
      const e = id && this.spawnEnemy(id, (s.x + ox) * TS + 3, (s.y + oy) * TS + 6);
      if (e) { this.spawnGroup(e); return; }
    }
  }

  checkBossIntro() {
    const b = this.boss;
    if (!b || b.dead || !b.dormant || b.introStarted) return;
    const p = this.player;
    if (Math.hypot(b.cx - p.cx, b.cy - p.cy) > 150) return;
    b.introStarted = true; // il boss resta dormiente finché il dialogo non finisce
    this.audio.sfx('boss');
    const go = () => { b.dormant = false; b.state = 'chase'; };
    if (b.def.intro) this.startDialogue(b.def.intro, null, go); else go();
  }

  // ---------------------------------------------------------------- interazione
  interact() {
    const p = this.player, fx = p.cx + p.face.x * 12, fy = p.cy + p.face.y * 12;
    let best = null, bd = 26;
    for (const e of this.world.list) {
      if (e.dead || !e.interact) continue;
      const d = Math.hypot(e.cx - fx, e.cy - fy);
      if (d < bd) { bd = d; best = e; }
    }
    if (best) { best.interact(this); return true; }
    if (this.nearCampFire()) { this.campMenu(); return true; }
    if (barrierInteract(this)) return true;
    const tx = Math.floor(fx / TS), ty = Math.floor(fy / TS);
    if (this.map.o(tx, ty) === T.GATE) { this.startDialogue('gate_night'); return true; }
    return false;
  }


  // ---------------------------------------------------------------- accampamento (Kit da Campo)
  // Fuoco da campo + banco da lavoro + tenda nel punto scelto. Si monta solo fuori dal combattimento, fuori da città/interni/arene, su spazio libero.
  // Intorno al campo non compaiono nuovi nemici casuali (raggio ~12 tile), ma i nemici già presenti possono comunque arrivare: non è invulnerabilità.
  campCells(x, y) { return [[x, y, T.CAMPFIRE], [x - 1, y, T.WORKBENCH], [x, y - 1, T.TENT]]; }
  campNear(x, y, r = 190) { const c = this.state.camp; return !!c && c.map === this.mapId && Math.hypot(c.x * TS + 8 - x, c.y * TS + 8 - y) < r; }
  campFree(x, y) {
    const m = this.map;
    for (const [cx, cy] of [...this.campCells(x, y), [x, y + 1]]) {
      if (!m.inb(cx, cy) || m.safeAt(cx, cy) || m.o(cx, cy) || !m.passable(cx, cy, null) || DEFS[m.g(cx, cy)].liquid || DEFS[m.g(cx, cy)].slow < 0.7) return false;
      if (this.world.list.some((e) => !e.dead && e !== this.player && (e.solid || e.isNPC) && Math.abs(e.cx - (cx * TS + 8)) < 14 && Math.abs(e.cy - (cy * TS + 8)) < 14)) return false;
    }
    for (const p of m.portals) if (Math.abs(p.x - x) < 3 && Math.abs(p.y - y) < 3) return false;
    return true;
  }
  campReason() {
    const m = this.map, p = this.player, st = this.state;
    if (['interior', 'limbo'].includes(m.type)) return 'Non puoi accamparti qui dentro.';
    if (m.safeAt(Math.floor(p.cx / TS), Math.floor(p.cy / TS))) return 'Non puoi accamparti dentro un centro abitato.';
    if (st.mount) return 'Scendi dalla cavalcatura per accamparti.';
    if (this.boss || (m.boss && !st.flags.has('boss:' + m.boss.id) && Math.hypot(m.boss.x * TS - p.cx, m.boss.y * TS - p.cy) < 260)) return 'Non puoi accamparti vicino a un boss.';
    if (this.time - (this.lastHit ?? -99) < 6) return 'Sei appena stato colpito: non è il momento di accamparsi.';
    if (this.world.list.some((e) => e.isEnemy && !e.dead && !e.dormant && !e.def.boss && Math.hypot(e.cx - p.cx, e.cy - p.cy) < 140)) return 'Ci sono nemici nelle vicinanze: non puoi accamparti.';
    return null;
  }
  campToggle() {
    const st = this.state;
    if (st.camp && st.camp.map === this.mapId && this.campNear(this.player.cx, this.player.cy, 400)) return this.campRemove(false);
    const why = this.campReason(); if (why) return why;
    const p = this.player, tx = Math.floor(p.cx / TS), ty = Math.floor(p.cy / TS), fx = Math.round(p.face.x), fy = Math.round(p.face.y);
    const order = []; for (let r = 2; r <= 4; r++) { order.push([tx + fx * r, ty + fy * r]); for (let a = -2; a <= 2; a++) order.push([tx + fx * r + (fy ? a : 0), ty + fy * r + (fx ? a : 0)]); }
    const spot = order.find(([x, y]) => this.campFree(x, y));
    if (!spot) return 'Non c\'è abbastanza spazio libero per montare il campo (servono 3x3 tile liberi, lontano da ostacoli, PNG e acqua).';
    if (st.camp) this.campRemove(true);
    this.placeCamp(spot[0], spot[1]); st.camp = { map: this.mapId, x: spot[0], y: spot[1] };
    this.audio.sfx('door'); this.spark(spot[0] * TS + 8, spot[1] * TS + 4, '#ffb040', 8); this.autosave();
    return 'Accampamento montato: fuoco, tenda e banco da lavoro. Usa il fuoco (E) per riposare; il Kit smonta il campo.';
  }
  placeCamp(x, y) { for (const [cx, cy, t] of this.campCells(x, y)) this.map.setO(cx, cy, t); }
  campRemove(silent) {
    const st = this.state, c = st.camp; if (!c) return 'Non hai montato nessun campo.';
    if (c.map === this.mapId) for (const [cx, cy, t] of this.campCells(c.x, c.y)) if (this.map.o(cx, cy) === t) this.map.setO(cx, cy, 0);
    st.camp = null; if (!silent) { this.audio.sfx('back'); this.toast('Accampamento smontato.'); }
    return 'Accampamento smontato: il Kit da Campo è di nuovo con te.';
  }
  applyCamp(m) { const c = this.state.camp; if (c && c.map === m.id) this.placeCamp(c.x, c.y); }
  nearCampFire() { const c = this.state.camp; if (!c || c.map !== this.mapId) return false; const p = this.player; return Math.hypot(c.x * TS + 8 - (p.cx + p.face.x * 8), c.y * TS + 8 - (p.cy + p.face.y * 8)) < 30; }
  campMenu() {
    const st = this.state, wait = Math.max(0, Math.ceil((this.campRestT || 0) - this.time));
    this.startDialogue({ start: [{ go: 'a' }], nodes: { a: { s: 'Fuoco da campo', t: wait ? 'Le fiamme scoppiettano. Hai già riposato da poco.' : 'Le fiamme scoppiettano e ti scaldano. Qui puoi riprendere fiato.', choices: [{ t: 'Riposare accanto al fuoco', if: wait ? [['flag', '__never__']] : undefined, fx: [['camprest']] }, { t: 'Smontare il campo', fx: [['campremove']] }, { t: 'Niente' }] } } });
    void st;
  }
  campRest() {
    const st = this.state; if (this.time < (this.campRestT || 0)) return;
    this.campRestT = this.time + 60;
    st.hp = Math.min(st.maxHp, st.hp + st.maxHp * 0.4); st.ki = Math.min(st.maxKi, st.ki + st.maxKi * 0.5); st.stamina = st.maxStamina; st.guardPts = st.maxGuard;
    this.audio.sfx('shrine'); this.toast('Ti riposi accanto al fuoco: PV e Ki parzialmente recuperati.');
  }
  campTick(dt) {
    const c = this.state.camp; if (!c || c.map !== this.mapId) return;
    const fx = c.x * TS + 8, fy = c.y * TS + 6, d = Math.hypot(fx - this.player.cx, fy - this.player.cy);
    this.campT = (this.campT || 0) - dt;
    if (d < 260 && this.campT <= 0) { this.campT = 0.22; this.spark(fx + (Math.random() - 0.5) * 6, fy - 6, Math.random() < 0.5 ? '#ffb040' : '#ffe080', 1); if (Math.random() < 0.5) this.audio.sfx('crackle'); }
  }

  // Postazione di crafting entro 3 tile dal giocatore: 'banco' (banco/forgia) o 'alchimia'
  nearStation(kind) {
    const p = this.player, m = this.map, tx = Math.floor(p.cx / TS), ty = Math.floor(p.cy / TS);
    const ids = kind === 'banco' ? [T.WORKBENCH, T.FORGE] : kind === 'alchimia' ? [T.ALCHEMY] : [];
    for (let y = ty - 3; y <= ty + 3; y++) for (let x = tx - 3; x <= tx + 3; x++) if (ids.includes(m.o(x, y))) return true;
    return false;
  }
  // Avviso quando una ricetta nuova diventa disponibile (livello, ricetta trovata/comprata)
  checkRecipes() {
    const st = this.state;
    for (const r of RECIPES) {
      if (!r.unlock || st.recipesSeen.has(r.out) || !check(r.unlock, st)) continue;
      st.recipesSeen.add(r.out); this.toast(`Nuova ricetta disponibile: ${ITEMS[r.out].n}${r.station ? ' (' + (r.station === 'banco' ? 'Banco da lavoro' : 'Tavolo alchemico') + ')' : ''}`); this.audio.sfx('quest');
    }
  }

  hitBarriers(x, y, r, type, power = 1) { return hitBarriers(this, x, y, r, type, power); }
  openBarrier(b) { openBarrier(this, b); }
  openBarrierById(id) { const b = (this.map.barriers || []).find((q) => q.id === id); if (b) openBarrier(this, b); }

  startDialogue(dlg, npc = null, onEnd = null) {
    this.game.scenes.push(new DialogueScene({ dlg, npc, onEnd, scene: this }));
  }
  say(speaker, t) {
    this.startDialogue({ start: [{ go: 'a' }], nodes: { a: { s: speaker, t } } });
  }
  openShop(id) { this.game.scenes.push(new ShopScene({ shopId: id, scene: this })); }
  // dopo l'ultimo boss: cinematica del ritorno trionfale nella capitale, poi i titoli di coda
  startFinale() { this.game.scenes.push(new FinaleScene({ onEnd: () => this.startCredits() })); }
  startCredits() {
    this.game.scenes.push(new CreditsScene({
      onEnd: () => { this.state.postgame = true; this.state.hp = this.state.maxHp; this.toast('Il mondo resta esplorabile: completa tutto!'); this.autosave(); },
    }));
  }
  // Riposo in locanda: sequenza non interrompibile (SleepScene); gli effetti funzionali sono applicati a schermo scuro da applyRest().
  rest() {
    if (this.game.scenes.top instanceof SleepScene) return;
    this.game.scenes.push(new SleepScene({ sc: this, applyRest: () => this.applyRest() }));
  }
  applyRest() {
    const st = this.state;
    st.hp = st.maxHp; st.ki = st.maxKi; st.stamina = st.maxStamina; st.guardPts = st.maxGuard; st.buffs = [];
    LS.resetDeaths(this, 'Dopo il riposo, le anime perdute si quietano.');
    this.atmo.minutes = 6.5 * 60;
    st.respawn = { map: this.mapId, anchor: 'entry' };
    this.autosave();
    this.toast('Ti sei riposato. Partita salvata.');
  }
  quickHeal() {
    const st = this.state;
    const opts = [...st.inv.list('potion'), ...st.inv.list('food')].filter((i) => i.def.use?.hp);
    if (!opts.length || st.hp >= st.maxHp) { this.toast(st.hp >= st.maxHp ? 'Salute già al massimo.' : 'Nessun oggetto curativo.'); return; }
    const need = st.maxHp - st.hp;
    opts.sort((a, b) => Math.abs(a.def.use.hp - need) - Math.abs(b.def.use.hp - need));
    const r = st.useItem(opts[0].id);
    if (r) { this.toast(`${opts[0].def.n}: ${r}`); this.spark(this.player.cx, this.player.cy, '#60ff90', 6); }
  }

  // ---------------------------------------------------------------- mezzi di trasporto
  toggleMount() {
    const st = this.state, p = this.player, m = this.map;
    this.audio.sfx('mount');
    if (st.mount) {
      const prev = st.mount; st.mount = null;
      if (this.world.blocked(p, p)) {
        const spot = this.findLanding(p);
        if (!spot) { st.mount = prev; this.toast('Non puoi smontare qui.'); return; }
        p.x = spot.x; p.y = spot.y;
      }
      return;
    }
    const owned = Object.keys(MOUNTS).filter((k) => st.flags.has('mount:' + k) && MOUNTS[k].maps.includes(m.type));
    if (!owned.length) { this.toast('Non hai mezzi di trasporto utilizzabili qui.'); return; }
    const order = ['dolphin', 'eagle', 'hoverbike', 'horse'].filter((k) => owned.includes(k));
    for (const k of order) {
      st.mount = k;
      if (!this.world.blocked(p, p)) return;
      if (k === 'dolphin') { // aggancia l'acqua più vicina (entro 2 tile)
        const spot = this.findWater(p);
        if (spot) { p.x = spot.x; p.y = spot.y; if (!this.world.blocked(p, p)) return; }
      }
    }
    st.mount = null;
    this.toast('Qui non puoi montare.');
  }
  scanSpots(p, accept) {
    const cx = Math.floor(p.cx / TS), cy = Math.floor(p.cy / TS);
    for (let r = 0; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const rect = { x: (cx + dx) * TS + 3, y: (cy + dy) * TS + 6, w: p.w, h: p.h, solid: true };
      if (accept(rect, cx + dx, cy + dy)) return rect;
    }
    return null;
  }
  findLanding(p) { return this.scanSpots(p, (r) => !this.world.blocked(r, { ...r, flying: false, waterOnly: false, swimDeep: false, lavaProof: false })); }
  findWater(p) {
    const w = { waterOnly: true, swimDeep: true };
    return this.scanSpots(p, (r, tx, ty) => ['shallow', 'deep'].includes(DEFS[this.map.g(tx, ty)].liquid) && !this.map.blockedRect(r, w));
  }

  // ---------------------------------------------------------------- eventi di combattimento
  later(sec, fn) { this.timers.push({ left: sec, fn }); }
  onKill(e) {
    const d = e.def, st = this.state;
    st.kills[e.id] = (st.kills[e.id] || 0) + 1;
    LS.onKill(this, e);
    if (e.def.boss) LS.resetDeaths(this, 'Hai ritrovato le forze: il conteggio delle morti si azzera.');
    this.spark(e.cx, e.cy - 4, d.col[1], d.boss ? 30 : 8);
    this.audio.sfx(d.boss ? 'boss_kill' : 'kill');
    if (d.boss) this.atmo.unlock();
    st.ki = Math.min(st.maxKi, st.ki + 3);
    if (!e.noLoot) {
      st.addXp(d.xp);
      const gold = d.gold ? d.gold[0] + Math.floor(Math.random() * (d.gold[1] - d.gold[0] + 1)) : 0;
      if (d.boss) { st.inv.gold += gold; this.toast(`+${gold} monete`); }
      else if (gold) this.world.add(new Pickup(e.cx, e.cy, { gold }));
      if (!d.boss && Math.random() < 0.07) this.world.add(new Pickup(e.cx + 6, e.cy + 2, { item: 'freccia' }));
      for (const [id, ch] of d.drops || []) {
        if (d.boss) { st.give(id, Math.max(1, Math.floor(ch))); continue; }
        if (Math.random() < ch) this.world.add(new Pickup(e.cx + (Math.random() - 0.5) * 14, e.cy + (Math.random() - 0.5) * 8, { item: id }));
      }
    }
    st.bus.emit('kill', { id: e.id, boss: !!d.boss });
    if (d.boss) {
      this.shake(8); this.ring(e.cx, e.cy, 80, '#ffe080');
      st.setFlag('boss:' + e.id);
      this.toast(`${d.n} sconfitto!`);
      if (this.boss === e) this.boss = null;
      this.bossFx.push(new BossFx(this, e));
      if (d.outro) this.later(d.final ? 3.6 : 2.6, () => this.startDialogue(d.outro)); // prima l'effetto, poi le ultime parole
    }
  }
  onPlayerDeath() {
    const st = this.state;
    if (this.map.type === 'limbo') { // si può cadere anche nel Limbo: si riparte dalla Soglia, la prova resta
      this.game.scenes.push(new DeathScene({ inLimbo: true, onRetry: () => { st.hp = st.maxHp; st.ki = st.maxKi; st.guardPts = st.maxGuard; const P = st.limbo && st.limbo.progress; if (P && st.limbo.trial === 'orda' && !P.done) { P.wave = 0; P.state = 'idle'; } this.load('limbo', 'entry'); this.fade = { a: 1, dir: -1, cb: null }; } }));
      return;
    }
    if (LS.registerDeath(this) === 'limbo') this.game.scenes.push(new DeathScene({ limbo: true, onRetry: () => LS.enterLimbo(this) }));
    else this.game.scenes.push(new DeathScene({ deaths: st.deaths, onRetry: () => this.respawn() }));
  }
  startRebirth() { this.game.scenes.push(new RebirthScene({ sc: this, onTeleport: () => LS.rebirth(this) })); }
  limboLit(prop) { return LS.lit(this, prop); }
  limboInteract(prop) { LS.interact(this, prop); }
  respawn() {
    const st = this.state;
    st.hp = Math.round(st.maxHp * 0.6); st.ki = st.maxKi; st.mount = null; st.buffs = [];
    st.inv.gold = Math.floor(st.inv.gold * 0.9);
    this.fade.cb = null;
    this.load(st.respawn.map, st.respawn.anchor);
    this.fade = { a: 1, dir: -1, cb: null };
  }

  // ---------------------------------------------------------------- effetti visivi
  toast(s) { this.toasts.push({ s, t: 3.2 }); if (this.toasts.length > 5) this.toasts.shift(); }
  shake(n) { this.cam.shake = Math.max(this.cam.shake, n); }
  addFx(life, draw, extra = {}) { this.fxs.push({ t: 0, life, draw, ...extra }); }
  slash(x, y, ang, reach, arc, big, col = '#ffffff') {
    this.addFx(0.18, (g, cx, cy, k) => {
      g.strokeStyle = col; g.globalAlpha = 1 - k; g.lineWidth = big ? 3 : 2;
      g.beginPath(); g.arc(x - cx, y - cy - 4, reach * 0.85, ang - arc / 2, ang + arc / 2); g.stroke();
      g.globalAlpha = 1; g.lineWidth = 1;
    });
  }
  ring(x, y, r, col) {
    this.addFx(0.4, (g, cx, cy, k) => {
      g.strokeStyle = col; g.globalAlpha = 1 - k; g.lineWidth = 2;
      g.beginPath(); g.arc(x - cx, y - cy, r * (0.3 + k * 0.7), 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 1; g.lineWidth = 1;
    });
  }
  spark(x, y, col, n = 6) {
    const ps = Array.from({ length: n }, () => ({ a: Math.random() * 6.28, s: 20 + Math.random() * 50 }));
    this.addFx(0.4, (g, cx, cy, k) => {
      g.fillStyle = col; g.globalAlpha = 1 - k;
      for (const q of ps) g.fillRect(Math.round(x - cx + Math.cos(q.a) * q.s * k * 0.5), Math.round(y - cy + Math.sin(q.a) * q.s * k * 0.5), 2, 2);
      g.globalAlpha = 1;
    });
  }
  floatText(x, y, s, col = '#fff') {
    this.addFx(0.8, (g, cx, cy, k) => { g.globalAlpha = 1 - k * k; text(g, s, Math.round(x - cx), Math.round(y - cy - k * 14), col, { align: 'center' }); g.globalAlpha = 1; });
  }

  // ---------------------------------------------------------------- debug (?debug nell'URL)
  debugKeys() {
    const inp = this.game.input, st = this.state;
    if (inp.pressed('debug1')) {
      st.level = Math.max(st.level, 20); st.inv.gold += 5000;
      for (const k of ['boss:oni_kurogane', 'boss:yatsuhashi', 'boss:kamios']) st.flags.add(k);
      for (const k of Object.keys(MOUNTS)) st.flags.add('mount:' + k);
      st.checkUnlocks(); st.hp = st.maxHp; st.ki = st.maxKi; this.toast('DEBUG: livello 20, abilità e mezzi sbloccati');
    }
    if (inp.pressed('debug2')) {
      const ids = mapIds(), i = (ids.indexOf(this.mapId) + 1) % ids.length;
      this.transition(ids[i], 'entry');
    }
    if (inp.pressed('debug3')) { this.god = !this.god; this.toast('God mode: ' + this.god); }
  }

  // ---------------------------------------------------------------- disegno
  render(g) {
    const m = this.map, p = this.player, st = this.state;
    const sx = this.cam.shake ? (Math.random() - 0.5) * this.cam.shake : 0, sy = this.cam.shake ? (Math.random() - 0.5) * this.cam.shake : 0;
    const cx = Math.round(this.cam.x + sx), cy = Math.round(this.cam.y + sy);
    g.fillStyle = '#05030a'; g.fillRect(0, 0, W, H);
    const x0 = Math.max(0, cx >> 4), x1 = Math.min(m.w - 1, (cx + W) >> 4), y0 = Math.max(0, cy >> 4), y1 = Math.min(m.h - 1, (cy + H) >> 4);
    const fr = Math.floor(this.time * 3) & 3;
    const lights = [];
    // terreno
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const id = m.ground[ty * m.w + tx], d = DEFS[id];
      g.drawImage(getTile(id, d.anim ? fr : 0, (tx * 7 + ty * 13) & 3), tx * TS - cx, ty * TS - cy);
      if (d.light && (tx * 7 + ty * 13) % (d.lsamp || 1) === 0) lights.push({ x: tx * TS + 8 - cx, y: ty * TS + 8 - cy, r: d.light.r, c: d.light.c });
    }
    // oggetti ed entità ordinati per profondità
    const ents = this.world.list.filter((e) => !e.dead && e.x + 60 > cx && e.x - 60 < cx + W && e.y + 60 > cy && e.y - 60 < cy + H).sort((a, b) => a.feetY - b.feetY);
    let ei = 0;
    const yTall = Math.min(m.h - 1, y1 + 4);   // oggetti alti sotto il bordo dello schermo: la loro cima entra comunque nella vista
    for (let ty = y0; ty <= yTall + 1; ty++) {
      if (ty <= yTall) for (let tx = x0; tx <= x1; tx++) {
        const id = m.obj[ty * m.w + tx];
        if (!id) continue;
        const d = DEFS[id];
        if (ty > y1 && !(d.tall > (ty - y1 - 1) * TS)) continue;
        g.drawImage(getTile(id, d.anim ? fr : 0, variantOf(d, tx, ty)), tx * TS - cx, ty * TS - cy - (d.tall || 0));
        if (d.light && (tx * 7 + ty * 13) % (d.lsamp || 1) === 0) lights.push({ x: tx * TS + 8 - cx, y: ty * TS + 8 - cy, r: d.light.r, c: d.light.c });
      }
      while (ei < ents.length && ents[ei].feetY < (ty + 1) * TS) { ents[ei].draw(g, cx, cy, this); ei++; }
    }
    while (ei < ents.length) { ents[ei].draw(g, cx, cy, this); ei++; }
    for (const f of this.fxs) f.draw(g, cx, cy, f.t / f.life);
    for (const b of this.bossFx) b.draw(g, cx, cy);

    // luci dinamiche
    lights.push({ x: p.cx - cx, y: p.cy - cy, r: m.type === 'interior' ? 70 : 52, c: '255,200,120' });
    for (const e of ents) if (e.isNPC && e.light) lights.push({ x: e.cx - cx - 10, y: e.cy - cy - 6, r: e.light.r, c: e.light.c });
    for (const e of ents) if (e.isEnemy && e.def.light) lights.push({ x: e.cx - cx, y: e.cy - cy, r: e.def.light.r, c: e.def.light.c });
    for (const e of ents) if (e.isProjectile && e.kind === 'arrowp' && (e.ammo === 'freccia_fuoco' || e.ammo === 'freccia_magica')) lights.push({ x: e.cx - cx, y: e.cy - cy, r: 26, c: e.ammo === 'freccia_fuoco' ? '255,140,50' : '150,120,255' });
    for (const e of ents) if (e.isProjectile && (e.kind === 'fire' || e.kind === 'black')) lights.push({ x: e.cx - cx, y: e.cy - cy, r: e.kind === 'black' ? 44 : 34, c: e.kind === 'black' ? '150,90,255' : '255,140,50' });
    if (m.type === 'limbo') lights.push({ x: p.cx - cx, y: p.cy - cy - 30, r: 50, c: '255,225,150' });
    this.atmo.render(g, W, H, lights);
    if (m.biome === 'underwater' || m.def.biome === 'underwater') this.drawSeaFx(g, cx, cy);
    for (const b of this.bossFx) b.drawScreen(g);
    if (m.type === 'limbo') this.drawLimboFx(g);

    this.drawNightSky(g);
    this.drawHud(g);
    if (this.fade.a > 0) { g.fillStyle = `rgba(0,0,0,${this.fade.a})`; g.fillRect(0, 0, W, H); }
    void st;
  }

  // Notte: lucciole nei boschi, luna (con le sue fasi) e stelle che brillano in alto
  drawNightSky(g) {
    const m = this.map;
    if (m.type === 'interior' || m.type === 'cave' || m.type === 'underworld' || m.type === 'underwater' || !this.atmo.isNight()) return;
    const z = this.biomeHere();
    if (['meadow', 'forest', 'ancient', 'enchanted', 'jade', 'tropical', 'swamp', 'haunted', 'plateau'].includes(z)) {
      const col = z === 'haunted' ? '120,200,255' : z === 'enchanted' ? '200,140,255' : '220,255,120';
      for (let i = 0; i < 16; i++) {
        const x = (i * 97 + Math.sin(this.time * 0.6 + i) * 34 + 400) % W, y = (i * 53 + Math.cos(this.time * 0.5 + i * 2) * 22 + 270) % H, a = 0.35 + 0.45 * Math.sin(this.time * 2.2 + i * 1.7);
        if (a > 0.2) { g.fillStyle = `rgba(${col},${a * 0.28})`; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = `rgba(${col},${a})`; g.fillRect(x, y, 1, 1); }
      }
    }
    // pannello del cielo
    const cx = W / 2 - 34, cy = 4, ph = Math.floor(this.state.playtime / 720) % 8;
    g.fillStyle = 'rgba(8,10,30,.7)'; g.fillRect(cx, cy, 68, 20);
    for (let i = 0; i < 9; i++) { const tw = 0.4 + 0.6 * Math.abs(Math.sin(this.time * 1.7 + i * 2.3)); g.fillStyle = `rgba(255,255,230,${tw})`; g.fillRect(cx + 4 + ((i * 29) % 40), cy + 3 + ((i * 11) % 14), 1, 1); }
    const mx = cx + 50, my = cy + 10;
    g.fillStyle = '#f4f0d8'; g.beginPath(); g.arc(mx, my, 6, 0, 6.283); g.fill();
    if (ph !== 4) { g.fillStyle = 'rgba(8,10,30,.92)'; const off = [-12, -8, -4, 0, 0, 4, 8, 12][ph] ?? 0; g.beginPath(); g.arc(mx + off, my, 6, 0, 6.283); g.fill(); } // fasi lunari
    g.fillStyle = '#c8c4a8'; g.fillRect(mx - 2, my - 2, 1, 1); g.fillRect(mx + 1, my + 1, 2, 1);
  }

  // Limbo: nebbiolina e pulviscolo sospeso, vignettatura che riduce la visibilità
  // Ambiente sottomarino: raggi di luce filtrata che ondeggiano, caustiche sul fondale e neve marina sospesa (leggero: ~40 rettangoli e 6 fasce)
  drawSeaFx(g, cx, cy) {
    const t = this.time;
    for (let i = 0; i < 6; i++) { const x = ((i * 97 + t * 7 + Math.sin(t * 0.3 + i) * 12) % (W + 140)) - 70, a = 0.045 + 0.03 * Math.sin(t * 0.7 + i * 1.7); g.fillStyle = `rgba(190,255,245,${a})`; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 26, 0); g.lineTo(x + 70, H); g.lineTo(x + 30, H); g.fill(); }
    g.fillStyle = 'rgba(160,240,255,.07)'; for (let i = 0; i < 14; i++) { const x = (i * 71 + Math.sin(t * 0.8 + i) * 18 + t * 4) % W, y = (i * 53 + Math.cos(t * 0.6 + i * 2) * 14) % H; g.fillRect(Math.round(x), Math.round(y), 22, 1); g.fillRect(Math.round(x + 6), Math.round(y + 4), 14, 1); }
    if (!this.seaDust) this.seaDust = Array.from({ length: 40 }, (_, i) => ({ x: (i * 83) % W, y: (i * 41) % H, s: 0.4 + (i % 5) * 0.2, a: i }));
    for (const q of this.seaDust) { const x = (q.x + Math.sin(t * 0.5 + q.a) * 10 - cx * 0.15 + W * 4) % W, y = (q.y - t * 5 * q.s - cy * 0.15 + H * 8) % H; g.globalAlpha = 0.25 + 0.2 * Math.sin(t + q.a); g.fillStyle = '#d8fff8'; g.fillRect(Math.round(x), Math.round(y), 1 + (q.a % 4 === 0 ? 1 : 0), 1); }
    g.globalAlpha = 1;
    const gr = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.7); gr.addColorStop(0, 'rgba(0,20,40,0)'); gr.addColorStop(1, 'rgba(0,20,50,.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  drawLimboFx(g) {
    const t = this.time;
    for (const q of this.limboDust || []) {
      const x = (q.x + t * 6 * q.s + Math.sin(t * 0.4 + q.a) * 14 + W * 4) % W, y = (q.y + t * 3 * q.s + H * 4) % H;
      g.globalAlpha = 0.18 + 0.14 * Math.sin(t * 0.8 + q.a); g.fillStyle = '#c8cce0'; g.fillRect(Math.round(x), Math.round(y), 1 + (q.a % 3 === 0 ? 1 : 0), 1);
    }
    g.globalAlpha = 1;
    const gr = g.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.62); gr.addColorStop(0, 'rgba(8,8,16,0)'); gr.addColorStop(1, 'rgba(8,8,16,0.72)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }

  drawHud(g) {
    const st = this.state, m = this.map;
    // barre con etichetta: PV, KI (energia spirituale per le abilità), STA (stamina), GUA (guardia), ESP (esperienza)
    text(g, `${st.name}  Lv ${st.level}`, 6, 3, '#fff');
    const LB = 27, row = (y, lab, col, v, mx, w, h, bc, num) => {
      text(g, lab, 6, y - 1, col, { font: '7px monospace' });
      bar(g, LB, y, w, h, v / mx, bc);
      if (num) text(g, num, LB + w + 4, y - 1, col, { font: '7px monospace' });
    };
    row(13, 'PV', '#ffb0b8', st.hp, st.maxHp, 84, 6, '#e03a4a', `${Math.ceil(st.hp)}/${st.maxHp}`);
    row(22, 'KI', '#a8c8ff', st.ki, st.maxKi, 70, 4, '#4a8ae8');
    row(29, 'STA', '#a8f0b0', st.stamina, st.maxStamina, 70, 4, st.stamina < 18 ? '#e08040' : '#60c870');
    row(36, 'GUA', this.player.gBroken ? '#ff9060' : '#bfe0ff', st.guardPts, st.maxGuard, 70, 4, this.player.gBroken ? '#c86030' : '#7ab8ff');
    if (st.deaths && m.type !== 'limbo') text(g, `☠ ${st.deaths}/3`, 112, 3, st.deaths >= 2 ? '#ff9090' : '#c8a8a8');
    if (m.type === 'limbo' && st.limbo) { panel(g, W / 2 - 150, 26, 300, 12, { bg: 'rgba(14,10,24,.7)' }); text(g, LS.objective(this), W / 2, 28, '#e8e0ff', { align: 'center', font: '7px monospace' }); }
    row(43, 'ESP', '#f0d878', st.xp, Math.floor(14 * Math.pow(st.level, 1.45)), 70, 3, '#e8c040');
    // orologio, meteo, monete
    const h = Math.floor(this.atmo.hour), mi = Math.floor(this.atmo.minutes % 60);
    const clock = `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
    text(g, clock + (m.type === 'interior' ? '' : '  ' + this.atmo.label()), W - 6, 4, '#fff', { align: 'right' });
    text(g, `¥ ${st.inv.gold}`, W - 6, 14, '#ffd860', { align: 'right' });
    if (st.mount) text(g, MOUNTS[st.mount].n + ' [M]', W - 6, 24, '#a0e0ff', { align: 'right' });
    // abilità
    const slots = [['J', 'Katana', null], ['K', 'Scatto', 'dash'], ['L', 'Fuoco', 'fire'], ['H', 'Fiamma', 'black']];
    slots.forEach(([k, n, id], i) => {
      const x = 6 + i * 24, y = H - 26, locked = id && !st.abilities.has(id);
      panel(g, x, y, 22, 20, { bg: 'rgba(14,10,24,.8)' });
      text(g, k, x + 4, y + 3, locked ? '#665' : '#ffe0b0');
      text(g, n.slice(0, 4), x + 4, y + 11, locked ? '#554' : '#aaa');
      if (id && !locked) {
        const r = this.abilities.ratio(id);
        if (r > 0) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x + 2, y + 2 + (1 - r) * 16, 18, r * 16); }
        if (st.ki < ABILITY_DEFS[id].ki) { g.fillStyle = 'rgba(40,80,200,.35)'; g.fillRect(x + 2, y + 2, 18, 16); }
      }
      if (locked) text(g, '🔒', x + 12, y + 2, '#777');
    });
    // arma corrente e frecce
    if (st.inv.bow()) text(g, `${st.weaponMode === 'bow' ? 'Arco' : 'Katana'} [T]   Frecce [G]: ${st.ammoName()}`, 6, H - 36 - 0, '#bfe0ff');
    // esplosivo selezionato e potere elementale attivo
    const bl = st.bombCurrent(), el = activeElement(st);
    if (bl) text(g, `${BOMBS[bl].n} x${st.inv.count(bl)} [Z/G]`, 6, H - 46, '#ffd09a');
    if (el) text(g, `${ELEMENTS[el.id].n} ${Math.floor(el.t / 60)}:${String(Math.floor(el.t % 60)).padStart(2, '0')} [P]`, 6, H - (bl ? 56 : 46), ELEMENTS[el.id].col);
    // boss
    const b = this.boss;
    if (b && !b.dead && !b.dormant) {
      panel(g, W / 2 - 134, H - 28, 268, 22, { bg: 'rgba(30,6,12,.85)' });
      text(g, b.def.n, W / 2, H - 25, '#ffd0d0', { align: 'center' });
      bar(g, W / 2 - 126, H - 14, 252, 5, b.hp / b.hpMax, '#d02840');
    }
    // banner di zona
    if (this.banner.t > 0) {
      const a = clamp(Math.min(this.banner.t, 3.2 - this.banner.t) * 2, 0, 1);
      g.globalAlpha = a; text(g, this.banner.text, W / 2, 36, '#f6e8d0', { align: 'center', font: 'bold 12px monospace' }); g.globalAlpha = 1;
    }
    // avvisi
    this.toasts.forEach((t, i) => {
      g.globalAlpha = Math.min(1, t.t * 2);
      text(g, t.s, 6, H - 48 - (this.toasts.length - 1 - i) * 10, '#ffe8b0'); g.globalAlpha = 1;
    });
    // suggerimento di interazione
    const p = this.player;
    if (!st.mount && this.world.list.some((e) => e.interact && !e.dead && Math.hypot(e.cx - (p.cx + p.face.x * 12), e.cy - (p.cy + p.face.y * 12)) < 26)) {
      text(g, '[E] Interagisci', W / 2, H - 52, '#fff', { align: 'center' });
    } else if (!st.mount && nearBarrierPrompt(this)) text(g, '[E] Esamina il passaggio', W / 2, H - 52, '#fff', { align: 'center' });
  }
}
