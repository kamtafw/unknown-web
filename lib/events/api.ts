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
import type { Coordinates, EventsPage } from "@/types/events/api"
import { apiClient } from "../axios"
import { normalizeListData, normalizeNearbyData } from "./normalize"

export interface NearbyParams extends Coordinates {
	page: number
	limit: number
}

export interface MyEventsParams {
	search: string
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
}
