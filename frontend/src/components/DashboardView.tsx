import React from 'react';
import { 
  FileText, 
  MessageSquare, 
  ShieldAlert, 
  Layers, 
  Database, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  GitCompare,
  Calendar,
  AlertOctagon,
  HelpCircle,
  Zap,
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

  const mostAskedQuestions = [
    "What is the required notice period for termination?",
    "Does this agreement contain uncapped indemnification liability?",
    "What are the auto-renewal cancellation window deadlines?",
    "Who owns intellectual property created during employment?"
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-navy-950 p-8 text-white shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-bold border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Executive Command Center Operational</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Legal Intelligence & Risk Operations Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Monitor real-time legal risks, upcoming contract renewals, pending reviews, and prompt your contract vector store in plain English.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('generator')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <FileSignature className="w-4 h-4" />
              <span>Draft AI Contract ✨</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask RAG Assistant →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Smart Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Activity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Today's Activity</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            8 Actions
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3 Uploads • 5 RAG Queries</span>
          </div>
        </div>

        {/* Card 2: Pending Reviews */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Pending Legal Reviews</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            3 Contracts
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Awaiting Legal Sign-off
          </div>
        </div>

        {/* Card 3: Upcoming Renewals */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">Upcoming Renewals</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            2 Deadlines
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Within Next 90 Days
          </div>
        </div>

        {/* Card 4: High Risk Contracts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider">High Risk Contracts</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {highRiskCount} Flagged
          </div>
          <div className="text-xs text-rose-500 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Critical Red Flags Found</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid (8 cols & 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: High Risk & Recently Uploaded Contracts (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: High Risk Contracts Needing Attention */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-500" />
                  <span>High Risk Contracts Requiring Action</span>
                </h2>
                <p className="text-xs text-slate-500">Agreements containing uncapped liability or broad restrictive covenants.</p>
              </div>

              <button
                onClick={() => setActiveTab('risks')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-extrabold border border-rose-500/20 transition-all"
              >
                Full Risk Audit →
              </button>
            </div>

            <div className="space-y-3">
              {documents.filter(d => d.risk_score >= 60).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setActiveTab('risks');
                  }}
                  className="p-5 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🔴</span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                        {doc.filename}
                      </h3>
                      <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                        Flagged: Broad Indemnification & 24-Month Non-Compete
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black">
                      Risk Score: {doc.risk_score}/100
                    </span>
                    <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recently Uploaded Documents Table */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                <span>Recently Uploaded Contracts</span>
              </h2>

              <button
                onClick={() => setActiveTab('documents')}
                className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View All Contracts ({documents.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="pb-3 px-3">Contract Document</th>
                    <th className="pb-3 px-3">Upload Date</th>
                    <th className="pb-3 px-3">RAG Status</th>
                    <th className="pb-3 px-3">Risk Level</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-3 font-bold text-slate-900 dark:text-white">
                        {doc.filename}
                      </td>
                      <td className="py-4 px-3 text-slate-400 font-mono">
                        {doc.upload_date}
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                          Indexed ({doc.chunk_count} chunks)
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          doc.risk_score >= 60 ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                        }`}>
                          {doc.risk_score >= 60 ? '🔴 High Risk' : '🟢 Low Risk'}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setActiveTab('chat');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold text-xs transition-colors"
                        >
                          Ask RAG →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: AI Smart Suggestions & Most Asked Questions (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* AI Smart Proactive Suggestions Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-brand-500/5 to-transparent border-2 border-brand-500/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>AI Smart Proactive Suggestions</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>📅 Auto-Renewal Notice Window (60 Days)</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Commercial Lease Agreement auto-renews on April 1, 2027. Schedule non-renewal notice review.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🔴 Negotiate Indemnification Cap</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Employment Agreement Clause 12.1 lacks monetary cap. Request 12-month salary liability limit.
                </p>
              </div>
            </div>
          </div>

          {/* Most Asked Questions Chips */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-brand-500" />
              <span>Most Asked Questions</span>
            </div>

            <div className="space-y-2">
              {mostAskedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab('chat')}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-500/10 hover:border-brand-500/30 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between group"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
