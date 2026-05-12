import collectibles from '../data/collectibles.json' with { type: 'json' };
import { state } from '../state.js';
import { navigate } from '../router.js';
import { canAfford, spend } from '../currency.js';
import { playNarrator, preload, playSfx } from '../audio.js';

const RARITY_LABEL = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary', mythic: 'Mythic' };

export async function render(app) {
  await Promise.all([
    preload('shop-welcome', 'assets/audio/narrator/shop-welcome.mp3'),
    preload('ding', 'assets/audio/sfx/ding.mp3'),
    preload('try-again', 'assets/audio/narrator/try-again.mp3')
  ]);
  playNarrator('shop-welcome');

  app.innerHTML = `
    <div class="screen shop-screen">
      <div class="topbar">
        <button class="back">←</button>
        <div class="currency">
          <span>🪙 <span class="coins">${state.currency.coins}</span></span>
          <span>💎 <span class="gems">${state.currency.gems}</span></span>
        </div>
      </div>
      <h2>Goofy Shop</h2>
      <div class="shop-grid">
        ${collectibles.map(c => shopCard(c)).join('')}
      </div>
    </div>
  `;
  app.querySelector('.back').addEventListener('click', () => navigate('/hub'));

  app.querySelectorAll('.shop-item').forEach(card => {
    card.addEventListener('click', () => onBuy(app, card.dataset.id));
  });
}

function shopCard(c) {
  const owned = state.inventory.owned.includes(c.id);
  const symbol = c.price.currency === 'coins' ? '🪙' : '💎';
  return `
    <button class="shop-item rarity-${c.rarity} ${owned ? 'owned' : ''}" data-id="${c.id}" ${owned ? 'disabled' : ''}>
      <div class="shop-emoji">${c.emoji}</div>
      <div class="shop-name">${c.name}</div>
      <div class="shop-rarity">${RARITY_LABEL[c.rarity]}</div>
      <div class="shop-price">${owned ? 'Owned ✓' : `${symbol} ${c.price.amount}`}</div>
    </button>
  `;
}

function onBuy(app, id) {
  const item = collectibles.find(c => c.id === id);
  if (!item) return;
  if (state.inventory.owned.includes(id)) return;
  if (!canAfford(state.currency, item.price)) {
    const card = app.querySelector(`[data-id="${id}"]`);
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);
    playNarrator('try-again');
    return;
  }
  const after = spend(state.currency, item.price);
  state.currency.coins = after.coins;
  state.currency.gems = after.gems;
  state.inventory.owned = [...state.inventory.owned, id];
  playSfx('ding');
  render(app);
}
