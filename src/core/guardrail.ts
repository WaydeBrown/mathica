const INJECTION = /(ignore|disregard|forget)\b.*\b(instruction|prompt|rules)|system prompt|ignorera.*instruktion|glöm.*instruktion|bortse från.*instruktion/i;

const MATH_WORDS = new RegExp(
  [
    'mate', 'matte', 'matematik', 'räkn', 'plus', 'minus', 'gånger', 'delat', 'dividera', 'division', 'multiplik', 'addition',
    'subtrak', 'bråk', 'decimal', 'procent', 'ekvation', 'geometri', 'area', 'omkrets', 'vinkel', 'triangel', 'cirkel', 'tal',
    'sannolikhet', 'diagram', 'funktion', 'potens', 'rot', 'pythagoras', 'summa', 'differens', 'produkt', 'kvot', 'multipel',
    'math', 'add', 'subtract', 'multipl', 'divid', 'fraction', 'percent', 'equation', 'geometry', 'angle', 'triangle',
    'circle', 'number', 'probability', 'function', 'power', 'square', 'sum', 'times', 'calculate', 'count',
  ].join('|'),
  'i',
);

/** Cheap first line of defence. The system prompt is the second. */
export function looksMathRelated(text: string): boolean {
  const t = text.trim();
  if (!t || INJECTION.test(t)) return false;
  return /\d/.test(t) || MATH_WORDS.test(t);
}
