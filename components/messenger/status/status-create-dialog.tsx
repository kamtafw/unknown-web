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
import {
	Check,
	Globe,
	Image as ImageIcon,
	Loader2,
	Type as TypeIcon,
	Video as VideoIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

const BACKGROUND_COLORS = ["#0B7C6B", "#5B3FA0", "#B0413E", "#1D4E89", "#7A5C1E", "#333333"]
const CAPTION_MAX_LENGTH = 200

interface StatusCreateDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	/** "camera" opens straight into the file picker instead of landing on
	 * the text tab — powers the list panel's camera quick-action. Only
	 * consulted once, when the dialog transitions into the open state. */
	initialIntent?: "text" | "camera"
}

type PublishStage = "idle" | "uploading" | "posting" | "posted"

/** Reuses the SOCIALS upload endpoint, not the messenger one from SLICE C
 * — confirmed via mobile: status media goes through `socials/post/upload/
 * media` (folder="post"), and the web app already has this exact BFF
 * route + hook from before this project. Zero new upload infra needed.
 *
 * Audience row is deliberately read-only text, not a selector: the
 * backend has no status-privacy field anywhere in the confirmed contract
 * (CreateStatusPayload/UpdateStatusPayload), so a functioning "who can
 * see this" control would be fake. "Everyone" is stated because it's
 * genuinely true of how the feed endpoint works today, not as a stand-in
 * for a feature that doesn't exist yet.
 */
export function StatusCreateDialog({ open, onOpenChange, initialIntent }: StatusCreateDialogProps) {
	const [tab, setTab] = useState<"text" | "image" | "video">("text")
	const [text, setText] = useState("")
	const [caption, setCaption] = useState("")
	const [bgColor, setBgColor] = useState(BACKGROUND_COLORS[0])
	const [durationHours, setDurationHours] = useState<number>(DEFAULT_DURATION_HOURS)
	const [file, setFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<string | null>(null)
	const [stage, setStage] = useState<PublishStage>("idle")
	const fileInputRef = useRef<HTMLInputElement>(null)

	const createStatus = useCreateStatus()

	useEffect(() => {
		if (open && initialIntent === "camera") fileInputRef.current?.click()
		// Only meant to fire on the open transition, not on every re-render
		// while the dialog stays open (the file input's own onChange/cancel
		// shouldn't re-trigger this).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open])

	const reset = () => {
		setTab("text")
		setText("")
		setCaption("")
		setBgColor(BACKGROUND_COLORS[0])
		setDurationHours(DEFAULT_DURATION_HOURS)
		setFile(null)
		if (preview) URL.revokeObjectURL(preview)
		setPreview(null)
		setStage("idle")
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

	/** Brief, deliberate "Posted" confirmation before the dialog closes,
	 * rather than the composer vanishing the instant the request
	 * resolves — gives the publish action a visible endpoint instead of
	 * feeling like it just got interrupted. */
	const finishWithConfirmation = () => {
		setStage("posted")
		window.setTimeout(() => {
			reset()
			onOpenChange(false)
		}, 550)
	}

	const handlePost = async () => {
		if (tab === "text") {
			if (!text.trim()) return
			setStage("posting")
			try {
				await createStatus.mutateAsync({
					status_type: "text",
					content: text.trim(),
					background_color: bgColor,
					duration_hours: durationHours,
				})
				finishWithConfirmation()
			} catch {
				setStage("idle")
			}
			return
		}
		if (!file) return
		setStage("uploading")
		try {
			const [url] = await socialsApi.uploadMedia(file)
			if (!url) throw new Error("Upload returned no URL")
			setStage("posting")
			await createStatus.mutateAsync({
				status_type: tab,
				media: [
					{
						url,
						type: tab === "video" ? "video" : "image",
						...(caption.trim() ? { caption: caption.trim() } : {}),
					},
				],
				duration_hours: durationHours,
			})
			finishWithConfirmation()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to upload media")
			setStage("idle")
		}
	}

	const isBusy = stage !== "idle"
	const canPost = (tab === "text" ? text.trim().length > 0 : !!file) && !isBusy

	const publishLabel =
		stage === "uploading"
			? "Uploading…"
			: stage === "posting"
				? "Posting…"
				: stage === "posted"
					? "Posted"
					: "Post status"

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (isBusy) return
				onOpenChange(o)
				if (!o) reset()
			}}
		>
			<DialogContent className="flex h-[min(46rem,88vh)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-sm">
				<DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4">
					<DialogTitle className="text-base">New status</DialogTitle>
				</DialogHeader>

				<div className="flex shrink-0 items-center gap-1 px-4 pt-3">
					{(
						[
							{ key: "text", icon: TypeIcon, label: "Text" },
							{ key: "image", icon: ImageIcon, label: "Photo" },
							{ key: "video", icon: VideoIcon, label: "Video" },
						] as const
					).map(({ key, icon: Icon, label }) => (
						<button
							key={key}
							type="button"
							disabled={isBusy}
							onClick={() => (key === "text" ? setTab("text") : fileInputRef.current?.click())}
							className={cn(
								"flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
								tab === key
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-accent",
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

				{/* Preview fills the remaining height — the composer should feel
				 * like you're already looking at the story you're about to
				 * publish, not filling out a form with a thumbnail attached. */}
				<div className="relative mx-4 mt-3 mb-2 min-h-0 flex-1 overflow-hidden rounded-2xl">
					{tab === "text" ? (
						<div
							className="flex h-full w-full items-center justify-center p-6 text-center"
							style={{ backgroundColor: bgColor }}
						>
							<textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder="Type a status"
								rows={4}
								autoFocus
								className="w-full resize-none bg-transparent text-center text-xl font-medium text-white outline-none placeholder:text-white/60"
							/>
						</div>
					) : (
						<div className="relative h-full w-full bg-black">
							{tab === "image" && preview && (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={preview} alt="Preview" className="h-full w-full object-contain" />
							)}
							{tab === "video" && preview && (
								<video
									src={preview}
									controls
									muted
									playsInline
									className="h-full w-full object-contain"
								/>
							)}

							{!preview && (
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/50 transition-colors hover:text-white/70"
								>
									{tab === "video" ? <VideoIcon size={28} /> : <ImageIcon size={28} />}
									<span className="text-sm">Select media to share</span>
								</button>
							)}

							{(stage === "uploading" || stage === "posting") && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/50">
									<Loader2 size={26} className="animate-spin text-white" />
								</div>
							)}
							{stage === "posted" && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/50">
									<span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black">
										<Check size={20} strokeWidth={2.5} />
									</span>
								</div>
							)}

							{/* Caption overlay — contextual to the media, not a separate
							 * form field below it. Blank + unfocused shows the
							 * placeholder; the gradient scrim keeps it legible over
							 * bright media without boxing it in a card. */}
							{preview && (
								<div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/20 to-transparent px-3 pt-10 pb-3">
									<textarea
										value={caption}
										onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX_LENGTH))}
										placeholder="Add a caption…"
										rows={1}
										disabled={isBusy}
										className="max-h-20 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/60"
									/>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="shrink-0 px-5 pb-5">
					{tab === "text" && (
						<div className="mb-3 flex items-center gap-2">
							{BACKGROUND_COLORS.map((color) => (
								<button
									key={color}
									type="button"
									aria-label={`Background color ${color}`}
									aria-pressed={bgColor === color}
									onClick={() => setBgColor(color)}
									className={cn(
										"h-6 w-6 rounded-full border-2 transition-transform",
										bgColor === color ? "scale-110 border-foreground" : "border-transparent",
									)}
									style={{ backgroundColor: color }}
								/>
							))}
						</div>
					)}

					<div className="mb-3 flex items-center justify-between gap-3">
						<span className="text-xs font-medium text-muted-foreground">Visible for</span>
						<div className="flex items-center gap-1.5">
							{DURATION_PRESETS_HOURS.map((hours) => (
								<button
									key={hours}
									type="button"
									disabled={isBusy}
									onClick={() => setDurationHours(hours)}
									className={cn(
										"rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
										durationHours === hours
											? "border-primary bg-primary text-primary-foreground"
											: "border-border text-muted-foreground hover:bg-accent",
									)}
								>
									{hours}h
								</button>
							))}
						</div>
					</div>

					<div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
						<Globe size={13} />
						Status audience — Everyone
					</div>

					<button
						onClick={handlePost}
						disabled={!canPost}
						className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
					>
						{(stage === "uploading" || stage === "posting") && (
							<Loader2 size={15} className="animate-spin" />
						)}
						{stage === "posted" && <Check size={15} />}
						{publishLabel}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
