import { PromotionBuilder } from "@/components/marketplace/promotion-builder"
export default async function PromotePage({
	searchParams,
}: {
	searchParams: Promise<{ product?: string }>
}) {
	const product = Number((await searchParams).product)
	return (
		<PromotionBuilder
			initialProductId={Number.isInteger(product) && product > 0 ? product : undefined}
		/>
	)
}
