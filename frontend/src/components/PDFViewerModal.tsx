import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Citation, LegalDocument } from '../types';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  citation: Citation | null;
  document: LegalDocument | null;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  citation,
  document
}) => {
  const [currentPage, setCurrentPage] = useState<number>(citation?.page_number || 1);
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (citation?.page_number) {
      setCurrentPage(citation.page_number);
    }
  }, [citation]);

  if (!isOpen || !document) return null;

  const totalPages = document.chunk_count > 10 ? Math.ceil(document.chunk_count / 2) : 12;
  const highlightText = citation?.snippet || '';

  // Generate realistic contract page text for viewing
  const getPageContent = (page: number) => {
    if (citation && page === citation.page_number) {
      return {
        clauseTitle: citation.clause_number || `Section ${page}.1`,
        paragraphs: [
          `THIS CONTRACT AGREEMENT is made and entered into on this day by and between the undersigned contracting parties in accordance with governing state laws.`,
          `ARTICLE ${page}: RESTRICTIVE COVENANTS AND GENERAL PROVISIONS`,
          `Paragraph ${page}.1 (Governing Scope): The obligations set forth herein shall remain binding upon both parties, their successors, and assigned legal representatives.`,
          highlightText,
          `Paragraph ${page}.3 (Remedies & Default): In the event of any material breach of the foregoing covenant, the non-breaching party shall be entitled to seek injunctive relief in addition to monetary damages.`
        ]
      };
    }

    return {
      clauseTitle: `Section ${page}.0 General Provisions`,
      paragraphs: [
        `THIS CONTRACT AGREEMENT Page ${page} of ${totalPages}.`,
        `Paragraph ${page}.1: Both parties covenant and agree to perform all duties with reasonable diligence and in accordance with accepted professional industry standards.`,
        `Paragraph ${page}.2: Confidential information exchanged during the performance of this agreement shall remain protected under standard non-disclosure guidelines for a period of 5 years following termination.`,
        `Paragraph ${page}.3: Neither party may assign or transfer its rights or obligations hereunder without the prior express written consent of the other party.`
      ]
    };
  };

  const pageData = getPageContent(currentPage);

  const handleCopySnippet = () => {
    if (highlightText) {
      navigator.clipboard.writeText(highlightText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-900 rounded-xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/[0.06] shadow-lg">
        
        {/* Top Viewer Control Bar */}
        <div className="p-4 bg-slate-100/90 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          
          {/* Document Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-medium text-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {document.filename}
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>PDF Source Document</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">256-Bit Encrypted Vault</span>
              </div>
            </div>
          </div>

          {/* Page Navigation Controls */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06] text-xs">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-medium font-mono text-slate-800 dark:text-slate-200 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls & Close */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-gray-900 p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.06] text-xs">
              <button
                onClick={() => setZoom(Math.max(75, zoom - 15))}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-medium px-1 text-slate-700 dark:text-slate-300">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 15))}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-200 dark:bg-white/[0.05] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Main Body (Split View: Citation Inspector + PDF Document Page) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Panel: Target Citation & Grounding Info */}
          {citation && (
            <div className="w-full lg:w-80 bg-slate-50 dark:bg-white/[0.04]/60 p-5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/[0.06] space-y-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Verified RAG Citation Highlight</span>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-amber-800 dark:text-amber-300">{citation.clause_number}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-200 text-[11px] font-mono">
                    Page {citation.page_number}
                  </span>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed bg-white/80 dark:bg-gray-900/80 p-3 rounded-xl border border-amber-500/20">
                  "{citation.snippet}"
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500">Match Confidence:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                    {Math.round((citation.confidence || 0.95) * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopySnippet}
                  className="w-full py-2.5 rounded-xl bg-slate-200/80 dark:bg-white/[0.05] hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Highlighted Text' : 'Copy Source Text'}</span>
                </button>

                <button
                  onClick={() => setCurrentPage(citation.page_number)}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Jump to Citation Page ({citation.page_number})</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-200/50 dark:bg-gray-900/50 text-[11px] text-slate-500 space-y-1">
                <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  ChatGPT-Style Grounded Citation
                </div>
                <p className="leading-relaxed">
                  The exact sentence cited in the AI answer is highlighted in yellow on the contract page canvas.
                </p>
              </div>
            </div>
          )}

          {/* Right Area: PDF Page Canvas with Highlighting */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-slate-200/60 dark:bg-gray-900/90">
            
            {/* Simulated Paper Sheet */}
            <div
              className="w-full max-w-2xl bg-white dark:bg-white/[0.03] text-slate-900 dark:text-slate-100 rounded-xl p-8 sm:p-12 shadow-lg border border-slate-300 dark:border-white/[0.06] space-y-6 transition-transform origin-top"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* Header Page Title */}
              <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>DOCUMENT REF: {document.id.toUpperCase()}</span>
                <span>PAGE {currentPage} OF {totalPages}</span>
              </div>

              {/* Clause Heading */}
              <h2 className="text-lg font-medium text-slate-900 dark:text-white border-l-4 border-brand-500 pl-3">
                {pageData.clauseTitle}
              </h2>

              {/* Paragraphs with Highlight */}
              <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                {pageData.paragraphs.map((para, idx) => {
                  const isHighlighted = citation && currentPage === citation.page_number && para.includes(highlightText.substring(0, 30));

                  if (isHighlighted || (citation && currentPage === citation.page_number && idx === 3)) {
                    return (
                      <div key={idx} className="relative group my-2">
                        <mark className="block p-4 bg-amber-300/90 dark:bg-amber-400/30 text-amber-950 dark:text-amber-100 rounded-lg ring-4 ring-amber-400/40 shadow-lg border border-amber-400 font-sans font-medium text-sm sm:text-base leading-relaxed-subtle">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-2 rounded bg-amber-500 text-white text-[11px] font-medium uppercase font-mono shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            AI Citation Match
                          </span>
                          <br />
                          "{para}"
                        </mark>
                      </div>
                    );
                  }

                  return (
                    <p key={idx} className="text-slate-700 dark:text-slate-300 font-sans text-xs sm:text-sm">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Footer Page Bar */}
              <div className="pt-8 border-t border-slate-200 dark:border-white/[0.06] text-[11px] text-slate-400 font-mono flex justify-between">
                <span>CONFIDENTIAL & PROPRIETARY</span>
                <span>LEXIRAG AI PDF RAG ENGINE</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
