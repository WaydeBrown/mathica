import { scrubText, type LearnerContext } from '../core/privacy';
import type { ChatReply, Question, QuestionRef, TutorApi, Verdict } from './tutor';

export class HttpTutor implements TutorApi {
  constructor(private f: typeof fetch = (...a) => fetch(...a)) {}

  private async post<T>(payload: Record<string, unknown>): Promise<T> {
    const res = await this.f('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Tutor request failed: ${res.status}`);
    return (await res.json()) as T;
  }

  generateQuestion(context: LearnerContext, skillId: string): Promise<Question> {
    return this.post({ action: 'question', context, skillId });
  }
  checkAnswer(context: LearnerContext, q: QuestionRef, answer: string): Promise<Verdict> {
    return this.post({ action: 'check', context, ...q, answer: scrubText(answer) });
  }
  chat(context: LearnerContext, message: string, names: string[] = []): Promise<ChatReply> {
    return this.post({ action: 'chat', context, message: scrubText(message, names) });
  }
}
