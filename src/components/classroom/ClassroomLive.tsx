"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Video,
  Hand,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { InteractiveWhiteboard } from "@/components/classroom/InteractiveWhiteboard";
import {
  subscribeToClassroom,
  isRealtimeBrowserConfigured,
  type PresenceChannel,
} from "@/lib/integrations/realtime/pusherBrowserClient";

interface RosterEntry {
  studentId: string;
  firstName: string;
  lastName: string;
}

type ClassroomSignal =
  | { type: "hand-raise"; participantId: string; participantName: string; role: "TEACHER" | "STUDENT" }
  | { type: "hand-lower"; participantId: string; participantName: string; role: "TEACHER" | "STUDENT" }
  | { type: "reaction"; emoji: string; participantId: string; participantName: string; role: "TEACHER" | "STUDENT" }
  | { type: "star-awarded"; studentId: string; newTotalXp: number };

interface ClassroomLiveProps {
  locale: string;
  sessionId: string;
  classGroupName: string;
  teacherId: string;
  teacherName: string;
  meetingUrl: string | null;
  roster: RosterEntry[];
  viewerRole: "TEACHER" | "STUDENT";
  viewerParticipantId: string;
  viewerName: string;
  startTimeUtc: string;
  endTimeUtc: string;
  realtimeConfigured: boolean;
  onAwardStar?: (studentId: string) => Promise<{ ok: boolean; message: string }>;
}

const REACTIONS = ["🎉", "❤️", "👏", "🌟"];

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ClassroomLive({
  locale,
  sessionId,
  classGroupName,
  teacherId,
  teacherName,
  meetingUrl,
  roster,
  viewerRole,
  viewerParticipantId,
  viewerName,
  startTimeUtc,
  endTimeUtc,
  realtimeConfigured,
  onAwardStar,
}: ClassroomLiveProps) {
  const isAr = locale === "ar";
  const isLive = realtimeConfigured && isRealtimeBrowserConfigured();

  const [channel, setChannel] = useState<PresenceChannel | null>(null);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [raisedHands, setRaisedHands] = useState<Map<string, string>>(new Map()); // participantId -> name
  const [myHandRaised, setMyHandRaised] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [awarding, setAwarding] = useState<string | null>(null);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((text: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Presence connection: who's actually online right now.
  useEffect(() => {
    if (!isLive) return;
    const presenceChannel = subscribeToClassroom(sessionId);
    if (!presenceChannel) return;
    setChannel(presenceChannel);

    const syncMembers = () => {
      const ids = new Set<string>();
      presenceChannel.members.each((member: { id: string }) => {
        ids.add(member.id);
      });
      setOnlineIds(ids);
    };

    presenceChannel.bind("pusher:subscription_succeeded", syncMembers);
    presenceChannel.bind("pusher:member_added", syncMembers);
    presenceChannel.bind("pusher:member_removed", syncMembers);

    const handleSignal = (evt: ClassroomSignal) => {
      if (evt.type === "hand-raise") {
        setRaisedHands((prev) => new Map(prev).set(evt.participantId, evt.participantName));
      } else if (evt.type === "hand-lower") {
        setRaisedHands((prev) => {
          const next = new Map(prev);
          next.delete(evt.participantId);
          return next;
        });
      } else if (evt.type === "reaction") {
        pushToast(`${evt.emoji} ${evt.participantName}`);
      } else if (evt.type === "star-awarded") {
        if (evt.studentId === viewerParticipantId) {
          pushToast(isAr ? "⭐ حصلت على نجمة تشجيعية! (+15 XP)" : "⭐ You earned a participation star! (+15 XP)");
        } else {
          const student = roster.find((r) => r.studentId === evt.studentId);
          pushToast(
            `⭐ ${student ? `${student.firstName} ${student.lastName}` : (isAr ? "طالب" : "A student")} ${
              isAr ? "حصل على نجمة" : "earned a star"
            }`
          );
        }
      }
    };
    presenceChannel.bind("classroom-signal", handleSignal);

    return () => {
      presenceChannel.unbind("pusher:subscription_succeeded", syncMembers);
      presenceChannel.unbind("pusher:member_added", syncMembers);
      presenceChannel.unbind("pusher:member_removed", syncMembers);
      presenceChannel.unbind("classroom-signal", handleSignal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, sessionId]);

  const sendSignal = useCallback(
    async (payload: { type: "hand-raise" } | { type: "hand-lower" } | { type: "reaction"; emoji: string }) => {
      if (!isLive) return;
      const socketId = channel?.pusher?.connection?.socket_id;
      try {
        await fetch(`/api/classroom/${sessionId}/signal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(socketId ? { "x-pusher-socket-id": socketId } : {}),
          },
          body: JSON.stringify(payload),
        });
      } catch {
        // Best-effort -- a dropped signal isn't worth interrupting the class for.
      }
    },
    [isLive, channel, sessionId]
  );

  function toggleHand() {
    const next = !myHandRaised;
    setMyHandRaised(next);
    sendSignal(next ? { type: "hand-raise" } : { type: "hand-lower" });
  }

  async function handleAwardStar(studentId: string, name: string) {
    if (!onAwardStar || awarding) return;
    setAwarding(studentId);
    try {
      const result = await onAwardStar(studentId);
      if (result.ok) {
        pushToast(isAr ? `تم إرسال ⭐ إلى ${name}` : `Sent ⭐ to ${name}`);
      } else {
        pushToast(result.message);
      }
    } finally {
      setAwarding(null);
    }
  }

  // Real, ticking class clock derived from the session's actual scheduled
  // start/end times -- replaces a fixed "32:15 / 45:00" string that never
  // moved and had no relationship to when the class actually started.
  const [clockLabel, setClockLabel] = useState("--:-- / --:--");
  useEffect(() => {
    const start = new Date(startTimeUtc).getTime();
    const end = new Date(endTimeUtc).getTime();
    const totalSeconds = Math.max(0, (end - start) / 1000);

    function tick() {
      const now = Date.now();
      if (now < start) {
        setClockLabel(isAr ? `تبدأ خلال ${formatClock((start - now) / 1000)}` : `Starts in ${formatClock((start - now) / 1000)}`);
      } else if (now > end) {
        setClockLabel(isAr ? "انتهت الحصة" : "Session ended");
      } else {
        setClockLabel(`${formatClock((now - start) / 1000)} / ${formatClock(totalSeconds)}`);
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTimeUtc, endTimeUtc, isAr]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Classroom Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/${viewerRole === "TEACHER" ? "teacher" : "student"}`}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "" : "rotate-180"}`} />
            <span>{isAr ? "مغادرة الفصل" : "Exit Classroom"}</span>
          </Link>

          <div className="h-4 w-px bg-slate-700" />

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-bold text-sm sm:text-base text-white">{classGroupName}</h1>
            </div>
            <div className="text-[11px] text-slate-400">
              {isAr ? `المعلم: ${teacherName}` : `Teacher: ${teacherName}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{clockLabel}</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              isLive
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title={
              isLive
                ? isAr
                  ? "متزامن مباشرة مع الفصل"
                  : "Live-synced with the class"
                : isAr
                  ? "المزامنة الفورية غير متصلة"
                  : "Live sync isn't connected"
            }
          >
            {isLive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950/80 text-blue-300 border border-blue-800 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">{isAr ? "فصل آمن وخاضع للإشراف" : "COPPA Supervised"}</span>
          </span>
        </div>
      </header>

      {/* Toast feed */}
      <div className="fixed top-20 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="px-4 py-2 bg-slate-800/95 border border-slate-700 rounded-xl shadow-lg text-sm text-white animate-in fade-in slide-in-from-top-2"
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Main Classroom Layout */}
      <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full">
        {/* Stage Area: Interactive Whiteboard */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px]">
                {isAr ? "السبورة الرقمية التفاعلية" : "Interactive Whiteboard"}
              </span>
              <span>{isAr ? "كتابة الحروف وتمرين الخط" : "Calligraphy & Lesson Canvas"}</span>
            </div>

            {meetingUrl && (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isAr ? "الانضمام إلى مكالمة الفيديو المباشرة" : "Join Live Video Call"}</span>
              </a>
            )}
          </div>

          {/* Whiteboard Component */}
          <div className="flex-1">
            <InteractiveWhiteboard
              locale={locale}
              sessionId={sessionId}
              channel={channel}
              realtimeConfigured={isLive}
            />
          </div>

          {/* Bottom Student Action Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {viewerRole === "STUDENT" && (
                <button
                  type="button"
                  onClick={toggleHand}
                  disabled={!isLive}
                  title={!isLive ? (isAr ? "المزامنة الفورية غير متصلة" : "Live sync isn't connected") : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    myHandRaised
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  <span>
                    {myHandRaised
                      ? isAr
                        ? "اليد مرفوعة ✋ (اضغط للخفض)"
                        : "Hand Raised ✋ (tap to lower)"
                      : isAr
                        ? "رفع اليد للمشاركة ✋"
                        : "Raise Hand ✋"}
                  </span>
                </button>
              )}

              {viewerRole === "TEACHER" && raisedHands.size > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-amber-300 font-semibold">
                    {isAr ? "أيدٍ مرفوعة:" : "Hands raised:"}
                  </span>
                  {Array.from(raisedHands.entries()).map(([participantId, name]) => (
                    <span
                      key={participantId}
                      className="px-2 py-1 bg-amber-950/60 border border-amber-800 rounded-lg text-[11px] text-amber-200"
                    >
                      ✋ {name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">{isAr ? "تفاعل سريع:" : "Quick Reactions:"}</span>
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  disabled={!isLive}
                  onClick={() => sendSignal({ type: "reaction", emoji })}
                  title={!isLive ? (isAr ? "المزامنة الفورية غير متصلة" : "Live sync isn't connected") : undefined}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Roster & Live Participation */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          {/* Teacher Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-indigo-400" />
                {isAr ? "المعلم" : "Teacher"}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${isLive && onlineIds.has(teacherId) ? "bg-emerald-500" : "bg-slate-600"}`}
                aria-hidden="true"
                title={isLive ? (onlineIds.has(teacherId) ? (isAr ? "متصل" : "Online") : (isAr ? "غير متصل" : "Offline")) : undefined}
              />
            </div>

            <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-xl mb-1">
                👨‍🏫
              </div>
              <div className="text-xs font-bold text-white">{teacherName}</div>
              <div className="text-[10px] text-slate-400 mt-1 px-2">
                {isAr
                  ? "الصوت والفيديو المباشر عبر رابط الاجتماع أعلاه"
                  : "Live audio & video happens on the call link above"}
              </div>
            </div>
          </div>

          {/* Student Cohort Tiles -- real enrolled roster */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                {isAr ? `الطلاب المسجلون (${roster.length})` : `Enrolled Students (${roster.length})`}
              </span>
              {isLive && (
                <span className="text-[10px] text-emerald-400">{isAr ? "متصل الآن" : "online now"}</span>
              )}
            </div>

            <div className="space-y-2">
              {roster.length === 0 && (
                <p className="text-[11px] text-slate-500 py-2">
                  {isAr ? "لا يوجد طلاب مسجلون في هذا الفصل بعد." : "No students enrolled in this class yet."}
                </p>
              )}
              {roster.map((s) => {
                const isSelf = viewerRole === "STUDENT" && s.studentId === viewerParticipantId;
                const online = isLive && onlineIds.has(s.studentId);
                const handRaised = raisedHands.has(s.studentId);
                return (
                  <div
                    key={s.studentId}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${online ? "bg-emerald-500" : "bg-slate-700"}`}
                        title={isLive ? (online ? (isAr ? "متصل" : "Online") : (isAr ? "غير متصل" : "Offline")) : undefined}
                      />
                      <span className={isSelf ? "font-bold text-brand-400" : "text-slate-300"}>
                        {s.firstName} {s.lastName}
                        {isSelf ? ` (${isAr ? "أنت" : "You"})` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {handRaised && (
                        <span className="text-xs" title="Hand Raised">
                          ✋
                        </span>
                      )}
                      {viewerRole === "TEACHER" && onAwardStar && (
                        <button
                          type="button"
                          disabled={awarding === s.studentId}
                          onClick={() => handleAwardStar(s.studentId, `${s.firstName} ${s.lastName}`)}
                          title={isAr ? "منح نجمة تشجيعية (+15 XP)" : "Award participation star (+15 XP)"}
                          className="p-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-900/60 transition-colors disabled:opacity-40"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participation reward explainer */}
          {viewerRole === "STUDENT" ? (
            <div className="bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-800/80 rounded-2xl p-4 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{isAr ? "تحفيز المشاركة الفورية" : "Participation Rewards"}</span>
              </div>
              <p className="text-[11px] text-purple-200">
                {isAr
                  ? "قد يمنحك المعلم نجمة تشجيعية فورية (+15 XP) على المشاركة الجيدة."
                  : "Your teacher can award you a live participation star (+15 XP) for great engagement."}
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-800/80 rounded-2xl p-4 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? "منح النجوم" : "Awarding Stars"}</span>
              </div>
              <p className="text-[11px] text-purple-200">
                {isAr
                  ? "اضغط أيقونة النجمة بجانب اسم الطالب في القائمة لمنحه +15 XP فوراً."
                  : "Tap the star icon next to a student's name above to award them +15 XP instantly."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
