// Abilità: si sbloccano solo quando sono soddisfatti ENTRAMBI i requisiti (livello + evento di trama).
export const ABILITY_DEFS = {
  dash: {
    id: 'dash', n: 'Scatto del Kitsune', key: 'K', cd: 1.6, ki: 8, range: 110, mult: 1.7,
    unlock: { level: 3, flag: 'boss:oni_kurogane' },
    desc: 'Scatta verso il nemico più vicino e lo colpisce con la katana. Si è invulnerabili durante lo scatto.',
    hint: 'Livello 3 + sconfiggi Oni Kurogane',
  },
  fire: {
    id: 'fire', n: 'Soffio di Fuoco', key: 'L', cd: 2.2, ki: 14, range: 70, mult: 0.55,
    unlock: { level: 6, flag: 'boss:yatsuhashi' },
    desc: 'Soffia una vampata a ventaglio che brucia i nemici. Meno efficace sotto la pioggia.',
    hint: 'Livello 6 + sconfiggi Yatsuhashi',
  },
  black: {
    id: 'black', n: 'Fiamma Nera', key: 'H', cd: 8, ki: 30, dur: 5, mult: 3.2,
    unlock: { level: 12, flag: 'boss:kamios' },
    desc: 'Evoca una fiamma nera che insegue il nemico per 5 secondi finché non lo colpisce.',
    hint: 'Livello 12 + sconfiggi KAMI-OS',
  },
};
