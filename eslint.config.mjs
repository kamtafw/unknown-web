import { FlatCompat } from "@eslint/eslintrc"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
	baseDirectory: __dirname,
})

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),

	{
		files: [
			"app/(auth)/social-callback/page.tsx",
			"hooks/use-otp-cooldown.ts",
			"hooks/use-read-aloud.ts",
			"components/auth/create-new-password.tsx",
			"components/dashboard/add-account-panel.tsx",
			"components/dashboard/media-lightbox.tsx",
			"components/dashboard/photo-crop-modal.tsx",
			"components/dashboard/read-aloud-modal.tsx",
			"components/dashboard/profile-edit-panels.tsx",
			"components/messenger/conversation/reaction-row.tsx",
			"components/messenger/conversation/poll-bubble.tsx",
			"components/messenger/conversation/conversation-workspace.tsx",
			"components/messenger/conversation/reaction-summary.tsx",
			"components/messenger/conversation/reactions-dialog.tsx",
			"components/messenger/status/status-viewer-panel.tsx",
			"components/messenger/schedule/schedule-compose-dialog.tsx",
			"components/messenger/group-conversation/group-conversation-workspace.tsx",
		],
		rules: {
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/exhaustive-deps": "off",
			"react-hooks/purity": "off",
		},
	},
]

export default eslintConfig
