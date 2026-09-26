"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Users, ArrowRight, ShieldCheck, Calculator, Star } from "lucide-react";
import { B2B_BUNDLES, type B2BBundleDefinition } from "@/lib/constants/b2bBundles";
import { DirectionalIcon } from "@/components/shared/DirectionalIcon";

interface B2BBundleCalculatorProps {
  locale: string;
}

const B2B_TRANSLATIONS: Record<string, {
  calculatorBadge: string;
  headcountTitle: string;
  headcountSubtitle: string;
  studentsUnit: string;
  recommendedBundleLabel: string;
  trialBadge: string;
  trialTitle: string;
  trialDesc: string;
  startTrialBtn: string;
  perMonth: string;
  discountApplied: string;
  selectBundleBtn: string;
  trustGuarantee: string;
  perStudentMonthly: string;
  mostPopularBadge: string;
  bundleNames: Record<string, string>;
  bundleRanges: Record<string, string>;
}> = {
  ar: {
    calculatorBadge: "حاسبة باقات المؤسسات والمعلمين المستقلين",
    headcountTitle: "كم عدد الطلاب المتوقع تسجيلهم؟",
    headcountSubtitle: "اختر عدد مقاعد الطلاب لترشيح الباقة المثالية لمؤسستك مع خصم حصري 35%",
    studentsUnit: "طالباً",
    recommendedBundleLabel: "الباقة المرشحة تلقائياً:",
    trialBadge: "تجربة مؤسسية مجانية لمدة 3 أيام",
    trialTitle: "تريد تقييم المنظومة مع فريقك وطلابك أولاً؟",
    trialDesc: "احصل على تجربة مجانية فورية لمدة 3 أيام تسع حتى 10 طلاب مع كافة الميزات المؤسسية: التسجيل الجماعي، الفصل التفاعلي الحي، لوحة تحكم المشرف، وتقارير الحضور — بدون أي بطاقة بنكية.",
    startTrialBtn: "طلب تجربة مجانية (3 أيام • 10 طلاب)",
    perMonth: "شهرياً",
    discountApplied: "خصم 35% مطبق",
    selectBundleBtn: "اختيار هذه الباقة والتقديم",
    trustGuarantee: "جميع الباقات تشمل المناهج الـ 7 المعتمدة، الفصول التفاعلية الحية، وتقارير الحضور والإنجاز الرسمية.",
    perStudentMonthly: "لكل طالب / شهرياً فقط",
    mostPopularBadge: "الأكثر طلباً",
    bundleNames: {
      STARTER: "الباقة الأساسية (المعلم المستقل والمجموعات)",
      GROWTH: "باقة النمو (المعاهد والمراكز المجتمعية)",
      INSTITUTION: "باقة المؤسسات الكبرى والمدارس الأهلية",
    },
    bundleRanges: {
      STARTER: "حتى 25 طالباً",
      GROWTH: "26 – 100 طالب",
      INSTITUTION: "100+ طالب (غير محدود)",
    },
  },
  nl: {
    calculatorBadge: "Interactieve B2B-pakketcalculator",
    headcountTitle: "Hoeveel leerlingen bent u van plan in te schrijven?",
    headcountSubtitle: "Pas het aantal leerlingen aan om het beste pakket te vinden voor uw instelling met 35% korting.",
    studentsUnit: "leerlingen",
    recommendedBundleLabel: "Aanbevolen pakket:",
    trialBadge: "Gratis proefperiode voor instellingen van 3 dagen",
    trialTitle: "Wilt u het platform eerst evalueren met uw team en leerlingen?",
    trialDesc: "Krijg direct 3 dagen toegang voor maximaal 10 leerlingen met alle essentiële B2B-functies: bulk-aanmelding, live klaslokaal, beheerdersdashboard en aanwezigheidsrapportage — geen creditcard nodig.",
    startTrialBtn: "Start proefperiode (3 dagen • 10 leerlingen)",
    perMonth: "mnd",
    discountApplied: "35% korting toegepast",
    selectBundleBtn: "Kies dit pakket en meld u aan",
    trustGuarantee: "Alle pakketten bevatten alle 7 geaccrediteerde trajecten, realtime live klaslokalen en officiële aanwezigheids- en voortgangsrapportages.",
    perStudentMonthly: "per leerling / maand",
    mostPopularBadge: "Meest Gekozen",
    bundleNames: {
      STARTER: "Starter (Zelfstandige docenten & micro-scholen)",
      GROWTH: "Groei (Instituten & Gemeenschapscentra)",
      INSTITUTION: "Instelling (Islamitische scholen & Meerdere vestigingen)",
    },
    bundleRanges: {
      STARTER: "Tot 25 leerlingen",
      GROWTH: "26 – 100 leerlingen",
      INSTITUTION: "100+ leerlingen (Onbeperkt)",
    },
  },
  tr: {
    calculatorBadge: "İnteraktif B2B Paket Hesaplayıcı",
    headcountTitle: "Kaç öğrenci kaydetmeyi planlıyorsunuz?",
    headcountSubtitle: "%35 indirimle kurumunuz için en uygun paket seviyesini bulmak üzere öğrenci sayısını ayarlayın.",
    studentsUnit: "öğrenci",
    recommendedBundleLabel: "Önerilen Paket:",
    trialBadge: "Kurumsal 3 Günlük Ücretsiz Deneme",
    trialTitle: "Platformu önce ekibiniz ve öğrencilerinizle değerlendirmek ister misiniz?",
    trialDesc: "En fazla 10 öğrenci için tüm temel B2B özellikleriyle anında 3 günlük erişim elde edin: toplu liste kaydı, canlı işbirlikçi sınıf, yönetici paneli ve devam raporlaması — kredi kartı gerekmez.",
    startTrialBtn: "Ücretsiz Deneme Başlat (3 Gün • 10 Öğrenci)",
    perMonth: "ay",
    discountApplied: "%35 indirim uygulandı",
    selectBundleBtn: "Bu Paketi Seç ve Başvur",
    trustGuarantee: "Tüm paketler, akredite 7 müfredatı, gerçek zamanlı canlı sınıfları ve resmi devam ve ilerleme raporlamasını içerir.",
    perStudentMonthly: "öğrenci başına / ay",
    mostPopularBadge: "En Çok Tercih Edilen",
    bundleNames: {
      STARTER: "Başlangıç (Bağımsız Öğretmenler ve Mikro Okullar)",
      GROWTH: "Büyüme (Enstitüler ve Topluluk Merkezleri)",
      INSTITUTION: "Kurumsal (Tam Zamanlı İslami Okullar ve Çok Şubeli)",
    },
    bundleRanges: {
      STARTER: "25 öğrenciye kadar",
      GROWTH: "26 – 100 öğrenci",
      INSTITUTION: "100+ öğrenci (Sınırsız)",
    },
  },
  it: {
    calculatorBadge: "Calcolatore Interattivo Pacchetti B2B",
    headcountTitle: "Quanti studenti prevedi di iscrivere?",
    headcountSubtitle: "Regola il numero di studenti per trovare il pacchetto migliore per il tuo istituto con uno sconto del 35%.",
    studentsUnit: "studenti",
    recommendedBundleLabel: "Pacchetto consigliato:",
    trialBadge: "Prova gratuita istituzionale di 3 giorni",
    trialTitle: "Vuoi valutare la piattaforma con il tuo team e i tuoi studenti?",
    trialDesc: "Ottieni l'accesso immediato per 3 giorni per un massimo di 10 studenti con tutte le funzioni B2B essenziali: iscrizione massiva, aula collaborativa dal vivo, dashboard amministratore e report presenze — nessuna carta richiesta.",
    startTrialBtn: "Inizia prova di 3 giorni (10 studenti)",
    perMonth: "mese",
    discountApplied: "Sconto del 35% applicato",
    selectBundleBtn: "Seleziona questo pacchetto e candidati",
    trustGuarantee: "Tutti i pacchetti includono tutti i 7 percorsi accreditati, aule dal vivo in tempo reale e reportistica ufficiale di presenze e progressi.",
    perStudentMonthly: "per studente / mese",
    mostPopularBadge: "Più Popolare",
    bundleNames: {
      STARTER: "Starter (Insegnanti freelance e micro-scuole)",
      GROWTH: "Crescita (Istituti e centri comunitari)",
      INSTITUTION: "Istituzione (Scuole islamiche a tempo pieno e multi-sede)",
    },
    bundleRanges: {
      STARTER: "Fino a 25 studenti",
      GROWTH: "26 – 100 studenti",
      INSTITUTION: "100+ studenti (Illimitato)",
    },
  },
  es: {
    calculatorBadge: "Calculadora Interactiva de Paquetes B2B",
    headcountTitle: "¿Cuántos estudiantes planeas inscribir?",
    headcountSubtitle: "Ajusta la cantidad de estudiantes para encontrar el mejor paquete para tu institución con un 35% de descuento.",
    studentsUnit: "estudiantes",
    recommendedBundleLabel: "Paquete recomendado:",
    trialBadge: "Prueba institucional gratuita de 3 días",
    trialTitle: "¿Quieres evaluar la plataforma con tu equipo y estudiantes primero?",
    trialDesc: "Obtén acceso instantáneo de 3 días para hasta 10 estudiantes con todas las funciones B2B esenciales: inscripción masiva, aula colaborativa en vivo, panel de administración e informes de asistencia — sin tarjeta de crédito.",
    startTrialBtn: "Iniciar prueba de 3 días (10 estudiantes)",
    perMonth: "mes",
    discountApplied: "35% de descuento aplicado",
    selectBundleBtn: "Selecciona este paquete y solicita",
    trustGuarantee: "Todos los paquetes incluyen los 7 planes de estudio acreditados, aulas en vivo en tiempo real e informes oficiales de asistencia y progreso.",
    perStudentMonthly: "por estudiante / mes",
    mostPopularBadge: "Más Popular",
    bundleNames: {
      STARTER: "Básico (Profesores independientes y microescuelas)",
      GROWTH: "Crecimiento (Institutos y centros comunitarios)",
      INSTITUTION: "Institución (Escuelas islámicas a tiempo completo y múltiples sedes)",
    },
    bundleRanges: {
      STARTER: "Hasta 25 estudiantes",
      GROWTH: "26 – 100 estudiantes",
      INSTITUTION: "100+ estudiantes (Ilimitado)",
    },
  },
  en: {
    calculatorBadge: "Interactive B2B Bundle Calculator",
    headcountTitle: "How many students are you planning to enroll?",
    headcountSubtitle: "Adjust the student headcount to find the best bundle tier for your institution with a 35% discount.",
    studentsUnit: "students",
    recommendedBundleLabel: "Recommended Bundle:",
    trialBadge: "Institutional 3-Day Free Trial",
    trialTitle: "Want to evaluate the platform before committing?",
    trialDesc: "Get instant 3-day access for up to 10 students with all essential B2B features: bulk roster onboarding, live collaborative classroom, scoped school admin dashboard, and attendance reporting — zero credit card required.",
    startTrialBtn: "Start 3-Day Trial (10 Students)",
    perMonth: "mo",
    discountApplied: "35% discount applied",
    selectBundleBtn: "Select This Bundle & Apply",
    trustGuarantee: "All bundles include all 7 accredited tracks, real-time live classrooms, and official attendance & progress reporting.",
    perStudentMonthly: "per student / month",
    mostPopularBadge: "Most Popular",
    bundleNames: {
      STARTER: "Starter Bundle (Freelancers & Micro-Schools)",
      GROWTH: "Growth Bundle (Institutes & Community Centers)",
      INSTITUTION: "Institution Bundle (Full-Time Islamic Schools & Multi-Branch)",
    },
    bundleRanges: {
      STARTER: "Up to 25 students",
      GROWTH: "26 – 100 students",
      INSTITUTION: "100+ students (Unlimited)",
    },
  },
};

export function B2BBundleCalculator({ locale }: B2BBundleCalculatorProps) {
  const isAr = locale === "ar";
  const t = B2B_TRANSLATIONS[locale] || B2B_TRANSLATIONS.en;
  const [studentCount, setStudentCount] = useState<number>(35);

  // Determine recommended bundle based on student headcount
  let activeTier: "STARTER" | "GROWTH" | "INSTITUTION" = "GROWTH";
  if (studentCount <= 25) {
    activeTier = "STARTER";
  } else if (studentCount <= 100) {
    activeTier = "GROWTH";
  } else {
    activeTier = "INSTITUTION";
  }

  const bundles: B2BBundleDefinition[] = [
    B2B_BUNDLES.STARTER,
    B2B_BUNDLES.GROWTH,
    B2B_BUNDLES.INSTITUTION,
  ];

  const currentBundle = B2B_BUNDLES[activeTier];
  const perStudentCost = Math.round((currentBundle.priceMonthlyEur / Math.max(studentCount, 1)) * 10) / 10;
  const currentBundleName = t.bundleNames[activeTier] || (isAr ? currentBundle.nameAr : currentBundle.nameEn);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-10 max-w-5xl mx-auto">
      {/* Interactive Headcount Slider */}
      <div className="space-y-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>{t.calculatorBadge}</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.headcountTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {t.headcountSubtitle}
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between font-extrabold text-slate-900">
            <span className="text-xs text-slate-500">5 {t.studentsUnit}</span>
            <span className="text-3xl sm:text-4xl text-brand-600 flex items-center gap-2">
              <Users className="w-7 h-7 text-brand-500" />
              <span>{studentCount}</span>
              <span className="text-sm font-bold text-slate-600">{t.studentsUnit}</span>
            </span>
            <span className="text-xs text-slate-500">200+ {t.studentsUnit}</span>
          </div>

          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={studentCount}
            onChange={(e) => setStudentCount(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 pt-1">
            <span>{t.recommendedBundleLabel}</span>
            <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 font-extrabold">
              {currentBundleName}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Day Free Trial Evaluation Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.trialBadge}</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-white">
            {t.trialTitle}
          </h4>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
            {t.trialDesc}
          </p>
        </div>
        <Link
          href={`/${locale}/schools?bundle=TRIAL_3_DAYS#apply`}
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
        >
          <span>{t.startTrialBtn}</span>
          <DirectionalIcon icon={ArrowRight} locale={locale} className="w-4 h-4" />
        </Link>
      </div>

      {/* 3 Bundles Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {bundles.map((bundle) => {
          const isSelected = bundle.id === activeTier;
          const bundleName = t.bundleNames[bundle.id] || (isAr ? bundle.nameAr : bundle.nameEn);
          const bundleRange = t.bundleRanges[bundle.id] || (isAr ? bundle.studentRangeAr : bundle.studentRangeEn);
          const hasBadge = Boolean(bundle.badgeAr || bundle.badgeEn);

          return (
            <div
              key={bundle.id}
              onClick={() => {
                if (bundle.id === "STARTER") setStudentCount(20);
                if (bundle.id === "GROWTH") setStudentCount(50);
                if (bundle.id === "INSTITUTION") setStudentCount(120);
              }}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all cursor-pointer relative ${
                isSelected
                  ? "bg-gradient-to-b from-brand-900 to-indigo-950 text-white shadow-xl shadow-brand-950/20 ring-4 ring-brand-400 scale-[1.02]"
                  : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {hasBadge && (
                <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-900" />
                  <span>{t.mostPopularBadge}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xl font-extrabold ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {bundleName}
                    </h4>
                  </div>
                  <p className={`text-xs font-bold mt-1 ${isSelected ? "text-brand-300" : "text-brand-600"}`}>
                    {bundleRange}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl sm:text-4xl font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                      €{bundle.priceMonthlyEur}
                    </span>
                    <span className={`text-xs line-through ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                      €{bundle.originalPriceEur}
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      /{t.perMonth}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {t.discountApplied}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/20 space-y-2.5">
                  {(isAr ? bundle.featuresAr : bundle.featuresEn).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span className={isSelected ? "text-slate-200" : "text-slate-600"}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/20">
                <Link
                  href={`#apply`}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 hover:bg-slate-100 shadow-md"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <span>{t.selectBundleBtn}</span>
                  <DirectionalIcon icon={ArrowRight} locale={locale} className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-brand-50/60 rounded-2xl p-4 border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
          <span>{t.trustGuarantee}</span>
        </div>
        <div className="font-extrabold text-brand-800 shrink-0">
          ~€{perStudentCost} {t.perStudentMonthly}
        </div>
      </div>
    </div>
  );
}
