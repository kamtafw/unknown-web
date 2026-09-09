/**
 * Poll types. A poll is not a separate entity — it's a regular message
 * (`message_type: "poll"`) whose `metadata` holds `PollMetadata` on
 * create. Voting and reading results are the only dedicated poll
 * endpoints; create/delete/delivery reuse the standard message
 * send/delete/history contract. Confirmed via mobile's create-poll.tsx,
 * use-chat.ts (useVotePoll/useGetPollResults), poll-votes.tsx.
 *
 * Poll images are deferred — same reason as group icon upload
 * (create-group-dialog.tsx): no confirmed generic media-upload utility
 * wired up for Messenger yet.
 */

export interface PollOptionInput {
	id: number
	text: string
}

/** What we send as `metadata` on `POST chats/messages` for a new poll. */
export interface PollMetadata {
	question: string
	options: PollOptionInput[]
	allow_multiple_answers: boolean
	is_anonymous: boolean
	duration_minutes?: number
}

export interface PollVoter {
	id: string
	pkid: number
	username: string
	first_name?: string
	last_name?: string
	profile_photo?: string
	voted_at: string
}

export interface PollResultOption {
	id: number
	text: string
	vote_count: number
	percentage: number
	voters?: PollVoter[]
}

/** `GET chats/messages/:id/polls/results` response. */
export interface PollResults {
	id: number
	question: string
	options: PollResultOption[]
	total_voters: number
	allow_multiple_answers: boolean
	is_anonymous: boolean
}
