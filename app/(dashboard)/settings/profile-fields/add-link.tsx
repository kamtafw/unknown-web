"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface AddLinkPageProps {
  onBack: () => void;
}

export default function AddLinkPage({ onBack }: AddLinkPageProps) {
  const [title, setTitle] = useState("My Portfolio");
  const [url, setUrl] = useState("https://");


  return (
    <div className="w-[546px] h-[796px] bg-white text-black overflow-auto shadow-md">
      <div className="px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <ArrowLeft
            className="cursor-pointer text-black "
            onClick={onBack}
          />
          <h2 className="text-lg font-bold">Add External Link</h2>
        </div>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-600 mb-2 mt-7">
            Title
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 outline-none"
              aria-label="Edit link title"
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="url" className="block text-gray-600 mb-2 mt-7">
            URL
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 outline-none"
              aria-label="Edit link URL"
            />
          </div>
        </div>
        <div className="pt-[440px] items-center">
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
