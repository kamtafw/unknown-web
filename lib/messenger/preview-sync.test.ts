import { chatKeys } from "@/lib/messenger/query-keys"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { invalidateSecondaryChatPreviewLists } from "./preview-sync"

describe("invalidateSecondaryChatPreviewLists", () => {
	const invalidateQueries = vi.fn().mockResolvedValue(undefined)

	beforeEach(() => invalidateQueries.mockClear())

	it("invalidates Favorites and Archive independently of the main chat-list query family", () => {
		invalidateSecondaryChatPreviewLists({ invalidateQueries } as never)

		expect(invalidateQueries).toHaveBeenCalledTimes(2)
		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: chatKeys.favorites() })
		expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: chatKeys.archiveList() })
	})
})
