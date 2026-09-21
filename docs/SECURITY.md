# Security & Child Safety Architecture: Kids Arabic Academy

Child safety and data privacy are foundational architectural concerns for Kids Arabic Academy. This document details the threat model, COPPA/GDPR-K engineering alignment, and operational security controls.

> [!NOTE]
> Kids Arabic Academy is engineered strictly in accordance with COPPA and GDPR-K child data protection principles. Formal compliance requires ongoing legal and operational audit before commercial operations.

---

## 1. Child Safety Threat Model

| Threat / Risk | Severity | Architectural Mitigation |
| :--- | :--- | :--- |
| **Independent child registration** | Critical | Children cannot sign up independently. All student accounts are created and verified by parents or school administrators with verifiable parental consent. |
| **Exposure of Child PII** | Critical | Student profiles do not store child personal phone numbers, physical home addresses, or public email addresses. In class groups, children are identified by first name and initial only. |
| **Unmoderated communication** | Critical | Direct student-to-student messaging is strictly disabled in the platform. Students can only communicate in supervised virtual classrooms with certified teachers. Parent-teacher messaging is monitored with full audit trails. |
| **Unauthorized child media access** | High | Audio homework submissions and recorded lessons are stored in private cloud storage. Access is granted exclusively via short-lived, signed URLs with strict role checks. |
| **Sensitive teacher note exposure** | Medium | Internal pedagogical and diagnostic notes (`notesInternal`) are kept in a separate database column and explicitly filtered out of parent/student API responses. |
| **Public leaderboards & competitive pressure** | Medium | Gamification (XP, badges, streaks) is individualized. Public zero-sum ranking boards are omitted to avoid psychological distress and peer exposure. |
| **Support Agent data leakage** | Medium | Support agents have diagnostic-only read access to look up account states and session links. They cannot view plain-text credentials, payment card tokens, or internal pedagogical notes. |

---

## 2. Authentication & Authorization Controls
- **Password Security**: Passwords hashed using bcrypt (cost factor 10).
- **Session Protection**: HttpOnly, Secure, SameSite=Strict cookies with cryptographic session tokens.
- **Server-Side Policy Checks**: Every server action and route handler runs policy checks from `src/server/policies/` prior to accessing or mutating records. Client-side role claims are never trusted.
- **CSRF & Rate Limiting**: Next.js Server Actions provide built-in CSRF origin validation. Login, registration, and password-reset requests are rate-limited per IP address and per account via `src/lib/security/rateLimit.ts` using sliding windows backed by `rate_limit_attempts`.

---

## 3. Financial Security & Minor Units
- **Integer Minor Units**: All monetary values are strictly represented in integer cents (e.g. 7900 for $79.00). Floating-point mathematics is prohibited in financial services.
- **No Card Storage**: Raw credit card and banking details are never received or stored on application servers. Payments are handled via Stripe, PayPal, and Mollie abstractions.
- **Idempotency Keys**: All financial state transitions require unique UUID idempotency keys to prevent duplicate billing.
- **Immutability**: Finalized invoices and payment receipts cannot be deleted or overwritten in the database.
