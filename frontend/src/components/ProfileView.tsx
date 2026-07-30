import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Save, 
  Lock, 
  Globe,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api/client';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sso' | 'sessions'>('profile');

  // Form states
  const [name, setName] = useState(user.name || '');
  const [jobTitle, setJobTitle] = useState(user.job_title || 'Head of Legal & Compliance');
  const [companyName, setCompanyName] = useState(user.company_name || 'Nexus Corp');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email verification OTP modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);
  const [verifySent, setVerifySent] = useState(false);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.updateProfile({
        name,
        job_title: jobTitle,
        company_name: companyName
      });
      setLoading(false);
      setSuccessMsg("Profile details updated successfully!");
      if (res.user) {
        onUpdateUser({
          ...user,
          ...res.user
        });
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Failed to update profile details.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.updateProfile({
        current_password: currentPassword,
        new_password: newPassword
      });
      setLoading(false);
      setSuccessMsg("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Failed to update password.");
    }
  };

  const handleSendVerifyCode = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.sendEmailVerification(user.email);
      setLoading(false);
      setVerifySent(true);
      if (res.demo_code) setDemoCodeNotice(res.demo_code);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Failed to send verification code.");
    }
  };

  const handleConfirmVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.confirmEmailVerification(user.email, verifyCode);
      setLoading(false);
      setShowVerifyModal(false);
      setSuccessMsg("Email successfully verified!");
      onUpdateUser({
        ...user,
        email_verified: true
      });
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Invalid code. Verification failed.");
    }
  };

  const handleLinkOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const res = await api.ssoLogin(provider, user.email, user.name);
      setLoading(false);
      setSuccessMsg(`Successfully linked ${provider.toUpperCase()} account!`);
      if (res.user) onUpdateUser({ ...user, auth_provider: provider });
    } catch (e) {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 placeholder-slate-400 dark:placeholder-slate-500";
  const labelClass = "text-xs font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Top Banner & User Summary Header */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-brand-600 text-white font-semibold text-xl flex items-center justify-center shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[10px]">
                ✓
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 rounded-full border border-brand-200 dark:border-brand-500/20 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  {user.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {user.job_title || 'Legal Counsel'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {user.company_name || 'Nexus Corp'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {user.email_verified ? (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowVerifyModal(true);
                  handleSendVerifyCode();
                }}
                className="px-3.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Verify Email</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="hover:underline">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="hover:underline">Dismiss</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/[0.06] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-colors ${
            activeTab === 'profile' 
              ? 'bg-brand-600 text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-colors ${
            activeTab === 'security' 
              ? 'bg-brand-600 text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('sso')}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-colors ${
            activeTab === 'sso' 
              ? 'bg-brand-600 text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>OAuth Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center gap-2 transition-colors ${
            activeTab === 'sessions' 
              ? 'bg-brand-600 text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sessions & Tokens</span>
        </button>
      </div>

      {/* TAB 1: PROFILE DETAILS FORM */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Personal & Workspace Information</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your identity metadata used across RAG audit logs and team scope.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Email Address (Read-only)</label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-lg text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Job Title / Role</label>
                <div className="relative">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Chief Legal Officer"
                    className={inputClass}
                  />
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Company / Organization</label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Nexus Corporation"
                    className={inputClass}
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Password & Authentication Security</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update your password or verify email status.</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CONNECTED OAUTH ACCOUNTS */}
      {activeTab === 'sso' && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">OAuth Single Sign-On Identities</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage corporate identity providers linked to your LexiRAG account.</p>
          </div>

          <div className="space-y-4">
            {/* Google OAuth Link */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white p-1.5 flex items-center justify-center shadow-sm border border-slate-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white text-xs">Google Workspace OAuth</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {user.auth_provider === 'google' ? 'Connected & Active' : 'Not linked to this account'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLinkOAuth('google')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  user.auth_provider === 'google' 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                    : 'bg-white dark:bg-white/[0.06] text-slate-800 dark:text-white hover:bg-slate-100 border border-slate-200 dark:border-white/[0.1]'
                }`}
              >
                {user.auth_provider === 'google' ? 'Linked ✓' : 'Link Google Account'}
              </button>
            </div>

            {/* GitHub OAuth Link */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 p-1.5 flex items-center justify-center text-white border border-slate-700">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white text-xs">GitHub OAuth</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {user.auth_provider === 'github' ? 'Connected & Active' : 'Not linked to this account'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLinkOAuth('github')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  user.auth_provider === 'github' 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {user.auth_provider === 'github' ? 'Linked ✓' : 'Link GitHub Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SESSIONS & TOKENS */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Active Session & Tokens</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review active session tokens and state.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                <span>JWT Access Token (HMAC-SHA256)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
              </div>
              <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 truncate text-[11px]">
                {localStorage.getItem('lexirag_access_token') || sessionStorage.getItem('lexirag_access_token') || 'bearer-token-active'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                <span>Refresh Token (Long-Lived Session)</span>
                <span className="text-brand-600 dark:text-brand-400 font-medium">Rotated</span>
              </div>
              <div className="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 truncate text-[11px]">
                {localStorage.getItem('lexirag_refresh_token') || sessionStorage.getItem('lexirag_refresh_token') || 'refresh-token-active'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL VERIFICATION MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.08] rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Email Address Verification</h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white">Close</button>
            </div>

            <form onSubmit={handleConfirmVerifyCode} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                A 6-digit verification code has been generated for <span className="font-medium text-slate-900 dark:text-white">{user.email}</span>.
              </p>

              {demoCodeNotice && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono text-center">
                  Demo Code: <span className="font-medium tracking-widest text-sm">{demoCodeNotice}</span>
                </div>
              )}

              <div className="space-y-1">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full py-2.5 text-center tracking-widest text-lg font-mono font-medium bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Pin & Confirm Email'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
