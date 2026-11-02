"use client"
import { ErrorState } from "@/components/marketplace/shared"
export default function SellerError({ error, reset }: { error: Error; reset: () => void }) {
	return <ErrorState error={error} retry={reset} />
}
