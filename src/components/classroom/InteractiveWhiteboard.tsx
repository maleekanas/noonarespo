"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Eraser,
  RotateCcw,
  Download,
  Palette,
  Eye,
  EyeOff,
  Check,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { Channel } from "pusher-js";
import { getDictionary } from "@/lib/localization";

interface Point {
  x: number; // normalized 0..1 (fraction of canvas width) -- NOT raw pixels,
  y: number; // so a stroke lines up correctly on every participant's canvas
             // even when their window/container is a different size.
}

type WhiteboardRemoteEvent =
  | { type: "stroke-segment"; strokeId: string; points: Point[]; color: string; lineWidth: number; tool: "pen" | "eraser" }
  | { type: "stroke-end"; strokeId: string }
  | { type: "clear" };

interface InteractiveWhiteboardProps {
  locale?: string;
  /** The live class session this board belongs to. Omit for a standalone,
   *  never-synced board (kept for backward compatibility / other callers). */
  sessionId?: string;
  /** The subscribed presence-classroom channel from the parent, or null when
   *  real-time sync isn't configured / hasn't connected yet. */
  channel?: Channel | null;
  /** Whether the school has Pusher configured at all -- distinct from
   *  `channel` being briefly null while the socket connects. */
  realtimeConfigured?: boolean;
}

const FLUSH_INTERVAL_MS = 70;

function makeStrokeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function InteractiveWhiteboard({
  locale = "ar",
  sessionId,
  channel = null,
  realtimeConfigured = false,
}: InteractiveWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#4F46E5"); // Indigo default
  const [lineWidth, setLineWidth] = useState(4);
  const [showCalligraphyGuide, setShowCalligraphyGuide] = useState(true);

  // Live-sync bookkeeping (refs so they don't trigger re-renders on every point)
  const currentStrokeIdRef = useRef<string | null>(null);
  const pendingPointsRef = useRef<Point[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remoteStrokeLastPointRef = useRef<Map<string, Point>>(new Map());

  const isLive = Boolean(sessionId && realtimeConfigured);
  const dict = getDictionary(locale);
  const iw = dict.interactiveWhiteboard;

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

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const publishEvent = useCallback(
    (evt: WhiteboardRemoteEvent) => {
      if (!sessionId || !realtimeConfigured) return;
      const socketId = channel?.pusher?.connection?.socket_id;
      fetch(`/api/classroom/${sessionId}/whiteboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(socketId ? { "x-pusher-socket-id": socketId } : {}),
        },
        body: JSON.stringify(evt),
      }).catch(() => {
        // Best-effort -- a dropped broadcast just means other participants
        // miss this one batch of points; it must never interrupt drawing.
      });
    },
    [sessionId, realtimeConfigured, channel]
  );

  const toNormalized = useCallback((x: number, y: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return { x: 0, y: 0 };
    return { x: x / canvas.width, y: y / canvas.height };
  }, []);

  const fromNormalized = useCallback((p: Point): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    return { x: p.x * canvas.width, y: p.y * canvas.height };
  }, []);

  // Draws an incoming batch of already-normalized remote points onto the
  // local canvas, continuing the path from wherever that strokeId left off.
  const applyRemoteStrokeSegment = useCallback(
    (evt: Extract<WhiteboardRemoteEvent, { type: "stroke-segment" }>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx || evt.points.length === 0) return;

      ctx.strokeStyle = evt.tool === "eraser" ? "#FFFFFF" : evt.color;
      ctx.lineWidth = evt.tool === "eraser" ? evt.lineWidth * 4 : evt.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const last = remoteStrokeLastPointRef.current.get(evt.strokeId);
      const startPoint = fromNormalized(last ?? evt.points[0]);

      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      const startIndex = last ? 0 : 1;
      for (let i = startIndex; i < evt.points.length; i++) {
        const { x, y } = fromNormalized(evt.points[i]);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      remoteStrokeLastPointRef.current.set(evt.strokeId, evt.points[evt.points.length - 1]);
    },
    [fromNormalized]
  );

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Subscribe to remote whiteboard events from the rest of the class.
  useEffect(() => {
    if (!channel) return;
    const handler = (evt: WhiteboardRemoteEvent) => {
      if (evt.type === "stroke-segment") {
        applyRemoteStrokeSegment(evt);
      } else if (evt.type === "stroke-end") {
        remoteStrokeLastPointRef.current.delete(evt.strokeId);
      } else if (evt.type === "clear") {
        remoteStrokeLastPointRef.current.clear();
        clearCanvas();
      }
    };
    channel.bind("whiteboard-event", handler);
    return () => {
      channel.unbind("whiteboard-event", handler);
    };
  }, [channel, applyRemoteStrokeSegment, clearCanvas]);

  function getEventPoint(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getEventPoint(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    setIsDrawing(true);

    if (isLive) {
      currentStrokeIdRef.current = makeStrokeId();
      pendingPointsRef.current = [toNormalized(x, y)];
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      flushTimerRef.current = setInterval(() => {
        if (pendingPointsRef.current.length === 0 || !currentStrokeIdRef.current) return;
        publishEvent({
          type: "stroke-segment",
          strokeId: currentStrokeIdRef.current,
          points: pendingPointsRef.current,
          color,
          lineWidth,
          tool,
        });
        pendingPointsRef.current = [];
      }, FLUSH_INTERVAL_MS);
    }
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getEventPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (isLive) {
      pendingPointsRef.current.push(toNormalized(x, y));
    }
  }

  function stopDrawing() {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.closePath();
    }
    setIsDrawing(false);

    if (isLive && currentStrokeIdRef.current) {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      if (pendingPointsRef.current.length > 0) {
        publishEvent({
          type: "stroke-segment",
          strokeId: currentStrokeIdRef.current,
          points: pendingPointsRef.current,
          color,
          lineWidth,
          tool,
        });
        pendingPointsRef.current = [];
      }
      publishEvent({ type: "stroke-end", strokeId: currentStrokeIdRef.current });
      currentStrokeIdRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, []);

  function handleClear() {
    clearCanvas();
    if (isLive) {
      publishEvent({ type: "clear" });
    }
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
            <span>{iw.penLabel}</span>
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
            <span>{iw.eraserLabel}</span>
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
          {/* Live sync status -- honest indicator, never claims to be shared
              when it isn't actually wired up to anything. */}
          {sessionId && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${
                isLive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
              title={isLive ? iw.liveTooltip : iw.soloTooltip}
            >
              {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isLive ? iw.liveWithClassLabel : iw.soloModeLabel}</span>
            </span>
          )}

          {/* Calligraphy Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowCalligraphyGuide(!showCalligraphyGuide)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showCalligraphyGuide
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
            title={iw.ruledLinesTooltip}
          >
            {showCalligraphyGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{iw.ruledLinesLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-xl font-medium transition-colors"
            title={iw.clearTooltip}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{iw.clearLabel}</span>
          </button>

          <button
            type="button"
            onClick={downloadCanvas}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs transition-colors"
            title={iw.saveTooltip}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{iw.saveLabel}</span>
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
        <span>{iw.footerDescription}</span>
        <span className="font-mono text-[10px] text-slate-400">Canvas 2D • Touch-Ready</span>
      </div>
    </div>
  );
}
