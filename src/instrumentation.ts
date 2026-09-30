/**
 * Server + edge error monitoring, via Sentry.
 *
 * Before this file existed, the app had no centralized error reporting at
 * all -- a thrown error only ever reached a console.log/console.error line
 * in Vercel's function logs (ephemeral, not searchable, no alerting), even
 * though the user-facing error page claimed "تم تسجيل الخطأ داخلياً" (the
 * error has been logged internally). This makes that claim actually true.
 *
 * Entirely inert until SENTRY_DSN is set as an environment variable in
 * Vercel -- with no DSN, register() returns immediately and nothing about
 * app behavior changes from before this file existed. Get a free DSN at
 * https://sentry.io (generous free tier, no card required to start).
 */
export async function register() {
  return;
}

