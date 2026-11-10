// NPC memorabili: ogni personaggio riceve, in modo deterministico (stesso NPC = stesso aspetto), tratti riconoscibili scelti dal ruolo e dalla persona:
// attrezzi del mestiere (martello, lancia, lanterna, libro, canna da pesca, ombrello), cappelli e acconciature, motivi sugli abiti, animaletti, segni sul volto, corporature diverse.
import { hash2 } from '../core/Util.js';
const h = (id, s) => { let a = 7; for (let i = 0; i < id.length; i++) a = (a * 31 + id.charCodeAt(i)) | 0; return hash2(a % 997, (a >> 8) % 991 + s, 17 + s); };
const pickOf = (id, s, list) => list[Math.floor(h(id, s) * list.length) % list.length];
const ROLES = [
  [/fabbr|smith|tetsu|forg|armaiol|nano/i, { apron: 1, tool: 'hammer', headband: 1, wide: 1 }],
  [/mercant|venditor|bazar|negozi|bancarell|commerc|sora|nobu|brunhild/i, { backpack: 1, straw: 1, pat: 'stripe' }],
  [/locand|oste|taverni|cuoc|panett|cameriere/i, { apron: 1, tool: 'lantern', bun: 1 }],
  [/guard|soldat|capitan|sentinel|sorvegli|gendarm|cavalier/i, { helm: 1, tool: 'spear', shawl: 1 }],
  [/anzian|saggio|maestro|elder|monaco|prete|sacerdot|genz|eremit|veggente|oracolo|nonn/i, { beard: 1, tool: 'cane', long: 1, halo: 1 }],
  [/bambin|bimb|ragazz|kid|mio\b|piccol/i, { small: 1, ribbon: 1, tool: 'balloon' }],
  [/pescator|fisher|marinai|barcaiol|nocchier|navigator/i, { straw: 1, tool: 'fishrod', pat: 'stripe' }],
  [/medic|farmac|dottor|erborist|hanae|alchim/i, { glasses: 1, tool: 'flask', pat: 'dot' }],
  [/nobil|imperat|re\b|princip|regin|general|sovran|ministr|consigli/i, { crown: 1, tool: 'fan', pat: 'trim', shawl: 1 }],
  [/viaggiat|nomad|cammell|carovan|pellegrin|straniero|cercator/i, { turban: 1, tool: 'parasol', shawl: 1 }],
  [/cacciator|ranger|arcier|boscaiol|kenji|guida/i, { hood: 1, tool: 'bow', scar: 1 }],
  [/ladro|tanuki|spia|ombra|contrabb/i, { bandana: 1, mask: 1, scar: 1 }],
  [/studios|scriba|biblio|inventor|ottokar|ingegner|scienzi|tecnic/i, { goggles: 1, tool: 'book', spiky: 1 }],
  [/contadin|agricolt|pastor|fattor|giardin/i, { straw: 1, tool: 'hoe', pat: 'check' }],
  [/musicist|bardo|cantant|artista|pittor/i, { tool: 'lute', ribbon: 1, earring: 1 }],
];
const GENERIC = [{ earring: 1 }, { headband: 1 }, { pat: 'stripe' }, { pat: 'dot' }, { pat: 'check' }, { pet: 'cat' }, { pet: 'bird' }, { bell: 1 }, { scar: 1 }, { tattoo: 1 }, { shawl: 1 }, { ribbon: 1 }, { spiky: 1 }, { bun: 1 }, { wild: 1 }, { halo: 0 }];

export function memorable(id, def) {
  const look = def.look || {}, key = (id + ' ' + (def.n || '')), add = {};
  for (const [re, ex] of ROLES) if (re.test(key)) { Object.assign(add, ex); break; }
  // tratti personali (sempre almeno due): mestiere a parte, ognuno ha qualcosa che lo distingue
  let k = 0; while (Object.keys(add).length < 4 && k < 6) { Object.assign(add, GENERIC[Math.floor(h(id, k + 1) * GENERIC.length) % GENERIC.length]); k++; }
  const r = h(id, 20); if (r < 0.2) add.wide = 1; else if (r < 0.38) add.tall = 1;
  if (add.pat && !look.pat) add.pat = add.pat; const pal = pickOf(id, 30, ['#e8505a', '#4a8ac8', '#f0c040', '#7ac060', '#c080e8', '#ff9a50']); add.accent = look.accent || pal;
  if (look.small) delete add.wide;
  const out = { ...add, ...look }; if (!look.pat && add.pat) out.pat = add.pat; if (!look.tool && add.tool) out.tool = add.tool;
  return out;
}
