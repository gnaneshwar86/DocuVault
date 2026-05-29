// src/store/notificationStore.js
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Shape of a notification (matches NotificationDTO from backend)
// {
//   id: number,
//   message: string,
//   type: string, // SUCCESS, ERROR, INFO
//   timestamp: string,
//   isRead: boolean,
//   relatedFiles: string
// }

const useNotificationStore = create(
  devtools(
    persist(
      (set, get) => ({
        notifications: [],
        unreadCount: 0,
        // Replace the whole list (used after fetching from server)
        setNotifications: (list) => {
          const unread = list.filter((n) => !n.isRead).length;
          set({ notifications: list, unreadCount: unread });
        },
        // Add a single notification (e.g., from SSE)
        addNotification: (notif) => {
          const updated = [notif, ...get().notifications];
          const unread = updated.filter((n) => !n.isRead).length;
          set({ notifications: updated, unreadCount: unread });
        },
        // Mark a notification as read locally
        markAsRead: (id) => {
          const updated = get().notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          const unread = updated.filter((n) => !n.isRead).length;
          set({ notifications: updated, unreadCount: unread });
        },
        // Mark all as read locally
        markAllAsRead: () => {
          const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
          set({ notifications: updated, unreadCount: 0 });
        },
        // Clear all notifications locally
        clearAll: () => set({ notifications: [], unreadCount: 0 }),
      }),
      { name: 'notification-store' }
    )
  )
);

export default useNotificationStore;
