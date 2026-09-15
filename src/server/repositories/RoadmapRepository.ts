import { prisma } from "@/lib/database/prisma";

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

// The quest node / milestone chest catalog (titles, descriptions, xp
// rewards, ordering) is static app content bundled with the code, not user
// data, so it stays as an in-memory definition here -- same shape as
// before, minus the per-student fields (status/starsEarned/isUnlocked)
// which now live in the database.
type QuestNodeDefinition = Omit<QuestNode, "status" | "starsEarned">;
type MilestoneChestDefinition = Omit<MilestoneChest, "isUnlocked">;

const QUEST_NODE_DEFS: QuestNodeDefinition[] = [
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
    xpReward: 50,
    targetRoute: "/student/ai-tutor",
    illustrationEmoji: "🎓",
    cefrMilestone: "B1",
  },
];

const MILESTONE_CHEST_DEFS: MilestoneChestDefinition[] = [
  {
    id: "chest-oasis",
    stageId: "stage-oasis",
    titleAr: "صندوق كنز واحة الحروف 🏆",
    titleEn: "Oasis of Letters Treasure Chest 🏆",
    requiredStars: 8,
    xpBonus: 50,
    badgeNameAr: "مستكشف واحة الحروف",
  },
  {
    id: "chest-dunes",
    stageId: "stage-dunes",
    titleAr: "صندوق كنز كثبان الكلمات 💎",
    titleEn: "Dunes of Words Treasure Chest 💎",
    requiredStars: 16,
    xpBonus: 75,
    badgeNameAr: "صائد الكلمات الفصيحة",
  },
  {
    id: "chest-stories",
    stageId: "stage-river",
    titleAr: "صندوق كنز نهر القيم النبوية 🌟",
    titleEn: "River of Values Treasure Chest 🌟",
    requiredStars: 22,
    xpBonus: 100,
    badgeNameAr: "حكيم القصص والأخلاق",
  },
];

/**
 * A real student's quest-node progress (which nodes are completed/active/
 * locked, stars earned) used to be an in-memory Map, seeded with a fully
 * fabricated "already 40% through the roadmap" state the first time ANY
 * studentId was looked up -- including a brand-new real student, who'd see
 * 8 stars and 4 completed nodes they never actually earned. It also reset
 * on every serverless cold start regardless.
 *
 * Progress is now backed by a new RoadmapNodeProgress Prisma model/table
 * (see prisma/schema.prisma and
 * src/app/api/admin/apply-roadmap-schema-migration/route.ts), storing only
 * per-student per-node status/stars. A brand-new student with no rows at
 * all now honestly starts at node 1 ACTIVE and everything else LOCKED --
 * derived the same way the chain naturally unlocks as nodes complete,
 * rather than being pre-seeded with fake progress.
 */
class RoadmapRepository {
  async getStudentProgress(studentId: string): Promise<StudentQuestProgress> {
    const rows = await prisma.roadmapNodeProgress.findMany({ where: { studentId } });
    const progressByNodeId = new Map<string, (typeof rows)[number]>();
    for (const row of rows) progressByNodeId.set(row.nodeId, row);

    const orderedDefs = [...QUEST_NODE_DEFS].sort((a, b) => a.order - b.order);

    let chainOpen = true; // the earliest node with no row defaults to ACTIVE
    let currentActiveNodeId = orderedDefs[0]?.id ?? "";
    const nodes: QuestNode[] = orderedDefs.map((def) => {
      const row = progressByNodeId.get(def.id);
      let status: QuestNodeStatus;
      let starsEarned: number;

      if (row) {
        status = row.status as QuestNodeStatus;
        starsEarned = row.starsEarned;
      } else if (chainOpen) {
        status = "ACTIVE";
        starsEarned = 0;
      } else {
        status = "LOCKED";
        starsEarned = 0;
      }

      if (status === "ACTIVE") currentActiveNodeId = def.id;
      // The chain only stays open into the next node once this one is
      // COMPLETED; an ACTIVE or LOCKED node closes it for everything after.
      chainOpen = status === "COMPLETED";

      return { ...def, status, starsEarned };
    });

    const completedNodesCount = nodes.filter((n) => n.status === "COMPLETED").length;
    const totalStars = nodes.reduce((acc, n) => acc + n.starsEarned, 0);

    const chests: MilestoneChest[] = MILESTONE_CHEST_DEFS.map((def) => ({
      ...def,
      isUnlocked: totalStars >= def.requiredStars,
    }));

    return {
      studentId,
      nodes,
      chests,
      totalStars,
      completedNodesCount,
      currentActiveNodeId,
      pathCompletionPercentage: Math.round((completedNodesCount / nodes.length) * 100),
    };
  }

  async completeNode(
    studentId: string,
    nodeId: string,
    starsEarned: number
  ): Promise<StudentQuestProgress> {
    const before = await this.getStudentProgress(studentId);
    const nodeIndex = before.nodes.findIndex((n) => n.id === nodeId);

    if (nodeIndex !== -1) {
      const node = before.nodes[nodeIndex];
      const newStars = Math.max(node.starsEarned, Math.min(starsEarned, 3));

      await prisma.roadmapNodeProgress.upsert({
        where: { studentId_nodeId: { studentId, nodeId } },
        update: { status: "COMPLETED", starsEarned: newStars },
        create: { studentId, nodeId, status: "COMPLETED", starsEarned: newStars },
      });

      // Unlock the next node if it isn't already touched.
      const nextNode = before.nodes[nodeIndex + 1];
      if (nextNode && nextNode.status === "LOCKED") {
        await prisma.roadmapNodeProgress.upsert({
          where: { studentId_nodeId: { studentId, nodeId: nextNode.id } },
          update: { status: "ACTIVE" },
          create: { studentId, nodeId: nextNode.id, status: "ACTIVE", starsEarned: 0 },
        });
      }
    }

    return this.getStudentProgress(studentId);
  }
}

export const roadmapRepository = new RoadmapRepository();
