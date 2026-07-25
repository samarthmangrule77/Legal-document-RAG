import React, { useState } from 'react';
import { Sparkles, MessageSquare, X, Send, BookOpen } from 'lucide-react';
import { LegalDocument } from '../types';

interface FloatingAIAssistantProps {
  documents: LegalDocument[];
  onOpenFullChat: () => void;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  documents,
  onOpenFullChat
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);

  const handleAskQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setQuickAnswer(`LexiRAG Assistant: Base notice period in standard contract is 30 days written notice. Click below to open full RAG chat with exact page citations.`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {isOpen ? (
        <div className="w-80 sm:w-96 glass-card bg-white dark:bg-navy-950 rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>LexiRAG Quick AI Helper</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {quickAnswer ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-brand-500/10 text-slate-800 dark:text-slate-200 leading-relaxed border border-brand-500/20">
                {quickAnswer}
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullChat();
                }}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Full RAG Interface</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAskQuick} className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ask a quick question across all {documents.length} indexed documents:
              </p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. What is the notice period?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full py-2.5 pl-3 pr-10 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-1 text-brand-600 dark:text-brand-400"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-xl shadow-brand-500/30 hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Floating AI Assistant</span>
        </button>
      )}

    </div>
  );
};
