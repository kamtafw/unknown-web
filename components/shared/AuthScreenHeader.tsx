import Image from "next/image"
import React from "react"

const AuthScreenHeader = () => {
	return (
		<header className="w-full h-20 flex items-center justify-center border-t border-b border-[#ECEFF6] mx-auto fixed bg-white">
			<div className="w-[85%] flex items-center justify-start">
				<Image
					src="/Logo.svg"
					alt="App Combo"
					width={100}
					height={100}
					className="w-45.25 h-8.5 mr-2 object-contain"
				/>
			</div>
		</header>
	)
}

export default AuthScreenHeader
