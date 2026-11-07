import { useCallback, useMemo, useState } from 'react';
import { getSampleNotifications, type AppNotification } from '@/mocks/notifications';

/** Local state over sample data; becomes a TanStack Query hook plus mutations when the API exists. */
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getSampleNotifications());

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const markRead = useCallback((id: string) => {
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  }, []);

  return { notifications, unreadCount, markRead, markAllRead };
}
