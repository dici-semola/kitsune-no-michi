// NUOVI TERRITORI ESTERNI: nove regioni grandi come l'intero mondo di partenza (640x576 tile), generate solo quando vi si entra.
// Insieme al mondo originale portano l'area esplorabile a circa 10 volte (invece di un unico array gigantesco, impossibile su telefono).
// Ogni territorio ha un'identità: una sequenza di biomi con fasce di transizione graduali, dorsali montuose, luoghi segreti, rovine, accampamenti,
// santuari con aspetto legato al territorio, un eremita e un passaggio dal mondo principale (livello minimo consigliato).
import { MAPS } from './world.js';
import { NPCS } from './npcs.js';
import { DIALOGUES } from './dialogues.js';
import { ENEMIES } from './enemies.js';
import { QUESTS } from './quests.js';

export const TERRITORI = {
  yggwen: { n: 'Foresta Millenaria di Yggwen', biomes: ['meadow', 'forest', 'enchanted', 'ancient'], power: 1.15, gate: { town: 'silvaneth', level: 8 }, sea: 'ring', lore: 'Gli alberi di Yggwen erano già vecchi quando nacque il primo impero. Chi si perde fra i loro tronchi ritrova sempre la via... ma non sempre il giorno in cui è entrato.', shrine: 'ivy', hermit: 'Eremita Quercio' },
  frontiera: { n: 'Frontiera Selvaggia', biomes: ['meadow', 'canyon', 'forest', 'plateau'], power: 1.25, gate: { town: 'aurelburg', level: 10 }, sea: 'ring', lore: 'Terre senza re né strade: carovane perdute, accampamenti abbandonati e creature che non conoscono confini.', shrine: 'ruin', hermit: 'Vecchio Cercatore' },
  nebbiaria: { n: 'Paludi di Nebbiaria', biomes: ['forest', 'swamp', 'haunted', 'ancient'], power: 1.35, gate: { town: 'hinomura', level: 12 }, sea: 'ring', lore: 'La nebbia di Nebbiaria nasconde ponti marci e tombe sommerse. Si dice che i fuochi fatui guidino i morti, non i vivi.', shrine: 'ruin', hermit: 'Eremita Lanterna' },
  vette: { n: 'Altopiani dei Giganti', biomes: ['meadow', 'plateau', 'mountain', 'tundra'], power: 1.45, gate: { town: 'longxi', level: 14 }, sea: 'ring', lore: 'Le montagne dei Giganti reggono il cielo. Fra una dorsale e l\'altra corrono gole strette, battute dal vento e dagli avvoltoi.', shrine: 'stone', hermit: 'Pastore del Vento' },
  ankhar: { n: 'Deserto di Ankhar', biomes: ['badlands', 'desert', 'dunes', 'ancient'], power: 1.55, gate: { town: 'sahar', level: 16 }, sea: 'ring', lore: 'Sotto le dune di Ankhar dormono città intere. Il vento le scopre una per una e le richiude in una notte.', shrine: 'desert', hermit: 'Nomade Silente' },
  mille_isole: { n: 'Costa delle Mille Isole', biomes: ['tropical', 'jade', 'meadow'], power: 1.65, gate: { town: 'kuru', level: 18 }, sea: 'archipelago', lore: 'Mille isole, mille maree: le secche si aprono e si chiudono come bocche. I pescatori giurano che alcune isole viaggiano di notte.', shrine: 'ivy', hermit: 'Pescatore Remoto' },
  nivalis: { n: 'Terre di Nivalis', biomes: ['tundra', 'snow', 'mountain'], power: 1.75, gate: { town: 'augusta', level: 20 }, sea: 'ring', lore: 'A Nivalis il gelo è un abitante, non un ospite. I santuari di ghiaccio non si sciolgono mai: ricordano chi li ha costruiti.', shrine: 'ice', hermit: 'Eremita del Gelo' },
  lunaria: { n: 'Altopiano Mistico di Lunaria', biomes: ['jade', 'enchanted', 'plateau', 'mountain'], power: 1.85, gate: { town: 'portomarea', level: 22 }, sea: 'ring', lore: 'Su Lunaria la luna sembra più vicina. Cristalli sospesi cantano di notte e gli spiriti più antichi tengono lì le loro corti.', shrine: 'mystic', hermit: 'Veggente di Lunaria' },
  ashkar: { n: 'Piana di Ashkar', biomes: ['badlands', 'volcano', 'canyon', 'ancient'], power: 2.0, gate: { town: 'zeroquartier', level: 24 }, sea: 'ring', lore: 'La terra di Ashkar sanguina lava. Fra pietre bruciate e colate rapprese resistono rovine di una forgia più antica degli dèi.', shrine: 'volcano', hermit: 'Fabbro Cinereo' },
};

for (const [id, t] of Object.entries(TERRITORI)) {
  MAPS[id] = { n: t.n, type: 'outdoor', gen: 'territory', biome: t.biomes[0], w: 640, h: 576, seed: 900 + Object.keys(TERRITORI).indexOf(id) * 37, power: t.power, territory: id, exit: { to: 'overworld', anchor: 'door_' + id } };
  const k = Object.keys(TERRITORI).indexOf(id), TOP = ['#5a7a3a', '#9a7a4a', '#4a6a5a', '#7a8aa0', '#c8a860', '#3a8a9a', '#a8c0d8', '#7a5ac8', '#a8482a'], BOT = ['#3a2e20', '#4a3a2a', '#2a3a30', '#3a4050', '#6a4a2a', '#2a4a5a', '#5a6a80', '#3a2a5a', '#3a2020'], HAIR = ['#c8c0b0', '#8a7a6a', '#a0a890', '#e8e8f0', '#6a5a4a', '#d8d0a0', '#f0f4ff', '#c8b8ff', '#4a3a30'], SKIN = ['#d8b890', '#c89868', '#e0c0a0', '#d0a880', '#b88858', '#e8c8a8', '#f0d8c0', '#d8b8c8', '#a87850'];
  NPCS['eremita_' + id] = { n: t.hermit, look: { top: TOP[k], bottom: BOT[k], hair: HAIR[k], skin: SKIN[k], sash: '#8a6a2a', straw: k % 2, long: 1, robe: 1, staff: k % 3 === 0 ? 1 : 0, cape: k % 4 === 1 ? 1 : 0, capeCol: BOT[k] }, quirk: ['bubble', 'pole'], shouts: ['Che i venti ti siano amici.', 'Hai trovato il santuario?'], at: { map: id, anchor: 'poi_camp', dx: 1, dy: 1 }, dialogue: 'eremita_' + id };
  DIALOGUES['eremita_' + id] = { start: [{ go: 'a' }], nodes: { a: { s: t.hermit, t: [t.lore, 'Cerca il santuario: ti ristora e fissa il tuo punto di rinascita. E diffida delle rovine isolate: a volte nascondono tesori, a volte i loro guardiani.'] } } };
}

// ---- MISSIONI EXTRA POST STORIA ----------------------------------------------------------------------------------
// I territori si aprono solo dopo aver concluso la storia principale (flag game_cleared) e col livello indicato.
// In ognuno veglia un guardiano (un boss già esistente ricalibrato: nuovo id, quindi combattibile anche se l'originale è stato sconfitto)
// e l'eremita affida una missione: sconfiggere creature, abbattere il guardiano, tornare a riferire.
const GUARDIANI = {
  yggwen: ['cavaliere_nero', 'Custode di Corteccia'],
  frontiera: ['colosso_rovine', 'Colosso della Frontiera'],
  nebbiaria: ['re_non_morto', 'Re delle Paludi'],
  vette: ['oni_kurogane', "Gigante dell'Altopiano"],
  ankhar: ['faraone_sepolto', 'Sovrano delle Dune'],
  mille_isole: ['drago_giada', 'Drago delle Maree'],
  nivalis: ['titano_ghiaccio', 'Gigante del Gelo Eterno'],
  lunaria: ['sfinge_cremisi', 'Sfinge Lunare'],
  ashkar: ['drago_ignis', 'Signore della Forgia'],
};
Object.entries(TERRITORI).forEach(([id, t], k) => {
  const [base, nome] = GUARDIANI[id], b = ENEMIES[base], gid = 'guardiano_' + id;
  ENEMIES[gid] = { ...b, n: nome, hp: Math.round(b.hp * 1.25), atk: Math.round(b.atk * (1.1 + k * 0.02)), intro: undefined, outro: undefined, boss: true };
  t.boss = { id: gid, n: nome };
  const Q = 'x_' + id, name = t.hermit;
  QUESTS[Q] = {
    title: 'Oltre il mare: ' + t.n, act: 'Missione extra · ' + t.n, main: false, giver: 'eremita_' + id,
    desc: name + ' ti chiede di liberare ' + t.n + ' dal guardiano che la tormenta.',
    obj: [
      { t: 'kill', enemy: 'any', n: 8, text: 'Sconfiggi 8 creature in ' + t.n },
      { t: 'boss', boss: gid, text: 'Sconfiggi ' + nome + ' nella sua arena' },
      { t: 'talk', npc: 'eremita_' + id, text: 'Torna da ' + name },
    ],
    reward: { gold: 600 + k * 150, maxHp: 10, items: [['pozione_vita_l', 3 + k]], flags: ['extra_' + id] },
  };
  DIALOGUES['eremita_' + id] = {
    start: [
      { if: [['quest', Q, 'active']], go: 'wait' },
      { if: [['flag', 'extra_' + id]], go: 'fatto' },
      { if: [['flag', 'game_cleared']], go: 'offerta' },
      { go: 'a' },
    ],
    nodes: {
      a: { s: name, t: [t.lore, 'Cerca il santuario: ti ristora e fissa il tuo punto di rinascita. E diffida delle rovine isolate: a volte nascondono tesori, a volte i loro guardiani.'] },
      offerta: { s: name, t: [t.lore, 'Hai ricucito il Filo del Tempo, lo so. Ma qui ' + nome + ' non lascia dormire nessuno. Aiutaci: fai pulizia, poi cerca la sua arena e abbattilo. Ti ricompenserò.'], fx: [['quest', Q]] },
      wait: { s: name, t: ['Il guardiano veglia nella sua arena, lungo i sentieri battuti. Ripulisci prima la zona dalle creature, poi affrontalo. Torna da me a cose fatte.'] },
      fatto: { s: name, t: ['Il territorio respira di nuovo, grazie a te. Il santuario resta tuo, {name}: torna quando vuoi.'] },
    },
  };
});
