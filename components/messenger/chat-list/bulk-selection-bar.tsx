"use client"

import { Archive, Trash2, X } from "lucide-react"

interface BulkSelectionBarProps {
	selectedCount: number
	onSelectAll: () => void
	onCancel: () => void
	onArchive: () => void
	onClear: () => void
}

export function BulkSelectionBar({
	selectedCount,
	onSelectAll,
	onCancel,
	onArchive,
	onClear,
}: BulkSelectionBarProps) {
	return (
		<div className="flex items-center justify-between px-4 pt-4 pb-3">
			<div className="flex items-center gap-3">
				<button
					onClick={onCancel}
					className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
				>
					<X size={18} />
				</button>
				<span className="font-semibold text-sm">{selectedCount} selected</span>
			</div>
			<div className="flex items-center gap-1">
				<button
					onClick={onSelectAll}
					className="px-3 py-1.5 rounded-full text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
				>
					Select all
				</button>
				<button
					onClick={onArchive}
					disabled={selectedCount === 0}
					title="Archive selected"
					className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors disabled:opacity-40"
				>
					<Archive size={16} />
				</button>
				<button
					onClick={onClear}
					disabled={selectedCount === 0}
					title="Clear selected"
					className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors disabled:opacity-40"
				>
					<Trash2 size={16} />
				</button>
			</div>
		</div>
	)
}
