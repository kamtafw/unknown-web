"use client"

import type { MediaAttachment } from "@/types/messenger"
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

interface MediaViewerState {
	media: MediaAttachment[]
	index: number
}

interface MediaViewerContextValue {
	viewer: MediaViewerState | null
	openMedia: (media: MediaAttachment[], index?: number) => void
	closeMedia: () => void
	setIndex: (index: number) => void
	next: () => void
	previous: () => void
}

const MediaViewerContext = createContext<MediaViewerContextValue | null>(null)

const fallbackContext: MediaViewerContextValue = {
	viewer: null,
	openMedia: () => undefined,
	closeMedia: () => undefined,
	setIndex: () => undefined,
	next: () => undefined,
	previous: () => undefined,
}

export function MediaViewerProvider({ children }: { children: ReactNode }) {
	const [viewer, setViewer] = useState<MediaViewerState | null>(null)

	const openMedia = useCallback((media: MediaAttachment[], index = 0) => {
		if (!media.length) return

		const safeIndex = Math.min(Math.max(index, 0), media.length - 1)

		setViewer({
			media,
			index: safeIndex,
		})
	}, [])

	const closeMedia = useCallback(() => {
		setViewer(null)
	}, [])

	const setIndex = useCallback((index: number) => {
		setViewer((current) => {
			if (!current) return null

			const safeIndex = Math.min(Math.max(index, 0), current.media.length - 1)

			return {
				...current,
				index: safeIndex,
			}
		})
	}, [])

	const next = useCallback(() => {
		setViewer((current) => {
			if (!current || current.media.length <= 1) return current

			const nextIndex = current.index >= current.media.length - 1 ? 0 : current.index + 1

			return {
				...current,
				index: nextIndex,
			}
		})
	}, [])

	const previous = useCallback(() => {
		setViewer((current) => {
			if (!current || current.media.length <= 1) return current

			const previousIndex = current.index <= 0 ? current.media.length - 1 : current.index - 1

			return {
				...current,
				index: previousIndex,
			}
		})
	}, [])

	const value = useMemo(
		() => ({
			viewer,
			openMedia,
			closeMedia,
			setIndex,
			next,
			previous,
		}),
		[viewer, openMedia, closeMedia, setIndex, next, previous],
	)

	return <MediaViewerContext.Provider value={value}>{children}</MediaViewerContext.Provider>
}

export function useMediaViewer() {
	const context = useContext(MediaViewerContext)

	return context ?? fallbackContext
}
