import React from 'react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Clock, ExternalLink } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, corridors, setSelectedCorridor } = useData();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAction = (item: (typeof notifications)[0]) => {
    markNotificationRead(item.id);
    if (item.relatedReportId) {
      navigate('/authority/reports');
    } else if (item.relatedLocationId) {
      const match = corridors.find((c) => c.id === item.relatedLocationId);
      if (match) {
        setSelectedCorridor(match);
      }
      navigate('/authority/dashboard');
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-12 w-96 max-w-[90vw] bg-navy-900 border border-slate-700/80 rounded-2xl shadow-glow-card z-50 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 bg-navy-800/80 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-emerald" />
          <h3 className="text-sm font-semibold text-white">Safety Alert Center</h3>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand-emerald/20 text-brand-emerald rounded-full">
            {notifications.filter((n) => !n.read).length} new
          </span>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="text-xs text-slate-400 hover:text-brand-emerald transition-colors"
        >
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">No safety alerts at this time.</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAction(item)}
              className={`p-3.5 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${
                !item.read ? 'bg-navy-800/40' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.severity === 'critical' ? (
                  <span className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                ) : item.severity === 'high' ? (
                  <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-100 truncate">{item.title}</span>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-emerald shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.message}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-brand-cyan hover:underline flex items-center gap-0.5">
                    Inspect <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer warning */}
      <div className="p-2.5 bg-navy-950/90 border-t border-slate-800 text-[11px] text-center text-slate-400">
        SURAKSH Decision-Support Engine • Live Smart City Feeds
      </div>
    </div>
  );
};
