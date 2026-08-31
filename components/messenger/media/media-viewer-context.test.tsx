import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useMediaViewer } from "./media-viewer-context"

describe("useMediaViewer", () => {
	it("does not throw when used outside MediaViewerProvider", () => {
		expect(() => renderHook(() => useMediaViewer())).not.toThrow()
	})
})
