import { getAccessToken } from "@/lib/cookies"
import { NextResponse } from "next/server"

/**
 * Events Socket.IO handshake credential bridge.
 *
 * The Events guide specifies the normal access JWT in Socket.IO handshake
 * auth.token on the /live namespace. The JWT is stored in an httpOnly cookie,
 * so the browser cannot read it directly. This narrowly scoped BFF route
 * returns it only to the authenticated same-origin application, for immediate
 * in-memory use by the Events socket auth provider.
 *
 * Never cache, persist, log, or put this token in a URL. This does not mint a
 * new credential: it implements the guide's documented JWT handshake shape.
 */
export async function GET() {
  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          Pragma: "no-cache",
          Vary: "Cookie",
        },
      },
    )
  }

  return NextResponse.json(
    { success: true, data: { token } },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        Pragma: "no-cache",
        Vary: "Cookie",
      },
    },
  )
}
