"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ReactNode, useState } from "react"

export function QueryProvider({ children }: { children: ReactNode }) {
	// one QueryClient per browser session — useState ensures it's not
	// re-created on every render in strict mode
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// no retry on 401 — interceptor handles that
						retry: (failureCount, error: unknown) => {
							const status = (error as { response?: { status: number } })?.response?.status
							if (status === 401) return false
							if (status && status > 400 && status < 500) return false // client errors: never retry
							if (status && status >= 500) return failureCount < 1 // server errors: one retry
							return failureCount < 2 // network errors: two retries
						},
						retryDelay: (attempt, error: unknown) => {
							const status = (error as { response?: { status: number } })?.response?.status
							// exponential backoff for server errors, capped at 8s
							if (status && status >= 500) return Math.min(1000 * 2 ** attempt, 8000)
							return 1000
						},
						staleTime: 10000 * 60 * 5,
						refetchOnWindowFocus: false,
					},
					mutations: {
						retry: false,
					},
				},
			}),
	)

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	)
}
