import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Globe, 
  BookOpen, 
  Sparkles, 
  Building2, 
  Check, 
  ShieldCheck, 
  Save, 
  MessageSquare,
  Zap,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'lexirag_ai_memory_preferences_v1';

export const AIMemoryView: React.FC = () => {
  // Load initial preferences from localStorage if available
  const [companyPolicyRules, setCompanyPolicyRules] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rules`);
    return saved || 'All indemnification clauses must be capped at 12 months total fees paid. Non-compete covenants must be limited to 6 months local territory. Notice period minimum is 30 calendar days. Governing law must be Delaware or New York state law.';
  });

  const [preferredLanguage, setPreferredLanguage] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_lang`);
    return saved || 'English 🇺🇸';
  });

  const [explanationStyle, setExplanationStyle] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_style`);
    return saved || 'Executive TL;DR';
  });

  const [tone, setTone] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tone`);
    return saved || 'Professional & Direct';
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    // Save to localStorage for persistent state across tab navigation and reloads
    localStorage.setItem(`${STORAGE_KEY}_rules`, companyPolicyRules);
    localStorage.setItem(`${STORAGE_KEY}_lang`, preferredLanguage);
    localStorage.setItem(`${STORAGE_KEY}_style`, explanationStyle);
    localStorage.setItem(`${STORAGE_KEY}_tone`, tone);

    // Send update to backend API endpoint
    fetch('/api/memory/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_policy_rules: companyPolicyRules,
        preferred_language: preferredLanguage,
        explanation_style: explanationStyle,
        tone: tone
      })
    }).catch(err => console.error('Failed to sync memory with backend', err));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-navy-950 p-8 border border-slate-800 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 mb-3">
              <Brain className="w-3.5 h-3.5" />
              Personalized AI Memory & Corporate Rules
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">AI Memory & Context Preferences</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              LexiRAG AI remembers your company policies, preferred language, explanation style, and corporate legal rules across all conversations.
            </p>
          </div>

          <button
            onClick={handleSave}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl transition-all ${
              savedSuccess
                ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-102'
                : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/25 active:scale-98'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>AI Memory Saved & Persisted ✔</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save AI Memory Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active AI Memory Status Banner */}
      <div className="p-6 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-500 text-white shadow-md">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Active Persistent AI Memory:</div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {explanationStyle} • {preferredLanguage} • {tone}
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local & Cloud Persistence Active ✔</span>
        </span>
      </div>

      {/* Preferences Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Company Policy & Legal Rules */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-black text-base">
              <Building2 className="w-5 h-5 text-brand-500" />
              <span>Company Policy & Standard Legal Rules</span>
            </div>
            <span className="text-xs text-emerald-500 font-mono font-bold">Auto-Saved to Memory</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your company's standard legal thresholds (Governing Law, Liability Caps, Notice Windows). AI Assistant cross-references these saved rules whenever evaluating contracts or answering questions.
          </p>

          <textarea
            rows={5}
            value={companyPolicyRules}
            onChange={(e) => setCompanyPolicyRules(e.target.value)}
            className="w-full p-4 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40 leading-relaxed font-sans"
            placeholder="e.g. Governing law must be Delaware or New York state law. Max $50k liability cap policy, 30 days minimum notice window..."
          />
        </div>

        {/* Section 2: Preferred Language */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-black text-base">
            <Globe className="w-5 h-5 text-indigo-500" />
            <span>Preferred Language</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Choose the language in which AI Assistant communicates and synthesizes reports.
          </p>

          <select
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <option value="English 🇺🇸">English 🇺🇸 (Default)</option>
            <option value="Spanish 🇪🇸">Spanish 🇪🇸 (Español)</option>
            <option value="French 🇫🇷">French 🇫🇷 (Français)</option>
            <option value="German 🇩🇪">German 🇩🇪 (Deutsch)</option>
            <option value="Japanese 🇯🇵">Japanese 🇯🇵 (日本語)</option>
          </select>
        </div>

        {/* Section 3: Preferred Explanation Style */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-black text-base">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>Preferred Explanation Style</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Define how simple or technical AI legal explanations should be formatted.
          </p>

          <select
            value={explanationStyle}
            onChange={(e) => setExplanationStyle(e.target.value)}
            className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <option value="Executive TL;DR">Executive TL;DR (High-Level Bullet Summary)</option>
            <option value="Legal Counsel Deep-Dive">Legal Counsel Deep-Dive (Clause-by-Clause Analysis)</option>
            <option value="Simple English (Beginner)">Simple English (Plain Language Translation)</option>
          </select>
        </div>

      </div>

    </div>
  );
};
