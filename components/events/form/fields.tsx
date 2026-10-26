"use client"

import { cn } from "@/lib/utils"
import { Calendar,Clock } from "lucide-react"
import type { ReactNode } from "react"

/** text input look shared with the Events search field (white, 1 px border, blue focus) */
export const INPUT =
	"h-[45px] w-full rounded-xl border border-border bg-card px-4 text-[14px] text-foreground outline-none caret-primary placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive"

export const SECTION_TITLE = "text-[14px] font-bold text-foreground"

export function describedBy(
	id: string,
	opts: { hint?: string; error?: string },
): string | undefined {
	const ids = [opts.error ? `${id}-error` : null, opts.hint ? `${id}-hint` : null].filter(Boolean)
	return ids.length ? ids.join(" ") : undefined
}

export function FieldMessages({ id, hint, error }: { id: string; hint?: string; error?: string }) {
	return (
		<>
			{hint && (
				<p id={`${id}-hint`} className="text-[12px] leading-relaxed text-muted-foreground">
					{hint}
				</p>
			)}
			{error && (
				<p id={`${id}-error`} role="alert" className="text-[12px] font-medium text-destructive">
					{error}
				</p>
			)}
		</>
	)
}

/** label + control + hint + inline error; the control receives its own id / aria wiring */
export function FormField({
	id,
	label,
	optional,
	hint,
	error,
	children,
}: {
	id: string
	label: string
	optional?: boolean
	hint?: string
	error?: string
	children: ReactNode
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={id} className="text-[13px] font-semibold text-foreground">
				{label}
				{optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
			</label>
			{children}
			<FieldMessages id={id} hint={hint} error={error} />
		</div>
	)
}

/** `2026-11-01` → `01 - 11 - 2026` without a Date object, so no timezone can shift it */
function displayDate(value: string): string {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
	return m ? `${m[3]} - ${m[2]} - ${m[1]}` : ""
}

/**
 * Date or time in the pill look of the Create event design ("DD - MM - YYYY", "8:00"). The native
 * input is kept visible inside the pill (typeable, keyboard- and screen-reader-accessible) rather
 * than hidden behind a text overlay (assumption A-12). Values are `YYYY-MM-DD` / `HH:MM` and are
 * never converted through a timezone.
 */
export function DateTimeField({
	id,
	label,
	kind,
	value,
	onChange,
	error,
}: {
	id: string
	label: string
	kind: "date" | "time"
	value: string
	onChange: (value: string) => void
	error?: string
}) {
	const Icon = kind === "date" ? Calendar : Clock
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-1.5">
			<label htmlFor={id} className="text-[13px] font-semibold text-foreground">
				{label}
			</label>
			<div
				className={cn(
					"flex h-[45px] items-center gap-2 rounded-xl border bg-card px-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
					error ? "border-destructive" : "border-border",
				)}
			>
				<Icon size={16} className="shrink-0 text-primary" aria-hidden />
				<input
					id={id}
					type={kind}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? `${id}-error` : undefined}
					title={kind === "date" ? displayDate(value) || "DD - MM - YYYY" : undefined}
					className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none"
				/>
			</div>
			{error && (
				<p id={`${id}-error`} role="alert" className="text-[12px] font-medium text-destructive">
					{error}
				</p>
			)}
		</div>
	)
}
