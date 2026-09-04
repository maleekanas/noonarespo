import React from "react";
import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <SearchX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-brand-600 block">404</span>
          <h2 className="text-xl font-extrabold text-slate-900">
            الصفحة غير موجودة
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو تغيير رابطها.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>العودة إلى الصفحة الرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
