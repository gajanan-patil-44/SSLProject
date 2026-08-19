// src/components/ui/Toast.jsx
import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';

export default function ToastContainer() {
  const toasts = useERPStore((state) => state.toasts || []);
  const removeToast = useERPStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-50/95 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300',
    error: 'border-red-500/20 dark:border-red-500/10 bg-red-50/95 dark:bg-red-950/20 text-red-900 dark:text-red-300',
    warning: 'border-amber-500/20 dark:border-amber-500/10 bg-amber-50/95 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300',
    info: 'border-blue-500/20 dark:border-blue-500/10 bg-blue-50/95 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-[320px] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 border rounded-xl shadow-lg flex gap-3 items-start justify-between backdrop-blur-xs transition-all duration-300 animate-slide-in-right ${borders[toast.type]}`}
          role="alert"
        >
          <div className="flex gap-2.5 items-start">
            {icons[toast.type]}
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 cursor-pointer shrink-0 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
