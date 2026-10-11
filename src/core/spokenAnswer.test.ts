import { parseSpokenNumber } from './spokenAnswer';

describe('parseSpokenNumber', () => {
  it.each([
    ['sju', 'sv', 7], ['tjugotre', 'sv', 23], ['hundra', 'sv', 100], ['hundratjugo', 'sv', 120],
    ['tre komma fem', 'sv', 3.5], ['minus fyra', 'sv', -4], ['42', 'sv', 42], ['fem hundra', 'sv', 500],
    ['twenty three', 'en', 23], ['forty', 'en', 40],
  ] as const)('%s (%s) -> %s', (t, l, n) => expect(parseSpokenNumber(t, l)).toBe(n));
  it('returns null for non numbers', () => expect(parseSpokenNumber('banan', 'sv')).toBeNull());
});
