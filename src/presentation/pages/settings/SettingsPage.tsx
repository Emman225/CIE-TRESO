import React, { useState, useEffect } from 'react';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { ConfigCrudPanel } from '@/presentation/components/settings/ConfigCrudPanel';
import { Badge } from '@/presentation/components/ui/Badge';
import { useToast } from '@/presentation/hooks/useToast';
import { configRepository } from '@/infrastructure/di/container';
import type { Categorie, Regroupement, Rubrique, Pole } from '@/shared/types';
import type { PeriodeEntity } from '@/domain/entities/Periode';
import type { PlanEntity } from '@/domain/entities/PlanTresorerie';

const SETTINGS_TABS = [
  { id: 'categories', label: 'Categories', icon: 'category' },
  { id: 'regroupements', label: 'Regroupements', icon: 'folder_copy' },
  { id: 'rubriques', label: 'Rubriques', icon: 'list_alt' },
  { id: 'periodes', label: 'Periodes', icon: 'calendar_month' },
  { id: 'plans', label: 'Plans', icon: 'account_balance' },
  { id: 'poles', label: 'Poles', icon: 'corporate_fare' },
];

const SettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('categories');

  // --- Categories ---
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(null);

  // --- Regroupements ---
  const [regroupements, setRegroupements] = useState<Regroupement[]>([]);
  const [selectedRegroupement, setSelectedRegroupement] = useState<Regroupement | null>(null);

  // --- Rubriques ---
  const [rubriques, setRubriques] = useState<Rubrique[]>([]);
  const [selectedRubrique, setSelectedRubrique] = useState<Rubrique | null>(null);

  // --- Periodes ---
  const [periodes, setPeriodes] = useState<PeriodeEntity[]>([]);
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeEntity | null>(null);

  // --- Plans ---
  const [plans, setPlans] = useState<PlanEntity[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanEntity | null>(null);

  // --- Poles ---
  const [poles, setPoles] = useState<Pole[]>([]);
  const [selectedPole, setSelectedPole] = useState<Pole | null>(null);

  // Load all config data from repository
  useEffect(() => {
    const loadData = async () => {
      const [cats, regs, rubs, pers, pls, pols] = await Promise.all([
        configRepository.getCategories(),
        configRepository.getRegroupements(),
        configRepository.getRubriques(),
        configRepository.getPeriodes(),
        configRepository.getPlans(),
        configRepository.getPoles(),
      ]);
      setCategories(cats);
      setRegroupements(regs);
      setRubriques(rubs);
      setPeriodes(pers);
      setPlans(pls);
      setPoles(pols);
    };
    loadData();
  }, []);

  // ============ Generic Handlers ============

  const inputClass = 'w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none';
  const selectClass = inputClass;
  const labelClass = 'block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2';

  // ============ Categories Tab ============
  const renderCategoriesPanel = () => (
    <ConfigCrudPanel<Categorie>
      title="Categories"
      subtitle="Classification des flux de tresorerie"
      items={categories}
      selectedItem={selectedCategorie}
      onSelect={setSelectedCategorie}
      onNew={() => {
        const newItem: Categorie = {
          id: String(Date.now()),
          label: 'Nouvelle categorie',
          code: 'CAT_NEW_' + (categories.length + 1),
          type: 'RECEIPT',
          description: '',
          isActive: true,
        };
        setCategories((prev) => [...prev, newItem]);
        setSelectedCategorie(newItem);
      }}
      onSave={async (item) => {
        setCategories((prev) => prev.map((c) => (c.id === item.id ? item : c)));
        addToast(`Categorie "${item.label}" enregistree`, 'success');
      }}
      onDelete={async (id) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setSelectedCategorie(null);
        addToast('Categorie supprimee', 'success');
      }}
      renderListItem={(item, isSelected) => (
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-black ${isSelected ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>
              {item.label}
            </p>
            <Badge variant={item.type === 'RECEIPT' ? 'success' : 'error'}>
              {item.type === 'RECEIPT' ? 'Encaiss.' : 'Decaiss.'}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">{item.code}</p>
        </div>
      )}
      renderEditForm={(item, onChange) => (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Libelle</label>
            <input type="text" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Code</label>
            <input type="text" value={item.code} onChange={(e) => onChange({ ...item, code: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Type de flux</label>
            <select value={item.type} onChange={(e) => onChange({ ...item, type: e.target.value as 'RECEIPT' | 'PAYMENT' })} className={selectClass}>
              <option value="RECEIPT">Encaissement</option>
              <option value="PAYMENT">Decaissement</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={item.description} onChange={(e) => onChange({ ...item, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Actif</label>
            <button
              type="button"
              onClick={() => onChange({ ...item, isActive: !item.isActive })}
              className={`relative w-12 h-6 rounded-full transition-colors ${item.isActive ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
            >
              <div className={`absolute top-1 size-4 rounded-full bg-white shadow transition-transform ${item.isActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      )}
    />
  );

  // ============ Regroupements Tab ============
  const renderRegroupementsPanel = () => (
    <ConfigCrudPanel<Regroupement>
      title="Regroupements"
      subtitle="Groupes de lignes du plan de tresorerie"
      items={regroupements}
      selectedItem={selectedRegroupement}
      onSelect={setSelectedRegroupement}
      onNew={() => {
        const newItem: Regroupement = {
          id: String(Date.now()),
          label: 'Nouveau regroupement',
          code: 'RG_NEW_' + (regroupements.length + 1),
          type: 'Encaissement',
          order: regroupements.length + 1,
        };
        setRegroupements((prev) => [...prev, newItem]);
        setSelectedRegroupement(newItem);
      }}
      onSave={async (item) => {
        setRegroupements((prev) => prev.map((r) => (r.id === item.id ? item : r)));
        addToast(`Regroupement "${item.label}" enregistre`, 'success');
      }}
      onDelete={async (id) => {
        setRegroupements((prev) => prev.filter((r) => r.id !== id));
        setSelectedRegroupement(null);
        addToast('Regroupement supprime', 'success');
      }}
      renderListItem={(item, isSelected) => (
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-black ${isSelected ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>
              {item.label}
            </p>
            <Badge variant={item.type === 'Encaissement' ? 'success' : 'error'}>
              {item.type}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">{item.code} | Ordre: {item.order}</p>
        </div>
      )}
      renderEditForm={(item, onChange) => (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Libelle</label>
            <input type="text" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Code</label>
            <input type="text" value={item.code} onChange={(e) => onChange({ ...item, code: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select value={item.type} onChange={(e) => onChange({ ...item, type: e.target.value as 'Encaissement' | 'Decaissement' })} className={selectClass}>
              <option value="Encaissement">Encaissement</option>
              <option value="Decaissement">Decaissement</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Ordre d'affichage</label>
            <input type="number" value={item.order} onChange={(e) => onChange({ ...item, order: Number(e.target.value) })} className={inputClass} />
          </div>
        </div>
      )}
    />
  );

  // ============ Rubriques Tab ============
  const renderRubriquesPanel = () => (
    <ConfigCrudPanel<Rubrique>
      title="Rubriques"
      subtitle="Lignes detaillees du plan de tresorerie"
      items={rubriques}
      selectedItem={selectedRubrique}
      onSelect={setSelectedRubrique}
      onNew={() => {
        const newItem: Rubrique = {
          id: String(Date.now()),
          label: 'Nouvelle rubrique',
          code: 'RUB_NEW_' + (rubriques.length + 1),
          group: 'RECEIPT',
          type: 'Manual',
        };
        setRubriques((prev) => [...prev, newItem]);
        setSelectedRubrique(newItem);
      }}
      onSave={async (item) => {
        setRubriques((prev) => prev.map((r) => (r.id === item.id ? item : r)));
        addToast(`Rubrique "${item.label}" enregistree`, 'success');
      }}
      onDelete={async (id) => {
        setRubriques((prev) => prev.filter((r) => r.id !== id));
        setSelectedRubrique(null);
        addToast('Rubrique supprimee', 'success');
      }}
      renderListItem={(item, isSelected) => (
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-black ${isSelected ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>
              {item.label}
            </p>
            <Badge variant={item.group === 'RECEIPT' ? 'success' : 'error'}>
              {item.group === 'RECEIPT' ? 'Enc.' : 'Dec.'}
            </Badge>
            <Badge variant="neutral">{item.type}</Badge>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">{item.code}</p>
        </div>
      )}
      renderEditForm={(item, onChange) => (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Libelle</label>
            <input type="text" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Code</label>
            <input type="text" value={item.code} onChange={(e) => onChange({ ...item, code: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Groupe</label>
            <select value={item.group} onChange={(e) => onChange({ ...item, group: e.target.value as 'RECEIPT' | 'PAYMENT' })} className={selectClass}>
              <option value="RECEIPT">Encaissement</option>
              <option value="PAYMENT">Decaissement</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Type de saisie</label>
            <select value={item.type} onChange={(e) => onChange({ ...item, type: e.target.value as 'Manual' | 'Formula' | 'Calculated' })} className={selectClass}>
              <option value="Manual">Manuel</option>
              <option value="Formula">Formule</option>
              <option value="Calculated">Calcule</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Regroupement</label>
            <select value={item.regroupementId || ''} onChange={(e) => onChange({ ...item, regroupementId: e.target.value || undefined })} className={selectClass}>
              <option value="">-- Aucun --</option>
              {regroupements.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Categorie</label>
            <select value={item.categorieId || ''} onChange={(e) => onChange({ ...item, categorieId: e.target.value || undefined })} className={selectClass}>
              <option value="">-- Aucune --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    />
  );

  // ============ Periodes Tab ============
  const renderPeriodesPanel = () => (
    <ConfigCrudPanel<PeriodeEntity>
      title="Periodes"
      subtitle="Periodes mensuelles de tresorerie"
      items={periodes}
      selectedItem={selectedPeriode}
      onSelect={setSelectedPeriode}
      onNew={() => {
        const nextMonth = periodes.length + 1;
        const newItem: PeriodeEntity = {
          id: String(Date.now()),
          label: `Mois ${nextMonth} 2024`,
          year: 2024,
          month: nextMonth,
          startDate: `2024-${String(nextMonth).padStart(2, '0')}-01`,
          endDate: `2024-${String(nextMonth).padStart(2, '0')}-28`,
          isClosed: false,
        };
        setPeriodes((prev) => [...prev, newItem]);
        setSelectedPeriode(newItem);
      }}
      onSave={async (item) => {
        setPeriodes((prev) => prev.map((p) => (p.id === item.id ? item : p)));
        addToast(`Periode "${item.label}" enregistree`, 'success');
      }}
      onDelete={async (id) => {
        setPeriodes((prev) => prev.filter((p) => p.id !== id));
        setSelectedPeriode(null);
        addToast('Periode supprimee', 'success');
      }}
      renderListItem={(item, isSelected) => (
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-black ${isSelected ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>
              {item.label}
            </p>
            <Badge variant={item.isClosed ? 'neutral' : 'success'}>
              {item.isClosed ? 'Cloture' : 'Ouvert'}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {item.year} - Mois {item.month}
          </p>
        </div>
      )}
      renderEditForm={(item, onChange) => (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Libelle</label>
            <input type="text" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Annee</label>
              <input type="number" value={item.year} onChange={(e) => onChange({ ...item, year: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mois</label>
              <input type="number" min={1} max={12} value={item.month} onChange={(e) => onChange({ ...item, month: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>
          {/* Date debut/fin retires */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Cloture</label>
            <button
              type="button"
              onClick={() => onChange({ ...item, isClosed: !item.isClosed })}
              className={`relative w-12 h-6 rounded-full transition-colors ${item.isClosed ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
            >
              <div className={`absolute top-1 size-4 rounded-full bg-white shadow transition-transform ${item.isClosed ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      )}
    />
  );

  // ============ Plans Tab ============
  const renderPlansPanel = () => (
    <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-12 text-center">
      <span className="material-symbols-outlined text-5xl text-zinc-300 dark:text-zinc-600 mb-4 block">account_balance</span>
      <h3 className="text-lg font-black text-zinc-400 dark:text-zinc-500">Plans de Tresorerie</h3>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">Aucun contenu a afficher pour le moment.</p>
    </div>
  );

  // ============ Poles Tab ============
  const renderPolesPanel = () => (
    <ConfigCrudPanel<Pole>
      title="Poles"
      subtitle="Directions et departements"
      items={poles}
      selectedItem={selectedPole}
      onSelect={setSelectedPole}
      onNew={() => {
        const newItem: Pole = {
          id: String(Date.now()),
          label: 'Nouveau pole',
          code: 'POLE_' + (poles.length + 1),
          isActive: true,
        };
        setPoles((prev) => [...prev, newItem]);
        setSelectedPole(newItem);
      }}
      onSave={async (item) => {
        setPoles((prev) => prev.map((p) => (p.id === item.id ? item : p)));
        addToast(`Pole "${item.label}" enregistre`, 'success');
      }}
      onDelete={async (id) => {
        setPoles((prev) => prev.filter((p) => p.id !== id));
        setSelectedPole(null);
        addToast('Pole supprime', 'success');
      }}
      renderListItem={(item, isSelected) => (
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-black ${isSelected ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>
              {item.label}
            </p>
            <Badge variant={item.isActive ? 'success' : 'neutral'}>
              {item.isActive ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">{item.code}</p>
        </div>
      )}
      renderEditForm={(item, onChange) => (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Libelle</label>
            <input type="text" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Code</label>
            <input type="text" value={item.code} onChange={(e) => onChange({ ...item, code: e.target.value })} className={inputClass} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Actif</label>
            <button
              type="button"
              onClick={() => onChange({ ...item, isActive: !item.isActive })}
              className={`relative w-12 h-6 rounded-full transition-colors ${item.isActive ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
            >
              <div className={`absolute top-1 size-4 rounded-full bg-white shadow transition-transform ${item.isActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      )}
    />
  );

  // ============ Render Active Tab Content ============
  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return renderCategoriesPanel();
      case 'regroupements':
        return renderRegroupementsPanel();
      case 'rubriques':
        return renderRubriquesPanel();
      case 'periodes':
        return renderPeriodesPanel();
      case 'plans':
        return renderPlansPanel();
      case 'poles':
        return renderPolesPanel();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Parametrage
        </h1>
        <p className="text-sm text-zinc-500 font-semibold mt-1">
          Configuration generale de l'application
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default SettingsPage;
