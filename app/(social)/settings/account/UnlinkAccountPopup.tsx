"use client";

interface UnlinkAccountPopupProps {
  onClose: () => void;
  onUnlink: () => void;
  username: string;
}

export default function UnlinkAccountPopup({
  onClose,
  onUnlink,
  username,
}: UnlinkAccountPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Unlink account</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          ></button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          DO you wish to unlink this account {username} from AppsCombo?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="py-2 px-4  text-[#6A88D1] rounded-full hover:bg-blue-200 text-sm"
          >
            Close
          </button>
          <button
            onClick={onUnlink}
            className="py-2 px-4  text-[#EC4D38] rounded-full hover:bg-red-200 text-sm"
          >
            Unlink account
          </button>
        </div>
      </div>
    </div>
  );
}
