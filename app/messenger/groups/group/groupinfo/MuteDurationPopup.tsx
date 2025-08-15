import { useState } from "react";

interface MuteDurationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: string) => void;
  type: 'message' | 'voiceChat';
}

export function MuteDurationPopup({ isOpen, onClose, onConfirm }: MuteDurationPopupProps) {
  const [selectedDuration, setSelectedDuration] = useState("8 hours");

  const handleConfirm = () => {
    onConfirm(selectedDuration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[320px] mx-4">
        {/* Header */}
        <div className="p-4 border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mute notifications</h2>
          <p className="text-sm text-gray-600 mt-1">
            Other members will not see that you muted this chat. you will still be notified if you are mentioned.
          </p>
        </div>

        {/* Duration Options */}
        <div className="p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="muteDuration"
              value="8 hours"
              checked={selectedDuration === "8 hours"}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900">8 hours</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="muteDuration"
              value="1 week"
              checked={selectedDuration === "1 week"}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900">1 week</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="muteDuration"
              value="Always"
              checked={selectedDuration === "Always"}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900">Always</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 p-4 border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}