# Engineering Implementation Roadmap: Kids Arabic Academy

This roadmap outlines the complete phased development lifecycle for Kids Arabic Academy, reflecting 100% implementation of `APP.md` and `PROJECT_BRIEF.md`.

---

## Completed Phases

### Phase 0: Discovery, Architecture & Governance
- [x] Initial documentation suite (`ARCHITECTURE.md`, `ASSUMPTIONS.md`, `DATABASE.md`, `SECURITY.md`, `USER_ROLES.md`, `TESTING.md`, `DEPLOYMENT.md`, `CHANGELOG.md`).
- [x] Multi-tenant B2B, child-safety threat model, and COPPA/GDPR compliance baseline.

### Phase 1: Application Foundation & Design System
- [x] Next.js 15 App Router, React 19, strict TypeScript, Tailwind CSS, BiDi RTL/LTR layout.
- [x] Prisma ORM with PostgreSQL database schema and seed data.
- [x] Authentication engine with bcrypt password hashing, session cookies, rate limiting, email verification, and password reset.

### Phase 2: Core Academic MVP
- [x] Student, Parent, and Teacher user profiles with verifiable guardian relationships.
- [x] 7 Comprehensive Academic Programs, 14 courses, 17 CEFR levels (Pre-A1 to B2).
- [x] Micro-cohort class groups strictly capped at max 6 students with certified teacher assignments.
- [x] Scheduling engine with recurrence rules (RRULE) and conflict detection.

### Phase 3: Parent Engagement & Transparency
- [x] Parent portal with multi-child switcher, attendance summaries, and weekly reports.
- [x] Full lesson recording and audio playback oversight.
- [x] Supervised in-app parent-teacher messaging and meeting scheduling.
- [x] Curated printable worksheets library for offline handwriting and tracing practice.

### Phase 4: Operations & Administration
- [x] School Admin dashboard (scoped to `PartnerSchool` with bulk roster onboarding).
- [x] Academic Admin dashboard (curriculum builder, CEFR benchmark tracking).
- [x] Super Admin dashboard (system health, audit logs, feature flags, data export).
- [x] Support Agent dashboard (user lookup, session diagnostics, admissions inbox).

### Phase 5: Financial Operations & Engineering
- [x] Subscription plans in integer minor units (Individual $79, Family $149, Group $99, Private $199).
- [x] Parent billing portal with Stripe checkout, self-service billing portal, and PDF invoices.
- [x] Teacher payroll calculator based on completed teaching hours and student evaluations.
- [x] Idempotent payment processing with refund tracking.

### Phase 6: Assessments, Placement & Gamification
- [x] Multi-format assessment runner supporting 7 question types (MCQ, True/False, Matching, Fill-in-Blank, Essay, Audio, Voice Recording).
- [x] Automated placement test with instant CEFR level recommendation.
- [x] Individualized gamification: XP points ledger, learning streaks, and achievement badges.
- [x] Cryptographically verifiable certificates with QR codes.

### Phase 7: External Integrations & Advanced Capabilities
- [x] Real-time collaborative classroom with interactive whiteboard (Pusher / WebSocket).
- [x] Video meeting adapters (Zoom, Teams, Google Meet, Webex) with dev fallbacks.
- [x] Multi-channel notifications (Email, SMS, WhatsApp Business API).
- [x] Private cloud storage adapter for audio recitations with pre-signed URLs.
- [x] AI assistive tutor (Faseeh conversational practice, pronunciation waveform analysis).
- [x] Marketing & CRM integration engine (HubSpot, GoHighLevel, Mailchimp) & parent referral program.

### Phase 8: Public Marketing & Admissions Portal
- [x] Dedicated public routes: `/how-it-works`, `/pricing`, `/about`, `/contact`, `/faq`, `/for-parents`, `/teach`, `/inquiry`, `/child-safety`, `/schools`.
- [x] Full multi-lingual localization across 6 diaspora languages: Arabic, English, Dutch, Turkish, Italian, Spanish.
