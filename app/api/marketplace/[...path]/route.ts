import { getAccessToken } from "@/lib/cookies"
import { DJANGO_API_URL } from "@/lib/server-config"
import { proxyJson } from "@/lib/server-fetch"
import { NextRequest, NextResponse } from "next/server"

// Only expose the seller endpoints used by this workspace.
const endpoints: Record<string, RegExp[]> = {
	GET: [
		/^seller\/promotions$/,
		/^promotions\/options$/,
		/^seller\/account$/,
		/^seller\/profile$/,
		/^seller\/orders$/,
		/^seller\/orders\/\d+$/,
		/^seller\/products\/\d+$/,
		/^seller\/products$/,
		/^seller\/alerts$/,
		/^seller\/payout-settings$/,
		/^seller\/payouts\/preview$/,
		/^seller\/wallet$/,
		/^seller\/wallet\/transactions$/,
		/^seller\/payouts\/history$/,
		/^sellers\/\d+\/details$/,
		/^products\/list$/,
		/^products\/specification-suggestions$/,
		/^products\/\d+$/,
		/^products\/\d+\/reviews$/,
		/^categories\/list$/,
		/^delivery-options\/list$/,
		/^seller\/products\/\d+\/(sales(\/summary)?|stats)$/,
	],
	POST: [
		/^products$/,
		/^setup$/,
		/^seller\/verification-link$/,
		/^promotions\/create$/,
		/^seller\/payouts$/,
		/^seller\/payouts\/reconcile$/,
		/^seller\/orders\/\d+\/tracking$/,
	],
	PATCH: [
		/^products\/\d+\/edit$/,
		/^seller\/orders\/\d+\/(status|shipment)$/,
		/^seller\/account$/,
		/^seller\/payout-settings$/,
		/^seller\/alerts\/(read-all|\d+\/read)$/,
	],
	DELETE: [/^products\/\d+\/delete$/],
}

async function handle(
	req: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	const path = (await context.params).path.join("/")
	if (!endpoints[req.method]?.some((pattern) => pattern.test(path))) {
		return NextResponse.json({ message: "Endpoint not found" }, { status: 404 })
	}
	const token = await getAccessToken()
	if (!token)
		return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
	let body: string | undefined
	if (req.method === "POST" || req.method === "PATCH") {
		try {
			body = JSON.stringify(await req.json())
		} catch {
			return NextResponse.json(
				{ message: "Invalid JSON body" },
				{ status: 400 },
			)
		}
	}
	return proxyJson(
		`${DJANGO_API_URL}/marketplaces/${path}${req.nextUrl.search}`,
		{
			method: req.method,
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body,
			cache: "no-store",
		},
	)
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE }
