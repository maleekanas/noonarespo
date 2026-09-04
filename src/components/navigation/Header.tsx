import React from "react";
import Link from "next/link";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { getDictionary } from "@/lib/localization";
import { Sparkles, GraduationCap } from "lucide-react";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const dict = getDictionary(locale);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
              {dict.common.siteName}
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1">
              {dict.common.siteTagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href={`/${locale}#programs`}
            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
          >
            {dict.nav.programs}
          </Link>
          <Link
            href={`/${locale}#age-groups`}
            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
          >
            {dict.nav.ageGroups}
          </Link>
          <Link
            href={`/${locale}#pricing`}
            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
          >
            {dict.nav.pricing}
          </Link>
        </nav>

        {/* Actions (Language Switcher + Sign In) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher currentLocale={locale} />

          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white gradient-brand hover:opacity-95 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{dict.common.login}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
