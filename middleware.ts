import { NextRequest, NextResponse } from "next/server"
import { COOKIE } from "./lib/cookies"
import { DJANGO_API_URL } from "./lib/server-config"

const PUBLIC_ROUTES = [
	"/sign-in",
	"/sign-up",
	"/forgot-password",
	"/create-new-password",
	"/verify",
	"/2fa",
	"/terms",
	"/privacy-policy",
	"/about",
	"/advertising",
	"/legal-notice",
	"/account-deletion",
	"/account-recovery",
	"/support",
	"/contact",
	"/safety-report",
]
const ONBOARDING_ROUTES = ["/complete-profile", "/interests", "/friend-suggestions"]
const ADMIN_ROUTES = ["/admin"]
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

function matchesPrefix(pathname: string, routes: string[]) {
	return routes.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
		const json = atob(base64)
		return JSON.parse(json)
	} catch {
		return null
	}
}

function isTokenExpired(token: string): boolean {
	const payload = decodeJwtPayload(token)
	if (!payload || typeof payload.exp !== "number") return true
	// 10s buffer to avoid edge-case races
	return Date.now() / 1000 > payload.exp - 10
}

function isSameOriginRequest(req: NextRequest) {
	const origin = req.headers.get("origin")

	if (!origin) return true

	const originUrl = new URL(origin)
	const host = req.headers.get("x-forwarded-host") || req.headers.get("host")

	return originUrl.host === host
}

// function changed so this middleware stops calling itself and have it calling
// Django and set cookies itself; on Vercel this is invisible plumbing
// and basically always works; on Coolify, the container sits behind Traefik
// and this fetch has to go: container → out to the internet → DNS resolve the
// domain → back into Traefik → back into the same container (or another replica)
async function refreshAuth(refreshToken: string) {
	try {
		const res = await fetch(`${DJANGO_API_URL}/auth/token/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh: refreshToken }),
			signal: AbortSignal.timeout(10000),
		})

		const json = await res.json().catch(() => null)
		if (!res.ok || !json?.success) return null

		return {
			access_token: json.data.access_token as string,
			refresh_token: (json.data.refresh_token as string) ?? refreshToken,
		}
	} catch (error) {
		console.error("[middleware] token refresh failed:", error)
		return null
	}
}

function clearAndRedirectToSignIn(req: NextRequest) {
	const res = NextResponse.redirect(new URL("/sign-in", req.url))
	res.cookies.delete(COOKIE.ACCESS)
	res.cookies.delete(COOKIE.REFRESH)
	return res
}

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl

	const accessToken = req.cookies.get(COOKIE.ACCESS)?.value
	const refreshToken = req.cookies.get(COOKIE.REFRESH)?.value

	const isPublic = matchesPrefix(pathname, PUBLIC_ROUTES)
	const isOnboarding = matchesPrefix(pathname, ONBOARDING_ROUTES)
	const isAdmin = matchesPrefix(pathname, ADMIN_ROUTES)
	const isApiRoute = pathname.startsWith("/api/")

	if (isApiRoute || pathname.startsWith("/_next")) {
		if (isApiRoute && !SAFE_METHODS.has(req.method) && !isSameOriginRequest(req)) {
			return NextResponse.json(
				{ success: false, message: "Invalid request origin" },
				{ status: 403 },
			)
		}

		return NextResponse.next()
	}

	if (!accessToken && !refreshToken) {
		if (isPublic) return NextResponse.next()
		return NextResponse.redirect(new URL("/sign-in", req.url))
	}

	if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
		const refreshed = await refreshAuth(refreshToken)
		if (!refreshed) return clearAndRedirectToSignIn(req)

		const res = isPublic ? NextResponse.redirect(new URL("/home", req.url)) : NextResponse.next()
		const isProd = process.env.NODE_ENV === "production"

		res.cookies.set(COOKIE.ACCESS, refreshed.access_token, {
			httpOnly: true,
			secure: isProd,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60,
		})
		res.cookies.set(COOKIE.REFRESH, refreshed.refresh_token, {
			httpOnly: true,
			secure: isProd,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		})
		return res
	}

	if (accessToken && !refreshToken) {
		if (isPublic) return NextResponse.next()
		return clearAndRedirectToSignIn(req)
	}

	if (accessToken && !isTokenExpired(accessToken) && isPublic) {
		return NextResponse.redirect(new URL("/home", req.url))
	}

	if (isAdmin && accessToken) {
		const payload = decodeJwtPayload(accessToken)
		const isAdministrator = payload?.is_administrator === true

		if (!isAdministrator) {
			return NextResponse.redirect(new URL("/home", req.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
