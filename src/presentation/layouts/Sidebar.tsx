import React, { useState, useEffect } from 'react';
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
  { label: 'Plan de tresorerie', icon: 'account_tree', path: '/plan', resource: 'plan' },
  { label: 'Historique', icon: 'history', path: '/historique', resource: 'historique' },
  { label: 'Validation', icon: 'fact_check', path: '/validation', resource: 'validation' },
  { label: "Centre d'import", icon: 'cloud_upload', path: '/imports', resource: 'imports' },
  { label: 'Simulation', icon: 'query_stats', path: '/forecast', resource: 'forecast' },
  { label: 'Reporting', icon: 'assessment', path: '/reporting', resource: 'reporting' },
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

const SIDEBAR_DARK_KEY = 'cie-treso-sidebar-dark';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { canView, isAdmin } = usePermissions();

  const [visOpen, setVisOpen] = useState(() => {
    return location.pathname.startsWith('/visualisations');
  });

  // Sidebar dark mode state (default: true = dark)
  const [isSidebarDark, setIsSidebarDark] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_DARK_KEY);
    return stored !== null ? stored === 'true' : true; // Default dark
  });

  // Persist sidebar dark mode preference
  useEffect(() => {
    localStorage.setItem(SIDEBAR_DARK_KEY, String(isSidebarDark));
  }, [isSidebarDark]);

  const toggleSidebarDark = () => {
    setIsSidebarDark((prev) => !prev);
  };

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isVisSectionActive = visualisationItems.some((item) => isActive(item.path));

  // Dynamic classes based on sidebar theme
  const sidebarBg = isSidebarDark
    ? 'bg-zinc-900 border-zinc-800'
    : 'bg-white border-zinc-200';

  const logoTextColor = isSidebarDark ? 'text-white' : 'text-zinc-900';
  const subtitleColor = isSidebarDark ? 'text-zinc-400' : 'text-zinc-500';

  const navItemBase = isSidebarDark
    ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900';

  const navItemActive = 'bg-primary/10 text-primary font-bold';

  const groupTitleColor = isSidebarDark ? 'text-zinc-500' : 'text-zinc-400';

  const renderNavItem = (item: NavItem, indented = false) => {
    if (!canView(item.resource)) return null;

    const active = isActive(item.path);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          indented ? 'ml-4' : ''
        } ${active ? navItemActive : navItemBase}`}
      >
        <span
          className={`material-symbols-outlined text-xl ${active ? 'filled' : ''}`}
        >
          {item.icon}
        </span>
        <p className="text-sm">{item.label}</p>
      </NavLink>
    );
  };

  const renderGroup = (group: NavGroup, groupIndex: number) => {
    // Admin-only group: hide for non-admins
    if (group.adminOnly && !isAdmin) return null;

    // If the group has a resource requirement, check permission
    if (group.resource && !canView(group.resource)) return null;

    // Filter items by permission
    const visibleItems = group.items.filter((item) => canView(item.resource));
    if (visibleItems.length === 0) return null;

    // Collapsible group (Visualisations)
    if (group.collapsible) {
      return (
        <div key={groupIndex} className="flex flex-col gap-1">
          <button
            onClick={() => setVisOpen((prev) => !prev)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isVisSectionActive ? navItemActive : navItemBase
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-xl ${isVisSectionActive ? 'filled' : ''}`}
              >
                {group.icon}
              </span>
              <p className="text-sm">{group.title}</p>
            </div>
            <span
              className={`material-symbols-outlined text-lg transition-transform duration-300 ${
                visOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              visOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex flex-col gap-0.5 pt-1">
              {visibleItems.map((item) => renderNavItem(item, true))}
            </div>
          </div>
        </div>
      );
    }

    // Regular group (with optional title)
    return (
      <div key={groupIndex} className="flex flex-col gap-1">
        {group.title && (
          <p className={`text-[10px] font-black uppercase tracking-widest ml-3 mb-2 mt-2 ${groupTitleColor}`}>
            {group.title}
          </p>
        )}
        {visibleItems.map((item) => renderNavItem(item))}
      </div>
    );
  };

  return (
    <aside className={`w-64 flex-shrink-0 border-r flex flex-col transition-colors duration-300 ${sidebarBg}`}>
      {/* Logo - Fixed at top */}
      <div className={`flex-shrink-0 p-6 pb-4 border-b ${isSidebarDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-white size-11 rounded-xl flex items-center justify-center p-1 shadow-lg flex-shrink-0">
            <img src={logoCie} alt="CIE Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className={`text-lg font-black leading-none tracking-tight ${logoTextColor}`}>
              CIE TRESO
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${subtitleColor}`}>
              Gestion de Tresorerie
            </p>
          </div>
        </div>
      </div>

      {/* Navigation groups - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 pt-4">
        <nav className="flex flex-col gap-3">
          {navGroups.map((group, idx) => renderGroup(group, idx))}
        </nav>
      </div>

      {/* Sidebar Theme Toggle - Fixed at bottom */}
      <div className={`p-4 border-t ${isSidebarDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <button
          onClick={toggleSidebarDark}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
            isSidebarDark
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
          }`}
          title={isSidebarDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">
              {isSidebarDark ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="text-sm font-medium">
              {isSidebarDark ? 'Mode clair' : 'Mode sombre'}
            </span>
          </div>
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              isSidebarDark ? 'bg-primary' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`absolute top-1 size-4 bg-white rounded-full shadow transition-transform ${
                isSidebarDark ? 'left-5' : 'left-1'
              }`}
            />
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
