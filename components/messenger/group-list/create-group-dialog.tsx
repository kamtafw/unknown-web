"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useChatList } from "@/hooks/messenger/use-chat-list"
import { useCreateGroup } from "@/hooks/messenger/use-create-group"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { useAuthStore } from "@/stores/auth-store"
import type { ChatListItem } from "@/types/messenger"
import { ArrowLeft, Camera, Check, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar } from "radix-ui"
import { useState } from "react"
import { PermissionToggleRow } from "../group-conversation/permission-toggle-row"

interface CreateGroupDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/** Same fallback mobile itself uses when no photo is picked. Custom icon
 * upload is deferred — see MESSENGER.md; this app doesn't yet have a
 * confirmed generic media-upload utility wired up for Messenger. */
const DEFAULT_GROUP_ICON_URL =
	process.env.NEXT_PUBLIC_DEFAULT_GROUP_ICON_URL ??
	"https://appscombo.s3.amazonaws.com/media/profiles/images/profile.jpg"

/**
 * Ports mobile's two-screen create flow (new-group.tsx member picker →
 * group-settings.tsx name/icon/permissions) into a single two-step
 * dialog — the established web pattern for multi-step flows, rather than
 * mobile's two full-page routes. Same contract, web-appropriate container.
 *
 * Member source is the CHAT LIST (useChatList), not global user search —
 * confirmed via mobile: you can only add people you already have a
 * conversation with. Do not swap this for useSearchUsers.
 */
export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
	const router = useRouter()
	const currentUser = useAuthStore((s) => s.user)
	const [step, setStep] = useState<"members" | "details">("members")
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)
	const { data, isLoading } = useChatList("all", debouncedSearch)
	const [selected, setSelected] = useState<Map<number, ChatListItem>>(new Map())

	const [groupName, setGroupName] = useState("")
	const [canEditInfo, setCanEditInfo] = useState(false)
	const [canSendMessages, setCanSendMessages] = useState(false)
	const [canAddMembers, setCanAddMembers] = useState(false)
	const [requireApproval, setRequireApproval] = useState(false)

	const createGroup = useCreateGroup()

	const candidates = (data?.users ?? []).filter((u) => u.id !== currentUser?.id)

	const toggleMember = (user: ChatListItem) => {
		setSelected((prev) => {
			const next = new Map(prev)
			if (next.has(user.pkid)) next.delete(user.pkid)
			else next.set(user.pkid, user)
			return next
		})
	}

	const resetAndClose = () => {
		setStep("members")
		setSearch("")
		setSelected(new Map())
		setGroupName("")
		setCanEditInfo(false)
		setCanSendMessages(false)
		setCanAddMembers(false)
		setRequireApproval(false)
		onOpenChange(false)
	}

	const handleCreate = async () => {
		const name = groupName.trim()
		if (!name || selected.size === 0) return

		const created = await createGroup.mutateAsync({
			name,
			icon_url: DEFAULT_GROUP_ICON_URL,
			can_members_edit_info: canEditInfo,
			can_members_send_messages: canSendMessages,
			can_members_add_users: canAddMembers,
			admin_have_to_approve_new_members: requireApproval,
			members: Array.from(selected.values()).map((u) => ({
				user_id: u.pkid,
				role: "member" as const,
			})),
		})

		resetAndClose()
		router.push(`/messenger/groups/${created.id}`)
	}

	return (
		<Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : resetAndClose())}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-2">
						{step === "details" && (
							<button
								onClick={() => setStep("members")}
								className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
							>
								<ArrowLeft size={16} />
							</button>
						)}
						<DialogTitle>{step === "members" ? "New group" : "Group details"}</DialogTitle>
					</div>
				</DialogHeader>

				{step === "members" ? (
					<>
						<div className="relative">
							<Search
								size={16}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								autoFocus
								placeholder="Search your chats"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-9"
							/>
						</div>

						<div className="max-h-72 overflow-y-auto -mx-2">
							{isLoading && (
								<div className="space-y-1 px-2">
									{[...Array(4)].map((_, i) => (
										<div key={i} className="flex items-center gap-3 px-2 py-2">
											<Skeleton className="h-10 w-10 rounded-full" />
											<Skeleton className="h-4 w-32" />
										</div>
									))}
								</div>
							)}

							{!isLoading && candidates.length === 0 && (
								<p className="text-sm text-muted-foreground text-center py-8">
									No conversations to add from yet.
								</p>
							)}

							{candidates.map((user) => {
								const isSelected = selected.has(user.pkid)
								return (
									<button
										key={user.id}
										onClick={() => toggleMember(user)}
										className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors text-left"
									>
										<Avatar.Root className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
											<Avatar.Image
												src={user.profile_photo}
												alt={getDisplayName(user)}
												className="h-full w-full object-cover"
											/>
											<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
												{getInitials(user.first_name, user.last_name)}
											</Avatar.Fallback>
										</Avatar.Root>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium truncate">{getDisplayName(user)}</p>
											<p className="text-xs text-muted-foreground truncate">@{user.username}</p>
										</div>
										{isSelected && (
											<span className="shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
												<Check size={12} />
											</span>
										)}
									</button>
								)
							})}
						</div>

						<button
							onClick={() => setStep("details")}
							disabled={selected.size === 0}
							className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
						>
							Next{selected.size > 0 ? ` (${selected.size})` : ""}
						</button>
					</>
				) : (
					<>
						<div className="flex flex-col items-center gap-2">
							<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
								<Camera size={22} />
							</div>
							<p className="text-xs text-muted-foreground">
								Custom group photos aren&apos;t supported yet
							</p>
						</div>

						<Input
							autoFocus
							placeholder="Group name"
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
						/>

						<div className="flex flex-col gap-1 -mx-1">
							<PermissionToggleRow
								label="Members can edit group info"
								checked={canEditInfo}
								onChange={setCanEditInfo}
							/>
							<PermissionToggleRow
								label="Members can send messages"
								checked={canSendMessages}
								onChange={setCanSendMessages}
							/>
							<PermissionToggleRow
								label="Members can add other members"
								checked={canAddMembers}
								onChange={setCanAddMembers}
							/>
							<PermissionToggleRow
								label="Admin must approve new members"
								checked={requireApproval}
								onChange={setRequireApproval}
							/>
						</div>

						<button
							onClick={handleCreate}
							disabled={!groupName.trim() || createGroup.isPending}
							className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
						>
							{createGroup.isPending ? "Creating…" : "Create group"}
						</button>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
