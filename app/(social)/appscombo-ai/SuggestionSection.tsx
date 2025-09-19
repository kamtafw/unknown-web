"use client";

import Image from "next/image";

export default function SuggestionsSection() {
  return (
    <div className="flex justify-center sm:justify-start w-full lg:mr-0">
      <div className="w-full  min-h-[400px] bg-white text-gray-900 overflow-auto border border-gray-200 rounded-lg shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3">
             <h2 className="text-xl font-semibold text-gray-800">AI suggestions to get started</h2>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-800">How do I become more productive?</p>
              <Image
                src="/productiveai.png"
                alt="Productivity"
                width={40}
                height={40}
                className="mt-2"
              />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-800">How do I boost my engagement?</p>
              <Image
                src="/engamentai.png"
                alt="Engagement"
                width={40}
                height={40}
                className="mt-2"
              />
            </div>
          </div>
          <Image
            src="/Ai Combo.png"
            alt="Additional Image"
            width={200}
            height={100}
            className="w-full max-w-md lg:max-w-full"
          />
          <h2 className="text-xl font-semibold text-gray-800">Recent History</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              "How to improve time management",
              "Best practices for user onboarding",
              "Tips for social media growth",
              "How to analyze user feedback",
              "Strategies for team collaboration",
              "AI tools for productivity",
            ].map((text, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800">{text}</p>
                <p className="text-gray-500 text-sm mt-2">2 Hours ago</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}