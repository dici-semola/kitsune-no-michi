// Limbo: dimensione tra vita e morte. Dati: configurazioni, prove di ritorno, nemici non morti, oggetti esclusivi.
export const LIMBO_CFG = [
  { id: 0, n: 'Foresta dei Dannati', tip: 'Alberi scheletrici, pozze di sangue e sentieri tortuosi.' },
  { id: 1, n: 'Distesa della Disperazione', tip: 'Una piana brulla di rocce scure e grandi pozze di sangue.' },
  { id: 2, n: 'Cimitero Dimenticato', tip: 'File di tombe, mausolei e piccole cripte.' },
  { id: 3, n: "Rovine dell'Aldilà", tip: 'Edifici distrutti, colonne spezzate e archi in rovina.' },
  { id: 4, n: 'Valle degli Scheletri', tip: 'Ossa ovunque, resti di guerrieri e accampamenti di soldati scheletrici.' },
];
export const TRIALS = ['enigma', 'cuore', 'orda'];
export const TRIAL_NAMES = { enigma: 'Enigma delle Rune', cuore: 'Il Cuore della Rinascita', orda: 'Le Orde dei Morti' };
export const RUNES = [{ id: 'sole', n: 'Sole' }, { id: 'luna', n: 'Luna' }, { id: 'stella', n: 'Stella' }, { id: 'fiore', n: 'Fiore' }];
export const WAVES = [
  ['soldato_scheletrico', 'soldato_scheletrico', 'soldato_scheletrico', 'arciere_scheletrico'],
  ['guerriero_scheletrico', 'guerriero_scheletrico', 'soldato_scheletrico', 'arciere_scheletrico', 'arciere_scheletrico'],
  ['cavaliere_morte', 'capitano_scheletrico', 'guerriero_scheletrico', 'soldato_scheletrico', 'soldato_scheletrico', 'arciere_scheletrico'],
];

const e = (n, hp, atk, spd, xp, shape, col, ai, o = {}) => ({ n, hp, atk, spd, xp, gold: [Math.max(3, hp / 18 | 0), Math.max(6, hp / 8 | 0)], shape, col, ai, drops: [], ...o });
const O = (kind, spd, n, cd, range, extra = {}) => ({ kind, spd, n, cd, range, ...extra });
const BONE = ['#c8c0a8', '#ece4cc', '#ff5030'];
export const LIMBO_ENEMIES = {
  soldato_scheletrico: e('Soldato Scheletrico', 70, 14, 34, 28, 'skeleton', BONE, 'contact', { trait: 'pack', vis: ['skull_face'], drops: [['osso', 0.4], ['osso_spettrale', 0.15]], tip: 'Fanteria dei morti: arriva a ondate e non teme il dolore.' }),
  guerriero_scheletrico: e('Guerriero Scheletrico', 140, 22, 38, 60, 'skeleton', ['#b8b098', '#e0d8c0', '#ffa030'], 'combo', { hits: 2, reach: 20, trait: 'parry', vis: ['hood'], drops: [['osso', 0.5], ['osso_spettrale', 0.2]], tip: 'Spadaccino spettrale: concatena due fendenti.' }),
  arciere_scheletrico: e('Arciere Scheletrico', 90, 18, 34, 48, 'skeleton', ['#c0b8a0', '#e8e0c8', '#ffd040'], 'ranged', { trait: 'shadowstep', vis: ['bow'], shoot: O('arrow', 150, 1, 1.5, 160), drops: [['freccia', 0.3], ['osso_spettrale', 0.15]], tip: 'Scocca frecce da lontano: avvicinati o ripara dietro una rovina.' }),
  cavaliere_morte: e('Cavaliere della Morte', 420, 36, 46, 140, 'ronin', ['#2a2a38', '#505070', '#ff3040'], 'charger', { size: 1.15, trait: 'armor', vis: ['cape'], drops: [['essenza_limbo', 0.5], ['osso_spettrale', 0.5]], tip: 'In armatura nera: carica a testa bassa. Schivalo e colpiscilo di lato.' }),
  capitano_scheletrico: e('Capitano Scheletrico', 520, 34, 36, 200, 'skeleton', ['#8a7a60', '#d8c898', '#ff2030'], 'combo', { size: 1.25, hits: 3, reach: 24, trait: 'parry', atks: ['slash', 'summon'], summon: 'soldato_scheletrico', vis: ['cape', 'hood'], drops: [['essenza_limbo', 1], ['anima_cristallizzata', 0.4]], tip: 'Comanda le orde: evoca soldati. Abbattilo per primo.' }),
  guardiano_cripta: e('Guardiano della Cripta', 900, 40, 34, 400, 'golem', ['#3a3a48', '#6a6a82', '#ff4060'], 'combo', { size: 1.5, hits: 2, reach: 28, trait: 'armor', atks: ['slash', 'slam'], vis: ['core'], drops: [['essenza_limbo', 2], ['anima_cristallizzata', 1]], tip: 'Veglia sul Cuore della Rinascita: i suoi colpi schiantano la guardia.' }),
};
export const LIMBO_SPAWN = { limbo: [['soldato_scheletrico', 4], ['guerriero_scheletrico', 2], ['arciere_scheletrico', 2], ['spettro', 1]] };

export function installLimbo(ITEMS, RECIPES, add) {
  add('cuore_rinascita', 'story', 'Cuore della Rinascita', 0, 'Pulsa piano. Chi lo stringe può tornare tra i vivi.');
  add('essenza_limbo', 'material', 'Essenza del Limbo', 70, 'Nebbia solidificata. Esiste solo tra la vita e la morte.');
  add('osso_spettrale', 'material', 'Osso Spettrale', 30, 'Leggero e freddo. Luccica di una luce che non c\'è.');
  add('amuleto_limbo', 'gear', 'Amuleto del Limbo', 0, 'Un\'anima in bilico: la tua guardia regge molto di più.', { slot: 'charm', def: 3, guard: 30, hp: 20 });
  RECIPES.push({ out: 'amuleto_limbo', n: 1, in: { essenza_limbo: 3, osso_spettrale: 4, anima_cristallizzata: 1 } });
}
