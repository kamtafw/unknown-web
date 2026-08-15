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
