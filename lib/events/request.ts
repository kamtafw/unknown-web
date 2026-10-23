/**
 * Form values → the request the browser sends to the BFF (`app/api/events/*`).
 *
 * Encodes the backend's write semantics (guide §4.5, §4.6, §8.5), none of which is verified
 * against the deployed backend:
 *  - times go out as `HH:MM:SS`; passcodes are strings and only sent when locked and entered;
 *  - locked forces privacy `private`; `is_live` is never sent (lifecycle endpoints own it);
 *  - coordinates are a pair (create requires it; edit sends it only after an explicit change);
 *  - collections: omitted = keep, `[]` = clear, populated = replace ALL. Existing document URLs
 *    cannot be re-sent, so documents are only ever kept (omitted), cleared, or replaced by uploads;
 *  - edit sends only what changed, but always the whole schedule if any part of it changed, so the
 *    backend's pairwise schedule check can never be bypassed by a partial update;
 *  - JSON unless a file is attached, then multipart with contiguous indexed fields.
 *
 * Passcodes appear only in the request body. They are never put in a URL.
 */

import type {
	EventFormInitial,
	EventFormValues,
	EventLink,
	EventSubmission,
} from "@/types/events/api"
import { formatCoordinateParam } from "./location"
import { type FormErrors, isBlankLink, normalizeHashtags, toApiTime, validateEventForm } from "./validation"

export type BuildResult<T> = { ok: true; value: T } | { ok: false; errors: FormErrors }

type LinkWire = { link_name: string; url: string }

function cleanLinks(links: readonly EventLink[]): EventLink[] {
	return links
		.filter((l) => !isBlankLink(l))
		.map((l) => ({ name: l.name.trim(), url: l.url.trim() }))
}

function toLinkWire(links: readonly EventLink[]): LinkWire[] {
	return links.map((l) => ({ link_name: l.name, url: l.url }))
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
	return a.length === b.length && a.every((v, i) => v === b[i])
}

function sameLinks(a: readonly EventLink[], b: readonly EventLink[]): boolean {
	return a.length === b.length && a.every((l, i) => l.name === b[i].name && l.url === b[i].url)
}

/** numbers in JSON, 6-decimal strings in multipart; never exponent notation */
function coordinateNumber(value: number): number {
	return Number(formatCoordinateParam(value))
}

interface Plan {
	/** scalar fields, already in wire form (strings are sent verbatim in multipart) */
	scalars: Record<string, string | boolean | number>
	hashtags?: string[]
	links?: LinkWire[]
	/** documents: undefined = omit (keep), "clear" = [], or uploads */
	documents?: "clear" | { name: string; file: File }[]
	cover?: File
}

function needsMultipart(plan: Plan): boolean {
	return Boolean(plan.cover) || (Array.isArray(plan.documents) && plan.documents.length > 0)
}

function toJsonBody(plan: Plan): Record<string, unknown> {
	const body: Record<string, unknown> = { ...plan.scalars }
	if (plan.hashtags) body.hashtags = plan.hashtags
	if (plan.links) body.links = plan.links
	if (plan.documents === "clear") body.documents = []
	return body
}

/**
 * Multipart: indexed fields for populated lists, `"[]"` (a JSON string) to clear one. Documents
 * use contiguous `documents[i].doc_name` / `documents[i].doc_file` and are never combined with an
 * independent `documents` array. Booleans are the text `true` / `false`.
 */
function toFormData(plan: Plan): FormData {
	const form = new FormData()
	for (const [key, value] of Object.entries(plan.scalars)) form.append(key, String(value))

	if (plan.hashtags) {
		if (plan.hashtags.length === 0) form.append("hashtags", "[]")
		plan.hashtags.forEach((tag, i) => form.append(`hashtags[${i}]`, tag))
	}
	if (plan.links) {
		if (plan.links.length === 0) form.append("links", "[]")
		plan.links.forEach((link, i) => {
			form.append(`links[${i}].link_name`, link.link_name)
			form.append(`links[${i}].url`, link.url)
		})
	}
	if (plan.documents === "clear") {
		// ASSUMPTION (EV-024): a JSON "[]" string clears documents in a multipart request; the guide
		// only documents JSON-array strings for links/hashtags. Unverified against the live backend.
		form.append("documents", "[]")
	} else if (plan.documents) {
		plan.documents.forEach((doc, i) => {
			form.append(`documents[${i}].doc_name`, doc.name)
			form.append(`documents[${i}].doc_file`, doc.file)
		})
	}
	if (plan.cover) form.append("cover_image", plan.cover)
	return form
}

function toSubmission(plan: Plan): EventSubmission {
	return needsMultipart(plan)
		? { kind: "multipart", body: toFormData(plan) }
		: { kind: "json", body: toJsonBody(plan) }
}

function documentsPlan(values: EventFormValues): Plan["documents"] {
	const change = values.documents
	if (change.mode === "keep") return undefined
	if (change.mode === "clear" || change.items.length === 0) return "clear"
	return change.items.map((i) => ({ name: i.name.trim(), file: i.file }))
}

function scheduleScalars(values: EventFormValues): Plan["scalars"] {
	return {
		start_date: values.startDate,
		start_time: toApiTime(values.startTime),
		end_date: values.endDate,
		end_time: toApiTime(values.endTime),
	}
}

export function buildCreateSubmission(values: EventFormValues): BuildResult<EventSubmission> {
	const errors = validateEventForm(values, { mode: "create" })
	if (Object.keys(errors).length > 0) return { ok: false, errors }
	if (!values.coordinates) return { ok: false, errors: { coordinates: "Set the event location." } }

	const plan: Plan = {
		scalars: {
			name: values.name.trim(),
			...scheduleScalars(values),
			latitude: values.coordinates.latitude,
			longitude: values.coordinates.longitude,
			privacy: values.isLocked ? "private" : values.privacy,
			is_locked: values.isLocked,
		},
	}
	if (values.isLocked) plan.scalars.passcode = values.passcode

	const hashtags = normalizeHashtags(values.hashtags)
	if (hashtags.length > 0) plan.hashtags = hashtags
	const links = cleanLinks(values.links)
	if (links.length > 0) plan.links = toLinkWire(links)
	const docs = documentsPlan(values)
	// nothing to clear on a new event
	if (Array.isArray(docs)) plan.documents = docs
	if (values.cover) plan.cover = values.cover

	return { ok: true, value: toSubmission(withCoordinates(plan, values)) }
}

/** coordinates are numbers in JSON and fixed-precision strings in multipart */
function withCoordinates(plan: Plan, values: EventFormValues): Plan {
	if (!values.coordinates) return plan
	const { latitude, longitude } = values.coordinates
	const asText = needsMultipart(plan)
	return {
		...plan,
		scalars: {
			...plan.scalars,
			latitude: asText ? formatCoordinateParam(latitude) : coordinateNumber(latitude),
			longitude: asText ? formatCoordinateParam(longitude) : coordinateNumber(longitude),
		},
	}
}

/**
 * Edit: PATCH with only what changed. Returns `null` when nothing changed, so the UI can say so
 * instead of sending an empty update.
 */
export function buildUpdateSubmission(
	initial: EventFormInitial,
	values: EventFormValues,
): BuildResult<EventSubmission | null> {
	const errors = validateEventForm(values, { mode: "edit", initial })
	if (Object.keys(errors).length > 0) return { ok: false, errors }

	const plan: Plan = { scalars: {} }
	let changed = false
	const set = (fields: Plan["scalars"]) => {
		Object.assign(plan.scalars, fields)
		changed = true
	}

	if (values.name.trim() !== initial.name) set({ name: values.name.trim() })

	if (
		values.startDate !== initial.startDate ||
		values.startTime !== initial.startTime ||
		values.endDate !== initial.endDate ||
		values.endTime !== initial.endTime
	) {
		set(scheduleScalars(values))
	}

	// is_locked and privacy travel together: unlocking does NOT reset privacy on the backend
	const effectivePrivacy = values.isLocked ? "private" : values.privacy
	const passcodeEntered = values.isLocked && values.passcode !== ""
	if (
		values.isLocked !== initial.isLocked ||
		effectivePrivacy !== initial.privacy ||
		passcodeEntered
	) {
		set({ is_locked: values.isLocked, privacy: effectivePrivacy })
		// a locked event keeps its existing code when `passcode` is omitted
		if (passcodeEntered) plan.scalars.passcode = values.passcode
	}

	const hashtags = normalizeHashtags(values.hashtags)
	if (!sameList(hashtags, normalizeHashtags(initial.hashtags))) {
		plan.hashtags = hashtags
		changed = true
	}

	const links = cleanLinks(values.links)
	if (!sameLinks(links, cleanLinks(initial.links))) {
		plan.links = toLinkWire(links)
		changed = true
	}

	const docs = documentsPlan(values)
	if (docs !== undefined) {
		plan.documents = docs
		changed = true
	}

	if (values.cover) {
		plan.cover = values.cover
		changed = true
	}

	if (values.coordinates) {
		// the pair moves the stored location; one coordinate alone would be ignored
		set({ latitude: values.coordinates.latitude, longitude: values.coordinates.longitude })
	}

	if (!changed) return { ok: true, value: null }
	return { ok: true, value: toSubmission(withCoordinates(plan, values)) }
}
