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

export default async function ParentReferralsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRtlLocale(locale);
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
            <span>{isRtl ? "برنامج مكافآت وتوصيات العائلة" : "Family Referral & Rewards Program"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold">
            {isRtl ? "شارك حب العربية واربح 25$ رصيداً" : "Give $25, Get $25 on Every Referral"}
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed">
            {isRtl
              ? "شارك رابط الإحالة الخاص بك مع أصدقائك وعائلتك. سيحصل كل صديق يشترك على خصم 25$ على شهره الأول، وستحصل أنت على رصيد 25$ يخصم من فاتورتك القادمة."
              : "Invite fellow families to join our academy. When a referred family enrolls, they receive a $25 welcome discount, and you earn $25 account credit towards your next invoice."}
          </p>
        </div>
      </div>

      {/* Referral Link & Code Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">
            {isRtl ? "رابط الإحالة الخاص بك" : "Your Unique Referral Link"}
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
                  `Assalamu Alaikum! Join Kids Arabic Academy for our children to learn Arabic and Quran with certified native teachers: ${referralLink}`
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
            {isRtl
              ? `أو شارك كود الإحالة مباشرة: ${referralCode}`
              : `Or share your referral code directly: ${referralCode}`}
          </p>
        </div>

        {/* Stats Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isRtl ? "الرصيد المكتسب المتاح" : "Available Credits"}
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              ${stats.availableCreditsDollars}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isRtl ? `الدعوات: ${stats.totalInvites}` : `Invites: ${stats.totalInvites}`}</span>
            <span>{isRtl ? `المشتركون: ${stats.enrolled}` : `Enrolled: ${stats.enrolled}`}</span>
          </div>
        </div>
      </div>

      {/* Referrals History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">
            {isRtl ? "سجل العائلات المدعوة" : "Referred Families Activity"}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {referrals.length} {isRtl ? "سجلات" : "records"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">{isRtl ? "البريد الإلكتروني" : "Family / Email"}</th>
                <th className="px-6 py-4">{isRtl ? "اسم الطفل" : "Child Name"}</th>
                <th className="px-6 py-4">{isRtl ? "حالة الاشتراك" : "Status"}</th>
                <th className="px-6 py-4">{isRtl ? "المكافأة" : "Reward"}</th>
                <th className="px-6 py-4">{isRtl ? "تاريخ الدعوة" : "Date"}</th>
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
                        {isRtl ? "تم صرف المكافأة" : "Rewarded"}
                      </span>
                    )}
                    {r.status === "ENROLLED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <Sparkles className="w-3.5 h-3.5" />
                        {isRtl ? "مشترك نشط" : "Enrolled"}
                      </span>
                    )}
                    {r.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        {isRtl ? "في انتظار التسجيل" : "Pending"}
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
