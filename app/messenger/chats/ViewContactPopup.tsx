"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { FaMusic } from "react-icons/fa";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HiDotsVertical } from "react-icons/hi";
import { MdBlockFlipped, MdOutlineMessage } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { CiShare2 } from "react-icons/ci";
import { LuMessageCircleWarning } from "react-icons/lu";
import { EditContactPopup } from "./EditContactPopup";
import { ShareContactPopup } from "./ShareContactPopup";
import { BusinessAccountPopup } from "./BusinessAccountPopup";
import { ReportContactPopup } from "./ReportContactPopup";
import { BlockContactPopup } from "./BlockContactPopup";
import MediaGalleryPopup from "./MediaGalleryPopup";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  isSelected: boolean;
}

type AccountType = "business" | "personal";

interface ViewContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar: string;
  contactPhone?: string;
  accountType?: AccountType; 
  onMessage?: () => void;
  onCall?: () => void;
  onShare?: () => void;
  onContactUpdated?: (
    firstName: string,
    lastName: string,
    phoneNumber: string
  ) => void;
  onContactShared?: (selectedContacts: Contact[]) => void;
}

interface ContactContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onShare: () => void;
  onViewSocialProfile: () => void;
  onViewInAddressBook: () => void;
}

function ContactContextMenu({
  isOpen,
  position,
  onClose,
  onEdit,
  onShare,
  onViewSocialProfile,
  onViewInAddressBook,
}: ContactContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { label: "Edit", action: onEdit },
    { label: "Share", action: onShare },
    { label: "View social profile", action: onViewSocialProfile },
    { label: "View in address book", action: onViewInAddressBook },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[60] bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-[120px]"
      style={{
        left: position.x - 130,
        top: position.y + 5,
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function ViewContactPopup({
  isOpen,
  onClose,
  contactName,
  contactAvatar,
  contactPhone = "+234 8143245678",
  accountType = "business",
  onMessage,
  onCall,
  onContactUpdated,
  onContactShared,
}: ViewContactPopupProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showBusinessPopup, setShowBusinessPopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  if (showEditPopup) {
    return (
      <EditContactPopup
        isOpen={true}
        onClose={() => {
          setShowEditPopup(false);
          onClose();
        }}
        contactName={contactName}
        onSubmit={(
          firstName: string,
          lastName: string,
          phoneNumber: string
        ) => {
          console.log("Contact updated:", { firstName, lastName, phoneNumber });
          if (onContactUpdated) {
            onContactUpdated(firstName, lastName, phoneNumber);
          }
          setShowEditPopup(false);
          onClose();
        }}
      />
    );
  }

  if (showSharePopup) {
    return (
      <ShareContactPopup
        isOpen={true}
        onClose={() => {
          setShowSharePopup(false);
          onClose();
        }}
        onSubmit={(selectedContacts: Contact[]) => {
          console.log("Sharing contact to:", selectedContacts);
          if (onContactShared) {
            onContactShared(selectedContacts);
          }
          setShowSharePopup(false);
          onClose();
        }}
      />
    );
  }

  if (showBusinessPopup) {
    return (
      <BusinessAccountPopup
        isOpen={true}
        onClose={onClose}
        onBack={() => setShowBusinessPopup(false)}
      />
    );
  }

  if (showReportPopup) {
    return (
      <ReportContactPopup
        isOpen={true}
        onClose={() => {
          setShowReportPopup(false);
          onClose();
        }}
        contactName={contactName}
      />
    );
  }

  if (showBlockPopup) {
    return (
      <BlockContactPopup
        isOpen={true}
        onClose={() => {
          setShowBlockPopup(false);
          onClose();
        }}
        onBlock={(reason: string, feedback: string) => {
          console.log("Blocking contact:", contactName, "Reason:", reason, "Feedback:", feedback);
          setShowBlockPopup(false);
          onClose();
        }}
        chatName={contactName}
      />
    );
  }

  if (showMediaGallery) {
    return (
      <MediaGalleryPopup
        isOpen={true}
        onClose={() => {
          setShowMediaGallery(false);
          onClose();
        }}
        contactName={contactName}
        contactAvatar={contactAvatar}
      />
    );
  }

  const handleMessage = () => {
    if (onMessage) {
      onMessage();
    }
    onClose();
  };

  const handleCall = () => {
    if (onCall) {
      onCall();
    }
    onClose();
  };

  const handleShareClick = () => {
    setShowSharePopup(true);
  };

  const handleBlockContact = () => {
    setShowBlockPopup(true);
  };

  const handleReportContact = () => {
    setShowReportPopup(true);
  };

  const handleMediaGalleryClick = () => {
    setShowMediaGallery(true);
  };

  const handleDotsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuPosition({
      x: rect.right,
      y: rect.bottom,
    });
    setShowContextMenu(true);
  };

  const handleEdit = () => {
    setShowEditPopup(true);
    setShowContextMenu(false);
  };

  const handleShareFromMenu = () => {
    setShowSharePopup(true);
    setShowContextMenu(false);
  };

  const handleViewSocialProfile = () => {
    router.push("/home");
  };

  const handleViewInAddressBook = () => {
    console.log("View in address book:", contactName);
  };

  const handleAccountTypeClick = () => {
    if (accountType === "business") {
      setShowBusinessPopup(true);
    }
  };

  const accountConfig = {
    business: {
      image: "/ChatFrame.svg",
      title: "Business account",
      description: "This account uses AppsCombo business",
    },
    personal: {
      image: "/GroupFrame.svg",
      title: "Personal account",
      description: "This is a personal account",
    },
  };

  const currentAccountConfig = accountConfig[accountType];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 ">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={handleDotsClick}
            >
              <HiDotsVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center py-1 px-4">
            <div className="relative mb-4">
              <Image
                src={contactAvatar}
                alt={contactName}
                width={100}
                height={100}
                className="rounded-full object-contain"
              />
            </div>

            <h2 className="text-xl font-semibold mb-1">{contactName}</h2>
            <p className="text-gray-500 text-sm mb-1">
              @{contactName.replace(/\s+/g, " ")}
            </p>
            <p className="text-gray-600 text-sm">{contactPhone}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 py-4">
            <Button
              variant="ghost"
              className="  w-25 h-15 flex flex-col items-center gap-1 p-8 border-2 rounded-lg"
              onClick={handleMessage}
            >
              <MdOutlineMessage className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-blue-600">Message</span>
            </Button>

            <Button
              variant="ghost"
              className="w-25 h-15 flex flex-col items-center gap-1 p-8 border-2 rounded-lg"
              onClick={handleCall}
            >
              <IoCallOutline className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-blue-600">Call</span>
            </Button>

            <Button
              variant="ghost"
              className="w-25 h-15 flex flex-col items-center gap-1 p-8 border-2 rounded-lg"
              onClick={handleShareClick}
            >
              <CiShare2 className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-blue-600">Share</span>
            </Button>
          </div>

          {/* Account Type Section - Now Clickable for Business */}
          <div className="px-4 py-3">
            <div 
              className={`flex items-center gap-3 ${
                accountType === "business" 
                  ? "cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors" 
                  : ""
              }`}
              onClick={handleAccountTypeClick}
            >
              <Image
                src={currentAccountConfig.image}
                alt={`${accountType} account`}
                width={25}
                height={25}
                className=" object-contain"
              />
              <div>
                <p className="font-medium text-sm">
                  {currentAccountConfig.title}
                </p>
                <p className="text-xs text-gray-500">
                  {currentAccountConfig.description}
                </p>
              </div>
            </div>
          </div>

          {/* Media Section - Now Clickable */}
          <div className="px-4 py-3">
            <div 
              className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              onClick={handleMediaGalleryClick}
            >
              <p className="font-medium text-sm">Media, Links, & Docs</p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">101</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Media Preview - Also Clickable */}
            <div 
              className="grid grid-cols-4 gap-1 cursor-pointer"
              onClick={handleMediaGalleryClick}
            >
              <div className="relative aspect-square bg-gray-200 rounded overflow-hidden">
                <Image
                  src="/Rectangle 4.png"
                  alt="Media"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                  0:12
                </div>
              </div>
              <div className="relative aspect-square bg-gray-200 rounded overflow-hidden">
                <Image
                  src="/map.png"
                  alt="Media"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="aspect-square bg-green-400 rounded flex items-center justify-center">
                <FaMusic className="h-6 w-6 text-white" />
                <span className="absolute bottom-1 right-1 text-white text-xs">
                  2:43
                </span>
              </div>

              <div className="aspect-square bg-green-400 rounded flex items-center justify-center">
                <FaMusic className="h-6 w-6 text-white" />
                <span className="absolute bottom-1 right-1 text-white text-xs">
                  3:48
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="font-medium text-sm mb-3">User action</p>

            <Button
              variant="ghost"
              className="w-full justify-start gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 p-3 mb-2"
              onClick={handleBlockContact}
            >
              <MdBlockFlipped className="text-red-500 !w-6 !h-6" />
              Block {contactName.split(" ")[0]}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 p-3"
              onClick={handleReportContact}
            >
              <LuMessageCircleWarning className="text-blue-500 !w-6 !h-6" />
              Report {contactName.split(" ")[0]}
            </Button>
          </div>
        </div>
      </div>

      <ContactContextMenu
        isOpen={showContextMenu}
        position={contextMenuPosition}
        onClose={() => setShowContextMenu(false)}
        onEdit={handleEdit}
        onShare={handleShareFromMenu}
        onViewSocialProfile={handleViewSocialProfile}
        onViewInAddressBook={handleViewInAddressBook}
      />
    </>
  );
}