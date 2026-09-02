"use client"

import { usePathname, useRouter } from "next/navigation"
import { useLayoutEffect, useRef } from "react"

const NON_CHAT_TAB_PREFIXES = ["/messenger/groups", "/messenger/status", "/messenger/archive"]
const DETAIL_ROUTE_BASES: { prefix: string; base: string }[] = [
	{ prefix: "/messenger/groups/", base: "/messenger/groups" },
	{ prefix: "/messenger/status/", base: "/messenger/status" },
]

function resolveRedirectTarget(pathname: string): string | null {
	if (pathname === "/messenger" || NON_CHAT_TAB_PREFIXES.some((p) => pathname === p)) return null

	for (const { prefix, base } of DETAIL_ROUTE_BASES) {
		if (pathname.startsWith(prefix)) return base
	}

	// Anything else under /messenger/ that isn't another tab's own route is
	// a 1:1 conversation UUID — the chat tab's detail route.
	if (pathname.startsWith("/messenger/") && !NON_CHAT_TAB_PREFIXES.some((p) => pathname.startsWith(p))) {
		return "/messenger"
	}

	return null
}

/**
 * Product decision: a genuinely fresh page load (refresh, direct URL,
 * bookmark) landing on a conversation/group/status detail route bounces
 * to that tab's empty state instead of rendering the detail view with
 * whatever partial data is available. Deliberately replaces trying to
 * make refresh "just work" via peer-recovery fallbacks — simpler and
 * matches what was actually asked for.
 *
 * Only ever runs once, on first mount of the whole Messenger tree — that
 * only happens on a true fresh load; normal in-app navigation between
 * detail routes (clicking a chat row) doesn't remount this layout-level
 * component, so it's never re-triggered by legitimate navigation.
 */
export function MessengerFreshLoadGuard() {
	const pathname = usePathname()
	const router = useRouter()
	const hasChecked = useRef(false)

	useLayoutEffect(() => {
		if (hasChecked.current) return
		hasChecked.current = true

		const target = resolveRedirectTarget(pathname)
		if (target) router.replace(target)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return null
}