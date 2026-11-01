import { expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { socialApi } from "@/lib/api"
import { RequestNoteModal } from "./request-note-modal"
vi.mock("@/lib/api", () => ({ socialApi: { requestCommunityNote: vi.fn() } }))
it("requires context and submits the post UUID with the note fields", async () => {
	vi.mocked(socialApi.requestCommunityNote).mockResolvedValue({
		success: true,
		status_code: 201,
		message: null,
		data: { post: "post-uuid", pkid: 1, status: "PENDING" },
	})
	render(
		<QueryClientProvider client={new QueryClient()}>
			<RequestNoteModal postId="post-uuid" open onOpenChange={() => {}} />
		</QueryClientProvider>,
	)
	const user = userEvent.setup()
	expect(
		screen.getByRole("button", { name: "Agree and request a note" }),
	).toBeDisabled()
	await user.type(screen.getByLabelText("Reason"), "Missing context")
	await user.type(screen.getByLabelText("Details"), "The claim needs a source.")
	await user.click(
		screen.getByRole("button", { name: "Agree and request a note" }),
	)
	await waitFor(() =>
		expect(socialApi.requestCommunityNote).toHaveBeenCalledWith({
			post: "post-uuid",
			reason: "Missing context",
			description: "The claim needs a source.",
			evidence_urls: [],
		}),
	)
	expect(await screen.findByText("Note requested")).toBeVisible()
})
