import { mathToSpeech } from '../core/speech';
import { parseSpokenNumber } from '../core/spokenAnswer';
import type { Lang } from '../i18n/strings';

const LOCALE: Record<Lang, string> = { sv: 'sv-SE', en: 'en-GB' };

export function speak(text: string, lang: Lang): void {
  if (typeof speechSynthesis === 'undefined') return;
  const u = new SpeechSynthesisUtterance(mathToSpeech(text, lang));
  u.lang = LOCALE[lang];
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

export function canListen(): boolean {
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/** Listens once and resolves with the recognised text, converting spoken numbers to digits when possible. */
export function listen(lang: Lang): Promise<string> {
  const w = window as any;
  const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
  return new Promise((resolve, reject) => {
    if (!Rec) return reject(new Error('unsupported'));
    const r = new Rec();
    r.lang = LOCALE[lang];
    r.onresult = (e: any) => {
      const text: string = e.results[0][0].transcript;
      const n = parseSpokenNumber(text, lang);
      resolve(n === null ? text : String(n));
    };
    r.onerror = () => reject(new Error('speech error'));
    r.start();
  });
}
