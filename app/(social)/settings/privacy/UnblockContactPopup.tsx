"use client";

import * as Dialog from "@radix-ui/react-dialog";

interface UnblockContactPopupProps {
  onCancel: () => void;
  onUnblock: () => void;
  selectedCount: number;
}

export default function UnblockContactPopup({ onCancel, onUnblock, selectedCount}: UnblockContactPopupProps) {

  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-md p-6 w-full max-w-[400px]">
          <Dialog.Title className="text-[18px] font-bold text-black mb-4">
            Unblock Contact
          </Dialog.Title>
          <p className="text-[14px] text-gray-600 mb-6">
            Are you sure you want to unblock {selectedCount} contact{selectedCount !== 1 ? "s" : ""}?
          </p>
          <div className="flex justify-end gap-4">
            <Dialog.Close asChild>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-red-400 hover:text-red-600 rounded-full"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                onClick={onUnblock}
                className="px-4 py-2 text-blue-400 rounded-full hover:text-blue-600"
                aria-label="Unblock"
              >
                Unblock
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}