"use client"

import { chatApi, MediaUploadFolder } from "@/lib/messenger/api"
import { classifyMediaType } from "@/lib/messenger/media"
import type { MediaAttachment } from "@/types/messenger"
import { useState } from "react"

export interface PendingAttachment {
	id: string
	file: File
	preview: string
	type: MediaAttachment["type"]
	uploadedUrl: string | null
	uploading: boolean
	error: boolean
}

/**
 * Multi-attachment composer state — modeled on the proven per-item
 * shape of hooks/socials/use-media-upload.ts (id-keyed, independently
 * retryable), not a new pattern. Confirmed via mobile: a single message
 * CAN carry a batch (`allowsMultipleSelection` on the gallery picker),
 * with ONE caption applied uniformly to every item on send (see
 * handleMediaSend's resolveAttachmentCaption) — so per-item state here
 * only needs to track upload progress, never a per-item caption.
 */
export function usePendingAttachment(folder: MediaUploadFolder = "chat", maxFiles = 10) {
	const [attachments, setAttachments] = useState<PendingAttachment[]>([])

	const uploadFile = async (id: string, file: File) => {
		try {
			const uploadedUrl = await chatApi.uploadMedia(file, folder)
			setAttachments((prev) =>
				prev.map((a) => (a.id === id ? { ...a, uploadedUrl, uploading: false } : a)),
			)
		} catch {
			setAttachments((prev) =>
				prev.map((a) => (a.id === id ? { ...a, uploading: false, error: true } : a)),
			)
		}
	}

	const addFiles = (fileList: FileList | File[]) => {
		setAttachments((prev) => {
			const remaining = maxFiles - prev.length
			const files = Array.from(fileList).slice(0, Math.max(0, remaining))
			const next: PendingAttachment[] = files.map((file) => ({
				id: crypto.randomUUID(),
				file,
				preview: URL.createObjectURL(file),
				type: classifyMediaType(file.type),
				uploadedUrl: null,
				uploading: true,
				error: false,
			}))
			next.forEach((item) => void uploadFile(item.id, item.file))
			return [...prev, ...next]
		})
	}

	const retryUpload = (id: string) => {
		setAttachments((prev) =>
			prev.map((a) => (a.id === id ? { ...a, uploading: true, error: false } : a)),
		)
		const attachment = attachments.find((a) => a.id === id)
		if (attachment) void uploadFile(id, attachment.file)
	}

	const removeAttachment = (id: string) => {
		setAttachments((prev) => {
			const item = prev.find((a) => a.id === id)
			if (item) URL.revokeObjectURL(item.preview)
			return prev.filter((a) => a.id !== id)
		})
	}

	const reset = () => {
		attachments.forEach((a) => URL.revokeObjectURL(a.preview))
		setAttachments([])
	}

	const anyUploading = attachments.some((a) => a.uploading)
	// At least one item made it through and nothing is still in flight —
	// deliberately doesn't require EVERY item to succeed, so one bad file
	// in a batch doesn't block sending the rest.
	const readyToSend =
		attachments.length > 0 && !anyUploading && attachments.some((a) => a.uploadedUrl)

	return { attachments, addFiles, retryUpload, removeAttachment, reset, anyUploading, readyToSend }
}
