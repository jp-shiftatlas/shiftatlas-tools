import { navigate } from '../router.js';
import { unlock, preload, playNarrator } from '../audio.js';
import { state } from '../state.js';

export function render(app) {
  app.innerHTML = `
    <div class="screen splash">
      <div class="splash-title">
        <h1>LetterLand Quest</h1>
        <p class="subtitle">Tap to play</p>
      </div>
      <button class="splash-tap" aria-label="Start game">&#9654;</button>
    </div>
  `;
  app.querySelector('.splash-tap').addEventListener('click', async () => {
    unlock();
    await preload('welcome', 'assets/audio/narrator/welcome.mp3');
    playNarrator('welcome');
    navigate(state.player.name ? '/hub' : '/avatar');
  });
}
