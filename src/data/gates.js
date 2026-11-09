// Progressione geografica: ogni regno ha un "livello d'accesso" (tier). I confini tra un regno e uno di tier superiore sono sigillati da
// barriere (massi, frane, ghiaccio, cancelli, ponti interrotti) che si aprono solo con livello, missioni, nemici sconfitti e oggetti giusti.
import { T } from './tiles.js';

// indice = posizione in REALMS (data/realm.js). 0-6 = cuore storico (sempre aperto).
export const REALM_TIER = [0, 0, 0, 0, 0, 0, 0, /*7 tundra*/ 3, /*8 monti*/ 3, /*9 vulcano*/ 3, /*10 giada*/ 2, /*11 altopiano*/ 1, /*12 primigenia*/ 1, /*13 incantato*/ 2, /*14 lamenti*/ 3, /*15 calanchi*/ 3, /*16 dune*/ 2, /*17 palme*/ 2, /*18 prateria sud*/ 1];

export const TIER_REQ = {
  1: [['level', 5], ['flag', 'omen_done'], ['ability', 'dash']],
  2: [['level', 9], ['flag', 'fox_done'], ['flag', 'boss:yatsuhashi']],
  3: [['level', 14], ['flag', 'boss:yatsuhashi'], ['ability', 'fire']],
};

// by: katana | bomb | fire | talk | item. hits = colpi necessari una volta soddisfatti i requisiti.
export const KINDS = {
  boulder: { tile: T.BOULDER, crack: T.BOULDER_C, by: 'katana', hits: 6, name: 'un enorme masso' },
  rubble: { tile: T.RUBBLEW, crack: T.RUBBLEW_C, by: 'bomb', hits: 1, name: 'una frana di pietre' },
  ice: { tile: T.ICEBLK, crack: T.ICEBLK_C, by: 'fire', hits: 4, name: 'un muro di ghiaccio eterno' },
  gate: { tile: T.BARGATE, by: 'talk', hits: 1, name: 'un cancello sorvegliato' },
  plank: { tile: T.BROKENBR, by: 'item', item: 'assi_ponte', n: 4, hits: 1, name: 'un ponte interrotto' },
};

const FLAG_TXT = {
  omen_done: 'aver sciolto il mistero del presagio a Hinomura',
  fox_done: "aver liberato l'Antro della Volpe",
  'boss:yatsuhashi': "aver sconfitto l'Idra della Palude",
  'boss:oni_kurogane': "aver sconfitto l'Oni Kurogane",
};
const ABIL_TXT = { dash: 'padroneggiare lo Scatto', fire: 'saper soffiare il Fuoco', black: 'dominare la Fiamma Nera' };
export const reqText = (req) => req.map((c) => (c[0] === 'level' ? `essere almeno al livello ${c[1]}` : c[0] === 'flag' ? (FLAG_TXT[c[1]] || 'compiere le imprese richieste') : c[0] === 'ability' ? (ABIL_TXT[c[1]] || 'una nuova abilità') : ''));
export const reqList = (req) => { const t = reqText(req).filter(Boolean); return t.length > 1 ? t.slice(0, -1).join(', ') + ' e ' + t[t.length - 1] : t[0] || ''; };

const SAY = (s, t, extra = {}) => ({ s, t, ...extra });
const HOW = { boulder: 'colpiscilo con la katana', rubble: 'serve una Carica da Demolizione (la ricetta la vendono i fabbri) per farla saltare', ice: 'serve il Soffio di Fuoco (o una bomba incendiaria)', gate: 'parla con me quando sei pronto', plank: 'servono quattro Assi da Ponte per ripararlo, oppure il gelo di una pozione per congelare il fiume' };
const OPEN = { boulder: 'Il masso è andato in mille pezzi! Mai vista una cosa simile…', rubble: 'La frana è saltata in aria. Ora si passa!', ice: 'Il ghiaccio si è sciolto come neve al sole. Strada libera!', gate: 'Il cancello è aperto. Passa pure, e buon viaggio.', plank: 'Il ponte è di nuovo in piedi. Grazie!' };

// Dialogo contestuale del personaggio che sta davanti alla barriera: bloccato → pronto → aperto.
export function gateDialogue(b, who) {
  const K = KINDS[b.kind], reqs = reqList(b.req);
  return {
    start: [{ if: [['flag', `barrier:${b.id}`]], go: 'open' }, { if: b.req, go: 'ready' }, { go: 'blocked' }],
    nodes: {
      blocked: SAY(who, [`Vedi ${K.name}? È lì da anni. Nessuno è mai riuscito a passare di qui…`, `Forse solo un guerriero capace di ${reqs} potrebbe riuscirci. Torna quando sarai pronto, {name}.`], { choices: [{ t: 'Come si supera?', next: 'how' }, { t: 'Capisco' }] }),
      how: SAY(who, `Dicono che, quando sarai pronto, ${HOW[b.kind]}.`),
      ready: SAY(who, [`{name}… hai l'aria di chi ce l'ha fatta: ${reqs}.`, `Ora ${HOW[b.kind]}!`], { next: b.kind === 'gate' ? 'opengate' : undefined }),
      opengate: SAY(who, OPEN.gate, { fx: [['barrier', b.id]] }),
      open: SAY(who, OPEN[b.kind]),
    },
  };
}
