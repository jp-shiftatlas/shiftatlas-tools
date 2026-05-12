import { state } from '../state.js';
import { navigate } from '../router.js';
import { playNarrator, preload } from '../audio.js';
import lessons from '../data/lessons.json' with { type: 'json' };

const ISLANDS = [
  { id: 'writing', name: 'Writing Woods', emoji: '🌲', color: '#10b981' },
  { id: 'speaking', name: 'Speaking Mountain', emoji: '⛰️', color: '#f59e0b' },
  { id: 'listening', name: 'Listening Lagoon', emoji: '🌊', color: '#3b82f6' }
];

function firstLessonId(islandId) {
  const filtered = lessons.filter(l => l.island === islandId).sort((a, b) => a.order - b.order);
  return filtered[0]?.id;
}

function completedCount(islandId) {
  return state.progress[islandId]?.completed?.length ?? 0;
}

function totalCount(islandId) {
  return lessons.filter(l => l.island === islandId).length;
}

function avatarEmoji() {
  const map = { 'boy-1': '👦', 'boy-2': '🧑', 'girl-1': '👧', 'girl-2': '👱‍♀️' };
  return map[state.player.avatar.base] || '👦';
}

export async function render(app) {
  await preload('hub-welcome', 'assets/audio/narrator/hub-welcome.mp3');
  playNarrator('hub-welcome');

  // Sanitize avatar color to prevent CSS injection — only allow valid hex colors
  const rawColor = state.player.avatar?.color ?? '#fbbf24';
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(rawColor) ? rawColor : '#fbbf24';

  // Sanitize player name — escape HTML to prevent XSS
  const rawName = state.player.name || 'Friend';
  const safeName = rawName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  app.innerHTML = `
    <div class="screen hub-screen">
      <div class="topbar">
        <div class="player">
          <span class="avatar-chip" style="background:${safeColor}">${avatarEmoji()}</span>
          <span>${safeName}</span>
        </div>
        <div class="topbar-right">
          <div class="currency">
            <span>🪙 ${state.currency.coins}</span>
            <span>💎 ${state.currency.gems}</span>
          </div>
          <button class="backpack" aria-label="My stuff">🎒</button>
        </div>
      </div>
      <h2>Where to today?</h2>
      <div class="island-grid">
        ${ISLANDS.map(i => `
          <button class="island-card" data-island="${i.id}" style="background:${i.color}33; border-color:${i.color}">
            <div class="island-emoji">${i.emoji}</div>
            <div class="island-name">${i.name}</div>
            <div class="island-progress">${completedCount(i.id)}/${totalCount(i.id)} ⭐</div>
          </button>
        `).join('')}
        <button class="island-card shop-card" data-action="shop">
          <div class="island-emoji">🛒</div>
          <div class="island-name">Goofy Shop</div>
          <div class="island-progress">Visit</div>
        </button>
      </div>
    </div>
  `;

  app.querySelectorAll('.island-card[data-island]').forEach(btn => {
    btn.addEventListener('click', () => {
      const island = btn.dataset.island;
      const lessonId = firstLessonId(island);
      if (lessonId) navigate(`/lesson/${encodeURIComponent(lessonId)}`);
    });
  });
  app.querySelector('[data-action="shop"]').addEventListener('click', () => navigate('/shop'));
  app.querySelector('.backpack').addEventListener('click', () => navigate('/inventory'));
}
