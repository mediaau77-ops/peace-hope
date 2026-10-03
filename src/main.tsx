import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress dev-time Vite HMR WebSocket closed rejections from polluting console
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonMsg = event.reason?.message || String(event.reason || '');
    if (
      reasonMsg.includes('WebSocket closed without opened') ||
      reasonMsg.includes('failed to connect to websocket') ||
      (event.reason?.name === 'Error' && reasonMsg.includes('WebSocket'))
    ) {
      event.preventDefault();
      console.debug('[Vite HMR] WebSocket reconnection suppressed');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
