"use client"

import {
	BillingPeriod,
	SAVINGS,
	TIER_ORDER,
	TIERS,
	TierId,
	TierPlan,
	getAllFeatures,
} from "@/lib/billing"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { useSubscriptionStore } from "@/stores/subscription-store"
import * as Dialog from "@radix-ui/react-dialog"
import {
	ArrowLeft,
	Building2,
	Check,
	Crown,
	Loader2,
	Minus,
	Sparkles,
	TrendingDown,
	TrendingUp,
	X,
} from "lucide-react"
import { ComponentType, useState } from "react"
import { SuccessDialog } from "../auth/success-dialog"

const TIER_ICONS: Record<Exclude<TierId, "free">, ComponentType<{ size?: number; className?: string }>> = {
	individual: Sparkles,
	organization: Building2,
	"public-figure": Crown,
}

function priceForPeriod(monthlyPrice: number, period: BillingPeriod) {
	if (period === "monthly") {
		return { perMonth: monthlyPrice, totalBilled: monthlyPrice, billingNote: "Billed monthly" }
	}
	const months = period === "quarterly" ? 3 : 12
	const totalBilled = monthlyPrice * months * (1 - SAVINGS[period] / 100)
	const perMonth = totalBilled / months
	const billingNote =
		period === "quarterly"
			? `Billed $${totalBilled.toFixed(2)} every 3 months`
			: `Billed $${totalBilled.toFixed(2)} annually`
	return { perMonth, totalBilled, billingNote }
}

function PeriodToggle({
	period,
	onChange,
}: {
	period: BillingPeriod
	onChange: (p: BillingPeriod) => void
}) {
	const options: { value: BillingPeriod; label: string }[] = [
		{ value: "monthly", label: "Monthly" },
		{ value: "quarterly", label: "Quarterly" },
		{ value: "yearly", label: "Yearly" },
	]

	return (
		<div className="flex gap-1 bg-muted rounded-2xl p-1">
			{options.map((opt) => {
				const active = period === opt.value
				const savings = SAVINGS[opt.value]
				return (
					<button
						key={opt.value}
						type="button"
						onClick={() => onChange(opt.value)}
						className={cn(
							"flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200",
							active
								? "bg-card text-primary shadow-sm border border-border"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{opt.label}
						{savings > 0 && (
							<span
								className={cn(
									"text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none",
									active
										? "bg-primary/10 text-primary"
										: "bg-muted-foreground/15 text-muted-foreground",
								)}
							>
								-{savings}%
							</span>
						)}
					</button>
				)
			})}
		</div>
	)
}

function FeatureRow({ feature }: { feature: string }) {
	return (
		<li className="flex items-start gap-2.5">
			<span className="shrink-0 w-4.5 h-4.5 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
				<Check size={10} className="text-primary" strokeWidth={3} />
			</span>
			<span className="text-[13px] leading-snug text-foreground">{feature}</span>
		</li>
	)
}

function TierCard({
	tier,
	period,
	currentTierId,
	onSelect,
}: {
	tier: TierPlan
	period: BillingPeriod
	currentTierId: TierId
	onSelect: (tier: TierPlan) => void
}) {
	const { perMonth, billingNote } = priceForPeriod(tier.monthlyPrice, period)
	const isCurrent = currentTierId === tier.id
	const currentIndex = TIER_ORDER.indexOf(currentTierId)
	const targetIndex = TIER_ORDER.indexOf(tier.id)
	const isUpgrade = targetIndex > currentIndex
	const Icon = TIER_ICONS[tier.id]

	const ctaLabel = isCurrent
		? "Current plan"
		: isUpgrade
			? `Upgrade to ${tier.name}`
			: `Downgrade to ${tier.name}`

	const inheritedFrom = tier.inherits ? TIERS.find((t) => t.id === tier.inherits)!.name : null

	return (
		<div
			className={cn(
				"relative rounded-2xl border p-5 sm:p-6 transition-colors duration-200",
				isCurrent
					? "border-primary ring-2 ring-primary/15 bg-primary/2"
					: "border-border hover:border-primary/30",
			)}
		>
			{tier.badge && !isCurrent && (
				<span className="absolute -top-3 left-5 text-[10.5px] font-bold tracking-wide uppercase text-primary-foreground bg-primary px-2.5 py-1 rounded-full shadow-sm">
					{tier.badge}
				</span>
			)}
			{isCurrent && (
				<span className="absolute -top-3 left-5 text-[10.5px] font-bold tracking-wide uppercase text-primary bg-card border border-primary px-2.5 py-1 rounded-full">
					Current plan
				</span>
			)}

			<div className="flex items-center gap-2.5 mb-1.5">
				<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
					<Icon size={16} className="text-primary" />
				</div>
				<h3 className="text-[16px] font-bold text-foreground">{tier.name}</h3>
			</div>

			<p className="text-[12.5px] text-muted-foreground leading-relaxed mb-4">{tier.tagline}</p>

			<div className="flex items-baseline gap-1">
				<span className="text-[28px] font-bold text-foreground tabular-nums">
					${perMonth.toFixed(2)}
				</span>
				<span className="text-sm text-muted-foreground">/mo</span>
			</div>
			<p className="text-[11.5px] text-muted-foreground mb-5">{billingNote}</p>

			<button
				onClick={() => !isCurrent && onSelect(tier)}
				disabled={isCurrent}
				className={cn(
					"w-full h-11.5 rounded-full text-[13.5px] font-semibold transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-1.5 mb-5",
					isCurrent
						? "bg-muted text-muted-foreground cursor-default"
						: "bg-primary text-primary-foreground hover:bg-primary/85 shadow-sm",
				)}
			>
				{!isCurrent && (isUpgrade ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
				{ctaLabel}
			</button>

			<ul className="space-y-2.5">
				{inheritedFrom && (
					<li className="text-[11.5px] font-semibold text-muted-foreground">
						Everything in {inheritedFrom}, plus:
					</li>
				)}
				{tier.ownFeatures.map((f) => (
					<FeatureRow key={f} feature={f} />
				))}
			</ul>
		</div>
	)
}

function ConfirmDialog({
	open,
	onClose,
	tier,
	period,
	currentTierId,
	onConfirm,
	isPending,
}: {
	open: boolean
	onClose: () => void
	tier: TierPlan | null
	period: BillingPeriod
	currentTierId: TierId
	onConfirm: () => void
	isPending: boolean
}) {
	if (!tier) return null

	const { perMonth, billingNote } = priceForPeriod(tier.monthlyPrice, period)
	const currentIndex = TIER_ORDER.indexOf(currentTierId)
	const targetIndex = TIER_ORDER.indexOf(tier.id)
	const isUpgrade = targetIndex > currentIndex
	const Icon = TIER_ICONS[tier.id]

	const currentFeatures = getAllFeatures(currentTierId)
	const targetFeatures = getAllFeatures(tier.id)
	const gained = targetFeatures.filter((f) => !currentFeatures.includes(f))
	const lost = currentFeatures.filter((f) => !targetFeatures.includes(f))

	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && !isPending && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					onInteractOutside={(e) => isPending && e.preventDefault()}
					className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-[calc(100%-2rem)] max-w-105 max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
				>
					<div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
						<Dialog.Title className="text-[15.5px] font-bold text-foreground">
							{isUpgrade ? "Confirm upgrade" : "Confirm downgrade"}
						</Dialog.Title>
						<Dialog.Close asChild>
							<button
								disabled={isPending}
								className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors disabled:opacity-40"
							>
								<X size={15} />
							</button>
						</Dialog.Close>
					</div>
					<Dialog.Description className="sr-only">
						Confirm switching to the {tier.name} plan, billed {period}
					</Dialog.Description>

					<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 pb-2">
						<div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/60 border border-border mb-5">
							<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
								<Icon size={16} className="text-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-[13.5px] font-bold text-foreground leading-tight">{tier.name}</p>
								<p className="text-[11.5px] text-muted-foreground mt-0.5">{billingNote}</p>
							</div>
							<div className="text-right shrink-0">
								<p className="text-[15px] font-bold text-foreground tabular-nums">
									${perMonth.toFixed(2)}
								</p>
								<p className="text-[10.5px] text-muted-foreground">/mo</p>
							</div>
						</div>

						{gained.length > 0 && (
							<div className="mb-5">
								<p className="text-[12px] font-semibold text-foreground mb-2.5">
									You&apos;ll immediately get
								</p>
								<ul className="space-y-2">
									{gained.map((f) => (
										<FeatureRow key={f} feature={f} />
									))}
								</ul>
							</div>
						)}

						{lost.length > 0 && (
							<div className="mb-5">
								<p className="text-[12px] font-semibold text-destructive mb-2.5 flex items-center gap-1.5">
									<Minus size={12} strokeWidth={3} />
									You&apos;ll lose access to
								</p>
								<ul className="space-y-2">
									{lost.map((f) => (
										<li key={f} className="flex items-start gap-2.5">
											<span className="shrink-0 w-4.5 h-4.5 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
												<X size={10} className="text-destructive" strokeWidth={3} />
											</span>
											<span className="text-[13px] leading-snug text-muted-foreground">{f}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						<p className="text-[11.5px] text-muted-foreground leading-relaxed pb-1">
							{isUpgrade
								? "Your new plan takes effect immediately and you'll be charged a prorated amount for the remainder of this cycle."
								: "Your current benefits remain active until the end of this billing period, then your plan switches automatically."}{" "}
							Cancel anytime from this screen.
						</p>
					</div>

					<div className="shrink-0 px-6 pb-6 pt-3 border-t border-border flex gap-2.5">
						<Dialog.Close asChild>
							<button
								disabled={isPending}
								className="flex-1 h-11.5 rounded-full border border-border text-[13.5px] font-semibold text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
							>
								Cancel
							</button>
						</Dialog.Close>
						<button
							onClick={onConfirm}
							disabled={isPending}
							className="flex-1 h-11.5 rounded-full bg-primary text-primary-foreground text-[13.5px] font-semibold hover:bg-primary/85 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
						>
							{isPending ? (
								<>
									<Loader2 size={13} className="animate-spin" /> Processing…
								</>
							) : isUpgrade ? (
								"Confirm & upgrade"
							) : (
								"Confirm change"
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

export function SwitchTierPanel({ onBack }: { onBack: () => void }) {
	const currentTierId = useSubscriptionStore((s) => s.tierId)
	const storedPeriod = useSubscriptionStore((s) => s.period)
	const setSubscription = useSubscriptionStore((s) => s.setSubscription)

	const [period, setPeriod] = useState<BillingPeriod>(() => storedPeriod ?? "monthly")
	const [pendingTier, setPendingTier] = useState<TierPlan | null>(null)
	const [isPending, setIsPending] = useState(false)
	const [successTier, setSuccessTier] = useState<TierPlan | null>(null)

	const handleConfirm = () => {
		if (!pendingTier || isPending) return
		setIsPending(true)

		// TODO: wire to real billing/subscription endpoint once it exists
		setTimeout(() => {
			setIsPending(false)
			setSubscription(pendingTier.id, period)
			setSuccessTier(pendingTier)
			setPendingTier(null)
			toast.success(`You're now on the ${pendingTier.name} plan`)
		}, 1200)
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
				<button
					onClick={onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
					aria-label="Go back"
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>
				<div className="min-w-0">
					<h2 className="font-bold text-foreground text-[15.5px] leading-tight">Switch tier</h2>
					<p className="text-[11.5px] text-muted-foreground mt-0.5">
						You&apos;re currently on the{" "}
						<span className="font-semibold text-foreground">
							{currentTierId === "free" ? "Free" : TIERS.find((t) => t.id === currentTierId)!.name}
						</span>{" "}
						plan
					</p>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5">
				<div className="mb-6">
					<PeriodToggle period={period} onChange={setPeriod} />
					{period !== "monthly" && (
						<p className="text-[11.5px] text-primary text-center mt-2.5 font-medium">
							Save {SAVINGS[period]}% with {period} billing — cancel anytime
						</p>
					)}
				</div>

				<div className="flex flex-col gap-6 pb-4">
					{TIERS.map((tier) => (
						<TierCard
							key={tier.id}
							tier={tier}
							period={period}
							currentTierId={currentTierId}
							onSelect={setPendingTier}
						/>
					))}
				</div>

				<p className="text-center text-[11.5px] text-muted-foreground pb-2">
					All paid plans include a 7-day free trial. No charges until the trial ends.
				</p>
			</div>

			<ConfirmDialog
				open={!!pendingTier}
				onClose={() => !isPending && setPendingTier(null)}
				tier={pendingTier}
				period={period}
				currentTierId={currentTierId}
				onConfirm={handleConfirm}
				isPending={isPending}
			/>

			<SuccessDialog
				open={!!successTier}
				onOpenChange={(v) => !v && setSuccessTier(null)}
				title={successTier ? `Welcome to ${successTier.name}` : ""}
				description={
					successTier
						? `Your plan is active. You now have access to everything ${successTier.name} offers, billed ${period}.`
						: undefined
				}
				actionLabel="Done"
				onAction={() => setSuccessTier(null)}
			/>
		</div>
	)
}