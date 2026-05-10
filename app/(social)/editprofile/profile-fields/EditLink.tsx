"use client";

import { X } from "lucide-react";
import { useState } from "react";
import {
  useUpdateExternalLink,
  useDeleteExternalLink,
} from "@/services/profile/useProfileService";
import { useAuthStore } from "@/store/userStore";

interface EditLinkPageProps {
  linkType: "portfolio" | "shoppingList";
  onClose: () => void;
}

interface ExternalLink {
  id: number;
  url: string;
  label: string;
}

export default function EditLinkPage({ linkType, onClose }: EditLinkPageProps) {
  const user = useAuthStore((state) => state.user?.user);
  const updateLinkMutation = useUpdateExternalLink();
  const deleteLinkMutation = useDeleteExternalLink();

  const existingLink = user?.external_links?.find((link: ExternalLink) =>
    linkType === "portfolio"
      ? link.label.includes("Portfolio")
      : link.label.includes("Shopping")
  );

  const [title, setTitle] = useState(existingLink?.label || "");
  const [url, setUrl] = useState(existingLink?.url || "https://");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Link</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Enter title"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            URL
          </label>
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm pr-10"
              placeholder="Enter URL"
            />
          </div>
        </div>
        <button
          onClick={() => {
            if (existingLink?.id) {
              deleteLinkMutation.mutate(existingLink.id, {
                onSuccess: () => onClose(),
              });
            }
          }}
          disabled={deleteLinkMutation.isPending}
          className="mt-4 w-full py-2 text-red-500 hover:text-red-600 text-sm disabled:opacity-50"
        >
          {deleteLinkMutation.isPending ? "Removing..." : "Remove Link"}
        </button>
        <button
          type="button"
          className=" mt-15 w-full py-2 bg-[#6A88D1] text-white rounded-full hover:bg-[#425483] text-sm sm:text-base disabled:opacity-50"
          onClick={() => {
            if (existingLink?.id) {
              updateLinkMutation.mutate(
                { linkId: existingLink.id, payload: { url, label: title } },
                { onSuccess: () => onClose() }
              );
            }
          }}
          disabled={updateLinkMutation.isPending}
        >
          {updateLinkMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
