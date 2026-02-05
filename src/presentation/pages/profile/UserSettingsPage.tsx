import React, { useState } from 'react';
import { useToast } from '@/presentation/hooks/useToast';
import { useDarkMode } from '@/presentation/hooks/useDarkMode';
import { Button } from '@/presentation/components/ui/Button';

interface NotificationSettings {
  emailAlerts: boolean;
  importNotifications: boolean;
  validationAlerts: boolean;
  weeklyReport: boolean;
  securityAlerts: boolean;
}

interface DisplaySettings {
  language: string;
  dateFormat: string;
  numberFormat: string;
  timezone: string;
}

const UserSettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    importNotifications: true,
    validationAlerts: true,
    weeklyReport: false,
    securityAlerts: true,
  });

  const [display, setDisplay] = useState<DisplaySettings>({
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-FR',
    timezone: 'Africa/Abidjan',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    addToast({ type: 'success', title: 'Parametres enregistres', message: 'Vos preferences ont ete mises a jour.' });
  };

  const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
      }`}
    >
      <span
        className={`absolute top-1 left-1 size-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Parametres
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Personnalisez votre experience utilisateur
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon="save"
          isLoading={isSaving}
          onClick={handleSave}
        >
          Enregistrer
        </Button>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-violet-600">palette</span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              Apparence
            </h3>
            <p className="text-xs text-zinc-500">Personnalisez l'interface de l'application</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Mode sombre</p>
                <p className="text-xs text-zinc-500">Reduire la fatigue visuelle en faible luminosite</p>
              </div>
            </div>
            <ToggleSwitch checked={isDarkMode} onChange={toggleDarkMode} />
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">view_compact</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Mode compact</p>
                <p className="text-xs text-zinc-500">Afficher plus d'informations a l'ecran</p>
              </div>
            </div>
            <ToggleSwitch checked={false} onChange={() => addToast('Mode compact non disponible', 'info')} />
          </div>
        </div>
      </div>

      {/* Display & Regional */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">language</span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              Affichage & Regional
            </h3>
            <p className="text-xs text-zinc-500">Parametres de langue et de format</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Langue
            </label>
            <select
              value={display.language}
              onChange={(e) => setDisplay({ ...display, language: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="fr">Francais</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Format de date
            </label>
            <select
              value={display.dateFormat}
              onChange={(e) => setDisplay({ ...display, dateFormat: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Format des nombres
            </label>
            <select
              value={display.numberFormat}
              onChange={(e) => setDisplay({ ...display, numberFormat: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="fr-FR">1 234 567,89 (Francais)</option>
              <option value="en-US">1,234,567.89 (Anglais)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Fuseau horaire
            </label>
            <select
              value={display.timezone}
              onChange={(e) => setDisplay({ ...display, timezone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="Africa/Abidjan">Abidjan (GMT+0)</option>
              <option value="Europe/Paris">Paris (GMT+1)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600">notifications</span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              Notifications
            </h3>
            <p className="text-xs text-zinc-500">Gerez vos preferences de notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">mail</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Alertes par email</p>
                <p className="text-xs text-zinc-500">Recevoir les notifications importantes par email</p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifications.emailAlerts}
              onChange={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">cloud_upload</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Notifications d'import</p>
                <p className="text-xs text-zinc-500">Etre notifie a la fin de chaque import de donnees</p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifications.importNotifications}
              onChange={() => setNotifications({ ...notifications, importNotifications: !notifications.importNotifications })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">fact_check</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Alertes de validation</p>
                <p className="text-xs text-zinc-500">Recevoir une alerte quand une ecriture necessite validation</p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifications.validationAlerts}
              onChange={() => setNotifications({ ...notifications, validationAlerts: !notifications.validationAlerts })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">summarize</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Rapport hebdomadaire</p>
                <p className="text-xs text-zinc-500">Recevoir un resume de l'activite chaque semaine</p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifications.weeklyReport}
              onChange={() => setNotifications({ ...notifications, weeklyReport: !notifications.weeklyReport })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">security</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Alertes de securite</p>
                <p className="text-xs text-zinc-500">Etre notifie des connexions suspectes</p>
              </div>
            </div>
            <ToggleSwitch
              checked={notifications.securityAlerts}
              onChange={() => setNotifications({ ...notifications, securityAlerts: !notifications.securityAlerts })}
            />
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600">shield</span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              Donnees & Confidentialite
            </h3>
            <p className="text-xs text-zinc-500">Gestion de vos donnees personnelles</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">download</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Exporter mes donnees</p>
                <p className="text-xs text-zinc-500">Telecharger une copie de vos donnees personnelles</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addToast({ type: 'info', title: 'Export', message: 'Export de vos donnees en cours...' })}
            >
              Exporter
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">delete_forever</span>
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Supprimer mon compte</p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70">Cette action est irreversible</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
              onClick={() => addToast({ type: 'warning', title: 'Attention', message: 'Contactez l\'administrateur pour supprimer votre compte.' })}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
