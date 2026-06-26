import { userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { useMutation } from "@tanstack/react-query"

export function useReportProblem() {
	return useMutation({
		mutationFn: userApi.reportProblem,
		onSuccess: (data) => {
			if (!data.success) return
			toast.success(data.message ?? "Your report has been submitted. Thank you!")
		},
		onError: (error) => {
			showMutationErrorToast(error, "Failed to submit report. Please try again.")
		},
	})
}
