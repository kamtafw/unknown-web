"use client"

import { MAX_HASHTAG_LENGTH, MAX_HASHTAGS } from "@/lib/events/constants"
import { normalizeHashtag, normalizeHashtags } from "@/lib/events/validation"
import { X } from "lucide-react"
import { useId, useState } from "react"
import { describedBy, FieldMessages, INPUT } from "./fields"

/**
 * Tags, normalised the way the backend stores them (trimmed, lower-cased, no leading #, no
 * duplicates), so what the form shows is what is saved. Enter, comma or leaving the field adds one.
 */
export function TagsField({
	tags,
	onChange,
	error,
}: {
	tags: string[]
	onChange: (tags: string[]) => void
	error?: string
}) {
	const id = useId()
	const [draft, setDraft] = useState("")

	const add = (raw: string) => {
		const tag = normalizeHashtag(raw)
		if (!tag) return
		onChange(normalizeHashtags([...tags, tag]))
		setDraft("")
	}

	const hint = `Up to ${MAX_HASHTAGS} tags, ${MAX_HASHTAG_LENGTH} characters each. Press Enter to add one.`

	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="text-[13px] font-semibold text-foreground">
				Tags <span className="font-normal text-muted-foreground">(optional)</span>
			</label>
			<input
				id={id}
				type="text"
				value={draft}
				maxLength={MAX_HASHTAG_LENGTH + 1}
				placeholder="#mindset"
				className={INPUT}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy(id, { hint, error })}
				onChange={(e) => {
					const value = e.target.value
					if (value.includes(",")) {
						value.split(",").forEach(add)
						return
					}
					setDraft(value)
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault() // Enter adds a tag; it must not submit the form
						add(draft)
					}
				}}
				onBlur={() => add(draft)}
			/>
			{tags.length > 0 && (
				<ul aria-label="Added tags" className="flex flex-wrap gap-2">
					{tags.map((tag) => (
						<li
							key={tag}
							className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1.5 text-[12px] font-medium text-primary"
						>
							#{tag}
							<button
								type="button"
								aria-label={`Remove tag ${tag}`}
								className="rounded-full p-0.5 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
								onClick={() => onChange(tags.filter((t) => t !== tag))}
							>
								<X size={12} aria-hidden />
							</button>
						</li>
					))}
				</ul>
			)}
			<FieldMessages id={id} hint={hint} error={error} />
		</div>
	)
}
