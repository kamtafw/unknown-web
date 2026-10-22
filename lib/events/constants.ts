/** Nearby discovery radius. A product rule, enforced in the BFF route handler. */
export const NEARBY_RADIUS_KM = 25

/** backend maximum for `limit` */
export const MAX_PAGE_SIZE = 100
export const DEFAULT_PAGE_SIZE = 20

/** the only value of `filter` My Events may ever send */
export const MY_EVENTS_FILTER = "my_events"

/** max length of a search term forwarded to the backend */
export const MAX_SEARCH_LENGTH = 100

/**
 * While a nearby search is active we walk the remaining nearby pages so
 * "no matches" is only declared for the full nearby set. This caps that walk;
 * past it the UI says it searched loaded results only.
 */
export const MAX_SEARCH_SCAN_PAGES = 25

/** safety stop when auto-advancing past empty nearby pages */
export const MAX_EMPTY_PAGE_ADVANCE = 50

/** clamp a requested page size into the backend's documented 1..100 range */
export function resolvePageSize(raw: string | number | null | undefined): number {
	const n = typeof raw === "number" ? raw : Number(raw)
	if (!Number.isInteger(n) || n < 1) return DEFAULT_PAGE_SIZE
	return Math.min(n, MAX_PAGE_SIZE)
}

/** configurable via NEXT_PUBLIC_EVENTS_PAGE_SIZE; provisional default is 20 */
export const EVENTS_PAGE_SIZE = resolvePageSize(process.env.NEXT_PUBLIC_EVENTS_PAGE_SIZE)

/**
 * Pass 2: create / edit limits.
 *
 * Verified against the backend guide (§4.5, §7): cover JPEG/PNG ≤ 2 MiB; each document ≤ 10 MiB
 * with the MIME list below; name ≤ 255; link name ≤ 255; passcode = four ASCII digits.
 *
 * NOT backend-documented (web-side assumptions, see docs/events/EVENTS.md EV-022):
 * MAX_DOCUMENTS, MAX_LINKS, MAX_HASHTAGS, MAX_HASHTAG_LENGTH, MAX_TOTAL_UPLOAD_BYTES. The
 * production body-size limit of the deployment path is unknown, so the total is a
 * conservative starting value, not a verified ceiling.
 */
export const MAX_EVENT_NAME_LENGTH = 255
export const MAX_LINK_NAME_LENGTH = 255
export const MAX_DOCUMENT_NAME_LENGTH = 255

export const COVER_MAX_BYTES = 2_097_152
export const COVER_MIME_TYPES = ["image/jpeg", "image/png"] as const

export const DOCUMENT_MAX_BYTES = 10_485_760
export const DOCUMENT_MIME_TYPES = [
	// video
	"video/mp4",
	"video/x-msvideo",
	"video/quicktime",
	"video/x-ms-wmv",
	"video/x-matroska",
	"video/webm",
	"video/x-flv",
	// audio
	"audio/mpeg",
	"audio/wav",
	"audio/aac",
	"audio/ogg",
	"audio/webm",
	"audio/flac",
	"audio/x-ms-wma",
	// images
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/bmp",
	"image/webp",
	"image/svg+xml",
	// documents
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"text/plain",
	"application/rtf",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.oasis.opendocument.text",
] as const

/** web-side assumptions (not documented by the backend) */
export const MAX_DOCUMENTS = 5
export const MAX_LINKS = 10
export const MAX_HASHTAGS = 20
export const MAX_HASHTAG_LENGTH = 50

/**
 * Cover + all documents in one request. A conservative starting value, NOT a verified ceiling:
 * the production host and its request-body limits are unknown (EV-022). Measured in a Next 15.2.8
 * dev server with a 150 MB multipart upload: peak server memory rose by about 4.7x the body when
 * streamed through the route and about 5.6x when parsed with formData(), so route-level streaming
 * alone saves little and this cap is the real memory bound (dev mode, one run each; not a
 * production measurement). Override per environment with NEXT_PUBLIC_EVENTS_MAX_UPLOAD_BYTES
 * (for example lower it if the host rejects large bodies); it is never below the cover limit.
 */
export const DEFAULT_MAX_TOTAL_UPLOAD_BYTES = 20 * 1024 * 1024

export function resolveMaxUploadBytes(raw: string | number | null | undefined): number {
	const n = typeof raw === "number" ? raw : Number(raw)
	if (!Number.isInteger(n) || n < COVER_MAX_BYTES) return DEFAULT_MAX_TOTAL_UPLOAD_BYTES
	return Math.min(n, 100 * 1024 * 1024)
}

export const MAX_TOTAL_UPLOAD_BYTES = resolveMaxUploadBytes(
	process.env.NEXT_PUBLIC_EVENTS_MAX_UPLOAD_BYTES,
)
/** BFF hard cap for a streamed multipart request: the upload total plus form-field/boundary overhead */
export const MAX_EVENT_REQUEST_BYTES = MAX_TOTAL_UPLOAD_BYTES + 1024 * 1024
/** uploads can take longer than the 30 s used for JSON calls */
export const EVENT_UPLOAD_TIMEOUT_MS = 120_000

export const PASSCODE_LENGTH = 4
