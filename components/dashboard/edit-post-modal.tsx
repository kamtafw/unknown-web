"use client"

import { useUpdatePost } from "@/hooks/socials/use-post-actions"
import { useMentionAutocomplete } from "@/hooks/use-mention-autocomplete"
import { hasAnyMention } from "@/lib/mentions"
import { useAuthStore } from "@/stores/auth-store"
import type { Post, UpdatePostPayload, WhoCanReply, WhoCanSee } from "@/types/socials/api"
import * as Dialog from "@radix-ui/react-dialog"
import { Image as ImageIcon, MapPin, Smile, X } from "lucide-react"
import Image from "next/image"
import { Avatar } from "radix-ui"
import { useRef, useState } from "react"
import { HighlightedTextarea } from "../shared/highlighted-textarea"
import { MentionAutocomplete } from "../shared/mention-autocomplete"
import { getInitials } from "./post-card"
import { WhoCanReplyPicker } from "./who-can-reply-picker"
import { WhoCanSeePicker } from "./who-can-see-picker"

const EMOJIS = [
	"😀",
	"😂",
	"😍",
	"🥺",
	"😊",
	"🔥",
	"👍",
	"❤️",
	"🎉",
	"✨",
	"😭",
	"🤣",
	"😎",
	"🙏",
	"💯",
	"🤔",
	"😅",
	"😤",
	"🥰",
	"😢",
	"💪",
	"👏",
	"🎊",
	"🌟",
	"😏",
	"🤩",
	"😳",
	"🫶",
	"💀",
	"😇",
]

function extractHashtags(str: string): string[] {
	return (str.match(/#\w+/g) ?? []).map((h) => h.replace("#", ""))
}

interface EditPostModalProps {
	post: Post
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditPostModal({ post, open, onOpenChange }: EditPostModalProps) {
	const user = useAuthStore((s) => s.user)
	const updatePost = useUpdatePost()

	const [text, setText] = useState(post.message ?? "")
	const [whoCanSee, setWhoCanSee] = useState<WhoCanSee>(post.permissions.visibility)
	const [whoCanReply, setWhoCanReply] = useState<WhoCanReply>(post.permissions.reply_policy)
	const [showEmoji, setShowEmoji] = useState(false)
	const initialLocation = post.location
	const [location, setLocation] = useState<{ longitude: string; latitude: string } | null>(
		initialLocation
			? { longitude: String(initialLocation.longitude), latitude: String(initialLocation.latitude) }
			: null,
	)
	const [locationRemoved, setLocationRemoved] = useState(false)
	const [locationLabel, setLocationLabel] = useState<string | null>(
		initialLocation?.address ||
			(initialLocation ? `${initialLocation.latitude}, ${initialLocation.longitude}` : null),
	)
	const [fetchingLocation, setFetchingLocation] = useState(false)

	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const mentionContainerRef = useRef<HTMLDivElement>(null)
	const mention = useMentionAutocomplete({
		value: text,
		onChange: setText,
		textareaRef,
		containerRef: mentionContainerRef,
	})

	const mediaUrls = post.media
	const mentionBlocked = whoCanReply === "ONLY_ACCOUNTS_YOU_MENTION" && !hasAnyMention(text)
	const isDirty =
		text.trim() !== (post.message ?? "").trim() ||
		whoCanSee !== post.permissions.visibility ||
		whoCanReply !== post.permissions.reply_policy ||
		locationRemoved ||
		(!initialLocation && !!location)

	const canSubmit = isDirty && !updatePost.isPending && !mentionBlocked

	const reset = () => {
		setText(post.message ?? "")
		setWhoCanSee(post.permissions.visibility)
		setWhoCanReply(post.permissions.reply_policy)
		setShowEmoji(false)
		setLocationRemoved(false)
		setLocation(
			initialLocation
				? {
						longitude: String(initialLocation.longitude),
						latitude: String(initialLocation.latitude),
					}
				: null,
		)
		setLocationLabel(initialLocation?.address ?? null)
	}

	const handleEmojiClick = (emoji: string) => {
		const ta = textareaRef.current
		if (ta) {
			const start = ta.selectionStart ?? text.length
			const end = ta.selectionEnd ?? text.length
			const next = text.slice(0, start) + emoji + text.slice(end)
			setText(next)
			setTimeout(() => {
				ta.selectionStart = ta.selectionEnd = start + emoji.length
				ta.focus()
			}, 0)
		} else {
			setText((t) => t + emoji)
		}
		setShowEmoji(false)
	}

	const handleLocationRemove = () => {
		setLocation(null)
		setLocationLabel(null)
		setLocationRemoved(true)
	}

	const handleLocationAdd = () => {
		if (!navigator.geolocation) return
		setFetchingLocation(true)
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLocation({
					longitude: String(pos.coords.longitude),
					latitude: String(pos.coords.latitude),
				})
				setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
				setLocationRemoved(false)
				setFetchingLocation(false)
			},
			() => setFetchingLocation(false),
		)
	}

	const handleSubmit = () => {
		if (!canSubmit) return

		const hashtags = extractHashtags(text)
		const payload: UpdatePostPayload = {
			content: text.trim(),
			who_can_see: whoCanSee,
			who_can_reply: whoCanReply,
			hashtags,
			location: locationRemoved ? null : (location ?? undefined),
		}

		updatePost.mutate(
			{ id: post.id, payload },
			{
				onSuccess: (res) => {
					if (res.success) onOpenChange(false)
				},
			},
		)
	}

	const myName = user
		? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
		: ""

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(v) => {
				if (!v) reset()
				onOpenChange(v)
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

				<Dialog.Content
					className="
						fixed left-1/2 top-[15%] -translate-x-1/2 z-50
						w-full max-w-140 max-h-[88vh]
						bg-card border border-border rounded-2xl shadow-2xl
						flex flex-col
						focus:outline-none
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
					"
				>
					<div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
						<Dialog.Title className="text-lg font-bold text-foreground">Edit post</Dialog.Title>
						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors">
								<X size={18} />
							</button>
						</Dialog.Close>
					</div>

					<Dialog.Description className="sr-only">
						Edit your post content and settings
					</Dialog.Description>

					<div className="flex-1 overflow-y-auto px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
						<div className="flex gap-3 mb-4">
							<Avatar.Root className="w-10 h-10 rounded-full overflow-hidden shrink-0">
								<Avatar.Image
									src={user?.profile_photo ?? undefined}
									alt={myName}
									className="w-full h-full object-cover"
								/>
								<Avatar.Fallback className="w-full h-full bg-primary/40 text-primary-foreground text-sm font-semibold flex items-center justify-center">
									{getInitials(user?.first_name ?? "", user?.last_name ?? "")}
								</Avatar.Fallback>
							</Avatar.Root>

							<div className="flex flex-col justify-center min-w-0">
								<span className="text-sm font-semibold text-foreground leading-tight">
									{myName}
								</span>
								<span className="text-xs text-muted-foreground">@{user?.username}</span>
							</div>

							<div className="ml-auto flex items-center">
								<WhoCanSeePicker value={whoCanSee} onChange={setWhoCanSee} />
							</div>
						</div>

						<div ref={mentionContainerRef} className="relative mb-3">
							<HighlightedTextarea
								ref={textareaRef}
								value={text}
								onChange={setText}
								onSelect={mention.handleSelect}
								onKeyDown={(e) => {
									if (mention.handleKeyDown(e)) return
									if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
								}}
								placeholder="What's on your mind?"
								rows={3}
								autoFocus
								className="w-full resize-none text-[15px] text-foreground placeholder:text-muted-foreground outline-none bg-transparent leading-relaxed mb-3"
							/>
							<MentionAutocomplete mention={mention} />
						</div>

						{mediaUrls.length > 0 && (
							<>
								<div
									className={`mb-2 rounded-xl overflow-hidden grid gap-1 ${
										mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
									}`}
								>
									{mediaUrls.slice(0, 4).map((url, i) => (
										<div
											key={i}
											className="relative bg-muted aspect-square overflow-hidden rounded-lg"
										>
											<Image src={url} alt="" fill className="object-cover" />
										</div>
									))}
								</div>
								<p className="text-[11.5px] text-muted-foreground mb-4">
									Attachments can&apos;t be changed after posting.
								</p>
							</>
						)}

						{locationLabel && (
							<div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
								<MapPin size={11} />
								{locationLabel}
								<button onClick={handleLocationRemove} className="ml-0.5 hover:opacity-60">
									<X size={10} />
								</button>
							</div>
						)}

						{showEmoji && (
							<div className="mb-3 p-2 border border-border rounded-xl bg-card shadow-lg">
								<div className="grid grid-cols-10 gap-0.5">
									{EMOJIS.map((e) => (
										<button
											key={e}
											onClick={() => handleEmojiClick(e)}
											className="w-8 h-8 text-lg rounded hover:bg-accent flex items-center justify-center transition-colors"
										>
											{e}
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="px-5 pb-3 shrink-0">
						<WhoCanReplyPicker
							value={whoCanReply}
							onChange={setWhoCanReply}
							mentionRequired={mentionBlocked}
						/>
					</div>

					<div className="flex items-center justify-between px-4 py-3 shrink-0 border-t border-border">
						<div className="flex items-center gap-0.5">
							<button
								disabled={true}
								title="Media items cannot be changed during edit."
								className="p-2.5 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
							>
								<ImageIcon size={20} />
							</button>

							<button
								onClick={() => setShowEmoji((v) => !v)}
								title="Add emoji"
								className={`p-2.5 rounded-full transition-colors ${
									showEmoji ? "bg-primary/10 text-primary" : "text-primary hover:bg-accent"
								}`}
							>
								<Smile size={20} />
							</button>

							<button
								onClick={locationLabel ? handleLocationRemove : handleLocationAdd}
								disabled={fetchingLocation}
								title={locationLabel ? "Remove location" : "Add location"}
								className={`p-2.5 rounded-full transition-colors disabled:opacity-50 ${
									locationLabel ? "bg-primary/10 text-primary" : "text-primary hover:bg-accent"
								}`}
							>
								<MapPin size={20} />
							</button>
						</div>

						<div className="flex items-center gap-3">
							<button
								onClick={handleSubmit}
								disabled={!canSubmit}
								title={
									mentionBlocked
										? "Mention someone before restricting replies to mentions"
										: undefined
								}
								className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
							>
								{updatePost.isPending ? "Saving…" : "Save"}
							</button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
