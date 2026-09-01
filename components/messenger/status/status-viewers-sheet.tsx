"use client"

import { useStatusViewers } from "@/hooks/messenger/use-status"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { Loader2, X } from "lucide-react"
import { Avatar } from "radix-ui"

interface StatusViewersSheetProps {
	statusId: number
	onClose: () => void
}

export function StatusViewersSheet({ statusId, onClose }: StatusViewersSheetProps) {
	const { data, isLoading } = useStatusViewers(statusId)

	return (
		<div className="absolute inset-0 z-260 bg-black/60 flex items-end sm:items-center sm:justify-center">
			<div className="w-full sm:max-w-sm bg-card rounded-t-2xl sm:rounded-2xl max-h-[70vh] flex flex-col">
				<div className="flex items-center justify-between px-4 py-3 border-b border-border">
					<p className="text-sm font-semibold">Viewed by {data?.count ?? 0}</p>
					<button
						onClick={onClose}
						className="h-7 w-7 flex items-center justify-center text-muted-foreground"
					>
						<X size={16} />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 size={20} className="animate-spin text-muted-foreground" />
						</div>
					) : data?.results.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-8">No views yet</p>
					) : (
						data?.results.map((viewer) => (
							<div key={viewer.pkid} className="flex items-center gap-3 px-4 py-2.5">
								<Avatar.Root className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center">
									<Avatar.Image
										src={viewer.profile_photo ?? undefined}
										alt={viewer.username}
										className="h-full w-full object-cover"
									/>
									<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
										{getInitials(viewer.first_name, viewer.last_name)}
									</Avatar.Fallback>
								</Avatar.Root>
								<span className="text-sm font-medium truncate">{getDisplayName(viewer)}</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	)
}
