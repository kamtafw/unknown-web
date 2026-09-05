/**
 * Resolves the small icon + fallback label shown in a chat-list row's
 * preview line (screenshot: mic icon + "0:25", missed-call icon + "Missed
 * voice call", image icon + "Image", etc.).
 *
 * Mobile's equivalent (`lib/messenger/chat-preview.ts`) us considerably
 * more involved because it reconstructs the preview from locally-stored
 * SQLite rows and raw call-signal metadata. The web BFF response already
 * gives us a resolved `last_message_preview` string, so this only needs
 * to pick an icon for non-text types — much lighter, by design (M0/M1
 * decision to render from TanStack Query rather than replicate mobile's
 * offline-first local-DB layer).
 */

import { MessageType } from "@/types/messenger"

export type PreviewIconName =
	| "image"
	| "video"
	| "voice"
	| "document"
	| "location"
	| "contact"
	| "poll"
	| "call"
	| "share"
	| null

export function resolvePreviewIcon(type: MessageType | string | null | undefined): PreviewIconName {
	switch (type) {
		case "image":
		case "media":
			return "image"
		case "video":
			return "video"
		case "audio":
		case "voice":
			return "voice"
		case "document":
			return "document"
		case "location":
			return "location"
		case "contact":
			return "contact"
		case "poll":
			return "poll"
		case "call":
			return "call"
		case "share":
			return "share"
		default:
			return null
	}
}

/** Fallback label when `last_message_preview` is empty but the type still
 * tells us something worth showing (e.g. a poll with no text body). */
export function resolvePreviewFallbackLabel(type: MessageType | string | null | undefined): string {
	switch (type) {
		case "image":
		case "media":
			return "Image"
		case "video":
			return "Video"
		case "audio":
		case "voice":
			return "Voice message"
		case "document":
			return "Document"
		case "location":
			return "Location"
		case "contact":
			return "Contact"
		case "poll":
			return "Poll"
		case "call":
			return "Call"
		case "share":
			return "Shared post"
		default:
			return "Message"
	}
}

/** Shared by PinnedMessageBanner, the reply-quote inside MessageBubble,
 * and ReplyPreviewBar — one place for "what should this message look like
 * when quoted/previewed", instead of three divergent copies. Takes just
 * the two fields it needs rather than a full `Message`, since callers may
 * only have a resolved-from-history lookup result to hand it (`reply_to`
 * is now a bare numeric id — see chat.ts — so there's no embedded object
 * to pass through anymore; the caller must resolve it first). */
export function resolveMessagePreviewText(message: {
	message_type: string
	content: string | null | undefined
}): string {
	const trimmed = message.content?.replace(/\s+/g, " ").trim()
	switch (message.message_type) {
		case "text":
			return trimmed || "Message"
		case "location":
			return "📍 Location"
		case "voice":
		case "audio":
			return "🎙️ Voice message"
		case "contact":
			return trimmed || "👤 Contact"
		case "media":
		case "image":
			return "📷 Photo"
		case "video":
			return "🎥 Video"
		case "document":
		case "pdf":
			return "📄 Document"
		case "poll":
			return "📊 Poll"
		default:
			return trimmed || "Message"
	}
}
