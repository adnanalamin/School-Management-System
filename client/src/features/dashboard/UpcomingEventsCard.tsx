import { StatusBadge, type StatusTone } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import type { EventCategory, UpcomingEvent } from './types';

const categoryTone: Record<EventCategory, { tone: StatusTone; label: string }> = {
  exam: { tone: 'danger', label: 'Exam' },
  holiday: { tone: 'info', label: 'Holiday' },
  meeting: { tone: 'warning', label: 'Meeting' },
  event: { tone: 'success', label: 'Event' },
};

export function UpcomingEventsCard({ events }: { events: UpcomingEvent[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming</CardTitle>
        <CardDescription>The next few school dates</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {events.map((event) => {
            const { tone, label } = categoryTone[event.category];
            return (
              <li key={event.id} className="flex items-start gap-3">
                <time
                  dateTime={event.date}
                  className="flex w-12 shrink-0 flex-col items-center rounded-md border bg-secondary/60 py-1 text-center leading-tight"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {formatDate(event.date, { month: 'short' })}
                  </span>
                  <span className="font-display text-lg font-semibold tabular-nums">{formatDate(event.date, { day: 'numeric' })}</span>
                </time>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <StatusBadge tone={tone}>{label}</StatusBadge>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
