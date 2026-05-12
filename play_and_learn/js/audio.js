const cache = new Map();
let unlocked = false;
let currentNarrator = null;

export function unlock() {
  if (unlocked) return;
  // Play a silent buffer to satisfy autoplay policy on iOS Safari
  const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
  audio.play().then(() => { unlocked = true; }).catch(() => { unlocked = true; });
}

export async function preload(key, url) {
  if (cache.has(key)) return cache.get(key);
  const audio = new Audio(url);
  audio.preload = 'auto';
  cache.set(key, audio);
  return audio;
}

export async function preloadMany(map) {
  return Promise.all(Object.entries(map).map(([k, v]) => preload(k, v)));
}

export function playNarrator(key) {
  if (currentNarrator) {
    currentNarrator.pause();
    currentNarrator.currentTime = 0;
  }
  const audio = cache.get(key);
  if (!audio) {
    console.warn(`Narrator clip not found: ${key}`);
    return Promise.resolve();
  }
  audio.currentTime = 0;
  currentNarrator = audio;
  return audio.play().catch(err => console.warn('Audio play failed:', err.message));
}

export function playSfx(key) {
  const audio = cache.get(key);
  if (!audio) return;
  // Sound effects can overlap; clone to allow re-trigger before completion
  const clone = audio.cloneNode();
  clone.play().catch(() => {});
}

export function stopAll() {
  if (currentNarrator) {
    currentNarrator.pause();
    currentNarrator.currentTime = 0;
    currentNarrator = null;
  }
}
