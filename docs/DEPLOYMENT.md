# Deployment & Infrastructure Guide: Kids Arabic Academy

This document describes how Kids Arabic Academy is actually built, configured, and deployed today, so it can be used as a real operational reference rather than an aspirational one.

---

## 1. Hosting Architecture

- **Web & Application Tier**: Next.js App Router. **Production runs on Vercel** — this is the only deployment path that has been built, tested, and verified live (arabickidsacademy.com).
- **Self-hosting files (untested)**: A `Dockerfile` and `docker-compose.yml` (with an `nginx` reverse proxy and `certbot` for SSL) exist in the repo root as a possible future self-hosted alternative. They have never been deployed or verified against production data, so treat them as a starting point for a future migration, not a supported second deployment target, until someone actually runs and validates them end to end.
- **Database**: PostgreSQL, accessed through Prisma. Schema changes are applied with `prisma db push` — **there is no `prisma/migrations` folder**, so `prisma migrate deploy` does not apply here (see the checklist below).
- **Object Storage**: Amazon S3 (`me-central-1` by default) for audio recordings and homework/certificate attachments, via a signed-URL provider that automatically falls back to a safe sandbox mode when AWS credentials are absent (see Section 2).
- **Virtual Classrooms**: Zoom, Microsoft Teams, Google Meet, and Cisco Webex each have their own adapter that makes a real API call to that platform when its credentials are present (Zoom Server-to-Server OAuth, Microsoft Graph application permissions, Google Calendar API via a delegated service account, and a Webex OAuth Integration refresh token, respectively). If a platform isn't configured yet, or its live API call fails for any reason, the adapter falls back to a clearly-labeled sandbox session instead of breaking class scheduling. When a school hasn't chosen a specific platform, `MeetingManager.createBestAvailableSession()` picks the first configured one (Zoom, then Teams, then Meet, then Webex) automatically.
- **Live Classroom Real-Time Sync**: the in-app `/classroom/[id]` page (shared whiteboard, live "who's online" roster, hand-raise, reactions) runs on Pusher Channels, since a Vercel serverless function can't hold an open WebSocket server. Every classroom page is backed by a real `ClassSession` row (real enrolled roster, real assigned teacher, real scheduled start/end time) — there is no more hardcoded demo classroom. When Pusher isn't configured, the whiteboard still works locally for whoever's looking at it, clearly labeled "Solo mode" rather than silently pretending to be shared, and the hand-raise/reaction buttons are disabled rather than firing into the void.
- **Notifications**: WhatsApp (Meta Cloud API), SMS (a generic API key or Twilio), and Email (Resend or SMTP) — same pattern: real when configured, sandboxed when not.
- **Payments**: Stripe only. There is no "payment provider switch" — Stripe Checkout and the Stripe webhook are the one real, live payment path.
- **Error Monitoring**: Sentry, via `@sentry/nextjs`. Same activation pattern as everything else above — falls back to plain `console.error` (Vercel function logs only) when `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` are unset, and reports to Sentry once they're set. Free tier is enough to start.

---

## 2. Environment Configuration (`.env.example`)

This reflects the environment variables the application actually reads. Anything not listed here (e.g. `NEXTAUTH_URL`, `STORAGE_ENDPOINT`, `MEETING_PROVIDER`, `PAYMENT_PROVIDER`) is not used by the codebase and should not be relied on.

```bash
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="https://www.arabickidsacademy.com"
NEXT_PUBLIC_DEFAULT_LOCALE="ar"
NEXT_PUBLIC_HIDE_DEMO_SWITCHER="true"   # keep true in production — hides the demo/admin login shortcuts
NODE_ENV="production"

# Database (Prisma)
DATABASE_URL="postgresql://user:password@host:5432/kids_arabic_academy?schema=public"

# Sessions (custom cookie-based auth — this project does not use NextAuth)
SESSION_SECRET="a-long-random-string-at-least-32-characters"

# Object Storage — Amazon S3 (falls back to a sandboxed signed-URL simulator if unset)
AWS_S3_BUCKET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="me-central-1"

# Virtual Classrooms — each platform activates independently when its own keys are set,
# and makes a real call to that platform's API; any left blank (or whose live call fails)
# fall back to a working sandbox session instead of failing.
ZOOM_ACCOUNT_ID=""
ZOOM_CLIENT_ID=""
ZOOM_CLIENT_SECRET=""

# Requires a Teams-admin-granted application access policy for OnlineMeetings
# on MICROSOFT_ORGANIZER_USER_ID, in addition to the Azure app registration below
# (Microsoft Graph has no "/me" without a signed-in user, so app-only meeting
# creation needs an explicit organizer account).
MICROSOFT_TENANT_ID=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
MICROSOFT_ORGANIZER_USER_ID=""

# Google Meet links are generated via the Calendar API, which requires the service
# account to impersonate a real Workspace user (domain-wide delegation, granted by
# a Workspace admin) — that user is GOOGLE_IMPERSONATE_SUBJECT.
GOOGLE_SERVICE_ACCOUNT_EMAIL=""
GOOGLE_PRIVATE_KEY=""
GOOGLE_IMPERSONATE_SUBJECT=""

# Cisco Webex has no server-only auth mode for self-serve developers — the school's
# Webex account owner authorizes a Webex OAuth Integration once, which produces a
# long-lived refresh token that this adapter exchanges for a fresh access token on
# every call.
WEBEX_CLIENT_ID=""
WEBEX_CLIENT_SECRET=""
WEBEX_REFRESH_TOKEN=""

# Live Classroom Real-Time Sync — Pusher Channels. Powers the shared whiteboard,
# live roster, hand-raise, and reactions in /classroom/[id]. Falls back to an
# honestly-labeled solo/local-only whiteboard when unset. PUSHER_KEY/CLUSTER are
# not secrets (the browser SDK uses them directly), so they're read from the
# NEXT_PUBLIC_ vars on both the server and the client — set each one once.
PUSHER_APP_ID=""
PUSHER_SECRET=""
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""    # e.g. "mt1", "eu", "ap2" — shown on the Pusher app dashboard

# Notifications — each channel activates independently when configured
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
SMS_API_KEY=""                 # or TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
RESEND_API_KEY=""               # or SMTP_HOST for a generic SMTP relay
SMTP_HOST=""
FROM_EMAIL="Arabic Kids Academy <onboarding@resend.dev>"

# Where /schools institutional applications are emailed (uses RESEND_API_KEY above).
# Without RESEND_API_KEY configured, inquiries are honestly mocked/logged, not lost silently.
B2B_SALES_EMAIL="partnerships@arabickidsacademy.com"

# Payments — Stripe is the only real payment integration
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Error Monitoring — Sentry (falls back to Vercel function logs only if unset)
SENTRY_DSN=""                   # server + edge errors
NEXT_PUBLIC_SENTRY_DSN=""       # browser errors (safe to expose — write-only)

# AI Tutor & Review Translation — Anthropic Claude. Powers the AI Tutor
# (falls back to a scripted practice conversation if unset) and live
# translation of parent reviews/academy replies into non-Arabic locales
# (falls back to showing the original text as written if unset or a call fails).
ANTHROPIC_API_KEY=""

# Marketing & CRM Integrations — typed adapters sync leads from contact, inquiry,
# and teacher career portals. If unset, leads are gracefully logged in-memory.
HUBSPOT_API_KEY=""
GOHIGHLEVEL_API_KEY=""
GOHIGHLEVEL_LOCATION_ID=""
MAILCHIMP_API_KEY=""
MAILCHIMP_SERVER_PREFIX=""
MAILCHIMP_LIST_ID=""
CRM_PRIMARY_PROVIDER=""          # "hubspot" | "gohighlevel" | "mailchimp" (default: in-memory mock)
```

---

## 3. Production Release Checklist

1. `npm run typecheck` passes with zero errors.
2. `npm run lint` passes without warnings.
3. `npx prisma db push` successfully applies the current schema to the target database (this project uses schema push, not migration files — there is no `migrate deploy` step).
4. Production build `npm run build` finishes cleanly.
5. Critical smoke tests verify login, RTL switching, and dashboard rendering.

*(Windows Command Prompt users can substitute `npm.cmd` / `npx.cmd` for the commands above — that's a shell quirk, not a project requirement.)*
