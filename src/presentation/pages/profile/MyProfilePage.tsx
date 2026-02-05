import React, { useState } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useToast } from '@/presentation/hooks/useToast';
import { Button } from '@/presentation/components/ui/Button';

const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const displayName = user?.name || (user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : 'Utilisateur');
  const displayEmail = user?.email || '';
  const displayRole = user?.role || 'Utilisateur';
  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e65000&color=fff&size=200`;

  const handleSaveProfile = () => {
    // Simulate save
    addToast({ type: 'success', title: 'Profil mis a jour', message: 'Vos informations ont ete enregistrees.' });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast({ type: 'error', title: 'Erreur', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      addToast({ type: 'error', title: 'Erreur', message: 'Le mot de passe doit contenir au moins 8 caracteres.' });
      return;
    }
    // Simulate password change
    addToast({ type: 'success', title: 'Mot de passe modifie', message: 'Votre mot de passe a ete change avec succes.' });
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Direction':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Controller':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Mon Profil
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Gerez vos informations personnelles et vos preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Cover & Avatar */}
        <div className="h-32 bg-gradient-to-r from-primary to-primary-dark relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-24 rounded-2xl border-4 border-white dark:border-zinc-900 object-cover shadow-xl"
              />
              <button className="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pb-6 px-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                {displayName}
              </h2>
              <p className="text-sm text-zinc-500 mt-1">{displayEmail}</p>
              <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-lg text-xs font-black uppercase ${getRoleBadgeColor(displayRole)}`}>
                {displayRole}
              </span>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                icon="edit"
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              Informations personnelles
            </h3>
            <p className="text-xs text-zinc-500">Vos coordonnees et informations de contact</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Nom complet
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            ) : (
              <p className="text-sm font-bold text-zinc-900 dark:text-white py-3">
                {displayName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Adresse email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            ) : (
              <p className="text-sm font-bold text-zinc-900 dark:text-white py-3">
                {displayEmail}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Telephone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+225 07 00 00 00"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-zinc-400"
              />
            ) : (
              <p className="text-sm font-bold text-zinc-900 dark:text-white py-3">
                {user?.phone || '-'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Role
            </label>
            <p className="text-sm font-bold text-zinc-900 dark:text-white py-3">
              {displayRole}
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon="save"
              onClick={handleSaveProfile}
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600">security</span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              Securite
            </h3>
            <p className="text-xs text-zinc-500">Gerez votre mot de passe et la securite du compte</p>
          </div>
        </div>

        {!showPasswordForm ? (
          <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-zinc-400">lock</span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Mot de passe</p>
                <p className="text-xs text-zinc-500">Derniere modification il y a 30 jours</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordForm(true)}
            >
              Changer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon="lock"
                onClick={handleChangePassword}
              >
                Changer le mot de passe
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Activity */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">history</span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">
              Activite recente
            </h3>
            <p className="text-xs text-zinc-500">Historique de vos dernieres connexions</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { date: "Aujourd'hui, 14:32", device: 'Windows - Chrome', location: 'Abidjan, CI', current: true },
            { date: 'Hier, 09:15', device: 'Windows - Chrome', location: 'Abidjan, CI', current: false },
            { date: '12 Jan 2025, 16:45', device: 'iPhone - Safari', location: 'Abidjan, CI', current: false },
          ].map((session, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-4 rounded-xl ${
                session.current ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-zinc-50 dark:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${session.current ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  {session.device.includes('iPhone') ? 'smartphone' : 'computer'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-md uppercase">
                        Session actuelle
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">{session.location}</p>
                </div>
              </div>
              <p className="text-xs font-medium text-zinc-500">{session.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
