import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import type { ResourceType } from '@/shared/types/roles';
import logoCie from '@/assets/Logo_CIE.jpg';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  resource: ResourceType;
}

interface NavGroup {
  title?: string;
  icon?: string;
  collapsible?: boolean;
  items: NavItem[];
  resource?: ResourceType;
  adminOnly?: boolean;
}

const mainItems: NavItem[] = [
  { label: 'Tableau de bord', icon: 'dashboard', path: '/', resource: 'dashboard' },
  { label: 'Plan de trésorerie', icon: 'account_tree', path: '/plan', resource: 'plan' },
  { label: 'Historique', icon: 'history', path: '/historique', resource: 'historique' },
  { label: 'Validation', icon: 'fact_check', path: '/validation', resource: 'validation' },
  { label: "Centre d'import", icon: 'cloud_upload', path: '/imports', resource: 'imports' },
  { label: 'Reporting', icon: 'assessment', path: '/reporting', resource: 'reporting' },
];

const simulationItems: NavItem[] = [
  { label: 'Simulation plan tréso', icon: 'query_stats', path: '/forecast', resource: 'forecast' },
  { label: 'Template scénario', icon: 'science', path: '/forecast/template-scenario', resource: 'forecast' },
];

const visualisationItems: NavItem[] = [
  { label: 'Energie', icon: 'bolt', path: '/visualisations/energie', resource: 'visualization' },
  { label: 'REM CIE', icon: 'account_balance_wallet', path: '/visualisations/rem-cie', resource: 'visualization' },
  { label: 'Fonctionnement', icon: 'engineering', path: '/visualisations/fonctionnement', resource: 'visualization' },
  { label: 'Service Bancaire', icon: 'account_balance', path: '/visualisations/service-bancaire', resource: 'visualization' },
  { label: 'Impot', icon: 'receipt_long', path: '/visualisations/impot', resource: 'visualization' },
  { label: 'Annexe', icon: 'attach_file', path: '/visualisations/annexe', resource: 'visualization' },
  { label: 'Gaz', icon: 'local_fire_department', path: '/visualisations/gaz', resource: 'visualization' },
];

const adminItems: NavItem[] = [
  { label: 'Utilisateurs', icon: 'group', path: '/users', resource: 'users' },
  { label: 'Profils & Droits', icon: 'admin_panel_settings', path: '/profiles', resource: 'profiles' },
  { label: 'Configuration', icon: 'settings', path: '/settings', resource: 'settings' },
];

const navGroups: NavGroup[] = [
  {
    items: mainItems,
  },
  {
    title: 'Simulation',
    icon: 'query_stats',
    collapsible: true,
    resource: 'forecast',
    items: simulationItems,
  },
  {
    title: 'Visualisations',
    icon: 'monitoring',
    collapsible: true,
    resource: 'visualization',
    items: visualisationItems,
  },
  {
    title: 'Administration',
    adminOnly: true,
    items: adminItems,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { canView, isAdmin } = usePermissions();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    Simulation: location.pathname.startsWith('/forecast'),
    Visualisations: location.pathname.startsWith('/visualisations'),
  }));

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const isGroupActive = (items: NavItem[]) => items.some((item) =>
    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  );

  const renderNavItem = (item: NavItem, indented = false) => {
    if (!canView(item.resource)) return null;

    const active = isActive(item.path);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
          indented ? 'ml-4' : ''
        } ${
          active
            ? 'bg-[#e65000] text-white font-semibold'
            : 'text-white/80 hover:bg-zinc-800 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined text-xl ${active ? 'filled' : ''}`}>
            {item.icon}
          </span>
          <span className="text-sm">{item.label}</span>
        </div>
        {active && (
          <span className="size-2 rounded-full bg-white" />
        )}
      </NavLink>
    );
  };

  const renderGroup = (group: NavGroup, groupIndex: number) => {
    if (group.adminOnly && !isAdmin) return null;
    if (group.resource && !canView(group.resource)) return null;

    const visibleItems = group.items.filter((item) => canView(item.resource));
    if (visibleItems.length === 0) return null;

    if (group.collapsible && group.title) {
      const isOpen = openGroups[group.title] ?? false;
      const sectionActive = isGroupActive(visibleItems);

      return (
        <div key={groupIndex} className="flex flex-col gap-1">
          <button
            onClick={() => toggleGroup(group.title!)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
              !isOpen && sectionActive
                ? 'bg-[#e65000] text-white font-semibold'
                : 'text-white/80 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-xl ${sectionActive ? 'filled' : ''}`}>
                {group.icon}
              </span>
              <span className="text-sm">{group.title}</span>
            </div>
            <span
              className={`material-symbols-outlined text-lg transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex flex-col gap-0.5 pt-1">
              {visibleItems.map((item) => renderNavItem(item, true))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={groupIndex} className="flex flex-col gap-1">
        {group.title && (
          <p className="text-[11px] font-black uppercase tracking-widest text-white mb-2 mt-4 px-3">
            {group.title}
          </p>
        )}
        {visibleItems.map((item) => renderNavItem(item))}
      </div>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-zinc-950 h-screen">
      {/* Logo Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 bg-[#e65000]">
        <div className="flex items-center gap-3">
          <div className="bg-white size-10 rounded-xl flex items-center justify-center p-1 shadow-lg flex-shrink-0">
            <img src={logoCie} alt="CIE Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-black text-white leading-none tracking-tight">
              CIE TRESO
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">
              Gestion de Trésorerie
            </p>
          </div>
        </div>
        <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-[#22a84c] via-[#22a84c]/60 to-transparent" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <nav className="flex flex-col gap-0.5">
          {navGroups.map((group, idx) => renderGroup(group, idx))}
        </nav>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-4">
        <div className="bg-zinc-800 rounded-2xl px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <div className="size-1.5 rounded-full bg-[#22a84c] animate-pulse" />
            <p className="text-zinc-300 text-xs font-semibold">
              &copy; {new Date().getFullYear()} CIE TRESO
            </p>
          </div>
          <p className="text-zinc-500 text-[10px] mt-0.5 text-center">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
