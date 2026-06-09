import { DJANGO_API_URL } from "@/lib/server-config"
import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"

export async function PATCH(req: NextRequest) {
  const formData = await req.formData()
  const accessToken = await getAccessToken()

  if (!accessToken) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const upstream = await fetch(`${DJANGO_API_URL}/users/update-profile-photo`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })

  const json = await upstream.json()
  return NextResponse.json(json, { status: upstream.status })
}