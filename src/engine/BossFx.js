// Effetti mistici alla sconfitta di un boss. Il tema dipende dall'ambiente e dalla natura del boss (ghiaccio, vulcano, mare, oscurità, mistico, cyber, sabbia, vento, palude).
// Leggero per i telefoni: al massimo ~90 particelle disegnate con fillRect, nessun filtro, nessuna texture; durata 4-6 secondi.
import { drawMonster } from './Sprites.js';
import { W, H } from '../core/Game.js';

export const BIOME_THEME = {
  snow: 'ice', tundra: 'ice', mountain: 'ice', volcano: 'volcano', underworld: 'dark', haunted: 'dark', cyber: 'cyber', underwater: 'sea', ocean: 'sea',
  swamp: 'swamp', desert: 'sand', dunes: 'sand', badlands: 'sand', canyon: 'wind', plateau: 'wind', parallel: 'mystic', jade: 'mystic', enchanted: 'mystic',
};
const ID_THEME = { regina_tsurara: 'ice', titano_ghiaccio: 'ice', drago_ignis: 'volcano', ryujin: 'sea', kamios: 'cyber', enma: 'dark', mugenkai: 'dark', cavaliere_nero: 'dark', re_non_morto: 'dark', kraken_scorpione: 'sea', yatsuhashi: 'swamp', sfinge: 'sand', tengu: 'wind', drago_giada: 'mystic', faraone_sepolto: 'sand' };
export function bossTheme(id, def, map) { return ID_THEME[id] || BIOME_THEME[map && map.biome] || BIOME_THEME[map && map.def && map.def.biome] || (def && def.shape === 'dragon' ? 'volcano' : 'mystic'); }

const PAL = {
  ice: { a: ['#e8fbff', '#9fe4ff', '#5ac0f0', '#ffffff'], tint: [150, 220, 255], ring: '#bff4ff', sfx: 'freeze' },
  volcano: { a: ['#ffe070', '#ff9030', '#ff4a18', '#ffd0a0'], tint: [255, 110, 30], ring: '#ff8a30', sfx: 'fire' },
  mystic: { a: ['#fff6c0', '#d8b8ff', '#9ad0ff', '#ffffff'], tint: [230, 210, 255], ring: '#e8d0ff', sfx: 'shrine' },
  sea: { a: ['#b8fff0', '#5ae0e0', '#3a9ae0', '#e8ffff'], tint: [40, 170, 190], ring: '#7af0ff', sfx: 'splash' },
  dark: { a: ['#c06aff', '#7a2ab0', '#3a1050', '#ff4a6a'], tint: [20, 4, 36], ring: '#a050e0', sfx: 'black' },
  cyber: { a: ['#2ee6ff', '#ff3fa4', '#ffffff', '#7a5aff'], tint: [60, 20, 120], ring: '#2ee6ff', sfx: 'zap' },
  sand: { a: ['#ffe9a0', '#e8b858', '#fff6d0', '#c8883a'], tint: [240, 190, 100], ring: '#ffd878', sfx: 'warp' },
  wind: { a: ['#ffffff', '#d8e8f0', '#b8c8a0', '#f0f4f8'], tint: [220, 230, 240], ring: '#e8f4ff', sfx: 'warp' },
  swamp: { a: ['#a0ff90', '#60c060', '#e0ffd0', '#406a40'], tint: [80, 150, 80], ring: '#90ff90', sfx: 'splash' },
};
const rnd = (a, b) => a + Math.random() * (b - a);

export class BossFx {
  constructor(sc, e) {
    this.theme = bossTheme(e.id, e.def, sc.map); this.P = PAL[this.theme]; this.final = !!e.def.final;
    this.x = e.cx; this.y = e.cy; this.t = 0; this.life = this.final ? 6.4 : 4.4; this.ps = []; this.rings = 0; this.spawnT = 0;
    this.ghost = { shape: e.def.shape, col: e.def.col, size: e.def.size || 1, vis: e.def.vis, face: e.face && e.face.x < 0 ? 2 : 0 };
    sc.audio.sfx(this.P.sfx); if (this.final) sc.audio.sfx('rebirth');
  }
  get done() { return this.t >= this.life; }
  emit(n) {
    const T = this.theme, c = this.P.a, cap = 90;
    for (let i = 0; i < n && this.ps.length < cap; i++) {
      const col = c[(Math.random() * c.length) | 0], a = Math.random() * 6.283, sz = this.ghost.size, o = { x: this.x + rnd(-8, 8) * sz, y: this.y + rnd(-14, 6) * sz, life: rnd(1.2, 2.4), t: 0, col, s: Math.random() < 0.3 ? 2 : 1, vx: 0, vy: 0, k: T };
      if (T === 'ice') { o.vx = Math.cos(a) * rnd(20, 70); o.vy = Math.sin(a) * rnd(20, 60) - 20; o.g = 70; o.s = Math.random() < 0.5 ? 3 : 2; }                  // schegge di cristallo che ricadono
      else if (T === 'volcano') { o.vx = rnd(-26, 26); o.vy = -rnd(30, 90); o.g = -10; o.s = Math.random() < 0.4 ? 2 : 1; }                              // braci che salgono
      else if (T === 'sea') { o.vx = rnd(-12, 12); o.vy = -rnd(20, 60); o.s = 2; o.r = true; }                                                            // bolle
      else if (T === 'dark') { o.vx = rnd(-18, 18); o.vy = -rnd(10, 50); o.life = rnd(1.6, 3); }                                                          // dissoluzione in particelle
      else if (T === 'cyber') { o.x += rnd(-16, 16); o.vx = 0; o.vy = 0; o.life = rnd(0.2, 0.7); o.w = (Math.random() * 8 + 3) | 0; }                      // blocchi glitch
      else if (T === 'sand') { o.vx = Math.cos(a) * rnd(20, 50); o.vy = Math.sin(a) * 20 - 10; o.sw = a; }                                                // sabbia vorticante
      else if (T === 'wind') { o.vx = rnd(40, 110) * (Math.random() < 0.5 ? -1 : 1); o.vy = rnd(-14, 14); o.w = 5; }                                      // raffiche
      else if (T === 'swamp') { o.vx = rnd(-10, 10); o.vy = -rnd(8, 30); o.s = 2; o.life = rnd(2, 3.2); }                                                // spore
      else { o.sw = a; o.rad = rnd(4, 14); o.vy = -rnd(25, 60); o.life = rnd(1.6, 2.8); }                                                                  // mistico: orbi che salgono a spirale
      this.ps.push(o);
    }
  }
  update(dt, sc) {
    this.t += dt; const k = this.t / this.life;
    this.spawnT -= dt; if (this.spawnT <= 0 && k < 0.78) { this.spawnT = 0.05; this.emit(this.final ? 4 : 2); }
    const nR = Math.floor(this.t / (this.final ? 0.8 : 0.7)); while (this.rings < nR && this.rings < 6) { sc.ring(this.x, this.y - 4, (this.final ? 110 : 70) + this.rings * 8, this.P.ring); this.rings++; }
    if (this.t < 0.2 && !this.shook) { this.shook = true; sc.shake(this.final ? 10 : 6); }
    for (const p of this.ps) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; if (p.sw !== undefined) { p.sw += dt * 3; p.x += Math.cos(p.sw) * (p.rad ? p.rad * dt * 3 : 30 * dt); } }
    this.ps = this.ps.filter((p) => p.t < p.life);
  }
  // nel mondo (sotto HUD e atmosfera): sagoma che si dissolve, particelle, aura
  draw(g, cx, cy) {
    const k = this.t / this.life, x = Math.round(this.x - cx), y = Math.round(this.y - cy), T = this.theme, c = this.P.a;
    // aura / bagliore del punto di sconfitta
    const R = (24 + 60 * Math.sin(Math.min(1, k * 1.6) * Math.PI)) * (this.ghost.size > 1.6 ? 1.5 : 1), gr = g.createRadialGradient(x, y - 6, 2, x, y - 6, R);
    gr.addColorStop(0, `rgba(${this.P.tint[0]},${this.P.tint[1]},${this.P.tint[2]},${0.5 * (1 - k)})`); gr.addColorStop(1, `rgba(${this.P.tint[0]},${this.P.tint[1]},${this.P.tint[2]},0)`);
    g.fillStyle = gr; g.fillRect(x - R, y - R - 6, R * 2, R * 2);
    // dissoluzione: la sagoma si sbriciola a fasce orizzontali dall'alto verso il basso
    const rem = Math.max(0, 1 - this.t / 1.8);
    if (rem > 0) {
      const sz = this.ghost.size, top = y - 26 * sz, hh = 30 * sz, N = 14;
      for (let i = 0; i < N; i++) {
        const h = Math.sin(i * 12.9898 + Math.floor(this.t * 14) * 3.1) * 43758.5453; if ((h - Math.floor(h)) > rem + (i / N) * 0.1 - (T === 'dark' ? 0 : 0)) continue;
        const sx = (T === 'cyber' ? (Math.random() - 0.5) * 6 : 0);
        g.save(); g.beginPath(); g.rect(x - 40 * sz + sx, top + (hh / N) * i, 80 * sz, hh / N + 0.5); g.clip(); g.globalAlpha = Math.min(1, rem + 0.2);
        drawMonster(g, x, y, this.ghost.shape, this.ghost.col, 0, { size: sz, dir: this.ghost.face, vis: this.ghost.vis, flash: true }); g.restore();
      }
    }
    // temi con elementi propri
    if (T === 'sea') { g.strokeStyle = `rgba(190,255,255,${0.5 * (1 - k)})`; for (let i = 0; i < 3; i++) { const r = 10 + ((this.t * 40 + i * 24) % 70); g.beginPath(); g.ellipse(x, y, r, r * 0.45, this.t * 2 + i, 0.3, 5.5); g.stroke(); } }
    if (T === 'volcano') { g.strokeStyle = `rgba(255,140,50,${0.45 * (1 - k)})`; for (let i = 0; i < 3; i++) { const r = ((this.t * 60 + i * 30) % 90); g.beginPath(); g.arc(x, y - 4, r, 0, 6.283); g.stroke(); } }
    if (T === 'ice') { g.strokeStyle = `rgba(220,250,255,${0.7 * (1 - k)})`; for (let i = 0; i < 6; i++) { const a = i * 1.047 + this.t, r = 8 + this.t * 28; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + Math.cos(a) * r, y - 6 + Math.sin(a) * r); g.stroke(); } }
    if (T === 'mystic') { g.fillStyle = `rgba(255,250,210,${0.3 * (1 - k)})`; g.fillRect(x - 3, y - 120, 6, 120); g.fillRect(x - 9, y - 90, 18, 90); }
    if (T === 'cyber') { for (let i = 0; i < 5; i++) { g.fillStyle = i & 1 ? 'rgba(46,230,255,.5)' : 'rgba(255,63,164,.5)'; g.fillRect(x - 36 + Math.random() * 72, y - 30 + Math.random() * 40, rnd(8, 30), 1); } }
    for (const p of this.ps) {
      const a = 1 - p.t / p.life, X = Math.round(p.x - cx), Y = Math.round(p.y - cy); g.globalAlpha = Math.max(0, a);
      g.fillStyle = p.col;
      if (p.k === 'cyber') g.fillRect(X, Y, p.w, 2); else if (p.k === 'wind') { g.fillRect(X, Y, p.w, 1); } else if (p.r) { g.strokeStyle = p.col; g.strokeRect(X, Y, p.s + 1, p.s + 1); } else g.fillRect(X, Y, p.s, p.s);
    }
    g.globalAlpha = 1;
  }
  // sullo schermo (sopra l'atmosfera): variazione temporanea della luce
  drawScreen(g) {
    const k = this.t / this.life, T = this.theme, c = this.P.tint;
    const pulse = Math.sin(Math.min(1, k * 1.25) * Math.PI);
    let a = (T === 'dark' ? 0.55 : T === 'cyber' ? 0.22 : 0.3) * pulse * (this.final ? 1.25 : 1);
    if (T === 'dark') { g.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`; g.fillRect(0, 0, W, H); const vg = g.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, W * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${0.5 * pulse})`); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
    else { g.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * 0.6})`; g.fillRect(0, 0, W, H); }
    if (this.t < 0.35) { g.fillStyle = `rgba(255,255,255,${0.7 * (1 - this.t / 0.35)})`; g.fillRect(0, 0, W, H); }       // lampo iniziale
    if (T === 'cyber' && Math.random() < 0.5 * pulse) { g.fillStyle = 'rgba(255,63,164,.18)'; g.fillRect(0, (Math.random() * H) | 0, W, 2 + (Math.random() * 8 | 0)); }
    if (T === 'sea') { g.fillStyle = `rgba(190,255,240,${0.1 * pulse})`; for (let i = 0; i < 4; i++) g.fillRect((i * 130 + this.t * 20) % W - 20, 0, 18, H); }       // raggi di luce subacquea
    if (T === 'volcano') { g.fillStyle = `rgba(255,120,40,${0.12 * pulse * (0.7 + 0.3 * Math.sin(this.t * 22))})`; g.fillRect(0, 0, W, H); }                     // onda di calore
  }
}
