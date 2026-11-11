import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AccessField } from "./access-field"

describe("AccessField privacy options", () => {
	it("describes every option without internal implementation caveats", () => {
		render(
			<AccessField
				privacy="public"
				isLocked={false}
				passcode=""
				alreadyLocked={false}
				onPrivacy={vi.fn()}
				onLocked={vi.fn()}
				onPasscode={vi.fn()}
				errors={{}}
			/>,
		)
		expect(screen.getByRole("radio", { name: /Friends/ })).toBeInTheDocument()
		expect(screen.queryByText(/isn't enforced/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/not enforced/i)).not.toBeInTheDocument()
	})
})
