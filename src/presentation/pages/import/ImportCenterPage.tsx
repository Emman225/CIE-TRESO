import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/presentation/hooks/useToast';
import { Stepper } from '@/presentation/components/ui/Stepper';
import { Badge } from '@/presentation/components/ui/Badge';
import { configRepository } from '@/infrastructure/di/container';
import type { ImportHistory } from '@/shared/types';
import type { PeriodeEntity } from '@/domain/entities/Periode';
import type { PlanEntity } from '@/domain/entities/PlanTresorerie';

const steps = [
  { id: 1, label: 'Type & Periode', icon: 'list_alt' },
  { id: 2, label: 'Upload Fichier', icon: 'cloud_upload' },
  { id: 3, label: 'Mapping & Validation', icon: 'alt_route' },
  { id: 4, label: 'Pre-validation', icon: 'fact_check' },
  { id: 5, label: 'Integration', icon: 'verified' },
];

const fileTypes = ['Encaissement', 'Decaissement', 'Frais Bancaire'] as const;

interface ImportRow {
  id: number; date: string; libelle: string; montant: string; reference: string; isValid: boolean; excluded: boolean; errors: string[];
}

const mockRows: ImportRow[] = [
  { id: 1, date: '2024-03-01', libelle: 'Facturation Zone Abidjan', montant: '125,000,000', reference: 'FCT-2024-001', isValid: true, excluded: false, errors: [] },
  { id: 2, date: '2024-03-02', libelle: 'Paiement Mobile Money', montant: '45,600,000', reference: 'MM-2024-042', isValid: true, excluded: false, errors: [] },
  { id: 3, date: 'INVALID', libelle: 'Grands Comptes Nord', montant: '89,200,000', reference: 'GC-2024-015', isValid: false, excluded: false, errors: ['Format de date invalide'] },
  { id: 4, date: '2024-03-04', libelle: 'Facturation Zone Abidjan', montant: '125,000,000', reference: 'FCT-2024-001', isValid: false, excluded: false, errors: ['Doublon detecte (ligne 1)'] },
  { id: 5, date: '2024-03-05', libelle: 'Redevance Municipale', montant: '34,100,000', reference: 'RM-2024-008', isValid: true, excluded: false, errors: [] },
  { id: 6, date: '2024-03-06', libelle: 'Subvention Etat', montant: '200,000,000', reference: 'SUB-INCONNU', isValid: false, excluded: false, errors: ['Reference non trouvee dans le referentiel'] },
  { id: 7, date: '2024-03-07', libelle: 'Vente Energie Industrielle', montant: '567,000,000', reference: 'VEI-2024-003', isValid: true, excluded: false, errors: [] },
];

const mockHistory: ImportHistory[] = [
  { id: '1', date: '24 Oct 2023 14:20', filename: 'Releve_BACI_Oct.xlsx', type: 'Encaissement', status: 'Validated', errors: 0 },
  { id: '2', date: '23 Oct 2023 09:15', filename: 'Rapport_Ventes_Q3.csv', type: 'Encaissement', status: 'Pending', errors: 0 },
  { id: '3', date: '22 Oct 2023 16:45', filename: 'Depenses_Brouillon.xlsx', type: 'Decaissement', status: 'Rejected', errors: 14 },
  { id: '4', date: '20 Oct 2023 10:00', filename: 'Frais_Bancaires_Sep.xlsx', type: 'Frais Bancaire', status: 'Validated', errors: 0 },
];

const formatErrors = [{ row: 3, message: 'Format de date invalide - attendu YYYY-MM-DD' }];
const duplicateWarnings = [{ row: 4, message: 'Doublon detecte: FCT-2024-001 existe deja (ligne 1)' }];
const referentialChecks = [{ row: 6, message: 'Reference SUB-INCONNU non trouvee dans le referentiel des tiers' }];

const ImportCenterPage: React.FC = () => {
  const { toasts, addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileType, setSelectedFileType] = useState<string>('Encaissement');
  const [selectedPeriod, setSelectedPeriod] = useState('3');
  const [selectedPlan, setSelectedPlan] = useState('1');
  const [periodes, setPeriodes] = useState<PeriodeEntity[]>([]);
  const [plans, setPlans] = useState<PlanEntity[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [p, pl] = await Promise.all([
        configRepository.getPeriodes(),
        configRepository.getPlans(),
      ]);
      setPeriodes(p);
      setPlans(pl);
      if (p.length > 2) setSelectedPeriod(p[2].id);
      if (pl.length > 0) setSelectedPlan(pl[0].id);
    };
    loadData();
  }, []);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>(mockRows);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => { if (currentStep < 5) setCurrentStep(s => s + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsUploading(true);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => { setIsUploading(false); setCurrentStep(3); }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
  };

  const toggleRowExclusion = (rowId: number) => {
    setImportRows(prev => prev.map(r => r.id === rowId ? { ...r, excluded: !r.excluded } : r));
  };

  const validRowCount = importRows.filter(r => r.isValid && !r.excluded).length;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Type de donnee</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fileTypes.map(type => (
                  <button key={type} onClick={() => setSelectedFileType(type)}
                    className={`p-6 border-2 rounded-2xl text-left transition-all hover:border-[#e65000]/50 hover:bg-[#e65000]/5 ${
                      selectedFileType === type ? 'border-[#e65000] bg-[#e65000]/5 shadow-inner' : 'border-zinc-100 dark:border-zinc-800'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`material-symbols-outlined ${selectedFileType === type ? 'text-[#e65000]' : 'text-zinc-400'}`}>
                        {type === 'Encaissement' ? 'download_for_offline' : type === 'Decaissement' ? 'upload_file' : 'account_balance'}
                      </span>
                      {selectedFileType === type && <span className="material-symbols-outlined text-[#e65000]">check_circle</span>}
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-white">{type}</p>
                    <p className="text-xs text-zinc-500 mt-1">Donnees structurees pour integration directe.</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Periode</label>
                <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                  className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold">
                  {periodes.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Plan</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
                  className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold">
                  {plans.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleNext} className="px-10 py-3 bg-[#e65000] text-white font-black rounded-xl shadow-lg shadow-[#e65000]/20 hover:scale-105 active:scale-95 transition-all">
                Continuer
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`group border-4 border-dashed rounded-3xl p-16 flex flex-col items-center gap-6 cursor-pointer transition-all ${
              isUploading ? 'border-[#e65000]/20 bg-zinc-50 dark:bg-zinc-800/20 cursor-wait' : 'border-zinc-100 dark:border-zinc-800 hover:border-[#e65000]/40 hover:bg-[#e65000]/5'
            }`}>
            <div className={`p-6 rounded-full transition-all duration-500 ${isUploading ? 'bg-[#e65000]/20 scale-110' : 'bg-[#e65000]/10 group-hover:scale-110'}`}>
              <span className={`material-symbols-outlined text-[#e65000] text-5xl ${isUploading ? 'animate-bounce' : ''}`}>
                {isUploading ? 'sync' : 'upload_file'}
              </span>
            </div>
            {isUploading ? (
              <div className="w-full max-w-xs space-y-4 text-center">
                <p className="text-sm font-bold text-[#e65000]">Analyse du fichier : {fileName}</p>
                <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#e65000] transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-xs text-zinc-400 font-black uppercase tracking-widest">{uploadProgress}% complete</p>
              </div>
            ) : (
              <div className="text-center max-w-md space-y-3">
                <h4 className="text-xl font-black text-zinc-900 dark:text-white">Glissez-deposez votre document</h4>
                <p className="text-zinc-500 text-sm font-medium italic">Type actif : {selectedFileType}</p>
                <p className="text-zinc-400 text-xs mt-4">Formats acceptes : .xlsx, .csv, .xls (Max 20MB)</p>
                <button className="mt-6 px-8 py-3 bg-[#e65000] text-white font-bold rounded-xl shadow-lg shadow-[#e65000]/20 hover:translate-y-[-2px] active:translate-y-0 transition-all">
                  Parcourir mes fichiers
                </button>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".csv,.xlsx,.xls" />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight">Configuration du Mapping</h4>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Fichier detecte : {fileName}</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Date de l'operation", icon: 'calendar_month', match: 'Colonne A (Date)' },
                { label: 'Libelle Transaction', icon: 'description', match: 'Colonne B (Description)' },
                { label: 'Montant (Debit/Credit)', icon: 'payments', match: 'Colonne D (Montant)' },
                { label: 'Reference / Tiers', icon: 'tag', match: 'Colonne F (Ref)' },
              ].map((field, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors hover:border-[#e65000]/20">
                  <div className="size-10 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                    <span className="material-symbols-outlined text-lg">{field.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{field.label}</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Systeme CIE</p>
                  </div>
                  <span className="material-symbols-outlined text-zinc-300">swap_horiz</span>
                  <div className="flex-1">
                    <select className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold px-3 focus:ring-2 focus:ring-[#e65000]/20">
                      <option>{field.match}</option>
                      <option>Selection manuelle...</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Coherence Validation Results */}
            <div className="mt-8 space-y-4">
              <h4 className="font-black text-zinc-900 dark:text-white text-sm uppercase tracking-tight">Resultats de Coherence</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="error">Erreurs Format</Badge>
                    <span className="text-sm font-black text-red-700">{formatErrors.length}</span>
                  </div>
                  {formatErrors.map((e, i) => (
                    <p key={i} className="text-[11px] text-red-600 font-medium">Ligne {e.row}: {e.message}</p>
                  ))}
                </div>
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="warning">Doublons</Badge>
                    <span className="text-sm font-black text-amber-700">{duplicateWarnings.length}</span>
                  </div>
                  {duplicateWarnings.map((e, i) => (
                    <p key={i} className="text-[11px] text-amber-600 font-medium">Ligne {e.row}: {e.message}</p>
                  ))}
                </div>
                <div className="p-4 rounded-2xl border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="warning">Referentiel</Badge>
                    <span className="text-sm font-black text-yellow-700">{referentialChecks.length}</span>
                  </div>
                  {referentialChecks.map((e, i) => (
                    <p key={i} className="text-[11px] text-yellow-600 font-medium">Ligne {e.row}: {e.message}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10">
              <button onClick={handleBack} className="px-6 py-2 text-zinc-500 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Retour</button>
              <button onClick={handleNext} className="px-10 py-3 bg-[#e65000] text-white font-black rounded-xl shadow-lg shadow-[#e65000]/20">Valider le Mapping</button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight">Pre-validation des Donnees</h4>
              <div className="flex items-center gap-3">
                <Badge variant="success">{validRowCount} valides</Badge>
                <Badge variant="error">{importRows.filter(r => !r.isValid).length} invalides</Badge>
                <Badge variant="neutral">{importRows.filter(r => r.excluded).length} exclus</Badge>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Libelle</th>
                    <th className="px-4 py-3">Montant</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                  {importRows.map(row => (
                    <tr key={row.id} className={`transition-colors ${row.excluded ? 'opacity-40 bg-zinc-50 dark:bg-zinc-800/10' : row.isValid ? '' : 'bg-red-50/50 dark:bg-red-900/5'}`}>
                      <td className="px-4 py-3">
                        {row.excluded ? (
                          <span className="material-symbols-outlined text-zinc-400 text-lg">block</span>
                        ) : row.isValid ? (
                          <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                        ) : (
                          <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 font-bold ${!row.isValid && row.errors.some(e => e.includes('date')) ? 'text-red-600' : 'text-zinc-700 dark:text-zinc-300'}`}>{row.date}</td>
                      <td className="px-4 py-3 font-bold text-zinc-700 dark:text-zinc-300">{row.libelle}</td>
                      <td className="px-4 py-3 font-black text-zinc-900 dark:text-white">{row.montant}</td>
                      <td className="px-4 py-3 font-bold text-zinc-500">{row.reference}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleRowExclusion(row.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors ${
                            row.excluded ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-zinc-100 text-zinc-500 hover:bg-red-100 hover:text-red-700'
                          }`}>
                          {row.excluded ? 'INCLURE' : 'EXCLURE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {importRows.some(r => !r.isValid && !r.excluded) && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600">warning</span>
                <p className="text-xs font-bold text-amber-700">Attention : des lignes invalides seront ignorees lors de l'integration.</p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={handleBack} className="px-6 py-2 text-zinc-500 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Retour</button>
              <button onClick={handleNext} className="px-12 py-3 bg-[#e65000] text-white font-black rounded-xl shadow-2xl shadow-[#e65000]/30 hover:scale-105 active:scale-95 transition-all">
                Lancer l'integration ({validRowCount} lignes)
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center py-12 space-y-8">
            <div className="size-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/10">
              <span className="material-symbols-outlined text-5xl filled">verified</span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-zinc-900 dark:text-white">Integration reussie</h4>
              <p className="text-zinc-500 mt-3 font-medium"><strong className="text-zinc-900 dark:text-white">{validRowCount} lignes</strong> integrees avec succes. {importRows.length - validRowCount} lignes ignorees.</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 max-w-md mx-auto text-left space-y-3">
              <div className="flex justify-between text-xs font-bold"><span className="text-zinc-400 uppercase">Volume Total</span><span className="text-zinc-900 dark:text-white">1.25B FCFA</span></div>
              <div className="flex justify-between text-xs font-bold"><span className="text-zinc-400 uppercase">Periode</span><span className="text-zinc-900 dark:text-white">{periodes.find(p => p.id === selectedPeriod)?.label}</span></div>
              <div className="flex justify-between text-xs font-bold"><span className="text-zinc-400 uppercase">Type</span><span className="text-zinc-900 dark:text-white">{selectedFileType}</span></div>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <button onClick={() => { setCurrentStep(1); setFileName(null); setImportRows(mockRows); }}
                className="px-8 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 transition-colors">Nouvel import</button>
              <button onClick={() => {
                addToast({ type: 'success', title: 'Export termine', message: 'Rapport d\'integration telecharge.' });
              }} className="px-12 py-3 bg-[#e65000] text-white font-black rounded-xl shadow-2xl shadow-[#e65000]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">download</span> Exporter le rapport
              </button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
          {toasts.map(t => (
            <div key={t.id} className={`p-4 rounded-2xl shadow-xl border text-sm font-bold ${
              t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="font-black text-xs uppercase tracking-wider">{t.title}</p>
              {t.message && <p className="mt-1 text-xs opacity-80">{t.message}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Centre d'Importation</h2>
        <p className="text-zinc-500 font-medium">Alimentez le plan de tresorerie en important vos releves bancaires ou fichiers Excel.</p>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm p-8 min-h-[480px] flex flex-col justify-center">
        {renderStepContent()}
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#e65000]">history</span>
          Historique des imports
        </h3>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Date & Heure</th>
                <th className="px-8 py-4">Fichier Source</th>
                <th className="px-8 py-4">Rubrique</th>
                <th className="px-8 py-4">Statut</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              {mockHistory.map(item => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="px-8 py-5 text-zinc-500 font-medium">{item.date}</td>
                  <td className="px-8 py-5 font-bold text-zinc-900 dark:text-white">{item.filename}</td>
                  <td className="px-8 py-5 text-zinc-500 font-medium">{item.type}</td>
                  <td className="px-8 py-5">
                    <Badge variant={item.status === 'Validated' ? 'success' : item.status === 'Pending' ? 'warning' : 'error'}>
                      {item.status === 'Validated' ? 'Succes' : item.status === 'Pending' ? 'Attente' : 'Erreur'}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="material-symbols-outlined text-zinc-400 hover:text-[#e65000] transition-colors">download</button>
                    <button className="material-symbols-outlined text-zinc-400 hover:text-red-500 transition-colors ml-4">delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImportCenterPage;
