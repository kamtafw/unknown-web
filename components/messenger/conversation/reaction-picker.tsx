"use client"

import { EmojiPopup } from "@/components/ui/EmojiPicker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SmilePlus } from "lucide-react"
import { useState } from "react"

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

/** Fixed 6-emoji set confirmed via mobile's InlineReactionBar. "More"
 * reuses the composer's existing EmojiPopup rather than a second picker. */
export function ReactionPicker({ onReact }: { onReact: (emoji: string) => void }) {
	const [open, setOpen] = useState(false)
	const [fullPickerOpen, setFullPickerOpen] = useState(false)

	const handlePick = (emoji: string) => {
		onReact(emoji)
		setOpen(false)
		setFullPickerOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-opacity shrink-0">
					<SmilePlus size={14} />
				</button>
			</PopoverTrigger>
			<PopoverContent side="top" align="center" className="p-0 w-auto">
				{fullPickerOpen ? (
					<EmojiPopup onSelect={handlePick} onClose={() => setFullPickerOpen(false)} />
				) : (
					<div className="flex items-center gap-1 p-1.5">
						{QUICK_REACTIONS.map((emoji) => (
							<button
								key={emoji}
								onClick={() => handlePick(emoji)}
								className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors text-lg"
							>
								{emoji}
							</button>
						))}
						<button
							onClick={() => setFullPickerOpen(true)}
							title="More emojis"
							className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors text-muted-foreground text-sm"
						>
							+
						</button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	)
}
