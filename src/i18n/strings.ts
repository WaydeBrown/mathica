export type Lang = 'sv' | 'en';

export const STRINGS = {
  sv: {
    whatsYourName: 'Vad heter du?',
    letsGo: 'Kör!',
    welcome: 'Hej! Jag är Mathica. Vi börjar med några frågor så jag lär känna dig!',
    placement: 'Nivåtest',
    yourAnswer: 'Ditt svar',
    answer: 'Svara',
    next: 'Nästa',
    hint: 'Tips',
    level: 'Nivå {n}',
    streak: '{n} dagar i rad',
    combo: 'Kombo x{n}',
    askMathica: 'Fråga Mathica',
    send: 'Skicka',
    speak: 'Läs upp',
    listen: 'Prata',
    loading: 'Mathica tänker…',
    error: 'Hoppsan, något gick fel. Försök igen!',
    retry: 'Försök igen',
  },
  en: {
    whatsYourName: "What's your name?",
    letsGo: "Let's go!",
    welcome: "Hi! I'm Mathica. Let's start with a few questions so I can get to know you!",
    placement: 'Level test',
    yourAnswer: 'Your answer',
    answer: 'Answer',
    next: 'Next',
    hint: 'Hint',
    level: 'Level {n}',
    streak: '{n} day streak',
    combo: 'Combo x{n}',
    askMathica: 'Ask Mathica',
    send: 'Send',
    speak: 'Read aloud',
    listen: 'Speak',
    loading: 'Mathica is thinking…',
    error: 'Oops, something went wrong. Try again!',
    retry: 'Try again',
  },
} as const;

export type StringKey = keyof typeof STRINGS.sv;

export function t(lang: Lang, key: StringKey, vars: Record<string, string | number> = {}): string {
  return STRINGS[lang][key].replace(/\{(\w+)\}/g, (_m, k: string) => String(vars[k] ?? ''));
}
