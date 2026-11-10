import { Entity } from './Entity.js';
import { dist } from '../core/Util.js';

// Pericoli a terra creati da nemici e boss.
//  boom  : cerchio telegrafato che esplode dopo `delay`
//  beam  : raggio rettilineo (len x w) telegrafato, colpisce dopo `delay`
//  fire / poison / ice : pozze persistenti (danno, veleno, rallentamento)
//  pull  : vortice che attira il giocatore verso il centro
//  wind  : raffica che spinge il giocatore nella direzione `ang`
export class Hazard extends Entity {
  constructor(o) {
    super(o.x - 2, o.y - 2, 4, 4);
    Object.assign(this, { kind: o.kind, px: o.x, py: o.y, r: o.r || 16, delay: o.delay || 0, life: o.life || 0.3, dmg: o.dmg || 0,
      ang: o.ang || 0, len: o.len || 0, wd: o.w || 8, col: o.col || '#ff4060', fired: false, acc: 0 });
    this.solid = false; this.isHazard = true;
  }
  get cx() { return this.px; }
  get cy() { return this.py; }
  get feetY() { return this.py - 40; } // disegnato sopra il terreno, sotto le entità

  hits(p) {
    if (this.kind === 'beam') {
      const dx = p.cx - this.px, dy = p.cy - this.py, c = Math.cos(this.ang), s = Math.sin(this.ang);
      const along = dx * c + dy * s, across = Math.abs(-dx * s + dy * c);
      return along > -4 && along < this.len && across < this.wd / 2 + 4;
    }
    return dist(p.cx, p.cy, this.px, this.py) < this.r + 4;
  }

  update(dt, sc) {
    this.t += dt;
    const p = this.world.player;
    if (!p || p.dead) return;
    const active = this.t >= this.delay;
    switch (this.kind) {
      case 'boom': case 'beam':
        if (active && !this.fired) {
          this.fired = true;
          if (this.hits(p)) p.hurt(this.dmg, { cx: this.px, cy: this.py });
          sc.spark(this.px, this.py, this.col, this.kind === 'boom' ? 10 : 4);
          if (this.kind === 'boom') { sc.ring(this.px, this.py, this.r, this.col); sc.audio.sfx('explode'); } else sc.audio.sfx('zap');
          sc.shake(2);
        }
        if (this.t > this.delay + 0.25) this.dead = true;
        break;
      case 'fire': case 'poison': case 'ice':
        if (!active) break;
        this.acc += dt;
        if (this.acc >= 0.4 && this.hits(p)) {
          this.acc = 0;
          if (this.kind === 'fire') p.hurt(this.dmg || 4, { cx: this.px, cy: this.py });
          else if (this.kind === 'poison') p.debuff('poison', 3, this.dmg || 3);
          else p.debuff('slow', 1.2);
        }
        if (this.t > this.delay + this.life) this.dead = true;
        break;
      case 'pull':
        if (!active) break;
        if (this.hits(p)) { const d = dist(p.cx, p.cy, this.px, this.py) || 1; p.shove(this.px - p.cx, this.py - p.cy, 70); if (d < 14) { this.acc += dt; if (this.acc > 0.5) { this.acc = 0; p.hurt(this.dmg, { cx: this.px, cy: this.py }); } } }
        if (this.t > this.delay + this.life) this.dead = true;
        break;
      case 'wind':
        if (active) p.shove(Math.cos(this.ang), Math.sin(this.ang), 95);
        if (this.t > this.delay + this.life) this.dead = true;
        break;
    }
  }

  draw(g, cx, cy) {
    const x = Math.round(this.px - cx), y = Math.round(this.py - cy), warn = this.t < this.delay;
    const pulse = 0.5 + 0.5 * Math.sin(this.t * 24);
    switch (this.kind) {
      case 'boom': {
        if (warn) { g.fillStyle = `rgba(255,50,70,${0.15 + 0.2 * pulse})`; g.beginPath(); g.arc(x, y, this.r, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(255,120,130,.8)'; g.beginPath(); g.arc(x, y, this.r * Math.min(1, this.t / this.delay), 0, 6.283); g.stroke(); }
        else { g.fillStyle = this.col; g.globalAlpha = 0.6; g.beginPath(); g.arc(x, y, this.r, 0, 6.283); g.fill(); g.globalAlpha = 1; }
        break;
      }
      case 'beam': {
        g.save(); g.translate(x, y); g.rotate(this.ang);
        if (warn) { g.fillStyle = `rgba(255,60,90,${0.12 + 0.18 * pulse})`; g.fillRect(0, -this.wd / 2, this.len, this.wd); g.fillStyle = 'rgba(255,200,200,.6)'; g.fillRect(0, -0.5, this.len, 1); }
        else { g.fillStyle = this.col; g.fillRect(0, -this.wd / 2, this.len, this.wd); g.fillStyle = '#fff'; g.fillRect(0, -1, this.len, 2); }
        g.restore(); break;
      }
      case 'fire': case 'poison': case 'ice': {
        const kind = this.kind, grow = Math.min(1, Math.max(0, (this.t - this.delay) / 0.5)), fade = Math.min(1, Math.max(0, (this.delay + this.life - this.t) / 0.7)), tt = this.t;
        if (warn) {   // prima dell'impatto: la palla cade dall'alto, l'ombra a terra cresce
          const k = Math.min(1, this.t / (this.delay || 1)), fy = y - (1 - k) * (1 - k) * 80;
          g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x, y, this.r * 0.55 * k + 1, this.r * 0.3 * k + 1, 0, 0, 6.283); g.fill();
          const col = kind === 'fire' ? ['#ff5a14', '#ffb030', '#fff0a0'] : kind === 'poison' ? ['#4a9a2a', '#90d848', '#e0ff98'] : ['#7ac0f0', '#c8ecff', '#ffffff'];
          for (let i = 4; i >= 1; i--) { g.globalAlpha = 0.18 * (5 - i); g.fillStyle = col[0]; g.fillRect(Math.round(x - 2 + Math.sin(tt * 20 + i) * 1), Math.round(fy - 5 - i * 4), 4, 4); }
          g.globalAlpha = 1; g.fillStyle = '#14081a'; g.fillRect(Math.round(x - 4), Math.round(fy - 5), 8, 8); g.fillStyle = col[0]; g.fillRect(Math.round(x - 3), Math.round(fy - 4), 6, 6); g.fillStyle = col[1]; g.fillRect(Math.round(x - 2), Math.round(fy - 3), 4, 4); g.fillStyle = col[2]; g.fillRect(Math.round(x - 1), Math.round(fy - 2), 2, 2);
          break;
        }
        const r = Math.max(2, this.r * grow);
        g.fillStyle = kind === 'fire' ? `rgba(24,10,6,${0.5 * fade})` : kind === 'poison' ? `rgba(40,90,30,${0.38 * fade})` : `rgba(200,240,255,${0.4 * fade})`; g.beginPath(); g.ellipse(x, y, r, r * 0.6, 0, 0, 6.283); g.fill();   // bruciatura / pozza / brina a terra
        if (kind === 'fire') {
          const n = Math.max(4, Math.round(r / 2.6));
          for (let i = 0; i < n; i++) {
            const a = (i / n) * 6.283 + this.px * 0.37, d = i % 3 === 0 ? 0.25 : 0.85, bx = Math.round(x + Math.cos(a) * r * d), by = Math.round(y + Math.sin(a) * r * 0.55 * d), h = Math.max(2, Math.round((6 + (i * 7) % 6) * grow * fade * (0.75 + 0.25 * Math.sin(tt * 13 + i * 2.3))));
            g.fillStyle = '#14081a'; g.fillRect(bx - 3, by - h - 1, 7, h + 2);
            g.fillStyle = '#d8340e'; g.fillRect(bx - 2, by - h, 5, h); g.fillStyle = '#ff8a1e'; g.fillRect(bx - 1, by - h + 1, 3, h - 1); g.fillStyle = '#ffe060'; g.fillRect(bx, by - h + 2, 1, Math.max(1, h - 3));
            if (h > 6) { g.fillStyle = '#ff6a1a'; g.fillRect(bx + (i & 1 ? 2 : -3), by - h + 2, 1, 2); }                                // lingua di fuoco laterale
            const e = (tt * 0.9 + i * 0.31) % 1; g.fillStyle = e < 0.5 ? '#ffd060' : '#ff7a30'; g.globalAlpha = (1 - e) * fade; g.fillRect(bx + Math.round(Math.sin(e * 9 + i) * 3), by - h - Math.round(e * 12), 1, 1); g.globalAlpha = 1;   // braci che salgono
          }
          g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y - 4, 2, x, y - 4, r * 1.5); gr.addColorStop(0, `rgba(255,140,40,${0.3 * fade})`); gr.addColorStop(1, 'rgba(255,100,20,0)'); g.fillStyle = gr; g.fillRect(x - r * 1.6, y - r * 1.6, r * 3.2, r * 3.2); g.restore();
        } else if (kind === 'poison') {
          for (let i = 0; i < 7; i++) { const e = (tt * 0.6 + i / 7) % 1, a = i * 2.4, bx = x + Math.cos(a) * r * 0.7 * ((i % 3) / 2 + 0.3), by = y + Math.sin(a) * r * 0.4 - e * 12; g.globalAlpha = (1 - e) * 0.8 * fade; g.strokeStyle = '#b8f070'; g.fillStyle = 'rgba(120,200,60,.5)'; g.beginPath(); g.arc(bx, by, 1 + e * 2.5, 0, 6.283); g.fill(); g.stroke(); g.globalAlpha = 1; }
        } else {
          const n = Math.max(4, Math.round(r / 3));
          for (let i = 0; i < n; i++) { const a = (i / n) * 6.283, bx = Math.round(x + Math.cos(a) * r * 0.8), by = Math.round(y + Math.sin(a) * r * 0.5), h = Math.round((5 + (i * 5) % 6) * grow * fade); g.fillStyle = '#14081a'; g.fillRect(bx - 2, by - h - 1, 5, h + 2); g.fillStyle = '#7ac0f0'; g.fillRect(bx - 1, by - h, 3, h); g.fillStyle = '#e8f8ff'; g.fillRect(bx - 1, by - h, 1, h); }   // cristalli di ghiaccio che spuntano
        }
        break;
      }
      case 'pull': {
        if (warn) break;
        g.strokeStyle = 'rgba(120,200,255,.7)';
        for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x, y, this.r * (1 - ((this.t * 1.2 + i / 3) % 1)), 0, 6.283); g.stroke(); }
        break;
      }
      case 'wind': {
        if (warn) break;
        g.fillStyle = 'rgba(220,240,255,.7)';
        for (let i = 0; i < 6; i++) { const k = (this.t * 3 + i / 6) % 1; g.fillRect(x + Math.cos(this.ang) * (k * 120 - 60) + (i - 3) * 8, y + Math.sin(this.ang) * (k * 120 - 60) + (i % 3) * 10 - 10, 7, 1); }
        break;
      }
    }
  }
}
