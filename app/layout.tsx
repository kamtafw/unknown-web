import { QueryProvider } from "@/providers/query-provider"
import type { Metadata } from "next"
import { Work_Sans } from "next/font/google"
import type { ReactNode } from "react"
import { Toaster } from "sonner"
import "./globals.css"

const workSans = Work_Sans({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-work-sans",
	weight: ["400", "500", "600", "700"],
	preload: true,
})

export const metadata: Metadata = {
	title: { template: "%s | AppsCombo", default: "AppsCombo" },
	description: "Social media network",
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={workSans.variable}>
			<body className={workSans.className}>
				<QueryProvider>
					{children}
					<Toaster
						position="top-center"
						theme="system"
						richColors
						toastOptions={{
							duration: 4000,
							classNames: {
								toast: "font-sans text-sm rounded-xl shadow-lg border",
								title: "font-semibold",
								description: "text-xs opacity-75",
								actionButton: "bg-primary text-white text-xs font-semibold rounded-lg",
								cancelButton: "text-xs font-medium",
								closeButton: "border border-gray-200",
							},
						}}
					/>
				</QueryProvider>
			</body>
		</html>
	)
}
