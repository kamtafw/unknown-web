/**
 * Starting values for the event form. Pure, so the mapping from a details response to form
 * state (and what an edit is compared against) is unit-testable.
 */

import type {
	EventFormInitial,
	EventFormValues,
	EventFullDetails,
} from "@/types/events/api"

/** a new event: nothing is pre-filled for the schedule or the location (no silent defaults) */
export function emptyFormValues(): EventFormValues {
	return {
		name: "",
		startDate: "",
		startTime: "",
		endDate: "",
		endTime: "",
		privacy: "public",
		isLocked: false,
		passcode: "",
		hashtags: [],
		links: [],
		coordinates: null,
		cover: null,
		documents: { mode: "keep" },
	}
}

/**
 * Editing starts from the stored event. The passcode is never returned by the backend, so it
 * starts empty (empty = keep the current one). Documents start as "keep": the stored files
 * cannot be sent back, so the only way to retain them is to leave the field out.
 * A locked event is always stored as private, and that is what the form shows.
 */
export function valuesFromDetails(details: EventFullDetails): EventFormValues {
	return {
		name: details.name,
		startDate: details.startDate,
		startTime: details.startTime,
		endDate: details.endDate,
		endTime: details.endTime,
		privacy: details.isLocked ? "private" : (details.privacy ?? "public"),
		isLocked: details.isLocked,
		passcode: "",
		hashtags: [...details.hashtags],
		links: details.links.map((l) => ({ ...l })),
		coordinates: null,
		cover: null,
		documents: { mode: "keep" },
	}
}

/** what an edit is diffed against: the stored values, not the form's current ones */
export function initialFromDetails(details: EventFullDetails): EventFormInitial {
	const v = valuesFromDetails(details)
	return {
		name: v.name,
		startDate: v.startDate,
		startTime: v.startTime,
		endDate: v.endDate,
		endTime: v.endTime,
		privacy: v.privacy,
		isLocked: v.isLocked,
		hashtags: v.hashtags,
		links: v.links,
	}
}
