import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { classroomLiveService } from "@/server/services/ClassroomLiveService";
import { isRealtimeConfigured, triggerClassroomEvent } from "@/lib/integrations/realtime/RealtimeServer";

export const runtime = "nodejs";

const SignalRequestSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hand-raise") }),
  z.object({ type: z.literal("hand-lower") }),
  z.object({ type: z.literal("reaction"), emoji: z.string().min(1).max(8) }),
]);

/**
 * Broadcasts a lightweight classroom signal (hand raised/lowered, a quick
 * reaction) to every other participant. Identity is always attached
 * server-side from the authorized viewer, never taken from the request body
 * -- a student can't raise someone else's hand or send a reaction under
 * another participant's name by editing the payload.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await classroomLiveService.getClassroomContext(sessionId, sessionUser);
  if (result.status !== "OK") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isRealtimeConfigured()) {
    return NextResponse.json({ broadcast: false });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SignalRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signal" }, { status: 400 });
  }

  const { context } = result;
  const senderSocketId = request.headers.get("x-pusher-socket-id") || undefined;
  await triggerClassroomEvent(
    sessionId,
    "classroom-signal",
    {
      ...parsed.data,
      participantId: context.viewerParticipantId,
      participantName: `${context.viewerFirstName} ${context.viewerLastName}`.trim(),
      role: context.viewerRole,
    },
    senderSocketId
  );

  return NextResponse.json({ broadcast: true });
}
