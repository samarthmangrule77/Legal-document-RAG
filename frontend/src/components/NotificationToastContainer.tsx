import React from 'react';
import { 
  CheckCircle2, 
  Scan, 
  ShieldAlert, 
  FileText, 
  UserPlus, 
  X, 
  Sparkles,
  Wifi
} from 'lucide-react';

export interface NotificationEvent {
  id: string;
  event: 'ocr_completed' | 'risk_analysis_completed' | 'doc_indexed' | 'member_joined' | 'connected';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

interface NotificationToastContainerProps {
  notifications: NotificationEvent[];
  onDismiss: (id: string) => void;
  isConnected: boolean;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  notifications,
  onDismiss,
  isConnected
}) => {
  // Show only top 4 recent active toasts
  const activeToasts = notifications.slice(0, 4);

  const getIcon = (event: string) => {
    switch (event) {
      case 'doc_indexed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'risk_analysis_completed':
        return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
      case 'ocr_completed':
        return <Scan className="w-5 h-5 text-amber-400" />;
      case 'member_joined':
        return <UserPlus className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-brand-400" />;
    }
  };

  const getBorderColor = (event: string) => {
    switch (event) {
      case 'doc_indexed':
        return 'border-emerald-500/40 bg-slate-900/90 shadow-emerald-500/10';
      case 'risk_analysis_completed':
        return 'border-indigo-500/40 bg-slate-900/90 shadow-indigo-500/10';
      case 'ocr_completed':
        return 'border-amber-500/40 bg-slate-900/90 shadow-amber-500/10';
      case 'member_joined':
        return 'border-cyan-500/40 bg-slate-900/90 shadow-cyan-500/10';
      default:
        return 'border-brand-500/40 bg-slate-900/90 shadow-brand-500/10';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      
      {/* WebSocket Status Indicator Pill */}
      <div className="self-end pointer-events-auto flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-slate-300 shadow-lg">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
        <span className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-brand-400" />
          {isConnected ? 'Live WebSockets Active' : 'Connecting Stream...'}
        </span>
      </div>

      {/* Floating Notification Toasts */}
      {activeToasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto relative overflow-hidden p-4 rounded-2xl border backdrop-blur-xl text-white shadow-2xl transition-all duration-300 animate-in slide-in-from-right-5 ${getBorderColor(
            item.event
          )}`}
        >
          {/* Animated top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 animate-pulse"></div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex-shrink-0 mt-0.5">
                {getIcon(item.event)}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black tracking-tight text-white">{item.title}</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✔ Live
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {item.message}
                </p>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  {item.timestamp}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDismiss(item.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

    </div>
  );
};
