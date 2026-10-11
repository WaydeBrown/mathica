import { buildLearnerContext, scrubText } from './privacy';
import { newModel } from './skills';

describe('privacy (GDPR)', () => {
  it('context contains competence, never identity', () => {
    const ctx = buildLearnerContext({ name: 'Elsa', birthYear: 2015, model: newModel(), language: 'sv' }) as unknown as Record<string, unknown>;
    const json = JSON.stringify(ctx);
    expect(json).not.toContain('Elsa');
    expect(json).not.toContain('2015');
    expect(ctx.estimatedGrade).toBeDefined();
    expect(ctx.skills).toBeDefined();
  });
  it('scrubs emails, phone numbers and the child name from free text', () => {
    const t = scrubText('Hej jag heter Elsa, mejla elsa@x.se eller ring 070-123 45 67', ['Elsa']);
    expect(t).not.toMatch(/Elsa|elsa@x\.se|070/);
  });
});
