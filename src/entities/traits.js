// Tratti unici dei nemici: ogni creatura ha un comportamento che cambia il modo di affrontarla.
// Hook (tutti opzionali) chiamati da Enemy:
//   init(e)                      alla creazione
//   wake(e,p,sc)                 mentre è dormiente (statue, imboscate)
//   tick(e,dt,sc,p,d)            ogni frame; ritorna true per saltare l'IA standard
//   steer(e,dt,sc,p,d,dir)       movimento personalizzato in inseguimento -> {mx,my} | null
//   hurt(e,dmg,src,o,sc)         modifica/annulla il danno ricevuto -> nuovo danno
//   die(e,sc,fire)               alla morte; ritorna true per annullarla (resurrezione)
//   hitPlayer(e,sc,p)            dopo aver colpito il giocatore
//   after(e,sc,attackName)       a fine attacco
//   bump(e,sc)                   quando una carica sbatte contro un ostacolo
//   phase(e,sc,n)                cambio fase del boss
//   hidden(e)                    true se invisibile/sotto terra
import { Hazard } from './Hazard.js';
import { Pickup } from './Pickup.js';
import { Projectile } from './Projectile.js';
import { dist } from '../core/Util.js';

const R = (a, b) => a + Math.random() * (b - a);

// Si sposta in un punto libero attorno a (cx,cy) a distanza [rmin,rmax]
function teleport(e, sc, cx, cy, rmin, rmax, col = '#a0c0ff') {
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * 6.283, r = R(rmin, rmax);
    const rect = { x: cx + Math.cos(a) * r - e.w / 2, y: cy + Math.sin(a) * r - e.h / 2, w: e.w, h: e.h };
    if (!e.world.blocked(rect, e, [])) { sc.spark(e.cx, e.cy, col, 6); e.x = rect.x; e.y = rect.y; sc.spark(e.cx, e.cy, col, 6); return true; }
  }
  return false;
}
const boom = (sc, x, y, r, delay, dmg, col) => sc.world.add(new Hazard({ kind: 'boom', x, y, r, delay, dmg, col }));
const beam = (sc, x, y, ang, len, w, delay, dmg, col) => sc.world.add(new Hazard({ kind: 'beam', x, y, ang, len, w, delay, dmg, col }));
const puddle = (sc, kind, x, y, r, life, dmg) => sc.world.add(new Hazard({ kind, x, y, r, life, dmg }));
const stun = (e, sc, t, label = '¡Stordito!') => { e.tr.stun = t; sc.floatText(e.cx, e.y - 10, label, '#ffe060'); };
const trail = (e, sc, dt, kind, every = 0.12) => { e.tr.trl = (e.tr.trl || 0) - dt; if (e.chargeT > 0 && e.tr.trl <= 0) { e.tr.trl = every; kind(); } };

export const TRAITS = {
  // ------------------------------------------------------------------ praterie e foresta
  split: { // Slime d'Ombra: alla morte si divide in due piccoli slime
    die(e, sc) {
      if (e.tr.mini) return false;
      for (let i = 0; i < 2; i++) {
        const m = sc.spawnEnemy(e.id, e.x + (i ? 12 : -12), e.y);
        if (m) { m.sz = 0.65; m.tr.mini = true; m.noLoot = true; m.hpMax = m.hp = Math.round(m.hpMax * 0.4); m.state = 'chase'; }
      }
      sc.floatText(e.cx, e.y - 8, 'Si divide!', '#c090ff');
      return false;
    },
  },
  thief: { // Tanuki Ladro: ruba monete e scappa; uccidilo per riaverle
    hitPlayer(e, sc) {
      if (e.tr.loot) return;
      const st = sc.state, n = Math.min(st.inv.gold, 6 + Math.floor(st.inv.gold * 0.06));
      if (n <= 0) return;
      st.inv.gold -= n; e.tr.loot = n; e.tr.flee = 0;
      sc.toast(`Il tanuki ti ruba ${n} monete! Fermalo!`); sc.audio.sfx('error');
    },
    tick(e, dt, sc, p) {
      if (!e.tr.loot) return false;
      e.tr.flee += dt;
      const dir = e.dirTo(p);
      e.face = { x: -dir.x, y: -dir.y }; e.setDir();
      const r = e.move(-dir.x * e.speed * 1.8 * dt, -dir.y * e.speed * 1.8 * dt);
      if (r.hitX && !r.hitY) e.move(0, Math.sign(-dir.y || 1) * e.speed * dt);
      if (r.hitY && !r.hitX) e.move(Math.sign(-dir.x || 1) * e.speed * dt, 0);
      if (e.tr.flee > 7) { e.dead = true; sc.toast('Il ladro è sparito con il bottino...'); }
      return true;
    },
    die(e, sc) { if (e.tr.loot) { sc.world.add(new Pickup(e.cx, e.cy, { gold: e.tr.loot })); e.tr.loot = 0; } return false; },
  },
  berserk: { // Inoshishi: più veloce a ogni carica; se sbatte contro un muro resta stordito (e vulnerabile)
    init(e) { e.tr.rage = 0; },
    after(e, sc, name) { if (name === 'charge') { e.tr.rage = Math.min(5, e.tr.rage + 1); e.speedMul = 1 + e.tr.rage * 0.18; } },
    bump(e, sc) { stun(e, sc, 1.5); sc.audio.sfx('hit'); },
    tick(e, dt) { if (e.tr.stun > 0) { e.tr.stun -= dt; return true; } return false; },
    hurt(e, d) { return e.tr.stun > 0 ? d * 1.7 : d; },
  },
  blink: { // Kitsunebi: dopo ogni tiro si teletrasporta
    after(e, sc, name) { if (name === 'shoot' || name === 'ring') teleport(e, sc, e.cx, e.cy, 40, 80, '#7ad0ff'); },
  },
  pack: { // Lupo d'Ombra: ulula per chiamare rinforzi, più forte in branco
    tick(e, dt, sc, p, d) {
      if (!e.tr.howl && e.state === 'chase' && d < 150) {
        e.tr.howl = true; sc.audio.sfx('roar'); sc.floatText(e.cx, e.y - 10, 'AUUU!', '#ff8080');
        if (sc.world.list.filter((o) => o.id === e.id && !o.dead).length < 4) {
          const m = sc.spawnEnemy(e.id, e.x + 18, e.y + 10);
          if (m) { m.noLoot = true; m.tr.howl = true; m.state = 'chase'; }
        }
      }
      let near = 0;
      for (const o of sc.world.list) if (o !== e && o.id === e.id && !o.dead && dist(o.cx, o.cy, e.cx, e.cy) < 90) near++;
      e.speedMul = 1 + 0.15 * Math.min(near, 2); e.atkMul = 1 + 0.2 * Math.min(near, 2);
      return false;
    },
  },
  orbit: { // Karasu Tengu: gira attorno al giocatore e si lancia in picchiata
    steer(e, dt, sc, p, d, dir) { const k = (d - 75) / 75; return { mx: -dir.y * 0.95 + dir.x * k, my: dir.x * 0.95 + dir.y * k }; },
    tick(e, dt, sc, p) {
      e.tr.dive = (e.tr.dive ?? 4) - dt;
      if (e.tr.dive <= 0 && e.state === 'chase') { e.tr.dive = 5; e.beginAttack('charge', sc); sc.floatText(e.cx, e.y - 12, 'Kaa!', '#ffe060'); }
      return false;
    },
  },
  // ------------------------------------------------------------------ palude e deserto
  dish: { // Kappa: il piatto sul capo assorbe colpi; quando si rompe il kappa si infuria
    init(e) { e.tr.dish = true; e.tr.dm = 0; },
    hurt(e, d, src, o, sc) {
      if (!e.tr.dish) return d;
      e.tr.dm += d;
      if (e.tr.dm > e.hpMax * 0.28) {
        e.tr.dish = false; e.speedMul = 1.35; e.atkMul = 1.3;
        sc.spark(e.cx, e.y - 14, '#60c0ff', 12); sc.floatText(e.cx, e.y - 14, 'Piatto rotto!', '#80e0ff'); sc.audio.sfx('splash');
      }
      return d * 0.55;
    },
  },
  hop: { // Rana Velenosa: avanza a balzi, lascia una pozza di veleno alla morte
    steer(e, dt, sc, p, d, dir) {
      e.tr.h = (e.tr.h || 0) + dt;
      if (e.tr.h % 1 < 0.35) return { mx: dir.x * 2.6, my: dir.y * 2.6 };
      return { mx: 0, my: 0 };
    },
    die(e, sc) { puddle(sc, 'poison', e.cx, e.cy, 22, 5, 3); return false; },
  },
  rise: { // Zombi di Palude: si rialza una volta, a meno che lo finisca il fuoco
    die(e, sc, fire) {
      if (e.tr.risen || fire) return false;
      e.tr.risen = true; e.hp = Math.round(e.hpMax * 0.4); e.tr.down = 1.4;
      sc.floatText(e.cx, e.y - 10, 'Si rialza!', '#a0e080'); sc.spark(e.cx, e.cy, '#6a8a4a', 10);
      return true;
    },
    tick(e, dt) { if (e.tr.down > 0) { e.tr.down -= dt; return true; } return false; },
    hurt(e, d) { return e.tr.down > 0 ? 0 : d; },
  },
  burrow: { // Scorpione: si interra, avanza sottoterra ed emerge sotto i piedi
    tick(e, dt, sc, p, d) {
      const t = e.tr;
      if (t.bur > 0) {
        t.bur -= dt;
        const dir = e.dirTo(p);
        e.move(dir.x * e.speed * 1.9 * dt, dir.y * e.speed * 1.9 * dt);
        if (Math.random() < 0.3) sc.spark(e.cx, e.feetY, '#c9a95e', 1);
        if (t.bur <= 0) {
          sc.ring(e.cx, e.cy, 28, '#ff8040'); sc.audio.sfx('explode');
          if (dist(e.cx, e.cy, p.cx, p.cy) < 30) e.strike(p, e.atk * 1.4);
          e.cd = 1.2;
        }
        return true;
      }
      t.cdb = (t.cdb ?? 2) - dt;
      if (e.state === 'chase' && d < 130 && d > 36 && t.cdb <= 0) { t.bur = 1.3; t.cdb = 4 + Math.random() * 2; sc.floatText(e.cx, e.y - 8, '...', '#c9a95e'); }
      return false;
    },
    hurt(e, d) { return e.tr.bur > 0 ? 0 : d; },
    hidden(e) { return e.tr.bur > 0; },
  },
  circle: { // Avvoltoio Spettrale: vola in cerchio (immune ai colpi in mischia), poi picchia e si espone
    init(e) { e.tr.air = true; e.tr.cyc = 0; },
    tick(e, dt, sc) {
      const t = e.tr; t.cyc += dt;
      if (t.air && t.cyc > 4.5) { t.air = false; t.cyc = 0; if (e.state === 'chase') e.beginAttack('charge', sc); }
      else if (!t.air && t.cyc > 3.2) { t.air = true; t.cyc = 0; }
      return false;
    },
    steer(e, dt, sc, p, d, dir) { if (!e.tr.air) return null; const k = (d - 95) / 95; return { mx: -dir.y * 1.2 + dir.x * k, my: dir.x * 1.2 + dir.y * k }; },
    hurt(e, d, src, o, sc) { if (e.tr.air && !(o.proj || o.leap)) { sc.floatText(e.cx, e.y - 10, 'Mancato', '#bbb'); return 0; } return d; },
  },
  statue: { // Shabti: finge di essere una statua finché non ti avvicini troppo
    init(e) { e.dormant = true; e.tr.stat = true; },
    wake(e, p, sc) {
      if (dist(e.cx, e.cy, p.cx, p.cy) < 62) { e.dormant = false; e.state = 'chase'; e.tr.stat = false; sc.shake(3); sc.spark(e.cx, e.cy, '#d8c088', 12); sc.audio.sfx('roar'); }
    },
  },
  // ------------------------------------------------------------------ neve e canyon
  frostbite: { // Lupo delle Nevi: i morsi rallentano, lascia chiazze di ghiaccio
    hitPlayer(e, sc, p) { p.debuff('slow', 2.5); },
    tick(e, dt, sc) { e.tr.ice = (e.tr.ice || 0) - dt; if (e.state === 'chase' && e.tr.ice <= 0) { e.tr.ice = 0.7; puddle(sc, 'ice', e.cx, e.feetY - 2, 12, 3, 0); } return false; },
  },
  armor: { // Golem di Roccia: corazza (danni ridotti) finché il nucleo non si espone sotto metà vita
    hurt(e, d, src, o, sc) {
      if (e.hp < e.hpMax * 0.5) { if (!e.tr.core) { e.tr.core = true; e.speedMul = 1.4; sc.floatText(e.cx, e.y - 14, 'Nucleo esposto!', '#ffb040'); } return d * 1.5; }
      return d * 0.7;
    },
  },
  shadowstep: { // Arciere d'Ombra: ogni tre tiri svanisce e riappare lontano
    after(e, sc, name) { e.tr.n = (e.tr.n || 0) + 1; if (e.tr.n % 3 === 0) teleport(e, sc, e.cx, e.cy, 70, 110, '#404060'); },
  },
  drain: { // Pipistrello: volo irregolare, si cura mordendo
    steer(e, dt, sc, p, d, dir) { return { mx: dir.x + Math.sin(e.t * 9) * 0.9, my: dir.y + Math.cos(e.t * 7) * 0.9 }; },
    hitPlayer(e) { e.hp = Math.min(e.hpMax, e.hp + e.atk * 0.4); },
  },
  torch: { // Goblin Cavernicolo: porta una torcia che illumina; la scaglia lasciando fuoco
    hitPlayer() {},
  },
  frenzy: { // Squalo: gira in cerchio e va in frenesia se sei ferito
    tick(e, dt, sc) { e.speedMul = sc.state.hp < sc.state.maxHp * 0.5 ? 1.6 : 1; return false; },
    steer(e, dt, sc, p, d, dir) { if (e.cd > 0.8 && d < 140) return { mx: -dir.y * 0.9 + dir.x * (d - 80) / 80, my: dir.x * 0.9 + dir.y * (d - 80) / 80 }; return null; },
  },
  static: { // Medusa Lampo: campo elettrico attorno al corpo
    tick(e, dt, sc, p, d) {
      e.tr.z = (e.tr.z || 0) - dt;
      if (d < 32 && e.tr.z <= 0) { e.tr.z = 0.9; sc.spark(e.cx, e.cy, '#ffff60', 6); if (p.hurt(e.atk * 0.5, e)) sc.audio.sfx('zap'); }
      return false;
    },
  },
  shell: { // Granchio Gigante: il guscio devia i colpi frontali; vulnerabile mentre attacca
    hurt(e, d, src, o, sc) {
      if (!src || src.cx === undefined) return d;
      const sx = src.cx - e.cx, sy = src.cy - e.cy, l = Math.hypot(sx, sy) || 1;
      const front = (sx * e.face.x + sy * e.face.y) / l > 0.3;
      if (e.state === 'wind' || e.state === 'act') return d * 1.5;
      if (front) { sc.floatText(e.cx, e.y - 10, 'CLANG', '#ddd'); sc.audio.sfx('error'); return d * 0.25; }
      return d;
    },
  },
  // ------------------------------------------------------------------ inferi, futuro, tempo
  hunger: { // Gaki: succhia il Ki e accelera
    hitPlayer(e, sc) { const st = sc.state; st.ki = Math.max(0, st.ki - 18); e.speedMul = Math.min(1.7, (e.speedMul || 1) + 0.12); e.hp = Math.min(e.hpMax, e.hp + e.hpMax * 0.04); sc.floatText(e.cx, e.y - 10, 'Ki rubato', '#80a0ff'); },
  },
  enrage: { // Oni Rosso: sotto metà vita entra in furia
    hurt(e, d, src, o, sc) {
      if (!e.tr.rage && e.hp - d < e.hpMax * 0.5) { e.tr.rage = true; e.atkMul = 1.45; e.speedMul = 1.3; sc.shake(4); sc.audio.sfx('roar'); sc.floatText(e.cx, e.y - 14, 'FURIA!', '#ff4040'); }
      return d;
    },
  },
  phase: { // Fantasma di Fiamma: alterna corporeo e intangibile (attraversa i muri)
    init(e) { e.tr.ghost = false; e.tr.cyc = R(0, 2); },
    tick(e, dt, sc) {
      const t = e.tr; t.cyc += dt;
      if (!t.ghost && t.cyc > 3) { t.ghost = true; t.cyc = 0; e.flying = true; sc.spark(e.cx, e.cy, '#ffa040', 8); }
      else if (t.ghost && t.cyc > 2) {
        if (!e.world.map.blockedRect(e, { ...e, flying: false })) { t.ghost = false; t.cyc = 0; e.flying = false; } else t.cyc = 1.5;
      }
      return false;
    },
    hurt(e, d, src, o, sc) { if (e.tr.ghost) { sc.floatText(e.cx, e.y - 10, 'Intangibile', '#bbb'); return 0; } return d; },
  },
  trail: { // Cerbero Cucciolo: la carica lascia una scia di fuoco
    tick(e, dt, sc) { trail(e, sc, dt, () => puddle(sc, 'fire', e.cx, e.feetY - 2, 10, 3, 4)); return false; },
  },
  scan: { // Drone Sentinella: scansiona e, se ti vede, chiama un drone di rinforzo
    tick(e, dt, sc, p, d) {
      if (!e.tr.alert && d < 150) {
        e.tr.alert = true; sc.audio.sfx('warp'); sc.floatText(e.cx, e.y - 12, 'ALLARME', '#ff4060');
        const m = sc.spawnEnemy(e.id, e.x + 16, e.y - 8);
        if (m) { m.noLoot = true; m.tr.alert = true; m.state = 'chase'; }
      }
      return false;
    },
  },
  parry: { // Cyborg Rōnin: para i colpi frontali e contrattacca
    init(e) { e.tr.g = R(0, 2); },
    tick(e, dt) { e.tr.g = (e.tr.g + dt) % 3.6; e.tr.guard = e.tr.g > 2.2 && e.state === 'chase'; return false; },
    hurt(e, d, src, o, sc) {
      if (!e.tr.guard || !src || src.cx === undefined) return d;
      const sx = src.cx - e.cx, sy = src.cy - e.cy, l = Math.hypot(sx, sy) || 1;
      if ((sx * e.face.x + sy * e.face.y) / l > 0.1) {
        sc.floatText(e.cx, e.y - 12, 'PARATA', '#80f0ff'); sc.audio.sfx('error'); sc.spark(e.cx, e.cy, '#80f0ff', 6);
        e.tr.guard = false; e.tr.g = 0; e.cd = 0; if (e.state === 'chase') e.beginAttack('slash', sc);
        return 0;
      }
      return d;
    },
  },
  overheat: { // Cane Meccanico: dopo tre cariche si surriscalda e resta fermo
    init(e) { e.tr.heat = 0; },
    after(e, sc, name) { if (name === 'charge' && ++e.tr.heat >= 3) { e.tr.heat = 0; stun(e, sc, 2.2, 'SURRISCALDATO'); sc.audio.sfx('splash'); } },
    tick(e, dt, sc) { trail(e, sc, dt, () => puddle(sc, 'fire', e.cx, e.feetY - 2, 9, 2, 3), 0.15); if (e.tr.stun > 0) { e.tr.stun -= dt; if (Math.random() < 0.3) sc.spark(e.cx, e.y, '#ccc', 1); return true; } return false; },
    hurt(e, d) { return e.tr.stun > 0 ? d * 1.8 : d; },
    bump(e, sc) { sc.shake(2); },
  },
  glitchtp: { // Glitch: si teletrasporta lasciando una bomba-fantasma dove si trovava
    tick(e, dt, sc, p) {
      e.tr.g = (e.tr.g ?? 1.5) - dt;
      if (e.tr.g <= 0 && e.state === 'chase') { e.tr.g = R(2, 3.4); boom(sc, e.cx, e.cy, 22, 0.8, e.atk * 0.8, '#8a6aff'); sc.audio.sfx('warp'); teleport(e, sc, p.cx, p.cy, 50, 95, '#4cf0ff'); }
      return false;
    },
  },
  echo: { // Eco Temporale: ripete il suo ultimo attacco dopo un istante
    after(e, sc, name) { if (name === 'shoot' || name === 'ring') e.tr.echo = { t: 1.6, ring: name === 'ring' }; },
    tick(e, dt, sc) { const k = e.tr.echo; if (k) { k.t -= dt; if (k.t <= 0) { e.tr.echo = null; sc.ring(e.cx, e.cy, 26, '#b0a0ff'); e.fire(sc, k.ring); } } return false; },
  },
  afterimage: { // Spettro del Futuro: lascia immagini residue che esplodono
    tick(e, dt, sc) { trail(e, sc, dt, () => boom(sc, e.cx, e.cy, 15, 0.9, e.atk * 0.7, '#ff3fa4')); return false; },
  },
  illusion: { // Miraggi/echi dei boss: scompaiono al primo colpo o dopo pochi secondi
    init(e) { e.tr.life = 9; e.noLoot = true; },
    tick(e, dt, sc) { e.tr.life -= dt; if (e.tr.life <= 0) { e.dead = true; sc.spark(e.cx, e.cy, '#fff', 6); } return false; },
    hurt(e, d, src, o, sc) { sc.spark(e.cx, e.cy, '#fff', 8); e.dead = true; return 0; },
  },
  // ------------------------------------------------------------------ boss
  ironhide: { // Oni Kurogane: corazza di ferro, si spezza a metà combattimento
    hurt(e, d) { return e.tr.broken ? d : d * 0.6; },
    phase(e, sc, ph) { if (ph >= 1 && !e.tr.broken) { e.tr.broken = true; sc.floatText(e.cx, e.y - 24, 'La corazza si spezza!', '#ffb040'); sc.audio.sfx('explode'); sc.shake(6); } },
  },
  hydra: { // Yatsuhashi: cinque teste; ogni testa mozzata cola veleno e ricresce (se non viene bruciata)
    init(e) { e.tr.heads = 5; e.tr.dm = 0; e.tr.regrow = 8; },
    hurt(e, d, src, o, sc) {
      e.tr.dm += d;
      if (e.tr.dm > e.hpMax * 0.1 && e.tr.heads > 1) {
        e.tr.dm = 0; e.tr.heads--; puddle(sc, 'poison', e.cx + R(-24, 24), e.cy + R(8, 22), 20, 6, 4);
        sc.floatText(e.cx, e.y - 20, `Testa mozzata! (${e.tr.heads})`, '#a0ff80'); sc.audio.sfx('splash'); sc.shake(3);
      }
      return d;
    },
    tick(e, dt) { if (e.burnT > 0) e.tr.regrow = 8; else if ((e.tr.regrow -= dt) <= 0) { e.tr.regrow = 8; e.tr.heads = Math.min(5, e.tr.heads + 1); } return false; },
  },
  sandstorm: { // Sfinge Cremisi: scatena una tempesta di sabbia nella fase 2
    phase(e, sc, ph) { if (ph >= 1) sc.atmo.lock('sandstorm'); },
  },
  blizzard: { // Regina Tsurara: la caverna si riempie di bufera
    phase(e, sc, ph) { if (ph >= 1) sc.atmo.lock('blizzard'); },
  },
  tempest: { // Ryūjin: tempesta marina
    phase(e, sc, ph) { if (ph >= 1) sc.atmo.lock('storm'); },
  },
  glitchlord: { // KAMI-OS: nelle fasi avanzate disturba i controlli
    phase(e, sc, ph) { if (ph >= 1) sc.atmo.lock('timestorm'); },
  },
};

// ---------------------------------------------------------------------------------------------
// Attacchi aggiuntivi (si sommano alla libreria base di Enemy.js): usati da tratti e boss.
// range = distanza massima per iniziare, wind = telegrafo (s), rec = recupero (s)
const P = (e) => e.world.player;
export const EXTRA_ATK = {
  pull: { range: 120, wind: 0.5, rec: 0.6, run(e, sc) { // Mummia: bende che ti trascinano
    const p = P(e), a = Math.atan2(p.cy - e.cy, p.cx - e.cx);
    sc.world.add(new Projectile({ x: e.cx, y: e.cy - 4, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, r: 3, dmg: e.atk * 0.5, team: 'enemy', life: 1, kind: 'arrow', col: '#e8dab0', owner: e, fx: ['pull'] })); sc.audio.sfx('shoot');
  } },
  snowball: { range: 150, wind: 0.7, rec: 0.7, run(e, sc) { const p = P(e); boom(sc, p.cx, p.cy, 30, 0.95, e.atk * 1.3, '#e0f4ff'); } }, // Yeti
  rockfall: { range: 150, wind: 0.8, rec: 0.9, run(e, sc) { const p = P(e); for (let i = 0; i < 5; i++) boom(sc, p.cx + R(-34, 34), p.cy + R(-26, 26), 15, 0.7 + i * 0.12, e.atk, '#b08060'); } }, // Golem
  toss: { range: 130, wind: 0.5, rec: 0.6, run(e, sc) { const p = P(e); sc.world.add(new Hazard({ kind: 'fire', x: p.cx, y: p.cy, r: 16, delay: 0.7, life: 3.5, dmg: 5 })); sc.audio.sfx('shoot'); } }, // Goblin
  lineshock: { range: 170, wind: 0.8, rec: 0.7, run(e, sc) { const p = P(e), a = Math.atan2(p.cy - e.cy, p.cx - e.cx); beam(sc, e.cx, e.cy, a, 190, 8, 0.3, e.atk * 1.2, '#ffff60'); } }, // Anguilla
  quake: { range: 150, wind: 0.8, rec: 0.9, run(e, sc) { // Oni: onde d'urto a raggiera
    const p = P(e), a = Math.atan2(p.cy - e.cy, p.cx - e.cx);
    for (const d of [-0.5, 0, 0.5]) beam(sc, e.cx, e.cy, a + d, 170, 14, 0.5, e.atk * 1.3, '#ff6040'); sc.shake(5);
  } },
  heads: { range: 170, wind: 0.5, rec: 0.6, run(e, sc) { e.fire(sc, false, { n: Math.max(1, e.tr.heads), spread: 0.14 * e.tr.heads }); } }, // Yatsuhashi
  mirage: { range: 240, wind: 0.9, rec: 0.7, run(e, sc) { // Sfinge: due miraggi
    for (let i = 0; i < 2; i++) { const m = sc.spawnEnemy('miraggio', e.cx + (i ? 30 : -30), e.cy + 12); if (m) { m.state = 'chase'; sc.spark(m.cx, m.cy, '#ffd060', 8); } }
  } },
  pillars: { range: 200, wind: 0.8, rec: 0.7, run(e, sc) { // Tsurara: pilastri di ghiaccio a cerchio
    const p = P(e); for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.283; boom(sc, p.cx + Math.cos(a) * 52, p.cy + Math.sin(a) * 52, 14, 0.8 + (i % 3) * 0.1, e.atk, '#bff0ff'); }
    boom(sc, p.cx, p.cy, 18, 1.2, e.atk * 1.2, '#ffffff');
  } },
  gust: { range: 240, wind: 0.6, rec: 0.6, run(e, sc) { // Tengu: raffica che ti spinge via
    const p = P(e), a = Math.atan2(p.cy - e.cy, p.cx - e.cx);
    sc.world.add(new Hazard({ kind: 'wind', x: p.cx, y: p.cy, ang: a, delay: 0, life: 1.6, r: 120 })); sc.audio.sfx('warp');
  } },
  rain: { range: 240, wind: 0.6, rec: 0.7, run(e, sc) { const p = P(e); for (let i = 0; i < 10; i++) boom(sc, p.cx + R(-70, 70), p.cy + R(-55, 55), 10, 0.5 + i * 0.1, e.atk * 0.8, '#303040'); } }, // Tengu: pioggia di piume
  wave: { range: 240, wind: 0.8, rec: 0.8, run(e, sc) { // Ryūjin: onde sovrapposte
    const p = P(e), a = Math.atan2(p.cy - e.cy, p.cx - e.cx);
    for (const off of [-24, 24]) beam(sc, e.cx - Math.sin(a) * off, e.cy + Math.cos(a) * off, a, 230, 16, 0.6, e.atk * 1.2, '#40c0f0'); sc.audio.sfx('splash');
  } },
  whirl: { range: 220, wind: 0.8, rec: 0.9, run(e, sc) { sc.world.add(new Hazard({ kind: 'pull', x: e.cx, y: e.cy, r: 80, delay: 0.3, life: 2.8, dmg: e.atk })); } }, // Ryūjin: vortice
  hack: { range: 260, wind: 0.8, rec: 0.7, run(e, sc) { P(e).debuff('invert', 3.5); sc.floatText(P(e).cx, P(e).y - 18, 'CONTROLLI INVERTITI', '#ff3fa4'); sc.audio.sfx('warp'); } }, // KAMI-OS
  grid: { range: 240, wind: 0.8, rec: 0.8, run(e, sc) { // KAMI-OS: griglia di laser
    const p = P(e), v = Math.random() < 0.5;
    for (let i = -1; i <= 1; i++) beam(sc, v ? p.cx + i * 38 : p.cx - 150, v ? p.cy - 150 : p.cy + i * 38, v ? Math.PI / 2 : 0, 300, 10, 1.0, e.atk * 1.2, '#ff3fa4');
  } },
  judgment: { range: 260, wind: 0.8, rec: 0.9, run(e, sc) { // Enma: tre sentenze consecutive sul punto in cui stai
    for (let i = 0; i < 3; i++) e.later(i * 0.55, () => { const p = P(e); boom(sc, p.cx, p.cy, 26, 0.85, e.atk * 1.4, '#ffd060'); });
  } },
  timestop: { range: 260, wind: 0.9, rec: 0.6, run(e, sc) { // Mugenkai: ferma il tempo e colpisce due volte
    const p = P(e); p.debuff('stun', 1.3); sc.floatText(p.cx, p.y - 18, 'TEMPO FERMO', '#c0a0ff'); sc.audio.sfx('warp'); sc.ring(p.cx, p.cy, 50, '#c0a0ff');
    teleport(e, sc, p.cx, p.cy, 22, 28, '#c0a0ff');
    e.later(0.35, () => e.strike(p, e.atk * 1.2)); e.later(0.8, () => e.strike(p, e.atk * 1.4));
  } },
  clones: { range: 260, wind: 0.8, rec: 0.7, run(e, sc) { for (let i = 0; i < 2; i++) { const m = sc.spawnEnemy('eco_mugenkai', e.cx + (i ? 36 : -36), e.cy + 14); if (m) { m.state = 'chase'; sc.spark(m.cx, m.cy, '#c0a0ff', 8); } } } },
  rewind: { range: 280, wind: 0.6, rec: 0.5, run(e, sc) { const p = P(e); teleport(e, sc, p.cx, p.cy, 28, 36, '#c0a0ff'); e.hp = Math.min(e.hpMax, e.hp + e.hpMax * 0.03); sc.floatText(e.cx, e.y - 20, 'Rewind', '#c0a0ff'); sc.audio.sfx('warp'); } },
};

// Descrizioni brevi per il bestiario
export const TIPS = {};
