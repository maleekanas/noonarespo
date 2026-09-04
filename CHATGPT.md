# Arabic Kids Academy: MANUS Implementation Instructions

## 1. Your Role
Act as a senior cross-functional product engineering team consisting of:
- Product Manager
- Solution Architect
- Senior Next.js Engineer
- Senior Backend Engineer
- PostgreSQL Database Architect
- UI/UX Designer
- Accessibility Specialist
- DevOps Engineer
- Quality Assurance Engineer
- Application Security Engineer
- Educational Technology Specialist
- Child-Safety and Privacy Specialist

Your responsibility is to design and implement a secure, scalable, multilingual online Arabic language school for children.
The platform must connect students, parents and guardians, teachers, academic administrators, finance administrators, school administrators, and super administrators.
Do not build only a marketing landing page. Build a functional education management platform with authentication, role-based dashboards, academic workflows, parent engagement, administrative operations, and financial management.

## 2. Primary Source of Requirements
Read `PROJECT_BRIEF.md` before making implementation decisions. Treat it as the primary business requirements document and this file as the technical implementation and engineering governance document.
If a requirement is unclear:
- Document the assumption.
- Choose the safest and most maintainable implementation.
- Avoid silently removing the requirement.
- Proceed without blocking on unnecessary questions.

Create or update:
```text
docs/ASSUMPTIONS.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SECURITY.md
docs/USER_ROLES.md
docs/IMPLEMENTATION_PLAN.md
docs/TESTING.md
docs/DEPLOYMENT.md
docs/CHANGELOG.md
```

## 3. Product Vision
Build a modern online Arabic school for children aged 4 to 16 supporting Arabic education, live and recorded lessons, curriculum, enrollment, placement, attendance, homework, assessments, progress tracking, teacher operations, parent engagement, scheduling, subscriptions, payments, invoices, compensation, reporting, multilingual interfaces, Arabic RTL, child safety, and secure role-based access.

## 4. Implementation Strategy
Implement incrementally. Do not build every feature in one uncontrolled pass.
- **Phase 0: Discovery and Architecture**: Read the brief, inspect the repository, identify conventions, produce a plan, define architecture and data model, roles, journeys, integrations, security and child-safety risks, MVP scope, assumptions, and decisions.
- **Phase 1: Foundation**: Build the application shell, design system, authentication, role-based authorization, database, localization, Arabic RTL, shared layouts, error handling, audit logging foundation, tests, and seed data.
- **Phase 2: Core Academic MVP**: Build student, parent, and teacher profiles; parent-child relationships; programs; courses; levels; classes; enrollment; scheduling; attendance; assignments; submissions; feedback; and progress records.
- **Phase 3: Parent Engagement**: Build parent dashboard, child progress, attendance, assignments, feedback, notifications, messaging, meeting requests, and weekly summaries.
- **Phase 4: Administration**: Build administrative dashboards, student and teacher administration, course administration, class scheduling, enrollment management, reporting, activation and suspension, roles and permissions, and audit log viewer.
- **Phase 5: Financial Operations**: Build plans, subscriptions, payments, invoices, discounts, coupons, refunds, failed payment tracking, teacher compensation, dashboards, and exports. Use a payment provider abstraction.
- **Phase 6: Assessments and Gamification**: Build placement tests, quizzes, question banks, attempts, grading, certificates, badges, XP, streaks, and rewards.
- **Phase 7: Integrations and Advanced Capabilities**: Prepare typed adapters for Teams, Zoom, Meet, email, SMS, WhatsApp, storage, analytics, and AI. If credentials are unavailable, use documented development mocks and never present them as live integrations.

## 5. MVP Scope
- **Public Website**: Home, Programs, How It Works, Pricing, About, Contact, FAQ, Parent page and teacher application, Sign-in and enrollment inquiry, Privacy, Terms, and Child-Safety policy placeholders.
- **Authentication**: Secure sign-in, parent registration, verification, reset, sessions. Account statuses, protected routes, role redirects, MFA-ready design. Students may not register independently without adult or administrator approval.
- **Dashboards**: Create separate dashboards for Student, Parent, Teacher, School Administrator, Finance Administrator, and Super Administrator.
- **Academic Features**: Profiles, parent-child association, programs, courses, levels, classes, enrollment, schedule, attendance, assignments, submissions, feedback, and progress.
- **Parent Features**: Linked children, child switcher, classes, attendance, assignments, grades, feedback, comments, billing, invoices, communication, and notifications.
- **Financial Features**: Plans, subscriptions, invoices, payment status, discounts, transaction history, parent billing, and finance administration.

## 6. Recommended Technical Stack
- Next.js App Router, React, strict TypeScript
- Tailwind CSS, shadcn/ui, Framer Motion, Lucide
- Server Components, Server Actions, Route Handlers
- Service and data-access layers
- PostgreSQL and Prisma ORM
- Auth.js, Clerk, or Supabase Auth
- React Hook Form and Zod
- Vitest or Jest, React Testing Library, Playwright
- Vercel-compatible deployment and S3-compatible storage

## 7. Architecture Requirements
Modular domain architecture under `src/`:
- `src/app/[locale]/`: `(marketing)`, `(auth)`, `(dashboard)`, `api/`
- `src/components/`: `ui/`, `shared/`, `navigation/`, `forms/`, `charts/`
- `src/features/`: `auth/`, `users/`, `students/`, `parents/`, `teachers/`, `programs/`, `courses/`, `classes/`, `schedules/`, `attendance/`, `assignments/`, `assessments/`, `progress/`, `communication/`, `notifications/`, `subscriptions/`, `payments/`, `invoices/`, `payroll/`, `reports/`, `certificates/`, `gamification/`
- `src/lib/`: `auth/`, `database/`, `permissions/`, `validation/`, `localization/`, `security/`, `logging/`, `storage/`, `integrations/`
- `src/server/`: `services/`, `repositories/`, `policies/`
- `types/`, `config/`, `emails/`, `tests/`, `prisma/`, `docs/`

## 8. Role-Based Access Control
Minimum roles:
- `SUPER_ADMIN`
- `SCHOOL_ADMIN`
- `ACADEMIC_ADMIN`
- `FINANCE_ADMIN`
- `TEACHER`
- `PARENT`
- `STUDENT`
- `SUPPORT_AGENT`

Centralize policies such as `canViewStudent`, `canEditStudent`, `canManageClass`, `canViewFinancialRecord`, `canMessageUser`, `canRecordAttendance`, and `canGradeSubmission`. Every protected server operation must call an authorization policy.

## 9. Child Safety and Privacy
Minimize child data, require verified adult involvement and consent, restrict student-to-student and unauthorized adult-to-child messaging, support moderation, audit sensitive actions, hide contact information, avoid public leaderboards, use fictional development data, separate private notes from parent-visible feedback, define retention/deletion, and use private storage with signed URLs.

## 10. Financial Engineering
Store money as integer minor units with ISO currency codes. Never use floating point. Preserve immutable payment events, provider IDs, idempotency, separate invoice and payment statuses, partial refunds, finalized invoices, discounts, taxes, timezone-aware dates, and financial audit logs.

## 11. Initial Execution Request (Phase 0)
Start with Phase 0:
1. Read `PROJECT_BRIEF.md`.
2. Inspect the repository and package manager.
3. Identify framework, dependencies, reusable components, and gaps.
4. Create assumptions, architecture, roles, and implementation plan documents.
5. Propose the normalized database model.
6. Define MVP routes and role navigation.
7. Define the permission matrix.
8. Define the first five vertical slices.
9. Identify security and child-safety risks.
10. Identify integrations and environment variable names.
11. Present the plan before major architectural changes.
12. Continue into Phase 1 unless genuinely blocked.
