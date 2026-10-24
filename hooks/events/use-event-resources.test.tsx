import { eventsApi } from "@/lib/events/api"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useEventResources } from "./use-event-resources"

vi.mock("@/lib/events/api", () => ({
	eventsApi: { getEventResources: vi.fn() },
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const resources = { links: [{ name: "Docs", url: "https://example.com" }], documents: [] }
const forbidden = Object.assign(new Error("forbidden"), { response: { status: 403, data: {} } })
let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>

beforeEach(() => {
	vi.clearAllMocks()
	client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 2 })
})

describe("useEventResources", () => {
	it("does not request resources when details are not full-access", () => {
		const { result } = renderHook(() => useEventResources(ID, false), { wrapper })
		expect(result.current.fetchStatus).toBe("idle")
		expect(eventsApi.getEventResources).not.toHaveBeenCalled()
	})

	it("fetches resources for full details using the account and session scoped key", async () => {
		vi.mocked(eventsApi.getEventResources).mockResolvedValue(resources)
		const { result } = renderHook(() => useEventResources(ID, true), { wrapper })
		await waitFor(() => expect(result.current.data).toEqual(resources))
		expect(eventsApi.getEventResources).toHaveBeenCalledWith(ID, expect.any(AbortSignal))
		expect(client.getQueryData(eventKeys.resources(7, 2, ID))).toEqual(resources)
	})

	it("does not retry a 403 permission denial", async () => {
		vi.mocked(eventsApi.getEventResources).mockRejectedValue(forbidden)
		const { result } = renderHook(() => useEventResources(ID, true), { wrapper })
		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(eventsApi.getEventResources).toHaveBeenCalledTimes(1)
	})

	it("does not request resources without an authenticated account", async () => {
		useAuthStore.setState({ user: null } as never)
		const { result } = renderHook(() => useEventResources(ID, true), { wrapper })
		await act(async () => {})
		expect(result.current.fetchStatus).toBe("idle")
		expect(eventsApi.getEventResources).not.toHaveBeenCalled()
	})
})
