import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDarkMode } from '@/presentation/hooks/useDarkMode';

const TITLE_MAP: Record<string, string> = {
  '/': 'Tableau de Bord',
  '/plan': 'Plan Consolide',
  '/imports': "Centre d'Importation",
  '/forecast': 'Simulation & Scenarios',
  '/forecast/template-scenario': 'Template Scénario',
  '/users': 'Gestion des Utilisateurs',
  '/profiles': 'Profils & Droits',
  '/settings': 'Parametrage',
  '/saisie/encaissement': 'Nouvel Encaissement',
  '/saisie/decaissement': 'Nouveau Decaissement',
  '/reporting': 'Reporting',
  '/validation': 'Validation des Ecritures',
  '/position': 'Position de Trésorerie',
  '/rapprochement': 'Rapprochement Bancaire',
  '/notifications': 'Notifications',
  '/echeancier': 'Echeancier des Paiements',
  '/budget-realise': 'Budget vs Realise',
  '/historique': 'Historique des Ecritures',
  '/profile': 'Mon Profil',
  '/user-settings': 'Mes Parametres',
};

const VIS_DOMAIN_MAP: Record<string, string> = {
  energie: 'Energie',
  'rem-cie': 'REM CIE',
  fonctionnement: 'Fonctionnement',
  'service-bancaire': 'Service Bancaire',
  impot: 'Impot',
  annexe: 'Annexe',
  gaz: 'Gaz',
};

function getTitleForPath(pathname: string): string {
  // Exact match first
  const exact = TITLE_MAP[pathname];
  if (exact) return exact;

  // Visualisation routes
  if (pathname.startsWith('/visualisations/')) {
    const segment = pathname.replace('/visualisations/', '').split('/')[0];
    const domain = VIS_DOMAIN_MAP[segment];
    if (domain) return `Visualisation ${domain}`;
    return 'Visualisations';
  }

  return 'CIE TRESO';
}

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showSaisieMenu, setShowSaisieMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const saisieMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (saisieMenuRef.current && !saisieMenuRef.current.contains(e.target as Node)) {
        setShowSaisieMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showSaisieMenu || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSaisieMenu, showUserMenu]);

  const title = getTitleForPath(location.pathname);

  const handleSaisie = (path: string) => {
    navigate(path);
    setShowSaisieMenu(false);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    setShowUserMenu(false);
    navigate(path);
  };

  // User display info
  const displayName = user?.name || (user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : 'Utilisateur');
  const displayEmail = user?.email || '';
  const displayRole = user?.role || 'Utilisateur';
  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e65000&color=fff`;

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 backdrop-blur-xl">
      <div className="flex items-center gap-8 flex-1">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight hidden lg:block uppercase">
          {title}
        </h2>

        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <span
              className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl transition-colors ${
                isSearching ? 'text-primary' : 'text-zinc-400'
              }`}
            >
              {isSearching ? 'sync' : 'search'}
            </span>
            <input
              type="text"
              placeholder="Chercher une transaction, un matricule..."
              onFocus={() => setIsSearching(true)}
              onBlur={() => setIsSearching(false)}
              className="w-full h-11 pl-11 pr-4 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/40 text-zinc-900 dark:text-white transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Last sync info */}
        <div className="hidden lg:flex flex-col items-end mr-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Derniere Sync
          </span>
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-[#22a84c] animate-pulse"></div>
            <span className="text-xs font-bold text-zinc-900 dark:text-white italic">
              Aujourd&apos;hui, 14:32
            </span>
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-primary transition-all active:scale-90"
        >
          <span className="material-symbols-outlined">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 relative hover:text-primary transition-all active:scale-90"
        >
          <span className="material-symbols-outlined">notifications</span>
          {notifications > 0 && (
            <span className="absolute top-3 right-3 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 animate-bounce"></span>
          )}
        </button>

        {/* Nouvelle Saisie dropdown */}
        <div className="relative" ref={saisieMenuRef}>
          <button
            onClick={() => setShowSaisieMenu(!showSaisieMenu)}
            className="bg-primary hover:bg-primary-dark text-white h-11 px-6 rounded-xl flex items-center gap-2 text-xs font-black shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span className="hidden sm:inline">NOUVELLE SAISIE</span>
          </button>

          {showSaisieMenu && (
            <div className="absolute top-13 right-0 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => handleSaisie('/saisie/encaissement')}
                className="w-full px-6 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[#22a84c]">add_card</span>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  Encaissement
                </span>
              </button>
              <button
                onClick={() => handleSaisie('/saisie/decaissement')}
                className="w-full px-6 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-[#e65000]">payments</span>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                  Decaissement
                </span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-primary transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-zinc-50 dark:bg-zinc-800"
          >
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-9 rounded-lg object-cover"
            />
            <span
              className={`material-symbols-outlined text-zinc-400 text-lg transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute top-13 right-0 w-72 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
              {/* User Info Header */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-zinc-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {displayEmail}
                    </p>
                    <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase">
                      {displayRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-zinc-400 text-xl">person</span>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                    Mon Profil
                  </span>
                </button>
                <button
                  onClick={() => handleNavigate('/user-settings')}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-zinc-400 text-xl">settings</span>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                    Parametres
                  </span>
                </button>
              </div>

              {/* Logout */}
              <div className="py-2 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 group"
                >
                  <span className="material-symbols-outlined text-zinc-400 group-hover:text-red-500 text-xl transition-colors">logout</span>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-red-500 transition-colors">
                    Deconnexion
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
