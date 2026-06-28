"use client"

import { otpSchema } from "@/lib/schemas"
import { ArrowLeft, ArrowRight, Hash, KeyRound, Loader2, Smartphone } from "lucide-react"
import { Form, unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui"
import { ReactNode, useState } from "react"
import { ResendButton } from "../shared/resend-button"

export type TwoFAMethod = "authenticator" | "otp" | "pin"

const METHOD_META: Record<
	TwoFAMethod,
	{ label: string; shortLabel: string; icon: ReactNode; subtitle: string }
> = {
	authenticator: {
		label: "Google Authenticator",
		shortLabel: "Authenticator",
		icon: <Smartphone size={15} />,
		subtitle: "Enter the 6 digit code from your Google Authenticator app",
	},
	otp: {
		label: "OTP",
		shortLabel: "OTP",
		icon: <Hash size={15} />,
		subtitle: "Enter the 6 digit code we sent to your registered email",
	},
	pin: {
		label: "PIN",
		shortLabel: "PIN",
		icon: <KeyRound size={15} />,
		subtitle: "Enter your 6 digit security PIN",
	},
}

const CODE_LENGTH = 6

interface TwoFactorVerificationProps {
	initialMethod: TwoFAMethod
	availableMethods: TwoFAMethod[]
	isPending: boolean
	onVerify?: (method: TwoFAMethod, code: string) => void
	onResend?: (method: TwoFAMethod) => void
	onBack?: () => void
}

export function TwoFactorVerification({
	initialMethod,
	availableMethods,
	isPending,
	onVerify,
	onResend,
	onBack,
}: TwoFactorVerificationProps) {
	const [activeMethod, setActiveMethod] = useState<TwoFAMethod>(initialMethod)
	const [otpKey, setOtpKey] = useState(0)

	const current = METHOD_META[activeMethod]
	const tabs = availableMethods
	const fallbacks = availableMethods.filter((m) => m !== activeMethod)

	const handleSwitch = (method: TwoFAMethod) => {
		setActiveMethod(method)
		setOtpKey((k) => k + 1)
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = otpSchema.safeParse(raw)
		if (result.success) onVerify?.(activeMethod, result.data.otp)
	}

	return (
		<div className="flex justify-center pt-10 sm:pt-20 px-4 pb-10">
			<div className="w-full max-w-110 sm:max-w-2xl">
				{/* Mobile back */}
				<button
					type="button"
					onClick={onBack}
					className="sm:hidden flex items-center gap-1.5 text-sm text-muted-foreground bg-muted hover:bg-accent transition-colors rounded-full px-4 py-2 font-medium mb-6"
				>
					<ArrowLeft size={14} strokeWidth={2} />
					Back
				</button>

				<div className="flex items-start gap-16">
					{/* Desktop back */}
					<div className="hidden sm:block mt-1 shrink-0">
						<button
							type="button"
							onClick={onBack}
							className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted hover:bg-accent transition-colors rounded-full px-4 py-2 font-medium cursor-pointer"
						>
							<ArrowLeft size={14} strokeWidth={2} />
							Back
						</button>
					</div>

					<div className="flex-1 max-w-110">
						<div className="sm:bg-card sm:rounded-2xl sm:border sm:border-border sm:shadow-sm sm:px-8 sm:py-10">
							{tabs.length > 1 && (
								<div className="flex gap-1 sm:gap-1.5 bg-muted rounded-2xl p-1 mb-5 sm:mb-6">
									{tabs.map((method) => {
										const meta = METHOD_META[method]
										return (
											<button
												key={method}
												type="button"
												onClick={() => handleSwitch(method)}
												className={`
													flex-1 flex items-center justify-center gap-1 sm:gap-1.5
													px-2 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold
													transition-all duration-200
													${
														method === activeMethod
															? "bg-card text-primary shadow-sm border border-border"
															: "text-muted-foreground hover:text-foreground"
													}
												`}
											>
												{meta.icon}
												{meta.shortLabel}
											</button>
										)
									})}
								</div>
							)}

							<h1 className="text-2xl font-bold text-foreground mb-1">Security Verification</h1>
							<p className="text-sm text-muted-foreground mb-5 sm:mb-6">{current.subtitle}</p>

							<Form.Root key={otpKey} onSubmit={handleSubmit} className="flex flex-col gap-5">
								<Form.Field name="otp" className="flex flex-col gap-2">
									<OneTimePasswordField.Root
										name="otp"
										validationType="numeric"
										autoComplete="one-time-code"
										autoFocus
										className="flex gap-1.5 sm:gap-2.5"
										aria-label={`${current.label} code`}
									>
										{Array.from({ length: CODE_LENGTH }).map((_, i) => (
											<OneTimePasswordField.Input
												key={i}
												className="
													flex-1 min-w-0
													w-12 sm:w-15.5 h-12 sm:h-15.5
													text-center text-lg sm:text-xl font-semibold
													bg-muted text-foreground rounded-xl
													border-2 border-transparent
													focus:outline-none focus:border-primary focus:bg-card focus:ring-1 focus:ring-primary
													caret-primary transition-all duration-150
												"
											/>
										))}
										<OneTimePasswordField.HiddenInput />
									</OneTimePasswordField.Root>

									<Form.Message
										match={(v) => v.length > 0 && v.length < CODE_LENGTH}
										className="text-xs text-destructive"
									>
										Enter all {CODE_LENGTH} digits
									</Form.Message>
								</Form.Field>

								<Form.Submit asChild>
									<button
										disabled={isPending}
										className="w-full h-12 sm:h-13 rounded-full text-primary-foreground text-sm font-semibold transition-all duration-200 bg-primary hover:bg-primary/85 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
									>
										{isPending ? (
											<>
												<Loader2 size={15} className="animate-spin" />
												Verifying...
											</>
										) : (
											"Verify Code"
										)}
									</button>
								</Form.Submit>

								{activeMethod === "otp" && (
									<ResendButton onResend={() => onResend?.(activeMethod)} />
								)}

								{fallbacks.length > 0 && (
									<div>
										<p className="text-sm text-muted-foreground mb-3">
											{activeMethod === "authenticator"
												? "If Google Authenticator fails, use instead:"
												: "Use another method instead:"}
										</p>
										<div className="flex flex-col gap-2 sm:gap-2.5">
											{fallbacks.map((method) => (
												<button
													key={method}
													type="button"
													onClick={() => handleSwitch(method)}
													className="flex items-center justify-between w-full px-4 h-13 rounded-xl bg-muted hover:bg-accent text-sm font-medium text-foreground transition-colors group"
												>
													<span className="flex items-center gap-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
														{METHOD_META[method].icon}
														Use {METHOD_META[method].label} instead
													</span>
													<ArrowRight
														size={16}
														className="text-muted-foreground group-hover:text-foreground transition-colors"
													/>
												</button>
											))}
										</div>
									</div>
								)}
							</Form.Root>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
