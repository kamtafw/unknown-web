"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useUpdateBio } from "@/services/profile/useProfileService";
import { useAuthStore } from "@/store/userStore";

interface EditBioPageProps {
  onBack: () => void;
}

export default function EditBioPage({ onBack }: EditBioPageProps) {
  const user = useAuthStore((state) => state.user?.user);
  const [bio, setBio] = useState(user?.profile?.about_me || "");
  const updateBioMutation = useUpdateBio();

  return (
    <div className="w-full max-w-[530px] min-h-[auto] bg-white text-black overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft
            size={16}
            className="cursor-pointer text-black sm:w-5 sm:h-5"
            onClick={onBack}
          />
          <h2 className="text-base font-bold sm:text-lg">Bio</h2>
        </div>
        <div className="">
          <div className="flex mt-6 items-start border border-gray-300 rounded-md px-2 py-1 sm:px-3 sm:py-2 sm:mt-8">
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Placeholder"
              className="flex-1 outline-none resize-none text-sm sm:text-base"
              rows={4}
              maxLength={200}
              aria-label="Bio"
            />
            <span className="text-gray-500 text-xs sm:text-sm">
              {bio.length}/200
            </span>
          </div>
        </div>
        <div className="pt-10 sm:pt-[510px] items-center">
          <button
            type="button"
            className="w-full max-w-[498px] bg-[#6A88D1] hover:bg-[#425483] text-white px-6 py-2 rounded-full font-bold text-base transition-colors sm:px-38 sm:py-3 sm:text-lg"
            onClick={() => {
              updateBioMutation.mutate(
                { about_me: bio },
                { onSuccess: () => onBack() }
              );
            }}
            disabled={updateBioMutation.isPending}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
