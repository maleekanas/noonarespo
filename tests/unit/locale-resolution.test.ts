import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  locales,
  defaultLocale,
  fallbackLocale,
  resolveUserPrimaryLocale,
  matchAcceptLanguage,
  getDictionary,
  isValidLocale,
  languages,
} from "../../src/lib/localization/index";

describe("Locale Detection & Resolution: 6-Language Architecture with (GB) English Fallback", () => {
  test("Configuration: fallbackLocale and defaultLocale must be (GB) English ('en')", () => {
    assert.strictEqual(fallbackLocale, "en");
    assert.strictEqual(defaultLocale, "en");
    assert.strictEqual(languages.en.flag, "🇬🇧");
    assert.strictEqual(languages.en.name, "English (GB)");
  });

  describe("Scenario 1: User's local language IS within the 6-Language Architecture", () => {
    test("Arabic user header ('ar-SA') should resolve to primary language 'ar'", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "ar-SA,ar;q=0.9" });
      assert.strictEqual(result, "ar");
    });

    test("Dutch user header ('nl-NL') should resolve to primary language 'nl'", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "nl-NL,nl;q=0.9,en;q=0.5" });
      assert.strictEqual(result, "nl");
    });

    test("Turkish user header ('tr-TR') should resolve to primary language 'tr'", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "tr-TR,tr;q=0.9" });
      assert.strictEqual(result, "tr");
    });

    test("Italian user header ('it-IT') should resolve to primary language 'it'", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "it-IT,it;q=0.9" });
      assert.strictEqual(result, "it");
    });

    test("Spanish user header ('es-ES') should resolve to primary language 'es'", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "es-ES,es;q=0.9" });
      assert.strictEqual(result, "es");
    });

    test("English user header ('en-GB') should resolve to primary language 'en'", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "en-GB,en;q=0.9" });
      assert.strictEqual(result, "en");
    });

    test("Multi-language preference should select the highest priority language within the 6 architecture", () => {
      // User has French (unsupported) with q=0.9, then Dutch (supported) with q=0.8
      const result = resolveUserPrimaryLocale({
        acceptLanguage: "fr-FR,fr;q=0.9,nl-NL;q=0.8,en;q=0.5",
      });
      assert.strictEqual(result, "nl");
    });
  });

  describe("Scenario 2: User's local language is NOT within the 6-Language Architecture", () => {
    test("French user ('fr-FR') should fall back to primary language (GB) English ('en')", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "fr-FR,fr;q=0.9" });
      assert.strictEqual(result, "en");
    });

    test("German user ('de-DE') should fall back to primary language (GB) English ('en')", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "de-DE,de;q=0.9" });
      assert.strictEqual(result, "en");
    });

    test("Russian user ('ru-RU') should fall back to primary language (GB) English ('en')", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "ru-RU,ru;q=0.9" });
      assert.strictEqual(result, "en");
    });

    test("Chinese user ('zh-CN') should fall back to primary language (GB) English ('en')", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "zh-CN,zh;q=0.9" });
      assert.strictEqual(result, "en");
    });

    test("Japanese user ('ja-JP') should fall back to primary language (GB) English ('en')", () => {
      const result = resolveUserPrimaryLocale({ acceptLanguage: "ja-JP,ja;q=0.9" });
      assert.strictEqual(result, "en");
    });

    test("Empty or missing Accept-Language header should fall back to (GB) English ('en')", () => {
      assert.strictEqual(resolveUserPrimaryLocale({ acceptLanguage: "" }), "en");
      assert.strictEqual(resolveUserPrimaryLocale({ acceptLanguage: null }), "en");
      assert.strictEqual(resolveUserPrimaryLocale(), "en");
    });
  });

  describe("Scenario 3: Cookie and User Profile Overrides", () => {
    test("Saved cookie preference in 6-language architecture overrides browser header", () => {
      const result = resolveUserPrimaryLocale({
        cookieLocale: "tr",
        acceptLanguage: "de-DE,de;q=0.9", // German browser, but user previously selected Turkish
      });
      assert.strictEqual(result, "tr");
    });

    test("Invalid cookie (not in 6 languages) is ignored and falls back to header match or (GB) English", () => {
      const result = resolveUserPrimaryLocale({
        cookieLocale: "fr", // Invalid cookie
        acceptLanguage: "nl-NL,nl;q=0.9",
      });
      assert.strictEqual(result, "nl");
    });

    test("Stored user account locale takes precedence over everything", () => {
      const result = resolveUserPrimaryLocale({
        userLocale: "ar",
        cookieLocale: "en",
        acceptLanguage: "nl-NL",
      });
      assert.strictEqual(result, "ar");
    });
  });

  describe("Scenario 4: Dictionary Fallback Integrity", () => {
    test("getDictionary() should return valid dictionary for any supported language", () => {
      locales.forEach((loc) => {
        const dict = getDictionary(loc);
        assert.ok(dict, `Dictionary missing for ${loc}`);
        assert.ok(dict.common.siteName.length > 0);
      });
    });

    test("getDictionary() with unknown locale should fall back to (GB) English dictionary", () => {
      const dict = getDictionary("fr");
      const enDict = getDictionary("en");
      assert.strictEqual(dict.common.siteName, enDict.common.siteName);
      assert.strictEqual(dict.common.login, "Sign In");
    });
  });
});
