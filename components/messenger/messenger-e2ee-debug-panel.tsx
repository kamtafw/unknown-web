"use client"

import { backupApi } from "@/lib/messenger/api"
import { e2eeRuntime, recoverIdentityFromBackup } from "@/lib/messenger/e2ee"
import type { ValidatedBackupV1 } from "@/lib/messenger/e2ee/backup-validation"
import { useAuthStore } from "@/stores/auth-store"
import type { Pkid } from "@/types/messenger"
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"

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
					return
				case "backup-unavailable":
					setPhase("mobile-enrollment")
					return
				case "unsupported":
					setPhase("unsupported")
					return
				case "malformed":
				default:
					setPhase("unavailable")
					return
			}
		} catch {
			if (requestId !== requestIdRef.current || !accountId) return
			if (useAuthStore.getState().user?.pkid !== accountId) return
			setPhase("retryable")
		}
	}, [accountId])

	useEffect(() => {
		if (!accountId || identityExists) return
		void (async () => {
			try {
				await runBackupCheck()
			} catch {
				setPhase("retryable")
			}
		})()
		return () => {
			requestIdRef.current += 1
		}
	}, [accountId, runBackupCheck])

	const onPinInput = (value: string) => {
		setPin(value.replace(/\D/g, "").slice(0, 6))
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!accountId || !backup) return
		const normalizedPin = pin.replace(/\D/g, "").slice(0, 6)
		if (normalizedPin.length !== 6) {
			setPin("")
			setPhase("wrong-pin")
			return
		}

		setPhase("recovering")
		const attemptPin = normalizedPin
		setPin("")

		const recovered = await recoverIdentityFromBackup(accountId, backup, attemptPin)
		if (useAuthStore.getState().user?.pkid !== accountId) return
		if (e2eeRuntime.getActiveAccountId() !== accountId) return
		if (recovered) {
			setBackup(null)
			await e2eeRuntime.activate(accountId)
			if (e2eeRuntime.getState()?.identity) {
				setPhase("success")
				return
			}
			setPhase("retryable")
			return
		}
		setPhase("wrong-pin")
	}

	if (!accountId || identityExists) return null

	return (
		<div className="border-b border-border bg-background/95 px-4 py-3">
			<div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-4 shadow-sm">
				<h2 className="text-lg font-semibold text-foreground">Restore your encryption key</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Your encryption key is not available on this device. Restore it using the six-digit PIN
					from your encryption key backup.
				</p>

				{phase === "checking" && (
					<p className="mt-3 text-sm text-muted-foreground">Checking for a backup…</p>
				)}

				{phase === "mobile-enrollment" && (
					<div className="mt-3 space-y-3">
						<p className="text-sm text-muted-foreground">
							No backup is available for this account yet. Open your mobile app to create or restore
							an encryption key backup before using Messenger on this device.
						</p>
						<button
							type="button"
							onClick={() => void runBackupCheck()}
							className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
						>
							Check again
						</button>
					</div>
				)}

				{phase === "unsupported" && (
					<p className="mt-3 text-sm text-muted-foreground">
						This backup was created with a different device or format. Open the original device,
						then create a fresh backup before continuing.
					</p>
				)}

				{phase === "unavailable" && (
					<div className="mt-3 space-y-3">
						<p className="text-sm text-muted-foreground">
							Your encryption key is not available on this device right now. Try again or use the
							mobile app to create a backup.
						</p>
						<button
							type="button"
							onClick={() => void runBackupCheck()}
							className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
						>
							Check again
						</button>
					</div>
				)}

				{phase === "retryable" && (
					<div className="mt-3 space-y-3">
						<p className="text-sm text-muted-foreground">
							We could not reach the backup service right now. Please try again in a moment.
						</p>
						<button
							type="button"
							onClick={() => void runBackupCheck()}
							className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
						>
							Check again
						</button>
					</div>
				)}

				{(phase === "pin-entry" || phase === "wrong-pin" || phase === "recovering") && (
					<form onSubmit={handleSubmit} className="mt-4 space-y-3">
						<label className="block text-sm font-medium text-foreground" htmlFor="e2ee-pin">
							PIN
						</label>
						<input
							id="e2ee-pin"
							type="password"
							inputMode="numeric"
							autoComplete="one-time-code"
							value={pin}
							onChange={(event) => onPinInput(event.target.value)}
							disabled={phase === "recovering"}
							maxLength={6}
							placeholder="123456"
							className="w-full rounded-md border border-border bg-background px-3 py-2 text-base tracking-[0.35em] text-foreground outline-none focus:border-ring disabled:cursor-not-allowed disabled:opacity-60"
						/>
						{phase === "wrong-pin" && (
							<p className="text-sm text-destructive">
								That PIN was not accepted. Please try again.
							</p>
						)}
						<button
							type="submit"
							disabled={phase === "recovering" || pin.replace(/\D/g, "").length !== 6}
							className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
						>
							{phase === "recovering" ? "Restoring…" : "Restore key"}
						</button>
					</form>
				)}

				{phase === "success" && (
					<p className="mt-3 text-sm text-emerald-600">Your encryption key has been restored.</p>
				)}
			</div>
		</div>
	)
}

export const MessengerE2eeDebugPanel = MessengerE2eeRecoverySurface
