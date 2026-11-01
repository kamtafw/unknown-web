import { expect, test, type Page } from "@playwright/test"
import path from "node:path"
const owner = {
	id: "582a0f99-037a-4ddf-b17a-282a69ad6778",
	pkid: 1,
	username: "owner",
	first_name: "Owner",
	last_name: "Test",
	profile_photo: null,
}
const person = {
	id: "d76be7c4-c72c-45ed-9971-919f45e937f2",
	pkid: 2,
	username: "ada",
	first_name: "Ada",
	last_name: "Lovelace",
	profile_photo: null,
	youFollowThisUser: false,
}
const envelope = (data: unknown) => ({
	success: true,
	status_code: 200,
	message: null,
	data,
})
const paginate = (results: unknown[]) => ({
	results,
	current: 1,
	total_pages: 1,
	next: null,
	previous: null,
	count: results.length,
})
function post(id: string, user = owner, message = "My own post") {
	return {
		id,
		kind: "post",
		post_id: null,
		parent_id: null,
		user,
		message,
		media: [],
		location: null,
		hashtags: [],
		metrics: {
			likes: 0,
			replies: 0,
			reposts: 0,
			reactions: 0,
			shares: 0,
			bookmarks: 0,
			views: 0,
		},
		viewer: {
			liked: false,
			reposted: false,
			repost_id: null,
			bookmarked: false,
			shared: false,
		},
		permissions: {
			visibility: "EVERYONE",
			reply_policy: "EVERYONE",
			can_view: true,
			can_reply: true,
		},
		flags: { pinned: false, repost: false, shared: false },
		original: null,
		created_at: "2026-10-31T10:00:00Z",
		updated_at: "2026-10-31T10:00:00Z",
	}
}
async function setup(page: Page) {
	const payload = Buffer.from(
		JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
	).toString("base64url")
	await page
		.context()
		.addCookies(
			["ac_token", "rf_token"].map((name) => ({
				name,
				value: `test.${payload}.fixture`,
				url: test.info().project.use.baseURL || "http://localhost:4000",
			})),
		)
	await page.addInitScript(() => {
		Object.defineProperty(window, "speechSynthesis", {
			configurable: true,
			value: {
				speak: () => {
					;(window as Window & { speechStarted?: boolean }).speechStarted = true
				},
				cancel: () => {},
				pause: () => {},
				resume: () => {},
			},
		})
		Object.defineProperty(window, "SpeechSynthesisUtterance", {
			configurable: true,
			value: class {
				constructor(public text: string) {}
			},
		})
	})
	const posts = [
		post("59f46777-53aa-4434-8e42-d212def0ef99"),
		post(
			"b41c0e49-42f1-4897-943f-eb13a006d770",
			person,
			"Another person's post",
		),
	]
	const writes: { path: string; body: Record<string, unknown> }[] = []
	let following = false
	await page.route("**/api/**", async (route) => {
		const req = route.request()
		const url = new URL(req.url())
		const pathname = url.pathname
		let data: unknown = {}
		if (req.method() !== "GET") {
			const isUpload = pathname.endsWith("upload-media")
			const body = isUpload ? {} : req.postDataJSON() || {}
			writes.push({ path: pathname, body })
			if (pathname === "/api/users/follow") {
				following = !following
				data = { id: person.id, following }
			} else if (isUpload)
				data = {
					media_type: "VIDEO",
					media_urls: ["https://example.test/smoke.mp4"],
				}
			else if (pathname.endsWith("toggle-pinned-post")) {
				const id = pathname.split("/").at(-2)
				posts.forEach((p) => (p.flags.pinned = p.id === id))
				data = { is_pinned: true, message: "Pinned" }
			} else if (pathname.endsWith("create-post"))
				data = {
					...posts[0],
					message: body.content,
					media: body.media_urls || [],
				}
			else data = { post: body.post, pkid: 1, status: "PENDING" }
		} else if (pathname === "/api/users/me")
			data = {
				...owner,
				email: "owner@example.test",
				country: "NG",
				profile: { about_me: "" },
			}
		else if (pathname === "/api/users/accounts") data = { accounts: [] }
		else if (pathname === "/api/users/friend-suggestions")
			data = paginate([{ ...person, youFollowThisUser: following }])
		else if (pathname.includes("/api/socials/") && pathname.endsWith("feed"))
			data = paginate(posts)
		else if (pathname === "/api/socials/search")
			data = paginate([{ ...person, youFollowThisUser: following }])
		else if (pathname.includes("/api/notifications/"))
			data = paginate([
				{
					id: 1,
					object_id: 1,
					notification_type: "follow",
					message: "Ada followed you",
					user: person,
					you_are_following_back: following,
					connection_status: null,
					sent_at: "2026-10-31T10:00:00Z",
				},
			])
		else if (pathname.endsWith("/profile"))
			data = {
				...person,
				is_user_you_follow: following,
				follower_count: 0,
				following_count: 0,
			}
		else if (pathname.endsWith("/timezone/preferences"))
			data = { id: 1, timezone: "Africa/Lagos" }
		else if (pathname.includes("/chats/"))
			data = { users: [], unread_count: 0, results: [] }
		else data = paginate([])
		await route.fulfill({ json: envelope(data) })
	})
	return { writes, posts }
}
test("search and notification follow actions toggle and message opens a conversation", async ({
	page,
}) => {
	const { writes } = await setup(page)
	await page.goto("/home")
	const search = page.locator(
		'input[placeholder="What are you looking for?"]:visible',
	)
	if (!(await search.isVisible()))
		await page
			.getByRole("button")
			.filter({ has: page.locator("svg.lucide-search") })
			.click()
	await search.fill("ada")
	await search.press("Enter")
	await expect(page).toHaveURL(/search\?q=ada/)
	await page.getByRole("button", { name: "Follow", exact: true }).click()
	await expect(
		page.getByRole("button", { name: "Unfollow", exact: true }),
	).toBeVisible()
	await page.getByRole("button", { name: "Unfollow", exact: true }).click()
	await expect(
		page.getByRole("button", { name: "Follow", exact: true }),
	).toBeVisible()
	await page.getByRole("button", { name: "Notifications", exact: true }).click()
	await page.getByRole("button", { name: "Follow back", exact: true }).click()
	await expect(
		page
			.getByRole("dialog")
			.getByRole("button", { name: "Unfollow", exact: true }),
	).toBeVisible()
	await page.getByRole("button", { name: "Message", exact: true }).click()
	await expect(page).toHaveURL(new RegExp(`/messenger/${person.id}`))
	expect(
		writes.filter((w) => w.path === "/api/users/follow").map((w) => w.body),
	).toEqual([
		{ followed_user: person.id },
		{ followed_user: person.id },
		{ followed_user: person.id },
	])
	expect(writes.some((w) => w.path.endsWith("unfollow"))).toBe(false)
})
test("own posts can read aloud and community notes submit the post UUID", async ({
	page,
}) => {
	const { writes } = await setup(page)
	await page.goto("/home")
	const own = page.locator("article").filter({ hasText: "My own post" })
	await own.getByRole("button", { name: "More options" }).first().click()
	await page
		.getByRole("menuitem", { name: "Pin to profile", exact: true })
		.click()
	await expect
		.poll(() => writes.some((w) => w.path.endsWith("toggle-pinned-post")))
		.toBe(true)
	await own.getByRole("button", { name: "More options" }).first().click()
	await expect(
		page.getByRole("menuitem", { name: "Unpin from profile", exact: true }),
	).toBeVisible()
	await page.getByRole("menuitem", { name: "Read post out loud" }).click()
	await expect
		.poll(() =>
			page.evaluate(
				() => (window as Window & { speechStarted?: boolean }).speechStarted,
			),
		)
		.toBe(true)
	await page.keyboard.press("Escape")
	await page
		.locator("article")
		.filter({ hasText: "Another person's post" })
		.getByRole("button", { name: "More options" })
		.first()
		.click()
	await page.getByRole("menuitem", { name: "Request community note" }).click()
	await page.getByLabel("Reason", { exact: true }).fill("Missing context")
	await page
		.getByLabel("Details", { exact: true })
		.fill("Please check the source.")
	await page.getByRole("button", { name: "Agree and request a note" }).click()
	await expect(page.getByText("Note requested", { exact: true })).toBeVisible()
	expect(
		writes.find((w) => w.path.endsWith("request-note"))?.body,
	).toMatchObject({
		post: "b41c0e49-42f1-4897-943f-eb13a006d770",
		reason: "Missing context",
		description: "Please check the source.",
	})
	await page.screenshot({
		path: test.info().outputPath("community-note.png"),
		animations: "disabled",
	})
})
test("video attachment and @mention are included in a new post", async ({
	page,
}) => {
	const { writes } = await setup(page)
	await page.goto("/home")
	await page.getByRole("button", { name: "Create Post", exact: true }).click()
	const composer = page.getByPlaceholder("What's on your mind?")
	await composer.fill("Hello @ad")
	await page.getByRole("option").filter({ hasText: "@ada" }).click()
	await expect(composer).toHaveValue("Hello @ada ")
	await page
		.locator('input[type="file"][accept="image/*,video/*"]')
		.setInputFiles(path.join(process.cwd(), "e2e/fixtures/social-smoke.mp4"))
	await expect(page.getByText("Upload failed", { exact: true })).toHaveCount(0)
	await page.getByRole("button", { name: "Post", exact: true }).click()
	await expect
		.poll(() => writes.filter((w) => w.path.endsWith("create-post")).length)
		.toBe(1)
	expect(
		writes.find((w) => w.path.endsWith("create-post"))?.body,
	).toMatchObject({
		content: "Hello @ada",
		media_urls: ["https://example.test/smoke.mp4"],
	})
})

test("inline suggestions follow immediately and disappear without a cache error", async ({page}) => {
    await setup(page)
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    await page.goto("/home")
    const suggestions = page.locator("#feed-scroll").getByRole("complementary", {name: "Who to follow"})
    await suggestions.getByRole("button", {name: "Follow", exact: true}).click()
    await expect(suggestions.getByRole("button", {name: /Following|Unfollow/})).toBeVisible()
    await expect(suggestions.getByText("@ada", {exact: true})).toHaveCount(0, {timeout: 8000})
    expect(errors).toEqual([])
})
