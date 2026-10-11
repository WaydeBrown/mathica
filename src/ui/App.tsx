import { useEffect, useState } from 'react';
import { t, type Lang } from '../i18n/strings';
import type { Question, TutorApi, Verdict } from '../ai/tutor';
import { buildLearnerContext } from '../core/privacy';
import { applyAnswer, levelForXp, touchStreak } from '../core/gamification';
import { creditPlacement, nextSkill, placementSkills, recordResult } from '../core/skills';
import { loadState, saveState, type AppState } from '../core/storage';
import { canListen, listen, speak } from './voice';
import './app.css';

const today = () => new Date().toISOString().slice(0, 10);
const PLACEMENT_MAX_WRONG = 2;

export function App({ tutor }: { tutor: TutorApi }) {
  const [state, setState] = useState<AppState>(loadState);
  const [lang, setLang] = useState<Lang>(state.profile?.language ?? 'sv');
  const [name, setName] = useState('');
  const [skillId, setSkillId] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [answer, setAnswer] = useState('');
  const [chat, setChat] = useState('');
  const [bubble, setBubble] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => saveState(state), [state]);

  const ctx = () => buildLearnerContext({ name: state.profile?.name ?? '', birthYear: 0, model: state.model, language: lang });
  const probes = placementSkills();
  const inPlacement = !state.placementDone;

  async function loadQuestion(s: AppState) {
    const id = !s.placementDone ? probes[s.placementIndex].id : nextSkill(s.model).id;
    setBusy(true); setError(false); setVerdict(null); setAnswer(''); setQuestion(null);
    try {
      const learner = buildLearnerContext({ name: '', birthYear: 0, model: s.model, language: lang });
      setSkillId(id);
      setQuestion(await tutor.generateQuestion(learner, id));
    } catch { setError(true); } finally { setBusy(false); }
  }

  useEffect(() => {
    if (state.profile && !question && !busy && !error) void loadQuestion(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.profile]);

  function start() {
    if (!name.trim()) return;
    const next = { ...state, profile: { name: name.trim(), language: lang }, progress: touchStreak(state.progress, today()) };
    setState(next);
    setBubble(t(lang, 'welcome'));
  }

  async function submit() {
    if (!question || !skillId) return;
    setBusy(true); setError(false);
    try {
      const v = await tutor.checkAnswer(ctx(), { question: question.question, skillId }, answer);
      setVerdict(v);
      setState((s) => {
        const progress = applyAnswer(s.progress, v.correct);
        if (!s.placementDone) {
          const wrong = s.placementWrong + (v.correct ? 0 : 1);
          const index = s.placementIndex + 1;
          return {
            ...s, progress, placementWrong: wrong, placementIndex: index,
            model: creditPlacement(s.model, skillId, v.correct),
            placementDone: wrong >= PLACEMENT_MAX_WRONG || index >= probes.length,
          };
        }
        return { ...s, progress, model: recordResult(s.model, skillId, v.correct) };
      });
      speak(v.feedback, lang);
    } catch { setError(true); } finally { setBusy(false); }
  }

  async function sendChat() {
    if (!chat.trim()) return;
    const msg = chat; setChat('');
    try {
      const r = await tutor.chat(ctx(), msg, state.profile ? [state.profile.name] : []);
      setBubble(r.reply);
      speak(r.reply, lang);
    } catch { setError(true); }
  }

  async function dictate() {
    try { setAnswer(await listen(lang)); } catch { /* ignore */ }
  }

  if (!state.profile) {
    return (
      <main className="screen">
        <div className="mascot" aria-hidden>🦉</div>
        <div className="row">
          <button onClick={() => setLang('sv')} aria-pressed={lang === 'sv'}>Svenska</button>
          <button onClick={() => setLang('en')} aria-pressed={lang === 'en'}>English</button>
        </div>
        <label>{t(lang, 'whatsYourName')}
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="big" onClick={start}>{t(lang, 'letsGo')}</button>
      </main>
    );
  }

  const p = state.progress;
  return (
    <main className="screen">
      <header className="hud">
        <span>{t(lang, 'level', { n: levelForXp(p.xp) })}</span>
        <span data-testid="xp">{p.xp} XP</span>
        <span>🪙 {p.coins}</span>
        <span>🔥 {t(lang, 'streak', { n: p.streak })}</span>
        {p.combo > 1 && <span>⚡ {t(lang, 'combo', { n: p.combo })}</span>}
      </header>
      {inPlacement && <p className="tag">{t(lang, 'placement')} {state.placementIndex + 1}/{probes.length}</p>}
      <div className="mascot" aria-hidden>🦉</div>
      {bubble && <p className="bubble">{bubble}</p>}
      {busy && <p>{t(lang, 'loading')}</p>}
      {error && <button onClick={() => (question ? void submit() : void loadQuestion(state))}>{t(lang, 'retry')}</button>}
      {question && (
        <section>
          <h2>{question.question}</h2>
          <button aria-label={t(lang, 'speak')} onClick={() => speak(question.question, lang)}>🔊</button>
          {!verdict && (
            <>
              <label>{t(lang, 'yourAnswer')}
                <input value={answer} inputMode="decimal" onChange={(e) => setAnswer(e.target.value)} />
              </label>
              {canListen() && <button aria-label={t(lang, 'listen')} onClick={dictate}>🎤</button>}
              <button className="big" disabled={busy || !answer.trim()} onClick={submit}>{t(lang, 'answer')}</button>
            </>
          )}
          {verdict && (
            <div className={verdict.correct ? 'ok' : 'nope'}>
              <p>{verdict.feedback}</p>
              {verdict.explanation && <p>{verdict.explanation}</p>}
              <button className="big" onClick={() => loadQuestion(state)}>{t(lang, 'next')}</button>
            </div>
          )}
        </section>
      )}
      <footer className="chat">
        <label>{t(lang, 'askMathica')}
          <input value={chat} onChange={(e) => setChat(e.target.value)} />
        </label>
        <button onClick={sendChat}>{t(lang, 'send')}</button>
      </footer>
    </main>
  );
}
