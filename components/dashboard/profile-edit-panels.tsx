"use client"

import {
	updateProfileKeys,
	useAddExternalLink,
	useDeleteExternalLink,
	useUpdateBio,
	useUpdateCoverPhoto,
	useUpdateDob,
	useUpdateDobVisibility,
	useUpdateExternalLink,
	useUpdateLocation,
	useUpdateName,
	useUpdatePhoto,
	useUpdateUsername,
} from "@/hooks/use-update-profile"
import { extractFieldErrors } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { ExternalLink } from "@/types/socials/api"
import { useIsMutating } from "@tanstack/react-query"
import { Country, ICountry, IState, State } from "country-state-city"
import dayjs from "dayjs"
import {
	ArrowLeft,
	Camera,
	Check,
	ChevronDown,
	ChevronRight,
	Link2,
	Loader2,
	Plus,
	RefreshCw,
	Search,
	Trash2,
	User,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { PhotoCropModal } from "./photo-crop-modal"

const BIO_MAX = 200
const NAME_MAX = 20

function getInitials(first: string | null, last: string | null) {
	return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}

/** accepts raw keystrokes and returns DD/MM/YYYY formatted string */
function formatDob(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 8)
	if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
	if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
	return digits
}

/** DD/MM/YYYY → YYYY-MM-DD (null if incomplete) */
function dobToApiFormat(dob: string): string | null {
	const parts = dob.split("/")
	if (parts.length !== 3) return null
	const [day, month, year] = parts
	if (year.length < 4 || day.length < 2 || month.length < 2) return null
	return `${year}-${month}-${day}`
}

/** YYYY-MM-DD → DD/MM/YYYY (empty string if null/undefined) */
function dobFromApiFormat(apiDob: string | null | undefined): string {
	if (!apiDob) return ""
	const [year, month, day] = apiDob.split("-")
	return `${day ?? ""}/${month ?? ""}/${year ?? ""}`
}

function isValidUrl(url: string): boolean {
	try {
		const u = new URL(url)
		return u.protocol === "http:" || u.protocol === "https:"
	} catch {
		return false
	}
}

const ADJECTIVES = [
	"swift",
	"bright",
	"calm",
	"bold",
	"cool",
	"dark",
	"fair",
	"glad",
	"happy",
	"kind",
	"lively",
	"quick",
	"sharp",
	"smart",
	"wild",
	"wise",
]
const NOUNS = [
	"bear",
	"cloud",
	"creek",
	"eagle",
	"fox",
	"hawk",
	"lake",
	"leaf",
	"moon",
	"peak",
	"rain",
	"river",
	"star",
	"stone",
	"sun",
	"wolf",
]

function generateUsername(): string {
	const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
	const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
	const num = Math.floor(Math.random() * 9999)
	return `${adj}_${noun}${num}`
}

function EditRow({
	label,
	value,
	onClick,
	destructive,
	isPending,
}: {
	label: string
	value?: string
	onClick?: () => void
	destructive?: boolean
	isPending?: boolean
}) {
	return (
		<button
			onClick={onClick}
			className="w-full flex items-center justify-between px-6 py-3.5 border-b border-border/50 last:border-0 hover:bg-accent/60 transition-colors text-left"
		>
			<span
				className={cn(
					"text-[13px] font-medium shrink-0",
					destructive ? "text-destructive" : "text-foreground",
				)}
			>
				{label}
			</span>
			{value !== undefined && (
				<div className="flex items-center gap-1.5 ml-4 min-w-0">
					<span className="text-[12.5px] text-muted-foreground truncate max-w-40 text-right">
						{value}
					</span>
					{onClick ? (
						isPending ? (
							<Loader2 size={13} className="text-muted-foreground/40 shrink-0 animate-spin" />
						) : (
							<ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />
						)
					) : null}
				</div>
			)}
		</button>
	)
}

function ToggleRow({
	label,
	enabled,
	onToggle,
}: {
	label: string
	enabled: boolean
	onToggle: () => void
}) {
	return (
		<div className="w-full flex items-center justify-between px-6 py-3.5 border-b border-border/50">
			<span className="text-[13px] font-medium text-foreground">{label}</span>
			<div
				onClick={onToggle}
				className={cn(
					"w-9 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer",
					enabled ? "bg-primary" : "bg-muted-foreground/30",
				)}
			>
				<div
					className={cn(
						"w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-200",
						enabled ? "translate-x-4" : "translate-x-0",
					)}
				/>
			</div>
		</div>
	)
}

interface SelectOption {
	value: string
	label: string
	secondary?: string
}

function SearchableSelect({
	options,
	value,
	onChange,
	placeholder = "Select...",
	disabled,
	hasError,
}: {
	options: SelectOption[]
	value: string
	onChange: (value: string) => void
	placeholder?: string
	disabled?: boolean
	hasError?: boolean
}) {
	const [open, setOpen] = useState(false)
	const [search, setSearch] = useState("")
	const containerRef = useRef<HTMLDivElement>(null)
	const searchRef = useRef<HTMLInputElement>(null)

	const selected = options.find((o) => o.value === value)
	const filtered = search.trim()
		? options.filter(
				(o) =>
					o.label.toLowerCase().includes(search.toLowerCase()) ||
					(o.secondary && o.secondary.toLowerCase().includes(search.toLowerCase())),
			)
		: options

	useEffect(() => {
		if (!open) return
		const handler = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false)
				setSearch("")
			}
		}
		document.addEventListener("mousedown", handler)
		return () => document.removeEventListener("mousedown", handler)
	}, [open])

	useEffect(() => {
		if (open) setTimeout(() => searchRef.current?.focus(), 0)
	}, [open])

	return (
		<div className="relative" ref={containerRef}>
			<button
				type="button"
				disabled={disabled}
				onClick={() => !disabled && setOpen((v) => !v)}
				className={cn(
					"w-full flex items-center justify-between h-12 px-4 rounded-xl border transition-colors text-sm",
					disabled
						? "bg-muted border-border cursor-not-allowed opacity-60"
						: hasError
							? "border-destructive"
							: open
								? "border-primary"
								: "border-input hover:border-ring bg-card cursor-pointer",
				)}
			>
				<span className={cn(selected ? "text-foreground" : "text-muted-foreground")}>
					{selected ? selected.label : placeholder}
				</span>
				<ChevronDown
					size={16}
					className={cn(
						"text-muted-foreground transition-transform duration-150 shrink-0",
						open && "rotate-180",
					)}
				/>
			</button>

			{open && (
				<div className="absolute z-50 top-full mt-1 left-0 w-full bg-popover border border-border rounded-2xl shadow-xl overflow-hidden">
					<div className="p-2 border-b border-border">
						<div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted border border-border">
							<Search size={13} className="text-muted-foreground shrink-0" />
							<input
								ref={searchRef}
								type="text"
								placeholder="Search…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
							/>
						</div>
					</div>
					<div className="max-h-56 overflow-y-auto">
						{filtered.length === 0 ? (
							<p className="px-4 py-3 text-sm text-muted-foreground text-center">No results</p>
						) : (
							filtered.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										onChange(option.value)
										setOpen(false)
										setSearch("")
									}}
									className={cn(
										"w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left",
										value === option.value ? "bg-primary/5 text-primary" : "text-foreground",
									)}
								>
									<span className="flex-1 truncate">{option.label}</span>
									{option.secondary && (
										<span className="text-muted-foreground text-xs shrink-0">
											{option.secondary}
										</span>
									)}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	)
}

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
				aria-label="Back"
			>
				<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
			</button>
			<h2 className="font-bold text-foreground">{title}</h2>
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
		<div className="shrink-0 px-5 pt-4 pb-6 border-t border-border">
			<button
				onClick={onSave}
				disabled={disabled}
				className="w-full h-13 rounded-full bg-primary text-primary-foreground text-[15px] font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
			>
				{pending && <Loader2 size={13} className="animate-spin" />}
				Save
			</button>
		</div>
	)
}

function FieldWrapper({
	label,
	hint,
	error,
	children,
}: {
	label: string
	hint?: string
	error?: string
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm font-semibold text-foreground">{label}</p>
			{hint && <p className="text-xs text-muted-foreground leading-relaxed -mt-1">{hint}</p>}
			{children}
			{error && <p className="text-xs text-destructive mt-0.5 px-0.5">{error}</p>}
		</div>
	)
}

function TextInput({
	value,
	onChange,
	onKeyDown,
	placeholder,
	maxLength,
	autoFocus,
	readOnly,
	icon,
	trailingEl,
	hasError,
}: {
	value: string
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
	placeholder?: string
	maxLength?: number
	autoFocus?: boolean
	readOnly?: boolean
	icon?: React.ReactNode
	trailingEl?: React.ReactNode
	hasError?: boolean
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-2.5 h-12 px-4 rounded-xl border transition-colors",
				readOnly
					? "bg-muted border-border cursor-default"
					: hasError
						? "border-destructive focus-within:border-destructive"
						: "border-input focus-within:border-primary",
			)}
		>
			{icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
			<input
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				maxLength={maxLength}
				autoFocus={autoFocus}
				readOnly={readOnly}
				className="flex-1 text-sm text-foreground bg-transparent outline-none placeholder:text-muted-foreground read-only:cursor-default read-only:text-muted-foreground"
			/>
			{trailingEl}
		</div>
	)
}

function Toggle({
	enabled,
	onToggle,
	disabled,
}: {
	enabled: boolean
	onToggle: () => void
	disabled?: boolean
}) {
	return (
		<button
			role="switch"
			aria-checked={enabled}
			onClick={onToggle}
			disabled={disabled}
			type="button"
			className={cn(
				"w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed",
				enabled ? "bg-primary" : "bg-muted-foreground/30",
			)}
		>
			<div
				className={cn(
					"w-5 h-5 rounded-full bg-background shadow-sm transition-transform duration-200",
					enabled ? "translate-x-5" : "translate-x-0",
				)}
			/>
		</button>
	)
}

export function EditNamePanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateName = useUpdateName()

	const [firstName, setFirstName] = useState(() => useAuthStore.getState().user?.first_name ?? "")
	const [lastName, setLastName] = useState(() => useAuthStore.getState().user?.last_name ?? "")
	const [errors, setErrors] = useState<Record<string, string>>({})

	const isDirty =
		firstName.trim() !== (user?.first_name ?? "") || lastName.trim() !== (user?.last_name ?? "")

	const handleSave = () => {
		if (!isDirty || updateName.isPending) return
		setErrors({})
		updateName.mutate({ first_name: firstName.trim(), last_name: lastName.trim() })
		onBack()
	}

	const counterCls = (len: number) =>
		cn(
			"text-xs tabular-nums shrink-0",
			len >= NAME_MAX - 5
				? "text-amber-500"
				: len >= NAME_MAX - 2
					? "text-destructive"
					: "text-muted-foreground/50",
		)

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader title="Change Name" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 py-5 flex flex-col gap-5">
				<FieldWrapper label="First Name" error={errors.first_name}>
					<TextInput
						value={firstName}
						onChange={(e) => {
							setFirstName(e.target.value.slice(0, NAME_MAX))
							if (errors.first_name) setErrors((p) => ({ ...p, first_name: "" }))
						}}
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						autoFocus
						placeholder="First Name"
						icon={<User size={16} />}
						hasError={!!errors.first_name}
						trailingEl={
							<span className={counterCls(firstName.length)}>
								{firstName.length}/{NAME_MAX}
							</span>
						}
					/>
				</FieldWrapper>

				<FieldWrapper label="Last Name" error={errors.first_name}>
					<TextInput
						value={lastName}
						onChange={(e) => {
							setLastName(e.target.value.slice(0, NAME_MAX))
							if (errors.last_name) setErrors((p) => ({ ...p, last_name: "" }))
						}}
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						placeholder="Last Name"
						icon={<User size={16} />}
						hasError={!!errors.last_name}
						trailingEl={
							<span className={counterCls(lastName.length)}>
								{lastName.length}/{NAME_MAX}
							</span>
						}
					/>
				</FieldWrapper>

				<p className="text-[12.5px] text-muted-foreground leading-relaxed">
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

	const [newUsername, setNewUsername] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	const currentUsername = user?.username ?? ""
	const isDirty = newUsername !== currentUsername
	const isValidFormat = /^[a-zA-Z0-9_]{1,30}$/.test(newUsername)
	const formatError =
		newUsername.length > 0 && !isValidFormat
			? "Only letters, numbers, and underscores are allowed."
			: undefined
	const displayError = errors.username ?? formatError

	const handleGenerate = () => {
		const generated = generateUsername().slice(0, 30)
		setNewUsername(generated)
		if (errors.username) setErrors((p) => ({ ...p, username: "" }))
	}

	const handleSave = () => {
		if (!isDirty || !isValidFormat || updateUsername.isPending) return
		setErrors({})
		updateUsername.mutate(
			{ username: newUsername },
			{
				onSuccess: (data) => {
					if (data.success) onBack()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader title="Change Username" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 py-5 flex flex-col gap-5">
				<FieldWrapper label="Current Username">
					<TextInput value={`@${currentUsername}`} readOnly icon={<User size={16} />} />
				</FieldWrapper>

				<FieldWrapper
					label="New Username"
					hint="Usernames can contain only letters, numbers, and underscores. Changing username will also change your profile link. You can only change your username once every 180 days."
					error={displayError}
				>
					<TextInput
						value={newUsername}
						onChange={(e) => {
							const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30)
							setNewUsername(val)
							if (errors.username) setErrors((p) => ({ ...p, username: "" }))
						}}
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						autoFocus
						placeholder="Username"
						icon={<User size={16} />}
						hasError={!!displayError}
						trailingEl={
							isValidFormat && isDirty ? (
								<Check size={16} className="text-green-500 shrink-0" strokeWidth={2.5} />
							) : null
						}
					/>

					<button
						type="button"
						onClick={handleGenerate}
						className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors mx-auto"
					>
						Generate username
						<RefreshCw size={13} />
					</button>
				</FieldWrapper>
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!isDirty || !isValidFormat || updateUsername.isPending}
				pending={updateUsername.isPending}
			/>
		</div>
	)
}

export function EditBioPanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateBio = useUpdateBio()
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const [bio, setBio] = useState(() => useAuthStore.getState().user?.profile.about_me ?? "")
	const [errors, setErrors] = useState<Record<string, string>>({})

	const isDirty = bio !== (user?.profile?.about_me ?? "")
	const remaining = BIO_MAX - bio.length
	const overLimit = remaining < 0

	const handleSave = () => {
		if (!isDirty || overLimit || updateBio.isPending) return
		setErrors({})
		updateBio.mutate({ about_me: bio })
		onBack()
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader title="Bio" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 py-5">
				<div
					className={cn(
						"relative rounded-xl border transition-colors",
						errors.about_me || overLimit
							? "border-destructive"
							: "border-input focus-within:border-primary",
					)}
				>
					<textarea
						ref={textareaRef}
						value={bio}
						onChange={(e) => {
							setBio(e.target.value)
							if (errors.about_me) setErrors((p) => ({ ...p, about_me: "" }))
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave()
						}}
						placeholder="Tell people a little about yourself…"
						rows={5}
						className="w-full px-4 pt-3.5 pb-8 text-sm text-foreground bg-transparent resize-none outline-none leading-relaxed placeholder:text-muted-foreground"
					/>
					<span
						className={cn(
							"absolute bottom-2.5 right-3.5 text-xs tabular-nums pointer-events-none",
							overLimit
								? "text-destructive font-semibold"
								: remaining <= 30
									? "text-amber-500"
									: "text-muted-foreground/50",
						)}
					>
						{bio.length}/{BIO_MAX}
					</span>
				</div>
				{errors.about_me && (
					<p className="text-xs text-destructive mt-1.5 px-0.5">{errors.about_me}</p>
				)}
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!isDirty || overLimit || updateBio.isPending}
				pending={updateBio.isPending}
			/>
		</div>
	)
}

export function EditDobPanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateDob = useUpdateDob()
	const updateDobVisibility = useUpdateDobVisibility()

	const [dob, setDob] = useState(() => dobFromApiFormat(useAuthStore.getState().user?.dob))
	const [showYear, setShowYear] = useState(
		() => (useAuthStore.getState().user?.dob_visibility ?? "full") === "full",
	)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const currentDobDisplay = dobFromApiFormat(user?.dob)
	const apiDob = dobToApiFormat(dob)
	const isDirty = dob !== currentDobDisplay

	const handleSave = async () => {
		if (!isDirty || updateDob.isPending || !apiDob) return
		setErrors({})

		updateDob.mutate({ dob: apiDob })
		onBack()
	}

	const handleVisibilityToggle = () => {
		if (updateDobVisibility.isPending) return
		const next: "full" | "partial" = showYear ? "partial" : "full"
		setShowYear(!showYear)
		updateDobVisibility.mutate({ dob_visibility: next }, { onError: () => setShowYear(showYear) })
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader title="Set date of birth" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 py-5 flex flex-col gap-5">
				<FieldWrapper label="Date of birth" error={errors.dob}>
					<TextInput
						value={dob}
						onChange={(e) => {
							setDob(formatDob(e.target.value))
							if (errors.dob) setErrors((p) => ({ ...p, dob: "" }))
						}}
						onKeyDown={(e) => e.key === "Enter" && handleSave()}
						autoFocus
						placeholder="DD/MM/YYYY"
						hasError={!!errors.dob}
					/>
				</FieldWrapper>

				<div className="flex items-center justify-between py-1.5 border-t border-border pt-4">
					<div className="min-w-0 pr-4">
						<p className="text-sm font-semibold text-foreground">Show birth year</p>
						<p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
							When off, only your month and day are visible to others.
						</p>
					</div>
					<Toggle
						enabled={showYear}
						onToggle={handleVisibilityToggle}
						disabled={updateDobVisibility.isPending}
					/>
				</div>
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!isDirty || updateDob.isPending || !apiDob}
				pending={updateDob.isPending}
			/>
		</div>
	)
}

export function EditLocationPanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const updateLocation = useUpdateLocation()

	const [countries] = useState<ICountry[]>(() => Country.getAllCountries())
	const [countryIso, setCountryIso] = useState<string>(() => {
		const name = useAuthStore.getState().user?.country ?? ""
		return Country.getAllCountries().find((c) => c.name === name)?.isoCode ?? ""
	})
	const [states, setStates] = useState<IState[]>(() => {
		const name = useAuthStore.getState().user?.country ?? ""
		const iso = Country.getAllCountries().find((c) => c.name === name)?.isoCode ?? ""
		return iso ? State.getStatesOfCountry(iso) : []
	})
	const [stateIso, setStateIso] = useState<string>(() => {
		const countryName = useAuthStore.getState().user?.country ?? ""
		const stateName = useAuthStore.getState().user?.state ?? ""
		const iso = Country.getAllCountries().find((c) => c.name === countryName)?.isoCode
		if (!iso) return ""
		return State.getStatesOfCountry(iso).find((s) => s.name === stateName)?.isoCode ?? ""
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const countryName = countries.find((c) => c.isoCode === countryIso)?.name ?? ""
	const stateName = states.find((s) => s.isoCode === stateIso)?.name ?? ""

	const isDirty = countryName !== (user?.country ?? "") || stateName !== (user?.state ?? "")

	const handleCountryChange = (iso: string) => {
		setCountryIso(iso)
		setStates(State.getStatesOfCountry(iso))
		setStateIso("")
		if (errors.country) setErrors((p) => ({ ...p, country: "" }))
	}

	const handleSave = () => {
		if (!isDirty || updateLocation.isPending) return
		setErrors({})
		updateLocation.mutate({ country: countryName, state: stateName })
		onBack()
	}
	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader title="Set Location" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 py-5 flex flex-col gap-4">
				<FieldWrapper label="Country" error={errors.country}>
					<SearchableSelect
						options={countries.map((c) => ({ value: c.isoCode, label: c.name }))}
						value={countryIso}
						onChange={(iso) => {
							handleCountryChange(iso)
						}}
						placeholder="Select country"
						hasError={!!errors.country}
					/>
				</FieldWrapper>

				<FieldWrapper label="State" error={errors.state}>
					<SearchableSelect
						options={states.map((s) => ({ value: s.isoCode, label: s.name }))}
						value={stateIso}
						onChange={(iso) => {
							setStateIso(iso)
							if (errors.state) setErrors((p) => ({ ...p, state: "" }))
						}}
						placeholder="Select state"
						disabled={!countryIso}
						hasError={!!errors.state}
					/>
				</FieldWrapper>
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!isDirty || updateLocation.isPending}
				pending={updateLocation.isPending}
			/>
		</div>
	)
}

export function AddExternalLinkPanel({ onBack }: { onBack: () => void }) {
	const addExternalLink = useAddExternalLink()

	const [label, setLabel] = useState("")
	const [url, setUrl] = useState("")
	const [errors, setErrors] = useState<Record<string, string>>({})

	const trimmedLabel = label.trim()
	const trimmedUrl = url.trim()
	const canSave = trimmedLabel.length > 0 && isValidUrl(trimmedUrl)

	const handleSave = () => {
		const newErrors: Record<string, string> = {}
		if (!trimmedLabel) newErrors.label = "Title is required."
		if (!isValidUrl(trimmedUrl))
			newErrors.url = "Enter a valid URL starting with http:// or https://"

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		setErrors({})

		addExternalLink.mutate(
			{ label: trimmedLabel, url: trimmedUrl },
			{
				onSuccess: (data) => {
					if (data.success) onBack()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader title="Add external link" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 py-5 flex flex-col gap-5">
				<FieldWrapper label="Title" error={errors.label}>
					<TextInput
						value={label}
						onChange={(e) => {
							setLabel(e.target.value)
							if (errors.label) setErrors((p) => ({ ...p, label: "" }))
						}}
						autoFocus
						placeholder="e.g. My Portfolio"
						hasError={!!errors.label}
					/>
				</FieldWrapper>

				<FieldWrapper label="URL" error={errors.url}>
					<div
						className={cn(
							"rounded-xl border transition-colors",
							errors.url ? "border-destructive" : "border-input focus-within:border-primary",
						)}
					>
						<textarea
							value={url}
							onChange={(e) => {
								setUrl(e.target.value)
								if (errors.url) setErrors((p) => ({ ...p, url: "" }))
							}}
							placeholder="https://www.example.com/yourprofile"
							rows={3}
							className="w-full px-4 pt-3 pb-3 text-sm text-foreground bg-transparent resize-none outline-none leading-relaxed placeholder:text-muted-foreground"
						/>
					</div>
				</FieldWrapper>
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!canSave || addExternalLink.isPending}
				pending={addExternalLink.isPending}
			/>
		</div>
	)
}

export function EditExternalLinkPanel({
	link,
	onBack,
}: {
	link: ExternalLink
	onBack: () => void
}) {
	const updateLink = useUpdateExternalLink()
	const deleteLink = useDeleteExternalLink()

	const [label, setLabel] = useState(link.label)
	const [url, setUrl] = useState(link.url)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [confirmDelete, setConfirmDelete] = useState(false)

	const isDirty = label.trim() !== link.label || url.trim() !== link.url
	const canSave = label.trim().length > 0 && isValidUrl(url.trim()) && isDirty

	const handleSave = () => {
		const newErrors: Record<string, string> = {}
		if (!label.trim()) newErrors.label = "Title is required."
		if (!isValidUrl(url.trim()))
			newErrors.url = "Enter a valid URL starting with http:// or https://"
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}
		if (updateLink.isPending) return

		setErrors({})
		updateLink.mutate(
			{ id: link.id, payload: { label: label.trim(), url: url.trim() } },
			{
				onSuccess: (data) => {
					if (data.success) onBack()
				},
				onError: (err) => setErrors(extractFieldErrors(err)),
			},
		)
	}

	const handleDelete = () => {
		if (deleteLink.isPending) return
		deleteLink.mutate(link.id, { onSuccess: () => onBack() })
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader title="Edit link" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 py-5 flex flex-col gap-5">
				<FieldWrapper label="Title" error={errors.label}>
					<TextInput
						value={label}
						onChange={(e) => {
							setLabel(e.target.value)
							if (errors.label) setErrors((p) => ({ ...p, label: "" }))
						}}
						autoFocus
						placeholder="e.g. My Portfolio"
						hasError={!!errors.label}
					/>
				</FieldWrapper>

				<FieldWrapper label="URL" error={errors.url}>
					<div
						className={cn(
							"rounded-xl border transition-colors",
							errors.url ? "border-destructive" : "border-input focus-within:border-primary",
						)}
					>
						<textarea
							value={url}
							onChange={(e) => {
								setUrl(e.target.value)
								if (errors.url) setErrors((p) => ({ ...p, url: "" }))
							}}
							placeholder="https://www.example.com/yourprofile"
							rows={3}
							className="w-full px-4 pt-3 pb-3 text-sm text-foreground bg-transparent resize-none outline-none leading-relaxed placeholder:text-muted-foreground"
						/>
					</div>
				</FieldWrapper>

				{/* Delete section */}
				<div className="pt-2 border-t border-border">
					{!confirmDelete ? (
						<button
							onClick={() => setConfirmDelete(true)}
							className="flex items-center gap-2 text-[13px] font-medium text-destructive hover:opacity-75 transition-opacity"
						>
							<Trash2 size={14} />
							Delete this link
						</button>
					) : (
						<div className="bg-destructive/10 rounded-xl p-4 flex flex-col gap-3">
							<p className="text-[13px] text-foreground font-medium">Delete this link?</p>
							<p className="text-[12px] text-muted-foreground -mt-1">
								This action cannot be undone.
							</p>
							<div className="flex gap-2">
								<button
									onClick={() => setConfirmDelete(false)}
									className="flex-1 h-9 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-background transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleDelete}
									disabled={deleteLink.isPending}
									className="flex-1 h-9 rounded-xl bg-destructive text-white text-[13px] font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
								>
									{deleteLink.isPending && <Loader2 size={12} className="animate-spin" />}
									Delete
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			<PanelSave
				onSave={handleSave}
				disabled={!canSave || updateLink.isPending}
				pending={updateLink.isPending}
			/>
		</div>
	)
}

export function EditProfilePanel({ onOpenDialog }: { onOpenDialog: (id: string) => void }) {
	const user = useAuthStore((s) => s.user)
	const updatePhoto = useUpdatePhoto()
	const updateCoverPhoto = useUpdateCoverPhoto()
	const updateDobVisibility = useUpdateDobVisibility()

	const photoInputRef = useRef<HTMLInputElement>(null)
	const coverInputRef = useRef<HTMLInputElement>(null)

	const [dobVisibility, setDobVisibility] = useState<"full" | "partial">(
		user?.dob_visibility ?? "partial",
	)

	const [cropSrc, setCropSrc] = useState<string | null>(null)
	const [cropMode, setCropMode] = useState<"profile" | "cover">("profile")
	const [cropOpen, setCropOpen] = useState(false)

	const isUpdatingName = useIsMutating({ mutationKey: updateProfileKeys.name }) > 0
	const isUpdatingBio = useIsMutating({ mutationKey: updateProfileKeys.bio }) > 0
	const isUpdatingLocation = useIsMutating({ mutationKey: updateProfileKeys.location }) > 0

	if (!user) return null

	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
	const bio = user.profile?.about_me
	const links = user.external_links ?? []

	const openCrop = (file: File, mode: "profile" | "cover") => {
		if (cropSrc) URL.revokeObjectURL(cropSrc)
		setCropSrc(URL.createObjectURL(file))
		setCropMode(mode)
		setCropOpen(true)
	}

	const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		openCrop(file, "profile")
		e.target.value = ""
	}

	const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		openCrop(file, "cover")
		e.target.value = ""
	}

	const handleCropModalChange = (open: boolean) => {
		setCropOpen(open)
		if (!open && cropSrc) {
			URL.revokeObjectURL(cropSrc)
			setCropSrc(null)
		}
	}

	const handleCropConfirm = (blob: Blob) => {
		const fileName = cropMode === "profile" ? "profile.jpg" : "cover.jpg"
		const file = new File([blob], fileName, { type: "image/jpeg" })
		if (cropMode === "profile") {
			updatePhoto.mutate(file)
		} else {
			updateCoverPhoto.mutate(file)
		}
	}

	const handleToggle = () => {
		const nextVisibility = dobVisibility === "full" ? "partial" : "full"
		setDobVisibility(nextVisibility)
		updateDobVisibility.mutate(
			{ dob_visibility: nextVisibility },
			{ onError: () => setDobVisibility(dobVisibility) },
		)
	}

	const cropConfig =
		cropMode === "profile"
			? { containerW: 260, containerH: 260, outputW: 400, outputH: 400, shape: "circle" as const }
			: { containerW: 380, containerH: 127, outputW: 1200, outputH: 400, shape: "rect" as const }

	return (
		<div className="border-l border-border h-full overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col">
			<div className="px-6 pt-5 pb-4 border-b border-border shrink-0">
				<h2 className="text-[16px] font-bold text-foreground">Edit profile</h2>
			</div>

			{/* photo section */}
			<div className="p-1 border-b border-border shrink-0">
				<div className="relative">
					{/* cover thumbnail */}
					<button
						onClick={() => coverInputRef.current?.click()}
						className="w-full h-30 overflow-hidden relative bg-linear-to-br from-primary/20 to-primary/5 block group"
					>
						{user.cover_photo ? (
							<Image src={user.cover_photo} alt="Cover" fill className="object-cover" />
						) : null}
						<div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-colors group-hover:bg-black/30">
							{updateCoverPhoto.isPending ? (
								<Loader2 size={20} className="animate-spin text-white" />
							) : (
								<div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
									<Camera size={14} className="text-white" />
								</div>
							)}
						</div>
					</button>
					<input
						ref={coverInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleCoverSelect}
					/>

					{/* avatar — overlapping cover */}
					<button
						onClick={() => photoInputRef.current?.click()}
						className="absolute left-3 -bottom-5 group"
					>
						<div className="relative w-12 h-12 rounded-full border-2 border-card overflow-hidden bg-primary/20 shadow-sm">
							{user.profile_photo ? (
								<Image src={user.profile_photo} alt={displayName} fill className="object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center text-primary text-sm font-bold">
									{getInitials(user.first_name, user.last_name)}
								</div>
							)}
							<div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
								{updatePhoto.isPending ? (
									<Loader2 size={11} className="animate-spin text-white" />
								) : (
									<Camera size={11} className="text-white" />
								)}
							</div>
						</div>
						<input
							ref={photoInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handlePhotoSelect}
						/>
					</button>
				</div>
				<div className="mt-8" />
			</div>

			{/* About You */}
			<div className="pt-4">
				<p className="px-6 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
					About You
				</p>
				<EditRow
					label="Name"
					value={displayName}
					onClick={() => onOpenDialog("edit-name")}
					isPending={isUpdatingName}
				/>
				<EditRow
					label="User Name"
					value={`@${user.username}`}
					onClick={() => onOpenDialog("edit-username")}
				/>
				<EditRow
					label="Bio"
					value={bio || "Add a bio"}
					onClick={() => onOpenDialog("edit-bio")}
					isPending={isUpdatingBio}
				/>
				<EditRow label="Email" value={user.email} />
				<EditRow label="Phone No" value={user.phone_number || "Not set"} />
				<EditRow
					label="Set date of birth"
					value={user.dob ? dayjs(user.dob).format("DD-MM-YYYY") : "Not set"}
					onClick={() => onOpenDialog("edit-dob")}
				/>
				<ToggleRow
					label="Show date of birth"
					enabled={dobVisibility === "full"}
					onToggle={handleToggle}
				/>
				<EditRow
					label="Locations"
					value={[user.state, user.country].filter(Boolean).join(", ") || "Set location"}
					onClick={() => onOpenDialog("edit-location")}
					isPending={isUpdatingLocation}
				/>
			</div>

			{/* Links */}
			<div className="pt-4 pb-8">
				<p className="px-6 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
					Link
				</p>
				<button
					onClick={() => onOpenDialog("add-link")}
					className="w-full flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors text-left"
				>
					<div className="w-7 h-7 rounded-full border-[1.5px] border-primary flex items-center justify-center shrink-0">
						<Plus size={13} className="text-primary" />
					</div>
					<span className="text-[13px] font-medium text-primary">Add External Link</span>
				</button>
				{links.map((link) => (
					<button
						key={link.id}
						onClick={() => onOpenDialog(`edit-link-${link.id}`)}
						className="w-full flex items-center gap-3 px-6 py-3 hover:bg-accent transition-colors text-left border-t border-border/50"
					>
						<div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
							<Link2 size={13} className="text-muted-foreground" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-[13px] font-medium text-foreground">{link.label}</p>
							<p className="text-[11.5px] text-muted-foreground truncate">{link.url}</p>
						</div>
						<ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />
					</button>
				))}
			</div>

			<PhotoCropModal
				open={cropOpen}
				onOpenChange={handleCropModalChange}
				imageSrc={cropSrc}
				shape={cropConfig.shape}
				containerW={cropConfig.containerW}
				containerH={cropConfig.containerH}
				outputW={cropConfig.outputW}
				outputH={cropConfig.outputH}
				onCrop={handleCropConfirm}
			/>
		</div>
	)
}
