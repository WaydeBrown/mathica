import { handle } from './tutor';
import type { LlmProvider } from '../src/ai/tutor';

const provider: LlmProvider = { complete: async () => '{"reply":"hej"}' };
const ctx = { language: 'sv', estimatedGrade: 3, skills: [] };

describe('api/tutor', () => {
  it('rejects non-POST and bad actions', async () => {
    expect((await handle('GET', {}, provider)).status).toBe(405);
    expect((await handle('POST', { action: 'hack' }, provider)).status).toBe(400);
  });
  it('rejects bodies containing identity fields', async () => {
    const r = await handle('POST', { action: 'chat', context: { ...ctx, name: 'Elsa' }, message: '2+2' }, provider);
    expect(r.status).toBe(400);
  });
  it('routes chat', async () => {
    const r = await handle('POST', { action: 'chat', context: ctx, message: 'vad är 2+2' }, provider);
    expect(r.status).toBe(200);
    expect((r.body as { reply: string }).reply).toBe('hej');
  });
});
