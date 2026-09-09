import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

// Confirmed zero prior implementation of single comment/reply fetch, edit,
// or delete anywhere in the frontend (see
// docs/social/social-content-migration-inspection.md S~8/S~11/S~17). GET below
// maps to the contract's `GET /socials/post/comments/{comment_uuid}` — this
// closes the single-content-detail GAP needed for the focused-thread UX
// (opening a reply as its own node). PATCH/DELETE map to
// `/socials/post/comment/{id}`, matching the existing create path
// (`/socials/post/comment`). All three are UNVERIFIED against a live
// backend — first real call is the verification.

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/socials/post/comments/${id}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		cache: "no-store",
	})
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const body = await req.json()
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/socials/post/comment/${id}`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	})
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const accessToken = await getAccessToken()

	if (!accessToken) {
		return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
	}

	return proxyJson(`${DJANGO_API_URL}/socials/post/comment/${id}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${accessToken}` },
	})
}
