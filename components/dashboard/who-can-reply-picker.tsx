"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { WhoCanReply } from "@/types/api"
import { AtSign, Check, ChevronDown } from "lucide-react"
import { ReactNode, useState } from "react"
import { Everyone, Followers, Following, Mention, Verified } from "../posts/icons"

interface ReplyOption {
	value: WhoCanReply
	label: string
	icon: ReactNode
}

const REPLY_OPTIONS: ReplyOption[] = [
	{ value: "EVERYONE", label: "Everyone", icon: <Everyone size={16} /> },
	{
		value: "ONLY_FOLLOWERS",
		label: "Only followers",
		icon: <Followers size={16} />,
	},
	{
		value: "ACCOUNTS_YOU_FOLLOW",
		label: "Accounts you follow",
		icon: <Following size={16} />,
	},
	{
		value: "ONLY_ACCOUNTS_YOU_MENTION",
		label: "Only accounts you mention",
		icon: <Mention size={16} />,
	},
	{
		value: "VERIFIED_ACCOUNTS",
		label: "Verified accounts",
		icon: <Verified size={16} />,
	},
]

interface WhoCanReplyPickerProps {
	value: WhoCanReply
	onChange: (value: WhoCanReply) => void
	/** true when ONLY_ACCOUNTS_YOU_MENTION is selected but the post has no @mention yet */
	mentionRequired?: boolean
}

export function WhoCanReplyPicker({ value, onChange, mentionRequired }: WhoCanReplyPickerProps) {
	const [open, setOpen] = useState(false)
	const current = REPLY_OPTIONS.find((o) => o.value === value) ?? REPLY_OPTIONS[0]
	const showWarning = !!mentionRequired && value === "ONLY_ACCOUNTS_YOU_MENTION"

	return (
		<div className="flex flex-col gap-1.5 w-full">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						className={cn(
							"flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all w-full cursor-pointer active:scale-[0.99]",
							showWarning
								? "border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/15"
								: "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
						)}
					>
						<span className="shrink-0">{current.icon}</span>
						<span className="flex-1 text-left text-[13px] tracking-wide">{current.label}</span>
						{showWarning && (
							<span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
						)}
						<ChevronDown
							size={14}
							className={cn(
								"transition-transform duration-150",
								showWarning ? "text-amber-500/70" : "text-primary/70",
								open && "rotate-180",
							)}
						/>
					</button>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={6}
					className="w-130 p-0 rounded-2xl border border-border shadow-xl"
				>
					<div className="px-3 pt-3.5 pb-4">
						<h3 className="font-bold text-foreground text-[15px] px-1 mb-3">Who can reply?</h3>
						<div className="flex flex-col gap-0.5">
							{REPLY_OPTIONS.map((opt) => {
								const active = opt.value === value
								return (
									<button
										key={opt.value}
										onClick={() => {
											onChange(opt.value)
											setOpen(false)
										}}
										className="flex items-center gap-2 w-full px-2 py-2 rounded-xl hover:bg-accent transition-colors text-left cursor-pointer"
									>
										<div
											className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
												active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
											}`}
										>
											{opt.icon}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[13px] font-semibold text-foreground">{opt.label}</p>
										</div>
										{active && (
											<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
												<Check size={11} className="text-primary-foreground" strokeWidth={3} />
											</div>
										)}
									</button>
								)
							})}
						</div>
					</div>
				</PopoverContent>
			</Popover>

			{showWarning && (
				<p className="flex items-center gap-1.5 text-[11.5px] text-amber-600 pl-1">
					<AtSign size={11} className="shrink-0" />
					Mention someone in your post to allow them to reply
				</p>
			)}
		</div>
	)
}

export { REPLY_OPTIONS }
