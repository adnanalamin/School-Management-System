import { SearchX, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { RowActions } from '@/components/common/RowActions';
import { SearchInput } from '@/components/common/SearchInput';
import { SideDrawer } from '@/components/common/SideDrawer';
import { StatusBadge, type StatusTone } from '@/components/common/StatusBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { DataTable, type DataTableColumn } from '@/components/data-table/DataTable';
import { applyClientTable } from '@/components/data-table/table-utils';
import { useDataTableState } from '@/components/data-table/useDataTableState';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError } from '@/lib/api/errors';
import { formatDate } from '@/lib/format';
import { sampleStudents, type SampleStudent, type SampleStudentStatus } from '@/mocks/people';
import { Section } from './Section';

type PreviewMode = 'loaded' | 'loading' | 'empty' | 'error';

const statusTone: Record<SampleStudentStatus, { tone: StatusTone; label: string }> = {
  active: { tone: 'success', label: 'Active' },
  pending: { tone: 'warning', label: 'Pending' },
  inactive: { tone: 'neutral', label: 'Inactive' },
};

const sortAccessors = {
  name: (row: SampleStudent) => row.name,
  className: (row: SampleStudent) => row.className,
  status: (row: SampleStudent) => row.status,
  admittedOn: (row: SampleStudent) => row.admittedOn,
};

const searchFields = [(row: SampleStudent) => row.name, (row: SampleStudent) => row.email, (row: SampleStudent) => row.className, (row: SampleStudent) => row.guardian];

const demoError = new ApiError({ status: 503, code: 'SERVICE_UNAVAILABLE', message: 'The students service is not responding.', requestId: 'demo-3f2a9c1e' });

function isPreviewMode(value: string): value is PreviewMode {
  return value === 'loaded' || value === 'loading' || value === 'empty' || value === 'error';
}

export function DataTab() {
  const table = useDataTableState({ pageSize: 10 });
  const [mode, setMode] = useState<PreviewMode>('loaded');
  const [students, setStudents] = useState<SampleStudent[]>(sampleStudents);
  const [selected, setSelected] = useState<SampleStudent | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<SampleStudent | null>(null);

  const result = useMemo(
    () =>
      applyClientTable(mode === 'empty' ? [] : students, {
        search: table.search,
        searchFields,
        sort: table.sort,
        sortAccessors,
        page: table.page,
        pageSize: table.pageSize,
      }),
    [mode, students, table.search, table.sort, table.page, table.pageSize],
  );

  const columns: DataTableColumn<SampleStudent>[] = [
    {
      id: 'name',
      header: 'Student',
      sortable: true,
      mobile: 'title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.name} className="size-9" />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { id: 'className', header: 'Class', sortable: true, cell: (row) => row.className },
    { id: 'guardian', header: 'Guardian', cell: (row) => row.guardian },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <StatusBadge tone={statusTone[row.status].tone}>{statusTone[row.status].label}</StatusBadge>,
    },
    { id: 'admittedOn', header: 'Admitted', sortable: true, cell: (row) => formatDate(row.admittedOn) },
    {
      id: 'actions',
      header: 'Actions',
      hideHeader: true,
      align: 'right',
      mobile: 'actions',
      cell: (row) => (
        <RowActions
          label={`Actions for ${row.name}`}
          actions={[
            { label: 'View details', onSelect: () => setSelected(row) },
            { label: 'Remove', destructive: true, onSelect: () => setPendingRemoval(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <Section
        title="Data table"
        description="A real table from the md breakpoint up and stacked cards on phones. Search, sort and paging are client-side here; a server-driven list uses the same state and components."
      >
        <DataTable
          caption="Students"
          columns={columns}
          rows={result.rows}
          getRowId={(row) => row.id}
          isLoading={mode === 'loading'}
          error={mode === 'error' ? demoError : undefined}
          onRetry={() => setMode('loaded')}
          sort={table.sort}
          onSortChange={table.setSort}
          toolbar={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput label="Search students" placeholder="Search by name, email, class or guardian" value={table.search} onChange={table.setSearch} className="sm:w-80" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Preview state</span>
                <Select value={mode} onValueChange={(value) => isPreviewMode(value) && setMode(value)}>
                  <SelectTrigger aria-label="Preview state" className="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loaded">Loaded</SelectItem>
                    <SelectItem value="loading">Loading</SelectItem>
                    <SelectItem value="empty">Empty</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
          emptyState={
            table.search ? (
              <EmptyState
                icon={SearchX}
                title="No students match your search"
                description="Try a different name, class or guardian."
                action={
                  <Button variant="outline" size="sm" onClick={() => table.setSearch('')}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <EmptyState icon={Users} title="No students yet" description="Students you add will be listed here." />
            )
          }
          footer={
            <Pagination
              page={result.page}
              pageSize={table.pageSize}
              total={result.total}
              itemLabel="students"
              onPageChange={table.setPage}
              onPageSizeChange={table.setPageSize}
            />
          }
        />
      </Section>

      <SideDrawer
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.name ?? 'Student'}
        description="Details drawer. The table stays visible behind it."
        footer={<Button variant="outline" onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected ? (
          <dl className="space-y-4 text-sm">
            {[
              ['Email', selected.email],
              ['Class', selected.className],
              ['Guardian', selected.guardian],
              ['Admitted', formatDate(selected.admittedOn)],
            ].map(([term, value]) => (
              <div key={term} className="grid grid-cols-3 gap-2">
                <dt className="text-muted-foreground">{term}</dt>
                <dd className="col-span-2 font-medium">{value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="col-span-2">
                <StatusBadge tone={statusTone[selected.status].tone}>{statusTone[selected.status].label}</StatusBadge>
              </dd>
            </div>
          </dl>
        ) : null}
      </SideDrawer>

      <ConfirmDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
        title={`Remove ${pendingRemoval?.name ?? 'this student'}?`}
        description="This removes the student from the demo list. Real deletions will be recorded in the audit log."
        confirmLabel="Remove student"
        destructive
        onConfirm={() => {
          if (pendingRemoval) {
            setStudents((items) => items.filter((item) => item.id !== pendingRemoval.id));
            toast.success(`${pendingRemoval.name} removed from the demo list`);
          }
          setPendingRemoval(null);
        }}
      />
    </div>
  );
}
