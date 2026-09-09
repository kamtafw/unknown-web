"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCustomLists } from "@/hooks/messenger/use-custom-lists"
import { chatApi, CustomListMember } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, List } from "lucide-react"
import Link from "next/link"
import { Avatar } from "radix-ui"
import { useState } from "react"

interface CustomListsDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CustomListsDialog({ open, onOpenChange }: CustomListsDialogProps) {
	const { data: lists, isLoading } = useCustomLists()
	const [activeListId, setActiveListId] = useState<number | null>(null)

	const membersQuery = useQuery({
		queryKey: chatKeys.customListMembers(activeListId ?? 0),
		queryFn: () => chatApi.listCustomListMembers(activeListId as number),
		enabled: activeListId !== null,
	})

	const activeList = lists?.find((l) => l.id === activeListId)

	const handleOpenChange = (o: boolean) => {
		onOpenChange(o)
		if (!o) setActiveListId(null)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-2">
						{activeListId !== null && (
							<button
								onClick={() => setActiveListId(null)}
								className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
							>
								<ArrowLeft size={16} />
							</button>
						)}
						<DialogTitle>{activeList ? activeList.name : "Your lists"}</DialogTitle>
					</div>
				</DialogHeader>

				{activeListId === null ? (
					<div className="max-h-80 overflow-y-auto -mx-2">
						{isLoading && (
							<p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
						)}
						{!isLoading && lists?.length === 0 && (
							<p className="text-sm text-muted-foreground text-center py-8">
								No lists yet — create one from a chat&apos;s &quot;Add to list&quot; action.
							</p>
						)}
						{lists?.map((list) => (
							<button
								key={list.id}
								onClick={() => setActiveListId(list.id)}
								className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
							>
								<List size={16} className="text-muted-foreground shrink-0" />
								<span className="text-sm font-medium truncate">{list.name}</span>
							</button>
						))}
					</div>
				) : (
					<div className="max-h-80 overflow-y-auto -mx-2">
						{membersQuery.isLoading && (
							<p className="text-sm text-muted-foreground text-center py-8">Loading members…</p>
						)}
						{!membersQuery.isLoading && membersQuery.data?.results.length === 0 && (
							<p className="text-sm text-muted-foreground text-center py-8">No members yet.</p>
						)}
						{membersQuery.data?.results
							.filter(
								(
									m,
								): m is CustomListMember & {
									target_user: NonNullable<CustomListMember["target_user"]>
								} => m.type === "user" && !!m.target_user,
							)
							.map((member) => (
								<Link
									key={member.id}
									href={`/messenger/${member.target_user.id}`}
									onClick={() => handleOpenChange(false)}
									className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
								>
									<Avatar.Root className="h-9 w-9 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
										<Avatar.Image
											src={member.target_user.profile_photo}
											alt={getDisplayName(member.target_user)}
											className="h-full w-full object-cover"
										/>
										<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
											{getInitials(member.target_user.first_name, member.target_user.last_name)}
										</Avatar.Fallback>
									</Avatar.Root>
									<span className="text-sm font-medium truncate">
										{getDisplayName(member.target_user)}
									</span>
								</Link>
							))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
