"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton({ label = "طباعة" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md hover:opacity-95 transition-all self-start sm:self-auto cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
