"use client";

import Pusher, { type Channel, type PresenceChannel } from "pusher-js";

/**
 * Browser-side Pusher connection for the live classroom. Only the public key
 * and cluster are needed here (both safe to expose -- they identify the app,
 * they don't authorize anything by themselves); the actual permission check
 * happens server-side in /api/realtime/classroom-auth on every subscribe.
 *
 * NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER are only set when the
 * school has actually connected a Pusher app (see RealtimeServer.ts). Callers
 * must check isRealtimeBrowserConfigured() first and fall back to a local,
 * un-synced experience when it's false -- never silently no-op a "shared"
 * feature that isn't actually shared.
 */
let cachedClient: Pusher | null = null;

export function isRealtimeBrowserConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER);
}

export function getPusherBrowserClient(): Pusher | null {
  if (!isRealtimeBrowserConfigured()) return null;
  if (!cachedClient) {
    cachedClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/realtime/classroom-auth",
    });
  }
  return cachedClient;
}

export function subscribeToClassroom(sessionId: string): PresenceChannel | null {
  const client = getPusherBrowserClient();
  if (!client) return null;
  return client.subscribe(`presence-classroom-${sessionId}`) as PresenceChannel;
}

export function unsubscribeFromClassroom(sessionId: string): void {
  cachedClient?.unsubscribe(`presence-classroom-${sessionId}`);
}

export type { Channel, PresenceChannel };
