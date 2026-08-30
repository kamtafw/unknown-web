"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ContactComposerDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSend: (contact: { name: string; phoneNumber: string; email: string }) => void
}

/** Manual entry — no reliable cross-browser Contacts API, unlike mobile's
 * expo-contacts. Payload matches mobile's metadata shape exactly. */
export function ContactComposerDialog({ open, onOpenChange, onSend }: ContactComposerDialogProps) {
	const [name, setName] = useState("")
	const [phoneNumber, setPhoneNumber] = useState("")
	const [email, setEmail] = useState("")

	const reset = () => {
		setName("")
		setPhoneNumber("")
		setEmail("")
	}

	const handleSend = () => {
		if (!name.trim()) return
		onSend({ name: name.trim(), phoneNumber: phoneNumber.trim(), email: email.trim() })
		reset()
		onOpenChange(false)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				onOpenChange(o)
				if (!o) reset()
			}}
		>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Share a contact</DialogTitle>
				</DialogHeader>

				<Input
					autoFocus
					placeholder="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<Input
					placeholder="Phone number (optional)"
					value={phoneNumber}
					onChange={(e) => setPhoneNumber(e.target.value)}
				/>
				<Input
					placeholder="Email (optional)"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<button
					onClick={handleSend}
					disabled={!name.trim()}
					className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
				>
					Send contact
				</button>
			</DialogContent>
		</Dialog>
	)
}
