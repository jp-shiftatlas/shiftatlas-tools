import { playNarrator, preload, playSfx } from '../audio.js';
import { navigate } from '../router.js';
import words from '../data/words.json' with { type: 'json' };

export async function render(app, lesson, onComplete) {
  const { targetWordId, options } = lesson.params;
  await Promise.all([
    preload(lesson.narrationKey, `assets/audio/narrator/${lesson.narrationKey}.mp3`),
    preload('try-again', 'assets/audio/narrator/try-again.mp3'),
    preload('ding', 'assets/audio/sfx/ding.mp3'),
    preload('tap', 'assets/audio/sfx/tap.mp3')
  ]);
  playNarrator(lesson.narrationKey);

  const shuffled = [...options].sort(() => Math.random() - 0.5);
  app.innerHTML = `
    <div class="screen tap-screen">
      <div class="topbar"><button class="back">←</button><span class="instruction">Tap the ${words[targetWordId].text}!</span><span></span></div>
      <div class="tap-grid">
        ${shuffled.map(id => `
          <button class="tap-card" data-id="${id}">
            <img src="${words[id].image}" alt="${words[id].text}">
          </button>
        `).join('')}
      </div>
      <button class="tap-replay">🔊 Say it again</button>
    </div>
  `;

  let completed = false;

  app.querySelector('.back').addEventListener('click', () => navigate('/hub'));
  app.querySelector('.tap-replay').addEventListener('click', () => playNarrator(lesson.narrationKey));

  app.querySelectorAll('.tap-card').forEach(btn => {
    btn.addEventListener('click', () => {
      if (completed) return;
      playSfx('tap');
      if (btn.dataset.id === targetWordId) {
        completed = true;
        btn.classList.add('correct');
        playSfx('ding');
        setTimeout(onComplete, 600);
      } else {
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 500);
        playNarrator('try-again');
      }
    });
  });
}
