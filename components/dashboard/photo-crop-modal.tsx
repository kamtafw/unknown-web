"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Minus, Plus, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface PhotoCropModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	imageSrc: string | null
	shape: "circle" | "rect"
	containerW: number
	containerH: number
	outputW: number
	outputH: number
	onCrop: (blob: Blob) => void
}

export function PhotoCropModal({
	open,
	onOpenChange,
	imageSrc,
	shape,
	containerW,
	containerH,
	outputW,
	outputH,
	onCrop,
}: PhotoCropModalProps) {
	const imgRef = useRef<HTMLImageElement>(null)
	const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
	const [baseScale, setBaseScale] = useState(1)
	const [zoom, setZoom] = useState(1)
	const [pan, setPan] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const isDraggingRef = useRef(false)
	const lastPointer = useRef({ x: 0, y: 0 })

	const totalScale = baseScale * zoom
	const dW = naturalSize.w * totalScale
	const dH = naturalSize.h * totalScale
	const maxPanX = Math.max(0, (dW - containerW) / 2)
	const maxPanY = Math.max(0, (dH - containerH) / 2)
	const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))
	const imgLeft = (containerW - dW) / 2 + pan.x
	const imgTop = (containerH - dH) / 2 + pan.y

	const handleImageLoad = () => {
		const img = imgRef.current
		if (!img) return
		const { naturalWidth: nW, naturalHeight: nH } = img
		setNaturalSize({ w: nW, h: nH })
		setBaseScale(Math.max(containerW / nW, containerH / nH))
		setZoom(1)
		setPan({ x: 0, y: 0 })
	}

	const handlePointerDown = (e: React.PointerEvent) => {
		e.preventDefault()
		e.currentTarget.setPointerCapture(e.pointerId)
		isDraggingRef.current = true
		lastPointer.current = { x: e.clientX, y: e.clientY }
		setIsDragging(true)
	}

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!isDraggingRef.current) return
		const dx = e.clientX - lastPointer.current.x
		const dy = e.clientY - lastPointer.current.y
		lastPointer.current = { x: e.clientX, y: e.clientY }
		setPan((prev) => ({
			x: clamp(prev.x + dx, -maxPanX, maxPanX),
			y: clamp(prev.y + dy, -maxPanY, maxPanY),
		}))
	}

	const handlePointerUp = () => {
		isDraggingRef.current = false
		setIsDragging(false)
	}

	const handleZoomChange = (newZoom: number) => {
		const z = clamp(newZoom, 1, 3)
		setZoom(z)
		const newTotal = baseScale * z
		const newMaxX = Math.max(0, (naturalSize.w * newTotal - containerW) / 2)
		const newMaxY = Math.max(0, (naturalSize.h * newTotal - containerH) / 2)
		setPan((prev) => ({
			x: clamp(prev.x, -newMaxX, newMaxX),
			y: clamp(prev.y, -newMaxY, newMaxY),
		}))
	}

	const handleCrop = () => {
		const img = imgRef.current
		if (!img || !naturalSize.w) return
		const srcX = ((dW - containerW) / 2 - pan.x) / totalScale
		const srcY = ((dH - containerH) / 2 - pan.y) / totalScale
		const srcW = containerW / totalScale
		const srcH = containerH / totalScale
		const canvas = document.createElement("canvas")
		canvas.width = outputW
		canvas.height = outputH
		const ctx = canvas.getContext("2d")!
		if (shape === "circle") {
			ctx.beginPath()
			ctx.arc(outputW / 2, outputH / 2, Math.min(outputW, outputH) / 2, 0, Math.PI * 2)
			ctx.clip()
		}
		ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outputW, outputH)
		canvas.toBlob(
			(blob) => {
				if (blob) {
					onCrop(blob)
					onOpenChange(false)
				}
			},
			"image/jpeg",
			0.92,
		)
	}

	useEffect(() => {
		if (!open) return
		setZoom(1)
		setPan({ x: 0, y: 0 })
		setNaturalSize({ w: 0, h: 0 })
	}, [open, imageSrc])

	if (!imageSrc) return null
	const modalWidth = Math.min(containerW + 48, 480)

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/70 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					onInteractOutside={(e) => e.preventDefault()}
					className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 bg-card border border-border rounded-2xl shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden"
					style={{ width: modalWidth, maxWidth: "calc(100vw - 2rem)" }}
				>
					<Dialog.Title className="sr-only">Crop photo</Dialog.Title>
					<Dialog.Description className="sr-only">
						Drag to reposition. Use the slider to zoom.
					</Dialog.Description>

					<div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
						<p className="font-semibold text-foreground text-[14.5px]">Crop photo</p>
						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors">
								<X size={15} />
							</button>
						</Dialog.Close>
					</div>

					{/* Crop stage — intentionally dark background */}
					<div className="flex items-center justify-center bg-[#111] py-5 px-4">
						<div
							className="relative overflow-hidden select-none"
							style={{
								width: containerW,
								height: containerH,
								borderRadius: shape === "circle" ? "50%" : "0.75rem",
								cursor: isDragging ? "grabbing" : "grab",
								touchAction: "none",
								outline: shape === "rect" ? "2px solid rgba(255,255,255,0.4)" : undefined,
							}}
							onPointerDown={handlePointerDown}
							onPointerMove={handlePointerMove}
							onPointerUp={handlePointerUp}
							onPointerLeave={handlePointerUp}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								ref={imgRef}
								src={imageSrc}
								alt="Crop preview"
								onLoad={handleImageLoad}
								draggable={false}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: naturalSize.w || "auto",
									height: naturalSize.h || "auto",
									transform: `translate(${imgLeft}px, ${imgTop}px) scale(${totalScale})`,
									transformOrigin: "0 0",
									maxWidth: "none",
									pointerEvents: "none",
									userSelect: "none",
								}}
							/>
						</div>
					</div>

					{/* Zoom control */}
					<div className="flex items-center gap-3 px-5 py-4 border-t border-border">
						<button
							type="button"
							onClick={() => handleZoomChange(zoom - 0.1)}
							className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors shrink-0"
						>
							<Minus size={15} />
						</button>
						<input
							type="range"
							min={1}
							max={3}
							step={0.01}
							value={zoom}
							onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
							className="flex-1 accent-primary cursor-pointer"
						/>
						<button
							type="button"
							onClick={() => handleZoomChange(zoom + 0.1)}
							className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors shrink-0"
						>
							<Plus size={15} />
						</button>
					</div>

					<div className="flex gap-2.5 px-5 pb-5">
						<Dialog.Close asChild>
							<button
								type="button"
								className="flex-1 h-10 rounded-xl border border-border text-[13px] font-semibold text-muted-foreground hover:bg-accent transition-colors"
							>
								Cancel
							</button>
						</Dialog.Close>
						<button
							type="button"
							onClick={handleCrop}
							disabled={!naturalSize.w}
							className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/85 disabled:opacity-40 transition-colors"
						>
							Apply
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
