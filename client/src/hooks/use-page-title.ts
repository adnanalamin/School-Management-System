import { useEffect } from 'react';
import { env } from '@/lib/env';

/** Sets document.title to "<page> · <app name>" (or just the app name when no page is given). */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${env.VITE_APP_NAME}` : env.VITE_APP_NAME;
  }, [title]);
}
