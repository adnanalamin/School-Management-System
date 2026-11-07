import { UserAvatar } from '@/components/common/UserAvatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/format';
import type { ActivityItem } from './types';

export function RecentActivityCard({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>What staff did in the last day</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <UserAvatar name={item.actor} className="size-8" />
              <div className="min-w-0 flex-1 text-sm">
                <p>
                  <span className="font-medium">{item.actor}</span> {item.action} <span className="font-medium">{item.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  <time dateTime={new Date(item.occurredAt).toISOString()}>{formatRelativeTime(item.occurredAt)}</time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
