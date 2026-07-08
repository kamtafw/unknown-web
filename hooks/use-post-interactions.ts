import { socialApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { usePostInteractionsStore } from "@/stores/post-interactions-store"
import { useMutation } from "@tanstack/react-query"

export function useNotInterested() {
	const markNotInterested = usePostInteractionsStore((s) => s.markNotInterested)
	const unmarkNotInterested = usePostInteractionsStore((s) => s.unmarkNotInterested)

	return useMutation({
		mutationFn: (postId: string) => socialApi.notInterested({ post: postId }),
		onMutate: (postId) => markNotInterested(postId),
		onError: (error, postId) => {
			unmarkNotInterested(postId)
			showMutationErrorToast(error, "Couldn't process that. Please try again.")
		},
	})
}

export function useRequestCommunityNote() {
	return useMutation({
		mutationFn: (payload: { post: string; reason?: string }) =>
			socialApi.requestCommunityNote(payload),
		onError: (error) => {
			showMutationErrorToast(error, "Couldn't submit your request. Please try again.")
		},
	})
}
