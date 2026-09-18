# Requirements Validation & Completion Plan — 2026-09-18

Source of truth: uploaded MANUS implementation instructions + expanded PROJECT_BRIEF, audited against main at 5e61e8ecd585ef9c4354c772180530764f29c55f.

## Validation rule
A feature is COMPLETE only when UI, server logic, persistence, authorization, validation, error/loading/empty states, RTL/accessibility, tests, documentation and production behavior are present. A schema model, mock, marketing card, or adapter alone is not counted as complete.

## Confirmed implemented / substantially implemented
- Next.js 15 / React / TypeScript / Tailwind application shell.
- PostgreSQL + Prisma data layer.
- Custom secure session authentication, public parent registration, email verification, password reset and account settings.
- Role-based dashboards and server-side policies for core roles.
- Parent/child profiles and relationships.
- Programs, courses, classes, enrollment, scheduling, attendance, assignments, submissions, feedback and progress services.
- Assessments/placement, gradebook, certificates, gamification.
- Parent engagement, supervised communication and notifications.
- Stripe subscription checkout, webhook handling, billing portal and 1-day trial.
- Teacher compensation/payroll service.
- Multi-tenant school/institution repository and services.
- Live classroom service with Pusher-based realtime capability and meeting-provider adapters.
- Arabic/English/Dutch/Turkish/Italian/Spanish locale dictionaries and RTL foundation.
- S3 storage adapter, Sentry integration hooks, health checks, rate limiting and audit logging.
- AI tutor/assistive service boundaries.
- SEO/public metadata infrastructure and PWA manifest.
- Unit coverage for policies, billing, enrollment, attendance, progress, classroom, integrations, storage, gamification and academic phases.

## Missing or not complete against the expanded PROJECT_BRIEF
### P0 — release/security/data
- Multi-factor authentication is required by the brief but no MFA implementation is present.
- Production super-admin password rotation remains an operational requirement if the seeded default has not been changed.
- Latest EmailVerificationToken schema change must be applied to production and the registration→verification→trial checkout flow must be E2E verified.
- Full cross-tenant authorization must be proven for every protected mutation/query, not inferred from repository presence.
- Critical Playwright E2E journeys required by MANUS are not present in the current test tree.

### P1 — finance
- PayPal gateway: missing.
- Mollie gateway: missing.
- Apple Pay / Google Pay are not separately implemented/validated (they may be surfaced through Stripe only when enabled in the Stripe account).
- TaxRate domain model/workflow: missing.
- Full failed-payment recovery/dunning workflow needs explicit production validation.
- Profitability/growth reporting needs complete real-data validation.

### P1 — identity/student data
- EmergencyContact domain model/workflow required by MANUS: missing.
- MFA enrollment/recovery/challenge flow: missing.

### P1 — integrations
- HubSpot CRM: missing.
- GoHighLevel CRM: missing.
- Mailchimp: missing.
- Redis caching layer from the expanded brief: missing.
- Google Analytics / Google Tag Manager / Meta Pixel need explicit code/config validation before being marked complete.
- External Zoom/Teams/Meet, WhatsApp/Twilio/SMTP and S3 are adapter/configuration-dependent; they must not be described as live unless production credentials and live calls are verified.

### P2 — mobile
- Native iOS Student app: missing.
- Native Android Student app: missing.
- Native Parent app: missing.
- Native Teacher app: missing.
- Current PWA/responsive web support is not equivalent to the native mobile applications requested by the brief.

### P2 — advanced product completeness
- Full curriculum builder/learning-objective/outcome workflow needs requirement-level verification.
- Recorded-session management, screen sharing and file sharing need live classroom E2E verification.
- All requested assessment question types, especially audio response and voice recording, need E2E verification.
- AI Teacher Assistant capabilities must be individually validated; an AI service boundary alone is insufficient.
- Weekly/monthly parent reports and real-time notification delivery require E2E validation.
- Referral and affiliate programs are not verified as implemented.
- NPS, parent satisfaction and teacher satisfaction KPI collection/workflows are not verified.
- Thousands-of-concurrent-users scalability is a load-test/operations criterion and is not proven by a successful build.

## Requirement conflicts / safe interpretation
- The expanded brief says “GDPR Compliance” and “COPPA Compliance”; MANUS explicitly says not to claim legal compliance without legal and operational review. Product copy and docs must use “designed for” / “privacy principles” language until legal review is complete.
- The expanded brief lists NestJS or Express, while the engineering instructions specify Next.js App Router server components/actions/route handlers. The existing Next.js server architecture is retained rather than adding a second backend without a demonstrated need.
- Native mobile applications are treated as separate deliverables, not as proof obligations satisfied by the PWA.

## Completion sequence
1. P0 security + production E2E: MFA, migration verification, tenant isolation tests, Playwright critical journeys.
2. Finance completion: gateway abstraction expansion, PayPal/Mollie adapters, tax model, dunning and reporting.
3. Identity/data completion: EmergencyContact and associated privacy/authorization workflows.
4. Integrations: CRM/marketing analytics + Redis where justified by measured workload.
5. Product-depth validation: classroom media, assessment modalities, reports, AI teacher tools, referrals/affiliates/KPIs.
6. Native mobile apps as separate iOS/Android deliverables.
7. Load, accessibility, RTL, security and production release certification.

## Do-not-claim list
Until verified in production, do not market: legal compliance, native apps, PayPal/Mollie, CRM integrations, MFA, or scale/concurrency guarantees as live.
