"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Settings2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import type { PayoutSettings } from "@/types/marketplace"
import { ErrorState, LoadingState, money } from "./shared"
import { walletDate } from "@/lib/marketplace/wallet"

export function PayoutControls({
	verified,
	pending = false,
}: {
	verified: boolean
	pending?: boolean
}) {
	const [settingsOpen, setSettingsOpen] = useState(false)
	const [payoutOpen, setPayoutOpen] = useState(false)
	const [error, setError] = useState("")
	const client = useQueryClient()
	function refreshPayouts() {
		for (const key of [
			"wallet",
			"wallet-transactions",
			"payouts",
			"payout-quote",
		])
			client.invalidateQueries({ queryKey: ["marketplace", key] })
	}
	const recovery = useMutation({
		mutationFn: marketplaceApi.reconcilePayouts,
		onSuccess: (result) => {
			refreshPayouts()
			if (result.pending)
				toast.info(
					"Still awaiting provider confirmation. You can check again shortly.",
				)
			else toast.success("Payout status updated")
		},
		onError: (err) => {
			refreshPayouts()
			toast.error(marketplaceError(err))
		},
	})
	const settings = useQuery({
		queryKey: ["marketplace", "payout-settings"],
		queryFn: marketplaceApi.payoutSettings,
		enabled: settingsOpen,
	})
	const quote = useQuery({
		queryKey: ["marketplace", "payout-quote"],
		queryFn: marketplaceApi.payoutQuote,
		enabled: payoutOpen,
		staleTime: 0,
	})
	const payout = useMutation({
		mutationFn: marketplaceApi.requestPayout,
		onSuccess: () => {
			setPayoutOpen(false)
			toast.success("Withdrawal scheduled for settlement")
			for (const key of [
				"wallet",
				"wallet-transactions",
				"payouts",
				"payout-quote",
			])
				client.invalidateQueries({ queryKey: ["marketplace", key] })
		},
		onError: (err) => {
			setError(marketplaceError(err))
			refreshPayouts()
		},
	})
	return (
		<>
			{pending && (
				<Button
					variant="outline"
					className="rounded-full"
					disabled={recovery.isPending || payout.isPending}
					onClick={() => recovery.mutate()}
				>
					{recovery.isPending && <Loader2 size={15} className="animate-spin" />}
					Check pending payouts
				</Button>
			)}
			<Button
				variant="outline"
				className="rounded-full"
				onClick={() => setSettingsOpen(true)}
			>
				<Settings2 size={15} /> Payout settings
			</Button>
			<Button
				className="rounded-full"
				disabled={!verified}
				onClick={() => {
					setError("")
					setPayoutOpen(true)
				}}
			>
				Request payout
			</Button>
			<Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
				<DialogContent className="max-h-[90dvh] w-[calc(100vw_-_2rem)] max-w-lg overflow-y-auto rounded-2xl p-5 sm:p-7">
					<DialogTitle>Payout settings</DialogTitle>
					<DialogDescription>
						Withdrawals settle monthly on the 25th. Choose your minimum request
						amount.
					</DialogDescription>
					{settings.isPending ? (
						<LoadingState />
					) : settings.isError ? (
						<ErrorState
							error={settings.error}
							retry={() => settings.refetch()}
						/>
					) : (
						<SettingsForm
							settings={settings.data}
							close={() => setSettingsOpen(false)}
						/>
					)}
				</DialogContent>
			</Dialog>
			<Dialog
				open={payoutOpen}
				onOpenChange={(open) => {
					if (!payout.isPending) setPayoutOpen(open)
				}}
			>
				<DialogContent className="max-h-[90dvh] w-[calc(100vw_-_2rem)] max-w-lg overflow-y-auto rounded-2xl p-5 sm:p-7">
					<DialogTitle>Review your payout</DialogTitle>
					<DialogDescription>
						Only earnings from verified deliveries are cashable. Requests before
						the 25th join that month’s settlement; requests on or after the 25th
						join next month’s settlement. Wallet top-ups are excluded.
					</DialogDescription>
					{quote.isPending ? (
						<LoadingState />
					) : quote.isError ? (
						<ErrorState error={quote.error} retry={() => quote.refetch()} />
					) : (
						<>
							<div className="my-4 rounded-xl bg-primary/5 p-5">
								<p className="text-xs text-muted-foreground">Eligible amount</p>
								<p className="mt-2 text-3xl font-semibold">
									{money(quote.data.amount)}
								</p>
								<p className="mt-2 text-xs text-muted-foreground">
									Minimum payout: {money(quote.data.minimum_payout_amount)}
									{quote.data.scheduled_for && (
										<> · Settlement: {walletDate(quote.data.scheduled_for)}</>
									)}
								</p>
							</div>
							{!quote.data.eligible && (
								<p role="status" className="text-sm text-muted-foreground">
									{quote.data.reason}
								</p>
							)}
							{error && (
								<p role="alert" className="text-sm text-destructive">
									{error}
								</p>
							)}
							<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
								<Button
									variant="outline"
									disabled={payout.isPending}
									onClick={() => setPayoutOpen(false)}
								>
									Cancel
								</Button>
								<Button
									disabled={
										!quote.data.eligible || quote.isFetching || payout.isPending
									}
									onClick={() => {
										setError("")
										payout.mutate({
											expected_amount: quote.data.amount,
											expected_settlement_date: quote.data.scheduled_for,
										})
									}}
								>
									{payout.isPending && (
										<Loader2 size={15} className="animate-spin" />
									)}{" "}
									{payout.isPending
										? "Requesting…"
										: `Confirm payout ${money(quote.data.amount)}`}
								</Button>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}

function SettingsForm({
	settings,
	close,
}: {
	settings: PayoutSettings
	close: () => void
}) {
	const [values, setValues] = useState({
		...settings,
		payout_frequency: "monthly" as const,
	})
	const [error, setError] = useState("")
	const client = useQueryClient()
	const save = useMutation({
		mutationFn: marketplaceApi.updatePayoutSettings,
		onSuccess: (updated) => {
			client.setQueryData(["marketplace", "payout-settings"], updated)
			client.invalidateQueries({ queryKey: ["marketplace", "payout-quote"] })
			toast.success("Payout settings saved")
			close()
		},
		onError: (err) => setError(marketplaceError(err)),
	})
	const input =
		"mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus-visible:outline-primary"
	return (
		<form
			className="mt-4 min-w-0 space-y-5"
			onSubmit={(event) => {
				event.preventDefault()
				setError("")
				save.mutate(values)
			}}
		>
			<p className="rounded-xl bg-muted/50 p-4 text-sm">
				Settlement day: <strong>25th of every month</strong> (WAT)
			</p>
			<label className="block text-sm font-medium">
				Minimum payout amount (₦)
				<input
					className={input}
					type="number"
					min="0"
					step="0.01"
					required
					value={values.minimum_payout_amount}
					onChange={(event) =>
						setValues({ ...values, minimum_payout_amount: event.target.value })
					}
				/>
			</label>
			<label className="flex items-center gap-3 text-sm">
				<input
					type="checkbox"
					checked={values.enabled}
					onChange={(event) =>
						setValues({ ...values, enabled: event.target.checked })
					}
					className="size-4 accent-primary"
				/>
				Enable payouts
			</label>
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					disabled={save.isPending}
					onClick={close}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={save.isPending}>
					{save.isPending && <Loader2 size={15} className="animate-spin" />}Save
					payout settings
				</Button>
			</div>
		</form>
	)
}
