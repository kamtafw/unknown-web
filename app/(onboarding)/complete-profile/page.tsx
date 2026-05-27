"use client"

import { CompleteProfile } from "@/components/onboarding/complete-profile"
import { useCompleteProfile } from "@/hooks/use-auth"

/** "15/08/1995" or "15/08/95" → "1995-08-15" */
function dobToApiFormat(dob: string): string {
	const [day, month, year] = dob.split("/")
	const fullYear = year.length === 2 ? (parseInt(year) > 30 ? `19${year}` : `20${year}`) : year
	return `${fullYear}-${month}-${day}`
}

const CompleteProfilePage = () => {
	const completeProfile = useCompleteProfile()

	return (
		<CompleteProfile
			isPending={completeProfile.isPending}
			onContinue={(data) =>
				completeProfile.mutate({
					first_name: data.firstName,
					last_name: data.lastName,
					dob: dobToApiFormat(data.dob),
				})
			}
		/>
	)
}

export default CompleteProfilePage
