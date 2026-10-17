import { ProductEditor } from "@/components/marketplace/product-editor"
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
	return <ProductEditor id={Number((await params).id)} />
}
