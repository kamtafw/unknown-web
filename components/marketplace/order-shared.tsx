"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, PackageCheck, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import { nextOrderStatus, orderKeys, orderStatuses } from "@/lib/marketplace/orders"
import type { OrderStatus, SellerOrder, SellerOrderItem } from "@/types/marketplace"
import { cn } from "@/lib/utils"
import { money, ProductImage } from "./shared"

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
	const display = orderStatuses[status]
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium",
				display.color,
			)}
		>
			<span className="size-1.5 rounded-full bg-current" />
			{display.label}
		</span>
	)
}

export function OrderProductImage({
	item,
	className,
}: {
	item: SellerOrderItem
	className?: string
}) {
	return (
		<ProductImage
			src={item.product_images?.[0]}
			name={item.product_name}
			className={cn("size-14 shrink-0", className)}
			imageClassName="p-1.5"
		/>
	)
}

export function OrderStatusAction({
	order,
	className,
}: {
	order: SellerOrder
	className?: string
}) {
	const [open, setOpen] = useState(false)
	const [target, setTarget] = useState<"shipped" | "delivered" | null>(null)
	const [error, setError] = useState("")
	const client = useQueryClient()
	const next = nextOrderStatus(order.status)
	const mutation = useMutation({
		mutationFn: (status: "shipped" | "delivered") =>
			marketplaceApi.updateOrderStatus(order.id, status),
		onSuccess: (updated) => {
			client.setQueryData(orderKeys.detail(updated.id), updated)
			client.setQueryData<SellerOrder[]>(orderKeys.all, (orders) =>
				orders?.map((item) => (item.id === updated.id ? updated : item)),
			)
			client.invalidateQueries({ queryKey: orderKeys.all })
			client.invalidateQueries({ queryKey: ["marketplace", "alerts"] })
			client.invalidateQueries({ queryKey: ["marketplace", "summary"] })
			client.invalidateQueries({ queryKey: ["marketplace", "sales"] })
			client.invalidateQueries({ queryKey: ["marketplace", "stats"] })
			setOpen(false)
			toast.success(`Order #${updated.id} marked as ${updated.status}`)
		},
		onError: (err) => {
			setError(marketplaceError(err))
			client.invalidateQueries({ queryKey: orderKeys.all })
			client.invalidateQueries({ queryKey: orderKeys.detail(order.id) })
		},
	})
	if (!next) return null
	return (
		<>
			<Button
				variant="outline"
				className={cn("rounded-full text-xs text-primary", className)}
				onClick={() => {
					setError("")
					setTarget(next)
					setOpen(true)
				}}
			>
				{next === "shipped" ? <Truck size={14} /> : <PackageCheck size={14} />}Mark as {next}
			</Button>
			<Dialog
				open={open}
				onOpenChange={(value) => {
					if (!mutation.isPending) setOpen(value)
				}}
			>
				<DialogContent className="rounded-2xl p-7">
					<div className="mb-1 inline-flex w-fit rounded-xl bg-primary/10 p-3 text-primary">
						{target === "shipped" ? <Truck size={24} /> : <PackageCheck size={24} />}
					</div>
					<DialogTitle>
						Mark order #{order.id} as {target}?
					</DialogTitle>
					<DialogDescription>
						{target === "shipped"
							? "Confirm that you have handed this order over for delivery."
							: "Confirm that this order has reached the customer."}
					</DialogDescription>
					<div className="rounded-xl bg-muted/50 p-4">
						<p className="text-xs text-muted-foreground">
							{order.items.length} {order.items.length === 1 ? "product" : "products"} ·{" "}
							{order.shipping_address?.full_name || "Customer"}
						</p>
						<p className="mt-2 text-lg font-semibold">{money(order.total)}</p>
					</div>
					{error && (
						<p role="alert" className="text-xs text-destructive">
							{error}
						</p>
					)}
					<div className="flex justify-end gap-2">
						<Button variant="outline" disabled={mutation.isPending} onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							disabled={mutation.isPending || !target || target !== next}
							onClick={() => {
								if (target) mutation.mutate(target)
							}}
						>
							{mutation.isPending && <Loader2 size={14} className="animate-spin" />}
							{mutation.isPending ? "Updating…" : `Confirm ${target}`}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
