import { socialsApi } from "@/lib/socials/api"
import { MediaItem } from "@/types/socials/api"
import { useState } from "react"

/**
 * Consolidated from 6 identical copies (create-post-modal, comment-modal,
 * reply-modal, quote-post-modal, quote-comment-modal, post-detail's
 * ContentComposer). edit-post-modal was deliberately NOT migrated onto
 * this — it only displays a post's *existing* media (for removal), it
 * never uploads new files, so its needs are genuinely different, not just
 * a smaller version of this.
 *
 * Behavior preserved exactly as it existed in all 6 call sites: up to
 * `maxFiles` items, each uploaded independently and retryable on failure,
 * object URLs revoked on removal/reset to avoid leaking memory.
 */
export function useMediaUpload(maxFiles = 4) {
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([])

	const uploadFile = async (id: string, file: File) => {
		setMediaItems((prev) =>
			prev.map((m) => (m.id === id ? { ...m, uploading: true, error: false } : m)),
		)
		try {
			const urls = await socialsApi.uploadMedia(file)
			setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, urls, uploading: false } : m)))
		} catch {
			setMediaItems((prev) =>
				prev.map((m) => (m.id === id ? { ...m, uploading: false, error: true } : m)),
			)
		}
	}

	const addFiles = (fileList: FileList | null) => {
		const remaining = maxFiles - mediaItems.length
		const files = Array.from(fileList ?? []).slice(0, remaining)

		files.forEach((file) => {
			const id = crypto.randomUUID()
			const preview = URL.createObjectURL(file)
			setMediaItems((prev) => [
				...prev,
				{ id, file, preview, urls: null, uploading: true, error: false },
			])
			uploadFile(id, file)
		})
	}

	const removeMedia = (id: string) => {
		setMediaItems((prev) => {
			const item = prev.find((m) => m.id === id)
			if (item) URL.revokeObjectURL(item.preview)
			return prev.filter((m) => m.id !== id)
		})
	}

	const reset = () => {
		mediaItems.forEach((m) => URL.revokeObjectURL(m.preview))
		setMediaItems([])
	}

	const uploadedUrls = mediaItems.flatMap((m) => m.urls ?? [])
	const anyUploading = mediaItems.some((m) => m.uploading)

	return {
		mediaItems,
		addFiles,
		removeMedia,
		retryUpload: uploadFile,
		reset,
		uploadedUrls,
		anyUploading,
	}
}
