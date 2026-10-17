import { ProductDetails } from "@/components/marketplace/product-details"
export default async function ReviewsPage({ params }: { params: Promise<{ id: string }> }) {
	return <ProductDetails id={Number((await params).id)} reviewsOnly />
}
