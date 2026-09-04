# Security & Child Safety Architecture: Kids Arabic Academy

Child safety and data privacy are foundational architectural concerns for Kids Arabic Academy. This document details the threat model, COPPA/GDPR-K alignment, and security controls.

---

## 1. Child Safety Threat Model

| Threat / Risk | Severity | Architectural Mitigation |
| :--- | :--- | :--- |
| **Independent child registration** | Critical | Children cannot sign up independently. All student accounts are created and verified by parents or school administrators. |
| **Exposure of Child PII** | Critical | Student profiles do not store child personal phone numbers, physical home addresses, or public email addresses. In class groups, children are identified by first name and initial only. |
| **Unmoderated communication** | Critical | Direct student-to-student messaging is strictly disabled in the platform. Students can only communicate in supervised virtual classrooms. Parent-teacher messaging is monitored with full audit trails. |
| **Unauthorized child media access** | High | Audio homework submissions and recorded lessons are stored in private cloud storage. Access is granted exclusively via short-lived, signed URLs with strict role checks. |
| **Sensitive teacher note exposure** | Medium | Internal pedagogical and diagnostic notes are kept in a separate database column and explicitly filtered out of parent/student API responses. |
| **Public leaderboards & competitive pressure** | Medium | Gamification (XP, badges, streaks) is individualized. Public zero-sum ranking boards are omitted to avoid psychological distress and peer exposure. |

---

## 2. Authentication & Authorization Controls
- **Password Security**: Passwords hashed using bcrypt (cost factor 12) or Argon2id.
- **Session Protection**: HttpOnly, Secure, SameSite=Strict cookies with cryptographic session tokens.
- **Server-Side Policy Checks**: Every server action and route handler runs policy checks from `src/server/policies/` prior to accessing or mutating records. Client-side role claims are never trusted.
- **CSRF & Rate Limiting**: Next.js Server Actions provide built-in CSRF origin validation. API routes are rate-limited per IP and user account.

---

## 3. Financial Security
- **No Card Storage**: Raw credit card and banking details are never received or stored on application servers.
- **Idempotency Keys**: All financial state transitions require unique UUID idempotency keys to prevent duplicate transactions.
- **Immutability**: Finalized invoices and payment receipts cannot be deleted or overwritten in the database.
