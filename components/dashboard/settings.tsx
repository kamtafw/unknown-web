"use client"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import * as Dialog from "@radix-ui/react-dialog"
import dayjs from "dayjs"
import {
	AlertCircle,
	ArrowLeft,
	Bell,
	Calendar,
	Camera,
	ChevronRight,
	Clock,
	CreditCard,
	Database,
	FileText,
	Fingerprint,
	Globe,
	HardDrive,
	Info,
	Layers,
	Link2,
	Lock,
	MapPin,
	Monitor,
	MoreHorizontal,
	Phone,
	Plus,
	Users,
	UserX,
	Volume2,
	Wrench,
	X,
} from "lucide-react"
import Image from "next/image"
import { Avatar } from "radix-ui"
import { ReactNode, useState } from "react"
import { EditBioPanel, EditNamePanel, EditUsernamePanel } from "./profile-edit-panels"
import {
	Account,
	Alert,
	Chat,
	DataStorage,
	Languages,
	Privacy,
	Support,
	Verification,
} from "./settings-icons"

type SectionId =
	| "verification"
	| "account"
	| "privacy"
	| "alert"
	| "chat"
	| "data-storage"
	| "languages"
	| "support"

type View = "settings" | "profile"

type SectionItem = {
	id: string
	label: string
	description: string
	icon: ReactNode
	destructive?: boolean
	href?: string
}

type Section = {
	id: SectionId
	label: string
	description: string
	icon: ReactNode
	items: SectionItem[]
}

const SECTIONS: Section[] = [
	{
		id: "verification",
		label: "Verification",
		description: "Manage your premium account",
		icon: <Verification size={20} />,
		items: [
			{
				id: "switch-tier",
				label: "Switch tier",
				description: "Explore more tier options available for your account",
				icon: <Layers size={18} />,
			},
			{
				id: "manage-subscription",
				label: "Manage your current subscription",
				description: "Review terms and manage your current subscription",
				icon: <CreditCard size={18} />,
			},
		],
	},
	{
		id: "account",
		label: "Account",
		description: "Manage your account, security settings, and authentication methods",
		icon: <Account size={20} />,
		items: [
			{
				id: "account-info",
				label: "Account information",
				description: "See your account information like your email and phone number",
				icon: <Info size={18} />,
			},
			{
				id: "change-password",
				label: "Change your password",
				description: "Change your password at any time",
				icon: <Lock size={18} />,
			},
			{
				id: "change-phone",
				label: "Change phone number",
				description: "Update the phone number linked to your account",
				icon: <Phone size={18} />,
			},
			{
				id: "deactivate",
				label: "Deactivate your account",
				description: "Find out how to deactivate your account",
				icon: <UserX size={18} />,
				destructive: true,
			},
		],
	},
	{
		id: "privacy",
		label: "Privacy",
		description: "Manage what information you share and who can see it",
		icon: <Privacy size={20} />,
		items: [
			{
				id: "last-seen",
				label: "Last seen & online",
				description: "Control who can see when you were last active",
				icon: <Clock size={18} />,
			},
			{
				id: "blocked",
				label: "Blocked accounts",
				description: "Manage accounts you have blocked",
				icon: <UserX size={18} />,
			},
			{
				id: "location-sharing",
				label: "Live location sharing",
				description: "Manage your live location sharing settings",
				icon: <MapPin size={18} />,
			},
		],
	},
	{
		id: "alert",
		label: "Alert",
		description: "Control which notifications you receive and how you receive them",
		icon: <Alert size={20} />,
		items: [
			{
				id: "push-notifs",
				label: "Push notifications",
				description: "Manage your push notification preferences",
				icon: <Bell size={18} />,
			},
			{
				id: "message-tones",
				label: "Message tones",
				description: "Set notification sounds for messages",
				icon: <Volume2 size={18} />,
			},
			{
				id: "group-tones",
				label: "Group tones",
				description: "Set sounds for group notifications",
				icon: <Users size={18} />,
			},
		],
	},
	{
		id: "chat",
		label: "Chat",
		description: "Customize your private and group message settings",
		icon: <Chat size={20} />,
		items: [
			{
				id: "chat-backup",
				label: "Chat backup",
				description: "Back up and restore your chat history",
				icon: <Database size={18} />,
			},
			{
				id: "linked-devices",
				label: "Linked devices",
				description: "Manage devices linked to your account",
				icon: <Monitor size={18} />,
			},
		],
	},
	{
		id: "data-storage",
		label: "Data and Storage",
		description: "Power usage, Folder, Devices",
		icon: <DataStorage size={20} />,
		items: [
			{
				id: "storage-usage",
				label: "Storage usage",
				description: "View and manage your storage space",
				icon: <HardDrive size={18} />,
			},
			{
				id: "network-usage",
				label: "Network usage",
				description: "Control data usage over mobile networks",
				icon: <Globe size={18} />,
			},
		],
	},
	{
		id: "languages",
		label: "Languages",
		description: "English (device language)",
		icon: <Languages size={20} />,
		items: [
			{
				id: "app-language",
				label: "App language",
				description: "Change the language used in AppsCombo",
				icon: <Globe size={18} />,
			},
		],
	},
	{
		id: "support",
		label: "Support",
		description: "Get help with AppsCombo, report a problem, or review our policies",
		icon: <Support size={20} />,
		items: [
			{
				id: "report",
				label: "Report a problem",
				description: "Let us know if something isn't working",
				icon: <AlertCircle size={18} />,
			},
			{
				id: "security",
				label: "Security advisories",
				description: "View security-related announcements",
				icon: <Fingerprint size={18} />,
			},
			{
				id: "terms",
				label: "Terms of Service",
				description: "Read our Terms of Service",
				icon: <FileText size={18} />,
				href: "/terms",
			},
			{
				id: "privacy-policy",
				label: "Privacy Policy",
				description: "Read our Privacy Policy",
				icon: <FileText size={18} />,
				href: "/privacy-policy",
			},
		],
	},
]

const COMING_SOON: { id: string; title: string }[] = [
	{ id: "switch-tier", title: "Switch tier" },
	{ id: "manage-subscription", title: "Manage subscription" },
	{ id: "change-password", title: "Change your password" },
	{ id: "change-phone", title: "Change phone number" },
	{ id: "last-seen", title: "Last seen & online" },
	{ id: "blocked", title: "Blocked accounts" },
	{ id: "location-sharing", title: "Live location sharing" },
	{ id: "push-notifs", title: "Push notifications" },
	{ id: "message-tones", title: "Message tones" },
	{ id: "group-tones", title: "Group tones" },
	{ id: "chat-backup", title: "Chat backup" },
	{ id: "linked-devices", title: "Linked devices" },
	{ id: "storage-usage", title: "Storage usage" },
	{ id: "network-usage", title: "Network usage" },
	{ id: "app-language", title: "App language" },
	{ id: "report", title: "Report a problem" },
	{ id: "security", title: "Security advisories" },
	// edit profile actions
	{ id: "edit-email", title: "Email" },
	{ id: "edit-phone", title: "Phone number" },
	{ id: "edit-dob", title: "Date of birth" },
	{ id: "edit-location", title: "Location" },
	{ id: "add-link", title: "Add external link" },
	{ id: "edit-cover", title: "Edit cover photo" },
	{ id: "edit-avatar", title: "Edit profile photo" },
]

function getInitials(first: string | null, last: string | null) {
	return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}

function formatCount(n: number) {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
	return String(n)
}

function SettingsDialog({
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
	children: ReactNode
}) {
	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-[12%] -translate-x-1/2 z-50 w-full max-w-110 max-h-[78vh] bg-white rounded-2xl shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col overflow-hidden">
					{/* Header */}
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

					{/* Body */}
					<div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">{children}</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

function DeactivateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	return (
		<SettingsDialog open={open} onClose={onClose} title="Deactivate your account">
			<div className="px-6 py-5">
				{/* Warning banner */}
				<div className="flex items-start gap-3 p-3.5 bg-red-50 rounded-xl mb-5 border border-red-100">
					<AlertCircle size={15} className="text-destructive shrink-0 mt-px" />
					<p className="text-[12.5px] text-destructive leading-relaxed">
						Deactivating your account is permanent and cannot be undone. All your content and data
						will be permanently removed.
					</p>
				</div>

				{/* Bullet points */}
				<div className="space-y-2.5 mb-6">
					{[
						"Your profile, posts, and media will be permanently deleted",
						"Your followers and following list will be removed",
						"You will lose access to all messages and bookmarks",
					].map((point) => (
						<div key={point} className="flex items-start gap-2.5">
							<div className="w-1 h-1 rounded-full bg-gray-400 mt-1.75 shrink-0" />
							<p className="text-[12.5px] text-gray-600 leading-relaxed">{point}</p>
						</div>
					))}
				</div>

				{/* Actions */}
				<div className="flex gap-2.5">
					<button
						onClick={onClose}
						className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Keep my account
					</button>
					<button className="flex-1 h-10 rounded-xl bg-destructive text-white text-[13px] font-semibold hover:bg-destructive/90 transition-colors">
						Deactivate
					</button>
				</div>
			</div>
		</SettingsDialog>
	)
}

function ComingSoonDialog({
	open,
	onClose,
	title,
}: {
	open: boolean
	onClose: () => void
	title: string
}) {
	return (
		<SettingsDialog open={open} onClose={onClose} title={title}>
			<div className="flex flex-col items-center px-6 py-10 text-center gap-3">
				<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
					<Wrench size={20} className="text-primary" />
				</div>
				<div>
					<p className="font-semibold text-gray-900 text-[13.5px]">In development</p>
					<p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">
						This feature is currently being built. Check back soon!
					</p>
				</div>
			</div>
		</SettingsDialog>
	)
}

function AccountInfoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const user = useAuthStore((s) => s.user)
	const rows = user
		? [
				{
					label: "Full name",
					value: [user.first_name, user.last_name].filter(Boolean).join(" ") || "—",
				},
				{ label: "Email address", value: user.email },
				{ label: "Phone number", value: user.phone_number || "Not set" },
				{ label: "Username", value: `@${user.username}` },
				{
					label: "Date of birth",
					value: user.dob ? dayjs(user.dob).format("MMMM D, YYYY") : "Not set",
				},
				{
					label: "Location",
					value: [user.country, user.state].filter(Boolean).join(", ") || "Not set",
				},
				{ label: "Member since", value: dayjs(user.date_joined).format("MMMM YYYY") },
			]
		: []

	return (
		<SettingsDialog
			open={open}
			onClose={onClose}
			title="Account information"
			description="Your current account details"
		>
			<div className="px-6 py-2">
				{rows.map((row, i) => (
					<div
						key={row.label}
						className={cn(
							"flex items-start justify-between py-3.5",
							i < rows.length - 1 && "border-b border-gray-50",
						)}
					>
						<span className="text-[12.5px] text-gray-500 shrink-0">{row.label}</span>
						<span className="text-[12.5px] font-medium text-gray-900 text-right ml-6 break-all">
							{row.value}
						</span>
					</div>
				))}
			</div>
		</SettingsDialog>
	)
}

function ProfilePublicView({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	if (!user) return null

	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
	const bio = user.profile?.about_me
	const links = user.external_links ?? []

	return (
		<div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
			{/* cover + avatar */}
			<div className="relative">
				<div className="h-48.75 w-full relative overflow-hidden bg-linear-to-br from-primary/20 via-primary/10 to-blue-50">
					{user.cover_photo ? (
						<Image src={user.cover_photo} alt="Cover" fill className="object-cover" />
					) : null}
					{/* overlaid controls */}
					<button
						onClick={onBack}
						className="absolute top-4 left-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
					>
						<ArrowLeft size={15} className="text-gray-700" />
					</button>
					<button className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
						<MoreHorizontal size={15} className="text-gray-700" />
					</button>
				</div>

				{/* profile avatar */}
				<div className="absolute left-5 -bottom-8 z-10">
					<div className="relative w-17 h-17 rounded-full border-[2.5px] border-white overflow-hidden bg-primary/20 shadow-md">
						{user.profile_photo ? (
							<Image src={user.profile_photo} alt={displayName} fill className="object-cover" />
						) : (
							<div className="w-full h-full flex items-center justify-center text-primary text-lg font-bold">
								{getInitials(user.first_name, user.last_name)}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="px-5 pt-12 pb-8">
				<h2 className="text-[18px] font-bold text-gray-900 leading-tight">{displayName}</h2>
				<p className="text-[13px] text-gray-500 mt-0.5">@{user.username}</p>

				{/* Stats */}
				<div className="flex items-center gap-6 mt-3.5 mb-4">
					{[
						{ label: "Connections", value: user.connection_count ?? 0 },
						{ label: "Following", value: user.following_count ?? 0 },
						{ label: "Followers", value: user.follower_count ?? 0 },
					].map(({ label, value }) => (
						<div key={label} className="flex flex-1 flex-col">
							<span className="text-[15px] font-bold text-gray-900">{formatCount(value)}</span>
							<span className="text-[13px] text-gray-500">{label}</span>
						</div>
					))}
				</div>

				{/* Bio */}
				{bio && <p className="text-[13px] text-gray-700 leading-relaxed mb-3">{bio}</p>}

				{/* External links */}
				{links.length > 0 && (
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
						{links.map((link) => (
							<a
								key={link.id}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-[12.5px] text-primary font-medium hover:underline"
							>
								<Link2 size={12} />
								{link.label || link.url}
							</a>
						))}
					</div>
				)}

				{/* Location + date joined */}
				<div className="flex items-center gap-8 flex-wrap">
					{(user.country || user.state) && (
						<div className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
							<MapPin size={13} />
							<span className="text-semibold text-gray-700">
								{[user.state, user.country].filter(Boolean).join(", ")}
							</span>
						</div>
					)}
					{user.date_joined && (
						<div className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
							<Calendar size={13} />
							<span className="text-semibold text-gray-700">
								{dayjs(user.date_joined).format("MMM D, YYYY")}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

function EditRow({
	label,
	value,
	onClick,
	destructive,
}: {
	label: string
	value?: string
	onClick: () => void
	destructive?: boolean
}) {
	return (
		<button
			onClick={onClick}
			className="w-full flex items-center justify-between px-6 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors text-left"
		>
			<span
				className={cn(
					"text-[13px] font-medium shrink-0",
					destructive ? "text-destructive" : "text-gray-700",
				)}
			>
				{label}
			</span>
			{value !== undefined && (
				<div className="flex items-center gap-1.5 ml-4 min-w-0">
					<span className="text-[12.5px] text-gray-400 truncate max-w-40 text-right">{value}</span>
					<ChevronRight size={13} className="text-gray-300 shrink-0" />
				</div>
			)}
		</button>
	)
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
	return (
		<div className="w-full flex items-center justify-between px-6 py-3.5 border-b border-gray-50">
			<span className="text-[13px] font-medium text-gray-700">{label}</span>
			<div
				className={cn(
					"w-9 h-5 rounded-full flex items-center px-0.5 transition-colors",
					enabled ? "bg-primary" : "bg-gray-300",
				)}
			>
				<div
					className={cn(
						"w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
						enabled ? "translate-x-4" : "translate-x-0",
					)}
				/>
			</div>
		</div>
	)
}

function EditProfilePanel({ onOpenDialog }: { onOpenDialog: (id: string) => void }) {
	const user = useAuthStore((s) => s.user)
	if (!user) return null

	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
	const bio = user.profile?.about_me
	const links = user.external_links ?? []
	const showDob = user.dob_visibility === "full" || user.dob_visibility === "partial"

	return (
		<div className="border-l border-gray-100 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col">
			<div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
				<h2 className="text-[16px] font-bold text-gray-900">Edit profile</h2>
			</div>

			{/* photo section */}
			<div className="p-1 border-b border-gray-100 shrink-0">
				<div className="relative">
					{/* cover thumbnail */}
					<button
						onClick={() => onOpenDialog("edit-cover")}
						className="w-full h-30 overflow-hidden relative bg-linear-to-br from-primary/20 to-primary/5 block group"
					>
						{user.cover_photo ? (
							<Image src={user.cover_photo} alt="Cover" fill className="object-cover" />
						) : null}
						<div className="absolute inset-0 bg-black/20 transition-colors flex items-center justify-center">
							<div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center opacity-100 transition-opacity">
								<Camera size={14} className="text-white" />
							</div>
						</div>
					</button>

					{/* avatar — overlapping cover */}
					<button
						onClick={() => onOpenDialog("edit-avatar")}
						className="absolute left-3 -bottom-5 group"
					>
						<div className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-primary/20 shadow-sm">
							{user.profile_photo ? (
								<Image src={user.profile_photo} alt={displayName} fill className="object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center text-primary text-sm font-bold">
									{getInitials(user.first_name, user.last_name)}
								</div>
							)}
							<div className="absolute inset-0 bg-black/30 transition-colors flex items-center justify-center rounded-full">
								<Camera size={11} className="text-white opacity-100 transition-opacity" />
							</div>
						</div>
					</button>
				</div>
				<div className="mt-8" />
			</div>

			{/* About You */}
			<div className="pt-4">
				<p className="px-6 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
					About You
				</p>
				<EditRow label="Name" value={displayName} onClick={() => onOpenDialog("edit-name")} />
				<EditRow
					label="User Name"
					value={`@${user.username}`}
					onClick={() => onOpenDialog("edit-username")}
				/>
				<EditRow label="Bio" value={bio || "Add a bio"} onClick={() => onOpenDialog("edit-bio")} />
				<EditRow label="Email" value={user.email} onClick={() => onOpenDialog("edit-email")} />
				<EditRow
					label="Phone No"
					value={user.phone_number || "Not set"}
					onClick={() => onOpenDialog("edit-phone")}
				/>
				<EditRow
					label="Set date of birth"
					value={user.dob ? dayjs(user.dob).format("DD-MM-YYYY") : "Not set"}
					onClick={() => onOpenDialog("edit-dob")}
				/>
				<ToggleRow label="Show date of birth" enabled={showDob} />
				<EditRow
					label="Locations"
					value={[user.country, user.state].filter(Boolean).join(", ") || "Set location"}
					onClick={() => onOpenDialog("edit-location")}
				/>
			</div>

			{/* Links */}
			<div className="pt-4 pb-8">
				<p className="px-6 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
					Link
				</p>
				<button
					onClick={() => onOpenDialog("add-link")}
					className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-left"
				>
					<div className="w-7 h-7 rounded-full border-[1.5px] border-primary flex items-center justify-center shrink-0">
						<Plus size={13} className="text-primary" />
					</div>
					<span className="text-[13px] font-medium text-primary">Add External Link</span>
				</button>
				{links.map((link) => (
					<button
						key={link.id}
						onClick={() => onOpenDialog("add-link")}
						className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-50"
					>
						<div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
							<Link2 size={13} className="text-gray-500" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-[13px] font-medium text-gray-900">{link.label}</p>
							<p className="text-[11.5px] text-gray-400 truncate">{link.url}</p>
						</div>
						<ChevronRight size={13} className="text-gray-300 shrink-0" />
					</button>
				))}
			</div>
		</div>
	)
}

function ProfileView({
	onBack,
	onOpenDialog,
}: {
	onBack: () => void
	onOpenDialog: (id: string) => void
}) {
	const [mobileTab, setMobileTab] = useState<"profile" | "edit">("profile")
	const [activePanel, setActivePanel] = useState<string | null>(null)

	const handleEdit = (id: string) => {
		if (id === "edit-name" || id === "edit-username" || id === "edit-bio") {
			setActivePanel(id)
		} else {
			onOpenDialog(id)
		}
	}

	const rightContent =
		activePanel === "edit-name" ? (
			<EditNamePanel onBack={() => setActivePanel(null)} />
		) : activePanel === "edit-username" ? (
			<EditUsernamePanel onBack={() => setActivePanel(null)} />
		) : activePanel === "edit-bio" ? (
			<EditBioPanel onBack={() => setActivePanel(null)} />
		) : (
			<EditProfilePanel onOpenDialog={handleEdit} />
		)

	return (
		<div className="flex flex-1 h-full min-h-0 bg-white rounded-t-2xl border border-gray-100 overflow-hidden">
			{/* left: public profile */}
			<div className="flex-1 min-w-0 flex flex-col">
				{/* mobile tab switcher */}
				<div className="lg:hidden flex shrink-0 border-b border-gray-100">
					{(["profile", "edit"] as const).map((tab) => (
						<button
							key={tab}
							onClick={() => setMobileTab(tab)}
							className={cn(
								"flex-1 py-3 text-[13px] font-medium capitalize transition-colors relative",
								mobileTab === tab ? "text-primary" : "text-gray-500",
							)}
						>
							{tab === "edit" ? "Edit Profile" : "Profile"}
							{mobileTab === tab && (
								<span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-primary rounded-full" />
							)}
						</button>
					))}
				</div>
				<div className={cn("flex-1 min-h-0", mobileTab === "edit" ? "hidden lg:block" : "block")}>
					<ProfilePublicView onBack={onBack} />
				</div>
			</div>

			{/* right: edit panel */}
			<div
				className={cn(
					"lg:w-[45%] shrink-0",
					mobileTab === "profile" ? "hidden lg:block" : "block w-full",
				)}
			>
				{rightContent}
			</div>
		</div>
	)
}

function ProfileNavCard({ onClick }: { onClick: () => void }) {
	const user = useAuthStore((s) => s.user)
	if (!user) return null

	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
	const bio = user.profile?.about_me

	return (
		<button
			onClick={onClick}
			className="w-full flex items-center gap-3.5 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left shrink-0"
		>
			<Avatar.Root className="w-11 h-11 rounded-full overflow-hidden shrink-0">
				<Avatar.Image
					src={user.profile_photo || undefined}
					alt={displayName}
					className="w-full h-full object-cover"
				/>
				<Avatar.Fallback className="w-full h-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
					{getInitials(user.first_name, user.last_name)}
				</Avatar.Fallback>
			</Avatar.Root>
			<div className="flex-1 min-w-0">
				<p className="text-[13.5px] font-bold text-gray-900 truncate leading-tight">
					{displayName}
				</p>
				{bio && <p className="text-xs text-gray-500 truncate mt-0.5">{bio}</p>}
			</div>
			<ChevronRight size={15} className="text-gray-400 shrink-0" />
		</button>
	)
}

function SettingsListView({
	activeSection,
	mobileView,
	onSectionSelect,
	onProfileClick,
	onOpenDialog,
	onMobileBack,
}: {
	activeSection: SectionId
	mobileView: "nav" | "panel"
	onSectionSelect: (id: SectionId) => void
	onProfileClick: () => void
	onOpenDialog: (id: string) => void
	onMobileBack: () => void
}) {
	const currentSection = SECTIONS.find((s) => s.id === activeSection)!

	return (
		<div className="flex flex-1 h-full min-h-0 bg-white rounded-t-2xl border border-gray-100 overflow-hidden">
			{/* left nav */}
			<nav
				className={cn(
					"w-full lg:w-[40%] shrink-0 border-r border-gray-100 flex-col overflow-hidden",
					mobileView === "panel" ? "hidden lg:flex" : "flex",
				)}
			>
				{/* Fixed header */}
				<div className="flex items-center px-5 pt-4.5 pb-3.5 border-b border-gray-100 shrink-0 bg-white">
					<h1 className="text-[17px] font-bold text-gray-900">Settings</h1>
				</div>

				{/* Profile card */}
				<ProfileNavCard onClick={onProfileClick} />

				{/* Scrollable section list */}
				<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-2">
					{SECTIONS.map((section) => {
						const isActive = activeSection === section.id
						return (
							<button
								key={section.id}
								onClick={() => onSectionSelect(section.id)}
								className={cn(
									"w-full flex items-center gap-3 px-5 py-4 text-left transition-colors border-b border-gray-50 last:border-0:",
									isActive ? "bg-gray-100/80" : "hover:bg-gray-50",
								)}
							>
								<div
									className={cn(
										"w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
										isActive ? "bg-primary/10 text-primary" : "bg-gray-50 text-gray-300",
									)}
								>
									{section.icon}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[13.5px] font-semibold text-gray-900 leading-tight">
										{section.label}
									</p>
									<p className="text-xs text-gray-500 mt-0.5 truncate">{section.description}</p>
								</div>
								<ChevronRight
									size={14}
									className={cn("shrink-0", isActive ? "text-gray-400" : "text-gray-300")}
								/>
							</button>
						)
					})}
				</div>
			</nav>

			{/* right content panel */}
			<div
				className={cn(
					"flex-1 min-w-0 flex flex-col overflow-hidden",
					mobileView === "nav" ? "hidden lg:flex" : "flex",
				)}
			>
				{/* mobile back row */}
				<div className="lg:hidden flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-100 shrink-0">
					<button
						onClick={onMobileBack}
						className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
					>
						<ArrowLeft size={15} className="text-gray-600" />
					</button>
					<span className="text-[14px] font-semibold text-gray-900">{currentSection.label}</span>
				</div>

				<div className="hidden lg:block px-7 pt-4.5 pb-4 border-b border-gray-100 shrink-0">
					<h2 className="text-[16.5px] font-bold text-gray-900">{currentSection.label}</h2>
					<p className="text-[12.5px] text-gray-500 mt-0.5 leading-relaxed">
						{currentSection.description}
					</p>
				</div>

				<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
					{currentSection.items.map((item, i) => (
						<button
							key={item.id}
							onClick={() => {
								if (item.href) {
									window.open(item.href, "_blank")
									return
								}
								onOpenDialog(item.id)
							}}
							className={cn(
								"w-full flex items-start gap-4 px-7 py-3.75 hover:bg-gray-50/80 transition-colors text-left",
								i < currentSection.items.length - 1 && "border-b border-gray-50",
							)}
						>
							<span
								className={cn(
									"shrink-0 mt-0.5",
									item.destructive ? "text-destructive" : "text-gray-500",
								)}
							>
								{item.icon}
							</span>
							<div className="flex-1 min-w-0">
								<p
									className={cn(
										"text-[13.5px] font-semibold leading-tight",
										item.destructive ? "text-destructive" : "text-gray-900",
									)}
								>
									{item.label}
								</p>
								<p className="text-[12.5px] text-gray-500 mt-0.5 leading-relaxed">
									{item.description}
								</p>
							</div>
							<ChevronRight size={14} className="text-gray-300 shrink-0 mt-0.5" />
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export function Settings() {
	const [view, setView] = useState<View>("settings")
	const [activeSection, setActiveSection] = useState<SectionId>("verification")
	const [mobileView, setMobileView] = useState<"nav" | "panel">("nav")
	const [openDialog, setOpenDialog] = useState<string | null>(null)

	const closeDialog = () => setOpenDialog(null)

	if (view === "profile") {
		return (
			<>
				<ProfileView onBack={() => setView("settings")} onOpenDialog={setOpenDialog} />
				{COMING_SOON.map(({ id, title }) => (
					<ComingSoonDialog key={id} open={openDialog === id} onClose={closeDialog} title={title} />
				))}
			</>
		)
	}

	return (
		<>
			<SettingsListView
				activeSection={activeSection}
				mobileView={mobileView}
				onSectionSelect={(id) => {
					setActiveSection(id)
					setMobileView("panel")
				}}
				onProfileClick={() => setView("profile")}
				onOpenDialog={setOpenDialog}
				onMobileBack={() => setMobileView("nav")}
			/>
			<AccountInfoDialog open={openDialog === "account-info"} onClose={closeDialog} />
			<DeactivateDialog open={openDialog === "deactivate"} onClose={closeDialog} />
			{COMING_SOON.map(({ id, title }) => (
				<ComingSoonDialog key={id} open={openDialog === id} onClose={closeDialog} title={title} />
			))}
		</>
	)
}
