/**
 * Shared text-composer utilities, consolidated from 7 near-identical
 * copies (create-post-modal, edit-post-modal, comment-modal, reply-modal,
 * quote-post-modal, quote-comment-modal, post-detail's ContentComposer).
 *
 * NOTE: there's already a much richer emoji picker component
 * (components/ui/EmojiPicker.tsx — categorized, searchable) that none of
 * these composers actually use; they each independently built a simpler
 * inline 30-emoji grid instead. Swapping to it would be a real behavior/UI
 * change (different design, and that component currently uses hardcoded
 * Tailwind gray-scale classes rather than this project's semantic tokens),
 * so it's out of scope for a pure dedup pass — flagging it as a separate,
 * worth-deciding-on item rather than silently picking one.
 */

export const EMOJIS = [
	"😀",
	"😂",
	"😍",
	"🥺",
	"😊",
	"🔥",
	"👍",
	"❤️",
	"🎉",
	"✨",
	"😭",
	"🤣",
	"😎",
	"🙏",
	"💯",
	"🤔",
	"😅",
	"😤",
	"🥰",
	"😢",
	"💪",
	"👏",
	"🎊",
	"🌟",
	"😏",
	"🤩",
	"😳",
	"🫶",
	"💀",
	"😇",
] as const

export function extractHashtags(str: string): string[] {
	return (str.match(/#\w+/g) ?? []).map((h) => h.toLowerCase())
}

/**
 * Inserts `emoji` at the current cursor position of `textarea` (or appends
 * to the end if there's no active selection), and restores focus/cursor
 * position afterward. Takes the textarea + current value + setter directly
 * rather than being a hook, since every composer already owns those three
 * things and the insertion itself has no state of its own.
 */
export function insertEmojiAtCursor(
	textarea: HTMLTextAreaElement | null,
	text: string,
	setText: (value: string) => void,
	emoji: string,
) {
	if (!textarea) {
		setText(text + emoji)
		return
	}

	const start = textarea.selectionStart ?? text.length
	const end = textarea.selectionEnd ?? text.length
	const next = text.slice(0, start) + emoji + text.slice(end)
	setText(next)

	setTimeout(() => {
		textarea.selectionStart = textarea.selectionEnd = start + emoji.length
		textarea.focus()
	}, 0)
}
