import React from 'react';
import { Calendar, Clock, CreditCard, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { LegalDocument, TimelineEvent } from '../types';

interface TimelineViewProps {
  documents: LegalDocument[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ documents }) => {
  // Aggregate timeline events from all documents
  const allEvents: (TimelineEvent & { docName: string })[] = [];
  documents.forEach(doc => {
    doc.timeline?.forEach(ev => {
      allEvents.push({ ...ev, docName: doc.filename });
    });
  });

  // Sort chronologically
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCategoryBadge = (cat: TimelineEvent['category']) => {
    switch (cat) {
      case 'renewal': return { bg: 'bg-indigo-500/10 text-indigo-600', icon: RefreshCw };
      case 'payment': return { bg: 'bg-emerald-500/10 text-emerald-600', icon: CreditCard };
      case 'expiry': return { bg: 'bg-rose-500/10 text-rose-600', icon: AlertCircle };
      case 'notice': return { bg: 'bg-amber-500/10 text-amber-600', icon: Clock };
      default: return { bg: 'bg-brand-500/10 text-brand-600', icon: Calendar };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>Automated Temporal Legal Extraction</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          Chronological Contract Deadlines & Milestones
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          AI-extracted payment schedules, auto-renewal deadlines, probation check-ins, and notice cutoff dates.
        </p>
      </div>

      {/* Timeline Roadmap */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-8 space-y-8 py-2">
          
          {allEvents.map((event) => {
            const catInfo = getCategoryBadge(event.category);
            const Icon = catInfo.icon;
            return (
              <div key={event.id} className="relative pl-6 sm:pl-8 group">
                
                {/* Dot */}
                <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-white dark:bg-navy-950 border-2 border-brand-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                </div>

                {/* Event Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/60 dark:border-slate-800 space-y-2 hover:border-brand-400 transition-colors">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-brand-600 dark:text-brand-400">
                      {event.date}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${catInfo.bg}`}>
                      {event.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      {event.docName}
                    </span>
                    {event.clause_ref && (
                      <span className="font-mono text-slate-500 dark:text-slate-400">{event.clause_ref}</span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};
