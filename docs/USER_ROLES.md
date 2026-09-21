# User Roles & Permission Matrix: Kids Arabic Academy

Kids Arabic Academy enforces strict Role-Based Access Control (RBAC) supplemented with Resource-Based and Tenant-Scoped Policies.

---

## 1. System Roles

1. **SUPER_ADMIN**: Full system authority, system configuration, audit logs, feature flags, global overrides across all tenants.
2. **SCHOOL_ADMIN**: Scoped B2B institutional administrator. Manages one specific `PartnerSchool` (teacher assignments, scoped classes, student roster, and institution analytics). Cannot view other partner schools.
3. **ACADEMIC_ADMIN**: Global curriculum planning, course level definitions, pedagogical standards, assessment banks, and grading rubrics.
4. **FINANCE_ADMIN**: Subscription tiers, invoice generation, refund processing, teacher compensation records, and revenue analytics.
5. **SUPPORT_AGENT**: Diagnostic access across user accounts (students, parents, teachers), session link verification, customer inquiry inbox, and password reset assistance. Zero access to plain-text passwords or card data.
6. **TEACHER**: View assigned classes, mark attendance, assign homework, record live session evaluations, submit grades, and supervised messaging with parents.
7. **PARENT**: Manage linked children, review attendance & progress, pay invoices, access recorded lessons, and communicate with assigned teachers.
8. **STUDENT**: Access enrolled classes, submit homework, take interactive assessments, view teacher feedback, play learning studio games, and track individual badges and XP.

---

## 2. Permission Matrix

| Resource / Capability | Super Admin | School Admin | Academic Admin | Finance Admin | Support Agent | Teacher | Parent | Student |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **System Settings & Flags** | Full | None | None | None | None | None | None | None |
| **Audit Logs** | Full | Scoped Read | None | Scoped Read | Read Only | None | None | None |
| **User Diagnostics** | Full | Scoped Write | Read | Read | Diagnostic Read | None | None | None |
| **Course & Curriculum** | Full | Read | Write | Read | Read | Read | Read | Read |
| **Class Scheduling** | Full | Scoped Write | Read | None | Read | Assigned | Enrolled | Enrolled |
| **Attendance Recording**| Full | Scoped Write | None | None | None | Assigned | None | None |
| **Attendance Viewing**  | Full | Scoped Read | Read | Read | Read | Assigned | Linked Children | Own |
| **Assignment Creation**| Full | None | Read | None | None | Assigned | None | None |
| **Homework Submission**| None | None | None | None | None | None | Linked Children | Own |
| **Grading & Feedback**  | Full | Scoped Read | Read | None | Read | Assigned | View Visible | View Visible |
| **Invoices & Billing**  | Full | Scoped Read | None | Full | Read | None | Pay Own | None |
| **Teacher Payroll**     | Full | None | None | Full | None | View Own | None | None |
| **CRM Inquiries**       | Full | Scoped Read | None | None | Full | None | None | None |

---

## 3. Server-Side Policy Guards (`src/server/policies/index.ts`)

- `canViewStudent(actor, studentId)`:
  - Super Admin, School Admin (if student in school), Support Agent -> `true`
  - Parent -> `true` iff student is in verified `ParentStudentRelationship`
  - Teacher -> `true` iff student is enrolled in a class assigned to teacher
  - Student -> `true` iff `actor.id === student.userId`
- `canRecordAttendance(actor, sessionId)`:
  - Super Admin, School Admin -> `true`
  - Teacher -> `true` iff assigned as teacher for this session's class
- `canViewFinancialRecord(actor, invoiceId)`:
  - Finance Admin / Super Admin -> `true`
  - Parent -> `true` iff invoice belongs to actor's `ParentProfile`
- `canMessageUser(actor, targetUserId)`:
  - Super/School Admin -> `true`
  - Teacher -> `true` iff `targetUserId` is a verified parent of a student in teacher's active classes
  - Parent -> `true` iff `targetUserId` is teacher of parent's enrolled child or an admin
  - Direct student-to-student or stranger adult-to-child messaging -> `false` (Strictly Forbidden by COPPA policy).
