import { ProgressBar } from '@/components/common/ProgressBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FeeCollectionGroup } from './types';

export function FeeCollectionCard({ groups }: { groups: FeeCollectionGroup[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fee collection</CardTitle>
        <CardDescription>Share of the term total received, by grade</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {groups.map((item) => (
            <li key={item.group} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{item.group}</span>
                <span className="tabular-nums text-muted-foreground">{item.collectedPercent}%</span>
              </div>
              <ProgressBar value={item.collectedPercent} label={`${item.group} fees collected`} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
