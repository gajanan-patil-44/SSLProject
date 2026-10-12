import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './index';

// ==========================================
// Modal Component
// ==========================================
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm', 'md', 'lg', 'xl', '2xl'
  actions,
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity animate-fade-in overflow-y-auto">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0 cursor-default" onClick={onClose}></div>
      
      <div 
        style={{ maxHeight: 'calc(100vh - 2.5rem)', display: 'flex', flexDirection: 'column' }}
        className={`relative w-full my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-2xl max-h-[88vh] overflow-hidden z-10 ${sizes[size] || sizes.md} ${className}`}
      >
        {/* Header - Fixed at top */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 truncate pr-3">{title}</h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:text-slate-500 cursor-pointer transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Guaranteed scrollable with explicit maxHeight and flex-1 */}
        <div 
          style={{ maxHeight: 'calc(100vh - 9.5rem)' }}
          className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto overscroll-contain text-sm text-slate-700 dark:text-slate-300"
        >
          {children}
        </div>

        {/* Footer - Fixed at bottom */}
        {actions && (
          <div className="shrink-0 flex items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-xs">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ==========================================
// Drawer / Sheet Component (Slide-out panel)
// ==========================================
export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // 'right', 'left'
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  actions,
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positions = {
    right: 'right-0 top-0 bottom-0 h-full border-l animate-slide-in-right',
    left: 'left-0 top-0 bottom-0 h-full border-r animate-slide-in-left'
  };

  const sizes = {
    sm: 'w-80',
    md: 'w-96 md:w-[480px]',
    lg: 'w-full md:w-[640px]',
    xl: 'w-full md:w-[800px]'
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>
      
      <div className={`absolute bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden ${positions[position]} ${sizes[size]} ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto text-sm text-slate-700 dark:text-slate-300">
          {children}
        </div>

        {/* Footer */}
        {actions && (
          <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ==========================================
// ConfirmDialog Component
// ==========================================
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'primary', 'warning'
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-650 dark:text-slate-400">{message}</p>
      </div>
    </Modal>
  );
};
