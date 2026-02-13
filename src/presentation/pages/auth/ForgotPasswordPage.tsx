import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/hooks/useAuth';
import logoCie from '@/assets/Logo_CIE.jpg';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);
    try {
      await forgotPassword(email);
      setSuccessMessage('Un email de reinitialisation a ete envoye a votre adresse.');
    } catch {
      // Error is already set in the useAuth hook state
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-zinc-700/50 overflow-hidden">
      {/* Logo & Branding - Orange Header */}
      <div className="px-8 md:px-10 pt-8 pb-8 flex flex-col items-center" style={{ backgroundColor: '#e65000' }}>
        <div className="bg-white size-16 rounded-2xl flex items-center justify-center p-2 shadow-xl shadow-orange-700/30 mb-4 border border-orange-300">
          <img src={logoCie} alt="CIE Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          CIE TRESO
        </h1>
        <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mt-1">
          Gestion de Trésorerie
        </p>
      </div>

      <div className="p-8 md:p-10">

      {/* Icon & Header */}
      <div className="mb-8">
        <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-3xl">lock_reset</span>
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Mot de passe oublie ?
        </h2>
        <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
          Saisissez votre adresse email professionnelle. Vous recevrez un lien pour creer un nouveau mot de passe.
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-[#22a84c]/10 dark:bg-[#22a84c]/15 border border-[#22a84c]/30 dark:border-[#22a84c]/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined text-[#22a84c] text-xl flex-shrink-0 mt-0.5">check_circle</span>
          <div>
            <p className="text-sm font-bold text-[#22a84c] dark:text-[#2ec45a]">Email envoye</p>
            <p className="text-xs text-[#1d8f40] dark:text-[#2ec45a]/80 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0 mt-0.5">error</span>
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">Erreur</p>
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
              onChange={(e) => {
                setEmail(e.target.value);
                setSuccessMessage(null);
                clearError();
              }}
              placeholder="nom@cie.ci"
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !!successMessage}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary-dark disabled:opacity-70 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              Envoi en cours...
            </>
          ) : successMessage ? (
            <>
              <span className="material-symbols-outlined text-xl">check</span>
              Email envoye
            </>
          ) : (
            <>
              Envoyer le lien de reinitialisation
              <span className="material-symbols-outlined text-xl">send</span>
            </>
          )}
        </button>
      </form>

      {/* Back to login */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => {
            clearError();
            navigate('/login');
          }}
          className="w-full h-14 bg-white dark:bg-zinc-800/50 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Retour a la connexion
        </button>
      </div>

      </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
