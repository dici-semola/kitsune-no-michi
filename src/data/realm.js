// Il mondo aperto: regni (regioni), civiltà, insediamenti, luoghi di interesse, dungeon, spiriti.
// Tutto è dichiarativo; i generatori in world/Generators.js lo trasformano in terreno, strade e strutture.
import { T } from './tiles.js';

export const OX = 160, OY = 176;                 // la "terra di Hinomoto" originale (320x224) vive in questo rettangolo
export const WORLD = { w: 640, h: 576 };          // 368.640 tile = 20,6 volte la mappa originale (160x112)
export const HEART = { x: OX + 12, y: OY + 12, w: 296, h: 200 };

// Indici di bioma (zona) usati da TileMap.zone
export const BIOME_LIST = ['meadow', 'forest', 'swamp', 'desert', 'snow', 'canyon', 'ocean', 'ancient', 'enchanted', 'haunted', 'volcano', 'jade', 'plateau', 'tundra', 'dunes', 'badlands', 'tropical', 'mountain'];
export const B = Object.fromEntries(BIOME_LIST.map((k, i) => [k, i]));
export const ZONE_NAMES_NEW = {
  ancient: 'Foresta Primigenia', enchanted: 'Bosco Incantato', haunted: 'Bosco dei Lamenti', volcano: 'Terre di Cenere', jade: 'Valli di Giada',
  plateau: "Altopiano d'Augusta", tundra: 'Tundra del Gelo Eterno', dunes: 'Mare di Dune', badlands: 'Calanchi Ruggine', tropical: 'Costa delle Palme', mountain: 'Catena dei Monti Ferrosi',
};

// Semi dei regni: posizione, bioma, peso. I confini (con catene montuose) nascono dal diagramma di Voronoi deformato dal rumore: nessun anello, nessun centro.
export const REALMS = [
  // cuore storico (traslato): praterie, foresta, palude, deserto, nevi, canyon
  { x: OX + 150, y: OY + 125, b: B.meadow, wt: 1.3 }, { x: OX + 230, y: OY + 185, b: B.meadow, wt: 1 }, { x: OX + 46, y: OY + 108, b: B.forest, wt: 1.3 },
  { x: OX + 90, y: OY + 185, b: B.swamp, wt: 1 }, { x: OX + 270, y: OY + 95, b: B.desert, wt: 1.1 }, { x: OX + 140, y: OY + 35, b: B.snow, wt: 1.2 }, { x: OX + 250, y: OY + 38, b: B.canyon, wt: 1 },
  // nuovi regni
  { x: 120, y: 62, b: B.tundra, wt: 1.2 }, { x: 335, y: 62, b: B.mountain, wt: 1.25 }, { x: 540, y: 78, b: B.volcano, wt: 1.1 }, { x: 492, y: 160, b: B.jade, wt: 1.05 },
  { x: 232, y: 118, b: B.plateau, wt: 1.1 }, { x: 62, y: 292, b: B.ancient, wt: 1.2 }, { x: 96, y: 172, b: B.enchanted, wt: 1 }, { x: 84, y: 452, b: B.haunted, wt: 1.1 },
  { x: 582, y: 308, b: B.badlands, wt: 1.1 }, { x: 524, y: 438, b: B.dunes, wt: 1.1 }, { x: 436, y: 515, b: B.tropical, wt: 1 }, { x: 322, y: 484, b: B.meadow, wt: 0.9 },
];
export const REALM_ELEV = { mountain: 0.28, snow: 0.14, tundra: 0.12, volcano: 0.16, badlands: 0.08, canyon: 0.1, plateau: 0.05 };

// ---------------------------------------------------------------------------------------------
// CIVILTÀ: ogni civiltà ha architettura (tile), costumi, gente, bottega, tradizioni.
// pal = costumi degli abitanti; style = coppia di tile (muro, tetto); rows = ruoli degli edifici
const R = (a, b) => [a, b];
export const CIVS = {
  cn: {
    name: 'Longxi', title: 'Villaggio tradizionale cinese', style: { wall: T.WALLCN, roof: T.ROOFCN }, ground: T.GRASS, road: T.COBBLE, wallRing: T.WALLCN, floor: T.TATAMI, ambient: [30, 20, 10, 0.12],
    pal: { top: '#c0392b', bottom: '#2a7a5a', hair: '#1a1a22', sash: '#e8c040', opts: { straw: 1, long: 1 } }, center: 'pond_pagoda', decor: ['bamboo', 'redlamps'],
    inn: { who: 'Locandiere Wei', price: 30, greet: 'Benvenuto alla Locanda del Loto! Tè al gelsomino e un letto: 30 monete.', news: 'Ogni notte di luna piena i draghi di giada cantano nel tempio a est. Chi li ascolta in silenzio riceve fortuna.' },
    shop: { who: 'Mercante Lin', n: 'Mercato del Tè di Longxi', greet: 'Tè, dim sum e spade jian forgiate sulle montagne!', stock: ['baozi', 'te_giada', 'veste_giada', 'spada_jian', 'freccia', 'freccia_veleno', 'pozione_vita_m'] },
    elder: { who: 'Maestra Yun', title: 'Custode del Tempio', lore: ['Longxi fu fondata da monaci che giurarono di vegliare sul Tempio del Drago. Qui si vive di tè, bambù e preghiere.', 'Nel tempio dormono i draghi di giada. Se i serpenti d\'acqua infestano le nostre valli, è perché qualcosa li disturba da sotto.'],
      quest: { id: 'q_cn', title: 'Serpenti di Giada', enemy: 'serpente_giada', n: 4, text: 'Scaccia 4 Serpenti di Giada nelle valli', reward: { gold: 200, maxHp: 4, items: [['te_giada', 3]] } } },
    guard: 'Pace, viaggiatore. Longxi accoglie chi rispetta i ponti e il silenzio dei giardini.',
    folk: [{ who: 'Giardiniere Bo', lines: ['I ponti sul laghetto sono stati costruiti senza un solo chiodo.', 'Nel bambù a sud vive un tigre bianca: non le piace il rumore.'] },
      { who: 'Bimba Mei', lines: ['Ho visto uno spirito vestito di verde accanto allo stagno, ieri notte!', 'Se sali sulla pagoda si vedono tutte le valli!'] }],
  },
  imp: {
    name: 'Augusta Imperialis', title: 'Città imperiale antica', style: { wall: T.MARBLE, roof: T.TILEROOF }, ground: T.MARBLEFLOOR, road: T.MARBLEFLOOR, wallRing: T.MARBLE, floor: T.MARBLEFLOOR, ambient: [255, 235, 200, 0.06],
    pal: { top: '#f0ece0', bottom: '#a02a3a', hair: '#5a3a1a', sash: '#d8b040', opts: { bandana: 1, bandanaCol: '#4a9a3a' } }, center: 'arena', decor: ['statues', 'aqueduct'],
    inn: { who: 'Oste Marcus', price: 40, greet: 'Ave! Al "Gladio e Vino" un letto con lenzuola di lino costa 40 monete.', news: 'Nell\'anfiteatro si tengono i giochi alla fine di ogni stagione. Si mormora che l\'Imperatore sia sparito da anni, e che il Senato governi in suo nome.' },
    shop: { who: 'Mercator Gaius', n: 'Foro di Augusta', greet: 'Il Foro offre il meglio dell\'Impero: armi, vino e pane!', stock: ['pane_imperiale', 'vino_falerno', 'gladio_imperiale', 'lorica_segmentata', 'freccia', 'freccia_fuoco', 'pozione_vita_l'] },
    elder: { who: 'Senatore Livio', title: 'Console di Augusta', lore: ['Augusta è l\'ultima città di un impero che coprì tutto il continente. Le sue colonne hanno visto mille inverni.', 'Sotto le Rovine di Anor giace il vecchio palazzo imperiale, ora covo di colossi di pietra. Nessuno torna da là.'],
      quest: { id: 'q_imp', title: 'Le Legioni Dimenticate', enemy: 'scheletro_guerriero', n: 5, text: 'Sconfiggi 5 Scheletri Guerrieri presso le rovine', reward: { gold: 350, maxHp: 5, items: [['lorica_segmentata', 1]] } } },
    guard: 'Alt! Augusta è sotto la legge del Senato. Posa le armi nel Foro, cittadino.',
    folk: [{ who: 'Poeta Ovidio', lines: ['Cantai ogni colonna di questa città: nessuna ricorda il mio nome.', 'L\'acquedotto portava acqua da montagne che non esistono più.'] },
      { who: 'Gladiatore Brutus', lines: ['Chi sopravvive tre combattimenti nell\'arena ottiene la libertà.', 'Il Colosso sotto le rovine non si batte con la forza, ma con la pazienza.'] }],
  },
  elf: {
    name: 'Silvaneth', title: 'Città elfica sugli alberi', style: { wall: T.ELVENWALL, roof: T.TREEHOUSE }, ground: T.MAGICGRASS, road: T.DOCK, wallRing: 0, floor: T.WOOD, ambient: [60, 160, 120, 0.18],
    pal: { top: '#3a8a5a', bottom: '#7a5a3a', hair: '#e8e0a0', sash: '#d8c870', opts: { pointy: 1, long: 1 } }, center: 'pond_lamps', decor: ['mushrooms', 'giant_trees'],
    inn: { who: 'Locandiera Aelwen', price: 45, greet: 'Siate i benvenuti sotto le fronde. Un giaciglio di muschio per 45 monete.', news: 'Gli alberi di Silvaneth sussurrano di notte. Chi sa ascoltarli sente i nomi di chi li ha piantati.' },
    shop: { who: 'Arciere Legolas', n: 'Bottega dei Rami', greet: 'Archi intagliati dalla Foresta Primigenia e frecce con punte di luna.', stock: ['miele_elfico', 'nettare_luna', 'arco_elfico', 'mantello_elfico', 'freccia', 'freccia_magica', 'incenso'] },
    elder: { who: 'Regina Galadis', title: 'Voce della Foresta', lore: ['Silvaneth nacque quando il primo albero imparò a parlare. Noi non abbattiamo: chiediamo permesso.', 'I kodama vivono ai margini del Bosco Incantato. Sono timidi: offri loro del cibo e ti benediranno.'],
      quest: { id: 'q_elf', title: 'Il Cuore del Bosco', enemy: 'fata_dispettosa', n: 4, text: 'Scaccia 4 Fate Dispettose dal Bosco Incantato', reward: { gold: 300, maxHp: 5, items: [['arco_elfico', 1]] } } },
    guard: 'Le frecce degli elfi non mancano mai. Cammina piano, straniero: la foresta ti osserva.',
    folk: [{ who: 'Cantore Elrond', lines: ['Cantiamo agli alberi da diecimila primavere.', 'A ovest il Bosco dei Lamenti: lì gli alberi sono morti, e i morti non sanno di esserlo.'] },
      { who: 'Giovane Lúthien', lines: ['I kodama portano fortuna, ma scappano se li fissi.', 'Una luce verde danza sopra la Sorgente Sacra ogni notte.'] }],
  },
  des: {
    name: 'Sahar', title: 'Città del deserto', style: { wall: T.ADOBE, roof: T.ADOBE }, ground: T.SAND, road: T.SAND, wallRing: T.ADOBE, floor: T.RUG, ambient: [255, 200, 120, 0.08],
    pal: { top: '#e8d8b0', bottom: '#8a4a2a', hair: '#2a1a14', sash: '#c03030', opts: { turban: 1, turbanCol: '#e85a3a', scarf: 1, scarfCol: '#ffd060' } }, center: 'oasis', decor: ['palms', 'tents'],
    inn: { who: 'Locandiere Karim', price: 35, greet: 'Che l\'ombra ti sia lieve! Un tappeto fresco e acqua: 35 monete.', news: 'Sotto le dune dorme Ur-Zahar, la città sepolta. Il vento a volte scopre i suoi tetti, poi li ricopre.' },
    shop: { who: 'Mercante Jamal', n: 'Suq di Sahar', greet: 'Spezie, acqua d\'oasi e lame curve: tutto per attraversare le dune!', stock: ['datteri', 'acqua_oasi', 'scimitarra', 'turbante_sabbia', 'freccia', 'freccia_fuoco', 'elisir_vento'] },
    elder: { who: 'Sceicco Rashid', title: 'Signore delle Carovane', lore: ['Sahar vive dell\'acqua dell\'oasi e delle carovane. Chi ha acqua ha potere: così abbiamo fatto dell\'ospitalità una legge.', 'Gli sciacalli dorati seguono le carovane di notte. E sotto le dune, qualcosa di antico non vuole essere disturbato.'],
      quest: { id: 'q_des', title: 'Scorta alla Carovana', enemy: 'sciacallo', n: 5, text: 'Allontana 5 Sciacalli dalle piste delle carovane', reward: { gold: 280, maxHp: 4, items: [['turbante_sabbia', 1]] } } },
    guard: 'Le porte di Sahar chiudono col vento di sabbia. Entra prima che il cielo diventi rosso.',
    folk: [{ who: 'Cammelliere Omar', lines: ['Il mio cammello conosce i pozzi meglio di me.', 'Una volta ho visto un faraone camminare sulla duna, a mezzanotte.'] },
      { who: 'Danzatrice Layla', lines: ['La danza del velo racconta storie che le parole non sanno dire.', 'Chi trova il Cuore di Ur-Zahar diventa re... o polvere.'] }],
  },
  port: {
    name: 'Porto Marea', title: 'Città portuale', style: { wall: T.BUILDEU, roof: T.ROOFEU }, ground: T.COBBLE, road: T.COBBLE, wallRing: 0, floor: T.WOOD, ambient: [120, 160, 200, 0.1],
    pal: { top: '#2a4a8a', bottom: '#e8e0d0', hair: '#7a4a2a', sash: '#c03030', opts: { bandana: 1, bandanaCol: '#c03030' } }, center: 'fountain_anchor', decor: ['ships', 'lighthouse', 'crates'],
    inn: { who: 'Oste Barbarossa', price: 35, greet: 'Ahoy! Il "Gabbiano Ubriaco" offre branda e rum: 35 monete.', news: 'Le navi che salpano verso le isole del sud spesso non tornano. Dicono sia colpa della Banshee dei Flutti.' },
    shop: { who: 'Mercante Capitano Noè', n: 'Banco del Molo', greet: 'Merci da ogni mare! Pesce, rum, sciabole e arpioni.', stock: ['pesce_salato', 'rum', 'sciabola', 'giubba_marinaio', 'freccia', 'freccia_veleno', 'pozione_vita_m', 'tuta_sub'] },
    elder: { who: 'Ammiraglio Ishmael', title: 'Capo del Porto', lore: ['Porto Marea collega il continente alle isole. Chi controlla il molo controlla il commercio.', 'Le isole del sud nascondono il villaggio tribale di Kuru e la città su palafitte di Coralia: raggiungibile solo a nuoto o col delfino.'],
      quest: { id: 'q_port', title: 'Mari Infestati', enemy: 'squalo', n: 3, text: 'Abbatti 3 Squali Abissali che minacciano il porto', reward: { gold: 320, maxHp: 4, items: [['giubba_marinaio', 1], ['perla_grezza', 2]] } } },
    guard: 'Il molo è sorvegliato. Niente contrabbando, niente risse. Divertiti, marinaio!',
    folk: [{ who: 'Pescatore Pip', lines: ['Il faro non si spegne mai da quando il vecchio guardiano è morto... chissà chi lo accende.', 'Il pesce abbocca di più nelle notti di luna nuova.'] },
      { who: 'Mozzo Tom', lines: ['Un giorno avrò una nave tutta mia!', 'Ho visto una luce bluastra sotto il pontile, ieri sera.'] }],
  },
  trib: {
    name: 'Kuru', title: 'Villaggio tribale', style: { wall: T.HUT, roof: T.HUT }, ground: T.JUNGLE, road: T.DIRT, wallRing: T.FENCE, floor: T.DIRT, ambient: [255, 160, 80, 0.12],
    pal: { top: '#8a5a30', bottom: '#6a8a3a', hair: '#1a1410', sash: '#e84a4a', opts: { spiky: 1, scarf: 1, scarfCol: '#40b0d8' } }, center: 'bonfire', decor: ['totems', 'palms'],
    inn: { who: 'Mamma Zuri', price: 25, greet: 'Siediti vicino al fuoco, straniero. Una stuoia calda: 25 monete.', news: 'Gli antenati parlano nelle notti di tempesta. Se li ascolti, ti dicono dove sono nascosti i tesori.' },
    shop: { who: 'Sciamano Baku', n: 'Capanna delle Erbe', greet: 'Erbe, ossa e magie. I miei rimedi curano ciò che la spada ferisce.', stock: ['carne_arrosto', 'pozione_tribale', 'lancia_tribale', 'maschera_tribale', 'freccia', 'freccia_veleno', 'incenso'] },
    elder: { who: 'Capo Tumaini', title: 'Voce degli Antenati', lore: ['Kuru esiste da prima delle città. I nostri totem parlano con chi ha pazienza.', 'Le scimmie ladre rubano i nostri raccolti. Fermale, e il villaggio ti considererà un fratello.'],
      quest: { id: 'q_trib', title: 'Ladre della Giungla', enemy: 'scimmia_ladra', n: 5, text: 'Scaccia 5 Scimmie Ladre dalle coltivazioni', reward: { gold: 240, maxHp: 4, items: [['maschera_tribale', 1]] } } },
    guard: 'Il fuoco non si spegne mai a Kuru. Se vieni in pace, siedi con noi.',
    folk: [{ who: 'Cacciatrice Nia', lines: ['Il coccodrillo si nasconde nel fango: guarda le bollicine.', 'Il Cerchio dei Sussurri parla solo a chi arriva di notte.'] },
      { who: 'Ragazzo Jabari', lines: ['Voglio diventare cacciatore come mia madre!', 'La tigre bianca delle valli ha occhi come lune.'] }],
  },
  cyb: {
    name: 'Zero-Quartier', title: 'Distretto cyberpunk', style: { wall: T.NEONWALL, roof: T.NEONWALL }, ground: T.STONE, road: T.NEON, wallRing: 0, floor: T.NEON, ambient: [40, 10, 80, 0.3],
    pal: { top: '#14102a', bottom: '#2ee6ff', hair: '#ff3fa4', sash: '#ff3fa4', opts: { goggles: 1, spiky: 1, glow: '255,63,164' } }, center: 'holo', decor: ['neontowers', 'holosigns'],
    inn: { who: 'Gestore NODE-7', price: 50, greet: 'BENVENUTO. CAPSULA DORMITORIO: 50 CREDITI. COLAZIONE SINTETICA INCLUSA.', news: 'Il quartiere è nato quando una crepa nel tempo ha fatto filtrare tecnologia dal futuro. Neo-Edo è il suo riflesso.' },
    shop: { who: 'Tecnomante Kira', n: 'Mercato Neon', greet: 'Hardware, nano-medicine e katane vibranti. Paga in monete, prendi il futuro.', stock: ['nutri_gel', 'caffe_synth', 'katana_vibro', 'giacca_neon', 'freccia_magica', 'arco_impulsi', 'pozione_ki_l'] },
    elder: { who: 'Architetta ZERO', title: 'Sindaca del Distretto', lore: ['Qui la tecnologia nasce dai frammenti di futuro che arrivano dalla crepa. Io li studio. Qualcuno, dall\'altra parte, li sta mandando apposta.', 'I droni selvaggi sono sfuggiti al controllo di KAMI-OS. Non attaccano i residenti, ma tutti gli altri sì.'],
      quest: { id: 'q_cyb', title: 'Droni Selvaggi', enemy: 'drone_selvaggio', n: 4, text: 'Disattiva 4 Droni Selvaggi nei calanchi', reward: { gold: 400, maxHp: 5, items: [['giacca_neon', 1]] } } },
    guard: 'Scansione completata: nessuna minaccia. Vai pure, straniero.',
    folk: [{ who: 'Hacker Pixel', lines: ['Se guardi bene, le insegne al neon mostrano messaggi nascosti.', 'Il codice di KAMI-OS contiene una firma: un nome, ripetuto. Mugenkai.'] },
      { who: 'Venditrice Neko', lines: ['Noodle sintetici, i migliori di tutto il quartiere!', 'Di notte i fantasmi dei vecchi server appaiono sugli schermi.'] }],
  },
  isl: {
    name: 'Coralia', title: 'Insediamento su isola', style: { wall: T.HUT, roof: T.HUT }, ground: T.SAND, road: T.DOCK, wallRing: 0, floor: T.DOCK, ambient: [100, 200, 220, 0.08],
    pal: { top: '#e8a040', bottom: '#40a0a8', hair: '#3a2a1a', sash: '#40b0d8', opts: { straw: 1, long: 1 } }, center: 'lagoon', decor: ['palms', 'walkways'],
    inn: { who: 'Locandiera Moana', price: 30, greet: "Aloha, viaggiatore! Un'amaca sull'acqua per 30 monete.", news: 'Il mare ci porta tutto ciò che serve. A volte, anche i fantasmi delle navi affondate.' },
    shop: { who: 'Pescatrice Kai', n: 'Bancarella dei Coralli', greet: 'Perle, coralli e pesce fresco di barriera!', stock: ['pesce_salato', 'rum', 'perla_grezza', 'corallo_rosso', 'freccia', 'freccia_veleno', 'pozione_vita_m'] },
    elder: { who: 'Nonno Pele', title: 'Custode del Corallo', lore: ['Coralia galleggia sull\'acqua da quando i nostri avi fuggirono dal grande maremoto.', 'Sotto la barriera c\'è un palazzo sommerso. Il Leviatano lo custodisce da sempre.'],
      quest: { id: 'q_isl', title: 'Perle della Barriera', have: 'perla_grezza', n: 3, text: 'Porta 3 Perle Grezze a Nonno Pele', reward: { gold: 260, maxHp: 4, items: [['ciondolo_orologio', 1]] } } },
    guard: 'Benvenuto a Coralia. Non gettare rifiuti in acqua: i coralli sono sacri.',
    folk: [{ who: 'Tuffatore Makoa', lines: ['Sott\'acqua il tempo scorre più lento. Credo.', 'Il delfino Shirone ama i pesci piccoli.'] },
      { who: 'Bimba Lani', lines: ['Ho una conchiglia che canta!', 'Di notte le onde brillano di azzurro.'] }],
  },
};

// Insediamenti (rettangoli fissi: il generatore garantisce terra piatta e collega le strade)
export const NEW_SITES = {
  longxi: { kind: 'cn', x: 470, y: 142, w: 44, h: 34, gates: ['s', 'n', 'w'], roles: ['inn', 'shop', 'hall', 'house'] },
  augusta: { kind: 'imp', x: 205, y: 96, w: 56, h: 42, gates: ['s', 'w', 'n', 'e'], roles: ['inn', 'shop', 'hall', 'house'] },
  silvaneth: { kind: 'elf', x: 40, y: 270, w: 48, h: 38, gates: ['e', 'n', 's'], roles: ['inn', 'shop', 'hall', 'house'] },
  sahar: { kind: 'des', x: 500, y: 418, w: 44, h: 32, gates: ['w', 's', 'n'], roles: ['inn', 'shop', 'hall', 'house'] },
  portomarea: { kind: 'port', x: 298, y: 468, w: 52, h: 34, gates: ['n', 'e', 'w'], roles: ['inn', 'shop', 'hall', 'house'] },
  kuru: { kind: 'trib', x: 420, y: 498, w: 36, h: 28, gates: ['w', 'n', 'e'], roles: ['inn', 'shop', 'hall', 'house'] },
  zeroquartier: { kind: 'cyb', x: 556, y: 284, w: 48, h: 40, gates: ['w', 'n', 's'], roles: ['inn', 'shop', 'hall', 'house'] },
  coralia: { kind: 'isl', x: 238, y: 528, w: 34, h: 28, gates: [], roles: ['inn', 'shop', 'hall', 'house'], island: true },
};
// Le città di civiltà sono ampliate (~2x di superficie) per ospitare quartieri, mercati e case di quartiere
for (const [id, s] of Object.entries(NEW_SITES)) {
  const c = CIVS[s.kind], nw = Math.round(s.w * 1.45), nh = Math.round(s.h * 1.4);
  s.x -= (nw - s.w) >> 1; s.y -= (nh - s.h) >> 1; s.w = nw; s.h = nh;
  s.id = id; s.n = c.name; s.civ = c;
}

// Luoghi di interesse sull'overworld. map = mappa raggiunta; req = condizione d'accesso (Script)
export const POIS = [
  { id: 'cimitero', n: 'Cimitero dei Dimenticati', kind: 'graveyard', x: 92, y: 436, map: 'cripta_1' },
  { id: 'rocca_nera', n: 'Castello di Rocca Nera', kind: 'castle', x: 150, y: 506, map: 'castello_1' },
  { id: 'rovine_anor', n: 'Rovine di Anor', kind: 'ruins', x: 176, y: 214, map: 'rovine_1' },
  { id: 'ur_zahar', n: 'Ur-Zahar, la città sepolta', kind: 'buried', x: 560, y: 486, map: 'ur_zahar_1' },
  { id: 'vulcano', n: 'Vulcano Ōmagma', kind: 'volcano', x: 548, y: 92, map: 'vulcano_1' },
  { id: 'cerchio', n: 'Cerchio dei Sussurri', kind: 'stones', x: 104, y: 162, map: 'regno_spiriti', req: [['night']], deny: 'Le pietre restano mute di giorno. Torna quando cala la notte.' },
  { id: 'sorgente', n: 'Sorgente Sacra', kind: 'fairy', x: 64, y: 205 },
  { id: 'tempio_drago', n: 'Tempio del Drago di Giada', kind: 'dragon', x: 508, y: 196, map: 'tempio_drago_1' },
  { id: 'ghiacciaio', n: 'Grotta del Ghiacciaio', kind: 'glacier', x: 142, y: 58, map: 'ghiacciaio_1' },
  { id: 'porta_nani', n: 'Porta di Khaz-Dum', kind: 'dwarfgate', x: 336, y: 92, map: 'khaz_dum' },
  { id: 'galleria_nera', n: 'Galleria Nera', kind: 'tunnel', x: 224, y: 404, map: 'nethermere' },
  { id: 'faro_morto', n: 'Isolotto del Faro Morto', kind: 'isletwreck', x: 380, y: 552 },
];

// Strade tra insediamenti e luoghi (A* con ponti sui fiumi, passi tra le montagne)
export const ROADS = [
  ['hinomura:n', 'augusta:s'], ['hinomura:w', 'silvaneth:e'], ['aurelburg:s', 'portomarea:n'], ['aurelburg:e', 'zeroquartier:w'], ['portomarea:e', 'kuru:w'],
  ['kuru:e', 'sahar:s'], ['portomarea:w', 'poi:cimitero'], ['zeroquartier:n', 'longxi:s'], ['longxi:w', 'poi:tempio_drago'], ['longxi:n', 'poi:vulcano'],
  ['augusta:w', 'poi:rovine_anor'], ['augusta:n', 'poi:porta_nani'], ['silvaneth:n', 'poi:cerchio'], ['silvaneth:s', 'poi:cimitero'], ['poi:cerchio', 'poi:sorgente'],
  ['poi:porta_nani', 'poi:ghiacciaio'], ['sahar:w', 'poi:ur_zahar'], ['poi:cimitero', 'poi:rocca_nera'], ['aurelburg:w', 'poi:galleria_nera'], ['sahar:n', 'zeroquartier:s'],
];

// Tesori irraggiungibili a piedi (aquila magica)
export const SECRET_CHESTS = 8;

// ---------------------------------------------------------------------------------------------
// Oggetti tipici delle civiltà: [id, nome, categoria, prezzo, descrizione, extra]
export const CIV_ITEMS = [
  ['baozi', 'Baozi al Vapore', 'food', 14, 'Panino ripieno, caldo e soffice.', { use: { hp: 70, ki: 5 } }],
  ['te_giada', 'Tè di Giada', 'food', 20, 'Tè profumato che calma lo spirito.', { use: { hp: 20, ki: 40 } }],
  ['veste_giada', 'Veste di Giada', 'gear', 1100, 'Seta rinforzata con placche di giada.', { slot: 'armor', def: 16, hp: 20 }],
  ['spada_jian', 'Spada Jian', 'gear', 1500, 'Lama a doppio taglio, elegante e rapida.', { slot: 'weapon', atk: 36, reach: 25, spd: 1.2 }],
  ['pane_imperiale', 'Pane Imperiale', 'food', 12, 'Pane di grano antico.', { use: { hp: 55 } }],
  ['vino_falerno', 'Vino Falerno', 'food', 24, 'Rosso corposo delle vigne imperiali.', { use: { hp: 15, ki: 35 } }],
  ['gladio_imperiale', 'Gladio Imperiale', 'gear', 1400, 'Corta spada delle legioni.', { slot: 'weapon', atk: 33, reach: 23, spd: 1.25 }],
  ['lorica_segmentata', 'Lorica Segmentata', 'gear', 1800, 'Armatura a lamine delle legioni.', { slot: 'armor', def: 20, hp: 25 }],
  ['miele_elfico', 'Miele Elfico', 'food', 22, 'Dolce come un ricordo d\'infanzia.', { use: { hp: 90, ki: 10 } }],
  ['nettare_luna', 'Nettare di Luna', 'potion', 120, 'Brilla al buio. Ripristina molto Ki.', { use: { ki: 90 } }],
  ['mantello_elfico', 'Mantello Elfico', 'gear', 1700, 'Fibre vive che si adattano al corpo.', { slot: 'armor', def: 14, hp: 40, ki: 15 }],
  ['datteri', 'Datteri dell\'Oasi', 'food', 10, 'Zuccherini ed energetici.', { use: { hp: 40, ki: 8 } }],
  ['acqua_oasi', 'Acqua d\'Oasi', 'potion', 40, 'Fresca e pura.', { use: { hp: 80, ki: 20 } }],
  ['scimitarra', 'Scimitarra', 'gear', 1450, 'Lama curva che taglia come il vento.', { slot: 'weapon', atk: 35, reach: 24, spd: 1.2 }],
  ['turbante_sabbia', 'Turbante di Sabbia', 'gear', 700, 'Protegge dalla tempesta.', { slot: 'armor', def: 11, hp: 15 }],
  ['pesce_salato', 'Pesce Salato', 'food', 14, 'Si conserva per mesi.', { use: { hp: 60 } }],
  ['rum', 'Rum Scuro', 'food', 20, 'Scalda l\'anima.', { use: { hp: 20, ki: 30 } }],
  ['sciabola', 'Sciabola da Marinaio', 'gear', 1300, 'Leggera e veloce.', { slot: 'weapon', atk: 30, reach: 23, spd: 1.3 }],
  ['giubba_marinaio', 'Giubba di Marinaio', 'gear', 650, 'Cerata impermeabile.', { slot: 'armor', def: 10, hp: 12 }],
  ['carne_arrosto', 'Carne Arrosto', 'food', 16, 'Cotta sul fuoco del villaggio.', { use: { hp: 85 } }],
  ['pozione_tribale', 'Pozione Tribale', 'potion', 80, 'Rimedio dello sciamano.', { use: { hp: 150 } }],
  ['lancia_tribale', 'Lancia Tribale', 'gear', 1350, 'Lunga asta con punta d\'ossidiana.', { slot: 'weapon', atk: 32, reach: 32, spd: 0.95 }],
  ['maschera_tribale', 'Maschera Tribale', 'gear', 600, 'Rituale. Accende lo spirito guerriero.', { slot: 'mask', atk: 5, def: 2 }],
  ['katana_vibro', 'Katana Vibrante', 'gear', 2600, 'La lama vibra a frequenze impossibili.', { slot: 'weapon', atk: 56, reach: 27, spd: 1.35 }],
  ['giacca_neon', 'Giacca Neon', 'gear', 2000, 'Tessuto reattivo con LED.', { slot: 'armor', def: 22, hp: 20, ki: 10 }],
  ['incenso', 'Incenso', 'material', 25, 'Calma le anime inquiete.', {}],
  ['essenza_spirito', 'Essenza di Spirito', 'material', 90, 'Residuo luminoso di un\'anima in pace.', {}],
  ['martello_nanico', 'Martello Nanico', 'gear', 2200, 'Pesante e inarrestabile.', { slot: 'weapon', atk: 44, reach: 24, spd: 0.9 }],
  ['armatura_nanica', 'Armatura Nanica', 'gear', 2400, 'Acciaio delle profondità.', { slot: 'armor', def: 26, hp: 40 }],
  ['birra_nanica', 'Birra Nanica', 'food', 22, 'Scura e densa come la roccia.', { use: { hp: 40, ki: 30 } }],
  ['ciondolo_anima', 'Ciondolo dell\'Anima', 'gear', 0, 'Un\'anima in pace veglia su di te.', { slot: 'charm', def: 4, hp: 30, ki: 15 }],
  ['fungo_luminoso', 'Fungo Luminoso', 'food', 18, 'Brilla nelle caverne di Nethermere.', { use: { hp: 50, ki: 20 } }],
];

export const CIV_SHOPS_EXTRA = {
  khaz_dum: { n: 'Forgia di Khaz-Dum', stock: ['birra_nanica', 'martello_nanico', 'armatura_nanica', 'ferro_grezzo', 'carbone', 'freccia'] },
  nethermere: { n: 'Mercato del Sottosuolo', stock: ['fungo_luminoso', 'incenso', 'pozione_vita_m', 'pozione_ki_s', 'freccia_veleno', 'seta_ragno'] },
};

// ---------------------------------------------------------------------------------------------
// Dungeon e mappe speciali (le grotte usano i temi in world.js). `p` = livelli collegati da scale.
const cave = (n, theme, o = {}) => ({ n, type: 'cave', gen: 'cave', w: 96, h: 72, theme, biome: 'cave', ...o });
const exitTo = (to, anchor) => ({ to, ...(anchor ? { anchor } : {}) });
function chain(base, names, theme, o, last) { // base, base_2, base_3... collegati con scale in basso
  const out = {};
  names.forEach((n, i) => {
    const id = i === 0 ? `${base}_1` : `${base}_${i + 1}`;
    const def = cave(n, theme, { seed: o.seed + i, ambient: o.ambient, ...(i === 0 ? { exit: exitTo('overworld') } : { prev: `${base}_${i}` }) });
    if (i < names.length - 1) def.next = { id: `${base}_${i + 2}`, dir: 'down' }; else Object.assign(def, last);
    out[id] = def;
  });
  return out;
}
export const NEW_DUNGEONS = {
  ...chain('cripta', ['Cripta dei Dimenticati · Ossari', 'Cripta dei Dimenticati · Tomba del Re'], 'crypt', { seed: 301, ambient: [20, 20, 40, 0.55] }, { boss: 're_non_morto' }),
  ...chain('castello', ['Rocca Nera · Cortile', 'Rocca Nera · Sale', 'Rocca Nera · Torre Maledetta'], 'castle', { seed: 311, ambient: [30, 20, 40, 0.5] }, { boss: 'cavaliere_nero' }),
  ...chain('rovine', ['Rovine di Anor · Atrio', 'Rovine di Anor · Palazzo Imperiale'], 'ruins', { seed: 321, ambient: [40, 40, 50, 0.4] }, { boss: 'colosso_rovine' }),
  ...chain('ur_zahar', ['Ur-Zahar · Strade Sepolte', 'Ur-Zahar · Templi', 'Ur-Zahar · Cripta del Faraone'], 'buried', { seed: 331, ambient: [60, 40, 10, 0.5] }, { boss: 'faraone_sepolto' }),
  ...chain('vulcano', ['Ōmagma · Crateri', 'Ōmagma · Fiumi di Fuoco', 'Ōmagma · Cuore del Vulcano'], 'volcano', { seed: 341, ambient: [90, 20, 10, 0.4] }, { boss: 'drago_ignis' }),
  ...chain('tempio_drago', ['Tempio del Drago · Cortili', 'Tempio del Drago · Santuario di Giada'], 'dragon', { seed: 351, ambient: [20, 50, 30, 0.4] }, { boss: 'drago_giada' }),
  ...chain('ghiacciaio', ['Ghiacciaio · Grotte', 'Ghiacciaio · Cuore di Ghiaccio'], 'frost', { seed: 361, ambient: [60, 100, 160, 0.45] }, { boss: 'titano_ghiaccio' }),
  // Dimensione soprannaturale: territorio degli spiriti, accessibile di notte dal Cerchio dei Sussurri
  regno_spiriti: { n: 'Regno degli Spiriti', type: 'parallel', gen: 'spirit', biome: 'spirit', w: 110, h: 90, seed: 371, ambient: [60, 80, 140, 0.32], exit: exitTo('overworld', 'door_regno_spiriti') },
  // Città nel sottosuolo
  khaz_dum: { n: 'Khaz-Dum, Città dei Nani', type: 'interior', gen: 'citymap', civ: 'dwarf', biome: 'cave', w: 90, h: 70, seed: 381, exit: exitTo('overworld', 'door_khaz_dum'), ambient: [80, 40, 20, 0.28] },
  nethermere: { n: 'Nethermere, Città Sotterranea', type: 'interior', gen: 'citymap', civ: 'under', biome: 'cave', w: 90, h: 70, seed: 391, exit: exitTo('overworld', 'door_nethermere'), ambient: [20, 50, 60, 0.4] },
};

// Interni delle civiltà (4 per insediamento) + civiltà sotterranee
const ROOM_SIZE = { inn: [16, 10], shop: [16, 10], hall: [20, 12], house: [12, 8] };
export const CIV_ROOMS = {};
function civRooms(id, c, name, exitMap = 'overworld') {
  const mk = (role, n, extra) => {
    const [w, h] = ROOM_SIZE[role];
    CIV_ROOMS[`${id}_${role}`] = { n, type: 'interior', gen: 'interior', w, h, floor: c.floor, ambient: c.ambient, exit: exitTo(exitMap), ...extra };
  };
  mk('inn', `Locanda · ${name}`, { counter: [3, 12, 4], shelves: 1, beds: [[2, 7], [13, 7]], tables: [[6, 7]], lanterns: [[1, 8], [14, 8]] });
  mk('shop', `Bottega · ${name}`, { counter: [3, 12, 4], shelves: 1, rug: [4, 6, 8, 2], lanterns: [[1, 8], [14, 8]] });
  mk('hall', `Sala · ${name}`, { rug: [6, 4, 8, 5], pillars: [[3, 3], [16, 3], [3, 8], [16, 8]], lanterns: [[9, 2], [10, 2]] });
  mk('house', `Casa · ${name}`, { rug: [4, 3, 4, 3], tables: [[2, 2]], beds: [[9, 2]], lanterns: [[1, 6]] });
}
for (const [id, s] of Object.entries(NEW_SITES)) civRooms(id, s.civ, s.civ.name);
// civiltà ospitate in mappe-città (nani e sotterranea)
Object.assign(CIVS, {
  dwarf: {
    name: 'Khaz-Dum', title: 'Città nanica scavata nella montagna', style: { wall: T.DWARFWALL, roof: T.DWARFWALL }, ground: T.STONE, road: T.STONE, floor: T.STONE, ambient: [80, 40, 20, 0.28],
    pal: { top: '#6a5a4a', bottom: '#3a3a44', hair: '#c85a2a', sash: '#d8a030', opts: { beard: 1, helm: 1 } }, center: 'forge_lava',
    inn: { who: 'Oste Thorin', price: 30, greet: 'Entra, entra! La birra di Khaz-Dum scalda anche la roccia. Un letto: 30 monete.', news: 'Sotto le fucine scorre un fiume di lava. I nostri avi ci hanno costruito la città intorno.' },
    shop: { who: 'Fabbro Durin', n: 'Forgia di Khaz-Dum', greet: 'Martelli, armature e birra! Lavoro nanico, per sempre.', stock: ['birra_nanica', 'martello_nanico', 'armatura_nanica', 'ferro_grezzo', 'carbone', 'freccia'] },
    elder: { who: 'Re Balin', title: 'Re sotto la Montagna', lore: ['Khaz-Dum è la più antica città del mondo: i nostri tunnel arrivano fino a Yomi. Non scavare mai troppo in basso.', 'I troll di montagna cercano la nostra lava. Tienili lontani, e la forgia sarà tua.'],
      quest: { id: 'q_dwarf', title: 'Troll alle Porte', enemy: 'troll_montagna', n: 3, text: 'Abbatti 3 Troll di Montagna', reward: { gold: 500, maxHp: 6, items: [['armatura_nanica', 1]] } } },
    guard: 'Alt! Chi entra a Khaz-Dum lascia l\'ascia fuori dalla birreria.',
    folk: [{ who: 'Minatore Gimli', lines: ['Ho trovato un filone di mithril... e un teschio che parlava.', 'La lava non brucia chi la rispetta.'] }, { who: 'Fabbra Dís', lines: ['Ogni martello ha un nome. Il mio si chiama Tuono.', 'I nani non temono il buio, solo il silenzio.'] }],
  },
  under: {
    name: 'Nethermere', title: 'Città sotterranea', style: { wall: T.ADOBE, roof: T.ADOBE }, ground: T.CAVE, road: T.STONE, floor: T.WOOD, ambient: [20, 50, 60, 0.4],
    pal: { top: '#4a4a60', bottom: '#2a2a38', hair: '#c8d8f0', sash: '#60e0c0', opts: { turban: 1, turbanCol: '#2a3a4a', goggles: 1 } }, center: 'mushroom_lake',
    inn: { who: 'Locandiera Mira', price: 30, greet: 'Benvenuto alla luce dei funghi. Un giaciglio asciutto: 30 monete.', news: 'Viviamo sotto la palude da quando il sole si offese con i nostri avi. Ora amiamo il buio.' },
    shop: { who: 'Raccoglitore Grub', n: 'Mercato del Sottosuolo', greet: 'Funghi, veleni e incensi. Roba rara, prezzi onesti.', stock: ['fungo_luminoso', 'incenso', 'pozione_vita_m', 'pozione_ki_s', 'freccia_veleno', 'seta_ragno'] },
    elder: { who: 'Madre Sorda', title: 'Voce del Sottosuolo', lore: ['Nethermere è nata sotto la Palude di Kuroki. Noi non vediamo bene, ma sentiamo tutto.', 'In superficie, di notte, le anime si staccano dai cimiteri. Porta loro incenso: l\'incenso le calma.'],
      quest: { id: 'q_under', title: 'Anime in Pena', have: 'essenza_spirito', n: 2, text: 'Porta 2 Essenze di Spirito (placa le anime erranti con l\'incenso)', reward: { gold: 450, maxHp: 6, items: [['ciondolo_anima', 1]] } } },
    guard: 'Parla piano. Il suono viaggia lontano, nelle caverne.',
    folk: [{ who: 'Cieca Oda', lines: ['Non ho occhi, ma so che hai una maschera di volpe.', 'In fondo alla galleria nera c\'è una porta che si apre solo ai morti.'] }, { who: 'Fungaiolo Pip', lines: ['I funghi brillano di più quando qualcuno muore. Terribile, ma bello.', 'Se vedi una luce azzurra che si muove, non seguirla.'] }],
  },
});
civRooms('khaz_dum', CIVS.dwarf, 'Khaz-Dum', 'khaz_dum');
civRooms('nethermere', CIVS.under, 'Nethermere', 'nethermere');
export const CITYMAP_SITES = { khaz_dum: CIVS.dwarf, nethermere: CIVS.under };

// ---------------------------------------------------------------------------------------------
// Spiriti: buoni (parlano, raccontano, danno missioni), della natura (timidi, benedicono), guardiani (enigmi), mistici (profezie), errabondi (neutrali)
export const SPIRITS = {
  anima_dolce: { n: 'Elisa, anima gentile', kind: 'buona', at: { map: 'overworld', x: 98, y: 442 }, look: { top: '#d8e4ff', bottom: '#b0c4ee', hair: '#e8f0ff', skin: '#e0ecff', long: 1, robe: 1 }, nightOnly: 1, dialogue: 'sp_elisa' },
  soldato_caduto: { n: 'Soldato Caduto', kind: 'buona', at: { map: 'overworld', x: 156, y: 512 }, look: { top: '#a8b8d8', bottom: '#6a7a98', hair: '#c8d4ec', skin: '#d8e4f8', helm: 1, cape: 1, capeCol: '#4a5a88' }, nightOnly: 1, dialogue: 'sp_soldato' },
  bimba_lanterna: { n: 'Bimba con la Lanterna', kind: 'buona', at: { map: 'overworld', x: 88, y: 448 }, look: { top: '#ffe8f0', bottom: '#f0c8d8', hair: '#fff0f4', skin: '#fff4f8', small: 1, long: 1 }, nightOnly: 1, dialogue: 'sp_bimba' },
  kodama_a: { n: 'Kodama', kind: 'natura', at: { map: 'overworld', x: 70, y: 210 }, look: { top: '#e8fff0', bottom: '#c8f0d8', hair: '#fff', skin: '#f0fff4', small: 1, bald: 1 }, quirk: ['shy', 'hover'], dialogue: 'sp_kodama' },
  kodama_b: { n: 'Kodama', kind: 'natura', at: { map: 'overworld', x: 58, y: 300 }, look: { top: '#e8fff0', bottom: '#c8f0d8', hair: '#fff', skin: '#f0fff4', small: 1, bald: 1 }, quirk: ['shy', 'hover'], dialogue: 'sp_kodama' },
  kodama_c: { n: 'Kodama', kind: 'natura', at: { map: 'overworld', x: 108, y: 180 }, look: { top: '#e8fff0', bottom: '#c8f0d8', hair: '#fff', skin: '#f0fff4', small: 1, bald: 1 }, quirk: ['shy', 'hover'], dialogue: 'sp_kodama' },
  guardiano_sorgente: { n: 'Guardiano della Sorgente', kind: 'guardiano', at: { map: 'overworld', x: 66, y: 209 }, look: { top: '#3a8a6a', bottom: '#2a5a4a', hair: '#a0ffd0', skin: '#b0ffe0', robe: 1, staff: 1, staffCol: '#a0ffd0', glow: '120,255,200' }, quirk: ['hover', 'orbit'], orbit: ['#a0ffd0', '#e0fff0'], hideIf: ['flag', 'sp_sorgente'], dialogue: 'sp_guardiano' },
  oracolo_luna: { n: 'Oracolo della Luna', kind: 'mistica', at: { map: 'overworld', x: 102, y: 168 }, look: { top: '#2a2a6a', bottom: '#14143a', hair: '#e8e8ff', skin: '#d0d0f0', robe: 1, glow: '160,160,255', turban: 1, turbanCol: '#4a4a9a' }, nightOnly: 1, quirk: ['hover', 'orbit'], orbit: ['#c0c0ff', '#ffffff', '#8a8aff'], dialogue: 'sp_oracolo' },
  anima_errante_a: { n: 'Anima Errante', kind: 'errante', at: { map: 'overworld', x: 120, y: 470 }, look: { top: '#c0d0e8', bottom: '#a0b0c8', hair: '#d8e4f4', skin: '#d8e4f4', long: 1, robe: 1 }, nightOnly: 1, quirk: ['hover'], hideIf: ['flag', 'sp_errante_a'], dialogue: 'sp_errante', soul: 'sp_errante_a' },
  anima_errante_b: { n: 'Anima Errante', kind: 'errante', at: { map: 'overworld', x: 90, y: 462 }, look: { top: '#c0d0e8', bottom: '#a0b0c8', hair: '#d8e4f4', skin: '#d8e4f4', bald: 1, robe: 1 }, nightOnly: 1, quirk: ['hover'], hideIf: ['flag', 'sp_errante_b'], dialogue: 'sp_errante', soul: 'sp_errante_b' },
  anima_errante_c: { n: 'Anima Errante', kind: 'errante', at: { map: 'overworld', x: 200, y: 330 }, look: { top: '#c0d0e8', bottom: '#a0b0c8', hair: '#d8e4f4', skin: '#d8e4f4', long: 1, robe: 1 }, nightOnly: 1, quirk: ['hover'], hideIf: ['flag', 'sp_errante_c'], dialogue: 'sp_errante', soul: 'sp_errante_c' },
  // nel Regno degli Spiriti
  sovrana_spiriti: { n: 'Sovrana degli Spiriti', kind: 'mistica', at: { map: 'regno_spiriti', anchor: 'entry', dx: 0, dy: -6 }, look: { top: '#e8f0ff', bottom: '#b0c4ee', hair: '#ffffff', skin: '#e8f0ff', long: 1, robe: 1, tails: 3, glow: '190,210,255' }, quirk: ['hover', 'orbit'], orbit: ['#c8d8ff', '#ffffff'], dialogue: 'sp_sovrana' },
};
