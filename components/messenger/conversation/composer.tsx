"use client"

import { EmojiPopup } from "@/components/ui/EmojiPicker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { VoiceRecorderPhase } from "@/hooks/messenger/use-voice-recorder"
import { toast } from "@/lib/toast"
import type { Message } from "@/types/messenger"
import { BarChart3, ImageIcon, MapPin, Mic, Paperclip, Send, Smile, User } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useEffect, useRef, useState } from "react"
import { ReplyPreviewBar } from "./reply-preview-bar"
import { VoiceRecorderBar } from "./voice-recorder-bar"

interface ComposerProps {
	onSend: (content: string) => void
	onTypingChange: (isTyping: boolean) => void
	replyingTo?: Message | null
	voice?: {
		phase: VoiceRecorderPhase
		durationSecs: number
		metering: number
		isPlaying: boolean
		onStart: () => void
		onPause: () => void
		onResume: () => void
		onDiscard: () => void
		onSend: () => void
		onPlayPreview: () => void
		onStopPreview: () => void
	}
	onCancelReply?: () => void
	onCreatePoll?: () => void
	onFilesPicked?: (files: FileList) => void
	onAttachContact?: () => void
	onAttachLocation?: () => void
}

export function Composer({
	onSend,
	onTypingChange,
	replyingTo,
	voice,
	onCancelReply,
	onCreatePoll,
	onFilesPicked,
	onAttachContact,
	onAttachLocation,
}: ComposerProps) {
	const [value, setValue] = useState("")
	const [emojiOpen, setEmojiOpen] = useState(false)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const imageInputRef = useRef<HTMLInputElement>(null)
	const audioInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (replyingTo) textareaRef.current?.focus()
	}, [replyingTo])

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
		onCancelReply?.()
		if (textareaRef.current) textareaRef.current.style.height = "auto"
	}

	const handlePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) onFilesPicked?.(e.target.files)
		e.target.value = ""
	}

	return (
		<div className="flex flex-col shrink-0 border-t border-border bg-background">
			{replyingTo && onCancelReply && (
				<ReplyPreviewBar message={replyingTo} onCancel={onCancelReply} />
			)}
			{voice && voice.phase !== "idle" ? (
				<VoiceRecorderBar
					phase={voice.phase}
					durationSecs={voice.durationSecs}
					metering={voice.metering}
					isPlaying={voice.isPlaying}
					onPause={voice.onPause}
					onResume={voice.onResume}
					onDiscard={voice.onDiscard}
					onSend={voice.onSend}
					onPlayPreview={voice.onPlayPreview}
					onStopPreview={voice.onStopPreview}
				/>
			) : (
				<div className="flex items-end gap-2 px-4 py-3">
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

					<input
						ref={imageInputRef}
						type="file"
						accept="image/*,video/*"
						multiple
						className="hidden"
						onChange={handlePicked}
					/>
					<input
						ref={audioInputRef}
						type="file"
						accept="audio/*"
						className="hidden"
						onChange={handlePicked}
					/>

					{onFilesPicked ? (
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button className="text-muted-foreground hover:text-foreground p-1.5 transition-colors">
									<Paperclip size={20} />
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Portal>
								<DropdownMenu.Content
									align="start"
									side="top"
									sideOffset={8}
									className="z-150 min-w-44 bg-popover border border-border rounded-2xl p-1.5 shadow-xl"
								>
									<DropdownMenu.Item
										className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm hover:bg-accent data-highlighted:bg-accent"
										onSelect={() => imageInputRef.current?.click()}
									>
										<ImageIcon size={16} /> Photo or video
									</DropdownMenu.Item>
									<DropdownMenu.Item
										className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm hover:bg-accent data-highlighted:bg-accent"
										onSelect={() => audioInputRef.current?.click()}
									>
										<Mic size={16} /> Audio file
									</DropdownMenu.Item>
									<DropdownMenu.Item
										className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm hover:bg-accent data-highlighted:bg-accent"
										onSelect={() => onAttachContact?.()}
									>
										<User size={16} /> Contact
									</DropdownMenu.Item>
									<DropdownMenu.Item
										className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm hover:bg-accent data-highlighted:bg-accent"
										onSelect={() => onAttachLocation?.()}
									>
										<MapPin size={16} /> Location
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
					) : (
						<button
							title="Attach — coming soon"
							onClick={() => toast.info("Attachments are coming in a later milestone")}
							className="text-muted-foreground/40 p-1.5 cursor-not-allowed"
						>
							<Paperclip size={20} />
						</button>
					)}

					{onCreatePoll && (
						<button
							title="Create poll"
							onClick={onCreatePoll}
							className="text-muted-foreground hover:text-foreground p-1.5 transition-colors"
						>
							<BarChart3 size={20} />
						</button>
					)}

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
						className="flex-1 resize-none bg-transparent outline-none text-sm py-2 max-h-30 placeholder:text-muted-foreground"
					/>

					{value.trim() ? (
						<button
							onClick={handleSend}
							className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
						>
							<Send size={16} />
						</button>
					) : voice ? (
						<button
							onClick={voice.onStart}
							title="Record a voice message"
							className="text-muted-foreground hover:text-foreground p-1.5 transition-colors"
						>
							<Mic size={20} />
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
			)}
		</div>
	)
}
