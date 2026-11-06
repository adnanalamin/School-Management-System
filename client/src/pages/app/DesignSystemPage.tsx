import { zodResolver } from '@hookform/resolvers/zod';
import { Inbox, Loader2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/use-page-title';

const swatches = [
  { name: 'Background', className: 'bg-background border' },
  { name: 'Card', className: 'bg-card border' },
  { name: 'Primary', className: 'bg-primary' },
  { name: 'Secondary', className: 'bg-secondary' },
  { name: 'Muted', className: 'bg-muted' },
  { name: 'Accent', className: 'bg-accent' },
  { name: 'Success', className: 'bg-success' },
  { name: 'Warning', className: 'bg-warning' },
  { name: 'Info', className: 'bg-info' },
  { name: 'Destructive', className: 'bg-destructive' },
];

const exampleSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter at least 2 characters').max(80, 'Use 80 characters or fewer'),
  email: z.string().trim().email('Enter a valid email address'),
});

type ExampleValues = z.infer<typeof exampleSchema>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ExampleForm() {
  const form = useForm<ExampleValues>({
    resolver: zodResolver(exampleSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const onSubmit = async (values: ExampleValues) => {
    await sleep(600);
    toast.success(`Form is valid for ${values.fullName}`);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="max-w-md space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>Validated with Zod here and again on the server.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          Check form
        </Button>
      </form>
    </Form>
  );
}

export function Component() {
  usePageTitle('Design system');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await sleep(800);
    setConfirming(false);
    setConfirmOpen(false);
    toast.success('Example record deleted');
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Design system"
        description="The building blocks every screen is made from. Visible in development only; nothing here is saved."
      />

      <Section title="Colour" description="Tokens switch automatically between light and dark themes.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {swatches.map((swatch) => (
            <div key={swatch.name} className="space-y-2">
              <div className={`h-14 rounded-md ${swatch.className}`} />
              <p className="text-xs text-muted-foreground">{swatch.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography" description="Fraunces for headings, Public Sans for everything else.">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="font-display text-4xl font-semibold tracking-tight">Page title</p>
            <p className="font-display text-2xl font-semibold tracking-tight">Section heading</p>
            <p className="text-base font-semibold">Item heading</p>
            <p className="max-w-prose text-base">
              Body text stays under about 75 characters per line so it is comfortable to read on any screen.
            </p>
            <p className="text-sm text-muted-foreground">Secondary text for hints, descriptions and metadata.</p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Section>

      <Section title="Forms" description="React Hook Form with a Zod schema. Submit empty or invalid values to see inline errors.">
        <Card>
          <CardHeader>
            <CardTitle>Example form</CardTitle>
            <CardDescription>Labels, hints and errors are linked to inputs for screen readers.</CardDescription>
          </CardHeader>
          <CardContent>
            <ExampleForm />
          </CardContent>
        </Card>
      </Section>

      <Section title="Loading, empty and error states">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
          <EmptyState
            icon={Inbox}
            title="Nothing here yet"
            description="Say what will appear here and how to add the first item."
            action={<Button size="sm">Add item</Button>}
          />
          <ErrorState
            title="Could not load records"
            message="Check your connection and try again."
            requestId="3f2a9c1e-example"
            onRetry={() => toast.info('Retrying…')}
          />
        </div>
      </Section>

      <Section title="Confirmation and feedback" description="Every destructive action asks first, and results arrive as toasts.">
        <div className="flex flex-wrap gap-3">
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete example record
          </Button>
          <Button variant="outline" onClick={() => toast.success('Changes saved')}>
            Success toast
          </Button>
          <Button variant="outline" onClick={() => toast.error('Could not save changes')}>
            Error toast
          </Button>
          <Button variant="outline" onClick={() => toast.info('Reports refresh nightly')}>
            Info toast
          </Button>
        </div>
      </Section>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this record?"
        description="This permanently removes the record and cannot be undone."
        confirmLabel="Delete record"
        destructive
        loading={confirming}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
