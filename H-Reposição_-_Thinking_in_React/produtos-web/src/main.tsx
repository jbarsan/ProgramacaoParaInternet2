/**
 * Ponto de Entrada do Frontend React (`main.tsx`)
 *
 * Monta a árvore React no elemento `#root` com `StrictMode` ativado.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

