export async function fromReadableStream(
	rs: ReadableStream<Uint8Array>
): Promise<unknown> {
	const dec = new TextDecoder()
	let res = ''

	const reader = rs.getReader()

	try {
		while (true) {
			const { value, done } = await reader.read()

			if (done) break

			const chunk = dec.decode(value)
			res += chunk
		}

		return JSON.parse(res)
	} catch (e) {
		console.error('Error reading or decoding the stream:', e)
		throw e
	} finally {
		reader.releaseLock()
	}
}
