import { DEFS, T } from '../data/tiles.js';
import { BIOME_IDS } from '../data/world.js';
import { TS } from '../core/Util.js';

// Mappa a due layer + metadati (portali, props, spawn, ancore, cancelli, boss).
import { REALM_TIER } from '../data/gates.js';
export class TileMap {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.ground = new Uint8Array(w * h);
    this.obj = new Uint8Array(w * h);
    this.zone = new Uint8Array(w * h);  // indice bioma (solo overworld)
    this.safe = new Uint8Array(w * h);  // 0 = pericoloso, >0 = id area sicura (villaggio/città)
    this.safeNames = [''];
    this.portals = [];   // {x,y,to,anchor,req,deny}
    this.props = [];     // {type,x,y,...} -> entità Prop
    this.spawns = [];    // {x,y,table,aquatic}
    this.anchors = {};   // nome -> {x,y} in tile
    this.gates = [];     // {x,y,town}
    this.boss = null;    // {id,x,y}
    this.pois = [];      // punti d'interesse per la mappa del gioco: {x,y,n,kind}
    this.def = null;
    this.id = '';
  }
  get type() { return this.def.type; }
  inb(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  g(x, y) { return this.inb(x, y) ? this.ground[y * this.w + x] : T.DEEP; }
  o(x, y) { return this.inb(x, y) ? this.obj[y * this.w + x] : 0; }
  setG(x, y, v) { if (this.inb(x, y)) this.ground[y * this.w + x] = v; }
  setO(x, y, v) { if (this.inb(x, y)) this.obj[y * this.w + x] = v; }
  safeAt(x, y) { return this.inb(x, y) ? this.safe[y * this.w + x] : 0; }

  // `m` = mover (può avere flying, waterOnly, swimDeep, lavaProof, projectile, avoidSafe)
  passable(tx, ty, m) {
    if (!this.inb(tx, ty)) return false;
    const i = ty * this.w + tx;
    const oid = this.obj[i];
    const go = oid ? DEFS[oid] : null;
    // volo e nuoto del giocatore non scavalcano i regni ancora sigillati
    if (m && m.isPlayer && this.realm && (m.flying || m.waterOnly) && !TileMap.ignoreBarriers) { const r = this.realm[i]; if (REALM_TIER[r] > 0 && !TileMap.openRealms.has(r)) return false; }
    if (go && go.barrier && !TileMap.ignoreBarriers) return false;   // barriere di progressione: bloccano anche chi vola
    if (m && m.flying) return true;
    if (go && go.solid && !(go.barrier && TileMap.ignoreBarriers)) return false;
    if (m && m.projectile) return true;
    const gg = DEFS[this.ground[i]];
    if (gg.solid) return false;
    if (m && m.avoidSafe && this.safe[i]) return false;
    const L = gg.liquid;
    if (m && m.waterOnly) return L === 'shallow' || L === 'deep';
    if (L === 'deep') return !!(m && m.swimDeep);
    if (L === 'lava') return !!(m && m.lavaProof);
    return true;
  }

  blockedRect(r, m) {
    const x0 = Math.floor(r.x / TS), x1 = Math.floor((r.x + r.w - 0.01) / TS);
    const y0 = Math.floor(r.y / TS), y1 = Math.floor((r.y + r.h - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (!this.passable(tx, ty, m)) return true;
    return false;
  }

  groundDefAt(px, py) { return DEFS[this.g(Math.floor(px / TS), Math.floor(py / TS))]; }
  biomeAt(tx, ty) {
    if (this.def.gen === 'overworld') return BIOME_IDS[this.zone[ty * this.w + tx]] || 'meadow';
    return this.def.biome;
  }

  // BFS a 4 vicini. Restituisce Uint8Array con 1 per le celle raggiungibili.
  floodWalk(sx, sy, m = null) {
    const seen = new Uint8Array(this.w * this.h);
    if (!this.inb(sx, sy)) return seen;
    const q = [sy * this.w + sx];
    seen[q[0]] = 1;
    for (let h = 0; h < q.length; h++) {
      const c = q[h], x = c % this.w, y = (c / this.w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!this.inb(nx, ny)) continue;
        const ni = ny * this.w + nx;
        if (seen[ni] || !this.passable(nx, ny, m)) continue;
        seen[ni] = 1; q.push(ni);
      }
    }
    return seen;
  }
}
TileMap.ignoreBarriers = false; TileMap.openRealms = new Set();
