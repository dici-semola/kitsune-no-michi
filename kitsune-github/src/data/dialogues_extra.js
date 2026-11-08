// Dialoghi di avamposti, piani alti e personaggi minori. Uniti a DIALOGUES da dialogues.js.
import { CIV_DIALOGUES } from './people.js';
const say = (s, t, extra = {}) => ({ s, t, ...extra });

// Locandiere generico: riposo a pagamento + notizie
const inn = (who, price, greet, news) => ({
  start: [{ go: 'a' }],
  nodes: {
    a: say(who, greet, { choices: [{ t: `Riposare (${price} monete)`, next: 'rest', if: [['gold', price]] }, { t: 'Che si dice in giro?', next: 'news' }, { t: 'No, grazie' }] }),
    rest: say(who, 'Buon riposo. Partita salvata.', { fx: [['gold', -price], ['rest']] }),
    news: say(who, news, { next: 'a' }),
  },
});
const talk = (who, ...pages) => ({ start: [{ go: 'a' }], nodes: { a: say(who, pages.length === 1 ? pages[0] : pages) } });

export const EXTRA = {
  okami_nagi: inn('Okami di Nagi', 25, "Benvenuto a Nagi, il crocevia tra Hinomura e Aurelburg! Un letto e una zuppa calda per 25 monete.",
    "Il santuario qui accanto cura le ferite, gratis. E ricorda: la strada maestra è lunga e piena di lupi. Se ti serve ristoro, ci vediamo a Nagi."),
  viandante: {
    start: [{ go: 'a' }],
    nodes: { a: say('Viandante Itō', "Cammino da una vita tra Hinomura e la capitale. Provviste per il viaggio?", { choices: [{ t: 'Vediamo', fx: [['shop', 'camp']] }, { t: 'Consigli di viaggio?', next: 'tips' }, { t: 'No' }] }),
      tips: say('Viandante Itō', ["I santuari lungo la strada curano e fissano il punto in cui rinascerai: usali.", "Di notte i cancelli si chiudono. Pianifica le soste: le distanze qui sono lunghe."], { next: 'a' }) },
  },
  kenji: {
    start: [{ go: 'a' }],
    nodes: { a: say('Kenji il Boscaiolo', 'Il legno più duro dell\'isola esce da questa segheria. Ti serve qualcosa?', { choices: [{ t: 'Mostrami le merci', fx: [['shop', 'lumber']] }, { t: 'La foresta è pericolosa?', next: 'forest' }, { t: 'Arrivederci' }] }),
      forest: say('Kenji il Boscaiolo', "I kitsunebi non toccano chi cammina piano. Più a ovest c'è l'Antro della Volpe: tre livelli di cunicoli. Dicono che l'Oni dorma sul fondo, su un trono d'ossa.", { next: 'a' }) },
  },
  hisa: inn('Hisa del Rifugio', 30, "Entra, entra, sei gelato! Zuppa di miso e un letto: 30 monete.",
    "Più su, il sentiero dei pini si inerpica per tre livelli: Sentiero, Cresta, poi la Vetta. In cima c'è una caverna dove il ghiaccio non si scioglie mai. Porta mantello e pozioni."),
  zahra: inn('Zahra di Sunari', 35, "Pace a te, viaggiatore! L'oasi è sicura. Tè alla menta e un tappeto morbido: 35 monete.",
    "A est dorme la Tomba della Sfinge: tre sale, una sotto l'altra. A nord, il canyon: scendendo si arriva a un fondo dove soffia il vento dei morti."),
  numa: inn('Numa la Barcaiola', 25, "Le palafitte tengono i piedi asciutti... quasi. Un giaciglio per 25 monete?",
    "Nella palude, sotto le radici, c'è una cavità: uno scomparso palombaro ha lasciato la sua tuta nascosta in un angolo. E sotto ancora vive l'Idra."),
  ferdinand: talk('Ferdinand', "Quattro piani di ingranaggi, e ogni ora un colpo di campana. Ma negli ultimi giorni il pendolo oscilla all'indietro...", "Se vai in cima al campanile, c'è un forziere dimenticato dal mio maestro. E una vista che toglie il fiato."),
  hotaru: talk('Hotaru', "Il maestro Tetsuo dice che la forgia di sotto è alimentata dal respiro di un drago addormentato. Io credo sia solo un buon camino... ma non lo dico forte."),
  edda: talk('Consigliera Edda', "Il Consiglio osserva da quassù le carovane del regno. Capitan Lorenz cerca chi liberi il Canyon dal Tengu: nel forziere della sala c'è un premio per chi servirà bene Aurelburg."),
  aiko: talk('AIKO-3', 'BENVENUTO ALLA TORRE KAMI. ASCENSORI: PIANI 2, 3, 4 E TETTO. IL PIANO 3 È RISERVATO AI SERVER. (NON È UN DIVIETO, SOLO UN... AVVISO).'),
};

Object.assign(EXTRA, CIV_DIALOGUES);
