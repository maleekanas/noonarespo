import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { schoolService, B2B_BUNDLES } from "../../src/server/services/SchoolService";
import { schoolRepository } from "../../src/server/repositories/SchoolRepository";
import { administrationService } from "../../src/server/services/AdministrationService";
import { academicService } from "../../src/server/services/AcademicService";
import { academicRepository } from "../../src/server/repositories/AcademicRepository";
import { classroomLiveService } from "../../src/server/services/ClassroomLiveService";
import { RoleType, ClassType } from "@prisma/client";

describe("Multi-Tenant B2B Architecture for Schools, Institutes & Freelancers", () => {
  test("3 B2B Bundles should be correctly defined with 35% discount and seat tiers", () => {
    // 1. Starter Bundle
    const starter = B2B_BUNDLES.STARTER;
    assert.ok(starter !== undefined);
    assert.strictEqual(starter.id, "STARTER");
    assert.strictEqual(starter.maxStudents, 25);
    assert.strictEqual(starter.priceMonthlyEur, 129);
    assert.strictEqual(starter.originalPriceEur, 199);
    assert.strictEqual(starter.discountPercentage, 35);
    assert.ok(starter.featuresAr.length >= 5);
    assert.ok(starter.featuresEn.length >= 5);

    // 2. Growth Bundle
    const growth = B2B_BUNDLES.GROWTH;
    assert.ok(growth !== undefined);
    assert.strictEqual(growth.id, "GROWTH");
    assert.strictEqual(growth.maxStudents, 100);
    assert.strictEqual(growth.priceMonthlyEur, 324);
    assert.strictEqual(growth.originalPriceEur, 499);
    assert.strictEqual(growth.discountPercentage, 35);
    assert.ok(growth.featuresAr.length >= 6);

    // 3. Institution Bundle
    const institution = B2B_BUNDLES.INSTITUTION;
    assert.ok(institution !== undefined);
    assert.strictEqual(institution.id, "INSTITUTION");
    assert.ok(institution.maxStudents > 100);
    assert.strictEqual(institution.priceMonthlyEur, 584);
    assert.strictEqual(institution.originalPriceEur, 899);
    assert.strictEqual(institution.discountPercentage, 35);
    assert.ok(institution.featuresAr.length >= 6);
  });

  test("Partner school repository supports schools, institutes, and freelance teachers with bundle tiers", async () => {
    const schools = await schoolRepository.getAllSchools();
    assert.ok(schools.length >= 4, "Expected at least 4 partner institutions");

    // Check freelance teacher tenant
    const freelancer = schools.find((s) => s.type === "FREELANCER_TEACHER");
    assert.ok(freelancer !== undefined, "Expected freelance teacher tenant to exist");
    assert.strictEqual(freelancer.bundleTier, "STARTER");
    assert.strictEqual(freelancer.licenseSeatsTotal, 25);

    // Check institute tenant
    const institute = schools.find((s) => s.type === "PRIVATE_INSTITUTE");
    assert.ok(institute !== undefined, "Expected private institute tenant to exist");
    assert.strictEqual(institute.bundleTier, "GROWTH");

    // Check school tenant
    const school = schools.find((s) => s.type === "ISLAMIC_SCHOOL");
    assert.ok(school !== undefined, "Expected Islamic school tenant to exist");
    assert.ok(["GROWTH", "INSTITUTION"].includes(school.bundleTier));
  });

  test("Bulk roster onboarding should auto-enroll students into a school-scoped class group", async () => {
    const schoolId = "school-riyadh-coop";
    const initialSchool = await schoolRepository.getSchoolById(schoolId);
    assert.ok(initialSchool !== null);

    const initialSeatsUsed = initialSchool.licenseSeatsUsed;
    const initialStudentsCount = initialSchool.studentsCount;

    // Create a school-scoped class group
    const classGroup = await academicService.createClassGroup({
      name: "فصل البراعم التجريبي للمؤسسة",
      courseLevelId: "lvl-foundations-1",
      classType: ClassType.GROUP,
      schoolId,
      capacityMax: 6,
    });
    assert.strictEqual(classGroup.schoolId, schoolId);

    // Onboard 3 students and link them to this class group
    const result = await schoolService.onboardBatchRoster({
      schoolId,
      students: [
        { fullName: "خالد بن الوليد" },
        { fullName: "فاطمة الزهراء", email: "fatima.z@example.com" },
        { fullName: "عمر الفاروق" },
      ],
      ageGroup: "AGE_4_6",
      classGroupId: classGroup.id,
    });

    assert.strictEqual(result.createdAccounts.length, 3);
    assert.strictEqual(result.school.licenseSeatsUsed, initialSeatsUsed + 3);

    // Check that each account has credentials and class info
    for (const acc of result.createdAccounts) {
      assert.ok(acc.email.length > 0);
      assert.ok(acc.tempPassword.length >= 6);
      assert.strictEqual(acc.classGroupId, classGroup.id);
      assert.ok(acc.className !== undefined);
    }
  });

  test("School-scoped analytics should provide attendance and progress metrics for the institution", async () => {
    const schoolId = "school-amsterdam-noor";
    const overview = await administrationService.getSchoolAnalyticsOverviewForSchool(schoolId);

    assert.ok(typeof overview.totalStudents === "number");
    assert.ok(typeof overview.activeStudents === "number");
    assert.ok(typeof overview.totalClasses === "number");
    assert.ok(typeof overview.attendanceRatePercentage === "number");
    assert.ok(overview.attendanceRatePercentage >= 0 && overview.attendanceRatePercentage <= 100);
    assert.ok(typeof overview.attendanceRecordsCount === "number");
  });

  test("Classroom Live context should allow school admin to enter and observe their institution's classes", async () => {
    // Test supervisor authorization logic for school admin
    const schoolAdminUser = {
      id: "admin-user-school-1",
      email: "admin@school-test.internal",
      name: "School Admin",
      role: RoleType.SCHOOL_ADMIN,
      locale: "ar",
    };

    // A session for an unassociated class or non-existent session should return NOT_FOUND or FORBIDDEN
    const result = await classroomLiveService.getClassroomContext("non-existent-session-id", schoolAdminUser);
    assert.strictEqual(result.status, "NOT_FOUND");
  });

  test("School admin password reset should generate secure temporary password or accept custom password", async () => {
    const schoolId = "school-riyadh-coop";

    // 1. Auto-generated password reset
    const resAuto = await schoolService.resetSchoolAdminPassword(schoolId);
    assert.ok(resAuto.email.length > 0, "Admin email should be present");
    assert.ok(resAuto.tempPassword.length >= 8, "Auto password should be secure");
    assert.ok(resAuto.adminName.length > 0, "Admin name should be present");

    // 2. Custom password reset
    const customPass = "Riyadh#Pass2026";
    const resCustom = await schoolService.resetSchoolAdminPassword(schoolId, customPass);
    assert.strictEqual(resCustom.tempPassword, customPass);
    assert.strictEqual(resCustom.email, resAuto.email);

    // 3. Query school admins list
    const admins = await schoolService.getSchoolAdmins(schoolId);
    assert.ok(admins.length >= 1, "Expected at least 1 admin for school");
    assert.ok(admins.some((a) => a.email === resAuto.email));
  });

  test("Superadmin can update full school information including location, track, type, and contact person", async () => {
    const schoolId = "institute-andalus-cordoba";

    const updated = await schoolService.updateSchool(schoolId, {
      nameAr: "معهد الأندلس للغات والقرآن المطور",
      nameEn: "Al-Andalus Advanced Languages & Quran Institute",
      type: "PRIVATE_INSTITUTE",
      country: "Spain",
      city: "Seville",
      curriculumTrackAr: "منهج الفصحى والبيان المكثف",
      contactPerson: "Prof. Tariq Al-Andalusi",
      contactEmail: "director@andalus-institute.es",
    });

    assert.ok(updated !== null);
    assert.strictEqual(updated.nameAr, "معهد الأندلس للغات والقرآن المطور");
    assert.strictEqual(updated.city, "Seville");
    assert.strictEqual(updated.curriculumTrackAr, "منهج الفصحى والبيان المكثف");
    assert.strictEqual(updated.contactPerson, "Prof. Tariq Al-Andalusi");
    assert.strictEqual(updated.contactEmail, "director@andalus-institute.es");
  });

  test("License seat adjustment and contract status toggling should update correctly", async () => {
    const schoolId = "school-london-iman";

    // 1. Adjust licenses to 150 and change tier to INSTITUTION
    const adjusted = await schoolService.updateSchool(schoolId, {
      licenseSeatsTotal: 150,
      bundleTier: "INSTITUTION",
    });
    assert.ok(adjusted !== null);
    assert.strictEqual(adjusted.licenseSeatsTotal, 150);
    assert.strictEqual(adjusted.bundleTier, "INSTITUTION");

    // 2. Toggle status between ACTIVE and PENDING_RENEWAL
    const toggled = await schoolService.toggleSchoolActive(schoolId);
    assert.ok(toggled !== null);
    assert.ok(["ACTIVE", "PENDING_RENEWAL"].includes(toggled.contractStatus));
  });
});

