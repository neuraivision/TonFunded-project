import { X, Bell, CheckCheck, AlertTriangle, TrendingUp, Trophy, DollarSign, Users, Info, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/stores/notificationStore';
import type { NotificationType } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function iconForType(type: NotificationType): { icon: React.ElementType; bg: string; color: string } {
  switch (type) {
    case 'drawdown_warning':
      return { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-500' };
    case 'profit_target_reached':
      return { icon: Zap, bg: 'bg-amber-50', color: 'text-amber-500' };
    case 'challenge_passed':
      return { icon: Trophy, bg: 'bg-yellow-50', color: 'text-yellow-600' };
    case 'challenge_failed':
      return { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-500' };
    case 'payout_processed':
      return { icon: DollarSign, bg: 'bg-green-50', color: 'text-green-600' };
    case 'payout_rejected':
      return { icon: DollarSign, bg: 'bg-red-50', color: 'text-red-500' };
    case 'trade_closed':
      return { icon: TrendingUp, bg: 'bg-blue-50', color: 'text-blue-500' };
    case 'referral_joined':
      return { icon: Users, bg: 'bg-purple-50', color: 'text-purple-500' };
    case 'system':
    default:
      return { icon: Info, bg: 'bg-gray-50', color: 'text-gray-500' };
  }
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationPanel({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotificationStore();

  if (!isOpen) return null;

  const handleAction = (id: string, route?: string) => {
    markRead(id);
    if (route) {
      navigate(route);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-start">
      {/* Overlay */}
      <div className="sheet-overlay absolute inset-0" onClick={onClose} />

      {/* Panel slides down from top */}
      <div
        className="relative bg-white w-full max-w-lg mx-auto rounded-b-2xl shadow-lg max-h-[85vh] flex flex-col"
        style={{ animation: 'sheetSlideDown 280ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-default flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary-app" />
            <h2 className="text-base font-semibold text-primary-app">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-accent-app active:opacity-70"
              >
                <CheckCheck size={14} />
                All read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
            >
              <X size={14} className="text-secondary" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <Bell size={28} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-secondary">No notifications</p>
              <p className="text-xs text-tertiary mt-1">You're all caught up</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const { icon: Icon, bg, color } = iconForType(notif.type);
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-5 py-4 border-b border-default last:border-0 transition-colors ${
                    !notif.read ? 'bg-blue-50/30' : 'bg-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold text-primary-app leading-tight ${!notif.read ? '' : 'font-medium'}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        <button
                          onClick={() => dismiss(notif.id)}
                          className="text-gray-300 active:text-gray-500"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-secondary mt-0.5 leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-tertiary">{formatTimeAgo(notif.timestamp)}</span>
                      {notif.actionLabel && notif.actionRoute && (
                        <button
                          onClick={() => handleAction(notif.id, notif.actionRoute)}
                          className="text-[11px] font-semibold text-accent-app active:opacity-70"
                        >
                          {notif.actionLabel} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
