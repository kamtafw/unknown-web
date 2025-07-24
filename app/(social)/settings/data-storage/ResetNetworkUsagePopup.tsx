"use client";

interface ResetNetworkUsagePopupProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetNetworkUsagePopup({
  onClose,
  onConfirm,
}: ResetNetworkUsagePopupProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-[300px] text-center">
      <h2 className="text-lg font-semibold mb-4">
        Reset Network Usage Settings
      </h2>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="text-sm font-medium text-gray-600 hover:underline"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
