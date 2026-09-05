import React from 'react';
import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId: string;
  className?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({ tabs, activeId, onChange, layoutId, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isActive ? 'text-[var(--accent-dark)]' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 hover:dark:text-stone-100'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 bg-[var(--surface)] rounded-lg shadow-sm"
                transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
