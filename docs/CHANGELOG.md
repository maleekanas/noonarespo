# Changelog: Kids Arabic Academy

All notable changes to the Kids Arabic Academy platform will be documented in this file following Keep a Changelog standards.

---

## [Pre-Launch: Self-Service Account Settings, Sign Out, Real Super-Admin Email] - 2026-09-17
### ⚠️ Requires a manual production step: log in and set a private super-admin password
This release adds a real account-settings page and moves the seeded super-admin login off its placeholder `@kidsarabicacademy.internal` address. The account still has the old seeded default password (`Password123!`) until you sign in and change it yourself from the new `/account` page -- see "Fixed" below for the new login email.

### Added
- **`/account`**: a single, role-agnostic account settings page reachable from every dashboard (parent, student, teacher, every admin role, school admin) via a new profile icon in each dashboard's header. Lets any logged-in user change their own password (current password required, rate-limited per user and per IP, ends the session and requires a fresh login afterward) and change their own login email (uniqueness-checked, refreshes the session immediately). Neither was previously possible without a direct database write -- the only password-change path in the whole app was the public forgot-password email flow, and there was no way to change an account's email at all.
- **Working Sign Out**: `destroySession()` (in `src/lib/auth/session.ts`) has existed since the very first version of the auth system but was never called from anywhere in the UI -- there was no functioning "Sign Out" button anywhere in the app. `/account` now has one.
- `UserRepository.findUserById`, `updatePassword`, `updateEmail` -- the repository methods backing the above.
- Two new per-user rate limits (`ACCOUNT_CHANGE_PASSWORD_PER_USER`, `ACCOUNT_CHANGE_EMAIL_PER_USER`) alongside the existing IP/email-keyed ones.

### Fixed
- **Super-admin account moved to a real, founder-controlled email**: the only administrative account in the system was seeded with the placeholder address `superadmin@kidsarabicacademy.internal`, which cannot receive email -- meaning the account's forgot-password flow was unusable for it. The account's email has been changed (live, via the new `/account` page, by the founder) to `superadmin@arabickidsacademy.com`, a real inbox the founder can receive mail at. `prisma/seed.ts`'s seeded super-admin email was updated to match, so a future reseed won't create a duplicate stale admin account under the old address.
- Confirmed `NEXT_PUBLIC_HIDE_DEMO_SWITCHER=true` is still set in the live Production environment (checked again this release) -- the one-click demo-login shortcuts on the login page, including the super-admin one, are not reachable on the live site.

---

## [Resolved: Unbacked "Accredited" Marketing Claim] - 2026-09-17
### Fixed
- Resolves the "Open item for the founder" flagged in the entry directly below: the word **"Accredited"** was used in six places across the site (homepage program cards, the For Schools "What's Included" grid, the programs catalog header/tag/cohort description, and a "Certificates" dashboard tile) with no accrediting body, certificate number, or standard recorded anywhere in the system to back it -- a real false-advertising exposure, especially on the page used to sell B2B contracts to schools.
- Replaced with wording that is actually backed by real, verifiable data: "Structured"/"Comprehensive" curriculum (backed by the real 7 `Program`/`Course`/`CourseLevel` records), and "Verified" for the student Certificates tile (backed by the real certificate-verification flow at `/verify/[id]`, fixed in an earlier session). "Certified teachers" wording was left untouched where it already appeared, since teacher certification is now a real, admin-verified per-teacher field (`TeacherProfile.isCertified`, added in the multi-tenant B2B release below).
- Applied identically across all 6 locale dictionaries (ar, en, es, it, nl, tr), matching the translation-parity pattern used throughout this engagement.
- No accreditation claim was reintroduced. If the founder can point to a real accrediting body for the curriculum, the stronger wording can be restored with that citation attached.

---

## [Real Multi-Tenant B2B: School Scoping, Admin Permissions, Data Fixes] - 2026-09-17
### ⚠️ Requires a manual production database step before this is fully live
This release adds new columns/relations to `prisma/schema.prisma` (`ClassGroup.schoolId`, `AdministratorProfile.schoolId`, `TeacherProfile.isCertified`/`employmentType`, the new `EmploymentType` enum). This project has no migration files -- schema changes reach the production database via `npx prisma db push` (see `docs/DEPLOYMENT.md`), and the sandbox this was built in has no database credentials to run that command. **Run `npx prisma db push` against production before (or immediately after) this deploy goes live** -- until then, any code path touching the new fields will error against the live database. Everything else in this entry assumes that step has been done.

### Context
The founder's own audit was mostly right but one part was already fixed in an earlier session: batch roster onboarding (`SchoolRepository.onboardRoster`) already creates real `User` + `StudentProfile` + `STUDENT` role accounts, not a counter bump -- confirmed by direct code read, not assumption. What genuinely was not real: classes had no way to be scoped to a school, `SCHOOL_ADMIN` was treated identically to every other admin role with zero real accounts ever using it, and several of the six "What's Included" claims on the public For Schools page were backed by hardcoded/fake data rather than real per-record facts. This release fixes all of that.

### Added
- **Real multi-tenancy schema**: `ClassGroup.schoolId`, `AdministratorProfile.schoolId` (both optional FKs to `PartnerSchool`, `onDelete: SetNull`, indexed), and a new `EmploymentType` enum (`FULL_TIME`/`PART_TIME`/`CONTRACT`) plus `TeacherProfile.isCertified`/`employmentType`.
- **School-scoped admin permissions**: `requireAdminSession` no longer treats `SCHOOL_ADMIN` the same as `SUPER_ADMIN`/`ACADEMIC_ADMIN`/`FINANCE_ADMIN` -- it's removed from that flat role list. A new `requireSchoolAdminSession()` resolves a school admin's real `AdministratorProfile.schoolId` from the database on every request (never trusted from the session cookie) and gates a brand-new `/school-admin` route.
- **Institutional Admin Dashboard** (`/school-admin`): a real, per-school dashboard -- license seat usage, real enrolled-student counts, the school's own real class list (not the platform's), a real school-scoped attendance rate, bulk roster onboarding scoped to that school only, and class creation that's automatically locked to that school. A school admin cannot see or act on another institution's data from here.
- **Creating a real `SCHOOL_ADMIN` account**: there was no way to do this before (zero real accounts existed). `SchoolRepository.createSchoolAdmin` + a "Create School Admin" action on the super-admin Institutional B2B Hub (`admin/schools`) creates a real login scoped to one school and hands back one-time credentials, the same pattern as roster onboarding.
- **Multi-tenancy enforcement on enrollment**: `AcademicService.enrollStudent` now rejects enrolling a student into a class scoped to a different school than the student's own (or mixing a school-scoped class with a non-institutional student) -- `SCHOOL_SCOPE_MISMATCH`.
- Super-admin class creation (`admin/classes`) can now optionally scope a new class to a partner school.

### Fixed (backing the "For Schools -> What's Included" claims with real data)
- **Certified, Full-Time Educators**: `AdministrationRepository.getAllTeachersAdmin()` previously returned the *same hardcoded fake email and qualifications string* for every teacher, and constant fake `assignedClassesCount`/`totalHoursTaught` (always 1 and 16) -- which also made the platform's `totalHoursDelivered` stat fake, since it summed that constant. Now reads each teacher's real account email, their real `qualifications`/`certifications` fields, a real assigned-class count (`TeacherAssignment`), and real hours from completed `ClassSession` durations. The admin Teachers page's hardcoded "100% hold accredited certification" badge is replaced with a real percentage computed from the new admin-verified `isCertified` field, with a form to set it per teacher.
- **Attendance & Progress Reporting**: `AdministrationService.getSchoolAnalyticsOverview()` returned hardcoded `overallAttendanceRate: 96.5` and `retentionRatePercentage: 98.2` literals unconditionally. Both are now computed for real -- attendance from a new `AttendanceRepository.calculateOverallAttendanceRate()` (optionally school-scoped), retention from the real share of enrolled accounts that are still `ACTIVE`. Note this is an honest number, not a cosmetic one: with little attendance history recorded yet, this will show a low or 0% rate rather than the previous fake 96.5% until real attendance accumulates.
- **Structured, Accredited Curriculum** and **Bulk Roster Onboarding**: confirmed already genuinely real in a prior session (7 real `Program`/`Course`/`CourseLevel` records; real account creation on roster import) -- no code change needed, verified by direct read rather than re-implemented.
- **Real-Time Collaborative Classroom / Institutional Admin Dashboard**: were not real at all before this release -- see "Added" above.

### Open item for the founder -- resolved same day, see entry above
- The word **"Accredited"** in "Structured, Accredited Curriculum" had no backing accreditation-body data anywhere in the system (no accrediting organization, certificate number, or standard was recorded against the curriculum). Rather than leave an unbacked claim live, the wording was softened to what the data actually supports -- see "[Resolved: Unbacked \"Accredited\" Marketing Claim]" above. If the founder can point to a real accrediting body, the stronger wording can be restored with that citation attached.

---

## [Legal-Packet Follow-Up: Real Broadcast Emails & Corrected Legal Text] - 2026-09-17
### Added
- A genuinely working admin-triggered "email all parents" broadcast, on `admin/integrations`, that dispatches a real email (via the existing `notificationDispatcherService`/`EmailAdapter`/Resend pipeline -- the same one already proven for password-reset emails) to every ACTIVE parent account. This is the actual delivery mechanism behind the Terms of Service's and Privacy Policy's promises to email parents about a price change (ToS §4) or a change that materially affects their subscription or the Privacy Policy (ToS §11 / Privacy §9) -- previously nothing in the codebase actually sent those emails.
- `NotificationPayload.eventName` gained a new `"ACCOUNT_NOTICE"` member for this broadcast type.
- `UserRepository.getAllParentsWithContact()`: the codebase had `getAllTeachers()` but no equivalent for parents. Added, scoped to `ACTIVE` users only, following the same Prisma-backed pattern as the rest of the repository.
- Every broadcast send is recorded in the admin audit log (`AdministrationRepository.addAuditLog`, category `USER_MANAGEMENT`) with the subject line and a sent/failed count, so there's a durable record of what was sent to parents and when.

### Fixed
- **ToS §5 (Cancellation)**: previously said cancellation only happens by emailing `privacy@arabickidsacademy.com` with a two-business-day turnaround -- no longer true since the parent billing page (`parent/billing`) has shipped a real self-service "Manage or Cancel Subscription" button that opens the Stripe Billing Portal for instant, one-click cancellation. The clause now describes the real self-service flow, with the email route kept as a documented fallback.
- **Privacy Policy §5 (Who We Share Information With)**: listed Stripe/Vercel/Neon but omitted three sub-processors the app genuinely sends personal data to -- Resend (transactional email), Sentry (error monitoring), and Pusher (real-time classroom signaling/whiteboard). All three are now disclosed.
- Both fixes were applied identically across all 6 locale dictionaries (ar, en, es, it, nl, tr) to keep full locale parity, matching the pattern used throughout this engagement.

### Resolved (follow-up, same day)
- **Legal entity name**: the founder confirmed Arabic Kids Academy is operated as a branch of 3-Tech (3-tech.eu), registered in the Netherlands -- so "3-Tech ... the Netherlands," already used throughout the Terms of Service and Privacy Policy, is accurate and required no text change. 3-tech.eu is currently a "coming soon" placeholder with no address or KVK (Dutch Chamber of Commerce) number published, so the Groningen city reference and the absence of a KVK number are unconfirmed rather than known-wrong; add a KVK number to both pages if/when one is available. Everything else in the attorney packet's LOW/MEDIUM-priority findings (cookie-policy gap, DPA confirmations, translation-conflict clause) remains intentionally unactioned, left for the founder/attorney's judgment as originally scoped.

---

## [Phase 0: Discovery & Requirements Integration] - 2026-09-03
### Added
- Received and committed [`PROJECT_BRIEF.md`](file:///c:/Temp/Projects/kids-arabic-academy/PROJECT_BRIEF.md).
- Integrated business domain requirements into [`docs/ASSUMPTIONS.md`](file:///c:/Temp/Projects/kids-arabic-academy/docs/ASSUMPTIONS.md) and [`docs/DATABASE.md`](file:///c:/Temp/Projects/kids-arabic-academy/docs/DATABASE.md):
  - 7 Academic Programs (Foundations, Reading, Writing, Speaking, Listening, Quran/Tajweed, Islamic Studies).
  - 4 Age brackets (4-6, 7-10, 11-13, 14-16).
  - 4 Subscription Plan models (Individual, Family, Group, Private 1-on-1).
  - 7 Assessment Question types (MCQ, True/False, Matching, Fill-in-the-blank, Essay, Audio response, Voice recording).
  - Gamification models (XP ledger, Reading Champion, Grammar Master, Quran Star, Perfect Attendance, Streaks).
  - Multi-language coverage: Arabic (primary RTL), English, Dutch, Turkish, Italian, Spanish.
  - Payment abstractions for Stripe, PayPal, Mollie, Apple Pay, Google Pay, and Dev Mock.
- Completed Phase 0 discovery, architecture blueprint, and technical governance setup. Ready for Phase 1 execution.

---

## [Phase 1: Application Foundation & Vertical Slice 1] - 2026-09-03
### Added
- **Core Framework & Runtime**: Initialized Next.js 15 App Router with React 19, strict TypeScript, Tailwind CSS, and Lucide React.
- **BiDi Localization & RTL**: Configured dynamic locale routing `src/app/[locale]/` with full Right-to-Left (`dir="rtl"`) Arabic support, English LTR, and type-safe translation dictionaries.
- **Directional UI System**: Implemented `<DirectionalIcon />` server component and `<LanguageSwitcher />` component.
- **Normalized Data Layer**: Implemented full `prisma/schema.prisma` covering Identity, Profiles, 7 Academic Programs, Courses, Levels, Class Groups, Attendance, Homework, Badges, Plans, Invoices, and Audit Logs.
- **Prisma Client**: Generated Prisma Client and configured `src/lib/database/prisma.ts` singleton.
- **Development Seed Script**: Created `prisma/seed.ts` populating system roles, safe development accounts, programs, badges, and subscription tiers.
- **Authentication & Server Policies**: Implemented session token cookies and centralized policy guards (`canViewStudent`, `canRecordAttendance`, `canGradeSubmission`, `canViewFinancialRecord`, `canMessageUser`).
- **Marketing & Public Shell**: Built comprehensive landing page showcasing the 7 academic programs, 4 age groups, pricing tiers, and child safety guarantees.
- **Role Dashboards**: Created functional dashboard shells for Student (gamification, XP, badges), Parent (multi-child switcher, attendance, feedback), Teacher (schedule, grading queue), and Admin (KPIs, audit log viewer).
- **Observability & Resilience**: Added custom error boundary, 404 page, and `/api/health` health check endpoint.
- **Automated Quality Checks**: Passed TypeScript typecheck, ESLint linting, node:test policy test suite (8/8 pass), and production Next.js build.

---

## [Phase 2: Core Academic MVP] - 2026-09-03
### Added
- **Repository Architecture**: Implemented full repository pattern in `src/server/repositories/` (`UserRepository`, `AcademicRepository`, `SchedulingRepository`, `AttendanceRepository`, `AssignmentRepository`) with pre-seeded in-memory / persistent mock support.
- **Academic Domain Services**:
  - `AcademicService`: Enforces class cohort limits (max 6 students for GROUP), age bracket matching, and student enrollment state transitions.
  - `SchedulingService`: Conflict detection engine detecting teacher overlapping time commitments and student schedule collisions; recurring session generation.
  - `AttendanceService`: Session attendance recording (`PRESENT`, `LATE`, `EXCUSED_ABSENCE`, `ABSENT`) and attendance rate analytics.
  - `AssignmentService`: Homework task creation, audio/text submissions, and teacher evaluation with private vs parent-visible feedback separation.
- **Pluggable Virtual Classrooms**: Implemented `MeetingProvider` interface with `MockMeetingProvider` delivering launchable test room URLs.
- **Interactive Parent Workflows**:
  - `/parent/children`: Add child profile with guardian consent, age bracket categorization, and multi-child sibling management.
  - `/parent/enroll`: Course and class group catalog with real-time seat availability and one-click child enrollment.
- **Interactive Teacher Workflows**:
  - `/teacher/classes/[id]`: Class group detail view, student roster, virtual meeting launcher, and live attendance check-in.
  - `/teacher/assignments`: Assignment creation form, submission audio queue, scoring (0-100), and feedback editor.
- **Interactive Student Workflows**:
  - `/student/classes/[id]`: Enrolled class hub with teacher profile and live room entry.
  - `/student/homework/[id]`: Homework submission interface with teacher voice model audio player, text response, and audio upload simulator.
- **Interactive Admin Workflows**:
  - `/admin/classes`: Class groups monitor with capacity progress bars and new class creation form.
  - `/admin/schedule`: Master timetable and conflict detection engine live status.
- **Expanded Quality Gates**: Added unit test suites `tests/unit/conflict-detection.test.ts` and `tests/unit/enrollment.test.ts` (13/13 unit tests passed), zero ESLint warnings, and verified Next.js production build (26 pages).

---

## [Phase 3: Parent Engagement & Communication] - 2026-09-03
### Added
- **Communication & Engagement Repositories**:
  - `CommunicationRepository`: Threaded conversations, messages with read receipts, 15-minute conference bookings (`PENDING`, `CONFIRMED`, `CANCELLED`), in-app event notifications, and 5-skill competency models.
- **Parent & Engagement Domain Services**:
  - `CommunicationService`: Enforces relationship-scoped messaging (parents can only message teachers of their enrolled children) and conference booking workflow.
  - `NotificationService`: Event-driven alerts on attendance marking, homework grading, new messages, and mark-all-read capabilities.
  - `ProgressService`: 5 Arabic competency analytics (Listening, Speaking, Reading, Writing, Tajweed) and weekly educational report card summaries.
- **Interactive Parent Workflows**:
  - `/parent/progress`: 5-skill mastery radar and progress benchmark bars with multi-child toggle (Zayd vs Maryam).
  - `/parent/messages`: Supervised, direct chat thread between Parent (Tariq) and Teacher (Ustadh Ahmed).
  - `/parent/meetings`: 15-minute parent-teacher conference booking scheduler and confirmed room launcher.
  - `/parent/notifications`: In-app notification center with unread badge counter and mark-all-as-read action.
  - `/parent/reports/weekly`: Print-ready, official weekly educational progress report card.
- **Interactive Teacher Workflows**:
  - `/teacher/messages`: Teacher view of parent chat threads with direct reply functionality.
  - `/teacher/meetings`: Teacher conference request manager with one-click confirmation and virtual classroom generation.
- **Automated Quality Verification**:
  - Unit test suite: 18/18 tests passed (`tests/unit/communication.test.ts`, `tests/unit/progress.test.ts`, `tests/unit/conflict-detection.test.ts`, `tests/unit/enrollment.test.ts`, `tests/unit/policies.test.ts`).
  - Strict TypeScript: 0 errors.
  - ESLint: 0 warnings, 0 errors.
  - Next.js Production Build: 40 routes compiled and optimized.

---

## [Phase 4: Gamification, Placement & Interactive Learning] - 2026-09-04
### Added
- **Gamification Architecture**:
  - `GamificationRepository`: XP points ledger, level tiers, unlocked badges catalog (`READING_CHAMPION`, `GRAMMAR_MASTER`, `QURAN_STAR`, `PERFECT_ATTENDANCE`, `STREAK_MASTER`), daily streak tracking, and privacy-first cohort leaderboard.
  - `GamificationService`: XP awards, level math (`Level 1` to `Level 5+`), streak updates, and friendly cohort leaderboard queries.
- **Placement Assessment Engine**:
  - `PlacementRepository`: Question bank covering 7 assessment formats (Letter Recognition, Phonics & Harakat, Audio Listening, Vocab Match, Sentence Construction, Reading Comprehension, Speech Recording Simulation).
  - `PlacementService`: Multi-step question evaluation, score calculation (0-100), automated course level recommendation (Pre-A1, A1, A2, B1), and instant XP awards.
- **Verifiable Achievement Certificates**:
  - `CertificateService`: Official Certificate of Achievement generation with verifiable serial hash, student name, distinction honors, and print-ready stylesheet.
- **Interactive Student Workflows**:
  - `/student/placement`: Multi-step interactive placement test with audio playback and instant level placement.
  - `/student/activities`: Interactive Arabic letter matching & phonics explorer with instant XP rewards.
  - `/student/leaderboard`: COPPA/GDPR-K privacy-compliant cohort leaderboard (masked names `زيد ط.`).
  - `/student/certificates`: Official Certificate of Completion viewer with printable layout.
  - `/student`: Updated dashboard with live XP counters, daily streak flame, level progress bar, and active badge showcases.
- **Reusable Client Components**:
  - `PrintButton.tsx`: Client-side component for trigger-safe PDF printing across certificates and report cards.
- **Automated Quality Verification**:
  - Unit test suite: 24/24 tests passed across 7 test suites (`tests/unit/gamification.test.ts`, `tests/unit/placement.test.ts`, and prior suites).
  - Strict TypeScript: 0 errors.
  - ESLint: 0 warnings, 0 errors.
  - Next.js Production Build: 48 routes compiled and statically/dynamically optimized.

---

## [Phase 5: Financial Operations, Subscriptions & Invoicing] - 2026-09-04
### Added
- **Financial Architecture**:
  - `PaymentGateway` abstraction interface and `MockPaymentGateway` integration generating verifiable transaction references and instant receipts.
  - `FinancialRepository`: Integer minor-units catalog with 4 subscription plans (`STARTER` $49, `STANDARD_GROUP` $89, `FAMILY_VIP` $149, `PRIVATE_1ON1` $220), discount coupons (`WELCOME10` for 10% off, `SIBLING20` for 20% off), active parent subscriptions, itemized tax invoices, and teacher payroll records.
- **Financial Domain Services**:
  - `BillingService`: Zero floating-point arithmetic (strictly 64-bit integer minor units in cents/halalas), coupon validation, payment gateway settlement, and itemized VAT tax invoice generation.
  - `PayrollService`: Automated teacher compensation calculator based on teaching session hours and agreed hourly rates ($30.00/hr = 3000 minor units), and administrative financial reconciliation (MRR, gross volume, net revenue, teacher liabilities).
- **Interactive Parent Workflows**:
  - `/parent/billing`: Active subscription plan card, renewal dates, and billing invoice history with links to printable tax receipts.
  - `/parent/checkout`: Interactive subscription checkout with plan selection, live coupon code validation, payment method selector, and atomic checkout server action.
  - `/parent/invoices/[id]`: Official VAT tax invoice document with client-side `<PrintButton />` for PDF generation.
- **Interactive Teacher Workflows**:
  - `/teacher/payroll`: Teacher monthly earnings statement, hourly rate disclosure, completed session hours breakdown, and IBAN payout status.
- **Interactive Admin Workflows**:
  - `/admin/finance`: Financial reconciliation overview with MRR, total revenue, teacher payout obligations, and CSV export.
- **Automated Quality Verification**:
  - Unit test suite: 30/30 tests passed across 9 test suites (`tests/unit/billing.test.ts`, `tests/unit/payroll.test.ts`, etc.).
  - Strict TypeScript: 0 errors.
  - ESLint: 0 warnings, 0 errors.
  - Next.js Production Build: 56 routes compiled and optimized.

---

## [Phase 6: Multi-Role Administration, Governance & Academic Operations] - 2026-09-04
### Added
- **Administrative & Governance Architecture**:
  - `AdministrationRepository`: Tamper-evident audit ledger with SHA-256 cryptographic integrity hashes, curriculum modules store for all 7 Academic Programs, student account status overrides, and teacher rate settings.
  - `AssessmentBankRepository`: Question bank covering all 7 assessment formats (Multiple Choice, True/False, Word Matching, Fill-in-the-Blank, Essay, Audio Listening, Speech Recording) and managed assessment templates with passing thresholds (e.g., 70%).
- **Domain Services & Policy Guards**:
  - `AdministrationService`: Automatic audit logging on sensitive actions (`STUDENT_SUSPENDED`, `TEACHER_HOURLY_RATE_MODIFIED`, `ASSESSMENT_PUBLISHED`), cryptographic log verification, user governance, and school-wide KPI analytics aggregation.
  - `AssessmentBankService`: Question querying, quiz builder, and publish/unpublish workflow.
  - Centralized Policies: `canManageUsers`, `canManageCurriculum`, `canViewAuditLogs`, and `canManageAssessments`.
- **Interactive Administrative Portals**:
  - `/admin/students`: Student directory with search, age-bracket tabs (`4-6`, `7-10`, `11-13`, `14-16`), COPPA/GDPR-K parental consent tracking, and account status toggle server action.
  - `/admin/teachers`: Faculty directory, verified credentials, class assignments, hourly compensation editor ($30.00/hr), and active status toggle.
  - `/admin/curriculum`: Curriculum standards manager for all 7 Academic Programs with CEFR levels (Pre-A1 to B2), weekly objectives, target vocabulary counters, and module creation form.
  - `/admin/assessments`: Question Bank manager across all 7 question formats and exam creator with customizable passing score thresholds.
  - `/admin/audit-logs`: Immutable security audit log ledger with category filtering, actor metadata, IP stamps, and SHA-256 cryptographic integrity badges.
  - `/admin/reports`: School-wide performance analytics, retention metrics, class capacity utilization, and printable PDF report.
  - `/admin`: Upgraded main dashboard connecting to live aggregated metrics and 9 dedicated administrative hubs.
- **Automated Quality Verification**:
  - Unit test suite: 38/38 tests passed across 11 test suites (`tests/unit/administration.test.ts`, `tests/unit/assessment-bank.test.ts`, and prior suites).
  - Strict TypeScript: 0 errors.
  - ESLint: 0 warnings, 0 errors.
  - Next.js Production Build: 68 routes compiled and statically/dynamically optimized.

---

## [Phase 7: External Integrations & Advanced Capabilities] - 2026-09-04
### Added
- **External Integration Adapters Layer**:
  - `MeetingManager` with typed adapters for `ZoomMeetingAdapter`, `TeamsMeetingAdapter`, and `GoogleMeetAdapter`, featuring graceful fallback to dev mocks when `.env` credentials are not present.
  - Multi-Channel Notification Dispatcher with typed adapters for `WhatsAppAdapter` (Meta Cloud API), `SmsAdapter` (E.164 international formatting), and `EmailAdapter` (transactional localized HTML receipts and alerts).
  - `S3StorageProvider` private object storage with signed upload tickets and time-limited pre-signed download URLs (15-minute TTL) for child privacy (COPPA / GDPR-K).
  - `KidsArabicAiTutorAdapter` with child-friendly conversational AI companion ("فصيح - Faseeh") featuring Harakat vocalization, pronunciation tips, and teacher lesson plan generation.
- **Domain Services**:
  - `NotificationDispatcherService`: Multi-channel routing and real-time delivery logs.
  - `StorageService`: Generating pre-signed PUT tickets and time-limited GET URLs for homework voice recordings.
  - `AiService`: Managing student conversation sessions, awarding encouragement XP, and teacher lesson plan copilot.
- **Interactive User Portals**:
  - `/student/ai-tutor`: Conversational Arabic practice with "فصيح", suggestion chips, vowel guidance, pronunciation hints, and XP rewards.
  - `/teacher/ai-assistant`: Teacher AI copilot for generating structured lesson plans and quiz questions across the 7 programs.
  - `/admin/integrations`: Central operations hub displaying status across Video, Notifications, Private Storage, and AI, with an interactive testing sandbox.
  - Upgraded dashboards for Student (added Faseeh card), Teacher (added AI Copilot card), and Admin (added Integrations Hub).
- **Automated Quality Verification**:
  - Unit test suite: 52/52 tests passed across 15 test suites (`tests/unit/meeting-integrations.test.ts`, `tests/unit/notification-dispatcher.test.ts`, `tests/unit/storage-security.test.ts`, `tests/unit/ai-tutor.test.ts`, and prior suites).
  - Strict TypeScript: 0 errors.
  - ESLint: 0 warnings, 0 errors.

---

## [Phase 8: Global Internationalization, System Observability & Production Hardening] - 2026-09-04
### Added
- **Global 6-Language Multi-Lingual Architecture**:
  - Completed translation dictionaries with 100% key parity for all 6 mandated languages: Arabic (`ar` - primary RTL), English (`en` - LTR), Dutch (`nl` - LTR), Turkish (`tr` - LTR), Italian (`it` - LTR), and Spanish (`es` - LTR).
  - Extended `src/lib/localization/index.ts` with `languages` metadata (native names, direction, country flag icons), type guards, and dynamic dictionary retrieval.
  - Upgraded `LanguageSwitcher` to a rich dropdown menu with live flags, native names, and seamless route preservation.
- **Enterprise System Observability & Real-Time Telemetry**:
  - `SystemHealthService`: Multi-pillar diagnostics checking Database latency, S3 Storage 15-minute signed URLs, Virtual Meeting providers, Multi-channel notifications, and AI Tutor engine.
  - Enhanced `/api/health?full=true` returning typed diagnostic telemetry (subsystems, heap memory, process uptime, Node.js version, and active locales).
  - `/admin/system-health`: Administrative observability console with live status indicators, latency metrics, and JSON telemetry export.
- **Data Portability & GDPR / COPPA Compliance Export Center**:
  - `DataExportService`: Extracts and formats sanitized student records (with verified parental consent timestamps and zero credentials), class rosters, financial transactions, teacher payroll, and tamper-evident SHA-256 cryptographic audit logs.
  - `/admin/data-export`: One-click data export console with category filters and instant download triggers.
  - `/api/admin/export`: Direct streaming route handler for downloading compliance archives in standard JSON and CSV formats.
- **Interactive Guided Multi-Role Persona Switcher**:
  - `RoleSwitcher`: Floating client helper component embedded in the root layout for instant 1-click switching between Student (Zayd), Parent (Tariq), Teacher (Ustadh Ahmed), School Administrator, AI Tutor (Faseeh), and Integrations Hub.
- **Automated Quality Verification**:
  - Unit & integration test suite: 73/73 tests passed across 19 test suites (`tests/unit/phase8-system-integration.test.ts` and prior suites).
  - Strict TypeScript: 0 errors.
  - ESLint: 0 warnings, 0 errors.
  - Next.js Production Build: 227 static and dynamic pages compiled cleanly across all 6 locales.

---

## [Phase 9: Interactive Virtual Classroom, Quran Tajweed Studio & Quality Moderation] - 2026-09-04
### Added
- **In-Browser Interactive Virtual Classroom Studio (`/[locale]/classroom/[id]`)**:
  - `InteractiveWhiteboard`: Canvas 2D calligraphy studio supporting pen, eraser, colors, line widths, and ruled Arabic notebook guidelines (`مسطرة كراسة الخط العربي`) for letter tracing.
  - Teacher video spotlight, student participant webcam tiles with microphone status, hand raising toggle, live heart/clap/sparkle reactions, and real-time +15 XP star awards.
- **Quran & Tajweed Recitation Studio (`/[locale]/student/quran-studio`)**:
  - `QuranRepository` & `QuranService`: Juz Amma catalog (Al-Fatiha, Al-Ikhlas, Al-Falaq) with authentic Uthmani text, English translations, and audio URLs.
  - Standardized Tajweed color coding: Red (#DC2626) for Qalqalah, Purple (#9333EA) for Madd, Blue (#2563EB) for Idgham, and Green (#059669) for Ikhfa/Izhhar.
  - Model reciter simulated player, voice recording simulator with animated waveform, rubric-based evaluation (Makharij, Tajweed, Hifz), and +25 XP gamification rewards.
- **Verified Parent Reviews & Quality Moderation (`/[locale]/parent/reviews` & `/[locale]/admin/reviews`)**:
  - `ReviewRepository` & `ReviewService`: Verified parent star rating engine (1-5 stars), rating distribution metrics, and review submission.
  - Parent review portal showcasing teacher rating summary (Ustadh Ahmed - 5.0 ⭐) and verified parent feedback feed.
  - Admin quality moderation console for reviewing, approving, flagging, and replying to parent evaluations.
- **Progressive Web App (PWA) Assets**:
  - `public/manifest.json`: Web App Manifest supporting standalone display, Arabic/English bilingual titles, and brand theming (#4F46E5).
  - `public/icon.svg`: Scalable vector PWA icon with gradient emblem.
  - Updated metadata in root layout with `manifest: "/manifest.json"`.
- **Navigation & Dashboard Integrations**:
  - Added Classroom, Quran Studio, and Parent Reviews to `RoleSwitcher`.
  - Added quick navigation cards to Student, Parent, and Admin dashboards.
- **Automated Quality Verification**:
  - 100/100 tests passed across 27 suites (`tests/unit/phase9-classroom-quran.test.ts` and all prior suites).
  - Strict TypeScript: 0 errors (`tsc --noEmit`).
  - ESLint: 0 warnings, 0 errors (`next lint`).
  - Next.js Production Build: 245 pages compiled successfully across all 6 locales.

---

## [Phase 10: Phonics & Word Builder Arcade, AI Parent Recommendations & Live Teacher Gradebook] - 2026-09-04
### Added
- **Self-Paced Arabic Phonics & Word Builder Arcade (`/[locale]/student/activities`)**:
  - `PhonicsArcadeStudio`: Client-side educational arcade component featuring:
    - **Harakat Phonics Soundboard**: 12 foundational Arabic letters with all 4 vowel states (الفتحة، الضمة، الكسرة، السكون), phonetic audio synthesis simulation, and illustrated vocabulary.
    - **Word Scrambler Studio**: 4 progressive levels (`قَلَم`, `شَمْس`, `نَجْم`, `كِتَاب`) with letter tile assembly, scramble verification, celebration sound chimes, and **+30 XP** rewards.
    - **Memory Matching Challenge**: 6-card flip game matching Arabic words (`أَسَد`, `أَرْنَب`, `بَطَّة`) to illustrations with streak counter.
- **AI-Powered Learning Recommendations & CEFR Milestone Tracker (`/[locale]/parent/recommendations`)**:
  - `RecommendationRepository` & `RecommendationService`: Evaluates student's 5 core competencies (Listening, Speaking, Reading, Writing, Quran) to generate actionable home routines.
  - Tailored recommendations feed with priority badges (`HIGH`, `MEDIUM`, `ENCOURAGEMENT`), estimated minutes/day, and curated story/drill links.
  - CEFR Milestone Progression Tracker showing checklist towards next level certification (Pre-A1 to A1, A1 to A2).
  - Curated age-appropriate resource library (stories, audio drills, handwriting worksheets).
- **Teacher Live Session Gradebook & Quick Rubric Studio (`/[locale]/teacher/gradebook`)**:
  - `GradebookRepository` & `GradebookService`: Records live in-class oral reading fluency (WPM), Makharij accuracy (%), participation stars (1-5 ⭐), and teacher feedback notes.
  - Instant positive reinforcement notification dispatch to linked parent via `NotificationService`.
  - Automatic participation XP star rewards via `GamificationService`.
- **Navigation & Multi-Role Persona Polish**:
  - Added Phonics Arcade, Parent Recommendations, and Teacher Gradebook to `RoleSwitcher`.
  - Added AI Recommendations card to Parent Dashboard and Live Gradebook card to Teacher Dashboard.
- **Automated Quality Verification**:
  - **106/106 tests passed** across 30 suites (`tests/unit/phase10-arcade-recommendations.test.ts` and all prior suites).
  - Strict TypeScript: 0 errors (`tsc --noEmit`).
  - ESLint: 0 warnings, 0 errors (`next lint`).
  - Next.js Production Build: **257 static and dynamic pages** compiled cleanly across all 6 locales.

---

## [Phase 11: Interactive Illustrated Storybook Reader, Voice Pronunciation Studio & Offline Printables Hub] - 2026-09-04
### Added
- **Interactive Illustrated Storybook & Prophetic Tales Suite (`/[locale]/student/stories` & `/[locale]/student/stories/[id]`)**:
  - `StoryRepository` & `StoryService`: Curated illustrated Arabic storybooks across 3 categories:
    - *Prophetic Stories*: "سفينة نوح عليه السلام والحيوانات" (4 vocalized pages, comprehension quiz, +35 XP).
    - *Islamic Values*: "النملة الصغيرة وحبة القمح المباركة" (4 vocalized pages, perseverance moral quiz, +35 XP).
    - *Language Adventures*: "مغامرة في واحة الكلمات العجيبة" (4 vocalized pages, phonics exploration, +35 XP).
  - `InteractiveStoryReader`: Immersive client book reader with page flip transitions, narrated audio playback with 0.8x/1.0x speed dials, English translation toggle, word-by-word click-to-pronounce using Web Speech Synthesis (`ar-SA`), and interactive moral comprehension quiz awarding **+35 XP** via `GamificationService`.
- **Voice Pronunciation & Audio Waveform Studio (`/[locale]/student/pronunciation`)**:
  - `PronunciationRepository` & `PronunciationService`: Comprehensive catalog of challenging Arabic phonemes (`ض` - Dhad, `ص` - Sad, `ط` - Ta, `ظ` - Dha, `ع` - 'Ayn, `ق` - Qaf).
  - Articulation point anatomical diagrams (مخارج الحروف: اللسان، الحلق، الشفتان) with golden pronunciation tips.
  - Minimal pairs comparative module (`سيف` vs `صيف`, `تين` vs `طين`, `ذل` vs `ظل`, `كلب` vs `قلب`) demonstrating semantic changes.
  - `PronunciationWaveformStudio`: Interactive dual visual waveform comparison matching student voice against native audio models, real-time microphone analysis, acoustic pitch scoring, and **+20 XP** rewards.
- **Offline Learning Packet & Printables Hub (`/[locale]/parent/printables`)**:
  - `PrintablesRepository`: High-resolution A4 printable worksheets catalog:
    - Ruled Naskh calligraphy tracing books (`كراسة تتبع حروف خط النسخ المسطرة`).
    - Emphatic vs light letter tracing guides (`ص، ض، ط، ظ`).
    - Short vowels & long Madd coloring sheets (`تلوين الحركات والمدود`).
    - Prophetic story comic activity sheets (`سفينة نوح`).
    - Kids daily Adhkar & Sunnah routine bedroom posters (`أذكار الصباح والمساء والوضوء`).
  - `ParentPrintablesClient`: Interactive A4 sheet preview modal simulator, print-ready CSS styling (`@media print`), and embedded QR code verification links routing back to online audio models.
- **Navigation & Persona Switcher Polish**:
  - Added Illustrated Stories, Voice Pronunciation, and Offline Printables to `RoleSwitcher`.
  - Added quick navigation cards to Student Dashboard and Parent Dashboard.
- **Automated Quality Verification**:
  - **115/115 tests passed** across 33 suites (`tests/unit/phase11-stories-pronunciation.test.ts` and all prior suites).
  - Strict TypeScript: 0 errors (`tsc --noEmit`).
  - ESLint: 0 warnings, 0 errors (`next lint`).
  - Next.js Production Build: **275 static and dynamic pages** compiled cleanly across all 6 locales (`ar`, `en`, `nl`, `tr`, `it`, `es`).
  - Production preview server running on port 3005 with verified HTTP 200 on all new routes.

---

## [Phase 12: Visual Learning Quest Map, Spaced Repetition (SRS) Vocabulary Studio & Public Certificate Verification Hub] - 2026-09-04
### Added
- **Visual Learning Journey & Quest Map (`/[locale]/student/roadmap`)**:
  - `RoadmapRepository` & `RoadmapService`: 10 sequential learning milestone nodes organized across 5 themed biome stages:
    1. *Oasis of Letters (واحة الحروف)*: Alphabet shapes, short vowels, ruled Naskh calligraphy tracing.
    2. *Dunes of Phonics (كثبان الكلمات)*: Emphatic Makharij, word scrambler, minimal pairs.
    3. *River of Stories (نهر القصص)*: Prophet Nuh's Ark, ant perseverance, moral quizzes.
    4. *Citadel of Tajweed (قلعة التجويد)*: Al-Fatiha, color-coded Madd, audio recitation recording.
    5. *Palace of Fluency (قصر الفصاحة)*: Interactive Arabic dialogue with Faseeh AI.
  - `VisualLearningQuestMap`: Gamified winding adventure map with 3-star rating rubric, locked milestone gates, active pulse indicator, and milestone treasure chest unlock modals awarding bonus XP.
- **Spaced Repetition (SRS) Arabic Vocabulary Studio (`/[locale]/student/flashcards`)**:
  - `VocabularyRepository` & `VocabularyService`: Algorithmic Leitner (SM-2) memory scheduling across 5 boxes.
  - Pre-seeded linguistic categories:
    - *Triliteral Root Families (جذور الكلمات)*: `ك-ت-ب` (كتاب، مكتبة)، `د-ر-س` (درس، مدرسة).
    - *Singular & Broken Plurals (المفرد والجمع)*: `قلم ➔ أقلام`، `بيت ➔ بيوت`، `ولد ➔ أولاد`.
    - *Opposites (المتضادات)*: `كبير × صغير`، `سريع × بطيء`، `نهار × ليل`.
  - `VocabularySrsStudio`: 3D perspective card flip, Web Speech Synthesis (`ar-SA`) audio playback, Leitner grading buttons (Easy / Good / Again), retention gauges, and **+15 XP** session rewards.
- **Public Tamper-Evident Certificate Verification Portal (`/[locale]/verify/[id]`)**:
  - Accessible without login for external verification.
  - Cryptographic validation: SHA-256 digital signature hash verification.
  - Official certificate diploma canvas with gold border, student name, course details, honors distinction, lead teacher signature, and printable A4 PDF action.
- **Institutional B2B & Islamic School Management (`/[locale]/admin/schools`)**:
  - `SchoolRepository` & `SchoolService`: Multi-tenancy cohort license tracking for international Islamic schools and homeschool cooperatives (UK, Netherlands, USA, KSA).
  - `SchoolManagementClient`: Institutional KPI cards (Total Partners, Seats Licensed, Seats Used, Capacity Utilization %), partner directory table, and batch CSV student roster onboarding modal with seat limit validation.
- **Navigation & Persona Switcher Polish**:
  - Added Quest Map, SRS Flashcards, and Institutional Schools to `RoleSwitcher`.
  - Added navigation cards on Student and Admin dashboards.
- **Automated Quality Verification**:
  - **125/125 tests passed** across 37 suites (`tests/unit/phase12-roadmap-srs-institutions.test.ts` and all prior suites).
  - Strict TypeScript: 0 errors (`tsc --noEmit`).
  - ESLint: 0 warnings, 0 errors (`next lint`).
  - Next.js Production Build: **293 static and dynamic pages** compiled cleanly across all 6 locales (`ar`, `en`, `nl`, `tr`, `it`, `es`).
  - Production preview server running on port 3005 with verified HTTP 200 on all new routes.

---

## [Multi-Lingual Localization Fidelity & Leak Fix] - 2026-09-04
### Fixed
- **HTML Document Metadata**: Replaced static Arabic metadata with dynamic `generateMetadata({ params })` in `src/app/[locale]/layout.tsx` so browser tab titles and descriptions automatically match the selected language (e.g. English: *Arabic Kids Academy | Inspiring Arabic language...*, Dutch: *Arabische Kids Academie | Inspirerend Arabisch...*).
- **Footer Translation Leaks**: Replaced hardcoded Arabic text in `Footer.tsx` with dictionary keys (`platformDescription`, `safetyBadge`, `securitySection`, `madeWithLovePrefix`, `madeWithLove`).
- **Landing Page Hardcoded Arabic**: Replaced all hardcoded Arabic text in `src/app/[locale]/page.tsx` across the hero stats bar, programs tags, age group cards, pricing packages (Group, Private, Family), and the child safety & privacy banner.
- **Login Demo Buttons & Hint**: Updated `src/app/[locale]/(auth)/login/page.tsx` with localized persona roles and default password guidance.
- **Dashboard Portals Bilingual Handling**: Ensured Student, Parent, Admin, and Teacher dashboards cleanly render English/Dutch headers, KPIs, cards, and schedules when browsing non-Arabic locales.
- **Dictionary Key Parity**: Maintained 100% top-level and section key parity across all 6 supported locales (`ar`, `en`, `nl`, `tr`, `it`, `es`), verified by automated test suites.

---

## [Real-Time Collaborative Classroom & Live Session Integrity] - 2026-09-16
### Added
- **Real-time shared whiteboard**: `/[locale]/classroom/[id]`'s calligraphy whiteboard now actually syncs strokes live between the teacher and every enrolled student via Pusher Channels, instead of each participant only ever seeing their own local `<canvas>`. Falls back to a clearly-labeled "Solo mode" indicator (not a silent lie) when Pusher isn't configured for a school yet.
- **Real class session data**: the classroom page is now backed by a real `ClassSession` (real enrolled roster via `ClassEnrollment`, the real assigned `TeacherProfile`, the real scheduled start/end time, and the real generated meeting link) instead of 100% hardcoded fake names, a fake "4 classmates" list, and a fixed `session-1` placeholder id that never matched any real class.
- **Live presence roster**: the participant list shows who is genuinely connected right now (Pusher presence channel), not a static fake list.
- **Real hand-raise & reactions**: broadcast live to the rest of the class, with server-side identity attached (a participant cannot spoof another participant's name).
- **Real participation-star awarding**: the teacher's "+15 XP" star button now calls `GamificationService.awardXp()` for real and broadcasts a live toast to the class, instead of being a decorative button with no handler.
- **Real class clock**: the header timer now ticks from the session's actual scheduled start/end time instead of a fixed, never-moving `32:15 / 45:00` string.
- **New authorization boundary**: `ClassroomLiveService` + `/api/realtime/classroom-auth` + `/api/classroom/[sessionId]/*` independently re-verify, on every request, that the caller is genuinely the assigned teacher or an actively enrolled student of that specific session -- a guessed or shared session id never grants access.
- Fixed dead/fake entry points into the classroom: the student dashboard's "Join Virtual Classroom" button now links to the student's real next scheduled session (or an honest "no upcoming class" state) instead of a hardcoded `session-1`; teachers previously had no in-app link into the classroom/whiteboard page at all -- added one to `/teacher/classes/[id]`.

### Fixed
- `student/page.tsx` no longer greets every visitor as a fixed fake name ("Zayd Tariq") or claims a fake "today at 04:00 PM" session regardless of who's actually logged in or what's actually scheduled.

---

## [Public B2B Page & Site-Wide Navigation Overhaul] - 2026-09-16
### Added
- **New public `/[locale]/schools` page**: the entire B2B roster-onboarding feature (bulk student upload, per-seat licensing, institutional admin dashboard) previously only existed behind a login inside the admin dashboard, with zero public page, pricing, or application path telling a school/mosque/homeschool co-op it existed. This page presents real, already-shipped institutional features (bulk roster onboarding, live admin dashboard, the real-time collaborative classroom, structured curriculum, certified teachers, attendance & progress reporting), seat-based pricing tiers (honestly framed as custom quotes, no invented dollar figures), and who it's built for (Islamic schools, community centers/mosques, homeschool co-ops).
- **Real institutional application form**: submits via a server action to a new rate-limited (`B2B_INQUIRY_PER_IP`) flow that emails the inquiry to `B2B_SALES_EMAIL` through the existing `EmailAdapter` (the same adapter used for account notifications elsewhere), with the same honest mock fallback when `RESEND_API_KEY` isn't configured -- inquiries are never silently dropped.
- **Working mobile navigation**: `Header.tsx` had no mobile menu at all -- below the `md` breakpoint, Programs/Age Groups/Pricing were simply absent from the page with nothing replacing them. Added a real toggled hamburger menu with all nav links (now including "For Schools").
- **Real footer links**: the footer's "Programs" column was 5 plain, unlinked `<li>` text items (and silently missing 2 of the 7 programs) styled to look like a nav list. All 7 programs now link to `/programs?program=<id>`, and a new "For Institutions" column links to the new `/schools` page and its application form.

### Changed
- `nav.schools` and a new `schools.*` translation namespace (~60 keys) added to all 6 locale dictionaries (`ar`, `en`, `nl`, `tr`, `it`, `es`), maintaining 100% key parity.
- `NotificationPayload.eventName` gained a `B2B_INQUIRY` variant (additive, non-breaking) and `RATE_LIMITS` gained `B2B_INQUIRY_PER_IP`.

---

## [Parent Dashboard: Real Data Instead of Fixed Demo Numbers] - 2026-09-16
### Fixed
- The parent dashboard (`/[locale]/parent`) showed the same fixed numbers to every parent regardless of their child's actual record: "12/12" attendance, "9.8/10 (98%)" homework average, "450 XP / Level 3" with a badge ("Golden Streak") that didn't exist in the badge catalog, a hardcoded teacher name/quote ("Ustadh Ahmed... Grade: 100/100"), a single hardcoded "Stars Cohort" class regardless of what was actually scheduled, and a fake invoice ("#INV-2026-0901") that didn't correspond to any real payment.
- All six are now sourced live: attendance from `AttendanceService` (real `AttendanceRecord` rows), homework average from a new `AssignmentService.getStudentHomeworkSummary()` (averages real `TeacherFeedback.score`, excluding ungraded submissions rather than counting them as 0), XP/level/badges from `GamificationService` (with the non-existent "Golden Streak" badge replaced by the student's real learning-streak day count), the latest evaluation from a new `AssignmentService.getLatestFeedbackForStudent()` (real teacher name, course, score, and parent-visible feedback text), the upcoming class from the same real-session lookup the student dashboard already uses (`SchedulingService.getNextSessionForStudent()`), and the subscription/invoice cards from the same real `Subscription`/`Plan`/`Invoice` Prisma rows the Billing page reads.
- Every card now has an honest empty state (e.g. "No classes recorded yet", "No teacher evaluation yet") instead of always showing a number, for a child with no data yet.

---

## [Full 6-Language Coverage: Public Pages] - 2026-09-16
### Fixed
- **Root cause**: a widespread `const isAr = locale === "ar"` pattern across public-facing pages meant Dutch, Turkish, Italian, and Spanish visitors were silently shown English text everywhere the code only ever distinguished Arabic from "everything else" -- despite the site advertising 6 full languages (`ar`, `en`, `nl`, `tr`, `it`, `es`) in the language switcher.
- **Homepage (`/[locale]`)**: the 7 program-card descriptions and the 4 age-group taglines/descriptions now read from the dictionary (`dict.programs.*Desc`, `dict.ageGroups.*Tagline/*Desc`) for all 6 locales instead of an `isAr ? ar : isNl ? nl : en` (or plain `locale === "ar" ? ar : en`) fallback that left Turkish/Italian/Spanish visitors reading English.
- **Programs catalog (`/[locale]/programs`)**: the single largest offender (63 hardcoded Arabic/English ternaries, zero prior dictionary usage) -- all UI chrome (labels, badges, CTAs, section titles, program target-ages, studio names/descriptions) now sourced from a new `programsCatalog` dictionary namespace across all 6 locales.
- **Curriculum module content**: `AdministrationRepository`'s 21 seeded curriculum modules previously had `descriptionEn`/`weeklyObjectivesEn` completely missing (raw Arabic was shown to every non-Arabic locale regardless of selection) -- added real English translations for all 21 modules, and the `CurriculumModule` type/admin "Add Module" form updated to match.
- **Terms of Service (`/[locale]/terms`) and Privacy Policy (`/[locale]/privacy`)**: both pages were 100% Arabic/English only (35 and 31 `isAr` ternaries respectively) for the full legal body text. Added complete `termsPage`/`privacyPage` translations to all 6 locale dictionaries and rewired both pages to render from them.
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against pre-change baseline) and zero ESLint warnings/errors across every file touched; confirmed full key-parity (475 lines, identical key sets) across all 6 dictionary JSON files.

### Known remaining gap
- Program and curriculum-module *domain content* itself (`Program.titleAr/titleEn`, `CurriculumModule.descriptionAr/descriptionEn`, etc.) is still Arabic/English only by design (a pre-existing seeded-content convention, distinct from the UI-chrome bug above) -- a Dutch/Turkish/Italian/Spanish visitor sees the Programs page UI in their language, but individual program/module descriptions still fall back to English. Translating this seeded content into all 6 languages is a separate, larger follow-up.
- Dashboards (Parent/Student/Teacher/Admin and their sub-pages) still use the same `isAr`-only pattern and were out of scope for this pass (public pages only, per explicit prioritization).

---

## [Full 6-Language Coverage: Program & Curriculum Content + Program-Id Bug Fix] - 2026-09-16
### Fixed
- **Program/Curriculum domain content, all 6 languages**: closed the gap flagged above. `CurriculumModule` (`AdministrationRepository.ts`) gained `titleNl/Tr/It/Es`, `descriptionNl/Tr/It/Es`, and `weeklyObjectivesNl/Tr/It/Es` fields, with real translations written for all 21 seeded modules across the 7 programs (Arabic Foundations, Reading, Writing, Speaking, Listening, Quran & Tajweed, Islamic Studies). The Programs page (`/[locale]/programs`) now resolves each module's title/description/weekly objectives per the visitor's actual locale instead of an `isAr ? ar : en` fallback.
- **Program title/description, all 6 languages**: rather than adding new `Program` table columns (which would need a manual `prisma db push` against production Postgres that can't be verified in this sandbox -- see `docs/DEPLOYMENT.md`), the existing dictionary-driven `programsCatalog.meta[prog-x]` structure gained `title`/`description` keys across all 6 locale dictionaries, sourced from the real seeded Arabic/English program copy (`prisma/seed.ts`) plus new Dutch/Turkish/Italian/Spanish translations. A DB-free, fully typecheckable fix.
- **Root-cause bug: `Program.id` (UUID) vs. curriculum "prog-xxx" slug mismatch**: `Program.id` is a random `@default(uuid())`, but `CurriculumModule.programId`, the dictionary's `programsCatalog.meta` keys, and public links all use a separate, stable "prog-foundations"/"prog-reading"/etc. slug with no relation to the database id. This silently broke curriculum module rendering on `/[locale]/programs` for every locale (`getCurriculumModules(selectedProgramId)` always returned an empty array, and program metadata always fell back to the Foundations program regardless of the tab selected) -- confirmed live via "0 Gedetailleerde Lesmodules" on the Dutch Programs page. The identical bug existed in the admin curriculum manager (`/[locale]/admin/curriculum`), always showing 0 modules for every program. Fixed with a new `PROGRAM_TYPE_TO_SLUG` map + `getProgramSlug()` helper (`AcademicRepository.ts`) that derives the stable slug from the real, stable `ProgramType` Prisma enum, and both pages now resolve curriculum/metadata lookups by that slug while still using the real database UUID only for genuine Prisma relation queries.
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against the pre-change baseline via `git stash`) and zero ESLint/`next lint` warnings across every file touched; confirmed full key-parity (376 flattened keys, identical key sets) across all 6 dictionary JSON files.

### Remaining gap
- Dashboards (Parent/Student/Teacher/Admin and their sub-pages) still use the same `isAr`-only pattern -- next phase.

---

## [Full 6-Language Coverage: Main 4 Dashboards] - 2026-09-16
### Fixed
- **Teacher, Student, Admin, and Parent dashboard landing pages, all 6 languages**: closed the highest-traffic gap flagged above. Each page's static/translatable UI chrome (headings, labels, button/link text, empty states) previously used an `isAr ? arabicText : englishText` shortcut that silently showed English to Dutch, Turkish, Italian, and Spanish users. Replaced with new per-role dictionary namespaces -- `teacherDashboard` (30 keys), `studentDashboard` (43 keys), `adminDashboard` (46 keys), `parentDashboard` (59 keys) -- with real translations written for all 6 locales, and `{placeholder}`-style `.replace()` templating for strings that interpolate dynamic data (names, counts, XP, scores, statuses, actor/IP audit lines, etc.).
- **Real formatting bug, Student and Parent dashboards**: `nextSession.startTimeUtc` was being formatted with `toLocaleString`/`Intl.DateTimeFormat(isAr ? "ar" : "en-US", ...)`, so every non-Arabic locale (Dutch, Turkish, Italian, Spanish) always got US date/time formatting regardless of the visitor's actual locale. Fixed with a proper `INTL_LOCALE` map (`ar: "ar", en: "en-US", nl: "nl-NL", tr: "tr-TR", it: "it-IT", es: "es-ES"`) in both files.
- **Known, documented exceptions kept on the `isAr` fallback pattern** (consistent with the Program/CurriculumModule precedent from the prior release): `profile.levelTitleAr/En` and `badge.titleAr/titleEn` (Student), `subscription.plan.nameAr/nameEn`, `badge.titleAr/titleEn`, and `course.titleAr/titleEn` (Parent) -- these are seeded, database-backed content that currently only exists in Arabic/English, a separate and larger follow-up from this UI-chrome fix.
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against the pre-change baseline via `git stash`) and zero ESLint/`next lint` warnings across all four files; confirmed full key-parity (554 flattened keys, identical key sets) across all 6 dictionary JSON files.

### Remaining gap
- The 12 dashboard sub-pages (system-health, reviews, quran-studio, stories, data-export, roadmap, pronunciation, flashcards, printables, schools, etc.) still use the same `isAr`-only pattern -- next follow-up batch, per the agreed phased rollout.

---

## [Full 6-Language Coverage: 12 Dashboard Sub-Pages] - 2026-09-17
### Fixed
- **All 12 dashboard sub-pages, all 6 languages**: closed the gap flagged above. Each page's UI chrome (breadcrumbs, headings, subtitles, labels) previously used the same `isAr ? arabicText : englishText` shortcut that silently showed English to Dutch, Turkish, Italian, and Spanish users. Replaced with new per-page dictionary namespaces -- `adminSystemHealth` (26 keys), `parentReviews` (26 keys), `studentQuranStudio` (17 keys), `studentStories` (20 keys), `adminDataExport` (23 keys), `adminReviews` (9 keys), `studentPronunciation` (6 keys), `studentFlashcards` (6 keys), `studentRoadmap` (6 keys), `adminSchools` (6 keys), `parentPrintables` (6 keys), `studentStoryReader` (2 keys) -- with real translations written for all 6 locales, and `{placeholder}`-style `.replace()` templating for strings that interpolate dynamic data (teacher names, student first names, seat counts, etc.).
- **Real bugs fixed en route**:
  - `parent/reviews` and `admin/reviews` formatted dates with a hardcoded `isAr ? "ar-SA" : "en-US"`, always showing US date formatting to Dutch/Turkish/Italian/Spanish users; fixed with a proper `INTL_LOCALE` map in both files.
  - `parent/reviews`: the star-rating filter `<select>` options were hardcoded Arabic text with no `isAr` ternary at all, so every locale (including English) saw Arabic labels; converted to dictionary keys.
  - `student/quran-studio`: the "ممتاز" (Excellent) recitation-score suffix was hardcoded Arabic shown to every locale regardless of selection; converted to a dictionary key. The page also had a hardcoded placeholder name ("Zayd's Verified Recitations") instead of the actual signed-in student's name; now templated from `studentProfile.firstName`.
  - `admin/reviews`: the "قيم {teacherName}" (rated ...) label was hardcoded Arabic shown to every locale; converted to a templated dictionary key.
- **Documented exceptions kept on the `isAr` fallback pattern** (consistent with prior releases): `rule.nameAr/nameEn` and `t.ruleTitleAr/ruleTitleEn` in `student/quran-studio` (internationally-recognized Tajweed transliteration terms -- e.g. Qalqalah, Idgham, Ikhfa, Madd -- are the correct form for all non-Arabic locales, not a translation gap); `rev.titleAr/commentAr/adminReplyAr` in `parent/reviews` and `admin/reviews`, and `story.titleAr` in `student/stories/[id]` (genuinely bilingual-only reviewer/author-submitted content with no other-language pair -- translating real user-submitted text is a separate, larger follow-up requiring a translation pipeline); the RTL directional-icon flip (`isAr ? "" : "rotate-180"` on `<ArrowRight>`) present in every file (layout direction, not translatable text).
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against the pre-change baseline via `git stash`) and zero ESLint/`next lint` warnings across all 12 files; confirmed full key-parity (707 flattened keys, identical key sets) across all 6 dictionary JSON files.

### Remaining gap
- The bilingual-only DB/seeded content noted above (review text, story titles, badge/plan/course titles from the earlier dashboards batch) is still Arabic/English only -- a genuine translation-pipeline project, out of scope for a UI-chrome pass.
- This closes out the full dashboards + sub-pages rollout: public pages, program/curriculum content, and now all main dashboards and sub-pages have full 6-language UI-chrome coverage.

---

## [Story Content + Live Review Translation] - 2026-09-17
### Added
- **Live translation for parent reviews & academy replies**: real parent-submitted review text (title, comment) and admin replies have no other-language pair to fall back to -- it's free text in whatever language the writer typed. Added `ReviewTranslationAdapter` (`src/lib/integrations/ai/`), reusing the same live Anthropic Claude integration already built for the AI Tutor feature (same `ANTHROPIC_API_KEY`). All reviews on a page are translated to the viewer's locale in a single batched API call, cached in-memory per (locale, content) for the life of the warm server instance, and skipped entirely for the Arabic locale (the large majority of real content, so no wasted calls on the common case). A small "Translated" badge marks machine-translated text on both `parent/reviews` and `admin/reviews`. Falls back honestly to the original, untranslated text if `ANTHROPIC_API_KEY` isn't configured or a live call fails -- reviews never break or disappear. Factored the shared Anthropic request/response plumbing out of `KidsArabicAiTutorAdapter` into a new `anthropicClient.ts` so both features share one implementation.
- **Full 6-language story content & reader chrome**: closed the "story titles" part of the previously-flagged gap, and went further after finding the actual story-reading screen's UI (`InteractiveStoryReader`) was 100% hardcoded Arabic chrome with no dictionary hookup at all -- buttons, page indicator, quiz screen, and comprehension feedback were shown in Arabic to every visitor regardless of locale, including English ones. All 3 seeded stories (`StoryRepository`) gained `titleNl/Tr/It/Es` and `textNl/Tr/It/Es` per page (translation gloss shown beneath the Arabic reading text), and their comprehension-quiz questions/options/moral lessons -- previously Arabic-only with no English pair either -- gained real translations in all 6 languages. The Arabic reading text itself (and its click-to-pronounce/narration) is intentionally left untouched in every locale, since that's the content being taught, not UI chrome. `InteractiveStoryReader` now takes a `dict` prop (new `studentStoryReader` namespace, 26 keys) for every button/label/quiz string, and the quiz-completion feedback message (`StoryService.evaluateStoryQuiz`) is now generated from the viewer's locale instead of always Arabic.
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against the pre-change baseline) and zero ESLint/`next lint` warnings across every file touched; confirmed full key-parity (735 flattened keys, identical key sets) across all 6 dictionary JSON files.

### Known remaining gap
- **9 more interactive dashboard components are 100% hardcoded Arabic chrome with zero dictionary usage**, discovered while investigating the story reader and confirmed not in scope for the earlier "12 sub-pages" batch (that batch only covered the page.tsx wrapper around each of these, not the client component doing the actual interactive work): `VocabularySrsStudio` (flashcards), `PronunciationWaveformStudio`, `VisualLearningQuestMap` (roadmap), `SchoolManagementClient`, `ParentPrintablesClient`, `InteractiveWhiteboard`, `ClassroomLive`, `PhonicsArcadeStudio`, and `RoleSwitcher`. Some (`PhonicsArcadeStudio`) show raw Arabic to every locale including English with no conditional at all; the rest use the same `isAr`-only pattern that silently shows English to Dutch/Turkish/Italian/Spanish visitors. Roughly 3,000+ lines across these 9 files. Flagged as a known gap rather than fixed in this pass, per explicit scoping choice -- next follow-up batch.
- Genuinely bilingual-only DB/seeded content with no translation at all (badge/plan/course titles, story titles used as raw DB display elsewhere) remains a separate, smaller follow-up.

---

## [Full 6-Language Coverage: 9 Interactive Dashboard Components] - 2026-09-17
### Fixed
- **All 9 flagged interactive components, all 6 languages**: closed the gap flagged above. `RoleSwitcher`, `VocabularySrsStudio`, `PronunciationWaveformStudio`, `VisualLearningQuestMap`, `PhonicsArcadeStudio` (plus its `student/activities` page wrapper, which had no dictionary hookup at all), `ParentPrintablesClient`, `InteractiveWhiteboard`, `ClassroomLive`, and `SchoolManagementClient` (plus its `admin/schools` page's server action) all had their UI chrome -- buttons, headings, labels, tooltips, toasts, empty states, and result/feedback messages -- moved off the `isAr`-only pattern (or, for `PhonicsArcadeStudio`, off zero localization at all) onto real dictionary translations for all 6 locales. New per-component dictionary namespaces: `roleSwitcher`, `vocabularySrsStudio`, `pronunciationWaveformStudio`, `visualLearningQuestMap`, `studentActivities`, `phonicsArcadeStudio`, `parentPrintablesClient`, `interactiveWhiteboard`, `classroomLive`, `schoolManagementClient`.
- **Server-generated feedback messages, 3 more services**: `VocabularyService.completeSession`, `PronunciationService.evaluatePronunciation`, and `SchoolService.onboardBatchRoster` each previously built a `feedbackAr`/`feedbackEn` (or `messageAr`/`messageEn`) pair and let the client pick one with `isAr`. All three now take an optional `locale` param and build a single locale-aware `feedback` string server-side via the dictionary, consistent with the `StoryService` pattern from the prior release; the calling pages/server actions now pass `locale` through.
- **Real improvement found en route**: `VisualLearningQuestMap`'s treasure-chest reward badge previously showed the badge name only in Arabic (`isAr ? "مكافأة: ${badge} (+{xp})" : "Reward: +{xp} XP bonus"` -- English and every other locale silently dropped the badge name entirely). Replaced with a single templated `rewardBadgeTemplate` that shows the badge name in all 6 locales.
- **Scope boundary applied consistently** (same principle as the story reader's Arabic pronunciation text): UI chrome is fully localized; seeded/repository *data content* that only ever had an Arabic/English pair -- flashcard word content, phoneme letter names & makhraj tips, quest node/chest titles & descriptions, badge names, printable-packet titles & descriptions, `PhonicsArcadeStudio`'s actual Arabic letters/harakat/word-building teaching material -- is deliberately left as-is (same reasoning as `PhonicsArcadeStudio`'s letters: that's the Arabic being taught, not interface text). Expanding that seeded content to all 6 languages is a separate, larger follow-up, consistent with the "Known remaining gap" notes on every prior release in this rollout.
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against the pre-change 118-line baseline) and zero new ESLint/`next lint` warnings across every file touched (one pre-existing unused-var warning in `ClassroomLive.tsx`, predating this change); confirmed full key-parity (994 flattened keys, identical key sets) across all 6 dictionary JSON files; manually scanned all 9 changed components for any remaining raw Arabic chrome text -- none found outside the intentionally-scoped `PhonicsArcadeStudio` teaching content.

### Remaining gap
- This closes out the full 9-component follow-up batch. The only localization gaps left across the app are the documented bilingual-only seeded/DB content items noted across this rollout's release notes (review text, story titles, badge/plan/course titles, flashcard/phoneme/quest/printable data content) -- a genuine translation-pipeline project for real user- or curriculum-authored content, out of scope for a UI-chrome pass.

---

## [Self-Service Subscription Cancellation: Investigation + Fixes] - 2026-09-17
### Investigated
- Determined the current state of self-service subscription cancellation. The core infrastructure was **already fully built**: `StripeSubscriptionService.createBillingPortalSession` opens Stripe's hosted Billing Portal (with a robust `stripeCustomerId` fallback lookup by email, and backfill of the id and any missing `stripeSubscriptionId` when found), the parent billing page already wires it up behind a "Manage or Cancel Subscription" button, and the webhook (`src/app/api/webhooks/stripe/route.ts`) already handles `customer.subscription.updated`/`.deleted` to sync status. Confirmed in the live Vercel project settings that `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are both configured for the **Production** environment (not just Preview), so the button does render and the flow is live -- this was not a "nothing exists" gap, it was a set of real but narrower rough edges, fixed below.

### Fixed
- **Billing pages were 100% hardcoded Arabic with zero dictionary usage at all** (not even the `isAr` pattern seen elsewhere) -- worse than every other page fixed in this rollout, and on the one screen where a non-Arabic-speaking parent most needs to understand what they're being charged and how to cancel. `parent/billing/page.tsx` and `parent/invoices/[id]/page.tsx` (the invoice this page links to) are now fully localized across all 6 languages via two new dictionary namespaces, `parentBilling` (33 keys) and `parentInvoiceDetail` (31 keys).
- **Real bug found en route**: the billing card always displayed "شهرياً" / "Monthly" as the billing cadence regardless of the plan's actual `interval` (`MONTHLY` / `QUARTERLY` / `ANNUALLY`) -- a parent on a quarterly or annual plan was shown incorrect billing-frequency information right next to the cancel button. Fixed with a proper `INTERVAL_LABELS` map keyed off `subscription.plan.interval`.
- **Real gap found en route: no visibility into a pending cancellation.** `syncSubscriptionStatus` only reacts to Stripe's top-level subscription `status`, which stays `ACTIVE` locally for the rest of the paid period after a parent cancels through the Billing Portal (Stripe's default "cancel at period end" behavior) -- so a parent who successfully self-cancelled saw no confirmation anywhere in the app and had every reason to believe it silently failed, or to contact support to double check. Added `StripeSubscriptionService.getSubscriptionCancellationState()`, which reads the live `cancel_at_period_end` flag from Stripe (no new Prisma column, so no schema migration was needed or risked against production Postgres from this sandbox), and a clear amber banner on the billing page: "Your subscription is scheduled to cancel on {date}. You won't be charged again..." whenever it's true.
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against the pre-change 118-line baseline) and zero ESLint/`next lint` warnings across all 3 touched files; confirmed full key-parity (1,058 flattened keys, identical key sets) across all 6 dictionary JSON files; manually scanned both pages for leftover raw Arabic chrome text -- none found.

### Known remaining gap
- `parent/checkout/page.tsx` (where a parent starts or changes a plan, one click away from billing) is also 100% hardcoded Arabic with zero dictionary usage -- found during this investigation but kept out of scope, since it's a distinct flow (subscribing/upgrading) from cancellation. Flagged as the next natural follow-up in this billing-flow localization thread.

---

## [Security: Missing Auth Guards on 16 Admin/Teacher/Parent Pages] - 2026-09-17
### Investigated
- Followed up on the "14 student/\* pages + `admin/schedule/page.tsx` use a hardcoded identity" item. Verified it's already fully fixed and shipped (commit `61cf28a`, 2026-09-15): all 14 `student/*` pages resolve the real logged-in student via `requireStudentProfile`, and `admin/schedule/page.tsx` resolves the real assigned teacher from live `TeacherAssignment` records rather than any hardcoded id. No hardcoded student/teacher ids remain anywhere in the codebase.
- While verifying, found a materially more serious issue in the same area: **16 dashboard pages across all three staff/parent roles had no authentication check of any kind** -- not `requireAdminSession`, `requireTeacherProfile`, `requireParentProfile`, nor even a bare `requireSession`. `src/middleware.ts` only handles the root-path locale redirect and performs no auth gating, so any of these pages was reachable by anyone with the URL, logged in or not: 11 of 15 `admin/*` pages (including finance, audit-logs, data-export, schools, reports, reviews, system-health, classes, integrations, schedule, and the admin home/KPI page itself), 4 of 8 `teacher/*` pages (including the teacher home page and gradebook), and 1 `parent/*` page (printables). Confirmed via a full grep sweep of every `page.tsx` under `student/`, `teacher/`, `parent/`, and `admin/` before and after the fix.

### Fixed
- Added the role-appropriate guard (`requireAdminSession`, `requireTeacherProfile`, or `requireParentProfile`, all pre-existing in `src/lib/auth/currentUser.ts`) as the first statement in each of the 16 unguarded pages, and independently re-verified inside every mutating server action defined in those files (rather than relying on a closure over the page-render-time session), matching the stronger pattern already used on `parent/billing`, `student/pronunciation`, and `student/stories/[id]`: `admin/audit-logs`, `admin/classes` (+ `handleCreateClass`), `admin/data-export`, `admin/finance`, `admin/integrations` (+ `handleTestDispatch`), `admin/page` (home/KPI dashboard), `admin/reports`, `admin/reviews` (+ both approve/flag moderation actions), `admin/schedule` (+ `handleScheduleSession`), `admin/schools` (+ `handleOnboardBatchAction`), `admin/system-health`, `teacher/ai-assistant`, `teacher/classes/[id]` (+ `handleMarkAttendance`), `teacher/gradebook` (+ `handleRecordLiveEvaluation`), `teacher/page` (home dashboard), `parent/printables`.
- Confirmed `/api/admin/export` (the CSV/JSON download route linked from `admin/data-export` and `admin/finance`) already has its own independent session check and needed no change.
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against the pre-change 118-line baseline) and zero ESLint/`next lint` warnings across all 16 changed files; diff reviewed file-by-file -- purely additive (40 lines added, 0 removed, 16 files).

### Known remaining scope note
- This pass adds authentication (is someone logged in with the right role) to every previously-open page. It does not add finer-grained authorization scoping beyond that -- e.g. `teacher/classes/[id]` does not yet verify the logged-in teacher is the one actually assigned to that specific class before showing its roster, matching the level of rigor already present on sibling teacher pages like `teacher/assignments`. Tightening that further is a separate, smaller follow-up if wanted.
- Whether the Stripe Dashboard's own Customer Portal configuration (Settings → Billing → Customer portal) is active for the live account is a Stripe-side setting outside this repo and outside this sandbox's access -- if it's ever deactivated, `createBillingPortalSession` degrades gracefully to the existing "contact support" banner rather than crashing, but worth a one-time manual check in the Stripe Dashboard.

---

## [Verified: Password Reset & Transactional Email Are Already Live] - 2026-09-17
### Investigated
- Picked up "build a real password reset / account recovery flow" and "wire up real transactional email via Resend" as the next two open items. Both turned out to be **already fully built and already live**, not gaps: `(auth)/forgot-password` and `(auth)/reset-password` implement a complete, secure recovery flow -- single-use SHA-256-hashed reset tokens (`PasswordResetToken` Prisma model, 1-hour TTL, never store the raw token), per-IP and per-email rate limiting backed by a Postgres sliding window (`src/lib/security/rateLimit.ts`), a uniform "check your email" response regardless of whether the address exists (no account-enumeration signal), bcrypt password hashing, and the same protections mirrored on `(auth)/login` itself (rate-limited, generic invalid-credentials message, demo login helpers hidden behind `NEXT_PUBLIC_HIDE_DEMO_SWITCHER`). `EmailAdapter` (`src/lib/integrations/notifications/EmailAdapter.ts`) sends real transactional email through Resend's HTTP API when `RESEND_API_KEY` is set, with an honest (not silently-faked) fallback path if only `SMTP_HOST` is set without a real SMTP client wired up, and a clearly-labeled dev-sandbox mock otherwise.
- Confirmed this is genuinely live, not just code-complete, the same way the Stripe keys were confirmed for subscription cancellation: checked the live Vercel Production environment variables and found `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL` (used to build the reset link emailed to the user), and `NEXT_PUBLIC_HIDE_DEMO_SWITCHER` all configured for the **Production** environment specifically.
- Verified full dictionary key parity for the `auth` namespace (46 keys, all 6 locales, no mismatches) and that every string the two pages and the login page reference actually exists in each locale file.
- No code changes were made in this investigation -- there was nothing to fix.

---

## [Verified: Certificate Verification & Student Suspend/Activate Are Already Real] - 2026-09-17
### Investigated
- Picked up "fix fake certificate verification" and "persist student suspend/activate status to Prisma" as the next two open items. Both were also already fully built and already live -- part of the same large fix batch (`d69dbac`/`e4656f2`, 2026-09-15) that had already resolved the password-reset and Resend items above, none of which had been reflected back onto the task list.
- **Certificate verification**: `CertificateService` and the public `/verify/[id]` page previously fabricated the exact same "98% Distinction, Level A1" result for any plausibly-formatted credential ID, whether or not it was ever issued. Now backed by a real `Certificate` Prisma model: `issueRoadmapCompletionCertificateIfEligible` is called from `RoadmapService.completeNodeAndAward` and genuinely issues a certificate (idempotently) only the moment a student finishes every roadmap node; grade/level are derived from that student's real placement result and roadmap star count, not fixed text; `verifyCertificate` looks up the credential by its unique `verificationCode` and returns "not found" for anything that was never actually issued. `student/certificates/page.tsx` correctly shows a "you haven't earned one yet" state when `getCertificateForStudent` returns null, instead of always rendering a certificate.
- **Student suspend/activate**: `admin/students/page.tsx`'s `handleToggleStatus` action already calls `AdministrationService.setStudentStatus`, which calls through to `AdministrationRepository.setStudentStatus` and genuinely writes `prisma.user.update({ data: { status } })`, plus records a real audit log entry (`STUDENT_ACTIVATED`/`STUDENT_SUSPENDED`). Not an in-memory toggle.
- Also surveyed every repository under `src/server/repositories/` for any other in-memory-only data masquerading as persisted state (the same class of issue). Found none newly needing migration: `FinancialRepository` is intentionally left in-memory for its subscription-plan catalog and discount coupons only (a legitimate static-config design, explicitly documented in the file -- real subscriptions/invoices/payments/payroll already live in Prisma via `StripeSubscriptionService`/`PayrollService`), matching the same already-decided pattern as `AssessmentBankRepository`, `RecommendationRepository`, and `PrintablesRepository` from the earlier repository-migration batch.
- No code changes were made in this investigation -- there was nothing to fix.

---

## [In-Memory Repository Audit: Real Bug Found & Fixed in Parent Recommendations] - 2026-09-17
### Investigated
- Did the full item-by-item confirmation pass on every repository in `src/server/repositories/` (all 21 files) that the earlier "already-decided pattern" note above summarized in one line. This time each file was read in full, not just checked for the presence/absence of `prisma.` calls, specifically to catch the subtler case the earlier passes could have missed: a repository that's correctly in-memory for static catalog content, but whose *service layer* still fabricates a stand-in for missing real user data.
- Confirmed 16 of 21 repositories are fully Prisma-backed for every method touching real user/student data (`AcademicRepository`, `AssignmentRepository`, `AttendanceRepository`, `CommunicationRepository`, `GamificationRepository`, `GradebookRepository`, `ReviewRepository`, `SchedulingRepository`, `SchoolRepository`, `UserRepository`, plus `AdministrationRepository`, `PlacementRepository`, `PronunciationRepository`, `QuranRepository`, `RoadmapRepository`, `StoryRepository`, `VocabularyRepository` -- this last group each additionally keep only their static reference catalog in-memory by design: quest-node/chest definitions, phoneme/Makharij tables, Quran Surah text, story content, flashcard decks, placement question bank -- all pre-existing, already-commented as intentional).
- Confirmed `FinancialRepository` (plan catalog + coupons), `AssessmentBankRepository` (question bank + exam definitions), and `PrintablesRepository` (worksheet/poster templates) remain correctly in-memory-by-design: admin-authored reference/catalog content, not per-user mutable state -- matches the project's own established policy, no drift found.
- **Found a genuine, currently-live bug in `RecommendationRepository`/`RecommendationService`** that the earlier "matching the same already-decided pattern" summary missed. `RecommendationRepository` itself is fine (an in-memory Map, correctly scoped to a single fake demo student, `"student-1"`; its `addRecommendation` write method has zero callers anywhere in the app -- dead code, not a live bug). The real problem was one layer up: whenever `RecommendationService.getParentRecommendationOverview` looked up a **real** student (i.e. any student except the demo seed), it fell back to a milestone-progress checklist that was **entirely hardcoded** -- `"تم الإنجاز بنسبة 100%"` ("achieved 100%") on two fixed milestones and a fixed `overallProgressPercent: 70`, for every real student, regardless of what they'd actually done. This is rendered live on `parent/recommendations/page.tsx`'s "CEFR Milestones Checklist" panel, meaning every real parent was shown fabricated academic-achievement claims about their own child -- the same class of bug as the fake certificate verification and pre-seeded roadmap progress issues already fixed earlier in this engagement, just not yet caught because it lived in a service-layer fallback rather than the repository itself.

### Fixed
- `RecommendationService.getParentRecommendationOverview`'s milestone fallback (`src/server/services/RecommendationService.ts`) no longer returns static content. Added `deriveMilestoneProgressFromRoadmap`, which builds the CEFR milestone checklist from the student's real, already-persisted `RoadmapNodeProgress` rows (via `roadmapRepository.getStudentProgress`): quest nodes are grouped by their existing `cefrMilestone` tag (`PRE_A1`/`A1`/`A2`/`B1`), a tier is marked achieved only once every node tagged with it is genuinely `COMPLETED`, the "target" tier is the first one not yet fully achieved, and `overallProgressPercent` now reuses the roadmap's own real `pathCompletionPercentage` instead of a fixed `70`. A brand-new real student now honestly starts with nothing achieved and 0% overall, exactly matching what `student/roadmap` already shows them, rather than contradicting it with a fake "70% done, two milestones already achieved" claim on the parent's screen.
- Left the "recommendations" list's dynamic fallback text as-is (out of scope for this pass): it already references the student's real `readingScore` in its rationale copy, so it isn't fabricating an achievement claim the way the milestone checklist was -- it's a lower-severity, generic-template issue (always suggests READING + a conversation-practice HABIT item rather than targeting the student's actual weakest skill), flagged below as a smaller follow-up rather than mixed into this fix.
- Verified zero net-new TypeScript errors (`tsc --noEmit` diffed against the pre-change 118-line baseline) and zero ESLint/`next lint` warnings on the changed file.

### Known remaining gap
- The "recommendations" list itself (as opposed to the milestone checklist fixed here) still picks a fixed READING + HABIT pairing for every real student rather than targeting whichever of the five competency scores is actually weakest. Not a fabricated-achievement bug like the milestone checklist was, just a lower-value personalization gap -- worth a small follow-up pass if wanted.
- `RecommendationRepository.addRecommendation` remains dead code (no caller, and no Prisma model exists for `LearningRecommendation`/`StudentMilestoneProgress` yet). Fine to leave as-is unless a future admin/teacher "write a custom recommendation" feature gets built, at which point it would need a real schema + Prisma-backed write path rather than the current in-memory `Map.set`.
