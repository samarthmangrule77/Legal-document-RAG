import React, { useState } from 'react';
import { Building2, ChevronDown, Plus, Users, Shield, Check, Layers } from 'lucide-react';
import { Organization, Team } from '../types';

interface OrgSwitcherProps {
  organizations: Organization[];
  activeOrg: Organization;
  activeTeamId: string;
  onSelectOrg: (orgId: string) => void;
  onSelectTeam: (teamId: string) => void;
  onCreateOrgModal: () => void;
}

export const OrgSwitcher: React.FC<OrgSwitcherProps> = ({
  organizations,
  activeOrg,
  activeTeamId,
  onSelectOrg,
  onSelectTeam,
  onCreateOrgModal
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeTeam = activeOrg.teams.find(t => t.id === activeTeamId);

  return (
    <div className="relative">
      
      {/* Organization Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-navy-900/80 hover:bg-slate-200 dark:hover:bg-navy-900 border border-slate-200/80 dark:border-slate-700/60 transition-all text-left group"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          {activeOrg.name.charAt(0)}
        </div>

        <div className="hidden sm:block">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-tight">
            <span>{activeOrg.name}</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {activeOrg.plan.split(' ')[0]}
            </span>
          </div>

          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <Users className="w-2.5 h-2.5" />
            <span>{activeTeam ? activeTeam.name : 'All Department Teams'}</span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 glass-card bg-white dark:bg-navy-950 rounded-2xl p-3 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-slide-up space-y-3">
          
          <div className="px-2 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Organization</span>
            <span>{organizations.length} Orgs</span>
          </div>

          {/* Org List */}
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {organizations.map((org) => {
              const isSelected = org.id === activeOrg.id;
              return (
                <button
                  key={org.id}
                  onClick={() => {
                    onSelectOrg(org.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-navy-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                      {org.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{org.name}</div>
                      <div className="text-[10px] text-slate-400">{org.teams.length} Teams • {org.plan}</div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                </button>
              );
            })}
          </div>

          {/* Department Team Selector inside Active Org */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-500" />
              <span>Department / Team Scope</span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => {
                  onSelectTeam('all');
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                  activeTeamId === 'all'
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900'
                }`}
              >
                <span>🌐 All Organization Teams</span>
                {activeTeamId === 'all' && <Check className="w-3.5 h-3.5" />}
              </button>

              {activeOrg.teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    onSelectTeam(team.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeTeamId === team.id
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900'
                  }`}
                >
                  <span>📁 {team.name}</span>
                  {activeTeamId === team.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Create New Org Action */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateOrgModal();
              }}
              className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Organization</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
