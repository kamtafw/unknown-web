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
    <div className="flex justify-start ml-5 mb-14">
      <div className="w-[546px] h-[796px] bg-white text-black overflow-auto  shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 ">
          <div className="px-4 py-3 flex items-center">
            <h1 className="text-xl font-bold">Get Verified</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-10">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            Get verified with Premium
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-md">
            Enjoy an enhanced experience, exclusive creator tools, top-tier
            verification and security.
          </p>
          <div className="w-full max-w-md mb-8">
            <h3 className="text-lg mb-4">
              Benefits for verification
            </h3>
            {benefits.map((benefit) => (
              <div key={benefit.id} className="mb-6">
                <h4 className="mb-2">{benefit.title}</h4>
                <ul className="space-y-2">
                  {benefit.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Dot
                        size={18}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-20">
          <button className="bg-[#6A88D1]  hover:bg-[#425483] text-white px-30 py-3 rounded-full font-bold text-lg transition-colors">
            Verify at $5,000
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
