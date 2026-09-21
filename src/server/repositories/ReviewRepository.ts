import { prisma } from "@/lib/database/prisma";

export type ReviewStatus = "APPROVED" | "PENDING" | "FLAGGED";

export interface ParentReview {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  rating: number; // 1 to 5 stars
  titleAr: string;
  commentAr: string;
  status: ReviewStatus;
  adminReplyAr?: string;
  createdAt: Date;
}

const IN_MEMORY_REVIEWS: ParentReview[] = [
  {
    id: "rev-1",
    parentId: "parent-1",
    parentName: "Maryam Al-Mansoor",
    teacherId: "teacher-1",
    teacherName: "Ustadh Ahmad",
    rating: 5,
    titleAr: "تجربة ممتازة وتطور ملحوظ في تلاوة القرآن",
    commentAr: "المعلم صبور جداً وأسلوبه محبب للأطفال. ابنتي تنتظر الحصة بشغف.",
    status: "APPROVED",
    adminReplyAr: "شكراً لثقتكم الغالية بالأكاديمية",
    createdAt: new Date(),
  },
  {
    id: "rev-2",
    parentId: "parent-2",
    parentName: "Zaid Al-Harbi",
    teacherId: "teacher-1",
    teacherName: "Ustadh Ahmad",
    rating: 5,
    titleAr: "مستوى أكاديمي راقٍ ومتابعة مستمرة",
    commentAr: "أسلوب تعليمي متقن ومحفز للأطفال على القراءة الصحيحة.",
    status: "APPROVED",
    adminReplyAr: "بارك الله فيكم وفي جهودكم",
    createdAt: new Date(),
  },
];

class ReviewRepository {
  async getAllReviews(): Promise<ParentReview[]> {
    try {
      const rows = await prisma.parentReview.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map((row) => this.toReview(row));
    } catch {
      return [...IN_MEMORY_REVIEWS];
    }
  }

  async getApprovedReviewsByTeacherId(teacherId: string): Promise<ParentReview[]> {
    try {
      const rows = await prisma.parentReview.findMany({
        where: { teacherId, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((row) => this.toReview(row));
    } catch {
      return IN_MEMORY_REVIEWS.filter(
        (r) => r.teacherId === teacherId && r.status === "APPROVED"
      );
    }
  }

  async getReviewsByParentId(parentId: string): Promise<ParentReview[]> {
    try {
      const rows = await prisma.parentReview.findMany({
        where: { parentId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((row) => this.toReview(row));
    } catch {
      return IN_MEMORY_REVIEWS.filter((r) => r.parentId === parentId);
    }
  }

  async createReview(review: Omit<ParentReview, "id" | "createdAt" | "status">): Promise<ParentReview> {
    try {
      const row = await prisma.parentReview.create({
        data: {
          parentId: review.parentId,
          parentName: review.parentName,
          teacherId: review.teacherId,
          teacherName: review.teacherName,
          rating: review.rating,
          titleAr: review.titleAr,
          commentAr: review.commentAr,
          status: "APPROVED",
          adminReplyAr: review.adminReplyAr,
        },
      });
      return this.toReview(row);
    } catch {
      const created: ParentReview = {
        id: `rev-${Date.now()}`,
        ...review,
        status: "APPROVED",
        createdAt: new Date(),
      };
      IN_MEMORY_REVIEWS.unshift(created);
      return created;
    }
  }

  async updateReviewStatus(id: string, status: ReviewStatus, adminReply?: string): Promise<ParentReview | null> {
    try {
      const existing = await prisma.parentReview.findUnique({ where: { id } });
      if (!existing) return null;

      const row = await prisma.parentReview.update({
        where: { id },
        data: {
          status,
          ...(adminReply !== undefined ? { adminReplyAr: adminReply } : {}),
        },
      });
      return this.toReview(row);
    } catch {
      const existing = IN_MEMORY_REVIEWS.find((r) => r.id === id);
      if (!existing) return null;
      existing.status = status;
      if (adminReply !== undefined) {
        existing.adminReplyAr = adminReply;
      }
      return existing;
    }
  }

  private toReview(row: {
    id: string;
    parentId: string;
    parentName: string;
    teacherId: string;
    teacherName: string;
    rating: number;
    titleAr: string;
    commentAr: string;
    status: string;
    adminReplyAr: string | null;
    createdAt: Date;
  }): ParentReview {
    return {
      id: row.id,
      parentId: row.parentId,
      parentName: row.parentName,
      teacherId: row.teacherId,
      teacherName: row.teacherName,
      rating: row.rating,
      titleAr: row.titleAr,
      commentAr: row.commentAr,
      status: row.status as ReviewStatus,
      adminReplyAr: row.adminReplyAr ?? undefined,
      createdAt: row.createdAt,
    };
  }
}

export const reviewRepository = new ReviewRepository();
