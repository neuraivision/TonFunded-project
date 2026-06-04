import { X, Bell, CheckCheck, AlertTriangle, TrendingUp, Trophy, DollarSign, Users, Info, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/stores/notificationStore';
import type { NotificationType } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function iconForType(type: NotificationType): { icon: React.ElementType; iconBg: string; iconColor: string } {
  switch (type) {
    case 'drawdown_warning':
      return { icon: AlertTriangle, iconBg: 'rgba(239,68,68,0.12)', iconColor: '#f87171' };
    case 'profit_target_reached':
      return { icon: Zap, iconBg: 'rgba(245,158,11,0.12)', iconColor: '#fbbf24' };
    case 'challenge_passed':
      return { icon: Trophy, iconBg: 'rgba(234,179,8,0.12)', iconColor: '#facc15' };
    case 'challenge_failed':
      return { icon: AlertTriangle, iconBg: 'rgba(239,68,68,0.12)', iconColor: '#f87171' };
    case 'payout_processed':
      return { icon: DollarSign, iconBg: 'rgba(34,197,94,0.12)', iconColor: '#4ade80' };
    case 'payout_rejected':
      return { icon: DollarSign, iconBg: 'rgba(239,68,68,0.12)', iconColor: '#f87171' };
    case 'trade_closed':
      return { icon: TrendingUp, iconBg: 'rgba(77,184,255,0.12)', iconColor: '#4DB8FF' };
    case 'referral_joined':
      return { icon: Users, iconBg: 'rgba(168,85,247,0.12)', iconColor: '#c084fc' };
    case 'system':
    default:
      return { icon: Info, iconBg: 'rgba(148,163,184,0.12)', iconColor: '#94a3b8' };
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
        className="relative w-full max-w-lg mx-auto rounded-b-2xl max-h-[85vh] flex flex-col"
        style={{
          background: 'var(--bg-card)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          borderBottom: '1px solid var(--border-default)',
          animation: 'sheetSlideDown 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-primary-app" />
            <h2 className="text-base font-700 text-primary-app" style={{ fontWeight: 700 }}>Notifications</h2>
            {unreadCount > 0 && (
              <span
                className="text-white text-[10px] font-700 px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                style={{ background: '#ef4444', fontWeight: 700 }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-600 text-accent-app active:opacity-70"
                style={{ fontWeight: 600 }}
              >
                <CheckCheck size={13} />
                All read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center active:opacity-70"
              style={{ background: 'var(--bg-surface)' }}
            >
              <X size={13} className="text-secondary" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'var(--bg-surface)' }}
              >
                <Bell size={22} className="text-tertiary" />
              </div>
              <p className="text-sm font-500 text-secondary">No notifications</p>
              <p className="text-xs text-tertiary mt-1">You're all caught up</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const { icon: Icon, iconBg, iconColor } = iconForType(notif.type);
              return (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 px-5 py-4 transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border-default)',
                    background: !notif.read ? 'rgba(77,184,255,0.04)' : 'transparent',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: iconBg }}
                  >
                    <Icon size={16} style={{ color: iconColor }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-600 text-primary-app leading-tight" style={{ fontWeight: notif.read ? 500 : 600 }}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!notif.read && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: '#4DB8FF', boxShadow: '0 0 6px rgba(77,184,255,0.5)' }}
                          />
                        )}
                        <button
                          onClick={() => dismiss(notif.id)}
                          className="text-tertiary active:text-secondary"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-secondary mt-0.5 leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-tertiary">{formatTimeAgo(notif.timestamp)}</span>
                      {notif.actionLabel && notif.actionRoute && (
                        <button
                          onClick={() => handleAction(notif.id, notif.actionRoute)}
                          className="text-[11px] font-600 text-accent-app active:opacity-70"
                          style={{ fontWeight: 600 }}
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
