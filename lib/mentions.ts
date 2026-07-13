const MENTION_REGEX = /(?:^|[\s(])@([a-zA-Z0-9_]{1,30})/g

/** every @username mentioned anywhere in a block of text, lowercased */
export function extractMentionedUsernames(text: string | null | undefined): string[] {
	if (!text) return []
	return [...text.matchAll(MENTION_REGEX)].map((m) => m[1].toLowerCase())
}

export function hasAnyMention(text: string | null | undefined): boolean {
	return extractMentionedUsernames(text).length > 0
}

export function isUsernameMentioned(text: string | null | undefined, username: string): boolean {
	return extractMentionedUsernames(text).includes(username.toLowerCase())
}
