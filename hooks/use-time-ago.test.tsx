import { afterEach, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useTimeAgo } from "./use-time-ago"
afterEach(() => vi.useRealTimers())
it("updates immediately for a different post timestamp and continues ticking", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-31T10:00:00Z"))
    const {result,rerender} = renderHook(({date}) => useTimeAgo(date), {initialProps:{date:"2026-10-31T09:00:00Z"}})
    expect(result.current).toBe("1h ago")
    rerender({date:"2026-10-31T10:00:00Z"})
    expect(result.current).toBe("now")
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current).toBe("1m ago")
})
