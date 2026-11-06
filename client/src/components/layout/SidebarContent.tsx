import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { StatusDot, stateLabel } from '@/features/system/StatusIndicator';
import { useSystemStatus } from '@/features/system/useSystemStatus';
import { cn } from '@/lib/utils';
import { getNavGroups } from './navigation';

interface SidebarContentProps {
  /** Called after a link is chosen, so the mobile drawer can close itself. */
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const groups = getNavGroups();
  const { state, data } = useSystemStatus();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>

      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group, index) => (
          <div key={group.label ?? index} className="space-y-1">
            {group.label ? (
              <p className="px-3 pb-1 text-xs font-medium text-sidebar-foreground/60">{group.label}</p>
            ) : null}
            {group.items.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" /> : null}
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/70">
        <p className="flex items-center gap-2">
          <StatusDot state={state} />
          {stateLabel(state)}
        </p>
        {data ? <p>Server v{data.version}</p> : null}
      </div>
    </div>
  );
}
