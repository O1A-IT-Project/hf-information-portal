import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './Theme.css'
import App from './App.tsx'
import "boxicons/css/boxicons.min.css";

// Render the main application component within a StrictMode and BrowserRouter for routing support
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
