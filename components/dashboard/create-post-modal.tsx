"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCreatePost } from "@/hooks/use-create-post"
import { socialApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { CreatePostPayload, MediaItem, WhoCanReply } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import {
	Camera,
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
import { getInitials } from "./post-card"

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
	return (str.match(/#\w+/g) ?? []).map((h) => h.replace("#", ""))
}

interface CreatePostModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
	const user = useAuthStore((s) => s.user)
	const createPost = useCreatePost()

	const [text, setText] = useState("")
	const [whoCanReply, setWhoCanReply] = useState<WhoCanReply>("EVERYONE")
	const [replyPickerOpen, setReplyPickerOpen] = useState(false)
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
	const [showEmoji, setShowEmoji] = useState(false)
	const [location, setLocation] = useState<{ longitude: string; latitude: string } | null>(null)
	const [locationLabel, setLocationLabel] = useState<string | null>(null)
	const [fetchingLocation, setFetchingLocation] = useState(false)

	const fileInputRef = useRef<HTMLInputElement>(null)
	const cameraInputRef = useRef<HTMLInputElement>(null)
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
		const payload: CreatePostPayload = {
			content_text: text.trim(),
			who_can_see: "EVERYONE",
			who_can_reply: whoCanReply,
			is_shared: null,
			is_repost: false,
			original_post: null,
			location: location ?? undefined,
			hashtags: hashtags.length ? hashtags : undefined,
			media_urls: uploadedUrls.length ? uploadedUrls : undefined,
		}

		createPost.mutate(payload)

		reset()
		onOpenChange(false)
	}

	const mediaCount = mediaItems.length

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
						bg-white rounded-2xl shadow-2xl
						flex flex-col
						focus:outline-none
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
					"
				>
					<div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
						<Dialog.Title className="text-lg font-bold text-gray-900">Create post</Dialog.Title>
						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
								<X size={18} />
							</button>
						</Dialog.Close>
					</div>

					<Dialog.Description className="sr-only">Write and publish a new post</Dialog.Description>

					<div className="flex-1 overflow-y-auto px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
						{/* User row */}
						<div className="flex gap-3 mb-4">
							<Avatar.Root className="w-10 h-10 rounded-full overflow-hidden shrink-0">
								<Avatar.Image
									src={user?.profile_photo ?? undefined}
									alt={myName}
									className="w-full h-full object-cover"
								/>
								<Avatar.Fallback className="w-full h-full bg-primary/40 text-white text-sm font-semibold flex items-center justify-center">
									{getInitials(user?.first_name ?? "", user?.last_name ?? "")}
								</Avatar.Fallback>
							</Avatar.Root>

							<div className="flex flex-col justify-center min-w-0">
								<span className="text-sm font-semibold text-gray-900 leading-tight">{myName}</span>
								<span className="text-xs text-gray-500">@{user?.username}</span>
							</div>
						</div>

						{/* Textarea */}
						<textarea
							ref={textareaRef}
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
							}}
							placeholder="What's on your mind?"
							rows={3}
							autoFocus
							className="w-full resize-none text-[15px] text-gray-900 placeholder:text-gray-400 outline-none bg-transparent leading-relaxed mb-3"
						/>

						{/* Media grid */}
						{mediaCount > 0 && (
							<div
								className={`mb-3 rounded-xl overflow-hidden grid gap-1 ${
									mediaCount === 1
										? "grid-cols-1"
										: mediaCount === 2
											? "grid-cols-2"
											: mediaCount === 3
												? "grid-cols-2"
												: "grid-cols-2"
								}`}
							>
								{mediaItems.map((item, i) => {
									const isVideo = item.file.type.startsWith("video/")
									const spanClass = mediaCount === 3 && i === 0 ? "row-span-2" : ""
									const aspect = mediaCount === 1 ? "aspect-video" : "aspect-square"
									return (
										<div
											key={item.id}
											className={`relative bg-gray-100 overflow-hidden rounded-lg ${spanClass} ${aspect}`}
										>
											{isVideo ? (
												<video src={item.preview} className="w-full h-full object-cover" />
											) : (
												<Image src={item.preview} alt="" className="w-full h-full object-cover" />
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
									)
								})}
							</div>
						)}

						{/* Location badge */}
						{locationLabel && (
							<div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
								<MapPin size={11} />
								Using live location
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
							<div className="mb-3 p-2 border border-gray-200 rounded-xl bg-white shadow-lg">
								<div className="grid grid-cols-10 gap-0.5">
									{EMOJIS.map((e) => (
										<button
											key={e}
											onClick={() => handleEmojiClick(e)}
											className="w-8 h-8 text-lg rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
										>
											{e}
										</button>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="px-5 pb-3 shrink-0">
						<Popover open={replyPickerOpen} onOpenChange={setReplyPickerOpen}>
							<PopoverTrigger asChild>
								<button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-600">
									<span className="shrink-0">{currentOption.icon}</span>
									<span className="flex-1 text-left text-[13px]">Who can reply to this post?</span>
									<ChevronDown size={14} className="text-gray-400 shrink-0" />
								</button>
							</PopoverTrigger>

							<PopoverContent
								align="start"
								sideOffset={6}
								className="w-130 p-0 rounded-2xl border border-gray-100 shadow-xl"
							>
								{/* Who can reply */}
								<div className="px-3 pt-3 pb-4">
									<h3 className="font-bold text-gray-900 text-[15px] mb-3">Who can reply?</h3>
									<div className="flex flex-col gap-0.5">
										{REPLY_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												onClick={() => {
													setWhoCanReply(opt.value)
													setReplyPickerOpen(false)
												}}
												className="flex items-center justify-between w-full px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors"
											>
												<div className="flex items-center gap-3">
													<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
														{opt.icon}
													</div>
													<span className="text-sm font-medium text-gray-900">{opt.label}</span>
												</div>
												{whoCanReply === opt.value && (
													<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
														<Check size={11} className="text-white" strokeWidth={3} />
													</div>
												)}
											</button>
										))}
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>

					<div className="flex items-center justify-between px-4 py-3 shrink-0 border-t border-gray-100">
						<div className="flex items-center gap-0.5">
							{/* Gallery */}
							<button
								onClick={() => fileInputRef.current?.click()}
								disabled={mediaCount >= 4}
								title="Add photo or video"
								className="p-2.5 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
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

							{/* Camera */}
							<button
								onClick={() => cameraInputRef.current?.click()}
								disabled={mediaCount >= 4}
								title="Take a photo"
								className="p-2.5 rounded-full text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
							>
								<Camera size={20} />
							</button>
							<input
								ref={cameraInputRef}
								type="file"
								accept="image/*"
								capture="environment"
								className="hidden"
								onChange={handleMediaSelect}
							/>

							{/* Location */}
							<button
								onClick={handleLocation}
								disabled={fetchingLocation}
								title={locationLabel ? "Remove location" : "Add live location"}
								className={`p-2.5 rounded-full transition-colors disabled:opacity-50 ${
									locationLabel ? "bg-primary/10 text-primary" : "text-primary hover:bg-gray-100"
								}`}
							>
								<MapPin size={20} />
							</button>

							{/* Hashtag / emoji */}
							<button
								onClick={() => setShowEmoji((v) => !v)}
								title="Add emoji"
								className={`p-2.5 rounded-full transition-colors ${
									showEmoji ? "bg-primary/10 text-primary" : "text-primary hover:bg-gray-100"
								}`}
							>
								<Smile size={20} />
							</button>
						</div>

						<div className="flex items-center gap-3">
							{anyUploading && (
								<span className="text-xs text-gray-400 flex items-center gap-1.5">
									<Loader2 size={12} className="animate-spin" /> Uploading…
								</span>
							)}
							<button
								onClick={handleSubmit}
								disabled={!canSubmit || createPost.isPending}
								className="px-6 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
							>
								{createPost.isPending ? "Posting…" : "Post"}
							</button>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
