"use client";

import { ArrowLeft } from "lucide-react";

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export default function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  const sections = [
    {
      title: "Lorem Ipsum?",
      points: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        "exercitation ullamco laboris nisi ut aliquip ex ea.",
      ],
    },
    {
      title: "Lorem Ipsum?",
      points: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        "exercitation ullamco laboris nisi ut aliquip ex ea.",
      ],
    },
    {
      title: "Lorem Ipsum?",
      points: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.",
        "exercitation ullamco laboris nisi ut aliquip ex ea.",
      ],
    },
  ];

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Support"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Privacy Policy</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col space-y-6">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-[16px]">
                {section.title}
              </h3>
              <ul className="mt-5 list-disc pl-5 text-sm text-gray-500 space-y-3">
                {section.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
