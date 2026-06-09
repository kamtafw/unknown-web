import { NextRequest, NextResponse } from "next/server"
import { COOKIE } from "./lib/cookies"

const PUBLIC_ROUTES = [
	"/sign-in",
	"/sign-up",
	"/forgot-password",
	"/create-new-password",
	"/verify",
	"/2fa",
	"/terms",
	"/privacy-policy",
]

const ONBOARDING_ROUTES = ["/complete-profile", "/interests", "/friends"]
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
	return Date.now() / 1000 > payload.exp - 10
}

function isSameOriginRequest(req: NextRequest) {
	const requestOrigin = req.nextUrl.origin
	const origin = req.headers.get("origin")
	const referer = req.headers.get("referer")

	if (origin) return origin === requestOrigin
	if (referer) {
		try {
			return new URL(referer).origin === requestOrigin
		} catch {
			return false
		}
	}

	return true
}

async function refreshAuth(req: NextRequest, refreshToken: string) {
	const refreshRes = await fetch(new URL("/api/auth/refresh", req.url), {
		method: "POST",
		headers: { Cookie: `${COOKIE.REFRESH}=${refreshToken}` },
	})

	if (!refreshRes.ok) return null
	return refreshRes.headers.getSetCookie()
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
	const isAdmin = matchesPrefix(pathname, ADMIN_ROUTES)
	const isApiRoute = pathname.startsWith("/api/")

	if (isApiRoute || pathname.startsWith("/_next")) {
		if (isApiRoute && !SAFE_METHODS.has(req.method) && !isSameOriginRequest(req)) {
			return NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 })
		}

		return NextResponse.next()
	}

	if (!accessToken && !refreshToken) {
		if (isPublic) return NextResponse.next()
		return NextResponse.redirect(new URL("/sign-in", req.url))
	}

	if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
		const setCookies = await refreshAuth(req, refreshToken)
		if (!setCookies) return clearAndRedirectToSignIn(req)

		const res = isPublic ? NextResponse.redirect(new URL("/home", req.url)) : NextResponse.next()
		setCookies.forEach((cookie) => {
			res.headers.append("Set-Cookie", cookie)
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
