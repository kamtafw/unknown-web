import { expect, it, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import { proxyJson } from "@/lib/server-fetch"
import { POST } from "./route"
vi.mock("@/lib/cookies", () => ({
	getAccessToken: vi.fn(async () => "fixture-token"),
}))
vi.mock("@/lib/server-fetch", () => ({
	proxyJson: vi.fn(async () => NextResponse.json({ success: true })),
}))
vi.mock("@/lib/server-config", () => ({
	DJANGO_API_URL: "https://backend.test/api/v1",
}))
it("preserves video multipart data and gives validation and storage the upload timeout", async () => {
	const data = new FormData()
	data.append(
		"file",
		new File([new Uint8Array([0, 1, 2])], "smoke.mp4", { type: "video/mp4" }),
	)
	data.append("folder", "post")
	await POST(
		new NextRequest("http://localhost/api/socials/upload-media", {
			method: "POST",
			body: data,
		}),
	)
	expect(proxyJson).toHaveBeenCalledWith(
		"https://backend.test/api/v1/socials/post/upload/media",
		expect.objectContaining({
			method: "POST",
			timeoutMs: 120000,
			body: expect.any(FormData),
		}),
	)
	const sent = vi.mocked(proxyJson).mock.calls[0][1]?.body as FormData
	expect(sent.get("folder")).toBe("post")
	expect((sent.get("file") as File).name).toBe("smoke.mp4")
})
