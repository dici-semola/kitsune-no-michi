import { W, H } from '../core/Game.js';
import { panel, text, nav } from '../engine/UI.js';
import { drawPlayerSprite, HAIR, SKIN, REDS, TOPS, MASKS } from '../engine/Sprites.js';
import { OUTFITS } from '../engine/PlayerSprite.js';
import { GameState, GIFTS } from '../systems/GameState.js';
import { WorldScene } from './WorldScene.js';

const NAMES = [['Kaito', 'Ren', 'Haru', 'Tsubasa'], ['Akane', 'Mizuki', 'Sakura', 'Hana']];
const HAIR_N = ['Biondo ambra', 'Biondo miele scuro', 'Biondo rame', 'Biondo dorato', 'Nero corvino', 'Biondo chiaro', 'Rossiccio', 'Castano', 'Grigio argentato'];
const STYLE_N = ['Corti', 'Lunghi', 'Codino'];
const SKIN_N = ['Chiara', 'Dorata', 'Ambrata'];
const RED_N = ['Rosso scarlatto', 'Rosso cremisi', 'Rosso vino', 'Blu notte', 'Verde pino', 'Viola glicine', 'Nero inchiostro', 'Ocra dorato', 'Turchese', 'Rosa ciliegio'];
const TOP_N = ['Bianco', 'Avorio', 'Azzurro', 'Verde salvia', 'Rosa pallido', 'Grigio ardesia', 'Rosso'];
const GENDER_N = ['Uomo', 'Donna'];
const GIFT_IDS = Object.keys(GIFTS);

// Creazione del protagonista: nome (tastiera o tastiera del telefono), sesso, aspetto e dono iniziale.
// Kimono rosso e bianco, capelli biondo caldo scuro, maschera kitsune e katana restano la base del personaggio.
export class CreatorScene {
  constructor() {
    this.sel = 0; this.t = 0; this.editing = false;
    this.v = { gender: 0, style: 0, hair: 0, skin: 0, outfit: 0, red: 0, top: 0, mask: 0, gift: 0 };
    this.name = NAMES[0][0];
  }
  enter() {
    this.game.audio.play('title');
    this.el = typeof document !== 'undefined' ? document.getElementById('nameinput') : null;
    if (!this.el) return;
    this.el.oninput = () => { this.name = this.el.value.replace(/[^\p{L}\p{N} '-]/gu, '').slice(0, 14); };
    this.el.onkeydown = (e) => { e.stopPropagation(); if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); this.stopEdit(); } };
    this.el.onblur = () => { this.editing = false; if (!this.name.trim()) this.name = NAMES[this.v.gender][0]; };
  }
  exit() { if (this.el) { this.el.oninput = this.el.onkeydown = this.el.onblur = null; this.el.blur(); } }
  // Chiamato anche dal controllo touch (nello stesso gesto dell'utente, altrimenti iOS non apre la tastiera)
  focusName() { if (!this.el) return; this.editing = true; this.el.value = this.name; this.el.focus(); this.el.select?.(); }
  stopEdit() { this.editing = false; this.el?.blur(); }

  get rows() {
    const v = this.v;
    return [['Nome', this.name + (this.editing && Math.floor(this.t * 2) % 2 ? '_' : ''), 'text'], ['Sesso', GENDER_N[v.gender]], ['Capelli', STYLE_N[v.style]], ['Colore capelli', HAIR_N[v.hair]],
      ['Carnagione', SKIN_N[v.skin]], ['Abito', OUTFITS[v.outfit].n], ['Colore abito', RED_N[v.red]], ['Colore veste', TOP_N[v.top]], ['Maschera', MASKS[v.mask]], ['Dono iniziale', GIFTS[GIFT_IDS[v.gift]].n]];
  }
  update(dt) {
    const inp = this.game.input;
    this.t += dt;
    if (this.editing) return; // la tastiera è dell'input di testo
    this.sel = nav(inp, 11, this.sel);
    const lens = [0, 2, 3, HAIR.length, SKIN.length, OUTFITS.length, REDS.length, TOPS.length, MASKS.length, GIFT_IDS.length], keys = [null, 'gender', 'style', 'hair', 'skin', 'outfit', 'red', 'top', 'mask', 'gift'];
    if (this.sel >= 1 && this.sel <= 9) {
      const k = keys[this.sel], n = lens[this.sel];
      const d = (inp.pressed('right') ? 1 : 0) - (inp.pressed('left') ? 1 : 0);
      if (d) {
        this.v[k] = (this.v[k] + d + n) % n; inp.audio?.sfx('select');
        if (k === 'gender') { if (NAMES[1 - this.v.gender].includes(this.name)) this.name = NAMES[this.v.gender][NAMES[1 - this.v.gender].indexOf(this.name)]; if (this.v.gender === 1 && this.v.style === 0) this.v.style = 1; if (this.v.gender === 1 && this.v.outfit === 0) this.v.outfit = 1; if (this.v.gender === 0 && this.v.outfit === 1) this.v.outfit = 0; if (this.v.gender === 0 && this.v.style === 1) this.v.style = 0; }
      }
    }
    if (this.sel === 0 && (inp.pressed('confirm') || inp.pressed('right'))) { if (this.el) this.focusName(); else this.name = NAMES[this.v.gender][(NAMES[this.v.gender].indexOf(this.name) + 1) % 4]; }
    if (inp.pressed('cancel')) { this.game.scenes.replace(new this.game.screens.Title()); return; }
    if (this.sel === 10 && inp.pressed('confirm')) this.start();
  }
  start() {
    const bus = this.game.resetBus();
    const st = new GameState(bus), v = this.v;
    st.name = this.name.trim() || NAMES[v.gender][0];
    st.look = { hair: v.hair, skin: v.skin, outfit: v.outfit, red: v.red, top: v.top, mask: v.mask, gender: v.gender, style: v.style };
    st.gift = GIFT_IDS[v.gift]; st.hp = st.maxHp; st.ki = st.maxKi; st.stamina = st.maxStamina;
    st.quests.start('m1_omen', st);
    this.game.state = st;
    this.game.audio.sfx('levelup');
    this.game.scenes.replace(new WorldScene(), { mapId: 'overworld', anchor: 'start' });   // la scenetta iniziale manda poi al dojo
  }
  render(g) {
    const v = this.v;
    g.fillStyle = '#120a1c'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect((i * 97) % W, (i * 53) % H, 1, 1); }
    panel(g, 10, 10, 270, 250);
    text(g, 'Crea il tuo Kitsune', 24, 18, '#ffd0a0', { font: 'bold 11px monospace' });
    this.rows.forEach(([a, b, kind], i) => {
      const y = 33 + i * 16, on = this.sel === i;
      if (on) { g.fillStyle = 'rgba(200,40,58,.55)'; g.fillRect(18, y - 3, 254, 14); }
      text(g, a, 26, y, '#c8b8d0'); text(g, kind ? (on ? '[ ' + b + ' ]' : b) : `◄ ${b} ►`, 264, y, on ? '#fff' : '#e8dcc8', { align: 'right' });
    });
    const on = this.sel === 10;
    if (on) { g.fillStyle = 'rgba(200,40,58,.75)'; g.fillRect(18, 211, 254, 20); }
    text(g, 'INIZIA L\'AVVENTURA', 145, 216, '#fff', { align: 'center' });
    text(g, this.sel === 0 ? 'Invio: scrivi il nome (Invio per finire)' : '↑/↓ scegli   ←/→ cambia   Esc indietro', 145, 240, '#8a7a9a', { align: 'center' });
    // anteprima + dono
    panel(g, 290, 10, 180, 250);
    g.save(); g.imageSmoothingEnabled = false; g.beginPath(); g.rect(292, 12, 176, 128); g.clip(); g.fillStyle = 'rgba(40,24,60,.55)'; g.fillRect(292, 12, 176, 128); g.fillStyle = 'rgba(12,5,28,.35)'; g.beginPath(); g.ellipse(380, 132, 40, 8, 0, 0, 6.283); g.fill(); g.translate(380, 130); g.scale(3, 3);
    drawPlayerSprite(g, 0, 0, { hair: v.hair, skin: v.skin, outfit: v.outfit, red: v.red, top: v.top, mask: v.mask, gender: v.gender, style: v.style }, Math.floor(this.t / 1.5) % 4 === 1 ? 2 : 0, 0);
    g.restore();
    text(g, this.name || '...', 380, 140, '#fff', { align: 'center', font: 'bold 10px monospace' });
    text(g, `${GENDER_N[v.gender]} · Katana · Maschera Kitsune`, 380, 154, '#a898b0', { align: 'center' });
    const gf = GIFTS[GIFT_IDS[v.gift]];
    panel(g, 298, 172, 164, 80, { bg: 'rgba(10,6,18,.9)' });
    text(g, 'Dono: ' + gf.n, 306, 178, '#ffd0a0');
    text(g, gf.d, 306, 192, '#d8c8b0');
    text(g, 'Il nome scelto sarà usato', 306, 214, '#8a7a9a'); text(g, 'nei dialoghi e nelle missioni.', 306, 224, '#8a7a9a');
  }
}
