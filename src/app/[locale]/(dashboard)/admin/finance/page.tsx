import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { payrollService } from "@/server/services/PayrollService";
import { billingService } from "@/server/services/BillingService";
import { administrationRepository } from "@/server/repositories/AdministrationRepository";
import { getClientIp } from "@/lib/security/rateLimit";
import { prisma } from "@/lib/database/prisma";
import { InvoiceStatus } from "@prisma/client";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import { refundPayment, writeOffInvoice } from "@/server/services/StripeSubscriptionService";
import {
  Download,
  FileText,
  Tag,
  Percent,
  PlusCircle,
  CheckCircle2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
  Pencil,
  Undo2,
  Ban,
  AlertTriangle,
} from "lucide-react";

const INVOICE_STATUS_LABELS_AR: Record<InvoiceStatus, string> = {
  DRAFT: "مسودة",
  ISSUED: "بانتظار السداد",
  PAID: "مسددة بالكامل",
  VOID: "ملغاة",
  UNCOLLECTIBLE: "متعذر تحصيلها",
};

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-50 text-slate-600 border-slate-200",
  ISSUED: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  VOID: "bg-slate-50 text-slate-400 border-slate-200",
  UNCOLLECTIBLE: "bg-red-50 text-red-700 border-red-200",
};

export default async function AdminFinancePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    couponSaved?: string;
    couponToggled?: string;
    couponDeleted?: string;
    planUpdated?: string;
    refundDone?: string;
    refundError?: string;
    writeOffDone?: string;
  }>;
}) {
  const { locale } = await params;
  const { couponSaved, couponToggled, couponDeleted, planUpdated, refundDone, refundError, writeOffDone } =
    await searchParams;
  const admin = await requireAdminHubAccess(locale, "finance");
  const isAr = locale === "ar";

  const overview = await payrollService.getFinanceOverview();
  const allInvoices = await prisma.invoice.findMany({
    include: { parent: true, payments: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const coupons = await billingService.getAllCoupons();
  const plans = await billingService.getAllPlans();

  // Server Action: Create or Update Coupon
  async function handleCreateOrUpdateCoupon(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "finance");
    const code = (formData.get("code")?.toString() || "").trim().toUpperCase();
    const discountPercentage = Number(formData.get("discountPercentage")) || 10;
    const descriptionAr = formData.get("descriptionAr")?.toString() || `خصم ${discountPercentage}%`;
    const isActive = formData.get("isActive") === "on";

    if (!code) return;

    await billingService.saveCoupon({
      code,
      discountPercentage,
      descriptionAr,
      isActive,
    });

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "FINANCE",
      action: "CREATE_OR_UPDATE_COUPON",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: code,
      targetEntityType: "DiscountCoupon",
      ipAddress: ip,
      diffSummary: `Coupon ${code}: ${discountPercentage}% discount, active=${isActive}`,
    });

    revalidatePath(`/${locale}/admin/finance`);
    redirect(`/${locale}/admin/finance?couponSaved=${code}`);
  }

  // Server Action: Toggle Coupon Active State
  async function handleToggleCoupon(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "finance");
    const code = formData.get("code")?.toString() || "";
    if (!code) return;

    const updated = await billingService.toggleCoupon(code);

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "FINANCE",
      action: "TOGGLE_COUPON",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: code,
      targetEntityType: "DiscountCoupon",
      ipAddress: ip,
      diffSummary: `Coupon ${code} state toggled to active=${updated?.isActive}`,
    });

    revalidatePath(`/${locale}/admin/finance`);
    redirect(`/${locale}/admin/finance?couponToggled=${code}`);
  }

  // Server Action: Delete Coupon
  async function handleDeleteCoupon(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "finance");
    const code = formData.get("code")?.toString() || "";
    if (!code) return;

    await billingService.deleteCoupon(code);

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "FINANCE",
      action: "DELETE_COUPON",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: code,
      targetEntityType: "DiscountCoupon",
      ipAddress: ip,
      diffSummary: `Coupon ${code} deleted`,
    });

    revalidatePath(`/${locale}/admin/finance`);
    redirect(`/${locale}/admin/finance?couponDeleted=${code}`);
  }

  // Server Action: Update a plan's price/details. This is a REAL change --
  // StripeSubscriptionService.findOrCreatePrismaPlan() derives the Prisma
  // Plan row used at the next checkout from this same in-memory catalog, so
  // saving a new price here changes what the plan actually charges going
  // forward. It never touches subscriptions that already exist.
  async function handleUpdatePlan(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "finance");
    const planId = formData.get("planId")?.toString() || "";
    const priceDollars = Number(formData.get("priceDollars"));
    const descriptionAr = formData.get("descriptionAr")?.toString().trim();
    if (!planId || !Number.isFinite(priceDollars) || priceDollars <= 0) return;

    const priceMinorUnits = Math.round(priceDollars * 100);
    const updated = await billingService.updatePlan(planId, {
      priceMinorUnits,
      descriptionAr: descriptionAr || undefined,
    });
    if (!updated) return;

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "FINANCE",
      action: "UPDATE_SUBSCRIPTION_PLAN",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: planId,
      targetEntityType: "SubscriptionPlan",
      ipAddress: ip,
      diffSummary: `Plan ${planId} price updated to ${billingService.formatPrice(priceMinorUnits, updated.currency)}`,
    });

    revalidatePath(`/${locale}/admin/finance`);
    redirect(`/${locale}/admin/finance?planUpdated=${planId}`);
  }

  // Server Action: Refund a payment (full or partial). Only ever reachable
  // for a payment that actually succeeded -- see the invoice table below,
  // where the button is only rendered for a PAID invoice's payment.
  async function handleRefundPayment(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "finance");
    const paymentId = formData.get("paymentId")?.toString() || "";
    const invoiceNumber = formData.get("invoiceNumber")?.toString() || "";
    const amountDollarsRaw = formData.get("amountDollars")?.toString().trim();
    const reason = formData.get("reason")?.toString().trim() || undefined;
    if (!paymentId) return;

    const amountMinorUnits = amountDollarsRaw ? Math.round(Number(amountDollarsRaw) * 100) : undefined;

    let result: { refundId: string; amountMinorUnits: number };
    try {
      result = await refundPayment(paymentId, { amountMinorUnits, reason });
    } catch (err) {
      revalidatePath(`/${locale}/admin/finance`);
      redirect(
        `/${locale}/admin/finance?refundError=${encodeURIComponent(
          err instanceof Error ? err.message : "Refund failed"
        )}`
      );
    }

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "FINANCE",
      action: "REFUND_PAYMENT",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: paymentId,
      targetEntityType: "Payment",
      ipAddress: ip,
      diffSummary: `Refunded ${billingService.formatPrice(result!.amountMinorUnits)} on invoice ${invoiceNumber}${reason ? ` -- ${reason}` : ""}`,
    });

    revalidatePath(`/${locale}/admin/finance`);
    redirect(`/${locale}/admin/finance?refundDone=${invoiceNumber}`);
  }

  // Server Action: Write off an unpaid invoice (accounting UNCOLLECTIBLE
  // status) -- distinct from a refund, since no money was ever collected.
  async function handleWriteOffInvoice(formData: FormData) {
    "use server";
    const currentAdmin = await requireAdminHubAccess(locale, "finance");
    const invoiceId = formData.get("invoiceId")?.toString() || "";
    const invoiceNumber = formData.get("invoiceNumber")?.toString() || "";
    const reason = formData.get("reason")?.toString().trim() || undefined;
    if (!invoiceId) return;

    await writeOffInvoice(invoiceId, reason);

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "FINANCE",
      action: "WRITE_OFF_INVOICE",
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorRole: currentAdmin.role,
      targetEntityId: invoiceId,
      targetEntityType: "Invoice",
      ipAddress: ip,
      diffSummary: `Invoice ${invoiceNumber} marked UNCOLLECTIBLE${reason ? ` -- ${reason}` : ""}`,
    });

    revalidatePath(`/${locale}/admin/finance`);
    redirect(`/${locale}/admin/finance?writeOffDone=${invoiceNumber}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              {isAr ? "لوحة الإدارة" : "Admin Operations Center"}
            </Link>
            <span>/</span>
            <span>{isAr ? "المالية والاشتراكات" : "Finance & Subscriptions"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isAr ? "لوحة الإدارة المالية والتسوية المحاسبية 📊" : "Financial Operations & Revenue Center"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr
              ? "متابعة الإيراد الشهري المتكرر (MRR)، تسويات الفواتير، كوبونات الخصم، وكتالوج الخطط الدراسية"
              : "Monitor Monthly Recurring Revenue (MRR), invoice reconciliations, promo coupons, and tuition plan catalog"}
          </p>
        </div>

        <a
          href="/api/admin/export?category=FINANCIAL&format=csv"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{isAr ? "تصدير تقرير المالية (CSV)" : "Export Financial CSV"}</span>
        </a>
      </div>

      {/* Notifications */}
      {couponSaved && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            {isAr
              ? `تم حفظ وتفعيل كود الخصم "${couponSaved}" بنجاح في المنظومة.`
              : `Coupon "${couponSaved}" saved successfully.`}
          </span>
        </div>
      )}

      {couponToggled && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3.5 text-sm text-blue-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
          <span>
            {isAr
              ? `تم تغيير حالة كود الخصم "${couponToggled}" بنجاح.`
              : `Coupon "${couponToggled}" status updated.`}
          </span>
        </div>
      )}

      {couponDeleted && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            {isAr
              ? `تم حذف كود الخصم "${couponDeleted}" بنجاح.`
              : `Coupon "${couponDeleted}" deleted.`}
          </span>
        </div>
      )}

      {planUpdated && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            {isAr
              ? "تم تحديث سعر الباقة بنجاح. سيُطبَّق على أي اشتراك جديد بدءاً من الآن."
              : "Plan updated successfully. Applies to new checkouts from now on."}
          </span>
        </div>
      )}

      {refundDone && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <Undo2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>
            {isAr ? `تم استرداد المبلغ لفاتورة ${refundDone} بنجاح.` : `Refund processed for invoice ${refundDone}.`}
          </span>
        </div>
      )}

      {refundError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm text-rose-800 flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{decodeURIComponent(refundError)}</span>
        </div>
      )}

      {writeOffDone && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-amber-800 flex items-center gap-2 shadow-sm">
          <Ban className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            {isAr
              ? `تم شطب فاتورة ${writeOffDone} كدين متعذر تحصيله.`
              : `Invoice ${writeOffDone} written off as uncollectible.`}
          </span>
        </div>
      )}

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "الإيراد الشهري المتكرر (MRR)" : "Monthly Recurring Revenue"}</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {billingService.formatPrice(overview.mrrMinorUnits)}
          </div>
          <p className="text-xs text-slate-400">
            {isAr ? "من الاشتراكات النشطة حالياً" : "From currently active subscriptions"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "إجمالي الإيرادات المحصلة" : "Total Collected Revenue"}</span>
          </div>
          <div className="text-3xl font-extrabold text-brand-600">
            {billingService.formatPrice(overview.totalRevenueMinorUnits)}
          </div>
          <p className="text-xs text-slate-400">
            {overview.paidInvoicesCount} {isAr ? "فواتير مسددة بنجاح" : "paid invoices"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "مستحقات رواتب المعلمين" : "Teacher Payroll Liabilities"}</span>
            {overview.totalTeacherLiabilityMinorUnits > 0 && (
              <span className="text-amber-500 font-bold">{isAr ? "قيد الصرف" : "Pending"}</span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {billingService.formatPrice(overview.totalTeacherLiabilityMinorUnits)}
          </div>
          <p className="text-xs text-slate-400">
            {isAr ? "التزامات رواتب غير مصروفة بعد" : "Pending teacher compensations"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isAr ? "صافي الهامش التشغيلي" : "Net Operating Margin"}</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {billingService.formatPrice(
              Math.max(0, overview.totalRevenueMinorUnits - overview.totalTeacherLiabilityMinorUnits)
            )}
          </div>
          <p className="text-xs text-slate-400">
            {isAr ? "بعد خصم أجور التدريس" : "After teacher remuneration"}
          </p>
        </div>
      </div>

      {/* Promotion & Coupon Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create / Edit Coupon Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand-600" />
            <span>{isAr ? "إضافة أو تعديل كود خصم ترويجي" : "Create or Edit Promo Coupon"}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {isAr
              ? "إنشاء كوبونات خصم بنسبة مئوية لأولياء الأمور لتطبيقها عند الدفع في Stripe"
              : "Define percentage discount coupons for parents during checkout"}
          </p>

          <form action={handleCreateOrUpdateCoupon} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "رمز الكوبون (Code)" : "Coupon Code"}
              </label>
              <input
                name="code"
                type="text"
                required
                placeholder="PROMO25"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "نسبة الخصم المئوية (%)" : "Discount Percentage (%)"}
              </label>
              <input
                name="discountPercentage"
                type="number"
                min={1}
                max={100}
                defaultValue={15}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isAr ? "وصف الكوبون" : "Description (Arabic)"}
              </label>
              <input
                name="descriptionAr"
                type="text"
                required
                placeholder="خصم خاص لمشتركي الموسم الدراسي الجديد"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={true}
                className="w-4 h-4 text-brand-600 rounded border-slate-300"
              />
              <span className="font-bold text-slate-700">
                {isAr ? "تفعيل الكوبون فوراً للاستخدام" : "Activate coupon immediately"}
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer pt-2"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{isAr ? "حفظ وتفعيل الكوبون" : "Save Coupon"}</span>
            </button>
          </form>
        </div>

        {/* Existing Coupons Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "كوبونات الخصم النشطة في المنظومة" : "Active Platform Coupons"}</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {coupons.length} {isAr ? "كوبونات مسجلة" : "Coupons"}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {coupons.map((coupon) => (
              <div key={coupon.code} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-200">
                      {coupon.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700">
                      %{coupon.discountPercentage} {isAr ? "خصم" : "OFF"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        coupon.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {coupon.isActive ? (isAr ? "نشط" : "Active") : (isAr ? "معطل" : "Inactive")}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{coupon.descriptionAr}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <form action={handleToggleCoupon}>
                    <input type="hidden" name="code" value={coupon.code} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title={coupon.isActive ? "تعطيل الكوبون" : "تفعيل الكوبون"}
                    >
                      {coupon.isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>{isAr ? "تعطيل" : "Deactivate"}</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>{isAr ? "تفعيل" : "Activate"}</span>
                        </>
                      )}
                    </button>
                  </form>

                  <form action={handleDeleteCoupon}>
                    <input type="hidden" name="code" value={coupon.code} />
                    <button
                      type="submit"
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      title={isAr ? "حذف الكوبون نهائياً" : "Delete coupon"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Plan Catalog Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>{isAr ? "كتالوج باقات الاشتراكات المعتمدة (B2C & B2B)" : "Official Subscription Plan Catalog"}</span>
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {plans.length} {isAr ? "باقات اشتراك" : "Plans"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                plan.isPopular
                  ? "border-brand-300 bg-brand-50/30 shadow-sm ring-1 ring-brand-200"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className="space-y-2">
                {plan.isPopular && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-600 text-white w-fit">
                    <Sparkles className="w-3 h-3" />
                    {isAr ? "الأكثر طلباً" : "Popular"}
                  </span>
                )}
                <h4 className="font-extrabold text-slate-900 text-sm">{plan.nameAr}</h4>
                <div className="text-xl font-black text-brand-600">
                  {billingService.formatPrice(plan.priceMinorUnits, plan.currency)}
                  <span className="text-xs text-slate-400 font-normal"> / شهرياً</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{plan.descriptionAr}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 text-[10px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>الأطفال:</span>
                  <span className="font-bold">{plan.maxChildren}</span>
                </div>
                <div className="flex justify-between">
                  <span>الحصص/أسبوع:</span>
                  <span className="font-bold">{plan.weeklySessionsPerChild}</span>
                </div>
              </div>

              <details className="mt-3 pt-3 border-t border-slate-200/60 text-[10px]">
                <summary className="cursor-pointer font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1 select-none">
                  <Pencil className="w-3 h-3" />
                  <span>{isAr ? "تعديل السعر" : "Edit price"}</span>
                </summary>
                <form action={handleUpdatePlan} className="mt-2 space-y-2">
                  <input type="hidden" name="planId" value={plan.id} />
                  <div>
                    <label className="block font-bold text-slate-600 mb-0.5">
                      {isAr ? "السعر (دولار)" : "Price (USD)"}
                    </label>
                    <input
                      type="number"
                      name="priceDollars"
                      step="0.01"
                      min="0.01"
                      defaultValue={(plan.priceMinorUnits / 100).toFixed(2)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-0.5">
                      {isAr ? "الوصف" : "Description"}
                    </label>
                    <input
                      type="text"
                      name="descriptionAr"
                      defaultValue={plan.descriptionAr}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
                  >
                    {isAr ? "حفظ السعر الجديد" : "Save new price"}
                  </button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Master Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          <span>{isAr ? `سجل الفواتير والمعاملات المالية العامة (${allInvoices.length})` : `Invoices Log (${allInvoices.length})`}</span>
        </h3>

        {allInvoices.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            {isAr
              ? "لا توجد فواتير حتى الآن. ستظهر هنا فور أول اشتراك حقيقي عبر صفحة الدفع."
              : "No invoices yet. Real subscriptions from checkout will appear here."}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between font-bold text-slate-500 uppercase tracking-wider">
              <span>{isAr ? "رقم الفاتورة والعميل" : "Invoice & Parent"}</span>
              <span>{isAr ? "التاريخ" : "Date"}</span>
              <span>{isAr ? "طريقة الدفع" : "Payment Provider"}</span>
              <span>{isAr ? "المبلغ" : "Amount"}</span>
              <span>{isAr ? "الحالة" : "Status"}</span>
            </div>

            {allInvoices.map((inv) => {
              const succeededPayment = inv.payments.find((p) => p.status === "SUCCEEDED");
              const canRefund = inv.status === "PAID" && !!succeededPayment;
              const canWriteOff = inv.status === "ISSUED" || inv.status === "DRAFT";

              return (
                <div
                  key={inv.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-800"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{inv.invoiceNumber}</span>
                    <span className="text-slate-400 text-[11px]">
                      {isAr ? "ولي الأمر: " : "Parent: "}{inv.parent.firstName} {inv.parent.lastName}
                    </span>
                  </div>

                  <span className="text-slate-500">
                    {inv.createdAt.toISOString().split("T")[0]}
                  </span>

                  <span className="text-slate-600">
                    {inv.payments[0]?.provider === "STRIPE" ? "Stripe" : inv.payments[0]?.provider || "—"}
                  </span>

                  <span className="font-bold text-slate-900 text-sm">
                    {billingService.formatPrice(inv.totalMinorUnits, inv.currency)}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full font-bold text-[11px] border w-fit ${INVOICE_STATUS_STYLES[inv.status]}`}
                  >
                    {INVOICE_STATUS_LABELS_AR[inv.status]}
                  </span>

                  {(canRefund || canWriteOff) && (
                    <div className="flex items-center gap-2">
                      {canRefund && (
                        <details className="relative">
                          <summary className="cursor-pointer list-none px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-[11px] flex items-center gap-1 select-none">
                            <Undo2 className="w-3 h-3" />
                            <span>{isAr ? "استرداد" : "Refund"}</span>
                          </summary>
                          <form
                            action={handleRefundPayment}
                            className="absolute z-10 mt-1 w-56 p-3 rounded-xl bg-white border border-slate-200 shadow-lg space-y-2 text-[11px] end-0"
                          >
                            <input type="hidden" name="paymentId" value={succeededPayment!.id} />
                            <input type="hidden" name="invoiceNumber" value={inv.invoiceNumber} />
                            <div>
                              <label className="block font-bold text-slate-600 mb-0.5">
                                {isAr ? "المبلغ (فارغ = كامل)" : "Amount (blank = full)"}
                              </label>
                              <input
                                type="number"
                                name="amountDollars"
                                step="0.01"
                                min="0.01"
                                placeholder={(inv.totalMinorUnits / 100).toFixed(2)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-600 mb-0.5">
                                {isAr ? "السبب" : "Reason"}
                              </label>
                              <input
                                type="text"
                                name="reason"
                                className="w-full px-2 py-1 rounded-lg border border-slate-200"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors"
                            >
                              {isAr ? "تأكيد الاسترداد" : "Confirm refund"}
                            </button>
                          </form>
                        </details>
                      )}

                      {canWriteOff && (
                        <details className="relative">
                          <summary className="cursor-pointer list-none px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1 select-none">
                            <Ban className="w-3 h-3" />
                            <span>{isAr ? "شطب الدين" : "Write off"}</span>
                          </summary>
                          <form
                            action={handleWriteOffInvoice}
                            className="absolute z-10 mt-1 w-56 p-3 rounded-xl bg-white border border-slate-200 shadow-lg space-y-2 text-[11px] end-0"
                          >
                            <input type="hidden" name="invoiceId" value={inv.id} />
                            <input type="hidden" name="invoiceNumber" value={inv.invoiceNumber} />
                            <div>
                              <label className="block font-bold text-slate-600 mb-0.5">
                                {isAr ? "السبب" : "Reason"}
                              </label>
                              <input
                                type="text"
                                name="reason"
                                className="w-full px-2 py-1 rounded-lg border border-slate-200"
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full py-1.5 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-800 transition-colors"
                            >
                              {isAr ? "تأكيد الشطب" : "Confirm write-off"}
                            </button>
                          </form>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
