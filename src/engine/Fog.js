// Foschia procedurale: rumore frattale periodico (nessuna geometria riconoscibile, bordi sempre sfumati) generato una volta
// in una piccola texture e poi scorrevole su due strati a velocità diverse. Costo per frame: poche drawImage scalate.
import { mulberry32 } from '../core/Util.js';

const TW = 128, TH = 72;             // dimensione texture (px); viene ingrandita e ammorbidita dal filtro bilineare
const bases = new Map();             // seed -> Float32Array 0..1
const textures = new Map();          // "seed|r,g,b" -> canvas

// rumore di valore periodico (si ripete senza giunture), più ottave
function base(seed) {
  if (bases.has(seed)) return bases.get(seed);
  const rnd = mulberry32(seed), out = new Float32Array(TW * TH);
  const oct = [[4, 1], [8, 0.55], [16, 0.3], [32, 0.14]];
  for (const [n, amp] of oct) {
    const gw = n, gh = Math.max(2, Math.round((n * TH) / TW)), lat = new Float32Array(gw * gh);
    for (let i = 0; i < lat.length; i++) lat[i] = rnd();
    for (let y = 0; y < TH; y++) {
      const fy = (y / TH) * gh, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < TW; x++) {
        const fx = (x / TW) * gw, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx);
        const a = lat[(y0 % gh) * gw + (x0 % gw)], b = lat[(y0 % gh) * gw + ((x0 + 1) % gw)];
        const c = lat[((y0 + 1) % gh) * gw + (x0 % gw)], d = lat[((y0 + 1) % gh) * gw + ((x0 + 1) % gw)];
        out[y * TW + x] += amp * ((a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy);
      }
    }
  }
  let lo = 1e9, hi = -1e9; for (const v of out) { if (v < lo) lo = v; if (v > hi) hi = v; }
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - lo) / (hi - lo);
  bases.set(seed, out);
  return out;
}

function texture(seed, tint) {
  const key = seed + '|' + tint.join(',');
  if (textures.has(key)) return textures.get(key);
  const b = base(seed), cv = document.createElement('canvas'); cv.width = TW; cv.height = TH;
  const c = cv.getContext('2d'), im = c.createImageData(TW, TH);
  for (let i = 0; i < b.length; i++) {
    const t = Math.min(1, Math.max(0, (b[i] - 0.34) / 0.5)), a = t * t * (3 - 2 * t); // zone rade e zone dense, passaggio morbido
    im.data[i * 4] = tint[0]; im.data[i * 4 + 1] = tint[1]; im.data[i * 4 + 2] = tint[2]; im.data[i * 4 + 3] = Math.round(a * 255);
  }
  c.putImageData(im, 0, 0); textures.set(key, cv);
  return cv;
}

// density 0..1 (intensità complessiva), speed in px/s (deriva), layers 1 o 2
export function drawFog(g, W, H, time, density, tint = [200, 208, 222], speed = 7, layers = 2) {
  if (density <= 0.005) return;
  const smooth = g.imageSmoothingEnabled; g.imageSmoothingEnabled = true;
  const prevA = g.globalAlpha;
  g.globalAlpha = Math.min(0.2, density * 0.3); g.fillStyle = `rgb(${tint[0]},${tint[1]},${tint[2]})`; g.fillRect(0, 0, W, H); // velo uniforme leggerissimo
  const L = [{ seed: 11, s: 5.2, vx: 1, vy: 0.22, a: 1.15, ph: 0 }, { seed: 29, s: 7.4, vx: -0.62, vy: 0.3, a: 0.8, ph: 2.1 }].slice(0, layers);
  for (const l of L) {
    const tex = texture(l.seed, tint), w = TW * l.s, h = TH * l.s;
    const breathe = 0.78 + 0.22 * Math.sin(time * 0.17 + l.ph) * Math.sin(time * 0.071 + l.ph * 3); // la densità respira lentamente
    g.globalAlpha = Math.min(0.85, density * l.a * breathe);
    const ox = (((time * speed * l.vx) % w) + w) % w, oy = (((time * speed * l.vy + Math.sin(time * 0.05 + l.ph) * 14) % h) + h) % h;
    for (let y = -oy; y < H; y += h) for (let x = -ox; x < W; x += w) g.drawImage(tex, x, y, w, h);
  }
  g.globalAlpha = prevA; g.imageSmoothingEnabled = smooth;
}
