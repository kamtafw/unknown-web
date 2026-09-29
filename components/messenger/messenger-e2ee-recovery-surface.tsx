"use client"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { backupApi } from "@/lib/messenger/api"
import { e2eeRuntime, recoverIdentityFromBackup } from "@/lib/messenger/e2ee"
import type { ValidatedBackupV1 } from "@/lib/messenger/e2ee/backup-validation"
import { useAuthStore } from "@/stores/auth-store"
import type { Pkid } from "@/types/messenger"
import { useCallback, useEffect, useRef, useState } from "react"

type RestorePhase =
	| "checking"
	| "pin-entry"
	| "recovering"
	| "wrong-pin"
	| "mobile-enrollment"
	| "unsupported"
	| "unavailable"
	| "retryable"
	| "success"

export function MessengerE2eeRecoverySurface() {
	const accountId = useAuthStore((s) => (s.user ? (s.user.pkid as Pkid) : null))
	const [phase, setPhase] = useState<RestorePhase>("checking")
	const [pin, setPin] = useState("")
	const [backup, setBackup] = useState<ValidatedBackupV1 | null>(null)
	const [open, setOpen] = useState(false)

	const requestIdRef = useRef(0)

	const identityExists = !!e2eeRuntime.getState()?.identity

	const runBackupCheck = useCallback(async () => {
		if (!accountId || identityExists) return

		const requestId = ++requestIdRef.current

		setPhase("checking")
		setPin("")
		setBackup(null)

		try {
			const result = await backupApi.getKeyBackup()

			if (requestId !== requestIdRef.current || !accountId) return
			if (useAuthStore.getState().user?.pkid !== accountId) return

			switch (result.status) {
				case "valid":
					setBackup(result.backup)
					setPhase("pin-entry")
					setOpen(true)
					return

				case "backup-unavailable":
					setPhase("mobile-enrollment")
					setOpen(true)
					return

				case "unsupported":
					setPhase("unsupported")
					setOpen(true)
					return

				case "malformed":
				default:
					setPhase("unavailable")
					setOpen(true)
					return
			}
		} catch {
			if (requestId !== requestIdRef.current || !accountId) return
			if (useAuthStore.getState().user?.pkid !== accountId) return

			setPhase("retryable")
			setOpen(true)
		}
	}, [accountId, identityExists])

	useEffect(() => {
		if (!accountId || identityExists) {
			setOpen(false)
			return
		}

		void runBackupCheck()

		return () => {
			requestIdRef.current += 1
		}
	}, [accountId, identityExists, runBackupCheck])

	const handlePinChange = (value: string) => {
		setPin(value.replace(/\D/g, "").slice(0, 6))

		if (phase === "wrong-pin") {
			setPhase("pin-entry")
		}
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!accountId || !backup || phase === "recovering") return

		const normalizedPin = pin.replace(/\D/g, "").slice(0, 6)

		if (normalizedPin.length !== 6) {
			setPin("")
			setPhase("wrong-pin")
			return
		}

		setPhase("recovering")
		setPin("")

		const recovered = await recoverIdentityFromBackup(accountId, backup, normalizedPin)

		if (useAuthStore.getState().user?.pkid !== accountId) return
		if (e2eeRuntime.getActiveAccountId() !== accountId) return

		if (!recovered) {
			setPhase("wrong-pin")
			return
		}

		setBackup(null)

		await e2eeRuntime.activate(accountId)

		if (e2eeRuntime.getState()?.identity) {
			setPhase("success")
			setOpen(false)
			return
		}

		setPhase("retryable")
	}

	const handleOpenChange = (nextOpen: boolean) => {
		if (phase === "recovering") return

		setOpen(nextOpen)

		if (!nextOpen && phase !== "success") {
			setPin("")
		}
	}

	const handleRetry = () => {
		setOpen(false)

		window.setTimeout(() => {
			void runBackupCheck()
		}, 150)
	}

	if (!accountId || identityExists) {
		return null
	}

	const isPinEntry = phase === "pin-entry" || phase === "wrong-pin" || phase === "recovering"

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="w-[calc(100%-2rem)] max-w-sm gap-0 rounded-2xl p-0 sm:max-w-md"
				onOpenAutoFocus={(event) => {
					if (isPinEntry) {
						event.preventDefault()
					}
				}}
			>
				<div className="p-6">
					<DialogHeader className="space-y-2 text-left">
						<DialogTitle className="text-xl">
							{phase === "pin-entry" || phase === "wrong-pin" || phase === "recovering"
								? "Restore secure messaging"
								: phase === "success"
									? "Secure messaging restored"
									: "Secure messaging"}
						</DialogTitle>

						<DialogDescription className="text-sm leading-6">
							{phase === "pin-entry" || phase === "wrong-pin" || phase === "recovering"
								? "Enter the six-digit recovery PIN from your other device to restore your encrypted messaging identity here."
								: phase === "mobile-enrollment"
									? "There is no messaging backup for this account yet. Create one from the mobile app to use secure messaging on this device."
									: phase === "unsupported"
										? "This backup was created with an older security format. Restore your messaging identity from the original device and create a new backup."
										: phase === "retryable"
											? "We couldn't reach the recovery service right now. Check your connection and try again."
											: "We found a secure messaging backup for this account."}
						</DialogDescription>
					</DialogHeader>

					{isPinEntry && (
						<form id="e2ee-recovery-form" onSubmit={handleSubmit} className="mt-7 space-y-5">
							<div className="flex justify-center">
								<InputOTP
									maxLength={6}
									value={pin}
									onChange={handlePinChange}
									disabled={phase === "recovering"}
									inputMode="numeric"
									autoComplete="one-time-code"
									aria-label="Six-digit recovery PIN"
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
									</InputOTPGroup>

									<InputOTPGroup>
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</div>

							<div className="min-h-5 text-center">
								{phase === "wrong-pin" && (
									<p className="text-sm text-destructive">
										That PIN wasn&apos;t accepted. Check it and try again.
									</p>
								)}

								{phase === "recovering" && (
									<p className="text-sm text-muted-foreground">
										Restoring your secure messaging identity…
									</p>
								)}
							</div>
						</form>
					)}

					{phase === "checking" && (
						<div className="mt-6 flex items-center justify-center py-4">
							<p className="text-sm text-muted-foreground">
								Checking your secure messaging backup…
							</p>
						</div>
					)}

					{phase === "mobile-enrollment" && (
						<div className="mt-6 rounded-xl bg-muted/50 p-4">
							<p className="text-sm leading-6 text-muted-foreground">
								Once a backup is created on mobile, come back here and try again.
							</p>
						</div>
					)}

					{phase === "unsupported" && (
						<div className="mt-6 rounded-xl bg-muted/50 p-4">
							<p className="text-sm leading-6 text-muted-foreground">
								Your existing messages are not affected. This device simply cannot restore that
								backup format.
							</p>
						</div>
					)}

					{(phase === "unavailable" || phase === "retryable") && (
						<div className="mt-6 rounded-xl bg-muted/50 p-4">
							<p className="text-sm leading-6 text-muted-foreground">
								You can continue using Messenger and try the recovery again later.
							</p>
						</div>
					)}
				</div>

				{isPinEntry && (
					<DialogFooter className="border-t border-border bg-muted/20 p-4 sm:flex-row sm:justify-between">
						<button
							type="button"
							onClick={() => handleOpenChange(false)}
							disabled={phase === "recovering"}
							className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
						>
							Not now
						</button>

						<button
							type="submit"
							form="e2ee-recovery-form"
							disabled={phase === "recovering" || pin.length !== 6}
							className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:pointer-events-none disabled:opacity-50"
						>
							{phase === "recovering" ? "Restoring…" : "Restore"}
						</button>
					</DialogFooter>
				)}

				{phase === "mobile-enrollment" && (
					<DialogFooter className="border-t border-border bg-muted/20 p-4 sm:justify-between">
						<button
							type="button"
							onClick={() => handleOpenChange(false)}
							className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							Not now
						</button>

						<button
							type="button"
							onClick={handleRetry}
							className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
						>
							Check again
						</button>
					</DialogFooter>
				)}

				{(phase === "unavailable" || phase === "retryable") && (
					<DialogFooter className="border-t border-border bg-muted/20 p-4 sm:justify-between">
						<button
							type="button"
							onClick={() => handleOpenChange(false)}
							className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							Not now
						</button>

						<button
							type="button"
							onClick={handleRetry}
							className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
						>
							Try again
						</button>
					</DialogFooter>
				)}

				{phase === "unsupported" && (
					<DialogFooter className="border-t border-border bg-muted/20 p-4">
						<button
							type="button"
							onClick={() => handleOpenChange(false)}
							className="w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
						>
							Got it
						</button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	)
}
