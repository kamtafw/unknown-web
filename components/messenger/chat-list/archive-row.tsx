"use client"

import { useChatListActions } from "@/hooks/messenger/use-chat-list-actions"
import { extractMessage } from "@/lib/api-error"
import { resolveLocalChatPreview } from "@/lib/messenger/e2ee/local-preview"
import { resolveEncryptedPreviewFallback } from "@/lib/messenger/preview"
import { chatKeys } from "@/lib/messenger/query-keys"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { ArchiveEntry, ArchiveTarget, Pkid, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import { ArchiveRestore } from "lucide-react"
import Link from "next/link"
import { Avatar } from "radix-ui"
import { useEffect, useState } from "react"

function formatTimestamp(iso: string | null): string {
	if (!iso) return ""
	return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

/** Shared by the row and the panel's client-side search filter. */
export function resolveArchiveTargetName(target: ArchiveTarget): string {
	return target.chat_type === "group" ? target.name : getDisplayName(target)
}

interface ArchiveRowProps {
	entry: ArchiveEntry
}

/**
 * The current archive response may omit `last_message_type` and `last_message_id`;
 * both are optional until the backend contract proposal is reviewed. User rows
 * use a safe E2EE fallback when metadata is absent. Group preview behavior stays
 * unchanged because group E2EE is outside the current protocol.
 *
 * Unarchive is user-only: chatApi.unarchive only ever takes a userPkid,
 * no confirmed group equivalent exists. Group rows get an inert button
 * instead of a fabricated call, same InertIconButton convention used
 * elsewhere (Call/Share on ProfileDialog).
 */
export function ArchiveRow({ entry }: ArchiveRowProps) {
	const { target } = entry
	const queryClient = useQueryClient()
	const { unarchive } = useChatListActions()
	const isUser = target.chat_type === "user"
	const name = resolveArchiveTargetName(target)
	const href = isUser ? `/messenger/${target.id}` : `/messenger/groups/${target.id}`
	const accountId = useAuthStore((s) => (s.user ? (s.user.pkid as Pkid) : null))
	const [userPreview, setUserPreview] = useState<{
		accountId: number
		targetId: string
		lastMessageTime: string | null
		lastMessageId: number | null | undefined
		preview: string
	} | null>(null)

	useEffect(() => {
		if (target.chat_type !== "user" || !accountId) {
			setUserPreview(null)
			return
		}
		let cancelled = false
		void resolveLocalChatPreview(
			accountId as Pkid,
			target.pkid as Pkid,
			target.last_message_preview,
			target.last_message_time,
			target.last_message_type,
			target.last_message_id,
		)
			.then((preview) => {
				if (!cancelled)
					setUserPreview({
						accountId,
						targetId: target.id,
						lastMessageTime: target.last_message_time,
						lastMessageId: target.last_message_id,
						preview,
					})
			})
			.catch(() => {
				if (!cancelled) setUserPreview(null)
			})
		return () => {
			cancelled = true
		}
	}, [accountId, target])
	const resolvedUserPreview =
		userPreview?.accountId === accountId &&
		userPreview.targetId === target.id &&
		userPreview.lastMessageTime === target.last_message_time &&
		userPreview.lastMessageId === target.last_message_id
			? userPreview.preview
			: (resolveEncryptedPreviewFallback(
					Boolean(
						target.last_message_preview ||
						target.last_message_time ||
						target.last_message_type ||
						target.last_message_id != null,
					),
					target.last_message_type,
				) ?? "Preview unavailable")
	const previewText = isUser
		? resolvedUserPreview
		: target.last_message_preview || "No messages yet"
	const handleUnarchive = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (!isUser) {
			toast.info("Unarchiving groups isn't available yet")
			return
		}
		try {
			await unarchive(target.pkid as Pkid)
			queryClient.invalidateQueries({ queryKey: chatKeys.archiveList() })
		} catch (err) {
			toast.error(extractMessage(err, "Couldn't unarchive — try again"))
		}
	}

	// Primes the peer cache the same way NewChatDialog/CustomListMemberRow
	// do, so ConversationHeader has something to render immediately —
	// mapped into PeerDisplay's minimal shape (icon_url -> profile_photo),
	// not force-fit into ChatListItem, since this payload has no
	// is_pinned/is_blocked/is_muted to lie about having.
	const handleClick = () => {
		if (!isUser) return
		queryClient.setQueryData(chatKeys.peer(target.id as Uuid), {
			id: target.id,
			pkid: target.pkid,
			first_name: target.first_name,
			last_name: target.last_name,
			username: target.username,
			profile_photo: target.icon_url,
		})
	}

	return (
		<Link
			href={href}
			onClick={handleClick}
			className="group relative flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
		>
			<Avatar.Root className="h-11 w-11 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
				<Avatar.Image src={target.icon_url} alt={name} className="h-full w-full object-cover" />
				<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
					{isUser ? getInitials(target.first_name, target.last_name) : name.charAt(0).toUpperCase()}
				</Avatar.Fallback>
			</Avatar.Root>

			<div className="min-w-0 flex-1 transition-[padding-right] group-hover:pr-9">
				<div className="flex items-baseline justify-between gap-2">
					<span className="font-semibold text-sm truncate">{name}</span>
					<span className="text-xs text-muted-foreground shrink-0">
						{formatTimestamp(target.last_message_time)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-2 mt-0.5">
					<span className="text-sm text-muted-foreground truncate">{previewText}</span>
					{target.unread_count > 0 && (
						<span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
							{target.unread_count > 99 ? "99+" : target.unread_count}
						</span>
					)}
				</div>
			</div>

			<button
				onClick={handleUnarchive}
				title="Unarchive"
				className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent"
			>
				<ArchiveRestore size={16} />
			</button>
		</Link>
	)
}
