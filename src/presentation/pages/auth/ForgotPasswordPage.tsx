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
      {/* Mobile Logo - Hidden on large screens where left panel shows */}
      <div className="flex flex-col items-center mb-10 lg:hidden">
        <div className="bg-white size-14 rounded-2xl flex items-center justify-center p-1.5 shadow-xl shadow-primary/30 mb-4">
          <img src={logoCie} alt="CIE Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          CIE TRESO
        </h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
          Treasury Management
        </p>
      </div>

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
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined text-emerald-500 text-xl flex-shrink-0 mt-0.5">check_circle</span>
          <div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Email envoye</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-0.5">{successMessage}</p>
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

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-500 text-xl flex-shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Besoin d'aide ?</p>
            <p className="text-xs text-blue-600 dark:text-blue-400/80 mt-1 leading-relaxed">
              Si vous n'avez pas recu l'email apres quelques minutes, verifiez votre dossier spam ou contactez le support informatique.
            </p>
          </div>
        </div>
      </div>

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

export default ForgotPasswordPage;
