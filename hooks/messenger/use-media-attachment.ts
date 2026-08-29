"use client"

import { chatApi, MediaUploadFolder } from "@/lib/messenger/api"
import { classifyMediaType } from "@/lib/messenger/media"
import type { MediaAttachment } from "@/types/messenger"
import { useState } from "react"

export interface PendingAttachment {
	file: File
	preview: string
	type: MediaAttachment["type"]
	uploadedUrl: string | null
	uploading: boolean
	error: boolean
}

/**
 * Single-attachment composer state, modeled on the proven shape of
 * hooks/socials/use-media-upload.ts but adapted to messenger's confirmed
 * contract: one `media_url` per upload (not an array), a `folder`
 * discriminator ("chat" here; "voice" is reserved for the recording
 * slice), and a classified `type` for the eventual `MediaAttachment`.
 *
 * Deliberately single-file — mobile allows a multi-select batch in one
 * message, but MessageBubble only renders `media[0]`. Extending to a real
 * gallery is a rendering decision, not an upload-plumbing one; not
 * blocking this slice on it.
 */
export function usePendingAttachment(folder: MediaUploadFolder = "chat") {
	const [attachment, setAttachment] = useState<PendingAttachment | null>(null)

	const upload = async (file: File, type: MediaAttachment["type"]) => {
		try {
			const uploadedUrl = await chatApi.uploadMedia(file, folder)
			setAttachment((prev) =>
				prev && prev.file === file ? { ...prev, uploadedUrl, uploading: false } : prev,
			)
		} catch {
			setAttachment((prev) =>
				prev && prev.file === file ? { ...prev, uploading: false, error: true } : prev,
			)
		}
	}

	const pick = (file: File) => {
		const preview = URL.createObjectURL(file)
		const type = classifyMediaType(file.type)
		setAttachment({ file, preview, type, uploadedUrl: null, uploading: true, error: false })
		void upload(file, type)
	}

	const retry = () => {
		if (!attachment) return
		setAttachment({ ...attachment, uploading: true, error: false })
		void upload(attachment.file, attachment.type)
	}

	const clear = () => {
		if (attachment) URL.revokeObjectURL(attachment.preview)
		setAttachment(null)
	}

	return { attachment, pick, retry, clear }
}
