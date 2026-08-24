"use client"

import { useBlockedUsers, useUnblockUsers } from "@/hooks/use-block-actions"
import { cn, getInitials } from "@/lib/utils"
import { BlockedUser } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowLeft, Loader2, ShieldOff, Users } from "lucide-react"
import { Avatar } from "radix-ui"
import { useState } from "react"

function PanelHeader({
	onBack,
	selectionMode,
	selectedCount,
	totalCount,
	onEnterSelect,
	onExitSelect,
	onSelectAll,
	allSelected,
}: {
	onBack: () => void
	selectionMode: boolean
	selectedCount: number
	totalCount: number
	onEnterSelect: () => void
	onExitSelect: () => void
	onSelectAll: () => void
	allSelected: boolean
}) {
	return (
		<div className="shrink-0 border-b border-border">
			<div className="flex items-center gap-3 px-6 pt-5 pb-4">
				<button
					onClick={selectionMode ? onExitSelect : onBack}
					className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors shrink-0"
					aria-label={selectionMode ? "Cancel selection" : "Go back"}
				>
					<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
				</button>

				<h2 className="font-bold text-foreground text-[15.5px] flex-1 min-w-0 truncate transition-all duration-200">
					{selectionMode
						? selectedCount > 0
							? `${selectedCount} ${selectedCount === 1 ? "account" : "accounts"} selected`
							: "Select accounts"
						: "Blocked accounts"}
				</h2>

				{!selectionMode && totalCount > 0 && (
					<button
						onClick={onEnterSelect}
						className="text-[13px] font-semibold text-primary hover:opacity-70 transition-opacity shrink-0"
					>
						Select
					</button>
				)}

				{selectionMode && (
					<button
						onClick={onSelectAll}
						className="text-[13px] font-semibold text-primary hover:opacity-70 transition-opacity shrink-0 whitespace-nowrap"
					>
						{allSelected ? "Deselect all" : "Select all"}
					</button>
				)}
			</div>

			{/* Selection mode hint bar */}
			<div
				className={cn(
					"overflow-hidden transition-all duration-300",
					selectionMode ? "max-h-10 opacity-100" : "max-h-0 opacity-0",
				)}
			>
				<p className="px-6 pb-3 text-[12px] text-primary/70 leading-relaxed">
					Tap accounts to select — unblock several at once
				</p>
			</div>
		</div>
	)
}

function UnblockConfirmDialog({
	open,
	onClose,
	user,
	selectedCount,
	isBulk,
	onConfirm,
	isPending,
}: {
	open: boolean
	onClose: () => void
	user: BlockedUser | null
	selectedCount: number
	isBulk: boolean
	onConfirm: () => void
	isPending: boolean
}) {
	if (!user && !isBulk) return null
	const displayName = user
		? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
		: ""

	const title = isBulk
		? `Unblock ${selectedCount} ${selectedCount === 1 ? "account" : "accounts"}?`
		: `Unblock ${displayName}?`

	const description = isBulk
		? `These ${selectedCount} accounts will be able to see your profile and posts again.`
		: user
			? `@${user.username} will be able to see your profile and posts again.`
			: ""

	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-[calc(100%-2rem)] max-w-96 bg-card border border-border rounded-2xl shadow-xl px-6 py-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<Dialog.Title className="font-bold text-foreground text-[15px] mb-1.5">
						{title}
					</Dialog.Title>
					<Dialog.Description className="text-[13px] text-muted-foreground leading-relaxed mb-6">
						{description}
					</Dialog.Description>

					<div className="flex items-center justify-end gap-6">
						<Dialog.Close asChild>
							<button className="flex-1 text-sm font-semibold text-muted-foreground hover:opacity-70 transition-colors cursor-pointer">
								Cancel
							</button>
						</Dialog.Close>
						<button
							onClick={onConfirm}
							disabled={isPending}
							className="flex-1 text-sm text-primary font-semibold hover:opacity-80 disabled:opacity-50 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
						>
							{isPending ? (
								<>
									<Loader2 size={12} className="animate-spin" /> Unblocking…
								</>
							) : (
								"Unblock"
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

function SkeletonRow() {
	return (
		<div className="flex items-center gap-3.5 px-6 py-4 animate-pulse border-b border-border/50">
			<div className="w-10 h-10 rounded-full bg-muted shrink-0" />
			<div className="flex-1 space-y-1.5">
				<div className="h-3 bg-muted rounded-full w-2/5" />
				<div className="h-2.5 bg-muted rounded-full w-1/4" />
			</div>
			<div className="h-7 w-16 bg-muted rounded-full shrink-0" />
		</div>
	)
}

function Checkbox({ checked }: { checked: boolean }) {
	return (
		<div
			className={cn(
				"w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
				checked ? "bg-primary border-primary" : "border-input bg-card",
			)}
		>
			{checked && (
				<svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
					<path
						fillRule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clipRule="evenodd"
					/>
				</svg>
			)}
		</div>
	)
}

export function BlockedAccountsPanel({ onBack }: { onBack: () => void }) {
	const { data, isLoading } = useBlockedUsers()
	const unblockUsers = useUnblockUsers()

	const [selectionMode, setSelectionMode] = useState(false)
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean
		user: BlockedUser | null
		isBulk: boolean
	}>({ open: false, user: null, isBulk: false })

	const blockedUsers = data?.data.results ?? []
	const allSelected = blockedUsers.length > 0 && selectedIds.size === blockedUsers.length

	const enterSelectMode = () => setSelectionMode(true)

	const exitSelectMode = () => {
		setSelectionMode(false)
		setSelectedIds(new Set())
	}

	const toggleSelect = (pkid: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(pkid)) next.delete(pkid)
			else next.add(pkid)
			return next
		})
	}

	const toggleSelectAll = () => {
		setSelectedIds(allSelected ? new Set() : new Set(blockedUsers.map((u) => u.pkid)))
	}

	const handleConfirmUnblock = () => {
		const ids = confirmDialog.isBulk
			? Array.from(selectedIds)
			: confirmDialog.user
				? [confirmDialog.user.pkid]
				: []

		if (!ids.length) return

		unblockUsers.mutate(ids, {
			onSuccess: () => {
				setConfirmDialog({ open: false, user: null, isBulk: false })
				if (confirmDialog.isBulk) exitSelectMode()
			},
		})
	}

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden relative">
			<PanelHeader
				onBack={onBack}
				selectionMode={selectionMode}
				selectedCount={selectedIds.size}
				totalCount={blockedUsers.length}
				onEnterSelect={enterSelectMode}
				onExitSelect={exitSelectMode}
				onSelectAll={toggleSelectAll}
				allSelected={allSelected}
			/>

			{/* Scrollable list — extra bottom padding so content clears the action bar */}
			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-24">
				{!isLoading && blockedUsers.length > 0 && !selectionMode && (
					<>
						<p className="px-6 pt-4 pb-3 text-xs text-muted-foreground leading-relaxed">
							These accounts can&apos;t see your posts or find your profile.
						</p>

						<div className="mx-6 my-1 border-t border-border" />
					</>
				)}

				{isLoading ? (
					[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
				) : blockedUsers.length === 0 ? (
					<div className="flex flex-col items-center justify-center px-6 py-16 text-center gap-4">
						<div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
							<ShieldOff size={24} className="text-muted-foreground/60" />
						</div>
						<div>
							<p className="font-semibold text-foreground text-[13.5px]">No blocked accounts</p>
							<p className="text-[12.5px] text-muted-foreground mt-1 leading-relaxed max-w-50">
								Accounts you block will appear here and won&apos;t be able to interact with you.
							</p>
						</div>
					</div>
				) : (
					<div>
						{blockedUsers.map((user) => {
							const displayName =
								[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
							const isSelected = selectedIds.has(user.pkid)

							return (
								<div
									key={user.id}
									onClick={selectionMode ? () => toggleSelect(user.pkid) : undefined}
									className={cn(
										"flex items-center gap-3.5 px-6 py-4 transition-colors duration-150",
										selectionMode && "cursor-pointer",
										selectionMode && isSelected
											? "bg-primary/5"
											: selectionMode
												? "hover:bg-accent/50 active:bg-accent"
												: "",
									)}
								>
									{/* Checkbox — slides in when selection mode activates */}
									<div
										className={cn(
											"overflow-hidden transition-all duration-200 shrink-0",
											selectionMode ? "w-5.5 opacity-100" : "w-0 opacity-0",
										)}
									>
										<Checkbox checked={isSelected} />
									</div>

									<Avatar.Root className="w-10 h-10 rounded-full overflow-hidden shrink-0">
										<Avatar.Image
											src={user.profile_photo}
											alt={displayName}
											className="w-full h-full object-cover"
										/>
										<Avatar.Fallback className="w-full h-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
											{getInitials(user.first_name, user.last_name)}
										</Avatar.Fallback>
									</Avatar.Root>

									<div className="flex-1 min-w-0">
										<p className="text-[13.5px] font-semibold text-foreground truncate leading-tight">
											{displayName}
										</p>
										<p className="text-xs text-muted-foreground truncate mt-0.5">
											@{user.username}
										</p>
									</div>

									{/* Single unblock button — hidden in selection mode */}
									<div
										className={cn(
											"shrink-0 overflow-hidden transition-all duration-200",
											selectionMode ? "w-0 opacity-0" : "w-auto opacity-100",
										)}
									>
										<button
											onClick={(e) => {
												e.stopPropagation()
												setConfirmDialog({ open: true, user, isBulk: false })
											}}
											className="text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
										>
											Unblock
										</button>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>

			{/* Bulk action bar — slides up from bottom when items are selected */}
			<div
				className={cn(
					"absolute bottom-0 inset-x-0 px-5 py-4 bg-card/95 backdrop-blur-sm border-t border-border flex items-center gap-3 transition-transform duration-300 ease-out",
					selectionMode && selectedIds.size > 0 ? "translate-y-0" : "translate-y-full",
				)}
			>
				<div className="flex items-center gap-2.5 flex-1 min-w-0">
					<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
						<Users size={14} className="text-primary" />
					</div>
					<p className="text-[13px] font-semibold text-foreground truncate">
						{selectedIds.size} {selectedIds.size === 1 ? "account" : "accounts"} selected
					</p>
				</div>
				<button
					onClick={() => setConfirmDialog({ open: true, user: null, isBulk: true })}
					className="shrink-0 h-10 px-5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/85 transition-colors cursor-pointer"
				>
					Unblock
				</button>
			</div>

			<UnblockConfirmDialog
				open={confirmDialog.open}
				onClose={() => setConfirmDialog({ open: false, user: null, isBulk: false })}
				user={confirmDialog.user}
				selectedCount={selectedIds.size}
				isBulk={confirmDialog.isBulk}
				onConfirm={handleConfirmUnblock}
				isPending={unblockUsers.isPending}
			/>
		</div>
	)
}
