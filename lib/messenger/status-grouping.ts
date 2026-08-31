import type { Status, StatusUser } from "@/types/messenger"

export interface StatusListEntry {
	id: string
	user: StatusUser
	name: string
	avatarUrl: string | null
	timestamp: string
	totalSegments: number
	viewedSegments: number
	isMuted: boolean
	stories: Status[]
}

export interface GroupedStatuses {
	recent: StatusListEntry[]
	viewed: StatusListEntry[]
	muted: StatusListEntry[]
}

function fullName(user: StatusUser): string {
	const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
	return name || user.username || "Unknown"
}

function formatRelativeTime(iso: string): string {
	const then = new Date(iso).getTime()
	if (Number.isNaN(then)) return ""
	const mins = Math.floor((Date.now() - then) / 60_000)
	if (mins < 1) return "just now"
	if (mins < 60) return `${mins}m ago`
	const hours = Math.floor(mins / 60)
	if (hours < 24) return `${hours}h ago`
	return `${Math.floor(hours / 24)}d ago`
}

/** Groups statuses by author, sorted newest-first within each group, then
 * buckets authors into recent/viewed/muted — ported verbatim from
 * mobile's bucket rules. */
export function groupStatusesByUser(
	statuses: Status[],
	mutedPkids: Set<number>,
	viewedIds: Set<number> = new Set(),
): GroupedStatuses {
	const buckets = new Map<number, Status[]>()
	for (const status of statuses) {
		const pkid = status.user.pkid
		const existing = buckets.get(pkid)
		if (existing) existing.push(status)
		else buckets.set(pkid, [status])
	}

	const entries: StatusListEntry[] = []
	for (const [pkid, group] of buckets) {
		const sorted = [...group].sort(
			(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
		)
		const latest = sorted[sorted.length - 1]
		const viewed = sorted.filter((s) => s.is_viewed || viewedIds.has(s.id)).length
		entries.push({
			id: String(pkid),
			user: latest.user,
			name: fullName(latest.user),
			avatarUrl: latest.user.profile_photo,
			timestamp: formatRelativeTime(latest.created_at),
			totalSegments: sorted.length,
			viewedSegments: viewed,
			isMuted: mutedPkids.has(pkid),
			stories: sorted,
		})
	}

	entries.sort(
		(a, b) =>
			new Date(b.stories[b.stories.length - 1].created_at).getTime() -
			new Date(a.stories[a.stories.length - 1].created_at).getTime(),
	)

	return {
		recent: entries.filter((e) => !e.isMuted && e.viewedSegments < e.totalSegments),
		viewed: entries.filter((e) => !e.isMuted && e.viewedSegments === e.totalSegments),
		muted: entries.filter((e) => e.isMuted),
	}
}

export function buildMyStatusEntry(
	stories: Status[],
	fallbackUser?: StatusUser,
): StatusListEntry | null {
	if (stories.length === 0) {
		if (!fallbackUser) return null
		return {
			id: "my",
			user: fallbackUser,
			name: "My Status",
			avatarUrl: fallbackUser.profile_photo,
			timestamp: "Tap to add status",
			totalSegments: 0,
			viewedSegments: 0,
			isMuted: false,
			stories: [],
		}
	}
	const sorted = [...stories].sort(
		(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
	)
	const latest = sorted[sorted.length - 1]
	return {
		id: "my",
		user: latest.user,
		name: "My Status",
		avatarUrl: latest.user.profile_photo,
		timestamp: formatRelativeTime(latest.created_at),
		totalSegments: sorted.length,
		// Own statuses render as unseen so there's a clear "you have
		// active statuses" indicator — matches mobile.
		viewedSegments: 0,
		isMuted: false,
		stories: sorted,
	}
}
