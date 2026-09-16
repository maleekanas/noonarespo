import Pusher from "pusher";

/**
 * Server-side wrapper around Pusher Channels -- the real-time transport for
 * the live classroom (shared whiteboard, presence roster, hand-raise, and
 * reaction broadcasts). Vercel's serverless functions cannot hold an open
 * WebSocket server themselves, so a hosted pub/sub service is the only
 * practical way to get genuine real-time sync out of this deployment target.
 *
 * Follows the same pattern as the meeting-platform adapters: isConfigured()
 * gates every real call, and every caller must handle the "not configured"
 * case honestly (classroom features fall back to a clearly-labeled solo/local
 * mode -- they never pretend to be synced when they are not).
 */
let cachedClient: Pusher | null = null;

// Pusher's "key" and "cluster" are not secrets -- they're the same public app
// identifiers the browser SDK sends directly, which is why they're read from
// the NEXT_PUBLIC_-prefixed vars here too (Next.js exposes those to server
// code the same as any other env var, it just *also* inlines them into the
// client bundle). Only PUSHER_APP_ID/PUSHER_SECRET are genuinely server-only.
// This keeps setup to 4 variables instead of 6 duplicated ones.
export function isRealtimeConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_SECRET &&
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  );
}

function getPusherServerClient(): Pusher {
  if (!isRealtimeConfigured()) {
    throw new Error(
      "Pusher is not configured (PUSHER_APP_ID / PUSHER_SECRET / NEXT_PUBLIC_PUSHER_KEY / " +
      "NEXT_PUBLIC_PUSHER_CLUSTER). Call isRealtimeConfigured() before using this client."
    );
  }
  if (!cachedClient) {
    cachedClient = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return cachedClient;
}

export function classroomChannelName(sessionId: string): string {
  // A presence channel gives every subscriber's identity (via authorizeChannel
  // below) plus automatic join/leave events, which is what powers the "who's
  // actually online right now" roster -- for free, with no extra event wiring.
  return `presence-classroom-${sessionId}`;
}

/**
 * Broadcasts an event to everyone subscribed to a classroom's channel.
 * excludeSocketId lets the sender skip its own echo (Pusher would otherwise
 * deliver the event back to the same browser connection that triggered it,
 * which would double-draw a stroke the sender already drew locally).
 * Silently no-ops when Pusher isn't configured -- callers only reach here
 * after already checking isRealtimeConfigured() for their own honest UI
 * fallback, so a throw here would just be a redundant, noisier failure mode.
 */
export async function triggerClassroomEvent(
  sessionId: string,
  event: string,
  data: unknown,
  excludeSocketId?: string
): Promise<void> {
  if (!isRealtimeConfigured()) return;
  try {
    await getPusherServerClient().trigger(classroomChannelName(sessionId), event, data, {
      socket_id: excludeSocketId,
    });
  } catch (err) {
    // A dropped real-time broadcast should never break the underlying action
    // (drawing a stroke, raising a hand, awarding XP) -- it just means other
    // participants miss that one live update.
    console.error(`[RealtimeServer] failed to broadcast "${event}" for session ${sessionId}`, err);
  }
}

export interface ClassroomPresenceIdentity {
  userId: string;
  name: string;
  role: "TEACHER" | "STUDENT";
}

/**
 * Authorizes a browser's subscription to a specific classroom's presence
 * channel. The caller is responsible for verifying (server-side, against the
 * real enrollment/assignment data) that this person is actually allowed into
 * this specific session before calling this -- this function only signs the
 * channel grant, it does not itself decide who is allowed in.
 */
export function authorizeClassroomChannel(
  socketId: string,
  channelName: string,
  identity: ClassroomPresenceIdentity
): Pusher.ChannelAuthResponse {
  return getPusherServerClient().authorizeChannel(socketId, channelName, {
    user_id: identity.userId,
    user_info: { name: identity.name, role: identity.role },
  });
}
