"use client"

import { useAddToCustomList, useCreateCustomList, useCustomLists } from "@/hooks/messenger/use-custom-lists"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/lib/toast"
import type { ChatListItem } from "@/types/messenger"
import { List, Plus } from "lucide-react"
import { useState } from "react"

interface AddToListDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	chat: ChatListItem | null
}

export function AddToListDialog({ open, onOpenChange, chat }: AddToListDialogProps) {
	const { data: lists, isLoading } = useCustomLists()
	const createList = useCreateCustomList()
	const addToList = useAddToCustomList()
	const [newListName, setNewListName] = useState("")

	if (!chat) return null

	const handleAddExisting = async (listId: number) => {
		await addToList.mutateAsync({ listId, userPkids: [chat.pkid] })
		toast.success("Added to list")
		onOpenChange(false)
	}

	const handleCreateAndAdd = async () => {
		const name = newListName.trim()
		if (!name) return
		await createList.mutateAsync({ name, userPkids: [chat.pkid] })
		toast.success(`Created "${name}" and added`)
		setNewListName("")
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add to list</DialogTitle>
				</DialogHeader>

				<div className="flex gap-2">
					<Input
						placeholder="New list name"
						value={newListName}
						onChange={(e) => setNewListName(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
					/>
					<button
						onClick={handleCreateAndAdd}
						disabled={!newListName.trim() || createList.isPending}
						className="shrink-0 h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
					>
						<Plus size={16} />
					</button>
				</div>

				<div className="max-h-64 overflow-y-auto -mx-2 mt-2">
					{isLoading && <p className="text-sm text-muted-foreground text-center py-6">Loading lists…</p>}
					{!isLoading && lists?.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-6">
							No lists yet — create one above.
						</p>
					)}
					{lists?.map((list) => (
						<button
							key={list.id}
							onClick={() => handleAddExisting(list.id)}
							disabled={addToList.isPending}
							className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-accent transition-colors text-left disabled:opacity-50"
						>
							<List size={16} className="text-muted-foreground shrink-0" />
							<span className="text-sm font-medium truncate">{list.name}</span>
						</button>
					))}
				</div>
			</DialogContent>
		</Dialog>
	)
}
