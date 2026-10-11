import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { HttpTutor } from './ai/http';

createRoot(document.getElementById('root')!).render(<App tutor={new HttpTutor()} />);
