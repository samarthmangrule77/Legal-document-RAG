import React, { useState } from 'react';
import { 
  GitFork, 
  Building2, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Info,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { LegalDocument } from '../types';

interface ClauseGraphViewProps {
  selectedDoc: LegalDocument | null;
  documents: LegalDocument[];
  onSelectDoc: (doc: LegalDocument) => void;
}

interface GraphNode {
  id: string;
  label: string;
  category: string;
  description: string;
  clause_ref: string;
  page_number: number;
  risk_level: 'critical' | 'medium' | 'low';
}

const NODES_DATA: GraphNode[] = [
  {
    id: 'employer',
    label: 'Employer / Company',
    category: 'Root Legal Entity',
    description: 'Party A: Employer providing compensation, operational terms, and legal governance.',
    clause_ref: 'Header & Preamble',
    page_number: 1,
    risk_level: 'low'
  },
  {
    id: 'salary',
    label: 'Salary & Compensation',
    category: 'Financial Obligation',
    description: '$185,000 USD base salary per annum paid bi-weekly + 15% performance bonus.',
    clause_ref: 'Clause 2.1 (Compensation)',
    page_number: 2,
    risk_level: 'low'
  },
  {
    id: 'notice',
    label: 'Notice Period',
    category: 'Operational Requirement',
    description: '30 calendar days advance written notice required for voluntary resignation or termination.',
    clause_ref: 'Clause 10.1 (Notice Window)',
    page_number: 9,
    risk_level: 'medium'
  },
  {
    id: 'termination',
    label: 'Termination & Cause',
    category: 'Termination Remedy',
    description: 'Immediate termination permitted for gross misconduct, material breach, or willful neglect.',
    clause_ref: 'Clause 10.2 (Termination)',
    page_number: 9,
    risk_level: 'medium'
  },
  {
    id: 'confidentiality',
    label: 'Confidentiality & IP',
    category: 'Proprietary Protection',
    description: 'Strict perpetual non-disclosure of software source code, algorithms, and trade secrets.',
    clause_ref: 'Clause 11.1 (Confidentiality)',
    page_number: 10,
    risk_level: 'low'
  },
  {
    id: 'noncompete',
    label: 'Non-Compete Covenants',
    category: 'Restrictive Risk',
    description: '🔴 24-month post-employment worldwide non-compete restriction (Critical Risk).',
    clause_ref: 'Clause 8.2 (Restrictive Covenants)',
    page_number: 7,
    risk_level: 'critical'
  }
];

export const ClauseGraphView: React.FC<ClauseGraphViewProps> = ({
  selectedDoc,
  documents,
  onSelectDoc
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode>(NODES_DATA[0]);
  const doc = selectedDoc || documents[0];

  const getNodeBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return { label: '🔴 CRITICAL RISK', bg: 'bg-rose-500/15 text-rose-600 border-rose-500/30' };
      case 'medium':
        return { label: '🟠 MEDIUM RISK', bg: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
      default:
        return { label: '🟢 LOW RISK', bg: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };
    }
  };

  const getNodeIcon = (id: string) => {
    switch (id) {
      case 'employer': return <Building2 className="w-5 h-5 text-brand-500" />;
      case 'salary': return <DollarSign className="w-5 h-5 text-emerald-500" />;
      case 'notice': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'termination': return <AlertTriangle className="w-5 h-5 text-indigo-500" />;
      case 'confidentiality': return <ShieldCheck className="w-5 h-5 text-cyan-500" />;
      case 'noncompete': return <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />;
      default: return <GitFork className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 p-8 border border-slate-800 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 mb-3">
              <GitFork className="w-3.5 h-3.5" />
              Interactive Legal Knowledge Graph
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Interactive Clause Knowledge Graph</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              Visualize how legal entities and contractual obligations flow between provisions. Click on any node to inspect clause dependencies and risk severity.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur border border-slate-700/80 p-3 rounded-2xl">
            <span className="text-xs text-slate-400 font-semibold">Contract Document:</span>
            <select
              value={doc?.id}
              onChange={(e) => {
                const found = documents.find(d => d.id === e.target.value);
                if (found) onSelectDoc(found);
              }}
              className="px-3 py-2 text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visual Graph Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Node Map (7 cols) */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <GitFork className="w-5 h-5 text-brand-500" />
                <span>Contract Dependency Chain</span>
              </h2>
              <p className="text-xs text-slate-500">Interactive node graph showing clause relationships.</p>
            </div>

            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
              6 Connected Clauses
            </span>
          </div>

          {/* Interactive Visual Chain Nodes */}
          <div className="space-y-4">
            {NODES_DATA.map((node, index) => {
              const isSelected = selectedNode.id === node.id;
              const badge = getNodeBadge(node.risk_level);

              return (
                <div key={node.id} className="relative">
                  
                  {/* Connected Directional Arrow Down */}
                  {index > 0 && (
                    <div className="flex justify-center -my-2">
                      <div className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1 z-10">
                        <span>↓</span>
                        <span>Triggers & Governs</span>
                      </div>
                    </div>
                  )}

                  {/* Node Button Card */}
                  <button
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-xl shadow-brand-500/10 scale-102 z-20'
                        : 'bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {getNodeIcon(node.id)}
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{node.category}</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                          {node.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-brand-500 translate-x-1' : 'text-slate-400'}`} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Selected Node Inspection Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20">
                  {getNodeIcon(selectedNode.id)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedNode.label}</h3>
                  <span className="text-xs text-slate-400">{selectedNode.category}</span>
                </div>
              </div>
            </div>

            {/* Risk Badge */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Risk Level Audit:</div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-black border ${getNodeBadge(selectedNode.risk_level).bg}`}>
                  {getNodeBadge(selectedNode.risk_level).label}
                </span>
                <span className="text-xs font-mono text-slate-500">Page {selectedNode.page_number}</span>
              </div>
            </div>

            {/* Clause Detail Description */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Extracted Provision Details:</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                {selectedNode.description}
              </p>
            </div>

            {/* Page & Clause Reference Tag */}
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-1">
              <div className="font-extrabold text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Location in Contract:</span>
              </div>
              <div className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                {selectedNode.clause_ref} (Page {selectedNode.page_number})
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
