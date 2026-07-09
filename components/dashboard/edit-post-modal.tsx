"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUpdatePost } from "@/hooks/use-post-actions"
import { socialApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { MediaItem, Post, UpdatePostPayload, WhoCanReply } from "@/types/api"
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

interface ExistingMedia {
	url: string
	removed: boolean
}

interface EditPostModalProps {
	post: Post
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function EditPostModal({ post, open, onOpenChange }: EditPostModalProps) {
	const user = useAuthStore((s) => s.user)
	const updatePost = useUpdatePost()

	const [text, setText] = useState(post.content_text ?? "")
	const [whoCanReply, setWhoCanReply] = useState<WhoCanReply>(post.who_can_reply)
	const [replyPickerOpen, setReplyPickerOpen] = useState(false)

	const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>(
		post.post_media.map((m) => ({ url: m.external_url, removed: false })),
	)
	const [newMediaItems, setNewMediaItems] = useState<MediaItem[]>([])
	const [showEmoji, setShowEmoji] = useState(false)

	const initialLocation = post.post_location[0] ?? null
	const [location, setLocation] = useState<{ longitude: string; latitude: string } | null>(
		initialLocation
			? { longitude: initialLocation.longitude, latitude: initialLocation.latitude }
			: null,
	)
	const [locationRemoved, setLocationRemoved] = useState(false)
	const [locationLabel, setLocationLabel] = useState<string | null>(
		initialLocation?.address ??
			(initialLocation ? `${initialLocation.latitude}, ${initialLocation.longitude}` : null),
	)
	const [fetchingLocation, setFetchingLocation] = useState(false)

	const fileInputRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const currentOption = REPLY_OPTIONS.find((o) => o.value === whoCanReply) ?? REPLY_OPTIONS[0]

	const keptExistingUrls = existingMedia.filter((m) => !m.removed).map((m) => m.url)
	const uploadedNewUrls = newMediaItems.flatMap((m) => m.urls ?? [])
	const finalMediaUrls = [...keptExistingUrls, ...uploadedNewUrls]

	const anyUploading = newMediaItems.some((m) => m.uploading)
	const hasContent = text.trim().length > 0 || finalMediaUrls.length > 0

	const originalUrls = post.post_media.map((m) => m.external_url)
	const mediaChanged =
		finalMediaUrls.length !== originalUrls.length ||
		finalMediaUrls.some((u, i) => u !== originalUrls[i])

	const isDirty =
		text.trim() !== (post.content_text ?? "").trim() ||
		whoCanReply !== post.who_can_reply ||
		mediaChanged ||
		locationRemoved ||
		(!initialLocation && !!location)

	const canSubmit = hasContent && !anyUploading && isDirty && !updatePost.isPending

	const reset = () => {
		newMediaItems.forEach((m) => URL.revokeObjectURL(m.preview))
		setText(post.content_text ?? "")
		setWhoCanReply(post.who_can_reply)
		setExistingMedia(post.post_media.map((m) => ({ url: m.external_url, removed: false })))
		setNewMediaItems([])
		setShowEmoji(false)
		setLocationRemoved(false)
		setLocation(
			initialLocation
				? { longitude: initialLocation.longitude, latitude: initialLocation.latitude }
				: null,
		)
		setLocationLabel(initialLocation?.address ?? null)
	}

	const uploadFile = async (id: string, file: File) => {
		setNewMediaItems((prev) =>
			prev.map((m) => (m.id === id ? { ...m, uploading: true, error: false } : m)),
		)
		try {
			const urls = await socialApi.uploadMedia(file)
			setNewMediaItems((prev) =>
				prev.map((m) => (m.id === id ? { ...m, urls, uploading: false } : m)),
			)
		} catch {
			setNewMediaItems((prev) =>
				prev.map((m) => (m.id === id ? { ...m, uploading: false, error: true } : m)),
			)
		}
	}

	const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const remaining = 4 - keptExistingUrls.length - newMediaItems.length
		const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, remaining))
		files.forEach((file) => {
			const id = crypto.randomUUID()
			const preview = URL.createObjectURL(file)
			setNewMediaItems((prev) => [
				...prev,
				{ id, file, preview, urls: null, uploading: true, error: false },
			])
			uploadFile(id, file)
		})
		e.target.value = ""
	}

	const removeExistingMedia = (url: string) => {
		setExistingMedia((prev) => prev.map((m) => (m.url === url ? { ...m, removed: true } : m)))
	}

	const removeNewMedia = (id: string) => {
		setNewMediaItems((prev) => {
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
			content_text: text.trim(),
			who_can_reply: whoCanReply,
			media_urls: finalMediaUrls,
			hashtags,
			location: locationRemoved ? null : (location ?? undefined),
		}

		updatePost.mutate(
			{ pkid: post.pkid, payload },
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
						</div>

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
							className="w-full resize-none text-[15px] text-foreground placeholder:text-muted-foreground outline-none bg-transparent leading-relaxed mb-3"
						/>

						{(keptExistingUrls.length > 0 || newMediaItems.length > 0) && (
							<div className="mb-3 rounded-xl overflow-hidden grid gap-1 grid-cols-2">
								{existingMedia
									.filter((m) => !m.removed)
									.map((m) => (
										<div
											key={m.url}
											className="relative bg-muted overflow-hidden rounded-lg aspect-square"
										>
											<Image src={m.url} alt="" fill className="object-cover" />
											<button
												onClick={() => removeExistingMedia(m.url)}
												className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
											>
												<X size={12} />
											</button>
										</div>
									))}

								{newMediaItems.map((item) => (
									<div
										key={item.id}
										className="relative bg-muted overflow-hidden rounded-lg aspect-square"
									>
										{item.file.type.startsWith("video/") ? (
											<video src={item.preview} className="w-full h-full object-cover" />
										) : (
											<Image src={item.preview} alt="" fill className="object-cover" />
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
												onClick={() => removeNewMedia(item.id)}
												className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
											>
												<X size={12} />
											</button>
										)}
									</div>
								))}
							</div>
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
						<Popover open={replyPickerOpen} onOpenChange={setReplyPickerOpen}>
							<PopoverTrigger asChild>
								<button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted hover:bg-accent transition-colors text-sm text-muted-foreground">
									<span className="shrink-0">{currentOption.icon}</span>
									<span className="flex-1 text-left text-[13px]">Who can reply to this post?</span>
									<ChevronDown size={14} className="text-muted-foreground shrink-0" />
								</button>
							</PopoverTrigger>

							<PopoverContent
								align="start"
								sideOffset={6}
								className="w-130 p-0 rounded-2xl border border-border shadow-xl"
							>
								<div className="px-3 pt-3 pb-4">
									<h3 className="font-bold text-foreground text-[15px] mb-3">Who can reply?</h3>
									<div className="flex flex-col gap-0.5">
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
													<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
														{opt.icon}
													</div>
													<span className="text-sm font-medium text-foreground">{opt.label}</span>
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

					<div className="flex items-center justify-between px-4 py-3 shrink-0 border-t border-border">
						<div className="flex items-center gap-0.5">
							<button
								onClick={() => fileInputRef.current?.click()}
								disabled={keptExistingUrls.length + newMediaItems.length >= 4}
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
							{anyUploading && (
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<Loader2 size={12} className="animate-spin" /> Uploading…
								</span>
							)}
							<button
								onClick={handleSubmit}
								disabled={!canSubmit}
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
