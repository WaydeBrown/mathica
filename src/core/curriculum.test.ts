import { SKILLS, skillById, prerequisitesMet } from './curriculum';

describe('curriculum (Lgr22 inspired)', () => {
  it('has unique ids, valid prerequisites and both languages', () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    expect(ids.size).toBe(SKILLS.length);
    for (const s of SKILLS) {
      s.prerequisites.forEach((p) => expect(ids.has(p)).toBe(true));
      expect(s.name.sv && s.name.en).toBeTruthy();
      expect(s.grade).toBeGreaterThanOrEqual(2);
      expect(s.grade).toBeLessThanOrEqual(9);
    }
  });
  it('has no cycles', () => {
    const seen = new Set<string>();
    for (const s of SKILLS) {
      expect(s.prerequisites.every((p) => seen.has(p))).toBe(true);
      seen.add(s.id);
    }
  });
  it('prerequisitesMet uses mastery threshold', () => {
    const s = skillById('multiplication-tables');
    expect(prerequisitesMet(s, {})).toBe(false);
    const m = Object.fromEntries(s.prerequisites.map((p) => [p, 0.9]));
    expect(prerequisitesMet(s, m)).toBe(true);
  });
});
