import type { WhoCanReply } from "@/types/socials/api"
import { Lock } from "lucide-react"
import type { ComponentType } from "react"
import { Followers, Following, Mention, Verified } from "../posts/icons"
import { replyRestrictionMessage } from "@/lib/socials/content-permissions"

type IconComp = ComponentType<{ size?: number; color?: string }>

const RESTRICTION_ICON: Partial<Record<WhoCanReply, IconComp>> = {
	ONLY_FOLLOWERS: Followers,
	ACCOUNTS_YOU_FOLLOW: Following,
	ONLY_ACCOUNTS_YOU_MENTION: Mention,
	VERIFIED_ACCOUNTS: Verified,
}

interface ReplyRestrictedNoticeProps {
	whoCanReply: WhoCanReply
	username: string
	compact?: boolean
}

export function ReplyRestrictedNotice({
	whoCanReply,
	username,
	compact = false,
}: ReplyRestrictedNoticeProps) {
	const Icon = RESTRICTION_ICON[whoCanReply] ?? Lock

	return (
		<div
			className={`flex items-center gap-3 rounded-2xl border border-border bg-muted/40 ${
				compact ? "px-3.5 py-3" : "px-4 py-3.5"
			}`}
		>
			<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
				<Icon size={16} color="#6A88D1" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-[13px] font-semibold text-foreground leading-snug">
					{replyRestrictionMessage(whoCanReply, username)}
				</p>
				<p className="text-[11.5px] text-muted-foreground mt-0.5">
					You can still like, bookmark, and share this post.
				</p>
			</div>
		</div>
	)
}
