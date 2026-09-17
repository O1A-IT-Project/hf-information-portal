import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './Theme.css'
import App from './App.tsx'
import "boxicons/css/boxicons.min.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.PROD ? '/hf-information-portal' : '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>
)
