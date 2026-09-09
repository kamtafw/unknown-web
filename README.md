# M1 closure — documentation only — apply to `appscombo_frontend`

No code changes in this package — the previous two bugfix zips already cover everything code-side. This is just the documentation catching up to the decision to close M1 with two known, deferred issues.

- **`docs/messenger/MESSENGER.md`** — Current milestone marked M1 closed, roadmap updated, and a new "M1 known issues (deferred)" section with: what's already been ruled out for each bug, current leading hypotheses ranked by likelihood, the exact next diagnostic step, and two specific questions worth putting to the backend team. Immediate next action points at M2.
- **`docs/messenger/DECISIONS.md`** — one line in the log table marking the closure.

## Why document instead of leaving it as "known flaky"

Both remaining issues are real and both survived confirmed fixes, which is itself useful information — it's evidence they're either genuinely different from what's already been tried, or backend-side rather than client-side. The MESSENGER.md entry is written so that whoever picks this up next (possibly you, possibly someone else) doesn't have to re-derive what's already been ruled out.
