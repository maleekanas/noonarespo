# Architecture & System Design: Kids Arabic Academy

## 1. Executive Architecture Summary
Kids Arabic Academy is built as an enterprise-grade, accessible, multilingual (Arabic RTL / English LTR), child-safe Educational Management & Learning Platform.

### Core Architectural Decisions:
- **Framework**: Next.js App Router (React 19, Strict TypeScript).
- **Styling & UI**: Tailwind CSS with BiDi support (`dir="rtl"` / `dir="ltr"` using logical start/end properties), Radix UI primitives, Lucide icons.
- **ORM & Database**: Prisma ORM with PostgreSQL.
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
│   │   ├── [locale]/                    # Next.js i18n dynamic route segment (ar / en)
│   │   │   ├── (marketing)/             # Public web pages
│   │   │   ├── (auth)/                  # Auth flows (login, register, verify)
│   │   │   └── (dashboard)/             # Role-gated dashboard zones
│   │   │       ├── student/             # Student portal
│   │   │       ├── parent/              # Parent portal
│   │   │       ├── teacher/             # Teacher portal
│   │   │       ├── academic/            # Academic Admin portal
│   │   │       ├── finance/             # Finance Admin portal
│   │   │       ├── admin/               # School Admin portal
│   │   │       └── super-admin/         # Super Admin portal
│   │   └── api/                         # Webhooks & public APIs
│   ├── components/
│   │   ├── ui/                          # Radix / shadcn/ui components
│   │   ├── shared/                      # Directional icons, RTL wrappers
│   │   ├── navigation/                  # Role navbars, child switchers
│   │   └── forms/                       # React Hook Form + Zod controls
│   ├── features/                        # Domain-isolated modules
│   ├── lib/                             # Core library utilities (auth, db, security)
│   ├── server/
│   │   ├── services/                    # Business domain logic
│   │   ├── repositories/                # Data access layer
│   │   └── policies/                    # Declarative authorization guards
│   ├── types/                           # Global TypeScript types & DTOs
│   └── emails/                          # Transactional email templates
└── tests/                               # Unit, integration, E2E test suites
```

---

## 3. Localization & RTL (Right-to-Left) Architecture
1. **Locale Parameter**: Next.js route segment `[locale]` (`ar` by default, `en` secondary).
2. **HTML Attributes**: Root layout dynamically injects `<html lang="{locale}" dir="{locale === 'ar' ? 'rtl' : 'ltr'}">`.
3. **BiDi UI Rules**:
   - Strictly use logical Tailwind utility classes: `ps-*` (padding-inline-start), `pe-*` (padding-inline-end), `ms-*`, `me-*`, `text-start`, `text-end`.
   - Icons that indicate direction (back, forward, chevron, breadcrumbs) are wrapped in `<DirectionalIcon />` which auto-flips in RTL.
4. **Number and Currency Formatting**: All numbers and currency displays use locale-aware `Intl.NumberFormat` instances.

---

## 4. Virtual Meeting Provider Architecture
The platform isolates virtual classroom providers behind a unified provider interface:
```typescript
export interface MeetingProvider {
  createSession(params: CreateSessionParams): Promise<MeetingRecord>;
  updateSession(meetingId: string, params: UpdateSessionParams): Promise<MeetingRecord>;
  cancelSession(meetingId: string): Promise<void>;
  getRecordingUrl(meetingId: string): Promise<string | null>;
}
```
Implementations include:
- `MockMeetingProvider` (for local development and testing)
- `ZoomMeetingProvider`
- `TeamsMeetingProvider`
- `GoogleMeetProvider`
