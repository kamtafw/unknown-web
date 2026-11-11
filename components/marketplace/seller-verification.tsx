"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import type { SellerAccount } from "@/types/marketplace"
import { Panel } from "./shared"

export const isSellerVerified = (account: SellerAccount) =>
	account.approval_status === "approved" &&
	account.has_payment_account &&
	account.stripe_payouts_enabled

export function SellerVerification({ account }: { account: SellerAccount }) {
	const [open, setOpen] = useState(false)
	const [error, setError] = useState("")
	const link = useMutation({
		mutationFn: marketplaceApi.verificationLink,
		onSuccess: (result) => {
			try {
				const url = new URL(result.url)
				if (url.protocol !== "https:" || url.hostname !== "connect.stripe.com")
					throw new Error("Invalid verification URL")
				window.location.assign(url.href)
			} catch {
				setError("We couldn’t open verification. Please try again.")
			}
		},
		onError: (err) => setError(marketplaceError(err)),
	})
	if (account.approval_status !== "approved")
		return (
			<Panel className="border-primary/20 bg-primary/5">
				<div className="flex items-start gap-4">
					<ShieldCheck size={26} className="mt-1 shrink-0 text-primary" />
					<div>
						<h2 className="text-sm font-semibold">
							{account.approval_status === "rejected"
								? "Seller application not approved"
								: "Waiting for AppsCombo approval"}
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{account.approval_status === "rejected"
								? "Review and update your business details to submit your application for another review."
								: "AppsCombo will review your business details before you can set up payment verification. Payment verification becomes available after approval."}
						</p>
						<Link
							href="/market-vendor/account/edit"
							className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
						>
							Review seller details →
						</Link>
					</div>
				</div>
			</Panel>
		)
	if (isSellerVerified(account))
		return (
			<Panel className="border-emerald-500/20 bg-emerald-500/5">
				<div className="flex items-center gap-3">
					<div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
						<BadgeCheck size={25} />
					</div>
					<div>
						<h2 className="text-sm font-semibold">Your account is verified</h2>
						<p className="mt-1 text-xs text-muted-foreground">
							Your payment account is enabled to receive payouts.
						</p>
					</div>
				</div>
			</Panel>
		)
	return (
		<>
			<section className="relative overflow-hidden rounded-2xl bg-primary p-7 text-primary-foreground">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full"
					style={{ boxShadow: "inset 0 0 0 24px rgb(255 255 255 / 0.1)" }}
				/>
				<div className="relative flex flex-wrap items-center justify-between gap-5">
					<div className="flex items-start gap-4">
						<ShieldCheck size={27} className="mt-1 shrink-0" />
						<div>
							<h2 className="text-lg font-semibold">
								Get ready to receive your funds
							</h2>
							<p className="mt-2 max-w-md text-sm leading-relaxed opacity-90">
								Complete or review your identity verification to enable payouts
								for your business.
							</p>
						</div>
					</div>
					<Button
						variant="secondary"
						className="rounded-full bg-white px-5 text-primary hover:bg-white/90"
						onClick={() => {
							setError("")
							setOpen(true)
						}}
					>
						Verify account <ArrowRight size={15} />
					</Button>
				</div>
				{!account.has_payment_account && (
					<p className="relative mt-4 text-xs">
						AppsCombo has approved your application. Your payment account will
						be created when you continue to verification.
					</p>
				)}
			</section>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="rounded-2xl p-7">
					<div className="w-fit rounded-xl bg-primary/10 p-3 text-primary">
						<ShieldCheck size={26} />
					</div>
					<DialogTitle>Verify your seller account</DialogTitle>
					<DialogDescription>
						Continuing creates your Stripe payment account if needed. You’ll
						then provide your identity and business details securely to Stripe.
						Your verification status will update here after Stripe processes
						your information.
					</DialogDescription>
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							disabled={link.isPending}
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button disabled={link.isPending} onClick={() => link.mutate()}>
							{link.isPending ? (
								<Loader2 size={15} className="animate-spin" />
							) : (
								<ArrowRight size={15} />
							)}
							{link.isPending
								? "Opening verification…"
								: "Continue to verification"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
