import { useCallback, useState } from 'react';
import type { SortState } from './table-utils';

interface UseDataTableStateOptions {
  pageSize?: number;
}

/**
 * Search, sort and pagination state for a list screen. Any change to the filters returns to page 1.
 * The returned values are exactly what a server-driven list sends as query parameters.
 */
export function useDataTableState({ pageSize: initialPageSize = 10 }: UseDataTableStateOptions = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [search, setSearchState] = useState('');
  const [sort, setSortState] = useState<SortState | null>(null);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setSort = useCallback((value: SortState | null) => {
    setSortState(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((value: number) => {
    setPageSizeState(value);
    setPage(1);
  }, []);

  return { page, pageSize, search, sort, setPage, setPageSize, setSearch, setSort };
}
