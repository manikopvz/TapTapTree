const DEFAULT_STATE = () => ({
  apples: 0,
  lifetime: 0,
  taps: 0,
  best: 0,
  combo: 0,
  crits: 0,
  bestTap: 0,
  goldens: 0,
  rains: 0,
  frenzies: 0,
  meter: 0,
  frenzy: 0,
  seeds: 0,
  seedTotal: 0,
  rebirths: 0,
  playTime: 0,
  up: {},
  skills: {},
  ach: [],
  savedAt: Date.now(),
});

export class SaveSystem {
  key = 'tap-tap-tree-v4';
  legacyKey = 'tap-tap-tree-v3';

  load() {
    const base = DEFAULT_STATE();
    try {
      const raw = localStorage.getItem(this.key) || localStorage.getItem(this.legacyKey) || '{}';
      const loaded = JSON.parse(raw);
      const state = Object.assign(base, loaded);
      state.up = { ...(loaded.up || {}) };
      state.skills = { ...(loaded.skills || {}) };
      state.ach = Array.isArray(loaded.ach) ? loaded.ach : [];
      state.seedTotal = Math.max(Number(state.seedTotal) || 0, Number(state.seeds) || 0);
      return state;
    } catch {
      return base;
    }
  }

  save(state) {
    state.savedAt = Date.now();
    localStorage.setItem(this.key, JSON.stringify(state));
  }

  offlineSeconds(state) {
    return Math.min(28_800, Math.max(0, (Date.now() - (state.savedAt || Date.now())) / 1000));
  }
}
