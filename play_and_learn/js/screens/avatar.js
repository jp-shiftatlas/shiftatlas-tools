import { state } from '../state.js';
import { navigate } from '../router.js';
import { playNarrator, preload } from '../audio.js';

const BASES = [
  { id: 'boy-1', emoji: '👦' },
  { id: 'boy-2', emoji: '🧑' },
  { id: 'girl-1', emoji: '👧' },
  { id: 'girl-2', emoji: '👱‍♀️' }
];
const COLORS = ['#fbbf24', '#ef4444', '#10b981', '#3b82f6', '#a855f7', '#ec4899'];

export async function render(app) {
  await preload('pick-character', 'assets/audio/narrator/pick-character.mp3');
  playNarrator('pick-character');

  app.innerHTML = `
    <div class="screen avatar-screen">
      <h2>Pick your character!</h2>
      <div class="avatar-bases">
        ${BASES.map(b => `
          <button class="avatar-base ${state.player.avatar.base === b.id ? 'selected' : ''}" data-base="${b.id}">
            <span class="emoji">${b.emoji}</span>
          </button>
        `).join('')}
      </div>
      <h3>Pick a color!</h3>
      <div class="avatar-colors">
        ${COLORS.map(c => `
          <button class="avatar-color ${state.player.avatar.color === c ? 'selected' : ''}" data-color="${c}" style="background:${c}" aria-label="Color ${c}"></button>
        `).join('')}
      </div>
      <button class="avatar-done">Let's go!</button>
    </div>
  `;

  app.querySelectorAll('.avatar-base').forEach(btn => {
    btn.addEventListener('click', () => {
      state.player.avatar.base = btn.dataset.base;
      app.querySelectorAll('.avatar-base').forEach(b => b.classList.toggle('selected', b === btn));
    });
  });
  app.querySelectorAll('.avatar-color').forEach(btn => {
    btn.addEventListener('click', () => {
      state.player.avatar.color = btn.dataset.color;
      app.querySelectorAll('.avatar-color').forEach(b => b.classList.toggle('selected', b === btn));
    });
  });
  app.querySelector('.avatar-done').addEventListener('click', () => {
    if (!state.player.name) state.player.name = 'Friend';
    navigate('/hub');
  });
}
