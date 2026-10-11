import type { Lang } from '../i18n/strings';
import { newModel, type SkillModel } from './skills';
import { newProgress, type Progress } from './gamification';

export interface AppState {
  profile: { name: string; language: Lang } | null;
  model: SkillModel;
  progress: Progress;
  placementIndex: number;
  placementWrong: number;
  placementDone: boolean;
}

const KEY = 'mathica:v1';

export const initialState = (): AppState => ({
  profile: null, model: newModel(), progress: newProgress(), placementIndex: 0, placementWrong: 0, placementDone: false,
});

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initialState(), ...JSON.parse(raw) } : initialState();
  } catch {
    return initialState();
  }
}

export function saveState(s: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
