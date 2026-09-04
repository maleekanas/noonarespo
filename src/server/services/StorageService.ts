import {
  defaultStorageProvider,
  SignedDownloadUrl,
  SignedUploadTicket,
  StorageProvider,
} from "@/lib/integrations/storage/StorageProvider";

export class StorageService {
  constructor(private provider: StorageProvider = defaultStorageProvider) {}

  isStorageConfigured(): boolean {
    return this.provider.isConfigured();
  }

  async createStudentAudioUploadTicket(params: {
    studentId: string;
    assignmentId: string;
    fileExtension?: string;
  }): Promise<SignedUploadTicket> {
    return this.provider.generateUploadSignedUrl({
      studentId: params.studentId,
      assignmentId: params.assignmentId,
      fileExtension: params.fileExtension || "mp3",
      maxSizeBytes: 20 * 1024 * 1024, // 20 MB max for audio
      contentType: "audio/mpeg",
    });
  }

  async getSecurePlaybackUrl(
    objectKey: string,
    expiresInSeconds = 900 // 15 minutes TTL for COPPA / GDPR child privacy compliance
  ): Promise<SignedDownloadUrl> {
    return this.provider.generateDownloadSignedUrl(objectKey, expiresInSeconds);
  }

  getStorageStatus(): {
    providerName: string;
    isConfigured: boolean;
    badgeText: string;
    securityPolicy: string;
  } {
    const configured = this.provider.isConfigured();
    return {
      providerName: "Amazon S3 Private Bucket (me-central-1)",
      isConfigured: configured,
      badgeText: configured
        ? "سحابة تخزين خاصة نشطة (Live S3 Private)"
        : "محاكي التخزين السحابي الآمن (Dev Sandbox Signed URLs)",
      securityPolicy: "روابط مشفرة محددة الصلاحية (15-Minute TTL) لحماية خصوصية تسجيلات الأطفال",
    };
  }
}

export const storageService = new StorageService();
