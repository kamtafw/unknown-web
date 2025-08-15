"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MuteStatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onMute: () => void;
  contactName: string;
}

export function MuteStatusPopup({
  isOpen,
  onClose,
  onMute,
  contactName,
}: MuteStatusPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Mute {contactName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 text-sm">
            New status updates from {contactName} won&#39;t appear under recent
            updates anymore
          </p>
        </div>

        <div className="flex justify-end gap-0 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-5 text-red-500"
          >
            Close
          </Button>
          <Button
            onClick={onMute}
            variant="link"
            className="px-5 text-blue-500 hover:bg-blue-600"
          >
            Mute
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
