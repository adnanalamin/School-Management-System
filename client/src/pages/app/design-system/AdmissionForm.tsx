import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { FormCheckboxField, FormInputField, FormSelectField, FormSwitchField, FormTextareaField } from '@/components/forms/fields';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

const classOptions = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map((value) => ({ value, label: value }));

const admissionSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter at least 2 characters').max(80, 'Use 80 characters or fewer'),
  email: z.string().trim().email('Enter a valid email address'),
  className: z.string().min(1, 'Choose a class'),
  guardianPhone: z.string().trim().regex(/^[+\d][\d\s-]{6,17}$/, 'Enter a valid phone number'),
  notes: z.string().trim().max(500, 'Use 500 characters or fewer'),
  smsAlerts: z.boolean(),
  consent: z.boolean().refine((value) => value, 'Guardian consent is required to continue'),
});

type AdmissionValues = z.infer<typeof admissionSchema>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface AdmissionFormProps {
  /** Lets a button outside the <form> (a modal or drawer footer) submit it via `form="<id>"`. */
  formId: string;
  /** Render the built-in submit button. Turn off when the footer provides it. */
  showSubmit?: boolean;
  onSubmittingChange?: (submitting: boolean) => void;
  onSuccess?: () => void;
}

/** Demo form exercising every field type. It validates and reports; nothing is stored. */
export function AdmissionForm({ formId, showSubmit = true, onSubmittingChange, onSuccess }: AdmissionFormProps) {
  const form = useForm<AdmissionValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: { fullName: '', email: '', className: '', guardianPhone: '', notes: '', smsAlerts: true, consent: false },
  });
  const { isSubmitting } = form.formState;

  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  const onSubmit = async (values: AdmissionValues) => {
    await sleep(700);
    toast.success(`Form is valid for ${values.fullName}`, { description: 'Nothing was saved: the backend is not connected yet.' });
    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormInputField control={form.control} name="fullName" label="Student’s full name" autoComplete="off" />
          <FormInputField control={form.control} name="email" label="Email address" type="email" autoComplete="off" description="Validated here and again on the server." />
          <FormSelectField control={form.control} name="className" label="Class" options={classOptions} placeholder="Choose a class" />
          <FormInputField control={form.control} name="guardianPhone" label="Guardian’s phone" type="tel" autoComplete="off" />
        </div>
        <FormTextareaField control={form.control} name="notes" label="Notes" description="Optional. Up to 500 characters." rows={3} />
        <FormSwitchField control={form.control} name="smsAlerts" label="SMS alerts" description="Send attendance and fee alerts to the guardian." />
        <FormCheckboxField control={form.control} name="consent" label="The guardian has agreed to the school’s data policy." />
        {showSubmit ? (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Check form
          </Button>
        ) : null}
      </form>
    </Form>
  );
}
