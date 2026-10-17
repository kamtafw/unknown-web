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
			toast.success("Payout initiated successfully")
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
				<DialogContent className="rounded-2xl p-7">
					<DialogTitle>Payout settings</DialogTitle>
					<DialogDescription>
						Choose your payout frequency and minimum amount.
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
				<DialogContent className="rounded-2xl p-7">
					<DialogTitle>Review your payout</DialogTitle>
					<DialogDescription>
						Your eligible earnings will be transferred to your verified payment
						account. Wallet top-ups are excluded.
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
							<div className="mt-5 flex justify-end gap-3">
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
										payout.mutate(quote.data.amount)
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
	const [values, setValues] = useState(settings)
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
			className="mt-4 space-y-5"
			onSubmit={(event) => {
				event.preventDefault()
				setError("")
				save.mutate(values)
			}}
		>
			<label className="block text-sm font-medium">
				Payout frequency
				<select
					aria-label="Payout frequency"
					className={input}
					value={values.payout_frequency}
					onChange={(event) =>
						setValues({
							...values,
							payout_frequency: event.target
								.value as PayoutSettings["payout_frequency"],
						})
					}
				>
					<option value="daily">Daily</option>
					<option value="weekly">Weekly</option>
					<option value="manual">Manual</option>
				</select>
			</label>
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
			<div className="flex justify-end gap-3">
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
