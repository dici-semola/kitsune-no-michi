// Dialoghi a grafo. Ogni dialogo: { start:[{if,go}...], nodes:{ id:{ s, t(stringa|pagine[]), fx, choices:[{t,next,if,fx}], next } } }
// Il primo `start` con condizione vera decide il nodo iniziale. `{name}` = nome del protagonista.
// Un nodo senza `next` né `choices` chiude il dialogo.
const say = (s, t, extra = {}) => ({ s, t, ...extra });
const END = [['night']]; // segnaposto, non usato

export const DIALOGUES = {
  default: { start: [{ go: 'a' }], nodes: { a: say('???', '...') } },

  genzo: {
    start: [
      { if: [['!flag', 'met_genzo']], go: 'intro' },
      { if: [['quest', 'm1_omen', 'active']], go: 'omen_wait' },
      { if: [['flag', 'omen_done'], ['!flag', 'fox_given']], go: 'fox_give' },
      { if: [['quest', 'm2_fox', 'active']], go: 'fox_wait' },
      { if: [['flag', 'fox_done'], ['!flag', 'genzo_letter']], go: 'letter' },
      { if: [['flag', 'game_cleared']], go: 'cleared' },
      { go: 'idle' },
    ],
    nodes: {
      intro: say('Anziano Genzō', ['{name}... finalmente ti sei svegliato. La luna è rossa da tre notti e le ombre strisciano fuori dai boschi.', "Prendi questa katana, e tieni al volto la maschera della volpe che porti dall'infanzia. Non sono semplici cimeli."], { fx: [['flag', 'met_genzo']], next: 'intro2' }),
      intro2: say('Anziano Genzō', 'Chiedi pure, {figliolo}.', { choices: [{ t: 'Cosa sono le ombre?', next: 'lore1' }, { t: 'Cosa devo fare?', next: 'task' }] }),
      lore1: say('Anziano Genzō', 'Residui del Filo del Tempo. Qualcosa, da qualche parte, lo sta strappando... e il mondo comincia a sfilacciarsi.', { next: 'intro2' }),
      task: say('Anziano Genzō', "Ripulisci le praterie dagli Slime d'Ombra: cinque bastano. Usa J o Spazio per colpire. Poi torna da me."),
      omen_wait: say('Anziano Genzō', "Gli Slime d'Ombra pascolano nelle praterie, fuori dai cancelli. Cinque, ricorda. Con J o Spazio colpisci; E parla e interagisce."),
      fox_give: say('Anziano Genzō', ["Bene. Ora la fonte: l'Antro della Volpe, nella foresta a ovest, oltre il cancello occidentale. Un Oni ne custodisce la soglia.", 'Prendi il Sigillo. E quando il ki ti scorrerà abbastanza forte nelle gambe, il Kitsune ti insegnerà lo scatto.'], { fx: [['give', 'sigillo_volpe', 1], ['quest', 'm2_fox'], ['flag', 'fox_given']] }),
      fox_wait: say('Anziano Genzō', "L'antro è a ovest, seguendo il sentiero fuori dal cancello. Torna vivo, {name}."),
      letter: say('Anziano Genzō', ["L'Oni è caduto... eppure ha nominato «il Re Senza Tempo». Così il vecchio incubo è vero.", "Ho un debito antico ad Aurelburg, la capitale a sud-est: un inventore pazzo ma geniale. Portagli questa lettera."], { fx: [['give', 'lettera_genzo', 1], ['quest', 'm3_capitale'], ['flag', 'genzo_letter']] }),
      idle: say('Anziano Genzō', 'Il sentiero ti chiama, {name}. Il Kitsune veglia su di te.'),
      cleared: say('Anziano Genzō', 'Il filo è ricucito... ma il mondo è vasto e pieno di segreti. Esplora, completa ciò che hai lasciato indietro.'),
    },
  },

  tetsuo: {
    start: [
      { if: [['quest', 's_ferro', 'done'], ['!flag', 'ferro_thanks']], go: 'thanks' },
      { if: [['quest', 's_ferro', 'active']], go: 'ferro_active' },
      { go: 'main' },
    ],
    nodes: {
      main: say('Tetsuo il Fabbro', 'Benvenuto alla fucina! Lame, armature e un po\' di buon senso.', { choices: [
        { t: 'Mostrami le merci', next: 'main', fx: [['shop', 'smith']] },
        { t: 'Ti serve una mano?', next: 'ferro_offer', if: [['quest', 's_ferro', 'inactive']] },
        { t: 'Parlami della mia katana', next: 'lore' },
        { t: 'Arrivederci' },
      ] }),
      ferro_offer: say('Tetsuo il Fabbro', 'Mi servono 4 pezzi di ferro grezzo. Lo lasciano cadere golem e goblin... o lo compri da me, ovvio.', { fx: [['quest', 's_ferro']] }),
      ferro_active: say('Tetsuo il Fabbro', 'Allora, quel ferro? Servono 4 pezzi.', { next: 'main' }),
      lore: say('Tetsuo il Fabbro', "Quella lama l'ho affilata io, ma non l'ho forgiata. Il metallo non invecchia di un giorno in cent'anni. Strano, vero?", { next: 'main' }),
      thanks: say('Tetsuo il Fabbro', 'Ottimo ferro! Il tuo ringraziamento è sul bancone.', { fx: [['flag', 'ferro_thanks']] }),
    },
  },

  hanae: {
    start: [
      { if: [['quest', 's_erbe', 'done'], ['!flag', 'erbe_thanks']], go: 'thanks' },
      { if: [['quest', 's_erbe', 'active']], go: 'erbe_active' },
      { go: 'main' },
    ],
    nodes: {
      main: say('Hanae la Speziale', 'Pozioni, tisane e rimedi. Cosa ti serve?', { choices: [
        { t: 'Mostrami i rimedi', next: 'main', fx: [['shop', 'pharmacy']] },
        { t: 'Posso aiutarti?', next: 'erbe_offer', if: [['quest', 's_erbe', 'inactive']] },
        { t: 'Hai sentito parlare di fuochi antichi?', next: 'fire' },
        { t: 'A presto' },
      ] }),
      erbe_offer: say('Hanae la Speziale', 'Ho finito le erbe medicinali! Se me ne porti 5 ti preparo qualcosa di speciale. Le trovi nei boschi.', { fx: [['quest', 's_erbe']] }),
      erbe_active: say('Hanae la Speziale', 'Mi servono 5 Erbe Medicinali. Le raccolgono gli spiriti del bosco... e ogni tanto cadono dai mostri.', { next: 'main' }),
      fire: say('Hanae la Speziale', "Il Santuario del Fuoco, a nord. Lo sigillò una volpe... con un indovinello, dicono. Non l'ha mai risolto nessuno.", { next: 'main' }),
      thanks: say('Hanae la Speziale', 'Grazie mille! Questi sono per te.', { fx: [['flag', 'erbe_thanks']] }),
    },
  },

  kichi: {
    start: [{ go: 'main' }],
    nodes: {
      main: say('Kichi il Locandiere', 'Benvenuto alla Luna Rossa. Un letto costa 20 monete e ti rimette in sesto fino all\'alba.', { choices: [
        { t: 'Riposare (20 monete)', next: 'rest', if: [['gold', 20]] },
        { t: 'Novità dalla locanda?', next: 'rumors' },
        { t: 'No, grazie' },
      ] }),
      rest: say('Kichi il Locandiere', 'Buon riposo! La stanza è pronta.', { fx: [['gold', -20], ['rest']] }),
      rumors: say('Kichi il Locandiere', ['Dicono che nel Canyon di Ryūko un Tengu rapisca i mercanti.', 'E che nella capitale ci sia un inventore che parla da solo di «viaggi nel tempo». Pazzi, tutti.'], { next: 'main' }),
    },
  },

  sora: { start: [{ go: 'a' }], nodes: { a: say('Sora', 'Cibo fresco e caldo! Onigiri, ramen, pesce arrosto!', { choices: [{ t: 'Vediamo', fx: [['shop', 'stall_food']] }, { t: 'Più tardi' }] }) } },
  nobu: { start: [{ go: 'a' }], nodes: { a: say('Nobu', 'Materiali, pelli, funghi di luna. Roba da avventurieri!', { choices: [{ t: 'Vediamo', fx: [['shop', 'stall_misc']] }, { t: 'Più tardi' }] }) } },

  guard_s: {
    start: [{ if: [['night']], go: 'night' }, { go: 'day' }],
    nodes: {
      day: say('Guardia di Hinomura', 'Dentro le mura si è al sicuro: i mostri non osano varcare i cancelli. Ma si chiudono alle dieci di sera.'),
      night: say('Guardia di Hinomura', "Notte fonda. I cancelli sono chiusi: se arrivi da fuori, bussa e... trattiamo."),
    },
  },

  mio: {
    start: [
      { if: [['quest', 's_gatto', 'done']], go: 'done' },
      { if: [['quest', 's_gatto', 'active']], go: 'wait' },
      { go: 'offer' },
    ],
    nodes: {
      offer: say('Mio', 'Il mio gatto Tama è scappato nella foresta! Puoi cercarlo? Credo sia vicino al cartello sul sentiero ovest...', { choices: [{ t: 'Lo cercherò', fx: [['quest', 's_gatto']] }, { t: 'Più tardi' }] }),
      wait: say('Mio', 'Ti prego, trova Tama! Ha tanta paura dei lupi.'),
      done: say('Mio', 'Tama! Ora dorme sempre sul mio cuscino. Grazie, grazie, grazie!'),
    },
  },

  daigo: {
    start: [{ if: [['mount', 'horse']], go: 'has' }, { go: 'offer' }],
    nodes: {
      offer: say('Daigo', 'Un cavallo veloce per 200 monete! Corre sui sentieri e nelle praterie, ma non entra in acqua né in grotta.', { choices: [{ t: 'Lo compro (200)', next: 'buy', if: [['gold', 200]] }, { t: 'Non ora' }] }),
      buy: say('Daigo', 'Affare fatto! Premi M per montare e smontare.', { fx: [['gold', -200], ['mount', 'horse']] }),
      has: say('Daigo', 'Il tuo cavallo ti aspetta. Premi M per montare.'),
    },
  },

  umi: {
    start: [{ if: [['mount', 'dolphin']], go: 'has' }, { if: [['flag', 'ottokar_met']], go: 'offer' }, { go: 'idle' }],
    nodes: {
      idle: say('Umi', "Il Mare di Nebbia nasconde un isolotto con un portale per gli abissi. Ma serve una tuta da sub: Aurelburg ne vende, dicono. O la trovi in una cavità della palude...", {}),
      offer: say('Umi', ["Cerchi Ryūgū, il palazzo sommerso? Hai l'aria di chi ha una missione.", 'Prendi il mio delfino Shirone: sul mare ti porterà dove nessun cavallo arriva. Premi M sull\'acqua.'], { fx: [['mount', 'dolphin']] }),
      has: say('Umi', "Shirone ti aspetta in acqua. L'isolotto è a sud-est, oltre il fossato di acque profonde. Serve la tuta da sub!"),
    },
  },

  rin: {
    start: [{ if: [['flag', 'boss:enma']], go: 'late' }, { if: [['flag', 'boss:kamios']], go: 'mid' }, { go: 'early' }],
    nodes: {
      early: say('Rin', ["Non fidarti dell'orologio, {name}: da dove vengo io il cielo è fatto di neon e il tempo perde pezzi.", 'Sono una corriera del Filo. Qualcuno mi ha mandata a tenere d\'occhio la maschera che porti.']),
      mid: say('Rin', 'KAMI-OS era solo un cane da guardia. Il vero padrone del futuro spezzato aspetta oltre Yomi.'),
      late: say('Rin', "Dietro l'ultima porta c'è qualcuno che conosci meglio di chiunque. Non esitare, {name}. Io ti sarò accanto."),
    },
  },

  kuzunoha: {
    start: [{ if: [['flag', 'boss:mugenkai']], go: 'end' }, { go: 'main' }],
    nodes: {
      main: say('Kuzunoha', ['Sei giunto fin qui, {piccolo} kitsune. Nove code, nove fuochi: io ne custodisco solo l\'eco.', 'Il fuoco ti seguirà quando sarà il momento. Sconfiggi chi ha tradito il tempo e la fiamma nera risponderà.']),
      end: say('Kuzunoha', 'Il filo è di nuovo intero. Ora le tue code sono tue, {name}.'),
    },
  },

  riddle_seal: {
    start: [{ if: [['flag', 'riddle_shrine']], go: 'open' }, { go: 'ask' }],
    nodes: {
      ask: say('Sigillo antico', 'Una voce sussurra dalla pietra: «Più ne togli, più divento grande. Cosa sono?»', { choices: [
        { t: 'Un buco', next: 'right' }, { t: "Un'ombra", next: 'wrong' }, { t: 'Un debito', next: 'wrong' }, { t: 'Il silenzio', next: 'wrong' },
      ] }),
      right: say('Sigillo antico', 'Il sigillo si dissolve in cenere dorata. La porta del Santuario del Fuoco è aperta.', { fx: [['flag', 'riddle_shrine']] }),
      wrong: say('Sigillo antico', '«Errato. Rifletti.» La pietra torna muta.'),
      open: say('Sigillo antico', 'La pietra è spenta.'),
    },
  },

  gate_night: {
    start: [{ go: 'a' }],
    nodes: {
      a: say('Guardia', "Una voce dalla feritoia: «Cancello chiuso fino all'alba. Se proprio devi... 30 monete e chiudo un occhio.»", { choices: [
        { t: 'Paga 30 monete', next: 'ok', if: [['gold', 30]] }, { t: "Aspetterò l'alba" },
      ] }),
      ok: say('Guardia', '«Presto, entra... il cancello resta aperto fino all\'alba.»', { fx: [['gold', -30], ['flag', 'gate_bribe']] }),
    },
  },

  ottokar: {
    start: [
      { if: [['!flag', 'ottokar_intro']], go: 'intro' },
      { if: [['flag', 'boss:kamios']], go: 'after' },
      { if: [['flag', 'machine_on']], go: 'running' },
      { go: 'hub' },
    ],
    nodes: {
      intro: say('Dr. Ottokar', ['Eh? Una lettera di Genzō? Mein Gott, quel vecchio testone è ancora vivo!', '...Una maschera di volpe. Allora è vero: il Filo si sta spezzando.', 'La mia macchina può aprire un varco nel Tempo Spezzato. Servono quattro catalizzatori: tre Cristalli del Tempo e una Perla degli abissi.'],
        { fx: [['take', 'lettera_genzo', 1], ['flag', 'ottokar_intro'], ['quest', 'm4_frammenti'], ['quest', 'm5_macchina']], next: 'hub' }),
      hub: say('Dr. Ottokar', 'Fragen? Domande?', { choices: [
        { t: 'Dove trovo i catalizzatori?', next: 'where' }, { t: 'Come funziona la macchina?', next: 'how' },
        { t: 'Mi serve una tuta da sub.', next: 'suit' }, { t: 'A dopo' },
      ] }),
      where: say('Dr. Ottokar', ['Il Cristallo del Respiro dorme nella Cavità di Kuroki, in fondo alla palude. Quello della Sabbia, nella Tomba della Sfinge nel deserto. Quello del Gelo, nella caverna in cima ai Monti Shirayuki: sono tre livelli di salita, porta provviste!', 'La Perla è nel Palazzo di Ryūgū: servono una tuta da sub e un delfino.'], { next: 'hub' }),
      how: say('Dr. Ottokar', "Il tempo è un filo, {ragazzo}. Ho costruito la macchina su progetti di un cliente misterioso. Un uomo con una maschera di volpe... trent'anni fa. Non invecchiava, giurerei.", { next: 'hub' }),
      suit: say('Dr. Ottokar', 'Frau Brunhild ne vende una al mercato, 900 monete. Oppure cerca nella Cavità di Kuroki: un palombaro vi morì cercando tesori.', { next: 'hub' }),
      running: say('Dr. Ottokar', 'La macchina è accesa! Avvicinati alla console: è la soglia verso il Tempo Spezzato.'),
      after: say('Dr. Ottokar', 'Il futuro che crollava... e tu lo hai fermato. Per ora. Yomi, le Terre dei Morti, si apre alla Fiamma Nera.'),
    },
  },

  machine: {
    start: [{ if: [['flag', 'machine_on']], go: 'on' }, { if: [['item', 'cristallo_respiro'], ['item', 'cristallo_sabbia'], ['item', 'cristallo_gelo'], ['item', 'perla_tempo']], go: 'ready' }, { go: 'off' }],
    nodes: {
      off: say('Macchina del Tempo', 'Una macchina colossale di ottone e cristallo. Ha quattro alloggiamenti vuoti: tre cristalli e una perla.'),
      ready: say('Macchina del Tempo', "I quattro catalizzatori vibrano all'unisono. Inserirli nella macchina?", { choices: [
        { t: 'Sì', fx: [['take', 'cristallo_respiro', 1], ['take', 'cristallo_sabbia', 1], ['take', 'cristallo_gelo', 1], ['take', 'perla_tempo', 1], ['flag', 'machine_on'], ['tp', 'chrono_rift', 'entry']] },
        { t: 'Non ancora' },
      ] }),
      on: say('Macchina del Tempo', 'Il varco è aperto. Entrare nel Tempo Spezzato?', { choices: [{ t: 'Sì', fx: [['tp', 'chrono_rift', 'entry']] }, { t: 'No' }] }),
    },
  },

  brunhild: {
    start: [{ go: 'a' }],
    nodes: {
      a: say('Frau Brunhild', 'Willkommen! Alles frisch, alles gut!', { choices: [
        { t: 'Mostrami il catalogo', next: 'a', fx: [['shop', 'market_eu']] }, { t: 'Vendete tute da sub?', next: 'suit' }, { t: 'Arrivederci' },
      ] }),
      suit: say('Frau Brunhild', 'Ja! 900 monete. Impermeabile fino agli abissi. Ottima per cercare perle... o guai.', { next: 'a' }),
    },
  },

  lorenz: {
    start: [{ if: [['quest', 's_tengu', 'done']], go: 'done' }, { if: [['quest', 's_tengu', 'active']], go: 'wait' }, { go: 'offer' }],
    nodes: {
      offer: say('Capitano Lorenz', "Un Tengu terrorizza le carovane del Canyon di Ryūko, a nord-est. Se lo sconfiggi ti darò una piuma d'aquila magica: con lei potrai volare.", { choices: [{ t: 'Me ne occupo io', fx: [['quest', 's_tengu']] }, { t: 'Forse più tardi' }] }),
      wait: say('Capitano Lorenz', 'Il Canyon di Ryūko è a nord-est: scendi per tre livelli fino al fondo, il Tempio del Corvo è là. Buona fortuna.'),
      done: say('Capitano Lorenz', "Il Canyon è sicuro, grazie a te. L'aquila ti riconoscerà: premi M per chiamarla."),
    },
  },

  wirt: {
    start: [{ go: 'a' }],
    nodes: {
      a: say('Herr Wirt', 'Zum goldenen Hirschen! Un letto costa 40 monete.', { choices: [{ t: 'Riposare (40 monete)', next: 'rest', if: [['gold', 40]] }, { t: 'No, danke' }] }),
      rest: say('Herr Wirt', 'Gute Nacht!', { fx: [['gold', -40], ['rest']] }),
    },
  },

  madame_zeit: {
    start: [{ if: [['!flag', 'ottokar_met']], go: 'a' }, { if: [['!flag', 'boss:yatsuhashi']], go: 'b' }, { if: [['!flag', 'boss:kamios']], go: 'c' }, { go: 'd' }],
    nodes: {
      a: say('Madame Zeit', 'Vedo un filo rosso annodato tre volte. Il Dottore, nel laboratorio a nord-ovest della piazza, ha ciò che cerchi.'),
      b: say('Madame Zeit', "Le acque stagnanti nascondono un cristallo che respira. E un'armatura di ferro che non è mai stata vuota."),
      c: say('Madame Zeit', "Sabbia, gelo, mare. Poi il neon. Il tempo sbaglia sempre dove ama di più."),
      d: say('Madame Zeit', 'Una porta si apre sotto la terra e un re ti aspetta dove il filo finisce. Oh, {caro}: stavolta, non girarti.'),
    },
  },

  guard_aurel: { start: [{ go: 'a' }], nodes: { a: say('Sentinella', 'Benvenuto ad Aurelburg. I cancelli si chiudono di notte, ma il Consiglio ricompensa chi tiene sicure le strade.') } },

  zero: {
    start: [{ if: [['flag', 'boss:kamios']], go: 'after' }, { go: 'intro' }],
    nodes: {
      intro: say('Zero', ['Un vecchio kimono rosso sotto la pioggia al neon? Sei fuori tempo, volpe.', 'KAMI-OS controlla ogni drone e ogni porta. Il suo nucleo è nella piazza centrale. Dicono che chi lo spezzi risvegli un fuoco oscuro...']),
      after: say('Zero', 'Le luci si spengono una a una. Strano... non sono mai state così belle.'),
    },
  },
  mx9: { start: [{ go: 'a' }], nodes: { a: say('MX-9', 'BENVENUTO. SCONTO CLIENTI FEDELI: 0%.', { choices: [{ t: 'Mostra catalogo', fx: [['shop', 'neo_vendor']] }, { t: 'Esci' }] }) } },
  sanzu: {
    start: [{ go: 'a' }],
    nodes: { a: say('Sanzu', ['Sanzu, traghettatore. Ho remato su questo fiume per... non ricordo quanto. Enma ti attende al palazzo.', "Un altro portatore di maschera è passato da qui, prima di... non passare mai."]) },
  },

  // ----- Boss -----
  intro_oni: { start: [{ go: 'a' }], nodes: { a: say('Oni Kurogane', ['Un cucciolo... con la MASCHERA. Il Re aveva ragione: sarebbe tornata.', 'Nessuno attraversa la soglia!']) } },
  outro_oni: { start: [{ go: 'a' }], nodes: { a: say('Oni Kurogane', 'Il Re... Senza Tempo... ti aspetta... dove il filo... finisce...') } },
  intro_yatsu: { start: [{ go: 'a' }], nodes: { a: say('Yatsuhashi', 'Ssss... otto teste, otto fami. Il Filo Spezzato ci ha reso fame.') } },
  intro_sfinge: { start: [{ go: 'a' }], nodes: { a: say('Sfinge Cremisi', 'Un indovinello per ogni passo, mortale... ma oggi risponderò con le zanne.') } },
  intro_tsurara: { start: [{ go: 'a' }], nodes: { a: say('Regina Tsurara', 'Il tempo qui è ghiaccio, piccola volpe. Resta ferma, e non soffrirai.') } },
  intro_tengu: { start: [{ go: 'a' }], nodes: { a: say('Tengu Karasu', 'Kaa! Il canyon è mio! Il cielo è mio!') } },
  intro_ryujin: { start: [{ go: 'a' }], nodes: { a: say('Ryūjin', "Tu hai l'odore dell'Altro. Del Re che spezzò il mare.") } },
  intro_kamios: { start: [{ go: 'a' }], nodes: { a: say('KAMI-OS', 'ANOMALIA RILEVATA: PORTATORE DI MASCHERA. PROTOCOLLO: ELIMINAZIONE.') } },
  outro_kamios: { start: [{ go: 'a' }], nodes: { a: say('KAMI-OS', 'ERRORE... IL RE... HA PROMESSO... UN FUTURO PERFETTO...') } },
  intro_enma: { start: [{ go: 'a' }], nodes: { a: say('Enma-Ō', 'Ogni anima è pesata, {giovane} kitsune. La tua pesa più di quanto dovrebbe: porti due vite.') } },
  outro_enma: { start: [{ go: 'a' }], nodes: { a: say('Enma-Ō', 'Prendi il Filo del Destino. Ma sappi: il Re Senza Tempo non è un estraneo. Guarda la sua maschera.') } },
  intro_mugenkai: {
    start: [{ go: 'a' }],
    nodes: { a: say('Mugenkai', ['Sei arrivato. Come arrivai io, tanto tempo — troppo tempo — fa.', 'Guardami, {name}. Questa maschera, questo kimono... Ho perso tutto, e ho riscritto il passato per riaverlo.', 'Il passato ha reso il tempo una ferita. Per guarire serve un solo taglio: il tuo... o il mio.']) },
  },
  outro_mugenkai: {
    start: [{ go: 'a' }],
    nodes: {
      a: say('Mugenkai', ['...Il filo è tornato. Rosso, come allora.', 'Grazie... per fermarmi. Ricorda il mio nome: era anche il tuo.'], { next: 'b' }),
      b: say('Narratore', 'Il Tempo si ricuce. Una nuova alba sorge su Hinomoto.', { fx: [['flag', 'game_cleared'], ['finale']] }),
    },
  },
};
void END;
import { EXTRA } from './dialogues_extra.js';
Object.assign(DIALOGUES, EXTRA);
