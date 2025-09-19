"use client";

import { useState } from "react";
import { ArrowLeft, User } from "lucide-react";

interface EditNamePageProps {
  onBack: () => void;
}

export default function EditNamePage({ onBack }: EditNamePageProps) {
  const [firstName, setFirstName] = useState("Cameron");
  const [lastName, setLastName] = useState("Williamson");

  return (
    <div className="w-full max-w-[530px] min-h-[auto] bg-white text-[#111827] overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft
            size={16}
            className="cursor-pointer sm:w-5 sm:h-5"
            onClick={onBack}
          />
          <h2 className="text-base font-bold sm:text-lg">Change name</h2>
        </div>
        <div className="mb-4 mt-4 sm:mt-5">
          <label htmlFor="first-name" className="block mb-2 text-sm sm:text-base">
            First name
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 sm:px-3 sm:py-2">
            <User size={14} className="text-gray-500 mr-2 sm:w-4 sm:h-4" />
            <input
              type="text"
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 outline-none text-sm sm:text-base"
              maxLength={20}
              aria-label="First name"
            />
            <span className="text-[#6B7280] text-xs sm:text-sm">{firstName.length}/20</span>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="last-name" className="block mb-2 text-sm sm:text-base">
            Last name
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 sm:px-3 sm:py-2">
            <User size={14} className="text-gray-500 mr-2 sm:w-4 sm:h-4" />
            <input
              type="text"
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="flex-1 outline-none text-sm sm:text-base"
              maxLength={20}
              aria-label="Last name"
            />
            <span className="text-[#6B7280] text-xs sm:text-sm">{lastName.length}/20</span>
          </div>
        </div>
        <p className="text-[#6B7280] text-xs mb-4 mt-4 sm:text-sm sm:mt-5">
          Your name can only be changed once every 7 days
        </p>
        <div className="pt-10 sm:pt-[399px] items-center">
          <button
            type="button"
            className="w-full max-w-[498px] bg-[#6A88D1] hover:bg-[#425483] text-white px-6 py-2 rounded-full font-bold text-base transition-colors sm:px-38 sm:py-3 sm:text-lg"
            onClick={() => console.log()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}