// Motore audio chiptune con Web Audio: 2 canali pulse, triangolo, noise + effetti sonori sintetizzati.
// Nessun file audio: tutto è generato a runtime. Parte dopo il primo input dell'utente (policy dei browser).
import { compile } from './tunes.js';

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const VOL = { lead: 0.085, bass: 0.13, arp: 0.04 };

export class Chip {
  constructor() {
    this.AC = globalThis.AudioContext || globalThis.webkitAudioContext || null;
    this.ctx = null; this.enabled = !!this.AC;
    this.music = true; this.fx = true;
    this.want = null; this.cur = null; this.sw = null; this.step = 0; this.next = 0;
    this.waves = {}; this.last = {};
    this.bindUnlock();
    try { const o = JSON.parse(localStorage.getItem('kitsune_audio') || '{}'); if (o.music === false) this.music = false; if (o.fx === false) this.fx = false; } catch { /* nessuna preferenza salvata */ }
  }
  save() { try { localStorage.setItem('kitsune_audio', JSON.stringify({ music: this.music, fx: this.fx })); } catch { /* ignora */ } }

  // Sblocco dell'audio. I browser mobile (iOS Safari in particolare) accettano la riproduzione solo se resume()/start()
  // partono dentro un gesto "vero" (touchend, click, keydown): per questo l'ascolto è registrato su più eventi e resta attivo
  // finché il contesto non è davvero in esecuzione, e ricomincia ogni volta che il sistema lo sospende o interrompe.
  bindUnlock() {
    if (this.bound || typeof document === 'undefined') return;
    this.bound = true;
    const go = () => this.unlock();
    for (const ev of ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'click', 'keydown', 'mousedown']) document.addEventListener(ev, go, { passive: true, capture: true });
    const wake = () => { if (document.visibilityState === 'visible') { this.next = 0; this.unlock(); } else this.pause(); };
    document.addEventListener('visibilitychange', wake);
    addEventListener('pageshow', wake); addEventListener('focus', wake); addEventListener('pagehide', () => this.pause());
  }
  // in background niente musica (e niente note accumulate): al ritorno il contesto riparte e la pianificazione si riallinea
  pause() { try { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); } catch { /* ignora */ } }
  unlock() {
    if (!this.AC) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* non supportato */ } // iOS: suona anche con il tasto silenzioso
    if (!this.ctx) {
      const c = (this.ctx = new this.AC({ latencyHint: 'interactive' }));
      c.onstatechange = () => { if (c.state !== 'running') this.next = 0; };
      this.master = c.createGain(); this.master.gain.value = 0.55; this.master.connect(c.destination);
      this.mg = c.createGain(); this.mg.gain.value = this.music ? 1 : 0; this.mg.connect(this.master);
      this.sg = c.createGain(); this.sg.gain.value = 0.9; this.sg.connect(this.master);
      const n = c.createBuffer(1, c.sampleRate, c.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = n;
      for (const [k, duty] of [['p50', 0.5], ['p25', 0.25], ['p12', 0.125]]) { // onde pulse a duty variabile
        const re = new Float32Array(33), im = new Float32Array(33);
        for (let h = 1; h < 33; h++) im[h] = (2 / (h * Math.PI)) * Math.sin(h * Math.PI * duty);
        this.waves[k] = c.createPeriodicWave(re, im);
      }
    }
    const c = this.ctx;
    if (c.state !== 'running' && !(typeof document !== 'undefined' && document.visibilityState === 'hidden')) {
      const r = c.resume(); if (r && r.catch) r.catch(() => {});
      if (!this.primed) { // buffer silenzioso: su iOS completa lo sblocco nello stesso gesto
        try { const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); this.primed = true; } catch { /* ignora */ }
      }
    }
  }
  get ready() { return !!this.ctx && this.ctx.state === 'running'; }

  toggleMusic() { this.music = !this.music; this.save(); if (this.mg) this.mg.gain.setTargetAtTime(this.music ? 1 : 0, this.ctx.currentTime, 0.05); return this.music; }
  toggleFx() { this.fx = !this.fx; this.save(); return this.fx; }
  toggleAll() { const on = !(this.music || this.fx); this.music = this.fx = on; this.save(); if (this.mg) this.mg.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05); return on; }

  play(name) { this.want = name; }
  setAmb(kind) { this.amb = kind; }

  // chiamato a ogni tick: pianifica le note con ~200ms di anticipo
  update() {
    if (!this.ready) return;
    const c = this.ctx, now = c.currentTime;
    if (this.want !== this.cur && !this.sw) {
      if (!this.cur) this.start(this.want, now + 0.05);
      else { this.sw = { name: this.want, at: now + 0.3 }; this.mg.gain.cancelScheduledValues(now); this.mg.gain.setTargetAtTime(0, now, 0.07); }
    }
    if (this.sw && now >= this.sw.at) { this.start(this.sw.name, now + 0.02); this.sw = null; }
    this.ambTick(now);
    if (!this.cur || !this.music) return;
    const t = compile(this.cur);
    if (!t) return;
    const sd = 60 / t.bpm / 4;
    if (this.next < now) this.next = now + 0.02; // dopo un blocco della scheda
    while (this.next < now + 0.2) {
      this.sched(t, this.step, this.next, sd);
      this.next += sd; this.step = (this.step + 1) % t.steps;
    }
  }
  start(name, at) {
    if (!name) { this.cur = null; return; }
    this.cur = name; this.step = 0; this.next = at;
    this.mg.gain.cancelScheduledValues(at - 0.01);
    this.mg.gain.setValueAtTime(this.music ? 1 : 0, at);
  }

  sched(t, step, time, sd) {
    for (const e of t.ev[step]) {
      if (e.ch === 'drum') { this.drum(e.d, time); continue; }
      const w = e.ch === 'lead' ? t.wave : e.ch === 'bass' ? 'tri' : 'p12';
      this.voice(w, mtof(e.m), time, e.len * sd, VOL[e.ch], this.mg);
    }
  }

  voice(wave, freq, time, dur, vol, dest, f1 = 0) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    if (this.waves[wave]) o.setPeriodicWave(this.waves[wave]);
    else o.type = wave === 'tri' ? 'triangle' : wave === 'saw' ? 'sawtooth' : wave === 'sine' ? 'sine' : 'square';
    o.frequency.setValueAtTime(freq, time);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, time + dur);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.006);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * 0.5), time + dur * 0.75);
    g.gain.linearRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(dest);
    o.start(time); o.stop(time + dur + 0.03);
  }
  noise(time, dur, vol, hp, dest, lp = 0) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf; f.type = lp ? 'bandpass' : 'highpass'; f.frequency.value = lp || hp;
    g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(0.0002, time + dur);
    s.connect(f); f.connect(g); g.connect(dest);
    s.start(time, Math.random() * 0.5); s.stop(time + dur + 0.02);
  }
  drum(d, time) {
    const dest = this.mg;
    if (d === 'k' || d === 'K') this.voice('sine', 150, time, 0.14, 0.32, dest, 45);
    if (d === 's' || d === 'S') { this.noise(time, 0.11, 0.2, 1500, dest); this.voice('tri', 220, time, 0.07, 0.1, dest, 120); }
    if (d === 'h' || d === 'K' || d === 'S') this.noise(time, 0.03, 0.07, 7000, dest);
    if (d === 'o') this.noise(time, 0.12, 0.07, 6000, dest);
  }

  // ---------------- suoni ambientali (grilli, civette, rane, vento, onde, gocce, ululati) ----------------
  ambTick(now) {
    if (!this.fx || !this.amb || now < (this.ambNext || 0)) return;
    const A = AMB[this.amb];
    this.ambNext = now + (A ? A(this) : 2);
  }

  // ---------------- effetti sonori ----------------
  tone(f0, f1, dur, wave = 'p50', vol = 0.18, delay = 0) { this.voice(wave, f0, this.ctx.currentTime + delay, dur, vol, this.sg, f1 || 0); }
  hiss(dur, vol, hp, delay = 0, bp = 0) { this.noise(this.ctx.currentTime + delay, dur, vol, hp, this.sg, bp); }
  arp(notes, step = 0.07, wave = 'p25', vol = 0.15, len = 0.1) { notes.forEach((m, i) => this.tone(mtof(m), 0, len, wave, vol, i * step)); }

  sfx(name, a = 0) {
    if (!this.fx || !this.ready) return;
    const now = this.ctx.currentTime;
    if (this.last[name] && now - this.last[name] < 0.04) return;
    this.last[name] = now;
    const S = SFX[name];
    if (S) S(this, a);
  }
}

export const SFX_NAMES = () => Object.keys(SFX);
const R = (a, b) => a + Math.random() * (b - a);
// ogni funzione emette un suono casuale e ritorna dopo quanti secondi proporne un altro
const AMB = {
  night: (c) => { if (Math.random() < 0.13) { c.tone(420, 360, 0.3, 'sine', 0.07); c.tone(400, 330, 0.4, 'sine', 0.06, 0.55); return R(4, 8); } for (let i = 0; i < 4; i++) c.tone(4300 + R(-100, 100), 4300, 0.045, 'sine', 0.018, i * 0.07); return R(0.5, 1.2); },
  birds: (c) => { const f = R(2000, 3600); for (let i = 0; i < 3; i++) c.tone(f + i * 150, f + R(-500, 700), 0.08, 'sine', 0.025, i * 0.1); return R(1.5, 4); },
  swamp: (c) => { c.tone(150, 110, 0.12, 'saw', 0.035); c.tone(160, 120, 0.1, 'saw', 0.03, 0.18); return R(1, 3.5); },
  wind: (c) => { c.hiss(R(1, 1.8), 0.03, 0, 0, R(350, 700)); return R(2, 4); },
  sea: (c) => { c.hiss(1.7, 0.035, 0, 0, 380); return R(2.5, 4.5); },
  cave: (c) => { c.tone(1300, 650, 0.09, 'sine', 0.045); return R(2, 5); },
  limbo: (c) => { const r = Math.random(); if (r < 0.3) { c.tone(70, 62, 1.6, 'sine', 0.07); c.tone(74, 66, 1.6, 'sine', 0.05, 0.1); } else if (r < 0.6) { c.hiss(1.6, 0.03, 0, 0, R(300, 800)); } else if (r < 0.8) { c.tone(R(500, 700), R(250, 350), 0.9, 'sine', 0.045); c.tone(R(520, 720), R(260, 360), 1.1, 'sine', 0.035, 0.4); } else { c.tone(1800, 900, 0.12, 'sine', 0.03); c.tone(2200, 1000, 0.1, 'sine', 0.025, 0.6); } return R(1.6, 4.5); },
  haunted: (c) => { if (Math.random() < 0.35) { c.tone(330, 560, 0.7, 'sine', 0.07); c.tone(560, 300, 0.9, 'sine', 0.06, 0.7); } else c.hiss(1.4, 0.025, 0, 0, 900); return R(4, 9); },
};
const SFX = {
  slash: (s) => { s.hiss(0.09, 0.18, 2500); s.tone(900, 300, 0.09, 'saw', 0.07); },
  slash2: (s) => { s.hiss(0.14, 0.22, 1800); s.tone(1100, 200, 0.14, 'saw', 0.09); s.tone(500, 900, 0.06, 'p25', 0.06, 0.1); },
  hit: (s) => { s.hiss(0.06, 0.2, 1200); s.tone(260, 90, 0.08, 'p50', 0.16); },
  hurt: (s) => { s.tone(330, 90, 0.22, 'p50', 0.2); s.hiss(0.12, 0.15, 800); },
  kill: (s) => { s.tone(420, 60, 0.28, 'saw', 0.14); s.hiss(0.18, 0.2, 600); },
  boss_kill: (s) => { s.tone(200, 40, 1.0, 'saw', 0.2); s.hiss(0.8, 0.25, 300); s.arp([60, 64, 67, 72, 76, 79], 0.1, 'p25', 0.14, 0.3); },
  dash: (s) => { s.hiss(0.16, 0.16, 1000, 0, 2500); s.tone(300, 1000, 0.13, 'p25', 0.1); },
  fire: (s) => { s.hiss(0.4, 0.22, 400, 0, 900); s.tone(140, 60, 0.4, 'saw', 0.1); },
  black: (s) => { s.tone(160, 55, 0.6, 'sine', 0.22); s.tone(420, 900, 0.35, 'p12', 0.08, 0.05); s.hiss(0.4, 0.1, 300, 0, 700); },
  shoot: (s) => { s.tone(700, 350, 0.1, 'p25', 0.08); },
  coin: (s) => { s.tone(1175, 0, 0.05, 'p50', 0.12); s.tone(1568, 0, 0.12, 'p50', 0.12, 0.05); },
  pickup: (s) => { s.arp([79, 83, 86], 0.05, 'p25', 0.12, 0.08); },
  levelup: (s) => { s.arp([72, 76, 79, 84, 79, 84, 88], 0.09, 'p25', 0.15, 0.14); },
  quest: (s) => { s.arp([67, 71, 74, 79], 0.1, 'p50', 0.13, 0.2); },
  select: (s) => { s.tone(660, 0, 0.035, 'p50', 0.09); },
  confirm: (s) => { s.tone(880, 0, 0.04, 'p50', 0.1); s.tone(1175, 0, 0.06, 'p50', 0.1, 0.04); },
  back: (s) => { s.tone(520, 380, 0.07, 'p50', 0.09); },
  blip: (s, f = 0) => { s.tone(300 + f * 90, 0, 0.03, 'p25', 0.06); },
  door: (s) => { s.tone(200, 320, 0.14, 'tri', 0.16); s.hiss(0.08, 0.1, 900); },
  stairs: (s) => { s.arp([60, 62, 64, 65, 67], 0.05, 'tri', 0.15, 0.06); },
  ding: (s) => { s.tone(1568, 0, 0.3, 'sine', 0.14); s.tone(2093, 0, 0.4, 'sine', 0.1, 0.12); },
  chest: (s) => { s.arp([62, 66, 69, 74, 78], 0.07, 'p25', 0.14, 0.12); },
  shrine: (s) => { s.tone(1046, 0, 0.7, 'sine', 0.13); s.tone(1568, 0, 0.7, 'sine', 0.1, 0.1); s.tone(2093, 0, 0.8, 'sine', 0.08, 0.2); },
  error: (s) => { s.tone(150, 0, 0.1, 'p50', 0.12); s.tone(130, 0, 0.14, 'p50', 0.12, 0.11); },
  mount: (s) => { s.tone(400, 800, 0.12, 'saw', 0.09); s.tone(800, 480, 0.18, 'saw', 0.09, 0.12); },
  boss: (s) => { s.tone(75, 55, 1.0, 'saw', 0.22); s.hiss(0.7, 0.18, 200, 0, 500); s.tone(150, 110, 0.8, 'p25', 0.08, 0.2); },
  death: (s) => { s.arp([64, 62, 60, 55, 52], 0.18, 'tri', 0.18, 0.3); },
  bow: (s) => { s.tone(700, 260, 0.1, 'p25', 0.1); s.hiss(0.06, 0.1, 2200); },
  parry: (s) => { s.tone(1900, 0, 0.12, 'sine', 0.14); s.tone(2600, 0, 0.18, 'sine', 0.1, 0.05); s.hiss(0.05, 0.12, 4000); },
  gbreak: (s) => { s.tone(700, 90, 0.35, 'saw', 0.18); s.hiss(0.25, 0.3, 900); s.tone(2400, 300, 0.2, 'sine', 0.12, 0.03); },
  block: (s) => { s.tone(220, 120, 0.09, 'p50', 0.14); s.hiss(0.05, 0.12, 1500); },
  zap: (s) => { s.tone(1500, 200, 0.15, 'saw', 0.1); s.hiss(0.12, 0.14, 3000); },
  rebirth: (s) => { s.tone(220, 880, 2.6, 'sine', 0.1); s.tone(330, 1320, 2.6, 'sine', 0.07, 0.3); s.arp([60, 64, 67, 72, 76, 79, 84], 0.45, 'p25', 0.08, 0.7); s.hiss(2.4, 0.05, 2000, 0.8); },
  splash: (s) => { s.hiss(0.2, 0.14, 800, 0, 1200); },
  roar: (s) => { s.tone(120, 70, 0.5, 'saw', 0.16); s.hiss(0.45, 0.14, 300, 0, 600); },
  warp: (s) => { s.tone(200, 1600, 0.3, 'p12', 0.1); s.tone(1600, 200, 0.3, 'p12', 0.08, 0.3); },
  freeze: (s) => { s.tone(2000, 900, 0.3, 'sine', 0.1); s.hiss(0.2, 0.08, 6000); },
  splash: (s) => { s.hiss(0.12, 0.2, 2400, 0, 1200); s.tone(520, 180, 0.12, 'sine', 0.1); },
  rockbreak: (s) => { s.hiss(0.35, 0.25, 500, 0, 900); s.tone(160, 50, 0.3, 'saw', 0.16); s.tone(90, 40, 0.4, 'p25', 0.12, 0.05); },
  crackle: (s) => { s.hiss(0.03, 0.05 + Math.random() * 0.04, 2500 + Math.random() * 2000, 0, 3500); if (Math.random() < 0.4) s.hiss(0.05, 0.04, 1800, 0.06, 2800); },
  clap: (s) => { s.hiss(0.05, 0.06 + Math.random() * 0.05, 1400 + Math.random() * 2500, 0, 2500); },
  cheer: (s) => { for (let i = 0; i < 6; i++) { s.hiss(0.7 + Math.random() * 0.5, 0.05, 0, i * 0.07, 600 + i * 220); s.tone(300 + i * 70 + Math.random() * 60, 480 + i * 60, 0.55, 'tri', 0.035, i * 0.05); } },
  explode: (s) => { s.hiss(0.4, 0.25, 200, 0, 500); s.tone(120, 40, 0.35, 'saw', 0.18); },
};
