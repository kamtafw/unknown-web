import { VerifyContent } from "./verify-content"

type Flow = "signup" | "signin" | "reset"

export default async function VerifyPage({
	searchParams,
}: {
	searchParams: Promise<{ flow?: Flow }>
}) {
	const params = await searchParams

	return <VerifyContent flow={params.flow ?? "signin"} />
}
