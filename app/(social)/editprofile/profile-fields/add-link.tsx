"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAddExternalLink } from "@/services/profile/useProfileService";

interface AddLinkPageProps {
  onBack: () => void;
}

export default function AddLinkPage({ onBack }: AddLinkPageProps) {
  const [title, setTitle] = useState("My Portfolio");
  const [url, setUrl] = useState("https://");
  const addLinkMutation = useAddExternalLink();

  return (
    <div className="w-full max-w-[530px] min-h-[auto] bg-white text-black overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-2 mb-4 sm:gap-4">
          <ArrowLeft
            className="cursor-pointer text-black sm:w-5 sm:h-5"
            onClick={onBack}
          />
          <h2 className="text-base font-bold sm:text-lg">Add External Link</h2>
        </div>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-600 mb-2 mt-5 text-sm sm:text-base sm:mt-7"
          >
            Title
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 sm:px-3 sm:py-2">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 outline-none text-sm sm:text-base"
              aria-label="Edit link title"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="url"
            className="block text-gray-600 mb-2 mt-5 text-sm sm:text-base sm:mt-7"
          >
            URL
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 sm:px-3 sm:py-2">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 outline-none text-sm sm:text-base"
              aria-label="Edit link URL"
            />
          </div>
        </div>
        <div className="pt-10 sm:pt-[440px] items-center">
          <button
            type="button"
            className="w-full max-w-[498px] bg-[#6A88D1] hover:bg-[#425483] text-white px-6 py-2 rounded-full font-bold text-base transition-colors sm:px-38 sm:py-3 sm:text-lg disabled:opacity-50"
            onClick={() => {
              addLinkMutation.mutate(
                { url, label: title },
                { onSuccess: () => onBack() }
              );
            }}
            disabled={addLinkMutation.isPending}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
