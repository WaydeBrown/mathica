import { mathToSpeech } from './speech';

describe('mathToSpeech', () => {
  it('swedish', () => {
    expect(mathToSpeech('3 + 4 = 7', 'sv')).toBe('3 plus 4 är lika med 7');
    expect(mathToSpeech('6 × 7', 'sv')).toBe('6 gånger 7');
    expect(mathToSpeech('12 ÷ 4', 'sv')).toBe('12 delat med 4');
    expect(mathToSpeech('9 - 2', 'sv')).toBe('9 minus 2');
    expect(mathToSpeech('1/2', 'sv')).toBe('1 delat med 2');
    expect(mathToSpeech('x²', 'sv')).toBe('x upphöjt till 2');
    expect(mathToSpeech('√9', 'sv')).toBe('kvadratroten ur 9');
    expect(mathToSpeech('3,5', 'sv')).toBe('3 komma 5');
  });
  it('english', () => {
    expect(mathToSpeech('3 + 4 = 7', 'en')).toBe('3 plus 4 equals 7');
    expect(mathToSpeech('6 × 7', 'en')).toBe('6 times 7');
  });
});
