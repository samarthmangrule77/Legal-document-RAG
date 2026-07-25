import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  FileCheck2, 
  ShieldAlert, 
  GitCompare, 
  Search, 
  Calendar, 
  BarChart3,
  UploadCloud,
  Building2,
  Users
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'org'
  | 'documents' 
  | 'chat' 
  | 'summary' 
  | 'risks' 
  | 'compare' 
  | 'search' 
  | 'timeline' 
  | 'admin';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  documentCount: number;
  highRiskCount: number;
  activeOrgName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  highRiskCount,
  activeOrgName
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'org' as NavTab, label: 'Organizations & RBAC', icon: Building2, highlight: true },
    { id: 'documents' as NavTab, label: 'Upload & Documents', icon: UploadCloud, badge: documentCount },
    { id: 'chat' as NavTab, label: 'AI RAG Chat', icon: MessageSquare },
    { id: 'summary' as NavTab, label: 'Contract Summary', icon: FileCheck2 },
    { id: 'risks' as NavTab, label: 'Risk Detector', icon: ShieldAlert, alert: highRiskCount > 0 ? `${highRiskCount} Alert` : undefined },
    { id: 'compare' as NavTab, label: 'Contract Comparison', icon: GitCompare },
    { id: 'search' as NavTab, label: 'Semantic Search', icon: Search },
    { id: 'timeline' as NavTab, label: 'Timeline Roadmap', icon: Calendar },
    { id: 'admin' as NavTab, label: 'Admin Telemetry', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block border-r border-slate-200/80 dark:border-slate-800/80 p-4 space-y-6">
      
      {/* Primary Action Button */}
      <button
        onClick={() => setActiveTab('chat')}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all transform active:scale-95"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Ask RAG Assistant</span>
      </button>

      {/* Navigation Groups */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Enterprise Workflows
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {item.badge}
                </span>
              )}

              {item.alert && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {item.alert}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tenant Context Summary Widget */}
      <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-navy-900/80 border border-slate-200/80 dark:border-slate-800/80 text-xs space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5 truncate max-w-[140px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {activeOrgName}
          </span>
          <span className="text-[10px] text-brand-600 font-mono">Isolated</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Multi-tenant RAG storage & vectors strictly scoped to active org.
        </p>
      </div>

    </aside>
  );
};
