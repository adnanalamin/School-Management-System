import type { ComponentProps } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

/*
 * Ready-made React Hook Form fields: label, control, hint and error are wired together for screen readers.
 * Text, select and textarea fields hold string values; checkbox and switch hold booleans.
 * Use these instead of re-assembling FormField/FormItem/FormLabel in every form.
 */

interface BaseFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: string;
  description?: string;
}

type PassThrough<T extends keyof HTMLElementTagNameMap> = Omit<ComponentProps<T>, 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref' | 'children'>;

export function FormInputField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  ...inputProps
}: BaseFieldProps<TValues> & PassThrough<'input'>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...inputProps} name={field.name} ref={field.ref} value={(field.value as string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function FormTextareaField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  ...textareaProps
}: BaseFieldProps<TValues> & PassThrough<'textarea'>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...textareaProps} name={field.name} ref={field.ref} value={(field.value as string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function FormSelectField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  placeholder = 'Select an option',
}: BaseFieldProps<TValues> & { options: readonly SelectOption[]; placeholder?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={(field.value as string | undefined) ?? ''} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger ref={field.ref} onBlur={field.onBlur}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function FormCheckboxField<TValues extends FieldValues>({ control, name, label, description }: BaseFieldProps<TValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-start gap-3">
            <FormControl>
              <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(checked === true)} onBlur={field.onBlur} ref={field.ref} className="mt-0.5" />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="font-normal leading-snug">{label}</FormLabel>
              {description ? <FormDescription>{description}</FormDescription> : null}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function FormSwitchField<TValues extends FieldValues>({ control, name, label, description }: BaseFieldProps<TValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {description ? <FormDescription>{description}</FormDescription> : null}
          </div>
          <FormControl>
            <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
