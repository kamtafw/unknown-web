"use client"

import { useMe } from "@/hooks/use-auth"
import { useAuthStore } from "@/stores/auth-store"
import { useEffect } from "react"

export function DashboardAuthBootstrap() {
	const setUser = useAuthStore((s) => s.setUser)
	const logout = useAuthStore((s) => s.logout)
	const { data: user, isError } = useMe()

	useEffect(() => {
		if (user) setUser(user)
	}, [setUser, user])

	useEffect(() => {
		if (isError) logout()
	}, [isError, logout])

	return null
}
