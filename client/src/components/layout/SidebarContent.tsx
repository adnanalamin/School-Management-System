import { Link } from 'react-router-dom';
import { Logo, LogoMark } from '@/components/common/Logo';
import { StatusDot, stateLabel } from '@/features/system/StatusIndicator';
import { useSystemStatus } from '@/features/system/useSystemStatus';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';
import { getNavGroups } from './navigation';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarContentProps {
  /** Icon-only layout (desktop only). */
  collapsed?: boolean;
  /** Called after a link is chosen, so the mobile drawer can close itself. */
  onNavigate?: () => void;
}

export function SidebarContent({ collapsed = false, onNavigate }: SidebarContentProps) {
  const groups = getNavGroups();
  const { state, data } = useSystemStatus();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn('flex h-16 shrink-0 items-center border-b border-sidebar-border', collapsed ? 'justify-center' : 'px-5')}>
        <Link to="/app" aria-label={`${env.VITE_APP_NAME} dashboard`} className="rounded-md">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, index) => (
          <div key={group.label ?? 'primary'} className={cn('space-y-1', index > 0 && 'mt-5')}>
            {group.label ? (
              collapsed ? (
                <div aria-hidden="true" className="mx-3 mb-2 h-px bg-sidebar-border" />
              ) : (
                <p className="px-3 pb-1 text-xs font-medium text-sidebar-foreground/60">{group.label}</p>
              )
            ) : null}
            {group.items.map((item) => (
              <SidebarNavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className={cn('shrink-0 space-y-1 border-t border-sidebar-border py-4 text-xs text-sidebar-foreground/70', collapsed ? 'flex justify-center px-0' : 'px-5')}>
        <p className="flex items-center gap-2" title={stateLabel(state)}>
          <StatusDot state={state} />
          <span className={cn(collapsed && 'sr-only')}>{stateLabel(state)}</span>
        </p>
        {data && !collapsed ? <p>Server v{data.version}</p> : null}
      </div>
    </div>
  );
}
