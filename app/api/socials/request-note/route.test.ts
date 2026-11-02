import { beforeEach, expect, it, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"
import { proxyJson } from "@/lib/server-fetch"
import { POST } from "./route"
vi.mock("@/lib/cookies", () => ({ getAccessToken: vi.fn() }))
vi.mock("@/lib/server-fetch", () => ({ proxyJson: vi.fn() }))
vi.mock("@/lib/server-config", () => ({
	DJANGO_API_URL: "https://backend.test/api/v1",
}))
beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(getAccessToken).mockResolvedValue("fixture-token")
	vi.mocked(proxyJson).mockResolvedValue(NextResponse.json({ success: true }))
})
it("forwards UUID note submissions to the actual backend creation route", async () => {
	const body = {
		post: "582a0f99-037a-4ddf-b17a-282a69ad6778",
		reason: "Missing context",
		description: "Details",
		evidence_urls: [],
	}
	await POST(
		new NextRequest("http://localhost/api/socials/request-note", {
			method: "POST",
			body: JSON.stringify(body),
		}),
	)
	expect(proxyJson).toHaveBeenCalledWith(
		"https://backend.test/api/v1/socials/community-notes/create",
		expect.objectContaining({ method: "POST", body: JSON.stringify(body) }),
	)
})
it("does not forward anonymous submissions", async () => {
	vi.mocked(getAccessToken).mockResolvedValue(undefined)
	const response = await POST(
		new NextRequest("http://localhost/api/socials/request-note", {
			method: "POST",
			body: "{}",
		}),
	)
	expect(response.status).toBe(401)
	expect(proxyJson).not.toHaveBeenCalled()
})
