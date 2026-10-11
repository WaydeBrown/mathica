import { GitHubModelsProvider } from './github';

describe('GitHubModelsProvider', () => {
  it('posts chat completions with bearer token and returns content', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: 'hej' } }] }), { status: 200 }));
    const p = new GitHubModelsProvider('tok', { fetch: fetchMock as unknown as typeof fetch, model: 'openai/gpt-4.1' });
    expect(await p.complete([{ role: 'user', content: 'x' }])).toBe('hej');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/chat/completions');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    expect(JSON.parse(init.body as string).model).toBe('openai/gpt-4.1');
  });
  it('throws on http errors', async () => {
    const f = vi.fn(async () => new Response('no', { status: 500 }));
    await expect(new GitHubModelsProvider('t', { fetch: f as unknown as typeof fetch }).complete([])).rejects.toThrow(/500/);
  });
});
