"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Catches errors thrown above src/app/[locale]/error.tsx's reach -- i.e. in
 * [locale]/layout.tsx itself, which functions as this app's root layout
 * (there is no separate app/layout.tsx). Next.js requires this file to
 * render its own <html>/<body> since it replaces the root layout entirely
 * when it activates, so it can't use the app's normal styling/dictionary;
 * it's a plain, dependency-free fallback by design.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error (root):", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
            We&apos;re sorry for the interruption. The error has been recorded and won&apos;t
            affect your account data.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: "0.75rem",
              background: "#4f46e5",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
