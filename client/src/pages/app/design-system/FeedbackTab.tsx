import { Inbox, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { StatCardSkeleton } from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Section } from './Section';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function FeedbackTab() {
  return (
    <div className="space-y-10">
      <Section title="Skeleton loaders" description="Shapes mirror the content that will replace them, so the page does not jump.">
        <div className="grid gap-4 lg:grid-cols-3">
          <StatCardSkeleton />
          <Card aria-hidden="true">
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          <Card aria-hidden="true">
            <CardContent className="space-y-4 pt-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <LoadingState label="Loading students…" />
        </Card>
      </Section>

      <Section title="Empty states" description="Say what will appear here and offer the next step.">
        <div className="grid gap-4 lg:grid-cols-2">
          <EmptyState icon={Inbox} title="Nothing here yet" description="Say what will appear here and how to add the first item." action={<Button size="sm">Add item</Button>} />
          <EmptyState
            icon={SearchX}
            title="No results for “algebra”"
            description="Check the spelling or try a broader search."
            action={
              <Button size="sm" variant="outline">
                Clear search
              </Button>
            }
          />
        </div>
      </Section>

      <Section title="Error states" description="Plain language, a way to recover, and a reference code support can look up.">
        <div className="grid gap-4 lg:grid-cols-2">
          <ErrorState title="Could not load records" message="Check your connection and try again." onRetry={() => toast.info('Retrying…')} />
          <ErrorState title="The service is unavailable" message="The database is not responding. Please try again shortly." requestId="3f2a9c1e-demo" onRetry={() => toast.info('Retrying…')} />
        </div>
      </Section>

      <Section title="Toast notifications" description="Brief, non-blocking confirmation. Errors that need action belong inline instead.">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast.success('Changes saved')}>
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error('Could not save changes', { description: 'Check your connection and try again.' })}>
            Error
          </Button>
          <Button variant="outline" onClick={() => toast.warning('Fee reminders are paused')}>
            Warning
          </Button>
          <Button variant="outline" onClick={() => toast.info('Reports refresh nightly')}>
            Info
          </Button>
          <Button
            variant="outline"
            onClick={() => toast('Student archived', { action: { label: 'Undo', onClick: () => toast.success('Restored') } })}
          >
            With undo
          </Button>
          <Button
            variant="outline"
            onClick={() => void toast.promise(sleep(1400), { loading: 'Saving…', success: 'Saved', error: 'Could not save' })}
          >
            Promise
          </Button>
        </div>
      </Section>
    </div>
  );
}
