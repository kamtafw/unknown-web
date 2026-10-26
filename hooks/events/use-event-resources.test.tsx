import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useEventResources } from "./use-event-resources"

const getEventResources = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: { getEventResources: (...a: unknown[]) => getEventResources(...a) },
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const data = { links: [{ name: "Agenda", url: "https://example.com/a" }], documents: [] }
const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={client}>{children}</QueryClientProvider>
)

beforeEach(() => {
	getEventResources.mockReset()
	client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 3 })
})

describe("useEventResources", () => {
	it("loads and returns the resources, requesting only this event", async () => {
		getEventResources.mockResolvedValue(data)
		const { result } = renderHook(() => useEventResources(ID), { wrapper })
		expect(result.current.isLoading).toBe(true)
		await waitFor(() => expect(result.current.resources).toEqual(data))
		expect(result.current.errorKind).toBeNull()
		expect(getEventResources).toHaveBeenCalledTimes(1)
		expect(getEventResources.mock.calls[0][0]).toBe(ID)
	})

	it("caches under the account, session and event key", async () => {
		getEventResources.mockResolvedValue(data)
		const { result } = renderHook(() => useEventResources(ID), { wrapper })
		await waitFor(() => expect(result.current.resources).toEqual(data))
		expect(client.getQueryData(eventKeys.resources(7, 3, ID))).toEqual(data)
		expect(client.getQueryData(eventKeys.resources(8, 3, ID))).toBeUndefined()
		expect(client.getQueryData(eventKeys.resources(7, 2, ID))).toBeUndefined()
	})

	it("does not reuse another account's cached resources", async () => {
		client.setQueryData(eventKeys.resources(8, 3, ID), {
			links: [{ name: "X", url: "https://x.test" }],
			documents: [],
		})
		getEventResources.mockResolvedValue(data)
		const { result } = renderHook(() => useEventResources(ID), { wrapper })
		expect(result.current.resources).toBeNull()
		await waitFor(() => expect(result.current.resources).toEqual(data))
	})

	it("makes no request for an id that is not a UUID", () => {
		const { result } = renderHook(() => useEventResources("../../etc"), { wrapper })
		expect(getEventResources).not.toHaveBeenCalled()
		expect(result.current.resources).toBeNull()
		expect(result.current.isLoading).toBe(false)
	})

	it("makes no request without a signed-in account", () => {
		useAuthStore.setState({ user: null })
		renderHook(() => useEventResources(ID), { wrapper })
		expect(getEventResources).not.toHaveBeenCalled()
	})

	it.each([
		[401, "unauthorized"],
		[403, "forbidden"],
		[404, "not_found"],
		[500, "server"],
	])("maps a %i to %s and does not retry a refusal", async (status, kind) => {
		getEventResources.mockRejectedValue(err(status))
		const { result } = renderHook(() => useEventResources(ID), { wrapper })
		await waitFor(() => expect(result.current.errorKind).toBe(kind))
		expect(result.current.resources).toBeNull()
		expect(result.current.isLoading).toBe(false)
		if (status < 500) expect(getEventResources).toHaveBeenCalledTimes(1)
	})

	it("a network failure is reported as network", async () => {
		getEventResources.mockRejectedValue(new Error("offline"))
		const { result } = renderHook(() => useEventResources(ID), { wrapper })
		await waitFor(() => expect(result.current.errorKind).toBe("network"))
	})

	it("refetch recovers after a failure", async () => {
		// the hook retries a transient failure once, so the first attempt and its retry both fail
		getEventResources
			.mockRejectedValueOnce(err(500))
			.mockRejectedValueOnce(err(500))
			.mockResolvedValue(data)
		const { result } = renderHook(() => useEventResources(ID), { wrapper })
		await waitFor(() => expect(result.current.errorKind).toBe("server"))
		await result.current.refetch()
		await waitFor(() => expect(result.current.resources).toEqual(data))
		expect(result.current.errorKind).toBeNull()
	})
})
