import { playNarrator, preload, playSfx } from '../audio.js';
import { navigate } from '../router.js';
import { isSupported, recognize } from '../speech.js';
import words from '../data/words.json' with { type: 'json' };

export async function render(app, lesson, onComplete) {
  const { wordId } = lesson.params;
  const word = words[wordId];
  await Promise.all([
    preload(lesson.narrationKey, `assets/audio/narrator/${lesson.narrationKey}.mp3`),
    preload('great-job', 'assets/audio/narrator/great-job.mp3'),
    preload('try-again', 'assets/audio/narrator/try-again.mp3'),
    preload('ding', 'assets/audio/sfx/ding.mp3'),
    preload(`word-${wordId}`, word.audio)
  ]);
  playNarrator(lesson.narrationKey);

  const speechAvailable = isSupported();
  app.innerHTML = `
    <div class="screen repeat-screen">
      <div class="topbar"><button class="back">←</button><span class="instruction">Say the word!</span><span></span></div>
      <div class="repeat-stage">
        <img class="repeat-image" src="${word.image}" alt="${word.text}">
        <h2 class="repeat-word">${word.text}</h2>
      </div>
      <button class="repeat-play-word">🔊 ${word.text}</button>
      ${speechAvailable
        ? `<button class="repeat-mic">🎤 Tap and say "${word.text}"</button>`
        : `<button class="repeat-confirm">👍 I said it!</button>`}
      <div class="repeat-status" aria-live="polite"></div>
    </div>
  `;

  app.querySelector('.back').addEventListener('click', () => navigate('/hub'));
  app.querySelector('.repeat-play-word').addEventListener('click', () => playNarrator(`word-${wordId}`));

  const status = app.querySelector('.repeat-status');
  if (speechAvailable) {
    const mic = app.querySelector('.repeat-mic');
    let listening = false;
    mic.addEventListener('click', async () => {
      if (listening) return;          // double-tap guard
      listening = true;
      mic.disabled = true;
      mic.textContent = '🎤 Listening…';
      status.textContent = '';
      const result = await recognize({ expected: word.text, timeoutMs: 5000 });
      // Guard: if user navigated away the mic element will have been replaced
      if (!app.contains(mic)) return;
      listening = false;
      mic.disabled = false;
      mic.textContent = `🎤 Tap and say "${word.text}"`;
      if (result.matched) {
        playSfx('ding');
        playNarrator('great-job');
        setTimeout(onComplete, 800);
      } else {
        status.textContent = result.transcript ? `Heard: "${result.transcript}"` : 'Try again!';
        playNarrator('try-again');
      }
    });
  } else {
    app.querySelector('.repeat-confirm').addEventListener('click', () => {
      playSfx('ding');
      playNarrator('great-job');
      setTimeout(onComplete, 800);
    });
  }
}
