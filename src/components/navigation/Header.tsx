"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { getDictionary } from "@/lib/localization";
import { Sparkles, GraduationCap, Menu, X, School } from "lucide-react";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const forParentsLabels: Record<string, string> = {
    ar: "لأولياء الأمور",
    en: "For Parents",
    nl: "Voor Ouders",
    tr: "Veliler İçin",
    it: "Per i Genitori",
    es: "Para Padres",
  };

  const navLinks = [
    { href: `/${locale}/programs`, label: dict.nav.programs },
    { href: `/${locale}/how-it-works`, label: dict.nav.howItWorks || (locale === "ar" ? "كيف نعمل" : "How It Works") },
    { href: `/${locale}/pricing`, label: dict.nav.pricing },
    { href: `/${locale}/schools`, label: dict.nav.schools },
    { href: `/${locale}/for-parents`, label: forParentsLabels[locale] || "For Parents" },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 group"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
              Arabic Kids Academy
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1">
              Inspiring Arabic language and Quran learning for children worldwide
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Active State */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition-all relative py-1 ${
                  active
                    ? "font-bold text-brand-600 after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600 after:rounded-full"
                    : "font-medium text-slate-600 hover:text-brand-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Language Switcher + Sign In) */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white gradient-brand hover:opacity-95 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{dict.common.login}</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {isMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden border-t border-slate-200/80 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-600 font-bold"
                      : "font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {link.href.includes("/schools") && <School className="w-4 h-4 text-brand-500" />}
                    <span>{link.label}</span>
                  </div>
                  {active && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                </Link>
              );
            })}
            <div className="pt-3 mt-2 border-t border-slate-100 sm:hidden">
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
