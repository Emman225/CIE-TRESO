import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top - Logo */}
          <div className="flex items-center gap-4">
            <div className="bg-primary size-14 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40">
              <span className="material-symbols-outlined filled text-3xl">bolt</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-black tracking-tight">CIE TRESO</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Gestion de Tresorerie</p>
            </div>
          </div>

          {/* Center - Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight whitespace-nowrap">
                Pilotez votre <span className="text-primary">tresorerie</span> en temps reel
              </h2>
              <p className="text-zinc-400 text-lg mt-6 max-w-md leading-relaxed">
                Solution integree de gestion previsionnelle pour la Compagnie Ivoirienne d'Electricite
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">analytics</span>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Previsions</p>
                  <p className="text-zinc-500 text-xs">Temps reel</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-400 text-xl">security</span>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Securise</p>
                  <p className="text-zinc-500 text-xs">Chiffre SSL</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400 text-xl">speed</span>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Rapide</p>
                  <p className="text-zinc-500 text-xs">Performance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="size-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-400 text-xl">sync</span>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Synchronise</p>
                  <p className="text-zinc-500 text-xs">Multi-sources</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom - Stats & Footer */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="flex items-center gap-8">
              <div>
                <p className="text-3xl font-black text-white">50+</p>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Milliards FCFA</p>
              </div>
              <div className="w-px h-12 bg-zinc-700"></div>
              <div>
                <p className="text-3xl font-black text-white">24/7</p>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Disponibilite</p>
              </div>
              <div className="w-px h-12 bg-zinc-700"></div>
              <div>
                <p className="text-3xl font-black text-white">100%</p>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Securise</p>
              </div>
            </div>

            {/* Footer */}
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
