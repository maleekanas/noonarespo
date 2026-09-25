"use client";

import React, { useState, useTransition } from "react";
import {
  Search,
  Download,
  FileText,
  Tag,
  Percent,
  Undo2,
  Ban,
  Check,
  X,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { InvoiceStatus } from "@prisma/client";

export interface InvoiceDisplayItem {
  id: string;
  invoiceNumber: string;
  parentName: string;
  parentEmail: string;
  totalMinorUnits: number;
  currency: string;
  status: InvoiceStatus;
  createdAt: string;
  provider: string;
  paymentId?: string;
  canRefund: boolean;
  canWriteOff: boolean;
}

export interface CouponDisplayItem {
  code: string;
  discountPercentage: number;
  descriptionAr: string;
  isActive: boolean;
}

interface FinanceManagementClientProps {
  initialInvoices: InvoiceDisplayItem[];
  initialCoupons: CouponDisplayItem[];
  locale: string;
  onSaveCoupon: (formData: FormData) => Promise<any>;
  onToggleCoupon: (code: string) => Promise<any>;
  onDeleteCoupon: (code: string) => Promise<any>;
  onRefundPayment: (formData: FormData) => Promise<any>;
  onWriteOffInvoice: (formData: FormData) => Promise<any>;
}

export function FinanceManagementClient({
  initialInvoices,
  initialCoupons,
  locale,
  onSaveCoupon,
  onToggleCoupon,
  onDeleteCoupon,
  onRefundPayment,
  onWriteOffInvoice,
}: FinanceManagementClientProps) {
  const isAr = locale === "ar";
  const [invoices, setInvoices] = useState<InvoiceDisplayItem[]>(initialInvoices);
  const [coupons, setCoupons] = useState<CouponDisplayItem[]>(initialCoupons);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modals state
  const [refundModalInvoice, setRefundModalInvoice] = useState<InvoiceDisplayItem | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const [writeOffModalInvoice, setWriteOffModalInvoice] = useState<InvoiceDisplayItem | null>(null);
  const [writeOffReason, setWriteOffReason] = useState("");

  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponDesc, setNewCouponDesc] = useState("");

  const STATUS_LABELS: Record<InvoiceStatus, { ar: string; en: string; style: string }> = {
    DRAFT: { ar: "مسودة", en: "Draft", style: "bg-slate-50 text-slate-600 border-slate-200" },
    ISSUED: { ar: "بانتظار السداد", en: "Issued", style: "bg-amber-50 text-amber-700 border-amber-200" },
    PAID: { ar: "مسددة بالكامل", en: "Paid", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    VOID: { ar: "ملغاة", en: "Void", style: "bg-slate-100 text-slate-400 border-slate-200" },
    UNCOLLECTIBLE: { ar: "متعذر تحصيلها", en: "Uncollectible", style: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.parentName.toLowerCase().includes(q) ||
      inv.parentEmail.toLowerCase().includes(q) ||
      inv.provider.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === "ALL" || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Export CSV
  function handleExportCsv() {
    const headers = [
      "Invoice Number",
      "Parent Name",
      "Parent Email",
      "Amount",
      "Currency",
      "Status",
      "Date",
      "Payment Provider",
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.parentName.replace(/"/g, '""')}"`,
      `"${inv.parentEmail.replace(/"/g, '""')}"`,
      (inv.totalMinorUnits / 100).toFixed(2),
      inv.currency,
      inv.status,
      inv.createdAt,
      inv.provider,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoices_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Toggle Coupon Action
  function handleToggleCouponClick(code: string) {
    startTransition(async () => {
      try {
        await onToggleCoupon(code);
        setCoupons((prev) =>
          prev.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
        );
        setActionMessage(isAr ? "تم تحديث حالة الكوبون بنجاح" : "Coupon status updated");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to toggle coupon");
      }
    });
  }

  // Delete Coupon Action
  function handleDeleteCouponClick(code: string) {
    if (!confirm(isAr ? `حذف الكوبون [${code}] نهائياً؟` : `Delete coupon [${code}] permanently?`))
      return;

    startTransition(async () => {
      try {
        await onDeleteCoupon(code);
        setCoupons((prev) => prev.filter((c) => c.code !== code));
        setActionMessage(isAr ? "تم حذف الكوبون بنجاح" : "Coupon deleted successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to delete coupon");
      }
    });
  }

  // Save Coupon Action
  function handleSaveCouponSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = newCouponCode.trim().toUpperCase();
    if (!code) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("code", code);
        formData.append("discountPercentage", String(newCouponDiscount));
        formData.append("descriptionAr", newCouponDesc.trim() || `خصم ${newCouponDiscount}%`);
        formData.append("isActive", "on");

        await onSaveCoupon(formData);

        setCoupons((prev) => [
          {
            code,
            discountPercentage: newCouponDiscount,
            descriptionAr: newCouponDesc.trim() || `خصم ${newCouponDiscount}%`,
            isActive: true,
          },
          ...prev.filter((c) => c.code !== code),
        ]);

        setShowAddCouponModal(false);
        setNewCouponCode("");
        setActionMessage(isAr ? "تم حفظ وتفعيل الكوبون بنجاح" : "Coupon saved successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to save coupon");
      }
    });
  }

  // Refund Action
  function handleRefundSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refundModalInvoice || !refundModalInvoice.paymentId) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("paymentId", refundModalInvoice.paymentId!);
        formData.append("invoiceNumber", refundModalInvoice.invoiceNumber);
        if (refundAmount) formData.append("amountDollars", refundAmount);
        if (refundReason) formData.append("reason", refundReason);

        await onRefundPayment(formData);

        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === refundModalInvoice.id ? { ...inv, status: "VOID" } : inv
          )
        );

        setRefundModalInvoice(null);
        setActionMessage(isAr ? "تم معالجة الاسترداد بنجاح" : "Refund processed successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to process refund");
      }
    });
  }

  // Write-Off Action
  function handleWriteOffSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!writeOffModalInvoice) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("invoiceId", writeOffModalInvoice.id);
        formData.append("invoiceNumber", writeOffModalInvoice.invoiceNumber);
        if (writeOffReason) formData.append("reason", writeOffReason);

        await onWriteOffInvoice(formData);

        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === writeOffModalInvoice.id ? { ...inv, status: "UNCOLLECTIBLE" } : inv
          )
        );

        setWriteOffModalInvoice(null);
        setActionMessage(isAr ? "تم شطب الفاتورة بنجاح" : "Invoice written off successfully");
        setTimeout(() => setActionMessage(null), 4000);
      } catch (err: any) {
        alert(err?.message || "Failed to write off invoice");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Toast Notice */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Coupons Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
            <Percent className="w-5 h-5 text-emerald-600" />
            <span>{isAr ? "كوبونات الخصم والعروض الترويجية" : "Coupons & Promotional Codes"}</span>
          </div>
          <button
            onClick={() => setShowAddCouponModal(true)}
            className="px-3.5 py-1.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95 flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isAr ? "إضافة كوبون" : "Add Coupon"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-white text-slate-900 border border-slate-200">
                    {c.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    %{c.discountPercentage} {isAr ? "خصم" : "OFF"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{c.descriptionAr}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleCouponClick(c.code)}
                  title={c.isActive ? (isAr ? "تعطيل الكوبون" : "Deactivate") : isAr ? "تفعيل الكوبون" : "Activate"}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                >
                  {c.isActive ? (
                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCouponClick(c.code)}
                  title={isAr ? "حذف الكوبون" : "Delete"}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices Ledger with Search, Multi-Filter & CSV Export */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? "بحث برقم الفاتورة، ولي الأمر..." : "Search invoice, parent..."}
                className="w-full pl-9 pr-4 py-2.5 rtl:pr-9 rtl:pl-4 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-52">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label={isAr ? "تصفية حسب حالة الفاتورة" : "Filter by invoice status"}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="ALL">{isAr ? "جميع الحالات" : "All Invoice Statuses"}</option>
                {Object.entries(STATUS_LABELS).map(([st, conf]) => (
                  <option key={st} value={st}>
                    {isAr ? conf.ar : conf.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 text-sm font-bold flex items-center gap-2 transition-all shadow-sm self-end md:self-auto"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isAr ? "تصدير الفواتير (CSV)" : "Export Invoices"}</span>
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{isAr ? "رقم الفاتورة" : "Invoice #"}</th>
                  <th className="px-6 py-4">{isAr ? "العميل / ولي الأمر" : "Customer / Parent"}</th>
                  <th className="px-6 py-4">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="px-6 py-4">{isAr ? "بوابة الدفع" : "Provider"}</th>
                  <th className="px-6 py-4">{isAr ? "المبلغ الإجمالي" : "Total Amount"}</th>
                  <th className="px-6 py-4">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-6 py-4 text-center">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <span>{isAr ? "لا توجد فواتير تطابق شروط البحث" : "No invoices match your filter"}</span>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const statusConf = STATUS_LABELS[inv.status] || STATUS_LABELS.DRAFT;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Invoice Number */}
                        <td className="px-6 py-4">
                          <span className="font-mono font-extrabold text-slate-900 text-xs">
                            {inv.invoiceNumber}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{inv.parentName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{inv.parentEmail}</div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs text-slate-500">{inv.createdAt}</td>

                        {/* Provider */}
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                            {inv.provider}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {(inv.totalMinorUnits / 100).toFixed(2)} {inv.currency}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${statusConf.style}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {isAr ? statusConf.ar : statusConf.en}
                          </span>
                        </td>

                        {/* Actions: Refund or Write-Off */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {inv.canRefund && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRefundModalInvoice(inv);
                                  setRefundAmount("");
                                  setRefundReason("");
                                }}
                                title={isAr ? "استرداد المبلغ" : "Refund"}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold flex items-center gap-1"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                                <span>{isAr ? "استرداد" : "Refund"}</span>
                              </button>
                            )}

                            {inv.canWriteOff && (
                              <button
                                type="button"
                                onClick={() => {
                                  setWriteOffModalInvoice(inv);
                                  setWriteOffReason("");
                                }}
                                title={isAr ? "شطب الفاتورة" : "Write-Off"}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>{isAr ? "شطب" : "Write-Off"}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: ADD COUPON --- */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Tag className="w-5 h-5 text-brand-600" />
                <span>{isAr ? "إضافة كوبون خصم جديد" : "Create New Coupon"}</span>
              </div>
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCouponSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "رمز الكوبون (Code)" : "Coupon Code"}
                </label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="EID2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "نسبة الخصم (%)" : "Discount Percentage (%)"}
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(parseInt(e.target.value, 10) || 10)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "الوصف الترويجي" : "Description"}
                </label>
                <input
                  type="text"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  placeholder={isAr ? "خصم بمناسبة العيد السعيد" : "Special holiday discount"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCouponModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95"
                >
                  {isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ وتفعيل الكوبون" : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REFUND PAYMENT --- */}
      {refundModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
                <Undo2 className="w-5 h-5" />
                <span>{isAr ? "معالجة استرداد مالي (Refund)" : "Process Payment Refund"}</span>
              </div>
              <button
                onClick={() => setRefundModalInvoice(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                {isAr
                  ? `استرداد دفعة الفاتورة رقم [${refundModalInvoice.invoiceNumber}] للعميل [${refundModalInvoice.parentName}].`
                  : `Refund payment for invoice [${refundModalInvoice.invoiceNumber}].`}
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "المبلغ المسترد بالدولار (فارغ = كامل المبلغ)" : "Refund Amount ($) (Blank = Full)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={(refundModalInvoice.totalMinorUnits / 100).toFixed(2)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "سبب الاسترداد" : "Reason"}
                </label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder={isAr ? "طلب ولي الأمر خلال مهلة الضمان..." : "Customer request within refund window..."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRefundModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm hover:bg-rose-700"
                >
                  {isPending ? (isAr ? "جاري الاسترداد..." : "Processing...") : isAr ? "تأكيد الاسترداد" : "Confirm Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: WRITE-OFF INVOICE --- */}
      {writeOffModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Ban className="w-5 h-5 text-slate-600" />
                <span>{isAr ? "شطب الفاتورة كدين متعذر تحصيله" : "Write Off Invoice"}</span>
              </div>
              <button
                onClick={() => setWriteOffModalInvoice(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWriteOffSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                {isAr
                  ? `هل أنت متأكد من شطب الفاتورة [${writeOffModalInvoice.invoiceNumber}]؟ سيتم تحويل حالتها إلى "متعذر تحصيلها" وإيقاف المطالبة.`
                  : `Are you sure you want to write off invoice [${writeOffModalInvoice.invoiceNumber}] as uncollectible?`}
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "سبب الشطب" : "Reason"}
                </label>
                <input
                  type="text"
                  required
                  value={writeOffReason}
                  onChange={(e) => setWriteOffReason(e.target.value)}
                  placeholder={isAr ? "تعذر التواصل مع العميل..." : "Unreachable customer..."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWriteOffModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800"
                >
                  {isPending ? (isAr ? "جاري الشطب..." : "Processing...") : isAr ? "تأكيد الشطب" : "Confirm Write-Off"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
