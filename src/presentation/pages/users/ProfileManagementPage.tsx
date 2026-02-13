import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { Modal } from '@/presentation/components/ui/Modal';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { useToast } from '@/presentation/hooks/useToast';
import { profileRepository } from '@/infrastructure/di/container';
import type { ProfileEntity, Permission } from '@/domain/entities/Profile';
import type { ResourceType, ActionType } from '@/shared/types/roles';

const ALL_RESOURCES: { key: ResourceType; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { key: 'plan', label: 'Plan Trésorerie', icon: 'account_balance' },
  { key: 'saisie', label: 'Saisie', icon: 'edit_note' },
  { key: 'imports', label: 'Imports', icon: 'upload_file' },
  { key: 'forecast', label: 'Previsions', icon: 'query_stats' },
  { key: 'visualization', label: 'Visualisations', icon: 'bar_chart' },
  { key: 'reporting', label: 'Reporting', icon: 'assessment' },
  { key: 'users', label: 'Utilisateurs', icon: 'group' },
  { key: 'profiles', label: 'Profils', icon: 'admin_panel_settings' },
  { key: 'settings', label: 'Parametrage', icon: 'settings' },
];

const ALL_ACTIONS: { key: ActionType; label: string; icon: string }[] = [
  { key: 'view', label: 'Voir', icon: 'visibility' },
  { key: 'create', label: 'Creer', icon: 'add_circle' },
  { key: 'edit', label: 'Modifier', icon: 'edit' },
  { key: 'delete', label: 'Supprimer', icon: 'delete' },
  { key: 'export', label: 'Exporter', icon: 'download' },
];

const ProfileManagementPage: React.FC = () => {
  const { addToast } = useToast();

  const [profiles, setProfiles] = useState<ProfileEntity[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load profiles from repository
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await profileRepository.findAll();
        setProfiles(data);
      } catch (err) {
        addToast('Erreur lors du chargement des profils', 'error');
      }
    };
    loadProfiles();
  }, []);

  // Modal state for create/edit name & description
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Active profile
  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  );

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const q = searchQuery.toLowerCase();
    return profiles.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  // Permission helpers
  const hasPermission = (profile: ProfileEntity, resource: ResourceType, action: ActionType): boolean => {
    const perm = profile.permissions.find((p) => p.resource === resource);
    return perm?.actions.includes(action) ?? false;
  };

  const togglePermission = (resource: ResourceType, action: ActionType) => {
    if (!selectedProfile) return;

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProfile.id) return p;

        const existingPerm = p.permissions.find((perm) => perm.resource === resource);

        let newPermissions: Permission[];

        if (existingPerm) {
          const hasAction = existingPerm.actions.includes(action);
          const newActions = hasAction
            ? existingPerm.actions.filter((a) => a !== action)
            : [...existingPerm.actions, action];

          if (newActions.length === 0) {
            newPermissions = p.permissions.filter((perm) => perm.resource !== resource);
          } else {
            newPermissions = p.permissions.map((perm) =>
              perm.resource === resource ? { ...perm, actions: newActions } : perm
            );
          }
        } else {
          newPermissions = [...p.permissions, { resource, actions: [action] }];
        }

        return { ...p, permissions: newPermissions, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Toggle all actions for a resource
  const toggleAllForResource = (resource: ResourceType) => {
    if (!selectedProfile) return;

    const allActionsKeys = ALL_ACTIONS.map((a) => a.key);
    const currentPerm = selectedProfile.permissions.find((p) => p.resource === resource);
    const allGranted = currentPerm?.actions.length === allActionsKeys.length;

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== selectedProfile.id) return p;

        let newPermissions: Permission[];

        if (allGranted) {
          newPermissions = p.permissions.filter((perm) => perm.resource !== resource);
        } else {
          const existing = p.permissions.find((perm) => perm.resource === resource);
          if (existing) {
            newPermissions = p.permissions.map((perm) =>
              perm.resource === resource ? { ...perm, actions: [...allActionsKeys] } : perm
            );
          } else {
            newPermissions = [...p.permissions, { resource, actions: [...allActionsKeys] }];
          }
        }

        return { ...p, permissions: newPermissions, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Count permissions for a profile
  const countPermissions = (profile: ProfileEntity): number => {
    return profile.permissions.reduce((acc, p) => acc + p.actions.length, 0);
  };

  // Export
  const handleExport = () => {
    const rows = profiles.map((p) => ({
      Nom: p.name,
      Description: p.description,
      'Nombre de droits': countPermissions(p),
      'Par defaut': p.isDefault ? 'Oui' : 'Non',
      'Date creation': p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Profils');
    XLSX.writeFile(wb, 'Profils_Droits_Export.xlsx');
    addToast('Export reussi - Liste des profils telechargee', 'success');
  };

  // Create / Edit profile
  const openCreateModal = () => {
    setEditMode('create');
    setFormName('');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    if (!selectedProfile) return;
    setEditMode('edit');
    setFormName(selectedProfile.name);
    setFormDescription(selectedProfile.description);
    setIsModalOpen(true);
  };

  const handleSaveProfile = () => {
    if (!formName.trim()) {
      addToast('Le nom du profil est obligatoire', 'error');
      return;
    }

    if (editMode === 'create') {
      const newProfile: ProfileEntity = {
        id: String(Date.now()),
        name: formName.trim(),
        description: formDescription.trim(),
        permissions: [],
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfiles((prev) => [...prev, newProfile]);
      setSelectedProfileId(newProfile.id);
      addToast(`Profil "${formName}" cree avec succes`, 'success');
    } else if (selectedProfile) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedProfile.id
            ? { ...p, name: formName.trim(), description: formDescription.trim(), updatedAt: new Date().toISOString() }
            : p
        )
      );
      addToast(`Profil "${formName}" mis a jour`, 'success');
    }
    setIsModalOpen(false);
  };

  // Delete
  const handleDelete = () => {
    if (!confirmDeleteId) return;
    const profile = profiles.find((p) => p.id === confirmDeleteId);
    setProfiles((prev) => prev.filter((p) => p.id !== confirmDeleteId));
    if (selectedProfileId === confirmDeleteId) {
      setSelectedProfileId(null);
    }
    addToast(`Profil "${profile?.name}" supprime`, 'success');
    setConfirmDeleteId(null);
  };

  // Save permissions
  const handleSavePermissions = () => {
    if (!selectedProfile) return;
    addToast(`Permissions du profil "${selectedProfile.name}" enregistrees`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Profils & Droits
          </h1>
          <p className="text-sm text-zinc-500 font-semibold mt-1">
            Gestion des profils et permissions d'acces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon="download" onClick={handleExport}>
            Exporter
          </Button>
          <Button variant="primary" size="md" icon="add_circle" onClick={openCreateModal}>
            NOUVEAU PROFIL
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Profile List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Profile Cards */}
          <div className="space-y-3">
            {filteredProfiles.map((profile) => {
              const isSelected = selectedProfileId === profile.id;
              const permCount = countPermissions(profile);
              return (
                <div
                  key={profile.id}
                  onClick={() => setSelectedProfileId(profile.id)}
                  className={`
                    p-5 rounded-[24px] border cursor-pointer transition-all group
                    ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-primary/30 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-lg ${isSelected ? 'text-primary' : 'text-zinc-400'}`}>
                          shield_person
                        </span>
                        <h3 className={`font-black text-sm truncate ${isSelected ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>
                          {profile.name}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium mt-1 line-clamp-2">
                        {profile.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={permCount > 30 ? 'success' : permCount > 15 ? 'info' : 'neutral'}>
                          {permCount} droits
                        </Badge>
                        {profile.isDefault && (
                          <Badge variant="warning">Defaut</Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(profile.id);
                      }}
                      className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProfiles.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-zinc-300 dark:text-zinc-600 block mb-3">
                  admin_panel_settings
                </span>
                <p className="text-sm font-bold text-zinc-400">
                  Aucun profil trouve
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Permission Matrix */}
        <div className="lg:col-span-3">
          {selectedProfile ? (
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/30">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                      {selectedProfile.name}
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      {selectedProfile.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" icon="edit" onClick={openEditModal}>
                    Modifier
                  </Button>
                  <Button variant="primary" size="sm" icon="save" onClick={handleSavePermissions}>
                    Enregistrer
                  </Button>
                </div>
              </div>

              {/* Permission Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest w-64">
                        Ressource
                      </th>
                      {ALL_ACTIONS.map((action) => (
                        <th key={action.key} className="px-4 py-4 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          <div className="flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-sm">{action.icon}</span>
                            {action.label}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-4 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Tout
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {ALL_RESOURCES.map((resource) => {
                      const allActionsKeys = ALL_ACTIONS.map((a) => a.key);
                      const currentPerm = selectedProfile.permissions.find((p) => p.resource === resource.key);
                      const allGranted = currentPerm?.actions.length === allActionsKeys.length;
                      const someGranted = (currentPerm?.actions.length || 0) > 0;

                      return (
                        <tr key={resource.key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`size-8 rounded-lg flex items-center justify-center ${someGranted ? 'bg-primary/10 text-primary' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                <span className="material-symbols-outlined text-sm">{resource.icon}</span>
                              </div>
                              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                {resource.label}
                              </span>
                            </div>
                          </td>
                          {ALL_ACTIONS.map((action) => {
                            const checked = hasPermission(selectedProfile, resource.key, action.key);
                            return (
                              <td key={action.key} className="px-4 py-4 text-center">
                                <button
                                  onClick={() => togglePermission(resource.key, action.key)}
                                  className={`
                                    size-8 rounded-lg border-2 flex items-center justify-center transition-all
                                    ${
                                      checked
                                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105'
                                        : 'border-zinc-200 dark:border-zinc-700 text-transparent hover:border-primary/40 hover:bg-primary/5'
                                    }
                                  `}
                                >
                                  <span className="material-symbols-outlined text-sm">check</span>
                                </button>
                              </td>
                            );
                          })}
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleAllForResource(resource.key)}
                              className={`
                                size-8 rounded-lg border-2 flex items-center justify-center transition-all
                                ${
                                  allGranted
                                    ? 'bg-[#22a84c] border-[#22a84c] text-white shadow-md shadow-[#22a84c]/20'
                                    : someGranted
                                    ? 'bg-amber-100 border-amber-400 text-amber-600 dark:bg-amber-900/30 dark:border-amber-600'
                                    : 'border-zinc-200 dark:border-zinc-700 text-transparent hover:border-primary/40'
                                }
                              `}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {allGranted ? 'check' : someGranted ? 'remove' : 'check_box_outline_blank'}
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 flex items-center justify-between">
                <p className="text-xs font-bold text-zinc-400">
                  {countPermissions(selectedProfile)} permission{countPermissions(selectedProfile) > 1 ? 's' : ''} attribuee{countPermissions(selectedProfile) > 1 ? 's' : ''}
                  {' '}sur {ALL_RESOURCES.length * ALL_ACTIONS.length} possibles
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded bg-primary" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Accorde</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded border-2 border-zinc-200 dark:border-zinc-700" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Non accorde</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center py-24 gap-6">
              <div className="size-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-zinc-300 dark:text-zinc-600">
                  admin_panel_settings
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-black text-zinc-400 dark:text-zinc-500">
                  Selectionnez un profil
                </h3>
                <p className="text-sm text-zinc-400 font-medium mt-1">
                  Choisissez un profil dans la liste pour configurer ses permissions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Profile Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode === 'create' ? 'Nouveau profil' : 'Modifier le profil'}
        description={editMode === 'create' ? 'Definissez le nom et la description du profil' : 'Modifiez les informations du profil'}
        size="md"
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button variant="outline" size="md" onClick={() => setIsModalOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button variant="primary" size="md" icon="check_circle" onClick={handleSaveProfile} className="flex-1">
              {editMode === 'create' ? 'Creer' : 'Enregistrer'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
              Nom du profil <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Analyste Senior"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Description du profil et de ses responsabilites..."
              rows={3}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le profil"
        message={`Etes-vous sur de vouloir supprimer le profil "${profiles.find((p) => p.id === confirmDeleteId)?.name}" ? Les utilisateurs associes devront etre reassignes.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
};

export default ProfileManagementPage;
