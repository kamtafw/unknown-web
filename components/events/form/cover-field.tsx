"use client"

import { validateCoverFile } from "@/lib/events/validation"
import { ImagePlus, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useId, useRef, useState } from "react"
import { secondaryButton } from "../event-list"
import { FieldMessages, SECTION_TITLE } from "./fields"

/**
 * Thumbnail ("Add thumbnail" in the design). JPEG or PNG, 2 MB at most, checked as soon as a file
 * is chosen and again on submit. On an edit the stored cover is shown until a new one replaces it;
 * there is no "remove cover" (the backend has no such operation: omitting keeps the cover).
 */
export function CoverField({
	file,
	onChange,
	existingUrl,
	error,
}: {
	file: File | null
	onChange: (file: File | null) => void
	existingUrl?: string | null
	error?: string
}) {
	const id = useId()
	const input = useRef<HTMLInputElement>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	useEffect(() => {
		if (!file) {
			setPreviewUrl(null)
			return
		}
		const url = URL.createObjectURL(file)
		setPreviewUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [file])

	const problem = file ? validateCoverFile(file) : null
	const shown = previewUrl ?? existingUrl ?? null

	return (
		<div className="flex flex-col gap-2">
			<p className={SECTION_TITLE}>Thumbnail</p>
			<div className="relative flex aspect-[352/132] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted">
				{shown ? (
					// blob: previews and unverified media hosts are not run through the image optimizer
					<Image
						src={shown}
						alt={file ? "Selected thumbnail preview" : "Current thumbnail"}
						fill
						unoptimized
						sizes="400px"
						className="object-cover"
					/>
				) : (
					<ImagePlus size={28} className="text-muted-foreground" aria-hidden />
				)}
			</div>
			<div className="flex flex-wrap items-center gap-2.5">
				<input
					ref={input}
					id={id}
					type="file"
					accept="image/jpeg,image/png"
					className="sr-only"
					aria-describedby={error || problem ? `${id}-error` : `${id}-hint`}
					onChange={(e) => {
						const next = e.target.files?.[0] ?? null
						onChange(next)
						// choosing the same file again must still fire a change event
						e.target.value = ""
					}}
				/>
				<button type="button" className={secondaryButton} onClick={() => input.current?.click()}>
					<ImagePlus size={13} aria-hidden />
					{file || existingUrl ? "Replace thumbnail" : "Add thumbnail"}
				</button>
				{file && (
					<button type="button" className={secondaryButton} onClick={() => onChange(null)}>
						<X size={13} aria-hidden />
						Remove selection
					</button>
				)}
			</div>
			<FieldMessages
				id={id}
				hint="JPEG or PNG, up to 2 MB."
				error={error ?? problem ?? undefined}
			/>
		</div>
	)
}
