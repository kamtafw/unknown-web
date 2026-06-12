import type { AxiosError } from "axios"

export function capitalize(text: string): string {
	return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatMessage(text: string): string {
	const cleaned = text.replace(/\.+/g, " ").replace(/\s+/g, " ").trim().toLowerCase()

	if (!cleaned) return ""

	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

interface ApiErrorData {
	message?: string
	errors?: Record<string, { message: string; code?: string }> | null
}

export function extractMessage(
	error: unknown,
	fallback = "Something went wrong. Please try again.",
): string {
	const err = error as AxiosError<ApiErrorData>
	if (!err.response) return "Network error. Please check your connection."
	return err.response.data.message ?? fallback
}

export function extractFieldErrors(error: unknown): Record<string, string> {
	const err = error as AxiosError<ApiErrorData>
	const raw = err.response?.data.errors ?? {}
	return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v.message]))
}

export function extractOtpMessage(error: unknown): string {
	const msg = extractMessage(error)
	if (msg.toLowerCase() === "validation error") return "Invalid code. Please try again."
	return msg
}

export function extractFirstError(error: unknown, fallback: string): string {
	const err = error as AxiosError<{ message?: string; error?: Record<string, string[]> }>
	const fieldErrors = err.response?.data?.error
	if (fieldErrors) {
		const first = Object.values(fieldErrors).flat()[0]
		if (first) return String(first)
	}
	return extractMessage(error, fallback)
}
