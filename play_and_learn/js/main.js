import { createRouter } from './router.js';
import * as splash from './screens/splash.js';
import * as avatar from './screens/avatar.js';
import * as hub from './screens/hub.js';
import * as lessonRunner from './screens/lesson-runner.js';
import * as shop from './screens/shop.js';
import * as inventory from './screens/inventory.js';

const app = document.getElementById('app');

const routes = {
  '/': () => splash.render(app),
  '/splash': () => splash.render(app),
  '/avatar': () => avatar.render(app),
  '/hub': () => hub.render(app),
  '/lesson/:lessonId': (params) => lessonRunner.render(app, params),
  '/shop': () => shop.render(app),
  '/inventory': () => inventory.render(app)
};

createRouter(routes, (handler, params) => handler(params));
