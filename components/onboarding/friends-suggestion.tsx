import React, { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Avatar from "@radix-ui/react-avatar"
import { X } from "lucide-react"

export interface SuggestedUser {
	id: string
	name: string
	username: string
	bio: string
	avatarUrl?: string
	following?: boolean
}

const DEFAULT_USERS: SuggestedUser[] = [
	{
		id: "1",
		name: "Ralph Edwards",
		username: "@_reddy_soham",
		bio: "A Product Designer who likes exploring many aspect of creativity",
		avatarUrl: "https://i.pravatar.cc/48?img=11",
	},
	{
		id: "2",
		name: "Savannah Nguyen",
		username: "@_reddy_soham",
		bio: "A Product Designer who likes exploring many aspect of creativity",
		avatarUrl: "https://i.pravatar.cc/48?img=5",
		following: true,
	},
	{
		id: "3",
		name: "Kristin Watson",
		username: "@_reddy_soham",
		bio: "A Product Designer who likes exploring many aspect of creativity",
		avatarUrl: "https://i.pravatar.cc/48?img=45",
	},
	{
		id: "4",
		name: "Jane Cooper",
		username: "@_reddy_soham",
		bio: "A Product Designer who likes exploring many aspect of creativity",
		avatarUrl: "https://i.pravatar.cc/48?img=47",
	},
	{
		id: "5",
		name: "Dianne Russell",
		username: "@_reddy_soham",
		bio: "A Product Designer who likes exploring many aspect of creativity",
		avatarUrl: "https://i.pravatar.cc/48?img=32",
	},
	{
		id: "6",
		name: "Floyd Miles",
		username: "@_reddy_soham",
		bio: "A Product Designer who likes exploring many aspect of creativity",
		avatarUrl: "https://i.pravatar.cc/48?img=12",
	},
]

interface FriendsSuggestionProps {
	open?: boolean
	onOpenChange?: (open: boolean) => void
	users?: SuggestedUser[]
	onContinue?: (followedIds: string[]) => void
}

export function FriendsSuggestion({
	open = true,
	onOpenChange,
	users = DEFAULT_USERS,
	onContinue,
}: FriendsSuggestionProps) {
	const [followState, setFollowState] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(users.map((u) => [u.id, u.following ?? false])),
	)

	const toggleFollow = (id: string) => {
		setFollowState((prev) => ({ ...prev, [id]: !prev[id] }))
	}

	const followedIds = Object.entries(followState)
		.filter(([, v]) => v)
		.map(([k]) => k)

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				{/* Overlay */}
				<Dialog.Overlay className="fixed inset-0 bg-[#9FAABD]/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

				{/* Content */}
				<Dialog.Content
					className="
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            w-full max-w-140 bg-white rounded-3xl shadow-xl
            p-6 focus:outline-none
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          "
				>
					{/* Header */}
					<div className="flex items-center justify-between mb-5">
						<Dialog.Title className="text-lg font-bold text-gray-900">
							Friends suggestion
						</Dialog.Title>
						<Dialog.Close asChild>
							<button className="text-gray-500 hover:text-gray-800 transition-colors rounded-full p-1 hover:bg-gray-100">
								<X size={18} />
							</button>
						</Dialog.Close>
					</div>

					{/* User list */}
					<div className="flex flex-col gap-5 mb-6">
						{users.map((user) => {
							const isFollowing = followState[user.id]
							return (
								<div key={user.id} className="flex items-start gap-3">
									{/* Avatar */}
									<Avatar.Root className="w-12 h-12 rounded-full shrink-0 overflow-hidden">
										<Avatar.Image
											src={user.avatarUrl}
											alt={user.name}
											className="w-full h-full object-cover"
										/>
										<Avatar.Fallback className="w-full h-full bg-[#EEF1F8] flex items-center justify-center text-sm font-semibold text-[#8892C4]">
											{user.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.slice(0, 2)}
										</Avatar.Fallback>
									</Avatar.Root>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
										<p className="text-xs text-gray-500 mb-0.5">{user.username}</p>
										<p className="text-xs text-gray-500 leading-snug">{user.bio}</p>
									</div>

									{/* Follow / Unfollow */}
									<button
										onClick={() => toggleFollow(user.id)}
										className={`
                      shrink-0 px-5 h-9 rounded-full text-sm font-medium
                      border transition-all duration-150
                      ${
												isFollowing
													? "border-[#8892C4] text-[#8892C4] bg-white hover:bg-[#EEF1F8]"
													: "bg-[#8892C4] text-white border-[#8892C4] hover:bg-[#7580b8]"
											}
                    `}
									>
										{isFollowing ? "Unfollow" : "Follow"}
									</button>
								</div>
							)
						})}
					</div>

					{/* Continue */}
					<button
						onClick={() => onContinue?.(followedIds)}
						className="
              w-full h-13 rounded-2xl text-white text-sm font-semibold
              bg-[#8892C4] hover:bg-[#7580b8] active:scale-[0.99]
              transition-all duration-200
            "
					>
						Continue
					</button>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
