"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { backupApi } from "@/lib/messenger/api"
import { e2eeRuntime, recoverIdentityFromBackup } from "@/lib/messenger/e2ee"
import type { ValidatedBackupV1 } from "@/lib/messenger/e2ee/backup-validation"
import { useAuthStore } from "@/stores/auth-store"
import type { Pkid } from "@/types/messenger"
import { unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui"

const PIN_LENGTH = 6

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
	const [isChecking, setIsChecking] = useState(false)
	const [refreshError, setRefreshError] = useState<string | null>(null)

	const requestIdRef = useRef(0)
	const identityExists = !!e2eeRuntime.getState()?.identity

	const runBackupCheck = useCallback(
		async (preserveCurrentStateOnFailure = false) => {
			if (!accountId || identityExists) return

			const requestId = ++requestIdRef.current
			setIsChecking(true)
			setRefreshError(null)

			if (!preserveCurrentStateOnFailure) {
				setPhase("checking")
				setPin("")
				setBackup(null)
				setOpen(true)
			}

			try {
				const result = await backupApi.getKeyBackup()

				if (requestId !== requestIdRef.current || !accountId) return
				if (useAuthStore.getState().user?.pkid !== accountId) return

				switch (result.status) {
					case "valid":
						setBackup(result.backup)
						setPin("")
						setPhase("pin-entry")
						setOpen(true)
						return

					case "backup-unavailable":
						setBackup(null)
						setPin("")
						setPhase("mobile-enrollment")
						setOpen(true)
						return

					case "unsupported":
						setBackup(null)
						setPin("")
						setPhase("unsupported")
						setOpen(true)
						return

					case "api-error":
						if (preserveCurrentStateOnFailure) {
							setRefreshError(
								"We couldn't check for an updated backup. Your current recovery options are unchanged. Try again when the connection is available.",
							)
							setOpen(true)
							return
						}
						setPhase("retryable")
						setOpen(true)
						return

					case "malformed":
					default:
						if (preserveCurrentStateOnFailure) {
							setRefreshError(
								"We couldn't validate the updated backup. Your current recovery options are unchanged.",
							)
							setOpen(true)
							return
						}
						setPhase("unavailable")
						setOpen(true)
						return
				}
			} catch {
				if (requestId !== requestIdRef.current || !accountId) return
				if (useAuthStore.getState().user?.pkid !== accountId) return

				if (preserveCurrentStateOnFailure) {
					setRefreshError(
						"We couldn't check for an updated backup. Your current recovery options are unchanged. Try again when the connection is available.",
					)
					setOpen(true)
					return
				}

				setPhase("retryable")
				setOpen(true)
			} finally {
				if (requestId === requestIdRef.current) setIsChecking(false)
			}
		},
		[accountId, identityExists],
	)

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
		setRefreshError(null)

		if (phase === "wrong-pin") {
			setPhase("pin-entry")
		}
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!accountId || !backup || phase === "recovering" || isChecking) return

		// Read the PIN from the form itself rather than `pin` state: auto-submit can
		// fire before the state update from the final digit has been rendered.
		const submittedPin = new FormData(event.currentTarget).get("pin")
		const normalizedPin = String(submittedPin ?? "")
			.replace(/\D/g, "")
			.slice(0, 6)

		if (!/^[0-9]{6}$/.test(normalizedPin)) {
			setPin("")
			setPhase("wrong-pin")
			return
		}

		setPhase("recovering")
		setPin("")
		setRefreshError(null)

		let recovered: Awaited<ReturnType<typeof recoverIdentityFromBackup>> = null
		try {
			recovered = await recoverIdentityFromBackup(accountId, backup, normalizedPin)
		} catch {
			// Recovery failures are intentionally generic. Never expose key or
			// backup-validation details in the UI or logs.
		}

		if (useAuthStore.getState().user?.pkid !== accountId) return
		if (e2eeRuntime.getActiveAccountId() !== accountId) return

		if (!recovered) {
			setPhase("wrong-pin")
			return
		}

		setBackup(null)

		// recoverIdentityFromBackup installs into the already-active runtime
		// through a generation-guarded operation. Do not start another async
		// activation as logout/account switching may supersede the recovery attempt.
		if (e2eeRuntime.getState()?.accountId === accountId && e2eeRuntime.getState()?.identity) {
			setPhase("success")
			setOpen(false)
			return
		}

		setPhase("retryable")
		setOpen(true)
	}

	const handleOpenChange = (nextOpen: boolean) => {
		if (phase === "recovering") return

		setOpen(nextOpen)

		if (!nextOpen && phase !== "success") {
			setPin("")
		}
	}

	const handleRetry = () => {
		void runBackupCheck(true)
	}

	if (!accountId || identityExists) {
		return null
	}

	const isPinEntry = phase === "pin-entry" || phase === "wrong-pin" || phase === "recovering"

	return (
		<>
			{!open && phase !== "checking" && phase !== "success" && (
				<div
					role="status"
					className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 shadow-lg sm:left-auto sm:max-w-md"
				>
					<p className="text-sm leading-5">
						Secure messaging is unavailable on this device until your identity is restored.
					</p>
					<button
						type="button"
						onClick={() => setOpen(true)}
						className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
					>
						Resume recovery
					</button>
				</div>
			)}

			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent
					className="w-[calc(100%-2rem)] max-w-sm gap-0 rounded-2xl p-0 sm:max-w-md"
					onOpenAutoFocus={(event) => {
						if (isPinEntry) event.preventDefault()
					}}
				>
					<div className="p-6">
						<DialogHeader className="space-y-2 text-left">
							<DialogTitle className="text-xl">
								{isPinEntry
									? "Restore secure messaging"
									: phase === "success"
										? "Secure messaging restored"
										: "Secure messaging"}
							</DialogTitle>

							<DialogDescription className="text-sm leading-6">
								{isPinEntry
									? "Enter the six-digit recovery PIN from your other device to restore your encrypted messaging identity here."
									: phase === "mobile-enrollment"
										? "There is no messaging backup for this account yet. Create one from the mobile app to use secure messaging on this device."
										: phase === "unsupported"
											? "This backup uses a format this browser cannot restore. Update it on your original mobile device, then check for the updated backup here."
											: phase === "retryable"
												? "We couldn't reach the recovery service right now. Check your connection and try again."
												: phase === "unavailable"
													? "We couldn't validate the backup response. No identity was changed. Try checking the backup again."
													: phase === "checking"
														? "Checking your secure messaging backup…"
														: "We found a secure messaging backup for this account."}
							</DialogDescription>
						</DialogHeader>

						{refreshError && (
							<div role="alert" className="mt-5 rounded-xl border border-border bg-muted/50 p-3">
								<p className="text-sm leading-5 text-muted-foreground">{refreshError}</p>
							</div>
						)}

						{isPinEntry && (
							<form id="e2ee-recovery-form" onSubmit={handleSubmit} className="mt-7 space-y-5">
								<OneTimePasswordField.Root
									name="pin"
									validationType="numeric"
									autoComplete="one-time-code"
									autoSubmit
									value={pin}
									onValueChange={handlePinChange}
									disabled={phase === "recovering" || isChecking}
									className="flex w-full justify-center gap-1.5 sm:gap-2"
									aria-label="Six-digit recovery PIN"
								>
									{Array.from({ length: PIN_LENGTH }).map((_, i) => (
										<OneTimePasswordField.Input
											key={i}
											className="
												flex-1 min-w-0 max-w-12
												h-11 sm:h-12
												text-center text-base sm:text-lg font-semibold
												bg-muted text-foreground rounded-xl
												border-2 border-transparent
												focus:outline-none focus:border-primary focus:bg-card focus:ring-1 focus:ring-primary
												caret-primary transition-all duration-150
												disabled:cursor-not-allowed disabled:opacity-50
											"
										/>
									))}
									<OneTimePasswordField.HiddenInput />
								</OneTimePasswordField.Root>

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
									On an original mobile device that still has this account&apos;s matching private
									identity key, open Messenger settings → Encryption key backup and create or update
									the six-digit-PIN backup. Then return here and check again.
								</p>
							</div>
						)}

						{phase === "unsupported" && (
							<div className="mt-6 space-y-3 rounded-xl bg-muted/50 p-4">
								<p className="text-sm font-medium">Update the backup on your original device</p>
								<ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
									<li>
										On the original mobile device that still holds the matching private identity
										key, open Messenger settings → Encryption key backup.
									</li>
									<li>
										Create a new six-digit-PIN backup. The mobile app should replace the old backup
										with the current PBKDF2 format while preserving the same identity key.
									</li>
									<li>Return to this browser and select “Check for updated backup.”</li>
								</ol>
								<p className="text-sm leading-6 text-destructive">
									Do not delete the old backup unless an original device still holds the matching
									private identity key. If no device has that key, the old encrypted messages may
									not be recoverable.
								</p>
							</div>
						)}

						{(phase === "unavailable" || phase === "retryable") && (
							<div className="mt-6 rounded-xl bg-muted/50 p-4">
								<p className="text-sm leading-6 text-muted-foreground">
									No replacement identity was created. You can retry recovery without changing your
									existing account data.
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
								disabled={phase === "recovering" || isChecking || pin.length !== 6}
								className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
							>
								{phase === "recovering" ? "Restoring…" : "Restore"}
							</button>
						</DialogFooter>
					)}

					{(phase === "mobile-enrollment" || phase === "unsupported") && (
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
								disabled={isChecking}
								className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
							>
								{isChecking
									? "Checking…"
									: phase === "unsupported"
										? "Check for updated backup"
										: "Check again"}
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
								onClick={() => void runBackupCheck()}
								disabled={isChecking}
								className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
							>
								{isChecking ? "Checking…" : "Try again"}
							</button>
						</DialogFooter>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}
