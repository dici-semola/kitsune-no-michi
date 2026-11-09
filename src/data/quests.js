// Missioni. Oggetti: t = talk{npc} | kill{enemy|'any', n} | boss{boss} | have{item,n,take} | flag{flag} | reach{map}
// Gli obiettivi 'talk' e 'kill' avanzano in ordine; boss/have/flag sono valutati dal vivo.
// Le ricompense NON danno XP (il livello sale solo uccidendo mostri): danno monete, oggetti e PV massimi.
import { CIV_QUESTS } from './people.js';
export const QUESTS = {
  m1_omen: {
    title: 'Il Presagio Rosso', act: 'Atto I · Hinomura', main: true, giver: 'genzo',
    desc: 'La luna è rossa e le ombre invadono le praterie. Aiuta il villaggio.',
    obj: [
      { t: 'talk', npc: 'genzo', text: "Parla con l'Anziano Genzō" },
      { t: 'kill', enemy: 'kage_slime', n: 5, text: "Sconfiggi 5 Slime d'Ombra nelle praterie" },
      { t: 'talk', npc: 'genzo', text: 'Torna da Genzō' },
    ],
    reward: { gold: 50, maxHp: 10, items: [['pozione_vita_s', 3]], flags: ['omen_done'] },
  },
  m2_fox: {
    title: "L'Antro della Volpe", act: 'Atto I · Hinomura', main: true, giver: 'genzo',
    desc: 'Una presenza oscura si è annidata nell\'antro a ovest, nella foresta. È la sorgente delle ombre.',
    obj: [
      { t: 'boss', boss: 'oni_kurogane', text: 'Sconfiggi Oni Kurogane nell\'Antro della Volpe' },
      { t: 'talk', npc: 'genzo', text: 'Riferisci a Genzō' },
    ],
    reward: { gold: 120, maxHp: 10, items: [['pozione_vita_m', 2]], flags: ['fox_done'] },
  },
  m3_capitale: {
    title: 'La Capitale Mitteleuropea', act: 'Atto II · Aurelburg', main: true, giver: 'genzo',
    desc: 'Genzō ti affida una lettera per un inventore di Aurelburg, a sud-est lungo la strada.',
    obj: [
      { t: 'reach', map: 'int_lab', text: "Raggiungi il laboratorio dell'inventore ad Aurelburg" },
      { t: 'talk', npc: 'ottokar', text: 'Parla con Ottokar von Zeitlauf' },
    ],
    reward: { gold: 150, maxHp: 10, items: [['lente_cronica', 1]], flags: ['ottokar_met'] },
  },
  m4_frammenti: {
    title: 'I Frammenti del Tempo', act: 'Atto III · Le Terre Selvagge', main: true, giver: 'ottokar',
    desc: 'La macchina di Ottokar ha bisogno di tre Cristalli del Tempo e di una Perla degli abissi.',
    obj: [
      { t: 'boss', boss: 'yatsuhashi', text: 'Palude di Kuroki: sconfiggi Yatsuhashi (Cristallo del Respiro)' },
      { t: 'boss', boss: 'sfinge_cremisi', text: 'Deserto Cremisi: sconfiggi la Sfinge (Cristallo della Sabbia)' },
      { t: 'boss', boss: 'regina_tsurara', text: 'Monti Shirayuki: sali in vetta (3 livelli), scendi nella caverna e sconfiggi Tsurara (Cristallo del Gelo)' },
      { t: 'boss', boss: 'ryujin', text: 'Ryūgū: sconfiggi il Leviatano (Perla del Tempo) — serve una tuta da sub e un delfino' },
    ],
    reward: { gold: 600, maxHp: 20, items: [['elisir_fenice', 1]] },
  },
  m5_macchina: {
    title: 'La Macchina del Folle', act: 'Atto IV · Il Tempo Spezzato', main: true, giver: 'ottokar',
    desc: 'Consegna i quattro catalizzatori alla macchina nel laboratorio di Aurelburg e varca la soglia.',
    obj: [
      { t: 'have', item: 'cristallo_respiro', text: 'Possiedi il Cristallo del Respiro' },
      { t: 'have', item: 'cristallo_sabbia', text: 'Possiedi il Cristallo della Sabbia' },
      { t: 'have', item: 'cristallo_gelo', text: 'Possiedi il Cristallo del Gelo' },
      { t: 'have', item: 'perla_tempo', text: 'Possiedi la Perla del Tempo' },
      { t: 'flag', flag: 'machine_on', text: 'Attiva la macchina nel laboratorio' },
    ],
    reward: { gold: 300, maxHp: 15, items: [['ciondolo_orologio', 1]] },
  },
  m6_neoedo: {
    title: 'Neo-Edo 2187', act: 'Atto V · Futuro Spezzato', main: true, giver: 'ottokar',
    desc: 'Un futuro nato da una crepa nel tempo. Una mente artificiale lo governa.',
    obj: [
      { t: 'reach', map: 'neo_edo', text: 'Attraversa il portale per Neo-Edo' },
      { t: 'boss', boss: 'kamios', text: 'Sconfiggi KAMI-OS nella piazza centrale' },
    ],
    reward: { gold: 1000, maxHp: 20, items: [['pozione_vita_l', 2]], flags: ['mount:hoverbike'] },
  },
  m7_yomi: {
    title: 'Il Giudizio dei Morti', act: 'Atto VI · Yomi', main: true, giver: 'ottokar',
    desc: 'Il sigillo della Gola di Yomi cede alla Fiamma Nera. Enma custodisce il Filo del Destino.',
    obj: [
      { t: 'reach', map: 'yomi', text: 'Entra a Yomi dalla Gola sul fondo del Canyon di Ryūko (o dal portale del Tempo)' },
      { t: 'boss', boss: 'enma', text: 'Sconfiggi Enma-Ō' },
    ],
    reward: { gold: 1500, maxHp: 20, items: [['pesca_yomi', 2]] },
  },
  m8_finale: {
    title: 'Il Re Senza Tempo', act: 'Atto VII · Cuore del Tempo', main: true, giver: 'ottokar',
    desc: 'Mugenkai ti attende dove il tempo smette di scorrere.',
    obj: [
      { t: 'reach', map: 'heart_of_time', text: 'Raggiungi il Cuore del Tempo' },
      { t: 'boss', boss: 'mugenkai', text: 'Sconfiggi Mugenkai' },
    ],
    reward: { gold: 5000, maxHp: 30 },
  },
  // --- Secondarie ---
  s_gatto: {
    title: 'Il Gatto Smarrito', act: 'Secondaria', giver: 'mio', desc: 'Mio ha perso il suo gatto Tama nella foresta lungo il sentiero ovest.',
    obj: [{ t: 'have', item: 'gatto_tama', text: 'Trova Tama nella foresta, vicino al cartello' }, { t: 'talk', npc: 'mio', text: 'Riporta Tama a Mio', take: 1 }],
    reward: { gold: 80, maxHp: 5, items: [['omamori_salute', 1]] },
  },
  s_erbe: {
    title: 'Erbe per Hanae', act: 'Secondaria', giver: 'hanae', desc: 'Hanae ha finito le erbe medicinali.',
    obj: [{ t: 'have', item: 'erba_medicinale', n: 5, text: 'Raccogli 5 Erbe Medicinali (cadono dagli spiriti nella foresta e nella palude)' }, { t: 'talk', npc: 'hanae', text: 'Consegna le erbe a Hanae', take: 1 }],
    reward: { gold: 40, maxHp: 5, items: [['pozione_vita_s', 3], ['pozione_ki_s', 1]] },
  },
  s_ferro: {
    title: 'Ferro per la Fucina', act: 'Secondaria', giver: 'tetsuo', desc: 'Tetsuo ha bisogno di ferro grezzo per forgiare nuove lame.',
    obj: [{ t: 'have', item: 'ferro_grezzo', n: 4, text: 'Procurati 4 Ferro Grezzo (golem, goblin, o compralo)' }, { t: 'talk', npc: 'tetsuo', text: 'Consegna il ferro a Tetsuo', take: 1 }],
    reward: { gold: 100, items: [['carbone', 5], ['elisir_ferro', 1]] },
  },
  s_tengu: {
    title: 'Il Corvo del Canyon', act: 'Secondaria', giver: 'lorenz', desc: 'Un Tengu terrorizza le carovane del Canyon di Ryūko. Chi lo sconfigge ottiene una piuma d\'aquila magica.',
    obj: [{ t: 'boss', boss: 'tengu_karasu', text: 'Sconfiggi Tengu Karasu nel Tempio del Corvo (fondo del Canyon, in cima alla guglia)' }, { t: 'talk', npc: 'lorenz', text: 'Riferisci al Capitano Lorenz' }],
    reward: { gold: 300, maxHp: 10, flags: ['mount:eagle'] },
  },
};

Object.assign(QUESTS, CIV_QUESTS);
