"use client"

import {
	Copy,
	Paperclip,
	RotateCcw,
	Send,
	Smile,
	Sparkles,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"

type ChatMessage = {
	role: "user" | "ai"
	content: string
	time?: string
}

const PLACEHOLDER_MESSAGES: ChatMessage[] = [
	{ role: "user", content: "What is a chameleon" },
	{
		role: "ai",
		content:
			"Chameleons are a fascinating group of lizards best known for their colour-changing skin, independently moving eyes, and long sticky tongues. Here are some key facts about them:",
		time: "2 Hours ago",
	},
]

const CHAMELEON_FACTS = [
	{
		title: "Color Changing",
		body: "Chameleons shift their skin colour using specialised cells, mostly to regulate temperature and communicate mood, rather than purely for camouflage.",
	},
	{
		title: "Habitat",
		body: "Most species live in the warm forests, savannas, and mountains of Madagascar and mainland Africa, with a few found across parts of Europe and Asia.",
	},
	{
		title: "Physical Characteristics",
		body: "They have eyes that move independently of one another, tongues that can extend beyond their body length, and feet built for gripping branches.",
	},
	{
		title: "Species",
		body: "There are over 200 known species, ranging from tiny chameleons just a few centimetres long to larger species that can grow past half a metre.",
	},
	{
		title: "Behavior",
		body: "Chameleons are mostly solitary and slow-moving, relying on stillness and camouflage to avoid predators and ambush insect prey.",
	},
	{
		title: "Reproduction",
		body: "Depending on the species, females either lay clutches of eggs that incubate for months or give birth to live young.",
	},
]

const SUGGESTION_PROMPTS = [
	{ emoji: "🎁", text: "How do i become more productive" },
	{ emoji: "🚀", text: "How do i boost my engagement" },
]

const RECENT_HISTORY = [
	{ text: "What is a chameleon", time: "2 Hours ago" },
	{ text: "How do i become more productive", time: "2 Hours ago" },
	{ text: "How do i boost my engagement", time: "2 Hours ago" },
	{ text: "Generate a caption for a travel post", time: "5 Hours ago" },
	{ text: "Best time to post for maximum reach", time: "1 Day ago" },
	{ text: "Ideas for a comedy skit about social media", time: "1 Day ago" },
]

const MESSAGE_ACTIONS = [
	{ icon: ThumbsUp, label: "Good response" },
	{ icon: ThumbsDown, label: "Bad response" },
	{ icon: Copy, label: "Copy" },
	{ icon: RotateCcw, label: "Regenerate" },
]

function AIAvatar({ size = 32 }: { size?: number }) {
	return (
		<div
			className="flex shrink-0 items-center justify-center rounded-full bg-primary/10"
			style={{ width: size, height: size }}
		>
			<Image src="/logo-2.svg" alt="AppsCombo AI" width={size * 0.6} height={size * 0.6} />
		</div>
	)
}

function UserMessage({ content }: { content: string }) {
	return (
		<div className="flex justify-end">
			<div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
				{content}
			</div>
		</div>
	)
}

function AIMessage({ content, time }: { content: string; time?: string }) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-3">
				<AIAvatar size={32} />
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold text-foreground">Ai_Combo</span>
					{time && <span className="text-xs text-muted-foreground">{time}</span>}
				</div>
			</div>

			<div className="space-y-4 pl-11 text-sm leading-relaxed text-foreground/80">
				<p>{content}</p>
				<ul className="space-y-3">
					{CHAMELEON_FACTS.map((fact) => (
						<li key={fact.title} className="flex gap-2">
							<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
							<p>
								<span className="font-semibold text-foreground">{fact.title}: </span>
								{fact.body}
							</p>
						</li>
					))}
				</ul>

				<div className="flex items-center gap-1 pt-1">
					{MESSAGE_ACTIONS.map(({ icon: Icon, label }) => (
						<button
							key={label}
							type="button"
							aria-label={label}
							className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						>
							<Icon className="size-4" />
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

function ChatComposer() {
	const [value, setValue] = useState("")
	const handleSend = () => {}

	return (
		<div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
			<button
				type="button"
				aria-label="Add emoji"
				className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
			>
				<Smile className="size-5" />
			</button>

			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Ask anything"
				className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
			/>

			<button
				type="button"
				aria-label="Attach file"
				className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
			>
				<Paperclip className="size-5" />
			</button>

			<button
				type="button"
				aria-label="AI tools"
				className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
			>
				<Sparkles className="size-5" />
			</button>

			<button
				type="button"
				aria-label="Send message"
				onClick={handleSend}
				className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
			>
				<Send className="size-4" />
			</button>
		</div>
	)
}

export default function AppsComboAI() {
	return (
		<div className="flex h-full min-h-0 flex-1 gap-5 overflow-hidden">
			{/* Chat panel */}
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
				<header className="flex shrink-0 items-center justify-center gap-2 border-b border-border py-4">
					<AIAvatar size={28} />
					<span className="font-semibold text-foreground">Ai_Combo</span>
				</header>

				<div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:hidden">
					{PLACEHOLDER_MESSAGES.map((message, index) =>
						message.role === "user" ? (
							<UserMessage key={index} content={message.content} />
						) : (
							<AIMessage key={index} content={message.content} time={message.time} />
						),
					)}
				</div>

				<div className="shrink-0 border-t border-border px-6 py-4">
					<ChatComposer />
				</div>
			</div>

			{/* Suggestions sidebar */}
			<aside className="hidden w-96 shrink-0 flex-col gap-6 overflow-y-auto xl:flex [&::-webkit-scrollbar]:hidden">
				<div>
					<h2 className="mb-3 text-sm font-semibold text-foreground">
						AI suggestions to get started
					</h2>
					<div className="grid grid-cols-2 gap-3">
						{SUGGESTION_PROMPTS.map((suggestion) => (
							<button
								key={suggestion.text}
								type="button"
								className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 text-left text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-accent"
							>
								<span className="text-lg">{suggestion.emoji}</span>
								<span>{suggestion.text}</span>
							</button>
						))}
					</div>
				</div>

				{/* Intentionally dark gradient card — preserved */}
				<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-gray-800 via-gray-700 to-primary p-4 text-white">
					<Sparkles className="mb-12 size-5" />
					<p className="mb-3 text-sm font-medium">A Chameleon with scales and dragon features</p>
					<button
						type="button"
						className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
					>
						Start generating
					</button>
				</div>

				<div>
					<h2 className="mb-3 text-sm font-semibold text-foreground">Recent History</h2>
					<div className="grid grid-cols-2 gap-3">
						{RECENT_HISTORY.map((item, index) => (
							<button
								key={index}
								type="button"
								className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/30 hover:bg-accent"
							>
								<p className="line-clamp-2 text-sm text-foreground">{item.text}</p>
								<span className="text-xs italic text-muted-foreground">{item.time}</span>
							</button>
						))}
					</div>
				</div>
			</aside>
		</div>
	)
}
