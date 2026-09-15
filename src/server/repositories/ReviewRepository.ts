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

class ReviewRepository {
  async getAllReviews(): Promise<ParentReview[]> {
    const rows = await prisma.parentReview.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => this.toReview(row));
  }

  async getApprovedReviewsByTeacherId(teacherId: string): Promise<ParentReview[]> {
    const rows = await prisma.parentReview.findMany({
      where: { teacherId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toReview(row));
  }

  async getReviewsByParentId(parentId: string): Promise<ParentReview[]> {
    const rows = await prisma.parentReview.findMany({
      where: { parentId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toReview(row));
  }

  async createReview(review: Omit<ParentReview, "id" | "createdAt" | "status">): Promise<ParentReview> {
    const row = await prisma.parentReview.create({
      data: {
        parentId: review.parentId,
        parentName: review.parentName,
        teacherId: review.teacherId,
        teacherName: review.teacherName,
        rating: review.rating,
        titleAr: review.titleAr,
        commentAr: review.commentAr,
        status: "APPROVED", // Auto-approved for verified enrolled parents, same as before
        adminReplyAr: review.adminReplyAr,
      },
    });
    return this.toReview(row);
  }

  async updateReviewStatus(id: string, status: ReviewStatus, adminReply?: string): Promise<ParentReview | null> {
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
