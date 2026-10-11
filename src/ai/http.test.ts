import { HttpTutor } from './http';

const ctx = { language: 'sv' as const, estimatedGrade: 2, skills: [] };

describe('HttpTutor', () => {
  it('posts actions to /api/tutor', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ question: 'q', answer: 'a' }), { status: 200 }));
    const q = await new HttpTutor(f as unknown as typeof fetch).generateQuestion(ctx, 'addition-basic');
    expect(q.question).toBe('q');
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/tutor');
    expect(JSON.parse(init.body as string)).toMatchObject({ action: 'question', skillId: 'addition-basic' });
  });
  it('never sends names (chat scrubbing happens client side)', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ reply: 'x', refused: false }), { status: 200 }));
    await new HttpTutor(f as unknown as typeof fetch).chat(ctx, 'bråk? jag heter Elsa', ['Elsa']);
    expect((f.mock.calls[0] as unknown as [string, RequestInit])[1].body).not.toContain('Elsa');
  });
  it('throws on failure', async () => {
    const f = vi.fn(async () => new Response('', { status: 502 }));
    await expect(new HttpTutor(f as unknown as typeof fetch).chat(ctx, '2+2')).rejects.toThrow();
  });
});
