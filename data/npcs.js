// NPC: alleati, mercanti, personaggi di trama. `at` può essere:
//   {map,x,y}  coordinate assolute      {map,town,x,y}  relative a una città      {map,anchor,dx,dy}  relative a un'ancora
// Le posizioni vengono "agganciate" al tile libero più vicino al momento dello spawn.
import { OX, OY } from './realm.js';
import { CIV_NPCS } from './people.js';
const P = (top, bottom, hair, skin = '#f1c9a0', extra = {}) => ({ top, bottom, hair, skin, sash: extra.sash || '#6a4a2a', ...extra });

export const NPCS = {
  // --- Hinomura ---
  maestra_akane: { n: 'Maestra Akane', look: P('#c8283a', '#2a2a40', '#e8e8f0', '#f0c8a0', { sash: '#f0c040', headband: 1, staff: 1, staffCol: '#8a5a2a' }), quirk: ['bubble'], shouts: ['Vieni, Kitsune!'], at: { map: 'dojo', x: 10, y: 6 }, dialogue: 'maestra_akane' },
  genzo: { n: 'Anziano Genzō', look: P('#d8d4cc', '#5a4a6a', '#e8e8e8', '#e8c49a', { beard: 1, bald: 1, robe: 1, staff: 1, staffCol: '#c0f0ff', sash: '#8a6a3a' }), quirk: ['smoke'], at: { map: 'int_elder', x: 7, y: 3 }, dialogue: 'genzo' },
  tetsuo: { n: 'Tetsuo il Fabbro', look: P('#8a6a50', '#3a3a44', '#2a1a10', '#d8a878', { apron: 1, bandana: 1, sash: '#222' }), quirk: ['hammer'], at: { map: 'int_smith', x: 7, y: 4 }, dialogue: 'tetsuo' },
  hanae: { n: 'Hanae la Speziale', look: P('#4a8a6a', '#e8e0c8', '#2a2a30', '#f4d4b0', { bun: 1, apron: 1 }), quirk: ['puff'], at: { map: 'int_pharma', x: 6, y: 3 }, dialogue: 'hanae' },
  kichi: { n: 'Kichi il Locandiere', look: P('#c85a3a', '#4a3a2a', '#5a3a2a', '#e0b890', { apron: 1, bandana: 1, bandanaCol: '#f0e8d0' }), quirk: ['bubble', 'mug'], shouts: ['Un letto caldo!', 'Zuppa fumante!', 'Prego, accomodati!'], at: { map: 'int_inn', x: 8, y: 3 }, dialogue: 'kichi' },
  sora: { n: 'Sora la Ambulante', look: P('#e8a838', '#6a4a8a', '#8a3a2a', '#f0c8a0', { straw: 1, scarf: 1, scarfCol: '#e84a6a' }), quirk: ['bubble'], shouts: ['Onigiri caldi!', 'Ramen fresco!', 'Dango per tutti!'], hours: [6, 21], at: { map: 'overworld', town: 'hinomura', x: 13, y: 11 }, dialogue: 'sora' },
  nobu: { n: 'Nobu il Mercante', look: P('#5a7aa8', '#3a3a50', '#222', '#d8a878', { glasses: 1, turban: 1, turbanCol: '#6a8ac8' }), quirk: ['bubble'], shouts: ['Pelli e funghi!', 'Affari d\'oro!', 'Solo roba buona!'], hours: [6, 21], at: { map: 'overworld', town: 'hinomura', x: 22, y: 11 }, dialogue: 'nobu' },
  guard_s: { n: 'Guardia di Hinomura', look: P('#8a2a2a', '#3a3a44', '#222', '#d8a878', { helm: 1, staff: 1, staffCol: '#c0c0d0' }), quirk: ['patrol'], lantern: 1, at: { map: 'overworld', town: 'hinomura', x: 16, y: 26 }, dialogue: 'guard_s' },
  mio: { n: 'Mio', look: P('#e86a8a', '#4a6aa8', '#2a1a10', '#f4d4b0', { small: 1, long: 1, scarf: 1, scarfCol: '#ffd060' }), quirk: ['hop'], at: { map: 'overworld', town: 'hinomura', x: 26, y: 18 }, dialogue: 'mio', wander: 22 },
  daigo: { n: 'Daigo lo Stalliere', look: P('#7a5a3a', '#5a4a3a', '#3a2a1a', '#d0a070', { hat: 1, scarf: 1, scarfCol: '#a05030' }), quirk: ['brush'], at: { map: 'overworld', x: 133, y: 129 }, dialogue: 'daigo' },
  umi: { n: 'Umi il Pescatore', look: P('#3a6a8a', '#3a3a3a', '#8a8a8a', '#c89868', { straw: 1, beard: 1 }), quirk: ['rod'], at: { map: 'overworld', x: 145, y: 203 }, dialogue: 'umi' },
  rin: { n: 'Rin', look: P('#2a2a40', '#ff3fa4', '#c8d8f0', '#f4d4b0', { sash: '#2ee6ff', long: 1, scarf: 1, scarfCol: '#2ee6ff', glow: '46,230,255' }), quirk: ['glitch'], at: { map: 'overworld', town: 'hinomura', x: 19, y: 18 }, dialogue: 'rin', if: [['flag', 'boss:oni_kurogane']] },
  kuzunoha: { n: 'Kuzunoha, Spirito della Volpe', look: P('#f6f2ea', '#d02030', '#f8f0e0', '#f6e8e0', { sash: '#d02030', ears: 1, tails: 9, robe: 1, glow: '190,230,255' }), quirk: ['hover', 'orbit'], orbit: ['#8ae8ff', '#c0f0ff', '#ffffff'], at: { map: 'int_fire_shrine', x: 5, y: 2 }, dialogue: 'kuzunoha' },
  // --- Aurelburg ---
  ottokar: { n: 'Dr. Ottokar von Zeitlauf', look: P('#e8e8f0', '#4a4a5a', '#e8e8e8', '#f0c8a0', { goggles: 1, wild: 1, robe: 1, sash: '#888' }), quirk: ['sparks', 'orbit', 'bubble'], orbit: ['#d8a030', '#8a8aa0', '#d8a030'], shouts: ['E = mc²... oder?', 'Das ist unmöglich!', 'Ein Sekundenbruchteil...'], at: { map: 'int_lab', x: 6, y: 6 }, dialogue: 'ottokar' },
  brunhild: { n: 'Frau Brunhild', look: P('#a83a3a', '#e8d8b8', '#e8c860', '#f4d4b0', { bun: 1, apron: 1 }), quirk: ['bubble'], shouts: ['Frisch! Frisch!', 'Ja, ja, schnell!', 'Nur das Beste!'], at: { map: 'int_market', x: 8, y: 3 }, dialogue: 'brunhild' },
  lorenz: { n: 'Capitano Lorenz', look: P('#2a4a8a', '#3a3a50', '#6a4a2a', '#e0b890', { helm: 1, cape: 1, capeCol: '#7a1c2a', medal: 1 }), quirk: ['salute'], at: { map: 'int_hall', x: 10, y: 3 }, dialogue: 'lorenz' },
  wirt: { n: 'Herr Wirt', look: P('#8a6a3a', '#4a3a2a', '#c8a850', '#f0c8a0', { beard: 1, apron: 1, bandana: 1, bandanaCol: '#8a2a2a' }), quirk: ['mug', 'bubble'], shouts: ['Prost!', 'Zum Wohl!', 'Noch ein Bier?'], at: { map: 'int_inn_eu', x: 7, y: 3 }, dialogue: 'wirt' },
  madame_zeit: { n: 'Madame Zeit', look: P('#6a2a8a', '#2a1a4a', '#d8d8f0', '#f0d0b0', { turban: 1, turbanCol: '#4a2a8a', scarf: 1, scarfCol: '#d8a030', robe: 1 }), quirk: ['orb', 'bubble'], shouts: ['Mostrami la mano...', 'Vedo il tuo futuro...', 'Il tempo non mente'], at: { map: 'overworld', town: 'aurelburg', x: 26, y: 19 }, dialogue: 'madame_zeit', wander: 20 },
  guard_aurel: { n: 'Sentinella', look: P('#3a5aa8', '#e8e8f0', '#4a3a2a', '#e0b890', { helm: 1, staff: 1, staffCol: '#c0c0d0', cape: 1, capeCol: '#2a3a78' }), quirk: ['patrol'], lantern: 1, at: { map: 'overworld', town: 'aurelburg', x: 3, y: 18 }, dialogue: 'guard_aurel' },
  // --- futuro e aldilà ---
  zero: { n: 'Zero', look: P('#14102a', '#2ee6ff', '#ff3fa4', '#e8d0c0', { sash: '#ff3fa4', goggles: 1, spiky: 1, scarf: 1, scarfCol: '#ff3fa4' }), quirk: ['screen'], at: { map: 'neo_edo', x: 11, y: 66 }, dialogue: 'zero' },
  mx9: { n: 'MX-9', look: P('#5a5a78', '#2a2a40', '#14102a', '#9ab0c8', { sash: '#ff3fa4', robot: 1 }), quirk: ['robot'], at: { map: 'int_neo_vendor', x: 6, y: 3 }, dialogue: 'mx9' },
  sanzu: { n: 'Sanzu, il Traghettatore', look: P('#2a2a30', '#14141c', '#d8d8e0', '#b8c0c8', { straw: 1, robe: 1, long: 1 }), quirk: ['mist', 'pole'], at: { map: 'yomi', anchor: 'entry', dx: 3, dy: -1 }, dialogue: 'sanzu' },
  // --- avamposti e piani alti ---
  okami_nagi: { n: 'Okami di Nagi', look: P('#c85a3a', '#4a3a2a', '#5a3a2a', '#e0b890', { bun: 1, apron: 1 }), quirk: ['bubble'], shouts: ['Benvenuti a Nagi!', 'Zuppa calda!'], at: { map: 'int_inn_road', x: 6, y: 3 }, dialogue: 'okami_nagi' },
  viandante: { n: 'Viandante Itō', look: P('#6a8a5a', '#4a4a3a', '#8a8a8a', '#d0a070', { straw: 1, cape: 1, capeCol: '#5a4a3a', staff: 1 }), quirk: ['bubble'], shouts: ['Provviste per il viaggio!', 'Strada lunga, amico!'], at: { map: 'overworld', x: 196, y: 162 }, dialogue: 'viandante', wander: 14 },
  kenji: { n: 'Kenji il Boscaiolo', look: P('#8a3a2a', '#3a4a5a', '#3a2a1a', '#d8a878', { beard: 1, bandana: 1 }), quirk: ['chop'], at: { map: 'int_sawmill', x: 6, y: 3 }, dialogue: 'kenji' },
  hisa: { n: 'Hisa del Rifugio', look: P('#e8e0f0', '#5a6a9a', '#c8c8d8', '#f0d0b0', { scarf: 1, scarfCol: '#a0c0f0', bun: 1 }), quirk: ['steam'], at: { map: 'int_lodge', x: 6, y: 3 }, dialogue: 'hisa' },
  zahra: { n: 'Zahra di Sunari', look: P('#e8a838', '#8a2a5a', '#2a1a2a', '#c89868', { turban: 1, turbanCol: '#e85a8a', scarf: 1, scarfCol: '#ffd060' }), quirk: ['orbit'], orbit: ['#ffd060', '#ffe090', '#ffd060'], at: { map: 'int_tent_sunari', x: 6, y: 4 }, dialogue: 'zahra' },
  numa: { n: 'Numa la Barcaiola', look: P('#4a7a5a', '#3a3a2a', '#2a3a2a', '#c8a878', { straw: 1, long: 1 }), quirk: ['pole'], at: { map: 'int_stilt', x: 5, y: 3 }, dialogue: 'numa' },
  ferdinand: { n: "Ferdinand l'Orologiaio", look: P('#7a6a4a', '#3a3a4a', '#e8e8e8', '#f0c8a0', { goggles: 1, bald: 1, apron: 1, staff: 1, staffCol: '#d8a030' }), quirk: ['orbit', 'bubble'], orbit: ['#d8a030', '#8a8aa0'], shouts: ['Tic... tac...', 'Il pendolo oscilla male'], at: { map: 'int_tower_3', x: 8, y: 6 }, dialogue: 'ferdinand' },
  hotaru: { n: "Hotaru l'Apprendista", look: P('#8a6a50', '#2a2a34', '#c85a3a', '#d8a878', { small: 1, bandana: 1, apron: 1 }), quirk: ['hammer'], at: { map: 'int_smith_b1', x: 6, y: 4 }, dialogue: 'hotaru' },
  edda: { n: 'Consigliera Edda', look: P('#5a2a6a', '#e8e0d0', '#d8d8e8', '#f0d0b0', { bun: 1, robe: 1, glasses: 1 }), quirk: ['orbit'], orbit: ['#f8f4e8', '#f8f4e8', '#f8f4e8'], at: { map: 'int_hall_2f', x: 10, y: 4 }, dialogue: 'edda' },
  aiko: { n: 'AIKO-3', look: P('#e8e8f8', '#2a2a40', '#2ee6ff', '#9ab0c8', { robot: 1, glow: '46,230,255' }), quirk: ['robot', 'screen'], at: { map: 'int_neo_tower', x: 8, y: 4 }, dialogue: 'aiko' },
};

// i PNG con coordinate assolute sull'overworld seguono la traslazione della terra di Hinomoto
for (const n of Object.values(NPCS)) if (n.at.map === 'overworld' && !n.at.town && !n.at.anchor) { n.at.x += OX; n.at.y += OY; }
Object.assign(NPCS, CIV_NPCS);
