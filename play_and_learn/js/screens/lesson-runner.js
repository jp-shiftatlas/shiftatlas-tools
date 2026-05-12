import lessons from '../data/lessons.json' with { type: 'json' };
import { state } from '../state.js';
import { navigate } from '../router.js';
import * as reward from './reward.js';

const games = {};
async function getGame(type) {
  if (!games[type]) {
    games[type] = await import(`../games/${type}.js`);
  }
  return games[type];
}

export async function render(app, params) {
  const lesson = lessons.find(l => l.id === decodeURIComponent(params.lessonId));
  if (!lesson) { navigate('/hub'); return; }
  const game = await getGame(lesson.gameType);
  game.render(app, lesson, () => onLessonComplete(app, lesson));
}

let completing = false;

function onLessonComplete(app, lesson) {
  // Guard against double-fire (e.g. two rapid taps on a "done" button)
  if (completing) return;
  completing = true;

  const completedSet = new Set(state.progress[lesson.island].completed);
  if (!completedSet.has(lesson.id)) {
    state.progress[lesson.island].completed = [...completedSet, lesson.id];
  }
  state.currency.coins = state.currency.coins + (lesson.rewards.coins || 0);
  reward.render(app, lesson).finally(() => {
    completing = false;
  });
}
