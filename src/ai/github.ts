import type { ChatMessage, LlmProvider } from './tutor';

interface Options { fetch?: typeof fetch; model?: string; baseUrl?: string }

/** GitHub Models (OpenAI-compatible). Swap for an OpenAI provider later by changing only the baseUrl/token. */
export class GitHubModelsProvider implements LlmProvider {
  private f: typeof fetch;
  private model: string;
  private baseUrl: string;
  constructor(private token: string, o: Options = {}) {
    this.f = o.fetch ?? fetch;
    this.model = o.model ?? 'openai/gpt-4.1';
    this.baseUrl = o.baseUrl ?? 'https://models.github.ai/inference';
  }
  async complete(messages: ChatMessage[]): Promise<string> {
    const res = await this.f(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` },
      body: JSON.stringify({ model: this.model, messages, temperature: 0.7 }),
    });
    if (!res.ok) throw new Error(`LLM request failed: ${res.status}`);
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
  }
}
