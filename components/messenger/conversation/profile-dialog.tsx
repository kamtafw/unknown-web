"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useChatListActions } from "@/hooks/messenger/use-chat-list-actions"
import {
	useReportUser,
	useUserAttachments,
	useUserProfile,
} from "@/hooks/messenger/use-user-profile"
import { extractMessage } from "@/lib/api-error"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { Pkid, ReportUserReason, Uuid } from "@/types/messenger"
import {
	Ban,
	Bell,
	BellOff,
	FileText,
	Link as LinkIcon,
	MessageCircle,
	MoreVertical,
	Phone,
	Share2,
} from "lucide-react"
import Image from "next/image"
import { Avatar, DropdownMenu } from "radix-ui"
import { useState } from "react"

interface ProfileDialogProps {
	peerUuid: Uuid
	peerPkid: Pkid
	open: boolean
	onOpenChange: (open: boolean) => void
	onMessage?: () => void
}

const menuItemClass =
	"flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm transition-colors hover:bg-accent data-highlighted:bg-accent"

const REPORT_REASONS: { value: ReportUserReason; label: string }[] = [
	{ value: "misuse_of_the_platform", label: "Misuse of the platform" },
	{ value: "bullying_or_harassment", label: "Bullying or harassment" },
	{ value: "violation_of_community_rules", label: "Violation of community rules" },
	{ value: "other", label: "Other" },
]

function QuickAction({
	label,
	icon: Icon,
	onClick,
	disabled,
	title,
}: {
	label: string
	icon: typeof Phone
	onClick?: () => void
	disabled?: boolean
	title?: string
}) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			title={title}
			className="flex-1 flex flex-col items-center gap-1.5 rounded-xl border border-border py-3 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
		>
			<Icon size={19} className={disabled ? "text-muted-foreground/50" : "text-primary"} />
			<span className="text-xs font-medium">{label}</span>
		</button>
	)
}

/** Nested dialog, same precedent as GroupInfoDialog → AddGroupMembersDialog. */
function ReportUserDialog({
	peerUuid,
	name,
	open,
	onOpenChange,
}: {
	peerUuid: Uuid
	name: string
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const [reason, setReason] = useState<ReportUserReason>("other")
	const [description, setDescription] = useState("")
	const reportUser = useReportUser(peerUuid)

	const handleSubmit = async () => {
		try {
			await reportUser.mutateAsync({
				reason,
				description: description.trim() || undefined,
				block_and_delete: false,
			})
			onOpenChange(false)
			setDescription("")
			setReason("other")
		} catch (err) {
			toast.error(extractMessage(err, "Couldn't submit report — try again"))
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Report {name}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-1">
					{REPORT_REASONS.map((r) => (
						<button
							key={r.value}
							onClick={() => setReason(r.value)}
							className="flex items-center gap-3 px-1 py-2 text-left"
						>
							<span
								className={cn(
									"h-4 w-4 rounded-full border-2 shrink-0",
									reason === r.value ? "border-primary bg-primary" : "border-border",
								)}
							/>
							<span className="text-sm">{r.label}</span>
						</button>
					))}
				</div>

				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Additional details (optional)"
					rows={3}
					className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none resize-none"
				/>

				<button
					onClick={handleSubmit}
					disabled={reportUser.isPending}
					className="w-full py-2.5 rounded-full bg-destructive text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
				>
					{reportUser.isPending ? "Submitting…" : "Submit report"}
				</button>
			</DialogContent>
		</Dialog>
	)
}

const URL_REGEX = /https?:\/\/[^\s)]+/i

function AttachmentTab({ uuid, type }: { uuid: Uuid; type: "media" | "doc" | "link" }) {
	const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useUserAttachments(
		uuid,
		type,
	)

	if (isLoading) {
		return <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
	}

	if (type === "media") {
		const media = items.flatMap((item, i) =>
			(item.media ?? []).map((m, j) => ({ id: `${item.id}-${i}-${j}`, ...m })),
		)
		if (media.length === 0) {
			return <p className="text-sm text-muted-foreground text-center py-8">No media yet</p>
		}
		return (
			<div className="grid grid-cols-3 gap-1">
				{media.map((m) => (
					<div key={m.id} className="relative aspect-square bg-muted rounded-md overflow-hidden">
						{m.type === "image" && (
							<Image src={m.url} alt={m.caption ?? "Media"} fill className="object-cover" />
						)}
					</div>
				))}
				{hasNextPage && (
					<button
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="col-span-3 py-2 text-xs font-medium text-primary"
					>
						{isFetchingNextPage ? "Loading…" : "Load more"}
					</button>
				)}
			</div>
		)
	}

	if (type === "doc") {
		const docs = items.flatMap((item) => item.media ?? [])
		if (docs.length === 0) {
			return <p className="text-sm text-muted-foreground text-center py-8">No documents yet</p>
		}
		return (
			<div className="flex flex-col">
				{docs.map((d, i) => (
					<a
						key={i}
						href={d.url}
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-3 px-1 py-2.5 hover:bg-accent rounded-lg transition-colors"
					>
						<FileText size={18} className="text-muted-foreground shrink-0" />
						<span className="text-sm truncate">{d.caption || d.url.split("/").pop()}</span>
					</a>
				))}
				{hasNextPage && (
					<button
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="py-2 text-xs font-medium text-primary"
					>
						{isFetchingNextPage ? "Loading…" : "Load more"}
					</button>
				)}
			</div>
		)
	}

	// links — no `media` entries; the URL lives in `content`
	const links = items
		.map((item) => ({ id: item.id, url: item.content.match(URL_REGEX)?.[0], text: item.content }))
		.filter((l): l is { id: number; url: string; text: string } => !!l.url)

	if (links.length === 0) {
		return <p className="text-sm text-muted-foreground text-center py-8">No links yet</p>
	}
	return (
		<div className="flex flex-col">
			{links.map((l) => (
				<a
					key={l.id}
					href={l.url}
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-3 px-1 py-2.5 hover:bg-accent rounded-lg transition-colors"
				>
					<LinkIcon size={18} className="text-muted-foreground shrink-0" />
					<span className="text-sm text-primary truncate">{l.url}</span>
				</a>
			))}
			{hasNextPage && (
				<button
					onClick={() => fetchNextPage()}
					disabled={isFetchingNextPage}
					className="py-2 text-xs font-medium text-primary"
				>
					{isFetchingNextPage ? "Loading…" : "Load more"}
				</button>
			)}
		</div>
	)
}

/**
 * 1:1 Messenger profile (M4). Group profile is explicitly out of scope —
 * see MESSENGER.md. Share and Call are inert: no confirmed contract for
 * Share on either client, and Call has no backend/WebRTC contract until M8
 * — same InertIconButton precedent ConversationHeader already uses.
 *
 * Block/report state: `is_blocked`/`has_blocked_me` come from the profile
 * fetch (authoritative once loaded); mute state falls back to whatever's
 * cached on the chat-list row via usePeerProfile, since the profile
 * endpoint doesn't carry `is_muted`. Two block-state sources (this + the
 * chat-list menu) are a known, accepted duplication — see MESSENGER.md.
 */
export function ProfileDialog({ peerUuid, peerPkid, open, onOpenChange }: ProfileDialogProps) {
	const [tab, setTab] = useState<"media" | "doc" | "link">("media")
	const [reportOpen, setReportOpen] = useState(false)
	const { data: profile, isLoading } = useUserProfile(peerUuid)
	const { mute, unmute, block, unblock } = useChatListActions()

	const user = profile?.user
	const name = user ? getDisplayName(user) : "Contact"
	const isBlocked = user?.is_blocked ?? false
	const isMuted = false

	const run = async (action: () => Promise<unknown>) => {
		try {
			await action()
		} catch (err) {
			toast.error(extractMessage(err, "That didn't go through — try again"))
		}
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="sr-only">{name}</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col items-center gap-2 -mt-2">
						<Avatar.Root className="h-20 w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
							<Avatar.Image
								src={user?.profile_photo || undefined}
								alt={name}
								className="h-full w-full object-cover"
							/>
							<Avatar.Fallback className="text-xl font-medium text-muted-foreground">
								{user ? getInitials(user.first_name, user.last_name) : "?"}
							</Avatar.Fallback>
						</Avatar.Root>
						<p className="text-base font-semibold">{name}</p>
						{user?.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
						{user?.phone_number && (
							<p className="text-sm text-muted-foreground">{user.phone_number}</p>
						)}
						{isLoading && <p className="text-xs text-muted-foreground">Loading profile…</p>}
					</div>

					<div className="flex items-center gap-2">
						<QuickAction label="Message" icon={MessageCircle} onClick={() => onOpenChange(false)} />
						<QuickAction
							label="Call"
							icon={Phone}
							disabled
							title="Voice call — coming in a later milestone"
							onClick={() => toast.info("Voice call is coming in a later milestone")}
						/>
						<QuickAction
							label="Share"
							icon={Share2}
							disabled
							title="Share — coming in a later milestone"
							onClick={() => toast.info("Sharing a profile is coming in a later milestone")}
						/>
						<QuickAction
							label={isMuted ? "Unmute" : "Mute"}
							icon={isMuted ? Bell : BellOff}
							onClick={() =>
								run(() => (isMuted ? unmute(peerUuid, peerPkid) : mute(peerUuid, peerPkid)))
							}
						/>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button className="flex-1 flex flex-col items-center gap-1.5 rounded-xl border border-border py-3 hover:bg-accent transition-colors">
									<MoreVertical size={19} className="text-primary" />
									<span className="text-xs font-medium">More</span>
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Portal>
								<DropdownMenu.Content
									align="end"
									sideOffset={4}
									className="z-150 min-w-48 bg-popover border border-border rounded-2xl p-1.5 shadow-xl"
								>
									<DropdownMenu.Item
										className={menuItemClass + " text-destructive"}
										onSelect={() =>
											run(() =>
												isBlocked ? unblock(peerUuid, peerPkid) : block(peerUuid, peerPkid),
											)
										}
									>
										<Ban size={16} /> {isBlocked ? "Unblock contact" : "Block contact"}
									</DropdownMenu.Item>
									<DropdownMenu.Item className={menuItemClass} onSelect={() => setReportOpen(true)}>
										Report contact
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
					</div>

					<div className="flex w-full items-center gap-1 p-1 rounded-full bg-muted mt-2">
						{(["media", "doc", "link"] as const).map((t) => (
							<button
								key={t}
								onClick={() => setTab(t)}
								className={cn(
									"flex-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize",
									tab === t ? "bg-background shadow-sm" : "text-muted-foreground",
								)}
							>
								{t === "doc" ? "Docs" : t === "link" ? "Links" : "Media"}
							</button>
						))}
					</div>

					<div className="max-h-72 overflow-y-auto -mx-1 px-1">
						<AttachmentTab uuid={peerUuid} type={tab} />
					</div>
				</DialogContent>
			</Dialog>

			<ReportUserDialog
				peerUuid={peerUuid}
				name={name}
				open={reportOpen}
				onOpenChange={setReportOpen}
			/>
		</>
	)
}
