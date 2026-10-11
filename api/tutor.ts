import { Tutor, type LlmProvider } from '../src/ai/tutor';
import { GitHubModelsProvider } from '../src/ai/github';
import { skillById } from '../src/core/curriculum';
import type { LearnerContext } from '../src/core/privacy';

const FORBIDDEN_KEYS = ['name', 'birthYear', 'email', 'age'];

interface Result { status: number; body: unknown }

export async function handle(method: string, body: any, provider: LlmProvider): Promise<Result> {
  if (method !== 'POST') return { status: 405, body: { error: 'method' } };
  const ctx = body?.context as LearnerContext | undefined;
  if (!ctx || FORBIDDEN_KEYS.some((k) => k in ctx)) return { status: 400, body: { error: 'invalid context' } };
  const tutor = new Tutor(provider);
  try {
    switch (body.action) {
      case 'question':
        skillById(String(body.skillId));
        return { status: 200, body: await tutor.generateQuestion(ctx, body.skillId) };
      case 'check':
        return { status: 200, body: await tutor.checkAnswer(ctx, { question: String(body.question), skillId: String(body.skillId) }, String(body.answer)) };
      case 'chat':
        return { status: 200, body: await tutor.chat(ctx, String(body.message)) };
      default:
        return { status: 400, body: { error: 'unknown action' } };
    }
  } catch {
    return { status: 502, body: { error: 'tutor unavailable' } };
  }
}

export default async function handler(req: any, res: any) {
  const token = process.env.GITHUB_TOKEN ?? '';
  const r = await handle(req.method, req.body, new GitHubModelsProvider(token, { model: process.env.LLM_MODEL }));
  res.status(r.status).json(r.body);
}
