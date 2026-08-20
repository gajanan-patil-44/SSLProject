import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useERPStore } from './store/useERPStore'

// Universal browser alert override to route to custom toast UI
window.alert = (message) => {
  const msgLower = String(message || '').toLowerCase();
  const isError = msgLower.includes('error') || msgLower.includes('fail') || msgLower.includes('reject') || msgLower.includes('invalid') || msgLower.includes('empty');
  const type = isError ? 'error' : 'success';
  useERPStore.getState().showToast(message, type);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
