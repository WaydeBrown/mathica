import type { Lang } from '../i18n/strings';

export interface Skill {
  id: string;
  /** Approximate Swedish school year (Lgr22), 2-9 */
  grade: number;
  area: 'number' | 'algebra' | 'geometry' | 'probability' | 'relationships';
  name: Record<Lang, string>;
  prerequisites: string[];
}

export const MASTERY_THRESHOLD = 0.8;

const s = (id: string, grade: number, area: Skill['area'], sv: string, en: string, prerequisites: string[] = []): Skill => ({
  id, grade, area, name: { sv, en }, prerequisites,
});

/** Topologically ordered: every prerequisite appears earlier in the list. */
export const SKILLS: Skill[] = [
  s('counting-to-100', 2, 'number', 'Talen till 100', 'Numbers to 100'),
  s('addition-basic', 2, 'number', 'Addition', 'Addition', ['counting-to-100']),
  s('subtraction-basic', 2, 'number', 'Subtraktion', 'Subtraction', ['counting-to-100']),
  s('multiplication-tables', 3, 'number', 'Multiplikationstabellen', 'Times tables', ['addition-basic']),
  s('division-basic', 3, 'number', 'Division', 'Division', ['multiplication-tables', 'subtraction-basic']),
  s('place-value-1000', 3, 'number', 'Positionssystemet till 1000', 'Place value to 1000', ['addition-basic']),
  s('addition-subtraction-large', 4, 'number', 'Räkna med stora tal', 'Large number arithmetic', ['place-value-1000', 'subtraction-basic']),
  s('fractions-intro', 4, 'number', 'Bråk', 'Fractions', ['division-basic']),
  s('decimals-intro', 4, 'number', 'Decimaltal', 'Decimals', ['place-value-1000']),
  s('geometry-perimeter-area', 4, 'geometry', 'Omkrets och area', 'Perimeter and area', ['multiplication-tables']),
  s('multiplication-long', 5, 'number', 'Multiplikation med flersiffriga tal', 'Long multiplication', ['multiplication-tables', 'addition-subtraction-large']),
  s('fractions-operations', 5, 'number', 'Räkna med bråk', 'Fraction operations', ['fractions-intro']),
  s('percent-intro', 5, 'relationships', 'Procent', 'Percent', ['fractions-intro', 'decimals-intro']),
  s('unknowns-simple-equations', 6, 'algebra', 'Enkla ekvationer', 'Simple equations', ['multiplication-long']),
  s('negative-numbers', 6, 'number', 'Negativa tal', 'Negative numbers', ['addition-subtraction-large']),
  s('probability-intro', 6, 'probability', 'Sannolikhet', 'Probability', ['fractions-operations']),
  s('ratio-proportion', 7, 'relationships', 'Förhållande och proportionalitet', 'Ratio and proportion', ['percent-intro', 'fractions-operations']),
  s('equations-linear', 7, 'algebra', 'Linjära ekvationer', 'Linear equations', ['unknowns-simple-equations', 'negative-numbers']),
  s('geometry-angles-triangles', 7, 'geometry', 'Vinklar och trianglar', 'Angles and triangles', ['geometry-perimeter-area']),
  s('powers-roots', 8, 'number', 'Potenser och rötter', 'Powers and roots', ['multiplication-long']),
  s('functions-linear', 8, 'algebra', 'Linjära funktioner', 'Linear functions', ['equations-linear']),
  s('pythagoras', 9, 'geometry', 'Pythagoras sats', 'Pythagorean theorem', ['powers-roots', 'geometry-angles-triangles']),
  s('equation-systems', 9, 'algebra', 'Ekvationssystem', 'Systems of equations', ['functions-linear']),
];

export function skillById(id: string): Skill {
  const found = SKILLS.find((x) => x.id === id);
  if (!found) throw new Error(`Unknown skill ${id}`);
  return found;
}

export function prerequisitesMet(skill: Skill, mastery: Record<string, number>): boolean {
  return skill.prerequisites.every((p) => (mastery[p] ?? 0) >= MASTERY_THRESHOLD);
}
