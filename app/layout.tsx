// @ts-expect-error: CSS module declarations are handled by Next.js
import "./globals.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Work_Sans } from "next/font/google"
import { QueryProvider } from "@/providers/query-provider"

const workSans = Work_Sans({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-work-sans",
	weight: ["400", "500", "600", "700"],
	preload: true,
})

export const metadata: Metadata = {
	title: "AppsCombo",
	description: "Social media network",
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={workSans.variable}>
			<body className={workSans.className}>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	)
}
