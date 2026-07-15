import { NextResponse } from "next/server"

interface FetchJsonOptions extends RequestInit {
	timeoutMs?: number
}

interface UpstreamResult<T> {
	status: number
	json: T
}

export class UpstreamError extends Error {
	status: number
	constructor(message: string, status: number) {
		super(message)
		this.status = status
	}
}

function combineSignals(a: AbortSignal | null | undefined, b: AbortSignal): AbortSignal {
	if (!a) return b
	if (typeof AbortSignal.any === "function") return AbortSignal.any([a, b])
	return b // fallback: timeout still applies even if the caller's signal can't be applied
}

/**
 * `fetchJson` fetches an upstream JSON API with a timeout, guarding against network
 * failures and non-JSOn payloads (e.g. an HTML error page from a proxy
 * mid-deploy); throws UpstreamError on failure — to be used directly in
 * handlers that need to inspect the parsed body (set cookies, chain a
 * second request, etc); pure passthrough handlers use `proxyJson`
 */

export async function fetchJson<T = unknown>(
	url: string,
	init: FetchJsonOptions = {},
): Promise<UpstreamResult<T>> {
	const { timeoutMs = 30000, ...fetchInit } = init

	let res: Response
	try {
		res = await fetch(url, {
			...fetchInit,
			signal: combineSignals(fetchInit.signal, AbortSignal.timeout(timeoutMs)),
		})
	} catch (error) {
		const timedOut = error instanceof Error && error.name === "TimeoutError"
		console.error(`[fetchJson] ${timedOut ? "timeout" : "network error"} calling ${url}`, error)
		throw new UpstreamError(
			timedOut ? "Upstream request timed out" : "Service temporarily unavailable",
			timedOut ? 504 : 502,
		)
	}

	const text = await res.text()

	let json: T
	try {
		json = (text ? JSON.parse(text) : { success: res.ok, data: null }) as T
	} catch (parseError) {
		console.error(`[fetchJson] non-JSON response from ${url}`, {
			status: res.status,
			bodyPreview: text.slice(0, 200),
			parseError,
		})
		throw new UpstreamError("Upstream returned an unexpected response", 502)
	}

	return { status: res.status, json }
}

export async function proxyJson(url: string, init: FetchJsonOptions = {}) {
	try {
		const { status, json } = await fetchJson(url, init)
		return NextResponse.json(json, { status })
	} catch (error) {
		if (error instanceof UpstreamError) {
			return NextResponse.json({ success: false, message: error.message }, { status: error.status })
		}
		console.error(`[proxyJson] unexpected error calling ${url}`, error)
		return NextResponse.json(
			{ success: false, message: "Unexpected server error" },
			{ status: 500 },
		)
	}
}
