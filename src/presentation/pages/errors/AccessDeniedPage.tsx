import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/Button';

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="size-24 mx-auto mb-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-red-600 dark:text-red-400">
            shield_lock
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
          Acces Refuse
        </h1>

        {/* Description */}
        <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
          Vous n'avez pas les permissions necessaires pour acceder a cette page.
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur systeme.
        </p>

        {/* Error Code */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl mb-8">
          <span className="material-symbols-outlined text-red-500 text-lg">error</span>
          <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
            Erreur 403 - Acces interdit
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon="arrow_back"
            onClick={() => navigate(-1)}
          >
            Retour
          </Button>
          <Button
            variant="primary"
            size="md"
            icon="home"
            onClick={() => navigate('/')}
          >
            Tableau de bord
          </Button>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
            Besoin d'aide ?
          </p>
          <p className="text-sm text-zinc-500">
            Contactez le support IT a{' '}
            <a href="mailto:support-it@cie.ci" className="text-primary font-bold hover:underline">
              support-it@cie.ci
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
