import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  ExternalLink
} from 'lucide-react';
import { LegalDocument, RiskItem, Citation } from '../types';

interface RiskDetectorViewProps {
  selectedDoc: LegalDocument | null;
  documents: LegalDocument[];
  onSelectDoc: (doc: LegalDocument) => void;
  onOpenPDFViewer?: (citation: Citation, doc: LegalDocument) => void;
}

export const RiskDetectorView: React.FC<RiskDetectorViewProps> = ({
  selectedDoc,
  documents,
  onSelectDoc,
  onOpenPDFViewer
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
    }

    return { ...r, severity: sev, title };
  });

  const criticalCount = risks.filter(r => r.severity === 'critical').length;
  const mediumCount = risks.filter(r => r.severity === 'medium').length;
  const lowCount = risks.filter(r => r.severity === 'low').length;

  const filteredRisks = filterSeverity === 'all' 
    ? risks 
    : risks.filter(r => r.severity === filterSeverity);

  const handleOpenRiskPDF = (item: RiskItem) => {
    if (onOpenPDFViewer && doc) {
      onOpenPDFViewer({
        doc_id: doc.id,
        doc_name: doc.filename,
        page_number: item.page_number || 1,
        clause_number: item.clause_ref || 'Red Flag Clause',
        snippet: item.description,
        confidence: 0.95
      }, doc);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Selector & Contract Health Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-rose-500 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Automated Contract Risk Audit</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            {doc.filename}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Switch Contract:</span>
          <select
            value={doc.id}
            onChange={(e) => {
              const found = documents.find(d => d.id === e.target.value);
              if (found) onSelectDoc(found);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.filename}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall Health Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Score</div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${doc.risk_score >= 60 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {doc.risk_score}/100
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {doc.risk_score >= 60 ? 'High Risk' : 'Low Risk'}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Critical Red Flags</div>
          <div className="text-3xl font-bold text-rose-500">{criticalCount}</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Medium Concerns</div>
          <div className="text-3xl font-bold text-amber-500">{mediumCount}</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Low Risk / Standard</div>
          <div className="text-3xl font-bold text-emerald-500">{lowCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Red Flags List Section */}
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>AI Red Flags Breakdown ({filteredRisks.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review flagged clauses, page references, and AI recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.05] p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] overflow-x-auto">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterSeverity === 'all'
                  ? 'bg-white dark:bg-white/[0.03] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Red Flags ({risks.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
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
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
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
          {filteredRisks.map((item) => {
            const isCritical = item.severity === 'critical';
            const isMedium = item.severity === 'medium';

            return (
              <div
                key={item.id}
                className={`p-6 rounded-xl bg-white dark:bg-gray-900 border-l-4 shadow-sm transition-all hover:shadow-md space-y-4 ${
                  isCritical
                    ? 'border-l-rose-500 border-slate-200 dark:border-white/[0.06]'
                    : isMedium
                    ? 'border-l-amber-500 border-slate-200 dark:border-white/[0.06]'
                    : 'border-l-emerald-500 border-slate-200 dark:border-white/[0.06]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {item.title}
                  </h3>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto border ${
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

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]">
                      📍 {item.clause_ref || 'Clause Reference'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08]">
                      📄 Page {item.page_number || 1}
                    </span>
                  </div>

                  {onOpenPDFViewer && (
                    <button
                      onClick={() => handleOpenRiskPDF(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span>Inspect PDF Page ({item.page_number || 1})</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                  )}
                </div>

                {/* AI Recommendation Box */}
                <div className={`p-4 rounded-lg border text-xs space-y-1 ${
                  isCritical
                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-900 dark:text-rose-200'
                    : isMedium
                    ? 'bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                }`}>
                  <div className="font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Legal Action Recommendation:
                  </div>
                  <p className="leading-relaxed">{item.recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
