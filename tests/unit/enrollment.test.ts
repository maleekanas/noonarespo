import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { academicService } from "../../src/server/services/AcademicService";
import { academicRepository } from "../../src/server/repositories/AcademicRepository";
import { userRepository } from "../../src/server/repositories/UserRepository";
import { ClassType, AgeGroup, RelationshipType } from "@prisma/client";

describe("Academic Service & Class Enrollment Rules", () => {
  test("Should enforce capacity limit and reject enrollment when capacityMax is reached", async () => {
    // 1. Create a class group with capacityMax = 2
    const testClass = await academicService.createClassGroup({
      courseLevelId: "level-a1-reading",
      name: "فصل الاختبار سعة 2",
      classType: ClassType.GROUP,
      capacityMax: 2,
    });

    // 2. Create 3 test children
    const child1 = await userRepository.createChildWithParentLink("parent-1", {
      firstName: "أحمد",
      lastName: "طارق",
      dateOfBirth: new Date("2017-01-01"),
      ageGroup: AgeGroup.AGE_7_10,
      relationshipType: RelationshipType.FATHER,
    });

    const child2 = await userRepository.createChildWithParentLink("parent-1", {
      firstName: "يوسف",
      lastName: "طارق",
      dateOfBirth: new Date("2017-02-01"),
      ageGroup: AgeGroup.AGE_7_10,
      relationshipType: RelationshipType.FATHER,
    });

    const child3 = await userRepository.createChildWithParentLink("parent-1", {
      firstName: "سارة",
      lastName: "طارق",
      dateOfBirth: new Date("2017-03-01"),
      ageGroup: AgeGroup.AGE_7_10,
      relationshipType: RelationshipType.FATHER,
    });

    // 3. Enroll child 1 and 2 -> Succeeds
    const enr1 = await academicService.enrollStudent(child1.id, testClass.id);
    assert.equal(enr1.studentId, child1.id);

    const enr2 = await academicService.enrollStudent(child2.id, testClass.id);
    assert.equal(enr2.studentId, child2.id);

    // 4. Enroll child 3 -> Exceeds capacity of 2 -> Throws CAPACITY_EXCEEDED
    await assert.rejects(
      async () => {
        await academicService.enrollStudent(child3.id, testClass.id);
      },
      {
        message: /CAPACITY_EXCEEDED/,
      }
    );
  });

  test("Should reject duplicate enrollment for the same student", async () => {
    const classGroup = (await academicRepository.getAllClassGroups())[0];
    // student-1 is already enrolled in class-reading-a1-cohort1 in seed
    await assert.rejects(
      async () => {
        await academicService.enrollStudent("student-1", classGroup.id);
      },
      {
        message: /ALREADY_ENROLLED/,
      }
    );
  });
});
