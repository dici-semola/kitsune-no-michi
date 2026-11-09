// REGNO SOMMERSO DI THALASSA: mappe, abitanti, bazar, missione e dialoghi. Si raggiunge con la tuta da sub da una baia vicino a Portomarea.
// Struttura: Nereidia (la città dei sommersi, 140x100) -> Abissi di Thalassa (grotte abissali) -> Trono di Thalassarkhos (arena del boss).
import { T } from './tiles.js';
import { MAPS } from './world.js';
import { NPCS } from './npcs.js';
import { DIALOGUES } from './dialogues.js';
import { SHOPS } from './items.js';
import { QUESTS } from './quests.js';

const room = (n, w, h, o = {}) => ({ n, type: 'interior', gen: 'interior', w, h, floor: T.PAVE_MOSAIC, ...o });
const say = (s, t, extra = {}) => ({ s, t, ...extra });
const P = (top, bottom, hair, skin, extra = {}) => ({ top, bottom, hair, skin, sash: extra.sash || '#e8c040', ...extra });
const SEA = { type: 'underwater', biome: 'underwater' };

Object.assign(MAPS, {
  thalassa: { n: 'Nereidia · Regno Sommerso di Thalassa', gen: 'thalassa', w: 140, h: 100, seed: 61, ambient: [8, 70, 110, 0.38], ...SEA, exit: { to: 'overworld', anchor: 'door_thalassa' }, next: { id: 'thalassa_deep', dir: 'down' } },
  thalassa_deep: { n: 'Abissi di Thalassa', type: 'underwater', gen: 'cave', w: 120, h: 90, theme: 'abyss', biome: 'underwater', seed: 62, ambient: [4, 30, 80, 0.5], prev: 'thalassa', next: { id: 'thalassa_throne', dir: 'down' } },
  thalassa_throne: { n: 'Trono di Thalassarkhos', type: 'underwater', gen: 'cave', w: 90, h: 70, theme: 'abyss', biome: 'underwater', seed: 63, ambient: [4, 24, 70, 0.55], prev: 'thalassa_deep', boss: 'kraken_scorpione' },
  thalassa_inn: room('Locanda della Perla Dormiente', 16, 10, { counter: [3, 8, 4], beds: [[2, 2], [4, 2], [11, 2], [13, 2]], tables: [[12, 7]], lanterns: [[1, 8], [14, 8]], rug: [6, 4, 4, 3], exit: { to: 'thalassa', anchor: 'door_thalassa_inn' } }),
  thalassa_shop: room('Bazar delle Perle', 14, 9, { counter: [3, 7, 5], shelves: 1, tables: [[10, 3]], lanterns: [[1, 7], [12, 7]], exit: { to: 'thalassa', anchor: 'door_thalassa_shop' } }),
  thalassa_hall: room('Sala del Corallo · Corte della Regina', 20, 12, { rug: [7, 3, 6, 7], lanterns: [[2, 2], [17, 2], [2, 9], [17, 9]], tables: [[3, 4], [16, 4]], exit: { to: 'thalassa', anchor: 'door_thalassa_hall' } }),
});

SHOPS.thalassa_shop = { n: 'Bazar delle Perle', stock: [['pozione_vita_m'], ['pozione_vita_l'], ['pozione_ki_s'], ['pozione_ki_l'], ['freccia'], ['freccia_veleno'], ['freccia_magica'], ['antidoto'], ['elisir_vento'], ['alga_marina'], ['perla_grezza']] };

const AT = (dx, dy) => ({ map: 'thalassa', anchor: 'town_thalassa', dx, dy });
Object.assign(NPCS, {
  nerea: { n: 'Regina Nerea', look: P('#3a9ab0', '#1a5a78', '#7affea', '#e8f4f8', { robe: 1, long: 1, glow: '120,255,230', crown_ice: 1 }), quirk: ['hover', 'bubble'], shouts: ['Il mare ricorda.', 'Che le correnti ti siano favorevoli.'], at: { map: 'thalassa_hall', x: 9, y: 3 }, dialogue: 'nerea' },
  tritone_guardia: { n: 'Guardia Tritone', look: P('#2a6a8a', '#1a3a5a', '#2a4a6a', '#a8d0d8', { straw: 0, staff: 1 }), quirk: ['salute'], shouts: ['Alt! Nereidia è sotto protezione della Regina.'], at: AT(-6, 5), dialogue: 'tritone_guardia' },
  oste_perla: { n: 'Oste Corallo', look: P('#e07a8a', '#6a3a4a', '#e8a850', '#f0c8a8', {}), quirk: ['bubble', 'mug'], shouts: ['Un letto morbido come la sabbia!'], at: { map: 'thalassa_inn', x: 8, y: 3 }, dialogue: 'oste_perla' },
  mercante_perle: { n: 'Mercante di Perle Ondina', look: P('#7a5ac8', '#3a2a6a', '#5ac8e8', '#f0d8c8', {}), quirk: ['bubble'], shouts: ['Perle! Alghe! Fortuna!'], at: { map: 'thalassa_shop', x: 7, y: 3 }, dialogue: 'mercante_perle' },
  anziano_marino: { n: 'Anziano Trito', look: P('#5a8a9a', '#2a4a5a', '#e8f0f0', '#d0e0d8', { long: 1, robe: 1 }), quirk: ['bubble', 'pole'], shouts: ['Il Leviatano dorme nel trono...'], at: AT(8, 4), dialogue: 'anziano_marino' },
  sirena_gente1: { n: 'Sirena Maris', look: P('#e86a9a', '#7a2a5a', '#5af0c8', '#f4dcc8', { long: 1 }), quirk: ['bubble'], shouts: ['Le correnti sono nervose, oggi.', 'Hai visto le luci nell\'abisso?'], at: AT(-8, -3), dialogue: 'sirena_gente' },
  sirena_gente2: { n: 'Pescatore Nereo', look: P('#4a9a7a', '#2a5a4a', '#8a6a3a', '#d8b890', { straw: 1 }), quirk: ['bubble'], shouts: ['Le reti tornano vuote da quando si è risvegliato.'], at: AT(10, -4), dialogue: 'sirena_gente' },
});

Object.assign(DIALOGUES, {
  nerea: { start: [{ if: [['flag', 'thalassa_done']], go: 'done' }, { if: [['flag', 'boss:kraken_scorpione']], go: 'victory' }, { if: [['flag', 'thalassa_quest']], go: 'wait' }, { go: 'a' }], nodes: {
    a: say('Regina Nerea', ['Benvenuto a Nereidia, portatore della maschera. Pochi della superficie hanno visto le nostre luci.', 'Da una luna, Thalassarkhos — il Leviatano dal pungiglione — si è destato nel suo trono, sotto gli Abissi. Le correnti impazziscono, le perle si spengono.'], { choices: [{ t: 'Lo affronterò', next: 'accept', fx: [['quest', 'q_thalassa'], ['flag', 'thalassa_quest']] }, { t: 'Devo prepararmi' }] }),
    accept: say('Regina Nerea', 'Scendi per la scala a est, oltre il canyon scuro. Quando colpisce con il pungiglione o con il vortice, resta scoperto un istante: è allora che puoi ferirlo.'),
    wait: say('Regina Nerea', 'Il trono di Thalassarkhos è in fondo agli Abissi, a est. Torna da me quando il mare tornerà calmo.'),
    victory: say('Regina Nerea', ['Le perle brillano di nuovo... lo sento. Hai liberato il mare.', 'Nereidia ti sarà debitrice per sempre. Porta con te questo tridente: appartiene al Leviatano che hai domato.'], { fx: [['flag', 'thalassa_done']] }),
    done: say('Regina Nerea', 'Che il mare ti protegga, amico della superficie.'),
  } },
  tritone_guardia: { start: [{ go: 'a' }], nodes: { a: say('Guardia Tritone', 'Nereidia è aperta a chi ha la tuta e il cuore buono. Il palazzo della Regina è la sala più grande, a nord della piazza.') } },
  oste_perla: { start: [{ go: 'a' }], nodes: {
    a: say('Oste Corallo', 'Alla Perla Dormiente le lenzuola sono di alga seta! Un letto costa 60 monete.', { choices: [{ t: 'Riposare (60 monete)', next: 'rest', if: [['gold', 60]] }, { t: 'Che si dice nel regno?', next: 'news' }, { t: 'No, grazie' }] }),
    rest: say('Oste Corallo', 'Dormi bene. Partita salvata.', { fx: [['gold', -60], ['rest']] }),
    news: say('Oste Corallo', 'Dicono che il mostro sotto il trono abbia occhi come lanterne e una coda che ti trova sempre. Chi lo sfida, osserva i segnali rossi sul fondo.', { next: 'a' }),
  } },
  mercante_perle: { start: [{ go: 'a' }], nodes: { a: say('Ondina', 'Perle, alghe e frecce per i coraggiosi! Cosa ti serve?', { choices: [{ t: 'Vediamo la merce', fx: [['shop', 'thalassa_shop']] }, { t: 'Arrivederci' }] }) } },
  anziano_marino: { start: [{ go: 'a' }], nodes: { a: say('Anziano Trito', ['Thalassarkhos non era un mostro: era il custode dei Tre Abissi. Qualcosa lo ha corrotto, forse la ferita del Tempo.', 'Ha chele per tagliare il fondo, tentacoli per afferrare, una coda per trovare chi si nasconde. Ma ogni colpo pesante lo lascia scoperto.']) } },
  sirena_gente: { start: [{ go: 'a' }], nodes: { a: say('Abitante', 'Le correnti ci portano dove vogliono. Se ti prende un vortice, nuota di traverso: non è più forte di te.') } },
  intro_kraken: { start: [{ go: 'a' }], nodes: { a: say('Thalassarkhos', ['...', 'Chi turba il silenzio del trono?', 'Il mare è mio. Il tempo è mio. Torna alla superficie... o diventa schiuma.']) } },
  outro_kraken: { start: [{ go: 'a' }], nodes: { a: say('Thalassarkhos', ['La marea... si ritira. Sento di nuovo la luce.', 'Grazie, piccola volpe. Porta la Regina... questa perla.']) } },
});

QUESTS.q_thalassa = {
  title: 'La Furia di Thalassa', act: 'Regno Sommerso', main: false, giver: 'nerea',
  desc: 'Un Leviatano scorpione si è destato nel trono degli Abissi. La Regina Nerea chiede il tuo aiuto.',
  obj: [{ t: 'boss', boss: 'kraken_scorpione', text: 'Sconfiggi Thalassarkhos nel Trono degli Abissi' }, { t: 'talk', npc: 'nerea', text: 'Torna dalla Regina Nerea' }],
  reward: { gold: 1500, maxHp: 15, items: [['perla_abissale', 2], ['pozione_vita_l', 3]], flags: ['thalassa_reward'] },
};
