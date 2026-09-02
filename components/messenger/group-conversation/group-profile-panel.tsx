"use client"

import {
	useLeaveGroup,
	useManageGroupMemberRole,
	usePauseGroup,
	useRemoveGroupMember,
	useUpdateGroupPermissions,
} from "@/hooks/messenger/use-group-admin"
import { useGroupDetail } from "@/hooks/messenger/use-group-detail"
import { useGroupMembers } from "@/hooks/messenger/use-group-members"
import { extractMessage } from "@/lib/api-error"
import { isGroupAdmin } from "@/lib/messenger/group-permissions"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { GroupMember, Pkid } from "@/types/messenger"
import {
	LogOut,
	MoreVertical,
	Pause,
	Play,
	Plus,
	Share2,
	ShieldCheck,
	ShieldOff,
	Trash2,
	X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, DropdownMenu } from "radix-ui"
import { useState } from "react"
import { AddGroupMembersDialog } from "./add-group-members-dialog"
import { PauseGroupDialog } from "./pause-group-dialog"
import { PermissionToggleRow } from "./permission-toggle-row"

interface GroupProfilePanelProps {
	groupId: number
	onClose: () => void
}

const menuItemClass =
	"flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm transition-colors hover:bg-accent data-highlighted:bg-accent"

function ProfileAction({
	label,
	icon: Icon,
	onClick,
	disabled,
}: {
	label: string
	icon: typeof Share2
	onClick?: () => void
	disabled?: boolean
}) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className="flex-1 min-w-0 flex flex-col items-center gap-1.5 rounded-xl border border-border py-3 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
		>
			<Icon size={20} className="text-muted-foreground" />
			<span className="text-sm text-muted-foreground font-medium">{label}</span>
		</button>
	)
}

/**
 * Group's equivalent of ProfilePanel (1:1) — an aside in the workspace's
 * right-panel slot, opened by clicking the group header. Supersedes
 * group-info-dialog.tsx, whose logic (member list/roles, permissions,
 * pause) this migrates in full, plus Leave Group (confirmed via mobile's
 * useLeaveGroup) and a "resume at a set time" option for pause that
 * neither app had wired before — see PauseGroupDialog.
 *
 * "Share" is inert — 1:1's ProfilePanel has the same unwired button; no
 * invite-link/share-group endpoint exists to wire it to.
 *
 * No media/links/docs tab — no confirmed group-scoped attachments
 * endpoint exists (unlike chatApi.getAttachments for 1:1). Gap, not built.
 */
export function GroupProfilePanel({ groupId, onClose }: GroupProfilePanelProps) {
	const currentUser = useAuthStore((s) => s.user)
	const router = useRouter()
	const { data: group } = useGroupDetail(groupId)
	const { members, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useGroupMembers(groupId)

	const [addMembersOpen, setAddMembersOpen] = useState(false)
	const [pauseOpen, setPauseOpen] = useState(false)

	const removeMember = useRemoveGroupMember(groupId)
	const manageRole = useManageGroupMemberRole(groupId)
	const updatePermissions = useUpdateGroupPermissions(groupId)
	const pauseGroup = usePauseGroup(groupId)
	const leaveGroup = useLeaveGroup(groupId)

	if (!group || !currentUser) {
		return (
			<aside className="flex h-full w-full min-w-0 flex-col items-center justify-center border-l bg-background">
				<p className="text-sm text-muted-foreground">Loading…</p>
			</aside>
		)
	}

	const admin = isGroupAdmin(group, currentUser.pkid as Pkid)
	const canAddMembers = admin || group.can_members_add_users
	const createdAtLabel = new Date(group.created_at).toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
		year: "numeric",
	})
	const pauseUntilLabel = group.pause_until
		? new Date(group.pause_until).toLocaleString(undefined, {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
			})
		: null

	const handleToggleRole = (member: GroupMember) => {
		manageRole.mutate({ userPkid: member.pkid, role: member.role === "admin" ? "member" : "admin" })
	}

	const handleLeave = async () => {
		try {
			await leaveGroup.mutateAsync()
			onClose()
			router.push("/messenger/groups")
		} catch (err) {
			toast.error(extractMessage(err, "Couldn't leave the group — try again"))
		}
	}

	return (
		<>
			<aside className="flex h-full w-full min-w-0 flex-col border-l bg-background">
				<div className="flex h-14 shrink-0 items-center border-b px-4">
					<h2 className="text-base font-medium">Group info</h2>
					<button
						onClick={onClose}
						aria-label="Close group info"
						className="ml-auto rounded-full p-2 transition-colors hover:bg-accent"
					>
						<X size={20} strokeWidth={2} />
					</button>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto">
					<section className="flex flex-col items-center px-5 py-7">
						<Avatar.Root className="h-32 w-32 overflow-hidden rounded-full bg-muted flex items-center justify-center">
							<Avatar.Image
								src={group.icon_url ?? undefined}
								alt={group.name}
								className="h-full w-full object-cover"
							/>
							<Avatar.Fallback className="text-2xl font-medium">
								{group.name.charAt(0).toUpperCase()}
							</Avatar.Fallback>
						</Avatar.Root>
						<h3 className="mt-4 text-xl font-medium text-center">{group.name}</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Group · {group.members_count} members
						</p>
						<p className="text-xs text-muted-foreground">Created {createdAtLabel}</p>
						{group.is_paused && (
							<p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
								<Pause size={12} />
								Paused{pauseUntilLabel ? ` until ${pauseUntilLabel}` : ""}
							</p>
						)}
					</section>

					<div className="grid grid-cols-2 px-3 gap-2">
						<ProfileAction
							icon={Plus}
							label="Add members"
							onClick={() => setAddMembersOpen(true)}
							disabled={!canAddMembers}
						/>
						<ProfileAction icon={Share2} label="Share" />
					</div>

					<section className="mt-2 px-5">
						<h3 className="text-sm font-semibold">Members</h3>
						<div className="-mx-2 mt-1">
							{isLoading && (
								<p className="text-sm text-muted-foreground text-center py-6">Loading members…</p>
							)}
							{members.map((member) => {
								const isSelf = member.pkid === currentUser.pkid
								return (
									<div
										key={member.pkid}
										className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors"
									>
										<Avatar.Root className="h-9 w-9 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
											<Avatar.Image
												src={member.profile_photo ?? undefined}
												alt={getDisplayName(member)}
												className="h-full w-full object-cover"
											/>
											<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
												{getInitials(member.first_name, member.last_name)}
											</Avatar.Fallback>
										</Avatar.Root>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium truncate">
												{getDisplayName(member)}{" "}
												{isSelf && <span className="text-muted-foreground">(you)</span>}
											</p>
											{member.role === "admin" && <p className="text-xs text-primary">Admin</p>}
										</div>
										{admin && !isSelf && (
											<DropdownMenu.Root>
												<DropdownMenu.Trigger asChild>
													<button className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors shrink-0">
														<MoreVertical size={14} />
													</button>
												</DropdownMenu.Trigger>
												<DropdownMenu.Portal>
													<DropdownMenu.Content
														align="end"
														sideOffset={4}
														className="z-150 min-w-48 bg-popover border border-border rounded-2xl p-1.5 shadow-xl"
													>
														<DropdownMenu.Item
															className={menuItemClass}
															onSelect={() => handleToggleRole(member)}
														>
															{member.role === "admin" ? (
																<>
																	<ShieldOff size={16} /> Remove as admin
																</>
															) : (
																<>
																	<ShieldCheck size={16} /> Make admin
																</>
															)}
														</DropdownMenu.Item>
														<DropdownMenu.Item
															className={menuItemClass + " text-destructive"}
															onSelect={() => removeMember.mutate(member.pkid)}
														>
															<Trash2 size={16} /> Remove from group
														</DropdownMenu.Item>
													</DropdownMenu.Content>
												</DropdownMenu.Portal>
											</DropdownMenu.Root>
										)}
									</div>
								)
							})}
							{hasNextPage && (
								<button
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
									className="w-full py-2 text-xs font-medium text-primary"
								>
									{isFetchingNextPage ? "Loading…" : "Load more members"}
								</button>
							)}
						</div>
					</section>

					{admin && (
						<section className="mt-2 px-5">
							<h3 className="text-sm font-semibold">Permissions</h3>
							<div className="flex flex-col gap-1 -mx-1 mt-1">
								<PermissionToggleRow
									label="Members can edit group info"
									checked={group.can_members_edit_info}
									onChange={(v) => updatePermissions.mutate({ can_members_edit_info: v })}
								/>
								<PermissionToggleRow
									label="Members can send messages"
									checked={group.can_members_send_messages}
									onChange={(v) => updatePermissions.mutate({ can_members_send_messages: v })}
								/>
								<PermissionToggleRow
									label="Members can add other members"
									checked={group.can_members_add_users}
									onChange={(v) => updatePermissions.mutate({ can_members_add_users: v })}
								/>
								<PermissionToggleRow
									label="Admin must approve new members"
									checked={group.admin_have_to_approve_new_members}
									onChange={(v) =>
										updatePermissions.mutate({ admin_have_to_approve_new_members: v })
									}
								/>
							</div>

							<button
								onClick={() =>
									group.is_paused
										? pauseGroup.mutate({ pause: false, pause_until: null })
										: setPauseOpen(true)
								}
								disabled={pauseGroup.isPending}
								className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-accent transition-colors disabled:opacity-50"
							>
								{group.is_paused ? <Play size={15} /> : <Pause size={15} />}
								{group.is_paused ? "Resume group" : "Pause group"}
							</button>
						</section>
					)}

					<div className="mt-4 divide-y border-t">
						<button
							className="flex w-full items-center gap-4 px-5 py-3 text-left text-sm text-destructive hover:bg-accent"
							onClick={handleLeave}
						>
							<LogOut size={18} />
							<span>Leave group</span>
						</button>
					</div>
				</div>
			</aside>

			<AddGroupMembersDialog
				groupId={groupId}
				open={addMembersOpen}
				onOpenChange={setAddMembersOpen}
			/>
			<PauseGroupDialog groupId={groupId} open={pauseOpen} onOpenChange={setPauseOpen} />
		</>
	)
}
