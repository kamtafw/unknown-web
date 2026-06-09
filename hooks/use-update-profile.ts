import { userApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { FullUser } from "@/types/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authKeys } from "./use-auth"

export const updateProfileKeys = {
	photo: ["update-profile", "photo"],
	name: ["update-profile", "name"],
	username: ["update-profile", "username"],
	bio: ["update-profile", "bio"],
}

export function useUpdatePhoto() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationKey: updateProfileKeys.photo,
		mutationFn: (file: File) => userApi.updateProfilePhoto(file),

		onMutate: async (file) => {
			await qc.cancelQueries({ queryKey: authKeys.me })

			const snapshots = {
				user: qc.getQueryData<FullUser>(authKeys.me),
				store: useAuthStore.getState().user,
				previewUrl: URL.createObjectURL(file),
			}

			const patch = { profile_photo: snapshots.previewUrl }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			if (snapshots.store) setUser({ ...snapshots.store, ...patch })

			return snapshots
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { profile_photo: data.data.profile_photo }
			qc.setQueryData(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })
		},

		onSettled: (_data, _err, _vars, ctx) => {
			if (ctx?.previewUrl) URL.revokeObjectURL(ctx.previewUrl)
		},
	})
}

export function useUpdateName() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationKey: updateProfileKeys.name,
		mutationFn: (payload: { first_name: string; last_name: string }) => userApi.updateName(payload),

		onMutate: async (payload) => {
			await qc.cancelQueries({ queryKey: authKeys.me })

			const snapshots = {
				user: qc.getQueryData<FullUser>(authKeys.me),
				store: useAuthStore.getState().user,
			}

			const patch = { first_name: payload.first_name, last_name: payload.last_name }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			if (snapshots.store) setUser({ ...snapshots.store, ...patch })

			return snapshots
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { first_name: data.data.first_name, last_name: data.data.last_name }
			qc.setQueryData(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })
		},
	})
}

export function useUpdateUsername() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: { username: string }) => userApi.updateUsername(payload),

		onMutate: async (payload) => {
			await qc.cancelQueries({ queryKey: authKeys.me })

			const snapshots = {
				user: qc.getQueryData<FullUser>(authKeys.me),
				store: useAuthStore.getState().user,
			}

			const patch = { username: payload.username }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			if (snapshots.store) setUser({ ...snapshots.store, ...patch })

			return snapshots
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { username: data.data.username }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })
		},
	})
}

export function useUpdateBio() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationKey: updateProfileKeys.bio,
		mutationFn: (payload: { about_me: string }) => userApi.updateBio(payload),

		onMutate: async (payload) => {
			await qc.cancelQueries({ queryKey: authKeys.me })

			const snapshots = {
				user: qc.getQueryData<FullUser>(authKeys.me),
				store: useAuthStore.getState().user,
			}

			const patch = { about_me: payload.about_me }
			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old ? { ...old, profile: { ...old.profile, ...patch } } : old,
			)
			if (snapshots.store)
				setUser({ ...snapshots.store, profile: { ...snapshots.store.profile, ...patch } })

			return snapshots
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { about_me: data.data.about_me }
			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old ? { ...old, profile: { ...old.profile, ...patch } } : old,
			)
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, profile: { ...user.profile, ...patch } })
		},
	})
}

export function useUpdateDob() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: { dob: string }) => userApi.updateDob(payload),

		onMutate: async (payload) => {
			await qc.cancelQueries({ queryKey: authKeys.me })

			const snapshots = {
				user: qc.getQueryData<FullUser>(authKeys.me),
				store: useAuthStore.getState().user,
			}

			const patch = { dob: payload.dob }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			if (snapshots.store) setUser({ ...snapshots.store, ...patch })

			return snapshots
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { dob: data.data.dob }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })
		},
	})
}

export function useUpdateDobVisibility() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: { dob_visibility: "full" | "partial" }) =>
			userApi.updateDobVisibility(payload),

		onMutate: async (payload) => {
			await qc.cancelQueries({ queryKey: authKeys.me })

			const snapshots = {
				user: qc.getQueryData<FullUser>(authKeys.me),
				store: useAuthStore.getState().user,
			}

			const patch = { dob_visibility: payload.dob_visibility }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			if (snapshots.store) setUser({ ...snapshots.store, ...patch })

			return snapshots
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { dob_visibility: data.data.dob_visibility }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })
		},
	})
}

export function useUpdateLocation() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: { country: string; state: string }) => userApi.updateLocation(payload),

		onMutate: async (payload) => {
			await qc.cancelQueries({ queryKey: authKeys.me })

			const snapshots = {
				user: qc.getQueryData<FullUser>(authKeys.me),
				store: useAuthStore.getState().user,
			}

			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...payload } : old))
			if (snapshots.store) setUser({ ...snapshots.store, ...payload })

			return snapshots
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { country: data.data.country, state: data.data.state }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })
		},
	})
}

export function useAddExternalLink() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: { url: string; label: string }) => userApi.addExternalLink(payload),

		// No optimistic update for POST — we don't know the server-assigned id yet
		onSuccess: (data) => {
			if (!data.success) return

			const newLink = data.data

			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old ? { ...old, external_links: [...(old.external_links ?? []), newLink] } : old,
			)
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, external_links: [...(user.external_links ?? []), newLink] })
		},
	})
}
