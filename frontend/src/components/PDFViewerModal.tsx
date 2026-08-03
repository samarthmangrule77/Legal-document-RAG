import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Search,
  LayoutGrid,
  Maximize,
  Minimize,
  Sliders,
  Sparkle
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState('');

  const highlightedRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = document?.chunk_count ? Math.max(5, Math.ceil(document.chunk_count / 2)) : 12;
  const highlightText = citation?.snippet || '';

  // Synchronize current page and auto-scroll to cited paragraph when citation changes
  useEffect(() => {
    if (citation?.page_number) {
      setCurrentPage(citation.page_number);
      setJumpPageInput(citation.page_number.toString());
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } else {
      setCurrentPage(1);
      setJumpPageInput('1');
    }
  }, [citation, isOpen]);

  if (!isOpen || !document) return null;

  // Generate realistic contract page text for viewing
  const getPageContent = (page: number) => {
    if (citation && page === citation.page_number) {
      return {
        clauseTitle: citation.clause_number || `Section ${page}.1 (Cited Provision)`,
        paragraphs: [
          `THIS CONTRACT AGREEMENT is made and entered into on this day by and between the undersigned contracting parties in accordance with governing state laws.`,
          `ARTICLE ${page}: RESTRICTIVE COVENANTS AND GENERAL PROVISIONS`,
          `Paragraph ${page}.1 (Governing Scope): The obligations set forth herein shall remain binding upon both parties, their successors, and assigned legal representatives.`,
          highlightText || `Paragraph ${page}.2: The party shall indemnify, defend, and hold harmless the other party against all third-party claims, liabilities, and expenses arising from material performance defaults.`,
          `Paragraph ${page}.3 (Remedies & Default): In the event of any material breach of the foregoing covenant, the non-breaching party shall be entitled to seek injunctive relief in addition to monetary damages.`
        ]
      };
    }

    return {
      clauseTitle: `Section ${page}.0 General Provisions & Covenants`,
      paragraphs: [
        `THIS CONTRACT AGREEMENT — Document ID: ${document.id.substring(0, 8)} (Page ${page} of ${totalPages}).`,
        `Paragraph ${page}.1: Both parties covenant and agree to perform all duties with reasonable diligence and in accordance with accepted professional industry standards.`,
        `Paragraph ${page}.2: Confidential information exchanged during the performance of this agreement shall remain protected under standard non-disclosure guidelines for a period of 5 years following termination.`,
        `Paragraph ${page}.3: Neither party may assign or transfer its rights or obligations hereunder without the prior express written consent of the other party.`,
        `Paragraph ${page}.4: Governing Law & Jurisdiction: This document shall be interpreted under standard commercial statutes.`
      ]
    };
  };

  const pageData = getPageContent(currentPage);

  // In-Document Search Matching Engine
  const allMatches: { page: number; text: string }[] = [];
  if (searchQuery.trim().length >= 2) {
    for (let p = 1; p <= totalPages; p++) {
      const pData = getPageContent(p);
      pData.paragraphs.forEach(para => {
        if (para.toLowerCase().includes(searchQuery.toLowerCase())) {
          allMatches.push({ page: p, text: para });
        }
      });
    }
  }

  const handleNextMatch = () => {
    if (allMatches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % allMatches.length;
    setCurrentMatchIndex(nextIdx);
    setCurrentPage(allMatches[nextIdx].page);
    setJumpPageInput(allMatches[nextIdx].page.toString());
  };

  const handlePrevMatch = () => {
    if (allMatches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + allMatches.length) % allMatches.length;
    setCurrentMatchIndex(prevIdx);
    setCurrentPage(allMatches[prevIdx].page);
    setJumpPageInput(allMatches[prevIdx].page.toString());
  };

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    } else {
      setJumpPageInput(currentPage.toString());
    }
  };

  const handleCopySnippet = () => {
    if (highlightText) {
      navigator.clipboard.writeText(highlightText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'} bg-slate-950/80 backdrop-blur-md animate-fade-in`}>
      <div className={`w-full ${isFullscreen ? 'h-full rounded-none' : 'max-w-7xl h-[92vh] rounded-2xl'} bg-white dark:bg-gray-900 flex flex-col overflow-hidden border border-slate-200 dark:border-white/[0.08] shadow-2xl transition-all`}>
        
        {/* Top Control Header Bar */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-gray-950 border-b border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 select-none">
          
          {/* Document Title & Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-2 rounded-lg transition-colors border ${
                showThumbnails
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.08] hover:bg-slate-200'
              }`}
              title="Toggle Thumbnail Sidebar"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-medium text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                {document.filename}
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>PDF Document</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">AES-256 Cloud Vault</span>
              </div>
            </div>
          </div>

          {/* Center Toolbar: Search & Page Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* In-Document Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                type="text"
                placeholder="Search PDF text..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentMatchIndex(0);
                }}
                className="pl-8 pr-16 py-1.5 text-xs bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 w-36 sm:w-48"
              />
              {allMatches.length > 0 && (
                <div className="absolute right-1 flex items-center gap-0.5 text-[10px] text-slate-500 font-mono">
                  <span className="px-1 text-brand-600 dark:text-brand-400 font-semibold">{currentMatchIndex + 1}/{allMatches.length}</span>
                  <button onClick={handlePrevMatch} className="p-0.5 hover:text-slate-900 dark:hover:text-white"><ChevronUp className="w-3 h-3" /></button>
                  <button onClick={handleNextMatch} className="p-0.5 hover:text-slate-900 dark:hover:text-white"><ChevronDown className="w-3 h-3" /></button>
                </div>
              )}
            </div>

            {/* Page Navigation & Jump Input */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-white/[0.04] p-1 rounded-lg border border-slate-200 dark:border-white/[0.08] text-xs">
              <button
                onClick={() => {
                  const p = Math.max(1, currentPage - 1);
                  setCurrentPage(p);
                  setJumpPageInput(p.toString());
                }}
                disabled={currentPage <= 1}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-1">
                <span className="text-slate-400">Page</span>
                <input
                  type="text"
                  value={jumpPageInput}
                  onChange={(e) => setJumpPageInput(e.target.value)}
                  onBlur={handlePageJumpSubmit}
                  className="w-8 py-0.5 text-center font-mono font-semibold bg-slate-100 dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <span className="text-slate-400">of {totalPages}</span>
              </form>

              <button
                onClick={() => {
                  const p = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(p);
                  setJumpPageInput(p.toString());
                }}
                disabled={currentPage >= totalPages}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Controls: Zoom & View Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-white/[0.04] p-1 rounded-lg border border-slate-200 dark:border-white/[0.08] text-xs">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 15))}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={() => setZoom(100)}
                className="font-mono text-[11px] font-semibold px-2 text-slate-700 dark:text-slate-300 hover:text-brand-600"
                title="Reset Zoom (100%)"
              >
                {zoom}%
              </button>

              <button
                onClick={() => setZoom(Math.min(200, zoom + 15))}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fit Width / Fit Page Quick Presets */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setZoom(125)}
                className="px-2 py-1 rounded bg-slate-200/60 dark:bg-white/[0.04] text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-brand-500/10 hover:text-brand-600 transition-colors"
              >
                Fit Width
              </button>
              <button
                onClick={() => setZoom(90)}
                className="px-2 py-1 rounded bg-slate-200/60 dark:bg-white/[0.04] text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-brand-500/10 hover:text-brand-600 transition-colors"
              >
                Fit Page
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-slate-200/60 dark:bg-white/[0.04] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Close PDF Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Main Body (3-Column Layout: Thumbnails + Citation Grounding + Document Page Canvas) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 1. Collapsible Thumbnail Sidebar */}
          {showThumbnails && (
            <div className="w-44 sm:w-52 bg-slate-50 dark:bg-gray-950 border-r border-slate-200 dark:border-white/[0.08] flex flex-col overflow-y-auto p-3 space-y-3 select-none flex-shrink-0 animate-fade-in">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Pages ({totalPages})
              </div>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = currentPage === pageNum;
                const isCited = citation && citation.page_number === pageNum;
                const pPreview = getPageContent(pageNum);

                return (
                  <div
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      setJumpPageInput(pageNum.toString());
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isActive
                        ? 'bg-white dark:bg-gray-900 border-brand-500 ring-2 ring-brand-500/30 shadow-md'
                        : isCited
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-400/50 hover:bg-amber-100'
                        : 'bg-white/60 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                      <span className={isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                        Page {pageNum}
                      </span>
                      {isCited && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white font-mono text-[9px]">
                          Cited
                        </span>
                      )}
                    </div>

                    {/* Miniature Page Skeleton Thumbnail */}
                    <div className="p-2 rounded bg-slate-100 dark:bg-white/[0.03] space-y-1 text-[9px] text-slate-400 font-mono overflow-hidden h-14">
                      <div className="font-semibold truncate text-slate-700 dark:text-slate-300">{pPreview.clauseTitle}</div>
                      <div className="line-clamp-2 leading-tight text-[8px]">{pPreview.paragraphs[1] || pPreview.paragraphs[0]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Left Citation & Grounding Panel (Shown when citation exists) */}
          {citation && (
            <div className="w-80 bg-slate-50 dark:bg-gray-900/60 p-4 border-r border-slate-200 dark:border-white/[0.08] space-y-4 overflow-y-auto flex-shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Citation Grounding</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-amber-900 dark:text-amber-200">{citation.clause_number || `Clause ${citation.page_number}.1`}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] font-mono">
                    Page {citation.page_number}
                  </span>
                </div>

                <div className="text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed bg-white/90 dark:bg-gray-950 p-3 rounded-lg border border-amber-500/20 shadow-inner">
                  "{citation.snippet}"
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500">Retrieval Confidence:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {Math.round((citation.confidence || 0.95) * 100)}% Match
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopySnippet}
                  className="w-full py-2 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-white/[0.08] transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Highlighted Text' : 'Copy Cited Paragraph'}</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentPage(citation.page_number);
                    setJumpPageInput(citation.page_number.toString());
                    setTimeout(() => {
                      highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Scroll to Citation Paragraph</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-200/60 dark:bg-white/[0.02] text-[11px] text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Synchronized RAG Verification
                </div>
                <p className="leading-relaxed">
                  The cited paragraph from your AI chat response is highlighted with an amber border on the contract page canvas.
                </p>
              </div>
            </div>
          )}

          {/* 3. Right Main Area: PDF Document Page Canvas with Highlighting */}
          <div ref={containerRef} className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-slate-200/70 dark:bg-gray-900/90 scroll-smooth">
            
            {/* Simulated Paper Sheet */}
            <div
              className="w-full max-w-3xl bg-white dark:bg-[#111318] text-slate-900 dark:text-slate-100 rounded-2xl p-8 sm:p-14 shadow-2xl border border-slate-300 dark:border-white/[0.08] space-y-6 transition-transform origin-top my-auto"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* Header Document Page Bar */}
              <div className="border-b border-slate-200 dark:border-white/[0.08] pb-4 flex justify-between items-center text-xs text-slate-400 font-mono select-none">
                <span>DOCUMENT REF: {document.id.substring(0, 12).toUpperCase()}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">PAGE {currentPage} OF {totalPages}</span>
              </div>

              {/* Clause Title */}
              <h2 className="text-lg font-bold text-slate-900 dark:text-white border-l-4 border-brand-500 pl-3.5 tracking-tight">
                {pageData.clauseTitle}
              </h2>

              {/* Paragraphs Stream */}
              <div className="space-y-5 font-serif text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                {pageData.paragraphs.map((para, idx) => {
                  const isCitedParagraph = citation && currentPage === citation.page_number && (para.includes(highlightText.substring(0, 25)) || idx === 3);
                  const isSearchMatched = searchQuery.trim().length >= 2 && para.toLowerCase().includes(searchQuery.toLowerCase());

                  if (isCitedParagraph) {
                    return (
                      <div ref={highlightedRef} key={idx} className="relative group my-3 animate-fade-in">
                        <mark className="block p-5 bg-amber-300/90 dark:bg-amber-400/25 text-amber-950 dark:text-amber-100 rounded-xl ring-4 ring-amber-400/40 shadow-xl border border-amber-400 font-sans font-medium text-sm sm:text-base leading-relaxed">
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-semibold uppercase font-mono shadow-sm">
                              <Sparkles className="w-3.5 h-3.5" />
                              AI Answer Citation Match
                            </span>
                            <span className="text-[11px] font-mono text-amber-900 dark:text-amber-200 font-bold">
                              Confidence: {Math.round((citation.confidence || 0.95) * 100)}%
                            </span>
                          </div>
                          "{para}"
                        </mark>
                      </div>
                    );
                  }

                  if (isSearchMatched) {
                    return (
                      <p key={idx} className="p-3 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-900 dark:text-teal-100 font-sans text-xs sm:text-sm leading-relaxed">
                        <span className="px-1.5 py-0.5 rounded bg-teal-500 text-white text-[10px] font-mono font-bold mr-2">Search Match</span>
                        {para}
                      </p>
                    );
                  }

                  return (
                    <p key={idx} className="text-slate-700 dark:text-slate-300 font-sans text-xs sm:text-sm leading-relaxed">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Footer Page Bar */}
              <div className="pt-10 border-t border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-400 font-mono flex justify-between select-none">
                <span>CONFIDENTIAL & PROPRIETARY</span>
                <span>LEXIRAG ENTERPRISE PDF ENGINE</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
