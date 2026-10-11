import { applyAnswer, levelForXp, newProgress, xpForLevel, coinsToMoney, cashOut, touchStreak } from './gamification';

describe('gamification', () => {
  it('levels rise with xp', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(xpForLevel(5))).toBe(5);
    expect(levelForXp(xpForLevel(5) - 1)).toBe(4);
  });
  it('correct answers award xp and coins, combo bonus grows', () => {
    let p = newProgress();
    p = applyAnswer(p, true);
    const first = p.xp;
    expect(first).toBeGreaterThan(0);
    p = applyAnswer(p, true);
    p = applyAnswer(p, true);
    expect(p.combo).toBe(3);
    expect(p.xp - first).toBeGreaterThan(2 * first - 1);
  });
  it('wrong answer resets combo but never removes xp', () => {
    let p = applyAnswer(applyAnswer(newProgress(), true), true);
    const xp = p.xp;
    p = applyAnswer(p, false);
    expect(p.combo).toBe(0);
    expect(p.xp).toBeGreaterThanOrEqual(xp);
  });
  it('streak counts consecutive days and does not punish gaps harshly', () => {
    let p = newProgress();
    p = touchStreak(p, '2025-01-01');
    p = touchStreak(p, '2025-01-01');
    expect(p.streak).toBe(1);
    p = touchStreak(p, '2025-01-02');
    expect(p.streak).toBe(2);
    p = touchStreak(p, '2025-01-05');
    expect(p.streak).toBe(1);
    expect(p.bestStreak).toBe(2);
  });
  it('cash out converts coins to money, parent approved request', () => {
    const p = { ...newProgress(), coins: 250 };
    expect(coinsToMoney(250)).toBe(25);
    const r = cashOut(p, 100);
    expect(r.progress.coins).toBe(150);
    expect(r.request).toEqual({ coins: 100, amountSek: 10, status: 'pending' });
    expect(() => cashOut(p, 1000)).toThrow();
  });
});
