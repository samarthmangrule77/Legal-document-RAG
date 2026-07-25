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
  Calendar
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

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-navy-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI RAG Engine Ready & Operational</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Legal Document Intelligence & RAG Workspace
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Upload contracts, analyze clauses, detect high-risk commitments, and get instant grounded answers backed by precise page & clause citations.
          </p>
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('documents')}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Upload New Contract</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Questions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Processed Contracts</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {documents.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Extracted & Indexed</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Vector Chunks</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalChunks}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Stored in FAISS Vector DB
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Risk Score</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{avgRisk} / 100</span>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
              avgRisk >= 60 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              {avgRisk >= 60 ? 'High' : 'Moderate'}
            </span>
          </div>
          <div className="text-xs text-rose-500 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{highRiskCount} Contract(s) Need Review</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Storage & Vault</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            8.3 MB
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            256-Bit Encrypted Storage
          </div>
        </div>

      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Documents List (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              <span>Active Uploaded Contracts</span>
            </h2>
            <button
              onClick={() => setActiveTab('documents')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  setActiveTab('summary');
                }}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/50 hover:bg-slate-100 dark:hover:bg-navy-900 border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs uppercase">
                    {doc.file_type}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {doc.filename}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{doc.file_size}</span>
                      <span>•</span>
                      <span>{doc.chunk_count} chunks</span>
                      <span>•</span>
                      <span>Uploaded {doc.upload_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    doc.risk_score >= 60
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      : doc.risk_score >= 35
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  }`}>
                    Risk: {doc.risk_score}/100
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launchers & Recent Conversations (1 col) */}
        <div className="space-y-6">
          
          {/* Quick Workflows */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              AI Tools & Workflows
            </h2>
            <div className="grid grid-cols-2 gap-3">
              
              <button
                onClick={() => setActiveTab('summary')}
                className="p-3.5 rounded-2xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-left space-y-1.5 transition-all group"
              >
                <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Contract Summary</div>
                <div className="text-[10px] text-slate-500">Executive breakdown</div>
              </button>

              <button
                onClick={() => setActiveTab('risks')}
                className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-left space-y-1.5 transition-all group"
              >
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Risk Audit</div>
                <div className="text-[10px] text-slate-500">Clause scanner</div>
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className="p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-left space-y-1.5 transition-all group"
              >
                <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Compare Docs</div>
                <div className="text-[10px] text-slate-500">Side-by-side diff</div>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-left space-y-1.5 transition-all group"
              >
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Timeline</div>
                <div className="text-[10px] text-slate-500">Deadlines & dates</div>
              </button>

            </div>
          </div>

          {/* Recent Conversations */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>Recent AI Chats</span>
            </h2>

            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveTab('chat')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900/50 hover:bg-slate-100 dark:hover:bg-navy-900 cursor-pointer border border-slate-200/50 dark:border-slate-800/80 transition-all space-y-1"
                >
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {conv.title}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {conv.messages.length} messages • {conv.updated_at}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
