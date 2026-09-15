import { prisma } from "@/lib/database/prisma";

/**
 * Prisma-backed repository for XP, badges, and learning streaks. Previously
 * in-memory, seeded only for the fixed demo student "student-1" -- XP a real
 * student earned, a badge a real student unlocked, or a real student's daily
 * streak was never actually saved anywhere durable and reset on every
 * serverless cold start.
 *
 * The in-memory version's DomainBadge carried descriptionAr/iconName/category
 * fields that don't exist on the real Badge model, and referenced badges by
 * a 5-value string-literal "code" union (including an unseeded STREAK_MASTER)
 * instead of the real model's badgeId foreign key. Verified via a full grep
 * of the UI that only `badge.code`, `badge.titleAr`, and `badge.titleEn` are
 * ever read (src/app/[locale]/(dashboard)/student/page.tsx renders its badge
 * icons from a hardcoded switch on `code`, with a graceful fallback for any
 * code it doesn't recognize) -- so DomainBadge below matches the real Badge
 * shape exactly and no UI changes were needed.
 */

export interface DomainBadge {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  iconUrl: string;
  xpReward: number;
}

export interface DomainXpTransaction {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  createdAt: Date;
}

export interface StudentStreakRecord {
  studentId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate: string; // YYYY-MM-DD
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  displayName: string; // "زيد ط." (safe name)
  level: number;
  levelTitle: string;
  monthlyXp: number;
  badgeCount: number;
  isCurrentStudent: boolean;
}

function dateOnly(d: Date): string {
  return d.toISOString().split("T")[0];
}

class GamificationRepository {
  // --- XP Queries & Mutations ---
  async addXp(studentId: string, amount: number, reason: string): Promise<DomainXpTransaction> {
    const tx = await prisma.pointTransaction.create({
      data: { studentId, pointsDelta: amount, reason },
    });
    return { id: tx.id, studentId: tx.studentId, amount: tx.pointsDelta, reason: tx.reason, createdAt: tx.createdAt };
  }

  async getTotalXp(studentId: string): Promise<number> {
    const result = await prisma.pointTransaction.aggregate({
      where: { studentId },
      _sum: { pointsDelta: true },
    });
    return result._sum.pointsDelta ?? 0;
  }

  async getXpHistory(studentId: string): Promise<DomainXpTransaction[]> {
    const txs = await prisma.pointTransaction.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });
    return txs.map((tx) => ({
      id: tx.id,
      studentId: tx.studentId,
      amount: tx.pointsDelta,
      reason: tx.reason,
      createdAt: tx.createdAt,
    }));
  }

  // --- Badges ---
  async getAllBadges(): Promise<DomainBadge[]> {
    return prisma.badge.findMany();
  }

  async getStudentBadges(studentId: string): Promise<DomainBadge[]> {
    const records = await prisma.studentBadge.findMany({
      where: { studentId },
      include: { badge: true },
    });
    return records.map((r) => r.badge);
  }

  async unlockBadge(studentId: string, badgeCode: string): Promise<boolean> {
    const badge = await prisma.badge.findUnique({ where: { code: badgeCode } });
    if (!badge) return false; // badge code not seeded (e.g. legacy STREAK_MASTER) -- no-op, not an error

    const exists = await prisma.studentBadge.findUnique({
      where: { studentId_badgeId: { studentId, badgeId: badge.id } },
    });
    if (exists) return false;

    await prisma.studentBadge.create({ data: { studentId, badgeId: badge.id } });
    return true;
  }

  // --- Streaks ---
  async getStreak(studentId: string): Promise<StudentStreakRecord> {
    const existing = await prisma.learningStreak.findUnique({ where: { studentId } });
    if (existing) {
      return {
        studentId: existing.studentId,
        currentStreakDays: existing.currentCount,
        longestStreakDays: existing.longestCount,
        lastActivityDate: dateOnly(existing.lastActiveAt),
      };
    }

    const created = await prisma.learningStreak.create({
      data: { studentId, currentCount: 1, longestCount: 1, lastActiveAt: new Date() },
    });
    return {
      studentId: created.studentId,
      currentStreakDays: created.currentCount,
      longestStreakDays: created.longestCount,
      lastActivityDate: dateOnly(created.lastActiveAt),
    };
  }

  async updateStreak(studentId: string): Promise<StudentStreakRecord> {
    const record = await this.getStreak(studentId);
    const todayStr = dateOnly(new Date());

    if (record.lastActivityDate === todayStr) {
      // Already active today
      return record;
    }

    const yesterdayStr = dateOnly(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const currentStreakDays =
      record.lastActivityDate === yesterdayStr ? record.currentStreakDays + 1 : 1;
    const longestStreakDays = Math.max(record.longestStreakDays, currentStreakDays);

    const updated = await prisma.learningStreak.update({
      where: { studentId },
      data: {
        currentCount: currentStreakDays,
        longestCount: longestStreakDays,
        lastActiveAt: new Date(),
      },
    });

    return {
      studentId: updated.studentId,
      currentStreakDays: updated.currentCount,
      longestStreakDays: updated.longestCount,
      lastActivityDate: dateOnly(updated.lastActiveAt),
    };
  }
}

export const gamificationRepository = new GamificationRepository();
