# Quality Assurance & Testing Strategy: Kids Arabic Academy

Kids Arabic Academy enforces multi-layered automated and manual verification to guarantee stability, security, accessibility, and RTL fidelity.

---

## 1. Test Pyramid & Tooling

```text
       ▲
      / \        E2E Tests (Playwright) - Critical Parent/Student/Teacher flows
     /   \
    /-----\      Integration Tests (Vitest + Prisma) - Service & Policy Guards
   /       \
  /---------\    Unit Tests (Vitest) - Conflict detection, billing, validation
```

- **Unit & Integration**: Vitest (`npm.cmd run test`).
- **Static Analysis & Typechecking**: Strict TypeScript (`npm.cmd run typecheck`) and ESLint (`npm.cmd run lint`).
- **End-to-End (E2E)**: Playwright (`npx.cmd playwright test`).

---

## 2. Critical Test Scenarios

### A. Authorization & RBAC Policies
- Confirm that a Parent cannot access another parent's child profile or invoices.
- Confirm that a Student cannot access other students' submissions or teacher internal notes.
- Confirm that unauthenticated requests to `/dashboard/*` redirect to `/[locale]/login`.
- Confirm that teacher attendance marking is rejected if the teacher is not assigned to the class.

### B. Scheduling & Conflict Detection
- Creating two overlapping sessions for the same teacher must trigger a conflict warning/error.
- Enrolling a student into two overlapping classes must be prevented.
- Timezone conversions must accurately preserve UTC session boundaries across daylight saving transitions.

### C. Financial Integrity
- Invoices must calculate subtotal, discounts, and taxes strictly in integer minor units.
- Webhook duplicate events with identical `idempotencyKey` must be handled idempotently without duplicate records.
- Completed and paid invoices must reject update or delete mutations.

### D. Arabic RTL & Accessibility
- Validate that switching to `/ar` sets `dir="rtl"` on `<html>`.
- Confirm directional UI elements (back navigation, chevrons, pagination) mirror properly in RTL.
- Ensure all interactive elements have keyboard focus indicators and minimum touch targets of 44x44px.

### E. Support Agent & Diagnostics
- Confirm `canViewStudent` allows `SUPPORT_AGENT` role diagnostic read access to student learning data.
- Confirm `canMessageUser` prevents support agents from sending unauthorized direct messages to students.
- Validate diagnostic session status and connectivity indicators.

### F. Multi-Format Assessment Suite
- Validate test execution across all 7 question formats: MCQ, True/False, Matching, Fill-in-Blank, Essay, Audio, and Voice Recording.
- Verify automatic scoring and immediate feedback for objective question types.
- Ensure pending teacher evaluation state for subjective and audio submissions.

### G. CRM & Marketing Integrations
- Validate lead submission handling across HubSpot, GoHighLevel, and Mailchimp adapters.
- Confirm fallback behavior when external CRM API keys are unconfigured.
- Ensure referral code generation, invite tracking, and reward calculation are strictly idempotent.

