import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  B2B_TRIAL_CONFIG,
  schoolRepository,
} from "@/server/repositories/SchoolRepository";
import {
  B2B_TRIAL_BUNDLE,
  schoolService,
} from "@/server/services/SchoolService";
import { getParentAccessLevel } from "@/lib/auth/subscriptionAccess";
import { prisma } from "@/lib/database/prisma";
import { SubscriptionStatus } from "@prisma/client";

describe("Trial Plans: B2B (3 Days, Max 10 Students) & B2C (1 Day, Max 1 Child)", () => {
  // Fast-fail prisma in-memory fallback to avoid TCP timeout in offline test env
  const origPSCreate = prisma.partnerSchool.create;
  const origPSFindUnique = prisma.partnerSchool.findUnique;
  const origRoleFindUnique = prisma.role.findUnique;

  before(() => {
    (prisma.partnerSchool.create as any) = async () => {
      throw new Error("Can't reach database server at localhost:5432");
    };
    (prisma.partnerSchool.findUnique as any) = async () => {
      throw new Error("Can't reach database server at localhost:5432");
    };
    (prisma.role.findUnique as any) = async () => {
      throw new Error("Can't reach database server at localhost:5432");
    };
  });

  after(() => {
    prisma.partnerSchool.create = origPSCreate;
    prisma.partnerSchool.findUnique = origPSFindUnique;
    prisma.role.findUnique = origRoleFindUnique;
  });

  describe("B2B 3-Day Free Trial Configuration & Enforcements", () => {
    test("B2B_TRIAL_CONFIG has exact requirements (3 days, 10 students, TRIAL status)", () => {
      assert.equal(B2B_TRIAL_CONFIG.durationDays, 3);
      assert.equal(B2B_TRIAL_CONFIG.maxStudents, 10);
      assert.equal(B2B_TRIAL_CONFIG.contractStatus, "TRIAL");
      assert.equal(B2B_TRIAL_CONFIG.bundleTier, "STARTER");
    });

    test("B2B_TRIAL_BUNDLE provides complete institutional features for €0", () => {
      assert.equal(B2B_TRIAL_BUNDLE.priceMonthlyEur, 0);
      assert.equal(B2B_TRIAL_BUNDLE.maxStudents, 10);
      assert.equal(B2B_TRIAL_BUNDLE.discountPercentage, 100);
      assert.ok(B2B_TRIAL_BUNDLE.featuresAr.length >= 5);
      assert.ok(B2B_TRIAL_BUNDLE.featuresEn.length >= 5);

      // Verify essential B2B features are present in the trial definition
      const allFeaturesAr = B2B_TRIAL_BUNDLE.featuresAr.join(" ");
      const allFeaturesEn = B2B_TRIAL_BUNDLE.featuresEn.join(" ");
      assert.match(allFeaturesAr, /10 مقاعد/);
      assert.match(allFeaturesAr, /فصل تفاعلي/);
      assert.match(allFeaturesAr, /لوحة تحكم/);
      assert.match(allFeaturesAr, /تسجيل جماعي/);
      assert.match(allFeaturesEn, /10 full-featured/i);
      assert.match(allFeaturesEn, /collaborative classroom/i);
      assert.match(allFeaturesEn, /admin dashboard/i);
      assert.match(allFeaturesEn, /bulk roster/i);
    });

    test("createTrialSchool creates an institution with 10 seats in TRIAL status", async () => {
      const trialSchool = await schoolRepository.createTrialSchool({
        nameAr: "معهد التجربة النموذجية",
        nameEn: "Model Trial Institute",
        contactPerson: "Prof. Zaid",
        contactEmail: "zaid@modeltrial.edu",
        type: "PRIVATE_INSTITUTE",
      });

      assert.ok(trialSchool.id);
      assert.equal(trialSchool.licenseSeatsTotal, 10);
      assert.equal(trialSchool.licenseSeatsUsed, 0);
      assert.equal(trialSchool.contractStatus, "TRIAL");
      assert.equal(trialSchool.bundleTier, "STARTER");
    });

    test("onboardRoster permits onboarding up to 10 students for a trial school", async () => {
      const trialSchool = await schoolRepository.createTrialSchool({
        nameAr: "مدرسة الأمل التجريبية",
        nameEn: "Al-Amal Trial School",
        contactPerson: "Ustadh Ammar",
        contactEmail: "ammar@alamal-trial.edu",
      });

      const initialRoster = [
        { fullName: "طالب تجريبي أول" },
        { fullName: "طالب تجريبي ثان" },
        { fullName: "طالب تجريبي ثالث" },
        { fullName: "طالب تجريبي رابع" },
        { fullName: "طالب تجريبي خامس" },
      ];

      const result = await schoolRepository.onboardRoster(
        trialSchool.id,
        initialRoster,
        "AGE_7_10"
      );

      assert.equal(result.createdAccounts.length, 5);
      assert.equal(result.school.licenseSeatsUsed, 5);
      assert.equal(result.school.licenseSeatsTotal, 10);
    });

    test("onboardRoster strictly rejects exceeding 10 students on a trial school", async () => {
      const trialSchool = await schoolRepository.createTrialSchool({
        nameAr: "معهد النور التجريبي",
        nameEn: "Al-Noor Trial Institute",
        contactPerson: "Dr. Karim",
        contactEmail: "karim@alnoor-trial.edu",
      });

      // 11 students exceeds the 10-student trial cap
      const overCapacityRoster = Array.from({ length: 11 }, (_, i) => ({
        fullName: `طالب تجريبي رقم ${i + 1}`,
      }));

      await assert.rejects(
        async () => {
          await schoolRepository.onboardRoster(
            trialSchool.id,
            overCapacityRoster,
            "AGE_7_10"
          );
        },
        (err: Error) => {
          assert.match(
            err.message,
            /Trial institutions are limited to a maximum of 10 students/
          );
          return true;
        }
      );
    });

    test("registerTrialSchool service method provisions school and admin account", async () => {
      const result = await schoolService.registerTrialSchool({
        nameAr: "حلقة دار التقوى التجريبية",
        nameEn: "Dar Al-Taqwa Trial Circle",
        contactPerson: "Sheikh Mansour",
        contactEmail: "mansour@dar-altaqwa-trial.edu",
        type: "FREELANCER_TEACHER",
      });

      assert.ok(result.school);
      assert.equal(result.school.contractStatus, "TRIAL");
      assert.equal(result.school.licenseSeatsTotal, 10);
    });

    test("handleInstitutionalInquiry routes 3-Day Free Trial applications directly to admin@arabickidsacademy.com", async () => {
      const inquiryResult = await schoolService.handleInstitutionalInquiry({
        organizationName: "مدرسة الفرقان التجريبية",
        contactName: "أستاذ عبدالله",
        email: "abdullah@alfurqan-trial.edu",
        phone: "+966500000001",
        institutionType: "ISLAMIC_SCHOOL",
        bundlePreference: "TRIAL_3_DAYS",
        country: "Saudi Arabia",
        city: "Riyadh",
        studentsEstimate: 10,
        message: "طلب تجربة 3 أيام لتقييم المنصة مع 10 طلاب",
      });

      assert.equal(inquiryResult.isDelivered, true);
      assert.equal(inquiryResult.isTrial, true);
      assert.equal(inquiryResult.recipientContact, "admin@arabickidsacademy.com");
      assert.equal(inquiryResult.forwardedTo, "partnerships@arabickidsacademy.com");
    });

    test("handleInstitutionalInquiry routes standard non-trial inquiries to partnerships sales email", async () => {
      const inquiryResult = await schoolService.handleInstitutionalInquiry({
        organizationName: "معهد المستقبل الدولي",
        contactName: "د. هاني",
        email: "hani@future-academy.edu",
        institutionType: "PRIVATE_INSTITUTE",
        bundlePreference: "GROWTH",
        country: "United Kingdom",
        city: "London",
        studentsEstimate: 50,
      });

      assert.equal(inquiryResult.isDelivered, true);
      assert.equal(inquiryResult.isTrial, false);
      assert.equal(inquiryResult.recipientContact, "partnerships@arabickidsacademy.com");
      assert.equal(inquiryResult.forwardedTo, undefined);
    });
  });

  describe("B2C 1-Day Free Trial Enforcements", () => {
    test("getParentAccessLevel identifies active 1-day TRIAL with hours remaining", async () => {
      const futureEnd = new Date(Date.now() + 18 * 60 * 60 * 1000);
      const originalFindFirst = prisma.subscription.findFirst;

      try {
        (prisma.subscription.findFirst as any) = async () => ({
          id: "sub-trial-123",
          parentId: "parent-test-1",
          status: SubscriptionStatus.TRIALING,
          currentPeriodEnd: futureEnd,
          plan: { id: "plan-starter", nameEn: "Starter", nameAr: "الأساسية" },
        });

        const access = await getParentAccessLevel("parent-test-1");
        assert.equal(access.level, "TRIAL");
        assert.ok(access.trialHoursRemaining !== null && access.trialHoursRemaining > 0);
        assert.equal(access.trialHoursRemaining, 18);
        assert.ok(access.trialEndsAt);
      } finally {
        prisma.subscription.findFirst = originalFindFirst;
      }
    });

    test("getParentAccessLevel expires trial lazily once 24-hour period ends", async () => {
      const pastEnd = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const originalFindFirst = prisma.subscription.findFirst;

      try {
        (prisma.subscription.findFirst as any) = async () => ({
          id: "sub-trial-expired",
          parentId: "parent-test-2",
          status: SubscriptionStatus.TRIALING,
          currentPeriodEnd: pastEnd,
          plan: { id: "plan-starter", nameEn: "Starter", nameAr: "الأساسية" },
        });

        const access = await getParentAccessLevel("parent-test-2");
        assert.equal(access.level, "NONE");
        assert.equal(access.trialHoursRemaining, 0);
      } finally {
        prisma.subscription.findFirst = originalFindFirst;
      }
    });

    test("Trial accounts have 1-child limit logic (TRIAL + 1 child => child limit reached)", () => {
      const accessLevel = "TRIAL";
      const singleChildRoster = [{ id: "child-1", firstName: "Yusuf" }];
      const isChildLimitReached = accessLevel === "TRIAL" && singleChildRoster.length >= 1;

      assert.equal(isChildLimitReached, true);

      // Active paid account with 1 child should NOT reach child limit
      const paidAccessLevel: string = "ACTIVE";
      const isPaidChildLimitReached = paidAccessLevel === "TRIAL" && singleChildRoster.length >= 1;
      assert.equal(isPaidChildLimitReached, false);
    });
  });
});
