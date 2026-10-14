import { chatKeys } from "@/lib/messenger/query-keys"
import type { QueryClient } from "@tanstack/react-query"

/**
 * Favorite and archive rows are independent queries, not children of
 * chatKeys.lists(). A direct-message change must mark them stale too.
 * The main chat list is deliberately handled by its existing optimistic
 * patch/refetch logic to avoid racing a fresh cache update against a stale
 * server response.
 */
export function invalidateSecondaryChatPreviewLists(
	queryClient: Pick<QueryClient, "invalidateQueries">,
): void {
	void queryClient.invalidateQueries({ queryKey: chatKeys.favorites() })
	void queryClient.invalidateQueries({ queryKey: chatKeys.archiveList() })
}
