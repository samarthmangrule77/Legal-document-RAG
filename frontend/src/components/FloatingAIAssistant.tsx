import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
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
    setQuickAnswer(`The standard notice period is 30 days written notice. Open the full chat for detailed citations.`);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      
      {isOpen ? (
        <div className="w-80 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-white/[0.08] space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2.5">
            <span className="font-medium text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              Quick Question
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {quickAnswer ? (
            <div className="space-y-2.5 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 leading-relaxed">
                {quickAnswer}
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullChat();
                }}
                className="w-full py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Full Chat</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAskQuick} className="space-y-2.5">
              <p className="text-xs text-slate-500">
                Search across {documents.length} documents:
              </p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. What is the notice period?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full py-2 pl-3 pr-9 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 p-0.5 text-brand-600 dark:text-brand-400"
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
          className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center justify-center transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      )}

    </div>
  );
};
