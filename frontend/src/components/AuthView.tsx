import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  User as UserIcon, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Search,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthViewProps {
  onSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'sso' | 'otp' | 'forgot'>('signin');

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSSO = async (provider: 'google' | 'microsoft' | 'github') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.ssoLogin(provider);
      setLoading(false);
      if (res.user) onSuccess(res.user);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Sign-in failed. Please try again.");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(email, password, rememberMe);
      setLoading(false);
      if (res.user) onSuccess(res.user);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Invalid email or password.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Please accept the terms and privacy policy.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.register(name || 'Enterprise Admin', email, password, orgName || 'Nexus Corp');
      setLoading(false);
      if (res.user) onSuccess(res.user);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Registration failed.");
    }
  };

  const handleSendForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.forgotPassword(email);
      setLoading(false);
      setForgotStep(2);
      if (res.demo_code) setDemoCodeNotice(res.demo_code);
      setSuccessMsg("Reset code sent to your email.");
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Failed to send reset code.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.resetPassword(email, resetCode, newPassword);
      setLoading(false);
      setSuccessMsg("Password reset successfully.");
      if (res && res.user) {
        onSuccess({
          ...res.user,
          email_verified: true
        });
      } else {
        const loginRes = await api.login(email, newPassword, true);
        if (loginRes.user) onSuccess(loginRes.user);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Invalid code or reset failed.");
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.sendOTP(email);
      setLoading(false);
      setOtpSent(true);
      if (res.demo_code) setDemoCodeNotice(res.demo_code);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Failed to send OTP.");
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
      if (res.user) onSuccess(res.user);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Invalid OTP code.");
    }
  };

  const handleGuestDemo = async () => {
    setLoading(true);
    try {
      const res = await api.guestLogin();
      setLoading(false);
      if (res.user) onSuccess(res.user);
    } catch (e) {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 placeholder-slate-400 dark:placeholder-slate-500";
  const smallInputClass = "w-full pl-9 pr-3 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 placeholder-slate-400 dark:placeholder-slate-500";
  const labelClass = "text-xs font-medium text-slate-600 dark:text-slate-300";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* LEFT: Value proposition */}
        <div className="lg:col-span-5 bg-slate-900 dark:bg-gray-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/[0.08]">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <span className="font-semibold text-lg text-white tracking-tight">LexiRAG</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                Your legal documents,<br />analyzed in seconds.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload contracts and agreements, then ask questions in plain English. Get answers with exact page and clause references.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4 mt-8">
            
            <div className="flex items-start gap-3">
              <Search className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-white">Semantic search</div>
                <div className="text-slate-400 text-xs mt-0.5">Find clauses by meaning, not just keywords.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-white">Risk detection</div>
                <div className="text-slate-400 text-xs mt-0.5">Automatically flag liability, non-compete, and renewal risks.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BarChart3 className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-white">Side-by-side comparison</div>
                <div className="text-slate-400 text-xs mt-0.5">Compare versions and spot what changed.</div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="pt-6 mt-6 border-t border-white/[0.08] text-[11px] text-slate-500">
            Secure, encrypted, and private.
          </div>

        </div>

        {/* RIGHT: Auth Forms */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5 bg-white dark:bg-gray-900">
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-4">
            <div className="flex items-center gap-1 text-sm">
              {[
                { key: 'signin', label: 'Sign In' },
                { key: 'signup', label: 'Register' },
                { key: 'sso', label: 'SSO' },
                { key: 'forgot', label: 'Reset Password' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key as any); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`px-3 py-1.5 rounded-md transition-colors font-medium ${
                    tab === t.key ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleGuestDemo}
              className="hidden sm:inline text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              Try as guest
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm text-center border border-red-200 dark:border-red-500/20 animate-fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-sm text-center border border-green-200 dark:border-green-500/20 animate-fade-in">
              {successMsg}
            </div>
          )}

          {/* SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Welcome back</h2>
                <p className="text-sm text-slate-500 mt-0.5">Sign in to your account to continue.</p>
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSSO('google')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-lg bg-white dark:bg-white/[0.04] text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] font-medium text-sm border border-slate-200 dark:border-white/[0.1] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSSO('github')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-white/[0.06] w-full"></div>
                <span className="bg-white dark:bg-gray-900 px-3 text-[11px] text-slate-400 uppercase">or</span>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Password</label>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setErrorMsg(null); }}
                    className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-white dark:bg-gray-800 border-slate-300 dark:border-white/20 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-500 cursor-pointer">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* REGISTER */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create an account</h2>
                <p className="text-sm text-slate-500 mt-0.5">Set up your workspace to get started.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClass}>Full Name</label>
                  <div className="relative">
                    <input type="text" required placeholder="Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} className={smallInputClass} />
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Company</label>
                  <div className="relative">
                    <input type="text" required placeholder="Acme Inc" value={orgName} onChange={(e) => setOrgName(e.target.value)} className={smallInputClass} />
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input type="password" required placeholder="Min 6 chars" value={password} onChange={(e) => setPassword(e.target.value)} className={smallInputClass} />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Confirm</label>
                  <div className="relative">
                    <input type="password" required placeholder="Repeat" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={smallInputClass} />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="agreeTerms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="rounded bg-white dark:bg-gray-800 border-slate-300 dark:border-white/20 text-brand-600 focus:ring-brand-500 h-3.5 w-3.5" />
                <label htmlFor="agreeTerms" className="text-xs text-slate-500 cursor-pointer">
                  I agree to the Terms of Service & Privacy Policy
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SSO */}
          {tab === 'sso' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Single Sign-On</h2>
                <p className="text-sm text-slate-500 mt-0.5">Sign in with your existing work account.</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleSSO('google')}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-white dark:bg-white/[0.04] text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] font-medium text-sm border border-slate-200 dark:border-white/[0.1] transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleSSO('github')}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-3 border border-slate-700"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Continue with GitHub</span>
                </button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Reset password</h2>
                <p className="text-sm text-slate-500 mt-0.5">We'll send a 6-digit code to your email.</p>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotPassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  {demoCodeNotice && (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm font-mono text-center">
                      Demo code: <span className="font-semibold tracking-widest">{demoCodeNotice}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className={labelClass}>6-Digit Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full py-2.5 text-center tracking-widest text-lg font-mono bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={labelClass}>New Password</label>
                      <input type="password" required placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>Confirm</label>
                      <input type="password" required placeholder="••••••••" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full px-3 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors">
                    {loading ? 'Updating...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span>Need a quick look?</span>
            <button
              type="button"
              onClick={handleGuestDemo}
              className="font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              Try guest demo
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
