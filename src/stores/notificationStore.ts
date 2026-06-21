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

const iconForType = (_type: NotificationType) => _type; // kept for future use

// No seeded notifications — a real account starts with an empty inbox.
// Real alerts arrive from the backend (drawdown/profit/payout events) over time.
const initialNotifications: NotificationItem[] = [];

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
