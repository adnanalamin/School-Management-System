import { env } from '@/lib/env';
import { cn } from '@/lib/utils';

/** Ruled page with a margin line: the product mark. Colours come from design tokens. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn('size-8', className)}>
      <rect x="2" y="2" width="28" height="28" rx="7" className="fill-primary" />
      <path d="M10 12h13M10 17h13M10 22h8" className="stroke-white" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 5v22" className="stroke-accent" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="font-display text-lg font-semibold leading-tight tracking-tight">{env.VITE_APP_NAME}</span>
    </span>
  );
}
