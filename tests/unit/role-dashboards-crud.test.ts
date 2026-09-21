import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { administrationService } from "../../src/server/services/AdministrationService";
import { academicService } from "../../src/server/services/AcademicService";
import { schedulingService } from "../../src/server/services/SchedulingService";
import { assignmentService } from "../../src/server/services/AssignmentService";
import { communicationService } from "../../src/server/services/CommunicationService";
import { crmService } from "../../src/server/services/CrmService";
import { userRepository } from "../../src/server/repositories/UserRepository";
import { schedulingRepository } from "../../src/server/repositories/SchedulingRepository";
import { communicationRepository } from "../../src/server/repositories/CommunicationRepository";
import { AgeGroup, ClassType, EmploymentType, RelationshipType, RoleType } from "@prisma/client";
import { SessionUser } from "../../src/lib/auth/session";

describe("Role Dashboards CRUD & Management Operations", () => {
  const superAdminActor: SessionUser = {
    id: "admin-user-1",
    email: "admin@kidsarabicacademy.internal",
    name: "مدير النظام",
    role: RoleType.SUPER_ADMIN,
    locale: "ar",
  };

  describe("1. Admin Role Dashboard Operations (Students, Teachers, Curriculum)", () => {
    test("Admin can add, update, and archive students", async () => {
      // Add student
      const newStudent = await administrationService.addStudent(
        {
          firstName: "سعيد",
          lastName: "الغامدي",
          dateOfBirth: new Date("2016-03-15"),
          ageGroup: AgeGroup.AGE_7_10,
          guardianName: "أحمد الغامدي",
          guardianPhone: "+966501234567",
        },
        superAdminActor
      );
      assert.ok(newStudent.id);
      assert.equal(newStudent.firstName, "سعيد");
      assert.equal(newStudent.ageGroup, AgeGroup.AGE_7_10);

      // Update student
      const updatedStudent = await administrationService.updateStudent(
        newStudent.id,
        {
          firstName: "سعيد المعدل",
          ageGroup: AgeGroup.AGE_11_13,
        },
        superAdminActor
      );
      assert.ok(updatedStudent);
      assert.equal(updatedStudent.firstName, "سعيد المعدل");
      assert.equal(updatedStudent.ageGroup, AgeGroup.AGE_11_13);

      // Archive student
      await administrationService.archiveStudent(newStudent.id, "أرشفة تجريبية", superAdminActor);
    });

    test("Admin can add and archive teachers", async () => {
      // Add teacher
      const newTeacher = await administrationService.addTeacher(
        {
          email: "ustadha.noura.crud@example.com",
          firstName: "نورة",
          lastName: "العتيبي",
          qualifications: "إجازة في تحفيظ القرآن الكريم",
          experienceYears: 6,
          hourlyRateMinorUnits: 3500,
          employmentType: EmploymentType.CONTRACT,
          isCertified: true,
        },
        superAdminActor
      );
      assert.ok(newTeacher.id);
      assert.equal(newTeacher.firstName, "نورة");
      assert.equal(newTeacher.hourlyRateMinorUnits, 3500);

      // Archive teacher
      await administrationService.archiveTeacher(newTeacher.id, superAdminActor);
    });

    test("Admin can add, update, and delete curriculum lessons", async () => {
      // Add lesson
      const newLesson = await administrationService.addLesson(
        {
          ageGroup: AgeGroup.AGE_7_10,
          programId: "prog-quran",
          programTitleAr: "القرآن الكريم",
          programTitleEn: "Holy Quran",
          courseLevelCode: "level-primary-a1",
          lessonNumber: 99,
          titleAr: "درس جديد تجريبي",
          titleEn: "New Experimental Lesson",
          descriptionAr: "شرح تجريبي",
          descriptionEn: "Experimental description",
          durationMinutes: 45,
          objectivesAr: ["التعرف على المفردات"],
          objectivesEn: ["Vocabulary recognition"],
          targetVocabulary: ["كتاب", "قلم"],
          interactiveTools: ["WHITEBOARD"],
          homeworkTitleAr: "تطبيق تجريبي",
          homeworkTitleEn: "Experimental homework",
        },
        superAdminActor
      );
      assert.ok(newLesson.id);
      assert.equal(newLesson.titleAr, "درس جديد تجريبي");

      // Update lesson
      const updated = await administrationService.updateLesson(
        newLesson.id,
        {
          titleAr: "درس معدل تجريبي",
          durationMinutes: 50,
        },
        superAdminActor
      );
      assert.ok(updated);
      assert.equal(updated.titleAr, "درس معدل تجريبي");
      assert.equal(updated.durationMinutes, 50);

      // Delete lesson
      const deleted = await administrationService.deleteLesson(newLesson.id, superAdminActor);
      assert.equal(deleted, true);
    });
  });

  describe("2. Academic & Class Management Operations (Admin & School Admin)", () => {
    test("Can update class group name and capacity, and delete class group", async () => {
      // Create a class group
      const cg = await academicService.createClassGroup({
        name: "فصل الأبطال الابتدائي",
        courseLevelId: "level-primary-a1",
        classType: ClassType.GROUP,
        capacityMax: 6,
      });
      assert.ok(cg.id);
      assert.equal(cg.name, "فصل الأبطال الابتدائي");
      assert.equal(cg.capacityMax, 6);

      // Update class group
      const updated = await academicService.updateClassGroup(cg.id, {
        name: "فصل الأبطال الابتدائي (معدل)",
        capacityMax: 8,
      });
      assert.ok(updated);
      assert.equal(updated.name, "فصل الأبطال الابتدائي (معدل)");
      assert.equal(updated.capacityMax, 8);

      // Delete class group
      const deleted = await academicService.deleteClassGroup(cg.id);
      assert.equal(deleted, true);
    });

    test("Can unenroll student from class group", async () => {
      const result = await academicService.unenrollStudent("cg-test-1", "student-test-1");
      assert.equal(result, true);
    });
  });

  describe("3. Scheduling Operations (Admin & Teacher Reschedule / Cancel)", () => {
    test("Can reschedule session to a new time and cancel session", async () => {
      const now = new Date();
      const startTimeUtc = new Date(now.getTime() + 3600000);
      const endTimeUtc = new Date(now.getTime() + 3600000 + 45 * 60000);

      const session = await schedulingRepository.createSession({
        classGroupId: "class-group-demo-1",
        teacherId: "teacher-ahmed",
        startTimeUtc,
        endTimeUtc,
      });
      assert.ok(session.id);

      // Reschedule
      const rescheduledTime = new Date(now.getTime() + 7200000);
      const rescheduled = await schedulingService.rescheduleSession({
        sessionId: session.id,
        newStartTimeUtc: rescheduledTime,
        durationMinutes: 45,
      });
      assert.ok(rescheduled);
      assert.equal(new Date(rescheduled.startTimeUtc).getTime(), rescheduledTime.getTime());

      // Cancel
      const cancelled = await schedulingService.cancelSession(session.id);
      assert.equal(cancelled, true);
    });
  });

  describe("4. Teacher Assignments Operations (Create, Update, Delete)", () => {
    test("Teacher can create, update, and delete assignments", async () => {
      // Create a class group first
      const cg = await academicService.createClassGroup({
        name: "فصل الواجبات التجريبي",
        courseLevelId: "level-primary-a1",
        classType: ClassType.GROUP,
        capacityMax: 6,
      });

      const assignment = await assignmentService.createAssignment({
        classGroupId: cg.id,
        titleAr: "واجب رسم حرف الباء",
        titleEn: "Draw Letter Baa Assignment",
        instructions: "اكتب حرف الباء بالحركات الثلاث",
        dueDateUtc: new Date(Date.now() + 3 * 86400000),
      });
      assert.ok(assignment.id);
      assert.equal(assignment.titleAr, "واجب رسم حرف الباء");

      // Update assignment
      const updated = await assignmentService.updateAssignment(assignment.id, {
        titleAr: "واجب رسم حرف الباء والتاء",
        instructions: "اكتب الحرفين بالحركات",
      });
      assert.ok(updated);
      assert.equal(updated.titleAr, "واجب رسم حرف الباء والتاء");

      // Delete assignment
      const deleted = await assignmentService.deleteAssignment(assignment.id);
      assert.equal(deleted, true);
    });
  });

  describe("5. Communication & Meetings Operations (Parent & Teacher)", () => {
    test("Can reschedule and cancel parent-teacher meetings", async () => {
      const meeting = await communicationRepository.createMeetingRequest({
        parentId: "parent-1",
        teacherId: "teacher-ahmed",
        studentId: "student-1",
        requestedTimeUtc: new Date(Date.now() + 86400000),
        notes: "استشارة بخصوص القراءة",
      });
      assert.ok(meeting.id);

      // Reschedule meeting
      const newTime = new Date(Date.now() + 172800000);
      const rescheduled = await communicationService.rescheduleMeeting(meeting.id, newTime);
      assert.equal(new Date(rescheduled.requestedTimeUtc).getTime(), newTime.getTime());

      // Cancel meeting
      const cancelled = await communicationService.cancelMeeting(meeting.id, "اعتذار طارئ");
      assert.equal(cancelled.status, "CANCELLED");
    });
  });

  describe("6. Support & CRM Operations", () => {
    test("Support agent can update inquiry/lead status and add notes", () => {
      const leads = crmService.getAllLeads();
      assert.ok(leads.length > 0);

      const targetLead = leads[0];
      const success = crmService.updateLeadStatus(
        targetLead.id,
        "IN_PROGRESS",
        "تم التواصل عبر الهاتف وتحديد موعد تجريبي"
      );
      assert.equal(success, true);

      const updatedLeads = crmService.getAllLeads();
      const updatedLead = updatedLeads.find((l) => l.id === targetLead.id);
      assert.equal(updatedLead?.status, "IN_PROGRESS");
      assert.equal(updatedLead?.notes, "تم التواصل عبر الهاتف وتحديد موعد تجريبي");
    });
  });

  describe("7. Parent Child Management Operations", () => {
    test("Parent can update child profile and remove linked child", async () => {
      const parentId = "parent-user-1";
      const student = await userRepository.createChildWithParentLink(parentId, {
        firstName: "عمر",
        lastName: "فاروق",
        dateOfBirth: new Date("2018-05-10"),
        ageGroup: AgeGroup.AGE_4_6,
        relationshipType: RelationshipType.FATHER,
      });
      assert.ok(student.id);

      // Update child profile
      const updated = await userRepository.updateStudentProfile(student.id, {
        firstName: "عمر الجديد",
        ageGroup: AgeGroup.AGE_7_10,
      });
      assert.ok(updated);
      assert.equal(updated.firstName, "عمر الجديد");
      assert.equal(updated.ageGroup, AgeGroup.AGE_7_10);

      // Remove linked child
      const removed = await userRepository.removeChild(parentId, student.id);
      assert.equal(removed, true);
    });
  });
});
