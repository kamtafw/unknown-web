"use client"

import { extractMessage } from "@/lib/api-error"
import { chatApi } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type { ReportUserPayload, Uuid } from "@/types/messenger"
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query"

export function useUserProfile(userUuid: Uuid) {
	return useQuery({
		queryKey: chatKeys.userProfile(userUuid),
		queryFn: () => chatApi.getUserProfile(userUuid as string),
		enabled: !!userUuid,
		staleTime: 30_000,
	})
}

/** One hook for all three tabs — parameterized by type rather than three
 * near-identical hooks, since the only real difference is the query param. */
export function useUserAttachments(userUuid: Uuid, type: "media" | "doc" | "link") {
	const query = useInfiniteQuery({
		queryKey: chatKeys.attachments(userUuid, type),
		queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
			chatApi.getAttachments(userUuid as string, type, pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.metadata.next ?? undefined,
		enabled: !!userUuid,
		staleTime: 30_000,
	})

	const items = query.data?.pages.flatMap((p) => p.results) ?? []
	const totalSize =
		query.data?.pages.find((p) => typeof p.total_size === "number")?.total_size ?? null

	return { ...query, items, totalSize }
}

export function useReportUser(userUuid: Uuid) {
	return useMutation({
		mutationFn: (payload: ReportUserPayload) => chatApi.reportUser(userUuid, payload),
		onSuccess: () => toast.success("Report submitted"),
		onError: (err) => toast.error(extractMessage(err, "Failed to submit report")),
	})
}
