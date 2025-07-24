"use client";

import { Dot } from "lucide-react";

export default function GetVerifiedPage() {
  const benefits = [
    {
      id: 1,
      title: "Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      points: [
        "adipsicing elit, sed do eiusmod tempor incididunt",
        "adipsicing elit, sed do eiusmod tempor incididunt",
        "adipsicing elit, sed do eiusmod tempor incididunt",
      ],
    },
    {
      id: 2,
      title: "Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      points: [
        "adipsicing elit, sed do eiusmod tempor incididunt",
        "adipsicing elit, sed do eiusmod tempor incididunt",
        "adipsicing elit, sed do eiusmod tempor incididunt",
      ],
    },
  ];

  return (
    <div className="flex justify-center  mb-4 lg:ml-3  lg:mb-14">
      <div className="w-full max-w-[530px] min-h-[auto] bg-white text-black overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-3 py-2 flex items-center sm:px-4 sm:py-3">
            <h1 className="text-lg font-bold sm:text-xl">Get Verified</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2 sm:text-2xl">
            Get verified with Premium
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm sm:text-base sm:mb-8 max-w-md">
            Enjoy an enhanced experience, exclusive creator tools, top-tier
            verification and security.
          </p>
          <div className="w-full max-w-md mb-6 sm:mb-8">
            <h3 className="text-base mb-3 sm:text-lg sm:mb-4">
              Benefits for verification
            </h3>
            {benefits.map((benefit) => (
              <div key={benefit.id} className="mb-4 sm:mb-6">
                <h4 className="mb-2 text-sm sm:text-base">{benefit.title}</h4>
                <ul className="space-y-1 sm:space-y-2">
                  {benefit.points.map((point, index) => (
                    <li key={ index} className="flex items-start gap-2">
                      <Dot
                        size={16}
                        className="mt-0.5 flex-shrink-0 sm:w-5 sm:h-5"
                      />
                      <span className="text-sm sm:text-base">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-10 sm:pt-20">
            <button className="w-full max-w-[300px] bg-[#6A88D1] hover:bg-[#425483] text-white px-6 py-2 rounded-full font-bold text-base transition-colors sm:px-30 sm:py-3 sm:text-lg">
              Verify at $5,000
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}