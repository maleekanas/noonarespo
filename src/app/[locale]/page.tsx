import React from "react";
import Link from "next/link";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";
import { InteractivePlacementCalculator } from "@/components/marketing/InteractivePlacementCalculator";
import { InteractivePhonemeSoundboard } from "@/components/marketing/InteractivePhonemeSoundboard";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
  PenTool,
  MessageCircle,
  Headphones,
  Moon,
  HeartHandshake,
  Users,
  ShieldCheck,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { HolisticLearningFramework } from "@/components/curriculum/HolisticLearningFramework";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const dict = getDictionary(locale);

  const programsList = [
    {
      id: "prog-foundations",
      title: dict.programs.foundations,
      desc: dict.programs.foundationsDesc,
      icon: BookOpen,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-600",
    },
    {
      id: "prog-reading",
      title: dict.programs.reading,
      desc: dict.programs.readingDesc,
      icon: Volume2,
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "prog-writing",
      title: dict.programs.writing,
      desc: dict.programs.writingDesc,
      icon: PenTool,
      color: "from-purple-500 to-violet-600",
      bgLight: "bg-purple-50 text-purple-600",
    },
    {
      id: "prog-speaking",
      title: dict.programs.speaking,
      desc: dict.programs.speakingDesc,
      icon: MessageCircle,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50 text-amber-600",
    },
    {
      id: "prog-listening",
      title: dict.programs.listening,
      desc: dict.programs.listeningDesc,
      icon: Headphones,
      color: "from-pink-500 to-rose-600",
      bgLight: "bg-pink-50 text-pink-600",
    },
    {
      id: "prog-quran",
      title: dict.programs.quran,
      desc: dict.programs.quranDesc,
      icon: Moon,
      color: "from-cyan-500 to-blue-600",
      bgLight: "bg-cyan-50 text-cyan-600",
    },
    {
      id: "prog-islamic",
      title: dict.programs.islamicStudies,
      desc: dict.programs.islamicStudiesDesc,
      icon: HeartHandshake,
      color: "from-teal-500 to-emerald-600",
      bgLight: "bg-teal-50 text-teal-600",
    },
  ];

  const validLocale = (["ar", "en", "nl", "tr", "it", "es"].includes(locale)
    ? locale
    : "en") as "ar" | "en" | "nl" | "tr" | "it" | "es";

  const AGE_BADGES = {
    sprouts: {
      ar: "البراعم الصغار",
      en: "Little Sprouts",
      nl: "Kleine Spruiten",
      tr: "Küçük Filizler",
      it: "Piccoli Germogli",
      es: "Pequeños Brotes",
    },
    explorers: {
      ar: "المستكشفون الصغار",
      en: "Junior Explorers",
      nl: "Jonge Verkenners",
      tr: "Genç Kâşifler",
      it: "Giovani Esploratori",
      es: "Jóvenes Exploradores",
    },
    navigators: {
      ar: "الرواد اليافعون",
      en: "Intermediate Navigators",
      nl: "Middelbare Navigators",
      tr: "Orta Düzey Öncüler",
      it: "Navigatori Intermedi",
      es: "Navegantes Intermedios",
    },
    scholars: {
      ar: "العلماء اليافعون",
      en: "Young Scholars",
      nl: "Jonge Geleerden",
      tr: "Genç Bilginler",
      it: "Giovani Studiosi",
      es: "Jóvenes Eruditos",
    },
  };

  const ageGroupsList = [
    {
      title: dict.ageGroups.sprouts,
      tagline: dict.ageGroups.sproutsTagline,
      description: dict.ageGroups.sproutsDesc,
      badge: AGE_BADGES.sprouts[validLocale],
    },
    {
      title: dict.ageGroups.explorers,
      tagline: dict.ageGroups.explorersTagline,
      description: dict.ageGroups.explorersDesc,
      badge: AGE_BADGES.explorers[validLocale],
    },
    {
      title: dict.ageGroups.navigators,
      tagline: dict.ageGroups.navigatorsTagline,
      description: dict.ageGroups.navigatorsDesc,
      badge: AGE_BADGES.navigators[validLocale],
    },
    {
      title: dict.ageGroups.scholars,
      tagline: dict.ageGroups.scholarsTagline,
      description: dict.ageGroups.scholarsDesc,
      badge: AGE_BADGES.scholars[validLocale],
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-brand-200/50 to-purple-200/40 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-200 shadow-sm text-xs sm:text-sm font-semibold text-brand-700">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{dict.hero.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            {dict.hero.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {dict.hero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={`/${locale}/register`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white gradient-brand rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all"
            >
              <span>{dict.hero.ctaPrimary}</span>
              <DirectionalIcon icon={ArrowRight} locale={locale} className="w-5 h-5" />
            </Link>

            <Link
              href={`/${locale}#programs`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl shadow-sm transition-all"
            >
              <span>{dict.hero.ctaSecondary}</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-12 border-t border-slate-200/80">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-600">
                {dict.hero.activeLearners}
              </span>
              <span className="text-xs text-slate-500 mt-1">{dict.hero.activeLearnersSub}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                {dict.hero.certifiedTeachers}
              </span>
              <span className="text-xs text-slate-500 mt-1">{dict.hero.certifiedTeachersSub}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                {dict.hero.parentRating}
              </span>
              <span className="text-xs text-slate-500 mt-1">{dict.hero.parentRatingSub}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
            {dict.programs.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {dict.programs.title}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {dict.programs.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programsList.map((prog, idx) => {
            const Icon = prog.icon;
            return (
              <Link
                key={idx}
                href={`/${locale}/programs?program=${prog.id}`}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${prog.bgLight} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                    {prog.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {prog.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                  <span>{dict.programs.accreditedCurriculum}</span>
                  <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Holistic Learning Framework: Bloom, BIDE & STEAM */}
      <HolisticLearningFramework locale={locale} isRtl={isRtl} />

      {/* Age Groups Section */}
      <section id="age-groups" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
            {dict.ageGroups.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {dict.ageGroups.title}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {dict.ageGroups.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ageGroupsList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-brand-300 transition-colors"
            >
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-700 inline-block mb-4">
                  {item.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-brand-600 mb-4">
                  {item.tagline}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{dict.ageGroups.smallClasses}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Level Placement Diagnostic */}
      <section id="placement-diagnostic" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            {
              {
                ar: "تحديد المستوى التفاعلي",
                en: "Interactive Diagnostic",
                nl: "Interactieve Niveautest",
                tr: "Etkileşimli Seviye Tespiti",
                it: "Test di Livello Interattivo",
                es: "Diagnóstico Interactivo",
              }[validLocale]
            }
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {
              {
                ar: "لا تعرف من أين تبدأ؟ حدد مستوى طفلك في 60 ثانية",
                en: "Not Sure Where to Start? Find Your Child's Level in 60 Seconds",
                nl: "Weet je niet waar te beginnen? Bepaal het niveau van je kind in 60 seconden",
                tr: "Nereden başlayacağınızı bilmiyor musunuz? Çocuğunuzun seviyesini 60 saniyede belirleyin",
                it: "Non sai da dove iniziare? Scopri il livello di tuo figlio in 60 secondi",
                es: "¿No sabes por dónde empezar? Descubre el nivel de tu hijo en 60 segundos",
              }[validLocale]
            }
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {
              {
                ar: "أداة ذكية تحدد المستوى المعياري، المجموعة المصغرة المناسبة، وخارطة طريق تمتد لـ 12 أسبوعاً.",
                en: "Our smart diagnostic matches your child to the right micro-cohort, CEFR benchmark, and a customized 12-week roadmap.",
                nl: "Onze slimme test koppelt je kind aan de juiste microgroep, CEFR-niveau en een op maat gemaakt 12-weken leertraject.",
                tr: "Akıllı seviye testimiz çocuğunuzu doğru mikro gruba, CEFR seviyesine ve 12 haftalık özel yol haritasına yerleştirir.",
                it: "Il nostro test intelligente assegna tuo figlio al gruppo ideale, al livello QCER e a un percorso personalizzato di 12 settimane.",
                es: "Nuestro diagnóstico inteligente asigna a tu hijo al grupo adecuado, nivel MCER y una hoja de ruta de 12 semanas personalizada.",
              }[validLocale]
            }
          </p>
        </div>
        <InteractivePlacementCalculator locale={locale} isRtl={isRtl} />
      </section>

      {/* Interactive Phoneme & Makharij Soundboard */}
      <section id="soundboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider">
            {
              {
                ar: "فصاحة النطق والتجويد",
                en: "Authentic Pronunciation",
                nl: "Authentieke Uitspraak & Tajweed",
                tr: "Fasih Telaffuz ve Tecvid",
                it: "Pronuncia Autentica e Tajweed",
                es: "Pronunciación Auténtica y Taywid",
              }[validLocale]
            }
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {
              {
                ar: "مخارج الحروف الفصيحة: تجربة تفاعلية مباشرة",
                en: "The Art of Arabic Makharij: Interactive Soundboard",
                nl: "De Kunst van Arabische Makharij: Interactief Klankbord",
                tr: "Arapça Mahreç Sanatı: Etkileşimli Ses Tahtası",
                it: "L'Arte dei Makharij Arabi: Tavola Sonora Interattiva",
                es: "El Arte de los Majárij Árabes: Tablero de Sonido Interactivo",
              }[validLocale]
            }
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {
              {
                ar: "استمع لأصوات الحروف العربية المميزة، واكتشف كيف يتقن أطفال المهجر النطق الفصيح دون عجمة.",
                en: "Hear the unique sounds that define Arabic, and discover how our certified native tutors help diaspora kids pronounce them with pure native confidence.",
                nl: "Luister naar de unieke klanken van het Arabisch en ontdek hoe onze gecertificeerde docenten kinderen in de diaspora helpen met zuivere uitspraak.",
                tr: "Arapça'yı niteleyen eşsiz sesleri dinleyin ve sertifikalı eğitmenlerimizin gurbetteki çocuklara fasih telaffuzu nasıl kazandırdığını keşfedin.",
                it: "Ascolta i suoni unici dell'arabo e scopri come i nostri insegnanti madrelingua certificati guidano i bambini della diaspora verso una pronuncia impeccabile.",
                es: "Escucha los sonidos únicos que definen el árabe y descubre cómo nuestros profesores nativos certificados ayudan a los niños en la diáspora a pronunciar con total confianza.",
              }[validLocale]
            }
          </p>
        </div>
        <InteractivePhonemeSoundboard locale={locale} isRtl={isRtl} />
      </section>

      {/* Pricing & Plan Preview */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            {dict.pricing.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {dict.pricing.title}
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            {dict.pricing.subtitle}
          </p>
        </div>

        {/* 1-Day Free Trial -- the public, zero-commitment entry point into
            the platform. Visible to every anonymous visitor on the homepage
            (not gated behind a plan pick), so it's a standout banner above
            the 3 paid plans rather than a 4th card competing with them. */}
        <div className="mb-10 max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-brand-600 p-8 sm:p-10 shadow-xl shadow-emerald-500/20">
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 space-y-4 text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{dict.pricing.trialBadge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  {dict.pricing.trialTitle}
                </h3>
                <p className="text-sm text-white/85 max-w-lg leading-relaxed">
                  {dict.pricing.trialSubtitle}
                </p>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[11px] font-semibold text-white/90 pt-1">
                  <li className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{dict.pricing.trialFeature1}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 shrink-0" />
                    <span>{dict.pricing.trialFeature2}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 shrink-0" />
                    <span>{dict.pricing.trialFeature3}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{dict.pricing.trialFeature4}</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 shrink-0" />
                    <span>{dict.pricing.trialFeature5}</span>
                  </li>
                </ul>
              </div>
              <div className="shrink-0 flex flex-col items-stretch sm:items-center gap-2 lg:w-64">
                <Link
                  href={`/${locale}/register?plan=plan-starter&trial=1`}
                  className="block text-center py-3.5 px-6 rounded-xl text-sm font-extrabold bg-white text-emerald-700 hover:bg-slate-50 transition-colors shadow-md"
                >
                  {dict.pricing.trialCta}
                </Link>
                <span className="text-[11px] text-white/75 text-center">
                  {dict.pricing.trialNote}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1: Group */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-brand-600 tracking-wider">
                {dict.pricing.groupBadge}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                {dict.pricing.groupTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                {dict.pricing.groupDesc}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$44.50</span>
                <span className="text-xs text-slate-500">{dict.pricing.perMonth}</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                {dict.pricing.groupFeatures.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={`/${locale}/register?plan=plan-group`}
              className="mt-8 block text-center py-3 px-4 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              {dict.pricing.groupCta}
            </Link>
          </div>

          {/* Plan 2: Private 1-on-1 (Highlighted) */}
          <div className="bg-gradient-to-b from-brand-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl shadow-brand-950/20 relative flex flex-col justify-between border border-brand-700">
            <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-slate-900" />
              <span>{dict.pricing.privateBadge}</span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-brand-300 tracking-wider">
                {dict.pricing.privateTag}
              </span>
              <h3 className="text-2xl font-bold text-white mt-2">
                {dict.pricing.privateTitle}
              </h3>
              <p className="text-xs text-slate-300 mt-1 mb-6">
                {dict.pricing.privateDesc}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$110.00</span>
                <span className="text-xs text-slate-300">{dict.pricing.perMonth}</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                {dict.pricing.privateFeatures.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={`/${locale}/register?plan=plan-private`}
              className="mt-8 block text-center py-3 px-4 rounded-xl text-sm font-bold bg-white text-brand-900 hover:bg-slate-100 transition-colors shadow-sm"
            >
              {dict.pricing.privateCta}
            </Link>
          </div>

          {/* Plan 3: Family */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-purple-600 tracking-wider">
                {dict.pricing.familyBadge}
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                {dict.pricing.familyTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                {dict.pricing.familyDesc}
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$74.50</span>
                <span className="text-xs text-slate-500">{dict.pricing.perMonth}</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600">
                {dict.pricing.familyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={`/${locale}/register?plan=plan-family`}
              className="mt-8 block text-center py-3 px-4 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              {dict.pricing.familyCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Child Safety & Trust Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{dict.safetyBanner.badge}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold">
              {dict.safetyBanner.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {dict.safetyBanner.desc}
            </p>
          </div>

          <Link
            href={`/${locale}/register`}
            className="whitespace-nowrap px-8 py-4 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-2xl transition-all shadow-md"
          >
            {dict.safetyBanner.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
