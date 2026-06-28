import { useOtpCooldown } from "@/hooks/use-otp-cooldown"
import { cn } from "@/lib/utils"

export function ResendButton({ onResend }: { onResend: () => void }) {
	const { remaining, start, isActive } = useOtpCooldown()

	const handleClick = () => {
		onResend()
		start()
	}

	return (
		<p className="text-center text-sm text-muted-foreground">
			I didn&apos;t receive any code{" "}
			<button
				type="button"
				onClick={handleClick}
				disabled={isActive}
				className={cn(
					"font-medium focus:outline-none transition-all",
					isActive
						? "text-muted-foreground/60 cursor-not-allowed tabular-nums"
						: "text-primary hover:underline cursor-pointer",
				)}
			>
				{isActive ? `Resend in ${remaining}s` : "Resend"}
			</button>
		</p>
	)
}