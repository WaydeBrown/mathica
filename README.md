# Mathica

AI-driven mathematics learning for children (8–14), iPad-first PWA. Swedish (Lgr22-inspired) with English option.

## Principles
- **Agent-driven learning:** the LLM creates questions, judges answers, explains mistakes and chats. No deterministic question bank.
- **One page, one flow, no menus.** Placement test first, then an adaptive journey that keeps the child near ~60% success.
- **GDPR:** only competence data (estimated grade + per-skill mastery) is sent to the LLM; names/emails/phones are scrubbed. `api/tutor.ts` rejects identity fields.
- **Math-only:** client guardrail (`src/core/guardrail.ts`) + system prompt.
- **Gamification:** XP, levels, combos, streaks, coins, cash-out requests (parent approval, future).

## Layout
- `src/core` – pure logic (curriculum, skill model, gamification, privacy, guardrail, speech)
- `src/ai` – `TutorApi`, `Tutor` (server), `HttpTutor` (client), `GitHubModelsProvider` (swap for OpenAI later)
- `api/tutor.ts` – Vercel function; needs `GITHUB_TOKEN` (optional `LLM_MODEL`)
- `src/ui` – React single page, voice (TTS/STT)

## Development (strict TDD: red → green → refactor)
`npm test` · `npm run test:e2e` (Playwright WebKit, iPad) · `npm run build` · `npx vitest run --coverage`

Build targets iOS ≥ 12 via `@vitejs/plugin-legacy`; raise/lower in `vite.config.ts` if a technical issue appears.

## Roadmap
Parent account (Android) and multi-child per device, cash-out approval flow, server-side persistence, OpenAI provider.
