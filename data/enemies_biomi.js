// ROSTER ESCLUSIVI PER AMBIENTE: ogni bioma del mondo ha almeno tre creature tutte sue, che non compaiono in nessun altro bioma. Ognuna ha una sagoma/palette/accessori propri,
// un'intelligenza (contatto, mischia, distanza, carica), un tratto e un attacco firma del bioma (bio_* in entities/traits.js): grafica e comportamento diversi da ambiente a ambiente.
const O = (kind, spd, n, cd, range, extra = {}) => ({ kind, spd, n, cd, range, ...extra });
// [id, nome, forma, palette, ai, tratto, accessori, hp, atk, vel, dimensione, attacchi, suggerimento]
const T1 = 1, T2 = 2.4, T3 = 4.4, T4 = 7;   // moltiplicatori di potenza per fascia di difficoltà
const ROSTER = {
  meadow: [T1, 'bio_prato', [
    ['lepre_saltatrice', 'Lepre Saltatrice', 'beast', ['#a89868', '#e0d0a0', '#ff6a6a'], 'contact', 'hop', [], 18, 5, 52, 0.8, null, 'Avanza a balzi: colpiscila quando atterra.'],
    ['vespa_gigante', 'Vespa Gigante', 'bat', ['#2a2410', '#f0d030', '#ff6040'], 'ranged', 'orbit', [], 20, 6, 58, 0.9, ['shoot'], 'Ti ronza attorno e si lancia in picchiata col pungiglione.'],
    ['spaventapasseri', 'Spaventapasseri Vivente', 'ronin', ['#6a5428', '#c8a850', '#ffd860'], 'combo', 'statue', ['hood', 'straw_hat'], 70, 9, 30, 1.1, ['slash', 'bio_prato'], 'Finge di essere un pupazzo finché non ti avvicini; spande polline velenoso.'],
  ]],
  forest: [T1 * 1.4, 'bio_bosco', [
    ['cervo_spettrale', 'Cervo Spettrale', 'beast', ['#d8d0c0', '#a8d8b8', '#80ffd0'], 'charger', 'blink', ['antlers'], 60, 9, 52, 1.2, ['charge'], 'Carica a testa bassa e svanisce nel sottobosco.'],
    ['gufo_cacciatore', 'Gufo Cacciatore', 'bird', ['#4a3a28', '#a89878', '#ffd060'], 'ranged', 'shadowstep', [], 44, 9, 46, 1.1, ['shoot', 'bio_bosco'], 'Piomba dall\'alto e sparisce fra i rami.'],
    ['orso_muschioso', 'Orso Muschioso', 'yeti', ['#2e4a22', '#6a8a4a', '#c8e060'], 'combo', 'enrage', ['thorns'], 150, 14, 34, 1.4, ['slash', 'slam', 'bio_bosco'], 'Le radici sul dorso lo rendono furioso sotto metà vita.'],
  ]],
  enchanted: [T3, 'bio_incanto', [
    ['fuoco_prisma', 'Fuoco Fatuo Prismatico', 'wisp', ['#7a30d8', '#e080ff', '#80ffff'], 'ranged', 'blink', ['halo'], 70, 14, 46, 1.1, ['shoot', 'bio_incanto'], 'Si teletrasporta dopo ogni raggio colorato.'],
    ['cavaliere_cristallo', 'Cavaliere di Cristallo', 'ronin', ['#90c8f0', '#e8f8ff', '#ff80e0'], 'combo', 'parry', ['visor', 'crown_ice'], 190, 20, 36, 1.3, ['slash', 'bio_incanto'], 'Para i colpi frontali: aggiralo.'],
    ['fungo_danzante', 'Fungo Danzante', 'blob', ['#a02a78', '#ff90c8', '#fff0a0'], 'contact', 'hop', ['mushcap'], 95, 16, 34, 1.2, null, 'Balla in cerchio e rilascia spore.'],
  ]],
  ancient: [T3 * 1.1, 'bio_antico', [
    ['custode_rovina', 'Custode di Rovina', 'golem', ['#5a5a50', '#9a9a88', '#40e0c0'], 'combo', 'armor', ['rune_eye'], 230, 22, 24, 1.6, ['slam', 'bio_antico'], 'Corazza di pietra finché il nucleo non si espone.'],
    ['lucertola_scudo', 'Lucertola Scudata', 'beast', ['#3a5a3a', '#7aa860', '#e0e060'], 'charger', 'shell', ['shell'], 150, 18, 40, 1.2, ['charge'], 'Il guscio devia i colpi frontali.'],
    ['sacerdote_pietra', 'Sacerdote di Pietra', 'ronin', ['#4a4a58', '#8a8a9a', '#ffd060'], 'ranged', 'echo', ['hood', 'halo'], 130, 20, 32, 1.2, ['shoot', 'bio_antico'], 'Ripete l\'ultimo incantesimo un istante dopo.'],
  ]],
  swamp: [T2, 'bio_palude', [
    ['sanguisuga_gigante', 'Sanguisuga Gigante', 'snake', ['#3a2a30', '#7a4a58', '#d86a8a'], 'contact', 'drain', [], 80, 11, 40, 1.1, null, 'Si cura mordendo.'],
    ['garzetta_nebbia', 'Garzetta di Nebbia', 'bird', ['#c8d0c0', '#f0f4e8', '#ff9a50'], 'ranged', 'circle', [], 70, 12, 44, 1.1, ['shoot', 'bio_palude'], 'Vola in cerchio e picchia fra le nebbie.'],
    ['mangrovia_errante', 'Mangrovia Errante', 'golem', ['#3a2e18', '#6a5a30', '#7ac05a'], 'combo', 'rise', ['thorns'], 160, 14, 22, 1.5, ['slam', 'bio_palude'], 'Si rialza una volta, a meno che non la bruci.'],
  ]],
  haunted: [T2 * 1.2, 'bio_infestato', [
    ['spettro', null], ['anima_inquieta', null],
    ['becchino_scheletrico', 'Becchino Scheletrico', 'skeleton', ['#4a4438', '#b8b098', '#ff7a30'], 'combo', 'pack', ['skull_face', 'hood'], 110, 14, 34, 1.1, ['slash', 'bio_infestato'], 'Chiama rinforzi dalle tombe.'],
  ]],
  jade: [T2 * 1.3, 'bio_giada', [
    ['monaco_bambu', 'Monaco del Bambù', 'ronin', ['#3a6a3a', '#8ac870', '#f0e060'], 'combo', 'parry', ['straw_hat'], 120, 15, 42, 1.1, ['slash', 'bio_giada'], 'Para e contrattacca: colpisci da dietro.'],
    ['carpa_volante', 'Carpa Volante', 'fish', ['#c85a2a', '#ffb060', '#ffffff'], 'ranged', 'orbit', ['fins'], 80, 14, 50, 1.0, ['shoot'], 'Nuota nell\'aria in spirali e sputa perle.'],
    ['guardiano_giada', 'Guardiano di Giada', 'golem', ['#2a7a5a', '#60d8a0', '#fff0a0'], 'charger', 'ironhide', ['crown'], 210, 18, 28, 1.5, ['charge', 'bio_giada'], 'Corazza di giada che si spezza a metà scontro.'],
  ]],
  tropical: [T2 * 1.5, 'bio_tropico', [
    ['scimmia_corsara', 'Scimmia Corsara', 'tanuki', ['#7a4a28', '#c8884a', '#ffe060'], 'contact', 'thief', [], 90, 13, 56, 0.9, null, 'Ruba monete e scappa fra le liane.'],
    ['granchio_cocco', 'Granchio del Cocco', 'crab', ['#c8502a', '#f08a4a', '#fff0c0'], 'combo', 'shell', [], 130, 16, 30, 1.2, ['slash', 'bio_tropico'], 'Il guscio devia i colpi frontali; vulnerabile mentre attacca.'],
    ['pappagallo_dardi', 'Pappagallo Dardo', 'bird', ['#2a9a4a', '#f04a4a', '#ffd040'], 'ranged', 'shadowstep', [], 70, 15, 50, 1.0, ['shoot'], 'Tira dardi e scompare tra le palme.'],
  ]],
  plateau: [T2 * 1.2, 'bio_altopiano', [
    ['capra_ferrata', 'Capra Ferrata', 'boar', ['#8a8a8a', '#d8d8d0', '#c8283a'], 'charger', 'berserk', ['horns'], 100, 14, 54, 1.1, ['charge'], 'Più veloce a ogni carica; se sbatte è stordita.'],
    ['aquila_ghiaia', 'Aquila di Ghiaia', 'bird', ['#6a5a40', '#c8b890', '#ffe080'], 'ranged', 'circle', [], 90, 15, 46, 1.2, ['shoot', 'bio_altopiano'], 'Vola in cerchio, immune in mischia finché non picchia.'],
    ['mandriano_corvo', 'Mandriano dei Corvi', 'goblin', ['#2a2a38', '#6a6a88', '#ff7a7a'], 'ranged', 'pack', ['hood'], 85, 13, 36, 1.0, ['shoot', 'bio_altopiano'], 'Chiama uno stormo di rinforzi.'],
  ]],
  mountain: [T3 * 0.9, 'bio_monte', [
    ['condor_tuono', 'Condor del Tuono', 'bird', ['#3a3a58', '#8a8ac0', '#ffe060'], 'ranged', 'static', ['storm_cloud'], 150, 20, 48, 1.4, ['shoot', 'bio_monte'], 'Campo elettrico attorno al corpo.'],
    ['troll_massi', 'Troll dei Massi', 'golem', ['#5a5a60', '#9a9aa4', '#c8e060'], 'combo', 'enrage', ['thorns'], 260, 24, 22, 1.7, ['slam', 'bio_monte'], 'Lancia macigni; furioso sotto metà vita.'],
    ['camoscio_ferrato', 'Camoscio Ferrato', 'beast', ['#7a6a50', '#d8c8a0', '#ffffff'], 'charger', 'berserk', ['antlers'], 160, 18, 56, 1.1, ['charge'], 'Salta di roccia in roccia e carica.'],
  ]],
  snow: [T3, 'bio_neve', [
    ['volpe_artica', 'Volpe Artica', 'wolf', ['#e8f0f8', '#ffffff', '#60a0e0'], 'contact', 'pack', [], 120, 17, 56, 1.0, null, 'Caccia in branco e ulula per chiamare altre volpi.'],
    ['dama_brinata', 'Dama Brinata', 'yukionna', ['#a8c8e8', '#f0f8ff', '#60d0ff'], 'ranged', 'frostbite', ['crown_ice'], 150, 20, 34, 1.2, ['shoot', 'bio_neve'], 'I suoi tocchi rallentano e lasciano chiazze di ghiaccio.'],
    ['pinguino_guerriero', 'Pinguino Guerriero', 'bird', ['#1a2030', '#e8f0f8', '#ffa030'], 'charger', 'berserk', ['helm'], 170, 19, 44, 1.2, ['charge'], 'Scivola sul ventre e travolge.'],
  ]],
  tundra: [T3 * 1.15, 'bio_tundra', [
    ['mammut_gelo', 'Mammut di Gelo', 'yeti', ['#7a6a5a', '#c8b8a8', '#e8f8ff'], 'combo', 'armor', ['ice_spikes'], 300, 26, 20, 1.9, ['slam', 'bio_tundra'], 'Pelo ghiacciato: danni ridotti finché non si scalda.'],
    ['falco_bufera', 'Falco di Bufera', 'bird', ['#4a5a78', '#c8d8f0', '#80c8ff'], 'ranged', 'blizzard', [], 140, 21, 52, 1.2, ['shoot', 'bio_tundra'], 'Porta con sé un turbine di neve.'],
    ['iena_polare', 'Iena Polare', 'wolf', ['#8a8a98', '#d0d0e0', '#e8505a'], 'contact', 'hunger', [], 150, 19, 54, 1.0, null, 'Succhia il Ki e accelera.'],
  ]],
  canyon: [T3, 'bio_canyon', [
    ['serpe_sonagli', 'Serpe a Sonagli', 'snake', ['#8a5a28', '#d8a860', '#ffe090'], 'contact', 'burrow', [], 120, 18, 46, 1.1, null, 'Si interra e ti morde dal sottosuolo.'],
    ['avvoltoio_rosso', 'Avvoltoio Rosso', 'bird', ['#7a2a1a', '#d85a3a', '#ffd060'], 'ranged', 'circle', [], 130, 19, 48, 1.3, ['shoot', 'bio_canyon'], 'Vola in cerchio e picchia.'],
    ['gigante_arenaria', 'Gigante d\'Arenaria', 'golem', ['#a8602a', '#e0904a', '#fff0a0'], 'combo', 'armor', ['rune_eye'], 280, 25, 22, 1.8, ['slam', 'bio_canyon'], 'Si sgretola a metà scontro esponendo il nucleo.'],
  ]],
  badlands: [T3 * 1.1, 'bio_calanchi', [
    ['sciacallo_meccanico', 'Sciacallo Meccanico', 'mechdog', ['#7a5a3a', '#c8a070', '#2ee6ff'], 'charger', 'overheat', ['scanner'], 170, 21, 56, 1.1, ['charge'], 'Dopo tre cariche si surriscalda.'],
    ['drone_predone', 'Drone Predone', 'drone', ['#5a4a38', '#a89070', '#ff7a30'], 'ranged', 'scan', ['scanner'], 130, 20, 44, 1.1, ['shoot', 'bio_calanchi'], 'Se ti vede chiama un drone di rinforzo.'],
    ['razziatore_rottami', 'Razziatore di Rottami', 'goblin', ['#6a4a30', '#c89858', '#c8283a'], 'combo', 'torch', ['hood', 'helm'], 200, 22, 34, 1.2, ['slash', 'bio_calanchi'], 'Scaglia torce incendiarie.'],
  ]],
  desert: [T3 * 1.2, 'bio_deserto', [
    ['scarabeo_sacro', 'Scarabeo Sacro', 'spider', ['#1a3a6a', '#3a8ac8', '#ffd060'], 'contact', 'burrow', ['sun_rays'], 150, 20, 44, 1.1, null, 'Sbuca dalla sabbia sotto i tuoi piedi.'],
    ['sacerdote_sole', 'Sacerdote del Sole', 'mummy', ['#c8a040', '#f0d070', '#ff5030'], 'ranged', 'sandstorm', ['sun_rays', 'crown'], 220, 24, 30, 1.3, ['shoot', 'bio_deserto'], 'Scatena una tempesta di sabbia.'],
    ['sciacallo_dorato', 'Sciacallo d\'Oro', 'wolf', ['#b8882a', '#f0c860', '#fff0a0'], 'charger', 'pack', [], 180, 21, 56, 1.1, ['charge'], 'Corre in branco attorno a te.'],
  ]],
  dunes: [T3 * 1.25, 'bio_dune', [
    ['verme_dune', 'Verme delle Dune', 'snake', ['#8a5a3a', '#d8a870', '#ffe0b0'], 'charger', 'burrow', ['fangs'], 240, 25, 36, 1.8, ['charge', 'bio_dune'], 'Emerge dal basso inghiottendo la sabbia.'],
    ['miraggio_danzante', 'Miraggio Danzante', 'ghost', ['#e8d8a0', '#fff4c8', '#ffffff'], 'ranged', 'illusion', [], 120, 22, 40, 1.2, ['shoot', 'mirage'], 'Si sdoppia in miraggi che svaniscono al primo colpo.'],
    ['predone_veli', 'Predone dei Veli', 'ronin', ['#7a3a5a', '#d8a8c8', '#ffd060'], 'combo', 'shadowstep', ['hood', 'visor'], 210, 24, 40, 1.1, ['slash', 'bio_dune'], 'Svanisce nei veli di sabbia e riappare alle spalle.'],
  ]],
  volcano: [T4, 'bio_vulcano', [
    ['cinghiale_magma', 'Cinghiale di Magma', 'boar', ['#3a1a14', '#e0502a', '#ffd060'], 'charger', 'trail', ['flame_mane'], 280, 30, 56, 1.4, ['charge', 'bio_vulcano'], 'La carica lascia una scia di fuoco.'],
    ['araldo_cenere', 'Araldo di Cenere', 'wisp', ['#4a4448', '#a89aa0', '#ff7a30'], 'ranged', 'phase', ['halo'], 230, 28, 40, 1.3, ['shoot', 'bio_vulcano'], 'Alterna corporeo e intangibile.'],
    ['gigante_ossidiana', 'Gigante d\'Ossidiana', 'golem', ['#14101c', '#4a3a6a', '#ff5030'], 'combo', 'ironhide', ['rune_eye', 'bone_spikes'], 380, 34, 22, 2.0, ['slam', 'bio_vulcano'], 'Corazza di vetro nero che si spezza a metà scontro.'],
  ]],
  // ---- MARI: quattro mari attorno al continente, ognuno con tre creature sue (acquatiche) ----
  sea_n: [T3, 'bio_mare_n', [
    ['orca_glaciale', 'Orca Glaciale', 'shark', ['#2a2e3a', '#e8f0f8', '#80d0ff'], 'charger', 'frenzy', ['ice_spikes'], 210, 24, 54, 1.5, ['charge'], 'Carica a tutta velocità; i suoi spuntoni di ghiaccio la proteggono di lato.'],
    ['medusa_boreale', 'Medusa Boreale', 'jelly', ['#80c0ff', '#e0f4ff', '#a0ffe0'], 'ranged', 'static', [], 120, 18, 26, 1.2, ['shoot', 'bio_mare_n'], 'Pulsa come un\'aurora e lascia cadere schegge di ghiaccio.'],
    ['granchio_di_banchisa', 'Granchio di Banchisa', 'crab', ['#a0c8e8', '#e8f8ff', '#4a7aa8'], 'combo', 'armor', ['shell'], 260, 22, 30, 1.4, ['slam'], 'Il guscio gelato devia i colpi frontali: aggira le chele.'],
  ]],
  sea_s: [T3, 'bio_mare_s', [
    ['pesce_corallo', 'Pesce Corallo', 'fish', ['#c88a3a', '#f0c868', '#ff6040'], 'charger', 'hop', [], 150, 20, 60, 1.1, ['charge'], 'Scatta fuori dall\'acqua a ogni assalto.'],
    ['murena_scarlatta', 'Murena Scarlatta', 'snake', ['#d05a7a', '#f0a0b0', '#ffe060'], 'combo', 'shadowstep', [], 190, 23, 46, 1.4, ['slash', 'bio_mare_s'], 'Sbuca dal fondale e morde a ripetizione.'],
    ['manta_solare', 'Manta Solare', 'bat', ['#e0a030', '#ffe090', '#ff7030'], 'ranged', 'circle', ['sun_rays'], 140, 19, 50, 1.4, ['shoot'], 'Plana in cerchio sulle acque calde e abbaglia.'],
  ]],
  sea_w: [T4, 'bio_mare_o', [
    ['spettro_naufrago', 'Spettro Naufrago', 'ghost', ['#2a4a5a', '#80c0c0', '#c0ffe0'], 'ranged', 'echo', ['helm'], 170, 26, 34, 1.3, ['shoot', 'bio_mare_o'], 'Un marinaio senza pace: ripete l\'ultimo incantesimo.'],
    ['polpo_abissale', 'Polpo Abissale', 'jelly', ['#3a1a5a', '#7a3aa0', '#ff60c0'], 'combo', 'ironhide', ['rune_eye'], 300, 28, 28, 1.6, ['slam'], 'Avvolge e stritola; il suo occhio brilla prima del colpo.'],
    ['squalo_martello', 'Squalo Martello', 'shark', ['#4a5a4a', '#8aa08a', '#e8e8c0'], 'charger', 'pack', ['fins'], 220, 27, 58, 1.4, ['charge'], 'Caccia in branco: se ne vedi uno, ce ne sono altri.'],
  ]],
  sea_e: [T4, 'bio_mare_e', [
    ['serpente_marino', 'Serpente Marino', 'snake', ['#2a8a6a', '#60e0b0', '#ffe060'], 'ranged', 'orbit', [], 230, 29, 44, 1.8, ['shoot', 'bio_mare_e'], 'Ti circonda fra le onde e sputa saette.'],
    ['anguilla_tempesta', 'Anguilla della Tempesta', 'fish', ['#3a3a8a', '#8a8aff', '#ffff60'], 'ranged', 'static', ['storm_cloud'], 180, 27, 40, 1.3, ['shoot'], 'Porta con sé un nuvolone: i fulmini cadono dove stai.'],
    ['tartaruga_vulcanica', 'Tartaruga Vulcanica', 'crab', ['#5a2a20', '#c8603a', '#ffb040'], 'combo', 'armor', ['shell'], 380, 31, 24, 1.8, ['slam'], 'Un guscio di lava raffreddata: lenta ma quasi indistruttibile.'],
  ]],
};

export const BIOME_ROSTER = {}, NEW_BIOME_ENEMIES = {}, BIOME_SPAWN = {};
for (const [biome, [tier, sig, list]] of Object.entries(ROSTER)) {
  BIOME_ROSTER[biome] = ['kage_slime'].filter(() => biome === 'meadow');
  for (const row of list) {
    if (row.length === 2) { BIOME_ROSTER[biome].push(row[0]); continue; }   // creatura già esistente, riservata a questo bioma
    const [id, n, shape, col, ai, trait, vis, hp, atk, spd, size, atks, tip] = row;
    const tm = Math.max(1, tier);
    NEW_BIOME_ENEMIES[id] = { n, hp: Math.round(hp * Math.max(1, tm * 0.25 + 0.75)), atk: Math.round(atk * (0.8 + tm * 0.08)), spd, xp: Math.round(hp * 0.55 + atk), gold: [Math.max(3, hp / 20 | 0), Math.max(6, hp / 8 | 0)], shape, col, ai, trait, vis, size: size === 1 ? undefined : size, drops: [], tip,
      ...(atks ? { atks } : {}), ...(ai === 'ranged' ? { shoot: O(sig.endsWith('incanto') || shape === 'wisp' ? 'orb' : 'arrow', 90 + tier * 6, 1 + (tier > 3 ? 1 : 0), 2.2, 150, { spread: 0.25 }) } : {}), biome };
    if (biome.startsWith('sea_')) NEW_BIOME_ENEMIES[id].aquatic = true;
    BIOME_ROSTER[biome].push(id);
  }
  BIOME_SPAWN[biome] = BIOME_ROSTER[biome].map((id, k) => [id, k === 0 ? 4 : k === 1 ? 3 : 2]);
}
export const BIOME_SIGNATURE = Object.fromEntries(Object.entries(ROSTER).map(([b, [, sig]]) => [b, sig]));
