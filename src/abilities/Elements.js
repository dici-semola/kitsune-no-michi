// Poteri elementali dati dalle pozioni: ghiaccio, fulmine, acqua. Sinergia: un nemico BAGNATO subisce di più dal fulmine
// (+60%, catena più lunga, paralisi più lunga) e resta congelato più a lungo.
import { Projectile } from '../entities/Projectile.js';
import { ELEMENTS } from '../data/crafting.js';
import { TS } from '../core/Util.js';
import { T, DEFS } from '../data/tiles.js';
import { TileMap } from '../engine/TileMap.js';
import { REALM_TIER } from '../data/gates.js';

export const activeElement = (st) => { const b = st.buffs.find((x) => x.stat === 'elem'); return b ? { id: b.el, t: b.t } : null; };

export function castElement(sc, p) {
  const st = sc.state, act = activeElement(st);
  if (!act) { sc.toast('Nessun potere elementale attivo: bevi una pozione elementale.'); return false; }
  const E = ELEMENTS[act.id];
  if ((p.elemCd || 0) > 0) return false;
  if (st.ki < E.ki) { sc.floatText(p.cx, p.y - 12, 'Ki insufficiente', '#8aa8ff'); p.elemCd = 0.3; return false; }
  const inp = sc.game.input; p.aimNow(sc, inp, inp.axis(), false);
  const a = Math.atan2(p.aim.y, p.aim.x), dx = Math.cos(a), dy = Math.sin(a), ox = p.cx + dx * 8, oy = p.cy - 2 + dy * 8;
  st.ki -= E.ki; p.elemCd = E.cd; p.face = { x: dx, y: dy };
  if (act.id === 'ice') {
    sc.audio.sfx('freeze');
    sc.world.add(new Projectile({ x: ox, y: oy, vx: dx * 230, vy: dy * 230, r: 4, dmg: 24, team: 'player', kind: 'ice', life: 0.8, col: '#9ae0ff', kb: 60, owner: p, status: { freeze: 2.2, slow: 3 }, elem: 'ice' }));
    freezeAhead(sc, p, dx, dy);
  } else if (act.id === 'water') {
    sc.audio.sfx('splash') || sc.audio.sfx('dash');
    sc.world.add(new Projectile({ x: ox, y: oy, vx: dx * 190, vy: dy * 190, r: 4, dmg: 12, team: 'player', kind: 'water', life: 0.9, col: '#5aa8ff', kb: 80, owner: p, splash: { r: 28, dmg: 10, status: { wet: 8 } }, elem: 'water' }));
  } else if (act.id === 'lightning') lightning(sc, p, a);
  return true;
}

// Solidifica temporaneamente l'acqua davanti al giocatore (ponte di ghiaccio), ma mai oltre un regno ancora sigillato.
function freezeAhead(sc, p, dx, dy) {
  const m = sc.map;
  for (let d = 1; d <= 3; d++) {
    const tx = Math.floor((p.cx + dx * d * TS) / TS), ty = Math.floor((p.cy + dy * d * TS) / TS);
    if (!DEFS[m.g(tx, ty)].liquid) continue;
    let ok = true;
    for (let j = -2; j <= 2 && ok; j++) for (let i = -2; i <= 2; i++) { const k = (ty + j) * m.w + tx + i; if (m.realm && m.inb(tx + i, ty + j) && REALM_TIER[m.realm[k]] > 0 && !TileMap.openRealms.has(m.realm[k])) { ok = false; break; } }
    if (!ok) { sc.floatText(tx * TS + 8, ty * TS, 'Il gelo non attecchisce', '#9ab8d0'); return; }
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const x = tx + i, y = ty + j; if (!m.inb(x, y)) continue;
      const g0 = m.g(x, y); if (!DEFS[g0].liquid || DEFS[g0].liquid === 'lava') continue;
      m.setG(x, y, T.ICE); sc.spark(x * TS + 8, y * TS + 8, '#e0f6ff', 3);
      (sc.melt ||= []).push({ x, y, g: g0, t: sc.time + 28 });
    }
    sc.toast('L\'acqua si fa ghiaccio… per un po\'.'); return;
  }
}

function lightning(sc, p, a) {
  sc.audio.sfx('zap');
  const foes = sc.world.enemies().filter((e) => !e.dead && !e.dormant);
  const cone = foes.filter((e) => { const dx = e.cx - p.cx, dy = e.cy - p.cy, d = Math.hypot(dx, dy); return d < 140 && Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - a), Math.cos(Math.atan2(dy, dx) - a))) < 0.7; }).sort((u, v) => Math.hypot(u.cx - p.cx, u.cy - p.cy) - Math.hypot(v.cx - p.cx, v.cy - p.cy));
  const pts = [[p.cx, p.cy - 2]];
  let cur = cone[0];
  if (!cur) { pts.push([p.cx + Math.cos(a) * 90, p.cy + Math.sin(a) * 90]); sc.hitBarriers(p.cx + Math.cos(a) * 20, p.cy + Math.sin(a) * 20, 24, 'lightning', 1); }
  const hit = new Set();
  for (let i = 0; cur && i < 4; i++) {
    hit.add(cur); const wet = cur.wetT > 0, dmg = (i === 0 ? 70 : 42) * (wet ? 1.6 : 1);
    pts.push([cur.cx, cur.cy - 4]);
    cur.hurt(dmg, p, { kb: 70, status: { para: wet ? 2.1 : 1.4 }, elem: 'lightning' });
    sc.spark(cur.cx, cur.cy, '#fff7a0', 8);
    const range = wet ? 80 : 52;
    cur = foes.filter((e) => !hit.has(e) && !e.dead && Math.hypot(e.cx - cur.cx, e.cy - cur.cy) < range).sort((u, v) => Math.hypot(u.cx - cur.cx, u.cy - cur.cy) - Math.hypot(v.cx - cur.cx, v.cy - cur.cy))[0];
  }
  const jag = []; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = 5; for (let k = 0; k < n; k++) jag.push([x0 + (x1 - x0) * k / n + (k ? (Math.random() - 0.5) * 8 : 0), y0 + (y1 - y0) * k / n + (k ? (Math.random() - 0.5) * 8 : 0)]); }
  jag.push(pts[pts.length - 1]);
  sc.addFx(0.22, (g, cx, cy, k) => { g.globalAlpha = 1 - k; g.strokeStyle = '#fff7a0'; g.lineWidth = 3; g.beginPath(); jag.forEach(([x, y], i) => (i ? g.lineTo(x - cx, y - cy) : g.moveTo(x - cx, y - cy))); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.stroke(); g.globalAlpha = 1; g.lineWidth = 1; });
  sc.shake(2);
}

export function updateMelt(sc) {
  if (!sc.melt || !sc.melt.length) return;
  const m = sc.map;
  const pl = sc.player, ptx = Math.floor(pl.cx / TS), pty = Math.floor(pl.cy / TS);
  for (const q of sc.melt) { if (sc.time >= q.t && !q.done) { if (Math.abs(ptx - q.x) <= 1 && Math.abs(pty - q.y) <= 1) { q.t = sc.time + 2; continue; } q.done = true; m.setG(q.x, q.y, q.g); } } // il gelo non cede finché ci sei sopra
  sc.melt = sc.melt.filter((q) => !q.done);
}
