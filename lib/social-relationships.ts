/** Update one public user identity across cached profiles, content, search and alerts. */
export function patchRelationship<T>(
	value: T,
	userId: string,
	following: boolean,
): T {
	if (Array.isArray(value)) {
		const next = value.map((item) => patchRelationship(item, userId, following))
		return (
			next.some((item, index) => item !== value[index]) ? next : value
		) as T
	}
	if (!value || typeof value !== "object") return value
	const record = value as Record<string, unknown>
	let next = record
	for (const [key, child] of Object.entries(record)) {
		const updated = patchRelationship(child, userId, following)
		if (updated !== child) next = { ...next, [key]: updated }
	}
	if (record.id === userId && typeof record.username === "string") {
		next = { ...next, youFollowThisUser: following }
		for (const key of ["is_user_you_follow", "is_friends", "isFollowing"]) {
			if (key in record) next[key] = following
		}
	}
	const actor = record.user as { id?: string } | undefined
	if (actor?.id === userId && "you_are_following_back" in record) {
		next = { ...next, you_are_following_back: following }
	}
	return next as T
}
