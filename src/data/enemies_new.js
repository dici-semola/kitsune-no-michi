// Creature delle nuove regioni: non morti, spiriti ostili, bestie mitologiche, predoni, e i boss dei nuovi dungeon.
// Stessa struttura di data/enemies.js; i tratti sono in entities/traits.js.
const e = (n, hp, atk, spd, xp, shape, col, ai, o = {}) => ({ n, hp, atk, spd, xp, gold: [Math.max(2, hp / 20 | 0), Math.max(4, hp / 9 | 0)], shape, col, ai, drops: [], ...o });
const O = (kind, spd, n, cd, range, extra = {}) => ({ kind, spd, n, cd, range, ...extra });
const GH = ['#a8b8d8', '#d8e4ff', '#40e0ff'];

export const NEW_ENEMIES = {
  // ---- non morti e spiriti ostili (più attivi di notte) ----
  spettro: e('Spettro Errante', 150, 24, 36, 85, 'ghost', GH, 'ranged', { trait: 'phase', vis: ['halo'], shoot: O('orb', 90, 2, 2.2, 130, { spread: 0.3 }), drops: [['essenza_spirito', 0.12], ['anima_cristallizzata', 0.04]], tip: 'Diventa intangibile a tratti: colpiscilo quando è solido. Di notte è più numeroso.' }),
  anima_inquieta: e('Anima Inquieta', 70, 14, 30, 40, 'ghost', ['#b8c8e0', '#e8f0ff', '#80c0ff'], 'ranged', { trait: 'blink', shoot: O('orb', 70, 1, 2.4, 120, { fx: ['slow', 2] }), drops: [['essenza_spirito', 0.06]], tip: 'Spirito triste: salta tra i punti e rallenta con i suoi lamenti.' }),
  poltergeist: e('Poltergeist', 110, 20, 44, 70, 'ghost', ['#c8a8d8', '#f0d8ff', '#ff80c0'], 'ranged', { trait: 'glitchtp', atks: ['rockfall', 'shoot'], shoot: O('orb', 80, 1, 2, 120), tip: 'Scaglia oggetti e si teletrasporta lasciando bombe: non restare fermo.' }),
  banshee: e('Banshee', 180, 26, 34, 110, 'ghost', ['#8aa0c8', '#d0e0ff', '#ffffff'], 'ranged', { trait: 'phase', vis: ['skull_face'], shoot: O('orb', 85, 8, 3, 130, { ring: true, fx: ['freeze', 0.4] }), drops: [['anima_cristallizzata', 0.08]], tip: 'Il suo urlo ad anello ti paralizza per un istante.' }),
  scheletro_guerriero: e('Scheletro Guerriero', 120, 22, 38, 70, 'skeleton', ['#d8d0b8', '#f0ead0', '#ff4040'], 'combo', { hits: 2, reach: 20, trait: 'parry', vis: ['hood'], drops: [['osso', 0.5]], tip: 'Para i colpi frontali: aggiralo o attacca quando abbassa lo scudo.' }),
  scheletro_arciere: e('Scheletro Arciere', 80, 18, 36, 55, 'skeleton', ['#d0c8b0', '#ece4c8', '#ffd040'], 'ranged', { trait: 'shadowstep', vis: ['bow'], shoot: O('arrow', 140, 1, 1.6, 150), drops: [['osso', 0.4], ['freccia', 0.2]], tip: 'Scocca frecce a ripetizione e sparisce dopo tre tiri.' }),
  necromante: e('Necromante', 160, 22, 30, 120, 'specter', ['#2a1a3a', '#6a3a8a', '#60ff90'], 'ranged', { trait: 'shadowstep', vis: ['hood', 'visor'], atks: ['shoot', 'summon'], summon: 'scheletro_guerriero', shoot: O('orb', 90, 3, 2.2, 140, { spread: 0.4 }), drops: [['anima_cristallizzata', 0.1], ['cenere_yomi', 0.3]], tip: 'Evoca scheletri: eliminalo per primo.' }),
  cavaliere_fantasma: e('Cavaliere Fantasma', 260, 34, 44, 150, 'ronin', ['#8898b8', '#c0d0f0', '#80f0ff'], 'combo', { hits: 3, reach: 22, trait: 'parry', vis: ['cape'], drops: [['anima_cristallizzata', 0.1]], tip: 'Spettro corazzato che pare e contrattacca. Una parata perfetta lo sbilancia.' }),
  // ---- vulcano, giada, foreste, tropici, gelo, dune, calanchi, montagne ----
  salamandra: e('Salamandra', 190, 28, 54, 100, 'wolf', ['#a02a10', '#e86a20', '#ffe060'], 'charger', { trait: 'trail', vis: ['flames'], drops: [['carbone', 0.5]], tip: 'La sua carica lascia una scia di fuoco.' }),
  golem_lava: e('Golem di Lava', 320, 36, 22, 140, 'golem', ['#3a2a2a', '#6a3a2a', '#ff6020'], 'combo', { hits: 2, reach: 24, size: 1.3, trait: 'armor', atks: ['slash', 'rockfall'], vis: ['core'], drops: [['ferro_grezzo', 0.5], ['cenere_yomi', 0.2]], tip: 'Corazza di roccia; il nucleo incandescente si espone a metà vita.' }),
  drago_cucciolo: e('Drago Cucciolo', 280, 32, 40, 160, 'dragon', ['#a02a2a', '#e04a3a', '#ffd060'], 'ranged', { size: 0.8, trait: 'trail', shoot: O('orb', 100, 5, 2.4, 150, { spread: 0.5 }), drops: [['scaglia_idra', 0.3]], tip: 'Soffia ventagli di fuoco e lascia fiamme.' }),
  serpente_giada: e('Serpente di Giada', 130, 22, 40, 65, 'snake', ['#2a8a5a', '#5ad090', '#f0e060'], 'ranged', { shoot: O('orb', 85, 2, 2.2, 120, { spread: 0.2, fx: ['poison', 4] }), vis: ['sparks'], drops: [['erba_medicinale', 0.3]], tip: 'Il suo veleno logora lentamente: curati in fretta.' }),
  tigre_bianca: e('Tigre Bianca', 230, 30, 58, 110, 'wolf', ['#e8e8f0', '#ffffff', '#4a8ad0'], 'charger', { trait: 'berserk', vis: ['fangs'], drops: [['pelliccia_lupo', 0.6]], tip: 'Scatta come un fulmine: se sbatte contro un ostacolo resta stordita.' }),
  leone_guardiano: e('Leone Guardiano', 300, 34, 34, 130, 'golem', ['#8a8a94', '#b8b8c4', '#40e0c0'], 'combo', { hits: 2, reach: 24, size: 1.2, trait: 'statue', vis: ['hieroglyph'], tip: 'Statua di pietra: si risveglia se ti avvicini.' }),
  fata_dispettosa: e('Fata Dispettosa', 90, 16, 48, 55, 'wisp', ['#e070c0', '#ffb0e8', '#ffffff'], 'ranged', { trait: 'blink', vis: ['snowflake'], shoot: O('orb', 90, 3, 2, 120, { spread: 0.5 }), drops: [['polvere_stelle', 0.1]], tip: 'Fa dispetti: si teletrasporta dopo ogni incantesimo.' }),
  lupo_fatato: e('Lupo Fatato', 170, 24, 56, 90, 'wolf', ['#4a8aa8', '#a0e0ff', '#ffffff'], 'combo', { hits: 2, reach: 18, trait: 'pack', vis: ['icicles'], drops: [['pelliccia_lupo', 0.4]], tip: 'Caccia in branco e chiama aiuto con un ululato.' }),
  scimmia_ladra: e('Scimmia Ladra', 100, 16, 56, 55, 'tanuki', ['#7a5030', '#b08050', '#f0d0a0'], 'combo', { hits: 2, reach: 16, trait: 'thief', vis: ['sack'], drops: [['bacche_blu', 0.3]], tip: 'Ti ruba le monete e scappa: inseguila.' }),
  coccodrillo: e('Coccodrillo', 240, 32, 36, 110, 'wolf', ['#3a5a3a', '#6a9a5a', '#e8e0b0'], 'combo', { hits: 2, reach: 22, size: 1.2, trait: 'burrow', drops: [['pelle', 0.5]], tip: 'Si nasconde nel fango e ti attacca da sotto.' }),
  orso_polare: e('Orso Polare', 330, 34, 34, 130, 'yeti', ['#e8eef8', '#ffffff', '#4a6a9a'], 'combo', { hits: 3, reach: 22, size: 1.2, trait: 'berserk', drops: [['pelliccia_lupo', 0.7]], tip: 'Possente: attendi che sbatta contro un ostacolo per colpirlo.' }),
  spirito_blizzard: e('Spirito del Blizzard', 200, 28, 34, 120, 'wisp', ['#80c0f0', '#e0f4ff', '#ffffff'], 'ranged', { trait: 'static', vis: ['snowflake', 'halo'], shoot: O('orb', 90, 5, 2.4, 140, { spread: 0.5, fx: ['slow', 2.5] }), drops: [['ghiaccio_eterno', 0.3]], tip: 'Aura gelida e proiettili che rallentano.' }),
  sciacallo: e('Sciacallo Dorato', 130, 22, 62, 70, 'wolf', ['#c8a050', '#e8c878', '#2a1a0a'], 'combo', { hits: 2, reach: 18, trait: 'pack', drops: [['pelle', 0.4]], tip: 'Segue le carovane in branco, soprattutto di notte.' }),
  basilisco: e('Basilisco', 260, 34, 36, 130, 'snake', ['#7a8a3a', '#b0c050', '#ff4040'], 'ranged', { size: 1.2, trait: 'burrow', shoot: O('orb', 95, 3, 2.4, 140, { spread: 0.3, fx: ['freeze', 0.5] }), drops: [['sabbia_vetro', 0.5]], tip: 'Il suo sguardo paralizza per un istante.' }),
  drone_selvaggio: e('Drone Selvaggio', 150, 26, 44, 90, 'drone', ['#40405a', '#8080b0', '#ff8030'], 'ranged', { trait: 'scan', vis: ['scanner'], shoot: O('laser', 150, 1, 1.3, 160), drops: [['chip_neon', 0.3], ['rame', 0.4]], tip: 'Fuori controllo: se ti scansiona, chiama rinforzi.' }),
  predone_cyber: e('Predone Cyber', 230, 30, 48, 120, 'ronin', ['#2a2a40', '#5a5a80', '#ff3fa4'], 'combo', { hits: 3, reach: 22, trait: 'parry', drops: [['chip_neon', 0.3]], tip: 'Parata a scudo di energia: colpiscilo quando la abbassa.' }),
  ent: e('Ent', 420, 34, 22, 160, 'golem', ['#3a6a2a', '#5a9a3a', '#c8e060'], 'combo', { hits: 2, reach: 26, size: 1.5, trait: 'armor', atks: ['slash', 'rockfall'], vis: ['moss'], drops: [['legno_duro', 0.8]], tip: 'Albero vivente: la corteccia lo protegge finché non è ferito.' }),
  grifone: e('Grifone', 240, 30, 56, 120, 'bird', ['#a07838', '#e0c070', '#ffffff'], 'charger', { size: 1.4, trait: 'circle', drops: [['pelle', 0.4]], tip: 'In volo è immune alla katana: usa l\'arco o aspetta la picchiata.' }),
  troll_montagna: e('Troll di Montagna', 380, 36, 30, 150, 'oni', ['#5a6a50', '#8a9a70', '#ffd060'], 'combo', { hits: 3, reach: 24, size: 1.4, trait: 'enrage', atks: ['slash', 'slam'], vis: ['club'], drops: [['ferro_grezzo', 0.5]], tip: 'Sotto metà vita entra in furia.' }),
  // ---- boss dei nuovi dungeon ----
  re_non_morto: e('Re Non Morto', 1700, 34, 36, 1100, 'skeleton', ['#c8c0a0', '#ece4c8', '#ff3040'], 'boss', { boss: true, size: 2, reach: 30, vis: ['crown', 'cape'], trait: 'illusion_none', summon: 'scheletro_guerriero', shoot: O('orb', 100, 6, 1.3, 150, { spread: 0.7 }), tip: 'Evoca guerrieri non morti e ondate di anime.',
    phases: [{ at: 1, atks: ['slash', 'shoot'] }, { at: 0.6, atks: ['slash', 'summon', 'ring'], spd: 1.2 }, { at: 0.3, atks: ['summon', 'ring', 'slam', 'charge'], spd: 1.45 }], drops: [['anima_cristallizzata', 2], ['corona_spettrale', 1], ['pozione_vita_l', 1]] }),
  cavaliere_nero: e('Cavaliere Nero di Rocca Nera', 2200, 40, 44, 1500, 'ronin', ['#14101c', '#3a3050', '#ff2040'], 'boss', { boss: true, size: 2, reach: 30, trait: 'parry', vis: ['cape', 'visor'], summon: 'cavaliere_fantasma', shoot: O('orb', 110, 5, 1.3, 150, { spread: 0.5 }), tip: 'Para e contrattacca: servono parate perfette e pazienza.',
    phases: [{ at: 1, atks: ['slash', 'charge'] }, { at: 0.6, atks: ['slash', 'charge', 'shoot', 'slam'], spd: 1.25 }, { at: 0.3, atks: ['slash', 'ring', 'summon', 'charge'], spd: 1.5 }], drops: [['katana_acciaio', 1], ['anima_cristallizzata', 2], ['pozione_vita_l', 2]] }),
  colosso_rovine: e('Colosso delle Rovine', 2600, 42, 26, 1700, 'golem', ['#8a8a94', '#c0c0cc', '#40e0c0'], 'boss', { boss: true, size: 2.4, reach: 36, trait: 'armor', vis: ['hieroglyph', 'core'], tip: 'Colosso di pietra: lento ma devastante. Colpisci il nucleo quando si espone.',
    phases: [{ at: 1, atks: ['slash', 'slam'] }, { at: 0.55, atks: ['slam', 'rockfall', 'charge'], spd: 1.2 }, { at: 0.25, atks: ['rockfall', 'slam', 'ring'], spd: 1.4 }], drops: [['polvere_stelle', 3], ['frammento_tempo', 1], ['pozione_vita_l', 2]] }),
  faraone_sepolto: e('Faraone Sepolto', 2500, 40, 38, 1800, 'mummy', ['#c8b890', '#f0e0a8', '#40e0c0'], 'boss', { boss: true, size: 2, reach: 30, trait: 'sandstorm', vis: ['headdress', 'crown'], summon: 'mummia', shoot: O('orb', 100, 5, 1.3, 150, { spread: 0.5 }), tip: 'Scatena una tempesta di sabbia e evoca mummie.',
    phases: [{ at: 1, atks: ['slash', 'pull'] }, { at: 0.6, atks: ['pull', 'mirage', 'shoot', 'summon'], spd: 1.25 }, { at: 0.3, atks: ['ring', 'summon', 'mirage', 'charge'], spd: 1.5 }], drops: [['sabbia_vetro', 5], ['amuleto_sabbia', 1], ['pozione_vita_l', 2]] }),
  kraken_scorpione: e('Thalassarkhos, Leviatano Scorpione', 3800, 42, 40, 2800, 'krakenscorp', ['#1c3a5a', '#3a7aa8', '#7affea'], 'boss', { boss: true, size: 2.4, reach: 46, trait: 'kraken', summon: 'medusa_lampo', gold: [1200, 1500], light: { r: 64, c: '90,255,220' }, intro: 'intro_kraken', outro: 'outro_kraken', shoot: O('orb', 100, 5, 1.3, 160, { spread: 0.7 }), tip: 'Leggi i segnali: dopo il pungiglione e dopo il vortice resta scoperto per un istante.',
    phases: [{ at: 1, atks: ['claw', 'tail', 'tentacles'] }, { at: 0.65, atks: ['whirl', 'tail', 'claw', 'shoot', 'tentacles'], spd: 1.2 }, { at: 0.35, atks: ['tentacles', 'whirl', 'tail', 'summon', 'claw', 'shoot'], spd: 1.45 }], drops: [['perla_abissale', 3], ['tridente_abissale', 1], ['pozione_vita_l', 3]] }),
  drago_ignis: e('Ignis, Drago del Vulcano', 3400, 48, 40, 2500, 'dragon', ['#701810', '#e04a20', '#ffd060'], 'boss', { boss: true, size: 2.6, reach: 40, trait: 'trail', summon: 'salamandra', shoot: O('orb', 120, 7, 1.2, 170, { spread: 0.8 }), tip: 'Respiro di fuoco a ventaglio e onde di lava.',
    phases: [{ at: 1, atks: ['shoot', 'charge', 'slash'] }, { at: 0.6, atks: ['shoot', 'rockfall', 'ring', 'charge'], spd: 1.25 }, { at: 0.3, atks: ['ring', 'rockfall', 'summon', 'shoot', 'charge'], spd: 1.5 }], drops: [['scaglia_idra', 5], ['elisir_fuoco', 2], ['omamori_fuoco', 1], ['pozione_vita_l', 2]] }),
  drago_giada: e('Longwei, Drago di Giada', 3000, 44, 44, 2300, 'dragon', ['#1a6a4a', '#40c090', '#f0e060'], 'boss', { boss: true, size: 2.4, reach: 38, trait: 'tempest', summon: 'serpente_giada', shoot: O('orb', 110, 5, 1.2, 160, { spread: 0.6, fx: ['poison', 4] }), tip: 'Onde d\'acqua e vortici: tienti fuori dal centro.',
    phases: [{ at: 1, atks: ['wave', 'shoot', 'charge'] }, { at: 0.6, atks: ['whirl', 'wave', 'ring'], spd: 1.2 }, { at: 0.3, atks: ['whirl', 'wave', 'ring', 'summon'], spd: 1.5 }], drops: [['veste_giada', 1], ['te_giada', 3], ['pozione_vita_l', 2]] }),
  titano_ghiaccio: e('Titano di Ghiaccio', 3100, 46, 32, 2300, 'yeti', ['#c0e0f8', '#ffffff', '#4a8ad0'], 'boss', { boss: true, size: 2.6, reach: 38, trait: 'blizzard', vis: ['icicles', 'fangs'], summon: 'lupo_neve', shoot: O('orb', 100, 6, 1.3, 160, { spread: 0.6, fx: ['slow', 2.5] }), tip: 'Pilastri di ghiaccio e bufera: schiva e resisti.',
    phases: [{ at: 1, atks: ['slash', 'snowball'] }, { at: 0.6, atks: ['pillars', 'snowball', 'shoot', 'slam'], spd: 1.2 }, { at: 0.3, atks: ['pillars', 'ring', 'summon', 'snowball', 'charge'], spd: 1.45 }], drops: [['ghiaccio_eterno', 6], ['polvere_stelle', 2], ['pozione_vita_l', 2]] }),
};
// 'illusion_none' non è un vero tratto: serve solo a rendere esplicito che non c'è alcun tratto speciale
for (const v of Object.values(NEW_ENEMIES)) if (v.trait === 'illusion_none') delete v.trait;

// Tabelle di spawn per i nuovi biomi, dungeon e creature notturne
export const NEW_SPAWN = {
  ancient: [['lupo_fatato', 3], ['ent', 1], ['kitsunebi', 2], ['ragno_velenoso', 2], ['karasu_tengu', 1]],
  enchanted: [['fata_dispettosa', 4], ['lupo_fatato', 3], ['kitsunebi', 2]],
  haunted: [['scheletro_guerriero', 3], ['scheletro_arciere', 2], ['zombi_palude', 2], ['lupo_ombra', 2], ['necromante', 1]],
  volcano: [['salamandra', 3], ['golem_lava', 2], ['drago_cucciolo', 1], ['fantasma_fiamma', 2]],
  jade: [['serpente_giada', 3], ['tigre_bianca', 2], ['leone_guardiano', 1], ['kappa', 1]],
  plateau: [['scheletro_guerriero', 2], ['leone_guardiano', 1], ['tanuki_ladro', 2], ['inoshishi', 2], ['avvoltoio', 1]],
  tundra: [['orso_polare', 2], ['lupo_neve', 3], ['spirito_blizzard', 2], ['yeti', 1]],
  dunes: [['sciacallo', 3], ['scorpione', 3], ['basilisco', 1], ['mummia', 2]],
  badlands: [['drone_selvaggio', 3], ['predone_cyber', 2], ['golem_roccia', 2], ['arciere_ombra', 1]],
  tropical: [['scimmia_ladra', 3], ['coccodrillo', 2], ['serpente_giada', 1], ['kappa', 1]],
  mountain: [['grifone', 2], ['troll_montagna', 2], ['golem_roccia', 2], ['lupo_neve', 2]],
  crypt: [['scheletro_guerriero', 3], ['scheletro_arciere', 2], ['spettro', 2], ['necromante', 1]],
  castle: [['cavaliere_fantasma', 2], ['scheletro_guerriero', 3], ['poltergeist', 2], ['spettro', 2]],
  ruins: [['leone_guardiano', 2], ['scheletro_guerriero', 2], ['poltergeist', 1], ['golem_roccia', 2]],
  buried: [['mummia', 3], ['scorpione', 2], ['basilisco', 1], ['shabti', 3]],
  dragon: [['serpente_giada', 3], ['leone_guardiano', 2], ['tigre_bianca', 1]],
  spirit: [['anima_inquieta', 4], ['spettro', 2], ['banshee', 1]],
  khaz: [['troll_montagna', 1]],
};
// Creature che si aggiungono dopo il tramonto (per bioma). 'default' vale per tutti gli altri.
export const NIGHT_TABLES = {
  default: [['anima_inquieta', 3], ['spettro', 1]],
  haunted: [['spettro', 4], ['anima_inquieta', 3], ['banshee', 1], ['poltergeist', 1], ['cavaliere_fantasma', 1]],
  swamp: [['anima_inquieta', 3], ['spettro', 2], ['zombi_palude', 2]],
  forest: [['anima_inquieta', 2], ['lupo_ombra', 3]],
  ancient: [['anima_inquieta', 2], ['spettro', 1], ['lupo_fatato', 2]],
  enchanted: [['fata_dispettosa', 3], ['anima_inquieta', 1]],
  desert: [['sciacallo', 3], ['spettro', 1]], dunes: [['sciacallo', 3], ['spettro', 1]],
  plateau: [['scheletro_guerriero', 2], ['spettro', 2]],
  tundra: [['spirito_blizzard', 2], ['anima_inquieta', 2]],
};
