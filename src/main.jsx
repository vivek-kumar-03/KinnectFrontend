import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Polyfill for global
if (typeof global === 'undefined') {
  window.global = window;
}

// Ensure theme variables are set
const initializeTheme = () => {
  const root = document.documentElement;
  // Set default theme variables in case theme context fails
  root.style.setProperty('--primary', '#3b82f6');
  root.style.setProperty('--primary-light', '#60a5fa');
  root.style.setProperty('--primary-dark', '#2563eb');
  root.style.setProperty('--secondary', '#8b5cf6');
  root.style.setProperty('--background', '#ffffff');
  root.style.setProperty('--surface', '#f8fafc');
  root.style.setProperty('--surface-hover', '#f1f5f9');
  root.style.setProperty('--text-primary', '#1e293b');
  root.style.setProperty('--text-secondary', '#64748b');
  root.style.setProperty('--border', '#e2e8f0');
  root.style.setProperty('--success', '#10b981');
  root.style.setProperty('--error', '#ef4444');
  root.style.setProperty('--warning', '#f59e0b');
  root.style.setProperty('--chat-bubble-me', '#3b82f6');
  root.style.setProperty('--chat-bubble-other', '#f1f5f9');
};

// Initialize theme before rendering
initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)