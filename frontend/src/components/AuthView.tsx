import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Mail, 
  KeyRound, 
  User as UserIcon, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  ShieldAlert, 
  Globe, 
  Zap,
  HelpCircle,
  AlertCircle
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
      setErrorMsg("OAuth sign-in failed. Please try again.");
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
      setErrorMsg("Please enter your work email.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.forgotPassword(email);
      setLoading(false);
      setForgotStep(2);
      if (res.demo_code) setDemoCodeNotice(res.demo_code);
      setSuccessMsg("Verification reset code sent to your email!");
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Failed to send reset code.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setErrorMsg("New passwords do not match.");
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
      setSuccessMsg("Password reset & email address verified successfully!");
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
      setErrorMsg(err.message || "Invalid email verification pin code or password reset failed.");
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
      setErrorMsg("Failed to send OTP code.");
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
      setErrorMsg("Invalid OTP code. Please check your 6-digit pin.");
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

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in font-sans selection:bg-brand-500 selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Glow FX */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Container Layout */}
      <div className="w-full max-w-6xl glass-panel bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* LEFT COLUMN: Hero Enterprise Branding (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-950 via-indigo-950 to-navy-950 p-8 sm:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10 space-y-8">
          
          {/* Logo & Badge */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-2xl tracking-tight text-white">LexiRAG</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Legal Document RAG Intelligence</p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Production-Ready AI Legal Assistant & Vector Vault
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Analyze contracts, audit high-risk commitments, compare agreements side-by-side, and ask natural language queries grounded in exact page & clause sources.
              </p>
            </div>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-3">
            
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">JWT Access & Refresh Token Rotation</div>
                <div className="text-slate-400">Secure session persistence with remember me & instant logout.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Google & GitHub Single Sign-On</div>
                <div className="text-slate-400">OAuth enterprise tenant integration for seamless access.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Email Verification & Password Reset</div>
                <div className="text-slate-400">6-digit PIN reset workflow & account security controls.</div>
              </div>
            </div>

          </div>

          {/* Security Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              SOC2 & 256-Bit Encrypted
            </span>
            <span>v1.0 Production</span>
          </div>

        </div>

        {/* RIGHT COLUMN: Dedicated Authentication Portal (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center space-y-6 bg-slate-900/60">
          
          {/* Mode Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-white/10 text-xs font-bold">
              <button
                onClick={() => { setTab('signin'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  tab === 'signin' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>

              <button
                onClick={() => { setTab('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  tab === 'signup' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>

              <button
                onClick={() => { setTab('sso'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  tab === 'sso' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Google / GitHub OAuth
              </button>

              <button
                onClick={() => { setTab('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  tab === 'forgot' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Forgot Password
              </button>
            </div>

            <button
              onClick={handleGuestDemo}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guest Demo</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 text-xs font-bold text-center border border-rose-500/30 animate-fade-in">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-300 text-xs font-bold text-center border border-emerald-500/30 animate-fade-in">
              {successMsg}
            </div>
          )}

          {/* TAB 1: SIGN IN PAGE */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Sign In to LexiRAG</h2>
                <p className="text-xs text-slate-400 mt-1">Enter your work email and password to access your secure RAG dashboard.</p>
              </div>

              {/* OAuth Quick Buttons */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => handleSSO('google')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
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
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-white/10 w-full"></div>
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-bold uppercase">or email</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Work Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="alex.rivera@nexuscorp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setErrorMsg(null); }}
                    className="text-[11px] font-bold text-brand-400 hover:underline"
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-white/20 text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-300 cursor-pointer font-medium">
                  Remember me on this device (30-day refresh token)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER PAGE */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Create Workspace Account</h2>
                <p className="text-xs text-slate-400 mt-1">Set up a new organization or join your enterprise team scope.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Company Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Nexus Corp"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Work Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="alex@nexuscorp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded bg-slate-950 border-white/20 text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-300 cursor-pointer">
                  I agree to the Terms of Service & Privacy Policy
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account...' : 'Register Account & Organization'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: OAUTH SSO PAGE */}
          {tab === 'sso' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Google & GitHub Single Sign-On</h2>
                <p className="text-xs text-slate-400 mt-1">Authenticate instantly using your corporate Google Workspace or GitHub identity.</p>
              </div>

              <div className="space-y-3">
                {/* Google OAuth */}
                <button
                  onClick={() => handleSSO('google')}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-3 group cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google Workspace</span>
                </button>

                {/* GitHub Enterprise */}
                <button
                  onClick={() => handleSSO('github')}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-3 group cursor-pointer border border-white/10"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Sign in with GitHub Enterprise</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: FORGOT PASSWORD PAGE */}
          {tab === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Reset Forgotten Password</h2>
                <p className="text-xs text-slate-400 mt-1">Receive a 6-digit verification security code to set a new password.</p>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotPassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Your Registered Work Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="alex.rivera@nexuscorp.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Send Reset Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  {demoCodeNotice && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono text-center">
                      🔑 Demo Reset Pin Code: <span className="font-bold tracking-widest text-sm">{demoCodeNotice}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">6-Digit Verification PIN Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full py-3 text-center tracking-widest text-lg font-mono font-bold bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-md transition-all"
                  >
                    {loading ? 'Updating Password...' : 'Reset Password & Access Dashboard'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Footer Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Want an instant demo?</span>
            <button
              type="button"
              onClick={handleGuestDemo}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 font-bold border border-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Launch One-Click Guest Demo</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

