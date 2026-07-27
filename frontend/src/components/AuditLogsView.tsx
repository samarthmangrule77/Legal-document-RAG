import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  Trash2, 
  FileDown, 
  FileSignature, 
  CreditCard, 
  UserCheck, 
  Search, 
  Filter, 
  Clock, 
  Terminal,
  Building2,
  RefreshCw,
  Download
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  timestamp: string;
  user_name: string;
  user_email: string;
  role: string;
  action_type: 'UPLOAD' | 'DELETE' | 'EXPORT' | 'GENERATE' | 'BILLING' | 'AUTH';
  target_resource: string;
  details: string;
  ip_address: string;
}

const INITIAL_LOGS: AuditLogItem[] = [
  {
    id: 'audit-101',
    timestamp: '2026-07-27 11:50 AM',
    user_name: 'Alex Rivera',
    user_email: 'alex.rivera@nexuscorp.com',
    role: 'owner',
    action_type: 'BILLING',
    target_resource: 'Subscription Plan',
    details: 'Upgraded workspace subscription to Pro Plan ($29/mo) via Stripe.',
    ip_address: '192.168.1.45'
  },
  {
    id: 'audit-102',
    timestamp: '2026-07-27 11:30 AM',
    user_name: 'Samarth Mangrule',
    user_email: 'samarth@nexuscorp.com',
    role: 'admin',
    action_type: 'GENERATE',
    target_resource: 'Employment Agreement',
    details: 'Synthesized and indexed Employment Agreement for Sarah Connor via AI Generator.',
    ip_address: '192.168.1.12'
  },
  {
    id: 'audit-103',
    timestamp: '2026-07-27 11:15 AM',
    user_name: 'Samarth Mangrule',
    user_email: 'samarth@nexuscorp.com',
    role: 'admin',
    action_type: 'EXPORT',
    target_resource: 'Legal Risk Summary PDF',
    details: 'User exported PDF legal risk summary report for Senior_Software_Engineer_Agreement.pdf.',
    ip_address: '192.168.1.12'
  },
  {
    id: 'audit-104',
    timestamp: '2026-07-27 10:45 AM',
    user_name: 'Alex Rivera (Admin)',
    user_email: 'alex.rivera@nexuscorp.com',
    role: 'owner',
    action_type: 'DELETE',
    target_resource: 'draft_contract_v1.pdf',
    details: 'Admin deleted draft_contract_v1.pdf from Legal Workspace.',
    ip_address: '192.168.1.45'
  },
  {
    id: 'audit-105',
    timestamp: '2026-07-27 10:20 AM',
    user_name: 'Samarth Mangrule',
    user_email: 'samarth@nexuscorp.com',
    role: 'admin',
    action_type: 'UPLOAD',
    target_resource: 'Senior_Software_Engineer_Agreement.pdf',
    details: 'Samarth uploaded Senior_Software_Engineer_Agreement.pdf (2.4 MB) to Legal Workspace.',
    ip_address: '192.168.1.12'
  }
];

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getActionBadge = (type: AuditLogItem['action_type']) => {
    switch (type) {
      case 'UPLOAD': return { bg: 'bg-blue-500/15 text-blue-600 border-blue-500/30', icon: UploadCloud };
      case 'DELETE': return { bg: 'bg-rose-500/15 text-rose-600 border-rose-500/30', icon: Trash2 };
      case 'EXPORT': return { bg: 'bg-amber-500/15 text-amber-600 border-amber-500/30', icon: FileDown };
      case 'GENERATE': return { bg: 'bg-purple-500/15 text-purple-600 border-purple-500/30', icon: FileSignature };
      case 'BILLING': return { bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', icon: CreditCard };
      default: return { bg: 'bg-slate-500/15 text-slate-600 border-slate-500/30', icon: UserCheck };
    }
  };

  const filteredLogs = logs.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.action_type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target_resource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 p-8 border border-slate-800 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              SOC2 & HIPAA Enterprise Audit Trail
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Enterprise Audit Logs & Telemetry</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              Tamper-evident audit stream recording every user upload, document deletion, summary export, AI generation, and subscription change.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Telemetry Active
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by user, action, or document..."
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'UPLOAD', 'DELETE', 'EXPORT', 'GENERATE', 'BILLING'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Logs' : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Audit Logs Table */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-500" />
            <span>Audit Trail Stream ({filteredLogs.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Real-Time Security Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">User / Actor</th>
                <th className="pb-3 px-3">Action Type</th>
                <th className="pb-3 px-3">Target Resource</th>
                <th className="pb-3 px-3">Action Details</th>
                <th className="pb-3 px-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredLogs.map((log) => {
                const badge = getActionBadge(log.action_type);
                const Icon = badge.icon;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-4 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <div>{log.user_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal font-mono">{log.user_email}</div>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 w-fit ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{log.action_type}</span>
                      </span>
                    </td>
                    <td className="py-4 px-3 font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                      {log.target_resource}
                    </td>
                    <td className="py-4 px-3 text-slate-700 dark:text-slate-300 max-w-md">
                      {log.details}
                    </td>
                    <td className="py-4 px-3 font-mono text-slate-400 text-right whitespace-nowrap">
                      {log.ip_address}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
