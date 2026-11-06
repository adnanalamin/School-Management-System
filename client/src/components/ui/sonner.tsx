import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/app/theme';

/** App-wide toast host. Call `toast.success(...)` / `toast.error(...)` from 'sonner' anywhere. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return <Sonner theme={resolvedTheme} position="top-right" richColors closeButton />;
}
