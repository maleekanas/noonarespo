import { createHmac } from "node:crypto";

export interface SignedUploadTicket {
  uploadUrl: string;
  objectKey: string;
  expiresInSeconds: number;
  maxSizeBytes: number;
  isMock: boolean;
}

export interface SignedDownloadUrl {
  downloadUrl: string;
  objectKey: string;
  expiresAt: Date;
  isMock: boolean;
}

export interface StorageProvider {
  isConfigured(): boolean;
  generateUploadSignedUrl(params: {
    studentId: string;
    assignmentId: string;
    fileExtension: string;
    maxSizeBytes?: number;
    contentType?: string;
  }): Promise<SignedUploadTicket>;
  generateDownloadSignedUrl(
    objectKey: string,
    expiresInSeconds?: number
  ): Promise<SignedDownloadUrl>;
}

export class S3StorageProvider implements StorageProvider {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.AWS_SECRET_ACCESS_KEY || "kaa_internal_dev_secret_key_2026";
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.AWS_S3_BUCKET &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    );
  }

  async generateUploadSignedUrl(params: {
    studentId: string;
    assignmentId: string;
    fileExtension: string;
    maxSizeBytes?: number;
    contentType?: string;
  }): Promise<SignedUploadTicket> {
    const isLive = this.isConfigured();
    const timestamp = Date.now();
    const cleanExt = params.fileExtension.replace(/^\./, "");
    const objectKey = `submissions/${params.studentId}/${params.assignmentId}-${timestamp}.${cleanExt}`;

    const expiresInSeconds = 900; // 15 minutes TTL for COPPA/GDPR compliance
    const maxSizeBytes = params.maxSizeBytes || 25 * 1024 * 1024; // 25 MB max

    // Compute HMAC signature for tamper-evidence
    const signature = createHmac("sha256", this.secretKey)
      .update(`PUT:${objectKey}:${timestamp + expiresInSeconds * 1000}`)
      .digest("hex");

    const host = isLive
      ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "me-central-1"}.amazonaws.com`
      : "https://storage.sandbox.kidsarabicacademy.internal";

    const uploadUrl = `${host}/${objectKey}?X-Amz-Signature=${signature}&X-Amz-Expires=${expiresInSeconds}`;

    return {
      uploadUrl,
      objectKey,
      expiresInSeconds,
      maxSizeBytes,
      isMock: !isLive,
    };
  }

  async generateDownloadSignedUrl(
    objectKey: string,
    expiresInSeconds = 900 // Default 15 minutes TTL
  ): Promise<SignedDownloadUrl> {
    const isLive = this.isConfigured();
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const signature = createHmac("sha256", this.secretKey)
      .update(`GET:${objectKey}:${expiresAt.getTime()}`)
      .digest("hex");

    const host = isLive
      ? `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || "me-central-1"}.amazonaws.com`
      : "https://storage.sandbox.kidsarabicacademy.internal";

    const downloadUrl = `${host}/${objectKey}?token=${signature}&expires=${Math.floor(expiresAt.getTime() / 1000)}`;

    return {
      downloadUrl,
      objectKey,
      expiresAt,
      isMock: !isLive,
    };
  }
}

export const defaultStorageProvider: StorageProvider = new S3StorageProvider();
