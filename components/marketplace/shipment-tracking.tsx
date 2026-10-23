"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import { orderKeys } from "@/lib/marketplace/orders"
import type {
	SellerOrder,
	ShipmentDetails,
	TrackingCheckpoint,
	TrackingUpdate,
} from "@/types/marketplace"
import { dateLabel, Panel } from "./shared"

export const checkpointLabels: Record<TrackingCheckpoint, string> = {
	created: "Order created",
	paid: "Payment confirmed",
	preparing: "Package being prepared",
	collected: "Collected by carrier",
	sorting: "At sorting centre",
	in_transit: "Package on the way",
	delivered: "Delivery",
}
const field =
	"mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus-visible:outline-primary"

export function ShipmentTracking({ order }: { order: SellerOrder }) {
	const [mode, setMode] = useState<"shipment" | "tracking" | null>(null)
	const [shipment, setShipment] = useState<ShipmentDetails>(
		order.shipment || {},
	)
	const [tracking, setTracking] = useState<TrackingUpdate>({
		checkpoint: order.status === "paid" ? "preparing" : "in_transit",
		status: "successful",
		note: "",
		location: "",
	})
	const [error, setError] = useState("")
	const client = useQueryClient()
	const update = useMutation({
		mutationFn: (action: "shipment" | "tracking") =>
			action === "shipment"
				? marketplaceApi.updateShipment(order.id, {
						...shipment,
						estimated_delivery: shipment.estimated_delivery || null,
					})
				: marketplaceApi.addTrackingEvent(order.id, tracking),
		onSuccess: (updated) => {
			client.setQueryData(orderKeys.detail(order.id), updated)
			client.invalidateQueries({ queryKey: orderKeys.all })
			client.invalidateQueries({ queryKey: ["marketplace", "alerts"] })
			setMode(null)
			setTracking((current) => ({ ...current, note: "", location: "" }))
			toast.success("Order tracking updated")
		},
		onError: (err) => setError(marketplaceError(err)),
	})
	const editable = order.status === "paid" || order.status === "shipped"
	const events = order.tracking_events || []
	return (
		<>
			<Panel>
				<h2 className="flex items-center gap-2 text-sm font-semibold">
					<Truck size={17} className="text-primary" />
					Shipment details
				</h2>
				<dl className="mt-5 space-y-4 text-xs">
					<div>
						<dt className="text-muted-foreground">Carrier</dt>
						<dd className="mt-1 font-medium">
							{order.shipment?.carrier || "Not provided"}
						</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Tracking number</dt>
						<dd className="mt-1 break-all font-medium">
							{order.shipment?.tracking_number || "Not provided"}
						</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Estimated delivery</dt>
						<dd className="mt-1 font-medium">
							{order.shipment?.estimated_delivery
								? dateLabel(`${order.shipment.estimated_delivery}T12:00:00Z`)
								: "Not provided"}
						</dd>
					</div>
				</dl>
				{editable && (
					<div className="mt-5 flex flex-wrap gap-2">
						<Button
							variant="outline"
							className="rounded-full text-xs"
							onClick={() => {
								setShipment(order.shipment || {})
								setError("")
								setMode("shipment")
							}}
						>
							Edit shipment
						</Button>
						<Button
							className="rounded-full text-xs"
							onClick={() => {
								setTracking((current) => ({
									...current,
									checkpoint:
										order.status === "paid" ? "preparing" : "in_transit",
								}))
								setError("")
								setMode("tracking")
							}}
						>
							<Plus size={13} />
							Add tracking update
						</Button>
					</div>
				)}
			</Panel>
			{events.length > 0 && (
				<Panel>
					<h2 className="text-sm font-semibold">Tracking history</h2>
					<p className="mt-2 text-xs text-muted-foreground">
						Updates recorded by your store.
					</p>
					<ol className="mt-5 space-y-5">
						{[...events].reverse().map((event) => (
							<li key={event.id} className="border-l-2 border-primary/30 pl-3">
								<p className="text-xs font-medium">
									{checkpointLabels[event.checkpoint]}
								</p>
								<p className="mt-1 text-[11px] capitalize text-muted-foreground">
									{event.status}
									{event.location && ` · ${event.location}`}
								</p>
								{event.note && (
									<p className="mt-1 text-xs leading-relaxed">{event.note}</p>
								)}
								<p className="mt-2 text-[10px] text-muted-foreground">
									{dateLabel(event.occurred_at)} ·{" "}
									{new Date(event.occurred_at).toLocaleTimeString("en-NG", {
										hour: "2-digit",
										minute: "2-digit",
										timeZone: "Africa/Lagos",
									})}{" "}
									WAT
								</p>
							</li>
						))}
					</ol>
				</Panel>
			)}
			<Dialog
				open={!!mode}
				onOpenChange={(open) => {
					if (!open && !update.isPending) setMode(null)
				}}
			>
				<DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-7">
					<DialogTitle>
						{mode === "shipment"
							? "Edit shipment details"
							: "Add tracking update"}
					</DialogTitle>
					<DialogDescription>
						{mode === "shipment"
							? "Share the carrier, tracking reference, and estimated delivery date."
							: "Record the actual progress of this order. Each update is saved with its time."}
					</DialogDescription>
					<form
						className="mt-3 space-y-4"
						onSubmit={(event) => {
							event.preventDefault()
							if (mode) {
								setError("")
								update.mutate(mode)
							}
						}}
					>
						{mode === "shipment" ? (
							<>
								<label className="block text-sm font-medium">
									Carrier
									<input
										className={field}
										maxLength={100}
										value={shipment.carrier || ""}
										onChange={(event) =>
											setShipment({ ...shipment, carrier: event.target.value })
										}
									/>
								</label>
								<label className="block text-sm font-medium">
									Tracking number
									<input
										className={field}
										maxLength={100}
										value={shipment.tracking_number || ""}
										onChange={(event) =>
											setShipment({
												...shipment,
												tracking_number: event.target.value,
											})
										}
									/>
								</label>
								<label className="block text-sm font-medium">
									Estimated delivery date
									<input
										className={field}
										type="date"
										value={shipment.estimated_delivery || ""}
										onChange={(event) =>
											setShipment({
												...shipment,
												estimated_delivery: event.target.value,
											})
										}
									/>
								</label>
							</>
						) : (
							<>
								<label className="block text-sm font-medium">
									Checkpoint
									<select
										aria-label="Checkpoint"
										className={field}
										value={tracking.checkpoint}
										onChange={(event) =>
											setTracking({
												...tracking,
												checkpoint: event.target
													.value as TrackingUpdate["checkpoint"],
											})
										}
									>
										{Object.entries(checkpointLabels)
											.filter(
												([key]) =>
													!["created", "paid"].includes(key) &&
													(order.status === "shipped" || key === "preparing"),
											)
											.map(([key, label]) => (
												<option key={key} value={key}>
													{label}
												</option>
											))}
									</select>
								</label>
								<label className="block text-sm font-medium">
									Checkpoint status
									<select
										aria-label="Checkpoint status"
										className={field}
										value={tracking.status}
										onChange={(event) =>
											setTracking({
												...tracking,
												status: event.target.value as TrackingUpdate["status"],
											})
										}
									>
										<option value="successful">Successful</option>
										<option value="pending">Pending</option>
										<option value="unsuccessful">Unsuccessful</option>
									</select>
								</label>
								<label className="block text-sm font-medium">
									Location
									<input
										className={field}
										maxLength={255}
										value={tracking.location}
										onChange={(event) =>
											setTracking({ ...tracking, location: event.target.value })
										}
									/>
								</label>
								<label className="block text-sm font-medium">
									Update note
									<textarea
										className={`${field} h-24 py-3`}
										maxLength={500}
										value={tracking.note}
										onChange={(event) =>
											setTracking({ ...tracking, note: event.target.value })
										}
									/>
								</label>
								{tracking.checkpoint === "delivered" &&
									tracking.status === "successful" && (
										<p className="text-xs text-muted-foreground">
											This update will also mark the order as delivered.
										</p>
									)}
							</>
						)}
						{error && (
							<p role="alert" className="text-sm text-destructive">
								{error}
							</p>
						)}
						<div className="flex justify-end gap-3 pt-2">
							<Button
								type="button"
								variant="outline"
								disabled={update.isPending}
								onClick={() => setMode(null)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={update.isPending}>
								{update.isPending && (
									<Loader2 size={15} className="animate-spin" />
								)}
								{mode === "shipment"
									? "Save shipment details"
									: "Record tracking update"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	)
}
