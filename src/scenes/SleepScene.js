import { W, H } from '../core/Game.js';
import { text } from '../engine/UI.js';
import { drawPlayerSprite } from '../engine/Sprites.js';
import { T } from '../data/tiles.js';
import { TS } from '../core/Util.js';

// Riposo in locanda: il protagonista va al letto, si corica, la scena si oscura, la notte passa (luna e stelle, il cielo cambia),
// arriva l'alba e il personaggio si risveglia riposato. Non interrompibile: l'input viene ignorato (solo la scena in cima riceve update).
// Gli effetti funzionali (salute, ki, buff, contatore morti, orario, salvataggio) sono quelli di WorldScene.applyRest(), applicati a schermo scuro.
const WALK = 2.0, LIE = 1.0, NIGHT = 5.2, DAWN = 3.6, WAKE = 2.2;
const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const SKY = [[8, 10, 30], [14, 16, 54], [58, 36, 92], [214, 108, 92], [255, 196, 120], [250, 232, 190]]; // notte → alba → mattino
const skyAt = (k) => { const f = Math.max(0, Math.min(0.9999, k)) * (SKY.length - 1), i = Math.floor(f); return mix(SKY[i], SKY[i + 1], f - i); };

export class SleepScene {
  constructor(o) {
    this.o = o; this.overlay = true; this.t = 0; this.rested = false; this.stars = Array.from({ length: 34 }, (_, i) => ({ x: (i * 53) % 112 + 4, y: (i * 29) % 56 + 4, p: i * 1.7 }));
  }
  enter() {
    const sc = this.o.sc, p = sc.player; this.start = { x: p.x, y: p.y };
    // letto più vicino (se c'è); altrimenti il personaggio si corica sul posto
    let best = null, bd = 1e9; const m = sc.map, tx = Math.floor(p.cx / TS), ty = Math.floor(p.cy / TS);
    for (let y = ty - 9; y <= ty + 9; y++) for (let x = tx - 9; x <= tx + 9; x++) if (m.inb(x, y) && m.obj[y * m.w + x] === T.BED) { const d = (x - tx) ** 2 + (y - ty) ** 2; if (d < bd) { bd = d; best = { x: x * TS + 3, y: y * TS + 4 }; } }
    this.bed = best; this.walk = best ? WALK : 0.5; p.guard = false; p.dash = null; p.dodge = null; p.drawing = false;
    this.total = this.walk + LIE + NIGHT + DAWN + WAKE;
    this.game.audio.play('hinomura_night'); this.game.audio.sfx('select');
  }
  update(dt) {
    this.t += dt;
    const sc = this.o.sc, p = sc.player, t = this.t, a = this.walk;
    p.vx = p.vy = 0; p.kbx = p.kby = 0;
    if (t < a) { // avvicinamento al letto
      const k = Math.min(1, t / a), e = k * k * (3 - 2 * k); if (this.bed) { p.x = this.start.x + (this.bed.x - this.start.x) * e; p.y = this.start.y + (this.bed.y - this.start.y) * e; p.walk += dt * 9; const dx = this.bed.x - this.start.x, dy = this.bed.y - this.start.y; p.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); }
    }
    if (!this.rested && t > a + LIE + 1.6) { this.rested = true; this.o.applyRest(); this.game.audio.sfx('shrine'); }       // effetti del riposo a schermo scuro
    if (t > a + LIE + NIGHT + 0.5 && !this.dawned) { this.dawned = true; this.game.audio.sfx('levelup'); this.game.audio.setAmb('birds'); }
    if (t >= this.total) { if (this.bed) { p.x = this.start.x; p.y = this.start.y; } this.o.onWake && this.o.onWake(); this.game.scenes.pop(); }
  }
  render(g) {
    const sc = this.o.sc, p = sc.player, t = this.t, a = this.walk;
    const t1 = a + LIE, t2 = t1 + NIGHT, t3 = t2 + DAWN;
    // buio: sale mentre ci si corica, resta nella notte, si dirada con l'alba
    let dark = t < a ? 0 : t < t1 ? (t - a) / LIE * 0.5 : t < t1 + 1.4 ? 0.5 + (t - t1) / 1.4 * 0.5 : t < t2 ? 1 : t < t3 ? 1 - (t - t2) / DAWN * 0.55 : Math.max(0, 0.45 - (t - t3) / WAKE * 0.45);
    // la scena sotto (letto e stanza) resta visibile solo all'inizio e alla fine
    const sky = skyAt(t < t2 - 0.2 ? 0 : (t - (t2 - 0.2)) / (DAWN + 0.4));
    const bg = t < t2 ? [4, 4, 14] : mix([4, 4, 14], mix(sky, [90, 56, 40], 0.45), Math.min(1, (t - t2) / DAWN));
    g.fillStyle = `rgba(${bg[0]},${bg[1]},${bg[2]},${Math.min(1, dark)})`; g.fillRect(0, 0, W, H);
    if (t > t1 && t < t3 + 0.6) { // finestra sul cielo: notte stellata, luna che scende, alba che sale
      const wx = W / 2 - 60, wy = 44, ww = 120, wh = 68, al = Math.min(1, (t - t1) / 1.2) * (t < t3 ? 1 : Math.max(0, 1 - (t - t3) / 0.6));
      g.save(); g.globalAlpha = al; g.fillStyle = `rgb(${sky[0]},${sky[1]},${sky[2]})`; g.fillRect(wx, wy, ww, wh);
      const dawnK = Math.max(0, (t - t2) / DAWN);
      for (const s of this.stars) { const tw = 0.5 + 0.5 * Math.sin(t * 3 + s.p); g.fillStyle = `rgba(255,255,230,${(1 - dawnK * 1.4) * tw})`; if (dawnK < 0.7) g.fillRect(wx + s.x, wy + s.y, 1, 1); }
      const my = wy + 10 + ((t - t1) / (NIGHT + DAWN)) * 52; g.fillStyle = `rgba(240,240,255,${1 - dawnK * 0.9})`; g.beginPath(); g.arc(wx + 84, my, 7, 0, 6.283); g.fill(); g.fillStyle = `rgb(${sky[0]},${sky[1]},${sky[2]})`; g.beginPath(); g.arc(wx + 87, my - 1, 6, 0, 6.283); g.fill();
      if (dawnK > 0) { const gr = g.createRadialGradient(wx + 30, wy + wh, 2, wx + 30, wy + wh, 60 * dawnK + 6); gr.addColorStop(0, `rgba(255,220,140,${0.9 * dawnK})`); gr.addColorStop(1, 'rgba(255,160,90,0)'); g.fillStyle = gr; g.fillRect(wx, wy, ww, wh); }
      g.strokeStyle = '#3a2a1a'; g.lineWidth = 3; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke(); g.lineWidth = 1;
      g.restore();
    }
    // il protagonista: si avvicina, si corica, dorme (zZ), si desta e si alza
    const px = Math.round(p.cx - sc.cam.x), py = Math.round(p.feetY - sc.cam.y);
    if (t >= t1 - LIE * 0.2 && t < t3 + WAKE) {
      const lie = Math.min(1, (t - (a)) / (LIE * 0.8)), rise = t > t3 ? Math.min(1, (t - t3) / (WAKE * 0.7)) : 0, ang = -Math.PI / 2 * lie * (1 - rise) + Math.sin(t * 1.4) * 0.02 * lie * (1 - rise);
      if (dark < 0.98 || t > t2) { g.save(); g.translate(px, py - 2); g.rotate(ang); g.globalAlpha = Math.max(0, 1 - Math.max(0, dark - 0.55) * 2.2); drawPlayerSprite(g, 0, 0, sc.state.look, 0, 0); g.restore(); g.globalAlpha = 1; }
      if (t > t1 && t < t2 && Math.floor(t * 1.6) % 2 === 0) { text(g, 'z', px + 10, py - 30 - (t * 6) % 10, '#bcd'); text(g, 'Z', px + 15, py - 38 - (t * 6) % 10, '#cde', { font: 'bold 10px monospace' }); }
    }
    // didascalie
    const cap = (s, k) => { g.globalAlpha = Math.max(0, Math.min(1, k)); text(g, s, W / 2, H - 46, '#e8e0f8', { align: 'center', font: '10px monospace' }); g.globalAlpha = 1; };
    if (t > t1 + 0.6 && t < t2 - 0.4) cap('La notte scende sulla locanda...', Math.min((t - t1 - 0.6) / 0.8, (t2 - 0.4 - t) / 0.8));
    else if (t > t2 && t < t3) cap('Un nuovo giorno sta per cominciare.', Math.min((t - t2) / 0.8, (t3 - t) / 0.8));
    else if (t > t3 && t < t3 + WAKE) cap(this.rested ? 'Ti senti riposato.' : '', Math.min((t - t3) / 0.6, (t3 + WAKE - t) / 0.6));
    // luce dorata dell'alba sul risveglio
    if (t > t2 + DAWN * 0.6) { const k = Math.min(1, (t - t2 - DAWN * 0.6) / (DAWN * 0.4 + WAKE)), f = t > t3 ? Math.max(0, 1 - (t - t3) / WAKE) : 1; g.fillStyle = `rgba(255,214,150,${0.22 * k * f})`; g.fillRect(0, 0, W, H); }
  }
}
