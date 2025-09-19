"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MutePopup({
  onClose,
  username,
}: {
  onClose: () => void;
  username: string;
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Mute {username}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
            title="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          You wont see post from Mute {username} or get notification about them,
          they wont know they have been muted.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 text-red-500  hover:text-red-600"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 text-blue-500  hover:text-blue-600"
            onClick={() => {
              router.push("/home");
              onClose();
            }}
          >
            Mute
          </button>
        </div>
      </div>
    </div>
  );
}

