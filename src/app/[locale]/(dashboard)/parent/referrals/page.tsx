import React from "react";
import Link from "next/link";
import { requireParentProfile } from "@/lib/auth/currentUser";
import { referralService } from "@/server/services/ReferralService";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  Gift,
  Share2,
  Users,
  DollarSign,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const REFERRALS_I18N: Record<
  string,
  {
    badge: string;
    title: string;
    desc: string;
    yourLink: string;
    shareWhatsappMessage: (link: string) => string;
    orShareCode: (code: string) => string;
    availableCredits: string;
    invitesCount: (count: number) => string;
    enrolledCount: (count: number) => string;
    activityHeading: string;
    recordsCount: (count: number) => string;
    thEmail: string;
    thChild: string;
    thStatus: string;
    thReward: string;
    thDate: string;
    statusRewarded: string;
    statusEnrolled: string;
    statusPending: string;
  }
> = {
  ar: {
    badge: "برنامج مكافآت وتوصيات العائلة",
    title: "شارك حب العربية واربح 25$ رصيداً",
    desc: "شارك رابط الإحالة الخاص بك مع أصدقائك وعائلتك. سيحصل كل صديق يشترك على خصم 25$ على شهره الأول، وستحصل أنت على رصيد 25$ يخصم من فاتورتك القادمة.",
    yourLink: "رابط الإحالة الخاص بك",
    shareWhatsappMessage: (link) =>
      `السلام عليكم! انضموا إلى Arabic Kids Academy ليتعلم أطفالنا اللغة العربية والقرآن مع معلمين معتمدين: ${link}`,
    orShareCode: (code) => `أو شارك كود الإحالة مباشرة: ${code}`,
    availableCredits: "الرصيد المكتسب المتاح",
    invitesCount: (c) => `الدعوات: ${c}`,
    enrolledCount: (c) => `المشتركون: ${c}`,
    activityHeading: "سجل العائلات المدعوة",
    recordsCount: (c) => `${c} سجلات`,
    thEmail: "البريد الإلكتروني",
    thChild: "اسم الطفل",
    thStatus: "حالة الاشتراك",
    thReward: "المكافأة",
    thDate: "تاريخ الدعوة",
    statusRewarded: "تم صرف المكافأة",
    statusEnrolled: "مشترك نشط",
    statusPending: "في انتظار التسجيل",
  },
  en: {
    badge: "Family Referral & Rewards Program",
    title: "Give $25, Get $25 on Every Referral",
    desc: "Invite fellow families to join our academy. When a referred family enrolls, they receive a $25 welcome discount, and you earn $25 account credit towards your next invoice.",
    yourLink: "Your Unique Referral Link",
    shareWhatsappMessage: (link) =>
      `Assalamu Alaikum! Join Arabic Kids Academy for our children to learn Arabic and Quran with certified native teachers: ${link}`,
    orShareCode: (code) => `Or share your referral code directly: ${code}`,
    availableCredits: "Available Credits",
    invitesCount: (c) => `Invites: ${c}`,
    enrolledCount: (c) => `Enrolled: ${c}`,
    activityHeading: "Referred Families Activity",
    recordsCount: (c) => `${c} records`,
    thEmail: "Family / Email",
    thChild: "Child Name",
    thStatus: "Status",
    thReward: "Reward",
    thDate: "Date",
    statusRewarded: "Rewarded",
    statusEnrolled: "Enrolled",
    statusPending: "Pending",
  },
  nl: {
    badge: "Familieverwijzings- & Beloningsprogramma",
    title: "Geef $25, Ontvang $25 bij Elke Verwijzing",
    desc: "Nodig andere families uit om lid te worden van de academie. Wanneer een verwezen gezin zich inschrijft, ontvangen zij $25 welkomstkorting en ontvang jij $25 tegoed op je volgende factuur.",
    yourLink: "Jouw Unieke Verwijzingslink",
    shareWhatsappMessage: (link) =>
      `Assalamu Alaikum! Doe mee met Arabic Kids Academy zodat onze kinderen Arabisch en de Koran leren met gecertificeerde docenten: ${link}`,
    orShareCode: (code) => `Of deel je verwijzingscode direct: ${code}`,
    availableCredits: "Beschikbaar Tegoed",
    invitesCount: (c) => `Uitnodigingen: ${c}`,
    enrolledCount: (c) => `Ingeschreven: ${c}`,
    activityHeading: "Overzicht Verwezen Gezinnen",
    recordsCount: (c) => `${c} registraties`,
    thEmail: "Familie / E-mail",
    thChild: "Naam Kind",
    thStatus: "Status",
    thReward: "Beloning",
    thDate: "Datum",
    statusRewarded: "Uitbetaald",
    statusEnrolled: "Ingeschreven",
    statusPending: "In afwachting",
  },
  tr: {
    badge: "Aile Tavsiye ve Ödül Programı",
    title: "Her Tavsiyede 25$ Hediye Edin, 25$ Kazanın",
    desc: "Diğer aileleri akademimize katılmaya davet edin. Tavsiye ettiğiniz aile kaydolduğunda 25$ hoş geldin indirimi alır, siz de bir sonraki faturanızda 25$ hesap kredisi kazanırsınız.",
    yourLink: "Size Özel Tavsiye Bağlantısı",
    shareWhatsappMessage: (link) =>
      `Selamün Aleyküm! Çocuklarımızın anadili Arapça olan sertifikalı öğretmenlerle Arapça ve Kuran öğrenmesi için Arabic Kids Academy'ye katılın: ${link}`,
    orShareCode: (code) => `Veya tavsiye kodunuzu doğrudan paylaşın: ${code}`,
    availableCredits: "Kullanılabilir Kredi",
    invitesCount: (c) => `Davetler: ${c}`,
    enrolledCount: (c) => `Kaydolanlar: ${c}`,
    activityHeading: "Tavsiye Edilen Aileler Geçmişi",
    recordsCount: (c) => `${c} kayıt`,
    thEmail: "Aile / E-posta",
    thChild: "Çocuk Adı",
    thStatus: "Durum",
    thReward: "Ödül",
    thDate: "Tarih",
    statusRewarded: "Ödül Verildi",
    statusEnrolled: "Kaydoldu",
    statusPending: "Beklemede",
  },
  it: {
    badge: "Programma Inviti e Premi Famiglia",
    title: "Dona $25, Ricevi $25 per Ogni Famiglia Invitata",
    desc: "Invita altre famiglie a iscriversi alla nostra accademia. Quando una famiglia invitata si iscrive, riceve uno sconto di benvenuto di $25 e tu guadagni $25 di credito sulla tua prossima fattura.",
    yourLink: "Il Tuo Link di Invito Personale",
    shareWhatsappMessage: (link) =>
      `Assalamu Alaikum! Unisciti a Arabic Kids Academy affinché i nostri bambini imparino l'arabo e il Corano con insegnanti madrelingua certificati: ${link}`,
    orShareCode: (code) => `Oppure condividi direttamente il tuo codice: ${code}`,
    availableCredits: "Crediti Disponibili",
    invitesCount: (c) => `Inviti: ${c}`,
    enrolledCount: (c) => `Iscritti: ${c}`,
    activityHeading: "Attività Famiglie Invitate",
    recordsCount: (c) => `${c} voci`,
    thEmail: "Famiglia / Email",
    thChild: "Nome del Bambino",
    thStatus: "Stato",
    thReward: "Premio",
    thDate: "Data",
    statusRewarded: "Erogato",
    statusEnrolled: "Iscritto",
    statusPending: "In attesa",
  },
  es: {
    badge: "Programa de Recomendaciones y Recompensas Familiares",
    title: "Regala $25 y Recibe $25 por Cada Familia Recomendada",
    desc: "Invita a otras familias a unirse a nuestra academia. Cuando una familia recomendada se inscribe, recibe un descuento de bienvenida de $25 y tú obtienes $25 de saldo para tu próxima factura.",
    yourLink: "Tu Enlace Único de Recomendación",
    shareWhatsappMessage: (link) =>
      `¡Assalamu Alaikum! Únete a Arabic Kids Academy para que nuestros hijos aprendan árabe y Corán con profesores nativos certificados: ${link}`,
    orShareCode: (code) => `O comparte tu código directamente: ${code}`,
    availableCredits: "Saldo Disponible",
    invitesCount: (c) => `Invitaciones: ${c}`,
    enrolledCount: (c) => `Inscritos: ${c}`,
    activityHeading: "Historial de Familias Recomendadas",
    recordsCount: (c) => `${c} registros`,
    thEmail: "Familia / Email",
    thChild: "Nombre del Niño/a",
    thStatus: "Estado",
    thReward: "Recompensa",
    thDate: "Fecha",
    statusRewarded: "Recompensado",
    statusEnrolled: "Inscrito",
    statusPending: "Pendiente",
  },
};

export default async function ParentReferralsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
  const t = REFERRALS_I18N[locale] || REFERRALS_I18N.en;
  const { profile } = await requireParentProfile(locale);

  const referralCode = referralService.getReferralCodeForParent(profile.id, profile.firstName);
  const stats = referralService.getReferralStats(profile.id);
  const referrals = referralService.getReferralsForParent(profile.id);

  const referralLink = `https://arabickidsacademy.com/${locale}/register?ref=${referralCode}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold">
            <Gift className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold">
            {t.title}
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed">
            {t.desc}
          </p>
        </div>
      </div>

      {/* Referral Link & Code Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            {t.yourLink}
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono text-slate-700 select-all"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  t.shareWhatsappMessage(referralLink)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {t.orShareCode(referralCode)}
          </p>
        </div>

        {/* Stats Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.availableCredits}
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              ${stats.availableCreditsDollars}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t.invitesCount(stats.totalInvites)}</span>
            <span>{t.enrolledCount(stats.enrolled)}</span>
          </div>
        </div>
      </div>

      {/* Referrals History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">
            {t.activityHeading}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {t.recordsCount(referrals.length)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">{t.thEmail}</th>
                <th className="px-6 py-4">{t.thChild}</th>
                <th className="px-6 py-4">{t.thStatus}</th>
                <th className="px-6 py-4">{t.thReward}</th>
                <th className="px-6 py-4">{t.thDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{r.referredFamilyEmail}</td>
                  <td className="px-6 py-4 text-slate-600">{r.referredChildName || "—"}</td>
                  <td className="px-6 py-4">
                    {r.status === "REWARDED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.statusRewarded}
                      </span>
                    )}
                    {r.status === "ENROLLED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t.statusEnrolled}
                      </span>
                    )}
                    {r.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        {t.statusPending}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ${(r.rewardAmountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
