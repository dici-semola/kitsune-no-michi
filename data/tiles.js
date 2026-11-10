// Definizione dei tile. Due layer: `ground` (terreno) e `obj` (oggetti sopra il terreno).
// Proprietà: solid (non attraversabile), liquid ('shallow'|'deep'|'lava'), slow (moltiplicatore velocità),
// light (sorgente luminosa), st (stile di disegno procedurale in Sprites.js), c (palette).
export const T = {
  GRASS: 0, DIRT: 1, WATER: 2, DEEP: 3, SAND: 4, SNOW: 5, STONE: 6, WOOD: 7, LAVA: 8, SWAMP: 9, CAVE: 10,
  NEON: 11, VOID: 12, CANYON: 13, BRIDGE: 14, COBBLE: 15, ICE: 16, ASH: 17, SEABED: 18, TIMEFLOOR: 19, RUG: 20,
  TREE: 21, ROCK: 22, WALL: 23, FENCE: 24, BUILD: 25, DOOR: 26, GATE: 27, GATE_OPEN: 28, ROOF: 29, CACTUS: 30,
  PINE: 31, NEONWALL: 32, CORAL: 33, TABLE: 34, SHELF: 35, COUNTER: 36, LANTERN: 37, PORTAL: 38, FOUNTAIN: 39,
  CRYSTAL: 40, DEADTREE: 41, HOLO: 42, ICEWALL: 43, HELLROCK: 44, BED: 45, STALL: 46, BUILDEU: 47, ROOFEU: 48,
  MACHINE: 49, CANYONWALL: 50, ARCH: 51, STAIRS_UP: 52, STAIRS_DOWN: 53, BARREL: 54, CRATE: 55, PILLAR: 56,
  // civiltà: terreni
  MARBLEFLOOR: 57, DEADGRASS: 58, MAGICGRASS: 59, OBSIDIANFLOOR: 60, TATAMI: 61, JUNGLE: 62, DOCK: 63,
  // civiltà: oggetti
  ROOFCN: 64, WALLCN: 65, PAGODA: 66, MARBLE: 67, COLUMN: 68, STATUE: 69, TILEROOF: 70, ADOBE: 71, PALM: 72, HUT: 73, TOTEM: 74, SHIP: 75,
  TREEHOUSE: 76, ELVENWALL: 77, GRAVE: 78, MUSHROOM: 79, BAMBOO: 80, OBSIDIAN: 81, DWARFWALL: 82, FORGE: 83, BANNER: 84, CATHEDRAL: 85,
  RUBBLE: 86, TOWER: 87, ELVENLAMP: 88, BONFIRE: 89, LIGHTHOUSE: 90, GIANTTREE: 91, VOLCANOCONE: 92,
};

export const DEFS = [];
const d = (id, o) => { DEFS[id] = o; };

// --- terreno ---
d(T.GRASS, { c: ['#4f9a3c', '#63b04d', '#3f8232'], st: 'speck' });
d(T.DIRT, { c: ['#a48252', '#b8956a', '#8a6a40'], st: 'speck' });
d(T.WATER, { c: ['#3f86d6', '#7cb8f0', '#2d6cb8'], st: 'water', liquid: 'shallow', slow: 0.6, anim: 1 });
d(T.DEEP, { c: ['#1f4fa0', '#3a74cc', '#173c80'], st: 'water', liquid: 'deep', anim: 1 });
d(T.SAND, { c: ['#e2c77e', '#eed793', '#caab60'], st: 'speck' });
d(T.SNOW, { c: ['#e9f1f9', '#ffffff', '#c8d9ea'], st: 'speck', slow: 0.85 });
d(T.STONE, { c: ['#8f919b', '#a4a7b1', '#767884'], st: 'tiles' });
d(T.WOOD, { c: ['#a9743d', '#bb8449', '#8d5f2f'], st: 'planks' });
d(T.LAVA, { c: ['#e2501a', '#ffa030', '#a83010'], st: 'water', liquid: 'lava', anim: 1, light: { r: 46, c: '255,120,40' }, lsamp: 3 });
d(T.SWAMP, { c: ['#4d6b3a', '#668a4a', '#394f2c'], st: 'speck', slow: 0.65 });
d(T.CAVE, { c: ['#4a4452', '#5c5666', '#383340'], st: 'speck' });
d(T.NEON, { c: ['#14102a', '#ff3fa4', '#2ee6ff'], st: 'neon', anim: 1 });
d(T.VOID, { c: ['#0a0618', '#2a1a5a', '#5a3aa0'], st: 'void', solid: 1, anim: 1 });
d(T.CANYON, { c: ['#c0643a', '#d27a4a', '#a24e2c'], st: 'speck' });
d(T.BRIDGE, { c: ['#9a6a38', '#b98343', '#6e4a26'], st: 'bridge' });
d(T.COBBLE, { c: ['#9a9aa2', '#b2b2ba', '#7c7c86'], st: 'cobble' });
d(T.ICE, { c: ['#bfe4f4', '#e6f7ff', '#8ec4de'], st: 'speck', slow: 1.1 });
d(T.ASH, { c: ['#3a3338', '#4c4348', '#2a2428'], st: 'speck' });
d(T.SEABED, { c: ['#c9b27c', '#d8c48e', '#a8925c'], st: 'speck', slow: 0.9 });
d(T.TIMEFLOOR, { c: ['#2a1f5e', '#8a6aff', '#4cf0ff'], st: 'time', anim: 1, light: { r: 26, c: '140,110,255' }, lsamp: 4 });
d(T.RUG, { c: ['#a02a2a', '#d8b04a', '#7a1c1c'], st: 'rug' });

// --- oggetti ---
const O = (id, solid, c, st, extra = {}) => d(id, { obj: 1, solid: solid ? 1 : 0, c, st, ...extra });
O(T.TREE, 1, ['#2f6b2a', '#46963a', '#6b4a2a'], 'tree');
O(T.ROCK, 1, ['#7d808a', '#a2a5b0', '#5a5d68'], 'rock');
O(T.WALL, 1, ['#8d8d95', '#acacb6', '#666670'], 'brick');
O(T.FENCE, 1, ['#8a5a2c', '#b0773a', '#5e3a1a'], 'fence');
O(T.BUILD, 1, ['#e0d0aa', '#efe2c2', '#b8a47c'], 'brick');
O(T.DOOR, 0, ['#5a3a1c', '#7e5430', '#2e1c0c'], 'door');
O(T.GATE, 1, ['#6a4420', '#8a5c2c', '#3a2410'], 'gate');
O(T.GATE_OPEN, 0, ['#6a4420', '#8a5c2c', '#3a2410'], 'gateopen');
O(T.ROOF, 1, ['#b02a2a', '#d84a3a', '#7a1c1c'], 'roof');
O(T.CACTUS, 1, ['#3e8a46', '#5aa85a', '#2a6a32'], 'cactus');
O(T.PINE, 1, ['#255a3a', '#3a7a52', '#e8f0f8'], 'pine');
O(T.NEONWALL, 1, ['#1a1630', '#2e2a5a', '#2ee6ff'], 'neonwall');
O(T.CORAL, 1, ['#e0507a', '#ff8aa8', '#b03058'], 'coral');
O(T.TABLE, 1, ['#8a5a2c', '#b0773a', '#5e3a1a'], 'table');
O(T.SHELF, 1, ['#6e4a26', '#a0703a', '#d8c070'], 'shelf');
O(T.COUNTER, 1, ['#7a4a22', '#a8703a', '#4e2e14'], 'table');
O(T.LANTERN, 1, ['#4a3a2a', '#ffd070', '#ff9030'], 'lantern', { light: { r: 56, c: '255,190,90' } });
O(T.PORTAL, 0, ['#5a2aff', '#b08aff', '#4cf0ff'], 'portal', { anim: 1, light: { r: 48, c: '150,110,255' } });
O(T.FOUNTAIN, 1, ['#9a9aa8', '#6fb4f0', '#c8c8d4'], 'fountain', { anim: 1 });
O(T.CRYSTAL, 1, ['#6ad8ff', '#c8f4ff', '#3a8ac8'], 'crystal', { light: { r: 40, c: '110,210,255' }, lsamp: 2 });
O(T.DEADTREE, 1, ['#5a4a3a', '#7a6a52', '#3a2e22'], 'deadtree');
O(T.HOLO, 1, ['#101028', '#ff3fa4', '#2ee6ff'], 'holo', { anim: 1, light: { r: 40, c: '255,60,170' }, lsamp: 2 });
O(T.ICEWALL, 1, ['#9ed4ec', '#d8f2ff', '#6aa8c8'], 'rock');
O(T.HELLROCK, 1, ['#5a1e1e', '#8a3030', '#3a1010'], 'rock');
O(T.BED, 1, ['#d8d8e8', '#b03a3a', '#7a5a3a'], 'bed');
O(T.STALL, 1, ['#b83a3a', '#f0e8d0', '#7a5a3a'], 'stall');
O(T.BUILDEU, 1, ['#b86a4a', '#d08a66', '#8a4a30'], 'brick');
O(T.ROOFEU, 1, ['#4a5a74', '#6a7c98', '#303c52'], 'roof');
O(T.MACHINE, 1, ['#4a4a5a', '#ff6a2a', '#2ee6ff'], 'machine', { anim: 1, light: { r: 50, c: '255,140,60' } });
O(T.CANYONWALL, 1, ['#a24e2c', '#c0643a', '#7a3a20'], 'rock');
O(T.ARCH, 0, ['#6a6a74', '#2a2630', '#8a8a94'], 'arch');
O(T.STAIRS_UP, 0, ['#8a8a96', '#c8c8d4', '#4a4a56'], 'stairsup');
O(T.STAIRS_DOWN, 0, ['#8a8a96', '#c8c8d4', '#2a2a34'], 'stairsdown');
O(T.BARREL, 1, ['#8a5a2c', '#b0773a', '#3a3a3a'], 'barrel');
O(T.CRATE, 1, ['#a8803c', '#c89c50', '#6a4a20'], 'crate');
O(T.PILLAR, 1, ['#b8b8c4', '#e0e0ea', '#8a8a98'], 'pillar');

// ---- civiltà: terreni ----
d(T.MARBLEFLOOR, { c: ['#d8d4cc', '#ece8e0', '#b8b4ac'], st: 'tiles' });
d(T.DEADGRASS, { c: ['#5a6040', '#6e7450', '#454a30'], st: 'speck' });
d(T.MAGICGRASS, { c: ['#4a8a7a', '#7ad0b0', '#3a6a8a'], st: 'speck' });
d(T.OBSIDIANFLOOR, { c: ['#2a2430', '#403850', '#16121c'], st: 'speck' });
d(T.TATAMI, { c: ['#b8b070', '#d0c888', '#8a8450'], st: 'planks' });
d(T.JUNGLE, { c: ['#2e7a3a', '#3e9a4a', '#1f5a2c'], st: 'speck' });
d(T.DOCK, { c: ['#8a6a44', '#a88458', '#5a4430'], st: 'planks' });
// ---- civiltà: oggetti ----
O(T.ROOFCN, 1, ['#2a7a5a', '#e8c040', '#1a5a40'], 'roof');
O(T.WALLCN, 1, ['#b02a2a', '#e8c040', '#7a1c1c'], 'brick');
O(T.PAGODA, 1, ['#a82a2a', '#e8c040', '#3a1a1a'], 'pagoda');
O(T.MARBLE, 1, ['#e0dcd4', '#f4f0e8', '#b4b0a8'], 'brick');
O(T.COLUMN, 1, ['#ece8e0', '#ffffff', '#b4b0a8'], 'pillar');
O(T.STATUE, 1, ['#d8d8e0', '#f0f0f8', '#8a8a98'], 'statue');
O(T.TILEROOF, 1, ['#c0583a', '#e07a50', '#8a3a28'], 'roof');
O(T.ADOBE, 1, ['#d8a870', '#ecc088', '#a07848'], 'brick');
O(T.PALM, 1, ['#2e8a3a', '#4aae50', '#7a5a30'], 'palm');
O(T.HUT, 1, ['#b08a50', '#d8b070', '#6a4a28'], 'hut');
O(T.TOTEM, 1, ['#8a5a30', '#e84a4a', '#40b0d8'], 'totem');
O(T.SHIP, 1, ['#7a5230', '#e8e0d0', '#4a3220'], 'ship');
O(T.TREEHOUSE, 1, ['#2a7a4a', '#4ac07a', '#6a4a2a'], 'treehouse', { light: { r: 26, c: '120,255,180' }, lsamp: 5 });
O(T.ELVENWALL, 1, ['#8a6a3a', '#b08a50', '#4a8a4a'], 'brick');
O(T.GRAVE, 1, ['#8a8a94', '#b0b0ba', '#5a5a64'], 'grave');
O(T.MUSHROOM, 1, ['#d04a8a', '#ffd0e8', '#60e0c0'], 'mushroom', { light: { r: 30, c: '120,255,200' }, lsamp: 3 });
O(T.BAMBOO, 1, ['#5aa04a', '#8ad070', '#3a7a30'], 'bamboo');
O(T.OBSIDIAN, 1, ['#2a2430', '#4a4058', '#16121c'], 'rock');
O(T.DWARFWALL, 1, ['#6a6470', '#8a8494', '#3a3640'], 'brick');
O(T.FORGE, 1, ['#4a4450', '#ff8a30', '#ffd060'], 'forge', { light: { r: 44, c: '255,130,40' } });
O(T.BANNER, 1, ['#a82a3a', '#e8c040', '#5a1a20'], 'banner');
O(T.CATHEDRAL, 1, ['#c8c4bc', '#8ab8e8', '#8a867e'], 'cathedral');
O(T.RUBBLE, 0, ['#8a8a84', '#aaaaa4', '#5a5a54'], 'rubble');
O(T.TOWER, 1, ['#9a9aa4', '#b8b8c4', '#5a5a66'], 'brick');
O(T.ELVENLAMP, 1, ['#6a4a2a', '#a0ffd0', '#4aae80'], 'lantern', { light: { r: 48, c: '120,255,190' } });
O(T.BONFIRE, 1, ['#5a3a1a', '#ff9030', '#ffe070'], 'bonfire', { light: { r: 62, c: '255,150,60' } });
O(T.LIGHTHOUSE, 1, ['#e8e0d0', '#c03030', '#ffe070'], 'lighthouse', { light: { r: 70, c: '255,240,150' } });
O(T.GIANTTREE, 1, ['#1f6a3a', '#3a9a5a', '#5a3a1a'], 'tree');
O(T.VOLCANOCONE, 1, ['#3a2a2a', '#ff5a20', '#6a4a3a'], 'rock', { light: { r: 40, c: '255,100,30' }, lsamp: 3 });

// ---- città vive: arredi urbani e finestre ----
Object.assign(T, { SIGN: 93, LAMPPOST: 94, BENCH: 95, WELL: 96, CART: 97, TORCH: 98, FLOWERS: 99, DOORSHUT: 100, BALCONY: 101 });
O(T.SIGN, 1, ['#8a5a2c', '#e8d8a8', '#5e3a1a'], 'sign');
O(T.LAMPPOST, 1, ['#3a3a44', '#ffd878', '#ff9a30'], 'lamppost', { light: { r: 60, c: '255,200,110' } });
O(T.BENCH, 1, ['#8a5a2c', '#b0773a', '#4e2e14'], 'bench');
O(T.WELL, 1, ['#8f919b', '#3a6ab0', '#6a4a2a'], 'well');
O(T.CART, 1, ['#8a5a2c', '#c89c50', '#4e2e14'], 'cart');
O(T.TORCH, 1, ['#5a3a1a', '#ff9a30', '#ffe070'], 'torch', { anim: 1, light: { r: 46, c: '255,150,60' } });
O(T.FLOWERS, 0, ['#4a8a3a', '#e8508a', '#f0d040'], 'flowers');
O(T.DOORSHUT, 1, ['#4a3018', '#6a4a28', '#2a1a0c'], 'doorshut');
O(T.BALCONY, 1, ['#7a5230', '#a87a48', '#e8c8a0'], 'balcony');
// ---- barriere di progressione (distruttibili solo con i requisiti giusti) ----
Object.assign(T, { BOULDER: 140, BOULDER_C: 141, RUBBLEW: 142, RUBBLEW_C: 143, ICEBLK: 144, ICEBLK_C: 145, BARGATE: 146, BROKENBR: 147 });
O(T.BOULDER, 1, ['#7d7468', '#a39a8a', '#4e4840'], 'boulder', { barrier: 1 });
O(T.BOULDER_C, 1, ['#7d7468', '#a39a8a', '#4e4840'], 'boulderc', { barrier: 1 });
O(T.RUBBLEW, 1, ['#6a6660', '#8e8a82', '#3a3834'], 'rubblew', { barrier: 1 });
O(T.RUBBLEW_C, 1, ['#6a6660', '#8e8a82', '#3a3834'], 'rubblewc', { barrier: 1 });
O(T.ICEBLK, 1, ['#8ac8e8', '#d8f4ff', '#4a90c0'], 'iceblk', { barrier: 1, light: { r: 22, c: '150,220,255' }, lsamp: 3 });
O(T.ICEBLK_C, 1, ['#8ac8e8', '#d8f4ff', '#4a90c0'], 'iceblkc', { barrier: 1 });
O(T.BARGATE, 1, ['#3a3a44', '#7a7a88', '#c8a850'], 'bargate', { barrier: 1 });
O(T.BROKENBR, 1, ['#6e4a26', '#9a6a38', '#3a2a18'], 'brokenbr', { barrier: 1 });
// ---- postazioni di crafting ----
Object.assign(T, { WORKBENCH: 148, ALCHEMY: 149 });
O(T.WORKBENCH, 1, ['#8a5a2c', '#b0773a', '#c8c8d0'], 'workbench');
O(T.ALCHEMY, 1, ['#4a3a5a', '#7ad8a0', '#c8a0ff'], 'alchemy', { anim: 1, light: { r: 30, c: '140,255,190' }, lsamp: 2 });
// ---- Limbo ----
Object.assign(T, { LIMBOGRND: 150, LIMBOCRACK: 151, BLOOD: 152, LIMBOPATH: 153, BARETREE: 154, MAUSOLEUM: 155, BONES: 156, SKULLPILE: 157, BROKENCOL: 158, RUINWALL: 159, ARCHRUIN: 160, LIMBOWALL: 161, LIMBOROCK: 162 });
d(T.LIMBOGRND, { c: ['#3a3a42', '#4a4a54', '#2a2a32'], st: 'speck' });
d(T.LIMBOCRACK, { c: ['#34343c', '#44444e', '#16161c'], st: 'limbocrack' });
d(T.BLOOD, { c: ['#5a0e14', '#8a1a22', '#3a080c'], st: 'blood', liquid: 'shallow', slow: 0.55, anim: 1 });
d(T.LIMBOPATH, { c: ['#5a5650', '#6e6a62', '#403c38'], st: 'tiles' });
O(T.BARETREE, 1, ['#2a2220', '#4a3c34', '#16100e'], 'baretree');
O(T.MAUSOLEUM, 1, ['#6a6a74', '#8e8e9a', '#2a2a32'], 'mausoleum');
O(T.BONES, 0, ['#d8d0b8', '#f0e8d0', '#8a8470'], 'bones');
O(T.SKULLPILE, 1, ['#d8d0b8', '#f0e8d0', '#6a6450'], 'skullpile');
O(T.BROKENCOL, 1, ['#8a8a94', '#b0b0ba', '#5a5a64'], 'brokencol');
O(T.RUINWALL, 1, ['#5a5a64', '#74747e', '#34343c'], 'brick');
O(T.ARCHRUIN, 0, ['#6a6a74', '#16161c', '#8a8a94'], 'arch');
O(T.LIMBOWALL, 1, ['#22222a', '#34343e', '#101016'], 'rock');
O(T.LIMBOROCK, 1, ['#3a3a44', '#55555f', '#22222a'], 'rock');
// Per ogni parete: variante con finestra illuminata, buia e con imposte chiuse (palette = quella della parete)
export const WINDOW_OF = {};
{
  let nid = 102;
  for (const w of [T.BUILD, T.BUILDEU, T.WALLCN, T.MARBLE, T.ADOBE, T.ELVENWALL, T.DWARFWALL, T.TOWER, T.WALL, T.NEONWALL, T.CATHEDRAL, T.HUT]) {
    const base = DEFS[w], st = w === T.NEONWALL ? 'brick' : base.st === 'cathedral' ? 'brick' : base.st;
    void st;
    const lit = nid++, dark = nid++, shut = nid++;
    O(lit, 1, base.c, 'winlit', { light: { r: 24, c: '255,205,120' }, lsamp: 2 });
    O(dark, 1, base.c, 'windark');
    O(shut, 1, base.c, 'winshut');
    WINDOW_OF[w] = [lit, dark, shut];
  }
}

// ============================================================================================
// Sprite ALTI (montagne a piani, alberi di silhouette diverse, monumenti verticali) e pavimentazioni varie.
// La collisione resta sul solo tile di base (`solid`): la chioma/la cima è solo grafica (`tall` = righe di sprite sopra il tile).
// Gli id di tile sono 8 bit (0-255): questo blocco usa 163-255.
// ============================================================================================
export const MTN = {}, TREESET = {};
{
  let nid = 163; const nt = (name) => { if (nid > 255) throw new Error('Troppi tile (max 255)'); T[name] = nid++; return T[name]; };
  const OT = (name, solid, c, st, tall, extra = {}) => { const id = nt(name); O(id, solid, c, st, { tall, ...extra }); return id; };
  // montagne: 5 palette x 4 altezze (24, 32, 48, 64 px totali). Più alte dietro, più basse davanti: i piani si sovrappongono.
  const PAL = { rock: { c: ['#7d808a', '#a2a5b0', '#4e515c'] }, snow: { c: ['#7d808a', '#a8abb8', '#4e515c'], snow: 1 }, canyon: { c: ['#b2582f', '#d27a4a', '#7a3a20'], strata: 1 }, volcano: { c: ['#46302e', '#6a4a44', '#1e1414'], lava: 1 }, ice: { c: ['#8ec4de', '#d8f2ff', '#5a98b8'], snow: 1 } };
  for (const [pal, o] of Object.entries(PAL)) { MTN[pal] = {}; for (const tall of [8, 16, 32, 48]) MTN[pal][tall] = OT(`MTN_${pal.toUpperCase()}_${tall}`, 1, o.c, 'mtn', tall, { snow: o.snow, strata: o.strata, lava: o.lava, light: o.lava ? { r: 28, c: '255,110,40' } : undefined, lsamp: o.lava ? 6 : undefined }); }
  const G = ['#2f6b2a', '#4ea03e', '#5a3a1e'], G2 = ['#256028', '#3e8a3a', '#4a3018'], GS = ['#225a3a', '#3a8a52', '#4a3018'], DK = ['#1c4a2a', '#2e6a3a', '#3a2814'];
  for (const [name, tall, c, st, ex] of [
    ['PINE24', 24, GS, 'tallpine', {}], ['PINE32', 32, GS, 'tallpine', {}], ['PINE40', 40, GS, 'tallpine', {}], ['PINE32S', 32, GS, 'tallpine', { snow: 1 }], ['PINE40S', 40, GS, 'tallpine', { snow: 1 }],
    ['CYPRESS32', 32, DK, 'cypress', {}], ['CYPRESS24', 24, DK, 'cypress', {}],
    ['OAK24', 24, G, 'oak', {}], ['OAK32', 32, G2, 'oak', {}], ['OAKANCIENT', 40, ['#2a5a24', '#4a8a36', '#4a3018'], 'oak', {}],
    ['PALM28', 28, ['#3a9a40', '#6acb50', '#8a6a3a'], 'palm2', {}], ['PALM36', 36, ['#2e8a3a', '#5ac04a', '#7a5a30'], 'palm2', {}],
    ['TROPIC24', 24, ['#1f7a34', '#40b058', '#5a3a1e'], 'tropic', {}], ['TROPIC32', 32, ['#186a30', '#34a050', '#4a3018'], 'tropic', {}],
    ['TWISTED24', 24, ['#2a3a2a', '#4a5a3a', '#3a2a22'], 'twisted', {}], ['TWISTED32', 32, ['#243024', '#3e4e32', '#2e2018'], 'twisted', {}],
  ]) OT(name, 1, c, st, tall, ex);
  for (const [i, pc] of [[0, 'L'], [1, 'M'], [2, 'R']]) OT(`MONTREE_${pc}`, 1, ['#1f5a28', '#3e8a38', '#3e2a16'], 'montree', 44, { piece: i });
  OT('BUSH', 0, ['#3a8a34', '#62b04a', '#2a5a28'], 'bush', 0); OT('BUSH2', 0, ['#2f7a3a', '#58a850', '#2a5a28'], 'bush', 0);
  // monumenti verticali
  OT('PAGODA_T', 1, ['#a82a2a', '#e8c040', '#4a1a1a'], 'pagodatall', 48); OT('OBELISK', 1, ['#c8b890', '#e8dcb8', '#8a7a58'], 'obelisk', 48);
  OT('TOWER_T', 1, ['#9a9aa4', '#b8b8c4', '#5a5a66'], 'towertall', 40); OT('STATUE_T', 1, ['#d8d8e0', '#f0f0f8', '#8a8a98'], 'statuetall', 24);
  OT('PCOLUMN', 1, ['#ece8e0', '#ffffff', '#b4b0a8'], 'pcolumn', 32); OT('PCOLUMN_GOLD', 1, ['#ece8e0', '#ffffff', '#b4b0a8'], 'pcolumn', 32, { gold: 1 });
  OT('PINNACLE', 1, ['#c8c4bc', '#e8e4dc', '#8a867e'], 'pinnacle', 40); OT('PEDIMENT', 1, ['#e8e2d6', '#fffaf0', '#b4ac9c'], 'pediment', 0); OT('PEDIMENT_CREST', 1, ['#e8e2d6', '#fffaf0', '#b4ac9c'], 'pediment', 16, { crest: 1 });
  OT('GOLDRAIL', 1, ['#d8d2c6', '#fffaf0', '#8a8272'], 'goldrail', 0); OT('BRAZIER', 1, ['#8a6a20', '#e8c040', '#c8a030'], 'brazier', 4, { anim: 1, light: { r: 56, c: '255,190,90' } });
  OT('IMPBANNER', 1, ['#9a1a2a', '#e8c040', '#5a0e18'], 'imperialbanner', 32);
  // pavimentazioni
  const ground = (name, c, st, ex = {}) => { const id = nt(name); d(id, { c, st, ...ex }); return id; };
  ground('PAVE_IRR', ['#8c8a84', '#a8a69e', '#5e5c58'], 'paveirr'); ground('PAVE_SLAB', ['#cfc9bd', '#e6e0d4', '#a39d90'], 'paveslab'); ground('PAVE_EARTH', ['#9a7a4a', '#b4905a', '#7a5c34'], 'paveearth');
  ground('PAVE_MOSAIC', ['#d8cfc0', '#2a5a9a', '#a89c88'], 'pavemosaic'); ground('PAVE_WOOD', ['#9a6a38', '#b88444', '#5e3e1e'], 'pavewood'); ground('PAVE_ICE', ['#cfe8f4', '#f0fbff', '#8ab8d0'], 'paveice', { slow: 1.1 });
  ground('PAVE_SAND', ['#d9b878', '#ecd090', '#a88848'], 'pavesand'); ground('PAVE_RED', ['#a85a44', '#c4745a', '#6e3626'], 'paveslab'); ground('STEPS', ['#e2dccf', '#fffaf0', '#a8a294'], 'steps'); ground('GOLDFLOOR', ['#e8e2d6', '#fffaf0', '#b8b0a0'], 'goldfloor');
  // regno sottomarino di Thalassa: coralli alti, alghe, rovine, correnti (terreni che spingono chi ci cammina)
  OT('CORALT1', 1, ['#e0507a', '#ff8aa8', '#b03058'], 'coraltall', 24); OT('CORALT2', 1, ['#e8883a', '#ffc070', '#a85a20'], 'coraltall', 16); OT('CORALFAN', 1, ['#9a5ae0', '#d0a0ff', '#6a3aa8'], 'coralfan', 24);
  OT('KELP', 0, ['#2a8a4a', '#4ac070', '#1a5a30'], 'kelp', 24, { anim: 1 }); OT('SEAGRASS', 0, ['#3a9a5a', '#6ad090', '#1f6a3a'], 'seagrass', 0, { anim: 1 });
  OT('PEARL', 1, ['#e8f0ff', '#ffffff', '#a8b8d8'], 'pearl', 0, { light: { r: 46, c: '190,230,255' }, lsamp: 2 }); OT('TEMPLECOL', 1, ['#9ab0b8', '#c8dce0', '#5e7480'], 'pcolumn', 24);
  // varianti di tetto: stessi ingombri dei tetti originali, colori e materiali diversi (usate da Variety.roofVariety per dare un tetto proprio a ogni edificio)
  OT('ROOF_BLUE', 1, ['#2a4a8a', '#4a6ec0', '#1a2e5a'], 'roof', 0); OT('ROOF_GREEN', 1, ['#2a7a4a', '#4aa86a', '#1a4a2e'], 'roof', 0); OT('ROOF_SLATE', 1, ['#4a5060', '#7a8298', '#2e3240'], 'roof', 0);
  OT('ROOF_THATCH', 1, ['#c8a050', '#e8c878', '#8a6a30'], 'roof', 0); OT('ROOF_GOLD', 1, ['#d8a830', '#ffd868', '#8a6a18'], 'roof', 0); OT('ROOF_PURPLE', 1, ['#6a3a9a', '#9a6ad0', '#3e2260'], 'roof', 0);
  // ostacoli naturali per ambiente (non tutte le barriere sono rocce): siepi, tronchi, dune, cumuli di neve
  OT('THICKET', 1, ['#2f7a3a', '#4aa850', '#1a4a24'], 'thicket', 0); OT('LOGWALL', 1, ['#7a5230', '#a07444', '#4a2e18'], 'logwall', 0);
  OT('DUNEWALL', 1, ['#e2c77e', '#f4e2a8', '#b89a52'], 'dunewall', 0); OT('DRIFTWALL', 1, ['#e9f1f9', '#ffffff', '#a8bcd6'], 'driftwall', 0);
  OT('CLIFF', 1, ['#7d808a', '#a2a5b0', '#4e515c'], 'cliff', 0);   // parete di scogliera: la variante (vicini, bioma) decide faccia, lato o dorso
  OT('SEAROCK', 1, ['#9a6a4c', '#c8906a', '#5a3a2a'], 'searock', 0, { anim: 1 });   // scoglio in mare con spuma alla base
  OT('SHELLWALL', 1, ['#e8d8d0', '#fff0e8', '#b09890'], 'brick'); OT('SHELLROOF', 1, ['#d86a8a', '#ff9ab8', '#a03a5a'], 'roof'); OT('ABYSSROCK', 1, ['#1c2a44', '#2e4468', '#0c1424'], 'rock');
  ground('ABYSSFLOOR', ['#16223a', '#22345a', '#0e1626'], 'speck');
  for (const [name, dx, dy] of [['CURRENT_N', 0, -1], ['CURRENT_E', 1, 0], ['CURRENT_S', 0, 1], ['CURRENT_W', -1, 0]]) ground(name, ['#2e6fa0', '#5ab0e0', '#9ae0ff'], 'current', { push: [dx * 46, dy * 46], dirx: dx, diry: dy, anim: 1 });
  // campo
  OT('CAMPFIRE', 1, ['#6a4a2a', '#ff9030', '#ffe070'], 'campfire', 0, { anim: 1, light: { r: 76, c: '255,170,70' }, camp: 1 }); OT('TENT', 1, ['#b8a070', '#d8c090', '#8a7450'], 'tent', 0, { camp: 1 });
}

export const isLiquid = (id) => !!DEFS[id]?.liquid;

// skin nuove del terreno (vedi engine/TileSkins.js): erba con ciuffi che ondeggiano, ecc.
{
  const SK = { GRASS: 'grass', DIRT: 'dirt', SAND: 'sand', SNOW: 'snow', SWAMP: 'swamp', CANYON: 'canyon', ICE: 'ice', ASH: 'ash', CAVE: 'cave', SEABED: 'sand', JUNGLE: 'grass', MAGICGRASS: 'grass', DEADGRASS: 'grass' };
  for (const [n, st] of Object.entries(SK)) if (T[n] !== undefined && DEFS[T[n]]) DEFS[T[n]].st = st;
  for (const [n, tuft] of Object.entries({ GRASS: 'plain', JUNGLE: 'jungle', MAGICGRASS: 'magic', DEADGRASS: 'dead' })) if (T[n] !== undefined && DEFS[T[n]]) { DEFS[T[n]].anim = 1; DEFS[T[n]].wave = 1; DEFS[T[n]].tuft = tuft; }
  for (const [n, st] of Object.entries({ BONFIRE: 'bonfire', TORCH: 'torch', LANTERN: 'lantern' })) if (T[n] !== undefined && DEFS[T[n]]) { DEFS[T[n]].st = st; DEFS[T[n]].anim = 1; }
}

// palette per città: muri e tetti accettano la palette scelta (vedi engine/TownStyles.js)
for (let id = 0; id < 256; id++) { const d = DEFS[id]; if (!d || !d.obj) continue; if (d.st === 'roof') d.palroof = 1; if (d.st === 'brick' || d.st === 'winlit' || d.st === 'windark' || d.st === 'winshut') if (id !== T.WALL && id !== T.RUINWALL && id !== T.DWARFWALL && id !== T.NEONWALL && id !== T.ELVENWALL) d.palwall = 1; }
