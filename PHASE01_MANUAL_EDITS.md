# Remaining Phase 01 edits — apply on github.com

Two files are already live and don't need touching: `src/lib/auth/currentUser.ts` and
`src/app/[locale]/(dashboard)/layout.tsx`.

For each file below: open the link, click the pencil (edit) icon, use Ctrl+F in the editor
to find the "FIND" text, replace it exactly with the "REPLACE WITH" text (matching
indentation), then scroll down and commit directly to `main`. Do this for all 17 files,
then Vercel will redeploy automatically after the last one.

---

## 1. src/app/[locale]/privacy/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/privacy/page.tsx

FIND (appears 3 times — replace all 3 occurrences of `kidsarabicacademy.com` with `arabickidsacademy.com`, keeping `privacy@` / `compliance@` as-is):
```
privacy@kidsarabicacademy.com
compliance@kidsarabicacademy.com
```
REPLACE WITH:
```
privacy@arabickidsacademy.com
compliance@arabickidsacademy.com
```

---

## 2. src/app/[locale]/(dashboard)/parent/billing/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/billing/page.tsx

FIND:
```
import { billingService } from "@/server/services/BillingService";
import {
```
REPLACE WITH:
```
import { billingService } from "@/server/services/BillingService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
```

FIND:
```
  const { locale } = await params;
  const parentId = "parent-1";

  const subscription = await billingService.getParentSubscription(parentId);
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const subscription = await billingService.getParentSubscription(parentId);
```

---

## 3. src/app/[locale]/(dashboard)/parent/checkout/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/checkout/page.tsx

FIND:
```
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
```
REPLACE WITH:
```
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
import { requireParentProfile } from "@/lib/auth/currentUser";
```

FIND:
```
  const { locale } = await params;
  const { planId: planIdParam, coupon: couponParam } = await searchParams;
  const parentId = "parent-1";
```
REPLACE WITH:
```
  const { locale } = await params;
  const { planId: planIdParam, coupon: couponParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
```

---

## 4. src/app/[locale]/(dashboard)/parent/children/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/children/page.tsx

FIND:
```
import { userRepository } from "@/server/repositories/UserRepository";
import { AgeGroup, RelationshipType } from "@prisma/client";
```
REPLACE WITH:
```
import { userRepository } from "@/server/repositories/UserRepository";
import { AgeGroup, RelationshipType } from "@prisma/client";
import { requireParentProfile } from "@/lib/auth/currentUser";
```

FIND:
```
  const { locale } = await params;
  const parentId = "parent-1";
  const children = await userRepository.getLinkedChildren(parentId);
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
  const children = await userRepository.getLinkedChildren(parentId);
```

---

## 5. src/app/[locale]/(dashboard)/parent/progress/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/progress/page.tsx

FIND:
```
import { progressService } from "@/server/services/ProgressService";
import {
```
REPLACE WITH:
```
import { progressService } from "@/server/services/ProgressService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
```

FIND:
```
  const { locale } = await params;
  const { studentId: selectedParam } = await searchParams;
  const parentId = "parent-1";
```
REPLACE WITH:
```
  const { locale } = await params;
  const { studentId: selectedParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
```

---

## 6. src/app/[locale]/(dashboard)/parent/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/page.tsx

FIND:
```
import { userRepository } from "@/server/repositories/UserRepository";
import { notificationService } from "@/server/services/NotificationService";
```
REPLACE WITH:
```
import { userRepository } from "@/server/repositories/UserRepository";
import { notificationService } from "@/server/services/NotificationService";
import { requireParentProfile } from "@/lib/auth/currentUser";
```

FIND:
```
  const { locale } = await params;
  const isAr = locale === "ar";
  const { studentId: selectedParam } = await searchParams;
  const parentId = "parent-1";
```
REPLACE WITH:
```
  const { locale } = await params;
  const isAr = locale === "ar";
  const { studentId: selectedParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
```

---

## 7. src/app/[locale]/(dashboard)/parent/notifications/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/notifications/page.tsx

FIND:
```
import { notificationService } from "@/server/services/NotificationService";
import {
```
REPLACE WITH:
```
import { notificationService } from "@/server/services/NotificationService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
```

FIND:
```
  const { locale } = await params;
  const parentId = "parent-1";
  const notifications = await notificationService.getNotifications(parentId);
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
  const notifications = await notificationService.getNotifications(parentId);
```

---

## 8. src/app/[locale]/(dashboard)/parent/messages/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/messages/page.tsx

FIND:
```
import { communicationService } from "@/server/services/CommunicationService";
import {
```
REPLACE WITH:
```
import { communicationService } from "@/server/services/CommunicationService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
```

FIND:
```
  const { locale } = await params;
  const parentId = "parent-1";
  const teacherId = "teacher-1";
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
  const teacherId = "teacher-1";
```
(leave `teacherId` and `studentId` lines below untouched — those refer to which teacher/child, not who's logged in)

---

## 9. src/app/[locale]/(dashboard)/parent/reports/weekly/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/reports/weekly/page.tsx

FIND:
```
import { progressService } from "@/server/services/ProgressService";
import {
```
REPLACE WITH:
```
import { progressService } from "@/server/services/ProgressService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
```

FIND:
```
  const { locale } = await params;
  const { studentId: selectedParam } = await searchParams;
  const parentId = "parent-1";

  const children = await userRepository.getLinkedChildren(parentId);
```
REPLACE WITH:
```
  const { locale } = await params;
  const { studentId: selectedParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const children = await userRepository.getLinkedChildren(parentId);
```

---

## 10. src/app/[locale]/(dashboard)/parent/recommendations/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/recommendations/page.tsx

FIND:
```
import { recommendationService } from "@/server/services/RecommendationService";
import {
```
REPLACE WITH:
```
import { recommendationService } from "@/server/services/RecommendationService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
```

FIND:
```
  const { locale } = await params;
  const { studentId: queryStudentId } = await searchParams;
  const parentId = "parent-1";
```
REPLACE WITH:
```
  const { locale } = await params;
  const { studentId: queryStudentId } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
```

---

## 11. src/app/[locale]/(dashboard)/parent/enroll/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/enroll/page.tsx

FIND:
```
import { academicService } from "@/server/services/AcademicService";
import { Users, BookOpen, CheckCircle2 } from "lucide-react";
```
REPLACE WITH:
```
import { academicService } from "@/server/services/AcademicService";
import { requireParentProfile } from "@/lib/auth/currentUser";
import { Users, BookOpen, CheckCircle2 } from "lucide-react";
```

FIND:
```
  const { locale } = await params;
  const { studentId: selectedStudentIdParam, program: selectedProgramParam } = await searchParams;
  const parentId = "parent-1";

  const children = await userRepository.getLinkedChildren(parentId);
```
REPLACE WITH:
```
  const { locale } = await params;
  const { studentId: selectedStudentIdParam, program: selectedProgramParam } = await searchParams;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;

  const children = await userRepository.getLinkedChildren(parentId);
```

---

## 12. src/app/[locale]/(dashboard)/parent/reviews/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/reviews/page.tsx

FIND:
```
import { reviewService } from "@/server/services/ReviewService";
```
REPLACE WITH:
```
import { reviewService } from "@/server/services/ReviewService";
import { requireParentProfile } from "@/lib/auth/currentUser";
```

FIND:
```
  const { locale } = await params;
  const isAr = locale === "ar";

  const summary = await reviewService.getTeacherReviewSummary("teacher-1");
```
REPLACE WITH:
```
  const { locale } = await params;
  const isAr = locale === "ar";
  const { profile } = await requireParentProfile(locale);

  const summary = await reviewService.getTeacherReviewSummary("teacher-1");
```

FIND:
```
                await reviewService.submitParentReview({
                  parentId: "parent-1",
                  parentName: "طارق المنصور",
                  teacherId: "teacher-1",
```
REPLACE WITH:
```
                await reviewService.submitParentReview({
                  parentId: profile.id,
                  parentName: `${profile.firstName} ${profile.lastName}`,
                  teacherId: "teacher-1",
```

---

## 13. src/app/[locale]/(dashboard)/parent/meetings/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/parent/meetings/page.tsx

FIND:
```
import { userRepository } from "@/server/repositories/UserRepository";
import {
```
REPLACE WITH:
```
import { userRepository } from "@/server/repositories/UserRepository";
import { requireParentProfile } from "@/lib/auth/currentUser";
import {
```

FIND:
```
  const { locale } = await params;
  const parentId = "parent-1";
  const teacherId = "teacher-1";
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireParentProfile(locale);
  const parentId = profile.id;
  const teacherId = "teacher-1";
```
(leave the `teacherId` line untouched — it refers to which teacher, not who's logged in)

---

## 14. src/app/[locale]/(dashboard)/teacher/payroll/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/teacher/payroll/page.tsx

FIND:
```
import { billingService } from "@/server/services/BillingService";
import { Clock, FileCheck, ShieldCheck } from "lucide-react";
```
REPLACE WITH:
```
import { billingService } from "@/server/services/BillingService";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import { Clock, FileCheck, ShieldCheck } from "lucide-react";
```

FIND:
```
  const { locale } = await params;
  const teacherId = "teacher-1";

  const payroll = await payrollService.computeTeacherPayroll(teacherId, "2026-09");
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireTeacherProfile(locale);
  const teacherId = profile.id;

  const payroll = await payrollService.computeTeacherPayroll(teacherId, "2026-09");
```

---

## 15. src/app/[locale]/(dashboard)/teacher/meetings/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/teacher/meetings/page.tsx

FIND:
```
import { communicationService } from "@/server/services/CommunicationService";
import {
  Calendar,
  Clock,
  Video,
} from "lucide-react";
```
REPLACE WITH:
```
import { communicationService } from "@/server/services/CommunicationService";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import {
  Calendar,
  Clock,
  Video,
} from "lucide-react";
```

FIND:
```
  const { locale } = await params;
  const teacherId = "teacher-1";
  const meetings = await communicationRepository.getMeetingRequestsByTeacherId(teacherId);
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireTeacherProfile(locale);
  const teacherId = profile.id;
  const meetings = await communicationRepository.getMeetingRequestsByTeacherId(teacherId);
```

---

## 16. src/app/[locale]/(dashboard)/teacher/messages/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/teacher/messages/page.tsx

FIND:
```
import { communicationService } from "@/server/services/CommunicationService";
import {
  Send,
  ShieldCheck,
} from "lucide-react";
```
REPLACE WITH:
```
import { communicationService } from "@/server/services/CommunicationService";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import {
  Send,
  ShieldCheck,
} from "lucide-react";
```

FIND:
```
  const { locale } = await params;
  const teacherId = "teacher-1";
  const parentId = "parent-1";
  const studentId = "student-1";
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireTeacherProfile(locale);
  const teacherId = profile.id;
  const parentId = "parent-1";
  const studentId = "student-1";
```
(leave `parentId` and `studentId` untouched — those refer to who the teacher is messaging, not who's logged in)

---

## 17. src/app/[locale]/(dashboard)/teacher/assignments/page.tsx
https://github.com/maleekanas/noonarespo/edit/main/src/app/%5Blocale%5D/(dashboard)/teacher/assignments/page.tsx

FIND:
```
import { userRepository } from "@/server/repositories/UserRepository";
import {
  FileCheck,
  PlusCircle,
  Mic,
  Lock,
} from "lucide-react";
```
REPLACE WITH:
```
import { userRepository } from "@/server/repositories/UserRepository";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import {
  FileCheck,
  PlusCircle,
  Mic,
  Lock,
} from "lucide-react";
```

FIND:
```
  const { locale } = await params;
  const { classGroupId: queryClassId } = await searchParams;
```
REPLACE WITH:
```
  const { locale } = await params;
  const { profile } = await requireTeacherProfile(locale);
  const { classGroupId: queryClassId } = await searchParams;
```

Then separately, further down in the same file, find:
```
    await assignmentService.gradeSubmission({
      submissionId,
      teacherId: "teacher-1",
```
REPLACE WITH:
```
    await assignmentService.gradeSubmission({
      submissionId,
      teacherId: profile.id,
```

---

That's all 17. Once committed, Vercel redeploys automatically and Phase 00/01's login + real-identity foundation is fully live.
