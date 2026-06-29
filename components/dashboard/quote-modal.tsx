"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRepost } from "@/hooks/use-repost"
import { socialApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { MediaItem, OriginalPost, Post, RepostPayload, WhoCanReply } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import {
	Check,
	ChevronDown,
	Image as ImageIcon,
	Loader2,
	MapPin,
	RefreshCw,
	Smile,
	X,
} from "lucide-react"
import Image from "next/image"
import { Avatar } from "radix-ui"
import { ReactNode, useRef, useState } from "react"
import { Everyone, Followers, Following, Mention, Verified } from "../posts/icons"
import { QuotedPostCard, getInitials } from "./post-card"

interface ReplyOption {
	value: WhoCanReply
	label: string
	icon: ReactNode
}

const REPLY_OPTIONS: ReplyOption[] = [
	{ value: "EVERYONE", label: "Everyone", icon: <Everyone size={16} color="#6A88D1" /> },
	{
		value: "ONLY_FOLLOWERS",
		label: "Only followers",
		icon: <Followers size={16} color="#6A88D1" />,
	},
	{
		value: "ACCOUNTS_YOU_FOLLOW",
		label: "Accounts you follow",
		icon: <Following size={16} color="#6A88D1" />,
	},
	{
		value: "ONLY_ACCOUNTS_YOU_MENTION",
		label: "Only accounts you mention",
		icon: <Mention size={16} color="#6A88D1" />,
	},
	{
		value: "VERIFIED_ACCOUNTS",
		label: "Verified accounts",
		icon: <Verified size={16} color="#6A88D1" />,
	},
]

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
	return (str.match(/#\w+/g) ?? []).map((h) => h.toLowerCase())
}

function asOriginalPost(post: Post): OriginalPost {
	return {
		id: post.id,
		pkid: post.pkid,
		content_text: post.content_text,
		user: post.user,
		post_location: post.post_location,
		post_media: post.post_media,
		post_hashtagged: post.post_hashtagged,
		created_at: post.created_at,
	}
}

interface QuoteModalProps {
	post: Post
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function QuoteModal({ post, open, onOpenChange }: QuoteModalProps) {
	const user = useAuthStore((s) => s.user)
	const repost = useRepost()

	const [text, setText] = useState("")
	const [whoCanReply, setWhoCanReply] = useState<WhoCanReply>("EVERYONE")
	const [replyPickerOpen, setReplyPickerOpen] = useState(false)
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
	const [showEmoji, setShowEmoji] = useState(false)
	const [location, setLocation] = useState<{ longitude: string; latitude: string } | null>(null)
	const [locationLabel, setLocationLabel] = useState<string | null>(null)
	const [fetchingLocation, setFetchingLocation] = useState(false)

	const fileInputRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const currentOption = REPLY_OPTIONS.find((o) => o.value === whoCanReply) ?? REPLY_OPTIONS[0]
	const uploadedUrls = mediaItems.flatMap((m) => m.urls ?? [])
	const anyUploading = mediaItems.some((m) => m.uploading)
	const hasContent = text.trim().length > 0 || uploadedUrls.length > 0
	const canSubmit = hasContent && !anyUploading

	const reset = () => {
		mediaItems.forEach((m) => URL.revokeObjectURL(m.preview))
		setText("")
		setMediaItems([])
		setShowEmoji(false)
		setLocation(null)
		setLocationLabel(null)
		setWhoCanReply("EVERYONE")
	}

	const uploadFile = async (id: string, file: File) => {
		setMediaItems((prev) =>
			prev.map((m) => (m.id === id ? { ...m, uploading: true, error: false } : m)),
		)
		try {
			const urls = await socialApi.uploadMedia(file)
			setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, urls, uploading: false } : m)))
		} catch {
			setMediaItems((prev) =>
				prev.map((m) => (m.id === id ? { ...m, uploading: false, error: true } : m)),
			)
		}
	}

	const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const remaining = 4 - mediaItems.length
		const files = Array.from(e.target.files ?? []).slice(0, remaining)

		files.forEach((file) => {
			const id = crypto.randomUUID()
			const preview = URL.createObjectURL(file)
			setMediaItems((prev) => [
				...prev,
				{ id, file, preview, urls: null, uploading: true, error: false },
			])
			uploadFile(id, file)
		})

		e.target.value = ""
	}

	const removeMedia = (id: string) => {
		setMediaItems((prev) => {
			const item = prev.find((m) => m.id === id)
			if (item) URL.revokeObjectURL(item.preview)
			return prev.filter((m) => m.id !== id)
		})
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

	const handleLocation = () => {
		if (locationLabel) {
			setLocation(null)
			setLocationLabel(null)
			return
		}
		if (!navigator.geolocation) return
		setFetchingLocation(true)
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLocation({
					longitude: String(pos.coords.longitude),
					latitude: String(pos.coords.latitude),
				})
				setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
				setFetchingLocation(false)
			},
			() => setFetchingLocation(false),
		)
	}

	const handleSubmit = () => {
		if (!canSubmit) return
		const hashtags = extractHashtags(text)
		const payload: RepostPayload = {
			is_repost: true,
			original_post: post.id,
			content_text: text.trim() || undefined,
			hashtags: hashtags.length ? hashtags : undefined,
			media_urls: uploadedUrls.length ? uploadedUrls : undefined,
			location: location ?? undefined,
			who_can_reply: whoCanReply,
		}

		repost.mutate(payload, {
			onSuccess: () => {
				reset()
				onOpenChange(false)
			},
		})
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
						w-full max-w-150 max-h-[85vh]
						bg-card border border-border rounded-2xl shadow-2xl
						flex flex-col
						focus:outline-none
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
					"
				>
					<Dialog.Title className="sr-only">Quote post</Dialog.Title>
					<Dialog.Description className="sr-only">
						Write your quote for this post
					</Dialog.Description>

					<div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
						<div className="py-1.5 shrink-0">
							<Popover open={replyPickerOpen} onOpenChange={setReplyPickerOpen}>
								<PopoverTrigger asChild>
									<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary text-primary text-[13px] font-semibold hover:bg-primary/5 transition-colors">
										{currentOption.icon}
										{currentOption.label}
										<ChevronDown size={13} />
									</button>
								</PopoverTrigger>

								<PopoverContent
									align="start"
									sideOffset={6}
									className="w-fit p-0 rounded-2xl border border-border shadow-xl"
								>
									<div className="px-2.5 pt-4 pb-2">
										<h3 className="font-bold text-foreground text-[15px] mb-3">Who can reply?</h3>
										<div className="flex flex-col">
											{REPLY_OPTIONS.map((opt) => (
												<button
													key={opt.value}
													onClick={() => {
														setWhoCanReply(opt.value)
														setReplyPickerOpen(false)
													}}
													className="flex items-center justify-between w-full px-2 py-2 rounded-xl hover:bg-accent transition-colors"
												>
													<div className="flex items-center gap-3">
														<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
															{opt.icon}
														</div>
														<span className="text-sm font-medium text-foreground pr-1.5">
															{opt.label}
														</span>
													</div>
													{whoCanReply === opt.value && (
														<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
															<Check size={11} className="text-primary-foreground" strokeWidth={3} />
														</div>
													)}
												</button>
											))}
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>

						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors">
								<X size={18} />
							</button>
						</Dialog.Close>
					</div>

					<div className="flex-1 overflow-y-auto px-4 pb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
						<div className="flex gap-3">
							{/* Current user avatar */}
							<div className="flex flex-col items-center shrink-0">
								<Avatar.Root className="w-10 h-10 rounded-full overflow-hidden">
									<Avatar.Image
										src={user?.profile_photo ?? undefined}
										alt={myName}
										className="w-full h-full object-cover"
									/>
									<Avatar.Fallback className="w-full h-full bg-primary/40 text-primary-foreground text-sm font-semibold flex items-center justify-center">
										{getInitials(user?.first_name ?? "", user?.last_name ?? "")}
									</Avatar.Fallback>
								</Avatar.Root>
							</div>

							<div className="flex-1 min-w-0 pt-1">
								{/* Reply textarea */}
								<textarea
									ref={textareaRef}
									value={text}
									onChange={(e) => setText(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
									}}
									placeholder="Add a comment"
									rows={2}
									autoFocus
									className="w-full resize-none text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent leading-relaxed"
								/>

								{/* Media grid */}
								{mediaItems.length > 0 && (
									<div
										className={`mt-2 rounded-xl overflow-hidden grid gap-0.5 ${mediaItems.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
									>
										{mediaItems.map((item) => (
											<div
												key={item.id}
												className="relative bg-muted aspect-video rounded-lg overflow-hidden"
											>
												{item.file.type.startsWith("video/") ? (
													<video src={item.preview} className="w-full h-full object-cover" />
												) : (
													<Image src={item.preview} alt="" fill={true} objectFit="cover" />
												)}

												{item.uploading && (
													<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
														<Loader2 size={22} className="animate-spin text-white" />
													</div>
												)}

												{item.error && (
													<div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5">
														<span className="text-white text-[11px]">Upload failed</span>
														<button
															onClick={() => uploadFile(item.id, item.file)}
															className="flex items-center gap-1 text-white text-[11px] bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1 transition-colors"
														>
															<RefreshCw size={11} /> Retry
														</button>
													</div>
												)}

												{!item.uploading && (
													<button
														onClick={() => removeMedia(item.id)}
														className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
													>
														<X size={12} />
													</button>
												)}
											</div>
										))}
									</div>
								)}

								{/* Location badge */}
								{locationLabel && (
									<div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
										<MapPin size={11} />
										{locationLabel}
										<button
											onClick={() => {
												setLocation(null)
												setLocationLabel(null)
											}}
											className="ml-0.5 hover:opacity-60"
										>
											<X size={10} />
										</button>
									</div>
								)}

								{/* Emoji picker */}
								{showEmoji && (
									<div className="mt-2 p-2 border border-border rounded-xl bg-card shadow-lg">
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

								{/* Quoted post card  */}
								<div className="mt-1.5">
									<QuotedPostCard post={asOriginalPost(post)} />
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
						<div className="flex items-center gap-0.5">
							{/* Media */}
							<button
								onClick={() => fileInputRef.current?.click()}
								disabled={mediaItems.length >= 4}
								title="Add photo or video"
								className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
							>
								<ImageIcon size={20} />
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*,video/*"
								multiple
								className="hidden"
								onChange={handleMediaSelect}
							/>

							{/* Emoji */}
							<button
								onClick={() => setShowEmoji((v) => !v)}
								title="Add emoji"
								className={`p-2 rounded-full transition-colors ${
									showEmoji ? "bg-primary/10 text-primary" : "text-primary hover:bg-primary/10"
								}`}
							>
								<Smile size={20} />
							</button>

							{/* Location */}
							<button
								onClick={handleLocation}
								disabled={fetchingLocation}
								title={locationLabel ? "Remove location" : "Add location"}
								className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
									locationLabel ? "bg-primary/10 text-primary" : "text-primary hover:bg-primary/10"
								}`}
							>
								<MapPin size={20} />
							</button>
						</div>

						<div className="flex items-center gap-3">
							{anyUploading && (
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<Loader2 size={12} className="animate-spin" /> Uploading…
								</span>
							)}
							<button
								onClick={handleSubmit}
								disabled={anyUploading || repost.isPending}
								className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
							>
								{repost.isPending ? "Posting…" : "Post"}
							</button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
