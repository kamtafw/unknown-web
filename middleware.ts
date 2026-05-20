// route classification

import { NextRequest, NextResponse } from "next/server"
import { COOKIE } from "./lib/cookies"

const PUBLIC_ROUTES = [
	"/sign-in",
	"/sign-up",
	"/forgot-password",
	"/create-new-password",
	"/verify",
	"/2fa",
]

const ONBOARDING_ROUTES = ["/complete-profile", "/interests", "/friends"]

const ADMIN_ROUTES = ["/admin"]

function matchesPrefix(pathname: string, routes: string[]) {
	return routes.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}

/**
 * decode JWT payload without a library — edge runtime only has Web Crypto
 * we only need the claims (exp, role) — we don't verify the signature here
 * actual verification happens on the Django side per-request
 */
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

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl

	const accessToken = req.cookies.get(COOKIE.ACCESS)?.value
	const refreshToken = req.cookies.get(COOKIE.REFRESH)?.value

	const isPublic = matchesPrefix(pathname, PUBLIC_ROUTES)
	const isOnboarding = matchesPrefix(pathname, ONBOARDING_ROUTES)
	const isAdmin = matchesPrefix(pathname, ADMIN_ROUTES)
	const isApiRoute = pathname.startsWith("/api/")

	// always pass through api routes and Next.js internals
	if (isApiRoute || pathname.startsWith("/_next")) {
		return NextResponse.next()
	}

	// case 1: no tokens at all
	if (!accessToken && !refreshToken) {
		if (isPublic) return NextResponse.next()
		return NextResponse.redirect(new URL("/sign-in", req.url))
	}

	// case 2: access token expired but refresh token exists
	// attempt a silent refresh inline; if it fails, clear and redirect
	// NOTE: this can only be done for non-public routes
	if (accessToken && isTokenExpired(accessToken) && refreshToken) {
		const refreshRes = await fetch(new URL("/api/auth/refresh", req.url), {
			method: "POST",
			headers: { Cookie: `${COOKIE.REFRESH}=${refreshToken}` },
		})

		if (!refreshRes.ok) {
			// refresh failed — expired or revoked; force re-login
			const res = NextResponse.redirect(new URL("/sign-in", req.url))
			res.cookies.delete(COOKIE.ACCESS)
			res.cookies.delete(COOKIE.REFRESH)
			return res
		}

		// refresh succeeded — forward the new Set-Cookie headers
		const res = isPublic
			? NextResponse.redirect(new URL("/home", req.url))
			: NextResponse.next()

		refreshRes.headers.getSetCookie().forEach((cookie) => {
			res.headers.append("Set-Cookie", cookie)
		})

		return res
	}

	// case 3: valid token, visiting a public/auth route
	if (accessToken && !isTokenExpired(accessToken) && isPublic) {
		return NextResponse.redirect(new URL("/home", req.url))
	}

	// case 4: role-based access for admin routes
	if (isAdmin && accessToken) {
		const payload = decodeJwtPayload(accessToken)
		const isAdministrator = payload?.is_administrator === true

		if (!isAdministrator) {
			return NextResponse.redirect(new URL("/home", req.url))
		}
	}

	// case 5: onboarding routes — require valid token
	// onboarding is a subset of protected routes and require no extra logic
	// beyond the token check already done above
	return NextResponse.next()
}

export const config = {
	matcher: [
		/**
		 * match all paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimisation)
		 * - favicon.ico
		 * - public folder files
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
}
