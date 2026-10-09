import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Map,
  Flame,
  FileCheck2,
  BarChart3,
  User,
  PlusCircle,
  Home,
  ShieldAlert,
  Layers,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const { reports, unreadNotificationCount } = useData();

  const pendingReportsCount = reports.filter(
    (r) => r.status === 'submitted' || r.status === 'under_review'
  ).length;

  const authorityLinks: NavItem[] = [
    {
      to: '/authority/dashboard',
      label: 'GIS Road Safety Map',
      icon: Map,
      badge: 'Live',
    },
    {
      to: '/authority/hotspots',
      label: 'Priority Queue (Hotspots)',
      icon: Flame,
      badge: 'Explainable AI',
    },
    {
      to: '/authority/reports',
      label: 'Hazard Reports Triage',
      icon: FileCheck2,
      count: pendingReportsCount,
    },
    {
      to: '/authority/analytics',
      label: 'Safety Analytics & Audit',
      icon: BarChart3,
    },
    {
      to: '/profile',
      label: 'Officer Profile',
      icon: User,
    },
  ];

  const citizenLinks: NavItem[] = [
    {
      to: '/citizen/dashboard',
      label: 'My Safety Portal',
      icon: Home,
    },
    {
      to: '/citizen/report',
      label: 'Report Road Hazard',
      icon: PlusCircle,
      highlight: true,
    },
    {
      to: '/profile',
      label: 'Citizen Profile',
      icon: User,
    },
  ];

  const links = role === 'authority' ? authorityLinks : citizenLinks;

  return (
    <aside className="w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Console mode banner */}
      <div className="p-4 border-b border-slate-800/60 bg-navy-900/40">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Radio className="w-3.5 h-3.5 text-brand-emerald animate-pulse" />
          <span>{role === 'authority' ? 'Authority Console' : 'Citizen Public Portal'}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {role === 'authority'
            ? 'Grossbasel / Urban Directorate'
            : 'Community Safety Reporting Network'}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700/80 shadow-sm'
                    : item.highlight
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-brand-emerald' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/15 text-brand-emerald border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer system status */}
      <div className="p-4 border-t border-slate-800/60 bg-navy-950/60 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span>GIS Engine</span>
          <span className="text-brand-emerald font-mono">v2.4 Online</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Priority Model</span>
          <span className="text-brand-cyan font-mono">STATS-19 Weighted</span>
        </div>
      </div>
    </aside>
  );
};
