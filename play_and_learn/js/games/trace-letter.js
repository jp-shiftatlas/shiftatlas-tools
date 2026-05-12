import { playNarrator, preload, playSfx } from '../audio.js';
import { navigate } from '../router.js';

const CANVAS_SIZE = 480;
const STROKE_WIDTH = 28;
const TARGET_COVERAGE = 0.25;

export async function render(app, lesson, onComplete) {
  const { letter } = lesson.params;
  await Promise.all([
    preload(lesson.narrationKey, `assets/audio/narrator/${lesson.narrationKey}.mp3`),
    preload('try-again', 'assets/audio/narrator/try-again.mp3'),
    preload('ding', 'assets/audio/sfx/ding.mp3')
  ]);
  playNarrator(lesson.narrationKey);

  app.innerHTML = `
    <div class="screen trace-screen">
      <div class="topbar"><button class="back">←</button><span class="instruction">Trace the letter ${letter}!</span><span></span></div>
      <div class="trace-stage">
        <canvas class="trace-canvas" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"></canvas>
      </div>
      <div class="trace-actions">
        <button class="trace-clear">🔄 Try again</button>
        <button class="trace-done">✓ Done!</button>
      </div>
    </div>
  `;
  app.querySelector('.back').addEventListener('click', () => navigate('/hub'));

  const canvas = app.querySelector('.trace-canvas');
  const ctx = canvas.getContext('2d');

  // Stencil layer (letter outline)
  const stencil = document.createElement('canvas');
  stencil.width = stencil.height = CANVAS_SIZE;
  const sctx = stencil.getContext('2d');
  sctx.fillStyle = 'rgba(148,163,184,0.3)';
  sctx.font = `bold ${CANVAS_SIZE * 0.9}px sans-serif`;
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);

  // User strokes layer
  const userLayer = document.createElement('canvas');
  userLayer.width = userLayer.height = CANVAS_SIZE;
  const uctx = userLayer.getContext('2d');
  uctx.lineCap = 'round';
  uctx.lineJoin = 'round';
  uctx.lineWidth = STROKE_WIDTH;
  uctx.strokeStyle = '#fbbf24';

  function repaint() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(stencil, 0, 0);
    ctx.drawImage(userLayer, 0, 0);
  }
  repaint();

  let drawing = false;
  let last = null;

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return {
      x: (t.clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (t.clientY - rect.top) * (CANVAS_SIZE / rect.height)
    };
  }

  function start(e) { e.preventDefault(); drawing = true; last = pos(e); }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    uctx.beginPath();
    uctx.moveTo(last.x, last.y);
    uctx.lineTo(p.x, p.y);
    uctx.stroke();
    last = p;
    repaint();
  }
  function end() { drawing = false; last = null; }

  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', end);

  app.querySelector('.trace-clear').addEventListener('click', () => {
    uctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    repaint();
  });

  app.querySelector('.trace-done').addEventListener('click', () => {
    const coverage = computeCoverage(stencil, userLayer);
    if (coverage >= TARGET_COVERAGE) {
      playSfx('ding');
      onComplete();
    } else {
      playNarrator('try-again');
    }
  });
}

function computeCoverage(stencil, userLayer) {
  const w = stencil.width, h = stencil.height;
  const s = stencil.getContext('2d').getImageData(0, 0, w, h).data;
  const u = userLayer.getContext('2d').getImageData(0, 0, w, h).data;
  let stencilPixels = 0, overlapPixels = 0;
  for (let i = 3; i < s.length; i += 4) {
    if (s[i] > 0) {
      stencilPixels++;
      if (u[i] > 0) overlapPixels++;
    }
  }
  return stencilPixels === 0 ? 0 : overlapPixels / stencilPixels;
}
