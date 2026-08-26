"use client"

import { CustomListMember } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Avatar } from "radix-ui"

interface CustomListMemberRowProps {
	member: CustomListMember & { target_user: NonNullable<CustomListMember["target_user"]> }
}

/** Deliberately lightweight — see MESSENGER.md "Custom lists — member rows
 * are lightweight, not full ChatListItem" for why this isn't <ChatListItem/> */
export function CustomListMemberRow({ member }: CustomListMemberRowProps) {
	const queryClient = useQueryClient()
	const user = member.target_user
	const name = getDisplayName(user)

	return (
		<Link
			href={`/messenger/${user.id}`}
			onClick={() => queryClient.setQueryData(chatKeys.peer(user.id as Uuid), user)}
			className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
		>
			<Avatar.Root className="h-11 w-11 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
				<Avatar.Image src={user.profile_photo} alt={name} className="h-full w-full object-cover" />
				<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
					{getInitials(user.first_name, user.last_name)}
				</Avatar.Fallback>
			</Avatar.Root>
			<span className="font-semibold text-sm truncate">{name}</span>
		</Link>
	)
}
