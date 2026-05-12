import collectibles from '../data/collectibles.json' with { type: 'json' };
import { state } from '../state.js';
import { navigate } from '../router.js';
import { playSfx, preload } from '../audio.js';

const CATEGORIES = [
  { id: 'pet', label: 'Pets' },
  { id: 'hat', label: 'Hats' },
  { id: 'accessory', label: 'Accessories' }
];

export async function render(app) {
  await preload('tap', 'assets/audio/sfx/tap.mp3');
  app.innerHTML = `
    <div class="screen inventory-screen">
      <div class="topbar"><button class="back">←</button><span class="instruction">My Stuff</span><span></span></div>
      ${CATEGORIES.map(cat => sectionFor(cat)).join('')}
    </div>
  `;
  app.querySelector('.back').addEventListener('click', () => navigate('/hub'));
  app.querySelectorAll('.inv-item').forEach(btn => {
    btn.addEventListener('click', () => toggleEquip(app, btn.dataset.id, btn.dataset.cat));
  });
}

function sectionFor(cat) {
  const owned = collectibles.filter(c => c.category === cat.id && state.inventory.owned.includes(c.id));
  if (owned.length === 0) {
    return `<div class="inv-section"><h3>${cat.label}</h3><p class="fg-muted">None yet — visit the shop!</p></div>`;
  }
  return `
    <div class="inv-section">
      <h3>${cat.label}</h3>
      <div class="inv-grid">
        ${owned.map(c => `
          <button class="inv-item ${state.inventory.equipped[cat.id] === c.id ? 'equipped' : ''}" data-id="${c.id}" data-cat="${cat.id}">
            <div class="shop-emoji">${c.emoji}</div>
            <div class="shop-name">${c.name}</div>
            <div class="shop-price">${state.inventory.equipped[cat.id] === c.id ? 'Equipped ✓' : 'Equip'}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleEquip(app, id, cat) {
  playSfx('tap');
  state.inventory.equipped[cat] = state.inventory.equipped[cat] === id ? null : id;
  render(app);
}
