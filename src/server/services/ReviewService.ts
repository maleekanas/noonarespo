import { reviewRepository, ParentReview, ReviewStatus } from "@/server/repositories/ReviewRepository";

export interface TeacherRatingSummary {
  teacherId: string;
  averageRating: number;
  totalReviewsCount: number;
  ratingDistribution: Record<number, number>; // 5-star, 4-star, etc.
  reviews: ParentReview[];
}

export class ReviewService {
  async getTeacherReviewSummary(teacherId: string): Promise<TeacherRatingSummary> {
    const reviews = await reviewRepository.getApprovedReviewsByTeacherId(teacherId);
    const totalReviewsCount = reviews.length;

    if (totalReviewsCount === 0) {
      return {
        teacherId,
        averageRating: 5.0,
        totalReviewsCount: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: [],
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = parseFloat((sum / totalReviewsCount).toFixed(1));

    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    return {
      teacherId,
      averageRating,
      totalReviewsCount,
      ratingDistribution,
      reviews,
    };
  }

  async getAllReviewsForAdmin(): Promise<ParentReview[]> {
    return reviewRepository.getAllReviews();
  }

  async submitParentReview(params: {
    parentId: string;
    parentName: string;
    teacherId: string;
    teacherName: string;
    rating: number;
    titleAr: string;
    commentAr: string;
  }): Promise<ParentReview> {
    // Validate rating boundaries
    const safeRating = Math.max(1, Math.min(5, Math.round(params.rating)));

    return reviewRepository.createReview({
      ...params,
      rating: safeRating,
    });
  }

  async moderateReview(
    reviewId: string,
    status: ReviewStatus,
    adminReplyAr?: string
  ): Promise<ParentReview | null> {
    return reviewRepository.updateReviewStatus(reviewId, status, adminReplyAr);
  }

  async replyToReview(
    reviewId: string,
    adminReplyAr: string
  ): Promise<ParentReview | null> {
    const existing = await reviewRepository.getAllReviews();
    const target = existing.find((r) => r.id === reviewId);
    const status = target ? target.status : "APPROVED";
    return reviewRepository.updateReviewStatus(reviewId, status, adminReplyAr);
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    return reviewRepository.deleteReview(reviewId);
  }
}

export const reviewService = new ReviewService();

