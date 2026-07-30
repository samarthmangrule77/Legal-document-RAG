import React, { useState } from 'react';
import { Scale, Moon, Sun, User as UserIcon, LogOut, Search, Bell } from 'lucide-react';
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
  onOpenProfile?: () => void;
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
  onOpenProfile,
  searchQuery,
  setSearchQuery,
  onQuickSearch,
  notifications = [],
  unreadCount = 0,
  onClearNotifications
}) => {
  const [showNotificationFeed, setShowNotificationFeed] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/60 dark:border-white/[0.06] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Logo & Org Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenProfile}>
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Scale className="w-4 h-4" />
            </div>
            <span className="hidden lg:block font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
              LexiRAG
            </span>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

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
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onQuickSearch()}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-[9px]" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationFeed(!showNotificationFeed)}
              className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white font-medium text-[9px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationFeed && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 shadow-lg z-50 animate-fade-in space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        if (onClearNotifications) onClearNotifications();
                        setShowNotificationFeed(false);
                      }}
                      className="text-[11px] text-brand-600 dark:text-brand-400 font-medium hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{n.title}</span>
                          <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/[0.08]">
              <div 
                onClick={onOpenProfile}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white font-medium text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
