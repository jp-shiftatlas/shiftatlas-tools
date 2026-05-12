const STORAGE_KEY = 'letterland.state.v1';
const SCHEMA_VERSION = 1;

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    player: { name: '', avatar: { base: 'boy-1', color: '#fbbf24' } },
    currency: { coins: 0, gems: 0 },
    progress: {
      writing: { completed: [] },
      speaking: { completed: [] },
      listening: { completed: [] }
    },
    inventory: { owned: [], equipped: { pet: null, hat: null, accessory: null } },
    lastDailyClaim: null
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion !== SCHEMA_VERSION) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
}

function save(target) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
  } catch {
    // Quota exceeded or private mode — silently continue with in-memory state
  }
}

function makeReactive(root, target) {
  return new Proxy(target, {
    get(obj, prop) {
      const v = obj[prop];
      if (v && typeof v === 'object') return makeReactive(root, v);
      return v;
    },
    set(obj, prop, value) {
      obj[prop] = value;
      save(root);
      return true;
    },
    deleteProperty(obj, prop) {
      delete obj[prop];
      save(root);
      return true;
    }
  });
}

const raw = load();
export const state = makeReactive(raw, raw);

function deepAssign(target, source) {
  // Remove keys not in source
  for (const key of Object.keys(target)) {
    if (!(key in source)) delete target[key];
  }
  // Assign/recurse keys from source
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
      deepAssign(target[k], v);
    } else {
      target[k] = v;
    }
  }
}

export function resetState() {
  const d = defaultState();
  deepAssign(raw, d);
  save(raw);
}
