import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Shield,
  User as UserIcon,
  Building,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAsAuthority, loginAsCitizen } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<UserRole>('authority');
  const [identifier, setIdentifier] = useState('TP-40218');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setErrorMsg('');
    if (role === 'authority') {
      setIdentifier('TP-40218');
    } else {
      setIdentifier('ananya.sharma@community.org');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your Badge ID or Email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      try {
        if (activeRole === 'authority') {
          await loginAsAuthority(identifier, password);
          navigate('/authority/dashboard');
        } else {
          await loginAsCitizen(identifier, password);
          navigate('/citizen/dashboard');
        }
      } catch (err) {
        setErrorMsg('Authentication error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoLogin = (roleToLogin: UserRole) => {
    if (roleToLogin === 'authority') {
      loginAsAuthority('TP-40218');
      navigate('/authority/dashboard');
    } else {
      loginAsCitizen('ananya.sharma@community.org');
      navigate('/citizen/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-navy-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-purple/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Demo Mode Notice Banner */}
      <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-lg text-xs text-slate-300">
        <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
        <span className="font-semibold text-brand-emerald">DEMO MODE</span>
        <span className="text-slate-600">|</span>
        <span>Pre-authenticated credentials active for evaluation</span>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-surface-card/90 border border-slate-700/60 rounded-3xl shadow-glow-authority p-6 sm:p-8 backdrop-blur-2xl relative z-10 transition-all">
        {/* Header matching Reference Image 3 */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-glow-emerald flex items-center justify-center mb-3.5">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-brand-emerald" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-wider text-white uppercase">
            {activeRole === 'authority' ? 'Authority Gateway' : 'Citizen Portal'}
          </h1>

          <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-semibold text-brand-emerald tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
            <span>SECURE SESSION</span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {activeRole === 'authority'
              ? 'Sign in to access real-time blackspot analytics & GIS intelligence'
              : 'Sign in to report road hazards and track community safety actions'}
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-navy-950/80 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('authority')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'authority'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Official</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('citizen')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'citizen'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Citizen</span>
          </button>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Identifier Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {activeRole === 'authority' ? 'Badge ID / Official Email' : 'Email or Mobile Number'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeRole === 'authority' ? 'e.g. TP-40218 or name@gov.in' : 'e.g. ananya@citizen.org'}
                className="w-full bg-navy-950/90 border border-slate-700/80 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 outline-none transition-all pr-10"
              />
              <CheckCircle2 className="w-4 h-4 text-brand-emerald absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Demo simulated: Password reset token sent to registered email.')}
                className="text-[11px] text-brand-cyan hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-950/90 border border-slate-700/80 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 outline-none transition-all pr-10 pl-10"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember session & Help */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="rounded border-slate-700 bg-navy-950 text-brand-emerald focus:ring-0 w-3.5 h-3.5"
              />
              <span>Remember Session</span>
            </label>
            <a
              href="#help"
              onClick={(e) => {
                e.preventDefault();
                alert('Support Desk: Contact city traffic ops at safety-support@suraksh.gov.in');
              }}
              className="text-slate-400 hover:text-brand-cyan transition-colors"
            >
              Need Access / Help
            </a>
          </div>

          {/* Primary Submit Button matching Reference Image 3 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-brand-emerald hover:bg-brand-emerald-hover text-slate-950 font-black rounded-xl text-sm transition-all shadow-glow-emerald flex items-center justify-center gap-2 group mt-2"
          >
            <span>{activeRole === 'authority' ? 'Enter Suraksh Console' : 'Continue to Citizen Portal'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Or Continue with Google */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400">
            <span className="bg-surface-card px-3">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleQuickDemoLogin(activeRole)}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Quick Testing Shortcuts for Judges */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col gap-2">
          <p className="text-[10px] text-center uppercase tracking-wider text-slate-400 font-bold">
            1-Click Demo Evaluation Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('authority')}
              className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[11px] text-brand-emerald font-semibold transition-colors"
            >
              Demo Official (Verma)
            </button>
            <button
              onClick={() => handleQuickDemoLogin('citizen')}
              className="py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-[11px] text-cyan-400 font-semibold transition-colors"
            >
              Demo Citizen (Sharma)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
