import React, { useState } from 'react';
import { Tabs } from '@/presentation/components/ui/Tabs';
import { ConfigCrudPanel } from '@/presentation/components/settings/ConfigCrudPanel';
import { Badge } from '@/presentation/components/ui/Badge';
import { useToast } from '@/presentation/hooks/useToast';

// --- Types ---
interface ScenarioItem {
  id: string;
  label: string;
  code: string;
  montant: number;
  variation: number;
  description: string;
  isActive: boolean;
}

// --- Tabs ---
const SCENARIO_TABS = [
  { id: 'optimiste', label: 'Optimiste', icon: 'trending_up' },
  { id: 'pessimiste', label: 'Pessimiste', icon: 'trending_down' },
  { id: 'realiste', label: 'Réaliste', icon: 'balance' },
];

// --- Categories per tab ---
const CATEGORIES = [
  { key: 'energie', label: 'Energie', icon: 'bolt' },
  { key: 'rem-cie', label: 'REM CIE', icon: 'receipt_long' },
  { key: 'fonctionnement', label: 'Fonctionnement', icon: 'settings' },
  { key: 'service-bancaire', label: 'Service Bancaire', icon: 'account_balance' },
  { key: 'import', label: 'Import', icon: 'download_for_offline' },
  { key: 'annexe', label: 'Annexe', icon: 'attach_file' },
  { key: 'gaz', label: 'Gaz', icon: 'local_fire_department' },
];

// --- Mock data generator ---
const generateMockItems = (scenario: string, category: string): ScenarioItem[] => {
  const multiplier = scenario === 'optimiste' ? 1.2 : scenario === 'pessimiste' ? 0.8 : 1.0;
  const variationSign = scenario === 'optimiste' ? 1 : scenario === 'pessimiste' ? -1 : 0;
  const baseAmounts: Record<string, number[]> = {
    'energie': [1500, 2200, 1800],
    'rem-cie': [800, 1100, 950],
    'fonctionnement': [650, 420, 780],
    'service-bancaire': [320, 510, 280],
    'import': [1200, 900, 1050],
    'annexe': [180, 250, 140],
    'gaz': [720, 580, 830],
  };
  const amounts = baseAmounts[category] || [500, 600, 700];
  const labels: Record<string, string[]> = {
    'energie': ['Production thermique', 'Distribution réseau', 'Maintenance équipements'],
    'rem-cie': ['Rémunération personnel', 'Charges sociales', 'Primes et indemnités'],
    'fonctionnement': ['Fournitures bureau', 'Maintenance locaux', 'Charges courantes'],
    'service-bancaire': ['Frais de tenue de compte', 'Commissions bancaires', 'Intérêts créditeurs'],
    'import': ['Matières premières', 'Équipements techniques', 'Pièces de rechange'],
    'annexe': ['Assurances', 'Frais divers', 'Provisions'],
    'gaz': ['Approvisionnement gaz', 'Transport gaz', 'Stockage et distribution'],
  };
  const catLabels = labels[category] || ['Element 1', 'Element 2', 'Element 3'];

  return catLabels.map((label, i) => ({
    id: `${scenario}-${category}-${i + 1}`,
    label,
    code: `${category.toUpperCase().replace('-', '_')}_${String(i + 1).padStart(3, '0')}`,
    montant: Math.round(amounts[i] * multiplier),
    variation: Math.round(variationSign * (5 + Math.random() * 15) * 10) / 10,
    description: '',
    isActive: true,
  }));
};

const TemplateScenarioPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('optimiste');
  const [activeCategory, setActiveCategory] = useState('energie');

  // Store items per scenario+category
  const [itemsMap, setItemsMap] = useState<Record<string, ScenarioItem[]>>(() => {
    const map: Record<string, ScenarioItem[]> = {};
    SCENARIO_TABS.forEach((tab) => {
      CATEGORIES.forEach((cat) => {
        map[`${tab.id}-${cat.key}`] = generateMockItems(tab.id, cat.key);
      });
    });
    return map;
  });

  const [selectedItem, setSelectedItem] = useState<ScenarioItem | null>(null);

  const currentKey = `${activeTab}-${activeCategory}`;
  const currentItems = itemsMap[currentKey] || [];

  const inputClass = 'w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none';
  const labelClass = 'block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2';

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedItem(null);
  };

  const handleCategoryChange = (catKey: string) => {
    setActiveCategory(catKey);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Template Scénario
        </h1>
        <p className="text-sm text-zinc-500 font-semibold mt-1">
          Configuration des scénarios prévisionnels de trésorerie
        </p>
      </div>

      {/* Scenario Tabs */}
      <Tabs tabs={SCENARIO_TABS} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              activeCategory === cat.key
                ? 'bg-[#e65000] text-white shadow-lg shadow-[#e65000]/20'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ConfigCrudPanel */}
      <ConfigCrudPanel<ScenarioItem>
        title={CATEGORIES.find((c) => c.key === activeCategory)?.label || ''}
        subtitle={`Scénario ${SCENARIO_TABS.find((t) => t.id === activeTab)?.label || ''} — Paramètres prévisionnels`}
        items={currentItems}
        selectedItem={selectedItem}
        onSelect={setSelectedItem}
        onNew={() => {
          const catLabel = CATEGORIES.find((c) => c.key === activeCategory)?.label || 'Element';
          const newItem: ScenarioItem = {
            id: String(Date.now()),
            label: `Nouveau ${catLabel}`,
            code: `${activeCategory.toUpperCase().replace('-', '_')}_${String(currentItems.length + 1).padStart(3, '0')}`,
            montant: 0,
            variation: 0,
            description: '',
            isActive: true,
          };
          setItemsMap((prev) => ({
            ...prev,
            [currentKey]: [...(prev[currentKey] || []), newItem],
          }));
          setSelectedItem(newItem);
        }}
        onSave={async (item) => {
          setItemsMap((prev) => ({
            ...prev,
            [currentKey]: (prev[currentKey] || []).map((i) => (i.id === item.id ? item : i)),
          }));
          addToast(`"${item.label}" enregistré`, 'success');
        }}
        onDelete={async (id) => {
          setItemsMap((prev) => ({
            ...prev,
            [currentKey]: (prev[currentKey] || []).filter((i) => i.id !== id),
          }));
          setSelectedItem(null);
          addToast('Element supprimé', 'success');
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
              {item.variation !== 0 && (
                <Badge variant={item.variation > 0 ? 'success' : 'error'}>
                  {item.variation > 0 ? '+' : ''}{item.variation}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              {item.code} — {item.montant.toLocaleString()} 000 FCFA
            </p>
          </div>
        )}
        renderEditForm={(item, onChange) => (
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Libellé</label>
              <input
                type="text"
                value={item.label}
                onChange={(e) => onChange({ ...item, label: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Code</label>
              <input
                type="text"
                value={item.code}
                onChange={(e) => onChange({ ...item, code: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Montant (en milliers FCFA)</label>
              <input
                type="number"
                value={item.montant}
                onChange={(e) => onChange({ ...item, montant: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Variation (%)</label>
              <input
                type="number"
                step="0.1"
                value={item.variation}
                onChange={(e) => onChange({ ...item, variation: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={item.description}
                onChange={(e) => onChange({ ...item, description: e.target.value })}
                rows={3}
                className={`${inputClass} resize-none`}
              />
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
    </div>
  );
};

export default TemplateScenarioPage;
