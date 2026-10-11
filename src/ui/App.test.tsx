import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import type { TutorApi } from '../ai/tutor';

function fakeTutor(correct = true): TutorApi {
  return {
    generateQuestion: vi.fn(async () => ({ question: 'Vad är 3 + 4?', answer: '7', hint: 'tips' })),
    checkAnswer: vi.fn(async () => ({ correct, feedback: correct ? 'Bra jobbat!' : 'Nästan!', explanation: correct ? undefined : 'Räkna uppåt från 3.' })),
    chat: vi.fn(async () => ({ reply: 'Bråk är delar.', refused: false })),
  };
}

async function onboard() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/vad heter du/i), 'Elsa');
  await user.click(screen.getByRole('button', { name: /kör/i }));
  return user;
}

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('onboards then immediately starts a question (no menus)', async () => {
    render(<App tutor={fakeTutor()} />);
    await onboard();
    expect(await screen.findByText('Vad är 3 + 4?')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('correct answer gives feedback and xp', async () => {
    const tutor = fakeTutor(true);
    render(<App tutor={tutor} />);
    const user = await onboard();
    await screen.findByText('Vad är 3 + 4?');
    await user.type(screen.getByLabelText(/ditt svar/i), '7');
    await user.click(screen.getByRole('button', { name: /svara/i }));
    expect(await screen.findByText('Bra jobbat!')).toBeInTheDocument();
    expect(screen.getByTestId('xp')).not.toHaveTextContent(/^0/);
    expect(tutor.checkAnswer).toHaveBeenCalled();
    expect(JSON.stringify((tutor.checkAnswer as any).mock.calls[0][0])).not.toContain('Elsa');
  });

  it('wrong answer shows the explanation', async () => {
    render(<App tutor={fakeTutor(false)} />);
    const user = await onboard();
    await screen.findByText('Vad är 3 + 4?');
    await user.type(screen.getByLabelText(/ditt svar/i), '8');
    await user.click(screen.getByRole('button', { name: /svara/i }));
    expect(await screen.findByText('Räkna uppåt från 3.')).toBeInTheDocument();
  });

  it('chat with the mascot', async () => {
    render(<App tutor={fakeTutor()} />);
    const user = await onboard();
    await screen.findByText('Vad är 3 + 4?');
    await user.type(screen.getByLabelText(/fråga mathica/i), 'förklara bråk');
    await user.click(screen.getByRole('button', { name: /skicka/i }));
    await waitFor(() => expect(screen.getByText('Bråk är delar.')).toBeInTheDocument());
  });

  it('can switch to English', async () => {
    render(<App tutor={fakeTutor()} />);
    await userEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(screen.getByLabelText(/what's your name/i)).toBeInTheDocument();
  });
});
