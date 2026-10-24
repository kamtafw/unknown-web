import { getAccessToken } from "@/lib/cookies"
import { eventNotFound, unauthenticated } from "@/lib/events/bff"
import { isEventId } from "@/lib/events/server"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest } from "next/server"

type Ctx = { params: Promise<{ eventId: string }> }

/**
 * Links and documents of one event (read-only; the backend has no per-resource routes). No query
 * is forwarded: the endpoint is not paginated. Access is decided upstream (403 when the viewer
 * is not admitted to a restricted event); the status and body are passed through unchanged.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	const { eventId } = await params
	if (!isEventId(eventId)) return eventNotFound()

	return proxyJson(`${DJANGO_API_URL}/events/${eventId}/resources`, {
		headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
		cache: "no-store",
	})
}
