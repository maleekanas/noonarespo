/**
 * ReferralService: Parent & Affiliate Referral Program
 * Provides unique referral code generation, invite tracking, and reward credits
 * as required by PROJECT_BRIEF.md Marketing & CRM specifications.
 */

export interface ReferralRecord {
  id: string;
  referrerParentId: string;
  referralCode: string;
  referredFamilyEmail: string;
  referredChildName?: string;
  status: "PENDING" | "ENROLLED" | "REWARDED";
  rewardAmountCents: number; // e.g. 2500 for $25.00
  createdAt: Date;
  rewardedAt?: Date;
}

const referralStore: ReferralRecord[] = [
  {
    id: "ref-1",
    referrerParentId: "parent-1",
    referralCode: "REF-TARIQ-ARABIC",
    referredFamilyEmail: "family.khalid@example.com",
    referredChildName: "Omar Khalid",
    status: "ENROLLED",
    rewardAmountCents: 2500,
    createdAt: new Date(Date.now() - 86400000 * 15),
    rewardedAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: "ref-2",
    referrerParentId: "parent-1",
    referralCode: "REF-TARIQ-ARABIC",
    referredFamilyEmail: "family.yusuf@example.com",
    referredChildName: "Amina Yusuf",
    status: "PENDING",
    rewardAmountCents: 2500,
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
];

export class ReferralService {
  getReferralCodeForParent(parentId: string, parentName: string = "PARENT"): string {
    const cleanName = parentName.replace(/[^a-zA-Z]/g, "").toUpperCase() || "FAMILY";
    return `REF-${cleanName}-${parentId.slice(-4).toUpperCase()}`;
  }

  getReferralsForParent(parentId: string): ReferralRecord[] {
    return referralStore.filter((r) => r.referrerParentId === parentId);
  }

  getReferralStats(parentId: string) {
    const parentRefs = this.getReferralsForParent(parentId);
    const totalInvites = parentRefs.length;
    const enrolled = parentRefs.filter((r) => r.status === "ENROLLED" || r.status === "REWARDED").length;
    const totalEarnedCents = parentRefs
      .filter((r) => r.status === "REWARDED")
      .reduce((sum, r) => sum + r.rewardAmountCents, 0);

    return {
      totalInvites,
      enrolled,
      totalEarnedCents,
      availableCreditsDollars: (totalEarnedCents / 100).toFixed(2),
    };
  }

  recordReferralInvite(params: {
    referrerParentId: string;
    referralCode: string;
    referredFamilyEmail: string;
    referredChildName?: string;
  }): ReferralRecord {
    const newRecord: ReferralRecord = {
      id: `ref-${Date.now()}`,
      referrerParentId: params.referrerParentId,
      referralCode: params.referralCode,
      referredFamilyEmail: params.referredFamilyEmail,
      referredChildName: params.referredChildName,
      status: "PENDING",
      rewardAmountCents: 2500,
      createdAt: new Date(),
    };

    referralStore.unshift(newRecord);
    return newRecord;
  }
}

export const referralService = new ReferralService();
