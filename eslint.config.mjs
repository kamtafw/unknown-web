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
			"hooks/use-otp-cooldown.ts",
			"components/auth/create-new-password.tsx",
			"components/dashboard/photo-crop-modal.tsx",
			"components/dashboard/profile-edit-panels.tsx",
		],
		rules: {
			"react-hooks/set-state-in-effect": "off",
		},
	},
]

export default eslintConfig
