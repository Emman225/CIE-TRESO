import React from 'react';
import { Outlet } from 'react-router-dom';
import logoCie from '@/assets/Logo_CIE.jpg';
import bgImage from '@/assets/bg2.jpg';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
        {/* Background Image */}
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-zinc-900/60"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top - spacer */}
          <div></div>

          {/* Center - CIE Logo */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-primary/90 backdrop-blur-sm rounded-3xl p-10 border border-orange-400/20 shadow-2xl shadow-primary/30">
              <div className="bg-white size-28 rounded-3xl flex items-center justify-center p-3 shadow-2xl mx-auto">
                <img src={logoCie} alt="CIE Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-3xl xl:text-4xl font-black text-white text-center mt-8 tracking-tight">
                CIE TRESO
              </h2>
              <p className="text-white/80 text-sm mt-3 text-center max-w-xs leading-relaxed">
                Solution integree de gestion de tresorerie pour la Compagnie Ivoirienne d'Electricite
              </p>
            </div>
          </div>

          {/* Bottom - Footer */}
          <div>
            <div className="flex items-center justify-between text-zinc-600 text-xs">
              <p>&copy; 2026 Compagnie Ivoirienne d'Electricite</p>
              <p>Direction des Systemes d'Information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 relative overflow-hidden">
        {/* Background decorative elements for mobile */}
        <div className="absolute top-[-20%] right-[-20%] size-[400px] bg-primary/5 rounded-full blur-[100px] lg:hidden"></div>
        <div className="absolute bottom-[-20%] left-[-20%] size-[300px] bg-orange-500/5 rounded-full blur-[80px] lg:hidden"></div>

        <div className="relative z-10 w-full max-w-[440px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
