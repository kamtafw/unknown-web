"use client"

import {
	BillingPeriod,
	SAVINGS,
	TIERS,
	TierId,
	TierPlan,
	formatRenewalDate,
	getAllFeatures,
	priceForPeriod,
} from "@/lib/billing"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { useSubscriptionStore } from "@/stores/subscription-store"
import * as Dialog from "@radix-ui/react-dialog"
import dayjs from "dayjs"
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Building2,
	Calendar,
	Check,
	CreditCard,
	Crown,
	Download,
	ExternalLink,
	Loader2,
	Receipt,
	RefreshCcw,
	Sparkles,
	TrendingUp,
	X,
} from "lucide-react"
import { ComponentType, useState } from "react"

// ─── shared ────────────────────────────────────────────────────────────────

const TIER_ICONS: Record<Exclude<TierId, "free">, ComponentType<{ size?: number; className?: string }>> = {
	individual: Sparkles,
	organization: Building2,
	"public-figure": Crown,
}

const TIER_COLORS: Record<Exclude<TierId, "free">, string> = {
	individual: "from-blue-500/20 to-primary/10",
	organization: "from-violet-500/20 to-primary/10",
	"public-figure": "from-amber-500/20 to-primary/10",
}

const ICON_COLORS: Record<Exclude<TierId, "free">, string> = {
	individual: "text-blue-500",
	organization: "text-violet-500",
	"public-figure": "text-amber-500",
}

// Mock invoice data — replace with real API data once available
interface Invoice {
	id: string
	date: string
	amount: number
	period: BillingPeriod
	status: "paid" | "pending" | "failed"
}

function buildMockInvoices(tier: TierPlan, period: BillingPeriod): Invoice[] {
	const { totalBilled } = priceForPeriod(tier.monthlyPrice, period)
  dayjs.extend(quarterOfYear)
	const now = dayjs()
	return [0, 1, 2].map((i) => ({
		id: `INV-${Date.now() - i * 1000}`,
		date: now.subtract(i, period === "yearly" ? "year" : period === "quarterly" ? "quarter" : "month").toISOString(),
		amount: totalBilled,
		period,
		status: "paid",
	}))
}

// ─── sub-components ─────────────────────────────────────────────────────────

function PanelHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
				aria-label="Go back"
			>
				<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
			</button>
			<div className="min-w-0">
				<h2 className="font-bold text-foreground text-[15.5px] leading-tight">{title}</h2>
				{subtitle && <p className="text-[11.5px] text-muted-foreground mt-0.5">{subtitle}</p>}
			</div>
		</div>
	)
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
			{children}
		</p>
	)
}

// ─── plan hero card ──────────────────────────────────────────────────────────

function PlanHeroCard({
	tier,
	period,
	renewalDate,
	cancelAtPeriodEnd,
	onSwitchTier,
}: {
	tier: TierPlan
	period: BillingPeriod
	renewalDate: string | null
	cancelAtPeriodEnd: boolean
	onSwitchTier: () => void
}) {
	const Icon = TIER_ICONS[tier.id]
	const gradient = TIER_COLORS[tier.id]
	const iconColor = ICON_COLORS[tier.id]
	const { perMonth, totalBilled } = priceForPeriod(tier.monthlyPrice, period)
	const savings = SAVINGS[period]

	return (
		<div className={cn("relative rounded-2xl overflow-hidden border border-border bg-linear-to-br", gradient)}>
			{/* subtle grid texture */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(0deg,transparent,transparent 23px,currentColor 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,currentColor 24px)",
				}}
			/>

			<div className="relative p-5">
				<div className="flex items-start justify-between gap-3 mb-4">
					<div className="flex items-center gap-2.5">
						<div className="w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
							<Icon size={18} className={iconColor} />
						</div>
						<div>
							<p className="text-[15px] font-bold text-foreground leading-tight">{tier.name}</p>
							<div className="flex items-center gap-1.5 mt-0.5">
								<span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">
									{period}
								</span>
								{savings > 0 && (
									<span className="text-[11px] font-semibold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
										{savings}% off
									</span>
								)}
							</div>
						</div>
					</div>
					<div className="text-right shrink-0">
						<p className="text-[22px] font-bold text-foreground tabular-nums leading-none">
							${perMonth.toFixed(2)}
						</p>
						<p className="text-[11px] text-muted-foreground mt-0.5">/mo</p>
					</div>
				</div>

				<div className="flex items-center gap-3 pt-3 border-t border-white/10">
					<div className="flex items-center gap-1.5 flex-1 min-w-0">
						<Calendar size={13} className="text-muted-foreground shrink-0" />
						<span className="text-[12px] text-muted-foreground">
							{cancelAtPeriodEnd ? (
								<span className="text-amber-500 font-medium">
									Cancels {formatRenewalDate(renewalDate)}
								</span>
							) : (
								<>Renews {formatRenewalDate(renewalDate)}</>
							)}
						</span>
					</div>
					{period !== "monthly" && (
						<span className="text-[11.5px] text-muted-foreground shrink-0">
							${totalBilled.toFixed(2)} total
						</span>
					)}
				</div>
			</div>

			<button
				onClick={onSwitchTier}
				className="w-full flex items-center justify-between px-5 py-3 border-t border-white/10 bg-background/30 backdrop-blur-sm hover:bg-background/50 transition-colors group"
			>
				<span className="text-[13px] font-semibold text-foreground">Switch tier</span>
				<ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
			</button>
		</div>
	)
}

// ─── free plan card ──────────────────────────────────────────────────────────

function FreePlanCard({ onUpgrade }: { onUpgrade: () => void }) {
	return (
		<div className="rounded-2xl border border-border bg-muted/40 p-5">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
					<Sparkles size={18} className="text-muted-foreground" />
				</div>
				<div>
					<p className="text-[15px] font-bold text-foreground">Free plan</p>
					<p className="text-[12px] text-muted-foreground">Basic access, no payment required</p>
				</div>
			</div>
			<button
				onClick={onUpgrade}
				className="w-full h-11 rounded-full bg-primary text-primary-foreground text-[13.5px] font-semibold hover:bg-primary/85 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
			>
				<TrendingUp size={14} />
				Upgrade to a paid plan
			</button>
		</div>
	)
}

// ─── payment method ──────────────────────────────────────────────────────────

const CARD_BRAND_COLORS: Record<string, string> = {
	Visa: "bg-blue-600",
	Mastercard: "bg-red-500",
	Amex: "bg-green-600",
	default: "bg-muted-foreground",
}

function PaymentMethodCard({
	brand,
	last4,
	onUpdate,
}: {
	brand: string
	last4: string
	onUpdate: () => void
}) {
	const color = CARD_BRAND_COLORS[brand] ?? CARD_BRAND_COLORS.default

	return (
		<div className="flex items-center gap-3 p-4 rounded-xl border border-border">
			<div className={cn("w-10 h-7 rounded-md flex items-center justify-center shrink-0", color)}>
				<CreditCard size={14} className="text-white" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-[13.5px] font-semibold text-foreground">
					{brand} ···· {last4}
				</p>
				<p className="text-[12px] text-muted-foreground mt-0.5">Default payment method</p>
			</div>
			<button
				onClick={onUpdate}
				className="shrink-0 text-[12.5px] font-semibold text-primary hover:opacity-70 transition-opacity"
			>
				Update
			</button>
		</div>
	)
}

function NoPaymentMethod({ onAdd }: { onAdd: () => void }) {
	return (
		<button
			onClick={onAdd}
			className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-accent/30 transition-colors"
		>
			<div className="w-10 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
				<CreditCard size={14} className="text-muted-foreground" />
			</div>
			<p className="text-[13px] font-medium text-muted-foreground">Add payment method</p>
			<ArrowRight size={13} className="text-muted-foreground ml-auto" />
		</button>
	)
}

// ─── invoice row ─────────────────────────────────────────────────────────────

function InvoiceRow({ invoice, tierName }: { invoice: Invoice; tierName: string }) {
	const statusConfig = {
		paid: { label: "Paid", cls: "text-green-600 bg-green-500/10" },
		pending: { label: "Pending", cls: "text-amber-500 bg-amber-500/10" },
		failed: { label: "Failed", cls: "text-destructive bg-destructive/10" },
	}[invoice.status]

	return (
		<div className="flex items-center gap-3 py-3.5 border-b border-border/50 last:border-0">
			<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
				<Receipt size={14} className="text-muted-foreground" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-[13px] font-semibold text-foreground leading-tight">{tierName}</p>
				<p className="text-[11.5px] text-muted-foreground mt-0.5">
					{dayjs(invoice.date).format("MMM D, YYYY")}
				</p>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", statusConfig.cls)}>
					{statusConfig.label}
				</span>
				<span className="text-[13px] font-semibold text-foreground tabular-nums">
					${invoice.amount.toFixed(2)}
				</span>
				<button
					className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
					title="Download receipt"
				>
					<Download size={13} />
				</button>
			</div>
		</div>
	)
}

// ─── active features ──────────────────────────────────────────────────────────

function ActiveFeatures({ tierId }: { tierId: TierId }) {
	const features = getAllFeatures(tierId)
	if (!features.length) return null

	return (
		<div className="rounded-xl border border-border overflow-hidden">
			<div className="px-4 py-3 border-b border-border bg-muted/30">
				<p className="text-[12px] font-semibold text-foreground">What&apos;s included</p>
			</div>
			<ul className="px-4 py-3 space-y-2.5">
				{features.map((f) => (
					<li key={f} className="flex items-start gap-2.5">
						<span className="shrink-0 w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
							<Check size={9} className="text-primary" strokeWidth={3} />
						</span>
						<span className="text-[12.5px] text-foreground leading-snug">{f}</span>
					</li>
				))}
			</ul>
		</div>
	)
}

// ─── update payment dialog ───────────────────────────────────────────────────

function UpdatePaymentDialog({
	open,
	onClose,
	onSave,
	isPending,
}: {
	open: boolean
	onClose: () => void
	onSave: (brand: string, last4: string) => void
	isPending: boolean
}) {
	const [cardNum, setCardNum] = useState("")
	const [expiry, setExpiry] = useState("")
	const [cvc, setCvc] = useState("")
	const [error, setError] = useState("")

	const formatCardNum = (v: string) =>
		v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
	const formatExpiry = (v: string) => {
		const d = v.replace(/\D/g, "").slice(0, 4)
		return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
	}

	const handleSave = () => {
		const raw = cardNum.replace(/\s/g, "")
		if (raw.length < 16) { setError("Enter a valid 16-digit card number."); return }
		if (!expiry.match(/^\d{2}\/\d{2}$/)) { setError("Enter a valid expiry (MM/YY)."); return }
		if (cvc.length < 3) { setError("Enter a valid CVV."); return }
		setError("")
		const brand = raw.startsWith("4") ? "Visa" : raw.startsWith("5") ? "Mastercard" : "Card"
		onSave(brand, raw.slice(-4))
	}

	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && !isPending && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-[calc(100%-2rem)] max-w-100 bg-card border border-border rounded-2xl shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
						<Dialog.Title className="text-[15px] font-bold text-foreground">Update payment</Dialog.Title>
						<Dialog.Close asChild>
							<button disabled={isPending} className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors">
								<X size={15} />
							</button>
						</Dialog.Close>
					</div>
					<Dialog.Description className="sr-only">Update your card details</Dialog.Description>

					<div className="px-6 py-5 flex flex-col gap-4">
						{/* Card number */}
						<div className="flex flex-col gap-1.5">
							<label className="text-[12.5px] font-semibold text-foreground">Card number</label>
							<div className="flex items-center gap-2.5 h-11 px-4 rounded-xl border border-input focus-within:border-primary transition-colors">
								<CreditCard size={15} className="text-muted-foreground shrink-0" />
								<input
									type="text"
									inputMode="numeric"
									placeholder="1234 5678 9012 3456"
									value={cardNum}
									onChange={(e) => { setCardNum(formatCardNum(e.target.value)); setError("") }}
									className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none tabular-nums"
								/>
							</div>
						</div>

						{/* Expiry + CVC */}
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1.5">
								<label className="text-[12.5px] font-semibold text-foreground">Expiry</label>
								<input
									type="text"
									inputMode="numeric"
									placeholder="MM/YY"
									value={expiry}
									onChange={(e) => { setExpiry(formatExpiry(e.target.value)); setError("") }}
									className="h-11 px-4 rounded-xl border border-input focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none tabular-nums transition-colors bg-card"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<label className="text-[12.5px] font-semibold text-foreground">CVV</label>
								<input
									type="password"
									inputMode="numeric"
									placeholder="···"
									maxLength={4}
									value={cvc}
									onChange={(e) => { setCvc(e.target.value.replace(/\D/g, "").slice(0, 4)); setError("") }}
									className="h-11 px-4 rounded-xl border border-input focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none tabular-nums transition-colors bg-card"
								/>
							</div>
						</div>

						{error && <p className="text-xs text-destructive">{error}</p>}

						<button
							onClick={handleSave}
							disabled={isPending}
							className="w-full h-11.5 rounded-full bg-primary text-primary-foreground text-[13.5px] font-semibold hover:bg-primary/85 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
						>
							{isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : "Save card"}
						</button>

						<p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
							<ExternalLink size={10} />
							Payments secured by Stripe
						</p>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

// ─── cancel dialog ───────────────────────────────────────────────────────────

function CancelDialog({
	open,
	onClose,
	tierName,
	renewalDate,
	onConfirm,
	isPending,
}: {
	open: boolean
	onClose: () => void
	tierName: string
	renewalDate: string | null
	onConfirm: () => void
	isPending: boolean
}) {
	const [step, setStep] = useState<"reason" | "confirm">("reason")
	const [reason, setReason] = useState("")

	const REASONS = [
		"Too expensive for my needs",
		"I don't use the premium features",
		"Switching to a different service",
		"Having technical difficulties",
		"Just taking a break",
	]

	const handleClose = () => {
		if (isPending) return
		setStep("reason")
		setReason("")
		onClose()
	}

	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					onInteractOutside={(e) => isPending && e.preventDefault()}
					className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-[calc(100%-2rem)] max-w-105 max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
				>
					<div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
						<Dialog.Title className="text-[15px] font-bold text-foreground">
							{step === "reason" ? "Before you go…" : "Confirm cancellation"}
						</Dialog.Title>
						<Dialog.Close asChild>
							<button disabled={isPending} className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors disabled:opacity-40">
								<X size={15} />
							</button>
						</Dialog.Close>
					</div>
					<Dialog.Description className="sr-only">
						Cancel your {tierName} subscription
					</Dialog.Description>

					<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5">
						{step === "reason" ? (
							<>
								<p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
									We&apos;re sorry to see you go. Mind telling us why? Your feedback helps us improve.
								</p>
								<div className="flex flex-col gap-2">
									{REASONS.map((r) => (
										<button
											key={r}
											type="button"
											onClick={() => setReason(r)}
											className={cn(
												"w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-[13px] font-medium transition-colors",
												reason === r
													? "border-primary bg-primary/5 text-primary"
													: "border-border text-foreground hover:border-primary/30 hover:bg-accent/40",
											)}
										>
											<div className={cn(
												"w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
												reason === r ? "border-primary bg-primary" : "border-input",
											)}>
												{reason === r && <Check size={9} className="text-primary-foreground" strokeWidth={3} />}
											</div>
											{r}
										</button>
									))}
								</div>
							</>
						) : (
							<>
								<div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
									<AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
									<div>
										<p className="text-[13px] font-semibold text-foreground">
											Your benefits stay active until {formatRenewalDate(renewalDate)}
										</p>
										<p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
											After that, your account reverts to the Free plan. You won&apos;t be charged again, and you can resubscribe any time.
										</p>
									</div>
								</div>
								<p className="text-[13px] text-muted-foreground leading-relaxed">
									To confirm, you&apos;re cancelling your <span className="font-semibold text-foreground">{tierName}</span> subscription scheduled at the end of the current billing period.
								</p>
							</>
						)}
					</div>

					<div className="shrink-0 px-6 pb-6 pt-3 border-t border-border flex gap-2.5">
						{step === "reason" ? (
							<>
								<Dialog.Close asChild>
									<button className="flex-1 h-11 rounded-full border border-border text-[13.5px] font-semibold text-foreground hover:bg-accent transition-colors">
										Keep plan
									</button>
								</Dialog.Close>
								<button
									onClick={() => setStep("confirm")}
									disabled={!reason}
									className="flex-1 h-11 rounded-full bg-muted text-[13.5px] font-semibold text-muted-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
								>
									Continue
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => setStep("reason")}
									className="flex-1 h-11 rounded-full border border-border text-[13.5px] font-semibold text-foreground hover:bg-accent transition-colors"
								>
									Go back
								</button>
								<button
									onClick={onConfirm}
									disabled={isPending}
									className="flex-1 h-11 rounded-full bg-destructive text-white text-[13.5px] font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
								>
									{isPending ? <><Loader2 size={13} className="animate-spin" /> Cancelling…</> : "Cancel plan"}
								</button>
							</>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

// ─── main panel ───────────────────────────────────────────────────────────────

export function ManageSubscriptionPanel({
	onBack,
	onNavigate,
}: {
	onBack: () => void
	onNavigate?: (id: string) => void
}) {
	const tierId = useSubscriptionStore((s) => s.tierId)
	const period = useSubscriptionStore((s) => s.period)
	const renewalDate = useSubscriptionStore((s) => s.renewalDate)
	const cancelAtPeriodEnd = useSubscriptionStore((s) => s.cancelAtPeriodEnd)
	const paymentMethod = useSubscriptionStore((s) => s.paymentMethod)
	const setPaymentMethod = useSubscriptionStore((s) => s.setPaymentMethod)
	const setCancelAtPeriodEnd = useSubscriptionStore((s) => s.setCancelAtPeriodEnd)

	const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
	const [paymentPending, setPaymentPending] = useState(false)
	const [cancelPending, setCancelPending] = useState(false)
	const [resumePending, setResumePending] = useState(false)

	const isPaidPlan = tierId !== "free"
	const tier = isPaidPlan ? TIERS.find((t) => t.id === tierId)! : null
	const mockInvoices = tier && period ? buildMockInvoices(tier, period) : []

	const handleSavePayment = (brand: string, last4: string) => {
		setPaymentPending(true)
		// TODO: POST /api/users/billing/payment-method
		setTimeout(() => {
			setPaymentMethod({ brand, last4 })
			setPaymentPending(false)
			setPaymentDialogOpen(false)
			toast.success("Payment method updated")
		}, 1000)
	}

	const handleCancel = () => {
		setCancelPending(true)
		// TODO: POST /api/users/billing/cancel
		setTimeout(() => {
			setCancelAtPeriodEnd(true)
			setCancelPending(false)
			setCancelDialogOpen(false)
			toast.success("Subscription scheduled to cancel at period end")
		}, 1000)
	}

	const handleResume = () => {
		setResumePending(true)
		// TODO: POST /api/users/billing/resume
		setTimeout(() => {
			setCancelAtPeriodEnd(false)
			setResumePending(false)
			toast.success("Subscription resumed — you won't be charged until your renewal date")
		}, 1000)
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader
				title="Manage subscription"
				subtitle={isPaidPlan ? `${tier!.name} · billed ${period}` : "Free plan"}
				onBack={onBack}
			/>

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5 space-y-6">

				{/* ── Plan hero ── */}
				<div>
					<SectionLabel>Current plan</SectionLabel>
					{isPaidPlan && tier && period ? (
						<PlanHeroCard
							tier={tier}
							period={period}
							renewalDate={renewalDate}
							cancelAtPeriodEnd={cancelAtPeriodEnd}
							onSwitchTier={() => onNavigate?.("switch-tier")}
						/>
					) : (
						<FreePlanCard onUpgrade={() => onNavigate?.("switch-tier")} />
					)}
				</div>

				{/* ── What's included ── */}
				{isPaidPlan && (
					<div>
						<SectionLabel>What&apos;s included</SectionLabel>
						<ActiveFeatures tierId={tierId} />
					</div>
				)}

				{/* ── Payment method ── */}
				{isPaidPlan && (
					<div>
						<SectionLabel>Payment method</SectionLabel>
						{paymentMethod ? (
							<PaymentMethodCard
								brand={paymentMethod.brand}
								last4={paymentMethod.last4}
								onUpdate={() => setPaymentDialogOpen(true)}
							/>
						) : (
							<NoPaymentMethod onAdd={() => setPaymentDialogOpen(true)} />
						)}
					</div>
				)}

				{/* ── Invoice history ── */}
				{isPaidPlan && mockInvoices.length > 0 && (
					<div>
						<SectionLabel>Billing history</SectionLabel>
						<div className="rounded-xl border border-border overflow-hidden">
							<div className="px-4 divide-y divide-border/50">
								{mockInvoices.map((inv) => (
									<InvoiceRow key={inv.id} invoice={inv} tierName={tier!.name} />
								))}
							</div>
							<div className="px-4 py-3 border-t border-border bg-muted/20">
								<button className="w-full text-[12.5px] font-semibold text-primary hover:opacity-70 transition-opacity text-center">
									View all invoices
								</button>
							</div>
						</div>
					</div>
				)}

				{/* ── Danger zone ── */}
				{isPaidPlan && (
					<div>
						<SectionLabel>Plan actions</SectionLabel>
						<div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
							{cancelAtPeriodEnd ? (
								<button
									onClick={handleResume}
									disabled={resumePending}
									className="w-full flex items-center gap-3 px-4 py-4 hover:bg-accent/50 transition-colors text-left"
								>
									<div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
										{resumePending
											? <Loader2 size={14} className="animate-spin text-green-600" />
											: <RefreshCcw size={14} className="text-green-600" />
										}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-[13px] font-semibold text-green-600 leading-tight">Resume subscription</p>
										<p className="text-[11.5px] text-muted-foreground mt-0.5">
											Reactivate before {formatRenewalDate(renewalDate)} to keep your benefits
										</p>
									</div>
									<ArrowRight size={14} className="text-muted-foreground shrink-0" />
								</button>
							) : (
								<button
									onClick={() => setCancelDialogOpen(true)}
									className="w-full flex items-center gap-3 px-4 py-4 hover:bg-destructive/5 transition-colors text-left"
								>
									<div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
										<X size={14} className="text-destructive" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-[13px] font-semibold text-destructive leading-tight">Cancel subscription</p>
										<p className="text-[11.5px] text-muted-foreground mt-0.5">
											Keep access until {formatRenewalDate(renewalDate)}
										</p>
									</div>
									<ArrowRight size={14} className="text-muted-foreground shrink-0" />
								</button>
							)}
						</div>
					</div>
				)}

				{/* ── Footer note ── */}
				<p className="text-[11.5px] text-muted-foreground leading-relaxed text-center pb-2">
					Questions about billing?{" "}
					<button className="text-primary font-semibold hover:underline">Contact support</button>
				</p>
			</div>

			{/* ── Dialogs ── */}
			<UpdatePaymentDialog
				open={paymentDialogOpen}
				onClose={() => setPaymentDialogOpen(false)}
				onSave={handleSavePayment}
				isPending={paymentPending}
			/>

			{tier && (
				<CancelDialog
					open={cancelDialogOpen}
					onClose={() => setCancelDialogOpen(false)}
					tierName={tier.name}
					renewalDate={renewalDate}
					onConfirm={handleCancel}
					isPending={cancelPending}
				/>
			)}
		</div>
	)
}