import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { classroomLiveService } from "@/server/services/ClassroomLiveService";
import {
  authorizeClassroomChannel,
  isRealtimeConfigured,
} from "@/lib/integrations/realtime/RealtimeServer";

// Must run on the Node.js runtime -- Pusher's server SDK signs the auth
// response with Node's crypto module.
export const runtime = "nodejs";

const CHANNEL_NAME_PATTERN = /^presence-classroom-(.+)$/;

/**
 * Pusher's presence-channel authorization endpoint. pusher-js calls this
 * automatically (see authEndpoint in pusherBrowserClient.ts) every time a
 * browser tries to subscribe to a `presence-classroom-{sessionId}` channel.
 *
 * This is the actual access-control boundary for the live classroom: the
 * channel name alone doesn't prove anything, so every request re-derives
 * whether the signed-in cookie session is genuinely the assigned teacher or
 * an actively enrolled student of *that* class session before signing a
 * grant -- a guessed or shared sessionId gets a 403, not a channel.
 */
export async function POST(request: NextRequest) {
  if (!isRealtimeConfigured()) {
    return NextResponse.json({ error: "Realtime sync is not configured" }, { status: 503 });
  }

  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const socketId = form.get("socket_id")?.toString();
  const channelName = form.get("channel_name")?.toString();
  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
  }

  const match = channelName.match(CHANNEL_NAME_PATTERN);
  if (!match) {
    return NextResponse.json({ error: "Unrecognized channel" }, { status: 400 });
  }
  const sessionId = match[1];

  const result = await classroomLiveService.getClassroomContext(sessionId, sessionUser);
  if (result.status !== "OK") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { context } = result;
  const authResponse = authorizeClassroomChannel(socketId, channelName, {
    userId: context.viewerParticipantId,
    name: `${context.viewerFirstName} ${context.viewerLastName}`.trim(),
    role: context.viewerRole,
  });

  return NextResponse.json(authResponse);
}
