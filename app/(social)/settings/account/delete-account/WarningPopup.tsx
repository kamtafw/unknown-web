"use client";

interface WarningPopupProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function WarningPopup({ onCancel, onConfirm }: WarningPopupProps) {
  const consequences = [
    "The account will be deleted from AppsCombo.",
    "Your message history will be erased.",
    "You will be removed from all your AppsCombo groups.",
    "Your google storage backup will be deleted.",
    "Any channels you created will be deleted.",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px] shadow-lg">
        <h2 className="text-lg font-semibold text-[16px] text-[#EC4D38]">
          Warning
        </h2>
        <p className="mt-2 text-sm text-[16px]">
          If you delete this account:
        </p>
        <ul className="mt-4 list-disc pl-5 text-base self-start space-y-2">
          {consequences.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-blue-500 text-sm hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-[#EC4D38] text-sm hover:underline cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}