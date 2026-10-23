import type { EventFormValues } from "@/types/events/api"

/** test helpers only: never imported by app code */
export function fakeFile(name: string, type: string, size: number): File {
	const file = new File(["x"], name, { type })
	Object.defineProperty(file, "size", { value: size })
	return file
}

export const validValues = (over: Partial<EventFormValues> = {}): EventFormValues => ({
	name: "Jos Tech Meetup",
	startDate: "2026-11-01",
	startTime: "18:00",
	endDate: "2026-11-01",
	endTime: "20:00",
	privacy: "public",
	isLocked: false,
	passcode: "",
	hashtags: [],
	links: [],
	coordinates: { latitude: 9.92, longitude: 8.89 },
	cover: null,
	documents: { mode: "keep" },
	...over,
})

