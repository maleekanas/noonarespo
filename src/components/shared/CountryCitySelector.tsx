"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  COUNTRIES_AND_CITIES,
  CountryItem,
  CityItem,
  findCountryByName,
  getCountryByCode,
} from "@/lib/data/countriesAndCities";
import { ChevronDown, Search, MapPin, Globe, Check, X } from "lucide-react";

interface CountryCitySelectorProps {
  nameCountry?: string;
  nameCity?: string;
  defaultCountry?: string;
  defaultCity?: string;
  required?: boolean;
  locale?: string;
  countryLabel?: string;
  cityLabel?: string;
  countryPlaceholder?: string;
  cityPlaceholder?: string;
  className?: string;
  layout?: "grid" | "stack";
  onCountryChange?: (country: CountryItem | null) => void;
  onCityChange?: (city: string) => void;
}

export function CountryCitySelector({
  nameCountry = "country",
  nameCity = "city",
  defaultCountry = "",
  defaultCity = "",
  required = false,
  locale = "ar",
  countryLabel,
  cityLabel,
  countryPlaceholder,
  cityPlaceholder,
  className = "",
  layout = "grid",
  onCountryChange,
  onCityChange,
}: CountryCitySelectorProps) {
  const isAr = locale === "ar";

  // Initial country resolution
  const initialCountry = useMemo(() => {
    if (!defaultCountry) return null;
    return (
      getCountryByCode(defaultCountry) ||
      findCountryByName(defaultCountry) ||
      null
    );
  }, [defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(
    initialCountry
  );
  const [selectedCity, setSelectedCity] = useState<string>(defaultCity || "");

  // Country dropdown state
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES_AND_CITIES;
    return COUNTRIES_AND_CITIES.filter((c) => {
      return (
        c.nameEn.toLowerCase().includes(q) ||
        c.nameAr.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phoneCode.includes(q)
      );
    });
  }, [countrySearch]);

  // Cities for the selected country
  const availableCities = useMemo<CityItem[]>(() => {
    if (!selectedCountry) return [];
    return selectedCountry.cities;
  }, [selectedCountry]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (country: CountryItem) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
    setCountrySearch("");
    // If current city is not in the new country's cities, clear or reset city
    const match = country.cities.find(
      (c) =>
        c.nameEn.toLowerCase() === selectedCity.toLowerCase() ||
        c.nameAr.toLowerCase() === selectedCity.toLowerCase()
    );
    if (!match && country.cities.length > 0) {
      // Pick the primary city of the newly selected country as convenient default
      const defaultCityName = isAr ? country.cities[0].nameAr : country.cities[0].nameEn;
      setSelectedCity(defaultCityName);
      onCityChange?.(defaultCityName);
    }
    onCountryChange?.(country);
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    onCityChange?.(cityName);
  };

  const labels = {
    country: countryLabel || (isAr ? "الدولة" : "Country"),
    city: cityLabel || (isAr ? "المدينة" : "City"),
    countryPlaceholder:
      countryPlaceholder || (isAr ? "اختر أو ابحث عن دولتك..." : "Select or search your country..."),
    cityPlaceholder:
      cityPlaceholder ||
      (isAr
        ? selectedCountry
          ? "اختر المدينة أو اكتبها..."
          : "اختر الدولة أولاً..."
        : selectedCountry
        ? "Select or type your city..."
        : "Select country first..."),
    searchPlaceholder: isAr ? "ابحث بالاسم أو الرمز..." : "Search by name or code...",
    noCountriesFound: isAr ? "لم يتم العثور على دول مطابقة" : "No matching countries found",
  };

  // Values passed in form data (we store English country name by default for standardized B2B/B2C backend storage, while displaying localized label)
  const countryFormValue = selectedCountry ? selectedCountry.nameEn : "";

  return (
    <div
      className={`${
        layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"
      } ${className}`}
    >
      {/* Hidden inputs to guarantee standard form submission */}
      <input
        type="hidden"
        name={nameCountry}
        value={countryFormValue}
        required={required}
      />
      <input
        type="hidden"
        name={nameCity}
        value={selectedCity}
        required={required}
      />

      {/* Country Combobox */}
      <div className="relative" ref={countryDropdownRef}>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {labels.country} {required && <span className="text-rose-500">*</span>}
        </label>

        <button
          type="button"
          onClick={() => setIsCountryOpen(!isCountryOpen)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-start flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            isCountryOpen
              ? "border-brand-500 ring-2 ring-brand-500/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
          aria-haspopup="listbox"
          aria-expanded={isCountryOpen}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedCountry ? (
              <>
                <span className="text-lg leading-none">{selectedCountry.flag}</span>
                <span className="font-bold text-slate-900">
                  {isAr ? selectedCountry.nameAr : selectedCountry.nameEn}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ({isAr ? selectedCountry.nameEn : selectedCountry.nameAr})
                </span>
              </>
            ) : (
              <span className="text-slate-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>{labels.countryPlaceholder}</span>
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
              isCountryOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Panel */}
        {isCountryOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 py-2 text-xs max-h-72 flex flex-col">
            {/* Search filter input */}
            <div className="px-3 pb-2 border-b border-slate-100">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 pointer-events-none" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="w-full ps-8 pe-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  autoFocus
                />
                {countrySearch && (
                  <button
                    type="button"
                    onClick={() => setCountrySearch("")}
                    className="absolute end-2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Country list items */}
            <div className="overflow-y-auto flex-1 py-1 divide-y divide-slate-50">
              {filteredCountries.length === 0 ? (
                <div className="px-4 py-3 text-center text-slate-400 italic">
                  {labels.noCountriesFound}
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = selectedCountry?.code === country.code;
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelectCountry(country)}
                      className={`w-full px-3.5 py-2 text-start flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-brand-50/60 font-bold text-brand-900" : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base leading-none">{country.flag}</span>
                        <span className="font-semibold truncate">
                          {isAr ? country.nameAr : country.nameEn}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {isAr ? country.nameEn : country.nameAr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {country.phoneCode}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* City Combobox with Datalist Suggestions */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {labels.city} {required && <span className="text-rose-500">*</span>}
        </label>

        <div className="relative">
          <input
            type="text"
            list={`cities-list-${nameCountry}`}
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder={labels.cityPlaceholder}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-start bg-white"
            disabled={!selectedCountry}
          />
          <datalist id={`cities-list-${nameCountry}`}>
            {availableCities.map((city, idx) => (
              <option
                key={idx}
                value={isAr ? city.nameAr : city.nameEn}
                label={`${city.nameAr} / ${city.nameEn}`}
              />
            ))}
          </datalist>

          <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
        </div>

        {/* Quick city suggestions pills for selected country */}
        {selectedCountry && availableCities.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span className="text-[10px] text-slate-400">
              {isAr ? "مدن مقترحة:" : "Suggested:"}
            </span>
            {availableCities.slice(0, 5).map((city, i) => {
              const cityName = isAr ? city.nameAr : city.nameEn;
              const isCityActive = selectedCity.toLowerCase() === cityName.toLowerCase();
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCityChange(cityName)}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                    isCityActive
                      ? "bg-brand-50 border-brand-300 text-brand-800 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cityName}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
