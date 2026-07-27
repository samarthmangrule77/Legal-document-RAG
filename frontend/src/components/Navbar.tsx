import React, { useState } from 'react';
import { Scale, Moon, Sun, ShieldAlert, Sparkles, User as UserIcon, LogOut, Search, Bell } from 'lucide-react';
import { User, Organization } from '../types';
import { OrgSwitcher } from './OrgSwitcher';
import { NotificationEvent } from './NotificationToastContainer';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  user: User | null;
  organizations: Organization[];
  activeOrg: Organization;
  activeTeamId: string;
  onSelectOrg: (orgId: string) => void;
  onSelectTeam: (teamId: string) => void;
  onCreateOrgModal: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onQuickSearch: () => void;
  notifications?: NotificationEvent[];
  unreadCount?: number;
  onClearNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  user,
  organizations,
  activeOrg,
  activeTeamId,
  onSelectOrg,
  onSelectTeam,
  onCreateOrgModal,
  onOpenAuth,
  onLogout,
  searchQuery,
  setSearchQuery,
  onQuickSearch,
  notifications = [],
  unreadCount = 0,
  onClearNotifications
}) => {
  const [showNotificationFeed, setShowNotificationFeed] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Org Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div className="hidden lg:block">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-900 dark:from-white dark:via-brand-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  LexiRAG
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded border border-brand-500/20">
                  TENANT
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          {/* Multi-Tenant Org Switcher */}
          <OrgSwitcher
            organizations={organizations}
            activeOrg={activeOrg}
            activeTeamId={activeTeamId}
            onSelectOrg={onSelectOrg}
            onSelectTeam={onSelectTeam}
            onCreateOrgModal={onCreateOrgModal}
          />
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm relative">
          <input
            type="text"
            placeholder={`Search within ${activeOrg.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onQuickSearch()}
            className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-100/80 dark:bg-navy-900/60 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Security Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Isolated Tenant Vault</span>
          </div>

          {/* Real-Time WebSocket Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationFeed(!showNotificationFeed)}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-bounce shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Feed */}
            {showNotificationFeed && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    Real-Time Activity Feed
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        if (onClearNotifications) onClearNotifications();
                        setShowNotificationFeed(false);
                      }}
                      className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No real-time events yet. Upload a document to see live processing!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          <span>{n.title}</span>
                          <span className="text-[9px] font-mono text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Account / Guest */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-brand-600 flex items-center justify-center text-white font-bold text-xs shadow">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">{user.role}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-xl shadow-md shadow-brand-500/20 transition-all"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In / Guest</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
