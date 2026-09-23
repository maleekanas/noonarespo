# Architecture & System Design: Kids Arabic Academy

## 1. Executive Architecture Summary
Kids Arabic Academy is built as an enterprise-grade, accessible, multilingual (Arabic RTL / English LTR + Dutch, Turkish, Italian, Spanish), child-safe Educational Management & Learning Platform.

### Core Architectural Decisions:
- **Framework**: Next.js 15 App Router (React 19, Strict TypeScript).
- **Styling & UI**: Tailwind CSS with BiDi support (`dir="rtl"` / `dir="ltr"` using logical start/end properties), Radix UI primitives, Lucide icons.
- **ORM & Database**: Prisma ORM with PostgreSQL.
- **Multi-Tenancy**: B2B institutional tenant model scoping `PartnerSchool` entities, classes, student rosters, and administration dashboards.
- **Real-Time Layer**: Collaborative interactive whiteboard with WebSocket / Pusher signaling and live audio waveforms.
- **State & Server Interactions**: React Server Components (RSC) for optimized data fetching, Server Actions with Zod validation for mutations, and API Route Handlers for webhooks.
- **Authorization**: Centralized server-side policy guards (`src/server/policies/`) executed on every mutation and data query.

---

## 2. Directory Layout & Module Structure

```text
kids-arabic-academy/
├── docs/                                # Technical governance documentation
├── prisma/                              # Database schema, migrations, seed
├── public/                              # Static public assets (logos, badges, sounds)
├── src/
│   ├── app/
│   │   ├── [locale]/                    # Next.js i18n dynamic route segment (ar, en, nl, tr, it, es)
│   │   │   ├── (marketing)/             # Public pages (programs, how-it-works, pricing, about, contact, faq, for-parents, teach, inquiry, child-safety, schools)
│   │   │   ├── (auth)/                  # Auth flows (login, register, verify-email, reset-password)
│   │   │   └── (dashboard)/             # Role-gated dashboard zones
│   │   │       ├── student/             # Student portal & interactive learning studios
│   │   │       ├── parent/              # Parent portal, progress, billing, referrals
│   │   │       ├── teacher/             # Teacher portal, gradebook, payroll
│   │   │       ├── school-admin/        # Institutional B2B Admin portal (scoped)
│   │   │       ├── support/             # Support Agent diagnostic portal
│   │   │       ├── admin/               # Super / Academic / Finance Admin portal
│   │   │       └── classroom/[id]/      # Live virtual collaborative classroom
│   │   └── api/                         # Webhooks (Stripe) & health checks
│   ├── components/
│   │   ├── ui/                          # Radix / Tailwind components
│   │   ├── shared/                      # Directional icons, RTL wrappers, role switcher
│   │   ├── navigation/                  # Header, Footer, child switchers
│   │   ├── classroom/                   # Interactive whiteboard, video controls
│   │   ├── assessments/                 # Multi-format exam runner (MCQ, essay, audio)
│   │   ├── activities/                  # Phonics Arcade studio
│   │   ├── vocabulary/                  # Spaced repetition Leitner flashcards
│   │   ├── pronunciation/               # Real-time pitch & phoneme waveform analyzer
│   │   └── stories/                     # Illustrated interactive bilingual stories
│   ├── lib/                             # Core utilities (auth, db, security, localization)
│   ├── server/
│   │   ├── services/                    # Business domain logic (Academic, Billing, CRM, Referral, etc.)
│   │   ├── repositories/                # Data access layer
│   │   └── policies/                    # Declarative authorization guards
│   └── tests/                           # Unit, integration, E2E test suites
```

---

## 3. Multi-Tenant B2B Architecture
- **Tenant Scope**: Institutional schools (`PartnerSchool`) manage private rosters, contracted seat allocations, and custom academic tracks.
- **Access Isolation**: Logged-in `SCHOOL_ADMIN` accounts are scoped to their assigned `schoolId`. They cannot query or modify rosters, classes, or financial records outside their institution.
- **Bulk Roster Onboarding**: Batched student account generation with automated password hashing and guardian association without polluting the platform-wide individual student pool.

---

## 4. Real-Time Collaborative Classroom
- **Interactive Whiteboard**: Vector stroke rendering with ruler lines for Arabic Naskh penmanship, synchronized in real time between teacher and students.
- **Pronunciation Studio**: Web Audio API waveform visualizer comparing student speech phonemes against native audio benchmarks.
- **Virtual Meeting Isolation**: Meeting provider adapters for Zoom, Teams, Google Meet, and Webex with graceful fallback mocks.

---

## 5. Marketing & CRM Architecture
- **Unified Lead Capture**: Contact, enrollment inquiry, and teacher application forms feed into `CrmService`.
- **CRM Adapters**: Typed adapters for HubSpot, GoHighLevel, and Mailchimp.
- **Family Referral Program**: Parents earn $25 account credits per referred family who enrolls in a paid plan.
