import { QueryProvider } from "@/providers/query-provider"
import { AppThemeProvider } from "@/providers/theme-provider"
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
		<html lang="en" suppressHydrationWarning  className={workSans.variable}>
			<body className={`${workSans.className} bg-background text-foreground antialiased`}>
				<AppThemeProvider>
					<QueryProvider>
						{children}
						<Toaster
							position="top-center"
							theme="system"
							richColors
							toastOptions={{
								duration: 4000,
								classNames: {
									toast: "font-sans text-sm rounded-xl shadow-lg border bg-card text-card-foreground border-border",
									title: "font-semibold",
									description: "text-xs opacity-75 text-muted-foreground",
									actionButton: "bg-primary text-primary-foreground text-xs font-semibold rounded-lg",
									cancelButton: "text-xs font-medium text-muted-foreground",
									closeButton: "border border-input",
								},
							}}
						/>
					</QueryProvider>
				</AppThemeProvider>
			</body>
		</html>
	)
}
