import { ABILITY_DEFS } from '../data/abilities.js';
import { Projectile } from '../entities/Projectile.js';

// Logica delle tre abilità. Ognuna ritorna true se è stata effettivamente attivata.
const IMPL = {
  // 1) Scatto veloce verso il nemico, con colpo di katana all'arrivo.
  dash(p, sc, def) {
    let best = null, bs = 1e9;
    for (const e of sc.world.enemies()) {
      const dx = e.cx - p.cx, dy = e.cy - p.cy, d = Math.hypot(dx, dy);
      if (d > def.range || d < 6) continue;
      const dot = (dx * p.face.x + dy * p.face.y) / d; // preferisce i nemici davanti
      const score = d * (1.6 - dot);
      if (dot > -0.2 && score < bs) { bs = score; best = e; }
    }
    let dx, dy, dist;
    if (best) {
      const vx = best.cx - p.cx, vy = best.cy - p.cy, d = Math.hypot(vx, vy);
      dx = vx / d; dy = vy / d; dist = Math.max(0, d - 14);
    } else { dx = p.face.x; dy = p.face.y; dist = def.range * 0.55; }
    p.face = { x: dx, y: dy };
    p.startDash(dx, dy, dist, () => {
      const dmg = sc.state.atk * def.mult;
      sc.slash(p.cx + dx * 8, p.cy + dy * 8, Math.atan2(dy, dx), 26, Math.PI, true);
      for (const e of sc.world.enemies()) if (Math.hypot(e.cx - p.cx, e.cy - p.cy) < 28) e.hurt(dmg, p, { kb: 140, leap: true });
      p.dashChainT = 0.6; sc.shake(3);   // finestra per il fendente in scatto
    });
    return true;
  },

  // 2) Soffio di fuoco: ventaglio di fiamme a corto raggio. La pioggia lo indebolisce.
  fire(p, sc, def) {
    const mul = sc.atmo.fireMul() * (1 + sc.state.inv.bonus('fire'));
    const a0 = Math.atan2(p.face.y, p.face.x), n = 7;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i - (n - 1) / 2) * 0.13 + (Math.random() - 0.5) * 0.05, sp = 130 + Math.random() * 40;
      sc.world.add(new Projectile({
        x: p.cx + p.face.x * 6, y: p.cy - 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 4, life: 0.45,
        dmg: sc.state.atk * def.mult * mul, team: 'player', kind: 'fire', pierce: 99, burn: 2.5, owner: p, kb: 40,
      }));
    }
    sc.shake(1);
    return true;
  },

  // 3) Fiamma Nera: insegue il nemico per 5 secondi finché non lo colpisce.
  black(p, sc, def) {
    const t = sc.world.nearest(p.cx, p.cy, 220, (e) => e.isEnemy && !e.dead && !e.dormant);
    if (!t) { sc.toast('Nessun nemico a portata.'); return false; }
    const a = Math.atan2(t.cy - p.cy, t.cx - p.cx);
    sc.world.add(new Projectile({
      x: p.cx, y: p.cy - 4, vx: Math.cos(a - 1.2) * 70, vy: Math.sin(a - 1.2) * 70, r: 5, life: def.dur,
      dmg: sc.state.atk * def.mult, team: 'player', kind: 'black', pierce: 0, burn: 3, owner: p, kb: 120,
      homing: { target: t, turn: 6, max: 190 },
    }));
    return true;
  },
};

export class AbilitySystem {
  constructor() { this.cd = {}; }
  update(dt) { for (const k in this.cd) if (this.cd[k] > 0) this.cd[k] -= dt; }
  ratio(id) { const d = ABILITY_DEFS[id]; return Math.max(0, (this.cd[id] || 0) / d.cd); }
  tryUse(id, sc) {
    const st = sc.state, def = ABILITY_DEFS[id];
    if (!st.abilities.has(id)) { sc.toast(`${def.n}: ${def.hint}`); return false; }
    if ((this.cd[id] || 0) > 0 || sc.player.dash) return false;
    if (st.ki < def.ki) { sc.toast('Ki insufficiente.'); return false; }
    if (!IMPL[id](sc.player, sc, def)) return false;
    st.ki -= def.ki; this.cd[id] = def.cd;
    sc.audio.sfx(id);
    return true;
  }
}
