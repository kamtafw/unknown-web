/**
 * Byte-capped pass-through for a request body. The multipart upload is streamed to the backend
 * chunk by chunk instead of being parsed into memory, so the BFF never holds a whole file; this
 * wrapper only counts bytes and stops the stream once the cap is exceeded. Backpressure is
 * preserved (`pipeThrough`), so a slow backend slows the browser rather than filling memory.
 */

export class BodyTooLargeError extends Error {
	constructor(readonly maxBytes: number) {
		super(`Request body exceeded ${maxBytes} bytes`)
	}
}

export interface LimitedBody {
	stream: ReadableStream<Uint8Array>
	/** true once the cap was hit (the upstream fetch then fails; callers map that to 413) */
	exceeded: () => boolean
	received: () => number
}

export function limitBodyStream(source: ReadableStream<Uint8Array>, maxBytes: number): LimitedBody {
	let total = 0
	let exceeded = false
	const stream = source.pipeThrough(
		new TransformStream<Uint8Array, Uint8Array>({
			transform(chunk, controller) {
				total += chunk.byteLength
				if (total > maxBytes) {
					exceeded = true
					controller.error(new BodyTooLargeError(maxBytes))
					return
				}
				controller.enqueue(chunk)
			},
		}),
	)
	return { stream, exceeded: () => exceeded, received: () => total }
}
