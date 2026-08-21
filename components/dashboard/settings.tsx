"use client"

import LegalPrivacyPolicy from "@/components/legal/privacy-policy"
import LegalTerms from "@/components/legal/terms"
import { useLogout } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { ExternalLink } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import dayjs from "dayjs"
import {
	ArrowLeft,
	Bell,
	Check,
	ChevronDown,
	ChevronRight,
	Clock,
	CreditCard,
	Database,
	FileText,
	Globe,
	HardDrive,
	HelpCircle,
	Layers,
	Link2,
	Loader2,
	Lock,
	MapPin,
	MessageCircle,
	Monitor,
	MoreHorizontal,
	RotateCcw,
	Smartphone,
	Users,
	UserX,
	Volume2,
	Wifi,
	Wrench,
	X,
} from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar } from "radix-ui"
import type { ComponentType } from "react"
import { ReactNode, useEffect, useRef, useState } from "react"
import {
	ChangePasswordPanel,
	ChangePhonePanel,
	DeleteAccountPanel,
	ReportProblemPanel,
	SecurityNotificationsPanel,
	TwoStepVerificationPanel,
} from "./account-setting"
import { AddAccountPanel } from "./add-account-panel"
import { BlockedAccountsPanel } from "./blocked-accounts-panel"
import { ManageSubscriptionPanel } from "./manage-subscription-panel"
import {
	AddExternalLinkPanel,
	EditBioPanel,
	EditDobPanel,
	EditExternalLinkPanel,
	EditLocationPanel,
	EditNamePanel,
	EditProfilePanel,
	EditUsernamePanel,
} from "./profile-edit-panels"
import { Calendar, Link, Location } from "./profile-icons"
import {
	Account,
	AddAccount,
	Alert,
	ChangePhone,
	Chat,
	DataStorage,
	Languages,
	Logout,
	Privacy,
	ReportProblem,
	SecurityNotifications,
	Support,
	TimeZone,
	TwoStepVerification,
	Verification,
} from "./settings-icons"
import { SocialAccountsPanel } from "./social-accounts-panel"
import { SwitchTierPanel } from "./switch-tier-panel"
import { TimeZonePanel } from "./timezone-panel"

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

const FAQ_ITEMS = [
	{
		question: "How do I reset my password?",
		answer:
			"Go to Settings → Account → Change your password. We'll send a one-time code to your registered email to verify your identity before you set a new password.",
	},
	{
		question: "Can I have multiple accounts?",
		answer:
			"Yes. Head to Settings → Account → Add account to link up to 5 accounts. Switch between them instantly from the account menu at the top of the screen.",
	},
	{
		question: "How do I permanently delete my account?",
		answer:
			"Go to Settings → Account → Delete your account. After confirming, you have a 7-day grace period — simply sign back in within that window to cancel.",
	},
	{
		question: "How do I enable two-step verification?",
		answer:
			"Go to Settings → Account → Two-step verification. Choose between a 6-digit PIN, OTP via email, or Google Authenticator.",
	},
	{
		question: "Why isn't my post appearing in others' feeds?",
		answer:
			"Check the 'Who can see' setting on the post — it may be restricted to followers only. Feed personalisation also means posts don't always reach every follower immediately.",
	},
	{
		question: "What happens when I block someone?",
		answer:
			"Blocked accounts can't view your profile, posts, or contact you. They're not notified. Manage your blocked list under Settings → Privacy → Blocked accounts.",
	},
	{
		question: "How often can I change my username?",
		answer:
			"Once every 180 days. Your previous username becomes available to others immediately after the change.",
	},
	{
		question: "How do I report abusive or harmful content?",
		answer:
			"Tap the ··· menu on any post or profile and select Report. For account-level issues, use Settings → Support → Report a problem.",
	},
	{
		question: "How do I link my social accounts?",
		answer:
			"Go to Settings → Account → Link social accounts. Linking enables faster sign-in and optional cross-platform sharing with Facebook, X, and LinkedIn.",
	},
	{
		question: "Can I recover a deleted post?",
		answer:
			"Deleted posts can't be recovered. We recommend downloading your data archive before removing content you may want to keep.",
	},
]

function FAQPanel({ onBack }: { onBack: () => void }) {
	const [openIndex, setOpenIndex] = useState<number | null>(null)

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
				<button
					onClick={onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
					aria-label="Go back"
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>
				<h2 className="font-bold text-foreground text-[15.5px]">FAQ</h2>
			</div>

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 py-4 space-y-2.5">
				<p className="text-[12.5px] text-muted-foreground mb-3 leading-relaxed">
					Quick answers to the most common questions about AppsCombo.
				</p>
				{FAQ_ITEMS.map((item, i) => (
					<div
						key={i}
						className={cn(
							"border rounded-xl overflow-hidden transition-colors",
							openIndex === i ? "border-primary/30 bg-primary/2.5" : "border-border",
						)}
					>
						<button
							onClick={() => setOpenIndex(openIndex === i ? null : i)}
							className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left"
						>
							<span className="text-[13px] font-semibold text-foreground leading-snug">
								{item.question}
							</span>
							<ChevronDown
								size={14}
								className={cn(
									"text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200",
									openIndex === i && "rotate-180 text-primary",
								)}
							/>
						</button>
						{openIndex === i && (
							<div className="px-4 pb-4 border-t border-border/50 pt-3">
								<p className="text-[12.5px] text-muted-foreground leading-relaxed">{item.answer}</p>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

const QUESTION_TOPICS = [
	"General inquiry",
	"Account access",
	"Privacy & safety",
	"Billing & subscriptions",
	"Technical issue",
	"Content & feeds",
	"Other",
]

function AskQuestionPanel({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const [topic, setTopic] = useState("")
	const [topicOpen, setTopicOpen] = useState(false)
	const [message, setMessage] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [submitted, setSubmitted] = useState(false)
	const topicRef = useRef<HTMLDivElement>(null)
	const MAX = 500

	const canSubmit = topic.length > 0 && message.trim().length >= 20 && !submitting

	useEffect(() => {
		if (!topicOpen) return
		const handler = (e: MouseEvent) => {
			if (topicRef.current && !topicRef.current.contains(e.target as Node)) {
				setTopicOpen(false)
			}
		}
		document.addEventListener("mousedown", handler)
		return () => document.removeEventListener("mousedown", handler)
	}, [topicOpen])

	const handleSubmit = async () => {
		if (!canSubmit) return
		setSubmitting(true)
		// TODO: wire to real support endpoint
		await new Promise((r) => setTimeout(r, 1200))
		setSubmitting(false)
		setSubmitted(true)
	}

	if (submitted) {
		return (
			<div className="border-l border-border h-full flex flex-col overflow-hidden">
				<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
					<button
						onClick={onBack}
						className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
						aria-label="Go back"
					>
						<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
					</button>
					<h2 className="font-bold text-foreground text-[15.5px]">Ask a question</h2>
				</div>
				<div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
						<Check size={28} className="text-primary" strokeWidth={2} />
					</div>
					<div>
						<p className="font-bold text-foreground text-[15px]">Question submitted!</p>
						<p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed max-w-64">
							We&apos;ll reply to <span className="font-medium text-foreground">{user?.email}</span>{" "}
							within 2 business days.
						</p>
					</div>
					<button
						onClick={() => {
							setSubmitted(false)
							setTopic("")
							setMessage("")
						}}
						className="text-[13px] font-semibold text-primary hover:underline mt-2"
					>
						Ask another question
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
				<button
					onClick={onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
					aria-label="Go back"
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>
				<h2 className="font-bold text-foreground text-[15.5px]">Ask a question</h2>
			</div>

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5 flex flex-col gap-5">
				<p className="text-[13px] text-muted-foreground leading-relaxed -mt-1">
					Can&apos;t find what you&apos;re looking for? Send us your question and we&apos;ll get
					back to you within 2 business days.
				</p>

				<div className="flex flex-col gap-2">
					<label className="text-sm font-semibold text-foreground">Topic</label>
					<div className="relative" ref={topicRef}>
						<button
							type="button"
							onClick={() => setTopicOpen((v) => !v)}
							className={cn(
								"w-full flex items-center justify-between h-12 px-4 rounded-xl border transition-colors text-sm",
								topicOpen
									? "border-primary focus-within:ring-1 focus-within:ring-primary"
									: "border-input bg-card cursor-pointer hover:border-ring focus-within:ring-1 focus-within:ring-input",
							)}
						>
							<span className={topic ? "text-foreground" : "text-muted-foreground"}>
								{topic || "Select a topic…"}
							</span>
							<ChevronDown
								size={16}
								className={cn(
									"text-muted-foreground transition-transform duration-150 shrink-0",
									topicOpen && "rotate-180",
								)}
							/>
						</button>

						{topicOpen && (
							<div className="absolute z-50 top-full mt-1 left-0 w-full bg-popover border border-border rounded-2xl shadow-xl overflow-hidden">
								<div className="max-h-56 overflow-y-auto">
									{QUESTION_TOPICS.map((t) => (
										<button
											key={t}
											type="button"
											onClick={() => {
												setTopic(t)
												setTopicOpen(false)
											}}
											className={cn(
												"w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left",
												topic === t ? "bg-primary/5 text-primary font-semibold" : "text-foreground",
											)}
										>
											<span className="flex-1 truncate">{t}</span>
											{topic === t && (
												<Check size={14} className="text-primary shrink-0" strokeWidth={2.5} />
											)}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Reply-to */}
				<div className="flex flex-col gap-1.5">
					<label className="text-sm font-semibold text-foreground">Reply to</label>
					<div className="flex items-center gap-2.5 h-11 px-4 rounded-xl border border-border bg-muted/60">
						<span className="text-[13.5px] text-muted-foreground flex-1 truncate">
							{user?.email}
						</span>
						<Lock size={13} className="text-muted-foreground/40 shrink-0" />
					</div>
					<p className="text-[11.5px] text-muted-foreground">
						We&apos;ll reply to the email address on your account.
					</p>
				</div>

				{/* Message */}
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<label className="text-sm font-semibold text-foreground">Your question</label>
						<span
							className={cn(
								"text-[11.5px] tabular-nums",
								message.length >= MAX * 0.9 ? "text-amber-400" : "text-muted-foreground/50",
							)}
						>
							{message.length}/{MAX}
						</span>
					</div>
					<div
						className={cn(
							"rounded-xl border transition-colors",
							message.length >= 20
								? "border-primary focus-within:ring-1 focus-within:ring-primary"
								: "border-input focus-within:ring-1 focus-within:ring-input",
						)}
					>
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
							placeholder="Describe your issue or question in detail…"
							rows={5}
							className="w-full bg-transparent px-4 pt-3.5 pb-3 text-[13.5px] text-foreground resize-none outline-none leading-relaxed placeholder:text-muted-foreground"
						/>
					</div>
					{message.length > 0 && message.trim().length < 20 && (
						<p className="text-[11.5px] text-muted-foreground">
							Add a bit more detail to help us understand your question.
						</p>
					)}
				</div>
			</div>

			<div className="shrink-0 px-6 py-4 border-t border-border/50">
				<button
					onClick={handleSubmit}
					disabled={!canSubmit}
					className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
				>
					{submitting ? (
						<>
							<Loader2 size={14} className="animate-spin" /> Submitting…
						</>
					) : (
						"Submit question"
					)}
				</button>
			</div>
		</div>
	)
}

const LANGUAGES = [
	{ code: "en", label: "English", nativeLabel: "English", available: true },
	{ code: "fr", label: "French", nativeLabel: "Français", available: false },
	{ code: "es", label: "Spanish", nativeLabel: "Español", available: false },
	{ code: "pt", label: "Portuguese", nativeLabel: "Português", available: false },
	{ code: "ar", label: "Arabic", nativeLabel: "العربية", available: false },
	{ code: "zh", label: "Chinese (Simplified)", nativeLabel: "中文（简体）", available: false },
	{ code: "de", label: "German", nativeLabel: "Deutsch", available: false },
	{ code: "hi", label: "Hindi", nativeLabel: "हिन्दी", available: false },
	{ code: "ja", label: "Japanese", nativeLabel: "日本語", available: false },
	{ code: "ko", label: "Korean", nativeLabel: "한국어", available: false },
	{ code: "ha", label: "Hausa", nativeLabel: "Hausa", available: false },
	{ code: "yo", label: "Yoruba", nativeLabel: "Yorùbá", available: false },
	{ code: "ig", label: "Igbo", nativeLabel: "Igbo", available: false },
	{ code: "sw", label: "Swahili", nativeLabel: "Kiswahili", available: false },
]

function AppLanguagePanel({ onBack }: { onBack: () => void }) {
	const [selected, setSelected] = useState("en")

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
				<button
					onClick={onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
					aria-label="Go back"
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>
				<h2 className="font-bold text-foreground text-[15.5px]">App language</h2>
			</div>
			<p className="px-6 pt-4 pb-3 text-[12.5px] text-muted-foreground leading-relaxed shrink-0">
				Choose the language you&apos;d like to use in AppsCombo. More languages are on the way.
			</p>
			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden divide-y divide-border/50">
				{LANGUAGES.map((lang) => (
					<button
						key={lang.code}
						onClick={() => lang.available && setSelected(lang.code)}
						disabled={!lang.available}
						className={cn(
							"w-full flex items-center justify-between gap-3 px-6 py-3.5 text-left transition-colors",
							lang.available && selected !== lang.code && "hover:bg-accent",
							selected === lang.code && "bg-primary/5",
							!lang.available && "cursor-default",
						)}
					>
						<div className="flex-1 min-w-0">
							<p
								className={cn(
									"text-[13.5px] font-semibold leading-tight",
									selected === lang.code
										? "text-primary"
										: lang.available
											? "text-foreground"
											: "text-muted-foreground",
								)}
							>
								{lang.label}
							</p>
							<p
								className={cn(
									"text-[12px] mt-0.5",
									lang.available ? "text-muted-foreground" : "text-muted-foreground/50",
								)}
							>
								{lang.nativeLabel}
							</p>
						</div>
						{lang.available ? (
							selected === lang.code ? (
								<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
									<Check size={11} className="text-primary-foreground" strokeWidth={3} />
								</div>
							) : (
								<div className="w-5 h-5 rounded-full border-2 border-border shrink-0" />
							)
						) : (
							<span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full leading-none shrink-0">
								Soon
							</span>
						)}
					</button>
				))}
			</div>
		</div>
	)
}

const STORAGE_BREAKDOWN = [
	{ label: "Photos & videos", emoji: "🖼️", mb: 612 },
	{ label: "Documents", emoji: "📄", mb: 118 },
	{ label: "Audio files", emoji: "🎵", mb: 42 },
	{ label: "Cached data", emoji: "⚡", mb: 75 },
]
const STORAGE_TOTAL_MB = STORAGE_BREAKDOWN.reduce((s, i) => s + i.mb, 0)
const STORAGE_LIMIT_GB = 5

function formatBytes(mb: number) {
	return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`
}

function StorageUsagePanel({ onBack }: { onBack: () => void }) {
	const [clearing, setClearing] = useState(false)
	const [cacheCleared, setCacheCleared] = useState(false)
	const displayTotal = cacheCleared ? STORAGE_TOTAL_MB - 75 : STORAGE_TOTAL_MB

	const handleClear = async () => {
		setClearing(true)
		await new Promise((r) => setTimeout(r, 1200))
		setClearing(false)
		setCacheCleared(true)
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
				<button
					onClick={onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
					aria-label="Go back"
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>
				<h2 className="font-bold text-foreground text-[15.5px]">Storage usage</h2>
			</div>

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5 space-y-5">
				{/* Summary card */}
				<div className="bg-muted/40 rounded-2xl p-5 border border-border/60">
					<div className="flex items-end justify-between mb-3">
						<div>
							<p className="text-2xl font-bold text-foreground">{formatBytes(displayTotal)}</p>
							<p className="text-[12.5px] text-muted-foreground mt-0.5">
								used of {STORAGE_LIMIT_GB} GB
							</p>
						</div>
						<p className="text-[12.5px] font-semibold text-muted-foreground tabular-nums">
							{((displayTotal / (STORAGE_LIMIT_GB * 1024)) * 100).toFixed(0)}%
						</p>
					</div>
					<div className="h-2 bg-border rounded-full overflow-hidden">
						<div
							className="h-full bg-primary rounded-full transition-all duration-700"
							style={{
								width: `${Math.min((displayTotal / (STORAGE_LIMIT_GB * 1024)) * 100, 100)}%`,
							}}
						/>
					</div>
				</div>

				{/* Breakdown */}
				<div>
					<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
						Breakdown
					</p>
					<div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
						{STORAGE_BREAKDOWN.map((item) => {
							const pct = (item.mb / STORAGE_TOTAL_MB) * 100
							const isCache = item.label === "Cached data"
							const displayMb = isCache && cacheCleared ? 0 : item.mb
							return (
								<div key={item.label} className="px-5 py-3.5 flex items-center gap-4">
									<span className="text-lg shrink-0">{item.emoji}</span>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1.5">
											<span className="text-[13px] font-medium text-foreground">{item.label}</span>
											<span className="text-[12.5px] text-muted-foreground tabular-nums">
												{formatBytes(displayMb)}
											</span>
										</div>
										<div className="h-1.5 bg-border rounded-full overflow-hidden">
											<div
												className="h-full bg-primary/60 rounded-full transition-all duration-500"
												style={{ width: isCache && cacheCleared ? "0%" : `${pct}%` }}
											/>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Clear cache */}
				<div className="rounded-2xl border border-border p-5">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-[13.5px] font-semibold text-foreground">Cached data</p>
							<p className="text-[12.5px] text-muted-foreground mt-0.5 leading-relaxed">
								{cacheCleared
									? "Cache has been cleared successfully."
									: "Temporary files that can be safely removed to free up space."}
							</p>
						</div>
						<span className="text-[12px] font-semibold text-primary shrink-0 mt-0.5 tabular-nums">
							{cacheCleared ? "0 MB" : "75 MB"}
						</span>
					</div>
					{!cacheCleared && (
						<button
							onClick={handleClear}
							disabled={clearing}
							className="mt-4 w-full h-10 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-accent disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
						>
							{clearing ? (
								<>
									<Loader2 size={13} className="animate-spin" /> Clearing…
								</>
							) : (
								"Clear cached data"
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

function NetworkUsagePanel({ onBack }: { onBack: () => void }) {
	const [autoDownload, setAutoDownload] = useState(true)
	const [resetting, setResetting] = useState(false)
	const [resetDone, setResetDone] = useState(false)

	const handleReset = async () => {
		setResetting(true)
		await new Promise((r) => setTimeout(r, 900))
		setResetting(false)
		setResetDone(true)
	}

	const stats = resetDone
		? { total: "0 B", wifi: "0 B", mobile: "0 B" }
		: { total: "2.4 GB", wifi: "1.83 GB", mobile: "621 MB" }

	const month = new Date().toLocaleString("default", { month: "long", year: "numeric" })

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
				<button
					onClick={onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
					aria-label="Go back"
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>
				<h2 className="font-bold text-foreground text-[15.5px]">Network usage</h2>
			</div>

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-6 py-5 space-y-5">
				{/* Monthly total */}
				<div className="bg-muted/40 rounded-2xl p-5 border border-border/60 text-center">
					<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
						Total · {month}
					</p>
					<p className="text-3xl font-bold text-foreground tabular-nums">{stats.total}</p>
				</div>

				{/* Wi-Fi / Mobile breakdown */}
				<div className="rounded-2xl border border-border overflow-hidden divide-y divide-border">
					<div className="flex items-center gap-4 px-5 py-4">
						<div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
							<Wifi size={18} className="text-blue-500" />
						</div>
						<div className="flex-1">
							<p className="text-[13.5px] font-semibold text-foreground">Wi-Fi</p>
							<p className="text-[12px] text-muted-foreground mt-0.5">Used over wireless</p>
						</div>
						<span className="text-[13.5px] font-semibold text-foreground tabular-nums">
							{stats.wifi}
						</span>
					</div>
					<div className="flex items-center gap-4 px-5 py-4">
						<div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
							<Smartphone size={18} className="text-orange-500" />
						</div>
						<div className="flex-1">
							<p className="text-[13.5px] font-semibold text-foreground">Mobile data</p>
							<p className="text-[12px] text-muted-foreground mt-0.5">Used over cellular</p>
						</div>
						<span className="text-[13.5px] font-semibold text-foreground tabular-nums">
							{stats.mobile}
						</span>
					</div>
				</div>

				{/* Settings */}
				<div className="rounded-2xl border border-border overflow-hidden">
					<div className="flex items-start justify-between gap-4 px-5 py-4">
						<div className="flex-1">
							<p className="text-[13.5px] font-semibold text-foreground">Auto-download media</p>
							<p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
								Automatically download photos and videos when connected to Wi-Fi
							</p>
						</div>
						<button
							onClick={() => setAutoDownload((v) => !v)}
							role="switch"
							aria-checked={autoDownload}
							className={cn(
								"w-9 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer shrink-0 mt-0.5",
								autoDownload ? "bg-primary" : "bg-muted-foreground/30",
							)}
						>
							<div
								className={cn(
									"w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-200",
									autoDownload ? "translate-x-4" : "translate-x-0",
								)}
							/>
						</button>
					</div>
				</div>

				{/* Reset */}
				<button
					onClick={handleReset}
					disabled={resetting || resetDone}
					className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-accent disabled:opacity-40 transition-colors"
				>
					{resetting ? (
						<>
							<Loader2 size={13} className="animate-spin" /> Resetting…
						</>
					) : resetDone ? (
						"Statistics reset"
					) : (
						<>
							<RotateCcw size={13} />
							Reset statistics
						</>
					)}
				</button>
			</div>
		</div>
	)
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
				id: "security-notifications",
				label: "Security notifications",
				description: "Manage alerts about account activity and security events",
				icon: <SecurityNotifications size={18} />,
			},
			{
				id: "two-step-verification",
				label: "Two-step verification",
				description: "Secure your account with two-step verification",
				icon: <TwoStepVerification size={18} />,
			},
			{
				id: "change-phone",
				label: "Change phone number",
				description: "Update the phone number linked to your account",
				icon: <ChangePhone size={18} />,
			},
			{
				id: "change-password",
				label: "Change your password",
				description: "Change your password at any time",
				icon: <Lock size={18} />,
			},
			{
				id: "add-account",
				label: "Add account",
				description: "Add and switch between multiple accounts",
				icon: <AddAccount size={18} />,
			},
			{
				id: "social-accounts",
				label: "Link social accounts",
				description: "Connect your Facebook, X, LinkedIn and more to your profile",
				icon: <Link2 size={18} />,
			},
			{
				id: "time-zone",
				label: "Time zone",
				description: "Manage your preferred time zone",
				icon: <TimeZone size={18} />,
			},
			{
				id: "logout",
				label: "Log out",
				description: "Log out of your account",
				icon: <Logout size={18} />,
				destructive: true,
			},
			{
				id: "deactivate",
				label: "Delete your account",
				description: "Find out how to delete your account",
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
				id: "report-problem",
				label: "Report a problem",
				description: "Report bugs, issues, or unexpected behaviour",
				icon: <ReportProblem size={18} />,
			},
			{
				id: "faq",
				label: "FAQ",
				description: "Find answers to commonly asked questions",
				icon: <HelpCircle size={18} />,
			},
			{
				id: "ask-question",
				label: "Ask a question",
				description: "Submit a question and our team will respond within 2 business days",
				icon: <MessageCircle size={18} />,
			},
			{
				id: "terms",
				label: "Terms & Conditions",
				description: "Read our Terms & Conditions",
				icon: <FileText size={18} />,
			},
			{
				id: "privacy-policy",
				label: "Privacy Policy",
				description: "Read our Privacy Policy",
				icon: <FileText size={18} />,
			},
		],
	},
]

const PANEL_REGISTRY: Record<
	string,
	ComponentType<{ onBack: () => void; onNavigate?: (id: string | null) => void }>
> = {
	"change-password": ChangePasswordPanel,
	"security-notifications": SecurityNotificationsPanel,
	"two-step-verification": TwoStepVerificationPanel,
	"report-problem": ReportProblemPanel,
	"change-phone": ChangePhonePanel,
	"add-account": AddAccountPanel,
	"social-accounts": SocialAccountsPanel,
	"time-zone": TimeZonePanel,
	blocked: BlockedAccountsPanel,
	deactivate: DeleteAccountPanel,
	terms: TermsSettingsPanel,
	"privacy-policy": PrivacyPolicySettingsPanel,
	faq: FAQPanel,
	"ask-question": AskQuestionPanel,
	"app-language": AppLanguagePanel,
	"storage-usage": StorageUsagePanel,
	"network-usage": NetworkUsagePanel,
	"switch-tier": SwitchTierPanel,
	"manage-subscription": ManageSubscriptionPanel,
}

const COMING_SOON: { id: string; title: string }[] = [
	{ id: "last-seen", title: "Last seen & online" },
	{ id: "location-sharing", title: "Live location sharing" },
	{ id: "push-notifs", title: "Push notifications" },
	{ id: "message-tones", title: "Message tones" },
	{ id: "group-tones", title: "Group tones" },
	{ id: "chat-backup", title: "Chat backup" },
	{ id: "linked-devices", title: "Linked devices" },
	{ id: "edit-phone", title: "Phone number" },
]

function getInitials(first: string | null, last: string | null) {
	return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}

function formatCount(n: number) {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
	return String(n)
}

function formatDob(dob: string, dob_visibility: "full" | "partial") {
	const format = dob_visibility === "partial" ? "D MMM" : "D MMM, YYYY"
	return dayjs(dob).format(format)
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
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-[12%] -translate-x-1/2 z-50 w-full max-w-110 max-h-[78vh] bg-card border border-border rounded-2xl shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 flex flex-col overflow-hidden">
					{/* Header */}
					<div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
						<div className="pr-4 min-w-0">
							<Dialog.Title className="font-bold text-foreground text-[15.5px] leading-tight">
								{title}
							</Dialog.Title>
							{description && (
								<Dialog.Description className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
									{description}
								</Dialog.Description>
							)}
						</div>
						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors shrink-0 mt-0.5">
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

function LogoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const logout = useLogout()

	return (
		<SettingsDialog open={open} onClose={onClose} title="Log out">
			<div className="px-6 py-5">
				<p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
					Are you sure you want to log out of your account? You&apos;ll need to sign in again to
					access AppsCombo.
				</p>
				<div className="flex gap-2.5">
					<button
						onClick={onClose}
						className="flex-1 h-10 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
					>
						Cancel
					</button>
					<button
						onClick={() => logout.mutate()}
						disabled={logout.isPending}
						className="flex-1 h-10 rounded-xl bg-destructive text-white text-[13px] font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
					>
						{logout.isPending ? (
							<>
								<Loader2 size={12} className="animate-spin" /> Logging out…
							</>
						) : (
							"Log out"
						)}
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
					<p className="font-semibold text-foreground text-[13.5px]">In development</p>
					<p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed">
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
							i < rows.length - 1 && "border-b border-border/50",
						)}
					>
						<span className="text-[12.5px] text-muted-foreground shrink-0">{row.label}</span>
						<span className="text-[12.5px] font-medium text-foreground text-right ml-6 break-all">
							{row.value}
						</span>
					</div>
				))}
			</div>
		</SettingsDialog>
	)
}

function ExternalLinksDialog({
	open,
	onClose,
	links,
}: {
	open: boolean
	onClose: () => void
	links: ExternalLink[]
}) {
	return (
		<SettingsDialog open={open} onClose={onClose} title="Links">
			<div className="px-6 py-2">
				{links.map((link, i) => (
					<a
						key={link.id}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						className={cn(
							"flex items-center gap-3 py-3.5 hover:bg-accent/60 transition-colors -mx-6 px-6",
							i < links.length - 1 && "border-b border-border/50",
						)}
					>
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
							<Link size={14} color="#6A88D1" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-[13px] font-semibold text-foreground truncate">
								{link.label || "Link"}
							</p>
							<p className="text-[12px] text-muted-foreground truncate">{link.url}</p>
						</div>
					</a>
				))}
			</div>
		</SettingsDialog>
	)
}

function TermsSettingsPanel({ onBack }: { onBack: () => void }) {
	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
				<button
					onClick={onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
					aria-label="Go back"
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>
				<h2 className="font-bold text-foreground text-[15.5px]">Terms & Conditions</h2>
			</div>
			<div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [&_nav]:hidden!">
				<LegalTerms />
			</div>
		</div>
	)
}

function PrivacyPolicySettingsPanel({ onBack }: { onBack: () => void }) {
	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
				<button
					onClick={onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
					aria-label="Go back"
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>
				<h2 className="font-bold text-foreground text-[15.5px]">Privacy Policy</h2>
			</div>
			<div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [&_nav]:hidden!">
				<LegalPrivacyPolicy />
			</div>
		</div>
	)
}

function ProfilePublicView({ onBack }: { onBack: () => void }) {
	const user = useAuthStore((s) => s.user)
	const [linksDialogOpen, setLinksDialogOpen] = useState(false)
	if (!user) return null

	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
	const bio = user.profile?.about_me
	const links = user.external_links ?? []

	return (
		<div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden">
			{/* cover + avatar */}
			<div className="relative">
				<div className="h-48.75 w-full relative overflow-hidden bg-linear-to-br from-primary/20 via-primary/10 to-primary/5">
					{user.cover_photo ? (
						<Image src={user.cover_photo} alt="Cover" fill className="object-cover" />
					) : null}
					{/* overlaid controls */}
					<button
						onClick={onBack}
						className="absolute top-4 left-4 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-card transition-colors"
					>
						<ArrowLeft size={15} className="text-foreground" />
					</button>
					<button className="absolute top-4 right-4 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-card transition-colors">
						<MoreHorizontal size={15} className="text-foreground" />
					</button>
				</div>

				{/* profile avatar */}
				<div className="absolute left-5 -bottom-8 z-10">
					<div className="relative w-17 h-17 rounded-full border-[2.5px] border-card overflow-hidden bg-primary/20 shadow-md">
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
				<h2 className="text-[18px] font-bold text-foreground leading-tight">{displayName}</h2>
				<p className="text-[13px] text-muted-foreground mt-0.5">@{user.username}</p>

				{/* Stats */}
				<div className="flex items-center gap-6 mt-3.5 mb-4">
					{[
						{ label: "Connections", value: user.connection_count ?? 0 },
						{ label: "Following", value: user.following_count ?? 0 },
						{ label: "Followers", value: user.follower_count ?? 0 },
					].map(({ label, value }) => (
						<div key={label} className="flex flex-1 flex-col">
							<span className="text-[15px] font-bold text-foreground">{formatCount(value)}</span>
							<span className="text-[13px] text-muted-foreground">{label}</span>
						</div>
					))}
				</div>

				{/* Bio */}
				{bio && <p className="text-[13px] text-foreground leading-relaxed mb-3">{bio}</p>}

				{/* External links */}
				{links.length > 0 && (
					<div className="flex flex-wrap items-center gap-1.5 mb-3 min-w-0 text-[12.5px] text-muted-foreground">
						<Link size={14} />
						<a
							href={links[0].url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary font-medium truncate min-w-0 hover:underline"
						>
							{links[0].label || links[0].url}
						</a>
						{links.length > 1 && (
							<button
								onClick={() => setLinksDialogOpen(true)}
								className="text-primary font-medium hover:underline shrink-0 whitespace-nowrap"
							>
								and {links.length - 1} more
							</button>
						)}
					</div>
				)}

				{/* Location + date joined */}
				<div className="flex items-center gap-8 flex-wrap">
					{(user.country || user.state) && (
						<div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
							<Location size={14} />
							<span className="font-medium text-foreground">
								{[user.state, user.country].filter(Boolean).join(", ")}
							</span>
						</div>
					)}
					{user.date_joined && (
						<div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
							<Calendar size={14} />
							<span className="font-medium text-foreground">
								Joined {dayjs(user.date_joined).format("MMM, YYYY")}
							</span>
						</div>
					)}
					{user.dob && (
						<div className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
							<Calendar size={14} />
							<span className="font-medium text-foreground">
								Born {formatDob(user.dob, user.dob_visibility)}
							</span>
						</div>
					)}
				</div>
			</div>

			<ExternalLinksDialog
				open={linksDialogOpen}
				onClose={() => setLinksDialogOpen(false)}
				links={links}
			/>
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
	const user = useAuthStore((s) => s.user)
	const [mobileTab, setMobileTab] = useState<"profile" | "edit">("profile")
	const [activePanel, setActivePanel] = useState<string | null>(null)
	const [selectedLink, setSelectedLink] = useState<ExternalLink | null>(null)

	const INLINE_PANELS = [
		"edit-name",
		"edit-username",
		"edit-bio",
		"edit-dob",
		"edit-location",
		"add-link",
		"edit-link",
	]

	const handleEdit = (id: string) => {
		if (id.startsWith("edit-link-")) {
			const linkId = parseInt(id.replace("edit-link-", ""), 10)
			const link = user?.external_links.find((l) => l.id === linkId)
			if (link) {
				setSelectedLink(link)
				setActivePanel("edit-link")
			}
			return
		}
		if (INLINE_PANELS.includes(id)) {
			setActivePanel(id)
		} else {
			onOpenDialog(id)
		}
	}

	const clearPanel = () => {
		setActivePanel(null)
		setSelectedLink(null)
	}

	const rightContent =
		activePanel === "edit-name" ? (
			<EditNamePanel onBack={() => setActivePanel(null)} />
		) : activePanel === "edit-username" ? (
			<EditUsernamePanel onBack={() => setActivePanel(null)} />
		) : activePanel === "edit-bio" ? (
			<EditBioPanel onBack={() => setActivePanel(null)} />
		) : activePanel === "edit-dob" ? (
			<EditDobPanel onBack={() => setActivePanel(null)} />
		) : activePanel === "edit-location" ? (
			<EditLocationPanel onBack={() => setActivePanel(null)} />
		) : activePanel === "add-link" ? (
			<AddExternalLinkPanel onBack={() => setActivePanel(null)} />
		) : activePanel === "edit-link" && selectedLink ? (
			<EditExternalLinkPanel link={selectedLink} onBack={clearPanel} />
		) : (
			<EditProfilePanel onOpenDialog={handleEdit} />
		)

	return (
		<div className="flex flex-1 h-full min-h-0 bg-card rounded-t-2xl border border-border overflow-hidden">
			{/* left: public profile */}
			<div className="flex-1 min-w-0 flex flex-col">
				{/* mobile tab switcher */}
				<div className="lg:hidden flex shrink-0 border-b border-border">
					{(["profile", "edit"] as const).map((tab) => (
						<button
							key={tab}
							onClick={() => setMobileTab(tab)}
							className={cn(
								"flex-1 py-3 text-[13px] font-medium capitalize transition-colors relative",
								mobileTab === tab ? "text-primary" : "text-muted-foreground",
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
			className="w-full flex items-center gap-3.5 px-5 py-4 border-b border-border hover:bg-accent transition-colors text-left shrink-0"
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
				<p className="text-[13.5px] font-bold text-foreground truncate leading-tight">
					{displayName}
				</p>
				{bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{bio}</p>}
			</div>
			<ChevronRight size={15} className="text-muted-foreground/40 shrink-0" />
		</button>
	)
}

function SettingsListView({
	activeSection,
	mobileView,
	activePanel,
	onSectionSelect,
	onProfileClick,
	onOpenDialog,
	onActivePanel,
	onMobileBack,
}: {
	activeSection: SectionId
	mobileView: "nav" | "panel"
	activePanel: string | null
	onSectionSelect: (id: SectionId) => void
	onProfileClick: () => void
	onOpenDialog: (id: string) => void
	onActivePanel: (id: string | null) => void
	onMobileBack: () => void
}) {
	const currentSection = SECTIONS.find((s) => s.id === activeSection)!
	const ActivePanelComponent = activePanel ? PANEL_REGISTRY[activePanel] : null

	return (
		<div className="flex flex-1 h-full min-h-0 bg-card rounded-t-2xl border border-border overflow-hidden">
			{/* left nav */}
			<nav
				className={cn(
					"w-full lg:w-[40%] shrink-0 border-r border-border flex-col overflow-hidden",
					mobileView === "panel" ? "hidden lg:flex" : "flex",
				)}
			>
				{/* Fixed header */}
				<div className="flex items-center px-5 pt-4.5 pb-3.5 border-b border-border shrink-0 bg-card">
					<h1 className="text-[17px] font-bold text-foreground">Settings</h1>
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
									"w-full flex items-center gap-3 px-5 py-4 text-left transition-colors border-b border-border/50 last:border-0",
									isActive ? "bg-accent/80" : "hover:bg-accent",
								)}
							>
								<div
									className={cn(
										"w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
										isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60",
									)}
								>
									{section.icon}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[13.5px] font-semibold text-foreground leading-tight">
										{section.label}
									</p>
									<p className="text-xs text-muted-foreground mt-0.5 truncate">
										{section.description}
									</p>
								</div>
								<ChevronRight
									size={14}
									className={cn(
										"shrink-0",
										isActive ? "text-muted-foreground" : "text-muted-foreground/40",
									)}
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
				{ActivePanelComponent ? (
					<ActivePanelComponent onBack={() => onActivePanel(null)} onNavigate={onActivePanel} />
				) : (
					<>
						{/* mobile back row */}
						<div className="lg:hidden flex items-center gap-2 px-5 pt-4 pb-3 border-b border-border shrink-0">
							<button
								onClick={onMobileBack}
								className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
							>
								<ArrowLeft size={15} className="text-muted-foreground" />
							</button>
							<span className="text-[14px] font-semibold text-foreground">
								{currentSection.label}
							</span>
						</div>

						<div className="hidden lg:block px-7 pt-4.5 pb-4 border-b border-border shrink-0">
							<h2 className="text-[16.5px] font-bold text-foreground">{currentSection.label}</h2>
							<p className="text-[12.5px] text-muted-foreground mt-0.5 leading-relaxed">
								{currentSection.description}
							</p>
						</div>

						<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-2">
							{currentSection.items.map((item, i) => (
								<button
									key={item.id}
									onClick={() => {
										if (item.href) {
											window.open(item.href, "_blank")
											return
										}
										if (PANEL_REGISTRY[item.id]) {
											onActivePanel(item.id)
										} else {
											onOpenDialog(item.id)
										}
									}}
									className={cn(
										"w-full flex items-start gap-4 px-7 py-3.75 hover:bg-accent/80 transition-colors text-left",
										i < currentSection.items.length - 1 && "border-b border-border/50",
									)}
								>
									<span
										className={cn(
											"shrink-0 mt-0.5",
											item.destructive ? "text-destructive" : "text-muted-foreground",
										)}
									>
										{item.icon}
									</span>
									<div className="flex-1 min-w-0">
										<p
											className={cn(
												"text-[13.5px] font-semibold leading-tight",
												item.destructive ? "text-destructive" : "text-foreground",
											)}
										>
											{item.label}
										</p>
										<p className="text-[12.5px] text-muted-foreground mt-0.5 leading-relaxed">
											{item.description}
										</p>
									</div>
									<ChevronRight size={14} className="text-muted-foreground/40 shrink-0 mt-0.5" />
								</button>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export function Settings() {
	const searchParams = useSearchParams()
	const router = useRouter()

	const [returnTo] = useState(() => {
		const raw = searchParams.get("returnTo")
		return raw && raw.startsWith("/") ? raw : null // basic same-origin guard
	})
	const [view, setView] = useState<View>(() =>
		searchParams.get("view") === "profile" ? "profile" : "settings",
	)
	const [activeSection, setActiveSection] = useState<SectionId>("verification")
	const [mobileView, setMobileView] = useState<"nav" | "panel">("nav")
	const [activePanel, setActivePanel] = useState<string | null>(null)
	const [openDialog, setOpenDialog] = useState<string | null>(null)

	const closeDialog = () => setOpenDialog(null)

	const handleProfileViewBack = () => {
		if (!returnTo) setView("settings")
		else router.push(returnTo)
	}

	if (view === "profile") {
		return (
			<>
				<ProfileView onBack={handleProfileViewBack} onOpenDialog={setOpenDialog} />
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
				activePanel={activePanel}
				onSectionSelect={(id) => {
					setActiveSection(id)
					setActivePanel(null)
					setMobileView("panel")
				}}
				onProfileClick={() => setView("profile")}
				onOpenDialog={setOpenDialog}
				onActivePanel={setActivePanel}
				onMobileBack={() => {
					if (activePanel) {
						setActivePanel(null)
					} else {
						setMobileView("nav")
					}
				}}
			/>
			<AccountInfoDialog open={openDialog === "account-info"} onClose={closeDialog} />
			<LogoutDialog open={openDialog === "logout"} onClose={closeDialog} />
			{COMING_SOON.map(({ id, title }) => (
				<ComingSoonDialog key={id} open={openDialog === id} onClose={closeDialog} title={title} />
			))}
		</>
	)
}
