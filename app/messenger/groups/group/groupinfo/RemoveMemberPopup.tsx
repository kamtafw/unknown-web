

interface RemoveMemberPopupProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  onConfirm: () => void;
}

export function RemoveMemberPopup({
  isOpen,
  onClose,
  memberName,
  onConfirm,
}: RemoveMemberPopupProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[400px] mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Remove member
          </h3>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove this member ({memberName})
          </p>

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
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}