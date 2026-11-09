// Crafting avanzato: materiali regionali, esplosivi, pozioni elementali, ricette da scoprire e postazioni di lavoro.
// Tutto è dichiarativo: aggiungere un elemento (fuoco, veleno, vento, terra) o un esplosivo richiede solo una riga nelle tabelle.

// Esplosivi lanciabili (tasto Z). r = raggio, dmg = danno al centro, barrier = tipo di colpo contro le barriere, cap = scorta massima.
export const BOMBS = {
  bomba: { n: 'Bomba', r: 42, dmg: 62, barrier: 'bomb', col: '#ffb040', fuse: 0.9, cap: 10, desc: 'Esplosione classica ad area. Spacca massi.' },
  bomba_incendiaria: { n: 'Bomba Incendiaria', r: 38, dmg: 30, burn: 5, barrier: 'bomb_fire', col: '#ff5020', fuse: 0.9, cap: 10, desc: 'Appicca fuoco ai nemici e scioglie il ghiaccio.' },
  bomba_frammentazione: { n: 'Bomba a Frammentazione', r: 58, dmg: 48, shards: 14, barrier: 'bomb', col: '#d0d8e8', fuse: 1.1, cap: 8, desc: 'Scaglia schegge in ogni direzione: ottima contro i gruppi.' },
  carica_demolizione: { n: 'Carica da Demolizione', r: 34, dmg: 120, barrier: 'demo', col: '#ff3a3a', fuse: 1.4, cap: 5, desc: 'L\'unico modo per far crollare le frane che sbarrano i passi.' },
};

// Poteri elementali temporanei (pozione → 2 minuti; tasto P). Gli elementi futuri vanno aggiunti qui.
export const ELEMENTS = {
  ice: { n: 'Ghiaccio', col: '#9ae0ff', ki: 10, cd: 0.6, dur: 120 },
  lightning: { n: 'Fulmine', col: '#ffe860', ki: 18, cd: 1.0, dur: 120 },
  water: { n: 'Acqua', col: '#5aa8ff', ki: 8, cd: 0.45, dur: 120 },
};

export const STATIONS = { banco: 'Banco da lavoro', alchimia: 'Tavolo alchemico' };

export function installCrafting(ITEMS, RECIPES, SHOPS, add) {
  const mat = (id, n, price, desc, o) => add(id, 'material', n, price, desc, o);
  mat('zolfo', 'Zolfo', 14, 'Giallo e pungente. Dai crateri e dalle terre aride.');
  mat('salnitro', 'Salnitro', 16, 'Minerale esplosivo delle miniere e dei canyon.');
  mat('resina', 'Resina Infiammabile', 10, 'Gocciola dagli alberi più antichi.');
  mat('alga_marina', 'Alga Marina', 9, 'Raccolta sulle coste. Piena di acqua pura.');
  mat('cristallo_ghiaccio', 'Cristallo di Ghiaccio', 30, 'Gelo solido dai monti e dalla tundra.');
  mat('componente_elettrico', 'Componente Elettrico', 38, 'Una bobina antica che ancora scintilla.');
  mat('miccia', 'Miccia', 5, 'Corda imbevuta di cera e polvere.');
  mat('polvere_nera', 'Polvere Nera', 20, 'Base di ogni esplosivo.');
  mat('assi_ponte', 'Assi da Ponte', 12, 'Assi robuste per riparare un ponte crollato.');
  for (const [id, b] of Object.entries(BOMBS)) add(id, 'potion', b.n, b.cap * 8 + 18, b.desc, { bomb: id, cap: b.cap });
  const el = (id, n, e, price, desc) => add(id, 'potion', n, price, desc, { use: { buff: { stat: 'elem', val: 1, dur: ELEMENTS[e].dur, el: e } } });
  el('pozione_ghiaccio', 'Pozione del Ghiaccio', 'ice', 90, 'Per 2 minuti [P] scaglia gelo: congela, rallenta, solidifica l\'acqua.');
  el('pozione_fulmine', 'Pozione del Fulmine', 'lightning', 120, 'Per 2 minuti [P] evoca saette: danno alto, catena e paralisi.');
  el('pozione_acqua', 'Pozione dell\'Acqua', 'water', 70, 'Per 2 minuti [P] lancia sfere d\'acqua: bagna i nemici (e li rende vulnerabili al fulmine).');
  const rec = (id, n, desc) => add(id, 'story', n, 0, desc);
  rec('ricetta_demolizione', 'Ricetta: Carica da Demolizione', 'Il segreto per far crollare le frane.');
  rec('ricetta_frammentazione', 'Ricetta: Bomba a Frammentazione', 'Schemi di una bomba che si frantuma in mille schegge.');
  rec('ricetta_ghiaccio', 'Ricetta: Pozione del Ghiaccio', 'Un trattato sul gelo imbottigliato.');
  rec('ricetta_fulmine', 'Ricetta: Pozione del Fulmine', 'Appunti di un alchimista fulminato.');
  rec('ricetta_acqua', 'Ricetta: Pozione dell\'Acqua', 'Come catturare la marea in una fiala.');

  // station: banco | alchimia (omessa = ovunque). unlock = condizione Script; le ricette nuove compaiono (con avviso) quando si sbloccano.
  RECIPES.push(
    { out: 'miccia', n: 3, in: { seta_ragno: 1, carbone: 1 } },
    { out: 'assi_ponte', n: 2, in: { legno_duro: 3, pelle: 1 } },
    { out: 'polvere_nera', n: 2, in: { zolfo: 2, salnitro: 1, carbone: 1 }, station: 'banco', unlock: [['level', 3]] },
    { out: 'bomba', n: 2, in: { polvere_nera: 2, ferro_grezzo: 1, miccia: 1 }, station: 'banco', unlock: [['level', 4]] },
    { out: 'bomba_incendiaria', n: 2, in: { polvere_nera: 1, resina: 2, miccia: 1 }, station: 'banco', unlock: [['level', 6]] },
    { out: 'bomba_frammentazione', n: 1, in: { polvere_nera: 2, rame: 2, ferro_grezzo: 2, miccia: 1 }, station: 'banco', unlock: [['item', 'ricetta_frammentazione']] },
    { out: 'carica_demolizione', n: 1, in: { polvere_nera: 4, legno_duro: 2, miccia: 2, salnitro: 2 }, station: 'banco', unlock: [['item', 'ricetta_demolizione']] },
    { out: 'pozione_acqua', n: 1, in: { perla_grezza: 1, alga_marina: 2, erba_medicinale: 1 }, station: 'alchimia', unlock: [['item', 'ricetta_acqua']] },
    { out: 'pozione_ghiaccio', n: 1, in: { cristallo_ghiaccio: 2, fungo_luna: 1, erba_medicinale: 1 }, station: 'alchimia', unlock: [['item', 'ricetta_ghiaccio']] },
    { out: 'pozione_fulmine', n: 1, in: { componente_elettrico: 2, rame: 1, cristallo_grezzo: 1, erba_medicinale: 1 }, station: 'alchimia', unlock: [['item', 'ricetta_fulmine']] },
  );
  const stock = (shop, ...list) => { for (const s of list) SHOPS[shop].stock.push(s); };
  stock('smith', ['carbone'], ['miccia'], ['zolfo', null, ['level', 3]], ['salnitro', null, ['level', 5]], ['assi_ponte'], ['ricetta_demolizione', 360, ['level', 8]], ['bomba', null, ['level', 6]]);
  stock('pharmacy', ['resina'], ['alga_marina'], ['ricetta_acqua', 180, ['level', 5]], ['ricetta_ghiaccio', 320, ['level', 7]], ['pozione_acqua', null, ['level', 9]]);
  stock('market_eu', ['ricetta_frammentazione', 420, ['level', 10]], ['cristallo_ghiaccio', null, ['level', 8]], ['salnitro'], ['zolfo'], ['bomba_incendiaria', null, ['level', 8]]);
  stock('lumber', ['assi_ponte'], ['resina'], ['miccia']);
  stock('camp', ['miccia'], ['resina']);
  stock('neo_vendor', ['componente_elettrico'], ['ricetta_fulmine', 520, ['level', 12]], ['carica_demolizione', null, ['level', 14]]);
}

// Materiali nel mondo: raccolta per bioma, bottino di forzieri e nemici (alcuni nemici "custodiscono" ingredienti rari).
export const FORAGE_EXTRA = {
  forest: ['resina'], ancient: ['resina'], enchanted: ['resina'], tropical: ['alga_marina', 'resina'], meadow: ['alga_marina'],
  snow: ['cristallo_ghiaccio'], tundra: ['cristallo_ghiaccio'], mountain: ['cristallo_ghiaccio', 'salnitro'],
  canyon: ['salnitro', 'zolfo'], badlands: ['zolfo', 'salnitro'], volcano: ['zolfo'], desert: ['zolfo'], haunted: ['zolfo'],
};
export const DROPS_EXTRA = {
  golem_roccia: [['salnitro', 0.35], ['componente_elettrico', 0.12]], fantasma_fiamma: [['zolfo', 0.4]], oni_rosso: [['zolfo', 0.25]], yeti: [['cristallo_ghiaccio', 0.3]],
  spirito_gelo: [['cristallo_ghiaccio', 0.4]], lupo_neve: [['cristallo_ghiaccio', 0.1]], drone_sentinella: [['componente_elettrico', 0.3]], mech_cane: [['componente_elettrico', 0.35]],
  anguilla_elettrica: [['componente_elettrico', 0.3]], medusa_lampo: [['componente_elettrico', 0.2], ['alga_marina', 0.3]], granchio_gigante: [['alga_marina', 0.35]],
  kappa: [['alga_marina', 0.3]], goblin_cavernicolo: [['salnitro', 0.25]], shabti: [['componente_elettrico', 0.2]], ragno_velenoso: [['resina', 0.2]],
  regina_tsurara: [['cristallo_ghiaccio', 3]], sfinge_cremisi: [['ricetta_fulmine', 1], ['componente_elettrico', 2]], yatsuhashi: [['alga_marina', 3], ['ricetta_acqua', 1]],
  tengu_karasu: [['ricetta_ghiaccio', 1]], ryujin: [['alga_marina', 4]],
};
export const CHEST_EXTRA = [[['componente_elettrico', 2]], [['zolfo', 3], ['salnitro', 2]], [['cristallo_ghiaccio', 2]], [['resina', 3], ['alga_marina', 2]], [['ricetta_frammentazione', 1]], [['ricetta_demolizione', 1]]];
