"use client";

import { X, Users, Copy, QrCode } from "lucide-react";
import Image from "next/image";
import { TiArrowForward } from "react-icons/ti";
import { IoShareSocialOutline } from "react-icons/io5";
import { MdLockReset } from "react-icons/md";

interface GroupLinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupAvatar?: string;
  hasGroupIcon?: boolean;
  onSendViaAppsCombo?: () => void;
  onCopyLink?: () => void;
  onShareLink?: () => void;
  onShowQRCode?: () => void;
  onResetLink?: () => void;
}

export function GroupLinkPopup({
  isOpen,
  onClose,
  groupName,
  groupAvatar,
  hasGroupIcon = false,
  onSendViaAppsCombo,
  onCopyLink,
  onShareLink,
  onShowQRCode,
  onResetLink,
}: GroupLinkPopupProps) {
  const groupLink = `http://hjkfgsujfjajdfadfljudfkldfkldfkjklfjk.com`;

  const handleSendViaAppsCombo = () => {
    if (onSendViaAppsCombo) {
      onSendViaAppsCombo();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupLink);
    if (onCopyLink) {
      onCopyLink();
    }
  };

  const handleShareLink = () => {
    if (onShareLink) {
      onShareLink();
    }
  };

  const handleShowQRCode = () => {
    if (onShowQRCode) {
      onShowQRCode();
    }
  };

  const handleResetLink = () => {
    if (onResetLink) {
      onResetLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-[380px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black">Group link</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close group link popup"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-black" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              People with this link do not need admin approval to join this
              group. Edit in{" "}
              <span className="text-blue-500 cursor-pointer hover:underline">
                group permissions.
              </span>
            </p>
          </div>

          {/* Group Info */}
          <div className="flex items-center gap-3 mb-6">
            {hasGroupIcon || !groupAvatar ? (
              <div className="h-12 w-12 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
            ) : (
              <Image
                src={groupAvatar}
                alt={groupName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">{groupName}</h3>
              <p className="text-sm text-blue-500 break-all">{groupLink}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Members can:
            </p>
          </div>

          {/* Action Options */}
          <div className="space-y-1">
            <button
              onClick={handleSendViaAppsCombo}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <TiArrowForward className="h-5 w-5 text-gray-700" />
              <span className="text-gray-800 font-medium">
                Send link via AppsCombo
              </span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <Copy className="h-5 w-5 text-gray-700" />
              <span className="text-gray-800 font-medium">Copy Link</span>
            </button>

            <button
              onClick={handleShareLink}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <IoShareSocialOutline className="h-5 w-5 text-gray-700" />
              <span className="text-gray-800 font-medium">Share link</span>
            </button>

            <button
              onClick={handleShowQRCode}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <QrCode className="h-5 w-5 text-gray-700" />
              <span className="text-gray-800 font-medium">QR code</span>
            </button>

            <button
              onClick={handleResetLink}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <MdLockReset className="h-5 w-5 text-red-500" />
              <span className="text-red-500 font-medium">Reset link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
