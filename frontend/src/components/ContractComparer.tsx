import React, { useState } from 'react';
import { 
  GitCompare, 
  FileText, 
  CheckCircle2, 
  MinusCircle, 
  Edit3, 
  Sparkles, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { LegalDocument, ComparisonResult } from '../types';
import { api } from '../api/client';

interface ContractComparerProps {
  documents: LegalDocument[];
}

export const ContractComparer: React.FC<ContractComparerProps> = ({ documents }) => {
  const [doc1Id, setDoc1Id] = useState<string>(documents[0]?.id || 'doc-001');
  const [doc2Id, setDoc2Id] = useState<string>(documents[1]?.id || 'doc-003');
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const handleRunComparison = async () => {
    setIsComparing(true);
    const result = await api.compareContracts(doc1Id, doc2Id);
    setComparison(result);
    setIsComparing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
            <GitCompare className="w-4 h-4" />
            <span>AI Side-by-Side Contract Comparison Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Compare Two Legal Contracts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze additions, deletions, modified clauses, and key obligations between version drafts or vendor templates.
          </p>
        </div>

        {/* Contract Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Doc 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Base Contract (Document A)</label>
            <select
              value={doc1Id}
              onChange={(e) => setDoc1Id(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          </div>

          {/* Doc 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Comparison Draft (Document B)</label>
            <select
              value={doc2Id}
              onChange={(e) => setDoc2Id(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          </div>

        </div>

        <button
          onClick={handleRunComparison}
          disabled={isComparing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-brand-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-brand-500 transition-all flex items-center justify-center gap-2"
        >
          {isComparing ? (
            <span>Computing Semantic Vector Diff...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Contract Diff Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Results View */}
      {comparison && (
        <div className="space-y-6">
          
          {/* Similarity & Highlights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Similarity Score Card */}
            <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Clause Similarity Score</div>
              <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {comparison.similarity_percentage}%
              </div>
              <p className="text-xs text-slate-500">
                Overall semantic text alignment between both contracts.
              </p>
            </div>

            {/* Key Differences */}
            <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <MinusCircle className="w-4 h-4" />
                Key Differences Detected
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {comparison.key_differences.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Similarities */}
            <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Key Similarities Retained
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {comparison.key_similarities.map((sim, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                    <span>{sim}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Side-by-Side Clause Matrix */}
          <div className="glass-card p-6 rounded-3xl space-y-6 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Side-by-Side Clause Breakdown Matrix
            </h2>

            <div className="space-y-4">
              {comparison.clauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/50 border border-slate-200/60 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{clause.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                      clause.status === 'added' ? 'bg-emerald-500/15 text-emerald-600' :
                      clause.status === 'removed' ? 'bg-rose-500/15 text-rose-600' :
                      clause.status === 'modified' ? 'bg-amber-500/15 text-amber-600' : 'bg-brand-500/15 text-brand-600'
                    }`}>
                      {clause.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Side by side text */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400">DOCUMENT A (Base)</div>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                        {clause.doc1_text || 'N/A'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400">DOCUMENT B (Comparison)</div>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                        {clause.doc2_text || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Analysis: {clause.analysis}
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
