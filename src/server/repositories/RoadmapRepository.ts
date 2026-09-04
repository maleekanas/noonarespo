export type QuestNodeStatus = "COMPLETED" | "ACTIVE" | "LOCKED";

export interface QuestNode {
  id: string;
  stageId: string;
  stageNameAr: string;
  stageNameEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  order: number;
  status: QuestNodeStatus;
  starsEarned: number; // 0 to 3
  xpReward: number;
  targetRoute: string;
  illustrationEmoji: string;
  cefrMilestone?: string;
}

export interface MilestoneChest {
  id: string;
  stageId: string;
  titleAr: string;
  titleEn: string;
  requiredStars: number;
  xpBonus: number;
  badgeNameAr: string;
  isUnlocked: boolean;
}

export interface StudentQuestProgress {
  studentId: string;
  nodes: QuestNode[];
  chests: MilestoneChest[];
  totalStars: number;
  completedNodesCount: number;
  currentActiveNodeId: string;
  pathCompletionPercentage: number;
}

class InMemoryRoadmapRepository {
  private progressStore: Map<string, StudentQuestProgress> = new Map();

  constructor() {
    this.seedDefaultStudent("student-1");
  }

  private seedDefaultStudent(studentId: string) {
    const defaultNodes: QuestNode[] = [
      // Stage 1: Oasis of Letters (واحة الحروف)
      {
        id: "node-1-alphabet",
        stageId: "stage-oasis",
        stageNameAr: "واحة الحروف والأصوات 🌴",
        stageNameEn: "Oasis of Letters & Sounds 🌴",
        titleAr: "بستان الأبجدية: أشكال الحروف",
        titleEn: "Alphabet Grove: Letter Shapes",
        descriptionAr: "تعرف على أشكال الحروف العربية في أول الكلمة ووسطها وآخرها.",
        descriptionEn: "Master letter forms: initial, medial, and final positions.",
        order: 1,
        status: "COMPLETED",
        starsEarned: 3,
        xpReward: 25,
        targetRoute: "/student/activities",
        illustrationEmoji: "🌱",
        cefrMilestone: "PRE_A1",
      },
      {
        id: "node-2-harakat",
        stageId: "stage-oasis",
        stageNameAr: "واحة الحروف والأصوات 🌴",
        stageNameEn: "Oasis of Letters & Sounds 🌴",
        titleAr: "حركات التشكيل: الفتح والضم والكسر",
        titleEn: "Short Vowels: Fatha, Damma, Kasra",
        descriptionAr: "تدرب على أصوات الحركات القصيرة والمدود الطويلة.",
        descriptionEn: "Practice short vowels and long acoustic Madd vowels.",
        order: 2,
        status: "COMPLETED",
        starsEarned: 3,
        xpReward: 25,
        targetRoute: "/student/activities",
        illustrationEmoji: "🌺",
        cefrMilestone: "PRE_A1",
      },
      {
        id: "node-3-tracing",
        stageId: "stage-oasis",
        stageNameAr: "واحة الحروف والأصوات 🌴",
        stageNameEn: "Oasis of Letters & Sounds 🌴",
        titleAr: "كراسة تتبع خط النسخ المسطرة",
        titleEn: "Ruled Naskh Calligraphy Tracing",
        descriptionAr: "اكتب الحروف بالقلم مع ضبط السطر الأساسي.",
        descriptionEn: "Handwrite Arabic letters with baseline guides.",
        order: 3,
        status: "COMPLETED",
        starsEarned: 2,
        xpReward: 30,
        targetRoute: "/parent/printables",
        illustrationEmoji: "✍️",
        cefrMilestone: "PRE_A1",
      },

      // Stage 2: Dunes of Phonics (كثبان الأصوات والكلمات)
      {
        id: "node-4-makharij",
        stageId: "stage-dunes",
        stageNameAr: "كثبان الأصوات والكلمات 🏜️",
        stageNameEn: "Dunes of Phonics & Words 🏜️",
        titleAr: "استوديو مخارج الحروف الصعبة (ض، ص)",
        titleEn: "Makharij Studio: Emphatic Letters",
        descriptionAr: "طابق موجتك الصوتية مع النموذج لنطق حرفي الضاد والصاد.",
        descriptionEn: "Match your acoustic waveform for challenging letters Dhad and Sad.",
        order: 4,
        status: "COMPLETED",
        starsEarned: 3,
        xpReward: 20,
        targetRoute: "/student/pronunciation",
        illustrationEmoji: "🎙️",
        cefrMilestone: "A1",
      },
      {
        id: "node-5-word-builder",
        stageId: "stage-dunes",
        stageNameAr: "كثبان الأصوات والكلمات 🏜️",
        stageNameEn: "Dunes of Phonics & Words 🏜️",
        titleAr: "مختبر تركيب الكلمات المبعثرة",
        titleEn: "Word Scrambler Assembly Lab",
        descriptionAr: "ركب الحروف المبعثرة لتكوين كلمات عربية صحيحة.",
        descriptionEn: "Unscramble letters into meaningful Arabic vocabulary words.",
        order: 5,
        status: "ACTIVE", // Current active milestone!
        starsEarned: 0,
        xpReward: 30,
        targetRoute: "/student/activities",
        illustrationEmoji: "🧩",
        cefrMilestone: "A1",
      },
      {
        id: "node-6-minimal-pairs",
        stageId: "stage-dunes",
        stageNameAr: "كثبان الأصوات والكلمات 🏜️",
        stageNameEn: "Dunes of Phonics & Words 🏜️",
        titleAr: "تحدي الأزواج اللغوية المتشابهة",
        titleEn: "Minimal Sound Pairs Challenge",
        descriptionAr: "ميز بين السين والصاد، والتاء والطاء في المعنى والنطق.",
        descriptionEn: "Differentiate minimal acoustic contrasts (Sayf vs Sayf).",
        order: 6,
        status: "LOCKED",
        starsEarned: 0,
        xpReward: 25,
        targetRoute: "/student/pronunciation",
        illustrationEmoji: "⚡",
        cefrMilestone: "A1",
      },

      // Stage 3: River of Stories (نهر القصص والقيم)
      {
        id: "node-7-nuh-ark",
        stageId: "stage-river",
        stageNameAr: "نهر القصص والقيم النبوية 🌊",
        stageNameEn: "River of Stories & Values 🌊",
        titleAr: "قصة سفينة نوح عليه السلام",
        titleEn: "Prophet Nuh's Ark Illustrated Tale",
        descriptionAr: "اقرأ القصة المشكولة، استمع للنطق، واجتز اختبار الفهم.",
        descriptionEn: "Read vocalized pages, listen to word audio, and pass the moral quiz.",
        order: 7,
        status: "LOCKED",
        starsEarned: 0,
        xpReward: 35,
        targetRoute: "/student/stories/story-nuh-ark",
        illustrationEmoji: "🚢",
        cefrMilestone: "A2",
      },
      {
        id: "node-8-ant-grain",
        stageId: "stage-river",
        stageNameAr: "نهر القصص والقيم النبوية 🌊",
        stageNameEn: "River of Stories & Values 🌊",
        titleAr: "قصة النملة الصغيرة وحبة القمح",
        titleEn: "The Little Ant and Perseverance",
        descriptionAr: "تعلم قيمة الصبر والتوكل على الله مع أسئلة الاستيعاب.",
        descriptionEn: "Learn Islamic values of patience with interactive questions.",
        order: 8,
        status: "LOCKED",
        starsEarned: 0,
        xpReward: 35,
        targetRoute: "/student/stories/story-ant-grain",
        illustrationEmoji: "🐜",
        cefrMilestone: "A2",
      },

      // Stage 4: Citadel of Tajweed (قلعة التلاوة والتجويد)
      {
        id: "node-9-quran-fatiha",
        stageId: "stage-citadel",
        stageNameAr: "قلعة التلاوة والتجويد 🏰",
        stageNameEn: "Citadel of Quran & Tajweed 🏰",
        titleAr: "سورة الفاتحة وأحكام المدود الملونة",
        titleEn: "Surah Al-Fatiha & Color-Coded Madd",
        descriptionAr: "استمع بالرسم العثماني الملون وسجل تلاوتك للحصول على النجوم.",
        descriptionEn: "Recite with color-coded Uthmani Tajweed rules and record voice.",
        order: 9,
        status: "LOCKED",
        starsEarned: 0,
        xpReward: 35,
        targetRoute: "/student/quran-studio",
        illustrationEmoji: "📖",
        cefrMilestone: "A2",
      },

      // Stage 5: Palace of Fluency (قصر الفصاحة والبيان)
      {
        id: "node-10-ai-dialogue",
        stageId: "stage-palace",
        stageNameAr: "قصر الفصاحة والمحادثة 👑",
        stageNameEn: "Palace of Arabic Fluency 👑",
        titleAr: "المحادثة الحية مع المرشد الذكي فصيح",
        titleEn: "Interactive Arabic Dialogue with Faseeh",
        descriptionAr: "أجرِ حواراً عربياً كاملاً بالتشكيل وأظهر طلاقتك التعبيرية.",
        descriptionEn: "Engage in vocalized dialogue with the AI tutor and prove fluency.",
        order: 10,
        status: "LOCKED",
        starsEarned: 0,
        xpReward: 50,
        targetRoute: "/student/ai-tutor",
        illustrationEmoji: "🎓",
        cefrMilestone: "B1",
      },
    ];

    const defaultChests: MilestoneChest[] = [
      {
        id: "chest-oasis",
        stageId: "stage-oasis",
        titleAr: "صندوق كنز واحة الحروف 🏆",
        titleEn: "Oasis of Letters Treasure Chest 🏆",
        requiredStars: 8,
        xpBonus: 50,
        badgeNameAr: "مستكشف واحة الحروف",
        isUnlocked: true, // 3 + 3 + 2 = 8 stars earned
      },
      {
        id: "chest-dunes",
        stageId: "stage-dunes",
        titleAr: "صندوق كنز كثبان الكلمات 💎",
        titleEn: "Dunes of Words Treasure Chest 💎",
        requiredStars: 16,
        xpBonus: 75,
        badgeNameAr: "صائد الكلمات الفصيحة",
        isUnlocked: false,
      },
      {
        id: "chest-stories",
        stageId: "stage-river",
        titleAr: "صندوق كنز نهر القيم النبوية 🌟",
        titleEn: "River of Values Treasure Chest 🌟",
        requiredStars: 22,
        xpBonus: 100,
        badgeNameAr: "حكيم القصص والأخلاق",
        isUnlocked: false,
      },
    ];

    const completed = defaultNodes.filter((n) => n.status === "COMPLETED").length;
    const totalStars = defaultNodes.reduce((acc, n) => acc + n.starsEarned, 0);

    this.progressStore.set(studentId, {
      studentId,
      nodes: defaultNodes,
      chests: defaultChests,
      totalStars,
      completedNodesCount: completed,
      currentActiveNodeId: "node-5-word-builder",
      pathCompletionPercentage: Math.round((completed / defaultNodes.length) * 100),
    });
  }

  async getStudentProgress(studentId: string): Promise<StudentQuestProgress> {
    if (!this.progressStore.has(studentId)) {
      this.seedDefaultStudent(studentId);
    }
    return this.progressStore.get(studentId)!;
  }

  async completeNode(
    studentId: string,
    nodeId: string,
    starsEarned: number
  ): Promise<StudentQuestProgress> {
    const progress = await this.getStudentProgress(studentId);
    const nodeIndex = progress.nodes.findIndex((n) => n.id === nodeId);

    if (nodeIndex !== -1) {
      // Complete this node
      progress.nodes[nodeIndex].status = "COMPLETED";
      progress.nodes[nodeIndex].starsEarned = Math.max(
        progress.nodes[nodeIndex].starsEarned,
        Math.min(starsEarned, 3)
      );

      // Unlock next node if exists
      if (nodeIndex + 1 < progress.nodes.length) {
        if (progress.nodes[nodeIndex + 1].status === "LOCKED") {
          progress.nodes[nodeIndex + 1].status = "ACTIVE";
          progress.currentActiveNodeId = progress.nodes[nodeIndex + 1].id;
        }
      }

      // Recompute stats
      const completed = progress.nodes.filter((n) => n.status === "COMPLETED").length;
      progress.completedNodesCount = completed;
      progress.totalStars = progress.nodes.reduce((acc, n) => acc + n.starsEarned, 0);
      progress.pathCompletionPercentage = Math.round(
        (completed / progress.nodes.length) * 100
      );

      // Check chests
      progress.chests.forEach((chest) => {
        if (progress.totalStars >= chest.requiredStars) {
          chest.isUnlocked = true;
        }
      });
    }

    return progress;
  }
}

export const roadmapRepository = new InMemoryRoadmapRepository();
