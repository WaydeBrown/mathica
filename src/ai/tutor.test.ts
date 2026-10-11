import { Tutor, extractJson, type LlmProvider } from './tutor';
import { buildLearnerContext } from '../core/privacy';
import { newModel } from '../core/skills';

const ctx = buildLearnerContext({ name: 'Elsa', birthYear: 2015, model: newModel(), language: 'sv' });

function fake(reply: string) {
  const calls: { role: string; content: string }[][] = [];
  const provider: LlmProvider = { complete: async (m) => { calls.push(m); return reply; } };
  return { provider, calls };
}

describe('extractJson', () => {
  it('handles fenced and noisy output', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJson('Här: {"a":2} klart')).toEqual({ a: 2 });
  });
  it('throws on garbage', () => expect(() => extractJson('nope')).toThrow());
});

describe('Tutor', () => {
  it('generates a question adapted to the learner without leaking identity', async () => {
    const { provider, calls } = fake('{"question":"Vad är 3 + 4?","answer":"7","hint":"Räkna uppåt"}');
    const q = await new Tutor(provider).generateQuestion(ctx, 'addition-basic');
    expect(q.question).toBe('Vad är 3 + 4?');
    const all = JSON.stringify(calls);
    expect(all).toContain('addition-basic');
    expect(all).toContain('estimatedGrade');
    expect(all).not.toContain('Elsa');
    expect(calls[0][0].role).toBe('system');
    expect(calls[0][0].content).toMatch(/svenska/i);
  });
  it('checks answers and explains', async () => {
    const { provider } = fake('{"correct":false,"feedback":"Nästan!","explanation":"Börja med tiotalen.","skillTip":"tiotal"}');
    const r = await new Tutor(provider).checkAnswer(ctx, { question: '23 + 19', skillId: 'addition-basic' }, '41');
    expect(r.correct).toBe(false);
    expect(r.explanation).toContain('tiotalen');
  });
  it('refuses non-math chat without calling the LLM', async () => {
    const { provider, calls } = fake('x');
    const r = await new Tutor(provider).chat(ctx, 'Vem är bäst i Fortnite?');
    expect(calls).toHaveLength(0);
    expect(r.refused).toBe(true);
    expect(r.reply).toMatch(/matte/i);
  });
  it('answers math chat and scrubs personal data before sending', async () => {
    const { provider, calls } = fake('{"reply":"Bråk är delar av en helhet."}');
    const r = await new Tutor(provider).chat(ctx, 'förklara bråk, jag heter Elsa elsa@x.se', ['Elsa']);
    expect(r.refused).toBe(false);
    expect(r.reply).toContain('Bråk');
    expect(JSON.stringify(calls)).not.toMatch(/Elsa|elsa@x/);
  });
  it('system prompt restricts the bot to mathematics', async () => {
    const { provider, calls } = fake('{"reply":"ok"}');
    await new Tutor(provider).chat(ctx, 'vad är 2+2');
    expect(calls[0][0].content).toMatch(/matematik/i);
  });
});
