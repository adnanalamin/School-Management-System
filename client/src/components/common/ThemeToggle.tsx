import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type Theme } from '@/app/theme';
import { Button } from '@/components/ui/button';

const order: Theme[] = ['light', 'dark', 'system'];

const labels: Record<Theme, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
};

const icons = { light: Sun, dark: Moon, system: Monitor } as const;

/** Cycles light → dark → system. The label announces the current mode and what a press does. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = order[(order.indexOf(theme) + 1) % order.length] ?? 'system';
  const Icon = icons[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`${labels[theme]} (switch to ${labels[next].toLowerCase()})`}
      title={labels[theme]}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
