"use client"

import { useRef, useState, type ChangeEvent, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
	Check,
	ChevronDown,
	ImagePlus,
	Info,
	Loader2,
	Package,
	Plus,
	Search,
	Trash2,
	Truck,
	Upload,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import { socialsApi } from "@/lib/socials/api"
import type {
	Category,
	DeliveryOption,
	ProductDetail,
	ProductPayload,
} from "@/types/marketplace"
import { cn } from "@/lib/utils"
import { SpecificationInput } from "./specification-input"
import {
	EmptyState,
	ErrorState,
	LoadingState,
	money,
	PageHeading,
	Panel,
	ProductImage,
	PromoteSwitch,
} from "./shared"

const fieldClass =
	"h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm outline-none placeholder:text-muted-foreground/65 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:opacity-60"
type SpecRow = { id: string; name: string; value: string }
type DeliveryRow = { id: string; option: string; price: string }

function Field({
	label,
	htmlFor,
	hint,
	children,
}: {
	label: string
	htmlFor?: string
	hint?: string
	children: ReactNode
}) {
	return (
		<div>
			<label htmlFor={htmlFor} className="mb-2 block text-xs font-medium">
				{label}
			</label>
			{children}
			{hint && (
				<p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
					{hint}
				</p>
			)}
		</div>
	)
}

function OptionPicker({
	title,
	description,
	options,
	selected,
	multiple,
	onSelect,
	trigger,
	disabled,
}: {
	title: string
	description: string
	options: { id: number; name: string }[]
	selected: number[]
	multiple?: boolean
	onSelect: (id: number) => void
	trigger: ReactNode
	disabled?: boolean
}) {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState("")
	const filtered = options.filter((o) =>
		o.name.toLowerCase().includes(search.toLowerCase()),
	)
	return (
		<>
			<button
				type="button"
				disabled={disabled}
				onClick={() => {
					setSearch("")
					setOpen(true)
				}}
				className={cn(
					fieldClass,
					"flex items-center justify-between gap-2 text-left",
				)}
				aria-haspopup="dialog"
			>
				{trigger}
				<ChevronDown size={15} className="shrink-0 text-muted-foreground" />
			</button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="rounded-2xl">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
					<div className="relative">
						<Search
							className="absolute top-3.5 left-3 text-muted-foreground"
							size={16}
						/>
						<input
							autoFocus
							aria-label={`Search ${title.toLowerCase()}`}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search…"
							className={cn(fieldClass, "pl-9")}
						/>
					</div>
					<div className="max-h-72 space-y-1 overflow-y-auto">
						{filtered.length ? (
							filtered.map((option) => (
								<button
									key={option.id}
									type="button"
									aria-pressed={selected.includes(option.id)}
									onClick={() => {
										onSelect(option.id)
										if (!multiple) setOpen(false)
									}}
									className="flex w-full items-center justify-between rounded-xl p-3 text-left text-sm hover:bg-muted focus-visible:outline-primary"
								>
									<span>{option.name}</span>
									<span
										className={cn(
											"flex size-5 items-center justify-center rounded border",
											selected.includes(option.id)
												? "border-primary bg-primary text-primary-foreground"
												: "border-border",
										)}
									>
										{selected.includes(option.id) && <Check size={13} />}
									</span>
								</button>
							))
						) : (
							<p className="py-8 text-center text-sm text-muted-foreground">
								No options found.
							</p>
						)}
					</div>
					{multiple && (
						<Button onClick={() => setOpen(false)} className="rounded-full">
							Done
						</Button>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}

export function ProductEditor({ id }: { id?: number }) {
	const identity = useQuery({
		queryKey: ["marketplace", "identity"],
		queryFn: marketplaceApi.identity,
	})
	const detail = useQuery({
		queryKey: ["marketplace", "seller-product", id],
		queryFn: () => marketplaceApi.sellerProduct(id!),
		enabled: !!id && Number.isInteger(id) && id > 0,
	})
	if (id !== undefined && (!Number.isInteger(id) || id <= 0))
		return (
			<EmptyState
				title="Product not found"
				description="Choose a product from your catalogue to edit."
			/>
		)
	if (identity.isPending || (id !== undefined && detail.isPending))
		return <LoadingState />
	if (identity.isError || (id !== undefined && detail.isError))
		return (
			<ErrorState
				error={identity.error || detail.error}
				retry={() => {
					identity.refetch()
					if (id) detail.refetch()
				}}
			/>
		)
	if (id && detail.data?.product.seller.id !== identity.data?.seller_id)
		return (
			<EmptyState
				title="This listing belongs to another seller"
				description="You can only edit products from your own store."
			/>
		)
	return (
		<>
			{identity.data.approval_status !== "approved" && (
				<Panel className="mb-6 border-primary/20 bg-primary/5 text-sm">
					You can create and edit listings now. Buyers will see your products
					once AppsCombo approves your seller account.
				</Panel>
			)}
			<EditorForm
				key={id || "new"}
				product={detail.data?.product}
				approved={identity.data.approval_status === "approved"}
			/>
		</>
	)
}

function EditorForm({
	product,
	approved,
}: {
	product?: ProductDetail
	approved: boolean
}) {
	const router = useRouter()
	const client = useQueryClient()
	const input = useRef<HTMLInputElement>(null)
	const [name, setName] = useState(product?.name || "")
	const [description, setDescription] = useState(product?.description || "")
	const [price, setPrice] = useState(product?.price || "")
	const [quantity, setQuantity] = useState(String(product?.quantity ?? ""))
	const [promote, setPromote] = useState(product?.promote || false)
	const [discountEnabled, setDiscountEnabled] = useState(
		product?.discount_price != null,
	)
	const [discount, setDiscount] = useState(product?.discount_price || "")
	const [images, setImages] = useState<string[]>(product?.images || [])
	const [categoryIds, setCategoryIds] = useState<number[]>(
		product?.categories.map((c) => c.id) || [],
	)
	const [specs, setSpecs] = useState<SpecRow[]>(
		product?.specifications.flatMap((spec, i) =>
			Object.entries(spec).map(([name, value], j) => ({
				id: `${i}-${j}`,
				name,
				value,
			})),
		) || [{ id: "initial", name: "", value: "" }],
	)
	const [deliveries, setDeliveries] = useState<DeliveryRow[]>(
		product?.delivery_settings.map((d) => ({
			id: String(d.delivery_option.id),
			option: String(d.delivery_option.id),
			price: d.price,
		})) || [{ id: "initial", option: "", price: "" }],
	)
	const [uploading, setUploading] = useState(false)
	const [error, setError] = useState("")
	const [imageError, setImageError] = useState("")
	const categories = useQuery({
		queryKey: ["marketplace", "categories"],
		queryFn: marketplaceApi.categories,
	})
	const deliveryOptions = useQuery({
		queryKey: ["marketplace", "deliveries"],
		queryFn: marketplaceApi.deliveries,
	})
	const save = useMutation({
		mutationFn: (payload: ProductPayload) =>
			product
				? marketplaceApi
						.update(product.id, payload)
						.then(() => ({ id: product.id }))
				: marketplaceApi.create(payload),
		onSuccess: (result) => {
			client.invalidateQueries({ queryKey: ["marketplace"] })
			toast.success(
				product
					? "Product updated"
					: approved
						? "Product listed successfully"
						: "Private listing saved",
			)
			router.push(`/market-vendor/goods/${result.id}`)
		},
		onError: (err) => setError(marketplaceError(err)),
	})
	const busy = uploading || save.isPending
	const categoryOptions: Category[] = categories.data || []
	const options: DeliveryOption[] = deliveryOptions.data || []
	async function upload(event: ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files || [])
		event.target.value = ""
		setImageError("")
		if (!files.length) return
		if (images.length + files.length > 6) {
			setImageError("You can add up to 6 images. Choose fewer files.")
			return
		}
		if (
			files.some(
				(file) =>
					!["image/jpeg", "image/png"].includes(file.type) ||
					file.size > 10 * 1024 * 1024,
			)
		) {
			setImageError("Choose JPG or PNG images smaller than 10 MB each.")
			return
		}
		setUploading(true)
		// Preserve successful uploads if a later file fails, so retrying doesn’t discard work.
		try {
			for (const file of files) {
				const result: unknown = await socialsApi.uploadMedia(file)
				const urls =
					typeof result === "string"
						? [result]
						: Array.isArray(result)
							? result.filter(
									(value): value is string => typeof value === "string",
								)
							: []
				if (!urls.length || urls.some((url) => !/^https?:\/\//.test(url)))
					throw new Error("The image upload did not return a usable URL.")
				setImages((current) => [...current, ...urls].slice(0, 6))
			}
		} catch (err) {
			setImageError(
				err instanceof Error && !("response" in err)
					? err.message
					: marketplaceError(err),
			)
		} finally {
			setUploading(false)
		}
	}
	function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		if (busy) return
		if (!name.trim()) {
			setError("Enter a product name.")
			return
		}
		if (!categoryIds.length) {
			setError("Select at least one product category.")
			return
		}
		if (
			discountEnabled &&
			(!discount || Number(discount) <= 0 || Number(discount) >= Number(price))
		) {
			setError(
				"The discount price must be greater than zero and below the regular price.",
			)
			return
		}
		if (
			specs.some(
				(s) =>
					(s.name.trim() && !s.value.trim()) ||
					(!s.name.trim() && s.value.trim()),
			)
		) {
			setError(
				"Add both a name and a value for each specification, or remove the empty row.",
			)
			return
		}
		const activeDeliveries = deliveries.filter((d) => d.option || d.price)
		if (
			activeDeliveries.some(
				(d) => !d.option || d.price === "" || Number(d.price) < 0,
			)
		) {
			setError(
				"Choose a delivery provider and enter a valid shipping price for each option.",
			)
			return
		}
		if (
			new Set(activeDeliveries.map((d) => d.option)).size !==
			activeDeliveries.length
		) {
			setError("Each delivery provider can only be added once.")
			return
		}
		save.mutate({
			name: name.trim(),
			description: description.trim(),
			price,
			discount_price: discountEnabled ? discount : null,
			quantity: Number(quantity),
			promote,
			images,
			category_ids: categoryIds,
			specifications: specs
				.filter((s) => s.name.trim())
				.map((s) => ({ [s.name.trim()]: s.value.trim() })),
			delivery_settings: activeDeliveries.map((d) => ({
				delivery_option_id: Number(d.option),
				price: d.price,
			})),
		})
	}
	return (
		<>
			<PageHeading
				title={product ? "Edit product" : "List a product"}
				description={
					product
						? "Give your listing a little refresh. Your changes go live when you save."
						: "Turn something great into your next sale."
				}
				back="/market-vendor/goods"
				actions={
					<>
						<Button variant="outline" asChild className="h-10 rounded-full">
							<Link
								href={
									product
										? `/market-vendor/goods/${product.id}`
										: "/market-vendor/goods"
								}
							>
								Cancel
							</Link>
						</Button>
						<Button
							type="submit"
							form="product-editor"
							disabled={
								busy ||
								categories.isError ||
								categories.isPending ||
								deliveryOptions.isError ||
								deliveryOptions.isPending
							}
							className="h-10 rounded-full px-5"
						>
							{save.isPending ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								<Upload size={16} />
							)}
							{save.isPending
								? "Saving…"
								: product
									? "Save changes"
									: approved
										? "Publish product"
										: "Save listing"}
						</Button>
					</>
				}
			/>
			<form id="product-editor" onSubmit={submit}>
				{error && (
					<div
						role="alert"
						className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
					>
						{error}
					</div>
				)}
				<fieldset
					disabled={busy}
					className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]"
				>
					<div className="min-w-0 space-y-6">
						<Panel>
							<div className="mb-5 flex items-center justify-between">
								<div>
									<h2 className="font-semibold">Product images</h2>
									<p className="mt-1 text-xs text-muted-foreground">
										Let your product do the talking. Your first image is the
										cover.
									</p>
								</div>
								<span className="shrink-0 text-xs text-muted-foreground">
									{images.length} / 6
								</span>
							</div>
							<input
								ref={input}
								type="file"
								accept="image/jpeg,image/png"
								multiple
								onChange={upload}
								className="sr-only"
								tabIndex={-1}
								aria-label="Upload product images"
							/>
							<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
								{images.map((src, i) => (
									<div key={`${src}-${i}`} className="relative">
										<ProductImage
											src={src}
											name={`Product image ${i + 1}`}
											className="aspect-square"
										/>
										{i === 0 && (
											<span className="absolute bottom-2 left-2 rounded-full bg-card/95 px-2 py-0.5 text-[9px] text-primary">
												Cover
											</span>
										)}
										<button
											type="button"
											aria-label={`Remove image ${i + 1}`}
											onClick={() =>
												setImages((current) =>
													current.filter((_, index) => i !== index),
												)
											}
											className="absolute top-2 right-2 rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-destructive"
										>
											<Trash2 size={13} />
										</button>
									</div>
								))}
								{images.length < 6 && (
									<button
										type="button"
										onClick={() => input.current?.click()}
										disabled={busy}
										className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-primary transition hover:bg-primary/10 focus-visible:outline-primary"
									>
										{uploading ? (
											<Loader2 size={23} className="animate-spin" />
										) : (
											<ImagePlus size={23} />
										)}
										<span className="text-xs font-medium">
											{uploading ? "Uploading…" : "Add images"}
										</span>
									</button>
								)}
							</div>
							<p className="mt-4 text-[10px] text-muted-foreground">
								JPG or PNG · Up to 10 MB per image · Maximum 6 images
							</p>
							{imageError && (
								<p role="alert" className="mt-3 text-xs text-destructive">
									{imageError}
								</p>
							)}
						</Panel>
						<Panel>
							<h2 className="mb-6 font-semibold">The essentials</h2>
							<div className="space-y-5">
								<Field label="Product name" htmlFor="product-name">
									<input
										id="product-name"
										required
										maxLength={100}
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="e.g. Yoobao 300W Mini Power Station"
										className={fieldClass}
									/>
									<p className="mt-1.5 text-right text-[10px] text-muted-foreground">
										{name.length}/100
									</p>
								</Field>
								<Field
									label="Product categories"
									hint="Choose the categories that best describe your product."
								>
									{categories.isError ? (
										<div role="alert" className="text-xs text-destructive">
											Couldn’t load categories.{" "}
											<button
												type="button"
												className="underline"
												onClick={() => categories.refetch()}
											>
												Try again
											</button>
										</div>
									) : (
										<OptionPicker
											title="Product categories"
											description="Select one or more categories for your listing."
											options={categoryOptions}
											selected={categoryIds}
											multiple
											onSelect={(id) =>
												setCategoryIds((current) =>
													current.includes(id)
														? current.filter((c) => c !== id)
														: [...current, id],
												)
											}
											disabled={categories.isPending}
											trigger={
												<span
													className={cn(
														"truncate",
														!categoryIds.length && "text-muted-foreground",
													)}
												>
													{categories.isPending
														? "Loading categories…"
														: categoryIds.length
															? categoryOptions
																	.filter((c) => categoryIds.includes(c.id))
																	.map((c) => c.name)
																	.join(", ") ||
																product?.categories
																	.map((c) => c.name)
																	.join(", ")
															: "Select categories"}
												</span>
											}
										/>
									)}
								</Field>
								<div className="grid gap-5 sm:grid-cols-2">
									<Field label="Product price (₦)" htmlFor="product-price">
										<input
											id="product-price"
											type="number"
											required
											min="0.01"
											max="9999999999.99"
											step="0.01"
											value={price}
											onChange={(e) => setPrice(e.target.value)}
											placeholder="0.00"
											className={fieldClass}
										/>
									</Field>
									<Field label="Product quantity" htmlFor="product-quantity">
										<input
											id="product-quantity"
											type="number"
											required
											min="0"
											step="1"
											value={quantity}
											onChange={(e) => setQuantity(e.target.value)}
											placeholder="0"
											className={fieldClass}
										/>
									</Field>
								</div>
								<div className="rounded-xl border border-border p-4">
									<label className="flex items-center justify-between text-xs font-medium">
										<span>Add a discount</span>
										<input
											type="checkbox"
											role="switch"
											checked={discountEnabled}
											onChange={(e) => setDiscountEnabled(e.target.checked)}
											className="size-4 accent-primary"
										/>
									</label>
									{discountEnabled && (
										<div className="mt-4">
											<Field
												label="Discount price (₦)"
												htmlFor="discount-price"
												hint="Enter the final discounted price, below your regular price."
											>
												<input
													id="discount-price"
													type="number"
													min="0.01"
													step="0.01"
													required
													value={discount}
													onChange={(e) => setDiscount(e.target.value)}
													placeholder="0.00"
													className={fieldClass}
												/>
											</Field>
										</div>
									)}
								</div>
							</div>
						</Panel>
						<Panel>
							<div className="mb-5">
								<h2 className="font-semibold">Specifications</h2>
								<p className="mt-1 text-xs text-muted-foreground">
									Add the details customers compare, like weight, capacity, or
									size.
								</p>
							</div>
							<div className="space-y-3">
								{specs.map((s, i) => (
									<div
										key={s.id}
										className="grid grid-cols-[1fr_1fr_36px] gap-3"
									>
										<SpecificationInput
											label={`Specification ${i + 1} name`}
											field="name"
											categoryIds={categoryIds}
											excluded={specs.filter((row) => row.id !== s.id).map((row) => row.name)}
											value={s.name}
											onChange={(name) =>
												setSpecs((current) =>
													current.map((row) =>
														row.id === s.id
															? { ...row, name }
															: row,
													),
												)
											}
											placeholder="e.g. Weight"
											className={fieldClass}
										/>
										<SpecificationInput
											label={`Specification ${i + 1} value`}
											field="value"
											specificationName={s.name}
											categoryIds={categoryIds}
											value={s.value}
											onChange={(value) =>
												setSpecs((current) =>
													current.map((row) =>
														row.id === s.id
															? { ...row, value }
															: row,
													),
												)
											}
											placeholder="e.g. 12 kg"
											className={fieldClass}
										/>
										<button
											type="button"
											aria-label={`Remove specification ${i + 1}`}
											onClick={() =>
												setSpecs((current) =>
													current.filter((row) => row.id !== s.id),
												)
											}
											className="flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive"
										>
											<Trash2 size={15} />
										</button>
									</div>
								))}
							</div>
							<Button
								type="button"
								variant="outline"
								className="mt-4 rounded-full text-xs text-primary"
								onClick={() =>
									setSpecs((current) => [
										...current,
										{ id: crypto.randomUUID(), name: "", value: "" },
									])
								}
							>
								<Plus size={14} /> Add another specification
							</Button>
						</Panel>
						<Panel>
							<div className="mb-5">
								<h2 className="font-semibold">Delivery options</h2>
								<p className="mt-1 text-xs text-muted-foreground">
									Give customers a choice of delivery providers and shipping
									prices.
								</p>
							</div>
							{deliveryOptions.isError ? (
								<div role="alert" className="text-xs text-destructive">
									Couldn’t load delivery options.{" "}
									<button
										type="button"
										className="underline"
										onClick={() => deliveryOptions.refetch()}
									>
										Try again
									</button>
								</div>
							) : (
								<div className="space-y-3">
									{deliveries.map((d, i) => (
										<div
											key={d.id}
											className="grid grid-cols-[1fr_110px_36px] gap-3 sm:grid-cols-[1fr_160px_36px]"
										>
											<OptionPicker
												title="Delivery provider"
												description="Choose a delivery provider for this option."
												options={options}
												selected={d.option ? [Number(d.option)] : []}
												onSelect={(id) =>
													setDeliveries((current) =>
														current.map((row) =>
															row.id === d.id
																? { ...row, option: String(id) }
																: row,
														),
													)
												}
												disabled={deliveryOptions.isPending}
												trigger={
													<span
														className={cn(
															"truncate",
															!d.option && "text-muted-foreground",
														)}
													>
														{options.find((o) => o.id === Number(d.option))
															?.name ||
															(deliveryOptions.isPending
																? "Loading…"
																: "Select delivery")}
													</span>
												}
											/>
											<input
												type="number"
												aria-label={`Delivery ${i + 1} price in naira`}
												min="0"
												max="9999999999.99"
												step="0.01"
												value={d.price}
												onChange={(e) =>
													setDeliveries((current) =>
														current.map((row) =>
															row.id === d.id
																? { ...row, price: e.target.value }
																: row,
														),
													)
												}
												placeholder="₦ 0.00"
												className={fieldClass}
											/>
											<button
												type="button"
												aria-label={`Remove delivery ${i + 1}`}
												onClick={() =>
													setDeliveries((current) =>
														current.filter((row) => row.id !== d.id),
													)
												}
												className="flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive"
											>
												<Trash2 size={15} />
											</button>
										</div>
									))}
								</div>
							)}
							<Button
								type="button"
								variant="outline"
								disabled={deliveryOptions.isPending || deliveryOptions.isError}
								className="mt-4 rounded-full text-xs text-primary"
								onClick={() =>
									setDeliveries((current) => [
										...current,
										{ id: crypto.randomUUID(), option: "", price: "" },
									])
								}
							>
								<Plus size={14} /> Add another delivery option
							</Button>
						</Panel>
						<Panel>
							<Field
								label="Product description"
								htmlFor="product-description"
								hint="Tell customers what makes your product useful, what’s included, and how to use it."
							>
								<textarea
									id="product-description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rows={6}
									placeholder="Describe your product…"
									className={cn(
										fieldClass,
										"h-auto resize-y py-3 leading-relaxed",
									)}
								/>
							</Field>
						</Panel>
					</div>
					<div className="space-y-5 xl:sticky xl:top-0">
						<Panel className="p-5">
							<h2 className="mb-4 text-sm font-semibold">Listing preview</h2>
							<ProductImage
								src={images[0]}
								name={name || "Your product"}
								className="aspect-[4/3]"
							/>
							<p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-primary">
								{categoryOptions
									.filter((c) => categoryIds.includes(c.id))
									.map((c) => c.name)
									.join(" · ") || "Your category"}
							</p>
							<p className="mt-2 break-words text-sm font-semibold">
								{name || "Your product name"}
							</p>
							<p className="mt-3 text-xl font-semibold text-primary">
								{price
									? money(discountEnabled && discount ? discount : price)
									: "₦0.00"}
							</p>
							<p className="mt-2 text-xs text-muted-foreground">
								{quantity || "0"} in stock
							</p>
						</Panel>
						<Panel className="p-5">
							<div className="flex items-center justify-between gap-3">
								<label
									htmlFor="promote-listing"
									className="text-xs font-semibold"
								>
									Promote this product
								</label>
								<PromoteSwitch
									id="promote-listing"
									checked={promote}
									onChange={setPromote}
									disabled={busy}
								/>
							</div>
							<p className="mt-3 flex gap-2 text-[11px] leading-relaxed text-muted-foreground">
								<Info size={13} className="mt-0.5 shrink-0" />
								Mark your product for promotion. Paid ad campaigns are managed
								separately.
							</p>
						</Panel>
						<div className="space-y-4 px-2 text-xs text-muted-foreground">
							<p className="flex items-center gap-2">
								<ImagePlus size={15} className="text-primary" /> Clear photos
								help products stand out
							</p>
							<p className="flex items-center gap-2">
								<Package size={15} className="text-primary" /> Keep your stock
								count up to date
							</p>
							<p className="flex items-center gap-2">
								<Truck size={15} className="text-primary" /> Offer delivery
								options that work for you
							</p>
						</div>
					</div>
				</fieldset>
				<div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
					<p className="text-xs text-muted-foreground">
						{product
							? "Your changes will be visible to customers."
							: "Your product will be visible in the marketplace."}
					</p>
					<Button
						type="submit"
						disabled={
							busy ||
							categories.isPending ||
							categories.isError ||
							deliveryOptions.isPending ||
							deliveryOptions.isError
						}
						className="h-10 rounded-full px-6"
					>
						{busy && <Loader2 size={14} className="animate-spin" />}
						{save.isPending
							? "Saving…"
							: product
								? "Save changes"
								: approved
									? "Publish product"
									: "Save listing"}
					</Button>
				</div>
			</form>
		</>
	)
}
