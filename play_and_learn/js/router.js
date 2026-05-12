export function parseHash(hash) {
  const trimmed = (hash || '').replace(/^#/, '');
  const path = trimmed === '' || trimmed === '/' ? '/' : trimmed;
  const parts = path === '/' ? [] : path.replace(/^\//, '').split('/');
  return { path, parts };
}

export function matchRoute(routes, path) {
  for (const [pattern, handler] of Object.entries(routes)) {
    const patternParts = pattern.replace(/^\//, '').split('/');
    const pathParts = path.replace(/^\//, '').split('/');
    if (path === '/' && pattern === '/') return { handler, params: {} };
    if (patternParts.length !== pathParts.length) continue;
    if (path === '/' && patternParts.length === 1 && patternParts[0].startsWith(':')) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { handler, params };
  }
  return null;
}

export function createRouter(routes, mount) {
  function render() {
    const { path } = parseHash(window.location.hash);
    const match = matchRoute(routes, path);
    if (match) {
      mount(match.handler, match.params);
    } else {
      window.location.hash = '#/';
    }
  }
  const onHash = () => render();
  const onLoad = () => render();
  window.addEventListener('hashchange', onHash);
  window.addEventListener('DOMContentLoaded', onLoad);
  if (document.readyState !== 'loading') render();
  return {
    render,
    teardown() {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('DOMContentLoaded', onLoad);
    }
  };
}

export function navigate(path) {
  window.location.hash = '#' + path;
}
