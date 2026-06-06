"use client"

import { useUpdateBio, useUpdateName, useUpdateUsername } from "@/hooks/use-update-profile"
import { extractFieldErrors } from "@/lib/api-error"
import { useAuthStore } from "@/stores/auth-store"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const BIO_MAX = 160

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-6 pt-4.5 pb-4 border-b border-gray-100 shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
				aria-label="Back"
			>
				<ArrowLeft size={15} className="text-gray-600" />
			</button>
			<h2 className="font-bold text-gray-900">{title}</h2>
		</div>
	)
}

function PanelSave({
	onSave,
	disabled,
	pending,
}: {
	onSave: () => void
	disabled: boolean
	pending: boolean
}) {
	return (
		<div className="shrink-0 flex justify-end px-6 py-4 border-t border-gray-100">
			<button
				onClick={onSave}
				disabled={disabled}
				className="h-9 px-6 rounded-full bg-primary text-white text-[13px] font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
			>
				{pending && <Loader2 size={13} className="animate-spin" />}
				Save
			</button>
		</div>
	)
}

/**
 * Twitter/X-style floating label field — label sits above the value
 * inside the border so the field reads as a single contained unit.
 */
function FloatingField({
	label,
	error,
	children,
}: {
	label: string
	error?: string
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col gap-1">
			<div
				className={`rounded-xl border px-3.5 pt-2 pb-2.5 transition-colors ${
					error
						? "border-destructive"
						: "border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/10"
				}`}
			>
				<span className="block text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
					{label}
				</span>
				{children}
			</div>
			{error && <p className="text-xs text-destructive px-0.5">{error}</p>}
		</div>
	)
}

export function EditNamePanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateName = useUpdateName()

	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		const u = useAuthStore.getState().user
		setFirstName(u?.first_name ?? "")
		setLastName(u?.last_name ?? "")
	}, [])

	const isDirty =
		firstName.trim() !== (user?.first_name ?? "") || lastName.trim() !== (user?.last_name ?? "")

	const handleSave = () => {
		if (!isDirty || updateName.isPending) return
		setErrors({})
		updateName.mutate(
			{ first_name: firstName.trim(), last_name: lastName.trim() },
			{
				onSuccess: (data) => {
					if (data.success) onBack()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Name" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5 flex flex-col gap-4">
				<FloatingField label="First name" error={errors.first_name}>
					<input
						type="text"
						value={firstName}
						autoFocus
						placeholder="First name"
						onChange={(e) => {
							setFirstName(e.target.value)
							if (errors.first_name) setErrors((p) => ({ ...p, first_name: "" }))
						}}
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-300"
					/>
				</FloatingField>

				<FloatingField label="Last name" error={errors.last_name}>
					<input
						type="text"
						value={lastName}
						placeholder="Last name"
						onChange={(e) => {
							setLastName(e.target.value)
							if (errors.last_name) setErrors((p) => ({ ...p, last_name: "" }))
						}}
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-300"
					/>
				</FloatingField>

				<p className="text-[12.5px] text-gray-400 leading-relaxed">
					Your name can only be changed once every 7 days.
				</p>
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!isDirty || updateName.isPending}
				pending={updateName.isPending}
			/>
		</div>
	)
}

export function EditUsernamePanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateUsername = useUpdateUsername()

	const [username, setUsername] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		const u = useAuthStore.getState().user
		setUsername(u?.username ?? "")
	}, [])

	const isDirty = username !== (user?.username ?? "")
	const isValidFormat = /^[a-zA-Z0-9_]{1,30}$/.test(username)
	// Only show format error once they've typed something invalid — not on empty
	const formatError =
		username.length > 0 && !isValidFormat
			? "Only letters, numbers, and underscores — up to 30 characters."
			: undefined
	const displayError = errors.username ?? formatError

	const handleSave = () => {
		if (!isDirty || !isValidFormat || updateUsername.isPending) return
		setErrors({})
		updateUsername.mutate(
			{ username },
			{
				onSuccess: (data) => {
					if (data.success) onBack()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Username" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5 flex flex-col gap-5">
				<FloatingField label="Username" error={displayError}>
					<div className="flex items-center gap-0.5">
						<span className="text-sm text-gray-400 select-none shrink-0">@</span>
						<input
							type="text"
							value={username}
							autoFocus
							placeholder="username"
							onChange={(e) => {
								// Strip disallowed chars inline so the field never shows invalid chars
								const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30)
								setUsername(val)
								if (errors.username) setErrors((p) => ({ ...p, username: "" }))
							}}
							onKeyDown={(e) => e.key === "Enter" && handleSave()}
							className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-300"
						/>
						<span
							className={`text-xs tabular-nums shrink-0 ml-2 transition-colors ${
								username.length >= 28 ? "text-amber-400" : "text-gray-300"
							}`}
						>
							{username.length}/30
						</span>
					</div>
				</FloatingField>

				<p className="text-[12.5px] text-gray-400 leading-relaxed">
					Usernames can contain only letters, numbers, underscores, and periods. You also can only
					change your username every 180 days.
				</p>
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!isDirty || !isValidFormat || updateUsername.isPending}
				pending={updateUsername.isPending}
			/>
		</div>
	)
}

// ─── Edit Bio ─────────────────────────────────────────────────────────────────

export function EditBioPanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateBio = useUpdateBio()
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const [bio, setBio] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		const u = useAuthStore.getState().user
		setBio(u?.profile?.about_me ?? "")
		// Slight delay so the panel transition completes before focus
		setTimeout(() => textareaRef.current?.focus(), 60)
	}, [])

	const isDirty = bio !== (user?.profile?.about_me ?? "")
	const remaining = BIO_MAX - bio.length
	const overLimit = remaining < 0

	const handleSave = () => {
		if (!isDirty || overLimit || updateBio.isPending) return
		setErrors({})
		updateBio.mutate(
			{ about_me: bio },
			{
				onSuccess: (data) => {
					if (data.success) onBack()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Bio" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5">
				<div className="flex flex-col gap-1">
					<div
						className={`rounded-xl border px-3.5 pt-2 pb-2.5 transition-colors ${
							errors.about_me || overLimit
								? "border-destructive"
								: "border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/10"
						}`}
					>
						<span className="block text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
							Bio
						</span>
						<textarea
							ref={textareaRef}
							value={bio}
							rows={5}
							placeholder="Tell people a little about yourself…"
							onChange={(e) => {
								setBio(e.target.value)
								if (errors.about_me) setErrors((p) => ({ ...p, about_me: "" }))
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave()
							}}
							className="w-full bg-transparent text-sm text-gray-900 outline-none resize-none leading-relaxed placeholder:text-gray-300"
						/>
						<div className="flex justify-end mt-1">
							<span
								className={`text-xs tabular-nums transition-colors ${
									overLimit
										? "text-destructive font-semibold"
										: remaining <= 20
											? "text-amber-400"
											: "text-gray-300"
								}`}
							>
								{remaining}
							</span>
						</div>
					</div>
					{errors.about_me && <p className="text-xs text-destructive px-0.5">{errors.about_me}</p>}
					<p className="text-[11px] text-gray-400 mt-1 px-0.5">⌘ + Enter to save</p>
				</div>
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!isDirty || overLimit || updateBio.isPending}
				pending={updateBio.isPending}
			/>
		</div>
	)
}
