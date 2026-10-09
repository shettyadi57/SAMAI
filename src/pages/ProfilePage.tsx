import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Building,
  Mail,
  Phone,
  Calendar,
  RotateCcw,
  LogOut,
  CheckCircle2,
  Sparkles,
  Save,
  Key,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role, quickDemoSwitch, logout } = useAuth();
  const { resetAllData } = useData();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('Reset all demo records, reports, and interventions back to defaults?')) {
      resetAllData();
      alert('All demo datasets have been successfully reset to initial states.');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 bg-navy-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Account Profile</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage your credentials, role privileges, and simulated environment preferences.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-emerald/15 text-brand-emerald border border-emerald-500/30">
            {role === 'authority' ? 'Official Access' : 'Citizen Access'}
          </span>
        </div>

        {/* Profile Card */}
        <div className="bg-surface-card border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-800 pb-6">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-glow-emerald"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {role === 'authority' ? `${user?.department || 'Urban Traffic Directorate'} • Badge ${user?.badgeId || 'TP-40218'}` : 'Verified Citizen Contributor'}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="text-[11px] text-slate-400">Member since Feb 2026</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-brand-emerald flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile details saved successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-emerald"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Authorized Role</label>
                <div className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 capitalize">
                  {role === 'authority' ? 'Government Official (Full GIS Admin)' : 'Public Citizen'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="py-2.5 px-5 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-glow-emerald"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Demo Switch & System Reset Box */}
        <div className="bg-surface-card border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span>Hackathon Evaluation & Simulation Controls</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                quickDemoSwitch('authority');
                navigate('/authority/dashboard');
              }}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors"
            >
              <div className="text-xs font-bold text-brand-emerald">Switch to Authority Official</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Inspector Verma (TP-40218)</div>
            </button>

            <button
              onClick={() => {
                quickDemoSwitch('citizen');
                navigate('/citizen/dashboard');
              }}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors"
            >
              <div className="text-xs font-bold text-cyan-400">Switch to Public Citizen</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ananya Sharma (Grossbasel resident)</div>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-300">Reset Simulated Datasets</div>
              <div className="text-[11px] text-slate-400">Restores all original hazard reports, corridors, and interventions</div>
            </div>
            <button
              onClick={handleResetData}
              className="py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Sign Out Card */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="py-2.5 px-5 bg-slate-900 hover:bg-red-500/20 text-red-400 border border-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of SURAKSH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
