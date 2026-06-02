import { toast as sonner } from "sonner"

type ToastOptions = Parameters<typeof sonner>[1]

export const toast = {
	success: (message: string, options?: ToastOptions) => sonner.success(message, options),

	error: (message: string, options?: ToastOptions) => sonner.error(message, options),

	info: (message: string, options?: ToastOptions) => sonner.info(message, options),

	warning: (message: string, options?: ToastOptions) => sonner.warning(message, options),

	loading: (message: string, options?: ToastOptions) => sonner.loading(message, options),

	promise: <T>(
		promise: Promise<T>,
		msgs: { loading: string; success: string; error: string },
		options?: ToastOptions,
	) => sonner.promise(promise, { ...msgs, ...options }),

	dismiss: (id?: string | number) => sonner.dismiss(id),
}
