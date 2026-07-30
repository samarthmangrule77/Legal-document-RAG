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
  CreditCard,
  FileSignature,
  GitFork,
  History,
  Zap,
  ShieldCheck,
  Brain,
  Settings,
  Code2,
  Bot,
  User as UserIcon
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'agent'
  | 'org'
  | 'profile'
  | 'generator'
  | 'workflows'
  | 'graph'
  | 'versioning'
  | 'memory'
  | 'audit'
  | 'developer'
  | 'settings'
  | 'documents' 
  | 'chat' 
  | 'summary' 
  | 'risks' 
  | 'compare' 
  | 'search' 
  | 'timeline' 
  | 'admin'
  | 'billing';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  documentCount: number;
  highRiskCount: number;
  activeOrgName: string;
  planName?: string;
}

const navSections = [
  {
    label: 'Core',
    items: [
      { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'documents' as NavTab, label: 'Documents', icon: UploadCloud },
      { id: 'chat' as NavTab, label: 'Chat', icon: MessageSquare },
      { id: 'agent' as NavTab, label: 'Agent', icon: Bot },
    ]
  },
  {
    label: 'Analysis',
    items: [
      { id: 'summary' as NavTab, label: 'Summary', icon: FileCheck2 },
      { id: 'risks' as NavTab, label: 'Risk Detector', icon: ShieldAlert },
      { id: 'compare' as NavTab, label: 'Compare', icon: GitCompare },
      { id: 'search' as NavTab, label: 'Search', icon: Search },
      { id: 'timeline' as NavTab, label: 'Timeline', icon: Calendar },
      { id: 'graph' as NavTab, label: 'Clause Map', icon: GitFork },
    ]
  },
  {
    label: 'Tools',
    items: [
      { id: 'generator' as NavTab, label: 'Generator', icon: FileSignature },
      { id: 'workflows' as NavTab, label: 'Workflows', icon: Zap },
      { id: 'versioning' as NavTab, label: 'Version Control', icon: History },
      { id: 'memory' as NavTab, label: 'Memory', icon: Brain },
      { id: 'developer' as NavTab, label: 'API', icon: Code2 },
    ]
  },
  {
    label: 'Settings',
    items: [
      { id: 'profile' as NavTab, label: 'Profile', icon: UserIcon },
      { id: 'org' as NavTab, label: 'Organization', icon: Building2 },
      { id: 'billing' as NavTab, label: 'Billing', icon: CreditCard },
      { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
      { id: 'audit' as NavTab, label: 'Audit Logs', icon: ShieldCheck },
      { id: 'admin' as NavTab, label: 'Analytics', icon: BarChart3 },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  highRiskCount,
  activeOrgName,
  planName = 'Free Plan'
}) => {
  return (
    <aside className="w-56 flex-shrink-0 hidden md:flex flex-col border-r border-slate-200/60 dark:border-white/[0.06] py-4 overflow-y-auto">
      
      {/* Primary Action */}
      <div className="px-3 mb-4">
        <button
          onClick={() => setActiveTab('chat')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-5 px-2">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-3 pb-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badge = item.id === 'documents' ? documentCount : 
                              item.id === 'risks' && highRiskCount > 0 ? highRiskCount : undefined;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? 'bg-brand-600/10 text-brand-700 dark:text-brand-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>

                    {badge !== undefined && (
                      <span className={`min-w-[20px] text-center px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                        item.id === 'risks' 
                          ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' 
                          : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Org context — minimal */}
      <div className="px-3 pt-3 mt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
        <div className="px-2 text-[11px] text-slate-400 dark:text-slate-500 truncate">
          {activeOrgName} · {planName}
        </div>
      </div>

    </aside>
  );
};
