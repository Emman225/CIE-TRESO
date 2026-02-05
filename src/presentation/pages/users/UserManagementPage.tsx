import React, { useState, useMemo, useEffect } from 'react';
import { DataTable } from '@/presentation/components/ui/DataTable';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { ConfirmDialog } from '@/presentation/components/ui/ConfirmDialog';
import { useToast } from '@/presentation/hooks/useToast';
import { userRepository, profileRepository } from '@/infrastructure/di/container';
import type { UserEntity, UserRole, UserStatus } from '@/domain/entities/User';
import type { ProfileEntity } from '@/domain/entities/Profile';

type UserFormData = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileId: string;
};

const ROLES: UserRole[] = ['Admin', 'Analyst', 'Direction', 'Controller'];

const emptyForm: UserFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'Analyst',
  profileId: '2',
};

const UserManagementPage: React.FC = () => {
  const { addToast } = useToast();

  // State
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [profiles, setProfiles] = useState<ProfileEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntity | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProfile, setFilterProfile] = useState<string>('all');

  // Confirm dialogs
  const [confirmResetUser, setConfirmResetUser] = useState<UserEntity | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserEntity | null>(null);

  // Load data from repositories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResult, profilesList] = await Promise.all([
          userRepository.findAll({ pageSize: 200 }),
          profileRepository.findAll(),
        ]);
        setUsers(usersResult.data);
        setProfiles(profilesList);
      } catch (err) {
        addToast('Erreur lors du chargement des donnees', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameMatch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const roleMatch = filterRole === 'all' || u.role === filterRole;
      const statusMatch = filterStatus === 'all' || u.status === filterStatus;
      const profileMatch = filterProfile === 'all' || u.profileId === filterProfile;
      return nameMatch && roleMatch && statusMatch && profileMatch;
    });
  }, [users, searchQuery, filterRole, filterStatus, filterProfile]);

  // Helpers
  const getProfileName = (profileId: string) => {
    return profiles.find((p) => p.id === profileId)?.name || 'Non assigne';
  };

  const getRoleBadge = (role: UserRole) => {
    const map: Record<UserRole, 'info' | 'warning' | 'success' | 'neutral'> = {
      Admin: 'info',
      Analyst: 'success',
      Direction: 'warning',
      Controller: 'neutral',
    };
    return <Badge variant={map[role]}>{role}</Badge>;
  };

  // Modal handlers
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserEntity) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      profileId: user.profileId,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      addToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    if (editingUser) {
      // Update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                profileId: formData.profileId,
                updatedAt: new Date().toISOString(),
              }
            : u
        )
      );
      addToast(`Utilisateur ${formData.name} mis a jour avec succes`, 'success');
    } else {
      // Create
      const newUser: UserEntity = {
        id: String(Date.now()),
        nom: formData.name.split(' ').slice(-1)[0] || '',
        prenom: formData.name.split(' ').slice(0, -1).join(' ') || '',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        profileId: formData.profileId,
        status: 'Active' as UserStatus,
        lastLogin: 'Jamais',
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      addToast(`Utilisateur ${formData.name} cree avec succes`, 'success');
    }
    setIsModalOpen(false);
  };

  // Toggle active/inactive
  const toggleUserStatus = (user: UserEntity) => {
    const newStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    addToast(
      `${user.name || user.email} ${newStatus === 'Active' ? 'active' : 'desactive'}`,
      newStatus === 'Active' ? 'success' : 'warning'
    );
  };

  // Reset password
  const handleResetPassword = () => {
    if (!confirmResetUser) return;
    addToast(`Mot de passe reinitialise pour ${confirmResetUser.name || confirmResetUser.email}`, 'success');
    setConfirmResetUser(null);
  };

  // Delete user
  const handleDeleteUser = () => {
    if (!confirmDeleteUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteUser.id));
    addToast(`Utilisateur ${confirmDeleteUser.name || confirmDeleteUser.email} supprime`, 'success');
    setConfirmDeleteUser(null);
  };

  // Table columns
  const columns = [
    {
      key: 'avatar',
      label: 'Utilisateur',
      render: (user: UserEntity) => (
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || ''}
                className="size-10 rounded-xl object-cover border-2 border-zinc-100 dark:border-zinc-700"
              />
            ) : (
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                {(user.name || user.email)[0]?.toUpperCase()}
              </div>
            )}
            <div
              className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                user.status === 'Active' ? 'bg-green-500' : 'bg-zinc-300'
              }`}
            />
          </div>
          <div>
            <p className="font-black text-zinc-900 dark:text-white text-sm">
              {user.name || `${user.prenom} ${user.nom}`}
            </p>
            <p className="text-xs text-zinc-400 font-medium">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user: UserEntity) => getRoleBadge(user.role),
    },
    {
      key: 'profileId',
      label: 'Profil',
      sortable: true,
      render: (user: UserEntity) => (
        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
          {getProfileName(user.profileId)}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Telephone',
      render: (user: UserEntity) => (
        <span className="text-sm font-medium text-zinc-500">{user.phone || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (user: UserEntity) => (
        <Badge variant={user.status === 'Active' ? 'success' : 'neutral'}>
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Derniere Connexion',
      sortable: true,
      render: (user: UserEntity) => (
        <span className="text-xs text-zinc-400 font-bold">{user.lastLogin}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right' as const,
      render: (user: UserEntity) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(user); }}
            className="p-2 rounded-lg text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all"
            title="Modifier"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleUserStatus(user); }}
            className={`p-2 rounded-lg transition-all ${
              user.status === 'Active'
                ? 'text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                : 'text-zinc-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
            title={user.status === 'Active' ? 'Desactiver' : 'Activer'}
          >
            <span className="material-symbols-outlined text-lg">
              {user.status === 'Active' ? 'person_off' : 'person'}
            </span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmResetUser(user); }}
            className="p-2 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            title="Reinitialiser le mot de passe"
          >
            <span className="material-symbols-outlined text-lg">lock_reset</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDeleteUser(user); }}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Supprimer"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-zinc-500 font-semibold mt-1">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistre{users.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="md" icon="person_add" onClick={openCreateModal}>
          NOUVEL UTILISATEUR
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Filter by Role */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tous les roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="Active">Actif</option>
            <option value="Inactive">Inactif</option>
          </select>

          {/* Filter by Profile */}
          <select
            value={filterProfile}
            onChange={(e) => setFilterProfile(e.target.value)}
            className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tous les profils</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        emptyMessage="Aucun utilisateur trouve"
        emptyIcon="person_search"
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        description={editingUser ? 'Mettez a jour les informations du compte' : 'Remplissez les informations pour creer un nouveau compte'}
        size="lg"
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button variant="outline" size="md" onClick={() => setIsModalOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button variant="primary" size="md" icon="check_circle" onClick={handleSave} className="flex-1">
              {editingUser ? 'Mettre a jour' : 'Creer le compte'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
                person
              </span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jean Kouassi"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
                email
              </span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="j.kouassi@cie.ci"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
              Telephone
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
                phone
              </span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+225 07 00 00 00"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Role & Profile */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full py-3 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
                Profil
              </label>
              <select
                value={formData.profileId}
                onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                className="w-full py-3 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Reset Password Confirm */}
      <ConfirmDialog
        isOpen={confirmResetUser !== null}
        onClose={() => setConfirmResetUser(null)}
        onConfirm={handleResetPassword}
        title="Reinitialiser le mot de passe"
        message={`Le mot de passe de ${confirmResetUser?.name || confirmResetUser?.email || ''} sera reinitialise. Un email de reinitialisation sera envoye a l'adresse ${confirmResetUser?.email || ''}.`}
        confirmLabel="Reinitialiser"
        variant="primary"
      />

      {/* Delete User Confirm */}
      <ConfirmDialog
        isOpen={confirmDeleteUser !== null}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={handleDeleteUser}
        title="Supprimer l'utilisateur"
        message={`Etes-vous sur de vouloir supprimer le compte de ${confirmDeleteUser?.name || confirmDeleteUser?.email || ''} ? Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
};

export default UserManagementPage;
