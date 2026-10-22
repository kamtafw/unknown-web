"use client"

import { Switch } from "@/components/ui/switch"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { PASSCODE_LENGTH } from "@/lib/events/constants"
import type { EventPrivacy } from "@/types/events/api"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useId } from "react"
import { FieldMessages, SECTION_TITLE } from "./fields"

const PRIVACY: { value: EventPrivacy; label: string; description: string }[] = [
	{ value: "public", label: "Public", description: "Anyone can see the full details." },
	{
		value: "friends",
		label: "Friends",
		description: "People who aren't admitted see limited details. Friend-only access isn't enforced yet.",
	},
	{
		value: "private",
		label: "Private",
		description: "People who aren't admitted see limited details.",
	},
]

/**
 * Privacy and passcode (no design: assumption A-11). A passcode makes the event private, so the
 * privacy choice only applies when there is none. The passcode is four digits and always a string
 * ("0042" stays "0042"); it lives only in form state and the request body, never in a URL, storage
 * or the query cache. On an edit of an already-locked event an empty field keeps the current code.
 */
export function AccessField({
	privacy,
	isLocked,
	passcode,
	alreadyLocked,
	onPrivacy,
	onLocked,
	onPasscode,
	errors,
}: {
	privacy: EventPrivacy
	isLocked: boolean
	passcode: string
	alreadyLocked: boolean
	onPrivacy: (privacy: EventPrivacy) => void
	onLocked: (locked: boolean) => void
	onPasscode: (passcode: string) => void
	errors: Record<string, string>
}) {
	const id = useId()
	const passcodeHint = alreadyLocked
		? "Leave this empty to keep the current passcode."
		: `Choose ${PASSCODE_LENGTH} digits. Share the code with the people you want to admit.`

	return (
		<section aria-labelledby={`${id}-title`} className="flex flex-col gap-3">
			<h2 id={`${id}-title`} className={SECTION_TITLE}>
				Access
			</h2>

			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<label htmlFor={`${id}-lock`} className="text-[13px] font-semibold text-foreground">
						Require a passcode
					</label>
					<p className="text-[12px] leading-relaxed text-muted-foreground">
						People need a {PASSCODE_LENGTH}-digit code to join. Locked events are always private.
					</p>
				</div>
				<Switch id={`${id}-lock`} checked={isLocked} onCheckedChange={onLocked} />
			</div>

			{isLocked ? (
				<div className="flex flex-col gap-1.5">
					<span id={`${id}-pass-label`} className="text-[13px] font-semibold text-foreground">
						Passcode
					</span>
					<InputOTP
						maxLength={PASSCODE_LENGTH}
						pattern={REGEXP_ONLY_DIGITS}
						inputMode="numeric"
						autoComplete="off"
						value={passcode}
						onChange={onPasscode}
						aria-labelledby={`${id}-pass-label`}
						aria-invalid={errors.passcode ? true : undefined}
						aria-describedby={errors.passcode ? `${id}-pass-error` : `${id}-pass-hint`}
					>
						<InputOTPGroup className="gap-2">
							{Array.from({ length: PASSCODE_LENGTH }, (_, i) => (
								<InputOTPSlot key={i} index={i} className="size-11 rounded-xl border border-border bg-card" />
							))}
						</InputOTPGroup>
					</InputOTP>
					<FieldMessages id={`${id}-pass`} hint={passcodeHint} error={errors.passcode} />
				</div>
			) : (
				<fieldset className="flex flex-col gap-2">
					<legend className="mb-1 text-[13px] font-semibold text-foreground">Who can see this event</legend>
					{PRIVACY.map((opt) => (
						<label key={opt.value} className="flex items-start gap-2.5 rounded-xl border border-border px-3 py-2.5 has-[:checked]:border-primary">
							<input
								type="radio"
								name={`${id}-privacy`}
								value={opt.value}
								checked={privacy === opt.value}
								onChange={() => onPrivacy(opt.value)}
								className="mt-0.5 size-4 accent-[var(--primary)]"
							/>
							<span className="min-w-0">
								<span className="block text-[13px] font-semibold text-foreground">{opt.label}</span>
								<span className="block text-[12px] leading-relaxed text-muted-foreground">{opt.description}</span>
							</span>
						</label>
					))}
					<FieldMessages id={`${id}-privacy`} error={errors.privacy} />
				</fieldset>
			)}
		</section>
	)
}
