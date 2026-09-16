import React from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/localization";
import { ShieldCheck, Heart, GraduationCap, ArrowUpRight } from "lucide-react";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);

  // Every item in this column used to be plain, unlinked <li> text -- it
  // looked like a nav list but nothing was clickable. These now route to the
  // real program catalog page, deep-linked to the matching program via the
  // same ?program= param the /programs page already reads (see
  // ProgramsCatalogPage), and the list now covers all 7 programs instead of
  // silently dropping Writing & Penmanship and Listening & Comprehension.
  const programLinks = [
    { id: "prog-foundations", label: dict.programs.foundations },
    { id: "prog-reading", label: dict.programs.reading },
    { id: "prog-writing", label: dict.programs.writing },
    { id: "prog-speaking", label: dict.programs.speaking },
    { id: "prog-listening", label: dict.programs.listening },
    { id: "prog-quran", label: dict.programs.quran },
    { id: "prog-islamic", label: dict.programs.islamicStudies },
  ];

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">
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

          {/* Programs */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {dict.nav.programs}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {programLinks.map((program) => (
                <li key={program.id}>
                  <Link
                    href={`/${locale}/programs?program=${program.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {program.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Institutions */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {dict.footer.institutionsHeading}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href={`/${locale}/schools`} className="hover:text-white transition-colors">
                  {dict.footer.institutionsOverview}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/schools#apply`}
                  className="inline-flex items-center gap-1 font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <span>{dict.footer.institutionsApply}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Child Safety */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {dict.footer.securitySection}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
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
