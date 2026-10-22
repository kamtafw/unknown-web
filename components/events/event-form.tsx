"use client"

import { useCreateEvent, useUpdateEvent } from "@/hooks/events/use-event-mutations"
import { MAX_EVENT_NAME_LENGTH } from "@/lib/events/constants"
import { describeEventError, type EventRequestError } from "@/lib/events/errors"
import { emptyFormValues, initialFromDetails, valuesFromDetails } from "@/lib/events/form-model"
import { buildCreateSubmission, buildUpdateSubmission } from "@/lib/events/request"
import { toast } from "@/lib/toast"
import type { EventFormValues, EventFullDetails } from "@/types/events/api"
import { Loader2 } from "lucide-react"
import { useMemo, useRef, useState, type FormEvent } from "react"
import { primaryButton, secondaryButton } from "./event-list"
import { AccessField } from "./form/access-field"
import { CoverField } from "./form/cover-field"
import { DocumentsField } from "./form/documents-field"
import { DateTimeField, FormField, INPUT, SECTION_TITLE, describedBy } from "./form/fields"
import { LinksField } from "./form/links-field"
import { LocationField } from "./form/location-field"
import { TagsField } from "./form/tags-field"

type Props =
	| {
			mode: "create"
			details?: undefined
			onDone: (eventId: string | null) => void
			onCancel: () => void
	  }
	| {
			mode: "edit"
			details: EventFullDetails
			onDone: (eventId: string | null) => void
			onCancel: () => void
	  }

/**
 * Create / edit. The shape of the form follows the Create event frame's metadata (thumbnail,
 * location, name, duration, links and documents); privacy, passcode, tags and the shape of the
 * edit flow are assumptions (A-10…A-12). All validation lives in `lib/events/validation` and
 * all request building in `lib/events/request`, so the rules exist once; the backend's own 400
 * is always shown too, and the user's input is kept after any failure.
 */
export function EventForm(props: Props) {
	const { mode, details, onDone, onCancel } = props
	const initial = useMemo(() => (details ? initialFromDetails(details) : undefined), [details])
	const [values, setValues] = useState<EventFormValues>(() =>
		details ? valuesFromDetails(details) : emptyFormValues(),
	)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [serverError, setServerError] = useState<EventRequestError | null>(null)
	const [progress, setProgress] = useState<number | null>(null)
	const formRef = useRef<HTMLFormElement>(null)

	const create = useCreateEvent()
	const update = useUpdateEvent(details?.id ?? "")
	const pending = create.isPending || update.isPending

	const set = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) =>
		setValues((v) => ({ ...v, [key]: value }))

	const focusFirstError = () =>
		requestAnimationFrame(() =>
			formRef.current
				?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')
				?.focus?.(),
		)

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault()
		if (pending) return
		setServerError(null)

		const built =
			mode === "create" ? buildCreateSubmission(values) : buildUpdateSubmission(initial!, values)
		if (!built.ok) {
			setErrors(built.errors)
			focusFirstError()
			return
		}
		setErrors({})
		if (built.value === null) {
			toast.info("There's nothing to save yet. Change something first.")
			return
		}

		const submission = built.value
		setProgress(submission.kind === "multipart" ? 0 : null)
		try {
			const saved =
				mode === "create"
					? await create.mutateAsync({ submission, onProgress: setProgress })
					: await update.mutateAsync({ submission, onProgress: setProgress })
			toast.success(mode === "create" ? "Event created" : "Event updated")
			onDone(saved?.id ?? details?.id ?? null)
		} catch (error) {
			const described = describeEventError(error)
			setServerError(described)
			setErrors(described.fieldErrors)
			focusFirstError()
		} finally {
			setProgress(null)
		}
	}

	const title = mode === "create" ? "Create event" : "Edit event"
	const summary =
		serverError?.message ??
		(Object.keys(errors).length > 0 ? "Check the highlighted fields and try again." : null)

	return (
		<form
			ref={formRef}
			onSubmit={onSubmit}
			noValidate
			aria-label={title}
			className="mx-auto flex w-full max-w-[400px] flex-col gap-6 px-4 py-6 sm:px-0"
		>
			<h1 className="text-xl font-bold text-foreground">{title}</h1>

			{summary && (
				<p
					role="alert"
					tabIndex={-1}
					className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-[13px] font-medium text-destructive"
				>
					{summary}
				</p>
			)}

			<CoverField
				file={values.cover}
				onChange={(f) => set("cover", f)}
				existingUrl={details?.coverImage}
				error={errors.cover}
			/>

			<FormField id="event-name" label="Event name" error={errors.name}>
				<input
					id="event-name"
					type="text"
					value={values.name}
					maxLength={MAX_EVENT_NAME_LENGTH}
					autoComplete="off"
					className={INPUT}
					aria-invalid={errors.name ? true : undefined}
					aria-describedby={describedBy("event-name", { error: errors.name })}
					onChange={(e) => set("name", e.target.value)}
				/>
			</FormField>

			<LocationField
				mode={mode}
				existingAddress={details?.address}
				coordinates={values.coordinates}
				onChange={(c) => set("coordinates", c)}
				error={errors.coordinates}
			/>

			<fieldset className="flex flex-col gap-3">
				<legend className={`${SECTION_TITLE} mb-1`}>Duration</legend>
				<div className="flex gap-3">
					<DateTimeField
						id="start-date"
						label="Start date"
						kind="date"
						value={values.startDate}
						onChange={(v) => set("startDate", v)}
						error={errors.startDate}
					/>
					<DateTimeField
						id="start-time"
						label="Start time"
						kind="time"
						value={values.startTime}
						onChange={(v) => set("startTime", v)}
						error={errors.startTime}
					/>
				</div>
				<div className="flex gap-3">
					<DateTimeField
						id="end-date"
						label="End date"
						kind="date"
						value={values.endDate}
						onChange={(v) => set("endDate", v)}
						error={errors.endDate}
					/>
					<DateTimeField
						id="end-time"
						label="End time"
						kind="time"
						value={values.endTime}
						onChange={(v) => set("endTime", v)}
						error={errors.endTime}
					/>
				</div>
				<p className="text-[12px] leading-relaxed text-muted-foreground">
					Times are saved exactly as you enter them. Events don&apos;t store a timezone yet.
				</p>
			</fieldset>

			<AccessField
				privacy={values.privacy}
				isLocked={values.isLocked}
				passcode={values.passcode}
				alreadyLocked={mode === "edit" && details.isLocked}
				onPrivacy={(p) => set("privacy", p)}
				onLocked={(locked) =>
					setValues((v) => ({ ...v, isLocked: locked, passcode: locked ? v.passcode : "" }))
				}
				onPasscode={(p) => set("passcode", p)}
				errors={errors}
			/>

			<TagsField
				tags={values.hashtags}
				onChange={(t) => set("hashtags", t)}
				error={errors.hashtags}
			/>

			<LinksField
				links={values.links}
				onChange={(l) => set("links", l)}
				errors={errors}
				error={errors.links}
			/>

			<DocumentsField
				mode={mode}
				existing={details?.documents ?? []}
				value={values.documents}
				onChange={(d) => set("documents", d)}
				errors={errors}
				error={errors.documents ?? errors.upload}
			/>

			{progress !== null && (
				<div role="status" className="flex flex-col gap-1.5">
					<progress value={progress} max={1} aria-label="Upload progress" className="h-2 w-full" />
					<p className="text-[12px] text-muted-foreground">
						Uploading… {Math.round(progress * 100)}%
					</p>
				</div>
			)}

			<div className="flex items-center justify-end gap-2.5 border-t border-muted pt-5">
				<button type="button" onClick={onCancel} disabled={pending} className={secondaryButton}>
					Cancel
				</button>
				<button type="submit" disabled={pending} className={primaryButton}>
					{pending && <Loader2 size={13} className="animate-spin" aria-hidden />}
					{mode === "create" ? "Create event" : "Save changes"}
				</button>
			</div>
		</form>
	)
}
