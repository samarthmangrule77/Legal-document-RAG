import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  Layers, 
  ExternalLink, 
  Filter, 
  Calendar, 
  ShieldAlert, 
  Building2, 
  UserCheck, 
  Tag, 
  Check,
  Zap
} from 'lucide-react';
import { LegalDocument, DocumentChunk } from '../types';

interface SemanticSearchViewProps {
  documents: LegalDocument[];
  initialQuery?: string;
  onSelectDoc: (doc: LegalDocument) => void;
  setActiveTab: (tab: any) => void;
}

export const SemanticSearchView: React.FC<SemanticSearchViewProps> = ({
  documents,
  initialQuery = '',
  onSelectDoc,
  setActiveTab
}) => {
  const [query, setQuery] = useState(initialQuery || 'What does this contract say about resignation?');
  const [results, setResults] = useState<DocumentChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Multi-Facet Filters State
  const [filterDate, setFilterDate] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterDocType, setFilterDocType] = useState('all');
  const [filterClause, setFilterClause] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterTag, setFilterTag] = useState('all');

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      const mockChunks: DocumentChunk[] = [
        {
          id: 'c-1',
          doc_id: 'doc-001',
          org_id: 'org-nexus',
          team_id: 'team-legal',
          page_number: 9,
          clause_number: 'Clause 10.1 (Termination Procedures)',
          content: 'Either party may terminate this Agreement without cause upon giving thirty (30) calendar days advance written notice to the non-terminating party.',
          similarity_score: 0.94
        },
        {
          id: 'c-2',
          doc_id: 'doc-001',
          org_id: 'org-nexus',
          team_id: 'team-legal',
          page_number: 7,
          clause_number: 'Clause 8.2 (Restrictive Covenants)',
          content: 'Resignation does not relieve Employee of non-compete and non-solicitation obligations for a period of 24 months post-termination.',
          similarity_score: 0.88
        },
        {
          id: 'c-3',
          doc_id: 'doc-002',
          org_id: 'org-nexus',
          team_id: 'team-finance',
          page_number: 14,
          clause_number: 'Clause 15.2 (Key Personnel Departure)',
          content: 'In the event of early resignation or departure of key personnel, tenant shall notify landlord within 10 business days.',
          similarity_score: 0.76
        }
      ];
      setResults(mockChunks);
      setIsSearching(false);
    }, 300);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Search Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Dense Vector Semantic Search & Faceted Filtering</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Natural Language Legal Clause Finder
          </h1>
          <p className="text-xs text-slate-500">
            Search 384-dimensional FAISS vector embeddings across all contract clauses with multi-faceted metadata filters.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Type a legal concept (e.g. 'resignation notice requirements' or 'indemnification liability cap')..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
          </div>

          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 transition-all whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Vectors</span>
          </button>
        </div>

        {/* Multi-Facet Filter Bar Grid (Date | Risk | Doc Type | Clause | Dept | Author | Tags) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-brand-500" />
            <span>Multi-Facet Metadata Filters:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            
            {/* 1. Date Range Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">📅 Date Range</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="2026">2026 Year</option>
              </select>
            </div>

            {/* 2. Risk Level Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">🔴 Risk Level</label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">🔴 Critical</option>
                <option value="medium">🟠 Medium</option>
                <option value="low">🟢 Low Risk</option>
              </select>
            </div>

            {/* 3. Document Type Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">📄 Doc Type</label>
              <select
                value={filterDocType}
                onChange={(e) => setFilterDocType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Doc Types</option>
                <option value="employment">Employment</option>
                <option value="nda">NDA</option>
                <option value="saas">SaaS MSA</option>
                <option value="lease">Lease</option>
              </select>
            </div>

            {/* 4. Clause Category Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">📍 Clause Category</label>
              <select
                value={filterClause}
                onChange={(e) => setFilterClause(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Clauses</option>
                <option value="indemnification">Indemnification</option>
                <option value="termination">Termination</option>
                <option value="noncompete">Non-Compete</option>
                <option value="confidentiality">Confidentiality</option>
              </select>
            </div>

            {/* 5. Department Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">🏢 Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Teams</option>
                <option value="legal">Legal Team</option>
                <option value="finance">Finance</option>
                <option value="hr">HR</option>
              </select>
            </div>

            {/* 6. Author Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">👤 Author</label>
              <select
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Authors</option>
                <option value="samarth">Samarth Mangrule</option>
                <option value="alex">Alex Rivera</option>
              </select>
            </div>

            {/* 7. Tags Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">🏷️ Custom Tags</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Tags</option>
                <option value="highvalue">High-Value</option>
                <option value="vendor">Vendor</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
          <span>Vector Search Results ({results.length})</span>
          <span className="text-xs text-slate-400 font-mono">384-Dim Cosine Distance Match</span>
        </h2>

        <div className="space-y-4">
          {results.map((chunk) => {
            const parentDoc = documents.find(d => d.id === chunk.doc_id) || documents[0];
            return (
              <div
                key={chunk.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-3 hover:border-brand-500/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400">
                    <FileText className="w-4 h-4" />
                    <span>{parentDoc?.filename || 'Document'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-black border border-emerald-500/30">
                      {Math.round((chunk.similarity_score || 0.92) * 100)}% Match
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[11px] font-mono font-bold border border-brand-500/20">
                      Page {chunk.page_number} ({chunk.clause_number})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  "{chunk.content}"
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      if (parentDoc) onSelectDoc(parentDoc);
                      setActiveTab('chat');
                    }}
                    className="text-xs font-extrabold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Ask RAG Assistant about this clause →</span>
                  </button>
                </div>
              </div>
            );
          })}

          {results.length === 0 && !isSearching && (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Zap className="w-8 h-8 text-brand-500 mx-auto opacity-80" />
              <div className="font-bold text-slate-600 dark:text-slate-300">Execute Vector Search Above</div>
              <div>Type a query and click 'Search Vectors' to filter across all indexed contract clauses.</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
