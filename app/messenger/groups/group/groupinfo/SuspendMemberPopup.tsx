import { useState } from "react";

interface SuspendMemberPopupProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  onConfirm: (duration: string) => void;
}

export function SuspendMemberPopup({
  isOpen,
  onClose,
//   memberName,
  onConfirm,
}: SuspendMemberPopupProps) {
  const [selectedDuration, setSelectedDuration] = useState("8 hours");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedDuration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[400px] mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Suspend member
          </h3>
          
          <p className="text-gray-600 mb-6">
            How long do you want to suspend this member
          </p>

          <div className="space-y-4 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="duration"
                value="8 hours"
                checked={selectedDuration === "8 hours"}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">8 hours</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="duration"
                value="1 week"
                checked={selectedDuration === "1 week"}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">1 week</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="duration"
                value="Always"
                checked={selectedDuration === "Always"}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">Always</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              Suspend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}