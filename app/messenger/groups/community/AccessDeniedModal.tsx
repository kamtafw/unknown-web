"use client";

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessDeniedModal({ isOpen, onClose }: AccessDeniedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <div className="relative">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Access denied
          </h2>
          <p className="text-gray-600 mb-6">
            I am sorry, but you cannot see the messages in this group
          </p>
          <div className="text-right">
            <button
              type="button"
              onClick={onClose}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
