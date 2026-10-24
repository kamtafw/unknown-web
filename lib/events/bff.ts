/**
 * Server-side helpers shared by the Pass 2 route handlers (`app/api/events/*`). Imports Next, so
 * unlike `server.ts` it is not "pure"; the decisions it makes live in `server.ts` / `stream.ts`.
 */

import { fetchJson, UpstreamError } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"
import { EVENT_UPLOAD_TIMEOUT_MS, MAX_EVENT_REQUEST_BYTES } from "./constants"
import { buildEventJsonBody, checkMultipartRequest } from "./server"
import { type LimitedBody, limitBodyStream } from "./stream"

/** a JSON create/update body is a few KB; files go through multipart */
const MAX_JSON_BYTES = 256 * 1024

/** the backend's documented error envelope, for errors raised by the BFF itself */
export function envelope(status: number, message: string, code: string) {
	return NextResponse.json(
		{ success: false, status_code: status, message, code, errors: null },
		{ status },
	)
}

export const unauthenticated = () =>
	NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })

export const eventNotFound = () => envelope(404, "Event not found.", "not_found")

type FetchOutcome =
	| { ok: true; status: number; json: unknown }
	| { ok: false; response: NextResponse }

/** like `proxyJson`, but hands the parsed body back so the route can inspect or transform it */
export async function fetchOrError(
	url: string,
	init: Parameters<typeof fetchJson>[1],
): Promise<FetchOutcome> {
	try {
		const { status, json } = await fetchJson(url, init)
		return { ok: true, status, json }
	} catch (error) {
		if (error instanceof UpstreamError) {
			return {
				ok: false,
				response: NextResponse.json({ success: false, message: error.message }, { status: error.status }),
			}
		}
		console.error(`[events bff] unexpected error calling ${url}`, error)
		return {
			ok: false,
			response: NextResponse.json({ success: false, message: "Unexpected server error" }, { status: 500 }),
		}
	}
}

/**
 * Create / update. JSON bodies are parsed, allow-listed and re-serialised. Multipart bodies are
 * streamed straight to the backend (never parsed or buffered here) under a byte cap, with the
 * original content type (boundary) and, when declared, content length preserved.
 */
export async function forwardEventWrite(
	req: NextRequest,
	opts: { method: "POST" | "PATCH"; url: string; accessToken: string; mode: "create" | "update" },
): Promise<NextResponse> {
	const contentType = req.headers.get("content-type") ?? ""
	const headers: Record<string, string> = {
		Authorization: `Bearer ${opts.accessToken}`,
		Accept: "application/json",
	}
	let limited: LimitedBody | null = null
	let init: Record<string, unknown>

	if (/^multipart\/form-data/i.test(contentType)) {
		const check = checkMultipartRequest(req.headers)
		if (!check.ok) return envelope(check.status, check.message, check.code)
		if (!req.body) return envelope(400, "Invalid upload", "invalid_upload")

		limited = limitBodyStream(req.body, MAX_EVENT_REQUEST_BYTES)
		headers["Content-Type"] = check.contentType
		if (check.contentLength !== null) headers["Content-Length"] = check.contentLength
		init = { body: limited.stream, duplex: "half", timeoutMs: EVENT_UPLOAD_TIMEOUT_MS }
	} else if (/^application\/json/i.test(contentType)) {
		const raw = await req.text()
		if (raw.length > MAX_JSON_BYTES) return envelope(413, "The request is too large", "request_too_large")

		let parsed: unknown
		try {
			parsed = JSON.parse(raw)
		} catch {
			return envelope(400, "Invalid request body", "invalid_event")
		}
		const built = buildEventJsonBody(parsed, opts.mode)
		if (!built.ok) return envelope(400, built.message, built.code)

		headers["Content-Type"] = "application/json"
		init = { body: JSON.stringify(built.value) }
	} else {
		return envelope(415, "Unsupported content type", "unsupported_media_type")
	}

	const result = await fetchOrError(opts.url, {
		method: opts.method,
		headers,
		cache: "no-store",
		...init,
	} as Parameters<typeof fetchJson>[1])

	if (!result.ok) {
		// the byte cap was hit mid-stream: the upstream fetch fails, which is not a gateway error
		if (limited?.exceeded()) return envelope(413, "The upload is too large", "upload_too_large")
		return result.response
	}
	return NextResponse.json(result.json, { status: result.status })
}

/**
 * Authenticated GET whose successful body is minimised before it reaches the browser (Pass 3
 * read side). Upstream errors (403, 404, …) pass through with their own status and body. A 2xx
 * body the sanitiser cannot read as the documented shape, or any other status, is answered with a
 * controlled 502: nothing unvetted is forwarded.
 */
export async function fetchSanitizedGet(
	url: string,
	accessToken: string,
	sanitize: (json: unknown) => unknown | null,
): Promise<NextResponse> {
	const result = await fetchOrError(url, {
		headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
		cache: "no-store",
	})
	if (!result.ok) return result.response
	if (result.status >= 400) return NextResponse.json(result.json, { status: result.status })

	const clean = result.status >= 200 && result.status < 300 ? sanitize(result.json) : null
	if (clean === null) {
		return envelope(502, "Upstream returned an unexpected response", "invalid_upstream_response")
	}
	return NextResponse.json(clean, { status: result.status })
}
