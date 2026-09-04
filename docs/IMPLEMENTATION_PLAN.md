# Engineering Implementation Roadmap: Kids Arabic Academy

This roadmap outlines the phased development lifecycle for Kids Arabic Academy.

---

## Phase 0: Discovery & Architecture (Current)
- [x] MANUS guidelines review and engineering governance setup.
- [x] Initial documentation suite (`ARCHITECTURE.md`, `ASSUMPTIONS.md`, `DATABASE.md`, `SECURITY.md`, `USER_ROLES.md`, `TESTING.md`, `DEPLOYMENT.md`, `CHANGELOG.md`).
- [ ] Incorporate incoming `PROJECT_BRIEF.md` detailed specifications upon receipt.

---

## Phase 1: Application Foundation & Design System
- Initialize Next.js App Router (strict TypeScript, Tailwind CSS, shadcn/ui, Lucide).
- Establish multi-language routing (`[locale]`) with Arabic (RTL) as primary and English (LTR) as secondary.
- Setup Prisma client and PostgreSQL schema.
- Implement base layout, error boundary (`error.tsx`), 404 page (`not-found.tsx`), and health check (`/api/health`).
- Implement core authentication engine and session management.

---

## Phase 2: Core Academic MVP
- Student, Parent, and Teacher user profile models.
- Parent-child link management with guardian verification.
- Academic entity models: Programs, Courses, CourseLevels, ClassGroups.
- Class enrollment and teacher assignment workflows.
- Scheduling engine with recurrence rules (RRULE) and conflict detection.
- Virtual meeting provider abstraction (Mock / Zoom / Teams).

---

## Phase 3: Learning & Parent Engagement
- Attendance tracking system (Present, Late, Excused, Unexcused).
- Homework assignment builder with audio and text instruction prompts.
- Student submission upload interface with audio recording capabilities.
- Teacher grading workspace with private diagnostic notes and parent-visible encouraging feedback.
- Parent portal with multi-child switcher, attendance summaries, and progress milestones.

---

## Phase 4: Operations & Administration
- School Admin dashboard (class rosters, teacher assignments, student enrollments).
- Academic Admin dashboard (curriculum builder, course level benchmarks).
- Super Admin dashboard (feature flags, platform metrics, tamper-evident audit log viewer).
- User activation, suspension, and password reset administrative workflows.

---

## Phase 5: Financial Operations
- Subscription plan builder and pricing catalog in integer minor units.
- Parent billing portal with invoice generation and history.
- Payment gateway adapter (`MockPaymentGateway` with Stripe webhook simulation).
- Teacher compensation calculator for completed teaching sessions.
- Finance Admin reconciliation dashboard and CSV export capabilities.

---

## Phase 6: Assessments, Placement & Gamification
- Student placement test workflow.
- Quiz and assessment builder with question banks.
- Tamper-evident verifiable certificate generator with QR codes.
- Child-friendly gamification: XP points ledger, learning streaks, milestone badges.

---

## Phase 7: External Integrations & Advanced Capabilities
- Production video meeting adapters (Zoom, Microsoft Teams, Google Meet).
- Transactional notifications (Email, SMS, WhatsApp).
- Private cloud storage adapter for audio submissions with signed URLs.
- AI assistive adapters (pronunciation and fluency evaluation prototypes).
