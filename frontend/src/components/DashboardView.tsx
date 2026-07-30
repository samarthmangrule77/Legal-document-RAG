import React from 'react';
import { 
  FileText, 
  MessageSquare, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  FileSignature
} from 'lucide-react';
import { LegalDocument, Conversation } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  documents: LegalDocument[];
  conversations: Conversation[];
  setActiveTab: (tab: NavTab) => void;
  setSelectedDoc: (doc: LegalDocument) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  conversations,
  setActiveTab,
  setSelectedDoc
}) => {
  const totalChunks = documents.reduce((acc, doc) => acc + doc.chunk_count, 0);
  const avgRisk = Math.round(documents.reduce((acc, doc) => acc + doc.risk_score, 0) / (documents.length || 1));
  const highRiskCount = documents.filter(d => d.risk_score >= 60).length;

  const suggestedQuestions = [
    "What is the required notice period for termination?",
    "Does this agreement contain uncapped indemnification?",
    "What are the auto-renewal cancellation deadlines?",
    "Who owns IP created during employment?"
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {documents.length} documents indexed · {totalChunks} searchable chunks
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors flex items-center gap-2"
          >
            <FileSignature className="w-4 h-4" />
            <span>New Contract</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 font-medium text-sm border border-slate-200 dark:border-white/[0.08] transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask a Question</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Activity</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">8</div>
          <div className="text-xs text-slate-500">actions today</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">3</div>
          <div className="text-xs text-slate-500">contracts to review</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Renewals</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">2</div>
          <div className="text-xs text-slate-500">within 90 days</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-semibold text-red-600 dark:text-red-400">{highRiskCount}</div>
          <div className="text-xs text-slate-500">flagged contracts</div>
        </div>

      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Risk & Documents */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* High Risk Contracts */}
          {highRiskCount > 0 && (
            <div className="p-6 rounded-xl bg-white dark:bg-white/[0.03] border border-red-200 dark:border-red-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    High Risk Contracts
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Agreements with uncapped liability or broad restrictive covenants.</p>
                </div>
                <button
                  onClick={() => setActiveTab('risks')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2">
                {documents.filter(d => d.risk_score >= 60).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setActiveTab('risks');
                    }}
                    className="p-4 rounded-lg bg-red-50/50 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-100 dark:border-red-500/10 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          {doc.filename}
                        </h3>
                        <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                          Broad indemnification · Non-compete clause
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 text-xs font-medium">
                        {doc.risk_score}/100
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Documents */}
          <div className="p-6 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Recent Documents
              </h2>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                View all ({documents.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 font-medium uppercase tracking-wide">
                    <th className="pb-2.5 pr-3">Name</th>
                    <th className="pb-2.5 px-3">Date</th>
                    <th className="pb-2.5 px-3">Status</th>
                    <th className="pb-2.5 px-3">Risk</th>
                    <th className="pb-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-3 font-medium text-slate-800 dark:text-white text-sm">
                        {doc.filename}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-xs font-mono">
                        {doc.upload_date}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Indexed
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          doc.risk_score >= 60 
                            ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' 
                            : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                        }`}>
                          {doc.risk_score >= 60 ? 'High' : 'Low'}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setActiveTab('chat');
                          }}
                          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          Ask
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Deadlines */}
          <div className="p-5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Upcoming Deadlines
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] space-y-1">
                <div className="text-sm font-medium text-slate-800 dark:text-white">
                  Auto-renewal notice window
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Commercial Lease auto-renews April 1, 2027. Review non-renewal notice requirements.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] space-y-1">
                <div className="text-sm font-medium text-slate-800 dark:text-white">
                  Indemnification cap missing
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Employment Agreement Clause 12.1 lacks a monetary cap. Consider requesting a limit.
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Questions */}
          <div className="p-5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] space-y-3">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Suggested Questions
            </h3>

            <div className="space-y-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab('chat')}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] hover:bg-brand-50 dark:hover:bg-brand-500/5 border border-slate-100 dark:border-white/[0.04] text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between group"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 transition-colors flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
