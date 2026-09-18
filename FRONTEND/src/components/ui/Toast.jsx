// src/components/ui/Toast.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';

/**
 * Animated SVG Checkmark Component with dynamic drawing stroke
 */
function AnimatedCheckmark() {
  return (
    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center animate-icon-pop shrink-0 shadow-inner">
      <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400" viewBox="0 0 52 52" fill="none">
        <circle
          className="animate-draw-circle"
          cx="26"
          cy="26"
          r="23"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="animate-draw-check"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27l8 8 16-16"
        />
      </svg>
    </div>
  );
}

/**
 * Animated SVG Crossmark Component with dynamic drawing stroke
 */
function AnimatedCrossmark() {
  return (
    <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center animate-icon-pop shrink-0 shadow-inner">
      <svg className="w-10 h-10 text-rose-600 dark:text-rose-400" viewBox="0 0 52 52" fill="none">
        <circle
          className="animate-draw-circle"
          cx="26"
          cy="26"
          r="23"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="animate-draw-cross-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          d="M17 17l18 18"
        />
        <path
          className="animate-draw-cross-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          d="M35 17L17 35"
        />
      </svg>
    </div>
  );
}

function ToastCard({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const isError = toast.type === 'error';
  // Success auto-closes after 2.3 seconds so user sees the tick animation and reads message
  const autoCloseDuration = 2400;
  const timerRef = useRef(null);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 220);
  };

  useEffect(() => {
    // Errors hold on screen indefinitely until user manually dismisses
    if (isError) return;

    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, autoCloseDuration);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [isError]);

  return (
    <div
      className={`pointer-events-auto relative w-full max-w-[380px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center transition-all duration-200 ${
        isExiting ? 'animate-toast-center-out' : 'animate-toast-center-in'
      }`}
      role="alert"
    >
      {/* Top Right Quick Close button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Animated SVG Icon: Tick for Success, Cross for Error */}
      <div className="mb-4">
        {isError ? <AnimatedCrossmark /> : <AnimatedCheckmark />}
      </div>

      {/* Title */}
      <h3
        className={`text-sm font-extrabold uppercase tracking-wider mb-1.5 ${
          isError ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
        }`}
      >
        {toast.title || (isError ? 'Action Failed' : 'Success')}
      </h3>

      {/* Backend Message */}
      <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words px-2">
        {toast.message}
      </p>

      {/* If Error: Holds on screen with an explicit Dismiss / Cancel button */}
      {isError && (
        <div className="mt-5 w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-sm cursor-pointer"
          >
            Dismiss & Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useERPStore((state) => state.toasts || []);
  const removeToast = useERPStore((state) => state.removeToast);

  // Guarantee only 1 single active toast card is shown in the center!
  if (!toasts || toasts.length === 0) return null;
  const activeToast = toasts[toasts.length - 1];
  const isError = activeToast.type === 'error';

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 pointer-events-none">
      {/* Subtle backdrop overlay only when error holds */}
      {isError && (
        <div
          onClick={() => removeToast(activeToast.id)}
          className="fixed inset-0 bg-black/25 dark:bg-black/50 pointer-events-auto transition-opacity duration-200"
        />
      )}

      <ToastCard key={activeToast.id} toast={activeToast} onRemove={removeToast} />
    </div>
  );
}
