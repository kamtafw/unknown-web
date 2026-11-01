import { expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { socialsApi } from "@/lib/socials/api"
import { useTogglePinnedPost } from "./use-post-actions"
vi.mock("@/lib/socials/api", () => ({
	socialsApi: { togglePinnedPost: vi.fn() },
}))
vi.mock("@/lib/toast", () => ({ toast: { success: vi.fn() } }))
it("clears the previous pin only for the same author across feed and profile caches", async () => {
	const client = new QueryClient()
	const posts = [
		{ id: "old", user: { id: "owner" }, flags: { pinned: true } },
		{ id: "new", user: { id: "owner" }, flags: { pinned: false } },
		{ id: "other", user: { id: "other-owner" }, flags: { pinned: true } },
	]
	for (const key of [
		["feed", "for-you"],
		["profile-feed", "posts", "owner"],
	])
		client.setQueryData(key, { pages: [{ posts }] })
	vi.mocked(socialsApi.togglePinnedPost).mockResolvedValue({
		success: true,
		data: { is_pinned: true, message: "Pinned" },
	})
	const { result } = renderHook(() => useTogglePinnedPost(), {
		wrapper: ({ children }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		),
	})
	await act(async () => result.current.mutateAsync("new"))
	for (const key of [
		["feed", "for-you"],
		["profile-feed", "posts", "owner"],
	])
		expect(client.getQueryData(key)).toMatchObject({
			pages: [
				{
					posts: [
						{ flags: { pinned: false } },
						{ flags: { pinned: true } },
						{ flags: { pinned: true } },
					],
				},
			],
		})
})
