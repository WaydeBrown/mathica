import { loadState, saveState, initialState } from './storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());
  it('returns initial state when empty or corrupt', () => {
    expect(loadState()).toEqual(initialState());
    localStorage.setItem('mathica:v1', '{bad');
    expect(loadState()).toEqual(initialState());
  });
  it('round-trips', () => {
    const s = { ...initialState(), profile: { name: 'Elsa', language: 'en' as const } };
    saveState(s);
    expect(loadState()).toEqual(s);
  });
});
