// Generatore di abitanti, dialoghi e missioni per ogni civiltà + spiriti. Unito a NPCS / DIALOGUES / QUESTS dagli altri moduli data.
import { CIVS, NEW_SITES, SPIRITS, CITYMAP_SITES } from './realm.js';
import { npcSpot, ROOM, kindOf } from '../engine/InteriorSolids.js';
const famOf = (c) => (c.plan === 'gen' ? 'kit' : c.plan);
const spot = (id, c, role) => { const f = famOf(c); if (!f) return null; return npcSpot(f, kindOf(f, role), id, role); };

const say = (s, t, extra = {}) => ({ s, t, ...extra });
const NPCS_OUT = {}, DLG = {}, QST = {};

function look(c, role, i = 0) {
  const p = c.pal, o = { ...p.opts };
  if (role === 'guardia') { o.helm = 1; delete o.straw; delete o.turban; delete o.bandana; }
  if (role === 'oste') o.apron = 1;
  if (role === 'anziano') { o.beard = i ? 0 : 1; o.bun = i ? 1 : 0; o.robe = 1; o.staff = 1; }
  if (role === 'gente') { o.small = i === 1 ? 1 : 0; if (i === 0) delete o.straw; }
  return { top: p.top, bottom: p.bottom, hair: p.hair, skin: ['#f1c9a0', '#e0b890', '#c89868', '#f4d4b0'][(i + role.length) % 4], sash: p.sash, ...o };
}

function people(id, c, outdoor) {
  const N = (role, def) => { NPCS_OUT[`${id}_${role}`] = { dialogue: `${id}_${role}`, ...def }; };
  const inn = c.inn, sh = c.shop, el = c.elder;
  N('oste', { n: inn.who, look: look(c, 'oste'), quirk: ['bubble', 'mug'], shouts: [inn.greet.split('!')[0] + '!', 'Un letto caldo ti aspetta.'], at: { map: `${id}_inn`, x: (spot(id, c, 'inn') || [8, 3])[0], y: (spot(id, c, 'inn') || [8, 3])[1] } });
  DLG[`${id}_oste`] = { start: [{ go: 'a' }], nodes: {
    a: say(inn.who, inn.greet, { choices: [{ t: `Riposare (${inn.price} monete)`, next: 'rest', if: [['gold', inn.price]] }, { t: 'Che si dice in giro?', next: 'news' }, { t: 'No, grazie' }] }),
    rest: say(inn.who, 'Buon riposo. Partita salvata.', { fx: [['gold', -inn.price], ['rest']] }), news: say(inn.who, inn.news, { next: 'a' }) } };
  N('mercante', { n: sh.who, look: look(c, 'mercante', 1), quirk: ['bubble'], shouts: [sh.greet.split('!')[0] + '!', 'Dai un\'occhiata!'], at: { map: `${id}_shop`, x: (spot(id, c, 'shop') || [8, 3])[0], y: (spot(id, c, 'shop') || [8, 3])[1] } });
  DLG[`${id}_mercante`] = { start: [{ go: 'a' }], nodes: { a: say(sh.who, sh.greet, { choices: [{ t: 'Vediamo la merce', fx: [['shop', `${id}_shop`]] }, { t: 'Arrivederci' }] }) } };
  // anziano con missione secondaria
  const q = el.quest, qid = q.id, eid = `${id}_anziano`;
  N('anziano', { n: `${el.who}, ${el.title}`, look: look(c, 'anziano', id.length % 2), quirk: ['smoke', 'orbit'], orbit: [c.pal.sash, '#ffffff'], at: { map: `${id}_hall`, x: (spot(id, c, 'hall') || [10, 3])[0], y: (spot(id, c, 'hall') || [10, 3])[1] } });
  const goal = q.enemy ? { t: 'kill', enemy: q.enemy, n: q.n, text: q.text } : { t: 'have', item: q.have, n: q.n, text: q.text };
  QST[qid] = { title: q.title, act: `Secondaria · ${c.name}`, giver: eid, desc: `${el.who} ti affida un incarico: ${q.text.toLowerCase()}.`, obj: [goal, { t: 'talk', npc: eid, text: `Torna da ${el.who}`, take: q.have ? 1 : 0 }], reward: q.reward };
  DLG[eid] = { start: [{ if: [['quest', qid, 'done'], ['!flag', `thx_${qid}`]], go: 'thanks' }, { if: [['quest', qid, 'active']], go: 'wait' }, { if: [['quest', qid, 'inactive']], go: 'offer' }, { go: 'lore' }], nodes: {
    offer: say(el.who, `${el.lore[0]}`, { choices: [{ t: 'Posso aiutarti?', next: 'quest' }, { t: 'Raccontami di più', next: 'lore' }, { t: 'Arrivederci' }] }),
    quest: say(el.who, `Servirebbe il tuo aiuto, {name}: ${q.text.toLowerCase()}. Ti ricompenserò.`, { choices: [{ t: 'Accetto', fx: [['quest', qid]] }, { t: 'Più tardi' }] }),
    lore: say(el.who, el.lore), wait: say(el.who, `Ti aspetto, {name}. ${q.text}.`),
    thanks: say(el.who, 'Hai reso un grande servizio a questa gente. Accetta la nostra riconoscenza.', { fx: [['flag', `thx_${qid}`]] }) } };
  if (outdoor) {
    N('guardia', { n: `Guardia di ${c.name}`, look: look(c, 'guardia'), quirk: ['patrol'], lantern: 1, at: { map: 'overworld', town: id, x: outdoor.gx, y: outdoor.gy } });
    DLG[`${id}_guardia`] = { start: [{ go: 'a' }], nodes: { a: say(`Guardia di ${c.name}`, c.guard) } };
    c.folk.forEach((f, i) => { N(`gente${i + 1}`, { n: f.who, look: look(c, 'gente', i), quirk: ['bubble'], shouts: [f.lines[0].slice(0, 28) + '…'], wander: 18, at: { map: 'overworld', town: id, x: outdoor.fx[i][0], y: outdoor.fx[i][1] } });
      DLG[`${id}_gente${i + 1}`] = { start: [{ go: 'a' }], nodes: { a: say(f.who, f.lines) } }; });
  } else { // civiltà nelle mappe-città: ancora "plaza" generata dal generatore
    N('guardia', { n: `Guardia di ${c.name}`, look: look(c, 'guardia'), quirk: ['patrol'], lantern: 1, at: { map: id, anchor: 'entry', dx: 2, dy: -3 } });
    DLG[`${id}_guardia`] = { start: [{ go: 'a' }], nodes: { a: say(`Guardia di ${c.name}`, c.guard) } };
    c.folk.forEach((f, i) => { N(`gente${i + 1}`, { n: f.who, look: look(c, 'gente', i), quirk: ['bubble'], shouts: [f.lines[0].slice(0, 28) + '…'], wander: 18, at: { map: id, anchor: 'plaza', dx: i ? 4 : -4, dy: i ? 2 : -1 } });
      DLG[`${id}_gente${i + 1}`] = { start: [{ go: 'a' }], nodes: { a: say(f.who, f.lines) } }; });
  }
}
for (const [id, s] of Object.entries(NEW_SITES)) people(id, s.civ, { gx: s.w >> 1, gy: s.h - 3, fx: [[Math.floor(s.w * 0.3), s.h >> 1], [Math.floor(s.w * 0.7), (s.h >> 1) + 1]] });
for (const [id, c] of Object.entries(CITYMAP_SITES)) people(id, c, null);

// ---------------------------------------------------------------------------------------------
// Spiriti
const SP = { ...SPIRITS };
for (const [id, s] of Object.entries(SP)) {
  s.spirit = true; s.quirk ||= ['hover'];
  if (id.startsWith('kodama')) s.look = { ...s.look, top: { kodama_a: '#e8fff0', kodama_b: '#d8f8e8', kodama_c: '#f0fff4' }[id], tails: { kodama_a: 0, kodama_b: 1, kodama_c: 2 }[id] };
  if (id.startsWith('anima_errante')) s.look = { ...s.look, top: { anima_errante_a: '#c0d0e8', anima_errante_b: '#b8c8e0', anima_errante_c: '#c8d8f0' }[id], bottom: { anima_errante_a: '#a0b0c8', anima_errante_b: '#98a8c0', anima_errante_c: '#a8b8d0' }[id] };
  if (id.startsWith('kodama') || id.startsWith('anima_errante')) s.dialogue = `sp_${id}`;
  NPCS_OUT[id] = s;
}
QST.q_elisa = { title: "Il Lamento di Elisa", act: 'Spiriti', giver: 'anima_dolce', desc: "Elisa non trova pace: gli spettri inquieti del cimitero turbano i suoi cari.", obj: [{ t: 'kill', enemy: 'spettro', n: 3, text: 'Placa 3 Spettri Erranti nel Bosco dei Lamenti (di notte)' }, { t: 'talk', npc: 'anima_dolce', text: 'Torna da Elisa (solo di notte)' }], reward: { gold: 150, maxHp: 4, items: [['ciondolo_anima', 1]] } };
DLG.sp_elisa = { start: [{ if: [['quest', 'q_elisa', 'done'], ['!flag', 'thx_elisa']], go: 'thanks' }, { if: [['!flag', 'sp_elisa_met']], go: 'intro' }, { go: 'menu' }], nodes: {
  intro: say('Elisa', ['Sono Elisa... vivevo accanto a questo cimitero, tanto tempo fa. Di notte posso parlare con chi ha il cuore gentile.', 'Nessuno ricorda più i nostri nomi. Ma tu hai ascoltato. Grazie.'], { fx: [['flag', 'sp_elisa_met']], next: 'menu' }),
  menu: say('Elisa', 'Cosa vuoi sapere, viaggiatore?', { choices: [{ t: 'Raccontami la tua storia', next: 'story' }, { t: 'Conosci luoghi segreti?', next: 'secret' }, { t: 'Posso aiutarti?', next: 'quest', if: [['quest', 'q_elisa', 'inactive']] }, { t: 'Addio' }] }),
  story: say('Elisa', ['Il mio sposo era un soldato di Rocca Nera. Partì una notte di tempesta e non tornò. Lo aspetto ancora.', 'Dicono che il castello sia popolato di spettri... e che un cavaliere nero custodisca la torre.'], { next: 'menu' }),
  secret: say('Elisa', 'In una radura tra gli alberi morti, a nord-ovest, giace un forziere: era del mio sposo. Prendilo, ti prego, e ricordalo.', { fx: [['reveal', 'overworld', 80, 424, 'Forziere di Elisa']], next: 'menu' }),
  quest: say('Elisa', 'Gli spettri che vagano qui di notte tormentano chi riposa. Sconfiggine tre, e dormirò serena.', { choices: [{ t: 'Lo farò', fx: [['quest', 'q_elisa']] }, { t: 'Più tardi' }] }),
  thanks: say('Elisa', 'Sento il peso levarsi... Prendi questo: veglierò su di te.', { fx: [['flag', 'thx_elisa']] }) } };
DLG.sp_soldato = { start: [{ go: 'a' }], nodes: {
  a: say('Soldato Caduto', 'Difesi queste mura fino all\'ultimo. Il cavaliere nero giurava fedeltà al mio re... poi la torre cadde nell\'ombra.', { choices: [{ t: 'Come batto il cavaliere nero?', next: 'tip' }, { t: 'Dove sono i tesori del castello?', next: 'secret' }, { t: 'Riposa in pace' }] }),
  tip: say('Soldato Caduto', 'Non attaccarlo a testa bassa: ripara con lo scudo al momento giusto. Una parata perfetta gli fa perdere l\'equilibrio.', { next: 'a' }),
  secret: say('Soldato Caduto', 'Nel cortile, dietro le rovine, nascosi la mia paga. Prendila: a me non serve più.', { fx: [['reveal', 'overworld', 140, 498, 'Paga del Soldato']], next: 'a' }) } };
DLG.sp_bimba = { start: [{ if: [['flag', 'sp_bimba_done']], go: 'done' }, { go: 'a' }], nodes: {
  a: say('Bimba con la Lanterna', 'Ho fame... non mangio da tanto. Hai qualcosa di dolce?', { choices: [{ t: 'Offri un dango', next: 'gift', if: [['item', 'dango']] }, { t: 'Non ho nulla' }] }),
  gift: say('Bimba con la Lanterna', 'Grazie! Ti regalo il mio incenso: serve a far dormire le anime tristi. E ti dico un segreto...', { fx: [['take', 'dango', 1], ['give', 'incenso', 3], ['flag', 'sp_bimba_done'], ['reveal', 'overworld', 100, 452, 'Nascondiglio della Bimba']] }),
  done: say('Bimba con la Lanterna', 'La mia lanterna non si spegne mai. Così non ho paura.') } };
for (const x of ['a', 'b', 'c']) {
  const f = `kodama_${x}_ok`;
  DLG[`sp_kodama_${x}`] = { start: [{ if: [['flag', f]], go: 'done' }, { go: 'a' }], nodes: {
    a: say('Kodama', '...clic, clic... (il piccolo spirito ti osserva, timido, dondolando la testa)', { choices: [{ t: 'Offri un onigiri', next: 'g1', if: [['item', 'onigiri']] }, { t: 'Offri un dango', next: 'g2', if: [['item', 'dango']] }, { t: 'Lascialo in pace' }] }),
    g1: say('Kodama', '(clic clic! Il kodama tintinna di gioia e ti avvolge in una luce verde.)', { fx: [['take', 'onigiri', 1], ['maxhp', 3], ['flag', f]] }),
    g2: say('Kodama', '(Il kodama ti dona una piccola essenza luminosa e scompare tra le foglie.)', { fx: [['take', 'dango', 1], ['give', 'essenza_spirito', 1], ['flag', f]] }),
    done: say('Kodama', '(clic... il kodama ti saluta con un cenno e si nasconde dietro un tronco.)') } };
  const sf = `sp_errante_${x}`;
  DLG[`sp_anima_errante_${x}`] = { start: [{ go: 'a' }], nodes: {
    a: say('Anima Errante', '...non ricordo il mio nome... il freddo... dov\'è casa...?', { choices: [{ t: 'Brucia incenso per lei', next: 'rest', if: [['item', 'incenso']] }, { t: 'Chiedi il suo nome', next: 'name' }, { t: 'Lasciala vagare' }] }),
    name: say('Anima Errante', 'Il mio nome... era scritto su una pietra... ormai coperta dall\'edera.', { next: 'a' }),
    rest: say('Anima Errante', '(Il fumo la avvolge. L\'anima sorride e si dissolve in mille luci, lasciando un\'essenza.)', { fx: [['take', 'incenso', 1], ['give', 'essenza_spirito', 1], ['flag', sf]] }) } };
}
DLG.sp_guardiano = { start: [{ go: 'a' }], nodes: {
  a: say('Guardiano della Sorgente', 'Nessuno beve alla Sorgente Sacra senza rispondere. Ascolta: «Non ho voce ma racconto, non ho ali ma volo tra le mani. Cosa sono?»', { choices: [{ t: 'Un libro', next: 'right' }, { t: 'Il vento', next: 'wrong' }, { t: 'Un uccello', next: 'wrong' }] }),
  right: say('Guardiano della Sorgente', 'Saggia risposta. Bevi, e che la foresta ti sia amica.', { fx: [['flag', 'sp_sorgente'], ['give', 'nettare_luna', 2], ['maxhp', 5]] }),
  wrong: say('Guardiano della Sorgente', 'No. La sorgente non si concede ai frettolosi. Riflettici.') } };
DLG.sp_oracolo = { start: [{ go: 'a' }], nodes: {
  a: say('Oracolo della Luna', 'Il tuo filo è rosso e tremante, figlio del tempo... Ogni dono ha un prezzo, ogni prezzo un dono.', { choices: [{ t: 'Chiedi del futuro', next: 'future' }, { t: 'Chiedi di un tesoro', next: 'treasure' }, { t: 'Accetta il dono dell\'oracolo (50 monete)', next: 'gift', if: [['gold', 50]] }, { t: 'Rifiuta' }] }),
  future: say('Oracolo della Luna', ['Vedo un re senza ombra, che indossa la tua stessa maschera. Non è un nemico: è ciò che diventerai se perderai tutto.', 'Cerca il Cuore del Tempo, dove i fili si ricuciono.'], { next: 'a' }),
  treasure: say('Oracolo della Luna', 'Dove le pietre guardano la luna, sotto la quercia più antica, qualcuno nascose un forziere.', { fx: [['reveal', 'overworld', 112, 150, 'Forziere dell\'Oracolo']], next: 'a' }),
  gift: say('Oracolo della Luna', 'Prendi: serve a chi non teme di cadere.', { fx: [['gold', -50], ['give', 'elisir_furia', 1]] }) } };
DLG.sp_sovrana = { start: [{ if: [['flag', 'sp_sovrana_gift']], go: 'b' }, { go: 'a' }], nodes: {
  a: say('Sovrana degli Spiriti', ['Benvenuto nel Regno degli Spiriti, dove sostano le anime tra un mondo e l\'altro.', 'Hai portato pace ai nostri fratelli sulla Terra. Accetta il mio dono.'], { fx: [['give', 'ciondolo_anima', 1], ['maxhp', 6], ['flag', 'sp_sovrana_gift']] }),
  b: say('Sovrana degli Spiriti', 'Il Filo è spezzato in molti punti. Ovunque tu vada, ricorda: i morti non sono nemici, solo storie incompiute.') } };

export const CIV_NPCS = NPCS_OUT, CIV_DIALOGUES = DLG, CIV_QUESTS = QST;
