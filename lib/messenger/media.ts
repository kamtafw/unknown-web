import type { MediaAttachment } from "@/types/messenger"

/** Mirrors mobile's `getMediaType` in use-attachment-actions.ts. */
export function classifyMediaType(mimeType: string): MediaAttachment["type"] {
	if (mimeType.startsWith("image/")) return "image"
	if (mimeType.startsWith("video/")) return "video"
	if (mimeType.startsWith("audio/")) return "audio"
	if (mimeType === "application/pdf") return "pdf"
	return "document"
}
