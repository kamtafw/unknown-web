import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

/**
 * Proxies the GENERIC `upload/media` Django endpoint — confirmed via
 * mobile's `useUploadMedia`/`use-offline-message-sync.ts` — NOT
 * `socials/post/upload/media`, a different, socials-scoped endpoint the
 * web app already proxies elsewhere. Discriminated by a `folder` form
 * field ("chat"|"voice"|...), not by URL. Response is `{media_url:
 * string}` (singular), not socials' `{media_urls: string[]}`.
 */
export async function POST(req: NextRequest) {
	const formData = await req.formData()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/upload/media`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}` },
		body: formData,
	})
}
