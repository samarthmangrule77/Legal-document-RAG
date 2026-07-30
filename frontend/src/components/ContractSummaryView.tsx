import React from 'react';
import { 
  FileCheck2, 
  Users, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  ShieldCheck, 
  CheckSquare, 
  Clock, 
  Sparkles,
  FileText
} from 'lucide-react';
import { LegalDocument } from '../types';

interface ContractSummaryViewProps {
  selectedDoc: LegalDocument | null;
  documents: LegalDocument[];
  onSelectDoc: (doc: LegalDocument) => void;
}

export const ContractSummaryView: React.FC<ContractSummaryViewProps> = ({
  selectedDoc,
  documents,
  onSelectDoc
}) => {
  const doc = selectedDoc || documents[0];
  const summary = doc?.summary;

  if (!doc || !summary) {
    return (
      <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-xl space-y-3">
        <FileText className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No Document Selected</h3>
        <p className="text-xs text-slate-500">Please select an uploaded contract to generate an AI summary.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Automated Contract Synthesis</span>
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

      {/* Executive Summary Card */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-brand-900 via-indigo-950 to-navy-950 text-white shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-medium">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Executive Summary</span>
        </div>
        <p className="text-base text-slate-200 leading-relaxed font-normal">
          {summary.executive_summary}
        </p>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Parties Involved */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl space-y-3 border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-brand-600 dark:text-brand-400 font-medium text-sm">
            <Users className="w-4 h-4" />
            <span>Contracting Parties</span>
          </div>
          <div className="space-y-2">
            {summary.parties.map((p, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.04]/60 font-semibold text-xs text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-white/[0.06]">
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Effective & Expiry Dates */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl space-y-3 border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
            <Calendar className="w-4 h-4" />
            <span>Effective & Expiry Period</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.04]/60 border border-slate-200/50 dark:border-white/[0.06] space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Effective Date</div>
              <div className="font-medium text-slate-800 dark:text-slate-100">{summary.effective_date}</div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.04]/60 border border-slate-200/50 dark:border-white/[0.06] space-y-1">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Expiry / Term</div>
              <div className="font-medium text-slate-800 dark:text-slate-100">{summary.expiry_date}</div>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl space-y-3 border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
            <CreditCard className="w-4 h-4" />
            <span>Financial & Payment Terms</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.04]/60 border border-slate-200/50 dark:border-white/[0.06]">
            {summary.payment_terms}
          </p>
        </div>

        {/* Termination Conditions */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl space-y-3 border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-medium text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Termination Conditions</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.04]/60 border border-slate-200/50 dark:border-white/[0.06]">
            {summary.termination_conditions}
          </p>
        </div>

        {/* Key Obligations */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl space-y-3 border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-medium text-sm">
            <CheckSquare className="w-4 h-4" />
            <span>Key Party Obligations</span>
          </div>
          <ul className="space-y-2">
            {summary.key_obligations.map((ob, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                <span>{ob}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confidentiality & Security */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl space-y-3 border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-medium text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Confidentiality & NDA</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.04]/60 border border-slate-200/50 dark:border-white/[0.06]">
            {summary.confidentiality_terms}
          </p>
        </div>

      </div>

    </div>
  );
};
