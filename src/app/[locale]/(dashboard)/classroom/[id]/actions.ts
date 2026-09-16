"use server";

import { revalidatePath } from "next/cache";
import { requireTeacherProfile } from "@/lib/auth/currentUser";
import { classroomLiveService } from "@/server/services/ClassroomLiveService";
import { gamificationService } from "@/server/services/GamificationService";
import { isRealtimeConfigured, triggerClassroomEvent } from "@/lib/integrations/realtime/RealtimeServer";

/**
 * Awards a real +15 XP participation star to a student, restricted to the
 * teacher actually assigned to this class session -- re-checked here
 * server-side rather than trusted from whatever the client claims, since
 * this is reachable as a server action from any signed-in browser.
 */
export async function awardParticipationStar(
  locale: string,
  sessionId: string,
  studentId: string
): Promise<{ ok: boolean; message: string }> {
  const { session } = await requireTeacherProfile(locale);

  const result = await classroomLiveService.getClassroomContext(sessionId, session);
  if (result.status !== "OK" || result.context.viewerRole !== "TEACHER") {
    return { ok: false, message: "Not authorized for this class session." };
  }

  const isEnrolled = result.context.roster.some((r) => r.studentId === studentId);
  if (!isEnrolled) {
    return { ok: false, message: "That student is not enrolled in this class." };
  }

  const newTotalXp = await gamificationService.awardXp(
    studentId,
    15,
    "Live class participation reward"
  );

  if (isRealtimeConfigured()) {
    await triggerClassroomEvent(sessionId, "classroom-signal", {
      type: "star-awarded",
      studentId,
      newTotalXp,
    });
  }

  revalidatePath(`/${locale}/classroom/${sessionId}`);
  revalidatePath(`/${locale}/student`);

  return { ok: true, message: "Star awarded." };
}
