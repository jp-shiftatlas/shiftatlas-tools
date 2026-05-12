import { navigate } from '../router.js';
import { playNarrator, preload } from '../audio.js';

export async function render(app, lesson) {
  await preload('great-job', 'assets/audio/narrator/great-job.mp3');
  playNarrator('great-job');
  app.innerHTML = `
    <div class="screen reward-screen">
      <div class="reward-star">⭐</div>
      <h2>Great job!</h2>
      <p>You earned 🪙 ${lesson.rewards.coins}!</p>
      <button class="reward-continue">Back to map</button>
    </div>
  `;
  app.querySelector('.reward-continue').addEventListener('click', () => navigate('/hub'));
}
