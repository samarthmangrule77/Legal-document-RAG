import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  Filter
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
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  const doc = selectedDoc || documents[0];
  const risks = doc?.risks || [];

  const filteredRisks = filterSeverity === 'all' 
    ? risks 
    : risks.filter(r => r.severity === filterSeverity);

  const getRiskColor = (score: number) => {
    if (score >= 60) return { label: 'HIGH RISK', text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500/30' };
    if (score >= 35) return { label: 'MODERATE RISK', text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/30' };
    return { label: 'LOW RISK', text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30' };
  };

  const riskInfo = getRiskColor(doc?.risk_score || 0);

  const riskCategories = [
    { key: 'unlimited_liability', label: 'Unlimited Liability' },
    { key: 'high_penalties', label: 'High Penalties' },
    { key: 'auto_renewal', label: 'Auto Renewal' },
    { key: 'non_compete', label: 'Non-Compete' },
    { key: 'arbitration', label: 'Arbitration' },
    { key: 'confidentiality', label: 'Perpetual Confidentiality' },
    { key: 'missing_signature', label: 'Missing Signatures' },
    { key: 'missing_termination', label: 'Missing Termination' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>AI Legal Risk & Exposure Audit</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {doc?.filename || 'Select Contract'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Select Contract:</span>
          <select
            value={doc?.id}
            onChange={(e) => {
              const found = documents.find(d => d.id === e.target.value);
              if (found) onSelectDoc(found);
            }}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.filename}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Risk Score Gauge & Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Score Gauge Card */}
        <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Contract Risk Score</div>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Meter Circular Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-800" fill="transparent" />
              <circle
                cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8"
                strokeDasharray={`${2.51 * (doc?.risk_score || 0)} 251`}
                strokeLinecap="round"
                className={`${riskInfo.text} transition-all duration-1000`}
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{doc?.risk_score || 0}</span>
              <span className="text-[10px] text-slate-400 font-mono">OUT OF 100</span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${riskInfo.border} ${riskInfo.text} bg-slate-50 dark:bg-navy-900`}>
            {riskInfo.label}
          </div>
        </div>

        {/* Risk Category Scan Status */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Automated 8-Point Risk Scan Matrix</span>
            <span className="text-xs text-slate-400 font-normal">{risks.length} Risk Flag(s) Identified</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {riskCategories.map((cat) => {
              const matched = risks.some(r => r.category === cat.key);
              return (
                <div
                  key={cat.key}
                  className={`p-3 rounded-2xl border text-xs font-semibold space-y-1 ${
                    matched
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{cat.label}</span>
                    {matched ? <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="text-[10px] font-mono opacity-80">
                    {matched ? 'FLAGGED' : 'CLEAR'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Flagged Risks Details */}
      <div className="glass-card p-6 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800">
        
        {/* Severity Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Identified Risk Findings & Mitigation Advice
          </h2>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400">Severity Filter:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {(['all', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    filterSeverity === sev
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Items */}
        <div className="space-y-4">
          {filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/50 border border-slate-200/60 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className={`w-5 h-5 ${risk.severity === 'high' ? 'text-rose-500' : 'text-amber-500'}`} />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{risk.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    risk.severity === 'high' ? 'bg-rose-500/15 text-rose-600' : 'bg-amber-500/15 text-amber-600'
                  }`}>
                    {risk.severity.toUpperCase()} SEVERITY
                  </span>
                  {risk.page_number && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      Page {risk.page_number}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {risk.description}
              </p>

              {risk.clause_ref && (
                <div className="text-xs font-mono text-brand-600 dark:text-brand-400">
                  Target Location: {risk.clause_ref}
                </div>
              )}

              {/* Recommendation Box */}
              <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-1">
                <div className="font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Legal Mitigation Recommendation:
                </div>
                <p className="text-slate-700 dark:text-slate-300">{risk.recommendation}</p>
              </div>

            </div>
          ))}

          {filteredRisks.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No risk findings match the selected filter severity.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
