import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useDarkMode } from '@/presentation/hooks/useDarkMode';

const MainLayout: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        isDarkMode ? 'dark bg-[#1a100a]' : 'bg-[#f8f6f5]'
      }`}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
