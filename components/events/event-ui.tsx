import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/**
 * Presentation primitives shared by the Events screens. Only class names and markup live here:
 * no state, no data and no behaviour, so every control that uses them keeps its own handlers,
 * disabled / loading states and accessible names.
 */

const BUTTON_BASE =
	"inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0"

const SIZE_DEFAULT = "h-9 px-4 text-[12.5px]"
const SIZE_SMALL = "h-8 px-3 text-[12px]"
const SIZE_LARGE = "h-11 px-6 text-[13.5px]"

/** the standard action: one per surface */
export const primaryButton = cn(
	BUTTON_BASE,
	SIZE_DEFAULT,
	"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
)

/** the quieter, outlined action */
export const secondaryButton = cn(
	BUTTON_BASE,
	SIZE_DEFAULT,
	"border border-border bg-card text-foreground hover:bg-muted",
)

/** a destructive action that is not yet confirmed (outlined) */
export const destructiveOutlineButton = cn(
	BUTTON_BASE,
	SIZE_DEFAULT,
	"border border-destructive/40 bg-card text-destructive hover:bg-destructive/10 focus-visible:ring-destructive",
)

/** the confirming button of a destructive dialog */
export const destructiveButton = cn(
	BUTTON_BASE,
	SIZE_DEFAULT,
	"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive",
)

/** borderless, for row-level actions */
export const ghostButton = cn(
	BUTTON_BASE,
	SIZE_SMALL,
	"text-muted-foreground hover:bg-muted hover:text-foreground",
)

/** borderless destructive, for row-level actions such as removing a guest */
export const ghostDestructiveButton = cn(
	BUTTON_BASE,
	SIZE_SMALL,
	"text-destructive hover:bg-destructive/10 focus-visible:ring-destructive",
)

/** size modifiers; apply after a variant so the height and padding win */
export const buttonSmall = SIZE_SMALL
export const buttonLarge = SIZE_LARGE

/** a bordered surface; the single container look used by Events panels */
export const panel = "rounded-2xl border border-border bg-card p-4 shadow-xs"

/** a soft, borderless surface for secondary information */
export const insetPanel = "rounded-xl bg-muted/60 px-3.5 py-3"

export const sectionHeading = "text-[14px] font-bold leading-tight text-foreground"

export const fieldInput =
	"h-10 w-full rounded-xl border border-border bg-card px-3.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive"

export const fieldTextarea =
	"w-full resize-none rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary aria-[invalid=true]:border-destructive"

type Tone = "neutral" | "live" | "success" | "warning" | "danger"

const TONE: Record<Tone, { pill: string; dot: string }> = {
	neutral: { pill: "bg-muted text-foreground", dot: "bg-muted-foreground/60" },
	live: { pill: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
	success: {
		pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
		dot: "bg-emerald-500",
	},
	warning: { pill: "bg-amber-500/10 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
	danger: { pill: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
}

/** a small status pill with an optional leading dot (pulsing for live states) */
export function StatusPill({
	tone = "neutral",
	dot = false,
	pulse = false,
	children,
	className,
}: {
	tone?: Tone
	dot?: boolean
	pulse?: boolean
	children: ReactNode
	className?: string
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none",
				TONE[tone].pill,
				className,
			)}
		>
			{dot && (
				<span aria-hidden className="relative flex size-1.5">
					{pulse && (
						<span
							className={cn(
								"absolute inline-flex size-full animate-ping rounded-full opacity-60",
								TONE[tone].dot,
							)}
						/>
					)}
					<span className={cn("relative inline-flex size-1.5 rounded-full", TONE[tone].dot)} />
				</span>
			)}
			{children}
		</span>
	)
}

/** circular initials / photo holder; the photo is supplied by the caller (Radix Avatar or Image) */
export const avatarShell =
	"flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary"

/** a tinted square that holds a state or section icon */
export function IconBadge({
	children,
	tone = "primary",
	className,
}: {
	children: ReactNode
	tone?: "primary" | "danger" | "muted"
	className?: string
}) {
	return (
		<span
			aria-hidden
			className={cn(
				"flex size-9 shrink-0 items-center justify-center rounded-full",
				tone === "primary" && "bg-primary/10 text-primary",
				tone === "danger" && "bg-destructive/10 text-destructive",
				tone === "muted" && "bg-muted text-muted-foreground",
				className,
			)}
		>
			{children}
		</span>
	)
}
