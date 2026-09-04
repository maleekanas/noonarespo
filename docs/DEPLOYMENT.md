# Deployment & Infrastructure Guide: Kids Arabic Academy

Kids Arabic Academy is designed for modern cloud container and serverless environments.

---

## 1. Hosting Architecture

- **Web & Application Tier**: Next.js App Router deployed on Vercel or Docker container.
- **Database**: Managed PostgreSQL (Supabase, Neon, AWS RDS, or Railway) with connection pooling (`PgBouncer` or Prisma Accelerate).
- **Object Storage**: S3-compatible cloud storage (Cloudflare R2, AWS S3) for audio recordings, homework attachments, and certificates.
- **Background Jobs**: Scheduled crons (Vercel Cron or Inngest) for recurring session generation, subscription renewal invoices, and attendance reminders.

---

## 2. Environment Configuration (`.env.example`)

```bash
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_LOCALE="ar"
NODE_ENV="development"

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kids_arabic_academy?schema=public"

# Authentication & Encryption
AUTH_SECRET="super-secret-random-key-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Storage (S3 / Cloudflare R2)
STORAGE_ENDPOINT="https://<accountid>.r2.cloudflarestorage.com"
STORAGE_ACCESS_KEY_ID="mock-storage-key"
STORAGE_SECRET_ACCESS_KEY="mock-storage-secret"
STORAGE_BUCKET_NAME="kids-arabic-academy-private"

# Virtual Classrooms
MEETING_PROVIDER="MOCK" # Options: MOCK, ZOOM, TEAMS, MEET
ZOOM_API_KEY=""
ZOOM_API_SECRET=""

# Payments
PAYMENT_PROVIDER="MOCK" # Options: MOCK, STRIPE
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

---

## 3. Production Release Checklist
1. `npm.cmd run typecheck` passes with zero errors.
2. `npm.cmd run lint` passes without warnings.
3. `npx.cmd prisma migrate deploy` successfully applies pending migrations.
4. Production build `npm.cmd run build` finishes cleanly.
5. Critical smoke tests verify login, RTL switching, and dashboard rendering.
