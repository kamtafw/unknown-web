import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useChatListActions } from "@/hooks/messenger/use-chat-list-actions"
import {
	useReportUser,
	useUserAttachments,
	useUserProfile,
} from "@/hooks/messenger/use-user-profile"
import { extractMessage } from "@/lib/api-error"
import { getDisplayName } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { cn, getInitials } from "@/lib/utils"
import { Pkid, ReportUserReason, Uuid } from "@/types/messenger"
import {
	Ban,
	FileText,
	Flag,
	ImageIcon,
	Link as LinkIcon,
	MessageSquare,
	MoreHorizontal,
	Phone,
	Share2,
	X,
} from "lucide-react"
import Image from "next/image"
import { Avatar } from "radix-ui"
import { useState } from "react"

interface ProfilePanelProps {
	peerUuid: Uuid
	onClose: () => void
}

const REPORT_REASONS: { value: ReportUserReason; label: string }[] = [
	{ value: "misuse_of_the_platform", label: "Misuse of the platform" },
	{ value: "bullying_or_harassment", label: "Bullying or harassment" },
	{ value: "violation_of_community_rules", label: "Violation of community rules" },
	{ value: "other", label: "Other" },
]

function ProfileAction({
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
			className="flex-1 min-w-0 flex flex-col items-center gap-1.5 rounded-xl border border-border py-3 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
		>
			<Icon size={20} className="text-muted-foreground" />
			<span className="text-sm text-muted-foreground font-medium">{label}</span>
		</button>
	)
}

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
		return <p className="text-sm text-muted-foreground text-center py-5">Loading…</p>
	}

	if (type === "media") {
		const media = items.flatMap((item, i) =>
			(item.media ?? []).map((m, j) => ({ id: `${item.id}-${i}-${j}`, ...m })),
		)
		if (media.length === 0) {
			return <p className="text-sm text-muted-foreground text-center py-5">No media yet</p>
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
			return <p className="text-sm text-muted-foreground text-center py-5">No documents yet</p>
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
		return <p className="text-sm text-muted-foreground text-center py-5">No links yet</p>
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

export function ProfilePanel({ peerUuid, onClose }: ProfilePanelProps) {
	const [tab, setTab] = useState<"media" | "doc" | "link">("media")
	const [reportOpen, setReportOpen] = useState(false)

	const { data: profile, isLoading } = useUserProfile(peerUuid)
	const { block, unblock } = useChatListActions()

	const user = profile?.user
	const name = user ? getDisplayName(user) : "Contact"
	const peerPkid = user?.pkid ?? (0 as Pkid)
	const isBlocked = user?.is_blocked ?? false

	const run = async (action: () => Promise<unknown>) => {
		try {
			await action()
		} catch (err) {
			toast.error(extractMessage(err, "That didn't go through — try again"))
		}
	}

	return (
		<>
			<aside className="flex h-full w-full min-w-0 flex-col border-l bg-background">
				{/* Header */}
				<div className="flex h-14 shrink-0 items-center border-b px-4">
					<h2 className="text-base font-medium">Contact info</h2>

					<button
						type="button"
						onClick={onClose}
						aria-label="Close contact info"
						className="ml-auto rounded-full p-2 transition-colors hover:bg-accent"
					>
						<X size={20} strokeWidth={2} />
					</button>
				</div>

				{/* Scrollable content */}
				<div className="min-h-0 flex-1 overflow-y-auto">
					{/* Profile identity */}
					<section className="flex flex-col items-center px-5 py-7">
						<Avatar.Root className="h-32 w-32 overflow-hidden rounded-full bg-muted">
							<Avatar.Image
								src={user?.profile_photo || undefined}
								alt={name}
								className="h-full w-full object-cover"
							/>

							<Avatar.Fallback className="text-2xl font-medium">
								{user ? getInitials(user.first_name, user.last_name) : "?"}
							</Avatar.Fallback>
						</Avatar.Root>

						<h3 className="mt-4 text-xl font-medium">{name}</h3>

						{user?.username && <p className="mt-0.5 text-xs text-foreground">@{user.username}</p>}

						{user?.phone_number && (
							<p className="mt-1 text-sm text-foreground">{user.phone_number}</p>
						)}

						{isLoading && <p className="mt-2 text-xs text-muted-foreground">Loading profile…</p>}
					</section>

					{/* Quick actions */}
					<div className="grid grid-cols-2 px-3 gap-2">
						<ProfileAction icon={MessageSquare} label="Message" />
						<ProfileAction icon={Share2} label="Share" />
					</div>

					{/* Media / links / docs */}
					<section className="border-b">
						<button
							type="button"
							className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent"
						>
							<ImageIcon size={18} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />

							<div className="min-w-0 flex-1">
								<p className="text-sm">Media, links and docs</p>
							</div>

							<MoreHorizontal size={18} className="text-muted-foreground" />
						</button>

						{/* Attachment type selector */}
						<div className="px-5 pb-3">
							<div className="flex w-full rounded-full bg-muted p-1">
								{(["media", "doc", "link"] as const).map((type) => (
									<button
										key={type}
										type="button"
										onClick={() => setTab(type)}
										className={cn(
											"flex-1 rounded-full px-3 py-1.5 text-xs transition-colors",
											tab === type
												? "bg-background shadow-sm"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										{type === "doc" ? "Docs" : type === "link" ? "Links" : "Media"}
									</button>
								))}
							</div>

							<div className="mt-3">
								<AttachmentTab uuid={peerUuid} type={tab} />
							</div>
						</div>
					</section>

					{/* Destructive actions */}
					<div className="divide-y">
						<button
							type="button"
							className="flex w-full items-center gap-4 px-5 py-3 text-left text-sm text-destructive hover:bg-accent"
							onClick={() =>
								run(() => (isBlocked ? unblock(peerUuid, peerPkid) : block(peerUuid, peerPkid)))
							}
						>
							<Ban size={18} />
							<span>{isBlocked ? `Unblock ${name}` : `Block ${name}`}</span>
						</button>

						<button
							type="button"
							className="flex w-full items-center gap-4 px-5 py-3 text-left text-sm text-primary hover:bg-accent"
							onClick={() => setReportOpen(true)}
						>
							<Flag size={18} />
							<span>{`Report ${name}`}</span>
						</button>
					</div>
				</div>
			</aside>

			<ReportUserDialog
				peerUuid={peerUuid}
				name={name}
				open={reportOpen}
				onOpenChange={setReportOpen}
			/>
		</>
	)
}
