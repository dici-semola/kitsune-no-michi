// Nemici e boss. ai: contact | combo | ranged | charger | boss
//  combo   -> {hits, reach}        attacco fisico ravvicinato a più colpi
//  ranged  -> shoot:{kind,spd,n,spread,cd,range}   attacco a distanza (n proiettili, ring = a 360°)
//  boss    -> phases:[{at, atks:[...], spd}]  attacchi: slash charge shoot ring slam summon
export const ENEMIES = {
  // Praterie
  kage_slime: { n: "Slime d'Ombra", hp: 16, atk: 4, spd: 24, xp: 5, gold: [1, 3], shape: 'blob', col: ['#2d1f4a', '#5a3f8f', '#ff5060'], ai: 'contact', drops: [['gel_ombra', 0.5], ['onigiri', 0.1]] },
  tanuki_ladro: { n: 'Tanuki Ladro', hp: 24, atk: 5, spd: 40, xp: 8, gold: [2, 6], shape: 'beast', col: ['#6b5030', '#8a6a40', '#2a1a10'], ai: 'combo', hits: 2, reach: 16, drops: [['pelle', 0.3], ['dango', 0.2]] },
  inoshishi: { n: 'Inoshishi', hp: 34, atk: 7, spd: 36, xp: 12, gold: [3, 8], shape: 'beast', col: ['#5a3a2a', '#7a5238', '#e8d8b0'], ai: 'charger', drops: [['pelle', 0.4], ['osso', 0.3]] },
  // Foresta
  kitsunebi: { n: 'Kitsunebi', hp: 22, atk: 5, spd: 30, xp: 14, gold: [3, 7], shape: 'wisp', col: ['#2a8ad0', '#7ad0ff', '#ffffff'], ai: 'ranged', shoot: { kind: 'orb', spd: 70, n: 1, cd: 2.2, range: 120 }, drops: [['fungo_luna', 0.2], ['cristallo_grezzo', 0.08]] },
  lupo_ombra: { n: 'Lupo d\'Ombra', hp: 36, atk: 8, spd: 52, xp: 16, gold: [4, 9], shape: 'beast', col: ['#2a2a38', '#454558', '#ff4040'], ai: 'combo', hits: 2, reach: 18, drops: [['pelliccia_lupo', 0.4], ['osso', 0.2]] },
  karasu_tengu: { n: 'Karasu Tengu', hp: 30, atk: 7, spd: 44, xp: 18, gold: [5, 10], shape: 'bird', col: ['#1a1a24', '#3a3a50', '#e8c040'], ai: 'ranged', shoot: { kind: 'arrow', spd: 120, n: 3, spread: 0.3, cd: 2.6, range: 130 }, drops: [['legno_duro', 0.3]] },
  ragno_velenoso: { n: 'Ragno Velenoso', hp: 40, atk: 8, spd: 34, xp: 20, gold: [4, 10], shape: 'spider', col: ['#2a3a1a', '#4a6a2a', '#d04040'], ai: 'ranged', shoot: { kind: 'web', spd: 80, n: 1, cd: 2, range: 110 }, drops: [['seta_ragno', 0.5]] },
  // Palude
  kappa: { n: 'Kappa', hp: 55, atk: 10, spd: 40, xp: 26, gold: [6, 14], shape: 'beast', col: ['#2a6a4a', '#4a9a6a', '#e8d870'], ai: 'combo', hits: 3, reach: 17, drops: [['bacche_blu', 0.3], ['erba_medicinale', 0.3]] },
  rana_velenosa: { n: 'Rana Velenosa', hp: 40, atk: 9, spd: 30, xp: 24, gold: [5, 12], shape: 'blob', col: ['#2a7a3a', '#5ab04a', '#e0e040'], ai: 'ranged', shoot: { kind: 'orb', spd: 75, n: 2, spread: 0.2, cd: 2.4, range: 110 }, drops: [['erba_medicinale', 0.4]] },
  zombi_palude: { n: 'Zombi di Palude', hp: 70, atk: 11, spd: 20, xp: 28, gold: [5, 12], shape: 'skeleton', col: ['#4a5a3a', '#7a8a5a', '#e8e8c0'], ai: 'contact', drops: [['osso', 0.5]] },
  // Deserto
  scorpione: { n: 'Scorpione Cremisi', hp: 70, atk: 13, spd: 42, xp: 34, gold: [8, 16], shape: 'spider', col: ['#8a2a1a', '#c04a2a', '#ffd070'], ai: 'combo', hits: 2, reach: 18, drops: [['sabbia_vetro', 0.3]] },
  mummia: { n: 'Mummia', hp: 90, atk: 14, spd: 24, xp: 38, gold: [8, 18], shape: 'skeleton', col: ['#c8b890', '#e8dab0', '#4a2a1a'], ai: 'contact', drops: [['seta_ragno', 0.2], ['sabbia_vetro', 0.2]] },
  avvoltoio: { n: 'Avvoltoio Spettrale', hp: 60, atk: 12, spd: 56, xp: 32, gold: [7, 14], shape: 'bird', col: ['#5a4a3a', '#8a7a62', '#e8e8e8'], ai: 'charger', drops: [['osso', 0.3]] },
  shabti: { n: 'Shabti di Sabbia', hp: 100, atk: 15, spd: 30, xp: 42, gold: [10, 20], shape: 'golem', col: ['#a89060', '#d8c088', '#40e0c0'], ai: 'combo', hits: 2, reach: 20, drops: [['sabbia_vetro', 0.5]] },
  // Montagne e ghiaccio
  lupo_neve: { n: 'Lupo delle Nevi', hp: 85, atk: 15, spd: 56, xp: 44, gold: [10, 20], shape: 'beast', col: ['#d8e4f0', '#ffffff', '#4a8ad0'], ai: 'combo', hits: 2, reach: 18, drops: [['pelliccia_lupo', 0.5]] },
  yeti: { n: 'Yeti', hp: 150, atk: 18, spd: 34, xp: 70, gold: [20, 40], shape: 'oni', col: ['#e0e8f0', '#ffffff', '#4a6a9a'], ai: 'combo', hits: 3, reach: 22, size: 1.3, drops: [['ghiaccio_eterno', 0.4], ['pelliccia_lupo', 0.6]] },
  spirito_gelo: { n: 'Spirito del Gelo', hp: 70, atk: 14, spd: 28, xp: 46, gold: [10, 22], shape: 'wisp', col: ['#6ac0f0', '#d8f4ff', '#ffffff'], ai: 'ranged', shoot: { kind: 'orb', spd: 80, n: 3, spread: 0.35, cd: 2.4, range: 130 }, drops: [['ghiaccio_eterno', 0.3]] },
  // Canyon
  golem_roccia: { n: 'Golem di Roccia', hp: 160, atk: 20, spd: 22, xp: 66, gold: [15, 30], shape: 'golem', col: ['#6a4030', '#a06040', '#ffb040'], ai: 'combo', hits: 2, reach: 24, size: 1.3, drops: [['ferro_grezzo', 0.6], ['cristallo_grezzo', 0.15]] },
  arciere_ombra: { n: 'Arciere d\'Ombra', hp: 90, atk: 16, spd: 40, xp: 50, gold: [12, 24], shape: 'skeleton', col: ['#20202c', '#40405a', '#ff4040'], ai: 'ranged', shoot: { kind: 'arrow', spd: 140, n: 1, cd: 1.6, range: 150 }, drops: [['legno_duro', 0.3]] },
  // Grotte
  pipistrello: { n: 'Pipistrello Cavernicolo', hp: 20, atk: 5, spd: 60, xp: 6, gold: [1, 3], shape: 'bird', col: ['#3a2a4a', '#5a4a6a', '#ff6060'], ai: 'charger', drops: [['osso', 0.15]] },
  goblin_cavernicolo: { n: 'Goblin Cavernicolo', hp: 40, atk: 8, spd: 40, xp: 12, gold: [4, 9], shape: 'beast', col: ['#4a6a2a', '#6a9a3a', '#c8a050'], ai: 'combo', hits: 2, reach: 16, drops: [['ferro_grezzo', 0.3]] },
  // Oceano / Ryūgū
  squalo: { n: 'Squalo Abissale', hp: 130, atk: 20, spd: 56, xp: 60, gold: [15, 30], shape: 'fish', col: ['#3a4a6a', '#6a7a9a', '#e8e8e8'], ai: 'charger', aquatic: true, drops: [['osso', 0.5], ['perla_grezza', 0.1]] },
  medusa_lampo: { n: 'Medusa Lampo', hp: 80, atk: 16, spd: 22, xp: 48, gold: [10, 20], shape: 'wisp', col: ['#c040e0', '#f090ff', '#ffff80'], ai: 'ranged', aquatic: true, shoot: { kind: 'orb', spd: 70, n: 8, ring: true, cd: 3.2, range: 120 }, drops: [['perla_grezza', 0.15], ['corallo_rosso', 0.2]] },
  granchio_gigante: { n: 'Granchio Gigante', hp: 140, atk: 19, spd: 30, xp: 62, gold: [14, 28], shape: 'spider', col: ['#c04030', '#e06848', '#f0e0c0'], ai: 'combo', hits: 2, reach: 20, size: 1.2, drops: [['corallo_rosso', 0.3]] },
  anguilla_elettrica: { n: 'Anguilla Elettrica', hp: 100, atk: 18, spd: 40, xp: 56, gold: [12, 24], shape: 'snake', col: ['#2a5aa0', '#4a8ae0', '#ffff60'], ai: 'ranged', shoot: { kind: 'orb', spd: 110, n: 1, cd: 1.5, range: 140 }, drops: [['perla_grezza', 0.12]] },
  // Inferi
  gaki: { n: 'Gaki Famelico', hp: 130, atk: 22, spd: 44, xp: 80, gold: [16, 32], shape: 'skeleton', col: ['#5a3a3a', '#8a5a5a', '#ff5030'], ai: 'contact', drops: [['cenere_yomi', 0.5]] },
  oni_rosso: { n: 'Oni Rosso', hp: 220, atk: 28, spd: 36, xp: 110, gold: [25, 50], shape: 'oni', col: ['#a02020', '#d04030', '#f0e0a0'], ai: 'combo', hits: 3, reach: 24, drops: [['cenere_yomi', 0.6], ['anima_cristallizzata', 0.1]] },
  fantasma_fiamma: { n: 'Fantasma di Fiamma', hp: 140, atk: 24, spd: 30, xp: 90, gold: [20, 36], shape: 'wisp', col: ['#d04010', '#ff9030', '#ffe080'], ai: 'ranged', shoot: { kind: 'orb', spd: 85, n: 8, ring: true, cd: 3, range: 130 }, drops: [['cenere_yomi', 0.4]] },
  cerbero_cucciolo: { n: 'Cucciolo di Cerbero', hp: 200, atk: 30, spd: 54, xp: 105, gold: [24, 48], shape: 'beast', col: ['#2a1a1a', '#4a2a2a', '#ff6020'], ai: 'charger', drops: [['anima_cristallizzata', 0.12]] },
  // Neo-Edo
  drone_sentinella: { n: 'Drone Sentinella', hp: 150, atk: 26, spd: 40, xp: 90, gold: [20, 40], shape: 'drone', col: ['#30304a', '#6060a0', '#ff3030'], ai: 'ranged', shoot: { kind: 'laser', spd: 150, n: 1, cd: 1.3, range: 160 }, drops: [['chip_neon', 0.35], ['rame', 0.4]] },
  cyborg_ronin: { n: 'Cyborg Rōnin', hp: 260, atk: 32, spd: 46, xp: 120, gold: [30, 60], shape: 'oni', col: ['#2a2a40', '#5a5a80', '#2ee6ff'], ai: 'combo', hits: 3, reach: 22, drops: [['chip_neon', 0.4], ['nucleo_energia', 0.08]] },
  mech_cane: { n: 'Cane Meccanico', hp: 220, atk: 30, spd: 64, xp: 100, gold: [24, 48], shape: 'drone', col: ['#404058', '#7878a8', '#ffa030'], ai: 'charger', drops: [['rame', 0.5], ['chip_neon', 0.2]] },
  // Dimensione parallela
  glitch: { n: 'Glitch', hp: 200, atk: 34, spd: 40, xp: 130, gold: [30, 60], shape: 'blob', col: ['#2a2a60', '#8a6aff', '#4cf0ff'], ai: 'contact', drops: [['frammento_tempo', 0.06]] },
  eco_temporale: { n: 'Eco Temporale', hp: 180, atk: 32, spd: 30, xp: 135, gold: [30, 60], shape: 'wisp', col: ['#6a4aff', '#b0a0ff', '#ffffff'], ai: 'ranged', shoot: { kind: 'orb', spd: 90, n: 10, ring: true, cd: 3, range: 150 }, drops: [['polvere_stelle', 0.2]] },
  spettro_futuro: { n: 'Spettro del Futuro', hp: 300, atk: 38, spd: 50, xp: 160, gold: [40, 80], shape: 'skeleton', col: ['#202040', '#6a6ac0', '#ff3fa4'], ai: 'combo', hits: 3, reach: 22, drops: [['frammento_tempo', 0.08], ['polvere_stelle', 0.15]] },

  // ------------------------- BOSS -------------------------
  oni_kurogane: {
    n: 'Oni Kurogane, Guardiano della Soglia', boss: true, ai: 'boss', hp: 380, atk: 11, spd: 34, xp: 160, gold: [120, 120], shape: 'oni', size: 1.8,
    col: ['#1a1a24', '#3a3a50', '#ff3040'], reach: 30, intro: 'intro_oni', outro: 'outro_oni',
    phases: [{ at: 1, atks: ['slash', 'charge'] }, { at: 0.55, atks: ['slash', 'slam', 'charge'], spd: 1.25 }, { at: 0.25, atks: ['slash', 'slam', 'ring', 'summon'], spd: 1.5 }],
    shoot: { kind: 'orb', spd: 80, n: 10, ring: true }, summon: 'kage_slime',
    drops: [['maschera_oni', 1], ['cristallo_grezzo', 1], ['pozione_vita_m', 2]],
  },
  yatsuhashi: {
    n: 'Yatsuhashi, Idra della Palude', boss: true, ai: 'boss', hp: 900, atk: 16, spd: 30, xp: 420, gold: [300, 300], shape: 'snake', size: 2.2,
    col: ['#1a4a2a', '#3a8a4a', '#e0e040'], reach: 34, intro: 'intro_yatsu',
    phases: [{ at: 1, atks: ['slash', 'shoot'] }, { at: 0.6, atks: ['slash', 'shoot', 'slam'], spd: 1.2 }, { at: 0.3, atks: ['shoot', 'ring', 'summon', 'charge'], spd: 1.4 }],
    shoot: { kind: 'orb', spd: 90, n: 3, spread: 0.3, ring: false, cd: 1.5 }, summon: 'rana_velenosa',
    drops: [['cristallo_respiro', 1], ['scaglia_idra', 3], ['pozione_vita_l', 1]],
  },
  sfinge_cremisi: {
    n: 'Sfinge Cremisi', boss: true, ai: 'boss', hp: 1400, atk: 22, spd: 36, xp: 780, gold: [500, 500], shape: 'beast', size: 2.2,
    col: ['#a02818', '#d84828', '#ffd060'], reach: 34, intro: 'intro_sfinge',
    phases: [{ at: 1, atks: ['slash', 'charge'] }, { at: 0.6, atks: ['slash', 'shoot', 'slam'], spd: 1.2 }, { at: 0.3, atks: ['charge', 'ring', 'summon', 'slam'], spd: 1.5 }],
    shoot: { kind: 'orb', spd: 100, n: 5, spread: 0.5, cd: 1.5 }, summon: 'shabti',
    drops: [['cristallo_sabbia', 1], ['sabbia_vetro', 5], ['amuleto_sabbia', 1]],
  },
  regina_tsurara: {
    n: 'Regina Tsurara, la Dama del Gelo', boss: true, ai: 'boss', hp: 1700, atk: 26, spd: 38, xp: 980, gold: [600, 600], shape: 'wisp', size: 2.4,
    col: ['#5ab0e8', '#d8f4ff', '#ffffff'], reach: 30, intro: 'intro_tsurara',
    phases: [{ at: 1, atks: ['shoot', 'slash'] }, { at: 0.6, atks: ['ring', 'shoot', 'slam'], spd: 1.2 }, { at: 0.3, atks: ['ring', 'summon', 'charge', 'shoot'], spd: 1.5 }],
    shoot: { kind: 'orb', spd: 100, n: 5, spread: 0.45, cd: 1.4 }, summon: 'spirito_gelo',
    drops: [['cristallo_gelo', 1], ['ghiaccio_eterno', 4], ['polvere_stelle', 2]],
  },
  tengu_karasu: {
    n: 'Tengu Karasu, Signore del Canyon', boss: true, ai: 'boss', hp: 1200, atk: 20, spd: 52, xp: 700, gold: [450, 450], shape: 'bird', size: 2.0,
    col: ['#12121c', '#34344a', '#e0b030'], reach: 30, intro: 'intro_tengu',
    phases: [{ at: 1, atks: ['charge', 'shoot'] }, { at: 0.55, atks: ['charge', 'shoot', 'ring'], spd: 1.25 }, { at: 0.25, atks: ['charge', 'ring', 'summon'], spd: 1.5 }],
    shoot: { kind: 'arrow', spd: 140, n: 5, spread: 0.5, cd: 1.3 }, summon: 'karasu_tengu',
    drops: [['piuma_aquila', 1], ['pozione_vita_l', 1], ['omamori_fuoco', 1]],
  },
  ryujin: {
    n: 'Ryūjin, il Leviatano', boss: true, ai: 'boss', hp: 2600, atk: 34, spd: 40, xp: 1500, gold: [900, 900], shape: 'snake', size: 2.6,
    col: ['#1a3a8a', '#3a7ad0', '#40f0e0'], reach: 38, intro: 'intro_ryujin',
    phases: [{ at: 1, atks: ['slash', 'shoot', 'charge'] }, { at: 0.6, atks: ['slam', 'ring', 'shoot'], spd: 1.2 }, { at: 0.3, atks: ['ring', 'summon', 'charge', 'slam'], spd: 1.5 }],
    shoot: { kind: 'orb', spd: 110, n: 5, spread: 0.5, cd: 1.3 }, summon: 'medusa_lampo',
    drops: [['perla_tempo', 1], ['corallo_rosso', 4], ['anima_cristallizzata', 1]],
  },
  kamios: {
    n: 'KAMI-OS, la Mente di Neo-Edo', boss: true, ai: 'boss', hp: 4200, atk: 44, spd: 44, xp: 2800, gold: [1500, 1500], shape: 'drone', size: 2.6,
    col: ['#20203a', '#6a6ac0', '#ff3fa4'], reach: 34, intro: 'intro_kamios', outro: 'outro_kamios',
    phases: [{ at: 1, atks: ['shoot', 'charge'] }, { at: 0.6, atks: ['ring', 'shoot', 'slam'], spd: 1.2 }, { at: 0.3, atks: ['ring', 'summon', 'charge', 'shoot'], spd: 1.5 }],
    shoot: { kind: 'laser', spd: 150, n: 5, spread: 0.4, cd: 1.1 }, summon: 'drone_sentinella',
    drops: [['chiave_hover', 1], ['nucleo_energia', 2], ['chip_neon', 5]],
  },
  enma: {
    n: 'Enma-Ō, Giudice dei Morti', boss: true, ai: 'boss', hp: 5600, atk: 54, spd: 42, xp: 4200, gold: [2000, 2000], shape: 'oni', size: 2.6,
    col: ['#601010', '#b02020', '#ffd060'], reach: 40, intro: 'intro_enma', outro: 'outro_enma',
    phases: [{ at: 1, atks: ['slash', 'slam', 'shoot'] }, { at: 0.6, atks: ['slam', 'ring', 'charge', 'shoot'], spd: 1.2 }, { at: 0.3, atks: ['ring', 'summon', 'slam', 'charge'], spd: 1.5 }],
    shoot: { kind: 'orb', spd: 110, n: 7, spread: 0.6, cd: 1.2 }, summon: 'gaki',
    drops: [['filo_destino', 1], ['anima_cristallizzata', 3], ['pesca_yomi', 2]],
  },
  mugenkai: {
    n: 'Mugenkai, il Re Senza Tempo', boss: true, ai: 'boss', final: true, hp: 9000, atk: 70, spd: 48, xp: 9000, gold: [5000, 5000], shape: 'oni', size: 2.8,
    col: ['#14081e', '#5a2a8a', '#ff2050'], reach: 42, intro: 'intro_mugenkai', outro: 'outro_mugenkai',
    phases: [{ at: 1, atks: ['slash', 'shoot', 'charge'] }, { at: 0.7, atks: ['slam', 'ring', 'shoot', 'charge'], spd: 1.2 }, { at: 0.4, atks: ['ring', 'summon', 'slam', 'charge', 'shoot'], spd: 1.45 }, { at: 0.15, atks: ['ring', 'slam', 'charge', 'shoot', 'summon'], spd: 1.7 }],
    shoot: { kind: 'orb', spd: 120, n: 9, spread: 0.8, cd: 1.0 }, summon: 'spettro_futuro',
    drops: [['frammento_tempo', 6], ['maschera_nove_code', 1], ['pozione_vita_l', 3]],
  },
};

// ---------------------------------------------------------------------------------------------
// Identità dei nemici: sagoma (`shape`) e accessori (`vis`) distintivi + un tratto/potere unico (`trait`, vedi
// entities/traits.js) che cambia il modo di affrontarli. `tip` compare nel bestiario.
const PATCH = {
  kage_slime: { shape: 'blob', vis: ['eyes_glow', 'tendrils'], trait: 'split', tip: 'Si divide in due slime più piccoli quando muore: colpisci in fretta.' },
  tanuki_ladro: { shape: 'tanuki', vis: ['leaf', 'sack'], trait: 'thief', tip: 'Se ti colpisce ruba monete e fugge: inseguilo e uccidilo per riaverle.' },
  inoshishi: { shape: 'boar', vis: ['tusks', 'warpaint'], trait: 'berserk', tip: 'Accelera a ogni carica. Schivando in modo che sbatta contro un muro resta stordito.' },
  kitsunebi: { shape: 'wisp', vis: ['tails3'], trait: 'blink', tip: 'Dopo ogni tiro si teletrasporta: non inseguirlo, aspetta che si mostri.' },
  lupo_ombra: { shape: 'wolf', vis: ['chains', 'eyes_glow'], trait: 'pack', tip: 'Ulula per chiamare un compagno e in branco è più veloce: uccidi per primo il richiamo.' },
  karasu_tengu: { shape: 'tengu', vis: ['fan'], trait: 'orbit', tip: 'Ti ruota attorno e picchia dall\'alto ogni pochi secondi.' },
  ragno_velenoso: { shape: 'spider', vis: ['skull_mark', 'eyes3'], tip: 'La sua ragnatela rallenta: tienilo sempre in movimento.', shoot: { kind: 'web', spd: 80, n: 1, cd: 2, range: 110, fx: ['slow', 3] } },
  kappa: { shape: 'kappa', vis: ['dish'], trait: 'dish', tip: 'Il piatto sul capo assorbe i colpi. Quando si rompe, si infuria.' },
  rana_velenosa: { shape: 'frog', vis: ['spots'], trait: 'hop', tip: 'Avanza a balzi e lascia una pozza di veleno alla morte: non pestarla.', shoot: { kind: 'orb', spd: 75, n: 2, spread: 0.2, cd: 2.4, range: 110, fx: ['poison', 4] } },
  zombi_palude: { shape: 'skeleton', vis: ['weeds', 'arm_hang'], trait: 'rise', tip: 'Si rialza una volta con il 40% di vita, a meno che a finirlo sia il fuoco.' },
  scorpione: { shape: 'scorpion', trait: 'burrow', tip: 'Si interra e riemerge sotto i tuoi piedi: spostati quando vedi la sabbia muoversi.' },
  mummia: { shape: 'mummy', atks: ['pull'], tip: 'Le sue bende ti trascinano verso di lei.' },
  avvoltoio: { shape: 'bird', vis: ['ghostly'], trait: 'circle', tip: 'In volo è immune alla katana: usa fuoco, Fiamma Nera o Scatto, oppure aspetta la picchiata.' },
  shabti: { shape: 'golem', vis: ['hieroglyph', 'headdress'], trait: 'statue', tip: 'Finge di essere una statua finché non ti avvicini.' },
  lupo_neve: { shape: 'wolf', vis: ['icicles'], trait: 'frostbite', tip: 'I morsi rallentano e lascia chiazze di ghiaccio sul terreno.' },
  yeti: { shape: 'yeti', vis: ['fangs'], atks: ['slash', 'snowball'], tip: 'Lancia palle di neve che esplodono dopo un istante: guarda il cerchio rosso.' },
  spirito_gelo: { shape: 'wisp', vis: ['snowflake', 'halo'], tip: 'I suoi orbi congelano per un istante.', shoot: { kind: 'orb', spd: 80, n: 3, spread: 0.35, cd: 2.4, range: 130, fx: ['freeze', 0.5] } },
  golem_roccia: { shape: 'golem', vis: ['core', 'moss'], trait: 'armor', atks: ['slash', 'rockfall'], tip: 'Corazza spessa; sotto metà vita il nucleo si espone e subisce molto di più.' },
  arciere_ombra: { shape: 'skeleton', vis: ['hood', 'bow'], trait: 'shadowstep', tip: 'Ogni tre frecce svanisce nell\'ombra e riappare lontano.' },
  pipistrello: { shape: 'bat', vis: ['ears_big'], trait: 'drain', group: 3, tip: 'Arriva in stormo, vola in modo irregolare e si cura mordendo.' },
  goblin_cavernicolo: { shape: 'goblin', vis: ['torch'], atks: ['slash', 'toss'], light: { r: 52, c: '255,170,70' }, tip: 'Illumina la grotta con la torcia e te la scaglia addosso lasciando fuoco.' },
  squalo: { shape: 'shark', trait: 'frenzy', tip: 'Ti gira intorno; se sei sotto metà vita entra in frenesia.' },
  medusa_lampo: { shape: 'jelly', vis: ['sparks'], trait: 'static', tip: 'Un campo elettrico la circonda: colpisci da lontano.' },
  granchio_gigante: { shape: 'crab', trait: 'shell', tip: 'Il guscio devia i colpi frontali: aggira o colpisci quando attacca.' },
  anguilla_elettrica: { shape: 'snake', vis: ['sparks'], atks: ['lineshock', 'shoot'], tip: 'Prepara una scarica in linea retta: esci dalla traiettoria.' },
  gaki: { shape: 'gaki', trait: 'hunger', tip: 'Succhia il tuo Ki a ogni colpo e diventa sempre più veloce.' },
  oni_rosso: { shape: 'oni', vis: ['horns', 'club'], trait: 'enrage', atks: ['slash', 'slam'], tip: 'Sotto metà vita entra in furia: più veloce e più forte.' },
  fantasma_fiamma: { shape: 'wisp', vis: ['skull_face', 'flames'], trait: 'phase', tip: 'A tratti diventa intangibile: attendi che torni solido prima di colpire.' },
  cerbero_cucciolo: { shape: 'cerberus', trait: 'trail', atks: ['charge', 'shoot'], tip: 'Tre teste sputano fuoco e la carica lascia una scia infuocata.', shoot: { kind: 'orb', spd: 100, n: 3, spread: 0.4, cd: 2, range: 130 } },
  drone_sentinella: { shape: 'drone', vis: ['scanner'], trait: 'scan', tip: 'Se il suo fascio ti individua, chiama rinforzi.' },
  cyborg_ronin: { shape: 'ronin', trait: 'parry', tip: 'Para i colpi frontali (scudo azzurro) e contrattacca: attacca quando abbassa la guardia.' },
  mech_cane: { shape: 'mechdog', trait: 'overheat', tip: 'Dopo tre cariche si surriscalda: è il momento di colpirlo.' },
  glitch: { shape: 'glitch', trait: 'glitchtp', tip: 'Si teletrasporta lasciando una bomba nel punto in cui si trovava.' },
  eco_temporale: { shape: 'wisp', vis: ['rings'], trait: 'echo', tip: 'Ripete il suo attacco un istante dopo: preparati al secondo ciclo.' },
  spettro_futuro: { shape: 'specter', vis: ['visor', 'cape'], trait: 'afterimage', atks: ['slash', 'charge'], tip: 'Le immagini residue che lascia esplodono dopo un secondo.' },
  // ---- boss ----
  oni_kurogane: { vis: ['horns', 'club', 'chain'], trait: 'ironhide', tip: 'Corazza di ferro che si spezza a metà scontro; attenzione alle onde d\'urto.',
    phases: [{ at: 1, atks: ['slash', 'charge'] }, { at: 0.55, atks: ['slash', 'quake', 'charge'], spd: 1.25 }, { at: 0.25, atks: ['slash', 'quake', 'ring', 'summon'], spd: 1.5 }] },
  yatsuhashi: { shape: 'hydra', trait: 'hydra', tip: 'Cinque teste: ogni testa mozzata sparge veleno e ricresce se non la bruci.',
    shoot: { kind: 'orb', spd: 90, n: 3, spread: 0.3, cd: 1.5, fx: ['poison', 4] },
    phases: [{ at: 1, atks: ['heads', 'slash'] }, { at: 0.6, atks: ['heads', 'slam', 'slash'], spd: 1.2 }, { at: 0.3, atks: ['heads', 'ring', 'summon', 'charge'], spd: 1.4 }] },
  sfinge_cremisi: { shape: 'sphinx', trait: 'sandstorm', tip: 'Crea miraggi che spariscono al primo colpo; la tempesta di sabbia lo avvolge a metà scontro.',
    phases: [{ at: 1, atks: ['slash', 'charge'] }, { at: 0.6, atks: ['slash', 'mirage', 'shoot', 'slam'], spd: 1.2 }, { at: 0.3, atks: ['charge', 'mirage', 'ring', 'summon'], spd: 1.5 }] },
  regina_tsurara: { shape: 'yukionna', vis: ['crown_ice', 'halo'], trait: 'blizzard', tip: 'Pilastri di ghiaccio a cerchio attorno a te; poi una bufera.',
    shoot: { kind: 'orb', spd: 100, n: 5, spread: 0.45, cd: 1.4, fx: ['slow', 2.5] },
    phases: [{ at: 1, atks: ['shoot', 'pillars'] }, { at: 0.6, atks: ['ring', 'pillars', 'shoot'], spd: 1.2 }, { at: 0.3, atks: ['ring', 'pillars', 'summon', 'charge'], spd: 1.45 }] },
  tengu_karasu: { shape: 'tengu', vis: ['fan'], tip: 'Raffiche di vento ti spingono lontano; poi piovono piume esplosive.',
    phases: [{ at: 1, atks: ['charge', 'shoot', 'gust'] }, { at: 0.55, atks: ['charge', 'rain', 'gust', 'shoot'], spd: 1.25 }, { at: 0.25, atks: ['charge', 'rain', 'ring', 'summon'], spd: 1.5 }] },
  ryujin: { shape: 'dragon', trait: 'tempest', tip: 'Onde parallele e un vortice che ti risucchia: resta fuori dal centro.',
    phases: [{ at: 1, atks: ['wave', 'shoot', 'charge'] }, { at: 0.6, atks: ['whirl', 'wave', 'ring'], spd: 1.2 }, { at: 0.3, atks: ['whirl', 'wave', 'ring', 'summon'], spd: 1.5 }] },
  kamios: { shape: 'drone', vis: ['eye', 'ring'], trait: 'glitchlord', tip: 'Griglie di laser e un virus che inverte i tuoi comandi.',
    phases: [{ at: 1, atks: ['shoot', 'grid'] }, { at: 0.6, atks: ['hack', 'grid', 'ring'], spd: 1.2 }, { at: 0.3, atks: ['hack', 'grid', 'ring', 'summon', 'charge'], spd: 1.45 }] },
  enma: { shape: 'oni', vis: ['crown', 'beard'], tip: 'Pronuncia tre sentenze di fila sul punto in cui stai: non fermarti mai.',
    phases: [{ at: 1, atks: ['slash', 'judgment', 'shoot'] }, { at: 0.6, atks: ['judgment', 'slam', 'charge', 'shoot'], spd: 1.2 }, { at: 0.3, atks: ['judgment', 'ring', 'summon', 'slam'], spd: 1.45 }] },
  mugenkai: { shape: 'oni', vis: ['kitsune_mask', 'cape', 'aura'], tip: 'Ferma il tempo e colpisce due volte, crea echi di sé e riavvolge lo scontro.',
    phases: [{ at: 1, atks: ['slash', 'shoot', 'rewind'] }, { at: 0.7, atks: ['timestop', 'clones', 'shoot', 'charge'], spd: 1.2 }, { at: 0.4, atks: ['timestop', 'clones', 'ring', 'slam', 'rewind'], spd: 1.45 }, { at: 0.15, atks: ['timestop', 'ring', 'clones', 'charge', 'rewind', 'slam'], spd: 1.7 }] },
};
for (const [k, v] of Object.entries(PATCH)) Object.assign(ENEMIES[k], v);

// Illusioni create dai boss: spariscono al primo colpo o dopo pochi secondi
ENEMIES.miraggio = { n: 'Miraggio', hp: 1, atk: 8, spd: 46, xp: 0, gold: [0, 0], shape: 'sphinx', size: 0.9, col: ['#d8b060', '#f0d890', '#ffffff'], ai: 'combo', hits: 1, reach: 22, trait: 'illusion', drops: [], tip: 'Illusione: svanisce con un colpo.' };
ENEMIES.eco_mugenkai = { n: 'Eco del Re', hp: 1, atk: 20, spd: 56, xp: 0, gold: [0, 0], shape: 'oni', size: 1.3, col: ['#2a1048', '#6a3a9a', '#ff3060'], ai: 'combo', hits: 2, reach: 22, trait: 'illusion', vis: ['kitsune_mask'], drops: [], tip: 'Eco temporale: svanisce con un colpo.' };

// Tabelle di spawn: [idNemico, peso]
export const SPAWN_TABLES = {
  meadow: [['kage_slime', 5], ['tanuki_ladro', 3], ['inoshishi', 2]],
  forest: [['kitsunebi', 3], ['lupo_ombra', 3], ['karasu_tengu', 2], ['ragno_velenoso', 2], ['kage_slime', 1]],
  swamp: [['kappa', 3], ['rana_velenosa', 3], ['zombi_palude', 3]],
  desert: [['scorpione', 3], ['mummia', 3], ['avvoltoio', 2]],
  snow: [['lupo_neve', 3], ['yeti', 1], ['spirito_gelo', 2]],
  canyon: [['golem_roccia', 2], ['arciere_ombra', 3], ['avvoltoio', 1]],
  ocean: [['squalo', 2], ['medusa_lampo', 2]],
  fox: [['pipistrello', 4], ['goblin_cavernicolo', 3], ['kage_slime', 2]],
  swampcave: [['kappa', 2], ['rana_velenosa', 2], ['zombi_palude', 2]],
  tomb: [['mummia', 3], ['scorpione', 2], ['shabti', 3]],
  frost: [['lupo_neve', 3], ['spirito_gelo', 3], ['yeti', 1]],
  temple: [['arciere_ombra', 3], ['golem_roccia', 2], ['karasu_tengu', 2]],
  underwater: [['granchio_gigante', 3], ['anguilla_elettrica', 3], ['medusa_lampo', 2]],
  underworld: [['gaki', 4], ['oni_rosso', 2], ['fantasma_fiamma', 3], ['cerbero_cucciolo', 2]],
  cyber: [['drone_sentinella', 4], ['cyborg_ronin', 3], ['mech_cane', 2]],
  parallel: [['glitch', 4], ['eco_temporale', 3], ['spettro_futuro', 2]],
};

// ---- nuove regioni, dungeon e creature notturne ----
import { NEW_ENEMIES, NEW_SPAWN, NIGHT_TABLES } from './enemies_new.js';
Object.assign(ENEMIES, NEW_ENEMIES);
Object.assign(SPAWN_TABLES, NEW_SPAWN);
export { NIGHT_TABLES };

import { DROPS_EXTRA } from './crafting.js';
for (const [id, d] of Object.entries(DROPS_EXTRA)) if (ENEMIES[id]) ENEMIES[id].drops = [...(ENEMIES[id].drops || []), ...d];
import { LIMBO_ENEMIES, LIMBO_SPAWN } from './limbo.js';
Object.assign(ENEMIES, LIMBO_ENEMIES);
Object.assign(SPAWN_TABLES, LIMBO_SPAWN);
