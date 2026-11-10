// Sprite "alti": il tile ha una base di 16x16 (che decide la collisione) ma il disegno sale oltre il bordo superiore (`tall` righe in più).
// Le funzioni disegnano in coordinate del tile con y negativo verso l'alto: (0,0) = angolo alto-sinistro della BASE, y 15 = bordo inferiore.
// Il rendering ordina per riga: le file a nord sono disegnate prima, quelle a sud le sovrappongono, quindi masse di tile alti danno profondità a piani.
import { hash2 } from '../core/Util.js';
const S = 16;
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const rn = (v, i) => hash2(v * 13 + i, i * 7 + v, 5);
const LIGHT = { snow: '#f4f8ff', snowS: '#c8d4e6' };
const hx = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const lite = (c, f = 0.3) => '#' + hx(c).map((q) => Math.round(q + (255 - q) * f).toString(16).padStart(2, '0')).join('');

export const TALL_STYLE = {
  // montagna: profilo con picco a posizione variabile, lato sinistro illuminato, destro in ombra, strati di roccia, cappuccio di neve, vene di lava
  mtn(g, c, f, v, d) {
    // altopiani a terrazze: ogni colonna ha una superficie piana chiara in alto (a gradini di 3px), poi la parete verticale con striature, bordo superiore scuro, lato in luce o in ombra
    // dove il livello cambia, e ombra alla base. Il profilo resta CONTINUO (periodo di 8 tile = 128 px, v = posizione nel periodo): i tile affiancati formano una dorsale unica.
    const H = d.tall + 16, X0 = (v & 7) * 16, TAU = 6.2832, PER = 128;
    const prof = (gx) => { gx = ((gx % PER) + PER) % PER; return 0.5 + 0.5 * (0.5 * Math.sin(TAU * (gx / PER) + 0.7) + 0.32 * Math.sin(TAU * 3 * (gx / PER) + 2.1) + 0.22 * Math.sin(TAU * 5 * (gx / PER) + 4.0) + 0.16 * Math.sin(TAU * 8 * (gx / PER) + 1.3)); };
    const top = (x) => { const q = Math.round((-d.tall + 1 + (1 - prof(X0 + x)) * H * 0.42) / 3) * 3; return Math.max(-d.tall + 1, Math.min(9, q)); };
    const rim = d.snow ? '#5a6a8a' : d.lava ? '#2a0a06' : d.strata ? '#3e1408' : '#262833', plat = d.snow ? LIGHT.snow : c[1], platD = d.snow ? LIGHT.snowS : c[0];
    for (let x = 0; x < S; x++) {
      const t = top(x), tl = top(x - 1), tr = top(x + 1);
      R(g, c[0], x, t, 1, 16 - t);                                                          // parete
      if ((x + (v >> 1)) % 3 === 0) R(g, 'rgba(0,0,0,.16)', x, t + 3, 1, 13 - t);             // striature verticali
      if ((x + (v >> 2)) % 5 === 2) R(g, 'rgba(255,255,255,.08)', x, t + 3, 1, 13 - t);
      R(g, 'rgba(0,0,0,.2)', x, Math.max(t + 5, 10), 1, 16 - Math.max(t + 5, 10));              // più scura verso il basso
      R(g, plat, x, t, 1, Math.min(3, 16 - t)); if (rn(v, x + 50) > 0.55) R(g, platD, x, t + 1, 1, 1);          // superficie piana con grana
      R(g, rim, x, t - 1 < -d.tall ? t : t - 1, 1, 1);                                           // bordo superiore scuro
      if (tl > t) { R(g, rim, x, t, 1, tl - t); R(g, d.snow ? LIGHT.snow : lite(c[1], 0.25), x + 1, t + 1, 1, Math.min(tl - t, 3)); }    // gradino a sinistra: spigolo illuminato
      if (tr > t) { R(g, 'rgba(0,0,0,.38)', x, t, 1, tr - t + 1); }                              // gradino a destra: lato in ombra
      if (d.snow && rn(v, x + 40) > 0.5) R(g, LIGHT.snow, x, t + 3, 1, 1 + (rn(v, x + 60) > 0.5 ? 1 : 0));
    }
    for (let y = -d.tall + 7; y < 15; y += 4) for (let x = 0; x < S; x++) if (top(x) + 3 < y && rn(v, x + y * 3) > 0.62) R(g, 'rgba(0,0,0,.2)', x, y, 1 + (rn(v, x) > 0.5 ? 1 : 0), 1);   // crepe
    if (d.strata) for (let y = -d.tall + 6; y < 15; y += 4) for (let x = 0; x < S; x++) if (top(x) + 3 < y) R(g, rn(v, y + x) > 0.5 ? 'rgba(255,200,140,.18)' : 'rgba(60,20,10,.22)', x, y, 1, 1);
    if (d.lava) for (let i = 0; i < 4; i++) { const x = ((rn(v, i) * 14) | 0) + 1, y = -d.tall + 7 + ((rn(v, i + 9) * (d.tall + 5)) | 0); if (top(x) + 3 < y) { R(g, '#ff7a20', x, y, 1, 3); R(g, '#ffd060', x, y + 1, 1, 1); } }
    for (let i = 0; i < 3; i++) R(g, 'rgba(0,0,0,.3)', 1 + ((rn(v, i + 70) * 12) | 0), 13, 2, 1);          // pietrisco alla base
    R(g, 'rgba(0,0,0,.22)', 0, 14, S, 2); R(g, 'rgba(0,0,0,.14)', 0, 12, S, 2);                    // ombra di base: separa i piani
  },
  // abete alto a piani, con neve opzionale
  tallpine(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.25)', 3, 14, 10, 2); R(g, c[2], 7, 9, 2, 6);
    const n = 5, h0 = d.tall + 10;
    for (let i = 0; i < n; i++) { const y = 11 - i * (h0 / n) * 0.9, w = Math.max(3, 15 - i * 3 + (rn(v, i) * 2 | 0)), hh = Math.round(h0 / n) + 3; R(g, c[0], 8 - (w >> 1), Math.round(y - hh), w, hh); R(g, c[1], 8 - (w >> 1), Math.round(y - hh), (w >> 1) - 1, hh - 1); if (d.snow) R(g, LIGHT.snow, 8 - (w >> 1) + 1, Math.round(y - hh), w - 2, 2); }
    R(g, c[0], 7, -d.tall - 3, 2, 4);
  },
  cypress(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.22)', 5, 14, 6, 2); R(g, c[2], 7, 11, 2, 5);
    for (let y = -d.tall; y < 12; y++) { const k = (y + d.tall) / (d.tall + 12), w = Math.round(2 + Math.sin(k * Math.PI * 0.95) * 4.2 + (rn(v, y) > 0.8 ? 1 : 0)); R(g, c[0], 8 - w, y, w * 2, 1); R(g, c[1], 8 - w, y, 1 + (w >> 2), 1); }
  },
  // quercia / albero secolare con chioma a ciuffi
  oak(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.25)', 2, 14, 12, 2); R(g, c[2], 7, 6, 3, 9); R(g, c[2], 5, 13, 7, 2);
    const cx = 8, cy = -d.tall / 2 + 2, rw = 8, rh = (d.tall + 6) / 2 + 1;
    for (let y = -d.tall - 3; y < 9; y++) { const k = (y - cy) / rh, w = Math.round(Math.sqrt(Math.max(0, 1 - k * k)) * rw + (rn(v, y + 20) > 0.6 ? 1 : 0)); if (w > 0) R(g, c[0], cx - w, y, w * 2, 1); }
    for (let i = 0; i < 9; i++) R(g, c[1], 3 + ((rn(v, i) * 8) | 0), -d.tall + ((rn(v, i + 7) * (d.tall)) | 0), 3, 2);
    for (let i = 0; i < 5; i++) R(g, 'rgba(0,0,0,.18)', 6 + ((rn(v, i + 30) * 8) | 0), -d.tall / 3 + ((rn(v, i + 50) * 14) | 0), 3, 1);
  },
  // albero monumentale in tre pezzi (d.piece 0|1|2): chioma larga 48 px, tronco enorme al centro, radici
  montree(g, c, f, v, d) {
    g.save(); g.translate(-d.piece * 16, 0);
    R(g, 'rgba(0,0,0,.28)', 4, 14, 40, 2);
    R(g, c[2], 19, -2, 10, 17); R(g, c[2], 15, 11, 18, 4); R(g, 'rgba(0,0,0,.25)', 25, -2, 4, 17);                  // tronco con radici
    for (let y = -d.tall - 2; y < 8; y++) { const k = (y + d.tall / 2 - 4) / (d.tall / 2 + 4), w = Math.round(Math.sqrt(Math.max(0, 1 - k * k)) * 23 + (rn(v, y) > 0.55 ? 1 : 0)); if (w > 0) R(g, c[0], 24 - w, y, w * 2, 1); }
    for (let i = 0; i < 26; i++) R(g, c[1], 4 + ((rn(v, i) * 36) | 0), -d.tall + ((rn(v, i + 7) * d.tall) | 0), 4, 2);
    for (let i = 0; i < 12; i++) R(g, 'rgba(0,0,0,.2)', 6 + ((rn(v, i + 30) * 34) | 0), -d.tall / 3 + ((rn(v, i + 50) * 16) | 0), 4, 1);
    for (let i = 0; i < 7; i++) R(g, '#3a7a3a', 6 + ((rn(v, i + 70) * 34) | 0), 4, 1, 3 + ((rn(v, i + 80) * 5) | 0));                    // liane che pendono
    g.restore();
  },
  palm2(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.22)', 4, 14, 8, 2);
    const lean = [-1, 0, 1, 0][v & 3];
    for (let y = 14, k = 0; y > -d.tall + 2; y--, k++) R(g, c[2], 7 + Math.round(Math.sin(k * 0.18) * 1.6 + lean * k * 0.07), y, 2, 1);
    const tx = 8 + Math.round(lean * d.tall * 0.07), ty = -d.tall + 3;
    for (let a = 0; a < 7; a++) { const ang = -3.14 + (a / 6) * 3.14, L = 8; for (let s = 1; s <= L; s++) R(g, s > L - 3 ? c[1] : c[0], Math.round(tx + Math.cos(ang) * s), Math.round(ty + Math.sin(ang) * s * 0.55 + (s * s) * 0.06), 1, 1 + (s < 4 ? 1 : 0)); }
    R(g, '#a0701a', tx - 1, ty + 1, 3, 2);
  },
  tropic(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.25)', 3, 14, 10, 2); R(g, c[2], 7, 4, 3, 11);
    for (let y = -d.tall; y < 6; y++) { const k = (y + d.tall / 2) / (d.tall / 2 + 3), w = Math.round(Math.sqrt(Math.max(0, 1 - k * k)) * 8 + (rn(v, y) > 0.5 ? 1 : 0)); if (w > 0) R(g, c[0], 8 - w, y, w * 2, 1); }
    for (let i = 0; i < 8; i++) R(g, c[1], 2 + ((rn(v, i) * 11) | 0), -d.tall + 1 + ((rn(v, i + 5) * d.tall) | 0), 4, 2);
    for (let i = 0; i < 4; i++) R(g, '#2a6a30', 3 + i * 3 + (v & 1), 4, 1, 5 + (i % 2) * 3);
    if (v % 2) { R(g, '#ff6aa0', 5, -d.tall + 5, 2, 2); R(g, '#ffd040', 11, -d.tall + 9, 2, 2); }
  },
  twisted(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.28)', 3, 14, 10, 2);
    for (let y = 14, k = 0; y > -d.tall; y--, k++) R(g, c[2], 6 + Math.round(Math.sin(k * 0.45 + v) * 2.2), y, 3, 1);
    for (let b = 0; b < 4; b++) { const by = -d.tall + 4 + b * 5, dir = b % 2 ? 1 : -1; for (let s = 0; s < 6; s++) R(g, c[2], 8 + dir * s, by - ((s * s) >> 3), 1, 2); R(g, c[0], 8 + dir * 6, by - 4, 2, 2); }
    for (let i = 0; i < 6; i++) R(g, c[1], 2 + ((rn(v, i) * 12) | 0), -d.tall + ((rn(v, i + 4) * d.tall * 0.8) | 0), 2, 1);
  },
  bush(g, c, f, v) {
    R(g, 'rgba(0,0,0,.2)', 3, 14, 10, 2); R(g, c[0], 3, 8, 10, 6); R(g, c[0], 5, 6, 6, 3); R(g, c[1], 4, 8, 3, 3); R(g, c[1], 9, 7, 3, 2);
    if (v & 1) { R(g, '#ff7aa0', 6, 9, 1, 1); R(g, '#ffe060', 10, 10, 1, 1); }
  },
  // pagoda a più piani con tetti rialzati
  pagodatall(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.28)', 1, 14, 14, 2); R(g, c[2], 3, 11, 10, 4); R(g, '#e8d8b0', 5, 12, 6, 3); R(g, '#3a1a10', 7, 12, 2, 3);
    const tiers = Math.max(3, Math.round(d.tall / 11));
    for (let i = 0; i < tiers; i++) {
      const y = 8 - i * 11, w = 14 - i * 2;
      R(g, '#d8c8a0', 8 - ((w - 4) >> 1), y - 2, w - 4, 4); R(g, '#8a2a2a', 7 - ((w - 4) >> 1) + 4, y - 1, 2, 2);
      R(g, c[0], 8 - (w >> 1), y - 4, w, 2); R(g, c[1], 8 - (w >> 1) - 1, y - 5, w + 2, 1); R(g, c[2], 8 - (w >> 1), y - 2, w, 1);
      R(g, c[1], 8 - (w >> 1) - 2, y - 6, 2, 1); R(g, c[1], 8 + (w >> 1), y - 6, 2, 1);
    }
    R(g, '#e8c040', 7, -d.tall - 2, 2, 8); R(g, '#e8c040', 6, -d.tall + 2, 4, 1);
  },
  obelisk(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.28)', 2, 14, 12, 2); R(g, c[2], 3, 12, 10, 3); R(g, c[1], 4, 10, 8, 3);
    for (let y = -d.tall + 4; y < 11; y++) { const k = (y + d.tall) / (d.tall + 11), w = 2 + Math.round(k * 3); R(g, c[0], 8 - w, y, w * 2, 1); R(g, c[1], 8 - w, y, 1, 1); R(g, 'rgba(0,0,0,.18)', 8 + w - 1, y, 1, 1); }
    for (let y = -d.tall + 10; y < 6; y += 5) R(g, 'rgba(60,40,20,.5)', 7, y, 2, 2);
    R(g, c[1], 7, -d.tall + 1, 2, 3); R(g, c[1], 6, -d.tall + 3, 4, 2); R(g, '#ffd060', 7, -d.tall - 1, 2, 2);
  },
  towertall(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.3)', 1, 14, 14, 2); R(g, c[0], 3, -d.tall + 4, 10, d.tall + 11); R(g, c[1], 3, -d.tall + 4, 3, d.tall + 11); R(g, c[2], 11, -d.tall + 4, 2, d.tall + 11);
    for (let y = -d.tall + 6; y < 14; y += 4) for (let x = 3; x < 13; x += 5) R(g, 'rgba(0,0,0,.18)', x + ((y >> 2) & 1) * 2, y, 3, 1);
    R(g, c[2], 2, -d.tall + 1, 12, 3); for (let x = 2; x < 14; x += 4) R(g, c[0], x, -d.tall - 1, 2, 2);
    R(g, '#14101c', 7, -d.tall + 10, 2, 4); R(g, '#ffd878', 7, -d.tall + 11, 2, 1); R(g, '#14101c', 7, -3, 2, 4); R(g, '#3a2a1a', 6, 9, 4, 6);
  },
  statuetall(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.26)', 2, 14, 12, 2); R(g, c[2], 3, 10, 10, 5); R(g, c[1], 4, 9, 8, 2);
    R(g, c[0], 6, -d.tall + 12, 4, d.tall - 3); R(g, c[1], 5, -d.tall + 14, 2, d.tall - 6); R(g, c[0], 4, -d.tall + 14, 8, 3);       // corpo e spalle
    R(g, c[1], 6, -d.tall + 7, 4, 5); R(g, c[2], 7, -d.tall + 9, 1, 1);                                                                 // testa
    R(g, c[0], 11, -d.tall + 8, 1, 8); R(g, '#e8c040', 10, -d.tall + 6, 3, 2);                                                          // lancia dorata
  },
  // colonna monumentale scanalata, con base e capitello; il tile ha 'gold' per i dettagli dorati
  pcolumn(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.28)', 2, 14, 12, 2); R(g, c[2], 3, 13, 10, 2); R(g, c[0], 4, 12, 8, 1);
    for (let x = 5; x < 11; x++) R(g, x < 7 ? c[1] : x > 8 ? c[2] : c[0], x, -d.tall + 6, 1, d.tall + 6);
    for (let y = -d.tall + 8; y < 12; y += 3) R(g, 'rgba(0,0,0,.1)', 6, y, 1, 2);
    R(g, c[1], 3, -d.tall + 3, 10, 3); R(g, c[2], 3, -d.tall + 5, 10, 1); R(g, c[0], 2, -d.tall + 1, 12, 2);
    if (d.gold) { R(g, '#e8c040', 3, -d.tall + 3, 10, 1); R(g, '#e8c040', 4, 12, 8, 1); R(g, '#ffe48a', 5, -d.tall + 1, 6, 1); }
  },
  pinnacle(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.26)', 3, 14, 10, 2); R(g, c[0], 5, 8, 6, 7); R(g, c[1], 5, 8, 2, 7);
    for (let y = -d.tall; y < 9; y++) { const k = (y + d.tall) / (d.tall + 9), w = Math.max(0, Math.round(k * 3.2)); R(g, c[0], 8 - w, y, w * 2 || 1, 1); R(g, c[1], 8 - w, y, 1, 1); }
    R(g, '#ffd060', 7, -d.tall - 3, 2, 3);
  },
  // frontone del palazzo (gradoni dorati) e fregio
  pediment(g, c, f, v, d) {
    R(g, c[0], 0, 4, S, 12); R(g, c[1], 0, 4, S, 2); R(g, c[2], 0, 14, S, 2);
    R(g, '#e8c040', 0, 6, S, 1); for (let x = 1; x < S; x += 4) R(g, '#c8a030', x, 8, 2, 4); R(g, c[2], 0, 3, S, 1);
    if (d.crest) { R(g, '#e8c040', 6, -d.tall + 8, 4, d.tall - 2); R(g, '#ffe48a', 7, -d.tall + 6, 2, 3); }
  },
  goldrail(g, c) { R(g, c[2], 0, 12, S, 3); R(g, '#e8c040', 0, 6, S, 2); for (let x = 1; x < S; x += 3) R(g, c[0], x, 7, 2, 6); R(g, '#ffe48a', 0, 6, S, 1); },
  brazier(g, c, f) { R(g, 'rgba(0,0,0,.25)', 3, 14, 10, 2); R(g, '#8a6a20', 6, 6, 4, 8); R(g, '#e8c040', 4, 4, 8, 3); R(g, '#c8a030', 5, 13, 6, 2); const fl = (f & 1); R(g, '#ff7a20', 5, 0 + fl, 6, 4); R(g, '#ffd060', 6, -2 + fl, 4, 4); R(g, '#fff0b0', 7, -3 + fl, 2, 3); },
  imperialbanner(g, c, f, v, d) { R(g, '#4a3a2a', 7, -d.tall, 2, d.tall + 15); R(g, '#e8c040', 5, -d.tall - 1, 6, 2); R(g, c[0], 4, -d.tall + 2, 8, d.tall - 4); R(g, c[1], 4, -d.tall + 2, 8, 1); R(g, c[1], 7, -d.tall + 6, 2, 6); R(g, c[2], 4, -d.tall + d.tall - 3, 8, 1); for (let i = 0; i < 4; i++) R(g, c[0], 4 + i * 2, -d.tall + d.tall - 2, 1, 2); },
};

// ---- pavimentazioni (terreni) e tile del campo: stili 16x16 normali ----
Object.assign(TALL_STYLE, {
  paveirr(g, c, f, v) { R(g, c[2], 0, 0, S, S); const P = [[0, 0, 6, 5], [6, 1, 5, 5], [11, 0, 5, 6], [1, 5, 5, 6], [6, 6, 6, 5], [12, 6, 4, 5], [0, 11, 7, 5], [7, 11, 5, 5], [12, 11, 4, 5]]; P.forEach(([x, y, w, h], i) => { R(g, c[(i + v) % 2], x + 1, y + 1, w - 1, h - 1); R(g, c[1], x + 1, y + 1, w - 2, 1); }); },
  paveslab(g, c, f, v) { R(g, c[0], 0, 0, S, S); R(g, c[2], 0, 0, S, 1); R(g, c[2], 0, 0, 1, S); R(g, c[1], 1, 1, S - 2, 1); R(g, c[1], 1, 1, 1, S - 2); R(g, 'rgba(0,0,0,.08)', 3 + (v & 3), 4, 6, 1); R(g, c[2], 0, 15, S, 1); R(g, c[2], 15, 0, 1, S); },
  paveearth(g, c, f, v) { R(g, c[0], 0, 0, S, S); for (let i = 0; i < 16; i++) R(g, c[1 + (i & 1)], (rn(v, i) * S) | 0, (rn(v, i + 20) * S) | 0, 2 + (i & 1), 1); for (let i = 0; i < 3; i++) R(g, c[2], 0, 3 + i * 5 + (rn(v, i) * 2 | 0), S, 1); },
  pavemosaic(g, c, f, v) { R(g, c[0], 0, 0, S, S); R(g, c[2], 0, 0, S, 1); R(g, c[2], 0, 0, 1, S); R(g, c[1], 4, 4, 8, 8); R(g, c[0], 5, 5, 6, 6); R(g, c[2], 7, 7, 2, 2); R(g, c[1], 0, 7, 3, 2); R(g, c[1], 13, 7, 3, 2); R(g, c[1], 7, 0, 2, 3); R(g, c[1], 7, 13, 2, 3); },
  pavewood(g, c) { R(g, c[0], 0, 0, S, S); for (let x = 0; x < S; x += 4) { R(g, c[2], x, 0, 1, S); R(g, c[1], x + 1, 0, 1, S); } for (let y = 3; y < S; y += 8) for (let x = 0; x < S; x += 4) R(g, c[2], x + 1, y, 2, 1); },
  paveice(g, c, f, v) { R(g, c[0], 0, 0, S, S); R(g, c[1], 1, 1, 6, 1); R(g, c[1], 9, 5, 5, 1); R(g, c[2], 0, 8, S, 1); R(g, c[2], 7, 0, 1, 8); R(g, c[2], 3, 8, 1, 8); R(g, c[2], 11, 8, 1, 8); R(g, '#ffffff', 2 + (v & 3) * 3, 3 + (v >> 1) * 4, 2, 1); },
  pavesand(g, c, f, v) { R(g, c[0], 0, 0, S, S); for (let y = 0; y < S; y += 5) { R(g, c[2], 0, y, S, 1); for (let x = ((y / 5) & 1) * 4; x < S; x += 8) R(g, c[2], x, y, 1, 5); } R(g, c[1], 1, 1, 6, 1); R(g, c[1], 9, 6, 5, 1); },
  steps(g, c) { R(g, c[0], 0, 0, S, S); for (let y = 0; y < S; y += 4) { R(g, c[1], 0, y, S, 1); R(g, c[2], 0, y + 3, S, 1); } R(g, 'rgba(0,0,0,.06)', 0, 8, S, 8); },
  goldfloor(g, c, f, v) { R(g, c[0], 0, 0, S, S); R(g, c[2], 0, 0, S, 1); R(g, c[2], 0, 0, 1, S); R(g, '#e8c040', 3, 3, 10, 1); R(g, '#e8c040', 3, 12, 10, 1); R(g, '#e8c040', 3, 3, 1, 10); R(g, '#e8c040', 12, 3, 1, 10); R(g, '#c8a030', 7, 7, 2, 2); },
  campfire(g, c, f) {
    R(g, 'rgba(0,0,0,.3)', 2, 13, 12, 3); for (const [x, y] of [[3, 11], [6, 12], [10, 11], [8, 13], [5, 9]]) R(g, '#8a8a94', x, y, 3, 2);
    R(g, c[0], 4, 10, 8, 2); R(g, c[0], 6, 9, 4, 2); R(g, '#2a1a0a', 5, 11, 6, 1);
    const k = f & 3; R(g, '#ff5a1a', 5, 4 + (k & 1), 6, 6); R(g, '#ff9a30', 6, 2 + (k === 2 ? 1 : 0), 4, 7); R(g, '#ffe070', 7, 1 + (k & 1), 2, 6); if (k === 1) R(g, '#ff7a20', 4, 6, 1, 2);
  },
  tent(g, c) {
    R(g, 'rgba(0,0,0,.28)', 0, 14, 16, 2); R(g, c[0], 1, 6, 14, 9); R(g, c[1], 1, 6, 7, 9); R(g, c[2], 8, 6, 7, 9);
    for (let i = 0; i < 7; i++) { R(g, c[0], 1 + i, 5 - i, 14 - i * 2, 1); R(g, c[1], 1 + i, 5 - i, Math.max(1, 7 - i), 1); }
    R(g, '#14101c', 6, 9, 4, 6); R(g, '#3a2a1a', 7, 11, 2, 4); R(g, '#e8c040', 7, -1, 2, 2); R(g, '#8a2a2a', 4, 7, 8, 1);
  },
});

Object.assign(TALL_STYLE, {
  coraltall(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.25)', 3, 14, 10, 2); R(g, c[2], 6, 8, 4, 7);
    for (let b = 0; b < 4; b++) { const x0 = 3 + b * 3 + ((v & 1) ? 1 : 0), h = d.tall - 4 + ((rn(v, b) * 8) | 0) - 4; for (let y = 0; y < h; y++) R(g, y > h - 4 ? c[1] : c[0], x0 + Math.round(Math.sin(y * 0.5 + b) * 1.2), 8 - y, 2, 1); R(g, c[1], x0 + Math.round(Math.sin(h * 0.5 + b) * 1.2) - 1, 8 - h, 4, 2); }
    for (let i = 0; i < 4; i++) R(g, '#ffe8f0', 4 + ((rn(v, i + 9) * 9) | 0), -d.tall + 4 + ((rn(v, i + 4) * d.tall) | 0), 1, 1);
  },
  coralfan(g, c, f, v, d) {
    R(g, 'rgba(0,0,0,.25)', 3, 14, 10, 2); R(g, c[2], 7, 5, 2, 10);
    for (let y = -d.tall; y < 6; y++) { const k = (y + d.tall) / (d.tall + 6), w = Math.round(2 + Math.sin(k * 1.8) * 6); R(g, c[0], 8 - w, y, w * 2, 1); if (y % 3 === 0) R(g, c[1], 8 - w, y, w * 2, 1); }
    for (let x = 3; x < 14; x += 3) R(g, c[2], x, -d.tall + 4, 1, d.tall + 4);
  },
  kelp(g, c, f, v, d) { for (let s = 0; s < 3; s++) { const x0 = 3 + s * 5; for (let y = 0; y < d.tall + 14; y++) R(g, y % 4 < 2 ? c[0] : c[1], x0 + Math.round(Math.sin(y * 0.4 + f * 0.9 + s * 2) * 2), 14 - y, 2, 1); } },
  seagrass(g, c, f, v) { for (let i = 0; i < 7; i++) { const h = 4 + ((rn(v, i) * 6) | 0), x0 = 1 + i * 2; for (let y = 0; y < h; y++) R(g, c[(i + y) & 1 ? 0 : 1], x0 + Math.round(Math.sin(y * 0.6 + f + i) * 1), 14 - y, 1, 1); } },
  pearl(g, c, f, v) { R(g, 'rgba(0,0,0,.22)', 3, 14, 10, 2); R(g, '#7a8aa0', 4, 10, 8, 4); R(g, '#a8b8c8', 5, 9, 6, 2); R(g, c[2], 5, 3, 6, 7); R(g, c[0], 4, 4, 8, 5); R(g, c[1], 6, 4, 3, 3); R(g, '#c8f0ff', 5, 7, 1, 1); },
  current(g, c, f, v, d) {
    R(g, c[0], 0, 0, S, S);
    for (let i = 0; i < 4; i++) { const t = ((f * 3 + i * 4) % 16), x = d.dirx ? (d.dirx > 0 ? t : 15 - t) : 2 + i * 4, y = d.diry ? (d.diry > 0 ? t : 15 - t) : 2 + i * 4; R(g, c[1], x, y, d.dirx ? 4 : 2, d.diry ? 4 : 2); R(g, c[2], x + (d.dirx > 0 ? 3 : 0), y + (d.diry > 0 ? 3 : 0), 1, 1); }
    const ax = 8 + d.dirx * 4, ay = 8 + d.diry * 4; R(g, 'rgba(255,255,255,.35)', ax - 1, ay - 1, 3, 3);
  },
});
