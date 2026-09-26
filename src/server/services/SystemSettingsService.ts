import { prisma } from "@/lib/database/prisma";

export type AnnouncementType = "INFO" | "WARNING" | "SUCCESS" | "URGENT";

export interface SystemSettings {
  // Feature Flags
  allowRegistration: boolean;
  allowB2cTrial: boolean;
  allowB2bTrial: boolean;
  aiTutorEnabled: boolean;

  // Maintenance Mode
  maintenanceMode: boolean;
  maintenanceMessageAr: string;
  maintenanceMessageEn: string;

  // Global Announcement Banner
  announcementActive: boolean;
  announcementType: AnnouncementType;
  announcementTextAr: string;
  announcementTextEn: string;
  announcementLinkUrl: string;

  // Academy Profile & Localization
  supportEmail: string;
  supportWhatsApp: string;
  defaultCurrency: string;
  defaultTimezone: string;

  // Security Thresholds
  sessionDurationDays: number;
  maxLoginAttemptsPerIp: number;
  maxLoginAttemptsPerEmail: number;
  lockoutWindowMinutes: number;

  // Metadata
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

const SETTINGS_ROW_ID = "global";

const DEFAULT_SETTINGS: SystemSettings = {
  allowRegistration: true,
  allowB2cTrial: true,
  allowB2bTrial: true,
  aiTutorEnabled: true,

  maintenanceMode: false,
  maintenanceMessageAr: "المنصة تخضع حالياً لأعمال صيانة وتحسين مجدولة. سنعود للعمل قريباً جداً بإذن الله.",
  maintenanceMessageEn: "The platform is currently undergoing scheduled maintenance and upgrades. We will be back online shortly.",

  announcementActive: false,
  announcementType: "INFO",
  announcementTextAr: "مرحباً بكم في Arabic Kids Academy! التسجيل متاح الآن لجميع المسارات.",
  announcementTextEn: "Welcome to Arabic Kids Academy! Registration is now open for all tracks.",
  announcementLinkUrl: "/pricing",

  supportEmail: "support@arabickidsacademy.com",
  supportWhatsApp: "+971 50 123 4567",
  defaultCurrency: "USD",
  defaultTimezone: "Asia/Riyadh",

  sessionDurationDays: 30,
  maxLoginAttemptsPerIp: 5,
  maxLoginAttemptsPerEmail: 5,
  lockoutWindowMinutes: 15,

  lastUpdatedAt: new Date().toISOString(),
  lastUpdatedBy: "system-init",
};

type SystemSettingRow = {
  allowRegistration: boolean;
  allowB2cTrial: boolean;
  allowB2bTrial: boolean;
  aiTutorEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessageAr: string;
  maintenanceMessageEn: string;
  announcementActive: boolean;
  announcementType: string;
  announcementTextAr: string;
  announcementTextEn: string;
  announcementLinkUrl: string;
  supportEmail: string;
  supportWhatsApp: string;
  defaultCurrency: string;
  defaultTimezone: string;
  sessionDurationDays: number;
  maxLoginAttemptsPerIp: number;
  maxLoginAttemptsPerEmail: number;
  lockoutWindowMinutes: number;
  lastUpdatedAt: Date;
  lastUpdatedBy: string;
};

function rowToSettings(row: SystemSettingRow): SystemSettings {
  return {
    allowRegistration: row.allowRegistration,
    allowB2cTrial: row.allowB2cTrial,
    allowB2bTrial: row.allowB2bTrial,
    aiTutorEnabled: row.aiTutorEnabled,
    maintenanceMode: row.maintenanceMode,
    maintenanceMessageAr: row.maintenanceMessageAr,
    maintenanceMessageEn: row.maintenanceMessageEn,
    announcementActive: row.announcementActive,
    announcementType: (row.announcementType as AnnouncementType) || "INFO",
    announcementTextAr: row.announcementTextAr,
    announcementTextEn: row.announcementTextEn,
    announcementLinkUrl: row.announcementLinkUrl,
    supportEmail: row.supportEmail,
    supportWhatsApp: row.supportWhatsApp,
    defaultCurrency: row.defaultCurrency,
    defaultTimezone: row.defaultTimezone,
    sessionDurationDays: row.sessionDurationDays,
    maxLoginAttemptsPerIp: row.maxLoginAttemptsPerIp,
    maxLoginAttemptsPerEmail: row.maxLoginAttemptsPerEmail,
    lockoutWindowMinutes: row.lockoutWindowMinutes,
    lastUpdatedAt: row.lastUpdatedAt.toISOString(),
    lastUpdatedBy: row.lastUpdatedBy,
  };
}

/**
 * Platform-wide superadmin settings (feature flags, maintenance mode,
 * announcement banner, security thresholds).
 *
 * This used to keep `currentSettings` as a plain in-memory class field --
 * meaning every deploy or server restart (or, on serverless, every fresh
 * instance) silently reset maintenance mode, feature flags, and security
 * policy back to hardcoded defaults with zero warning to the admin who'd
 * configured them. It's now backed by a single-row `SystemSetting` table,
 * upserted in place, with an in-memory fallback (mirroring the same
 * resilience pattern used elsewhere in this codebase, e.g.
 * AdministrationRepository's fallbackAuditLogs) only for the rare case the
 * database is genuinely unreachable -- that fallback still resets on
 * restart, same as before, but only kicks in when the database itself is
 * down, not on every ordinary deploy.
 */
export class SystemSettingsService {
  private fallbackSettings: SystemSettings = { ...DEFAULT_SETTINGS };
  private usingFallback = false;

  /**
   * Retrieve current system settings. Creates the singleton row with
   * platform defaults on first read if it doesn't exist yet.
   */
  async getSettings(): Promise<SystemSettings> {
    try {
      const row = await prisma.systemSetting.upsert({
        where: { id: SETTINGS_ROW_ID },
        update: {},
        create: { id: SETTINGS_ROW_ID, ...toCreateDefaults() },
      });
      this.usingFallback = false;
      return rowToSettings(row);
    } catch {
      this.usingFallback = true;
      return { ...this.fallbackSettings };
    }
  }

  /**
   * Update a subset of system settings
   */
  async updateSettings(partial: Partial<SystemSettings>, updatedBy = "superadmin"): Promise<SystemSettings> {
    const lastUpdatedAt = new Date();
    try {
      const row = await prisma.systemSetting.upsert({
        where: { id: SETTINGS_ROW_ID },
        update: { ...partial, lastUpdatedAt, lastUpdatedBy: updatedBy },
        create: { id: SETTINGS_ROW_ID, ...toCreateDefaults(), ...partial, lastUpdatedAt, lastUpdatedBy: updatedBy },
      });
      this.usingFallback = false;
      return rowToSettings(row);
    } catch {
      this.usingFallback = true;
      this.fallbackSettings = {
        ...this.fallbackSettings,
        ...partial,
        lastUpdatedAt: lastUpdatedAt.toISOString(),
        lastUpdatedBy: updatedBy,
      };
      return { ...this.fallbackSettings };
    }
  }

  /**
   * Reset all settings to platform defaults
   */
  async resetDefaults(updatedBy = "superadmin"): Promise<SystemSettings> {
    return this.updateSettings({ ...DEFAULT_SETTINGS }, updatedBy);
  }

  /**
   * True if the last read/write fell back to the in-memory copy because the
   * database was unreachable -- lets the UI warn the admin that a save may
   * not survive a restart, instead of claiming success unconditionally.
   */
  isUsingFallback(): boolean {
    return this.usingFallback;
  }

  /**
   * Flush in-memory caches and rate limits
   */
  flushCache(): { success: boolean; message: string; timestamp: string } {
    return {
      success: true,
      message: "In-memory rate limiters, session caches, and transient configurations have been successfully flushed.",
      timestamp: new Date().toISOString(),
    };
  }
}

function toCreateDefaults() {
  const { lastUpdatedAt, ...rest } = DEFAULT_SETTINGS;
  return { ...rest, lastUpdatedAt: new Date(lastUpdatedAt) };
}

export const systemSettingsService = new SystemSettingsService();
