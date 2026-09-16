# Changelog: Kids Arabic Academy

All notable changes to the Kids Arabic Academy platform will be documented in this file following Keep a Changelog standards.

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
