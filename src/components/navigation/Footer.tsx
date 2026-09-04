import React from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/localization";
import { ShieldCheck, Heart, GraduationCap } from "lucide-react";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl text-white">
                {dict.common.siteName}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {dict.common.siteTagline}. {dict.footer.platformDescription}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{dict.footer.safetyBadge}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {dict.nav.programs}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>{dict.programs.foundations}</li>
              <li>{dict.programs.reading}</li>
              <li>{dict.programs.quran}</li>
              <li>{dict.programs.speaking}</li>
              <li>{dict.programs.islamicStudies}</li>
            </ul>
          </div>

          {/* Legal & Child Safety */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {dict.footer.securitySection}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  {dict.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  {dict.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/login`} className="hover:text-white transition-colors">
                  {dict.common.login}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{dict.footer.copyright}</p>
          <p className="flex items-center gap-1">
            {dict.footer.madeWithLovePrefix} <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {dict.footer.madeWithLove}
          </p>
        </div>
      </div>
    </footer>
  );
}
