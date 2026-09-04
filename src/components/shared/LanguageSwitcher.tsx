"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";
import { languages, locales, type Locale } from "@/lib/localization";

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLocale = (locales.includes(currentLocale as Locale) ? currentLocale : "en") as Locale;
  const activeMeta = languages[activeLocale] || languages.en;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectLocale(targetLocale: Locale) {
    // Persist choice in cookie for future visits
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }
    setIsOpen(false);
  }

  function getLocalizedPath(targetLocale: Locale): string {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      segments[0] = targetLocale;
      return `/${segments.join("/")}`;
    }
    return `/${targetLocale}${pathname}`;
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-3.5 h-3.5 text-brand-600" />
        <span className="text-sm">{activeMeta.flag}</span>
        <span className="font-medium">{activeMeta.nativeName}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-52 rounded-xl shadow-xl bg-white ring-1 ring-black/5 divide-y divide-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1">
            {locales.map((loc) => {
              const meta = languages[loc];
              const isSelected = loc === activeLocale;
              return (
                <Link
                  key={loc}
                  href={getLocalizedPath(loc)}
                  onClick={() => handleSelectLocale(loc)}
                  className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg transition-colors ${
                    isSelected
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{meta.flag}</span>
                    <span>{meta.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({meta.name})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
