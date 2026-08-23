/**
 * Application Mode Configuration
 *
 * NEXT_PUBLIC_APP_MODE must be explicitly set in the environment.
 * - "demo": Exposes demo seeding tools, developer sandbox, test controls.
 * - "production": Hides demo-only UI controls.
 *
 * In BOTH modes:
 * - All data flows through Supabase. No mock arrays are returned by services.
 * - DB query succeeds → return data
 * - DB query returns empty → return []
 * - DB query fails → throw structured error
 *
 * The mode ONLY controls which UI controls are visible (seed buttons, sandbox).
 * The database layer works identically in both modes.
 */

export type AppMode = 'demo' | 'production';

export function getAppMode(): AppMode {
  const mode = process.env.NEXT_PUBLIC_APP_MODE;

  if (mode === 'demo' || mode === 'production') {
    return mode;
  }

  throw new Error(
    'NEXT_PUBLIC_APP_MODE must be explicitly set to "demo" or "production". ' +
    'Set it in .env.local for local development or in your deployment environment variables.'
  );
}

export function isDemo(): boolean {
  return getAppMode() === 'demo';
}

export function isProduction(): boolean {
  return getAppMode() === 'production';
}
