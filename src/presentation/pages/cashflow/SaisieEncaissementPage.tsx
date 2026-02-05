import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/presentation/hooks/useToast';
import { PATH } from '@/shared/constants/routes';

const SaisieEncaissementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entity: '',
    category: "Vente d'Energie",
    amount: '',
    reference: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({ type: 'success', title: 'Encaissement enregistre', message: 'Le flux entrant a ete ajoute au plan de tresorerie.' });
      setTimeout(() => navigate(PATH.PLAN), 1000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
          {toasts.map((t) => (
            <div key={t.id} className={`p-4 rounded-2xl shadow-xl border text-sm font-bold ${
              t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="font-black text-xs uppercase tracking-wider">{t.title}</p>
              {t.message && <p className="mt-1 text-xs opacity-80">{t.message}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        <div className="bg-green-600 p-8 flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-4xl filled">add_card</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Nouvel Encaissement</h2>
            <p className="text-green-100 text-sm font-medium mt-1">Saisie manuelle d'une recette ou d'un flux entrant.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Date de Valeur</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">calendar_month</span>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500/20 text-zinc-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Reference Transaction</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">tag</span>
                <input
                  type="text"
                  placeholder="Ex: FCT-2023-OCT-001"
                  required
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500/20 text-zinc-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Entite / Client</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">person</span>
                <input
                  type="text"
                  placeholder="Nom du tiers..."
                  required
                  value={formData.entity}
                  onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500/20 text-zinc-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Rubrique de Recette</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">category</span>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500/20 text-zinc-900 dark:text-white transition-all appearance-none"
                >
                  <option>Vente d'Energie</option>
                  <option>Paiements Mobile Money</option>
                  <option>Grands Comptes</option>
                  <option>Subventions Etatiques</option>
                  <option>Autres Recettes</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Montant (FCFA)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">payments</span>
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-16 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-2xl font-black focus:ring-4 focus:ring-green-500/10 text-green-600 dark:text-green-500 transition-all placeholder:text-zinc-300"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-zinc-300 dark:text-zinc-600">FCFA</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Description / Motif</label>
              <textarea
                rows={3}
                placeholder="Details supplementaires..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-5 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-green-500/20 text-zinc-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate(PATH.DASHBOARD)}
              className="flex-1 h-14 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-black text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              ANNULER
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-14 bg-green-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  TRAITEMENT...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">verified</span>
                  VALIDER L'ENCAISSEMENT
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaisieEncaissementPage;
