import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/hooks/useAuth';
import logoCie from '@/assets/Logo_CIE.jpg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('admin@cie.ci');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      // Error is already set in the useAuth hook state
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Mobile Logo - Hidden on large screens where left panel shows */}
      <div className="flex flex-col items-center mb-10 lg:hidden">
        <div className="bg-white size-14 rounded-2xl flex items-center justify-center p-1.5 shadow-xl shadow-primary/30 mb-4">
          <img src={logoCie} alt="CIE Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          CIE TRESO
        </h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
          Gestion de Tresorerie
        </p>
      </div>

      {/* Welcome Text */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Connexion
        </h2>
        <p className="text-zinc-500 text-sm mt-2">
          Connectez-vous pour acceder a votre espace de gestion
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0 mt-0.5">error</span>
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">Erreur de connexion</p>
            <p className="text-xs text-red-600 dark:text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">
            Adresse email
          </label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors text-xl">
              mail
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@cie.ci"
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">
              Mot de passe
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
            >
              Mot de passe oublie ?
            </button>
          </div>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors text-xl">
              lock
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-14 pl-12 pr-12 bg-white dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Remember Me - Custom Checkbox */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className={`size-5 rounded-md border-2 flex items-center justify-center transition-all ${
              rememberMe
                ? 'bg-primary border-primary'
                : 'border-zinc-300 dark:border-zinc-600 hover:border-primary/50'
            }`}
          >
            {rememberMe && (
              <span className="material-symbols-outlined text-white text-sm">check</span>
            )}
          </button>
          <label
            onClick={() => setRememberMe(!rememberMe)}
            className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer select-none"
          >
            Rester connecte sur cet appareil
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary-dark disabled:opacity-70 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-sm mt-2"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              Connexion en cours...
            </>
          ) : (
            <>
              Se connecter
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-center gap-6 text-xs">
          <button className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium transition-colors">
            Confidentialite
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <button className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium transition-colors">
            Conditions
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <button className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium transition-colors">
            Aide
          </button>
        </div>
        <p className="text-center text-[11px] text-zinc-400 mt-4">
          Direction des Systemes d'Information - CIE
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
