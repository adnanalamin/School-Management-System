import { Laptop, Moon, Search, Sun } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/app/theme';
import { getNavGroups } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);
const shortcutLabel = isMac ? '⌘K' : 'Ctrl K';

/** Header search: a field-like button on wide screens, an icon on phones; both open the command palette (Ctrl/⌘ + K). */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const groups = getNavGroups();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const run = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="hidden h-10 w-full max-w-sm justify-start gap-2 bg-background font-normal text-muted-foreground md:inline-flex"
        onClick={() => setOpen(true)}
        aria-label="Search pages and actions"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Search aria-hidden="true" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium">{shortcutLabel}</kbd>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Search pages and actions">
        <Search aria-hidden="true" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Search pages and actions. Use the arrow keys to move and Enter to select.">
        <CommandInput placeholder="Search pages and actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.label ?? 'go-to'} heading={group.label ?? 'Go to'}>
              {group.items.map((item) => (
                <CommandItem key={item.to} value={`${group.label ?? 'Go to'} ${item.label}`} onSelect={() => run(() => navigate(item.to))}>
                  <item.icon aria-hidden="true" />
                  {item.label}
                  {item.planned ? <CommandShortcut>Soon</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem value="Switch to light theme" onSelect={() => run(() => setTheme('light'))}>
              <Sun aria-hidden="true" />
              Switch to light theme
            </CommandItem>
            <CommandItem value="Switch to dark theme" onSelect={() => run(() => setTheme('dark'))}>
              <Moon aria-hidden="true" />
              Switch to dark theme
            </CommandItem>
            <CommandItem value="Use system theme" onSelect={() => run(() => setTheme('system'))}>
              <Laptop aria-hidden="true" />
              Use system theme
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">Searching students, staff and records will arrive with those modules.</p>
      </CommandDialog>
    </>
  );
}
