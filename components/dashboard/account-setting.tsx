"use client"

import {
	useChangeOtpDefault,
	useConfirmPassword,
	useGenerateTotp,
	useSetPin,
	useVerifyTotp,
} from "@/hooks/use-2fa"
import { useLogout, useResendOtp, useResetPassword, useVerifyOtp } from "@/hooks/use-auth"
import { useConfirmDeleteAccount, useInitiateDeleteAccount } from "@/hooks/use-delete-account"
import {
	extractFieldErrors,
	extractFirstError,
	extractMessage,
	extractOtpMessage,
} from "@/lib/api-error"
import { createPasswordSchema, otpSchema } from "@/lib/schemas"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { DeleteAccountReason, OtpDefault } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import * as RadioGroup from "@radix-ui/react-radio-group"
import * as Switch from "@radix-ui/react-switch"
import dayjs from "dayjs"
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	Check,
	CheckCircle2,
	Circle,
	Eye,
	EyeOff,
	Loader2,
	Lock,
	Mail,
} from "lucide-react"
import Image from "next/image"
import { Form, unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui"
import { FormEvent, useState } from "react"
import { SuccessDialog } from "../auth/success-dialog"
import type { TwoFAMethod } from "../auth/two-factor-verification"
import { ResendButton } from "../shared/resend-button"
import {
	DeleteAccount,
	GoogleAuthenticator,
	LockShield,
	SimCards,
	TwoFALock,
} from "./account-setting-icons"

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
				aria-label="Go back"
			>
				<ArrowLeft size={15} className="text-gray-600" />
			</button>
			<h2 className="font-bold text-gray-900 text-[15.5px]">{title}</h2>
		</div>
	)
}

function StickyFooter({ children }: { children: React.ReactNode }) {
	return <div className="shrink-0 px-6 py-4 border-t border-gray-50 bg-white">{children}</div>
}

function ActionButton({
	children,
	onClick,
	variant = "primary",
	disabled,
}: {
	children: React.ReactNode
	onClick?: () => void
	variant?: "primary" | "destructive"
	disabled?: boolean
}) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"w-full h-12 rounded-full text-[14px] text-white font-semibold transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
				variant === "destructive"
					? "bg-destructive hover:bg-destructive/90"
					: "bg-primary hover:bg-primary/85",
			)}
		>
			{children}
		</button>
	)
}

function RadioItem({
	value,
	label,
	description,
}: {
	value: string
	label: string
	description?: string
}) {
	return (
		<div
			className={cn(
				"flex gap-4 py-4 border-b border-gray-100 last:border-0",
				description ? "items-start" : "items-center",
			)}
		>
			<RadioGroup.Item
				value={value}
				className="shrink-0 w-5.5 h-5.5 rounded-full border-2 border-gray-300 mt-0.5 focus:outline-none data-[state=checked]:border-primary flex items-center justify-center transition-colors cursor-pointer"
			>
				<RadioGroup.Indicator className="block w-2.75 h-2.75 rounded-full bg-primary" />
			</RadioGroup.Item>
			<div className="flex-1 min-w-0">
				<p className="text-[13.5px] font-medium text-gray-900 leading-snug">{label}</p>
				{description && (
					<p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
				)}
			</div>
		</div>
	)
}

export function SecurityNotificationsPanel({ onBack }: { onBack: () => void }) {
	const [notificationsEnabled, setNotificationsEnabled] = useState(true)

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Security Notifications" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="flex justify-center py-6">
					<LockShield width={70} height={88} />
				</div>

				<div className="px-6">
					<h3 className="text-[15px] font-semibold text-gray-900 mb-3">
						Your chats and calls are private
					</h3>
					<p className="text-[13px] text-gray-500 leading-relaxed mb-4">
						End to end encryption keeps your personal messages and calls between your and the people
						your choose. Not even Appscombo can read or listen to them, this include:
					</p>
					<ul className="space-y-2 mb-4">
						{[
							"Text and voice messages",
							"Audio and voice call",
							"Photos, Video and documents",
							"Location sharing",
							"Status updates",
						].map((item) => (
							<li key={item} className="flex items-center gap-2.5 text-[13px] text-gray-600">
								<span className="text-gray-400 text-base leading-none shrink-0">•</span>
								{item}
							</li>
						))}
					</ul>
					<button className="text-[13px] font-semibold text-primary hover:underline block mb-5">
						Learn More
					</button>

					<hr className="border-gray-100 mb-6" />

					<div className="flex items-start justify-between gap-4 mb-3">
						<h3 className="text-[15px] font-semibold text-gray-900 flex-1 leading-snug">
							Show security notification on this device
						</h3>
						<Switch.Root
							checked={notificationsEnabled}
							onCheckedChange={setNotificationsEnabled}
							className="shrink-0 w-12 h-6 rounded-full bg-gray-200 data-[state=checked]:bg-primary transition-colors focus:outline-none mt-0.5 cursor-pointer"
						>
							<Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-6" />
						</Switch.Root>
					</div>
					<p className="text-[13px] text-gray-500 leading-relaxed mb-3">
						Get notified when your security code changes for a contact&apos;s phone in an end-to-end
						encrypted chat, if you have multiple devices, this settings must be enabled on each
						devices where you want to get notification
					</p>
					<button className="text-[13px] font-semibold text-primary hover:underline block mb-8">
						Learn More
					</button>
				</div>
			</div>
		</div>
	)
}

export function ReportProblemPanel({ onBack }: { onBack: () => void }) {
	const PROBLEMS = [
		"App crashes or freezes frequently",
		"Unable to send or receive messages",
		"Media files not loading or uploading",
		"Notification issues or delays",
	]
	const [selected, setSelected] = useState("")
	const [feedback, setFeedback] = useState("")
	const MAX = 200

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Report A Problem" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="px-6 pt-5 pb-8">
					<h3 className="text-sm font-semibold text-gray-900 mb-3">Please select a problem</h3>

					<RadioGroup.Root value={selected} onValueChange={setSelected} className="flex flex-col">
						{PROBLEMS.map((p) => (
							<RadioItem key={p} value={p} label={p} />
						))}
						<RadioItem value="other" label="Other" />
					</RadioGroup.Root>

					<div className="mt-4">
						<h3 className="text-sm font-semibold text-gray-900 mb-3">
							Your feedback is very much appreciated
						</h3>
						<div className="relative">
							<textarea
								value={feedback}
								onChange={(e) => setFeedback(e.target.value.slice(0, MAX))}
								placeholder="Tell us more about the problem..."
								rows={3}
								className="w-full resize-none rounded-xl border border-primary/60 focus:border-primary px-4 py-3 pb-7 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-primary/20 transition-colors leading-relaxed"
							/>
							<span className="absolute bottom-3 right-3 text-xs text-gray-400 tabular-nums pointer-events-none">
								{feedback.length}/{MAX}
							</span>
						</div>
					</div>

					<div className="mt-6">
						<ActionButton disabled={!selected}>Submit</ActionButton>
					</div>
				</div>
			</div>
		</div>
	)
}

const CODE_LENGTH = 6
const METHOD_LABELS: Record<TwoFAMethod, string> = {
	otp: "OTP",
	pin: "PIN",
	authenticator: "Authenticator App",
}

function otpDefaultToMethod(otpDefault?: OtpDefault): TwoFAMethod {
	if (otpDefault === "2fa") return "authenticator"
	if (otpDefault === "pin") return "pin"
	return "otp"
}

function StepDots({ step }: { step: 1 | 2 }) {
	return (
		<div className="flex items-center justify-center gap-1.5 mt-4">
			{[1, 2].map((s) => (
				<span
					key={s}
					className={cn(
						"w-2 h-2 rounded-full transition-colors",
						step === s ? "bg-primary" : "bg-gray-200",
					)}
				/>
			))}
		</div>
	)
}

function PinOtpField({ autoFocus }: { autoFocus?: boolean }) {
	return (
		<OneTimePasswordField.Root
			name="otp"
			validationType="numeric"
			autoComplete="one-time-code"
			autoFocus={autoFocus}
			className="flex gap-2 sm:gap-2.5 justify-center"
			aria-label="6 digit PIN"
		>
			{Array.from({ length: CODE_LENGTH }).map((_, i) => (
				<OneTimePasswordField.Input
					key={i}
					className="flex-1 min-w-0 max-w-12 h-12 sm:h-13 text-center text-lg font-semibold bg-gray-100 text-gray-900 rounded-xl border-2 border-transparent focus:outline-none focus:border-primary caret-primary transition-colors duration-150"
				/>
			))}
			<OneTimePasswordField.HiddenInput />
		</OneTimePasswordField.Root>
	)
}

function ConfirmMethodDialog({
	open,
	onOpenChange,
	methodLabel,
	onConfirm,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	methodLabel: string
	onConfirm: () => void
}) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="
						fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60
						w-[calc(100%-2rem)] max-w-100
						bg-white rounded-3xl shadow-2xl px-6 py-7
						focus:outline-none
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
					"
				>
					<Dialog.Title className="text-[15px] font-semibold text-gray-900 leading-snug mb-8">
						Confirm you want to use {methodLabel} verification for 2FA
					</Dialog.Title>
					<Dialog.Description className="sr-only">
						Confirm switching your two-step verification method
					</Dialog.Description>

					<div className="flex items-center justify-end gap-6">
						<Dialog.Close asChild>
							<button className="text-sm font-regular text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
								Close
							</button>
						</Dialog.Close>
						<button
							onClick={onConfirm}
							className="text-sm font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer"
						>
							Yes, use {methodLabel}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

function ConfirmPasswordStep({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
	const confirmPassword = useConfirmPassword()
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!password || confirmPassword.isPending) return
		setError(null)

		confirmPassword.mutate(
			{ password },
			{
				onSuccess: () => onSuccess(),
				onError: (err) => setError(extractFirstError(err, "Incorrect password.")),
			},
		)
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Google Authenticator" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 pt-8">
				<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div>
						<h3 className="text-[15px] font-bold text-gray-900 mb-1">Enter your password</h3>
						<p className="text-[13px] text-gray-500 leading-relaxed">
							To get started, first enter your AppsCombo password to confirm it&apos;s really you
						</p>
					</div>

					<div className="flex flex-col gap-2">
						<div
							className={cn(
								"flex items-center gap-2.5 h-12 px-4 rounded-xl border transition-colors",
								error ? "border-destructive" : "border-gray-200 focus-within:border-primary",
							)}
						>
							<Lock size={16} className="text-gray-400 shrink-0" />
							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => {
									setPassword(e.target.value)
									if (error) setError(null)
								}}
								placeholder="Enter password"
								autoFocus
								className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none shrink-0"
							>
								{showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
							</button>
						</div>
						{error && <p className="text-xs text-destructive">{error}</p>}
					</div>

					<Form.Submit asChild>
						<ActionButton disabled={!password.trim() || confirmPassword.isPending}>
							{confirmPassword.isPending ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2 size={14} className="animate-spin" /> Confirming...
								</span>
							) : (
								"Continue"
							)}
						</ActionButton>
					</Form.Submit>
				</Form.Root>
			</div>
		</div>
	)
}

function ShowKeyStep({
	onBack,
	onContinue,
	secret,
	email,
	isLoading,
}: {
	onBack: () => void
	onContinue: () => void
	secret: string | null
	email: string
	isLoading: boolean
}) {
	const [copied, setCopied] = useState(false)

	const handleCopy = () => {
		if (!secret) return
		navigator.clipboard
			.writeText(secret)
			.then(() => {
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			})
			.catch(() => toast.error("Failed to copy. Please copy the key manually."))
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Google Authenticator" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="flex flex-col items-center px-6 pt-8 gap-5">
					<div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
						<GoogleAuthenticator width={80} height={80} />
					</div>

					<div className="text-center">
						<p className="text-[15px] font-bold text-gray-900 mb-1">
							Copy key and add to Google Authenticator
						</p>
						<p className="text-[13px] text-gray-500">(Google Authenticator)</p>
					</div>

					<div className="w-full flex items-center gap-3 px-4 h-12 rounded-xl border border-gray-200 bg-gray-50">
						{isLoading || !secret ? (
							<Loader2 size={14} className="animate-spin text-gray-400 mx-auto" />
						) : (
							<>
								<span className="text-[13px] font-mono text-gray-800 break-all leading-relaxed flex-1">
									{secret}
								</span>
								<button
									type="button"
									onClick={handleCopy}
									className="text-[13px] font-semibold text-primary hover:opacity-70 transition-opacity shrink-0 whitespace-nowrap"
								>
									{copied ? "Copied!" : "Copy Key"}
								</button>
							</>
						)}
					</div>

					{!isLoading && secret && (
						<div className="flex flex-col items-center gap-2 pt-1">
							<p className="text-[12.5px] text-gray-500">Or scan with your camera</p>
							<div className="w-40 h-40 rounded-xl border border-gray-200 bg-white p-2 overflow-hidden">
								<Image
									src={`/api/auth/generate-2fa-qrcode?email=${encodeURIComponent(email)}`}
									alt="Scan to set up Google Authenticator"
									width={150}
									height={150}
									priority
									unoptimized
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			<StickyFooter>
				<ActionButton onClick={onContinue} disabled={isLoading || !secret}>
					Continue
				</ActionButton>
			</StickyFooter>
		</div>
	)
}

function VerifyTotpStep({
	onBack,
	onSuccess,
	isPending,
	error,
}: {
	onBack: () => void
	onSuccess: (code: string) => void
	isPending: boolean
	error: string | null
}) {
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = otpSchema.safeParse(raw)
		if (result.success) onSuccess(result.data.otp)
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Google Authenticator" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 pt-8">
				<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-5">
					<Form.Field name="otp" className="flex flex-col gap-2">
						<PinOtpField autoFocus />

						<Form.Message
							match={(v) => v.length > 0 && v.length < CODE_LENGTH}
							className="text-center text-xs text-destructive"
						>
							Enter all {CODE_LENGTH} digits
						</Form.Message>
					</Form.Field>

					<p className="text-center text-[13px] text-gray-500 leading-relaxed">
						Enter code generated in your google authenticator app
					</p>

					{error && <p className="text-center text-xs text-destructive">{error}</p>}

					<Form.Submit asChild>
						<ActionButton disabled={isPending}>
							{isPending ? (
								<span className="flex items-center justify-center gap-2">
									<Loader2 size={14} className="animate-spin" /> Verifying...
								</span>
							) : (
								"Continue"
							)}
						</ActionButton>
					</Form.Submit>
				</Form.Root>
			</div>
		</div>
	)
}

export function TwoStepVerificationPanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const changeOtpDefault = useChangeOtpDefault()
	const setPin = useSetPin()
	const generateTotp = useGenerateTotp()
	const verifyTotp = useVerifyTotp()

	const [currentMethod] = useState<TwoFAMethod>(() => otpDefaultToMethod(user?.otp_default))
	const [method, setMethod] = useState<TwoFAMethod>(currentMethod)
	const [step, setStep] = useState<
		"select" | "create-pin" | "confirm-pin" | "confirm-password" | "show-key" | "verify-totp"
	>("select")
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [successOpen, setSuccessOpen] = useState(false)

	const [pin1, setPin1] = useState("")
	const [pinError, setPinError] = useState<string | null>(null)

	const [totpSecret, setTotpSecret] = useState<string | null>(null)
	const [totpError, setTotpError] = useState<string | null>(null)

	const isDirty = method !== currentMethod
	const methodLabel = METHOD_LABELS[method]

	const options: { value: TwoFAMethod; label: string; description: string }[] = [
		{
			value: "otp",
			label: "Use OTP verification",
			description: "You will receive OTP every time in your registered email when you try to login",
		},
		{
			value: "pin",
			label: "Create 6 digit Pin",
			description: "You will create a 6 digit pin and use it when you try to login",
		},
		{
			value: "authenticator",
			label: "Google authenticator",
			description: "Make sure to have a google authenticator installed",
		},
	]

	const handleBack = () => {
		if (step === "confirm-pin") {
			setPinError(null)
			setStep("create-pin")
		} else if (step === "create-pin") {
			setPin1("")
			setStep("select")
		} else if (step === "verify-totp") {
			setTotpError(null)
			setStep("show-key")
		} else if (step === "show-key") {
			setTotpSecret(null)
			setStep("confirm-password")
		} else if (step === "confirm-password") {
			// setPassword("")
			// setPasswordError(null)
			setStep("select")
		} else {
			onBack()
		}
	}

	const handleConfirmMethod = () => {
		setConfirmOpen(false)
		if (method === "pin") {
			setStep("create-pin")
		} else if (method === "authenticator") {
			setStep("confirm-password")
		} else {
			toast.info(`Switching to ${methodLabel} is coming soon`)
		}
	}

	const handleCreatePinSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = otpSchema.safeParse(raw)
		if (!result.success) return

		setPin1(result.data.otp)
		setStep("confirm-pin")
	}

	const handleConfirmPinSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = otpSchema.safeParse(raw)
		if (!result.success) return

		if (result.data.otp !== pin1) {
			setPinError("PINs do not match. Please try again.")
			return
		}

		setPin.mutate(pin1, {
			onSuccess: (res) => {
				if (res.success) onBack()
			},
		})
	}

	const handlePasswordConfirmed = () => {
		setStep("show-key")

		if (user?.email) {
			generateTotp.mutate(
				{ email: user.email },
				{
					onSuccess: (res) => {
						if (res.success) setTotpSecret(res.data.secret)
					},
				},
			)
		}
	}

	const handleTotpVerified = (code: string) => {
		if (!user?.email) return
		setTotpError(null)

		verifyTotp.mutate(
			{ email: user.email, otp: code },
			{
				onSuccess: (res) => {
					if (!res.success) return
					changeOtpDefault.mutate({ otp_default: "2fa" })
					setSuccessOpen(true)
				},
				onError: (err) => setTotpError(extractFirstError(err, "Invalid code. Please try again.")),
			},
		)
	}

	if (step === "confirm-password") {
		return <ConfirmPasswordStep onBack={handleBack} onSuccess={handlePasswordConfirmed} />
	}

	if (step === "show-key") {
		return (
			<ShowKeyStep
				onBack={handleBack}
				onContinue={() => setStep("verify-totp")}
				secret={totpSecret}
				email={user?.email ?? ""}
				isLoading={generateTotp.isPending}
			/>
		)
	}

	if (step === "verify-totp") {
		return (
			<>
				<VerifyTotpStep
					onBack={handleBack}
					isPending={verifyTotp.isPending}
					error={totpError}
					onSuccess={(code) => handleTotpVerified(code)}
				/>

				<SuccessDialog
					open={successOpen}
					onOpenChange={setSuccessOpen}
					title="Two-step verification enabled"
					description="Google Authenticator has been linked to your account."
					actionLabel="Done"
					onAction={() => {
						setSuccessOpen(false)
						onBack()
					}}
				/>
			</>
		)
	}

	if (step === "create-pin" || step === "confirm-pin") {
		const isConfirm = step === "confirm-pin"

		return (
			<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
				<PanelHeader title="Two step verification" onBack={handleBack} />

				<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 pt-8">
					<Form.Root
						key={step}
						onSubmit={isConfirm ? handleConfirmPinSubmit : handleCreatePinSubmit}
						className="flex flex-col gap-5"
					>
						<h3 className="text-center text-[15px] font-semibold text-gray-900 mb-1">
							{isConfirm ? "Confirm your PIN" : "Create a 6 digit PIN that you can remember"}
						</h3>

						<Form.Field name="otp" className="flex flex-col gap-2">
							<PinOtpField autoFocus />

							<Form.Message
								match={(v) => v.length > 0 && v.length < CODE_LENGTH}
								className="text-center text-xs text-destructive"
							>
								Enter all {CODE_LENGTH} digits
							</Form.Message>
						</Form.Field>

						<StepDots step={isConfirm ? 2 : 1} />

						{pinError && <p className="text-center text-xs text-destructive">{pinError}</p>}

						<Form.Submit asChild>
							<ActionButton disabled={isConfirm && setPin.isPending}>
								{isConfirm ? (setPin.isPending ? "Saving..." : "Create PIN") : "Next"}
							</ActionButton>
						</Form.Submit>
					</Form.Root>
				</div>
			</div>
		)
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Two step verification" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="flex justify-center py-8">
					<TwoFALock width={80} height={78} />
				</div>

				<div className="px-6">
					<p className="text-[13.5px] text-gray-500 leading-relaxed mb-2">
						For extra security, turn on two-step verification, which will require a PIN when
						registering your phone number with Appscombo again.
					</p>
					<button className="text-[13.5px] font-semibold text-primary hover:underline block mb-1">
						Learn More
					</button>

					<hr className="border-gray-100 my-5" />

					<RadioGroup.Root
						value={method}
						onValueChange={(v) => setMethod(v as TwoFAMethod)}
						className="flex flex-col"
					>
						{options.map((o) => (
							<RadioItem key={o.value} {...o} />
						))}
					</RadioGroup.Root>
				</div>
			</div>

			<StickyFooter>
				<ActionButton onClick={() => setConfirmOpen(true)} disabled={!isDirty}>
					Next
				</ActionButton>
			</StickyFooter>

			<ConfirmMethodDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				methodLabel={methodLabel}
				onConfirm={handleConfirmMethod}
			/>
		</div>
	)
}

export function ChangePhonePanel({ onBack }: { onBack: () => void }) {
	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Change phone number" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="flex justify-center py-8">
					<SimCards />
				</div>

				<div className="px-6 pt-2">
					<h3 className="text-[15.5px] font-semibold text-gray-900 mb-3 leading-snug">
						Changing your phone number will migrate your account info, groups and settings.
					</h3>
					<p className="text-[13px] text-gray-500 leading-relaxed mb-2.5">
						Before proceeding, please confirm that you are able to receive SMS or calls at your new
						number.
					</p>
					<p className="text-[13px] text-gray-500 leading-relaxed">
						If you have both a new phone and a new number, first change your new number on your old
						phone.
					</p>
				</div>
			</div>

			<StickyFooter>
				<ActionButton>Continue</ActionButton>
			</StickyFooter>
		</div>
	)
}

type DeleteStep = "credentials" | "confirm" | "done"

const DELETION_REASONS: {
	value: DeleteAccountReason
	label: string
	description: string
	emoji: string
}[] = [
	{
		value: "privacy",
		label: "Privacy & data concerns",
		description: "Worried about how my data is used",
		emoji: "🔒",
	},
	{
		value: "not_useful",
		label: "Not useful to me",
		description: "The platform no longer meets my needs",
		emoji: "💭",
	},
	{
		value: "technical",
		label: "Technical issues",
		description: "Experiencing bugs or performance issues",
		emoji: "🔧",
	},
	{
		value: "other",
		label: "Other reasons",
		description: "Something not listed above",
		emoji: "✨",
	},
]

const DELETION_CONSEQUENCES = [
	"Your profile, posts, and media will be permanently deleted",
	"All followers and following relationships will be removed",
	"Messages, bookmarks, and history will be erased",
	"Any channels you created will be deleted",
]

export function DeleteAccountPanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const initiateDelete = useInitiateDeleteAccount()
	const confirmDelete = useConfirmDeleteAccount()
	const logout = useLogout()

	const [step, setStep] = useState<DeleteStep>("credentials")

	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [credentialsError, setCredentialsError] = useState("")

	const [otpToken, setOtpToken] = useState("")
	const [reason, setReason] = useState<DeleteAccountReason | "">("")
	const [feedback, setFeedback] = useState("")
	const [confirmErrors, setConfirmErrors] = useState<Record<string, string>>({})

	const [deletionDate, setDeletionDate] = useState<string | null>(null)

	const email = user?.email ?? ""
	const MAX_FEEDBACK = 300

	const handleCredentials = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setCredentialsError("")

		initiateDelete.mutate(
			{ email, password },
			{
				onSuccess: (res) => {
					if (!res.success) return
					setOtpToken(res.data.otp_token)
					setStep("confirm")
				},
				onError: (error) => {
					const fieldErrors = extractFieldErrors(error)
					setCredentialsError(
						fieldErrors.email ??
							fieldErrors.password ??
							extractMessage(error, "Invalid credentials."),
					)
				},
			},
		)
	}

	const handleConfirm = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const newErrors: Record<string, string> = {}
		if (!reason) newErrors.reason = "Please select a reason to continue."

		if (Object.keys(newErrors).length) {
			setConfirmErrors(newErrors)
			return
		}

		setConfirmErrors({})

		// otp_token is the server-generated token from step 1: "confirm credentials" and
		// NOT the user-entered 6-digit code
		confirmDelete.mutate(
			{
				otp_token: otpToken,
				reason: reason as DeleteAccountReason,
				feedback: feedback.trim() || undefined,
			},
			{
				onSuccess: (res) => {
					if (!res.success) return
					setDeletionDate(res.data.request.deletion_due_date)
					setStep("done")
				},
				onError: (err) => {
					const fieldErrs = extractFieldErrors(err)
					setConfirmErrors(
						Object.keys(fieldErrs).length
							? fieldErrs
							: { _: extractMessage(err, "Verification failed. Please try again.") },
					)
				},
			},
		)
	}

	if (step === "done") {
		const formatted = deletionDate ? dayjs(deletionDate).format("MMMM D, YYYY") : "within 7 days"

		return (
			<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
				<div className="flex items-center px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
					<h2 className="font-bold text-gray-900 text-[15.5px]">Deletion scheduled</h2>
				</div>

				<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col items-center justify-center px-6 py-10 text-center gap-5">
					<div className="relative">
						<div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
							<Calendar size={24} className="text-amber-500" />
						</div>
						<div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
							<span className="text-white text-[10px] font-bold">!</span>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="text-[15.5px] font-bold text-gray-900 leading-tight">
							Your account is scheduled for deletion
						</h3>
						<p className="text-[13px] text-gray-500 leading-relaxed">
							All your data will be permanently deleted on{" "}
							<span className="font-semibold text-gray-800">{formatted}</span>.
						</p>
					</div>

					<div className="w-full p-4 bg-amber-50 border border-amber-100 rounded-xl text-left">
						<p className="text-[12.5px] text-amber-700 leading-relaxed">
							<span className="font-semibold">Changed your mind?</span> Sign back in before{" "}
							<span className="font-semibold">{formatted}</span> to cancel the deletion. After that
							date, recovery will not be possible.
						</p>
					</div>
				</div>

				<StickyFooter>
					<ActionButton
						variant="destructive"
						onClick={() => logout.mutate()}
						disabled={logout.isPending}
					>
						{logout.isPending ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 size={14} className="animate-spin" /> Logging out…
							</span>
						) : (
							"Log me out now"
						)}
					</ActionButton>
				</StickyFooter>
			</div>
		)
	}

	if (step === "confirm") {
		return (
			<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
				<PanelHeader title="Delete account" onBack={() => setStep("credentials")} />

				<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
					<Form.Root onSubmit={handleConfirm} className="flex flex-col">
						<div className="px-6 pt-5 pb-4">
							<h3 className="text-[14px] font-bold text-gray-900 mb-0.5">Why are you leaving?</h3>
							<p className="text-[12.5px] text-gray-500 mb-4">
								Your feedback helps us improve AppsCombo.
							</p>

							<RadioGroup.Root className="flex flex-col gap-2">
								{DELETION_REASONS.map((r) => {
									const isSelected = reason === r.value
									return (
										<button
											type="button"
											key={r.value}
											onClick={() => {
												setReason(r.value)
												setConfirmErrors((p) => ({ ...p, reason: "" }))
											}}
											className="flex items-center gap-4 py-4 transition-all cursor-pointer text-left w-full focus:outline-none border-b border-gray-100 last:border-0"
										>
											<RadioGroup.Item
												value={r.value}
												className={cn(
													"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
													isSelected ? "border-destructive bg-destructive" : "border-gray-300",
												)}
											>
												<RadioGroup.Indicator className="block w-2 h-2 rounded-full bg-white" />
											</RadioGroup.Item>
											<div className="flex-1 min-w-0">
												<p
													className={cn(
														"text-[13px] font-semibold leading-tight",
														isSelected ? "text-destructive" : "text-gray-900",
													)}
												>
													{r.label}
												</p>
												<p className="text-[11.5px] text-gray-400 mt-0.5 leading-snug">
													{r.description}
												</p>
											</div>
										</button>
									)
								})}
							</RadioGroup.Root>

							{confirmErrors.reason && (
								<p className="text-xs text-destructive mt-2">{confirmErrors.reason}</p>
							)}
						</div>

						{reason && (
							<div className="px-6 pb-4">
								<div className="relative rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
									<textarea
										value={feedback}
										onChange={(e) => setFeedback(e.target.value.slice(0, MAX_FEEDBACK))}
										placeholder="Anything else you'd like to share? (optional)"
										rows={3}
										className="w-full px-4 pt-3.5 pb-7 text-sm text-gray-900 bg-transparent resize-none outline-none leading-relaxed placeholder:text-gray-400"
									/>
									<span className="absolute bottom-2.5 right-3.5 text-xs text-gray-300 tabular-nums pointer-events-none">
										{feedback.length}/{MAX_FEEDBACK}
									</span>
								</div>
							</div>
						)}

						<div className="px-6 pb-8">
							<Form.Submit asChild>
								<ActionButton variant="destructive" disabled={!reason || confirmDelete.isPending}>
									{confirmDelete.isPending ? (
										<span className="flex items-center justify-center gap-2">
											<Loader2 size={14} className="animate-spin" /> Deleting account…
										</span>
									) : (
										"Delete My Account"
									)}
								</ActionButton>
							</Form.Submit>
						</div>
					</Form.Root>
				</div>
			</div>
		)
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Delete account" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="flex justify-center py-6">
					<DeleteAccount width={80} height={80} />
				</div>

				<div className="mx-6 mb-5 p-4 bg-red-50 border border-red-100 rounded-xl">
					<p className="text-[12.5px] font-semibold text-destructive mb-2.5 flex items-center gap-1.5">
						<AlertCircle size={13} strokeWidth={2.5} />
						This action is permanent and cannot be undone
					</p>
					<ul className="space-y-1.5">
						{DELETION_CONSEQUENCES.map((c) => (
							<li
								key={c}
								className="flex items-start gap-2 text-xs text-red-600/80 leading-relaxed"
							>
								<span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0 block" />
								{c}
							</li>
						))}
					</ul>
				</div>

				<div className="px-6 pb-8">
					<Form.Root onSubmit={handleCredentials} className="flex flex-col gap-4">
						{/* email — read-only, shows user is deleting the right account */}
						<div className="flex flex-col gap-1.5">
							<p className="text-sm font-semibold text-gray-900">Email address</p>
							<div className="flex items-center gap-2.5 h-12 px-4 rounded-xl border border-gray-100 bg-gray-50">
								<Mail size={15} className="text-gray-400 shrink-0" />
								<span className="flex-1 text-sm text-gray-400 truncate">{email}</span>
								<Lock size={12} className="text-gray-300 shrink-0" />
							</div>
						</div>

						{/* password */}
						<div className="flex flex-col gap-1.5">
							<p className="text-sm font-semibold text-gray-900">Password</p>
							<div
								className={cn(
									"flex items-center gap-2.5 h-12 px-4 rounded-xl border transition-colors",
									credentialsError
										? "border-destructive"
										: "border-gray-200 focus-within:border-primary",
								)}
							>
								<Lock size={15} className="text-gray-400 shrink-0" />
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => {
										setPassword(e.target.value)
										if (credentialsError) setCredentialsError("")
									}}
									placeholder="Enter your password"
									autoFocus
									autoComplete="current-password"
									className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none shrink-0"
								>
									{showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
								</button>
							</div>
							{credentialsError && <p className="text-xs text-destructive">{credentialsError}</p>}
						</div>

						<Form.Submit asChild>
							<ActionButton
								variant="destructive"
								disabled={!password.trim() || initiateDelete.isPending}
							>
								{initiateDelete.isPending ? (
									<span className="flex items-center justify-center gap-2">
										<Loader2 size={14} className="animate-spin" /> Verifying…
									</span>
								) : (
									"Continue"
								)}
							</ActionButton>
						</Form.Submit>
					</Form.Root>
				</div>
			</div>
		</div>
	)
}

const PW_RULES = [
	{ label: "8–12 characters", test: (v: string) => v.length >= 8 && v.length <= 12 },
	{ label: "Special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
	{ label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
	{ label: "Number", test: (v: string) => /\d/.test(v) },
]

function maskEmail(email: string): string {
	const [local, domain] = email.split("@")
	if (!local || !domain) return email
	return `${local[0]}${"*".repeat(Math.min(local.length - 1, 4))}@${domain}`
}

type ChangePwStep = "confirm" | "otp" | "new-password"

const STEP_ORDER: ChangePwStep[] = ["confirm", "otp", "new-password"]

function ChangePasswordStepBar({ step }: { step: ChangePwStep }) {
	const current = STEP_ORDER.indexOf(step) + 1

	return (
		<div className="flex items-center justify-center gap-2 py-4">
			{STEP_ORDER.map((s, i) => {
				const n = i + 1
				const done = n < current
				const active = n === current

				return (
					<div key={s} className="flex items-center gap-2">
						<div
							className={cn(
								"w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300",
								done
									? "bg-primary text-white"
									: active
										? "bg-primary text-white ring-[3px] ring-primary/20"
										: "bg-gray-100 text-gray-400",
							)}
						>
							{done ? <Check size={13} strokeWidth={3} /> : n}
						</div>
						{i < STEP_ORDER.length - 1 && (
							<div
								className={cn(
									"w-10 h-0.5 rounded-full transition-all duration-500",
									done ? "bg-primary" : "bg-gray-100",
								)}
							/>
						)}
					</div>
				)
			})}
		</div>
	)
}

export function ChangePasswordPanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const confirmPassword = useConfirmPassword()
	const verifyOtp = useVerifyOtp("change")
	const resetPassword = useResetPassword()
	const resendOtp = useResendOtp()

	const [email] = useState(() => user?.email ?? "")

	const [step, setStep] = useState<ChangePwStep>("confirm")

	const [currentPassword, setCurrentPassword] = useState("")
	const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null)
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [newPassword, setNewPassword] = useState("")
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [newPasswordError, setNewPasswordError] = useState<string | null>(null)
	const [otpError, setOtpError] = useState<string | null>(null)
	const [successOpen, setSuccessOpen] = useState(false)

	if (!email) return null

	const handleConfirmPasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!currentPassword || confirmPassword.isPending) return
		setCurrentPasswordError(null)

		confirmPassword.mutate(
			{ password: currentPassword },
			{
				onSuccess: () => {
					resendOtp.mutate(email)
					setStep("otp")
				},
				onError: (err) => setCurrentPasswordError(extractFirstError(err, "Incorrect password.")),
			},
		)
	}

	const handleVerifyOtpSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = otpSchema.safeParse(raw)
		if (result.success) {
			verifyOtp.mutate(
				{
					email: email,
					otp: result.data.otp,
					need_tokens: false,
					need_otp_token: true,
				},
				{
					onSuccess: () => setStep("new-password"),
					onError: (err) => setOtpError(extractOtpMessage(err)),
				},
			)
		}
	}

	const handleNewPasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = createPasswordSchema.safeParse(raw)

		if (result.data?.password !== result.data?.confirm) {
			setNewPasswordError("Passwords do not match.")
			return
		}

		if (result.success) {
			resetPassword.mutate(
				{ new_password: result.data.password, confirm_password: result.data.confirm },
				{
					onSuccess: (res) => {
						if (res?.success) setSuccessOpen(true)
					},
				},
			)
		}
	}

	const handleBack = () => {
		if (step === "otp") {
			setOtpError(null)
			setStep("confirm")
		} else if (step === "new-password") {
			setNewPasswordError(null)
			setStep("otp")
		} else {
			onBack()
		}
	}

	const allRulesPass = PW_RULES.every((r) => r.test(newPassword))

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Change Password" onBack={handleBack} />
			<ChangePasswordStepBar step={step} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				{/* step 1: confirm current password */}
				{step === "confirm" && (
					<div className="px-6 pt-2 pb-8 flex flex-col gap-5">
						<div className="flex flex-col items-center gap-3 py-4">
							<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
								<Lock size={28} className="text-primary" strokeWidth={1.75} />
							</div>
							<div className="text-center">
								<p className="font-semibold text-gray-900">Verify it&apos;s you</p>
								<p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
									Enter your current password to continue
								</p>
							</div>
						</div>

						<Form.Root onSubmit={handleConfirmPasswordSubmit} className="flex flex-col gap-4">
							<Form.Field name="password" className="flex flex-col gap-1.5">
								<Form.Label className="text-sm font-medium text-gray-800">
									Current Password
								</Form.Label>
								<div
									className={cn(
										"flex items-center gap-2.5 h-12 px-4 rounded-xl border transition-colors",
										currentPasswordError
											? "border-destructive"
											: "border-gray-200 focus-within:border-primary",
									)}
								>
									<Lock size={16} className="text-gray-400 shrink-0" />
									<Form.Control asChild>
										<input
											type={showCurrentPassword ? "text" : "password"}
											value={currentPassword}
											onChange={(e) => {
												setCurrentPassword(e.target.value)
												if (currentPasswordError) setCurrentPasswordError(null)
											}}
											placeholder="Enter current password"
											autoFocus
											autoComplete="current-password"
											className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
										/>
									</Form.Control>
									<button
										type="button"
										onClick={() => setShowCurrentPassword((v) => !v)}
										className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none shrink-0"
									>
										{showCurrentPassword ? <Eye size={15} /> : <EyeOff size={15} />}
									</button>
								</div>
								{currentPasswordError && (
									<p className="text-xs text-destructive">{currentPasswordError}</p>
								)}
							</Form.Field>

							<Form.Submit asChild>
								<ActionButton disabled={!currentPassword.trim() || confirmPassword.isPending}>
									{confirmPassword.isPending ? (
										<span className="flex items-center justify-center gap-2">
											<Loader2 size={14} className="animate-spin" /> Verifying...
										</span>
									) : (
										"Continue"
									)}
								</ActionButton>
							</Form.Submit>
						</Form.Root>
					</div>
				)}

				{/* step 2: OTP verification */}
				{step === "otp" && (
					<div className="px-6 pt-2 pb-8 flex flex-col gap-5">
						<div className="flex flex-col items-center gap-3 py-4">
							<div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
								<Mail size={28} className="text-amber-500" strokeWidth={1.75} />
							</div>
							<div className="text-center">
								<p className="font-semibold text-gray-900">Check your email</p>
								<p className="text-[13px] text-gray-500 mt-0.5">We sent a 6-digit code to</p>
								<p className="text-[13px] font-semibold text-gray-800 mt-0.5">
									{user?.email ? maskEmail(user.email) : "your email"}
								</p>
							</div>
						</div>

						<Form.Root onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-5">
							<Form.Field name="otp" className="flex flex-col gap-3">
								<OneTimePasswordField.Root
									name="otp"
									validationType="numeric"
									autoComplete="one-time-code"
									autoFocus
									className="flex gap-1.5 justify-center"
									aria-label="Verification code"
								>
									{Array.from({ length: 6 }).map((_, i) => (
										<OneTimePasswordField.Input
											key={i}
											className="
											flex-1 min-w-0
											max-w-11 h-12
											text-center text-lg font-semibold
											bg-gray-200 text-gray-900 rounded-xl
											border-2 border-transparent
											focus:outline-none focus:border-primary
											caret-primary transition-colors"
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

							{otpError && <p className="text-center text-xs text-destructive">{otpError}</p>}

							<Form.Submit asChild>
								<ActionButton disabled={verifyOtp.isPending}>
									{verifyOtp.isPending ? (
										<span className="flex items-center justify-center gap-2">
											<Loader2 size={14} className="animate-spin" /> Verifying...
										</span>
									) : (
										"Continue"
									)}
								</ActionButton>
							</Form.Submit>

							<ResendButton onResend={() => resendOtp.mutate(email)} />
						</Form.Root>
					</div>
				)}

				{/* step 3: new password */}
				{step === "new-password" && (
					<div className="px-6 pt-2 pb-8 flex flex-col gap-5">
						<div className="py-2">
							<p className="font-semibold text-gray-900">Create new password</p>
							<p className="text-[13px] text-gray-500 mt-0.5">
								Make it strong and different from your previous one
							</p>
						</div>

						<Form.Root onSubmit={handleNewPasswordSubmit} className="flex flex-col gap-4">
							<Form.Field name="password" className="flex flex-col gap-2">
								<Form.Label className="text-sm font-medium text-gray-800">New Password</Form.Label>
								<div className="flex items-center gap-2.5 h-12 px-4 rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
									<Lock size={15} className="text-gray-400 shrink-0" />
									<Form.Control asChild>
										<input
											type={showNewPassword ? "text" : "password"}
											name="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											placeholder="Enter new password"
											autoFocus
											autoComplete="new-password"
											className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
										/>
									</Form.Control>
									<button
										type="button"
										onClick={() => setShowNewPassword((v) => !v)}
										className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none shrink-0"
									>
										{showNewPassword ? <Eye size={15} /> : <EyeOff size={15} />}
									</button>
								</div>

								{newPassword.length > 0 && (
									<div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1 pl-0.5">
										{PW_RULES.map(({ label, test }) => {
											const passes = test(newPassword)
											return (
												<div key={label} className="flex items-center gap-1.5">
													{passes ? (
														<CheckCircle2
															size={13}
															className="text-primary shrink-0"
															strokeWidth={2.5}
														/>
													) : (
														<Circle size={13} className="text-gray-300 shrink-0" strokeWidth={2} />
													)}
													<span
														className={cn(
															"text-[11px] leading-tight",
															passes ? "text-gray-700" : "text-gray-400",
														)}
													>
														{label}
													</span>
												</div>
											)
										})}
									</div>
								)}
							</Form.Field>

							<Form.Field name="confirm" className="flex flex-col gap-2">
								<Form.Label className="text-sm font-medium text-gray-800">
									Confirm Password
								</Form.Label>
								<div className="flex items-center gap-2.5 h-12 px-4 rounded-xl border border-gray-200 focus-within:border-primary transition-colors">
									<Lock size={15} className="text-gray-400 shrink-0" />
									<Form.Control asChild>
										<input
											type={showConfirmPassword ? "text" : "password"}
											name="confirm"
											placeholder="Re-enter new password"
											autoComplete="new-password"
											className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
										/>
									</Form.Control>
									<button
										type="button"
										onClick={() => setShowConfirmPassword((v) => !v)}
										className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none shrink-0"
									>
										{showConfirmPassword ? <Eye size={15} /> : <EyeOff size={15} />}
									</button>
								</div>
							</Form.Field>

							{newPasswordError && (
								<p className="text-xs text-destructive text-center">{newPasswordError}</p>
							)}

							<Form.Submit asChild>
								<ActionButton disabled={resetPassword.isPending || !allRulesPass}>
									{resetPassword.isPending ? (
										<span className="flex items-center justify-center gap-2">
											<Loader2 size={14} className="animate-spin" />
											Changing password...
										</span>
									) : (
										"Change Password"
									)}
								</ActionButton>
							</Form.Submit>
						</Form.Root>
					</div>
				)}
			</div>

			<SuccessDialog
				open={successOpen}
				onOpenChange={setSuccessOpen}
				title="Password changed!"
				description="Your password has been updated. Use it the next time you sign in."
				actionLabel="Done"
				onAction={() => {
					setSuccessOpen(false)
					onBack()
				}}
			/>
		</div>
	)
}
