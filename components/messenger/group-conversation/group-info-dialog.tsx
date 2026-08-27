"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
	useManageGroupMemberRole,
	usePauseGroup,
	useRemoveGroupMember,
	useUpdateGroupPermissions,
} from "@/hooks/messenger/use-group-admin"
import { useGroupDetail } from "@/hooks/messenger/use-group-detail"
import { useGroupMembers } from "@/hooks/messenger/use-group-members"
import { isGroupAdmin } from "@/lib/messenger/group-permissions"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { useAuthStore } from "@/stores/auth-store"
import type { GroupMember, Pkid } from "@/types/messenger"
import { MoreVertical, Pause, Play, Plus, ShieldCheck, ShieldOff, Trash2 } from "lucide-react"
import { Avatar, DropdownMenu } from "radix-ui"
import { useState } from "react"
import { AddGroupMembersDialog } from "./add-group-members-dialog"
import { PermissionToggleRow } from "./permission-toggle-row"

interface GroupInfoDialogProps {
	groupId: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

const menuItemClass =
	"flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm transition-colors hover:bg-accent data-highlighted:bg-accent"

/**
 * Web's equivalent of mobile's group-info.tsx screen, adapted into a
 * dialog opened from the conversation header's "More options" button —
 * consistent with every other secondary Messenger surface here being a
 * dialog, not a dedicated route.
 *
 * Self-action guard, remove/role gating, and the isGroupAdmin formula are
 * all confirmed against mobile — see MESSENGER.md's admin-surface
 * evidence pass.
 */
export function GroupInfoDialog({ groupId, open, onOpenChange }: GroupInfoDialogProps) {
	const currentUser = useAuthStore((s) => s.user)
	const { data: group } = useGroupDetail(groupId)
	const { members, isLoading } = useGroupMembers(open ? groupId : undefined)
	const [addMembersOpen, setAddMembersOpen] = useState(false)

	const removeMember = useRemoveGroupMember(groupId)
	const manageRole = useManageGroupMemberRole(groupId)
	const updatePermissions = useUpdateGroupPermissions(groupId)
	const pauseGroup = usePauseGroup(groupId)

	if (!group || !currentUser) return null

	const admin = isGroupAdmin(group, currentUser.pkid as Pkid)
	const canAddMembers = admin || group.can_members_add_users
	const createdAtLabel = new Date(group.created_at).toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
		year: "numeric",
	})

	const handleToggleRole = (member: GroupMember) => {
		manageRole.mutate({ userPkid: member.pkid, role: member.role === "admin" ? "member" : "admin" })
	}

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{group.name}</DialogTitle>
					</DialogHeader>

					<p className="text-xs text-muted-foreground -mt-2">
						{group.members_count} members · Created {createdAtLabel}
					</p>

					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold">Members</h3>
						{canAddMembers && (
							<button
								onClick={() => setAddMembersOpen(true)}
								className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
							>
								<Plus size={14} /> Add
							</button>
						)}
					</div>

					<div className="max-h-64 overflow-y-auto -mx-2">
						{isLoading && (
							<p className="text-sm text-muted-foreground text-center py-6">Loading members…</p>
						)}
						{members.map((member) => {
							const isSelf = member.pkid === currentUser.pkid
							return (
								<div
									key={member.pkid}
									className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
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
					</div>

					{admin && (
						<>
							<h3 className="text-sm font-semibold mt-2">Permissions</h3>
							<div className="flex flex-col gap-1 -mx-1">
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
								onClick={() => pauseGroup.mutate({ pause: !group.is_paused, pause_until: null })}
								disabled={pauseGroup.isPending}
								className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-accent transition-colors disabled:opacity-50"
							>
								{group.is_paused ? <Play size={15} /> : <Pause size={15} />}
								{group.is_paused ? "Resume group" : "Pause group"}
							</button>
						</>
					)}
				</DialogContent>
			</Dialog>

			<AddGroupMembersDialog
				groupId={groupId}
				open={addMembersOpen}
				onOpenChange={setAddMembersOpen}
			/>
		</>
	)
}
