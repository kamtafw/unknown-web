import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: number }> }) {
  const { id } = await params
  const accessToken = await getAccessToken()

  if (!accessToken) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  return proxyJson(`${DJANGO_API_URL}/chats/groups/${id}/seen`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
}
