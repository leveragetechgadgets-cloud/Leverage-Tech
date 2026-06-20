import { CheckCircle, AlertOctagon, Info, Sparkles } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationMsg {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationProps {
  notifications: NotificationMsg[];
}

export default function Notification({ notifications }: NotificationProps) {
  if (notifications.length === 0) return null;

  return (
    <div id="notification-root" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          id={`notif-${n.id}`}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md animate-fade-in transition-all ${
            n.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-200 dark:bg-emerald-950/90 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : n.type === 'error'
              ? 'bg-rose-50/90 border-rose-200 dark:bg-rose-950/90 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-indigo-50/90 border-indigo-200 dark:bg-indigo-950/90 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {n.type === 'success' ? (
              <CheckCircle size={18} className="text-emerald-500" />
            ) : n.type === 'error' ? (
              <AlertOctagon size={18} className="text-rose-500" />
            ) : (
              <Info size={18} className="text-indigo-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold">{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
