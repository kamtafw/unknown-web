export const DJANGO_API_URL = process.env.DJANGO_API_URL ?? "https://dev.appscombo.org/api/v1"
export const S3_MEDIA_BASE = "https://appscombo.s3.eu-north-1.amazonaws.com/media/"
export const DEFAULT_PROFILE_PHOTO =
	"https://appscombo.s3.eu-north-1.amazonaws.com/media/profiles/images/profile.jpg"

/** normalise a bare S3 key or null into a fully-qualified URL */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
	if (!path) return undefined
	if (path.startsWith("http")) return path
	return `${S3_MEDIA_BASE}${path}`
}
