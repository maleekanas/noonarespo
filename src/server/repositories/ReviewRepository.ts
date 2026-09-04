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

class InMemoryReviewRepository {
  private reviews: Map<string, ParentReview> = new Map();

  constructor() {
    this.seedReviews();
  }

  private seedReviews() {
    this.reviews.set("rev-1", {
      id: "rev-1",
      parentId: "parent-1", // Tariq Al-Mansoor
      parentName: "طارق المنصور",
      teacherId: "teacher-1", // Ustadh Ahmed
      teacherName: "أ. أحمد حسن",
      rating: 5,
      titleAr: "معلم استثنائي وصبر عظيم مع الأطفال",
      commentAr: "ما شاء الله، أستاذ أحمد بارع جداً في تحبيب ابني زيد في القراءة والطلاقة. أسلوبه مشجع ودائماً يمنح الأطفال الثقة لنطق الكلمات الصعبة. نوصي به بشدة!",
      status: "APPROVED",
      adminReplyAr: "شكراً لثقتكم الكريمة أبا زيد، نفخر بكادرنا التعليمي المتميز ونتمنى لزيد دوام التفوق!",
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
    });

    this.reviews.set("rev-2", {
      id: "rev-2",
      parentId: "parent-2", // Omar
      parentName: "عمر العمري",
      teacherId: "teacher-1",
      teacherName: "أ. أحمد حسن",
      rating: 5,
      titleAr: "تطور ملحوظ في أحكام التجويد خلال شهر واحد",
      commentAr: "ابني يوسف كان يتردد في مخارج الحروف، والآن يتقن القلقلة والإخفاء بكل طلاقة بفضل الله ثم أسلوب أستاذ أحمد.",
      status: "APPROVED",
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000),
    });
  }

  async getAllReviews(): Promise<ParentReview[]> {
    return Array.from(this.reviews.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getApprovedReviewsByTeacherId(teacherId: string): Promise<ParentReview[]> {
    return Array.from(this.reviews.values())
      .filter((r) => r.teacherId === teacherId && r.status === "APPROVED")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReviewsByParentId(parentId: string): Promise<ParentReview[]> {
    return Array.from(this.reviews.values())
      .filter((r) => r.parentId === parentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(review: Omit<ParentReview, "id" | "createdAt" | "status">): Promise<ParentReview> {
    const id = "rev-" + (this.reviews.size + 1);
    const full: ParentReview = {
      ...review,
      id,
      status: "APPROVED", // Auto-approved for verified enrolled parents in dev mock
      createdAt: new Date(),
    };
    this.reviews.set(id, full);
    return full;
  }

  async updateReviewStatus(id: string, status: ReviewStatus, adminReply?: string): Promise<ParentReview | null> {
    const review = this.reviews.get(id);
    if (!review) return null;
    review.status = status;
    if (adminReply !== undefined) {
      review.adminReplyAr = adminReply;
    }
    return review;
  }
}

export const reviewRepository = new InMemoryReviewRepository();
