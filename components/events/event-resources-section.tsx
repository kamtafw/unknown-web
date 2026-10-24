"use client"

import { describeEventError } from "@/lib/events/errors"
import type { EventResources } from "@/types/events/api"
import { FileText, Link2, LockKeyhole } from "lucide-react"
import { RetryButton, StateMessage, secondaryButton } from "./event-list"

function ResourceSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4 py-4">
			<p role="status" className="sr-only">Loading links and documents…</p>
			{[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-muted" />)}
		</div>
	)
}

function ResourceEmpty({ isHost, onEdit }: { isHost: boolean; onEdit: () => void }) {
	return (
		<StateMessage
			title="No links or documents yet"
			description={isHost ? "Add links or documents by editing this event." : "The host hasn't shared any resources yet."}
		>
			{isHost && <button type="button" onClick={onEdit} className={secondaryButton}>Edit event</button>}
		</StateMessage>
	)
}

/** Read-only view: writes remain exclusively in the Phase 2 event form. */
export function EventResourcesSection({
	resources,
	isLoading,
	isError,
	error,
	isHost,
	onEdit,
	onRetry,
}: {
	resources: EventResources | undefined
	isLoading: boolean
	isError: boolean
	error: unknown
	isHost: boolean
	onEdit: () => void
	onRetry: () => void
}) {
	if (isLoading) return <ResourceSkeleton />

	if (isError) {
		const described = describeEventError(error)
		if (described.kind === "forbidden") {
			return (
				<StateMessage
					tone="alert"
						icon={<LockKeyhole size={24} aria-hidden />}
					title="You can't access these resources"
					description="You need permission to view this event's links and documents."
				/>
			)
		}
		return (
			<StateMessage
				tone="alert"
					title="We couldn't load these resources"
					description={described.message}
			>
				<RetryButton onClick={onRetry} />
			</StateMessage>
		)
	}

	const links = resources?.links ?? []
	const documents = resources?.documents ?? []
	if (links.length === 0 && documents.length === 0) return <ResourceEmpty isHost={isHost} onEdit={onEdit} />

	return (
		<div className="flex flex-col gap-7 py-4">
			{links.length > 0 && (
				<section aria-labelledby="event-resources-links" className="flex flex-col gap-3">
					<h3 id="event-resources-links" className="text-sm font-bold text-foreground">Links</h3>
					<ul className="flex flex-col gap-2">
						{links.map((link, index) => (
							<li key={`${link.url}-${index}`} className="flex min-w-0 items-start gap-3 rounded-lg border border-border p-3">
								<Link2 size={17} aria-hidden className="mt-0.5 shrink-0 text-primary" />
								<div className="min-w-0">
									<a href={link.url} target="_blank" rel="noopener noreferrer" className="break-words text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{link.name}</a>
									<p className="mt-1 break-all text-xs text-muted-foreground">{link.url}</p>
								</div>
							</li>
						))}
					</ul>
				</section>
			)}
			{documents.length > 0 && (
				<section aria-labelledby="event-resources-documents" className="flex flex-col gap-3">
					<h3 id="event-resources-documents" className="text-sm font-bold text-foreground">Documents</h3>
					<ul className="flex flex-col gap-2">
						{documents.map((document, index) => (
							<li key={`${document.url}-${index}`} className="flex min-w-0 items-start gap-3 rounded-lg border border-border p-3">
								<FileText size={17} aria-hidden className="mt-0.5 shrink-0 text-primary" />
								<div className="min-w-0">
									<a href={document.url} target="_blank" rel="noopener noreferrer" className="break-words text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{document.name}</a>
									<dl className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
										{document.size && <div><dt className="sr-only">Size</dt><dd>{document.size}</dd></div>}
										{document.fileType && <div><dt className="sr-only">File type</dt><dd>{document.fileType}</dd></div>}
										{document.dateUploaded && <div><dt className="sr-only">Date uploaded</dt><dd>{document.dateUploaded}</dd></div>}
									</dl>
								</div>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	)
}
