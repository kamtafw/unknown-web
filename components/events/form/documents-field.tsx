"use client"

import {
	DOCUMENT_MAX_BYTES,
	DOCUMENT_MIME_TYPES,
	MAX_DOCUMENT_NAME_LENGTH,
	MAX_DOCUMENTS,
} from "@/lib/events/constants"
import type { DocumentsChange, EventDocument } from "@/types/events/api"
import { FileText, Plus, Trash2 } from "lucide-react"
import { useId, useRef } from "react"
import { secondaryButton } from "../event-list"
import { FieldMessages, INPUT, SECTION_TITLE } from "./fields"

function sizeLabel(bytes: number): string {
	return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** a sensible display name from the file name ("Menu.pdf" → "Menu") */
function nameFromFile(file: File): string {
	return file.name.replace(/\.[^.]+$/, "").slice(0, MAX_DOCUMENT_NAME_LENGTH)
}

const MODES: { mode: DocumentsChange["mode"]; label: string }[] = [
	{ mode: "keep", label: "Keep the current documents" },
	{ mode: "replace", label: "Replace all documents" },
	{ mode: "clear", label: "Remove all documents" },
]

/**
 * Documents. The backend can only keep the whole set (omit it), replace the whole set (upload
 * again) or clear it, and an already-stored file cannot be sent back, so an edit offers exactly
 * those three choices and says so. Existing documents are listed by name only: viewing and
 * managing them is Pass 3. A new event simply has an upload list.
 */
export function DocumentsField({
	mode,
	existing,
	value,
	onChange,
	errors,
	error,
}: {
	mode: "create" | "edit"
	existing: EventDocument[]
	value: DocumentsChange
	onChange: (value: DocumentsChange) => void
	errors: Record<string, string>
	error?: string
}) {
	const id = useId()
	const picker = useRef<HTMLInputElement>(null)
	const items = value.mode === "replace" ? value.items : []
	const showUploader = mode === "create" || value.mode === "replace"
	const setItems = (next: typeof items) => onChange({ mode: "replace", items: next })

	return (
		<section aria-labelledby={`${id}-title`} className="flex flex-col gap-3">
			<h2 id={`${id}-title`} className={SECTION_TITLE}>
				Documents
			</h2>

			{mode === "edit" && (
				<>
					{existing.length > 0 ? (
						<ul aria-label="Current documents" className="flex flex-col gap-1.5">
							{existing.map((doc) => (
								<li key={doc.url} className="flex items-center gap-2 text-[13px] text-foreground">
									<FileText size={14} className="shrink-0 text-primary" aria-hidden />
									<span className="truncate">{doc.name}</span>
								</li>
							))}
						</ul>
					) : (
						<p className="text-[12.5px] text-muted-foreground">This event has no documents.</p>
					)}
					<div role="radiogroup" aria-label="What to do with documents" className="flex flex-col gap-1.5">
						{MODES.map((opt) => (
							<label key={opt.mode} className="flex items-center gap-2 text-[13px] text-foreground">
								<input
									type="radio"
									name={`${id}-mode`}
									checked={value.mode === opt.mode}
									onChange={() =>
										onChange(opt.mode === "replace" ? { mode: "replace", items } : ({ mode: opt.mode } as DocumentsChange))
									}
									className="size-4 accent-[var(--primary)]"
								/>
								{opt.label}
							</label>
						))}
					</div>
					{value.mode !== "keep" && (
						<p role="note" className="rounded-xl bg-muted px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
							{value.mode === "replace"
								? "Saving replaces every current document with the files you add below. Current files can't be kept one by one."
								: "Saving removes every current document."}
						</p>
					)}
				</>
			)}

			{showUploader && (
				<>
					{items.map((item, i) => {
						const nameError = errors[`documents.${i}.name`]
						const fileError = errors[`documents.${i}.file`]
						return (
							<fieldset key={i} className="flex flex-col gap-2 rounded-xl border border-border p-3">
								<legend className="px-1 text-[12px] font-semibold text-muted-foreground">Document {i + 1}</legend>
								<input
									aria-label={`Document ${i + 1} name`}
									type="text"
									value={item.name}
									maxLength={MAX_DOCUMENT_NAME_LENGTH}
									placeholder="Name"
									className={INPUT}
									aria-invalid={nameError ? true : undefined}
									aria-describedby={nameError ? `${id}-${i}-name-error` : undefined}
									onChange={(e) => setItems(items.map((it, idx) => (idx === i ? { ...it, name: e.target.value } : it)))}
								/>
								{nameError && (
									<p id={`${id}-${i}-name-error`} role="alert" className="text-[12px] font-medium text-destructive">
										{nameError}
									</p>
								)}
								<p className="flex items-center gap-2 text-[12px] text-muted-foreground">
									<FileText size={13} aria-hidden />
									<span className="truncate">
										{item.file.name} · {sizeLabel(item.file.size)}
									</span>
								</p>
								{fileError && (
									<p role="alert" className="text-[12px] font-medium text-destructive">
										{fileError}
									</p>
								)}
								<div>
									<button type="button" className={secondaryButton} onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
										<Trash2 size={13} aria-hidden />
										Remove document {i + 1}
									</button>
								</div>
							</fieldset>
						)
					})}
					<div>
						<input
							ref={picker}
							type="file"
							multiple
							accept={DOCUMENT_MIME_TYPES.join(",")}
							className="sr-only"
							aria-label="Choose documents to upload"
							onChange={(e) => {
								const files = Array.from(e.target.files ?? [])
								e.target.value = ""
								if (files.length === 0) return
								setItems([...items, ...files.map((file) => ({ name: nameFromFile(file), file }))])
							}}
						/>
						<button
							type="button"
							className={secondaryButton}
							disabled={items.length >= MAX_DOCUMENTS}
							onClick={() => picker.current?.click()}
						>
							<Plus size={13} aria-hidden />
							{items.length === 0 ? "Add documents" : "Add another document"}
						</button>
					</div>
					<p className="text-[12px] text-muted-foreground">
						Up to {MAX_DOCUMENTS} documents, {DOCUMENT_MAX_BYTES / (1024 * 1024)} MB each.
					</p>
				</>
			)}
			<FieldMessages id={id} error={error} />
		</section>
	)
}
