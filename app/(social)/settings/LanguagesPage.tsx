"use client";

import { ArrowLeft } from "lucide-react";

interface LanguagesPageProps {
  onBack: () => void;
}

export default function LanguagesPage({ onBack }: LanguagesPageProps) {
  const languages = [
    "English (United States)",
    "Spanish (Spain)",
    "French (France)",
    "German (Germany)",
    "Italian (Italy)",
    "Portuguese (Brazil)",
    "Chinese (China)",
    "Japanese (Japan)",
    "Russian (Russia)",
    "Arabic (Saudi Arabia)",
  ];

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Settings"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Languages</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col">
          <div className="mt-2 space-y-4">
            {languages.map((language, index) => (
              <div key={index}>
                <h1 className="text-xl font-bold">{language}</h1>
                <p className="text-sm text-gray-500">{language}</p>
                {index < languages.length - 1 && (
                  <hr className="mt-2 border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}