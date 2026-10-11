import { MASTERY_THRESHOLD, SKILLS, prerequisitesMet, type Skill } from './curriculum';

export type SkillModel = Record<string, { correct: number; wrong: number }>;

export const TARGET_MASTERY = 0.6; // the "fine line": hard enough to challenge, easy enough to stay engaged
const MASTERED = 0.85;

export const newModel = (): SkillModel => ({});

export function mastery(model: SkillModel, id: string): number {
  const r = model[id] ?? { correct: 0, wrong: 0 };
  return (r.correct + 1) / (r.correct + r.wrong + 2);
}

export function recordResult(model: SkillModel, id: string, correct: boolean): SkillModel {
  const r = model[id] ?? { correct: 0, wrong: 0 };
  return { ...model, [id]: { correct: r.correct + (correct ? 1 : 0), wrong: r.wrong + (correct ? 0 : 1) } };
}

export function masteryMap(model: SkillModel): Record<string, number> {
  return Object.fromEntries(SKILLS.map((s) => [s.id, mastery(model, s.id)]));
}

/** One probe per school year, lowest to highest, used for the initial level test. */
export function placementSkills(): Skill[] {
  const byGrade = new Map<number, Skill>();
  for (const s of SKILLS) if (!byGrade.has(s.grade)) byGrade.set(s.grade, s);
  return [...byGrade.values()].sort((a, b) => a.grade - b.grade);
}

export function nextSkill(model: SkillModel): Skill {
  const m = masteryMap(model);
  const candidates = SKILLS.filter((s) => prerequisitesMet(s, m) && m[s.id] < MASTERED);
  if (candidates.length === 0) {
    return [...SKILLS].sort((a, b) => m[a.id] - m[b.id])[0];
  }
  return candidates.reduce((best, s) => (Math.abs(m[s.id] - TARGET_MASTERY) < Math.abs(m[best.id] - TARGET_MASTERY) ? s : best));
}

export function estimateGrade(model: SkillModel): number {
  const grades = [...new Set(SKILLS.map((s) => s.grade))].sort((a, b) => a - b);
  let est = grades[0];
  for (const g of grades) {
    const inGrade = SKILLS.filter((s) => s.grade === g);
    const avg = inGrade.reduce((sum, s) => sum + mastery(model, s.id), 0) / inGrade.length;
    if (avg >= MASTERY_THRESHOLD - 0.1) est = g;
    else break;
  }
  return est;
}

/** Placement test: a correct probe implies its prerequisites are known; a wrong one only marks that skill. */
export function creditPlacement(model: SkillModel, skillId: string, correct: boolean): SkillModel {
  const next = { ...model };
  if (!correct) {
    const r = next[skillId] ?? { correct: 0, wrong: 0 };
    next[skillId] = { ...r, wrong: r.wrong + 2 };
    return next;
  }
  const stack = [skillId];
  const seen = new Set<string>();
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const r = next[id] ?? { correct: 0, wrong: 0 };
    next[id] = { ...r, correct: r.correct + 3 };
    stack.push(...SKILLS.find((s) => s.id === id)!.prerequisites);
  }
  return next;
}
