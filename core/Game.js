import { Input } from './Input.js';
import { EventBus } from './EventBus.js';
import { SceneManager } from './SceneManager.js';
import { Chip } from '../audio/Audio.js';
import { Touch } from './Touch.js';

export const W = 480, H = 270; // risoluzione logica (30x17 tile da 16px)
const STEP = 1 / 60;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;
    this.W = W; this.H = H;
    this.input = new Input();
    this.audio = new Chip();
    this.input.audio = this.audio;
    this.bus = new EventBus();
    const ui = typeof document !== 'undefined' && document.getElementById ? document.getElementById('ui') : null;
    this.touch = ui ? new Touch(this, ui) : null;
    this.scenes = new SceneManager(this);
    this.state = null;      // GameState corrente
    this.time = 0;
    this.debug = false;
    this.acc = 0;
    this.last = 0;
    if (typeof addEventListener !== 'undefined') {
      addEventListener('resize', () => this.fit()); addEventListener('orientationchange', () => setTimeout(() => this.fit(), 200)); this.fit();
      // salva quando la pagina passa in background o viene chiusa (mobile: la scheda può essere terminata dal sistema)
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') this.flushSave(); });
      addEventListener('pagehide', () => this.flushSave());
      for (const ev of ['keydown', 'pointerdown']) addEventListener(ev, () => this.audio.unlock(), { passive: true }); // l'audio parte al primo input
    }
  }

  flushSave() { const w = this.scenes.stack.find((s) => s.constructor.name === 'WorldScene'); try { w?.autosave(); } catch { /* ignora */ } }

  // Nuovo bus per ogni partita: evita listener duplicati di stati precedenti.
  resetBus() { this.bus = new EventBus(); return this.bus; }

  // Scala intera quando possibile, per un pixel art nitido.
  fit() {
    const portrait = innerHeight > innerWidth * 1.15; // smartphone in verticale: gioco in alto, controlli sotto
    const s = Math.min(innerWidth / W, portrait ? innerWidth / W : innerHeight / H);
    const k = s >= 1 ? Math.floor(s) : s;
    const st = this.canvas.style;
    st.width = W * k + 'px'; st.height = H * k + 'px';
    st.left = Math.floor((innerWidth - W * k) / 2) + 'px';
    st.top = portrait ? '0px' : Math.floor((innerHeight - H * k) / 2) + 'px';
  }

  start() {
    this.g.imageSmoothingEnabled = false;
    const frame = (ts) => {
      const dt = Math.min(0.1, (ts - (this.last || ts)) / 1000);
      this.last = ts;
      this.acc += dt;
      let n = 0;
      while (this.acc >= STEP && n++ < 5) { this.tick(STEP); this.acc -= STEP; }
      this.render();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  tick(dt) {
    this.time += dt;
    if (this.input.pressed('mute')) this.toast = this.audio.toggleAll() ? 'Audio attivo' : 'Audio disattivato';
    this.audio.update();
    this.scenes.update(dt);
    this.input.endStep();
  }

  render() {
    this.g.imageSmoothingEnabled = false;
    this.scenes.render(this.g);
    this.touch?.render();
  }
}
