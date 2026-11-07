# Phase 02: Professional UI/UX system

Frontend only. No backend changes, no database changes, no new API endpoints. Everything that needs data uses clearly labelled sample data behind the same hooks the real API will use.

## Verification status

Authored in a sandbox without network access, so `npm install` could not run.

| Check | Status |
| --- | --- |
| Syntax of all `.ts`/`.tsx` files | Passed |
| Every relative and `@/` import resolves; every third-party import is declared in `package.json` | Passed |
| Tailwind v3 audit: every opacity modifier (`bg-x/NN`) exists in the default scale | Passed (found and fixed one Phase 1 bug, see below) |
| Partial type-check with TypeScript 6.0.3 | No diagnostic traces to our own code; every one traces to React/Radix/Vite/Express types not being installed here |
| Full type-check, build, tests, browser run | **Not run** (needs `npm install`) |
| Screen-reader and keyboard testing | **Not run** |

The partial type-check is weak evidence: with dependency types missing, many values become `any`. Treat `npm run typecheck` on your machine as the real gate.

Phase 1 bug found and fixed: `Badge` used `bg-success/12`, `/12` is not in Tailwind v3's opacity scale, so those tint backgrounds would not have been generated. Now `/10`.

## What changed

New dependencies (client): `@radix-ui/react-avatar`, `-checkbox`, `-dropdown-menu`, `-popover`, `-select`, `-switch`, `-tabs`, `-tooltip`, `cmdk`, `recharts`. Run `npm install` again.

### Modified (12)
`client/package.json`, `tailwind.config.ts` (chart colours), `src/index.css` (chart tokens), `src/lib/format.ts` (number, date, relative time), `src/app/providers.tsx` (tooltip provider), `src/app/router.tsx` (breadcrumb handles, module placeholders), `layout/AppShell.tsx`, `layout/SidebarContent.tsx`, `layout/Topbar.tsx`, `layout/navigation.ts`, `ui/badge.tsx` (bug fix), `pages/app/DesignSystemPage.tsx` (now a tabbed style guide).

### Removed (1)
`pages/app/OverviewPage.tsx`: replaced by `DashboardPage.tsx`; the `/app` route is unchanged.

### New (55)
- **ui primitives:** avatar, checkbox, command, dialog, dropdown-menu, popover, select, switch, table, tabs, textarea, tooltip
- **common:** Modal, SideDrawer, Pagination, SearchInput, StatCard (+ skeleton), StatusBadge, UserAvatar, RowActions, ProgressBar
- **data-table:** DataTable, `table-utils.ts` (sort cycle, client search/sort/paginate), `useDataTableState`
- **forms:** `fields.tsx` (FormInputField, FormTextareaField, FormSelectField, FormCheckboxField, FormSwitchField)
- **layout:** Breadcrumbs, SidebarNavItem
- **features:** account (UserMenu), notifications (NotificationMenu), search (GlobalSearch command palette), dashboard (charts, cards, skeleton, `useDashboard`)
- **hooks:** `use-debounced-value`, `use-sidebar-collapsed`
- **mocks:** sample user, notifications, students, dashboard figures
- **pages:** DashboardPage, ModulePlaceholderPage, and `design-system/` (Foundations, Forms, Data, Feedback, Overlays tabs + a demo AdmissionForm)

## Requirement coverage

| # | Requirement | Where |
| --- | --- | --- |
| 1 | Dashboard | `/app`: stat cards, attendance chart (week/month tabs), fee collection, activity, upcoming dates, quick links, full-page skeleton and error state |
| 2 | Responsive sidebar | Fixed from `lg`, collapsible to icons with tooltips (remembered per browser), grouped navigation, active marker |
| 3 | Top navigation | `Topbar`: menu/collapse toggle, search, status, notifications, theme, account |
| 4 | Breadcrumbs | `Breadcrumbs`, driven by `handle.crumb` on routes |
| 5 | Global search UI | `GlobalSearch`: Ctrl/⌘ + K command palette over pages and actions |
| 6 | Notifications | `NotificationMenu`: popover, unread badge, All/Unread tabs, mark read, empty state |
| 7 | User menu | `UserMenu`: profile, settings, theme radio group, sign-out with confirmation |
| 8 | Mobile navigation | Sheet drawer below `lg`, closes on navigation |
| 9 | Dark/light | Toggle in header and user menu, plus command palette; no flash on load |
| 10 | Responsive tables | `DataTable`: real `<table>` from `md`, stacked cards on phones, sortable headers with `aria-sort` |
| 11 | Cards | `Card`, `StatCard`, chart and list cards |
| 12 | Modals | `Modal` (fixed header/footer, scrolling body) |
| 13 | Drawers | `SideDrawer` (left/right, three widths) |
| 14 | Forms | `fields.tsx` + `Form`, RHF and Zod; `AdmissionForm` shows every control type |
| 15 | Tabs | `Tabs` (dashboard chart, notifications, design-system sections) |
| 16 | Dropdowns | `DropdownMenu`, `Select`, `RowActions` |
| 17 | Pagination | `Pagination`: summary, page numbers with ellipsis, rows per page, mobile-compact |
| 18 | Skeleton loaders | `Skeleton`, `StatCardSkeleton`, `DashboardSkeleton`, table skeleton rows |
| 19 | Toasts | Sonner, wired to theme; examples incl. undo and promise |
| 20 | Empty states | `EmptyState` (and the table's empty slot) |
| 21 | Error states | `ErrorState`, table error slot, route and app error boundaries |
| 22 | Confirmation dialogs | `ConfirmDialog` (destructive and neutral, with loading) |

Preview all of it at `/app/design-system` (development only; excluded from production builds).

## Using the pieces

```tsx
// A list screen: state in one hook, rendering in one component.
const table = useDataTableState({ pageSize: 10 });
<DataTable
  caption="Students" columns={columns} rows={rows} getRowId={(r) => r.id}
  isLoading={query.isPending} error={query.error} onRetry={() => query.refetch()}
  sort={table.sort} onSortChange={table.setSort}
  toolbar={<SearchInput label="Search students" value={table.search} onChange={table.setSearch} />}
  emptyState={<EmptyState ... />}
  footer={<Pagination page={table.page} pageSize={table.pageSize} total={total} onPageChange={table.setPage} onPageSizeChange={table.setPageSize} />}
/>
```
`table.page`, `pageSize`, `search` and `sort` are exactly the query parameters a server-driven list sends. `applyClientTable()` does the same in memory for small static lists.

A form in a drawer or modal: give the `<form>` an `id`, put the buttons in the `footer`, and set the submit button's `form="<id>"`.

Adding a module: remove its `planned` flag in `layout/navigation.ts`, replace its placeholder route in `app/router.tsx` with the real lazy route and a `handle.crumb`.

## Sample data

Everything under `src/mocks/` is illustrative and is labelled as such in the UI ("Sample data" badge on the dashboard; "layout preview" on demo forms). Dates are generated relative to now. To connect real data, replace the body of each hook (`useDashboard`, `useNotifications`, `useCurrentUser`); components do not change. The navigation lists modules that do not exist yet with a "Soon" tag and an explanatory page, so the information architecture can be judged.

Placeholders that do nothing yet, by design: sign-out (shows an explanatory toast), profile and settings pages, notification delivery.

## Accessibility notes

Skip link; landmarks (`header`, `aside` with `nav`, `main`); `aria-current="page"` on navigation and breadcrumbs; `aria-sort` on sortable columns; `aria-live` pagination summary; labelled icon-only buttons; tooltips on collapsed sidebar items; focus-visible rings; dialogs and drawers trap focus and restore it (Radix); charts have a text alternative and an off-screen data table; status never relies on colour alone; `prefers-reduced-motion` honoured. Touch targets are 36 to 40 px. Not yet verified with a screen reader or automated tooling such as axe.

## Security considerations

UI only, no new attack surface on the server. The sample user and data contain no real personal information. The sign-out action does not pretend to end a session. Authorization-aware navigation (hiding links by permission) is not implemented yet and will not be a substitute for server checks when it is.

## Commands

```bash
npm install            # new dependencies
npm run typecheck
npm run build
npm run dev            # open http://localhost:5173/app and /app/design-system
```
Check by hand: resize from 360 px to 1440 px; toggle dark mode; collapse the sidebar; press Ctrl/⌘ + K; open the notification menu; tab through the header; in Design system, use the "Preview state" selector to see loading, empty and error tables.
