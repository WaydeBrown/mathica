import { estimateGrade, mastery, type SkillModel } from './skills';
import { SKILLS } from './curriculum';
import type { Lang } from '../i18n/strings';

export interface Learner {
  name: string;
  birthYear: number;
  model: SkillModel;
  language: Lang;
}

export interface LearnerContext {
  language: Lang;
  estimatedGrade: number;
  skills: { id: string; mastery: number; attempts: number }[];
}

/** Only competence data leaves the device. Name, age and identity are never included. */
export function buildLearnerContext(l: Learner): LearnerContext {
  return {
    language: l.language,
    estimatedGrade: estimateGrade(l.model),
    skills: SKILLS.map((s) => ({
      id: s.id,
      mastery: Math.round(mastery(l.model, s.id) * 100) / 100,
      attempts: (l.model[s.id]?.correct ?? 0) + (l.model[s.id]?.wrong ?? 0),
    })),
  };
}

const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function scrubText(text: string, names: string[] = []): string {
  let out = text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[dold]')
    .replace(/\+?\d[\d\s-]{7,}\d/g, '[dold]');
  for (const n of names.filter(Boolean)) out = out.replace(new RegExp(escapeRe(n), 'gi'), '[dold]');
  return out;
}
