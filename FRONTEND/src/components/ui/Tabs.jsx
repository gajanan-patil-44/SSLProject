// src/components/ui/Tabs.jsx
import React from 'react';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-slate-200 dark:border-slate-800 ${className}`}>
      <nav className="flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`pb-3.5 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-secondary text-secondary font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-secondary/15 text-secondary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
