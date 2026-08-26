/**
 * Chat HTTP calls, following the same `xApi = { method: () => apiClient... }`
 * convention as `userApi`/`socialApi` in lib/api.ts — kept in lib/socials/
 * instead, per the module-structure decision to keep Socials code
 * discoverable in one place rather than append to the shared file.
 *
 * Every call here hits an `app/api/...` BFF route, never Django directly.
 */

import {
	CreateCommentPayload,
	CreatePostPayload,
	CreateReplyPayload,
	FeedResponse,
	LikeContentPayload,
	RepostCommentPayload,
	RepostPayload,
	UpdatePostPayload,
	UserRepliesResponse,
} from "@/types/socials/api"
import { apiClient } from "../axios"

export const socialsApi = {
	getFeedByPath: (path: string) => apiClient.get<FeedResponse>(path).then((r) => r.data.data),

	getUserRepliesByPath: (path: string) =>
		apiClient.get<UserRepliesResponse>(path).then((r) => r.data.data),

	createPost: (payload: CreatePostPayload) =>
		apiClient.post("/api/socials/create-post", payload).then((r) => r.data),

	repost: (payload: RepostPayload) =>
		apiClient.post("/api/socials/repost", payload).then((r) => r.data),

	likeContent: (payload: LikeContentPayload) =>
		apiClient.post("/api/socials/content/like", payload).then((r) => r.data),

	likePost: (payload: { post: string }) =>
		apiClient.post("/api/socials/like-post", payload).then((r) => r.data),

	bookmarkPost: (payload: { post: string }) =>
		apiClient.post("/api/socials/bookmark-post", payload).then((r) => r.data),

	updatePost: (id: string, payload: UpdatePostPayload) =>
		apiClient.patch(`/api/socials/post/${id}`, payload).then((r) => r.data),

	deletePost: (id: string) => apiClient.delete(`/api/socials/post/${id}`).then((r) => r.data),

	togglePinnedPost: (id: string) =>
		apiClient.post(`/api/socials/post/${id}/toggle-pinned-post`).then((r) => r.data),

	uploadMedia: async (file: File) => {
		const formData = new FormData()
		formData.append("file", file)
		formData.append("folder", "post")

		const res = await apiClient.post("/api/socials/upload-media", formData, {
			timeout: 1000 * 60 * 2,
		})
		return res.data.data.media_urls
	},

	getPostDetail: (id: string) => apiClient.get(`/api/socials/post/${id}`).then((r) => r.data),

	getPostComments: (postId: string, page: number) =>
		apiClient.get(`/api/socials/post-comments/${postId}?page=${page}`).then((r) => r.data),

	/** GAP per migration doc S~8 — single comment/reply detail fetch, needed
	 * to render a focused reply's own header/permissions when opened as its
	 * own thread node (migration doc §10). No prior implementation existed. */
	getContentDetail: (id: string) => apiClient.get(`/api/socials/comment/${id}`).then((r) => r.data),

	/** direct children of any content id (comment or reply) — same call
	 * shape works at any depth, this is the "direct children" query the
	 * migration doc S~9 calls for. Paginated for parity with getPostComments;
	 * the previous single-page version is what capped the UI at depth 1. */
	getContentReplies: (parentId: string, page: number) =>
		apiClient.get(`/api/socials/comment-replies/${parentId}?page=${page}`).then((r) => r.data),

	// Comments/Replies

	likeComment: (payload: { comment: string }) =>
		apiClient.post("/api/socials/like-comment", payload).then((r) => r.data),

	repostComment: (payload: RepostCommentPayload) =>
		apiClient.post("/api/socials/repost-comment", payload).then((r) => r.data),

	/** semantic convenience wrapper — same endpoint as addReply, canonical
	 * relationship model (post_id set, parent_id absent) enforced by the
	 * payload type, not by having two different backend calls */
	addComment: (payload: CreateCommentPayload) =>
		apiClient.post("/api/socials/add-comment", payload).then((r) => r.data),

	/** semantic convenience wrapper — same endpoint as addComment, but
	 * parent_id is the direct parent (which may itself be a reply); the
	 * server derives post_id from parent_id, so it's never sent here */
	addReply: (payload: CreateReplyPayload) =>
		apiClient.post("/api/socials/add-comment", payload).then((r) => r.data),
}
