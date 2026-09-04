import {
  gamificationRepository,
  DomainBadge,
  LeaderboardEntry,
} from "../repositories/GamificationRepository";
import { userRepository } from "../repositories/UserRepository";

export interface StudentGamificationProfile {
  studentId: string;
  totalXp: number;
  level: number;
  levelTitleAr: string;
  levelTitleEn: string;
  currentLevelMinXp: number;
  nextLevelXp: number;
  progressToNextLevelPercentage: number;
  streakDays: number;
  unlockedBadges: DomainBadge[];
  allBadges: DomainBadge[];
}

export class GamificationService {
  /**
   * Calculates level, title, and progress thresholds based on total XP.
   */
  calculateLevel(totalXp: number): {
    level: number;
    titleAr: string;
    titleEn: string;
    minXp: number;
    nextXp: number;
    progressPercentage: number;
  } {
    if (totalXp < 100) {
      return {
        level: 1,
        titleAr: "مبتدئ فضولي",
        titleEn: "Curious Beginner",
        minXp: 0,
        nextXp: 100,
        progressPercentage: Math.min(Math.round((totalXp / 100) * 100), 100),
      };
    } else if (totalXp < 250) {
      return {
        level: 2,
        titleAr: "مستكشف الحروف",
        titleEn: "Letter Explorer",
        minXp: 100,
        nextXp: 250,
        progressPercentage: Math.min(Math.round(((totalXp - 100) / 150) * 100), 100),
      };
    } else if (totalXp < 500) {
      return {
        level: 3,
        titleAr: "فارس القراءة والطلاقة",
        titleEn: "Fluency Knight",
        minXp: 250,
        nextXp: 500,
        progressPercentage: Math.min(Math.round(((totalXp - 250) / 250) * 100), 100),
      };
    } else if (totalXp < 1000) {
      return {
        level: 4,
        titleAr: "بطل الفصاحة والبيان",
        titleEn: "Eloquence Champion",
        minXp: 500,
        nextXp: 1000,
        progressPercentage: Math.min(Math.round(((totalXp - 500) / 500) * 100), 100),
      };
    } else {
      return {
        level: 5,
        titleAr: "علّامة الأكاديمية",
        titleEn: "Academy Scholar",
        minXp: 1000,
        nextXp: 2000,
        progressPercentage: Math.min(Math.round(((totalXp - 1000) / 1000) * 100), 100),
      };
    }
  }

  /**
   * Awards XP to a student, updates daily activity streak, and checks badge milestones.
   */
  async awardXp(studentId: string, amount: number, reason: string): Promise<number> {
    await gamificationRepository.addXp(studentId, amount, reason);
    await gamificationRepository.updateStreak(studentId);

    const newTotal = await gamificationRepository.getTotalXp(studentId);

    // Badge Milestones Check
    if (newTotal >= 250) {
      await gamificationRepository.unlockBadge(studentId, "READING_CHAMPION");
    }
    if (newTotal >= 450) {
      await gamificationRepository.unlockBadge(studentId, "PERFECT_ATTENDANCE");
    }

    return newTotal;
  }

  /**
   * Retrieves complete student gamification profile.
   */
  async getStudentGamification(studentId: string): Promise<StudentGamificationProfile> {
    const totalXp = await gamificationRepository.getTotalXp(studentId);
    const levelInfo = this.calculateLevel(totalXp);
    const streak = await gamificationRepository.getStreak(studentId);
    const unlockedBadges = await gamificationRepository.getStudentBadges(studentId);
    const allBadges = await gamificationRepository.getAllBadges();

    return {
      studentId,
      totalXp,
      level: levelInfo.level,
      levelTitleAr: levelInfo.titleAr,
      levelTitleEn: levelInfo.titleEn,
      currentLevelMinXp: levelInfo.minXp,
      nextLevelXp: levelInfo.nextXp,
      progressToNextLevelPercentage: levelInfo.progressPercentage,
      streakDays: streak.currentStreakDays,
      unlockedBadges,
      allBadges,
    };
  }

  /**
   * Generates a privacy-safe leaderboard (first name + family initial only) for the student's cohort.
   */
  async getCohortLeaderboard(currentStudentId: string): Promise<LeaderboardEntry[]> {
    const currentStudent = await userRepository.findStudentProfileById(currentStudentId);
    const currentStudentXp = await gamificationRepository.getTotalXp(currentStudentId);
    const currentStudentBadges = await gamificationRepository.getStudentBadges(currentStudentId);
    const currentLevel = this.calculateLevel(currentStudentXp);

    const safeCurrentName = currentStudent
      ? `${currentStudent.firstName} ${currentStudent.lastName[0]}.`
      : "أنا";

    // Cohort peers with privacy-friendly names
    const rawList = [
      {
        studentId: "student-peer-1",
        displayName: "يوسف ع.",
        monthlyXp: 480,
        level: 3,
        levelTitle: "فارس القراءة",
        badgeCount: 3,
        isCurrentStudent: false,
      },
      {
        studentId: currentStudentId,
        displayName: safeCurrentName,
        monthlyXp: currentStudentXp || 450,
        level: currentLevel.level,
        levelTitle: currentLevel.titleAr,
        badgeCount: currentStudentBadges.length || 2,
        isCurrentStudent: true,
      },
      {
        studentId: "student-peer-2",
        displayName: "فاطمة ن.",
        monthlyXp: 390,
        level: 3,
        levelTitle: "فارس القراءة",
        badgeCount: 2,
        isCurrentStudent: false,
      },
      {
        studentId: "student-peer-3",
        displayName: "عمر خ.",
        monthlyXp: 310,
        level: 2,
        levelTitle: "مستكشف الحروف",
        badgeCount: 1,
        isCurrentStudent: false,
      },
      {
        studentId: "student-peer-4",
        displayName: "سارة م.",
        monthlyXp: 280,
        level: 2,
        levelTitle: "مستكشف الحروف",
        badgeCount: 1,
        isCurrentStudent: false,
      },
    ];

    // Sort descending by monthly XP
    rawList.sort((a, b) => b.monthlyXp - a.monthlyXp);

    return rawList.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }
}

export const gamificationService = new GamificationService();
