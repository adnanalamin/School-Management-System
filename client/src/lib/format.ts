export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function formatTime(value: number | Date): string {
  return timeFormatter.format(value);
}

const numberFormatter = new Intl.NumberFormat(undefined);

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(value: number | string | Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }): string {
  return new Intl.DateTimeFormat(undefined, options).format(new Date(value));
}

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/** "5 minutes ago", "yesterday", "in 3 days"; falls back to a date after a week. */
export function formatRelativeTime(value: number | string | Date, now: number = Date.now()): string {
  const diffSeconds = Math.round((new Date(value).getTime() - now) / 1000);
  const abs = Math.abs(diffSeconds);

  if (abs < 60) return relativeFormatter.format(diffSeconds, 'second');
  if (abs < 3_600) return relativeFormatter.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86_400) return relativeFormatter.format(Math.round(diffSeconds / 3_600), 'hour');
  if (abs < 7 * 86_400) return relativeFormatter.format(Math.round(diffSeconds / 86_400), 'day');
  return formatDate(value);
}
