"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

let initialized = false;

/**
 * Client-side counterpart to src/instrumentation.ts (which only covers the
 * server and edge runtimes). Rendered once, invisibly, from the root
 * layout. Entirely inert until NEXT_PUBLIC_SENTRY_DSN is set in Vercel --
 * that env var is intentionally separate from the server-side SENTRY_DSN
 * because anything NEXT_PUBLIC_* ships in the browser bundle, so only the
 * public DSN (safe to expose -- it can only submit events, not read data)
 * belongs here.
 */
export function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn || initialized) return;
    initialized = true;

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      // Cross-browser spellings of the same benign, framework-internal
      // failure: the browser's fetch() rejecting with a bare network-level
      // TypeError because the request was interrupted by something outside
      // the app's control -- the tab closing/backgrounding mid-navigation,
      // the connection dropping, or an ad-blocker/privacy extension
      // blocking the request. Next.js's own App Router client uses fetch()
      // internally for every client-side navigation (RSC payload fetch,
      // <Link> prefetch, Server Action submission), so these surface with a
      // stack trace that is 100% inside Next's minified chunks -- never a
      // single frame of this app's own code -- and are not fixable here.
      // This is Sentry's own documented mitigation for this exact pattern;
      // without it, every flaky mobile connection or ad-blocked user files
      // a new "issue" that looks like a real outage but isn't one.
      ignoreErrors: [
        "Failed to fetch",
        "NetworkError when attempting to fetch resource",
        "Load failed",
        "TypeError: cancelled",
      ],
    });
  }, []);

  return null;
}
