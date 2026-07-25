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
  Zap 
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthViewProps {
  onSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'sso' | 'otp'>('sso');

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSSO = async (provider: 'google' | 'microsoft' | 'github') => {
    setLoading(true);
    setErrorMsg(null);
    const res = await api.ssoLogin(provider);
    setLoading(false);
    onSuccess(res.user);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const res = await api.login(email || 'alex.rivera@nexuscorp.com', password);
    setLoading(false);
    onSuccess(res.user);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const res = await api.login(email || 'new.user@company.com', password);
    setLoading(false);
    onSuccess({
      ...res.user,
      name: name || 'Enterprise Admin'
    });
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    const res = await api.sendOTP(email);
    setLoading(false);
    setOtpSent(true);
    if (res.demo_code) setDemoCodeNotice(res.demo_code);
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
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("Invalid OTP code. Please check your 6-digit pin.");
    }
  };

  const handleGuestDemo = async () => {
    setLoading(true);
    const res = await api.guestLogin();
    setLoading(false);
    onSuccess(res.user);
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
                AI Legal Assistant with Citation Highlighting & Multi-Tenancy
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
                <div className="font-bold text-white">ChatGPT-Style Source Highlighting</div>
                <div className="text-slate-400">Click citations to open PDF viewer with target sentence highlighted.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Multi-Tenant Isolated Storage</div>
                <div className="text-slate-400">Company organizations, departmental team scoping & RBAC.</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">8-Point Risk Scan & 0-100 Score</div>
                <div className="text-slate-400">Automated audit for unlimited liability, penalties, auto-renewal & non-competes.</div>
              </div>
            </div>

          </div>

          {/* Security Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              SOC2 & 256-Bit Encrypted
            </span>
            <span>v1.0 Enterprise</span>
          </div>

        </div>

        {/* RIGHT COLUMN: Dedicated Authentication Portal (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-center space-y-6 bg-slate-900/60">
          
          {/* Mode Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-white/10 text-xs font-bold">
              <button
                onClick={() => setTab('sso')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  tab === 'sso' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                OAuth SSO
              </button>

              <button
                onClick={() => setTab('signin')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  tab === 'signin' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>

              <button
                onClick={() => setTab('signup')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  tab === 'signup' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>

              <button
                onClick={() => setTab('otp')}
                className={`px-3.5 py-2 rounded-xl transition-all ${
                  tab === 'otp' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Email OTP
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

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 text-xs font-bold text-center border border-rose-500/30">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: OAUTH SSO PAGE */}
          {tab === 'sso' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Single Sign-On (SSO) Portal</h2>
                <p className="text-xs text-slate-400 mt-1">Authenticate using your corporate identity provider.</p>
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

                {/* Microsoft Azure AD */}
                <button
                  onClick={() => handleSSO('microsoft')}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-3 group cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span>Sign in with Microsoft Entra ID (Azure AD)</span>
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

              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-brand-400" />
                  Automatic Tenant Identity Mapping
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Signing in with your corporate domain automatically routes you to your organization's isolated RAG vector vault.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN IN PAGE */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Sign In to LexiRAG</h2>
                <p className="text-xs text-slate-400 mt-1">Enter your work email credentials to continue.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Corporate Email</label>
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
                <label className="text-xs font-bold text-slate-300">Password</label>
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

          {/* TAB 3: CREATE ENTERPRISE ACCOUNT PAGE */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Create Enterprise Account</h2>
                <p className="text-xs text-slate-400 mt-1">Set up a new organization or join your company's tenant workspace.</p>
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Enterprise Account & Organization'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 4: EMAIL OTP TAB */}
          {tab === 'otp' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold text-white">Email OTP Security Portal</h2>
                <p className="text-xs text-slate-400 mt-1">Receive a 6-digit one-time security code on your corporate email.</p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Work Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="alex.rivera@company.com"
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
                    <span>Send 6-Digit Security Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="text-xs text-slate-300">
                    Security code sent to <span className="font-bold text-white">{email}</span>:
                  </div>

                  {demoCodeNotice && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono text-center">
                      🔑 Demo OTP Pin Code: <span className="font-bold tracking-widest text-sm">{demoCodeNotice}</span>
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
                      className="w-full py-3.5 text-center tracking-widest text-xl font-mono font-bold bg-slate-950 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-md transition-all"
                  >
                    {loading ? 'Verifying Code...' : 'Verify Pin & Enter Workspace'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Footer Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Want an instant demo?</span>
            <button
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
