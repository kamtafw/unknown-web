"use client"

import { useUpdateBio, useUpdateName, useUpdateUsername } from "@/hooks/use-update-profile"
import { extractFieldErrors } from "@/lib/api-error"
import { useAuthStore } from "@/stores/auth-store"
import * as Dialog from "@radix-ui/react-dialog"
import { Loader2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const BIO_MAX = 160

// ─── Shared primitives ────────────────────────────────────────────────────────

function DialogShell({
	open,
	onClose,
	title,
	description,
	children,
}: {
	open: boolean
	onClose: () => void
	title: string
	description?: string
	children: React.ReactNode
}) {
	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-[12%] -translate-x-1/2 z-50 w-full max-w-110 bg-white rounded-2xl shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col overflow-hidden">
					<div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
						<div className="pr-4 min-w-0">
							<Dialog.Title className="font-bold text-gray-900 text-[15.5px] leading-tight">
								{title}
							</Dialog.Title>
							{description && (
								<Dialog.Description className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">
									{description}
								</Dialog.Description>
							)}
						</div>
						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors shrink-0 mt-0.5">
								<X size={15} />
							</button>
						</Dialog.Close>
					</div>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

function FieldLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
			{children}
		</span>
	)
}

function FieldError({ message }: { message?: string }) {
	if (!message) return null
	return <p className="text-xs text-destructive mt-1">{message}</p>
}

function DialogFooter({
	onClose,
	onSave,
	disabled,
	pending,
}: {
	onClose: () => void
	onSave: () => void
	disabled: boolean
	pending: boolean
}) {
	return (
		<div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100 shrink-0">
			<Dialog.Close asChild>
				<button
					onClick={onClose}
					className="h-9 px-5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
				>
					Cancel
				</button>
			</Dialog.Close>
			<button
				onClick={onSave}
				disabled={disabled}
				className="h-9 px-5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
			>
				{pending && <Loader2 size={13} className="animate-spin" />}
				Save
			</button>
		</div>
	)
}

// ─── Edit Name ────────────────────────────────────────────────────────────────

export function EditNameDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateName = useUpdateName()

	const [firstName, setFirstName] = useState("")
	const [lastName, setLastName] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (!open) return
		const u = useAuthStore.getState().user
		setFirstName(u?.first_name ?? "")
		setLastName(u?.last_name ?? "")
		setErrors({})
	}, [open])

	const isDirty =
		firstName.trim() !== (user?.first_name ?? "") || lastName.trim() !== (user?.last_name ?? "")

	const handleSave = () => {
		if (!isDirty || updateName.isPending) return
		setErrors({})
		updateName.mutate(
			{ first_name: firstName.trim(), last_name: lastName.trim() },
			{
				onSuccess: (data) => {
					if (data.success) onClose()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	return (
		<DialogShell open={open} onClose={onClose} title="Update name">
			<div className="px-6 py-5 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<FieldLabel>First name</FieldLabel>
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
						className={`h-10 w-full rounded-xl border px-3.5 text-sm text-gray-900 bg-white outline-none transition-colors focus:ring-1 focus:ring-primary/20 ${errors.first_name ? "border-destructive focus:border-destructive" : "border-gray-200 focus:border-primary"}`}
					/>
					<FieldError message={errors.first_name} />
				</div>

				<div className="flex flex-col gap-1.5">
					<FieldLabel>Last name</FieldLabel>
					<input
						type="text"
						value={lastName}
						placeholder="Last name"
						onChange={(e) => {
							setLastName(e.target.value)
							if (errors.last_name) setErrors((p) => ({ ...p, last_name: "" }))
						}}
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						className={`h-10 w-full rounded-xl border px-3.5 text-sm text-gray-900 bg-white outline-none transition-colors focus:ring-1 focus:ring-primary/20 ${errors.last_name ? "border-destructive focus:border-destructive" : "border-gray-200 focus:border-primary"}`}
					/>
					<FieldError message={errors.last_name} />
				</div>
			</div>

			<DialogFooter
				onClose={onClose}
				onSave={handleSave}
				disabled={!isDirty || updateName.isPending}
				pending={updateName.isPending}
			/>
		</DialogShell>
	)
}

// ─── Edit Username ────────────────────────────────────────────────────────────

export function EditUsernameDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateUsername = useUpdateUsername()

	const [username, setUsername] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (!open) return
		const u = useAuthStore.getState().user
		setUsername(u?.username ?? "")
		setErrors({})
	}, [open])

	const isDirty = username !== (user?.username ?? "")
	// Allow letters, numbers, underscores — 1–30 chars
	const isValidFormat = /^[a-zA-Z0-9_]{1,30}$/.test(username)
	const formatError =
		username.length > 0 && !isValidFormat
			? "Only letters, numbers, and underscores are allowed."
			: undefined

	const handleSave = () => {
		if (!isDirty || !isValidFormat || updateUsername.isPending) return
		setErrors({})
		updateUsername.mutate(
			{ username },
			{
				onSuccess: (data) => {
					if (data.success) onClose()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	const displayError = errors.username ?? formatError

	return (
		<DialogShell
			open={open}
			onClose={onClose}
			title="Change username"
			description="Usernames can only contain letters, numbers, and underscores — up to 30 characters."
		>
			<div className="px-6 py-5">
				<div className="flex flex-col gap-1.5">
					<FieldLabel>Username</FieldLabel>
					<div
						className={`flex items-center h-10 w-full rounded-xl border bg-white transition-colors ${displayError ? "border-destructive" : "border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"}`}
					>
						<span className="pl-3.5 text-sm text-gray-400 select-none shrink-0">@</span>
						<input
							type="text"
							value={username}
							autoFocus
							placeholder="username"
							onChange={(e) => {
								// strip disallowed chars inline — no need to show format error while typing
								const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30)
								setUsername(val)
								if (errors.username) setErrors((p) => ({ ...p, username: "" }))
							}}
							onKeyDown={(e) => e.key === "Enter" && handleSave()}
							className="flex-1 px-2 text-sm text-gray-900 bg-transparent outline-none"
						/>
						<span
							className={`pr-3.5 text-xs tabular-nums shrink-0 ${username.length >= 28 ? "text-amber-400" : "text-gray-300"}`}
						>
							{username.length}/30
						</span>
					</div>
					<FieldError message={displayError} />
				</div>
			</div>

			<DialogFooter
				onClose={onClose}
				onSave={handleSave}
				disabled={!isDirty || !isValidFormat || updateUsername.isPending}
				pending={updateUsername.isPending}
			/>
		</DialogShell>
	)
}

// ─── Edit Bio ─────────────────────────────────────────────────────────────────

export function EditBioDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateBio = useUpdateBio()
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const [bio, setBio] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	useEffect(() => {
		if (!open) return
		const u = useAuthStore.getState().user
		setBio(u?.profile?.about_me ?? "")
		setErrors({})
	}, [open])

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
					if (data.success) onClose()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	return (
		<DialogShell open={open} onClose={onClose} title="Edit bio">
			<div className="px-6 py-5">
				<div className="flex flex-col gap-1.5">
					<FieldLabel>Bio</FieldLabel>
					<div
						className={`relative rounded-xl border bg-white transition-colors ${errors.about_me || overLimit ? "border-destructive" : "border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"}`}
					>
						<textarea
							ref={textareaRef}
							value={bio}
							autoFocus
							rows={4}
							placeholder="Tell people a little about yourself…"
							onChange={(e) => {
								setBio(e.target.value)
								if (errors.about_me) setErrors((p) => ({ ...p, about_me: "" }))
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave()
							}}
							className="w-full px-3.5 pt-3 pb-7 text-sm text-gray-900 bg-transparent resize-none outline-none leading-relaxed"
						/>
						<span
							className={`absolute bottom-2.5 right-3.5 text-xs tabular-nums pointer-events-none ${overLimit ? "text-destructive font-semibold" : remaining <= 20 ? "text-amber-400" : "text-gray-300"}`}
						>
							{remaining}
						</span>
					</div>
					<FieldError message={errors.about_me} />
					<p className="text-[11px] text-gray-400">⌘ + Enter to save</p>
				</div>
			</div>

			<DialogFooter
				onClose={onClose}
				onSave={handleSave}
				disabled={!isDirty || overLimit || updateBio.isPending}
				pending={updateBio.isPending}
			/>
		</DialogShell>
	)
}
