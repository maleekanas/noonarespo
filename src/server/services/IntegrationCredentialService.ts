import { prisma } from "@/lib/database/prisma";

/**
 * The 6 Integration hub's actual live credentials -- one entry per
 * process.env value that a real integration (Stripe, Pusher, WhatsApp/SMS/
 * Email dispatch, the AI engine) reads at request time. This list is the
 * honest inventory of "what this platform actually depends on to work",
 * used both to render the rotation log below and to compute isConfigured
 * per row from the live environment.
 */
export interface CredentialProviderDefinition {
  provider: string;
  labelAr: string;
  labelEn: string;
  envVar: string;
}

export const CREDENTIAL_PROVIDERS: CredentialProviderDefinition[] = [
  { provider: "STRIPE_SECRET_KEY", labelAr: "مفتاح Stripe السري", labelEn: "Stripe Secret Key", envVar: "STRIPE_SECRET_KEY" },
  { provider: "STRIPE_WEBHOOK_SECRET", labelAr: "سر بوابة Stripe Webhook", labelEn: "Stripe Webhook Secret", envVar: "STRIPE_WEBHOOK_SECRET" },
  { provider: "PUSHER_APP_KEY", labelAr: "مفتاح تطبيق Pusher", labelEn: "Pusher App Key", envVar: "PUSHER_APP_ID" },
  { provider: "WHATSAPP_TOKEN", labelAr: "رمز واتساب السحابي", labelEn: "WhatsApp Cloud API Token", envVar: "WHATSAPP_API_TOKEN" },
  { provider: "SMS_TOKEN", labelAr: "رمز مزود الرسائل النصية", labelEn: "SMS Provider Token", envVar: "SMS_API_TOKEN" },
  { provider: "EMAIL_API_KEY", labelAr: "مفتاح Resend للبريد الإلكتروني", labelEn: "Resend Email API Key", envVar: "RESEND_API_KEY" },
  { provider: "AI_API_KEY", labelAr: "مفتاح محرك الذكاء الاصطناعي", labelEn: "AI Engine API Key", envVar: "GEMINI_API_KEY" },
];

export interface CredentialRecordView {
  provider: string;
  labelAr: string;
  labelEn: string;
  envVar: string;
  isConfigured: boolean;
  lastRotatedAt: string | null;
  lastRotatedBy: string | null;
  notes: string;
}

/**
 * Credential ROTATION record-keeping, deliberately scoped away from ever
 * touching the live credential value itself (see the schema comment on
 * IntegrationCredentialRecord). Before this existed, "when did we last
 * rotate the Stripe key" had no real answer anywhere in the platform --
 * this gives super admins one, without pretending this UI can change what
 * Vercel actually injects into process.env at runtime.
 */
class IntegrationCredentialService {
  private usingFallback = false;

  isUsingFallback(): boolean {
    return this.usingFallback;
  }

  async listCredentialRecords(): Promise<CredentialRecordView[]> {
    let rows: Array<{ provider: string; lastRotatedAt: Date | null; lastRotatedBy: string | null; notes: string }> = [];
    try {
      rows = await prisma.integrationCredentialRecord.findMany();
      this.usingFallback = false;
    } catch {
      this.usingFallback = true;
    }

    const byProvider = new Map(rows.map((r) => [r.provider, r]));

    return CREDENTIAL_PROVIDERS.map((def) => {
      const row = byProvider.get(def.provider);
      return {
        provider: def.provider,
        labelAr: def.labelAr,
        labelEn: def.labelEn,
        envVar: def.envVar,
        isConfigured: Boolean(
          process.env[def.envVar] ||
          (def.provider === "WHATSAPP_TOKEN" && (process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN)) ||
          (def.provider === "SMS_TOKEN" && (process.env.SMS_API_KEY || process.env.SMS_API_TOKEN || process.env.TWILIO_AUTH_TOKEN)) ||
          (def.provider === "AI_API_KEY" && (process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY))
        ),
        lastRotatedAt: row?.lastRotatedAt ? row.lastRotatedAt.toISOString() : null,
        lastRotatedBy: row?.lastRotatedBy ?? null,
        notes: row?.notes ?? "",
      };
    });
  }

  async markRotated(provider: string, actorEmail: string, notes?: string): Promise<void> {
    const def = CREDENTIAL_PROVIDERS.find((p) => p.provider === provider);
    if (!def) throw new Error(`Unknown credential provider: ${provider}`);

    await prisma.integrationCredentialRecord.upsert({
      where: { provider },
      create: {
        provider,
        label: def.labelEn,
        lastRotatedAt: new Date(),
        lastRotatedBy: actorEmail,
        notes: notes || "",
      },
      update: {
        lastRotatedAt: new Date(),
        lastRotatedBy: actorEmail,
        notes: notes || "",
      },
    });
  }
}

export const integrationCredentialService = new IntegrationCredentialService();
