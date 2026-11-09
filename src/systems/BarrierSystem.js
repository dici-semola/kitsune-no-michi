// Meccanica delle barriere di progressione: colpi (katana/bombe/fuoco), interazione (cancelli, ponti), apertura con effetti e persistenza.
import { T } from '../data/tiles.js';
import { TS } from '../core/Util.js';
import { KINDS, reqList } from '../data/gates.js';
import { check } from './Script.js';
import { TileMap } from '../engine/TileMap.js';

const flagOf = (b) => `barrier:${b.id}`;
export const isOpen = (sc, b) => sc.state.flags.has(flagOf(b));

function clear(sc, m, b) {
  for (const [x, y] of b.cells) { m.setO(x, y, 0); if (b.kind === 'plank') m.setG(x, y, T.BRIDGE); }
}
// Al caricamento della mappa: riapplica le barriere già aperte (salvataggi compresi).
export function applyBarriers(sc, m) {
  if (m.barriers) TileMap.openRealms = new Set();
  for (const b of m.barriers || []) if (isOpen(sc, b)) { clear(sc, m, b); TileMap.openRealms.add(b.realm); }
}

function say(sc, b, s, col = '#ffd0a0') { sc.floatText(b.cx * TS + 8, b.cy * TS - 6, s, col); }

export function openBarrier(sc, b) {
  const m = sc.map; if (isOpen(sc, b)) return;
  sc.state.setFlag(flagOf(b));
  for (const [x, y] of b.cells) {
    const px = x * TS + 8, py = y * TS + 8;
    sc.spark(px, py, b.kind === 'ice' ? '#d8f4ff' : b.kind === 'plank' ? '#c89c50' : '#a39a8a', 10);
    sc.spark(px, py, '#6a645a', 6);
  }
  sc.ring(b.cx * TS + 8, b.cy * TS + 8, 34, '#ffe0a0'); sc.shake(5);
  sc.audio.sfx(b.kind === 'rubble' ? 'explode' : b.kind === 'plank' ? 'select' : 'rockbreak');
  clear(sc, m, b); TileMap.openRealms.add(b.realm);
  sc.toast(b.kind === 'boulder' ? 'Il masso va in frantumi: il sentiero è libero!' : b.kind === 'rubble' ? 'La frana salta in aria: il passaggio è aperto!' : b.kind === 'ice' ? 'Il ghiaccio si scioglie: la via è aperta!' : b.kind === 'plank' ? 'Hai riparato il ponte!' : 'Il cancello si apre!');
}

function crack(sc, m, b) {
  const K = KINDS[b.kind]; if (!K.crack) return;
  b.cells.forEach(([x, y], i) => { if (i % 2 === 0 || b.hp <= 1) m.setO(x, y, K.crack); });
}

// type: 'katana' | 'bomb' | 'fire'. Restituisce true se ha colpito una barriera.
export function hitBarriers(sc, x, y, r, type, power = 1) {
  const m = sc.map; let any = false;
  for (const b of m.barriers || []) {
    if (isOpen(sc, b) || b.kind === 'gate' || (b.kind === 'plank' && type !== 'ice')) continue;
    const near = b.cells.some(([cx, cy]) => Math.hypot(cx * TS + 8 - x, cy * TS + 8 - y) < r + 9);
    if (!near) continue;
    any = true;
    const K = KINDS[b.kind];
    if (!check(b.req, sc.state)) {
      if ((b.denyT || 0) < sc.time - 1.6) { b.denyT = sc.time; say(sc, b, 'Non cede… non sei ancora pronto', '#ff9a7a'); sc.toast(`Per aprire questo passaggio devi ${reqList(b.req)}.`); sc.audio.sfx('block'); }
      continue;
    }
    // il fuoco scioglie il ghiaccio; la bomba spacca massi e frane; la katana solo il masso
    const ok = (b.kind === 'boulder' && (type === 'katana' || type === 'demo')) || (b.kind === 'rubble' && type === 'demo') || (b.kind === 'ice' && (type === 'fire' || type === 'bomb_fire')) || (b.kind === 'plank' && type === 'ice');
    if (!ok) {
      if ((b.denyT || 0) < sc.time - 1.6) { b.denyT = sc.time; say(sc, b, b.kind === 'rubble' ? 'Serve una Carica da Demolizione' : b.kind === 'ice' ? 'Serve il fuoco' : b.kind === 'plank' ? 'Serve il gelo o delle assi' : 'Serve altro', '#ff9a7a'); sc.audio.sfx('block'); }
      continue;
    }
    if ((b.hitT || 0) > sc.time - 0.25 && type === 'katana') continue; // un fendente = un colpo
    b.hitT = sc.time; b.hp -= (type === 'demo' || type === 'bomb_fire') ? K.hits : power;
    sc.spark(b.cx * TS + 8, b.cy * TS + 8, '#c8c0b0', 8); sc.shake(2); sc.audio.sfx('block');
    if (b.hp <= K.hits / 2) crack(sc, m, b);
    if (b.hp <= 0) openBarrier(sc, b);
  }
  return any;
}

// Tasto E: cancelli sorvegliati e ponti interrotti.
export function barrierInteract(sc) {
  const p = sc.player, m = sc.map; if (!m.barriers) return false;
  for (const b of m.barriers) {
    if (isOpen(sc, b) || (b.kind !== 'gate' && b.kind !== 'plank')) continue;
    if (!b.cells.some(([cx, cy]) => Math.hypot(cx * TS + 8 - (p.cx + p.face.x * 12), cy * TS + 8 - (p.cy + p.face.y * 12)) < 22)) continue;
    if (b.kind === 'gate') {
      if (check(b.req, sc.state)) openBarrier(sc, b);
      else { sc.toast(`Il cancello è sbarrato. Per passare devi ${reqList(b.req)}.`); sc.audio.sfx('block'); }
      return true;
    }
    const K = KINDS.plank;
    if (!check(b.req, sc.state)) { sc.toast(`Oltre il ponte è territorio pericoloso: devi ${reqList(b.req)}.`); sc.audio.sfx('block'); return true; }
    if (sc.state.inv.count(K.item) >= K.n) { sc.state.inv.remove(K.item, K.n); openBarrier(sc, b); }
    else sc.toast(`Il ponte è crollato. Servono ${K.n} Assi da Ponte per ripararlo (si costruiscono).`);
    return true;
  }
  return false;
}

export const nearBarrierPrompt = (sc) => {
  const p = sc.player, m = sc.map; if (!m.barriers) return false;
  return m.barriers.some((b) => !isOpen(sc, b) && (b.kind === 'gate' || b.kind === 'plank') && b.cells.some(([cx, cy]) => Math.hypot(cx * TS + 8 - (p.cx + p.face.x * 12), cy * TS + 8 - (p.cy + p.face.y * 12)) < 22));
};
