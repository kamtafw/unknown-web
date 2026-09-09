"use client"

import type { MentionAutocompleteState } from "@/hooks/use-mention-autocomplete"
import { getInitials } from "@/lib/utils"
import { MentionUser } from "@/types/socials/api"
import { Loader2 } from "lucide-react"
import { Avatar, Popover } from "radix-ui"

function HighlightMatch({ text, query }: { text: string; query: string }) {
	if (!query) return <>{text}</>
	const idx = text.toLowerCase().indexOf(query.toLowerCase())
	if (idx === -1) return <>{text}</>
	return (
		<>
			{text.slice(0, idx)}
			<span className="text-foreground">{text.slice(idx, idx + query.length)}</span>
			{text.slice(idx + query.length)}
		</>
	)
}

function MentionRow({
	user,
	query,
	active,
	onSelect,
	onHover,
}: {
	user: MentionUser
	query: string
	active: boolean
	onSelect: () => void
	onHover: () => void
}) {
	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username

	return (
		<button
			type="button"
			role="option"
			aria-selected={active}
			onPointerDown={(e) => e.preventDefault()} // keep the textarea focused on click
			onMouseEnter={onHover}
			onClick={onSelect}
			className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
				active ? "bg-accent" : "hover:bg-accent/60"
			}`}
		>
			<Avatar.Root className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-primary/15">
				<Avatar.Image
					src={user.profile_photo ?? undefined}
					alt={displayName}
					className="w-full h-full object-cover"
				/>
				<Avatar.Fallback className="w-full h-full flex items-center justify-center text-[11px] font-bold text-primary">
					{getInitials(user.first_name, user.last_name)}
				</Avatar.Fallback>
			</Avatar.Root>
			<div className="min-w-0 flex-1">
				<p className="text-[13px] font-semibold text-foreground truncate leading-tight">
					{displayName}
				</p>
				<p className="text-[12px] text-muted-foreground truncate">
					@<HighlightMatch text={user.username} query={query} />
				</p>
			</div>
			{user.youFollowThisUser && (
				<span className="shrink-0 text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full leading-none">
					Following
				</span>
			)}
		</button>
	)
}

/**
 * Renders as a Radix Popover anchored to the caret's live pixel position (see
 * use-mention-autocomplete + lib/caret-position). Must be rendered directly
 * after the <textarea>, inside a `position: relative` wrapper — the anchor
 * math assumes the textarea's offsetParent is that wrapper.
 */
export function MentionAutocomplete({ mention }: { mention: MentionAutocompleteState }) {
	const {
		active,
		results,
		isLoading,
		query,
		selectedIndex,
		setSelectedIndex,
		selectMention,
		caretPixels,
		close,
	} = mention

	return (
		<Popover.Root open={active} onOpenChange={(open) => !open && close()}>
			<Popover.Anchor asChild>
				<span
					className="absolute w-px pointer-events-none"
					style={{
						top: caretPixels?.top ?? 0,
						left: caretPixels?.left ?? 0,
						height: caretPixels?.height ?? 20,
					}}
				/>
			</Popover.Anchor>

			<Popover.Portal>
				<Popover.Content
					side="bottom"
					align="start"
					sideOffset={6}
					collisionPadding={12}
					onOpenAutoFocus={(e) => e.preventDefault()}
					onCloseAutoFocus={(e) => e.preventDefault()}
					role="listbox"
					style={{ maxHeight: "min(18rem, var(--radix-popover-content-available-height, 18rem))" }}
					className="
						z-100 w-72 rounded-2xl border border-border bg-popover shadow-2xl
						flex flex-col overflow-hidden
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
						data-[side=bottom]:slide-in-from-top-1
						data-[side=top]:slide-in-from-bottom-1
					"
				>
					{isLoading && results.length === 0 ? (
						<div className="flex items-center justify-center gap-2 px-4 py-6 text-muted-foreground">
							<Loader2 size={14} className="animate-spin" />
							<span className="text-[12.5px]">Searching…</span>
						</div>
					) : results.length === 0 ? (
						<div className="px-4 py-6 text-center">
							<p className="text-[12.5px] text-muted-foreground">
								No one found for &ldquo;{query}&rdquo;
							</p>
						</div>
					) : (
						<div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-1 [&::-webkit-scrollbar]:hidden">
							{results.map((user, i) => (
								<MentionRow
									key={user.id}
									user={user}
									query={query}
									active={i === selectedIndex}
									onSelect={() => selectMention(user)}
									onHover={() => setSelectedIndex(i)}
								/>
							))}
						</div>
					)}
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	)
}
