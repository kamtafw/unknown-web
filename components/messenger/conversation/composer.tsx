"use client"

import { EmojiPopup } from "@/components/ui/EmojiPicker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/lib/toast"
import { Mic, Paperclip, Send, Smile } from "lucide-react"
import { useRef, useState } from "react"

interface ComposerProps {
	onSend: (content: string) => void
	onTypingChange: (isTyping: boolean) => void
}

export function Composer({ onSend, onTypingChange }: ComposerProps) {
	const [value, setValue] = useState("")
	const [emojiOpen, setEmojiOpen] = useState(false)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const handleChange = (next: string) => {
		setValue(next)
		onTypingChange(next.trim().length > 0)
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
			textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
		}
	}

	const handleSend = () => {
		const trimmed = value.trim()
		if (!trimmed) return
		onSend(trimmed)
		setValue("")
		onTypingChange(false)
		if (textareaRef.current) textareaRef.current.style.height = "auto"
	}

	return (
		<div className="flex items-end gap-2 px-4 py-3 border-t border-border bg-background shrink-0">
			<Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
				<PopoverTrigger asChild>
					<button className="text-muted-foreground hover:text-foreground p-1.5 transition-colors">
						<Smile size={20} />
					</button>
				</PopoverTrigger>
				<PopoverContent side="top" align="start" className="p-0 w-auto">
					<EmojiPopup
						onSelect={(emoji) => handleChange(value + emoji)}
						onClose={() => setEmojiOpen(false)}
					/>
				</PopoverContent>
			</Popover>

			<button
				title="Attach — coming soon"
				onClick={() => toast.info("Attachments are coming in a later milestone")}
				className="text-muted-foreground/40 p-1.5 cursor-not-allowed"
			>
				<Paperclip size={20} />
			</button>

			<textarea
				ref={textareaRef}
				rows={1}
				value={value}
				onChange={(e) => handleChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault()
						handleSend()
					}
				}}
				placeholder="Type a message here"
				className="flex-1 resize-none bg-transparent outline-none text-sm py-2 max-h-[120px] placeholder:text-muted-foreground"
			/>

			{value.trim() ? (
				<button
					onClick={handleSend}
					className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
				>
					<Send size={16} />
				</button>
			) : (
				<button
					title="Voice message — coming soon"
					onClick={() => toast.info("Voice messages are coming in a later milestone")}
					className="text-muted-foreground/40 p-1.5 cursor-not-allowed"
				>
					<Mic size={20} />
				</button>
			)}
		</div>
	)
}
