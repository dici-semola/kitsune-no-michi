import { Game } from './core/Game.js';
import { TitleScene } from './scenes/TitleScene.js';

const game = new Game(document.getElementById('game'));
game.debug = location.search.includes('debug');
game.screens = { Title: TitleScene }; // registro per evitare import circolari tra scene
window.__game = game;                  // comodo per ispezione dalla console
game.scenes.push(new TitleScene());
game.start();

// PWA: installabile e utilizzabile offline; richiede la memoria persistente per proteggere i salvataggi
if ('serviceWorker' in navigator) {
  if (location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  else navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())); // in sviluppo (localhost) niente cache offline
}
navigator.storage?.persist?.().catch(() => {});
