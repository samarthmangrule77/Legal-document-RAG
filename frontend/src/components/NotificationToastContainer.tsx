import React from 'react';
import { 
  CheckCircle2, 
  Scan, 
  ShieldAlert, 
  UserPlus, 
  X, 
  Bell
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
  const activeToasts = notifications.slice(0, 3);

  const getIcon = (event: string) => {
    switch (event) {
      case 'doc_indexed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'risk_analysis_completed':
        return <ShieldAlert className="w-4 h-4 text-blue-500" />;
      case 'ocr_completed':
        return <Scan className="w-4 h-4 text-amber-500" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-teal-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">

      {activeToasts.map((item) => (
        <div
          key={item.id}
          className="pointer-events-auto p-3 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/[0.08] shadow-md animate-fade-in"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0">
                {getIcon(item.event)}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-medium text-slate-800 dark:text-white truncate">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {item.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(item.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

    </div>
  );
};
