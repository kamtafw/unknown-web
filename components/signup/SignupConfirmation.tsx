import { Dispatch, SetStateAction } from "react"
import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import CustomLoader from "../shared/Loader/CustomLoader" // TODO: review CustomLoader component
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "../ui/alert-dialog"

interface SignupConfirmationProps {
	showConfirmation: boolean
	setShowConfirmation: Dispatch<SetStateAction<boolean>>
}

const SignupConfirmation = ({ showConfirmation, setShowConfirmation }: SignupConfirmationProps) => {
	const isPending = false

	return (
		<>
			<AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
				<AlertDialogContent className="sm:max-w-md sm:w-160">
					<AlertDialogTitle className="flex items-center justify-center gap-0">
						<Image src="/logo.svg" alt="Appscombo logo" width={160} height={50} />
					</AlertDialogTitle>

					<AlertDialogDescription className="flex items-center mt-2">
						<span className="text-base text-gray-900 font-medium text-center">
							By signing up with Appscombo, you have agreed to our{" "}
							<Link href="#" className="text-primary font-bold">
								terms and agreement
							</Link>
							, with{" "}
							<Link href="#" className="text-primary font-bold">
								Privacy Policy
							</Link>
							.
						</span>
					</AlertDialogDescription>

					<AlertDialogFooter className="flex items-center mt-4 mb-5">
						<Button
							type="submit"
							className="flex items-center justify-center py-3.5 bg-primary hover-bg-primary-dark cursor-pointer rounded-xl text-white text-base font-semibold h-13 w-full max-w-[384px]"
						>
							{isPending ? <CustomLoader /> : "I agree."}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}

export default SignupConfirmation
