import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Plus, 
  Layers, 
  HardDrive, 
  Mail, 
  CheckCircle2, 
  Trash2, 
  Lock, 
  Crown,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Organization, OrgMember, Team, Role } from '../types';

interface OrganizationManagerViewProps {
  activeOrg: Organization;
  members: OrgMember[];
  onAddTeam: (name: string, description: string) => void;
  onInviteMember: (email: string, name: string, role: Role, teamIds: string[]) => void;
}

export const OrganizationManagerView: React.FC<OrganizationManagerViewProps> = ({
  activeOrg,
  members,
  onAddTeam,
  onInviteMember
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');

  const orgMembers = members.filter(m => m.org_id === activeOrg.id);

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    onAddTeam(teamName, teamDesc);
    setTeamName('');
    setTeamDesc('');
    setIsTeamOpen(false);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onInviteMember(inviteEmail, inviteName || inviteEmail.split('@')[0], inviteRole, selectedTeamIds);
    setInviteEmail('');
    setInviteName('');
    setIsInviteOpen(false);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'owner': return { label: 'OWNER', bg: 'bg-amber-500/15 text-amber-600 border-amber-500/30', icon: Crown };
      case 'admin': return { label: 'ADMIN', bg: 'bg-purple-500/15 text-purple-600 border-purple-500/30', icon: ShieldCheck };
      case 'manager': return { label: 'MANAGER', bg: 'bg-brand-500/15 text-brand-600 border-brand-500/30', icon: Users };
      case 'member': return { label: 'MEMBER', bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', icon: CheckCircle2 };
      default: return { label: 'VIEWER', bg: 'bg-slate-200 text-slate-600 border-slate-300', icon: Lock };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Organization Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-navy-950 p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold border border-white/10">
              <Building2 className="w-3.5 h-3.5" />
              <span>Multi-Tenant Enterprise Organization</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {activeOrg.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Manage departments, invite team members, assign role permissions, and control tenant storage isolation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
            <button
              onClick={() => setIsTeamOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Department Team</span>
            </button>
          </div>

        </div>

        {/* Tenant Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Subscription Plan</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{activeOrg.plan}</div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Active Members</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{orgMembers.length} Members</div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Department Teams</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{activeOrg.teams.length} Teams</div>
          </div>

          <div>
            <div className="text-slate-400 font-medium">Isolated Storage</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{(activeOrg.storage_used_mb / 1024).toFixed(1)} GB / {(activeOrg.max_storage_mb / 1024).toFixed(0)} GB</div>
          </div>
        </div>
      </div>

      {/* Teams / Departments Section */}
      <div className="glass-card p-6 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-500" />
              <span>Departmental Teams</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Contracts and RAG vector searches are scoped per department team.
            </p>
          </div>

          <button
            onClick={() => setIsTeamOpen(true)}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeOrg.teams.map((team) => (
            <div
              key={team.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3 hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {team.name}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {team.document_count} Contracts
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {team.description}
              </p>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800">
                <span>Tenant Scope ID: {team.id}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members & RBAC Section */}
      <div className="glass-card p-6 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>Organization Members & Role Permissions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control access levels and assign members to specific department teams.
            </p>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite New Member</span>
          </button>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Member Name & Email</th>
                <th className="py-3 px-4">Role Access</th>
                <th className="py-3 px-4">Assigned Department Teams</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {orgMembers.map((member) => {
                const rInfo = getRoleBadge(member.role);
                const Icon = rInfo.icon;
                return (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-navy-900/50 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{member.name}</div>
                          <div className="text-[10px] text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${rInfo.bg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{rInfo.label}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {member.team_ids.map(tid => {
                          const t = activeOrg.teams.find(tm => tm.id === tid);
                          return (
                            <span key={tid} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                              {t?.name || tid}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        member.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {member.status}
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Role Permissions Matrix Reference */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          <span>Role Permissions Matrix Reference</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/50 dark:border-slate-800 space-y-1">
            <div className="font-bold text-amber-600 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              Owner & Admin
            </div>
            <p className="text-slate-500 text-[11px]">Full access. Manage billing, create teams, invite members, view & edit all organization contracts.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/50 dark:border-slate-800 space-y-1">
            <div className="font-bold text-brand-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Manager & Member
            </div>
            <p className="text-slate-500 text-[11px]">Upload contracts, execute RAG queries, view risk audits within assigned department teams.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/50 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-600 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Auditor / Viewer
            </div>
            <p className="text-slate-500 text-[11px]">Read-only view access to contract summaries and risk reports. No edit or upload permissions.</p>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-card bg-white dark:bg-navy-950 rounded-3xl p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-500" />
                <span>Invite Team Member</span>
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Member Full Name</label>
                <input
                  type="text"
                  placeholder="Sarah Jenkins"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="admin">Admin (Full department access)</option>
                  <option value="manager">Manager (Upload & edit contracts)</option>
                  <option value="member">Member (Standard RAG access)</option>
                  <option value="viewer">Viewer / Auditor (Read-only)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assign to Department Teams</label>
                <div className="space-y-1">
                  {activeOrg.teams.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedTeamIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTeamIds([...selectedTeamIds, t.id]);
                          else setSelectedTeamIds(selectedTeamIds.filter(id => id !== t.id));
                        }}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Send Email Invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {isTeamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-card bg-white dark:bg-navy-950 rounded-3xl p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-500" />
                <span>Create Department Team</span>
              </h3>
              <button onClick={() => setIsTeamOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Procurement & Vendors"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Team Description</label>
                <input
                  type="text"
                  placeholder="Scope & contract responsibilities..."
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Create Team
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
