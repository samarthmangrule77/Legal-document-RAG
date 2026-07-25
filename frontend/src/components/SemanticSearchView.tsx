import React, { useState } from 'react';
import { Search, Sparkles, FileText, Layers, ExternalLink } from 'lucide-react';
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
          clause_number: 'Clause 10.1',
          content: 'Either party may terminate this Agreement without cause upon giving thirty (30) calendar days advance written notice to the non-terminating party.',
          similarity_score: 0.94
        },
        {
          id: 'c-2',
          doc_id: 'doc-001',
          org_id: 'org-nexus',
          team_id: 'team-legal',
          page_number: 7,
          clause_number: 'Clause 8.2',
          content: 'Resignation does not relieve Employee of non-compete and non-solicitation obligations for a period of 24 months post-termination.',
          similarity_score: 0.88
        },
        {
          id: 'c-3',
          doc_id: 'doc-002',
          org_id: 'org-nexus',
          team_id: 'team-finance',
          page_number: 14,
          clause_number: 'Clause 15.2',
          content: 'In the event of early resignation or departure of key personnel, tenant shall notify landlord within 10 business days.',
          similarity_score: 0.76
        }
      ];
      setResults(mockChunks);
      setIsSearching(false);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Search Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Dense Vector Semantic Search</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Natural Language Clause Finder
          </h1>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Type a sentence or legal question (e.g. 'resignation notice requirements')..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-100 dark:bg-navy-900/90 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
          </div>

          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md transition-all whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Vectors</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-200/80 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Relevant Contract Chunks ({results.length})</span>
          <span className="text-xs text-slate-400 font-mono">Ranked by Cosine Similarity</span>
        </h2>

        <div className="space-y-3">
          {results.map((chunk) => {
            const parentDoc = documents.find(d => d.id === chunk.doc_id);
            return (
              <div
                key={chunk.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/50 border border-slate-200/60 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{parentDoc?.filename || 'Document'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                      {Math.round((chunk.similarity_score || 0) * 100)}% Match
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                      Page {chunk.page_number} ({chunk.clause_number})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed bg-white dark:bg-navy-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                  "{chunk.content}"
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      if (parentDoc) onSelectDoc(parentDoc);
                      setActiveTab('chat');
                    }}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Ask RAG about this clause</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {results.length === 0 && !isSearching && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Click 'Search Vectors' to execute semantic retrieval across all indexed documents.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
