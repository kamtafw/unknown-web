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
    <div className="w-[546px] h-[796px] bg-white text-[#111827] overflow-auto shadow-md">
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft
            size={20}
            className="cursor-pointer"
            onClick={onBack}
          />
          <h2 className="text-lg font-bold">Change name</h2>
        </div>
        <div className="mb-4 mt-5">
          <label htmlFor="first-name" className="block mb-2">
            First name
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
            <User size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 outline-none"
              maxLength={20}
              aria-label="First name"
            />
            <span className="text-[#6B7280]">{firstName.length}/20</span>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="last-name" className="block mb-2">
            Last name
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
            <User size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="flex-1 outline-none"
              maxLength={20}
              aria-label="Last name"
            />
            <span className="text-[#6B7280">{lastName.length}/20</span>
          </div>
        </div>
        <p className="text-[#6B7280] text-sm mb-4 mt-5">
          Your name can only be changed once every 7 days
        </p>
        <div className="pt-[399px] items-center">
          <button
            type="button"
            className="w-[498px] bg-[#6A88D1]  hover:bg-[#425483] text-white px-38 py-3 rounded-full font-bold text-lg transition-colors"
            onClick={() => console.log()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
