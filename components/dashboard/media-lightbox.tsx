"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

interface MediaLightboxProps {
	urls: string[]
	index: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function MediaLightbox({ urls, index, open, onOpenChange }: MediaLightboxProps) {
	const [active, setActive] = useState(index)

	useEffect(() => {
		if (open) setActive(index)
	}, [open, index])

	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") setActive((i) => Math.min(i + 1, urls.length - 1))
			if (e.key === "ArrowLeft") setActive((i) => Math.max(i - 1, 0))
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [open, urls.length])

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/90 z-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="fixed inset-0 z-100 flex items-center justify-center focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
					onClick={() => onOpenChange(false)}
				>
					<Dialog.Title className="sr-only">Photo viewer</Dialog.Title>
					<Dialog.Description className="sr-only">
						Viewing image {active + 1} of {urls.length}
					</Dialog.Description>

					<Dialog.Close asChild>
						<button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
							<X size={20} />
						</button>
					</Dialog.Close>

					{urls.length > 1 && active > 0 && (
						<button
							onClick={(e) => {
								e.stopPropagation()
								setActive((i) => i - 1)
							}}
							className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
						>
							<ChevronLeft size={22} />
						</button>
					)}

					{urls.length > 1 && active < urls.length - 1 && (
						<button
							onClick={(e) => {
								e.stopPropagation()
								setActive((i) => i + 1)
							}}
							className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
						>
							<ChevronRight size={22} />
						</button>
					)}

					<div
						className="relative w-[90vw] h-[85vh] max-w-4xl"
						onClick={(e) => e.stopPropagation()}
					>
						<Image
							src={urls[active]}
							alt=""
							fill
							className="object-contain animate-in fade-in duration-200"
							sizes="90vw"
						/>
					</div>

					{urls.length > 1 && (
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
							{urls.map((_, i) => (
								<span
									key={i}
									className={`w-1.5 h-1.5 rounded-full transition-colors ${i === active ? "bg-white" : "bg-white/30"}`}
								/>
							))}
						</div>
					)}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
