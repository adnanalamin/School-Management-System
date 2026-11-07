import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { Section } from './Section';

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
  { name: 'Chart 1', className: 'bg-chart-1' },
  { name: 'Chart 2', className: 'bg-chart-2' },
  { name: 'Chart 3', className: 'bg-chart-3' },
  { name: 'Chart 4', className: 'bg-chart-4' },
  { name: 'Chart 5', className: 'bg-chart-5' },
];

export function FoundationsTab() {
  return (
    <div className="space-y-10">
      <Section title="Colour" description="Tokens switch automatically between light and dark. Marigold (accent) only marks location and unread state.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
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
            <p className="max-w-prose text-base">Body text stays under about 75 characters per line so it is comfortable to read on any screen.</p>
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

      <Section title="Badges and status" description="Status chips always state the status in words; colour only reinforces it.">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <StatusBadge tone="success">Active</StatusBadge>
          <StatusBadge tone="warning">Pending</StatusBadge>
          <StatusBadge tone="info">Scheduled</StatusBadge>
          <StatusBadge tone="danger">Overdue</StatusBadge>
          <StatusBadge tone="neutral">Inactive</StatusBadge>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Supporting description for the card.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">Content sits here. Cards group related information and actions.</CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="outline">
                Secondary
              </Button>
            </CardFooter>
          </Card>
          <StatCard label="Enrolled students" value="1,248" icon={GraduationCap} delta={{ percent: 3.2, comparison: 'vs last term' }} />
          <StatCard label="Attendance today" value="94.2%" icon={GraduationCap} delta={{ percent: -0.8, comparison: 'vs yesterday' }} />
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex items-center gap-3">
          <UserAvatar name="Nadia Rahman" className="size-10" />
          <UserAvatar name="Omar Karim" className="size-8" />
          <UserAvatar name="Lina" className="size-12" />
        </div>
      </Section>
    </div>
  );
}
