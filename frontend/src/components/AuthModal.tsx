import React, { useState } from 'react';
import { X, Scale, UserCheck, KeyRound, Mail, User as UserIcon, Sparkles, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState<'sso' | 'otp' | 'login'>('sso');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSSO = async (provider: 'google' | 'microsoft' | 'github') => {
    setLoading(true);
    setErrorMsg(null);
    const res = await api.ssoLogin(provider);
    setLoading(false);
    onSuccess(res.user);
    onClose();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    const res = await api.sendOTP(email);
    setLoading(false);
    setOtpSent(true);
    if (res.demo_code) {
      setDemoCodeNotice(res.demo_code);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.verifyOTP(email, otpCode);
      setLoading(false);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Invalid OTP code. Please check your 6-digit pin.");
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const res = await api.login(email || 'alex.rivera@nexuscorp.com', password);
    setLoading(false);
    onSuccess(res.user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-card bg-white dark:bg-navy-950 rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Enterprise Single Sign-On (SSO)
          </h2>
          <p className="text-xs text-slate-500">
            Secure multi-tenant authentication with SOC2 & OAuth 2.0
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-900 rounded-xl text-xs font-bold">
          <button
            onClick={() => setAuthMode('sso')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'sso' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            OAuth SSO
          </button>

          <button
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'otp' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            Email OTP
          </button>

          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'login' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            Password
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 text-xs font-bold text-center border border-rose-500/20">
            {errorMsg}
          </div>
        )}

        {/* 1. ENTERPRISE SSO PROVIDERS TAB */}
        {authMode === 'sso' && (
          <div className="space-y-3 pt-1">
            
            {/* Google OAuth */}
            <button
              onClick={() => handleSSO('google')}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google Workspace</span>
            </button>

            {/* Microsoft Azure AD / Entra ID */}
            <button
              onClick={() => handleSSO('microsoft')}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>Sign in with Microsoft Entra ID</span>
            </button>

            {/* GitHub Developer OAuth */}
            <button
              onClick={() => handleSSO('github')}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Sign in with GitHub Enterprise</span>
            </button>

            <div className="text-[11px] text-slate-400 text-center pt-2">
              🔒 Automatic tenant discovery via Corporate Email Domain
            </div>
          </div>
        )}

        {/* 2. EMAIL OTP (6-DIGIT PIN) TAB */}
        {authMode === 'otp' && (
          <div className="space-y-4 pt-1">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Corporate Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="alex.rivera@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Send 6-Digit OTP Security Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-xs text-center text-slate-600 dark:text-slate-300">
                  Enter the 6-digit OTP code sent to <span className="font-bold">{email}</span>:
                </div>

                {demoCodeNotice && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-mono text-center">
                    🔑 Security Code: <span className="font-bold tracking-widest text-sm">{demoCodeNotice}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full py-3 text-center tracking-widest text-lg font-mono font-bold bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-md transition-all"
                >
                  {loading ? 'Verifying OTP...' : 'Verify Security Code & Sign In'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Resend Code or Change Email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. STANDARD PASSWORD LOGIN TAB */}
        {authMode === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Work Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@nexuscorp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-md transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign In with Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
