import { WaitListCheckIcon } from "@/components/shared/Icons"
import Image from "next/image"
import React from "react"

const WaitListPage = () => {
	return (
		<main className="flex mx-auto items-start justify-between bg-white mt-36">
			<section className="w-[45%] pl-20 justify-start">
				<div className="flex mb-5">
					<Image
						src="/Logo.svg"
						alt="Appscombo logo"
						width={200}
						height={50}
						className="mr-2 object-contain"
					/>
				</div>

				<div className="text-4xl text-gray-900 font-bold mb-8 tracking-wide">
					Stay connected and explore your interests with{" "}
					<span className="text-primary">AppsCombo</span>
				</div>

				<div className="flex flex-col">
					<div className="flex flex-row gap-4">
						<WaitListCheckIcon />
						<span className="text-gray-900 text-lg font-medium">Be a content creator</span>
					</div>

					<div className="w-0.5 h-7 rounded-full bg-gray-200 ml-3.5 my-1" />

					<div className="flex flex-row gap-4">
						<WaitListCheckIcon />
						<span className="text-gray-900 text-lg font-medium">
							Explore multiple content for your interest
						</span>
					</div>

					<div className="w-0.5 h-7 rounded-full bg-gray-200 ml-3.5 my-1" />

					<div className="flex flex-row gap-4">
						<WaitListCheckIcon />
						<span className="text-gray-900 text-lg font-medium">
							Connect multiple social media to your account
						</span>
					</div>
				</div>

				<form className="mt-14 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
					<input
						type="email"
						placeholder="Email Address"
						className="h-10 flex-1 rounded-xl border border-gray-400 bg-white px-6 text-base text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
					/>

					<button
						type="submit"
						className="h-10 rounded-xl bg-primary px-6 text-base font-semibold text-white transition cursor-pointer hover:scale-[1.02] hover:bg-primary-dark"
					>
						Join the waitlist
					</button>
				</form>
			</section>

			<section className="flex -mt-15">
				<div>
					<Image
						src="/waitlist-lady.svg"
						alt="Waitlist Lady"
						width={100}
						height={100}
						className="w-130 h-160 "
					/>
				</div>
			</section>

			<section className="flex pt-15">
				<div className="flex shrink">
					<Image src="/waitlist-dots.svg" alt="Waitlist Dots" width={200} height={190} />
				</div>
			</section>
		</main>
	)
}

export default WaitListPage
