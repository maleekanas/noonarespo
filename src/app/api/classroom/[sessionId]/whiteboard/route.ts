import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { classroomLiveService } from "@/server/services/ClassroomLiveService";
import { isRealtimeConfigured, triggerClassroomEvent } from "@/lib/integrations/realtime/RealtimeServer";

export const runtime = "nodejs";

const PointSchema = z.object({ x: z.number(), y: z.number() });

const WhiteboardEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("stroke-segment"),
    strokeId: z.string().min(1).max(64),
    points: z.array(PointSchema).min(1).max(200),
    color: z.string().min(1).max(16),
    lineWidth: z.number().min(1).max(60),
    tool: z.enum(["pen", "eraser"]),
  }),
  z.object({ type: z.literal("stroke-end"), strokeId: z.string().min(1).max(64) }),
  z.object({ type: z.literal("clear") }),
]);

/**
 * Broadcasts one whiteboard drawing event (a batch of points along the
 * current stroke, a stroke finishing, or a clear) to every other participant
 * in this class session's live channel. This is what makes the whiteboard
 * actually shared -- previously every participant only ever saw strokes
 * drawn on their own local <canvas>, with nothing sent anywhere.
 *
 * Re-checks authorization on every call (never trusts the caller's claimed
 * role/session) since this is a public endpoint reachable by any signed-in
 * user who can construct the URL.
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

  const authorized = await classroomLiveService.isAuthorizedParticipant(sessionId, sessionUser);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isRealtimeConfigured()) {
    // The classroom is honestly running in local/solo mode -- there is
    // nothing to broadcast, and the caller's own canvas already has the
    // stroke, so this isn't an error.
    return NextResponse.json({ broadcast: false });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = WhiteboardEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid whiteboard event" }, { status: 400 });
  }

  // Excludes the sender's own connection so their browser doesn't receive
  // (and re-draw) the stroke it just sent -- it already drew it locally.
  const senderSocketId = request.headers.get("x-pusher-socket-id") || undefined;
  await triggerClassroomEvent(sessionId, "whiteboard-event", parsed.data, senderSocketId);

  return NextResponse.json({ broadcast: true });
}
