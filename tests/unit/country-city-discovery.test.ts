import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  COUNTRIES_AND_CITIES,
  getAllCountries,
  getCountryByCode,
  findCountryByName,
  searchCountries,
  getCitiesByCountryCode,
} from "@/lib/data/countriesAndCities";

describe("Country and City Discovery Architecture", () => {
  describe("Dataset Integrity & Coverage", () => {
    test("Countries dataset contains required international and regional coverage", () => {
      const countries = getAllCountries();
      assert.ok(countries.length >= 25, "Expected at least 25 countries configured");

      // Verify key regions are represented
      const codes = countries.map((c) => c.code);
      const expectedCodes = [
        "SA", "AE", "QA", "KW", "BH", "OM", "EG", "JO", "LB", "PS", "IQ", "MA", // Arab world
        "NL", "GB", "DE", "FR", "ES", "IT", "SE", "BE", "TR", // Europe
        "US", "CA", // North America
        "AU", "MY", // Asia & Oceania
      ];

      for (const expected of expectedCodes) {
        assert.ok(
          codes.includes(expected),
          `Expected country code ${expected} to be present in dataset`
        );
      }
    });

    test("Every country item has complete metadata and non-empty cities", () => {
      const countries = getAllCountries();
      for (const country of countries) {
        assert.ok(country.code && country.code.length === 2, `Invalid code for ${country.nameEn}`);
        assert.ok(country.nameEn && country.nameEn.trim().length > 0, `Missing nameEn for ${country.code}`);
        assert.ok(country.nameAr && country.nameAr.trim().length > 0, `Missing nameAr for ${country.code}`);
        assert.ok(country.flag && country.flag.trim().length > 0, `Missing flag for ${country.code}`);
        assert.ok(country.phoneCode && country.phoneCode.startsWith("+"), `Invalid phone code for ${country.code}`);
        assert.ok(Array.isArray(country.cities) && country.cities.length > 0, `No cities for ${country.code}`);

        // Verify city items
        for (const city of country.cities) {
          assert.ok(city.nameEn && city.nameEn.trim().length > 0, `City in ${country.code} missing nameEn`);
          assert.ok(city.nameAr && city.nameAr.trim().length > 0, `City in ${country.code} missing nameAr`);
        }
      }
    });
  });

  describe("Helper Functions & Discovery Lookups", () => {
    test("getCountryByCode finds country case-insensitively", () => {
      const saudiUpper = getCountryByCode("SA");
      const saudiLower = getCountryByCode("sa");
      const saudiSpaced = getCountryByCode("  Sa  ");

      assert.ok(saudiUpper);
      assert.strictEqual(saudiUpper?.nameEn, "Saudi Arabia");
      assert.strictEqual(saudiUpper?.nameAr, "المملكة العربية السعودية");
      assert.strictEqual(saudiLower?.code, "SA");
      assert.strictEqual(saudiSpaced?.code, "SA");
    });

    test("findCountryByName finds country by English name, Arabic name, or code", () => {
      const byEnglish = findCountryByName("Egypt");
      assert.ok(byEnglish);
      assert.strictEqual(byEnglish?.code, "EG");

      const byArabic = findCountryByName("مصر");
      assert.ok(byArabic);
      assert.strictEqual(byArabic?.code, "EG");

      const byCode = findCountryByName("EG");
      assert.ok(byCode);
      assert.strictEqual(byCode?.nameEn, "Egypt");

      const netherlandsAr = findCountryByName("هولندا");
      assert.ok(netherlandsAr);
      assert.strictEqual(netherlandsAr?.code, "NL");
    });

    test("searchCountries filters by partial text in English, Arabic, or ISO code", () => {
      const searchAr = searchCountries("مصر");
      assert.ok(searchAr.some((c) => c.code === "EG"));

      const searchEn = searchCountries("Nether");
      assert.ok(searchEn.some((c) => c.code === "NL"));

      const searchCode = searchCountries("US");
      assert.ok(searchCode.some((c) => c.code === "US"));

      const searchPhone = searchCountries("+966");
      assert.ok(searchPhone.some((c) => c.code === "SA"));
    });

    test("getCitiesByCountryCode returns localized city list for given country", () => {
      const egyptCities = getCitiesByCountryCode("EG");
      assert.ok(egyptCities.length >= 5);
      const cairo = egyptCities.find((c) => c.nameEn === "Cairo");
      assert.ok(cairo);
      assert.strictEqual(cairo?.nameAr, "القاهرة");

      const nlCities = getCitiesByCountryCode("NL");
      assert.ok(nlCities.length >= 5);
      const amsterdam = nlCities.find((c) => c.nameEn === "Amsterdam");
      assert.ok(amsterdam);
      assert.strictEqual(amsterdam?.nameAr, "أمستردام");

      // Non-existent country returns empty array
      const nonExistent = getCitiesByCountryCode("XYZ");
      assert.deepStrictEqual(nonExistent, []);
    });
  });
});
