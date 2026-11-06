import { useNavigation } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Thin bar at the top of the viewport while a lazy route chunk or loader is in flight. */
export function NavigationProgress() {
  const navigation = useNavigation();
  const active = navigation.state !== 'idle';

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 bg-accent transition-opacity duration-200',
        active ? 'animate-pulse opacity-100' : 'opacity-0',
      )}
    />
  );
}
