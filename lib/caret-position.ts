/**
 * computes the pixel offset (relative to the textarea's own content origin)
 * of a given character index by rendering an invisible mirror <div> with
 * identical box/typography metrics and measuring where a marker span lands.
 * Plain <textarea> exposes no native "caret rect" API, so this mirror trick
 * is the standard fallback (same approach editors like CodeMirror use)
 */

const MIRRORED_PROPERTIES = [
	"boxSizing",
	"width",
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"paddingLeft",
	"borderTopWidth",
	"borderRightWidth",
	"borderBottomWidth",
	"borderLeftWidth",
	"borderStyle",
	"fontFamily",
	"fontSize",
	"fontWeight",
	"fontStyle",
	"letterSpacing",
	"lineHeight",
	"tabSize",
	"textIndent",
	"textTransform",
	"wordSpacing",
] as const

let mirror: HTMLDivElement | null = null

function getMirror(): HTMLDivElement {
	if (mirror) return mirror
	mirror = document.createElement("div")
	mirror.setAttribute("aria-hidden", "true")
	mirror.style.position = "absolute"
	mirror.style.visibility = "hidden"
	mirror.style.left = "-9999px"
	mirror.style.top = "0"
	mirror.style.whiteSpace = "pre-wrap"
	mirror.style.wordWrap = "break-word"
	document.body.appendChild(mirror)
	return mirror
}

export interface CaretCoordinates {
	top: number
	left: number
	height: number
}

export function getCaretCoordinates(
	textarea: HTMLTextAreaElement,
	position: number,
): CaretCoordinates {
	const div = getMirror()
	const computed = window.getComputedStyle(textarea)

	MIRRORED_PROPERTIES.forEach((prop) => {
		div.style[prop as never] = computed[prop as never]
	})
	div.style.width = computed.width

	div.textContent = textarea.value.slice(0, position)

	const marker = document.createElement("span")
	marker.textContent = textarea.value.slice(position) || "."
	div.appendChild(marker)

	const coordinates: CaretCoordinates = {
		top: marker.offsetTop,
		left: marker.offsetLeft,
		height: marker.offsetHeight || parseInt(computed.lineHeight || "20", 10),
	}

	div.removeChild(marker)
	div.textContent = ""

	return coordinates
}
