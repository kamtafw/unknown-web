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
							if ((error as { response?: { status: number } })?.response?.status === 401) {
								return false
							}
							return failureCount < 2
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
