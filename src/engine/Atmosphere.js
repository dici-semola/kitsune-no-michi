// Ciclo giorno/notte + meteo dinamico per bioma + illuminazione con luci dinamiche.
import { clamp, lerp, lerpRGB, rgba, pickWeighted } from '../core/Util.js';

export const WEATHER = {
  clear: { n: 'Sereno' },
  cloudy: { n: 'Nuvoloso', dark: 0.12, tint: [120, 130, 150, 0.1] },
  rain: { n: 'Pioggia', p: 'rain', cnt: 130, dark: 0.2, tint: [60, 80, 120, 0.12], fireMul: 0.6 },
  storm: { n: 'Tempesta', p: 'rain', cnt: 280, dark: 0.38, tint: [40, 50, 90, 0.18], wind: 90, light: 1, fireMul: 0.4, spd: -0.05 },
  fog: { n: 'Nebbia', fog: 0.38 },
  snow: { n: 'Nevicata', p: 'snow', cnt: 150, dark: 0.06, tint: [200, 220, 255, 0.08] },
  blizzard: { n: 'Bufera di neve', p: 'snow', cnt: 340, wind: 150, fog: 0.3, dark: 0.12, spd: -0.15 },
  sandstorm: { n: 'Tempesta di sabbia', p: 'sand', cnt: 260, wind: 220, fog: 0.35, tint: [200, 150, 80, 0.25], spd: -0.2 },
  aurora: { n: 'Aurora spirituale', tint: [90, 200, 180, 0.12] },
  ash: { n: 'Cenere ardente', p: 'ash', cnt: 110, tint: [120, 40, 20, 0.14] },
  neonrain: { n: 'Pioggia al neon', p: 'neon', cnt: 220, tint: [80, 20, 120, 0.14] },
  smog: { n: 'Smog', fog: 0.3, tint: [140, 60, 150, 0.16] },
  timestorm: { n: 'Tempesta temporale', p: 'glitch', cnt: 70, tint: [120, 60, 220, 0.14], light: 0.4 },
};

// pesi per bioma
export const BIOME_WEATHER = {
  meadow: { clear: 45, cloudy: 20, rain: 20, storm: 10, fog: 5 },
  forest: { clear: 28, fog: 30, rain: 25, storm: 15, cloudy: 5 },
  swamp: { fog: 50, rain: 30, storm: 10, clear: 10 },
  desert: { clear: 55, sandstorm: 35, cloudy: 10 },
  snow: { snow: 40, blizzard: 30, clear: 20, fog: 10 },
  canyon: { clear: 50, storm: 20, sandstorm: 20, cloudy: 10 },
  ocean: { clear: 30, storm: 35, rain: 20, fog: 15 },
  ancient: { clear: 25, fog: 35, rain: 25, storm: 15 }, enchanted: { clear: 40, fog: 40, rain: 20 }, haunted: { fog: 55, rain: 20, storm: 15, clear: 10 },
  volcano: { ash: 70, clear: 20, storm: 10 }, jade: { rain: 35, fog: 30, clear: 30, cloudy: 5 }, plateau: { clear: 50, cloudy: 25, rain: 15, storm: 10 },
  tundra: { snow: 35, blizzard: 35, clear: 20, fog: 10 }, dunes: { clear: 45, sandstorm: 45, cloudy: 10 }, badlands: { clear: 40, sandstorm: 25, storm: 25, cloudy: 10 },
  tropical: { clear: 35, rain: 30, storm: 25, fog: 10 }, mountain: { snow: 30, clear: 35, cloudy: 20, fog: 15 }, spirit: { aurora: 1 },
  ocean: { clear: 30, storm: 35, rain: 20, fog: 15 }, cave: { clear: 1 }, interior: { clear: 1 }, underwater: { clear: 1 },
  underworld: { ash: 1 },
  cyber: { neonrain: 60, smog: 25, clear: 15 },
  parallel: { timestorm: 70, clear: 30 },
  outdoor: { clear: 1 },
};

const KEYS = [
  [0, [12, 16, 48, 0.62]], [4.5, [12, 16, 48, 0.6]], [6, [255, 140, 90, 0.3]], [7.5, [255, 200, 150, 0.08]],
  [9, [255, 255, 255, 0]], [16.5, [255, 255, 255, 0]], [18, [255, 150, 80, 0.18]], [19.5, [255, 90, 70, 0.32]],
  [21, [18, 20, 64, 0.52]], [24, [12, 16, 48, 0.62]],
];
export function ambientAt(h) {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [h0, c0] = KEYS[i], [h1, c1] = KEYS[i + 1];
    if (h >= h0 && h <= h1) return lerpRGB(c0, c1, (h - h0) / (h1 - h0));
  }
  return KEYS[0][1];
}

export class Atmosphere {
  constructor() {
    this.minutes = 7 * 60;
    this.cur = 'clear'; this.next = 'clear'; this.k = 1; this.phase = 'hold'; this.t = 25;
    this.biome = 'meadow'; this.table = BIOME_WEATHER.meadow;
    this.parts = []; this.flash = 0; this.fixed = null; this.indoor = false; this.time = 0;
    this.dc = null;
  }
  get hour() { return this.minutes / 60; }

  setMap(map, biome) {
    this.indoor = map.type === 'interior';
    this.fixed = map.def.ambient || null;
    this.setBiome(biome, true);
  }
  // Blocca il meteo durante i boss (tempesta di sabbia, bufera...)
  lock(name) { this.cur = name; this.next = name; this.k = 1; this.phase = 'hold'; this.t = 1e9; this.locked = true; }
  unlock() { if (this.locked) { this.locked = false; this.t = 0; } }
  setBiome(b, force = false) {
    if (this.locked) return;
    if (b === this.biome && !force) return;
    this.biome = b;
    this.table = BIOME_WEATHER[b] || { clear: 1 };
    if (!(this.cur in this.table)) { this.phase = 'out'; this.next = this.roll(); }
  }
  roll() { return pickWeighted(Math.random, Object.entries(this.table)); }

  update(dt) {
    this.time += dt;
    this.minutes = (this.minutes + dt * 2) % 1440; // 1 s reale = 2 min di gioco (giorno ~12 min)
    if (this.phase === 'hold') {
      this.t -= dt;
      if (this.t <= 0) { this.next = this.roll(); if (this.next !== this.cur) this.phase = 'out'; else this.t = 40 + Math.random() * 80; }
    } else if (this.phase === 'out') {
      this.k -= dt * 0.35;
      if (this.k <= 0) { this.k = 0; this.cur = this.next; this.phase = 'in'; }
    } else {
      this.k += dt * 0.35;
      if (this.k >= 1) { this.k = 1; this.phase = 'hold'; this.t = 40 + Math.random() * 80; }
    }
    const wd = WEATHER[this.cur];
    // particelle: numero proporzionale all'intensità
    const want = wd.p && !this.indoor ? Math.floor(wd.cnt * this.k) : 0;
    while (this.parts.length < want) this.parts.push({ x: Math.random() * 520 - 20, y: Math.random() * 290 - 10, s: 0.6 + Math.random() * 0.8 });
    if (this.parts.length > want) this.parts.length = want;
    const wind = (wd.wind || 0);
    for (const p of this.parts) {
      switch (wd.p) {
        case 'rain': p.y += 260 * p.s * dt; p.x += wind * 0.6 * p.s * dt; break;
        case 'neon': p.y += 220 * p.s * dt; p.x -= 20 * dt; break;
        case 'snow': p.y += 28 * p.s * dt; p.x += (wind || 10) * p.s * dt + Math.sin(this.time * 2 + p.s * 9) * 0.3; break;
        case 'sand': p.x += wind * p.s * dt; p.y += 10 * dt; break;
        case 'ash': p.y -= 16 * p.s * dt; p.x += Math.sin(this.time + p.s * 7) * 10 * dt; break;
        case 'glitch': p.x += (Math.random() - 0.5) * 80 * dt; p.y += (Math.random() - 0.5) * 80 * dt; break;
      }
      if (p.y > 280) p.y = -8; if (p.y < -12) p.y = 280;
      if (p.x > 500) p.x = -20; if (p.x < -24) p.x = 500;
    }
    // fulmini
    if (wd.light && !this.indoor && Math.random() < wd.light * 0.25 * this.k * dt) this.flash = 1;
    this.flash = Math.max(0, this.flash - dt * 3);
  }

  // modificatori di gameplay
  fireMul() { const f = WEATHER[this.cur].fireMul; return f ? lerp(1, f, this.k) : 1; }
  speedMul() { const s = WEATHER[this.cur].spd; return s ? 1 + s * this.k : 1; }
  label() { return this.indoor ? '' : WEATHER[this.cur].n; }
  // nebbia notturna aggiuntiva nei biomi umidi/infestati
  nightFog(b) { return this.isNight() && ['swamp', 'haunted', 'ancient', 'enchanted', 'jade', 'tropical'].includes(b) ? 0.2 : 0; }
  isNight() { const h = this.hour; return h >= 21 || h < 5.5; }

  render(g, W, H, lights = []) {
    const wd = WEATHER[this.cur], k = this.k;
    let amb = this.fixed || (this.indoor ? [255, 210, 150, 0.1] : ambientAt(this.hour));
    if (!this.indoor) {
      if (wd.tint) { g.fillStyle = rgba(wd.tint, wd.tint[3] * k); g.fillRect(0, 0, W, H); }
      if (wd.fog) {
        const a = wd.fog * k;
        g.fillStyle = `rgba(205,212,225,${a * 0.55})`; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 3; i++) { const x = ((this.time * 8 * (i + 1)) % (W + 200)) - 200; g.fillStyle = `rgba(230,235,245,${a * 0.25})`; g.fillRect(x, 40 + i * 70, 260, 50); }
      }
      this.drawParticles(g, wd, k);
      const nf = this.nightFog(this.biome);
      if (nf) { g.fillStyle = `rgba(150,170,200,${nf * 0.5})`; g.fillRect(0, 0, W, H); for (let i = 0; i < 3; i++) { const x = ((this.time * 6 * (i + 1)) % (W + 240)) - 240; g.fillStyle = `rgba(190,205,225,${nf * 0.35})`; g.fillRect(x, 20 + i * 80, 280, 56); } }
    }
    const alpha = clamp(amb[3] + (this.indoor || this.fixed ? 0 : (wd.dark || 0) * k), 0, 0.88);
    if (alpha > 0.02) {
      if (!this.dc) { this.dc = document.createElement('canvas'); this.dc.width = W; this.dc.height = H; }
      const d = this.dc.getContext('2d');
      d.globalCompositeOperation = 'source-over';
      d.clearRect(0, 0, W, H);
      d.fillStyle = rgba(amb, alpha); d.fillRect(0, 0, W, H);
      d.globalCompositeOperation = 'destination-out';
      for (const l of lights) {
        const gr = d.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.r);
        gr.addColorStop(0, 'rgba(0,0,0,0.95)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        d.fillStyle = gr; d.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      }
      g.drawImage(this.dc, 0, 0);
      // bagliore colorato additivo sulle luci
      g.globalCompositeOperation = 'lighter';
      for (const l of lights) {
        if (!l.c) continue;
        const gr = g.createRadialGradient(l.x, l.y, 1, l.x, l.y, l.r * 0.9);
        gr.addColorStop(0, `rgba(${l.c},${0.22 * clamp(alpha * 1.6, 0.2, 1)})`); gr.addColorStop(1, `rgba(${l.c},0)`);
        g.fillStyle = gr; g.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      }
      g.globalCompositeOperation = 'source-over';
    }
    if (this.flash > 0) { g.fillStyle = `rgba(235,240,255,${this.flash * 0.55})`; g.fillRect(0, 0, W, H); }
  }

  drawParticles(g, wd, k) {
    if (!wd.p) return;
    const wind = wd.wind || 0;
    for (const p of this.parts) {
      switch (wd.p) {
        case 'rain': g.fillStyle = 'rgba(190,210,255,.55)'; g.fillRect(p.x, p.y, 1, 5); g.fillRect(p.x + (wind > 0 ? 1 : 0), p.y + 5, 1, 2); break;
        case 'neon': g.fillStyle = p.s > 1 ? 'rgba(255,63,164,.7)' : 'rgba(46,230,255,.7)'; g.fillRect(p.x, p.y, 1, 6); break;
        case 'snow': g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(p.x, p.y, p.s > 1 ? 2 : 1, p.s > 1 ? 2 : 1); break;
        case 'sand': g.fillStyle = 'rgba(224,180,100,.5)'; g.fillRect(p.x, p.y, 4, 1); break;
        case 'ash': g.fillStyle = p.s > 1 ? 'rgba(255,120,40,.8)' : 'rgba(90,80,80,.7)'; g.fillRect(p.x, p.y, 1, 1); break;
        case 'glitch': g.fillStyle = p.s > 1 ? 'rgba(76,240,255,.6)' : 'rgba(255,63,164,.5)'; g.fillRect(p.x, p.y, 6, 1); break;
      }
    }
  }
}
