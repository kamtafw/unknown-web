import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Consolidated from 12 near-identical copies scattered across dashboard,
 * onboarding, and shared components (mention-autocomplete, friend-suggestions
 * x2, profile-edit-panels, author-hover-card, top-bar, blocked-accounts-panel,
 * settings, add-account-panel, post-card, user-profile-view). All but two
 * were byte-for-byte identical modulo nullability in the signature; this
 * uses the most permissive signature so every prior call site is still valid.
 *
 * Two call sites had a real (not just typing) difference, noted for
 * transparency rather than silently folded in:
 * - `top-bar.tsx` had no "?" fallback for empty input — under the shared
 *   version, two empty names now render "?" instead of "". Only observable
 *   if both first and last name are empty strings.
 * - `lib/messenger/user-display.ts` keeps its own copy — messenger already
 *   owns a dedicated user-display utility module as an established
 *   convention, and unifying it wasn't part of what was asked here, so it
 *   was deliberately left alone rather than pulled into this pass.
 */
export function getInitials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}

/**
 * Consolidated from 5 copies (author-hover-card, post-accounts-panel,
 * post-card, settings, user-profile-view). 4 of the 5 agreed on this exact
 * formatting (one decimal place, uppercase "K"/"M"); post-card.tsx's copy
 * was the outlier (`toFixed(0)`, lowercase "k" — e.g. "12k" instead of
 * "12.3K"). Nothing actually imported post-card's exported version despite
 * it being exported, so there was no real "canonical" copy to defer to —
 * standardized on the majority behavior. This is a real, visible change to
 * counts displayed on post cards specifically (likes/replies/reposts),
 * flagged here rather than silently absorbed.
 */
export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
