import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdmissionForm } from './AdmissionForm';
import { Section } from './Section';

export function FormsTab() {
  return (
    <Section title="Forms" description="React Hook Form with a Zod schema and reusable field components. Submit empty or invalid values to see inline errors.">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Student admission (demo)</CardTitle>
          <CardDescription>Text, select, textarea, switch and checkbox. Labels, hints and errors are linked to controls for screen readers.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdmissionForm formId="admission-inline" />
        </CardContent>
      </Card>
    </Section>
  );
}
