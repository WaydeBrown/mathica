import type { Lang } from '../i18n/strings';

const W = {
  sv: { plus: 'plus', times: 'gånger', div: 'delat med', eq: 'är lika med', minus: 'minus', pow: 'upphöjt till', sqrt: 'kvadratroten ur', dec: 'komma' },
  en: { plus: 'plus', times: 'times', div: 'divided by', eq: 'equals', minus: 'minus', pow: 'to the power of', sqrt: 'square root of', dec: 'point' },
};

/** Rewrite math notation so TTS engines read it correctly. Avoids lookbehind for old iOS Safari. */
export function mathToSpeech(text: string, lang: Lang): string {
  const w = W[lang];
  let s = text.replace(/\s*([+×÷=*/·])\s*/g, (_m, op: string) => {
    const word = op === '+' ? w.plus : op === '=' ? w.eq : op === '×' || op === '*' || op === '·' ? w.times : w.div;
    return ` ${word} `;
  });
  s = s.replace(/\s+[-−]\s+/g, ` ${w.minus} `);
  s = s.replace(/(^|\s)[-−](?=\d)/g, `$1${w.minus} `);
  s = s.replace(/(\d)[,.](\d)/g, `$1 ${w.dec} $2`);
  s = s.replace(/(\w)²/g, `$1 ${w.pow} 2`).replace(/(\w)³/g, `$1 ${w.pow} 3`).replace(/(\w)\^(\w+)/g, `$1 ${w.pow} $2`);
  s = s.replace(/√\s*(\w+)/g, `${w.sqrt} $1`);
  return s.replace(/\s+/g, ' ').trim();
}
