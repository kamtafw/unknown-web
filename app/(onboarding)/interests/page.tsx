"use client"

import { ChooseInterests } from "@/components/onboarding/choose-interests"
import { useGetInterests, useSaveInterests } from "@/hooks/use-interests"
import { useRouter } from "next/navigation"

const ChooseInterestsPage = () => {
	const router = useRouter()
	const { data, isLoading } = useGetInterests()
	const save = useSaveInterests()

	return (
		<ChooseInterests
			interests={data?.data.interests}
			isLoading={isLoading}
			isPending={save.isPending || save.isSuccess}
			onNext={(selected) => {
				if (selected.length === 0) {
					router.push("/friend-suggestions")
				}
				save.mutate({ interests: selected })
			}}
			onSkip={() => router.push("/friend-suggestions")}
		/>
	)
}

export default ChooseInterestsPage
