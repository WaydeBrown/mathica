import type { Lang } from '../i18n/strings';

const SV: Record<string, number> = {
  noll: 0, ett: 1, en: 1, två: 2, tre: 3, fyra: 4, fem: 5, sex: 6, sju: 7, åtta: 8, nio: 9, tio: 10, elva: 11, tolv: 12,
  tretton: 13, fjorton: 14, femton: 15, sexton: 16, sjutton: 17, arton: 18, nitton: 19, tjugo: 20, trettio: 30, fyrtio: 40,
  femtio: 50, sextio: 60, sjuttio: 70, åttio: 80, nittio: 90, hundra: 100, tusen: 1000,
};
const EN: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
  forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
};

function splitCompound(word: string, vocab: Record<string, number>): string[] | null {
  if (word in vocab) return [word];
  const keys = Object.keys(vocab).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (word.startsWith(k)) {
      const rest = splitCompound(word.slice(k.length), vocab);
      if (rest) return [k, ...rest];
    }
  }
  return word === '' ? [] : null;
}

function wordsToInt(words: string[], vocab: Record<string, number>): number | null {
  let total = 0;
  let current = 0;
  let any = false;
  for (const raw of words) {
    const parts = splitCompound(raw, vocab);
    if (!parts) return null;
    for (const p of parts) {
      any = true;
      const v = vocab[p];
      if (v === 1000) { total += (current || 1) * 1000; current = 0; }
      else if (v === 100) current = (current || 1) * 100;
      else current += v;
    }
  }
  return any ? total + current : null;
}

export function parseSpokenNumber(input: string, lang: Lang): number | null {
  let t = input.trim().toLowerCase().replace(/-/g, ' ');
  if (!t) return null;
  const digits = t.replace(',', '.').replace(/\s/g, '');
  if (/^-?\d+(\.\d+)?$/.test(digits)) return Number(digits);
  const vocab = lang === 'sv' ? SV : EN;
  const neg = /^(minus|negativ|negative)\s+/.test(t);
  t = t.replace(/^(minus|negativ|negative)\s+/, '');
  const [intPart, fracPart, ...extra] = t.split(/\s+(?:komma|comma|point)\s+/);
  if (extra.length) return null;
  const intVal = wordsToInt(intPart.split(/\s+/), vocab);
  if (intVal === null) return null;
  let value = intVal;
  if (fracPart !== undefined) {
    const ds = fracPart.split(/\s+/).map((x) => (x in vocab && vocab[x] < 10 ? String(vocab[x]) : /^\d$/.test(x) ? x : null));
    if (ds.some((d) => d === null)) return null;
    value = Number(`${intVal}.${ds.join('')}`);
  }
  return neg ? -value : value;
}
