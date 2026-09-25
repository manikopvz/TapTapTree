import './styles/game.css';
import { Game } from './game/Game.js';

const root = document.querySelector('#app');
const fail = error => window.__TTT_FAIL__?.(error);

new Game(root).start().then(() => {
  window.__TTT_BOOT__ = false;
  document.querySelector('#boot')?.remove();
}).catch(fail);
