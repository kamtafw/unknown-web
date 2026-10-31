import type { ApiResponse } from "@/types/api"
import type {
	CreateLiveSessionCommentInput,
	CreateLiveSessionReactionInput,
	LiveSessionCommentsPage,
	LiveSessionReactionResult,
} from "@/types/events/live"
import { EventPayloadError } from "./api"
import { apiClient } from "../axios"
import {
	normalizeLiveSessionCommentsPage,
	normalizeLiveSessionReactionResult,
	normalizeLiveSessionComment,
} from "./live-normalize"

export interface LiveSessionPageParams {
	sessionId: number
	page: number
	limit: number
}

const sessionPath = (sessionId: number) => `/api/events/live-sessions/${sessionId}`

export const liveSessionApi = {
	getCommentsPage: async (
		params: LiveSessionPageParams,
		signal?: AbortSignal,
	): Promise<LiveSessionCommentsPage> => {
		const res = await apiClient.get<ApiResponse<unknown>>(
			`${sessionPath(params.sessionId)}/comments/list`,
			{ params: { page: params.page, limit: params.limit }, signal },
		)
		const page = normalizeLiveSessionCommentsPage(res.data.data, params.page)
		if (!page) throw new EventPayloadError()
		return page
	},

	postComment: async (
		sessionId: number,
		input: CreateLiveSessionCommentInput,
		signal?: AbortSignal,
	) => {
		const res = await apiClient.post<ApiResponse<unknown>>(
			`${sessionPath(sessionId)}/comments`,
			{ content: input.content.trim() },
			{ signal },
		)
		const data = res.data.data
		const comment = data && typeof data === "object" && !Array.isArray(data)
			? normalizeLiveSessionComment((data as Record<string, unknown>).comment)
			: null
		if (!comment) throw new EventPayloadError()
		return comment
	},

	postReaction: async (
		sessionId: number,
		input: CreateLiveSessionReactionInput,
		signal?: AbortSignal,
	): Promise<LiveSessionReactionResult> => {
		const res = await apiClient.post<ApiResponse<unknown>>(
			`${sessionPath(sessionId)}/reactions`,
			{ emoji: input.emoji },
			{ signal },
		)
		const result = normalizeLiveSessionReactionResult(res.data.data)
		if (!result || result.sessionId !== sessionId) throw new EventPayloadError()
		return result
	},
}
