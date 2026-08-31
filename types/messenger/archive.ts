export interface ArchiveTargetBase {
	chat_type: "user" | "group"
	chat_id: string
	unread_count: number
	last_message_preview: string | null
	last_message_time: string | null
	icon_url: string
}

export interface ArchiveUserTarget extends ArchiveTargetBase {
	chat_type: "user"
	id: string
	pkid: number
	username: string
	first_name: string | null
	last_name: string | null
}

export interface ArchiveGroupTarget extends ArchiveTargetBase {
	chat_type: "group"
	id: number
	name: string
}

export type ArchiveTarget = ArchiveUserTarget | ArchiveGroupTarget

export interface ArchiveEntry {
	id: number
	archived_at: string
	target: ArchiveTarget
}

export interface ArchiveListData {
	count: number
	total_pages: number
	limit: number
	current: number
	previous: string | null
	next: string | null
	results: ArchiveEntry[]
}
