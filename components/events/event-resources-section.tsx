"use client"

import { useEventResources } from "@/hooks/events/use-event-resources"
import { normalizeHttpUrl } from "@/lib/events/normalize"
import type { EventResourceDocument } from "@/types/events/api"
import { FileText, Link2, LinkIcon, Lock, Pencil, ShieldAlert, WifiOff } from "lucide-react"
import { RetryButton, StateMessage, secondaryButton } from "./event-list"

/** opens in a new tab; the address is re-checked here so only http(s) can ever become an href */
function ExternalLink({ url, className, children }: { url: string; className: string; children: React.ReactNode }) {
	const href = normalizeHttpUrl(url)
	if (!href) return <div className={className}>{children}</div>
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" className={className}>
			{children}
		</a>
	)
}

const ROW =
	"flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"

function documentMeta(doc: EventResourceDocument): string {
	return [doc.fileType, doc.size, doc.uploadedOn].filter(Boolean).join(" · ")
}

function Skeleton() {
	return (
		<div aria-busy="true" aria-label="Loading links and documents" className="flex animate-pulse flex-col gap-3">
			{[0, 1, 2].map((i) => (
				<div key={i} className="h-14 rounded-xl bg-muted" />
			))}
		</div>
	)
}

/**
 * The "Links and docs" section of a full event: read-only. Names are rendered as text (never
 * HTML) and a link is navigable only when it is http(s). Links and documents are separate lists;
 * a link shows no date because the backend's `date_added` is not a link date (A-18). Mounted only
 * for a full event's active section, so a restricted preview never triggers a request.
 *
 * Resources are changed only through the event edit form (no per-resource routes), so hosts get a
 * shortcut to it from the empty state.
 */
export function EventResourcesSection({
	eventId,
	isHost,
	onEdit,
}: {
	eventId: string
	isHost: boolean
	onEdit: () => void
}) {
	const { resources, errorKind, isLoading, refetch } = useEventResources(eventId)

	if (isLoading) return <Skeleton />

	if (!resources) {
		switch (errorKind) {
			case "forbidden":
				return (
					<StateMessage
						tone="alert"
						icon={<Lock size={22} aria-hidden />}
						title="You can't view these links and documents"
						description="You don't have access to this event's resources."
					/>
				)
			case "not_found":
				return (
					<StateMessage
						tone="alert"
						icon={<ShieldAlert size={22} aria-hidden />}
						title="Links and documents aren't available"
						description="This event may have been deleted or is no longer visible to you."
					/>
				)
			case "unauthorized":
				return (
					<StateMessage
						tone="alert"
						icon={<ShieldAlert size={22} aria-hidden />}
						title="Your session has expired"
						description="Sign in again to see this event's links and documents."
					/>
				)
			default:
				return (
					<StateMessage
						tone="alert"
						icon={<WifiOff size={22} aria-hidden />}
						title="Couldn't load links and documents"
						description="Check your connection and try again."
					>
						<RetryButton onClick={() => void refetch()} />
					</StateMessage>
				)
		}
	}

	const { links, documents } = resources

	if (links.length === 0 && documents.length === 0) {
		return (
			<StateMessage
				icon={<LinkIcon size={22} aria-hidden />}
				title="No links or documents yet"
				description={isHost ? "Add links or documents by editing this event." : "The host hasn't added any."}
			>
				{isHost && (
					<button type="button" onClick={onEdit} className={secondaryButton}>
						<Pencil size={13} aria-hidden />
						Edit event
					</button>
				)}
			</StateMessage>
		)
	}

	return (
		<div className="flex flex-col gap-5">
			{links.length > 0 && (
				<section aria-labelledby="resources-links-heading" className="flex flex-col gap-2.5">
					<h2 id="resources-links-heading" className="text-[13px] font-bold text-foreground">
						Links
					</h2>
					<ul className="flex flex-col gap-2">
						{links.map((link, i) => (
							<li key={`${i}-${link.url}`}>
								<ExternalLink url={link.url} className={ROW}>
									<Link2 size={16} aria-hidden className="shrink-0 text-primary" />
									<span className="flex min-w-0 flex-col">
										<span className="break-words text-[13px] font-semibold text-foreground">{link.name}</span>
										<span className="break-all text-[12px] text-muted-foreground">{link.url}</span>
									</span>
								</ExternalLink>
							</li>
						))}
					</ul>
				</section>
			)}

			{documents.length > 0 && (
				<section aria-labelledby="resources-docs-heading" className="flex flex-col gap-2.5">
					<h2 id="resources-docs-heading" className="text-[13px] font-bold text-foreground">
						Documents
					</h2>
					<ul className="flex flex-col gap-2">
						{documents.map((doc, i) => {
							const meta = documentMeta(doc)
							return (
								<li key={`${i}-${doc.url}`}>
									<ExternalLink url={doc.url} className={ROW}>
										<FileText size={16} aria-hidden className="shrink-0 text-primary" />
										<span className="flex min-w-0 flex-col">
											<span className="break-words text-[13px] font-semibold text-foreground">{doc.name}</span>
											{meta && <span className="text-[12px] text-muted-foreground">{meta}</span>}
										</span>
									</ExternalLink>
								</li>
							)
						})}
					</ul>
				</section>
			)}
		</div>
	)
}
