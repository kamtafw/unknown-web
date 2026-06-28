import { userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const timezoneKeys = {
	preference: ["timezone", "preference"] as const,
	list: (locale: string) => ["timezone", "list", locale] as const,
}

export function useTimezonePreference() {
	return useQuery({
		queryKey: timezoneKeys.preference,
		queryFn: userApi.getTimezonePreference,
		staleTime: 1000 * 60 * 5,
	})
}

export function useAvailableTimezones(locale = "en") {
	return useQuery({
		queryKey: timezoneKeys.list(locale),
		queryFn: () => userApi.getAvailableTimezones(locale),
		staleTime: Infinity, // timezone list is effectively static
	})
}

export function useChangeTimezone() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: { timezone: string }) => userApi.changeTimezone(payload),
		onSuccess: (data) => {
			if (!data.success) return
			// patch the preference cache so the panel re-opens to the new selection
			qc.setQueryData(timezoneKeys.preference, data)
			toast.success("Timezone updated")
		},
		onError: (error) => {
			showMutationErrorToast(error, "Failed to update timezone. Please try again.")
		},
	})
}
