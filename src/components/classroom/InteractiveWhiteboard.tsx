"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Pen,
  Eraser,
  RotateCcw,
  Download,
  Palette,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

interface InteractiveWhiteboardProps {
  locale?: string;
}

export function InteractiveWhiteboard({ locale = "ar" }: InteractiveWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#4F46E5"); // Indigo default
  const [lineWidth, setLineWidth] = useState(4);
  const [showCalligraphyGuide, setShowCalligraphyGuide] = useState(true);

  const isAr = locale === "ar";

  const colorPalette = [
    { name: "Indigo", value: "#4F46E5" },
    { name: "Emerald", value: "#059669" },
    { name: "Amber", value: "#D97706" },
    { name: "Rose", value: "#E11D48" },
    { name: "Sky Blue", value: "#0284C7" },
    { name: "Dark Slate", value: "#1E293B" },
  ];

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-DPI canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    setIsDrawing(true);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function downloadCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `arabic-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      {/* Whiteboard Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 border-b border-slate-200 text-xs">
        {/* Tool Selectors */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              tool === "pen"
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>{isAr ? "القلم" : "Pen"}</span>
          </button>

          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              tool === "eraser"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>{isAr ? "الممحاة" : "Eraser"}</span>
          </button>

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1 ps-2 border-s border-slate-200">
            {[2, 5, 10].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setLineWidth(w)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  lineWidth === w
                    ? "bg-slate-800 text-white font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
                title={`${w}px`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: `${w + 2}px`, height: `${w + 2}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        {tool === "pen" && (
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-400 me-1" />
            {colorPalette.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                  color === c.value ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : "hover:scale-105"
                }`}
                title={c.name}
              >
                {color === c.value && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Calligraphy Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowCalligraphyGuide(!showCalligraphyGuide)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showCalligraphyGuide
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
            title={isAr ? "إظهار/إخفاء أسطر كراسة الخط العربي" : "Toggle Arabic Calligraphy Notebook Ruling"}
          >
            {showCalligraphyGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isAr ? "مسطرة كراسة الخط" : "Ruled Lines"}</span>
          </button>

          <button
            type="button"
            onClick={clearCanvas}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl font-medium transition-colors"
            title={isAr ? "مسح السبورة" : "Clear"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? "مسح" : "Clear"}</span>
          </button>

          <button
            type="button"
            onClick={downloadCanvas}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs transition-colors"
            title={isAr ? "تنزيل الرسمة" : "Save"}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? "حفظ" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Canvas Area with Optional Ruled Calligraphy Background */}
      <div className="relative w-full h-[420px] bg-white cursor-crosshair select-none touch-none">
        {showCalligraphyGuide && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40 flex flex-col justify-around py-6 px-4"
            aria-hidden="true"
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative w-full border-b border-dashed border-purple-400">
                {/* Upper line for letters with ascenders like Alif, Laam, Kaaf */}
                <div className="absolute -top-6 w-full border-b border-dotted border-purple-300" />
                {/* Main baseline where letters rest */}
                <div className="w-full border-b-2 border-purple-500" />
                {/* Lower line for descenders like Raa, Zay, Meem, Waw */}
                <div className="absolute top-6 w-full border-b border-dotted border-purple-300" />
              </div>
            ))}
          </div>
        )}

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 px-4">
        <span>
          {isAr
            ? "✍️ سبورة خط تفاعلية: تدرب على كتابة الحروف العربية على السطر بدقة"
            : "✍️ Interactive Calligraphy Board: Practice Arabic letter penmanship on ruled lines"}
        </span>
        <span className="font-mono text-[10px] text-slate-400">Canvas 2D • Touch-Ready</span>
      </div>
    </div>
  );
}
