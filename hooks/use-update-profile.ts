import { userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import { FullUser } from "@/types/socials/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authKeys } from "./use-auth"

export const updateProfileKeys = {
	name: ["update-profile", "name"],
	username: ["update-profile", "username"],
	bio: ["update-profile", "bio"],
	location: ["update-profile", "location"],
}

export function useUpdatePhoto() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
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

		onError: (error, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
			showMutationErrorToast(error, "Failed to update profile photo")
		},

		onSuccess: (data) => {
			if (!data.success) return

			const newVersion = Date.now()
			const versionedUrl = `${data.data.profile_photo}?v=${newVersion}`
			useAuthStore.setState((state) => ({
				photoVersions: { ...state.photoVersions, profile: newVersion },
				user: state.user ? { ...state.user, profile_photo: versionedUrl } : state.user,
			}))

			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old ? { ...old, profile_photo: versionedUrl } : old,
			)

			toast.success("Profile photo updated")
		},

		onSettled: (_data, _err, _vars, ctx) => {
			if (ctx?.previewUrl) URL.revokeObjectURL(ctx.previewUrl)
		},
	})
}

export function useUpdateCoverPhoto() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (file: File) => userApi.updateCoverPhoto(file),

		onMutate: async (file) => {
			await qc.cancelQueries({ queryKey: authKeys.me })

			const snapshots = {
				user: qc.getQueryData<FullUser>(authKeys.me),
				store: useAuthStore.getState().user,
				previewUrl: URL.createObjectURL(file),
			}

			const patch = { cover_photo: snapshots.previewUrl }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			if (snapshots.store) setUser({ ...snapshots.store, ...patch })

			return snapshots
		},

		onError: (error, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
			showMutationErrorToast(error, "Failed to update cover photo")
		},

		onSuccess: (data) => {
			if (!data.success) return

			const newVersion = Date.now()
			const versionedUrl = `${data.data.cover_photo}?v=${newVersion}`

			useAuthStore.setState((state) => ({
				photoVersions: { ...state.photoVersions, cover: newVersion },
				user: state.user ? { ...state.user, cover_photo: versionedUrl } : state.user,
			}))

			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old ? { ...old, cover_photo: versionedUrl } : old,
			)

			toast.success("Cover photo updated")
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

		onError: (error, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
			showMutationErrorToast(error, "Failed to update name")
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { first_name: data.data.first_name, last_name: data.data.last_name }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })

			toast.success("Name updated")
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

		onError: (error, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
			showMutationErrorToast(error, "Failed to update username")
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { username: data.data.username }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })

			toast.success("Username updated")
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

		onError: (error, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
			showMutationErrorToast(error, "Failed to update bio")
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { about_me: data.data.about_me }
			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old ? { ...old, profile: { ...old.profile, ...patch } } : old,
			)
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, profile: { ...user.profile, ...patch } })

			toast.success("Bio updated")
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

		onError: (error, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
			showMutationErrorToast(error, "Failed to update date of birth")
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { dob: data.data.dob }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })

			toast.success("Date of birth updated")
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

		onError: (error, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
			showMutationErrorToast(error, "Failed to update date-of-birth visibility")
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
		mutationKey: updateProfileKeys.location,
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

		onError: (error, _vars, ctx) => {
			if (ctx?.user) qc.setQueryData<FullUser>(authKeys.me, ctx.user)
			if (ctx?.store) setUser(ctx.store)
			showMutationErrorToast(error, "Failed to update location")
		},

		onSuccess: (data) => {
			if (!data.success) return

			const patch = { country: data.data.country, state: data.data.state }
			qc.setQueryData<FullUser>(authKeys.me, (old) => (old ? { ...old, ...patch } : old))
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, ...patch })

			toast.success("Location updated")
		},
	})
}

export function useAddExternalLink() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: { url: string; label: string }) => userApi.addExternalLink(payload),

		onError: (error) => {
			showMutationErrorToast(error, "Failed to add link")
		},

		// No optimistic update for POST — we don't know the server-assigned id yet
		onSuccess: (data) => {
			if (!data.success) return

			const newLink = data.data
			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old ? { ...old, external_links: [...(old.external_links ?? []), newLink] } : old,
			)
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, external_links: [...(user.external_links ?? []), newLink] })

			toast.success("Link added")
		},
	})
}

export function useUpdateExternalLink() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: { url: string; label: string } }) =>
			userApi.updateExternalLink(id, payload),

		onError: (error) => {
			showMutationErrorToast(error, "Failed to update link")
		},

		onSuccess: (data) => {
			if (!data.success) return

			const updated = data.data
			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old
					? {
							...old,
							external_links: old.external_links.map((l) => (l.id === updated.id ? updated : l)),
						}
					: old,
			)
			const user = useAuthStore.getState().user
			if (user)
				setUser({
					...user,
					external_links: user.external_links.map((l) => (l.id === updated.id ? updated : l)),
				})

			toast.success("Link updated")
		},
	})
}

export function useDeleteExternalLink() {
	const qc = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (id: number) => userApi.deleteExternalLink(id),

		onError: (error) => {
			showMutationErrorToast(error, "Failed to delete link")
		},

		onSuccess: (_data, id) => {
			qc.setQueryData<FullUser>(authKeys.me, (old) =>
				old ? { ...old, external_links: old.external_links.filter((l) => l.id !== id) } : old,
			)
			const user = useAuthStore.getState().user
			if (user) setUser({ ...user, external_links: user.external_links.filter((l) => l.id !== id) })
			toast.success("Link deleted")
		},
	})
}
