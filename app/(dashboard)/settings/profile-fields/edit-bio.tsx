"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface EditBioPageProps {
  onBack: () => void;
}

export default function EditBioPage({ onBack }: EditBioPageProps) {
  const [bio, setBio] = useState("");

  return (
    <div className="w-[546px] h-[796px] bg-white text-black overflow-auto shadow-md">
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft
            size={20}
            className="cursor-pointer text-black"
            onClick={onBack}
          />
          <h2 className="text-lg font-bold">Bio</h2>
        </div>
        <div className="">
          <div className="flex mt-8 items-start border border-gray-300 rounded-md px-3 py-2 ">
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Placeholder"
              className="flex-1 outline-none resize-none"
              rows={4}
              maxLength={200}
              aria-label="Bio"
            />
            <span className="text-gray-500">{bio.length}/200</span>
          </div>
        </div>
        <div className="pt-[510px] items-center">
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
