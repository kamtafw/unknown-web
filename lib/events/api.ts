/**
 * Events HTTP calls, following the same `xApi = { method: () => apiClient... }`
 * convention as `userApi` / `socialsApi`.
 *
 * Every call hits an `app/api/events/...` BFF route, never Django directly.
 * The client deliberately does NOT send `radius_km` or `filter`: the BFF pins
 * the 25 km radius and `filter=my_events`, so they cannot be omitted or changed
 * from the browser code.
 */

import type { ApiResponse } from "@/types/api"
import type {
	Coordinates,
	EventCommentsPage,
	EventDetails,
	EventGuestsPage,
	EventResources,
	EventRsvpStatus,
	EventsPage,
	EventSubmission,
	RsvpResult,
} from "@/types/events/api"
import { apiClient } from "../axios"
import { EVENT_UPLOAD_TIMEOUT_MS } from "./constants"
import {
	normalizeCommentsPage,
	normalizeEventDetails,
	normalizeGuestsPage,
	normalizeListData,
	normalizeNearbyData,
	normalizeResources,
	normalizeRsvpResult,
} from "./normalize"

/** a 2xx response whose body is not an event the app can read */
export class EventPayloadError extends Error {
	constructor() {
		super("The event response could not be read")
		this.name = "EventPayloadError"
	}
}

export interface WriteOptions {
	/** upload progress 0..1, multipart only */
	onProgress?: (fraction: number) => void
	signal?: AbortSignal
}

const eventPath = (id: string) => `/api/events/${encodeURIComponent(id)}`

function writeConfig(submission: EventSubmission, opts: WriteOptions) {
	return {
		signal: opts.signal,
		// uploads can outlast the 30 s used for JSON calls
		timeout: submission.kind === "multipart" ? EVENT_UPLOAD_TIMEOUT_MS : undefined,
		onUploadProgress:
			submission.kind === "multipart" && opts.onProgress
				? (e: { loaded: number; total?: number }) => {
						if (e.total) opts.onProgress?.(Math.min(1, e.loaded / e.total))
					}
				: undefined,
	}
}

export interface NearbyParams extends Coordinates {
	page: number
	limit: number
}

export interface MyEventsParams {
	search: string
	page: number
	limit: number
}

export interface EventPageParams {
	eventId: string
	page: number
	limit: number
}

export const eventsApi = {
	getNearbyPage: async (params: NearbyParams, signal?: AbortSignal): Promise<EventsPage> => {
		const res = await apiClient.get<ApiResponse<unknown>>("/api/events/nearby", {
			params: {
				latitude: params.latitude,
				longitude: params.longitude,
				page: params.page,
				limit: params.limit,
			},
			signal,
		})
		return normalizeNearbyData(res.data.data, params.page)
	},

	getMyEventsPage: async (params: MyEventsParams, signal?: AbortSignal): Promise<EventsPage> => {
		const res = await apiClient.get<ApiResponse<unknown>>("/api/events/my-events", {
			params: { q: params.search || undefined, page: params.page, limit: params.limit },
			signal,
		})
		return normalizeListData(res.data.data, params.page)
	},

	/** resolves to a display address, or null when the lookup failed or was empty */
	resolveAddress: async (coords: Coordinates, signal?: AbortSignal): Promise<string | null> => {
		const res = await apiClient.post<ApiResponse<{ address?: unknown } | null>>(
			"/api/events/my-location",
			{ latitude: coords.latitude, longitude: coords.longitude },
			{ signal, timeout: 10000 },
		)
		if (!res.data.success) return null
		const address = res.data.data?.address
		return typeof address === "string" && address.trim() ? address.trim() : null
	},

	/**
	 * Details for one event: a full event or a restricted preview (both HTTP 200). The
	 * normaliser decides which; a malformed body throws instead of becoming an empty event.
	 */
	getEventDetails: async (eventId: string, signal?: AbortSignal): Promise<EventDetails> => {
		const res = await apiClient.get<ApiResponse<unknown>>(eventPath(eventId), { signal })
		const details = normalizeEventDetails(res.data.data)
		if (!details) throw new EventPayloadError()
		return details
	},

	/** resolves to the created event, or null if the 201 body could not be read */
	createEvent: async (
		submission: EventSubmission,
		opts: WriteOptions = {},
	): Promise<EventDetails | null> => {
		const res = await apiClient.post<ApiResponse<unknown>>(
			"/api/events/create",
			submission.body,
			writeConfig(submission, opts),
		)
		return normalizeEventDetails(res.data.data)
	},

	updateEvent: async (
		eventId: string,
		submission: EventSubmission,
		opts: WriteOptions = {},
	): Promise<EventDetails | null> => {
		const res = await apiClient.patch<ApiResponse<unknown>>(
			eventPath(eventId),
			submission.body,
			writeConfig(submission, opts),
		)
		return normalizeEventDetails(res.data.data)
	},

	/** 204, no body */
	deleteEvent: async (eventId: string): Promise<void> => {
		await apiClient.delete(eventPath(eventId))
	},

	/** RSVP is independent of joining: no guest row, no media access */
	setRsvp: async (eventId: string, status: EventRsvpStatus): Promise<RsvpResult> => {
		const res = await apiClient.post<ApiResponse<unknown>>("/api/events/rsvp", {
			event_id: eventId,
			status,
		})
		// a 201 means it was saved; fall back to what was asked if the body is unreadable
		return normalizeRsvpResult(res.data.data) ?? { eventId, status }
	},

	/**
	 * Links and documents of an event the viewer can open. A body that is not the documented
	 * shape throws `EventPayloadError`; an empty list is a real, empty result.
	 */
	getEventResources: async (eventId: string, signal?: AbortSignal): Promise<EventResources> => {
		const res = await apiClient.get<ApiResponse<unknown>>(`${eventPath(eventId)}/resources`, {
			signal,
		})
		const resources = normalizeResources(res.data.data)
		if (!resources) throw new EventPayloadError()
		return resources
	},

	/** one page of event comments, newest first; `hasNext` comes from the backend `next` link */
	getEventCommentsPage: async (
		params: EventPageParams,
		signal?: AbortSignal,
	): Promise<EventCommentsPage> => {
		const res = await apiClient.get<ApiResponse<unknown>>(`${eventPath(params.eventId)}/comments`, {
			params: { page: params.page, limit: params.limit },
			signal,
		})
		const page = normalizeCommentsPage(res.data.data, params.page)
		if (!page) throw new EventPayloadError()
		return page
	},

	/**
	 * Posts a comment (trimmed). Success is a 201 with no comment in it (no id, author or time), so
	 * nothing is returned: the thread is refetched. Who may post is the backend's decision.
	 */
	postEventComment: async (
		eventId: string,
		message: string,
		signal?: AbortSignal,
	): Promise<void> => {
		await apiClient.post(`${eventPath(eventId)}/comments`, { message: message.trim() }, { signal })
	},

	/** one page of event guests, newest first. The backend answers 403 to anyone without a guest record */
	getEventGuestsPage: async (
		params: EventPageParams,
		signal?: AbortSignal,
	): Promise<EventGuestsPage> => {
		const res = await apiClient.get<ApiResponse<unknown>>(`${eventPath(params.eventId)}/guests`, {
			params: { page: params.page, limit: params.limit },
			signal,
		})
		const page = normalizeGuestsPage(res.data.data, params.page)
		if (!page) throw new EventPayloadError()
		return page
	},
}
