// SCUDI: la difesa si fa SOLO con uno scudo equipaggiato. Non c'è scudo iniziale: si trovano (boss e guardiani), si creano (banco da lavoro) o si comprano (negozi).
// Ogni scudo ha: res = % di danno fermato quando para, dur = colpi sopportati prima di rompersi, guard = punti guardia in più.
// La fascia (1-8) segue l'avanzamento nella mappa: villaggio di partenza -> città -> regni -> territori post storia -> abissi.
// Il materiale conta: il legno brucia nelle terre di fuoco, il metallo arrugginisce nelle paludi e sulle coste umide (vedi WEAR in Player).
export const SHIELDS = [
  ['scudo_legno', 'Scudo di Legno', 45, 1, { res: 80, dur: 12, guard: 0, mat: 'wood', col: ['#8a5a2a', '#4a2a10', '#d8c070'] }, 'Assi e cuoio di Hinomura. Para poco ma costa poco.'],
  ['scudo_bronzo', 'Scudo di Bronzo', 190, 2, { res: 84, dur: 18, guard: 10, mat: 'metal', col: ['#c88a3a', '#6a3a10', '#ffe090'] }, 'Disco di bronzo battuto, il primo vero scudo.'],
  ['scudo_ferro', 'Scudo di Ferro', 430, 3, { res: 88, dur: 26, guard: 20, mat: 'metal', col: ['#9aa0b0', '#4a5060', '#d8dce8'] }, 'Pesante e affidabile.'],
  ['scudo_acciaio', "Scudo d'Acciaio", 950, 4, { res: 91, dur: 36, guard: 30, mat: 'metal', col: ['#c8d4e8', '#6a7a98', '#ffffff'] }, 'Acciaio temprato dei maestri di Aurelburg.'],
  ['scudo_giada', 'Scudo di Giada', 0, 5, { res: 93, dur: 48, guard: 40, mat: 'stone', col: ['#40c090', '#136a4a', '#c8ffe8'] }, 'Giada levigata: non arrugginisce e non brucia.'],
  ['scudo_ossidiana', "Scudo d'Ossidiana", 0, 6, { res: 95, dur: 60, guard: 50, mat: 'stone', col: ['#2a2a3a', '#8a4aff', '#ff6af0'] }, 'Vetro vulcanico nero, tagliente e durissimo.'],
  ['scudo_lunare', 'Scudo Lunare', 0, 7, { res: 97, dur: 80, guard: 65, mat: 'mystic', col: ['#e8e0ff', '#8a6aff', '#fff8c0'] }, 'Luce di luna solidificata. Gli spiriti lo rispettano.'],
  ['scudo_abissale', 'Scudo Abissale', 2400, 8, { res: 96, dur: 70, guard: 55, mat: 'mystic', col: ['#40d0c0', '#1a5a9a', '#ffe0f0'] }, 'Madreperla e corallo degli abissi: il mare non lo corrode.'],
];

export function installShields(ITEMS, RECIPES, SHOPS, add) {
  for (const [id, n, price, tier, st, desc] of SHIELDS) add(id, 'gear', n, price, desc, { slot: 'shield', tier, ...st });
  // si creano al banco da lavoro (i primi cinque); gli altri solo trovati o comprati
  RECIPES.push({ out: 'scudo_legno', n: 1, in: { legno_duro: 4, pelle: 1 } });
  RECIPES.push({ out: 'scudo_bronzo', n: 1, in: { rame: 4, legno_duro: 2 } });
  RECIPES.push({ out: 'scudo_ferro', n: 1, in: { ferro_grezzo: 5, pelle: 2 } });
  RECIPES.push({ out: 'scudo_acciaio', n: 1, in: { ferro_grezzo: 8, carbone: 3, pelle: 2 } });
  RECIPES.push({ out: 'scudo_giada', n: 1, in: { cristallo_grezzo: 5, ferro_grezzo: 4, legno_duro: 2 } });
  // negozi per progressione
  const stock = (shop, ...list) => { if (SHOPS[shop]) for (const s of list) SHOPS[shop].stock.push(s); };
  stock('smith', ['scudo_legno'], ['scudo_bronzo', null, ['level', 6]]);
  stock('market_eu', ['scudo_ferro', null, ['level', 9]]);
  stock('khaz_dum_shop', ['scudo_acciaio', null, ['level', 12]]);
  stock('nethermere_shop', ['scudo_acciaio', null, ['level', 12]]);
  // lo scudo abissale è in vendita al Bazar delle Perle (definito in thalassa.js)
}

// Usura per bioma: moltiplicatore sulla durata consumata a ogni colpo parato
export const WEAR = {
  wood: { volcano: 2, badlands: 1.6, desert: 1.3 },
  metal: { swamp: 1.5, haunted: 1.4, tropical: 1.3, ocean: 1.4, jade: 1.2 },
  stone: {}, mystic: {},
};
