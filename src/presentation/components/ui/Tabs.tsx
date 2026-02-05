import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl
              text-[11px] font-black uppercase tracking-widest
              transition-all duration-200 whitespace-nowrap select-none
              ${
                isActive
                  ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-700/50'
              }
            `}
          >
            {tab.icon && (
              <span
                className={`material-symbols-outlined text-lg ${
                  isActive ? 'text-primary' : ''
                }`}
              >
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
