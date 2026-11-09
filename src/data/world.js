// Definizione dichiarativa del mondo: mappe, piani, biomi, città, avamposti, sentieri, requisiti d'accesso.
// Per aggiungere un'area basta una voce in MAPS (+ un generatore se serve un nuovo `gen`).
//
// Livelli in altezza:
//  - interni: `stairs:[{id,x,y,dir:'up'|'down',to}]` (la stessa `id` va dichiarata nei due piani) e `elevator:[x,y]` + `floors`
//  - grotte/alture: `next:{id,dir}` mette una scala verso il livello successivo, `prev` è il livello da cui si arriva,
//    `gates:[{to,req,deny}]` mette ingressi verso altre mappe, `boss` un boss finale.
import { T } from './tiles.js';
import { OX, OY, BIOME_LIST, ZONE_NAMES_NEW, NEW_DUNGEONS, CIV_ROOMS, NEW_SITES } from './realm.js';

export const BIOME_IDS = BIOME_LIST;
export const ZONE_NAMES = {
  meadow: 'Praterie di Hinomoto', forest: 'Foresta delle Nove Code', swamp: 'Palude di Kuroki',
  desert: 'Deserto Cremisi', snow: 'Monti Shirayuki', canyon: 'Canyon di Ryūko', ocean: 'Mare di Nebbia',
};

const SUIT = [['equip', 'suit']];
const AFTER_KAMIOS = [['flag', 'boss:kamios']];
const AFTER_ENMA = [['flag', 'boss:enma']];

// ---- fabbriche di definizioni ----
const room = (n, w, h, o = {}) => ({ n, type: 'interior', gen: 'interior', w, h, floor: T.WOOD, ...o });
const cave = (n, theme, o = {}) => ({ n, type: 'cave', gen: 'cave', w: 96, h: 72, theme, biome: 'cave', ...o });
const high = (n, theme, biome, o = {}) => ({ n, type: 'highland', gen: 'cave', w: 112, h: 84, theme, biome, ...o });
const exitTo = (to, anchor) => ({ to, ...(anchor ? { anchor } : {}) });
const up = (id, x, y, to) => ({ id, x, y, dir: 'up', to });
const down = (id, x, y, to) => ({ id, x, y, dir: 'down', to });
const FL = (n, to) => ({ n, to, anchor: 'elev' }); // voce di ascensore

export const MAPS = {
  limbo: { n: 'Limbo', type: 'limbo', gen: 'limbo', biome: 'limbo', w: 96, h: 72, seed: 1, cfg: 0, trial: 'enigma', ambient: [26, 28, 42, 0.5] },
  capitale_festa: { n: 'Augusta Imperialis · Giorno della Vittoria', type: 'outdoor', gen: 'finale', biome: 'meadow', w: 64, h: 58, seed: 77, finale: true },
  overworld: { n: 'Terre di Hinomoto', type: 'outdoor', gen: 'overworld', w: 320, h: 224, seed: 11, mobs: 480 },

  // ===== Hinomura: case a più piani con soffitte e cantine =====
  int_elder: room("Casa dell'Anziano", 14, 10, { rug: [4, 4, 6, 3], tables: [[2, 2], [8, 2]], shelves: 1, lanterns: [[1, 8], [12, 8]], exit: exitTo('overworld'), stairs: [up('elder_a', 11, 2, 'int_elder_2f')] }),
  int_elder_2f: room("Archivio dell'Anziano (soffitta)", 16, 10, { shelves: 1, rug: [5, 4, 6, 3], tables: [[2, 3], [13, 3]], crates: [[1, 7], [14, 7]], lanterns: [[7, 8]], stairs: [down('elder_a', 11, 2, 'int_elder')],
    props: [{ type: 'sign', sprite: 'sign', x: 7, y: 2, text: "Pergamene ingiallite: «Chi indossa la maschera spezza o ricuce il Filo. Così fu per il Primo Kitsune, che perse tutto...»" },
      { type: 'chest', id: 'elder_attic', x: 14, y: 5, loot: [['pozione_ki_s', 2], ['lente_cronica', 1]], gold: 60 }] }),
  int_smith: room('Fucina di Tetsuo', 16, 11, { floor: T.STONE, counter: [3, 12, 5], tables: [[12, 3]], shelves: 1, lanterns: [[1, 9], [14, 9]], exit: exitTo('overworld'), stairs: [down('smith_a', 14, 2, 'int_smith_b1')] }),
  int_smith_b1: room('Forgia Sotterranea', 16, 11, { floor: T.STONE, barrels: [[1, 3], [2, 3], [13, 8], [14, 8]], crates: [[7, 8], [8, 8]], lanterns: [[3, 8], [12, 3]], ambient: [40, 12, 8, 0.25], stairs: [up('smith_a', 14, 2, 'int_smith')],
    props: [{ type: 'chest', id: 'smith_cellar', x: 8, y: 5, loot: [['ferro_grezzo', 4], ['carbone', 3]], gold: 40 }] }),
  int_pharma: room('Farmacia di Hanae', 14, 10, { counter: [3, 10, 4], shelves: 1, rug: [4, 6, 6, 2], exit: exitTo('overworld'), stairs: [down('pharma_a', 11, 2, 'int_pharma_b1')] }),
  int_pharma_b1: room('Cantina delle Erbe', 14, 10, { floor: T.STONE, barrels: [[1, 2], [2, 2], [11, 7], [12, 7]], crates: [[6, 6], [7, 6]], ambient: [20, 24, 20, 0.25], stairs: [up('pharma_a', 11, 2, 'int_pharma')],
    props: [{ type: 'chest', id: 'pharma_cellar', x: 4, y: 5, loot: [['erba_medicinale', 3], ['fungo_luna', 2]] }] }),
  int_inn: room('Locanda della Luna Rossa', 18, 11, { counter: [6, 11, 4], beds: [[2, 2], [4, 2], [14, 2], [16, 2]], tables: [[3, 7], [13, 7]], lanterns: [[1, 9], [16, 9]], exit: exitTo('overworld'),
    stairs: [up('inn_a', 9, 2, 'int_inn_2f'), down('inn_b', 2, 8, 'int_inn_b1')] }),
  int_inn_2f: room('Locanda · Camere', 18, 11, { beds: [[2, 2], [4, 2], [6, 2], [12, 2], [14, 2], [16, 2]], rug: [6, 5, 6, 3], lanterns: [[1, 9], [16, 9]], stairs: [down('inn_a', 9, 2, 'int_inn')],
    props: [{ type: 'chest', id: 'inn_room', x: 15, y: 6, loot: [['sake', 2], ['dango', 3]], gold: 30 }] }),
  int_inn_b1: room('Locanda · Cantina', 18, 11, { floor: T.STONE, barrels: [[1, 2], [2, 2], [3, 2], [14, 2], [15, 2], [16, 2]], crates: [[8, 6], [9, 6]], ambient: [30, 20, 10, 0.3], stairs: [up('inn_b', 2, 8, 'int_inn')],
    props: [{ type: 'chest', id: 'inn_cellar', x: 15, y: 6, loot: [['ramen', 2], ['pozione_vita_s', 2]] }] }),
  int_fire_shrine: room('Santuario del Fuoco', 12, 10, { floor: T.STONE, rug: [4, 3, 4, 5], lanterns: [[2, 2], [9, 2], [2, 7], [9, 7]], exit: exitTo('overworld'), stairs: [down('fire_a', 7, 7, 'int_fire_crypt')] }),
  int_fire_crypt: room('Cripta del Fuoco', 14, 10, { floor: T.STONE, pillars: [[3, 3], [10, 3], [3, 6], [10, 6]], lanterns: [[6, 2]], ambient: [50, 10, 10, 0.3], stairs: [up('fire_a', 9, 2, 'int_fire_shrine')],
    props: [{ type: 'chest', id: 'fire_crypt', x: 6, y: 5, loot: [['omamori_fuoco', 1], ['elisir_fuoco', 1]] }] }),

  // ===== Aurelburg: torre dell'orologio, laboratori, cantine =====
  int_lab: room('Laboratorio di Von Zeitlauf', 22, 14, { floor: T.STONE, machine: [10, 2], tables: [[3, 2], [17, 2], [3, 9], [18, 9]], shelves: 1, lanterns: [[1, 12], [20, 12]], exit: exitTo('overworld'),
    stairs: [down('lab_b', 19, 5, 'int_lab_b1'), up('lab_u', 2, 5, 'int_lab_2f')], props: [{ type: 'dlg', sprite: 'console', dlg: 'machine', x: 10, y: 5 }] }),
  int_lab_b1: room('Sotterranei del Laboratorio', 22, 14, { floor: T.STONE, machine: [10, 6], barrels: [[1, 2], [2, 2], [19, 2], [20, 2]], crates: [[5, 10], [6, 10], [15, 10]], ambient: [20, 30, 60, 0.3], stairs: [up('lab_b', 19, 5, 'int_lab')],
    props: [{ type: 'sign', sprite: 'sign', x: 8, y: 9, text: "Quaderno di Ottokar: «Il cliente mascherato pagò in lingotti d'oro che non portavano il conio di nessun re... né di nessun'epoca.»" },
      { type: 'chest', id: 'lab_cellar', x: 17, y: 10, loot: [['polvere_stelle', 2], ['nucleo_energia', 1]], gold: 150 }] }),
  int_lab_2f: room('Osservatorio', 22, 14, { tables: [[3, 3], [18, 3]], rug: [8, 5, 6, 4], lanterns: [[1, 12], [20, 12]], stairs: [down('lab_u', 2, 5, 'int_lab')],
    props: [{ type: 'sign', sprite: 'sign', x: 10, y: 3, text: 'Un telescopio puntato su un cielo con DUE lune. Una è segnata a matita: «Non dovrebbe esserci».' }] }),
  int_market: room('Mercato Coperto di Aurelburg', 18, 11, { counter: [3, 14, 4], shelves: 1, rug: [4, 6, 10, 2], exit: exitTo('overworld'), stairs: [up('mkt_a', 16, 2, 'int_market_2f')] }),
  int_market_2f: room('Magazzino del Mercato', 18, 11, { crates: [[2, 2], [3, 2], [4, 2], [13, 2], [14, 2], [2, 6], [3, 6], [12, 7], [13, 7]], barrels: [[8, 3], [9, 3]], stairs: [down('mkt_a', 16, 2, 'int_market')],
    props: [{ type: 'chest', id: 'market_store', x: 8, y: 7, loot: [['pozione_vita_m', 2], ['strudel', 3]], gold: 90 }] }),
  int_inn_eu: room('Locanda del Cervo Dorato', 16, 10, { counter: [5, 10, 4], beds: [[2, 2], [4, 2], [12, 2], [14, 2]], tables: [[3, 6], [12, 6]], exit: exitTo('overworld'),
    stairs: [up('eu_a', 8, 2, 'int_inn_eu_2f'), down('eu_b', 6, 7, 'int_inn_eu_b1')] }),
  int_inn_eu_2f: room('Cervo Dorato · Suite', 16, 10, { beds: [[2, 2], [4, 2], [6, 2], [10, 2], [12, 2], [14, 2]], rug: [5, 5, 6, 3], stairs: [down('eu_a', 8, 2, 'int_inn_eu')] }),
  int_inn_eu_b1: room('Cervo Dorato · Cantina', 16, 10, { floor: T.STONE, barrels: [[1, 2], [2, 2], [3, 2], [12, 2], [13, 2], [14, 2]], crates: [[7, 6], [8, 6]], stairs: [up('eu_b', 6, 2, 'int_inn_eu')],
    props: [{ type: 'chest', id: 'eu_cellar', x: 13, y: 6, loot: [['birra', 3], ['wurst', 2]], gold: 70 }] }),
  int_hall: room('Palazzo del Consiglio', 20, 12, { floor: T.STONE, rug: [6, 4, 8, 5], tables: [[3, 3], [16, 3]], lanterns: [[1, 10], [18, 10], [1, 2], [18, 2]], exit: exitTo('overworld'), stairs: [up('hall_a', 9, 2, 'int_hall_2f')] }),
  int_hall_2f: room('Sala del Consiglio', 20, 12, { floor: T.STONE, rug: [5, 3, 10, 6], pillars: [[3, 3], [16, 3], [3, 8], [16, 8]], lanterns: [[9, 9]], stairs: [down('hall_a', 9, 2, 'int_hall')],
    props: [{ type: 'chest', id: 'hall_vault', x: 17, y: 5, loot: [['giubbotto_aurelburg', 1], ['pozione_vita_l', 1]], gold: 200 }] }),
  int_tower: room("Torre dell'Orologio · Piano terra", 12, 10, { floor: T.STONE, pillars: [[2, 3], [9, 3]], exit: exitTo('overworld'), stairs: [up('tw_a', 6, 2, 'int_tower_2')] }),
  int_tower_2: room("Torre dell'Orologio · Ingranaggi", 12, 10, { floor: T.STONE, crates: [[2, 5], [9, 5]], stairs: [down('tw_a', 3, 2, 'int_tower'), up('tw_b', 8, 2, 'int_tower_3')] }),
  int_tower_3: room("Torre dell'Orologio · Meccanismo", 12, 10, { floor: T.STONE, machine: [5, 4], stairs: [down('tw_b', 3, 2, 'int_tower_2'), up('tw_c', 8, 2, 'int_tower_4')] }),
  int_tower_4: room("Torre dell'Orologio · Campanile", 12, 10, { floor: T.STONE, lanterns: [[2, 7], [9, 7]], stairs: [down('tw_c', 3, 2, 'int_tower_3')],
    props: [{ type: 'chest', id: 'tower_top', x: 6, y: 5, loot: [['amuleto_sabbia', 1], ['elisir_vento', 2]], gold: 120 },
      { type: 'sign', sprite: 'sign', x: 4, y: 6, text: 'Da quassù si vede tutto il Regno: a sud-ovest Hinomura, a nord le nevi, a est il Deserto Cremisi. Il vento sa di tempo.' }] }),

  // ===== Avamposti lungo le strade (riposo, notizie, scorciatoie di lore) =====
  int_inn_road: room('Locanda di Nagi', 14, 9, { counter: [3, 10, 4], beds: [[2, 2], [11, 2]], lanterns: [[1, 7], [12, 7]], exit: exitTo('overworld') }),
  int_cabin_nagi: room('Casa del Carrettiere', 12, 8, { rug: [4, 3, 4, 3], tables: [[2, 2]], beds: [[9, 2]], exit: exitTo('overworld'),
    props: [{ type: 'chest', id: 'nagi_cabin', x: 9, y: 5, loot: [['pozione_vita_s', 2], ['bacche_blu', 3]] }] }),
  int_cabin_kozue: room('Capanna dei Boscaioli', 12, 8, { rug: [4, 3, 4, 3], beds: [[2, 2], [9, 2]], crates: [[9, 5]], exit: exitTo('overworld') }),
  int_sawmill: room('Segheria di Kozue', 14, 9, { counter: [3, 10, 4], crates: [[1, 2], [2, 2], [11, 2], [12, 2]], barrels: [[1, 6], [12, 6]], exit: exitTo('overworld') }),
  int_lodge: room('Rifugio Yukimura', 14, 9, { counter: [3, 10, 4], beds: [[2, 2], [11, 2]], rug: [4, 6, 6, 2], lanterns: [[1, 7], [12, 7]], exit: exitTo('overworld') }),
  int_tent_sunari: room('Tenda di Sunari', 12, 8, { floor: T.RUG, tables: [[2, 2]], lanterns: [[1, 6], [10, 6]], exit: exitTo('overworld') }),
  int_stilt: room('Palafitta di Numa', 12, 8, { floor: T.WOOD, tables: [[9, 2]], beds: [[2, 2]], barrels: [[10, 5]], exit: exitTo('overworld') }),

  // ===== Neo-Edo: negozio, grattacielo con ascensore, tetto, fogne =====
  int_neo_vendor: room('Bazar MX-9', 14, 10, { floor: T.NEON, counter: [3, 10, 4], shelves: 1, ambient: [40, 10, 70, 0.25], exit: exitTo('neo_edo') }),
  int_neo_tower: room('Torre Kami · Atrio', 16, 12, { floor: T.NEON, ambient: [40, 10, 70, 0.25], exit: exitTo('neo_edo'), elevator: [13, 2],
    floors: [FL('Piano 2 · Uffici', 'int_neo_tower_2'), FL('Piano 3 · Server', 'int_neo_tower_3'), FL('Piano 4 · Attico', 'int_neo_tower_4'), { n: 'Tetto', to: 'neo_roof', anchor: 'entry' }] }),
  int_neo_tower_2: room('Torre Kami · Uffici', 16, 12, { floor: T.NEON, ambient: [40, 10, 70, 0.25], elevator: [13, 2], tables: [[2, 3], [5, 3], [2, 7], [5, 7]],
    floors: [FL('Atrio', 'int_neo_tower'), FL('Piano 3 · Server', 'int_neo_tower_3'), FL('Piano 4 · Attico', 'int_neo_tower_4'), { n: 'Tetto', to: 'neo_roof', anchor: 'entry' }] }),
  int_neo_tower_3: room('Torre Kami · Server', 16, 12, { floor: T.NEON, ambient: [30, 10, 80, 0.3], elevator: [13, 2], crates: [[2, 3], [3, 3], [2, 6], [3, 6], [6, 3], [7, 3]],
    floors: [FL('Atrio', 'int_neo_tower'), FL('Piano 2 · Uffici', 'int_neo_tower_2'), FL('Piano 4 · Attico', 'int_neo_tower_4'), { n: 'Tetto', to: 'neo_roof', anchor: 'entry' }],
    props: [{ type: 'chest', id: 'neo_server', x: 6, y: 8, loot: [['nucleo_energia', 2], ['chip_neon', 4]], gold: 300 }] }),
  int_neo_tower_4: room('Torre Kami · Attico', 16, 12, { floor: T.NEON, ambient: [50, 10, 70, 0.25], elevator: [13, 2], rug: [4, 4, 7, 4],
    floors: [FL('Atrio', 'int_neo_tower'), FL('Piano 2 · Uffici', 'int_neo_tower_2'), FL('Piano 3 · Server', 'int_neo_tower_3'), { n: 'Tetto', to: 'neo_roof', anchor: 'entry' }],
    props: [{ type: 'chest', id: 'neo_penthouse', x: 7, y: 6, loot: [['tuta_neo', 1], ['pozione_ki_l', 2]], gold: 400 }] }),

  // ===== Dungeon a più livelli =====
  fox_cave: cave("Antro della Volpe · Soglia", 'fox', { seed: 21, ambient: [10, 8, 24, 0.55], exit: exitTo('overworld'), next: { id: 'fox_cave_2', dir: 'down' } }),
  fox_cave_2: cave("Antro della Volpe · Cunicoli", 'fox', { seed: 22, ambient: [10, 8, 24, 0.6], prev: 'fox_cave', next: { id: 'fox_cave_3', dir: 'down' } }),
  fox_cave_3: cave("Antro della Volpe · Trono dell'Oni", 'fox', { seed: 23, ambient: [24, 6, 16, 0.6], prev: 'fox_cave_2', boss: 'oni_kurogane' }),
  swamp_hollow: cave('Cavità di Kuroki · Radici', 'swamp', { seed: 24, ambient: [10, 30, 20, 0.5], exit: exitTo('overworld'), next: { id: 'swamp_hollow_2', dir: 'down' },
    props: [{ type: 'chest', id: 'suit_chest', hidden: true, loot: [['tuta_sub', 1]], note: 'Una tuta stagna dimenticata da un vecchio palombaro.' }] }),
  swamp_hollow_2: cave("Cavità di Kuroki · Covo dell'Idra", 'swamp', { seed: 25, ambient: [10, 34, 22, 0.55], prev: 'swamp_hollow', boss: 'yatsuhashi' }),
  sand_tomb: cave('Tomba della Sfinge · Anticamera', 'tomb', { seed: 26, ambient: [40, 20, 10, 0.45], exit: exitTo('overworld'), next: { id: 'sand_tomb_2', dir: 'down' } }),
  sand_tomb_2: cave('Tomba della Sfinge · Sale dei Sarcofagi', 'tomb', { seed: 27, ambient: [40, 20, 10, 0.5], prev: 'sand_tomb', next: { id: 'sand_tomb_3', dir: 'down' } }),
  sand_tomb_3: cave('Tomba della Sfinge · Camera Cremisi', 'tomb', { seed: 28, ambient: [50, 16, 10, 0.55], prev: 'sand_tomb_2', boss: 'sfinge_cremisi' }),
  frost_cave: cave('Caverna di Tsurara · Gallerie', 'frost', { seed: 29, ambient: [60, 90, 140, 0.4], exit: exitTo('shirayuki_3', 'door_frost_cave'), next: { id: 'frost_cave_2', dir: 'down' } }),
  frost_cave_2: cave('Caverna di Tsurara · Cattedrale di Ghiaccio', 'frost', { seed: 30, ambient: [60, 90, 150, 0.45], prev: 'frost_cave', boss: 'regina_tsurara' }),
  canyon_temple: cave('Tempio del Corvo · Cortile', 'temple', { seed: 31, ambient: [40, 20, 20, 0.4], exit: exitTo('ryuko_floor', 'door_canyon_temple'), next: { id: 'canyon_temple_2', dir: 'up' } }),
  canyon_temple_2: cave('Tempio del Corvo · Guglia', 'temple', { seed: 32, ambient: [40, 20, 20, 0.35], prev: 'canyon_temple', boss: 'tengu_karasu' }),
  yomi: cave('Yomi · Le Porte', 'yomi', { type: 'underworld', biome: 'underworld', w: 112, h: 84, seed: 33, ambient: [70, 10, 10, 0.4], exit: exitTo('ryuko_floor', 'door_yomi'), next: { id: 'yomi_2', dir: 'down' } }),
  yomi_2: cave('Yomi · Fiume Sanzu', 'yomi', { type: 'underworld', biome: 'underworld', w: 112, h: 84, seed: 34, ambient: [70, 10, 14, 0.45], prev: 'yomi', next: { id: 'yomi_3', dir: 'down' } }),
  yomi_3: cave('Yomi · Palazzo di Enma', 'yomi', { type: 'underworld', biome: 'underworld', w: 112, h: 84, seed: 35, ambient: [80, 8, 12, 0.5], prev: 'yomi_2', boss: 'enma' }),

  // ===== Alture: Monti Shirayuki e Canyon di Ryūko, sviluppati in quota =====
  shirayuki_1: high('Monti Shirayuki · Sentiero dei Pini', 'pine', 'snow', { seed: 41, exit: exitTo('overworld'), next: { id: 'shirayuki_2', dir: 'up' } }),
  shirayuki_2: high('Monti Shirayuki · Cresta Gelata', 'ridge', 'snow', { seed: 42, prev: 'shirayuki_1', next: { id: 'shirayuki_3', dir: 'up' } }),
  shirayuki_3: high('Monti Shirayuki · Vetta', 'summit', 'snow', { seed: 43, prev: 'shirayuki_2', gates: [{ to: 'frost_cave' }] }),
  ryuko_rim: high('Canyon di Ryūko · Orlo', 'rim', 'canyon', { seed: 44, exit: exitTo('overworld'), next: { id: 'ryuko_mid', dir: 'down' } }),
  ryuko_mid: high('Canyon di Ryūko · Pareti', 'ridge2', 'canyon', { seed: 45, prev: 'ryuko_rim', next: { id: 'ryuko_floor', dir: 'down' } }),
  ryuko_floor: high('Canyon di Ryūko · Fondo', 'floor2', 'canyon', { seed: 46, prev: 'ryuko_mid',
    gates: [{ to: 'canyon_temple' }, { to: 'yomi', req: AFTER_KAMIOS, deny: 'Un sigillo oscuro blocca la gola. Reagisce solo al Fuoco Nero...' }] }),

  // ===== Mondi lontani =====
  ryugu: { n: 'Palazzo di Ryūgū · Scogliera', type: 'underwater', gen: 'underwater', biome: 'underwater', w: 100, h: 80, seed: 51, ambient: [10, 60, 110, 0.4],
    exit: exitTo('overworld', 'door_ryugu'), next: { id: 'ryugu_2', dir: 'down' } },
  ryugu_2: cave('Palazzo di Ryūgū · Sala del Trono', 'abyss', { type: 'underwater', biome: 'underwater', w: 96, h: 72, seed: 52, ambient: [10, 50, 110, 0.45], prev: 'ryugu', boss: 'ryujin' }),
  chrono_rift: { n: 'Il Tempo Spezzato', type: 'parallel', gen: 'parallel', biome: 'parallel', w: 64, h: 48, seed: 61, ambient: [30, 10, 80, 0.3],
    nodes: { hub: [32, 22, 6], neo: [12, 10, 4], yomi: [52, 10, 4], heart: [32, 40, 4], home: [10, 38, 3] },
    edges: [['hub', 'neo'], ['hub', 'yomi'], ['hub', 'heart'], ['hub', 'home']],
    pads: [
      { node: 'neo', to: 'neo_edo', anchor: 'entry' },
      { node: 'yomi', to: 'yomi', anchor: 'entry', req: AFTER_KAMIOS, deny: 'Le Terre dei Morti restano sigillate. Serve la Fiamma Nera.' },
      { node: 'heart', to: 'heart_of_time', anchor: 'entry', req: AFTER_ENMA, deny: 'Il Cuore del Tempo è oltre il giudizio di Enma.' },
      { node: 'home', to: 'overworld', anchor: 'door_int_lab' },
    ] },
  heart_of_time: { n: 'Cuore del Tempo', type: 'parallel', gen: 'parallel', biome: 'parallel', w: 48, h: 40, seed: 62, boss: 'mugenkai', ambient: [60, 20, 110, 0.25],
    nodes: { arena: [24, 18, 12], gate: [24, 36, 3] }, edges: [['arena', 'gate']], pads: [{ node: 'gate', to: 'chrono_rift', anchor: 'from_heart' }] },
  neo_edo: { n: 'Neo-Edo 2187', type: 'cyber', gen: 'cyber', biome: 'cyber', w: 128, h: 112, seed: 71, boss: 'kamios', ambient: [30, 10, 70, 0.4], exit: { to: 'chrono_rift', anchor: 'from_neo' } },
  neo_under: cave('Neo-Edo · Fogne', 'sewer', { type: 'cave', biome: 'cyber', w: 96, h: 72, seed: 72, ambient: [20, 40, 50, 0.45], prev: 'neo_edo' }),
  neo_roof: high('Neo-Edo · Tetti', 'roof', 'cyber', { seed: 73, w: 96, h: 72, exit: exitTo('int_neo_tower_4', 'elev') }),
};

// Ingressi sull'overworld. (x,y) = tile davanti alla porta; i requisiti vanno qui.
export const ENTRANCES = [
  { id: 'fox_cave', x: 72, y: 72 },
  { id: 'swamp_hollow', x: 92, y: 188 },
  { id: 'sand_tomb', x: 272, y: 96 },
  { id: 'shirayuki_1', x: 141, y: 44 },
  { id: 'ryuko_rim', x: 248, y: 56 },
];

export const BUILDINGS_OW = [{ id: 'int_fire_shrine', x: 107, y: 46, w: 7, h: 5, style: 'jp' }];

// Isolotto con punto d'immersione (richiede tuta da sub + delfino per attraversare il fossato d'acqua profonda)
export const DIVE = { x: 300, y: 210, to: 'ryugu', req: SUIT, deny: 'Per immergersi servirebbe una tuta da sub.' };

// Città murate con cancelli che si chiudono di notte
export const TOWNS = {
  hinomura: {
    n: 'Hinomura', style: 'jp', x: 124, y: 96, w: 36, h: 28, gates: ['s', 'n', 'w'],
    buildings: [
      { id: 'int_elder', x: 4, y: 2, w: 7, h: 5 }, { id: 'int_smith', x: 24, y: 2, w: 7, h: 5 },
      { id: 'int_pharma', x: 4, y: 19, w: 7, h: 5 }, { id: 'int_inn', x: 24, y: 19, w: 9, h: 5 },
    ],
    stalls: [[12, 12], [13, 12], [14, 12], [21, 12], [22, 12], [23, 12]],
    lanterns: [[16, 12], [19, 12], [16, 15], [19, 15], [9, 10], [29, 10]],
    fountain: [[26, 16]],
    anchors: { start: [17, 16] },
  },
  aurelburg: {
    n: 'Aurelburg', style: 'eu', towers: 1, x: 232, y: 150, w: 44, h: 32, gates: ['w', 'n', 'e', 's'],
    buildings: [
      { id: 'int_lab', x: 4, y: 2, w: 9, h: 6 }, { id: 'int_market', x: 31, y: 2, w: 9, h: 6 }, { id: 'int_tower', x: 24, y: 2, w: 6, h: 7 },
      { id: 'int_inn_eu', x: 4, y: 24, w: 9, h: 6 }, { id: 'int_hall', x: 31, y: 24, w: 9, h: 6 },
      { id: 'int_cathedral', x: 14, y: 2, w: 6, h: 7 }, { id: 'int_castle', x: 24, y: 22, w: 6, h: 8 },
    ],
    lanterns: [[19, 13], [24, 13], [19, 18], [24, 18], [9, 14], [34, 14]],
    fountain: [[21, 15], [22, 15], [21, 16], [22, 16]],
    anchors: { aurelburg_gate: [1, 15] },
  },
};

// Piccoli insediamenti sicuri lungo le strade (zone senza nemici con locanda e santuario)
export const OUTPOSTS = [
  { id: 'nagi', n: 'Crocevia di Nagi', x: 178, y: 158, w: 20, h: 12, style: 'jp', buildings: [{ id: 'int_inn_road', x: 2, y: 2, w: 7, h: 5 }, { id: 'int_cabin_nagi', x: 10, y: 2, w: 6, h: 5 }], lanterns: [[1, 9], [9, 9], [18, 9]], shrine: [14, 9] },
  { id: 'kozue', n: 'Villaggio dei Boscaioli', x: 88, y: 100, w: 20, h: 12, style: 'jp', buildings: [{ id: 'int_cabin_kozue', x: 2, y: 2, w: 6, h: 5 }, { id: 'int_sawmill', x: 10, y: 2, w: 7, h: 5 }], lanterns: [[1, 8], [9, 8], [18, 8]], shrine: [14, 8] },
  { id: 'yuki', n: 'Rifugio Yukimura', x: 131, y: 64, w: 22, h: 12, style: 'jp', buildings: [{ id: 'int_lodge', x: 2, y: 2, w: 8, h: 5 }], lanterns: [[1, 8], [11, 8]], shrine: [16, 8] },
  { id: 'sunari', n: 'Oasi di Sunari', x: 250, y: 124, w: 22, h: 14, style: 'eu', buildings: [{ id: 'int_tent_sunari', x: 6, y: 2, w: 7, h: 5 }], pond: [16, 8, 3], lanterns: [[2, 8]], shrine: [12, 9] },
  { id: 'numa', n: 'Palafitte di Numa', x: 102, y: 158, w: 20, h: 12, style: 'jp', buildings: [{ id: 'int_stilt', x: 3, y: 2, w: 7, h: 5 }], lanterns: [[1, 8], [12, 8]], shrine: [15, 8], link: [108, 172] },
];

// Santuari isolati: curano, salvano e fissano il punto di rinascita
export const SHRINES = [
  { id: 'road1', x: 147, y: 146 }, { id: 'forest', x: 77, y: 92 }, { id: 'swamp', x: 97, y: 176 },
  { id: 'east', x: 210, y: 170 }, { id: 'canyon', x: 258, y: 95 }, { id: 'north', x: 136, y: 50 },
];

// Sentieri (coordinate assolute, larghezza 2). Sui corsi d'acqua diventano ponti.
export const PATHS = [
  [[141, 125], [141, 165], [230, 165]],                        // Hinomura -> Aurelburg (strada maestra)
  [[141, 94], [141, 45]],                                      // verso i Monti Shirayuki
  [[141, 70], [110, 70], [110, 51]],                           // Santuario del Fuoco
  [[122, 109], [72, 109], [72, 72]],                           // foresta / Antro della Volpe
  [[141, 167], [141, 172], [92, 172], [92, 188]],              // palude
  [[141, 167], [141, 204]],                                    // spiaggia
  [[253, 148], [253, 120], [272, 120], [272, 96]],             // deserto / Tomba della Sfinge
  [[253, 120], [253, 80], [248, 80], [248, 56]],               // Canyon di Ryūko
];

export const OW_STABLE = { x: 128, y: 127, w: 9, h: 6, gap: [136, 129, 2] };

export const OW_PROPS = [
  { type: 'sign', x: 139, y: 126, text: "HINOMURA — I cancelli si chiudono alle 22 e riaprono all'alba. Fuori dalle mura: pericolo." },
  { type: 'sign', x: 139, y: 92, text: 'A nord: Rifugio Yukimura e i Monti Shirayuki (3 livelli fino alla vetta). Ad ovest, il Santuario del Fuoco.' },
  { type: 'sign', x: 112, y: 107, text: 'Strada della Foresta delle Nove Code. Villaggio dei Boscaioli a 4 minuti; più avanti, l\'Antro della Volpe.' },
  { type: 'sign', x: 74, y: 76, text: "ANTRO DELLA VOLPE — tre livelli di cunicoli. L'Oni dorme in fondo." },
  { type: 'sign', x: 228, y: 163, text: 'AURELBURG — Capitale del Regno. Mercati, inventori, una torre con orologio... e cose strane nei sotterranei.' },
  { type: 'sign', x: 139, y: 168, text: 'Bivio: ad ovest la Palude di Kuroki (Palafitte di Numa), a sud la spiaggia, ad est Nagi e Aurelburg.' },
  { type: 'sign', x: 251, y: 100, text: 'Deserto Cremisi: acqua all\'Oasi di Sunari. A nord il Canyon, a est la Tomba della Sfinge.' },
  { type: 'horse', x: 131, y: 129 },
  { type: 'dlg', sprite: 'seal', dlg: 'riddle_seal', x: 110, y: 51, hideIf: ['flag', 'riddle_shrine'] },
  { type: 'item', id: 'cat_tama', sprite: 'cat', item: 'gatto_tama', x: 80, y: 108, showIf: [['quest', 's_gatto', 'active']], hideIf: ['item', 'gatto_tama'] },
];

// Forzieri sparsi sul mondo (generati in punti raggiungibili): premi per l'esplorazione
export const CHEST_LOOT = {
  meadow: [[['pozione_vita_s', 2]], [['onigiri', 3], ['dango', 2]], [['legno_duro', 3]]],
  forest: [[['erba_medicinale', 3], ['bacche_blu', 2]], [['fungo_luna', 2]], [['pelliccia_lupo', 2]]],
  swamp: [[['antidoto', 2]], [['seta_ragno', 2], ['erba_medicinale', 2]]],
  desert: [[['sabbia_vetro', 3]], [['elisir_vento', 1]], [['cristallo_grezzo', 2]]],
  snow: [[['ghiaccio_eterno', 1]], [['pozione_ki_s', 2]], [['pelliccia_lupo', 3]]],
  canyon: [[['ferro_grezzo', 3]], [['cristallo_grezzo', 2], ['pozione_vita_m', 1]]],
};

// Temi dei dungeon e delle alture generati con automi cellulari
export const THEMES = {
  fox: { floor: T.CAVE, wall: T.ROCK, deco: T.CRYSTAL, decoP: 0.012, fill: 0.45, spawn: 'fox' },
  swamp: { floor: T.SWAMP, wall: T.ROCK, deco: T.DEADTREE, decoP: 0.01, fill: 0.44, pool: { tile: T.WATER, th: 0.68 }, spawn: 'swampcave' },
  tomb: { floor: T.SAND, wall: T.CANYONWALL, deco: T.PILLAR, decoP: 0.006, fill: 0.43, spawn: 'tomb' },
  frost: { floor: T.ICE, wall: T.ICEWALL, deco: T.CRYSTAL, decoP: 0.014, fill: 0.44, spawn: 'frost' },
  temple: { floor: T.CANYON, wall: T.CANYONWALL, deco: T.LANTERN, decoP: 0.006, fill: 0.42, spawn: 'temple' },
  yomi: { floor: T.ASH, wall: T.HELLROCK, deco: T.CRYSTAL, decoP: 0.006, fill: 0.46, pool: { tile: T.LAVA, th: 0.66 }, spawn: 'underworld' },
  abyss: { floor: T.SEABED, wall: T.CORAL, deco: T.CRYSTAL, decoP: 0.008, fill: 0.43, spawn: 'underwater' },
  sewer: { floor: T.STONE, wall: T.NEONWALL, deco: T.BARREL, decoP: 0.008, fill: 0.44, pool: { tile: T.WATER, th: 0.67 }, spawn: 'cyber' },
  // alture all'aperto (meno pareti, decorazioni naturali)
  pine: { floor: T.SNOW, wall: T.ICEWALL, deco: T.PINE, decoP: 0.05, fill: 0.38, spawn: 'snow', open: 1 },
  ridge: { floor: T.SNOW, wall: T.ICEWALL, deco: T.ROCK, decoP: 0.03, fill: 0.46, spawn: 'snow', open: 1, pool: { tile: T.ICE, th: 0.62 } },
  summit: { floor: T.ICE, wall: T.ICEWALL, deco: T.CRYSTAL, decoP: 0.012, fill: 0.4, spawn: 'frost', open: 1 },
  rim: { floor: T.CANYON, wall: T.CANYONWALL, deco: T.CACTUS, decoP: 0.012, fill: 0.4, spawn: 'canyon', open: 1 },
  ridge2: { floor: T.CANYON, wall: T.CANYONWALL, deco: T.ROCK, decoP: 0.02, fill: 0.46, spawn: 'canyon', open: 1 },
  floor2: { floor: T.SAND, wall: T.CANYONWALL, deco: T.ROCK, decoP: 0.015, fill: 0.43, spawn: 'canyon', open: 1 },
  roof: { floor: T.STONE, wall: T.NEONWALL, deco: T.HOLO, decoP: 0.01, fill: 0.36, spawn: 'cyber', open: 1 },
};


// ===== Il mondo esteso (20x): fusione dei dati dei nuovi regni =====
// 1) la terra di Hinomoto originale viene traslata nel suo rettangolo del nuovo mondo
const sh = (o) => { o.x += OX; o.y += OY; };
for (const t of Object.values(TOWNS)) sh(t);
for (const o of OUTPOSTS) { sh(o); if (o.link) o.link = [o.link[0] + OX, o.link[1] + OY]; }
for (const o of ENTRANCES) sh(o);
for (const o of BUILDINGS_OW) sh(o);
for (const o of SHRINES) sh(o);
for (const o of OW_PROPS) sh(o);
for (const p of PATHS) for (const pt of p) { pt[0] += OX; pt[1] += OY; }
sh(DIVE); sh(OW_STABLE); OW_STABLE.gap[0] += OX; OW_STABLE.gap[1] += OY;
// 2) mondo grande, nuovi insediamenti, dungeon, interni, edifici di Aurelburg
MAPS.overworld.w = 640; MAPS.overworld.h = 576; MAPS.overworld.mobs = 0; // gli spawn sono per regione (vedi Generators)
Object.assign(TOWNS, NEW_SITES);
TOWNS.hinomura.ext = 12; TOWNS.aurelburg.ext = 10; // le due città storiche si estendono oltre le mura originali: nuovi quartieri
Object.assign(MAPS, NEW_DUNGEONS, CIV_ROOMS);
MAPS.int_cathedral = room('Cattedrale di Aurelburg', 22, 14, { floor: T.MARBLEFLOOR, rug: [8, 3, 6, 9], pillars: [[3, 3], [18, 3], [3, 8], [18, 8], [3, 11], [18, 11]], lanterns: [[10, 2], [11, 2]], ambient: [120, 140, 200, 0.18], exit: exitTo('overworld'),
  props: [{ type: 'sign', sprite: 'sign', x: 10, y: 4, text: 'Vetrate colorate gettano luce sul pavimento. Su una lapide: «Qui riposano i custodi del Filo, caduti per mano del Re Senza Tempo».' }, { type: 'chest', id: 'cattedrale_offerte', x: 19, y: 5, loot: [['pozione_vita_l', 1], ['incenso', 3]], gold: 120 }] });
MAPS.int_castle = room('Castello di Aurelburg', 24, 16, { floor: T.STONE, rug: [8, 4, 8, 9], pillars: [[3, 3], [20, 3], [3, 11], [20, 11]], lanterns: [[1, 2], [22, 2], [1, 13], [22, 13]], ambient: [90, 60, 40, 0.2], exit: exitTo('overworld'),
  props: [{ type: 'chest', id: 'castello_tesoro', x: 21, y: 6, loot: [['armatura_samurai', 1], ['pozione_ki_l', 2]], gold: 300 }, { type: 'sign', sprite: 'sign', x: 12, y: 3, text: 'Il trono del Re di Aurelburg è vuoto da anni. Si dice che governino i consiglieri... e che il re viva in un altro tempo.' }] });
Object.assign(THEMES, {
  crypt: { floor: T.STONE, wall: T.ROCK, deco: T.GRAVE, decoP: 0.012, fill: 0.44, spawn: 'crypt' },
  castle: { floor: T.STONE, wall: T.WALL, deco: T.BANNER, decoP: 0.006, fill: 0.42, spawn: 'castle' },
  ruins: { floor: T.MARBLEFLOOR, wall: T.MARBLE, deco: T.COLUMN, decoP: 0.012, fill: 0.42, spawn: 'ruins' },
  buried: { floor: T.SAND, wall: T.ADOBE, deco: T.COLUMN, decoP: 0.008, fill: 0.43, spawn: 'buried' },
  volcano: { floor: T.OBSIDIANFLOOR, wall: T.OBSIDIAN, deco: T.VOLCANOCONE, decoP: 0.004, fill: 0.44, pool: { tile: T.LAVA, th: 0.64 }, spawn: 'volcano' },
  dragon: { floor: T.MARBLEFLOOR, wall: T.WALLCN, deco: T.BANNER, decoP: 0.008, fill: 0.42, spawn: 'dragon' },
});
// biomi nuovi: nome zona
Object.assign(ZONE_NAMES, ZONE_NAMES_NEW);
export const ZONE_LABEL = ZONE_NAMES;
