import React, { useState } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  History, 
  TrendingDown, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { LegalDocument } from '../types';

interface VersionControlViewProps {
  selectedDoc: LegalDocument | null;
  documents: LegalDocument[];
  onSelectDoc: (doc: LegalDocument) => void;
}

interface ContractVersion {
  version: string;
  label: string;
  date: string;
  author: string;
  risk_score: number;
  summary: string;
}

interface RedlineDiff {
  id: string;
  type: 'added' | 'removed' | 'modified';
  clause: string;
  v1_text: string;
  v3_text: string;
  analysis: string;
}

const VERSIONS_DATA: ContractVersion[] = [
  {
    version: 'v1.0',
    label: 'Contract V1.0 (Vendor Initial Draft)',
    date: '2026-07-10',
    author: 'Vendor Legal Counsel',
    risk_score: 78,
    summary: 'Initial draft containing broad 24-month worldwide non-compete and unlimited IP indemnification.'
  },
  {
    version: 'v2.0',
    label: 'Contract V2.0 (Legal Redline Revision)',
    date: '2026-07-18',
    author: 'Internal Legal Team',
    risk_score: 45,
    summary: 'Negotiated 12-month fee cap on indemnification liability and shortened non-compete window to 12 months.'
  },
  {
    version: 'v3.0',
    label: 'Contract V3.0 (Final Executed Agreement)',
    date: '2026-07-26',
    author: 'Executive Signatory',
    risk_score: 20,
    summary: 'Final executed agreement with 30-day notice period, 6-month local non-compete, and capped indemnification.'
  }
];

const REDLINE_DIFFS: RedlineDiff[] = [
  {
    id: 'diff-1',
    type: 'removed',
    clause: 'Clause 8.2 (Restrictive Covenants)',
    v1_text: 'Employee shall not directly or indirectly engage in any business competing with Employer within any geographic region worldwide for twenty-four (24) months post-resignation.',
    v3_text: 'Employee agrees not to provide direct local software engineering services for direct competitors within a 50-mile radius for six (6) months post-resignation.',
    analysis: '🔴 Removed 24-month worldwide non-compete restriction and replaced with reasonable 6-month local scope.'
  },
  {
    id: 'diff-2',
    type: 'added',
    clause: 'Clause 12.1 (Liability Cap)',
    v1_text: 'Employee indemnifies and holds harmless Employer for all third-party intellectual property claims without monetary limit.',
    v3_text: 'Employer and Employee aggregate liability under this Agreement is capped at total fees paid in the preceding twelve (12) months.',
    analysis: '🟢 Added mandatory 12-month monetary liability cap protecting employee from unlimited financial exposure.'
  },
  {
    id: 'diff-3',
    type: 'modified',
    clause: 'Clause 10.1 (Termination Notice Period)',
    v1_text: 'Either party may terminate this Agreement without cause upon giving fifteen (15) calendar days written notice.',
    v3_text: 'Either party may terminate this Agreement without cause upon giving thirty (30) calendar days advance written notice.',
    analysis: '🟡 Extended notice period from 15 to 30 days allowing adequate operational transition time.'
  }
];

export const VersionControlView: React.FC<VersionControlViewProps> = ({
  selectedDoc,
  documents,
  onSelectDoc
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>('v3.0');
  const [filterDiffType, setFilterDiffType] = useState<'all' | 'added' | 'removed' | 'modified'>('all');

  const activeVerObj = VERSIONS_DATA.find(v => v.version === selectedVersion) || VERSIONS_DATA[2];
  const initialVerObj = VERSIONS_DATA[0];
  const riskReductionPct = Math.round(((initialVerObj.risk_score - activeVerObj.risk_score) / initialVerObj.risk_score) * 100);

  const filteredDiffs = filterDiffType === 'all'
    ? REDLINE_DIFFS
    : REDLINE_DIFFS.filter(d => d.type === filterDiffType);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 p-8 border border-white/[0.06] text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-3">
              <History className="w-3.5 h-3.5" />
              Document Version Control & Track Changes
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Contract Revision & Redline Diff Tracker</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              Track legal revisions across contract versions (V1 ➔ V2 ➔ V3). Audit added clauses, removed restrictions, and measure total risk exposure reduction over time.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur border border-white/[0.08]/80 p-3.5 rounded-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Risk Exposure Delta</div>
              <div className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                -{riskReductionPct}% Risk Reduced (78 ➔ {activeVerObj.risk_score})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version Timeline Stepper */}
      <div className="p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-brand-500" />
            <span>Select Contract Version</span>
          </h2>
          <span className="text-xs font-medium text-slate-400">Active Selected Version: <span className="text-brand-600 font-mono">{selectedVersion.toUpperCase()}</span></span>
        </div>

        {/* Stepper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VERSIONS_DATA.map((ver) => {
            const isSelected = selectedVersion === ver.version;
            return (
              <button
                key={ver.version}
                onClick={() => setSelectedVersion(ver.version)}
                className={`text-left p-6 rounded-lg transition-all duration-200 space-y-3 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-white/[0.03] border-2 border-brand-500 shadow-md shadow-brand-500/10 scale-102'
                    : 'bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.08]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-xs font-semibold font-mono">
                      {ver.version.toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      ver.risk_score >= 60 ? 'bg-rose-500/15 text-rose-600 border-rose-500/20' : ver.risk_score >= 35 ? 'bg-amber-500/15 text-amber-600 border-amber-500/20' : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
                    }`}>
                      Risk Score: {ver.risk_score}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-3">{ver.label}</h3>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">Author: {ver.author} • {ver.date}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {ver.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-medium text-brand-600">
                  <span>{isSelected ? 'Active View' : 'Switch to Version'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Redline Track Changes Section */}
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-500" />
              <span>Track Changes Redline Audit ({filteredDiffs.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing initial vendor draft (V1.0) against active negotiated agreement ({selectedVersion.toUpperCase()}).
            </p>
          </div>

          {/* Filter Diffs */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.05] p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] overflow-x-auto">
            <button
              onClick={() => setFilterDiffType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterDiffType === 'all'
                  ? 'bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Diffs ({REDLINE_DIFFS.length})
            </button>
            <button
              onClick={() => setFilterDiffType('added')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterDiffType === 'added'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-emerald-600 hover:bg-emerald-500/10'
              }`}
            >
              🟢 + Added Clauses
            </button>
            <button
              onClick={() => setFilterDiffType('removed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterDiffType === 'removed'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-rose-600 hover:bg-rose-500/10'
              }`}
            >
              🔴 - Removed Restrictions
            </button>
            <button
              onClick={() => setFilterDiffType('modified')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterDiffType === 'modified'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-amber-600 hover:bg-amber-500/10'
              }`}
            >
              🟡 ~ Modified Terms
            </button>
          </div>
        </div>

        {/* Diff Cards */}
        <div className="space-y-6">
          {filteredDiffs.map((diff) => (
            <div
              key={diff.id}
              className="p-6 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
                  {diff.type === 'added' ? (
                    <PlusCircle className="w-4 h-4 text-emerald-500" />
                  ) : diff.type === 'removed' ? (
                    <MinusCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{diff.clause}</span>
                </div>

                <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  diff.type === 'added' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : diff.type === 'removed' ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                }`}>
                  {diff.type.toUpperCase()} PROVISION
                </span>
              </div>

              {/* Side by Side Redline Text Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 space-y-1">
                  <div className="font-semibold text-[11px] uppercase tracking-wider text-rose-600">Contract V1.0 (Original Draft):</div>
                  <p className="line-through leading-relaxed opacity-90">{diff.v1_text}</p>
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="font-semibold text-[11px] uppercase tracking-wider text-emerald-600">Contract {selectedVersion.toUpperCase()} (Revised):</div>
                  <p className="leading-relaxed font-medium">{diff.v3_text}</p>
                </div>
              </div>

              {/* Legal Analysis Banner */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="font-semibold">{diff.analysis}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
