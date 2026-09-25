import './styles/game.css';
import { Game } from './game/Game.js';

const root = document.querySelector('#app');

function showFatal(error) {
  console.error(error);
  root.innerHTML = '<main class="fatal"><h1>Tap Tap Tree</h1><p>The game failed to start.</p><pre></pre></main>';
  root.querySelector('pre').textContent = error?.stack || error?.message || String(error);
}

window.addEventListener('error', e => showFatal(e.error || e.message));
window.addEventListener('unhandledrejection', e => showFatal(e.reason));

new Game(root).start().catch(showFatal);
