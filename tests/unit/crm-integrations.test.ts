import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { crmService } from "../../src/server/services/CrmService";
import { referralService } from "../../src/server/services/ReferralService";

describe("CRM & Marketing Integrations Suite", () => {
  test("crmService captures contact inquiry and notifies adapters", async () => {
    const lead = await crmService.captureContactInquiry({
      name: "Yusuf Al-Farooq",
      email: "yusuf@example.com",
      phone: "+31 6 12345678",
      topic: "CURRICULUM",
      message: "Interested in the Quran & Tajweed program for an 8 year old.",
      locale: "en",
    });

    assert.equal(lead.name, "Yusuf Al-Farooq");
    assert.equal(lead.email, "yusuf@example.com");
    assert.equal(lead.type, "CONTACT_INQUIRY");
    assert.ok(crmService.getAllLeads().some((l) => l.email === "yusuf@example.com"));
  });

  test("crmService captures enrollment inquiry with child metadata", async () => {
    const lead = await crmService.captureEnrollmentInquiry({
      parentName: "Mariam Al-Hassan",
      email: "mariam@example.com",
      phone: "+44 7987 654321",
      childName: "Zayd",
      childAge: "7",
      currentLevel: "BEGINNER",
      goals: "Learn alphabet and conversational Arabic",
      locale: "ar",
    });

    assert.equal(lead.name, "Mariam Al-Hassan");
    assert.equal(lead.type, "ENROLLMENT_INQUIRY");
    assert.equal(lead.metadata?.childName, "Zayd");
    assert.equal(lead.metadata?.childAge, "7");
  });

  test("crmService captures teacher application with credentials", async () => {
    const lead = await crmService.captureTeacherApplication({
      fullName: "Ustadh Bilal Al-Qurashi",
      email: "bilal@example.com",
      phone: "+966 50 1234567",
      experienceYears: 5,
      qualifications: "BA Arabic Language - King Saud University",
      certifications: "Ten Qira'at Ijazah",
      languages: "Arabic, English",
      locale: "en",
    });

    assert.equal(lead.name, "Ustadh Bilal Al-Qurashi");
    assert.equal(lead.type, "TEACHER_APPLICATION");
    assert.equal(lead.metadata?.experienceYears, 5);
  });

  test("referralService generates stable code and tracks rewards", () => {
    const code = referralService.getReferralCodeForParent("parent-1", "Tariq");
    assert.ok(code.startsWith("REF-TARIQ-"));

    const stats = referralService.getReferralStats("parent-1");
    assert.ok(stats.totalInvites >= 1);
    assert.ok(parseFloat(stats.availableCreditsDollars) >= 0);

    const newInvite = referralService.recordReferralInvite({
      referrerParentId: "parent-1",
      referralCode: code,
      referredFamilyEmail: "new.family@example.com",
      referredChildName: "Bilal",
    });

    assert.equal(newInvite.status, "PENDING");
    assert.equal(newInvite.referredFamilyEmail, "new.family@example.com");
  });
});
