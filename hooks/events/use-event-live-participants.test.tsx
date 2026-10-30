import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type {
  EventLiveSessionState,
  LiveParticipant,
  LiveParticipantsPage,
} from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { flattenLiveParticipantPages, useEventLiveParticipants } from "./use-event-live-participants"

const getLiveParticipantsPage = vi.fn()
vi.mock("@/lib/events/api", () => ({
  eventsApi: { getLiveParticipantsPage: (...args: unknown[]) => getLiveParticipantsPage(...args) },
}))

const state = (sessionId = 55, status: "waiting" | "live" | "ended" = "live"): EventLiveSessionState => ({
  eventId: "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11",
  session: {
    id: sessionId, title: "Live", status, sessionType: "public", participantCount: 4,
    startedAt: null, endedAt: null, mediaProvider: "livekit", mediaStatus: "ready",
    currentUserRole: "host", isJoined: true,
  },
  socket: { namespace: "/live", joinEvent: "live:join", sessionId },
})

const participant = (userId: number, id = userId): LiveParticipant => ({
  id,
  user: { userId, userUuid: "uuid-" + userId, name: "User " + userId, username: "user" + userId, photo: null },
  role: "listener",
  isActive: true,
  isMuted: false,
  mediaConnected: true,
  microphonePublished: false,
  cameraPublished: false,
  joinedAt: "2026-10-30T09:00:00Z",
})
const page = (n: number, ids: number[], hasNext: boolean): LiveParticipantsPage => ({
  page: n, participants: ids.map((id) => participant(id)), hasNext,
})
const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

beforeEach(() => {
  getLiveParticipantsPage.mockReset()
  client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
  useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 3 })
})

describe("flattenLiveParticipantPages", () => {
  it("preserves backend order and de-duplicates users across pages", () => {
    expect(flattenLiveParticipantPages([
      page(1, [4, 3], true),
      { ...page(2, [3, 2], false), participants: [participant(3, 99), participant(2)] },
    ]).map((p) => p.user.userId)).toEqual([4, 3, 2])
  })
  it("returns an empty list before pages load", () => {
    expect(flattenLiveParticipantPages(undefined)).toEqual([])
  })
})

describe("useEventLiveParticipants", () => {
  it("loads the first page under the account/session/session-id/limit/role key", async () => {
    getLiveParticipantsPage.mockResolvedValue(page(1, [1, 2], false))
    const { result } = renderHook(() => useEventLiveParticipants(state(), null, 20), { wrapper })
    expect(result.current.isInitialLoading).toBe(true)
    await waitFor(() => expect(result.current.hasLoaded).toBe(true))
    expect(getLiveParticipantsPage).toHaveBeenCalledWith({ sessionId: 55, page: 1, limit: 20, role: undefined }, expect.any(AbortSignal))
    expect(client.getQueryData(eventKeys.liveParticipants(7, 3, 55, 20, null))).toBeDefined()
    expect(result.current.participants.map((p) => p.user.userId)).toEqual([1, 2])
  })

  it("uses page number as pageParam and fetches only when next is present", async () => {
    getLiveParticipantsPage.mockResolvedValueOnce(page(1, [1], true)).mockResolvedValueOnce(page(2, [2], false))
    const { result } = renderHook(() => useEventLiveParticipants(state()), { wrapper })
    await waitFor(() => expect(result.current.hasNextPage).toBe(true))
    await act(() => result.current.fetchNextPage())
    await waitFor(() => expect(result.current.participants.map((p) => p.user.userId)).toEqual([1, 2]))
    expect(getLiveParticipantsPage.mock.calls[1][0]).toMatchObject({ sessionId: 55, page: 2 })
    expect(result.current.hasNextPage).toBe(false)
  })

  it("keeps pagination available for an empty page with a next link", async () => {
    getLiveParticipantsPage.mockResolvedValueOnce(page(1, [], true)).mockResolvedValueOnce(page(2, [8], false))
    const { result } = renderHook(() => useEventLiveParticipants(state()), { wrapper })
    await waitFor(() => expect(result.current.hasLoaded).toBe(true))
    expect(result.current.participants).toEqual([])
    expect(result.current.hasNextPage).toBe(true)
    await act(() => result.current.fetchNextPage())
    await waitFor(() => expect(result.current.participants.map((p) => p.user.userId)).toEqual([8]))
  })

  it.each([[401, "unauthorized"], [403, "forbidden"], [404, "not_found"], [500, "server"]])(
    "reports initial HTTP %i as %s rather than an empty roster",
    async (status, kind) => {
      getLiveParticipantsPage.mockRejectedValue(err(status))
      const { result } = renderHook(() => useEventLiveParticipants(state()), { wrapper })
      await waitFor(() => expect(result.current.error).toBe(kind))
      expect(result.current.phase).toBe("initial")
      expect(result.current.hasLoaded).toBe(false)
      expect(result.current.participants).toEqual([])
      if (status < 500) expect(getLiveParticipantsPage).toHaveBeenCalledTimes(1)
    },
  )

  it("does not fetch when the session is absent, not live, invalid, or the account is unknown", () => {
    const { result: noSession } = renderHook(() => useEventLiveParticipants(null), { wrapper })
    const { result: waiting } = renderHook(() => useEventLiveParticipants(state(55, "waiting")), { wrapper })
    const { result: invalid } = renderHook(() => useEventLiveParticipants(state(0)), { wrapper })
    expect(noSession.current.participants).toEqual([])
    expect(waiting.current.participants).toEqual([])
    expect(invalid.current.participants).toEqual([])
    useAuthStore.setState({ user: null })
    renderHook(() => useEventLiveParticipants(state()), { wrapper })
    expect(getLiveParticipantsPage).not.toHaveBeenCalled()
  })

  it("does not expose another account or login generation's cached participants", async () => {
    client.setQueryData(eventKeys.liveParticipants(8, 3, 55, 20, null), {
      pages: [page(1, [99], false)], pageParams: [1],
    })
    getLiveParticipantsPage.mockResolvedValue(page(1, [7], false))
    const { result } = renderHook(() => useEventLiveParticipants(state()), { wrapper })
    expect(result.current.participants).toEqual([])
    await waitFor(() => expect(result.current.participants.map((p) => p.user.userId)).toEqual([7]))
    expect(client.getQueryData(eventKeys.liveParticipants(8, 3, 55, 20, null))).toBeDefined()
    expect(client.getQueryData(eventKeys.liveParticipants(7, 2, 55, 20, null))).toBeUndefined()
  })

  it("passes optional role filters into both the key and request", async () => {
    getLiveParticipantsPage.mockResolvedValue(page(1, [1], false))
    renderHook(() => useEventLiveParticipants(state(), "speaker", 10), { wrapper })
    await waitFor(() => expect(getLiveParticipantsPage).toHaveBeenCalled())
    expect(getLiveParticipantsPage.mock.calls[0][0]).toMatchObject({ role: "speaker", limit: 10 })
    expect(client.getQueryData(eventKeys.liveParticipants(7, 3, 55, 10, "speaker"))).toBeDefined()
  })
})
