"use client"

import { backupApi } from "@/lib/messenger/api"
import { e2eeRuntime, getIdentity, recoverIdentityFromBackup } from "@/lib/messenger/e2ee"
import { useAuthStore } from "@/stores/auth-store"
import type { Pkid } from "@/types/messenger"
import { useState } from "react"

export function MessengerE2eeDebugPanel() {
	const currentAccountId = useAuthStore((s) => (s.user ? (s.user.pkid as Pkid) : null))
	const [pin, setPin] = useState("")
	const [status, setStatus] = useState("development-only")
	const [busy, setBusy] = useState(false)
	const [lastValidBackup, setLastValidBackup] = useState<Awaited<
		ReturnType<typeof backupApi.getKeyBackup>
	> | null>(null)
	if (process.env.NODE_ENV === "production") return null

	const runBackupDiagnostic = async () => {
		const accountId = currentAccountId ?? (useAuthStore.getState().user?.pkid as Pkid | undefined)
		if (!accountId) {
			setStatus("no-authenticated-account")
			return
		}

		setBusy(true)
		setStatus("fetching-backup")
		console.info("[messenger][e2ee-debug] backup lookup start", { accountId })

		try {
			const result = await backupApi.getKeyBackup()
			const logEntry = {
				accountId,
				resultStatus: result.status,
				...(result.status === "valid"
					? {
							formatVersion: 1,
							recoveryMethod: "six_digit_pin",
							encryptionAlgorithm: "nacl_secretbox_xsalsa20poly1305",
							identityPublicKeyLength: result.backup.identityPublicKey.length,
							ciphertextLength: result.backup.ciphertext.length,
							nonceLength: result.backup.nonce.length,
							saltLength: result.backup.kdf.salt.length,
							kdfIterations: result.backup.kdf.iterations,
						}
					: {}),
				...(result.status === "unsupported" || result.status === "malformed"
					? { reason: result.reason }
					: {}),
			}
			console.info("[messenger][e2ee-debug] backup lookup result", logEntry)

			if (result.status === "valid") {
				setLastValidBackup(result)
				setStatus("valid-backup")
			} else {
				setLastValidBackup(null)
				setStatus(result.status)
			}
		} catch (error) {
			const httpStatus =
				typeof error === "object" && error && "response" in error && error.response
					? Number((error as { response?: { status?: number } }).response?.status ?? 0)
					: null
			console.info("[messenger][e2ee-debug] backup lookup failure", {
				accountId,
				httpFailureStatus: httpStatus,
			})
			setLastValidBackup(null)
			setStatus("api-error")
		} finally {
			setBusy(false)
		}
	}

	const runRecovery = async () => {
		const accountId = currentAccountId ?? (useAuthStore.getState().user?.pkid as Pkid | undefined)
		if (!accountId) {
			setStatus("no-authenticated-account")
			return
		}
		if (!lastValidBackup || lastValidBackup.status !== "valid") {
			setStatus("missing-valid-backup")
			return
		}
		if (!/^\d{6}$/.test(pin)) {
			setStatus("pin-required")
			return
		}

		setBusy(true)
		setStatus("recovery-started")
		console.info("[messenger][e2ee-debug] recovery started", { accountId })

		try {
			const recovered = await recoverIdentityFromBackup(accountId, lastValidBackup.backup, pin)
			console.info("[messenger][e2ee-debug] recovery result", {
				accountId,
				recoveryReturned: recovered ? "success" : "null",
				identityExistsAfter: !!recovered,
				activeAccountId: e2eeRuntime.getState()?.accountId ?? accountId,
				publicKeyLength: e2eeRuntime.getState()?.identity?.publicKey.length ?? 0,
			})

			if (!recovered) {
				setStatus("recovery-failed")
				return
			}

			const persisted = await getIdentity(accountId)
			console.info("[messenger][e2ee-debug] persisted identity", {
				found: !!persisted,
				accountId,
				publicKeyLength: persisted?.publicKey.length ?? 0,
			})
			await e2eeRuntime.activate(accountId)
			const reactivated = e2eeRuntime.getState()
			console.info("[messenger][e2ee-debug] runtime reactivation", {
				accountId,
				identityExists: !!reactivated?.identity,
				activeAccountId: reactivated?.accountId ?? accountId,
				publicKeyLength: reactivated?.identity?.publicKey.length ?? 0,
			})
			setStatus("recovery-success")
		} catch {
			console.info("[messenger][e2ee-debug] recovery threw", { accountId })
			setStatus("recovery-failed")
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-border bg-background/95 p-3 shadow-lg backdrop-blur-sm">
			<div className="mb-2 flex items-center justify-between gap-2">
				<span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					E2EE debug
				</span>
				<span className="text-[10px] text-muted-foreground">dev only</span>
			</div>
			<div className="space-y-2">
				<div className="text-xs text-muted-foreground">
					Account PKID: {currentAccountId ?? "n/a"}
				</div>
				<div className="text-xs text-muted-foreground">Status: {status}</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={runBackupDiagnostic}
						disabled={busy}
						className="flex-1 rounded-md border border-border bg-secondary px-2 py-1.5 text-xs font-medium text-secondary-foreground disabled:opacity-50"
					>
						Check backup
					</button>
				</div>
				<div className="flex gap-2">
					<input
						value={pin}
						onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
						inputMode="numeric"
						maxLength={6}
						placeholder="6-digit PIN"
						className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none ring-0"
					/>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={runRecovery}
						disabled={busy || !lastValidBackup || lastValidBackup.status !== "valid"}
						className="flex-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
					>
						Recover identity
					</button>
				</div>
			</div>
		</div>
	)
}
