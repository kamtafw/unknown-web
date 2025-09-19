"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  EllipsisVertical,
  Camera,
  Search,
  ChevronDown,
  ChevronUp,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatusIndicator } from "@/components/StatusIndicator";
import { MuteStatusPopup } from "./MuteStatusPopup";
import EditTextStatus from "./EditTextStatus"; // Import the new component
import { Status, recentStatuses, viewedStatuses, mutedStatuses } from "./statusData";

interface StatusListProps {
  onMyStatusClick: () => void;
  onContactStatusClick: (contact: Status) => void;
  onEditStoryClick: (imageFile?: File) => void;
}

export function StatusList({
  onMyStatusClick,
  onContactStatusClick,
  onEditStoryClick,
}: StatusListProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewedExpanded, setViewedExpanded] = useState(false);
  const [mutedExpanded, setMutedExpanded] = useState(false);
  const [mutePopupOpen, setMutePopupOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Status | null>(null);
  const [textStatusOpen, setTextStatusOpen] = useState(false); // New state for text status

  const handleStatusClick = (status: Status) => {
    setSelectedContact(status);
    setMutePopupOpen(true);
  };

  const handleMuteConfirm = () => {
    if (selectedContact) {
      console.log(`Muting ${selectedContact.name}`);
    }
    setMutePopupOpen(false);
    setSelectedContact(null);
  };

  const handleMuteClose = () => {
    setMutePopupOpen(false);
    setSelectedContact(null);
  };

  const handleSettingsClick = () => {
    router.push("/settings?view=account");
  };

  const handleStatusPrivacyClick = () => {
    router.push("/settings?view=status");
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onEditStoryClick(file);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  // New handler for text status
  const handleTextStatusClick = () => {
    setTextStatusOpen(true);
  };

  const handleTextStatusClose = () => {
    setTextStatusOpen(false);
  };

  const StatusItem = ({
    status,
    showBorder = true,
    isViewedOrMuted = false,
  }: {
    status: Status;
    showBorder?: boolean;
    isViewedOrMuted?: boolean;
  }) => (
    <div
      className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
      onClick={() => onContactStatusClick(status)} 
      onContextMenu={(e) => {
        e.preventDefault();
        handleStatusClick(status); 
      }}
    >
      <div className="relative">
        {isViewedOrMuted ? (
          <StatusIndicator variant="viewed">
            <Image
              src={status.avatar}
              alt={status.name}
              width={60}
              height={60}
              className="h-15 w-15 rounded-full object-cover"
            />
          </StatusIndicator>
        ) : (
          <>
            <Image
              src={status.avatar}
              alt={status.name}
              width={60}
              height={60}
              className="h-15 w-15 rounded-full object-cover"
            />
            {showBorder && !status.viewed && (
              <div className="absolute -inset-1 w-17 h-17">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 68 68"
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx="34"
                    cy="34"
                    r="32"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="25 8"
                  />
                </svg>
              </div>
            )}
            {status.viewed && (
              <div className="absolute inset-0 rounded-full border-2 border-gray-300" />
            )}
          </>
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{status.name}</p>
        <p className="text-sm text-gray-500">{status.time}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 h-full flex flex-col relative w-full lg:w-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        title="Select an image to upload as your status"
        placeholder="Choose an image file"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Status</h2>
        <div className="flex items-center gap-3">
          <Camera className="h-5 w-5 cursor-pointer" />
          <Search className="h-5 w-5 cursor-pointer" />
          <Popover>
            <PopoverTrigger>
              <EllipsisVertical className="h-5 w-5 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="flex flex-col gap-2">
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={handleStatusPrivacyClick}
                >
                  Status Privacy
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={handleSettingsClick}
                >
                  Settings
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* My Status */}
      <div className="mb-6">
        <div
          className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
          onClick={onMyStatusClick}
        >
          <StatusIndicator variant="active">
            <Image
              src="/Rectangle 2.png"
              alt="My Status"
              width={60}
              height={60}
              className="h-15 w-15 rounded-full object-cover"
            />
          </StatusIndicator>
          <div className="flex-1">
            <p className="font-medium">My Status</p>
            <p className="text-sm text-gray-500">11:02</p>
          </div>
        </div>
      </div>
      <hr className="border-gray-200 mb-4" />

      {/* Recent Updates */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-600">
          Recent updates
        </h3>
        {recentStatuses.map((status) => (
          <StatusItem key={status.id} status={status} />
        ))}
      </div>
      <hr className="border-gray-200 mb-4" />

      {/* Viewed Updates */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => setViewedExpanded(!viewedExpanded)}
        >
          <h3 className="text-lg font-semibold text-gray-600">
            Viewed updates
          </h3>
          {viewedExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        {viewedExpanded &&
          viewedStatuses.map((status) => (
            <StatusItem
              key={status.id}
              status={status}
              isViewedOrMuted={true}
            />
          ))}
      </div>
      <hr className="border-gray-200 mb-4" />

      {/* Muted Updates */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => setMutedExpanded(!mutedExpanded)}
        >
          <h3 className="text-lg font-semibold text-gray-600">Muted updates</h3>
          {mutedExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        {mutedExpanded &&
          mutedStatuses.map((status) => (
            <StatusItem
              key={status.id}
              status={status}
              isViewedOrMuted={true}
            />
          ))}
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-50 right-6 flex flex-col gap-3">
        <div 
          className="bg-white rounded-full p-3 shadow-lg border cursor-pointer hover:shadow-xl transition-shadow"
          onClick={handleTextStatusClick}
        >
          <Edit3 className="h-5 w-5 text-blue-500" />
        </div>
        <div 
          className="bg-blue-500 rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={handleCameraClick}
        >
          <Camera className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Mute Status Popup */}
      <MuteStatusPopup
        isOpen={mutePopupOpen}
        onClose={handleMuteClose}
        onMute={handleMuteConfirm}
        contactName={selectedContact?.name || ""}
      />

      {/* Text Status Editor */}
      <EditTextStatus
        isOpen={textStatusOpen}
        onClose={handleTextStatusClose}
      />
    </div>
  );
}
