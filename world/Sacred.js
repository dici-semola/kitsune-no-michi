// Santuari sacri: oltre al santuario e alla sua radura, ogni luogo riceve un'architettura sacra adatta all'ambiente:
// torii (giapponese, anche di ghiaccio/pietra/luce), Buddha sdraiato (tropici), statue maya (rovine, deserti, vulcani), croce celtica (altopiani e canyon),
// tomba pagana a dolmen con menhir (paludi e brughiere), stupa (giada). Sono "decorazioni": props con sprite proprio, collisione solo sulle parti piene.
const SET = {
  torii: (x, y, v) => [{ sprite: v, x, y: y + 4, solid: false }, { sprite: 'hit', x: x - 1, y: y + 4 }, { sprite: 'hit', x: x + 1, y: y + 4 }, { sprite: 'lantern', x: x - 3, y: y + 3 }, { sprite: 'lantern', x: x + 3, y: y + 3 }],
  buddha: (x, y, v) => [{ sprite: v, x, y: y - 4, w: 72, h: 12 }, { sprite: 'lantern', x: x - 4, y: y + 2 }, { sprite: 'lantern', x: x + 4, y: y + 2 }],
  maya: (x, y, v) => [{ sprite: v, x: x - 4, y: y - 2, w: 28, h: 10 }, { sprite: v, x: x + 4, y: y - 2, w: 28, h: 10 }, { sprite: 'menhir', x, y: y - 4 }],
  cross: (x, y) => [{ sprite: 'cross', x, y: y - 3, w: 22, h: 8 }, { sprite: 'menhir', x: x - 4, y: y + 3 }, { sprite: 'menhir', x: x + 4, y: y + 3 }],
  dolmen: (x, y) => [{ sprite: 'dolmen', x: x - 4, y: y - 3, solid: false }, { sprite: 'hit', x: x - 5, y: y - 3 }, { sprite: 'hit', x: x - 3, y: y - 3 }, { sprite: 'dolmen', x: x + 4, y: y - 3, solid: false }, { sprite: 'hit', x: x + 3, y: y - 3 }, { sprite: 'hit', x: x + 5, y: y - 3 }, { sprite: 'menhir', x: x - 5, y: y + 3 }, { sprite: 'menhir', x: x + 5, y: y + 3 }],
  stupa: (x, y) => [{ sprite: 'stupa', x, y: y - 4, w: 28, h: 8 }, { sprite: 'lantern', x: x - 4, y: y + 2 }, { sprite: 'lantern', x: x + 4, y: y + 2 }],
};
export const SACRED_KINDS = {
  torii: ['torii', 'torii'], torii_ice: ['torii', 'torii_ice'], torii_mystic: ['torii', 'torii_mystic'], torii_stone: ['torii', 'torii_stone'],
  buddha: ['buddha', 'buddha'], buddha_stone: ['buddha', 'buddha_stone'], maya: ['maya', 'maya'], maya_obsidian: ['maya', 'maya_obsidian'], cross: ['cross', 'cross'], dolmen: ['dolmen', 'dolmen'], stupa: ['stupa', 'stupa'],
};
// ambiente -> architettura sacra (mondo principale)
export const SACRED_OF_BIOME = { meadow: 'torii', forest: 'torii', enchanted: 'torii_mystic', ancient: 'maya', jade: 'stupa', tropical: 'buddha', swamp: 'dolmen', haunted: 'dolmen', desert: 'maya', dunes: 'maya', badlands: 'cross', canyon: 'cross', plateau: 'cross', mountain: 'torii_stone', tundra: 'torii_ice', snow: 'torii_ice', volcano: 'maya_obsidian', ocean: 'buddha_stone' };

export function addSacred(m, x, y, kind) {
  const k = SACRED_KINDS[kind]; if (!k) return 0;
  const defs = SET[k[0]](x, y, k[1]); let n = 0;
  for (const d of defs) { m.props.push({ type: 'deco', id: `sacro_${x}_${y}_${n}`, ...d }); n++; }
  m.sacred = (m.sacred || 0) + 1; (m.sacredKinds = m.sacredKinds || []).push(kind);
  return n;
}
