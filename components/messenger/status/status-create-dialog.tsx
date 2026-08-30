"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateStatus } from "@/hooks/messenger/use-status"
import { classifyMediaType } from "@/lib/messenger/media"
import {
	DEFAULT_DURATION_HOURS,
	DURATION_PRESETS_HOURS,
	STATUS_VIDEO_MAX_SECONDS,
} from "@/lib/messenger/status"
import { socialsApi } from "@/lib/socials/api"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Image as ImageIcon, Loader2, Type as TypeIcon, Video as VideoIcon } from "lucide-react"
import { useRef, useState } from "react"

const BACKGROUND_COLORS = ["#0B7C6B", "#5B3FA0", "#B0413E", "#1D4E89", "#7A5C1E", "#333333"]

interface StatusCreateDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/** Reuses the SOCIALS upload endpoint, not the messenger one from SLICE C
 * — confirmed via mobile: status media goes through `socials/post/upload/
 * media` (folder="post"), and the web app already has this exact BFF
 * route + hook from before this project. Zero new upload infra needed. */
export function StatusCreateDialog({ open, onOpenChange }: StatusCreateDialogProps) {
	const [tab, setTab] = useState<"text" | "image" | "video">("text")
	const [text, setText] = useState("")
	const [bgColor, setBgColor] = useState(BACKGROUND_COLORS[0])
	const [durationHours, setDurationHours] = useState<number>(DEFAULT_DURATION_HOURS)
	const [file, setFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<string | null>(null)
	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const createStatus = useCreateStatus()

	const reset = () => {
		setTab("text")
		setText("")
		setBgColor(BACKGROUND_COLORS[0])
		setDurationHours(DEFAULT_DURATION_HOURS)
		setFile(null)
		if (preview) URL.revokeObjectURL(preview)
		setPreview(null)
	}

	const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
		const picked = e.target.files?.[0]
		if (!picked) return
		if (classifyMediaType(picked.type) === "video") {
			const video = document.createElement("video")
			video.preload = "metadata"
			video.onloadedmetadata = () => {
				URL.revokeObjectURL(video.src)
				if (video.duration > STATUS_VIDEO_MAX_SECONDS) {
					toast.error(`Videos can be up to ${STATUS_VIDEO_MAX_SECONDS} seconds long`)
					return
				}
				setTab("video")
				setFile(picked)
				setPreview(URL.createObjectURL(picked))
			}
			video.src = URL.createObjectURL(picked)
		} else {
			setTab("image")
			setFile(picked)
			setPreview(URL.createObjectURL(picked))
		}
		e.target.value = ""
	}

	const handlePost = async () => {
		if (tab === "text") {
			if (!text.trim()) return
			await createStatus.mutateAsync({
				status_type: "text",
				content: text.trim(),
				background_color: bgColor,
				duration_hours: durationHours,
			})
			reset()
			onOpenChange(false)
			return
		}
		if (!file) return
		setUploading(true)
		try {
			const [url] = await socialsApi.uploadMedia(file)
			if (!url) throw new Error("Upload returned no URL")
			await createStatus.mutateAsync({
				status_type: tab,
				media: [{ url, type: tab === "video" ? "video" : "image" }],
				duration_hours: durationHours,
			})
			reset()
			onOpenChange(false)
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to upload media")
		} finally {
			setUploading(false)
		}
	}

	const canPost = tab === "text" ? text.trim().length > 0 : !!file && !uploading

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				onOpenChange(o)
				if (!o) reset()
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>New status</DialogTitle>
				</DialogHeader>

				<div className="flex items-center gap-1 p-1 rounded-full bg-muted">
					{(
						[
							{ key: "text", icon: TypeIcon, label: "Text" },
							{ key: "image", icon: ImageIcon, label: "Photo" },
							{ key: "video", icon: VideoIcon, label: "Video" },
						] as const
					).map(({ key, icon: Icon, label }) => (
						<button
							key={key}
							onClick={() => (key === "text" ? setTab("text") : fileInputRef.current?.click())}
							className={cn(
								"flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
								tab === key ? "bg-background shadow-sm" : "text-muted-foreground",
							)}
						>
							<Icon size={14} /> {label}
						</button>
					))}
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*,video/*"
					className="hidden"
					onChange={handlePick}
				/>

				{tab === "text" ? (
					<div className="flex flex-col gap-3">
						<div
							className="flex items-center justify-center rounded-2xl min-h-40 p-6 text-center"
							style={{ backgroundColor: bgColor }}
						>
							<textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder="Type a status"
								rows={3}
								className="w-full bg-transparent text-white text-lg font-medium text-center outline-none resize-none placeholder:text-white/70"
							/>
						</div>
						<div className="flex items-center gap-2">
							{BACKGROUND_COLORS.map((color) => (
								<button
									key={color}
									onClick={() => setBgColor(color)}
									className={cn(
										"h-7 w-7 rounded-full border-2 transition-transform",
										bgColor === color ? "border-foreground scale-110" : "border-transparent",
									)}
									style={{ backgroundColor: color }}
								/>
							))}
						</div>
					</div>
				) : (
					<div className="relative flex items-center justify-center rounded-lg bg-muted overflow-hidden max-h-72">
						{tab === "image" && preview && (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={preview} alt="Preview" className="max-h-72 w-auto object-contain" />
						)}
						{tab === "video" && preview && (
							<video src={preview} controls className="max-h-72 w-full" />
						)}
						{uploading && (
							<div className="absolute inset-0 flex items-center justify-center bg-background/60">
								<Loader2 size={24} className="animate-spin text-muted-foreground" />
							</div>
						)}
					</div>
				)}

				<div>
					<p className="mb-1.5 text-xs font-medium text-muted-foreground">Visible for</p>
					<div className="flex items-center gap-2">
						{DURATION_PRESETS_HOURS.map((hours) => (
							<button
								key={hours}
								onClick={() => setDurationHours(hours)}
								className={cn(
									"flex-1 py-1.5 rounded-full text-sm font-medium border transition-colors",
									durationHours === hours
										? "bg-primary text-primary-foreground border-primary"
										: "border-border text-muted-foreground hover:bg-accent",
								)}
							>
								{hours}h
							</button>
						))}
					</div>
				</div>

				<button
					onClick={handlePost}
					disabled={!canPost || createStatus.isPending}
					className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
				>
					{createStatus.isPending || uploading ? "Posting…" : "Post status"}
				</button>
			</DialogContent>
		</Dialog>
	)
}
