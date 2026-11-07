import { PageHeader } from '@/components/common/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePageTitle } from '@/hooks/use-page-title';
import { DataTab } from './design-system/DataTab';
import { FeedbackTab } from './design-system/FeedbackTab';
import { FormsTab } from './design-system/FormsTab';
import { FoundationsTab } from './design-system/FoundationsTab';
import { OverlaysTab } from './design-system/OverlaysTab';

/** Living style guide. Registered only in development (see app/router.tsx). Nothing here is persisted. */
export function Component() {
  usePageTitle('Design system');

  return (
    <>
      <PageHeader
        title="Design system"
        description="The building blocks every screen is made from. Visible in development only; nothing here is saved."
      />
      <Tabs defaultValue="foundations">
        <TabsList aria-label="Design system sections">
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
        </TabsList>
        <TabsContent value="foundations" className="mt-6">
          <FoundationsTab />
        </TabsContent>
        <TabsContent value="forms" className="mt-6">
          <FormsTab />
        </TabsContent>
        <TabsContent value="data" className="mt-6">
          <DataTab />
        </TabsContent>
        <TabsContent value="feedback" className="mt-6">
          <FeedbackTab />
        </TabsContent>
        <TabsContent value="overlays" className="mt-6">
          <OverlaysTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
