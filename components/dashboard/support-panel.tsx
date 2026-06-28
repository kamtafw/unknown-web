import PrivacyPolicy from "@/components/legal/privacy-policy"
import Terms from "@/components/legal/terms"
import { ArrowLeft } from "lucide-react"

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
				aria-label="Go back"
			>
				<ArrowLeft size={15} className="text-gray-600" strokeWidth={2.5} />
			</button>
			<h2 className="font-bold text-gray-900 text-[15.5px]">{title}</h2>
		</div>
	)
}

export function TermsServicePanel({ onBack }: { onBack: () => void }) {
	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Terms of Service" onBack={onBack} />
			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<Terms />
			</div>
		</div>
	)
}

export function PrivacyPolicyPanel({ onBack }: { onBack: () => void }) {
	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Privacy Policy" onBack={onBack} />
			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<PrivacyPolicy />
			</div>
		</div>
	)
}
