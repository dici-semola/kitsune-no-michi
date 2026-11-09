// Catalogo oggetti diviso in 5 categorie: food, potion, gear, material, story.
// gear: slot = weapon|armor|mask|charm|suit; stat: atk, def, hp, ki, reach, spd, fire
import { CIV_ITEMS, CIVS, NEW_SITES, CITYMAP_SITES } from './realm.js';
export const CATS = ['food', 'potion', 'gear', 'material', 'story'];
export const CAT_NAMES = { food: 'Cibi e bevande', potion: 'Pozioni magiche', gear: 'Armi ed equip.', material: 'Materiali', story: 'Oggetti di trama' };
export const SLOTS = ['weapon', 'bow', 'armor', 'mask', 'charm', 'suit'];
export const SLOT_NAMES = { weapon: 'Arma', bow: 'Arco', armor: 'Veste', mask: 'Maschera', charm: 'Talismano', suit: 'Tuta' };
import { installCrafting } from './crafting.js';
import { installLimbo } from './limbo.js';
export const AMMO = ['freccia', 'freccia_fuoco', 'freccia_veleno', 'freccia_magica'];
export const AMMO_MAX = 100;   // frecce trasportabili in totale (tutti i tipi insieme)
export const AMMO_PACK = 10;   // i negozi vendono le frecce a confezioni

export const ITEMS = {};
const add = (id, cat, n, price, desc, o = {}) => { ITEMS[id] = { id, cat, n, price, desc, ...o }; };
const food = (id, n, price, hp, ki, desc) => add(id, 'food', n, price, desc, { use: { hp, ki } });
const pot = (id, n, price, use, desc) => add(id, 'potion', n, price, desc, { use });
const gear = (id, n, price, slot, st, desc) => add(id, 'gear', n, price, desc, { slot, ...st });
const mat = (id, n, price, desc) => add(id, 'material', n, price, desc);
const story = (id, n, desc) => add(id, 'story', n, 0, desc);

// --- Cibi e bevande ---
food('onigiri', 'Onigiri', 8, 25, 0, 'Una polpetta di riso con prugna salata.');
food('dango', 'Dango', 6, 15, 5, 'Tre palline di riso su stecco.');
food('taiyaki', 'Taiyaki', 12, 35, 0, 'Dolce a forma di pesce, ripieno di fagioli rossi.');
food('pesce_grigliato', 'Pesce Grigliato', 18, 50, 0, 'Pescato e arrostito sulla brace.');
food('ramen', 'Ramen di Hinomura', 34, 80, 10, 'Brodo caldo che rimette in piedi un samurai.');
food('mochi_fuoco', 'Mochi Infuocato', 22, 30, 15, 'Pasta di riso al peperoncino.');
food('sake', 'Sake di Riso', 26, 10, 25, 'Scalda il cuore e il ki.');
food('brezel', 'Brezel', 9, 28, 0, 'Pretzel croccante di Aurelburg.');
food('wurst', 'Würstel Arrosto', 22, 60, 0, 'Sostanzioso, speziato.');
food('strudel', 'Strudel di Mele', 16, 45, 12, 'Dolce cannella e mele.');
food('birra', 'Birra Scura', 18, 15, 28, 'Schiuma densa, retrogusto di malto.');
food('nutri_gel', 'Nutri-Gel', 28, 70, 5, 'Razione sintetica di Neo-Edo.');
food('caffe_synth', 'Caffè Sintetico', 24, 10, 35, 'Energia liquida a 3 yen.');
food('pesca_yomi', "Pesca dell'Immortalità", 90, 200, 50, 'Frutto degli Inferi. Sa di un ricordo dimenticato.');

// --- Pozioni magiche ---
pot('pozione_vita_s', 'Pozione Vita', 40, { hp: 60 }, 'Ripristina 60 PV.');
pot('pozione_vita_m', 'Pozione Vita Maggiore', 110, { hp: 160 }, 'Ripristina 160 PV.');
pot('pozione_vita_l', 'Elisir di Vita', 300, { hp: 400 }, 'Ripristina 400 PV.');
pot('pozione_ki_s', 'Pozione Ki', 50, { ki: 35 }, 'Ripristina 35 Ki.');
pot('pozione_ki_l', 'Elisir del Ki', 160, { ki: 100 }, 'Ripristina 100 Ki.');
pot('elisir_ferro', 'Elisir di Ferro', 90, { buff: { stat: 'def', val: 0.35, dur: 90 } }, 'Difesa +35% per 90s.');
pot('elisir_furia', 'Elisir della Furia', 100, { buff: { stat: 'atk', val: 0.3, dur: 90 } }, 'Attacco +30% per 90s.');
pot('elisir_vento', 'Elisir del Vento', 80, { buff: { stat: 'spd', val: 0.3, dur: 60 } }, 'Velocità +30% per 60s.');
pot('elisir_fuoco', 'Elisir Ignifugo', 120, { buff: { stat: 'fireimm', val: 1, dur: 120 } }, 'Permette di camminare sulla lava per 120s.');
pot('elisir_fenice', 'Elisir della Fenice', 500, { buff: { stat: 'revive', val: 1, dur: 1800 } }, 'Ti rialza una volta se cadi in battaglia.');
pot('antidoto', 'Antidoto', 30, { cure: true }, 'Cura veleno e ustioni.');

// --- Armi ed equipaggiamenti ---
gear('katana_starter', 'Katana di Hinomura', 0, 'weapon', { atk: 6, reach: 22, spd: 1 }, 'La lama che ti ha donato Genzō.');
gear('katana_ferro', 'Katana di Ferro Battuto', 280, 'weapon', { atk: 11, reach: 23, spd: 1 }, 'Solida e bilanciata.');
gear('katana_acciaio', "Katana d'Acciaio Temprato", 720, 'weapon', { atk: 17, reach: 24, spd: 1.05 }, 'Filo impeccabile.');
gear('katana_tempesta', 'Katana della Tempesta', 0, 'weapon', { atk: 24, reach: 25, spd: 1.15 }, 'Vibra come un tuono lontano.');
gear('katana_kitsune', 'Kitsune-Maru', 0, 'weapon', { atk: 32, reach: 26, spd: 1.15 }, 'Lama leggendaria dei Nove Fuochi.');
gear('masamune_cremisi', 'Masamune Cremisi', 0, 'weapon', { atk: 42, reach: 26, spd: 1.1 }, 'Forgiata nel cuore del deserto.');
gear('naginata_sacra', 'Naginata Sacra', 1200, 'weapon', { atk: 26, reach: 34, spd: 0.85 }, 'Ampio raggio, colpi lenti.');
gear('plasma_katana', 'Katana al Plasma', 2400, 'weapon', { atk: 50, reach: 28, spd: 1.3 }, 'Tecnologia di Neo-Edo.');
gear('lama_inferi', 'Lama degli Inferi', 0, 'weapon', { atk: 62, reach: 28, spd: 1.2 }, 'Sussurra i nomi dei defunti.');
gear('tsurugi_tempo', 'Tsurugi del Tempo', 0, 'weapon', { atk: 80, reach: 30, spd: 1.3 }, 'Taglia il filo stesso degli eventi.');
gear('kimono_tradizionale', 'Kimono Tradizionale', 0, 'armor', { def: 1 }, 'Bianco e rosso, cucito a mano.');
gear('kimono_rinforzato', 'Kimono Rinforzato', 240, 'armor', { def: 4 }, 'Fibre intrecciate con fili di ferro.');
gear('haori_lamellare', 'Haori Lamellare', 650, 'armor', { def: 8 }, 'Lamelle di cuoio laccato.');
gear('armatura_samurai', 'Armatura Samurai', 1500, 'armor', { def: 14, hp: 20 }, 'Pesante ma imponente.');
gear('giubbotto_aurelburg', 'Giubbotto di Aurelburg', 600, 'armor', { def: 7, hp: 15 }, 'Cuoio imbottito in stile mitteleuropeo.');
gear('tuta_neo', 'Tuta Neo-Fibra', 0, 'armor', { def: 20, ki: 10 }, 'Fibra reattiva dal futuro.');
gear('manto_yomi', 'Manto di Yomi', 0, 'armor', { def: 26, hp: 40 }, 'Tessuto d\'ombra e cenere.');
gear('veste_tempo', 'Veste del Tempo', 0, 'armor', { def: 34, hp: 60, ki: 20 }, 'Le pieghe mostrano istanti diversi.');
gear('maschera_kitsune', 'Maschera Kitsune', 0, 'mask', { ki: 10 }, 'La maschera della volpe. Bianca e rossa.');
gear('maschera_oni', 'Maschera di Oni', 0, 'mask', { atk: 3, def: 1 }, 'Rubata a Oni Kurogane.');
gear('maschera_nove_code', 'Maschera delle Nove Code', 0, 'mask', { atk: 6, def: 4, ki: 30 }, 'Il potere di Kuzunoha.');
gear('omamori_salute', 'Omamori della Salute', 400, 'charm', { hp: 25 }, '+25 PV massimi.');
gear('omamori_fuoco', 'Omamori del Fuoco', 500, 'charm', { fire: 0.3 }, '+30% al danno del fuoco.');
gear('ciondolo_orologio', 'Ciondolo a Orologio', 0, 'charm', { ki: 15, spd: 0.05 }, 'Il tempo scorre più lieve.');
gear('amuleto_sabbia', 'Amuleto di Sabbia', 0, 'charm', { def: 3 }, 'Granelli di tempo cristallizzato.');
gear('tuta_sub', 'Tuta da Sub', 900, 'suit', { def: 2, suit: true }, 'Consente di immergersi negli abissi.');

// --- Arco e frecce (pow = moltiplicatore danni, range in px, draw = secondi per la tensione massima) ---
gear('arco_pellegrino', 'Arco del Pellegrino', 0, 'bow', { pow: 0.85, range: 190, draw: 0.7, unbreakable: true }, 'Indistruttibile: nessuna durabilità, non si rompe, non si vende. Ti accompagna dall\'inizio del viaggio.');
gear('tridente_abissale', 'Tridente Abissale', 4200, 'weapon', { atk: 54, reach: 28, spd: 1.15 }, 'Forgiato con la perla di Thalassarkhos: la punta brilla di luce marina.');
add('perla_abissale', 'material', 'Perla Abissale', 600, 'Una perla grande come un pugno, tiepida di luce.');
gear('arco_corto', 'Arco Corto', 150, 'bow', { pow: 0.9, range: 200, draw: 0.7 }, 'Leggero e rapido da tendere.');
gear('arco_lungo', 'Arco Lungo', 520, 'bow', { pow: 1.25, range: 280, draw: 0.95 }, 'Portata e potenza, tensione più lenta.');
gear('arco_elfico', 'Arco Elfico', 1400, 'bow', { pow: 1.55, range: 330, draw: 0.75 }, 'Intagliato dagli elfi di Silvaneth.');
gear('arco_impulsi', 'Arco a Impulsi', 2600, 'bow', { pow: 2.1, range: 360, draw: 0.6 }, 'Corde di plasma dal futuro.');
add('kit_campo', 'potion', 'Kit da Campo', 0, 'Usalo dall\'inventario per montare un accampamento: fuoco, tenda e banco da lavoro. Usalo ancora per smontarlo.', { use: { camp: true }, unbreakable: true });
add('freccia', 'gear', 'Frecce', 3, 'Frecce di legno con punta di ferro.', { ammo: true });
add('freccia_fuoco', 'gear', 'Frecce Incendiarie', 12, 'Incendiano il bersaglio per 3 secondi.', { ammo: true });
add('freccia_veleno', 'gear', 'Frecce Avvelenate', 14, 'Avvelenano il bersaglio per 5 secondi.', { ammo: true });
add('freccia_magica', 'gear', 'Frecce Magiche', 30, 'Inseguono leggermente il bersaglio e trapassano un nemico.', { ammo: true });

// --- Materiali grezzi (crafting) ---
mat('ferro_grezzo', 'Ferro Grezzo', 12, 'Minerale da forgiare.');
mat('legno_duro', 'Legno Duro', 6, 'Legno di quercia.');
mat('pelle', 'Pelle Conciata', 10, 'Pelle di animale.');
mat('pelliccia_lupo', 'Pelliccia di Lupo', 14, 'Calda e spessa.');
mat('osso', 'Osso Robusto', 8, 'Per armature leggere.');
mat('erba_medicinale', 'Erba Medicinale', 10, 'Base per le pozioni.');
mat('bacche_blu', 'Bacche Blu', 8, 'Acidule, ricche di vitamine.');
mat('fungo_luna', 'Fungo di Luna', 12, 'Brilla nelle grotte.');
mat('cristallo_grezzo', 'Cristallo Grezzo', 25, 'Cristallo magico non lavorato.');
mat('gel_ombra', "Gel d'Ombra", 7, 'Residuo di uno slime oscuro.');
mat('scaglia_idra', 'Scaglia di Idra', 60, 'Dura come l\'acciaio.');
mat('sabbia_vetro', 'Sabbia Vetrificata', 20, 'Fusa da antichi fulmini.');
mat('ghiaccio_eterno', 'Ghiaccio Eterno', 40, 'Non si scioglie mai.');
mat('perla_grezza', 'Perla Grezza', 45, 'Raccolta negli abissi.');
mat('corallo_rosso', 'Corallo Rosso', 30, 'Raro e bellissimo.');
mat('rame', 'Rame', 14, 'Conduttore.');
mat('chip_neon', 'Chip Neon', 40, 'Circuito integrato futuristico.');
mat('nucleo_energia', 'Nucleo Energetico', 90, 'Batteria a fusione.');
mat('cenere_yomi', 'Cenere di Yomi', 35, 'Cenere che ricorda chi era.');
mat('anima_cristallizzata', 'Anima Cristallizzata', 120, 'Un respiro bloccato nel vetro.');
mat('polvere_stelle', 'Polvere di Stelle', 80, 'Cade solo dove il tempo è sottile.');
mat('frammento_tempo', 'Frammento di Tempo', 150, 'Un secondo che non passa.');
mat('seta_ragno', 'Seta di Ragno', 18, 'Resistente e leggerissima.');
mat('carbone', 'Carbone', 5, 'Per la fucina.');

// --- Oggetti di trama (non vendibili) ---
story('lettera_genzo', 'Lettera di Genzō', 'Una lettera per l\'inventore di Aurelburg.');
story('sigillo_volpe', 'Sigillo della Volpe', 'Apre i sigilli dell\'Antro della Volpe.');
story('gatto_tama', 'Gatto Tama', 'Un gattino spaventato ma al sicuro.');
story('cristallo_respiro', 'Cristallo del Respiro', 'Primo Cristallo del Tempo, dalla palude.');
story('cristallo_sabbia', 'Cristallo della Sabbia', 'Secondo Cristallo del Tempo, dalla tomba.');
story('cristallo_gelo', 'Cristallo del Gelo', 'Terzo Cristallo del Tempo, dalla caverna di ghiaccio.');
story('perla_tempo', 'Perla del Tempo', 'Quarto catalizzatore, custodito nel Palazzo di Ryūgū.');
story('piuma_aquila', 'Piuma di Aquila Magica', 'Permette di chiamare l\'aquila.');
story('chiave_hover', 'Chiave Hoverbike', 'Ti permette di guidare l\'hoverbike neon.');
story('filo_destino', 'Filo del Destino', 'Un filo rosso che vibra: lega te e il Re Senza Tempo.');
story('lente_cronica', 'Lente Cronica', 'Mostra le crepe nel tempo.');

// --- Ricette di crafting ---
export const RECIPES = [
  { out: 'pozione_vita_s', n: 2, in: { erba_medicinale: 2, bacche_blu: 1 } },
  { out: 'pozione_vita_m', n: 1, in: { pozione_vita_s: 2, fungo_luna: 1 } },
  { out: 'pozione_ki_s', n: 1, in: { fungo_luna: 2, cristallo_grezzo: 1 } },
  { out: 'elisir_furia', n: 1, in: { pozione_ki_s: 1, scaglia_idra: 1 } },
  { out: 'elisir_ferro', n: 1, in: { pozione_vita_s: 1, ferro_grezzo: 2 } },
  { out: 'ramen', n: 1, in: { pesce_grigliato: 1, onigiri: 1, erba_medicinale: 1 } },
  { out: 'haori_lamellare', n: 1, in: { pelle: 5, ferro_grezzo: 4 } },
  { out: 'armatura_samurai', n: 1, in: { haori_lamellare: 1, osso: 6, ferro_grezzo: 8 } },
  { out: 'katana_tempesta', n: 1, in: { katana_acciaio: 1, scaglia_idra: 2, cristallo_grezzo: 3 } },
  { out: 'masamune_cremisi', n: 1, in: { katana_acciaio: 1, sabbia_vetro: 5, cristallo_grezzo: 5 } },
  { out: 'katana_kitsune', n: 1, in: { katana_tempesta: 1, polvere_stelle: 3, ghiaccio_eterno: 2 } },
  { out: 'tuta_neo', n: 1, in: { chip_neon: 6, rame: 6, pelle: 3 } },
  { out: 'lama_inferi', n: 1, in: { katana_kitsune: 1, cenere_yomi: 8, anima_cristallizzata: 3 } },
  { out: 'manto_yomi', n: 1, in: { tuta_neo: 1, cenere_yomi: 10, seta_ragno: 4 } },
  { out: 'maschera_nove_code', n: 1, in: { maschera_oni: 1, frammento_tempo: 3, anima_cristallizzata: 3 } },
  { out: 'elisir_fenice', n: 1, in: { polvere_stelle: 3, anima_cristallizzata: 2, pozione_vita_l: 1 } },
  { out: 'veste_tempo', n: 1, in: { manto_yomi: 1, frammento_tempo: 4, seta_ragno: 6 } },
  { out: 'tsurugi_tempo', n: 1, in: { lama_inferi: 1, frammento_tempo: 6, filo_destino: 1 } },
];

// --- Negozi: [idOggetto, prezzoFisso|null, condizione|null] ---
export const SHOPS = {
  smith: { n: 'Fucina di Tetsuo', stock: [['arco_corto'], ['arco_lungo', null, ['level', 8]], ['freccia'], ['freccia_fuoco', null, ['level', 5]], ['freccia_veleno', null, ['level', 7]], ['katana_ferro'], ['katana_acciaio', null, ['level', 8]], ['kimono_rinforzato'], ['haori_lamellare', null, ['level', 6]], ['ferro_grezzo'], ['carbone'], ['omamori_salute']] },
  pharmacy: { n: 'Farmacia di Hanae', stock: [['pozione_vita_s'], ['pozione_vita_m', null, ['level', 5]], ['pozione_ki_s'], ['antidoto'], ['erba_medicinale'], ['bacche_blu'], ['elisir_ferro', null, ['level', 7]]] },
  stall_food: { n: 'Bancarella di Sora', stock: [['onigiri'], ['dango'], ['taiyaki'], ['pesce_grigliato'], ['ramen'], ['sake']] },
  stall_misc: { n: 'Bancarella di Nobu', stock: [['legno_duro'], ['pelle'], ['osso'], ['mochi_fuoco'], ['fungo_luna']] },
  market_eu: { n: 'Mercato di Brunhild', stock: [['freccia'], ['freccia_fuoco'], ['freccia_veleno'], ['freccia_magica', null, ['level', 10]], ['brezel'], ['wurst'], ['strudel'], ['birra'], ['pozione_vita_m'], ['pozione_vita_l', null, ['level', 15]], ['tuta_sub'], ['giubbotto_aurelburg'], ['naginata_sacra', null, ['level', 10]], ['elisir_furia'], ['elisir_vento']] },
  camp: { n: 'Viandante Itō', stock: [['freccia'], ['onigiri'], ['dango'], ['pozione_vita_s'], ['pozione_ki_s'], ['antidoto'], ['carbone']] },
  lumber: { n: 'Segheria di Kenji', stock: [['legno_duro'], ['pelle'], ['pelliccia_lupo'], ['carbone'], ['osso']] },
  neo_vendor: { n: 'Bazar MX-9', stock: [['arco_impulsi', null, ['level', 16]], ['freccia_magica'], ['freccia_fuoco'], ['nutri_gel'], ['caffe_synth'], ['pozione_vita_l'], ['pozione_ki_l'], ['plasma_katana', null, ['level', 14]], ['chip_neon'], ['rame'], ['nucleo_energia']] },
};

// ---- merci e negozi delle civiltà ----
for (const [id, n, cat, price, desc, extra] of CIV_ITEMS) add(id, cat, n, price, desc, extra);
add('corona_spettrale', 'gear', 'Corona Spettrale', 0, 'Appartenne al Re Non Morto. Pulsa di energia gelida.', { slot: 'mask', atk: 8, def: 4, ki: 30 });
for (const [id, s] of Object.entries(NEW_SITES)) SHOPS[`${id}_shop`] = { n: s.civ.shop.n, stock: s.civ.shop.stock.map((x) => [x]) };
for (const [id, c] of Object.entries(CITYMAP_SITES)) SHOPS[`${id}_shop`] = { n: c.shop.n, stock: c.shop.stock.map((x) => [x]) };
void CIVS;

installCrafting(ITEMS, RECIPES, SHOPS, add);
installLimbo(ITEMS, RECIPES, add);
