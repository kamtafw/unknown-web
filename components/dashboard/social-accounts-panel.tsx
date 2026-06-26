"use client"

import { useSocialAccounts, useUnlinkSocialAccount } from "@/hooks/use-social-accounts"
import { SocialAccount } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

function FacebookIcon({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
		</svg>
	)
}

function XIcon({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	)
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2">
			<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
		</svg>
	)
}

type PlatformConfig = {
	label: string
	bgColor: string
	Icon: React.ComponentType<{ size?: number }>
}

const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
	facebook: { label: "Facebook", bgColor: "#E7F0FD", Icon: FacebookIcon },
	x: { label: "X", bgColor: "#F0F0F0", Icon: XIcon },
	linkedin: { label: "LinkedIn", bgColor: "#E8F1F8", Icon: LinkedInIcon },
}

const DEFAULT_PLATFORMS = ["facebook", "x", "linkedin"]

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
				aria-label="Go back"
			>
				<ArrowLeft size={15} className="text-gray-600" strokeWidth={2.5} />
			</button>
			<h2 className="font-bold text-gray-900 text-[15.5px]">{title}</h2>
		</div>
	)
}

function PlatformSkeleton() {
	return (
		<div className="flex items-center gap-3.5 px-6 py-4 animate-pulse">
			<div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
			<div className="flex-1 space-y-1.5">
				<div className="h-3 bg-gray-200 rounded-full w-1/4" />
				<div className="h-2.5 bg-gray-200 rounded-full w-2/5" />
			</div>
			<div className="h-7 w-14 bg-gray-200 rounded-full shrink-0" />
		</div>
	)
}

function UnlinkDialog({
	open,
	onClose,
	platformName,
	onConfirm,
	isPending,
}: {
	open: boolean
	onClose: () => void
	platformName: string
	onConfirm: () => void
	isPending: boolean
}) {
	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-[calc(100%-2rem)] max-w-96 bg-white rounded-2xl shadow-2xl px-6 py-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<Dialog.Title className="font-bold text-gray-900 text-[15px] mb-1.5">
						Disconnect {platformName}?
					</Dialog.Title>
					<Dialog.Description className="text-[13px] text-gray-500 leading-relaxed mb-6">
						Your {platformName} account will be unlinked from AppsCombo. You can reconnect it at any
						time.
					</Dialog.Description>
					<div className="flex items-center justify-end gap-6">
						<Dialog.Close asChild>
							<button className="flex-1 text-sm font-semibold text-gray-600 hover:opacity-50 transition-colors cursor-pointer">
								Cancel
							</button>
						</Dialog.Close>
						<button
							onClick={onConfirm}
							disabled={isPending}
							className="flex-1 text-sm text-destructive font-semibold hover:opacity-80 disabled:opacity-50 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
						>
							{isPending ? (
								<>
									<Loader2 size={12} className="animate-spin" /> Disconnecting…
								</>
							) : (
								"Disconnect"
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

interface PlatformRowProps {
	account: SocialAccount
	isLinking: boolean
	isUnlinking: boolean
	onLink: () => void
	onUnlink: () => void
}

function PlatformRow({ account, isLinking, isUnlinking, onLink, onUnlink }: PlatformRowProps) {
	const config = PLATFORM_CONFIG[account.platform]
	if (!config) return null
	const { label, bgColor, Icon } = config

	return (
		<div className="flex items-center gap-3.5 px-6 py-4">
			<div
				className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
				style={{ backgroundColor: bgColor }}
			>
				<Icon size={21} />
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-1.5">
					<p className="text-[13.5px] font-semibold text-gray-900">{label}</p>
					{account.linked && (
						<CheckCircle2 size={13} className="text-green-500 shrink-0" strokeWidth={2.5} />
					)}
				</div>
				<p className="text-[12px] text-gray-500 mt-0.5">
					{account.linked ? "Connected" : "Not connected"}
				</p>
			</div>

			{!account.linked ? (
				<button
					onClick={() => onLink()}
					disabled={isLinking}
					className="shrink-0 text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
				>
					{isLinking ? <Loader2 size={11} className="animate-spin" /> : <ExternalLink size={11} />}
					{isLinking ? "Opening…" : "Link"}
				</button>
			) : (
				<div className="flex items-center gap-2">
					{/* open linked profile */}
					{account.platform_url && (
						<button
							onClick={() => window.open(account.platform_url, "_blank", "noopener,noreferrer")}
							className="shrink-0 text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
						>
							<ExternalLink size={11} />
							Open
						</button>
					)}
					{/* unlink */}
					<button
						onClick={onUnlink}
						disabled={isUnlinking}
						className="shrink-0 text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full bg-red-50 text-destructive hover:border-destructive hover:text-destructive transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
					>
						{isUnlinking ? <Loader2 size={12} className="animate-spin" /> : "Unlink"}
					</button>
				</div>
			)}
		</div>
	)
}

export function SocialAccountsPanel({ onBack }: { onBack: () => void }) {
	const { data, isLoading, refetch } = useSocialAccounts()
	const unlink = useUnlinkSocialAccount()

	const [openingPlatform, setOpeningPlatform] = useState<string | null>(null)
	const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null)
	const popupRef = useRef<Window | null>(null)

	const accounts = data?.data?.linked_accounts ?? []

	useEffect(() => {
		const onVisible = () => {
			if (document.visibilityState === "visible") refetch()
		}
		document.addEventListener("visibilitychange", onVisible)
		return () => document.removeEventListener("visibilitychange", onVisible)
	}, [refetch])

	const handleLink = (account: SocialAccount) => {
		const callbackUrl = `${window.location.origin}/social-callback`
		const loginUrl = new URL(account.platform_login_url)
		loginUrl.searchParams.set("redirect_uri", callbackUrl)

		setOpeningPlatform(account.platform)

		const w = 600
		const h = 700
		const left = Math.round((window.screen.width - w) / 2)
		const top = Math.round((window.screen.height - h) / 2)
		const features = `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`
		const popup = window.open(loginUrl.toString(), "oauth_popup", features)

		popupRef.current = popup

		// poll every 500ms; when Django redirects to the callback page,
		// it closes itself, and we detect that here
		const interval = setInterval(async () => {
			if (!popup || popup.closed) {
				clearInterval(interval)
				setOpeningPlatform(null)
				popupRef.current = null
				await refetch()
			}
		}, 500)
	}

	const handleUnlink = () => {
		if (!unlinkTarget) return
		const account = accounts.find((a) => a.platform === unlinkTarget)
		if (!account) return

		const unlinkUrl = account.platform_login_url.replace(/\/link$/, "/unlink")

		unlink.mutate(
			{ platform: unlinkTarget, unlinkUrl },
			{
				onSuccess: () => setUnlinkTarget(null),
			},
		)
	}

	const unlinkConfig = unlinkTarget ? PLATFORM_CONFIG[unlinkTarget] : null

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Link Social Accounts" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<p className="px-6 pt-5 pb-4 text-[12.5px] text-gray-500 leading-relaxed">
					Link your social accounts to AppsCombo for faster sign-in and cross-platform sharing.
				</p>

				<div className="mx-6 my-2 border-t border-gray-100" />

				{isLoading
					? DEFAULT_PLATFORMS.map((p) => <PlatformSkeleton key={p} />)
					: accounts.map((account) => (
							<PlatformRow
								key={account.platform}
								account={account}
								isLinking={openingPlatform === account.platform}
								isUnlinking={unlink.isPending && unlink.variables.platform === account.platform}
								onLink={() => handleLink(account)}
								onUnlink={() => setUnlinkTarget(account.platform)}
							/>
						))}

				<div className="mx-6 my-2 border-t border-gray-100" />

				{/* footer note */}
				{!isLoading && accounts.length > 0 && (
					<p className="px-6 py-4 text-[12px] text-gray-400 leading-relaxed">
						Disconnecting a social account won&apos;t delete your AppsCombo account or the data
						you&apos;ve shared.
					</p>
				)}
			</div>

			<UnlinkDialog
				open={!!unlinkTarget}
				onClose={() => setUnlinkTarget(null)}
				platformName={unlinkConfig?.label ?? unlinkTarget ?? ""}
				onConfirm={handleUnlink}
				isPending={unlink.isPending}
			/>
		</div>
	)
}
