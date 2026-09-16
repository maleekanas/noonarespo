import * as Sentry from "@sentry/nextjs";

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
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    // Keep tracing volume (and therefore Sentry usage/cost) modest by
    // default; raise this later from Vercel once real traffic volume is
    // known, no code change needed.
    tracesSampleRate: 0.1,
    // Don't attach cookies/IP/headers by default -- this app serves
    // children's accounts, so err on the side of not sending anything
    // beyond the error itself unless explicitly opted into later.
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
