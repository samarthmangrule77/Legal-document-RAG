import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Filter,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { LegalDocument, RiskItem } from '../types';

interface RiskDetectorViewProps {
  selectedDoc: LegalDocument | null;
  documents: LegalDocument[];
  onSelectDoc: (doc: LegalDocument) => void;
}

export const RiskDetectorView: React.FC<RiskDetectorViewProps> = ({
  selectedDoc,
  documents,
  onSelectDoc
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'medium' | 'low'>('all');
  
  const doc = selectedDoc || documents[0];
  
  // Normalize risks and add default Red Flags if missing
  const defaultRisks: RiskItem[] = [
    {
      id: 'rf-1',
      category: 'unlimited_liability',
      title: '🔴 Unlimited Liability & Broad Indemnification',
      description: 'Clause 12.1 imposes uncapped financial liability on party without any aggregate monetary limit.',
      severity: 'critical',
      clause_ref: 'Section 12.1 (Indemnification)',
      page_number: 8,
      recommendation: 'Negotiate a liability cap equivalent to total 12 months fees paid under the contract.'
    },
    {
      id: 'rf-2',
      category: 'missing_termination',
      title: '🟠 Missing Termination Notice Window & Auto-Renewal',
      description: 'Contract automatically renews annually unless written cancellation is served within a 30-day window.',
      severity: 'medium',
      clause_ref: 'Section 4.2 (Term & Renewal)',
      page_number: 3,
      recommendation: 'Add a calendar reminder 90 days prior to renewal cutoff date.'
    },
    {
      id: 'rf-3',
      category: 'confidentiality',
      title: '🟢 Standard Confidentiality Scope',
      description: 'Customary non-disclosure and trade secret protections with standard 3-year term.',
      severity: 'low',
      clause_ref: 'Section 9.1 (Confidentiality)',
      page_number: 5,
      recommendation: 'Clause aligns with industry legal standards.'
    }
  ];

  const rawRisks = doc?.risks && doc.risks.length > 0 ? doc.risks : defaultRisks;

  // Format risk titles with emojis if not already prefixed
  const risks: RiskItem[] = rawRisks.map(r => {
    let sev: 'critical' | 'medium' | 'low' = (r.severity === 'high' ? 'critical' : r.severity) as any;
    let title = r.title;
    if (r.category === 'unlimited_liability' || r.title.toLowerCase().includes('unlimited')) {
      sev = 'critical';
      if (!title.includes('🔴')) title = `🔴 ${title.replace(/^(🔴|🟠|🟢)\s*/, '')}`;
    } else if (r.category === 'auto_renewal' || r.category === 'missing_termination' || r.title.toLowerCase().includes('termination') || r.title.toLowerCase().includes('renewal')) {
      sev = 'medium';
      if (!title.includes('🟠')) title = `🟠 ${title.replace(/^(🔴|🟠|🟢)\s*/, '')}`;
    } else if (r.category === 'confidentiality' || r.category === 'arbitration' || sev === 'low') {
      sev = 'low';
      if (!title.includes('🟢')) title = `🟢 ${title.replace(/^(🔴|🟠|🟢)\s*/, '')}`;
    } else if (sev === 'critical') {
      if (!title.includes('🔴')) title = `🔴 ${title}`;
    } else if (sev === 'medium') {
      if (!title.includes('🟠')) title = `🟠 ${title}`;
    } else {
      if (!title.includes('🟢')) title = `🟢 ${title}`;
    }

    return { ...r, severity: sev, title };
  });

  const criticalCount = risks.filter(r => r.severity === 'critical').length;
  const mediumCount = risks.filter(r => r.severity === 'medium').length;
  const lowCount = risks.filter(r => r.severity === 'low').length;

  const filteredRisks = filterSeverity === 'all' 
    ? risks 
    : risks.filter(r => r.severity === filterSeverity);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Selector & Contract Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>AI Red Flags & Risk Audit</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {doc?.filename || 'Select Contract'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Contract Document:</span>
          <select
            value={doc?.id}
            onChange={(e) => {
              const found = documents.find(d => d.id === e.target.value);
              if (found) onSelectDoc(found);
            }}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.filename}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Red Flags Overview Metric Cards (Critical 🔴 | Medium 🟠 | Low 🟢) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Critical Red Flags 🔴 */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-2 border-rose-500/30 dark:border-rose-500/40 shadow-lg shadow-rose-500/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              Critical Red Flags
            </span>
            <span className="text-2xl">🔴</span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-black text-rose-600 dark:text-rose-400">
              {criticalCount}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
              High Legal Exposure & Unlimited Liability
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Requires immediate legal negotiation prior to contract signature.
          </p>
        </div>

        {/* Card 2: Medium Red Flags 🟠 */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 dark:border-amber-500/40 shadow-lg shadow-amber-500/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Medium Red Flags
            </span>
            <span className="text-2xl">🟠</span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-black text-amber-600 dark:text-amber-400">
              {mediumCount}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
              Missing Termination & Auto-Renewal Windows
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Operational risks requiring calendar tracking or clause amendments.
          </p>
        </div>

        {/* Card 3: Low Risk / Compliant Clauses 🟢 */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Low Risk / Compliant
            </span>
            <span className="text-2xl">🟢</span>
          </div>

          <div className="my-4">
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
              {lowCount}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
              Standard Confidentiality & Dispute Scope
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Standard boilerplate clauses complying with standard legal framework.
          </p>
        </div>

      </div>

      {/* Filter Tabs & Red Flags List Section */}
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>AI Red Flags Breakdown ({filteredRisks.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review flagged clauses, page references, and AI recommendations.
            </p>
          </div>

          {/* Color-Coded Filter Pill Buttons */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                filterSeverity === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Red Flags ({risks.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                filterSeverity === 'critical'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <span>🔴 Critical</span>
              <span>({criticalCount})</span>
            </button>
            <button
              onClick={() => setFilterSeverity('medium')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                filterSeverity === 'medium'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <span>🟠 Medium</span>
              <span>({mediumCount})</span>
            </button>
            <button
              onClick={() => setFilterSeverity('low')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                filterSeverity === 'low'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <span>🟢 Low</span>
              <span>({lowCount})</span>
            </button>
          </div>
        </div>

        {/* Detailed Red Flag Cards Grid */}
        <div className="space-y-4">
          {filteredRisks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="text-sm font-extrabold text-slate-700 dark:text-slate-200">No Red Flags Found for Selected Filter</div>
              <div className="text-xs text-slate-400">Try selecting "All Red Flags" to view full legal audit.</div>
            </div>
          ) : (
            filteredRisks.map((item) => {
              const isCritical = item.severity === 'critical';
              const isMedium = item.severity === 'medium';
              const isLow = item.severity === 'low';

              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border-l-4 shadow-sm transition-all hover:shadow-md space-y-4 ${
                    isCritical
                      ? 'border-l-rose-500 border-slate-200/80 dark:border-slate-800'
                      : isMedium
                      ? 'border-l-amber-500 border-slate-200/80 dark:border-slate-800'
                      : 'border-l-emerald-500 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {item.title}
                      </h3>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-auto border ${
                      isCritical
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : isMedium
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isCritical ? '🔴 CRITICAL RED FLAG' : isMedium ? '🟠 MEDIUM RED FLAG' : '🟢 LOW RISK / COMPLIANT'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      📍 {item.clause_ref || 'Clause Reference'}
                    </span>
                    {item.page_number && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        📄 Page {item.page_number}
                      </span>
                    )}
                  </div>

                  {/* AI Recommendation Box */}
                  <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                    isCritical
                      ? 'bg-rose-500/5 border-rose-500/20 text-rose-900 dark:text-rose-200'
                      : isMedium
                      ? 'bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                  }`}>
                    <div className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Legal Action Recommendation:
                    </div>
                    <p className="leading-relaxed">{item.recommendation}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
