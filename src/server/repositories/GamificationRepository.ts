export interface DomainBadge {
  id: string;
  code: "READING_CHAMPION" | "GRAMMAR_MASTER" | "QURAN_STAR" | "PERFECT_ATTENDANCE" | "STREAK_MASTER";
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  iconName: string;
  category: "READING" | "GRAMMAR" | "QURAN" | "ATTENDANCE" | "STREAK";
}

export interface StudentBadgeRecord {
  studentId: string;
  badgeCode: string;
  unlockedAt: Date;
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

class InMemoryGamificationRepository {
  private badges: Map<string, DomainBadge> = new Map();
  private studentBadges: StudentBadgeRecord[] = [];
  private xpTransactions: DomainXpTransaction[] = [];
  private streaks: Map<string, StudentStreakRecord> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Badges catalog from PROJECT_BRIEF.md
    const badgeCatalog: DomainBadge[] = [
      {
        id: "badge-reading",
        code: "READING_CHAMPION",
        titleAr: "بطل القراءة والطلاقة",
        titleEn: "Reading Champion",
        descriptionAr: "إتمام 5 واجبات قراءة متتالية بدرجة امتياز",
        iconName: "BookOpen",
        category: "READING",
      },
      {
        id: "badge-grammar",
        code: "GRAMMAR_MASTER",
        titleAr: "فارس النحو وقواعد اللغة",
        titleEn: "Grammar Master",
        descriptionAr: "إتقان تركيب الجمل وتمييز الحركات الإعرابية",
        iconName: "PenTool",
        category: "GRAMMAR",
      },
      {
        id: "badge-quran",
        code: "QURAN_STAR",
        titleAr: "نجم القرآن والتجويد",
        titleEn: "Quran Star",
        descriptionAr: "تطبيق متقن لأحكام القلقلة والمد الطبيعي",
        iconName: "Moon",
        category: "QURAN",
      },
      {
        id: "badge-attendance",
        code: "PERFECT_ATTENDANCE",
        titleAr: "وسام المواظبة الذهبي",
        titleEn: "Perfect Attendance",
        descriptionAr: "حضور جميع الحصص المباشرة خلال الشهر دون أي غياب",
        iconName: "Award",
        category: "ATTENDANCE",
      },
      {
        id: "badge-streak",
        code: "STREAK_MASTER",
        titleAr: "بطل الاستمرار (7 أيام)",
        titleEn: "Streak Master",
        descriptionAr: "التعلم اليومي والممارسة المستمرة لمدة 7 أيام متتالية",
        iconName: "Flame",
        category: "STREAK",
      },
    ];

    for (const b of badgeCatalog) {
      this.badges.set(b.code, b);
    }

    // 2. Seed initial XP transactions for Zayd (student-1)
    const now = new Date();
    this.xpTransactions.push(
      {
        id: "xp-1",
        studentId: "student-1",
        amount: 150,
        reason: "تسجيل الدخول وإكمال التقييم المبدئي",
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: "xp-2",
        studentId: "student-1",
        amount: 100,
        reason: "حضور حصتي القراءة والطلاقة المباشرة",
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "xp-3",
        studentId: "student-1",
        amount: 100,
        reason: "تسليم واجب سورة الإخلاص مع العلامة الكاملة 100%",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "xp-4",
        studentId: "student-1",
        amount: 100,
        reason: "مواظبة أسبوعية متميزة",
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      }
    );

    // Seed XP for cohort peers to create a live friendly leaderboard
    this.xpTransactions.push(
      { id: "xp-peer-1", studentId: "student-peer-1", amount: 480, reason: "أنشطة تفاعلية", createdAt: now },
      { id: "xp-peer-2", studentId: "student-peer-2", amount: 390, reason: "واجبات صوتية", createdAt: now },
      { id: "xp-peer-3", studentId: "student-peer-3", amount: 310, reason: "حضور كامل", createdAt: now }
    );

    // 3. Seed initial unlocked badges for Zayd
    this.studentBadges.push(
      { studentId: "student-1", badgeCode: "READING_CHAMPION", unlockedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { studentId: "student-1", badgeCode: "PERFECT_ATTENDANCE", unlockedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) }
    );

    // 4. Seed Streak for Zayd (5 consecutive days)
    const todayStr = now.toISOString().split("T")[0];
    this.streaks.set("student-1", {
      studentId: "student-1",
      currentStreakDays: 5,
      longestStreakDays: 8,
      lastActivityDate: todayStr,
    });
  }

  // --- XP Queries & Mutations ---
  async addXp(studentId: string, amount: number, reason: string): Promise<DomainXpTransaction> {
    const tx: DomainXpTransaction = {
      id: "xp-" + (this.xpTransactions.length + 1),
      studentId,
      amount,
      reason,
      createdAt: new Date(),
    };
    this.xpTransactions.push(tx);
    return tx;
  }

  async getTotalXp(studentId: string): Promise<number> {
    return this.xpTransactions
      .filter((tx) => tx.studentId === studentId)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  async getXpHistory(studentId: string): Promise<DomainXpTransaction[]> {
    return this.xpTransactions
      .filter((tx) => tx.studentId === studentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // --- Badges ---
  async getAllBadges(): Promise<DomainBadge[]> {
    return Array.from(this.badges.values());
  }

  async getStudentBadges(studentId: string): Promise<DomainBadge[]> {
    const unlockedCodes = new Set(
      this.studentBadges.filter((sb) => sb.studentId === studentId).map((sb) => sb.badgeCode)
    );
    return Array.from(this.badges.values()).filter((b) => unlockedCodes.has(b.code));
  }

  async unlockBadge(studentId: string, badgeCode: string): Promise<boolean> {
    const exists = this.studentBadges.some(
      (sb) => sb.studentId === studentId && sb.badgeCode === badgeCode
    );
    if (exists) return false;

    this.studentBadges.push({
      studentId,
      badgeCode,
      unlockedAt: new Date(),
    });
    return true;
  }

  // --- Streaks ---
  async getStreak(studentId: string): Promise<StudentStreakRecord> {
    const existing = this.streaks.get(studentId);
    if (existing) return existing;

    const initial: StudentStreakRecord = {
      studentId,
      currentStreakDays: 1,
      longestStreakDays: 1,
      lastActivityDate: new Date().toISOString().split("T")[0],
    };
    this.streaks.set(studentId, initial);
    return initial;
  }

  async updateStreak(studentId: string): Promise<StudentStreakRecord> {
    const record = await this.getStreak(studentId);
    const todayStr = new Date().toISOString().split("T")[0];

    if (record.lastActivityDate === todayStr) {
      // Already active today
      return record;
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    if (record.lastActivityDate === yesterday) {
      // Consecutive day: increment streak
      record.currentStreakDays += 1;
      if (record.currentStreakDays > record.longestStreakDays) {
        record.longestStreakDays = record.currentStreakDays;
      }
    } else {
      // Broken streak: reset to 1
      record.currentStreakDays = 1;
    }

    record.lastActivityDate = todayStr;
    this.streaks.set(studentId, record);
    return record;
  }
}

export const gamificationRepository = new InMemoryGamificationRepository();
