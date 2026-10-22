import { getAccessToken } from "@/lib/cookies"
import { forwardEventWrite, unauthenticated } from "@/lib/events/bff"
import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest } from "next/server"

/** Create an event: JSON, or a streamed multipart upload when a cover or documents are attached */
export async function POST(req: NextRequest) {
	const token = await getAccessToken()
	if (!token) return unauthenticated()

	return forwardEventWrite(req, {
		method: "POST",
		url: `${DJANGO_API_URL}/events/create`,
		accessToken: token,
		mode: "create",
	})
}
