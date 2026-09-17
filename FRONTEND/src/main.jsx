import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useERPStore } from './store/useERPStore'

// ─── Automatic Storage Cleaner ────────────────────────────────────────────────
// Purge all legacy mock database keys (erp_db_*, company_gallery) and obsolete
// auth entries. Only the unified 'session' object is retained.
(() => {
  try {
    if (typeof window === 'undefined') return;
    const allowedKeys = new Set(['session', 'erp_theme', 'erp_sidebar_collapsed', 'erp_lang', 'remembered_credentials']);

    // Purge localStorage
    if (window.localStorage) {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !allowedKeys.has(key)) {
          toRemove.push(key);
        }
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    }

    // Purge sessionStorage
    if (window.sessionStorage) {
      const toRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !allowedKeys.has(key)) {
          toRemove.push(key);
        }
      }
      toRemove.forEach(k => sessionStorage.removeItem(k));
    }
  } catch (e) {
    console.warn('[Storage] Clean up error:', e);
  }
})();

// Universal browser alert override to route to custom toast UI
window.alert = (message) => {
  const msgLower = String(message || '').toLowerCase();
  const isError = msgLower.includes('error') || msgLower.includes('fail') || msgLower.includes('reject') || msgLower.includes('invalid') || msgLower.includes('empty');
  const type = isError ? 'error' : 'success';
  useERPStore.getState().showToast(message, type);
};

createRoot(document.getElementById('root')).render(
  <App />
);

