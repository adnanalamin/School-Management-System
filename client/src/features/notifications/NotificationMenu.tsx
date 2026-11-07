import { Bell, BellOff, BookOpenCheck, CalendarCheck, Info, Receipt, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationKind } from '@/mocks/notifications';
import { useNotifications } from './useNotifications';

const kindIcon: Record<NotificationKind, LucideIcon> = {
  attendance: CalendarCheck,
  fees: Receipt,
  exam: BookOpenCheck,
  system: Info,
};

function NotificationList({ items, onRead }: { items: AppNotification[]; onRead: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={BellOff}
        title="You’re all caught up"
        description="New alerts about attendance, fees and exams appear here."
        className="m-4 border-0 py-8"
      />
    );
  }

  return (
    <ul className="max-h-96 divide-y overflow-y-auto">
      {items.map((item) => {
        const Icon = kindIcon[item.kind];
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onRead(item.id)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60 focus-visible:bg-secondary/60"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-sm', item.read ? 'font-medium' : 'font-semibold')}>
                  {item.title}
                  {item.read ? null : <span className="sr-only"> (unread)</span>}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{item.body}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
              </span>
              {item.read ? null : <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-accent" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function NotificationMenu() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unread = notifications.filter((item) => !item.read);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}>
          <Bell aria-hidden="true" />
          {unreadCount > 0 ? (
            <span
              aria-hidden="true"
              className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <Tabs value={filter} onValueChange={(value) => setFilter(value === 'unread' ? 'unread' : 'all')}>
          <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" disabled={unreadCount === 0} onClick={markAllRead}>
              Mark all as read
            </Button>
          </div>
          <div className="border-b px-4 pb-3">
            <TabsList className="h-9 w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="mt-0">
            <NotificationList items={notifications} onRead={markRead} />
          </TabsContent>
          <TabsContent value="unread" className="mt-0">
            <NotificationList items={unread} onRead={markRead} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
