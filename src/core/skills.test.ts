import { newModel, recordResult, mastery, nextSkill, placementSkills, estimateGrade } from './skills';
import { SKILLS } from './curriculum';

describe('skill model', () => {
  it('starts uncertain at 0.5 mastery', () => {
    expect(mastery(newModel(), 'addition-basic')).toBeCloseTo(0.5);
  });
  it('correct answers raise and wrong lower mastery', () => {
    let m = newModel();
    m = recordResult(m, 'addition-basic', true);
    const up = mastery(m, 'addition-basic');
    expect(up).toBeGreaterThan(0.5);
    m = recordResult(m, 'addition-basic', false);
    expect(mastery(m, 'addition-basic')).toBeLessThan(up);
  });
  it('placement probes span grades from low to high', () => {
    const p = placementSkills();
    expect(p.length).toBeGreaterThanOrEqual(5);
    const grades = p.map((s) => s.grade);
    expect([...grades].sort((a, b) => a - b)).toEqual(grades);
  });
  it('nextSkill picks the frontier: unlocked, not mastered, closest to 0.6', () => {
    let m = newModel();
    const first = nextSkill(m);
    expect(first.prerequisites).toEqual([]);
    for (const s of SKILLS) m = { ...m, [s.id]: { correct: 20, wrong: 0 } };
    m = { ...m, [SKILLS[SKILLS.length - 1].id]: { correct: 1, wrong: 1 } };
    expect(nextSkill(m).id).toBe(SKILLS[SKILLS.length - 1].id);
  });
  it('estimateGrade reflects mastered skills', () => {
    expect(estimateGrade(newModel())).toBeLessThanOrEqual(3);
    let m = newModel();
    for (const s of SKILLS) m = { ...m, [s.id]: { correct: 20, wrong: 0 } };
    expect(estimateGrade(m)).toBeGreaterThanOrEqual(7);
  });
});

describe('placement credit', () => {
  it('correct probe credits the skill and all prerequisites; wrong probe only marks the skill', async () => {
    const { creditPlacement } = await import('./skills');
    const ok = creditPlacement(newModel(), 'multiplication-tables', true);
    expect(mastery(ok, 'multiplication-tables')).toBeGreaterThan(0.7);
    expect(mastery(ok, 'addition-basic')).toBeGreaterThan(0.7);
    expect(mastery(ok, 'counting-to-100')).toBeGreaterThan(0.7);
    const bad = creditPlacement(newModel(), 'multiplication-tables', false);
    expect(mastery(bad, 'multiplication-tables')).toBeLessThan(0.4);
    expect(mastery(bad, 'addition-basic')).toBe(0.5);
  });
});
