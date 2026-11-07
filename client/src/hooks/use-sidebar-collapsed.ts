import { useCallback, useState } from 'react';

const STORAGE_KEY = 'sms-sidebar-collapsed';

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Desktop sidebar collapse state, remembered per browser. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState<boolean>(readStored);

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Preference just will not persist.
      }
      return next;
    });
  }, []);

  return { collapsed, toggle };
}
