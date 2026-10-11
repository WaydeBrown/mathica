import { STRINGS, t } from './strings';

describe('i18n', () => {
  it('sv and en have identical keys', () => {
    expect(Object.keys(STRINGS.sv).sort()).toEqual(Object.keys(STRINGS.en).sort());
  });
  it('interpolates', () => {
    expect(t('sv', 'level', { n: 3 })).toContain('3');
  });
});
