import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Work_Sans } from "next/font/google"
import ReactQueryProvider from "@/lib/react-query-provider"
import { QueryProvider } from "@/providers/query-provider"
import "@/styles/globals.css"

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
				{/* <ReactQueryProvider>{children}</ReactQueryProvider> */}
			</body>
		</html>
	)
}
