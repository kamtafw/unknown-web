import { beforeEach, expect, it, vi } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { userApi } from "@/lib/api"
import { removeUserFromSuggestionsCache, useFollowUser, useUnfollowUser } from "./use-follow-actions"
vi.mock("@/lib/api", () => ({ userApi: { followUser: vi.fn() } }))
vi.mock("@/lib/api-error", () => ({ showMutationErrorToast: vi.fn() }))
const id = "582a0f99-037a-4ddf-b17a-282a69ad6778"
beforeEach(() => vi.clearAllMocks())
function setup() {
	const client = new QueryClient({
		defaultOptions: { mutations: { retry: false } },
	})
	const key = ["social-search", "ada"]
	client.setQueryData(key, {
		data: {
			results: [
				{ id, username: "ada", youFollowThisUser: false },
				{ id: "other", username: "grace", youFollowThisUser: true },
			],
		},
	})
	client.setQueryData(["social-alerts", "all"], {
		pages: [
			{
				results: [
					{ user: { id, username: "ada" }, you_are_following_back: false },
				],
			},
		],
	})
	const result = renderHook(
		() => ({ follow: useFollowUser(), unfollow: useUnfollowUser() }),
		{
			wrapper: ({ children }) => (
				<QueryClientProvider client={client}>{children}</QueryClientProvider>
			),
		},
	)
	return { client, key, ...result }
}
it("uses public UUIDs and keeps search, alerts and authoritative follow state in sync", async () => {
	const { result, client, key } = setup()
	vi.mocked(userApi.followUser).mockResolvedValue({
		success: true,
		status_code: 201,
		message: null,
		data: { id, following: true },
	})
	await act(async () => result.current.follow.mutateAsync(id))
	expect(userApi.followUser).toHaveBeenCalledWith({ followed_user: id })
	expect(client.getQueryData(key)).toMatchObject({
		data: {
			results: [
				{ id, youFollowThisUser: true },
				{ id: "other", youFollowThisUser: true },
			],
		},
	})
	expect(client.getQueryData(["social-alerts", "all"])).toMatchObject({
		pages: [{ results: [{ you_are_following_back: true }] }],
	})
	vi.mocked(userApi.followUser).mockResolvedValue({
		success: true,
		status_code: 200,
		message: null,
		data: { id, following: false },
	})
	await act(async () => result.current.unfollow.mutateAsync(id))
	expect(client.getQueryData(key)).toMatchObject({
		data: {
			results: [
				{ id, youFollowThisUser: false },
				{ id: "other", youFollowThisUser: true },
			],
		},
	})
})
it("rolls back a failed follow without replacing another user's state", async () => {
	const { result, client, key } = setup()
	vi.mocked(userApi.followUser).mockRejectedValue(new Error("Offline"))
	act(() => result.current.follow.mutate(id))
	await waitFor(() => expect(result.current.follow.isError).toBe(true))
	expect(client.getQueryData(key)).toMatchObject({
		data: {
			results: [
				{ id, youFollowThisUser: false },
				{ id: "other", youFollowThisUser: true },
			],
		},
	})
})

it("removes a followed suggestion from the actual paginated-response cache by UUID", () => {
 const client = new QueryClient()
 const key = ["users", "friend-suggestions"]
 client.setQueryData(key, {success:true, data:{results:[{id,username:"ada"},{id:"other",username:"grace"}]}})
 removeUserFromSuggestionsCache(client, id)
 expect(client.getQueryData(key)).toMatchObject({data:{results:[{id:"other",username:"grace"}]}})
})
