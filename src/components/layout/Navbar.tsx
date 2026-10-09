import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Shield,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  RefreshCw,
  Sparkles,
  MapPin,
  Building,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { NotificationModal } from '../notifications/NotificationModal';

export const Navbar: React.FC = () => {
  const { user, role, quickDemoSwitch, logout } = useAuth();
  const { unreadNotificationCount, corridors, reports, setSelectedCorridor } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter corridors & reports by search
  const filteredCorridors = searchQuery.trim()
    ? corridors.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.district.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredReports = searchQuery.trim()
    ? reports.filter(
        (r) =>
          r.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.resolvedAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectSearchResult = (type: 'corridor' | 'report', item: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    if (type === 'corridor') {
      setSelectedCorridor(item);
      navigate('/authority/dashboard');
    } else {
      if (role === 'authority') {
        navigate('/authority/reports');
      } else {
        navigate('/citizen/dashboard');
      }
    }
  };

  const todayDateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/90 border-b border-slate-800/80 backdrop-blur-xl transition-all">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link to={role === 'authority' ? '/authority/dashboard' : '/citizen/dashboard'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-glow-emerald flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-emerald group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">SURAKSH</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/15 text-brand-emerald border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                  GIS LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                AI Road Safety & Smart City Platform
              </p>
            </div>
          </Link>

          {/* Quick Demo Mode Badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-slate-300">DEMO MODE</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Simulated Smart City Telemetry</span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search locations, corridors, districts, or hazard report IDs..."
              className="w-full bg-slate-900/90 border border-slate-700/70 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald text-xs text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search dropdown results */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div
              className="absolute left-0 right-0 top-12 bg-navy-900 border border-slate-700 rounded-2xl shadow-glow-card overflow-hidden z-50 max-h-80 overflow-y-auto"
              onMouseLeave={() => setShowSearchResults(false)}
            >
              <div className="p-2 text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-navy-950/60">
                Corridors & Blackspots
              </div>
              {filteredCorridors.length > 0 ? (
                filteredCorridors.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectSearchResult('corridor', c)}
                    className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between border-b border-slate-800"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.district} • {c.roadType}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-400">Score {c.riskScore}</span>
                  </div>
                ))
              ) : (
                <div className="p-2 text-xs text-slate-400">No corridors matching "{searchQuery}"</div>
              )}

              <div className="p-2 text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-navy-950/60 border-t border-slate-800">
                Citizen Hazard Reports
              </div>
              {filteredReports.length > 0 ? (
                filteredReports.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelectSearchResult('report', r)}
                    className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between border-b border-slate-800"
                  >
                    <div>
                      <div className="text-xs font-semibold text-brand-cyan">{r.id} — {r.categoryLabel}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm">{r.resolvedAddress}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">{r.status}</span>
                  </div>
                ))
              ) : (
                <div className="p-2 text-xs text-slate-400">No reports found</div>
              )}
            </div>
          )}
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-3">
          {/* Date pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <span>{todayDateStr}</span>
          </div>

          {/* Quick Role Switcher Button for hackathon judges */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                quickDemoSwitch('authority');
                navigate('/authority/dashboard');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                role === 'authority'
                  ? 'bg-brand-emerald text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Authority</span>
            </button>
            <button
              onClick={() => {
                quickDemoSwitch('citizen');
                navigate('/citizen/dashboard');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                role === 'citizen'
                  ? 'bg-brand-emerald text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Citizen</span>
            </button>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
            <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40"
              />
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                  {user?.name || 'Authorized Officer'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {role === 'authority' ? (user?.badgeId || 'TP-40218') : 'Citizen Contributor'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {showUserDropdown && (
              <div
                className="absolute right-0 top-12 w-56 bg-navy-900 border border-slate-700/80 rounded-2xl shadow-glow-card py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-brand-emerald">
                    {role === 'authority' ? 'Government Official' : 'Public Citizen'}
                  </span>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  Account Profile
                </Link>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
