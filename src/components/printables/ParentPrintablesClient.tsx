"use client";

import React, { useState } from "react";
import {
  Printer,
  FileText,
  QrCode,
  Eye,
  X,
} from "lucide-react";
import {
  PrintablePacket,
  PrintableCategory,
} from "@/server/repositories/PrintablesRepository";
import { getDictionary } from "@/lib/localization";

interface ParentPrintablesClientProps {
  initialPrintables: PrintablePacket[];
  locale: string;
}

export function ParentPrintablesClient({
  initialPrintables,
  locale,
}: ParentPrintablesClientProps) {
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const pp = dict.parentPrintablesClient;
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activePreviewPacket, setActivePreviewPacket] =
    useState<PrintablePacket | null>(null);

  const categories = [
    { id: "ALL", label: pp.categoryAllLabel },
    { id: "HANDWRITING_TRACING", label: pp.categoryHandwritingLabel },
    { id: "COLORING_HARAKAT", label: pp.categoryColoringLabel },
    { id: "PROPHETIC_COMICS", label: pp.categoryPropheticLabel },
    { id: "VOCABULARY_FLASHCARDS", label: pp.categoryVocabularyLabel },
  ];

  const filteredPrintables =
    selectedCategory === "ALL"
      ? initialPrintables
      : initialPrintables.filter((p) => p.category === (selectedCategory as PrintableCategory));

  function handleTriggerPrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="space-y-8">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shrink-0 ${
              selectedCategory === cat.id
                ? "bg-brand-600 text-white shadow-md shadow-brand-100 scale-105"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Printable Packets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrintables.map((packet) => (
          <div
            key={packet.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Header Banner */}
              <div className="h-36 bg-gradient-to-tr from-amber-50 via-sky-50 to-indigo-50 flex items-center justify-center relative border-b border-slate-100">
                <span className="text-6xl transform group-hover:scale-110 transition-transform select-none">
                  {packet.thumbnailEmoji}
                </span>

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-700 shadow-sm border border-slate-200">
                  {packet.categoryNameAr}
                </div>

                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {packet.paperFormat === "A4_PORTRAIT" ? pp.paperFormatPortraitLabel : pp.paperFormatLandscapeLabel}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                    {packet.pageCount} {pp.printReadyPagesLabel}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {pp.targetLabel} {packet.targetAgeGroup}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 mb-1 leading-snug">
                  {packet.titleAr}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  {packet.titleEn}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                  {isAr ? packet.descriptionAr : packet.descriptionEn}
                </p>

                {/* QR Integration Tag */}
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                  <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">
                    {pp.qrEmbeddedHint}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActivePreviewPacket(packet)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>{pp.previewButton}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePreviewPacket(packet);
                  setTimeout(() => handleTriggerPrint(), 300);
                }}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-brand-100 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{pp.printButton}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Printable Sheet Preview Modal */}
      {activePreviewPacket && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header Bar (Hidden during print) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {activePreviewPacket.titleAr}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {pp.modalSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>{pp.printNowButton}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewPacket(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Document Sheet Simulator */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 bg-slate-50 print:bg-white print:p-0">
              <div
                id="printable-a4-sheet"
                className="bg-white max-w-2xl mx-auto p-8 rounded-2xl shadow-md border-2 border-slate-300 print:border-none print:shadow-none print:p-4 print:max-w-none space-y-6 text-slate-900"
              >
                {/* Official Printable Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">
                      {pp.worksheetTaglineLabel}
                    </div>
                    <div className="text-base font-black text-slate-900">
                      Kids Arabic Academy • {pp.homeLearningBookletLabel}
                    </div>
                  </div>
                  <div className="text-3xl">🌟</div>
                  <div className="text-left text-xs font-medium text-slate-600">
                    <div>
                      {pp.pageOfTemplate
                        .replace("{current}", "1")
                        .replace("{total}", String(activePreviewPacket.pageCount))}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">FORMAT: A4</div>
                  </div>
                </div>

                {/* Student Info Fields for Pen Practice */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">{pp.studentNameLabel}</span>
                    <span className="flex-1 border-b border-dotted border-slate-400 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">{pp.dateLabel}</span>
                    <span className="flex-1 border-b border-dotted border-slate-400 h-4" />
                  </div>
                </div>

                {/* Document Main Title */}
                <div className="text-center py-2">
                  <h2 className="text-xl font-black text-slate-900 mb-1">
                    {activePreviewPacket.titleAr}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {activePreviewPacket.descriptionAr}
                  </p>
                </div>

                {/* Tracing & Activity Items */}
                <div className="space-y-6">
                  {activePreviewPacket.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-300 rounded-2xl p-4 bg-white space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.illustrationEmoji || "✏️"}</span>
                          <span className="font-black text-sm text-slate-900">{item.titleAr}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.guideTextAr}
                        </span>
                      </div>

                      {/* Character Tracing Guidelines */}
                      <div className="space-y-3">
                        {Array.from({ length: item.practiceLinesCount }).map((_, lineIdx) => (
                          <div
                            key={lineIdx}
                            className="relative h-14 border-b-2 border-slate-800 flex items-center px-4 justify-between bg-slate-50/50"
                          >
                            {/* Dotted Midline Guide for Arabic Naskh */}
                            <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-sky-300 pointer-events-none" />

                            {item.sampleCharacters.map((char, cIdx) => (
                              <div
                                key={cIdx}
                                className={`text-2xl font-black z-10 ${
                                  lineIdx === 0
                                    ? "text-slate-900"
                                    : "text-slate-300 border-b border-dotted border-slate-400"
                                }`}
                              >
                                {char}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* QR Code Verification & Audio Link Footer */}
                <div className="border-2 border-emerald-500 rounded-2xl p-4 bg-emerald-50/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white border border-slate-300 rounded-xl flex items-center justify-center p-1 shrink-0 shadow-sm">
                      {/* Stylized QR Code Graphic */}
                      <div className="w-full h-full border-2 border-slate-900 p-1 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-3 h-3 bg-slate-900" />
                          <div className="w-3 h-3 bg-slate-900" />
                        </div>
                        <div className="text-[8px] font-black font-mono text-center">ARABIC</div>
                        <div className="flex justify-between">
                          <div className="w-3 h-3 bg-slate-900" />
                          <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-950">
                        {activePreviewPacket.qrCodeLabelAr}
                      </div>
                      <div className="text-[11px] text-emerald-800 font-medium">
                        {pp.qrScanInstructions}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-bold text-slate-500">
                    <div>{pp.masteryLevelLabel}</div>
                    <div className="text-amber-500 text-base">⭐⭐⭐⭐⭐</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
