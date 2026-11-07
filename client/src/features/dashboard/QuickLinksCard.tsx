import { Link } from 'react-router-dom';
import { getNavGroups } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const quickLinkTargets = ['/app/students', '/app/attendance', '/app/exams', '/app/fees'];

export function QuickLinksCard() {
  const items = getNavGroups()
    .flatMap((group) => group.items)
    .filter((item) => quickLinkTargets.includes(item.to));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Jump to</CardTitle>
        <CardDescription>Common places, one tap away</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <li key={item.to}>
              <Button asChild variant="outline" className="h-auto w-full flex-col gap-2 py-4">
                <Link to={item.to}>
                  <item.icon className="!size-5 text-primary" aria-hidden="true" />
                  {item.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
