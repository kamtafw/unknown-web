// @vitest-environment node
import { describe, expect, it } from "vitest"
import { BodyTooLargeError, limitBodyStream } from "./stream"

const source = (chunks: number[]) =>
	new ReadableStream<Uint8Array>({
		start(controller) {
			for (const n of chunks) controller.enqueue(new Uint8Array(n))
			controller.close()
		},
	})

async function drain(stream: ReadableStream<Uint8Array>) {
	const reader = stream.getReader()
	let n = 0
	for (;;) {
		const { done, value } = await reader.read()
		if (done) return n
		n += value.byteLength
	}
}

describe("limitBodyStream", () => {
	it("passes every byte through under the cap", async () => {
		const limited = limitBodyStream(source([10, 20, 30]), 100)
		expect(await drain(limited.stream)).toBe(60)
		expect(limited.exceeded()).toBe(false)
		expect(limited.received()).toBe(60)
	})
	it("accepts a body exactly at the cap", async () => {
		const limited = limitBodyStream(source([50, 50]), 100)
		expect(await drain(limited.stream)).toBe(100)
		expect(limited.exceeded()).toBe(false)
	})
	it("errors once the cap is exceeded and says so", async () => {
		const limited = limitBodyStream(source([60, 60, 60]), 100)
		await expect(drain(limited.stream)).rejects.toBeInstanceOf(BodyTooLargeError)
		expect(limited.exceeded()).toBe(true)
	})
	it("does not read ahead of its consumer (backpressure)", async () => {
		let pulled = 0
		const lazy = new ReadableStream<Uint8Array>(
			{
				pull(controller) {
					pulled++
					controller.enqueue(new Uint8Array(10))
					if (pulled >= 1000) controller.close()
				},
			},
			{ highWaterMark: 0 },
		)
		const limited = limitBodyStream(lazy, 1_000_000)
		const reader = limited.stream.getReader()
		await reader.read()
		await new Promise((r) => setTimeout(r, 20))
		expect(pulled).toBeLessThan(10)
		await reader.cancel()
	})
})
