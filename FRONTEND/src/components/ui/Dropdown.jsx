// src/components/ui/Dropdown.jsx
import React, { useState, useEffect, useRef } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  widthClass = 'w-48',
  className = '',
  closeOnClick = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignments = {
    right: 'right-0 origin-top-right',
    left: 'left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top'
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignments[align]} mt-2 ${widthClass} rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl z-[100] py-1.5 focus:outline-none animate-fade-in`}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              if (closeOnClick) {
                return React.cloneElement(child, {
                  onClick: (...args) => {
                    if (child.props.onClick) child.props.onClick(...args);
                    setIsOpen(false);
                  }
                });
              }
              return child;
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, icon: Icon, className = '', danger = false, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 ${danger ? 'text-red-650 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20' : 'text-slate-700 dark:text-slate-300'} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 opacity-80" />}
      <span className="flex-1">{children}</span>
    </button>
  );
};

export const DropdownDivider = () => {
  return <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>;
};
