import type { Pkid, Uuid } from "./identity"

export type StatusType = "text" | "image" | "video" | "music" | "layout"
export type StatusMediaType = "image" | "video" | "audio"

export interface StatusMedia {
	url: string
	type: StatusMediaType
	caption?: string
}

export interface StatusUser {
	id: Uuid
	pkid: Pkid
	username: string
	first_name: string
	last_name: string
	email: string
	phone_number: string
	profile_photo: string | null
}

export interface Status {
	id: number
	user: StatusUser
	status_type: StatusType
	content: string
	media: StatusMedia[] | null
	background_color: string
	expires_at: string
	is_active: boolean
	is_viewed?: boolean
	viewed_at?: string | null
	created_at: string
	updated_at: string
	views_count?: number
}

export interface StatusCollection {
	count: number
	results: Status[]
}

/** `chats/statuses/lists` is paginated (page-based, not cursor) — kept
 * distinct from StatusCollection (mine/byUser, un-paginated). */
export interface StatusFeedPage {
	count: number
	next: string | null
	previous: string | null
	results: Status[]
}

export interface StatusViewer {
	id: Uuid
	pkid: Pkid
	username: string
	first_name: string
	last_name: string
	email: string
	phone_number: string
	profile_photo: string | null
	viewed_at: string | null
}

export interface StatusViewerCollection {
	count: number
	results: StatusViewer[]
}

interface CreateTextStatusPayload {
	status_type: "text"
	content: string
	background_color: string
	duration_hours?: number
}
interface CreateMediaStatusPayload {
	status_type: Exclude<StatusType, "text">
	media: StatusMedia[]
	duration_hours?: number
}
export type CreateStatusPayload = CreateTextStatusPayload | CreateMediaStatusPayload

/** PATCH chats/statuses/:id/update — send only the fields relevant to the type. */
export interface UpdateStatusPayload {
	content?: string
	background_color?: string
	media?: StatusMedia[]
	duration_hours?: number
}
