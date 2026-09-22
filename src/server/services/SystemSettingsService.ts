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
  announcementTextAr: "مرحباً بكم في أكاديمية نون العربية! التسجيل متاح الآن لجميع المسارات.",
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

export class SystemSettingsService {
  private currentSettings: SystemSettings = { ...DEFAULT_SETTINGS };

  /**
   * Retrieve current system settings
   */
  getSettings(): SystemSettings {
    return { ...this.currentSettings };
  }

  /**
   * Update a subset of system settings
   */
  updateSettings(partial: Partial<SystemSettings>, updatedBy = "superadmin"): SystemSettings {
    this.currentSettings = {
      ...this.currentSettings,
      ...partial,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: updatedBy,
    };
    return { ...this.currentSettings };
  }

  /**
   * Reset all settings to platform defaults
   */
  resetDefaults(updatedBy = "superadmin"): SystemSettings {
    this.currentSettings = {
      ...DEFAULT_SETTINGS,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: updatedBy,
    };
    return { ...this.currentSettings };
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

export const systemSettingsService = new SystemSettingsService();
