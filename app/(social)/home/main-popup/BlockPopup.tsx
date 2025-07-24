"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ReportPopup from "./ReportPopup";

export default function BlockPopup({
  onClose,
  username,
}: {
  onClose: () => void;
  username: string;
}) {
  const router = useRouter();
  const [showReportPopup, setShowReportPopup] = useState(false);

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Block {username}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close popup"
            title="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-500 text-left">
          They will be able to see your public post, but will no longer be able
          to engage with them.{username} will also not be able to follow or
          message you, and you will not see notifications from them{" "}
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 text-blue-400  hover:text-blue-500"
            onClick={() => {
              router.push("/home");
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-red-500  hover:text-red-600"
            onClick={() => setShowReportPopup(true)}
          >
            Block
          </button>
        </div>
      </div>
      {showReportPopup && <ReportPopup onClose={onClose} username={username} />}
    </div>
  );
}


