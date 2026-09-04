# User Roles & Permission Matrix: Kids Arabic Academy

Kids Arabic Academy enforces strict Role-Based Access Control (RBAC) supplemented with Resource-Based Policies.

---

## 1. System Roles

1. **SUPER_ADMIN**: Full system authority, system configuration, audit logs, feature flags, global overrides.
2. **SCHOOL_ADMIN**: School operations, teacher onboarding, class scheduling, student enrollment management.
3. **ACADEMIC_ADMIN**: Curriculum planning, course level definitions, pedagogical standards, grading rubrics.
4. **FINANCE_ADMIN**: Subscription tiers, invoice generation, refund processing, teacher compensation records.
5. **TEACHER**: View assigned classes, mark attendance, assign homework, submit grades and feedback.
6. **PARENT**: Manage linked children, review attendance & progress, pay invoices, communicate with teachers.
7. **STUDENT**: Access enrolled classes, submit homework, view teacher feedback, track individual badges and XP.
8. **SUPPORT_AGENT**: Read-only diagnostic access to user accounts and session histories.

---

## 2. Permission Matrix

| Resource / Capability | Super Admin | School Admin | Academic Admin | Finance Admin | Teacher | Parent | Student | Support |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **System Settings** | Full | None | None | None | None | None | None | None |
| **Audit Logs** | Full | Read | None | Read | None | None | None | None |
| **User Management** | Full | Write | Read | Read | None | None | None | Read |
| **Course & Curriculum** | Full | Read | Write | Read | Read | Read | Read | Read |
| **Class Scheduling** | Full | Write | Read | None | View Own | View Enrolled | View Enrolled | Read |
| **Attendance Recording**| Full | Write | None | None | Assigned Classes | None | None | None |
| **Attendance Viewing**  | Full | Read | Read | Read | Assigned Classes | Linked Children | Own | Read |
| **Assignment Creation**| Full | None | Read | None | Assigned Classes | None | None | None |
| **Homework Submission**| None | None | None | None | None | Linked Children | Own | None |
| **Grading & Feedback**  | Full | Read | Read | None | Assigned Classes | View Visible | View Visible | None |
| **Invoices & Billing**  | Full | Read | None | Full | None | Pay Own | None | Read |
| **Teacher Payroll**     | Full | Read | None | Full | View Own | None | None | None |

---

## 3. Policy Guards (`src/server/policies/`)

- `canViewStudent(actor, studentId)`:
  - Admin (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `SUPPORT_AGENT`) -> `true`
  - Parent -> `true` iff student is in verified `ParentStudentRelationship`
  - Teacher -> `true` iff student is enrolled in a class assigned to teacher
  - Student -> `true` iff `actor.id === student.userId`
- `canRecordAttendance(actor, sessionId)`:
  - Admin (`SUPER_ADMIN`, `SCHOOL_ADMIN`) -> `true`
  - Teacher -> `true` iff assigned as teacher for this session's class
- `canViewFinancialRecord(actor, invoiceId)`:
  - Finance Admin / Super Admin -> `true`
  - Parent -> `true` iff invoice belongs to actor's `ParentProfile`
- `canMessageUser(actor, targetUserId)`:
  - Super/School Admin -> `true`
  - Teacher -> `true` iff `targetUserId` is a verified parent of a student in teacher's active classes
  - Parent -> `true` iff `targetUserId` is teacher of parent's enrolled child or an admin
  - Direct student messaging -> `false` (Disabled)
