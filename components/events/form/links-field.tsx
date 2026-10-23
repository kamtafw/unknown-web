"use client"

import { MAX_LINK_NAME_LENGTH, MAX_LINKS } from "@/lib/events/constants"
import type { EventLink } from "@/types/events/api"
import { Plus, Trash2 } from "lucide-react"
import { useId } from "react"
import { secondaryButton } from "../event-list"
import { FieldMessages, INPUT, SECTION_TITLE } from "./fields"

/**
 * Links: a name and a web address each. The design also draws a Date and Time per link; the
 * backend has no such field (a link's "date added" is derived from the event's creation time), so
 * none is offered (EV-023). Saving replaces the WHOLE list: that is exactly what an edit shows.
 */
export function LinksField({
	links,
	onChange,
	errors,
	error,
}: {
	links: EventLink[]
	onChange: (links: EventLink[]) => void
	errors: Record<string, string>
	error?: string
}) {
	const id = useId()
	const update = (i: number, patch: Partial<EventLink>) =>
		onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))

	return (
		<section aria-labelledby={`${id}-title`} className="flex flex-col gap-3">
			<h2 id={`${id}-title`} className={SECTION_TITLE}>
				Links
			</h2>
			{links.map((link, i) => {
				const nameError = errors[`links.${i}.name`]
				const urlError = errors[`links.${i}.url`]
				return (
					<fieldset key={i} className="flex flex-col gap-2 rounded-xl border border-border p-3">
						<legend className="px-1 text-[12px] font-semibold text-muted-foreground">
							Link {i + 1}
						</legend>
						<input
							aria-label={`Link ${i + 1} name`}
							type="text"
							value={link.name}
							maxLength={MAX_LINK_NAME_LENGTH}
							placeholder="Name, e.g. Event page"
							className={INPUT}
							aria-invalid={nameError ? true : undefined}
							aria-describedby={nameError ? `${id}-${i}-name-error` : undefined}
							onChange={(e) => update(i, { name: e.target.value })}
						/>
						{nameError && (
							<p
								id={`${id}-${i}-name-error`}
								role="alert"
								className="text-[12px] font-medium text-destructive"
							>
								{nameError}
							</p>
						)}
						<input
							aria-label={`Link ${i + 1} address`}
							type="url"
							inputMode="url"
							value={link.url}
							placeholder="https://"
							className={INPUT}
							aria-invalid={urlError ? true : undefined}
							aria-describedby={urlError ? `${id}-${i}-url-error` : undefined}
							onChange={(e) => update(i, { url: e.target.value })}
						/>
						{urlError && (
							<p
								id={`${id}-${i}-url-error`}
								role="alert"
								className="text-[12px] font-medium text-destructive"
							>
								{urlError}
							</p>
						)}
						<div>
							<button
								type="button"
								className={secondaryButton}
								onClick={() => onChange(links.filter((_, idx) => idx !== i))}
							>
								<Trash2 size={13} aria-hidden />
								Remove link {i + 1}
							</button>
						</div>
					</fieldset>
				)
			})}
			<div>
				<button
					type="button"
					className={secondaryButton}
					disabled={links.length >= MAX_LINKS}
					onClick={() => onChange([...links, { name: "", url: "" }])}
				>
					<Plus size={13} aria-hidden />
					{links.length === 0 ? "Add a link" : "Add another link"}
				</button>
			</div>
			<FieldMessages id={id} error={error} />
		</section>
	)
}
