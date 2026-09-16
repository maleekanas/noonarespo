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
    });
  }, []);

  return null;
}
