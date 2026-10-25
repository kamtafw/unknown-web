import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventCommentComposer } from "./event-comment-composer"

const usePostEventComment = vi.fn()
vi.mock("@/hooks/events/use-post-event-comment", () => ({
	usePostEventComment: (...a: unknown[]) => usePostEventComment(...a),
}))

const post = vi.fn()
const clearError = vi.fn()
const hook = (over: Partial<{ isPending: boolean; error: string | null }> = {}) => ({
	post,
	clearError,
	isPending: false,
	error: null as string | null,
	...over,
})

const box = () => screen.getByRole("textbox", { name: "Write a comment" }) as HTMLTextAreaElement
const type = (value: string) => fireEvent.change(box(), { target: { value } })
const submit = () => fireEvent.click(screen.getByRole("button", { name: /post comment|posting/i }))

beforeEach(() => {
	vi.clearAllMocks()
	post.mockResolvedValue(true)
	usePostEventComment.mockReturnValue(hook())
})

describe("EventCommentComposer", () => {
	it("posts for this event with an accessible labelled textarea", () => {
		render(<EventCommentComposer eventId="e1" />)
		expect(usePostEventComment).toHaveBeenCalledWith("e1")
		expect(box().tagName).toBe("TEXTAREA")
	})

	it.each(["", "   ", "\n \t\n"])("rejects %j before submitting and keeps what was typed", (value) => {
		render(<EventCommentComposer eventId="e1" />)
		type(value)
		submit()
		expect(post).not.toHaveBeenCalled()
		expect(screen.getByRole("alert")).toHaveTextContent(/write a comment before posting/i)
		expect(box().value).toBe(value)
	})

	it("hands the text to the hook (which trims) and clears only after success", async () => {
		render(<EventCommentComposer eventId="e1" />)
		type("  hello  ")
		submit()
		expect(post).toHaveBeenCalledWith("  hello  ")
		await waitFor(() => expect(box().value).toBe(""))
	})

	it("keeps the text when the post is rejected", async () => {
		post.mockResolvedValue(false)
		render(<EventCommentComposer eventId="e1" />)
		type("my comment")
		submit()
		await waitFor(() => expect(post).toHaveBeenCalledTimes(1))
		expect(box().value).toBe("my comment")
	})

	it("does not clear the text before the post has resolved", async () => {
		let resolve: (ok: boolean) => void = () => {}
		post.mockReturnValue(new Promise<boolean>((r) => (resolve = r)))
		render(<EventCommentComposer eventId="e1" />)
		type("pending text")
		submit()
		expect(box().value).toBe("pending text")
		resolve(true)
		await waitFor(() => expect(box().value).toBe(""))
	})

	it("while pending: shows feedback, disables the button, keeps the text and does not resubmit", () => {
		usePostEventComment.mockReturnValue(hook({ isPending: true }))
		render(<EventCommentComposer eventId="e1" />)
		type("abc")
		const button = screen.getByRole("button", { name: "Posting…" })
		expect(button).toBeDisabled()
		expect(box()).toHaveAttribute("readonly")
		fireEvent.submit(box().closest("form")!)
		expect(post).not.toHaveBeenCalled()
		expect(box().value).toBe("abc")
	})

	it.each([
		["validation", /couldn.t be posted/i],
		["forbidden", /don.t have permission to comment/i],
		["not_found", /^Only people who have joined this event can post comments$/],
		["too_large", /too large to send/i],
		["unauthorized", /session has expired/i],
		["network", /network error/i],
		["server", /couldn.t post your comment/i],
		["unknown", /couldn.t post your comment/i],
	])("a %s failure is worded for posting and the text stays", (error, pattern) => {
		usePostEventComment.mockReturnValue(hook({ error }))
		render(<EventCommentComposer eventId="e1" />)
		type("keep me")
		expect(screen.getByRole("alert")).toHaveTextContent(pattern)
		expect(box().value).toBe("keep me")
	})

	it("404 does not say the event is missing; 403 does not mention the live session or logging in", () => {
		usePostEventComment.mockReturnValue(hook({ error: "not_found" }))
		const { rerender } = render(<EventCommentComposer eventId="e1" />)
		expect(screen.getByRole("alert")).not.toHaveTextContent(/event isn.t available|deleted|not found/i)
		usePostEventComment.mockReturnValue(hook({ error: "forbidden" }))
		rerender(<EventCommentComposer eventId="e1" />)
		const alert = screen.getByRole("alert")
		expect(alert).not.toHaveTextContent(/live session|sign in|log in|session has expired/i)
	})

	it("editing after a rejection clears the error so the next attempt starts clean", () => {
		usePostEventComment.mockReturnValue(hook({ error: "server" }))
		render(<EventCommentComposer eventId="e1" />)
		type("x")
		expect(clearError).toHaveBeenCalled()
	})

	it("has no character limit: no maxLength, no counter, long text is submitted as is", async () => {
		render(<EventCommentComposer eventId="e1" />)
		expect(box()).not.toHaveAttribute("maxlength")
		const long = "w".repeat(20_000)
		type(long)
		expect(box().value).toBe(long)
		submit()
		expect(post).toHaveBeenCalledWith(long)
		expect(screen.queryByText(/\d+\s*\/\s*\d+|characters? (left|remaining)/i)).not.toBeInTheDocument()
	})

	it("offers only the textarea and Post comment: no attachments, emoji or other controls", () => {
		const { container } = render(<EventCommentComposer eventId="e1" />)
		expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Post comment"])
		expect(container.querySelector("input")).toBeNull()
		expect(container.querySelectorAll("textarea")).toHaveLength(1)
	})
})
