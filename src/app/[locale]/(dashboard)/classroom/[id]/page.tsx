import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/currentUser";
import { classroomLiveService } from "@/server/services/ClassroomLiveService";
import { isRealtimeConfigured } from "@/lib/integrations/realtime/RealtimeServer";
import { ClassroomLive } from "@/components/classroom/ClassroomLive";
import { awardParticipationStar } from "./actions";

export default async function VirtualClassroomPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  // Any signed-in role can reach this far; getClassroomContext below is the
  // real gate -- only the teacher actually assigned to this session, or a
  // student actually enrolled in it, gets back a real context.
  const session = await requireSession(locale);
  const result = await classroomLiveService.getClassroomContext(id, session);

  if (result.status !== "OK") {
    // Deliberately the same "not found" for a nonexistent session id and for
    // "you're not a participant of this one" -- this never confirms or
    // denies that a given session id exists to someone who isn't in it.
    notFound();
  }

  const { context } = result;
  const boundAwardStar =
    context.viewerRole === "TEACHER"
      ? awardParticipationStar.bind(null, locale, id)
      : undefined;

  return (
    <ClassroomLive
      locale={locale}
      sessionId={id}
      classGroupName={context.classGroupName}
      teacherId={context.teacherId}
      teacherName={`${context.teacherFirstName} ${context.teacherLastName}`}
      meetingUrl={context.meetingUrl}
      roster={context.roster}
      viewerRole={context.viewerRole}
      viewerParticipantId={context.viewerParticipantId}
      viewerName={`${context.viewerFirstName} ${context.viewerLastName}`}
      startTimeUtc={context.session.startTimeUtc.toISOString()}
      endTimeUtc={context.session.endTimeUtc.toISOString()}
      realtimeConfigured={isRealtimeConfigured()}
      onAwardStar={boundAwardStar}
    />
  );
}
