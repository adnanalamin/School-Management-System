import { readFileSync } from 'node:fs';
import path from 'node:path';

/** Reads the version from server/package.json (works from both src/ and dist/). */
function readVersion(): string {
  try {
    const raw = readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      typeof parsed.version === 'string'
    ) {
      return parsed.version;
    }
  } catch {
    // Fall through to the default below.
  }
  return '0.0.0';
}

export const APP_VERSION = readVersion();
