"use client"

import { useConfirmPassword, useGenerateTotp, useSetPin, useVerifyTotp } from "@/hooks/use-2fa"
import { extractFirstError } from "@/lib/api-error"
import { otpSchema } from "@/lib/schemas"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { OtpDefault } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import * as RadioGroup from "@radix-ui/react-radio-group"
import * as Switch from "@radix-ui/react-switch"
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Phone } from "lucide-react"
import { Form, unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui"
import { FormEvent, useState } from "react"
import { SuccessDialog } from "../auth/success-dialog"
import type { TwoFAMethod } from "../auth/two-factor-verification"
import { DeleteAccount, LockShield, SimCards, TwoFALock } from "./account-setting-icons"

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
				<div className="flex justify-center py-8">
					<LockShield width={70} height={88} />
				</div>

				<div className="px-6">
					<h3 className="font-semibold text-gray-900 mb-3">Your chats and calls are private</h3>
					<p className="text-[13.5px] text-gray-500 leading-relaxed mb-4">
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
							<li key={item} className="flex items-center gap-2.5 text-[13.5px] text-gray-600">
								<span className="text-gray-400 text-base leading-none shrink-0">•</span>
								{item}
							</li>
						))}
					</ul>
					<button className="text-[13.5px] font-semibold text-primary hover:underline block mb-7">
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
					<button className="text-[13.5px] font-semibold text-primary hover:underline block mb-10">
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
	isLoading,
}: {
	onBack: () => void
	onContinue: () => void
	secret: string | null
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
						<span className="text-3xl font-bold text-gray-400 select-none">G</span>
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

export function DeleteAccountPanel({ onBack }: { onBack: () => void }) {
	const [phone, setPhone] = useState("")
	const [password, setPassword] = useState("")
	const [showPw, setShowPw] = useState(false)

	const canSubmit = phone.trim().length > 0 && password.length > 0

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Delete account" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="flex justify-center py-6.5">
					<DeleteAccount width={80} height={80} />
				</div>

				<div className="px-6">
					<h3 className="text-[15.5px] font-semibold text-gray-900 mb-3">
						If you delete this account
					</h3>
					<ul className="space-y-2 mb-6">
						{[
							"The account will be deleted from AppsCombo",
							"Your message history will be erased",
							"You will be removed from all your Appscombo groups",
							"Your google storage backup will be deleted",
							"Any channels you created will be deleted",
						].map((item) => (
							<li key={item} className="flex items-start gap-2 text-[13px] text-gray-600">
								<span className="text-gray-400 shrink-0 mt-0.5">•</span>
								{item}
							</li>
						))}
					</ul>

					{/* Phone number */}
					<div className="mb-4">
						<p className="text-[13.5px] font-semibold text-gray-900 mb-2">Phone number</p>
						<div className="flex items-center gap-2.5 h-12 rounded-xl border-2 border-primary px-3.5 focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
							<Phone size={16} className="text-gray-500 shrink-0" />
							<input
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="Placeholder"
								className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
							/>
						</div>
					</div>

					{/* Password */}
					<div className="mb-7">
						<p className="text-[13.5px] font-semibold text-gray-900 mb-2">Password</p>
						<div className="flex items-center gap-2.5 h-12 rounded-xl border border-gray-200 px-3.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
							<Lock size={16} className="text-gray-400 shrink-0" />
							<input
								type={showPw ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password"
								className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
							/>
							<button
								type="button"
								onClick={() => setShowPw((v) => !v)}
								className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
							>
								{showPw ? <Eye size={16} /> : <EyeOff size={16} />}
							</button>
						</div>
					</div>

					<ActionButton disabled={!canSubmit}>Continue</ActionButton>
					<div className="h-8" />
				</div>
			</div>
		</div>
	)
}
