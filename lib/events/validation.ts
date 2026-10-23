/**
 * Pure validation for the create / edit form. No React, no Next: it is shared by the form
 * (inline errors), the request builders and the BFF, so every rule exists once.
 *
 * Rules come from the guide (§4.5, §4.6, §7) and are NOT verified against the deployed
 * backend. The backend's own 400 stays authoritative and is always surfaced by the form.
 */

import type { EventFormInitial, EventFormValues } from "@/types/events/api"
import {
	COVER_MAX_BYTES,
	COVER_MIME_TYPES,
	DOCUMENT_MAX_BYTES,
	DOCUMENT_MIME_TYPES,
	MAX_DOCUMENT_NAME_LENGTH,
	MAX_DOCUMENTS,
	MAX_EVENT_NAME_LENGTH,
	MAX_HASHTAG_LENGTH,
	MAX_HASHTAGS,
	MAX_LINK_NAME_LENGTH,
	MAX_LINKS,
	MAX_TOTAL_UPLOAD_BYTES,
	PASSCODE_LENGTH,
} from "./constants"
import { isValidCoordinates } from "./location"
import { normalizeHttpUrl } from "./normalize"

/** field key → message; keys are `name`, `schedule`, `links.0.url`, `documents.1.file`, … */
export type FormErrors = Record<string, string>

const PASSCODE = new RegExp(`^[0-9]{${PASSCODE_LENGTH}}$`)

/** four ASCII digits only. `\\d` is not used on purpose: it must stay a string check */
export function isValidPasscode(value: unknown): value is string {
	return typeof value === "string" && PASSCODE.test(value)
}

/** the backend trims, lowercases, skips empties and de-duplicates; do the same so the form shows what is stored */
export function normalizeHashtag(raw: string): string {
	return raw.trim().replace(/^#+/, "").trim().toLowerCase()
}

export function normalizeHashtags(list: readonly string[]): string[] {
	const seen = new Set<string>()
	const out: string[] = []
	for (const raw of list) {
		const tag = normalizeHashtag(raw)
		if (!tag || seen.has(tag)) continue
		seen.add(tag)
		out.push(tag)
	}
	return out
}

export function isValidDateString(value: string): boolean {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
	if (!match) return false
	const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
	const date = new Date(Date.UTC(y, m - 1, d))
	return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function isValidTimeString(value: string): boolean {
	return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

/** `HH:MM` → `HH:MM:SS`; the backend rejects a bare `HH:MM` on create/update */
export function toApiTime(value: string): string {
	return /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value
}

/**
 * The whole schedule, not just pairs. The backend rejects start time after end time even when
 * the end DATE is later (so an overnight event is currently impossible), and its partial-update
 * check only compares fields sent together; the form therefore validates the merged schedule.
 */
export function validateSchedule(v: {
	startDate: string
	startTime: string
	endDate: string
	endTime: string
}): FormErrors {
	const errors: FormErrors = {}
	if (!v.startDate) errors.startDate = "Choose a start date."
	else if (!isValidDateString(v.startDate)) errors.startDate = "Enter a valid start date."
	if (!v.endDate) errors.endDate = "Choose an end date."
	else if (!isValidDateString(v.endDate)) errors.endDate = "Enter a valid end date."
	if (!v.startTime) errors.startTime = "Choose a start time."
	else if (!isValidTimeString(v.startTime)) errors.startTime = "Enter a valid start time."
	if (!v.endTime) errors.endTime = "Choose an end time."
	else if (!isValidTimeString(v.endTime)) errors.endTime = "Enter a valid end time."
	if (Object.keys(errors).length > 0) return errors

	if (v.startDate > v.endDate) {
		errors.endDate = "The end date can't be before the start date."
	} else if (v.startTime > v.endTime) {
		errors.endTime =
			v.startDate === v.endDate
				? "The end time can't be before the start time."
				: "The end time must not be earlier than the start time, even when the event ends on a later day. Overnight schedules aren't supported yet."
	}
	return errors
}

export function validateCoverFile(file: File): string | null {
	if (!(COVER_MIME_TYPES as readonly string[]).includes(file.type)) return "The cover must be a JPEG or PNG image."
	if (file.size > COVER_MAX_BYTES) return "The cover must be 2 MB or smaller."
	return null
}

export function validateDocumentFile(file: File): string | null {
	// the type must be on the backend's list; a file extension alone does not decide acceptance
	if (!(DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) return "This file type isn't supported."
	if (file.size > DOCUMENT_MAX_BYTES) return "Each document must be 10 MB or smaller."
	return null
}

export interface FormContext {
	mode: "create" | "edit"
	/** required for edit: decides whether a passcode is already set */
	initial?: EventFormInitial
}

/** rows with neither a name nor a URL are ignored; a half-filled row is an error */
export function isBlankLink(link: { name: string; url: string }): boolean {
	return !link.name.trim() && !link.url.trim()
}

export function validateEventForm(values: EventFormValues, ctx: FormContext): FormErrors {
	const errors: FormErrors = {}

	const name = values.name.trim()
	if (!name) errors.name = "Give your event a name."
	else if (name.length > MAX_EVENT_NAME_LENGTH)
		errors.name = `The name can be at most ${MAX_EVENT_NAME_LENGTH} characters.`

	Object.assign(errors, validateSchedule(values))

	// passcode: a string, four ASCII digits. Required when locking; optional (keep) when already locked
	if (values.isLocked) {
		const alreadyLocked = ctx.mode === "edit" && ctx.initial?.isLocked === true
		if (values.passcode === "") {
			if (!alreadyLocked) errors.passcode = "Enter a 4-digit passcode."
		} else if (!isValidPasscode(values.passcode)) {
			errors.passcode = "The passcode must be exactly 4 digits."
		}
	}

	const tags = normalizeHashtags(values.hashtags)
	if (tags.length > MAX_HASHTAGS) errors.hashtags = `Use at most ${MAX_HASHTAGS} tags.`
	else if (tags.some((t) => t.length > MAX_HASHTAG_LENGTH))
		errors.hashtags = `Each tag can be at most ${MAX_HASHTAG_LENGTH} characters.`

	const links = values.links
	if (links.filter((l) => !isBlankLink(l)).length > MAX_LINKS)
		errors.links = `Add at most ${MAX_LINKS} links.`
	links.forEach((link, i) => {
		if (isBlankLink(link)) return
		if (!link.name.trim()) errors[`links.${i}.name`] = "Name this link."
		else if (link.name.trim().length > MAX_LINK_NAME_LENGTH)
			errors[`links.${i}.name`] = `At most ${MAX_LINK_NAME_LENGTH} characters.`
		if (!link.url.trim()) errors[`links.${i}.url`] = "Enter the link address."
		else if (!normalizeHttpUrl(link.url.trim()))
			errors[`links.${i}.url`] = "Enter a full web address starting with http:// or https://."
	})

	if (ctx.mode === "create") {
		if (!values.coordinates) errors.coordinates = "Set the event location."
	}
	if (values.coordinates && !isValidCoordinates(values.coordinates.latitude, values.coordinates.longitude)) {
		errors.coordinates = "The location isn't valid. Try again."
	}

	let uploadBytes = 0
	if (values.cover) {
		const problem = validateCoverFile(values.cover)
		if (problem) errors.cover = problem
		else uploadBytes += values.cover.size
	}

	if (values.documents.mode === "replace") {
		const items = values.documents.items
		if (items.length > MAX_DOCUMENTS) errors.documents = `Upload at most ${MAX_DOCUMENTS} documents.`
		items.forEach((item, i) => {
			const label = item.name.trim()
			if (!label) errors[`documents.${i}.name`] = "Name this document."
			else if (label.length > MAX_DOCUMENT_NAME_LENGTH)
				errors[`documents.${i}.name`] = `At most ${MAX_DOCUMENT_NAME_LENGTH} characters.`
			const problem = validateDocumentFile(item.file)
			if (problem) errors[`documents.${i}.file`] = problem
			else uploadBytes += item.file.size
		})
	}

	if (uploadBytes > MAX_TOTAL_UPLOAD_BYTES && !errors.documents) {
		errors.upload = `The cover and documents together can be at most ${Math.floor(MAX_TOTAL_UPLOAD_BYTES / (1024 * 1024))} MB.`
	}

	return errors
}
