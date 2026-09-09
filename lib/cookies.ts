import { cookies } from "next/headers"

export const COOKIE = {
	ACCESS: "ac_token",
	REFRESH: "rf_token",
} as const

const IS_PROD = process.env.NODE_ENV === "production"

/** set both tokens from verify-otp response */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
	const store = await cookies()

	store.set(COOKIE.ACCESS, accessToken, {
		httpOnly: true,
		secure: IS_PROD,
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60, // 60 min — just to match typical JWT access token lifetime
	})

	store.set(COOKIE.REFRESH, refreshToken, {
		httpOnly: true,
		secure: IS_PROD,
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	})
}

/** clear both tokens (logout) */
export async function clearAuthCookies() {
	const store = await cookies()
	store.delete(COOKIE.ACCESS)
	store.delete(COOKIE.REFRESH)
}

/** read the access token from the server-side cookie store */
export async function getAccessToken(): Promise<string | undefined> {
	const store = await cookies()
	return store.get(COOKIE.ACCESS)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
	const store = await cookies()
	return store.get(COOKIE.REFRESH)?.value
}
