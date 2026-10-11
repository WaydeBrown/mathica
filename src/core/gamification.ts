export interface Progress {
  xp: number;
  coins: number;
  combo: number;
  streak: number;
  bestStreak: number;
  lastDay: string | null;
}

export interface CashOutRequest {
  coins: number;
  amountSek: number;
  status: 'pending' | 'approved' | 'declined';
}

export const COINS_PER_SEK = 10;

export const newProgress = (): Progress => ({ xp: 0, coins: 0, combo: 0, streak: 0, bestStreak: 0, lastDay: null });

export const xpForLevel = (level: number): number => 25 * (level - 1) * level;

export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function applyAnswer(p: Progress, correct: boolean): Progress {
  if (!correct) return { ...p, combo: 0, xp: p.xp + 2 }; // effort XP: never punish trying
  const combo = p.combo + 1;
  return { ...p, combo, xp: p.xp + 10 + 5 * Math.min(combo - 1, 10), coins: p.coins + (combo % 5 === 0 ? 3 : 1) };
}

const DAY = 86_400_000;
const dayNumber = (iso: string): number => Math.floor(Date.parse(`${iso}T00:00:00Z`) / DAY);

export function touchStreak(p: Progress, today: string): Progress {
  if (p.lastDay === today) return p;
  const consecutive = p.lastDay !== null && dayNumber(today) - dayNumber(p.lastDay) === 1;
  const streak = consecutive ? p.streak + 1 : 1;
  return { ...p, streak, bestStreak: Math.max(p.bestStreak, streak), lastDay: today };
}

export const coinsToMoney = (coins: number): number => coins / COINS_PER_SEK;

export function cashOut(p: Progress, coins: number): { progress: Progress; request: CashOutRequest } {
  if (!Number.isInteger(coins) || coins <= 0 || coins > p.coins) throw new Error('Invalid cash out amount');
  return {
    progress: { ...p, coins: p.coins - coins },
    request: { coins, amountSek: coinsToMoney(coins), status: 'pending' },
  };
}
