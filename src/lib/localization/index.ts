import ar from "./dictionaries/ar.json";
import en from "./dictionaries/en.json";
import nl from "./dictionaries/nl.json";
import tr from "./dictionaries/tr.json";
import it from "./dictionaries/it.json";
import es from "./dictionaries/es.json";

export type Locale = "ar" | "en" | "nl" | "tr" | "it" | "es";
export const locales: Locale[] = ["ar", "en", "nl", "tr", "it", "es"];

/**
 * Primary Fallback Language:
 * In accordance with requirements, if a user's local language is not within the
 * Global 6-Language Architecture, the primary language defaults to (GB) English ("en").
 */
export const fallbackLocale: Locale = "en";
export const defaultLocale: Locale = "en";

export interface LanguageMeta {
  code: Locale;
  name: string;
  nativeName: string;
  direction: "rtl" | "ltr";
  flag: string;
}

export const languages: Record<Locale, LanguageMeta> = {
  ar: { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl", flag: "🇸🇦" },
  en: { code: "en", name: "English (GB)", nativeName: "English (GB)", direction: "ltr", flag: "🇬🇧" },
  nl: { code: "nl", name: "Dutch", nativeName: "Nederlands", direction: "ltr", flag: "🇳🇱" },
  tr: { code: "tr", name: "Turkish", nativeName: "Türkçe", direction: "ltr", flag: "🇹🇷" },
  it: { code: "it", name: "Italian", nativeName: "Italiano", direction: "ltr", flag: "🇮🇹" },
  es: { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr", flag: "🇪🇸" },
};

const dictionaries = {
  ar,
  en,
  nl,
  tr,
  it,
  es,
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function isRtlLocale(locale: string): boolean {
  return languages[locale as Locale]?.direction === "rtl" || locale === "ar";
}

/**
 * Parses an HTTP Accept-Language header string and finds the highest-priority
 * language that is supported within the Global 6-Language Architecture.
 *
 * Example: "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7" -> "nl"
 * Example: "fr-FR,fr;q=0.9,de;q=0.8" -> null (neither French nor German is in the 6 languages)
 */
export function matchAcceptLanguage(acceptLanguageHeader?: string | null): Locale | null {
  if (!acceptLanguageHeader || typeof acceptLanguageHeader !== "string") {
    return null;
  }

  // Parse entries with quality factor e.g. "en-GB;q=0.8"
  const candidates = acceptLanguageHeader
    .split(",")
    .map((entry) => {
      const parts = entry.trim().split(";");
      const lang = parts[0]?.trim().toLowerCase();
      let q = 1.0;
      if (parts[1]) {
        const qMatch = parts[1].match(/q=([\d.]+)/);
        if (qMatch && qMatch[1]) {
          q = parseFloat(qMatch[1]) || 0;
        }
      }
      return { lang, q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of candidates) {
    if (!lang) continue;
    // Extract 2-letter base ISO code (e.g., "nl-be" -> "nl", "ar-eg" -> "ar")
    const baseCode = lang.split("-")[0]?.toLowerCase();
    if (baseCode && isValidLocale(baseCode)) {
      return baseCode;
    }
  }

  return null;
}

/**
 * Resolves the primary language for a user:
 * 1. If explicit stored user preference or cookie exists in 6-language architecture -> use it.
 * 2. If user's local browser language is within the 6-Language Architecture -> that is their primary language.
 * 3. If the user's local language is NOT within the 6 languages (e.g. French, German, Japanese) -> defaults to (GB) English.
 */
export function resolveUserPrimaryLocale(options?: {
  acceptLanguage?: string | null;
  cookieLocale?: string | null;
  userLocale?: string | null;
}): Locale {
  // 1. Explicit user profile preference
  if (options?.userLocale && isValidLocale(options.userLocale)) {
    return options.userLocale;
  }

  // 2. Explicit cookie selection (saved preference from switcher)
  if (options?.cookieLocale && isValidLocale(options.cookieLocale)) {
    return options.cookieLocale;
  }

  // 3. User's local browser language from Accept-Language header
  if (options?.acceptLanguage) {
    const matched = matchAcceptLanguage(options.acceptLanguage);
    if (matched) {
      return matched;
    }
  }

  // 4. Default to (GB) English when user language is outside the 6 languages
  return fallbackLocale;
}

export function getDictionary(locale: string = defaultLocale) {
  if (isValidLocale(locale)) {
    return dictionaries[locale];
  }
  // Fallback to (GB) English dictionary
  return dictionaries.en;
}

export function isRTL(locale: string): boolean {
  return locale === "ar";
}

export function getDirection(locale: string): "rtl" | "ltr" {
  return isRTL(locale) ? "rtl" : "ltr";
}
