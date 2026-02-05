import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/presentation/hooks/useToast';
import { PATH } from '@/shared/constants/routes';

const SaisieDecaissementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entity: '',
    category: 'Paiements Fournisseurs',
    amount: '',
    reference: '',
    paymentMethod: 'Virement BACI',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({ type: 'success', title: 'Decaissement enregistre', message: 'En attente de validation DAF.' });
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
        <div className="bg-[#e65000] p-8 flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-4xl filled">payments</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Nouveau Decaissement</h2>
            <p className="text-orange-100 text-sm font-medium mt-1">Saisie d'une depense, d'un paiement fournisseur ou d'un flux sortant.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Date d'Emission</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">calendar_month</span>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#e65000]/20 text-zinc-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Reference Paiement / Facture</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">tag</span>
                <input
                  type="text"
                  placeholder="Ex: OP-CIE-2023-456"
                  required
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#e65000]/20 text-zinc-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Fournisseur / Beneficiaire</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">corporate_fare</span>
                <input
                  type="text"
                  placeholder="Nom de l'entreprise ou personne..."
                  required
                  value={formData.entity}
                  onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#e65000]/20 text-zinc-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Rubrique de Depense</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">account_tree</span>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#e65000]/20 text-zinc-900 dark:text-white transition-all appearance-none"
                >
                  <option>Paiements Fournisseurs</option>
                  <option>Achats Combustibles / Gaz</option>
                  <option>Charges de Personnel</option>
                  <option>Maintenance Reseau</option>
                  <option>Frais de Siege</option>
                  <option>Fiscalite & Taxes</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Mode de Reglement</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">account_balance</span>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#e65000]/20 text-zinc-900 dark:text-white transition-all appearance-none"
                >
                  <option>Virement BACI</option>
                  <option>Virement NSIA</option>
                  <option>Cheque</option>
                  <option>Mobile Money Pro</option>
                  <option>Especes (Caisse)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Montant (FCFA)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">payments</span>
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-xl font-black focus:ring-2 focus:ring-[#e65000]/20 text-[#e65000] transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Commentaires / Justification</label>
              <textarea
                rows={3}
                placeholder="Details de l'ordre de paiement..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-5 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#e65000]/20 text-zinc-900 dark:text-white transition-all"
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
              className="flex-1 h-14 bg-[#e65000] text-white rounded-2xl text-sm font-black shadow-xl shadow-[#e65000]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  ENREGISTREMENT...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  SOUMETTRE LE PAIEMENT
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaisieDecaissementPage;
