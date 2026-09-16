# Deployment & Infrastructure Guide: Kids Arabic Academy

This document describes how Kids Arabic Academy is actually built, configured, and deployed today, so it can be used as a real operational reference rather than an aspirational one.

---

## 1. Hosting Architecture

- **Web & Application Tier**: Next.js App Router. **Production runs on Vercel** — this is the only deployment path that has been built, tested, and verified live (arabickidsacademy.com).
- **Self-hosting files (untested)**: A `Dockerfile` and `docker-compose.yml` (with an `nginx` reverse proxy and `certbot` for SSL) exist in the repo root as a possible future self-hosted alternative. They have never been deployed or verified against production data, so treat them as a starting point for a future migration, not a supported second deployment target, until someone actually runs and validates them end to end.
- **Database**: PostgreSQL, accessed through Prisma. Schema changes are applied with `prisma db push` — **there is no `prisma/migrations` folder**, so `prisma migrate deploy` does not apply here (see the checklist below).
- **Object Storage**: Amazon S3 (`me-central-1` by default) for audio recordings and homework/certificate attachments, via a signed-URL provider that automatically falls back to a safe sandbox mode when AWS credentials are absent (see Section 2).
- **Virtual Classrooms**: Zoom, Microsoft Teams, and Google Meet each have their own adapter that activates automatically when that platform's credentials are present, and otherwise falls back to a working sandbox/mock session so the app never breaks in development.
- **Notifications**: WhatsApp (Meta Cloud API), SMS (a generic API key or Twilio), and Email (Resend or SMTP) — same pattern: real when configured, sandboxed when not.
- **Payments**: Stripe only. There is no "payment provider switch" — Stripe Checkout and the Stripe webhook are the one real, live payment path.

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

# Virtual Classrooms — each platform activates independently when its own keys are set;
# any left blank fall back to a working sandbox session instead of failing.
ZOOM_ACCOUNT_ID=""
ZOOM_CLIENT_ID=""
ZOOM_CLIENT_SECRET=""

MICROSOFT_TENANT_ID=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""

GOOGLE_SERVICE_ACCOUNT_EMAIL=""
GOOGLE_PRIVATE_KEY=""

# Notifications — each channel activates independently when configured
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
SMS_API_KEY=""                 # or TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
RESEND_API_KEY=""               # or SMTP_HOST for a generic SMTP relay
SMTP_HOST=""
FROM_EMAIL="Arabic Kids Academy <onboarding@resend.dev>"

# Payments — Stripe is the only real payment integration
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

---

## 3. Production Release Checklist

1. `npm run typecheck` passes with zero errors.
2. `npm run lint` passes without warnings.
3. `npx prisma db push` successfully applies the current schema to the target database (this project uses schema push, not migration files — there is no `migrate deploy` step).
4. Production build `npm run build` finishes cleanly.
5. Critical smoke tests verify login, RTL switching, and dashboard rendering.

*(Windows Command Prompt users can substitute `npm.cmd` / `npx.cmd` for the commands above — that's a shell quirk, not a project requirement.)*
