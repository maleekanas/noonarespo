import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { academicRepository } from "../../src/server/repositories/AcademicRepository";
import { administrationService } from "../../src/server/services/AdministrationService";
import { userRepository } from "../../src/server/repositories/UserRepository";
import { schedulingRepository } from "../../src/server/repositories/SchedulingRepository";
import { assignmentRepository } from "../../src/server/repositories/AssignmentRepository";
import { gradebookRepository } from "../../src/server/repositories/GradebookRepository";

describe("Phase 13: 7 Comprehensive Academic Programs Verification", () => {
  const mandatedProgramIds = [
    "prog-foundations",
    "prog-reading",
    "prog-writing",
    "prog-speaking",
    "prog-listening",
    "prog-quran",
    "prog-islamic",
  ];

  test("All 7 mandated academic programs must be registered and fully defined", async () => {
    const programs = await academicRepository.getAllPrograms();
    assert.strictEqual(programs.length, 7, "Must contain exactly 7 registered programs");

    for (const id of mandatedProgramIds) {
      const prog = programs.find((p) => p.id === id);
      assert.ok(prog, `Program ${id} should exist`);
      assert.ok(prog.titleAr.length > 0, `${id} should have an Arabic title`);
      assert.ok(prog.titleEn.length > 0, `${id} should have an English title`);
      assert.ok((prog.descriptionAr?.length ?? 0) > 0, `${id} should have an Arabic description`);
    }
  });

  test("Every program must have authentic accredited courses and progressive CEFR levels", async () => {
    for (const progId of mandatedProgramIds) {
      const courses = await academicRepository.getCoursesByProgramId(progId);
      assert.ok(
        courses.length >= 2,
        `Program ${progId} should have at least 2 accredited courses, found ${courses.length}`
      );

      for (const course of courses) {
        assert.ok(course.titleAr.length > 0, `Course ${course.id} must have Arabic title`);
        assert.ok(course.titleEn.length > 0, `Course ${course.id} must have English title`);
        assert.strictEqual(course.programId, progId);

        const levels = await academicRepository.getLevelsByCourseId(course.id);
        assert.ok(
          levels.length >= 1,
          `Course ${course.id} must have at least 1 CEFR level progression, found ${levels.length}`
        );

        for (const lvl of levels) {
          assert.ok(lvl.levelCode.length > 0, `Level ${lvl.id} must have a level code`);
          assert.ok(lvl.targetAge, `Level ${lvl.id} must have a target age group`);
        }
      }
    }
  });

  test("Every program must have active micro-cohorts strictly capped at max 6 students", async () => {
    const classGroups = await academicRepository.getAllClassGroups();
    assert.ok(classGroups.length >= 14, `Expected at least 14 active cohorts (2 per program), found ${classGroups.length}`);

    const allLevels = await academicRepository.getAllLevels();
    const allCourses = await academicRepository.getAllCourses();

    const levelToProgramMap = new Map<string, string>();
    for (const lvl of allLevels) {
      const crs = allCourses.find((c) => c.id === lvl.courseId);
      if (crs) {
        levelToProgramMap.set(lvl.id, crs.programId);
      }
    }

    // Verify cohorts for each of the 7 programs
    for (const progId of mandatedProgramIds) {
      const cohortsForProgram = classGroups.filter(
        (cg) => levelToProgramMap.get(cg.courseLevelId) === progId
      );
      assert.ok(
        cohortsForProgram.length >= 2,
        `Program ${progId} must have at least 2 active cohorts, found ${cohortsForProgram.length}`
      );

      for (const cg of cohortsForProgram) {
        assert.ok(cg.capacityMax <= 6, `Cohort ${cg.id} must be strictly capped at max 6 students`);
        assert.strictEqual(cg.isActive, true, `Cohort ${cg.id} must be active`);
        assert.ok(cg.name.length > 0, `Cohort ${cg.id} must have a descriptive Arabic name`);
      }
    }
  });

  test("Certified specialist teachers must be assigned across cohorts of all disciplines", async () => {
    const teachers = await userRepository.getAllTeachers();
    assert.ok(teachers.length >= 4, `Expected at least 4 specialist instructors, found ${teachers.length}`);

    const classGroups = await academicRepository.getAllClassGroups();
    for (const cg of classGroups) {
      const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(cg.id);
      assert.ok(
        assignments.length >= 1,
        `Cohort ${cg.id} must have an assigned certified teacher, found ${assignments.length}`
      );
      const primaryAssignment = assignments[0];
      const teacher = teachers.find((t) => t.id === primaryAssignment.teacherId);
      assert.ok(teacher, `Teacher for cohort ${cg.id} must be registered`);
      assert.ok(teacher.experienceYears >= 5, "Teacher must be experienced and certified");
    }
  });

  test("Every program must have at least 3 multi-tier progressive curriculum modules (total >= 21)", async () => {
    for (const progId of mandatedProgramIds) {
      const modules = await administrationService.getCurriculumModules(progId);
      assert.ok(
        modules.length >= 3,
        `Program ${progId} must have at least 3 structured modules, found ${modules.length}`
      );

      for (const mod of modules) {
        assert.strictEqual(mod.programId, progId);
        assert.ok(mod.cefrAlignment.length > 0, `Module ${mod.id} must have CEFR alignment`);
        assert.ok(mod.targetVocabularyCount >= 40, `Module ${mod.id} vocabulary count must be >= 40`);
        assert.ok(mod.durationWeeks >= 4, `Module ${mod.id} duration must be at least 4 weeks`);
        assert.ok(
          mod.weeklyObjectivesAr.length >= 3,
          `Module ${mod.id} must have at least 3 detailed weekly learning objectives in Arabic`
        );
        for (const obj of mod.weeklyObjectivesAr) {
          assert.ok(obj.length >= 10, "Learning objective must be pedagogically descriptive");
        }
      }
    }

    const allModules = await administrationService.getCurriculumModules();
    assert.ok(allModules.length >= 21, `Total curriculum modules must be >= 21, found ${allModules.length}`);
  });

  test("Weekly live sessions and homework assignments must be scheduled across programs", async () => {
    const sessions = await schedulingRepository.getAllSessions();
    assert.ok(sessions.length >= 7, `Expected live sessions for cohorts across programs, found ${sessions.length}`);

    const assignments = await assignmentRepository.getAllAssignments();
    assert.ok(assignments.length >= 5, `Expected homework assignments across programs, found ${assignments.length}`);

    const grades = await gradebookRepository.getAllGrades();
    assert.ok(grades.length >= 3, `Expected gradebook entries across cohorts, found ${grades.length}`);
  });
});
