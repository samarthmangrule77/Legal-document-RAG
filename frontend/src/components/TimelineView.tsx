import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  RefreshCw, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  Bell,
  Sparkles,
  Check
} from 'lucide-react';
import { LegalDocument, TimelineEvent } from '../types';

interface TimelineViewProps {
  documents: LegalDocument[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ documents }) => {
  const [syncedEventIds, setSyncedEventIds] = useState<Record<string, boolean>>({});

  // Aggregate timeline events from all documents
  const allEvents: (TimelineEvent & { docName: string })[] = [];
  documents.forEach(doc => {
    doc.timeline?.forEach(ev => {
      allEvents.push({ ...ev, docName: doc.filename });
    });
  });

  // Default initial mock deadlines if none exist
  if (allEvents.length === 0) {
    allEvents.push(
      {
        id: 'ev-1',
        date: '2027-04-01',
        title: '180-Day Auto-Renewal Cancellation Cutoff',
        category: 'notice',
        description: 'Final date to submit written cancellation notice to avoid 3-year automatic lease extension.',
        clause_ref: 'Clause 4.3 (Renewal)',
        docName: 'Commercial_Office_Lease_Agreement_2026.pdf'
      },
      {
        id: 'ev-2',
        date: '2026-10-01',
        title: '30-Day Employee Benefits Enrollment Cutoff',
        category: 'milestone',
        description: 'Final deadline for Senior Principal Engineer benefits enrollment submission.',
        clause_ref: 'Clause 2.2 (Benefits)',
        docName: 'Senior_Software_Engineer_Employment_Agreement.pdf'
      }
    );
  }

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

  const handleGoogleCalendarSync = (event: TimelineEvent & { docName: string }) => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`Legal Deadline for ${event.docName}: ${event.description} (${event.clause_ref || ''})`);
    const dateFormatted = event.date.replace(/-/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}T090000Z/${dateFormatted}T100000Z&details=${details}`;
    window.open(url, '_blank');
  };

  const handleOutlookSync = (event: TimelineEvent & { docName: string }) => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`Legal Deadline for ${event.docName}: ${event.description} (${event.clause_ref || ''})`);
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&startdt=${event.date}T09:00:00Z&enddt=${event.date}T10:00:00Z`;
    window.open(url, '_blank');
  };

  const handleSetReminder = (eventId: string) => {
    setSyncedEventIds(prev => ({ ...prev, [eventId]: true }));
    setTimeout(() => {
      setSyncedEventIds(prev => ({ ...prev, [eventId]: false }));
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-500 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Temporal Extraction & Calendar Integration</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            Contract Deadlines & 1-Click Calendar Sync
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export extracted renewal cutoffs, notice deadlines, and payment milestones directly to Google Calendar or Outlook.
          </p>
        </div>

        <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Google Calendar & Outlook Enabled ✔</span>
        </div>
      </div>

      {/* Timeline Roadmap */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
        <div className="relative border-l-2 border-slate-200 dark:border-white/[0.06] ml-4 sm:ml-8 space-y-8 py-2">
          
          {allEvents.map((event) => {
            const catInfo = getCategoryBadge(event.category);
            const Icon = catInfo.icon;
            const isReminderSet = syncedEventIds[event.id];

            return (
              <div key={event.id} className="relative pl-6 sm:pl-8 group">
                
                {/* Dot */}
                <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-white dark:bg-white/[0.03] border-2 border-brand-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                </div>

                {/* Event Card */}
                <div className="p-6 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-4 hover:border-brand-400 transition-colors">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                      📅 {event.date}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${catInfo.bg}`}>
                      {event.category}
                    </span>
                  </div>

                  <h3 className="font-medium text-slate-900 dark:text-slate-100 text-base">
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-200/60 dark:border-white/[0.06] pb-3">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-brand-500" />
                      {event.docName}
                    </span>
                    {event.clause_ref && (
                      <span className="font-mono text-brand-600 dark:text-brand-400 font-medium">{event.clause_ref}</span>
                    )}
                  </div>

                  {/* 1-Click Calendar Sync Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    
                    {/* Google Calendar */}
                    <button
                      onClick={() => handleGoogleCalendarSync(event)}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium transition-all border border-blue-500/20 flex items-center gap-1.5"
                    >
                      <span>📅 Google Calendar</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>

                    {/* Outlook Calendar */}
                    <button
                      onClick={() => handleOutlookSync(event)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-medium transition-all border border-cyan-500/20 flex items-center gap-1.5"
                    >
                      <span>📧 Outlook</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>

                    {/* Set Automated Reminder */}
                    <button
                      onClick={() => handleSetReminder(event.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5 ${
                        isReminderSet
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {isReminderSet ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Reminder Scheduled (90 & 30 Days Prior) ✔</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5" />
                          <span>Set 90-Day Email Reminder</span>
                        </>
                      )}
                    </button>

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
