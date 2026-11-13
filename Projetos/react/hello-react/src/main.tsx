import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Hello } from './components/Hello/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* <Hello nome='João Carlos' />
    <Hello nome='Marília' />
    <Hello nome='Nicolle' />
    <Hello nome='Pedro Henrique' />
    <Hello nome='João Vitor' />
    <Hello nome='Carlos Eduardo' /> */}
  </StrictMode>,
)
