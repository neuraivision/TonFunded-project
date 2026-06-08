import { create } from 'zustand';
import type { NotificationItem, NotificationType } from '@/types';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;

  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const iconForType = (_type: NotificationType) => _type; // kept for future use

const initialNotifications: NotificationItem[] = [
  {
    id: 'n_1',
    type: 'drawdown_warning',
    title: 'Drawdown Warning',
    body: 'Your daily drawdown has reached 40% of the limit ($200 of $500). Trade carefully.',
    timestamp: minutesAgo(5),
    read: false,
    actionRoute: '/',
    actionLabel: 'View Dashboard',
  },
  {
    id: 'n_2',
    type: 'profit_target_reached',
    title: '80% Profit Target Reached!',
    body: "You've reached $800 of your $1,000 profit target. Keep going — you're almost funded!",
    timestamp: minutesAgo(30),
    read: false,
    actionRoute: '/',
    actionLabel: 'View Progress',
  },
  {
    id: 'n_3',
    type: 'trade_closed',
    title: 'Trade Closed',
    body: 'NOT/USDT position closed at +$120.00 (+10.8%). Nice trade.',
    timestamp: minutesAgo(90),
    read: true,
    actionRoute: '/trading',
    actionLabel: 'View History',
  },
  {
    id: 'n_4',
    type: 'referral_joined',
    title: 'New Referral!',
    body: 'Your friend CryptoNova just joined TonFunded using your referral link.',
    timestamp: hoursAgo(3),
    read: true,
    actionRoute: '/profile',
    actionLabel: 'View Referrals',
  },
  {
    id: 'n_5',
    type: 'payout_processed',
    title: 'Payout Processed',
    body: 'Your payout of $640.00 (80% split) has been sent to your TON wallet.',
    timestamp: hoursAgo(48),
    read: true,
    actionRoute: '/profile',
    actionLabel: 'View Payouts',
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((n) => !n.read).length,

  addNotification: (item) => {
    const newItem: NotificationItem = {
      ...item,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    // Suppress unused variable warning
    void iconForType(newItem.type);
    set((state) => ({
      notifications: [newItem, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - (state.notifications.find((n) => n.id === id)?.read ? 0 : 1)),
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  dismiss: (id) => {
    const wasUnread = !get().notifications.find((n) => n.id === id)?.read;
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: Math.max(0, state.unreadCount - (wasUnread ? 1 : 0)),
    }));
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
