import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { useToast } from '@/presentation/hooks/useToast';
import type { Severity } from '@/shared/types';

// ============ Types ============
type NotificationType = 'validation' | 'import' | 'system' | 'alert' | 'forecast' | 'user';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: Severity;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  source: string;
}

// ============ Mock Data ============
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOTIF-001',
    title: 'Ecriture en attente de validation',
    message: 'Le decaissement OP-CIE-2026-090 de 3 450 000 000 FCFA (Total Energies CI) est en attente de votre validation depuis 2 jours.',
    type: 'validation',
    severity: 'critical',
    timestamp: '2026-02-04 08:15',
    read: false,
    actionUrl: '/validation',
    actionLabel: 'Valider',
    source: 'Workflow de validation',
  },
  {
    id: 'NOTIF-002',
    title: 'Import termine avec erreurs',
    message: 'L\'import du fichier "releve_BIAO_janvier_2026.xlsx" est termine. 3 lignes contiennent des erreurs de validation.',
    type: 'import',
    severity: 'warning',
    timestamp: '2026-02-04 07:45',
    read: false,
    actionUrl: '/imports',
    actionLabel: 'Voir les erreurs',
    source: 'Centre d\'import',
  },
  {
    id: 'NOTIF-003',
    title: 'Seuil de tresorerie critique',
    message: 'Le solde du compte BIAO CI (Courant) est passe sous le seuil de 10 milliards FCFA. Solde actuel: 8 750 000 000 FCFA.',
    type: 'alert',
    severity: 'critical',
    timestamp: '2026-02-03 16:30',
    read: false,
    actionUrl: '/position',
    actionLabel: 'Voir la position',
    source: 'Monitoring automatique',
  },
  {
    id: 'NOTIF-004',
    title: 'Ecart de rapprochement detecte',
    message: 'Un ecart de 500 000 FCFA a ete detecte sur le rapprochement NSIA Banque pour la periode Janvier 2026.',
    type: 'alert',
    severity: 'warning',
    timestamp: '2026-02-03 14:20',
    read: false,
    actionUrl: '/rapprochement',
    actionLabel: 'Voir le rapprochement',
    source: 'Rapprochement bancaire',
  },
  {
    id: 'NOTIF-005',
    title: 'Prevision mise a jour',
    message: 'La simulation "Budget previsionnel Q1 2026" a ete recalculee avec les nouveaux parametres. Variation du solde net: +2.3%.',
    type: 'forecast',
    severity: 'info',
    timestamp: '2026-02-03 11:00',
    read: true,
    actionUrl: '/forecast',
    actionLabel: 'Voir la simulation',
    source: 'Module Forecast',
  },
  {
    id: 'NOTIF-006',
    title: '5 ecritures validees',
    message: 'Kouame Aya (Direction Commerciale) a valide 5 ecritures d\'encaissement pour un total de 4 230 000 000 FCFA.',
    type: 'validation',
    severity: 'info',
    timestamp: '2026-02-03 09:45',
    read: true,
    source: 'Workflow de validation',
  },
  {
    id: 'NOTIF-007',
    title: 'Nouveau utilisateur cree',
    message: 'Le compte de Diallo Fatoumata (Analyste, Direction SI) a ete cree avec succes. Un email d\'activation a ete envoye.',
    type: 'user',
    severity: 'info',
    timestamp: '2026-02-02 15:30',
    read: true,
    source: 'Gestion des utilisateurs',
  },
  {
    id: 'NOTIF-008',
    title: 'Maintenance systeme prevue',
    message: 'Une maintenance systeme est prevue le 08 Fevrier 2026 de 22h00 a 02h00. Le portail sera temporairement indisponible.',
    type: 'system',
    severity: 'warning',
    timestamp: '2026-02-02 10:00',
    read: true,
    source: 'Administration systeme',
  },
  {
    id: 'NOTIF-009',
    title: 'Ecriture rejetee',
    message: 'Le decaissement OP-CIE-2026-069 (Orange CI - 12 300 000 FCFA) a ete rejete. Motif: montant non conforme au contrat.',
    type: 'validation',
    severity: 'warning',
    timestamp: '2026-02-01 14:15',
    read: true,
    actionUrl: '/validation',
    actionLabel: 'Consulter',
    source: 'Workflow de validation',
  },
  {
    id: 'NOTIF-010',
    title: 'Rapport mensuel genere',
    message: 'Le rapport consolide de Janvier 2026 a ete genere automatiquement et est disponible au telechargement.',
    type: 'system',
    severity: 'info',
    timestamp: '2026-02-01 06:00',
    read: true,
    actionUrl: '/reporting',
    actionLabel: 'Telecharger',
    source: 'Reporting automatique',
  },
  {
    id: 'NOTIF-011',
    title: 'Echeance paiement DGI',
    message: 'Rappel: le paiement de la TVA mensuelle (Janvier 2026) est a effectuer avant le 15 Fevrier 2026. Montant estime: 890 000 000 FCFA.',
    type: 'alert',
    severity: 'warning',
    timestamp: '2026-01-31 08:00',
    read: true,
    source: 'Echeancier automatique',
  },
  {
    id: 'NOTIF-012',
    title: 'Import reussi',
    message: 'Le fichier "encaissements_janvier_2026.csv" a ete importe avec succes. 145 lignes traitees sans erreur.',
    type: 'import',
    severity: 'info',
    timestamp: '2026-01-30 16:40',
    read: true,
    source: 'Centre d\'import',
  },
];

const TYPE_CONFIG: Record<NotificationType, { icon: string; label: string; color: string }> = {
  validation: { icon: 'fact_check', label: 'Validation', color: '#e65000' },
  import: { icon: 'cloud_upload', label: 'Import', color: '#137fec' },
  system: { icon: 'settings', label: 'Systeme', color: '#71717a' },
  alert: { icon: 'notifications_active', label: 'Alerte', color: '#f59e0b' },
  forecast: { icon: 'query_stats', label: 'Prevision', color: '#8b5cf6' },
  user: { icon: 'person', label: 'Utilisateur', color: '#06b6d4' },
};

const SEVERITY_VARIANT: Record<Severity, 'error' | 'warning' | 'info'> = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
};

// ============ Component ============
const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  // Stats
  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length;
    const critical = notifications.filter((n) => n.severity === 'critical' && !n.read).length;
    return { total: notifications.length, unread, critical };
  }, [notifications]);

  // Filtered
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const typeMatch = filterType === 'all' || n.type === filterType;
      const readMatch = filterRead === 'all' || (filterRead === 'unread' ? !n.read : n.read);
      return typeMatch && readMatch;
    });
  }, [notifications, filterType, filterRead]);

  // Mark as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast({ type: 'success', title: 'Notifications lues', message: 'Toutes les notifications ont ete marquees comme lues.' });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    addToast({ type: 'info', title: 'Notification supprimee' });
  };

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filteredNotifications.forEach((n) => {
      const day = n.timestamp.split(' ')[0];
      const label =
        day === '2026-02-04' ? 'Aujourd\'hui' :
        day === '2026-02-03' ? 'Hier' :
        day;
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    return Object.entries(groups);
  }, [filteredNotifications]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Centre de Notifications
          </h1>
          <p className="text-sm text-zinc-500 font-semibold mt-1">
            Alertes, validations et evenements systeme
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.unread > 0 && (
            <Button variant="outline" size="sm" icon="done_all" onClick={markAllAsRead}>
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: 'notifications', color: '#71717a' },
          { label: 'Non lues', value: stats.unread, icon: 'mark_email_unread', color: '#137fec' },
          { label: 'Critiques', value: stats.critical, icon: 'priority_high', color: '#ef4444' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-4"
          >
            <div className="size-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="py-2 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 outline-none"
        >
          <option value="all">Tous les types</option>
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="py-2 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 outline-none"
        >
          <option value="all">Toutes</option>
          <option value="unread">Non lues</option>
          <option value="read">Lues</option>
        </select>
      </div>

      {/* Notification List */}
      <div className="space-y-6">
        {grouped.map(([dateLabel, items]) => (
          <div key={dateLabel}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 ml-1">
              {dateLabel}
            </p>
            <div className="space-y-2">
              {items.map((notif) => {
                const typeConf = TYPE_CONFIG[notif.type];
                return (
                  <div
                    key={notif.id}
                    className={`bg-white dark:bg-zinc-900 rounded-[20px] border p-5 transition-all hover:shadow-md group ${
                      !notif.read
                        ? 'border-primary/30 dark:border-primary/20 bg-primary/[0.02]'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="size-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: typeConf.color + '15' }}
                      >
                        <span className="material-symbols-outlined text-xl" style={{ color: typeConf.color }}>
                          {typeConf.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-sm font-black text-zinc-900 dark:text-white ${!notif.read ? '' : 'opacity-75'}`}>
                              {notif.title}
                            </h3>
                            {!notif.read && (
                              <div className="size-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <Badge variant={SEVERITY_VARIANT[notif.severity]}>
                              {notif.severity === 'critical' ? 'Critique' : notif.severity === 'warning' ? 'Alerte' : 'Info'}
                            </Badge>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap flex-shrink-0">
                            {notif.timestamp.split(' ')[1]}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-2">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400">{notif.source}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {notif.actionUrl && (
                              <button
                                onClick={() => { markAsRead(notif.id); navigate(notif.actionUrl!); }}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black hover:bg-primary/20 transition-colors"
                              >
                                {notif.actionLabel ?? 'Voir'}
                              </button>
                            )}
                            {!notif.read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                                title="Marquer comme lu"
                              >
                                <span className="material-symbols-outlined text-base">check</span>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                              title="Supprimer"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
            <span className="material-symbols-outlined text-5xl mb-4">notifications_off</span>
            <p className="text-sm font-bold">Aucune notification</p>
            <p className="text-xs mt-1">Toutes les notifications ont ete traitees</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
