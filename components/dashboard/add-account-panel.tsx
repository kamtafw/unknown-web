"use client"

import {
	useAddLinkedAccount,
	useConfirmLinkedAccount,
	useLinkedAccounts,
	useRemoveLinkedAccount,
	useSwitchAccount,
} from "@/hooks/use-linked-accounts"
import { authApi } from "@/lib/api"
import { extractFieldErrors, extractMessage } from "@/lib/api-error"
import { otpSchema } from "@/lib/schemas"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { LinkedAccount, OtpDefault } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowLeft, Eye, EyeOff, Loader2, Plus, Unlink } from "lucide-react"
import { Avatar, Form, unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui"
import { FormEvent, useState } from "react"
import { ResendButton } from "../shared/resend-button"

type Step = "list" | "add-login" | "add-otp"

interface PendingLink {
	id: number
	email: string
	otp_default: OtpDefault
}

function getMethodConfig(otpDefault: OtpDefault) {
	switch (otpDefault) {
		case "pin":
			return {
				title: "Enter your PIN",
				description: "Enter the 6-digit security PIN for this account",
				showEmail: false,
				showResend: false,
				type: "pin" as const,
			}
		case "2fa":
			return {
				title: "Authenticator app",
				description: "Enter the 6-digit code from your Google Authenticator app",
				showEmail: false,
				showResend: false,
				type: "2fa" as const,
			}
		default: // "email"
			return {
				title: "Verify your email",
				description: "Enter the 6-digit code sent to",
				showEmail: true,
				showResend: true,
				type: "otp" as const,
			}
	}
}

function getInitials(first: string, last: string) {
	return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
				aria-label="Go back"
			>
				<ArrowLeft size={15} className="text-gray-600" strokeWidth={2.5} />
			</button>
			<h2 className="font-bold text-gray-900 text-[15.5px]">{title}</h2>
		</div>
	)
}

function RemoveDialog({
	open,
	onClose,
	account,
	onConfirm,
	isPending,
}: {
	open: boolean
	onClose: () => void
	account: LinkedAccount | null
	onConfirm: () => void
	isPending: boolean
}) {
	if (!account) return null
	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-[calc(100%-2rem)] max-w-96 bg-white rounded-2xl shadow-2xl px-6 py-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<Dialog.Title className="font-bold text-gray-900 text-[15px] mb-1.5">
						Remove account?
					</Dialog.Title>
					<Dialog.Description className="text-[13px] text-gray-500 leading-relaxed mb-6">
						Remove <span className="font-semibold text-gray-800">@{account.username}</span> from
						your linked accounts. You can add it again later.
					</Dialog.Description>
					<div className="flex gap-2.5">
						<Dialog.Close asChild>
							<button className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
								Cancel
							</button>
						</Dialog.Close>
						<button
							onClick={onConfirm}
							disabled={isPending}
							className="flex-1 h-10 rounded-xl bg-destructive text-white text-[13px] font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
						>
							{isPending && <Loader2 size={12} className="animate-spin" />}
							Remove
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

function AccountsListView({
	onBack,
	onAddAccount,
}: {
	onBack: () => void
	onAddAccount: () => void
}) {
	const user = useAuthStore((s) => s.user)
	const { data, isLoading } = useLinkedAccounts()
	const removeAccount = useRemoveLinkedAccount()
	const switchAccount = useSwitchAccount()

	const accounts = data?.data.accounts ?? []

	const currentAccount =
		accounts.find((a) => a.is_primary) ??
		accounts.find((a) => a.email === user?.email) ??
		accounts.find((a) => a.username === user?.username)

	const [selectedId, setSelectedId] = useState<number | null>(null)
	const [removeTarget, setRemoveTarget] = useState<LinkedAccount | null>(null)

	const activeId = selectedId ?? currentAccount?.id ?? null

	const handleContinue = () => {
		if (!activeId || activeId === currentAccount?.id) {
			onBack()
			return
		}
		switchAccount.mutate(String(activeId))
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Add Account" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				{isLoading ? (
					<div className="flex flex-col gap-1 px-4 pt-4">
						{[0, 1].map((i) => (
							<div key={i} className="flex items-center gap-3 px-2 py-3.5 animate-pulse">
								<div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
								<div className="flex-1 space-y-1.5">
									<div className="h-3 bg-gray-200 rounded-full w-2/5" />
									<div className="h-2.5 bg-gray-200 rounded-full w-1/3" />
								</div>
								<div className="w-5.5 h-5.5 rounded-full bg-gray-200" />
							</div>
						))}
					</div>
				) : (
					<div className="py-2">
						{accounts.map((account) => {
							const isActive = activeId === account.id
							const displayName =
								[account.first_name, account.last_name].filter(Boolean).join(" ") ||
								account.username

							return (
								<div
									key={account.id}
									onClick={() => setSelectedId(account.id)}
									className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left"
								>
									<Avatar.Root className="w-11 h-11 rounded-full overflow-hidden shrink-0">
										<Avatar.Image
											src={account.profile_photo}
											alt={displayName}
											className="w-full h-full object-cover"
										/>
										<Avatar.Fallback className="w-full h-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
											{getInitials(account.first_name, account.last_name)}
										</Avatar.Fallback>
									</Avatar.Root>

									<div className="flex-1 min-w-0">
										<p className="text-[13.5px] font-semibold text-gray-900 truncate leading-tight">
											@{account.username}
										</p>
										<p className="text-xs text-gray-500 truncate mt-0.5">{account.phone_number}</p>
									</div>

									{account.id !== currentAccount?.id && (
										<button
											onClick={(e) => {
												e.stopPropagation()
												setRemoveTarget(account)
											}}
											title="Remove this account"
											className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-destructive transition-colors shrink-0"
										>
											<Unlink size={16} />
										</button>
									)}

									<div
										className={cn(
											"w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
											isActive ? "bg-green-500 border-green-500" : "border-gray-300",
										)}
									>
										{isActive && (
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										)}
									</div>
								</div>
							)
						})}

						{/* Add another account */}
						<button
							onClick={onAddAccount}
							className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left"
						>
							<div className="w-11 h-11 rounded-full border-[1.5px] border-primary flex items-center justify-center shrink-0">
								<Plus size={18} className="text-primary" />
							</div>
							<span className="text-[13.5px] font-semibold text-primary">Add Another account</span>
						</button>
					</div>
				)}
			</div>

			<div className="shrink-0 px-6 py-4 border-t border-gray-50">
				<button
					onClick={handleContinue}
					disabled={switchAccount.isPending}
					className="w-full h-12 rounded-full bg-primary text-white text-[14.5px] font-semibold hover:bg-primary/85 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
				>
					{switchAccount.isPending ? (
						<>
							<Loader2 size={14} className="animate-spin" /> Switching...
						</>
					) : (
						"Continue"
					)}
				</button>
			</div>

			<RemoveDialog
				open={!!removeTarget}
				onClose={() => setRemoveTarget(null)}
				account={removeTarget}
				isPending={removeAccount.isPending}
				onConfirm={() => {
					if (removeTarget) {
						removeAccount.mutate(removeTarget.id, {
							onSuccess: () => setRemoveTarget(null),
						})
					}
				}}
			/>
		</div>
	)
}

function AddLoginStep({
	onBack,
	onSuccess,
}: {
	onBack: () => void
	onSuccess: (linkId: number, email: string, otpDefault: OtpDefault) => void
}) {
	const addLinkedAccount = useAddLinkedAccount()
	const [showPassword, setShowPassword] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const fd = new FormData(e.currentTarget)
		const identifier = (fd.get("identifier") as string).trim()
		const password = fd.get("password") as string

		if (!identifier || !password) return
		setErrors({})

		addLinkedAccount.mutate(
			{ identifier, password },
			{
				onSuccess: (res) => {
					if (!res.success) return
					onSuccess(res.data.id, res.data.user.email, res.data.user.otp_default)
				},
				onError: (err) => {
					const fieldErrs = extractFieldErrors(err)
					if (Object.keys(fieldErrs).length) {
						setErrors(fieldErrs)
					} else {
						toast.error(extractMessage(err, "Failed to add account. Check your credentials."))
					}
				},
			},
		)
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Add Account" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-6">
				<p className="text-[13.5px] text-gray-500 leading-relaxed mb-6">
					Enter credentials for the account you want to add.
				</p>

				<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
					<Form.Field name="identifier" className="flex flex-col gap-1.5">
						<Form.Label className="text-sm font-medium text-gray-800">Email or Phone</Form.Label>
						<div
							className={cn(
								"flex items-center h-12 px-4 rounded-xl border transition-colors",
								errors.identifier
									? "border-destructive"
									: "border-gray-200 focus-within:border-primary",
							)}
						>
							<Form.Control asChild>
								<input
									type="text"
									name="identifier"
									placeholder="Enter email or phone number"
									autoFocus
									autoComplete="username"
									className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
								/>
							</Form.Control>
						</div>
						{errors.identifier && <p className="text-xs text-destructive">{errors.identifier}</p>}
					</Form.Field>

					<Form.Field name="password" className="flex flex-col gap-1.5">
						<Form.Label className="text-sm font-medium text-gray-800">Password</Form.Label>
						<div
							className={cn(
								"flex items-center gap-2.5 h-12 px-4 rounded-xl border transition-colors",
								errors.password
									? "border-destructive"
									: "border-gray-200 focus-within:border-primary",
							)}
						>
							<Form.Control asChild>
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="Enter password"
									autoComplete="current-password"
									className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
								/>
							</Form.Control>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none shrink-0"
							>
								{showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
							</button>
						</div>
						{errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
					</Form.Field>

					{/* otp_token field error (edge case) */}
					{errors.otp_token && <p className="text-xs text-destructive">{errors.otp_token}</p>}

					<Form.Submit asChild>
						<button
							disabled={addLinkedAccount.isPending}
							className="w-full h-12 rounded-full bg-primary text-white text-[14.5px] font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
						>
							{addLinkedAccount.isPending ? (
								<>
									<Loader2 size={14} className="animate-spin" /> Continuing...
								</>
							) : (
								"Continue"
							)}
						</button>
					</Form.Submit>
				</Form.Root>
			</div>
		</div>
	)
}

function AddOtpStep({
	email,
	linkId,
	otpDefault,
	onBack,
	onSuccess,
}: {
	email: string
	linkId: number
	otpDefault: OtpDefault
	onBack: () => void
	onSuccess: () => void
}) {
	const confirmLinkedAccount = useConfirmLinkedAccount()
	const [error, setError] = useState<string | null>(null)
	const [isVerifying, setIsVerifying] = useState(false)

	const method = getMethodConfig(otpDefault)
	const isPending = isVerifying || confirmLinkedAccount.isPending

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = otpSchema.safeParse(raw)
		if (!result.success) return

		setError(null)
		setIsVerifying(true)

		try {
			// verify code with the correct type → get otp_token
			const verifyRes = await authApi.verifyOtp({
				email,
				otp: result.data.otp,
				type: method.type,
				need_tokens: false,
				need_otp_token: true,
			})

			if (!verifyRes.success) {
				setError("Invalid code. Please try again.")
				return
			}

			const otp_token = (verifyRes.data as { otp_token?: string })?.otp_token
			if (!otp_token) {
				setError("Verification failed. Please try again.")
				return
			}

			// confirm the linked account record with the otp_token
			confirmLinkedAccount.mutate(
				{ id: linkId, otp_token },
				{
					onSuccess: () => onSuccess(),
					onError: (err) =>
						setError(extractMessage(err, "Failed to confirm account. Please try again.")),
				},
			)
		} catch (err) {
			setError(extractMessage(err, "Invalid or expired code. Please try again."))
		} finally {
			setIsVerifying(false)
		}
	}

	const handleResend = async () => {
		try {
			await authApi.resendOtp(email)
			toast.success("Code resent to your email")
		} catch {
			toast.error("Couldn't resend code. Try again shortly.")
		}
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title={method.title} onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-6">
				<p className="text-[13.5px] text-gray-500 leading-relaxed mb-1">{method.description}</p>
				{method.showEmail && (
					<p className="text-[13.5px] font-semibold text-gray-900 mb-7 break-all">{email}</p>
				)}
				{!method.showEmail && <div className="mb-7" />}

				<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-5">
					<Form.Field name="otp" className="flex flex-col gap-3">
						<OneTimePasswordField.Root
							name="otp"
							validationType="numeric"
							autoComplete="one-time-code"
							autoFocus
							className="flex gap-2 justify-center"
							aria-label="Verification code"
						>
							{Array.from({ length: 6 }).map((_, i) => (
								<OneTimePasswordField.Input
									key={i}
									className="flex-1 min-w-0 max-w-12 h-12 text-center text-lg font-semibold bg-gray-100 text-gray-900 rounded-xl border-2 border-transparent focus:outline-none focus:border-primary caret-primary transition-colors duration-150"
								/>
							))}
							<OneTimePasswordField.HiddenInput />
						</OneTimePasswordField.Root>

						<Form.Message
							match={(v) => v.length > 0 && v.length < 6}
							className="text-center text-xs text-destructive"
						>
							Enter all 6 digits
						</Form.Message>
					</Form.Field>

					{error && <p className="text-center text-xs text-destructive">{error}</p>}

					<Form.Submit asChild>
						<button
							disabled={isPending}
							className="w-full h-12 rounded-full bg-primary text-white text-[14.5px] font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
						>
							{isPending ? (
								<>
									<Loader2 size={14} className="animate-spin" />{" "}
									{confirmLinkedAccount.isPending ? "Linking..." : "Verifying..."}
								</>
							) : (
								"Verify"
							)}
						</button>
					</Form.Submit>

					{method.showResend && <ResendButton onResend={handleResend} />}
				</Form.Root>
			</div>
		</div>
	)
}

export function AddAccountPanel({ onBack }: { onBack: () => void }) {
	const [step, setStep] = useState<Step>("list")
	const [pendingLink, setPendingLink] = useState<PendingLink | null>(null)

	if (step === "add-login") {
		return (
			<AddLoginStep
				onBack={() => setStep("list")}
				onSuccess={(linkId, email, otpDefault) => {
					setPendingLink({ id: linkId, email, otp_default: otpDefault })
					setStep("add-otp")
				}}
			/>
		)
	}

	if (step === "add-otp" && pendingLink) {
		return (
			<AddOtpStep
				linkId={pendingLink.id}
				email={pendingLink.email}
				otpDefault={pendingLink.otp_default}
				onBack={() => setStep("add-login")}
				onSuccess={() => {
					setPendingLink(null)
					setStep("list")
				}}
			/>
		)
	}

	return <AccountsListView onBack={onBack} onAddAccount={() => setStep("add-login")} />
}
