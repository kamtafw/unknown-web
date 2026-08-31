import { ApiResponse } from "@/types/api"
import type {
	CreateStatusPayload,
	Status,
	StatusCollection,
	StatusFeedPage,
	StatusViewerCollection,
	UpdateStatusPayload,
} from "@/types/messenger"
import { apiClient } from "../axios"

export const statusApi = {
	list: (page = 1, limit = 50) =>
		apiClient
			.get<ApiResponse<StatusFeedPage>>(`/api/chats/statuses?page=${page}&limit=${limit}`)
			.then((r) => r.data.data),

	mine: () =>
		apiClient
			.get<ApiResponse<StatusCollection>>("/api/chats/statuses/mine")
			.then((r) => r.data.data),

	byUser: (userPkid: number) =>
		apiClient
			.get<ApiResponse<StatusCollection>>(`/api/chats/statuses/users/${userPkid}`)
			.then((r) => r.data.data),

	viewers: (statusId: number) =>
		apiClient
			.get<ApiResponse<StatusViewerCollection>>(`/api/chats/statuses/${statusId}/viewers`)
			.then((r) => r.data.data),

	create: (payload: CreateStatusPayload) =>
		apiClient.post<ApiResponse<Status>>("/api/chats/statuses", payload).then((r) => r.data.data),

	update: (id: number, payload: UpdateStatusPayload) =>
		apiClient
			.patch<ApiResponse<Status>>(`/api/chats/statuses/${id}/update`, payload)
			.then((r) => r.data.data),

	markViewed: (id: number) =>
		apiClient.post<ApiResponse<Status>>(`/api/chats/statuses/${id}/view`).then((r) => r.data.data),

	delete: (id: number) => apiClient.delete(`/api/chats/statuses/${id}`),

	reshare: (id: number, durationHours = 24) =>
		apiClient
			.post<ApiResponse<Status>>(`/api/chats/statuses/${id}/reshare`, {
				duration_hours: durationHours,
			})
			.then((r) => r.data.data),
}
