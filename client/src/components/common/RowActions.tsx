import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface RowActionsProps {
  /** Accessible name that identifies the row, e.g. "Actions for Aisha Rahman". */
  label: string;
  actions: readonly RowAction[];
}

/** Overflow menu for table rows. Destructive actions are separated and should open a ConfirmDialog. */
export function RowActions({ label, actions }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={label}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {actions.map((action, index) => (
          <Fragment key={action.label}>
            {action.destructive && index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem destructive={action.destructive ?? false} disabled={action.disabled ?? false} onSelect={action.onSelect}>
              {action.icon ? <action.icon aria-hidden="true" /> : null}
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
