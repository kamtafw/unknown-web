"use client";

import { useState } from "react";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { LuVolumeOff, LuVolume2 } from "react-icons/lu";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdCallEnd } from "react-icons/md";
import Image from "next/image";
import { ContactPopup } from "./ContactPopup";

interface Participant {
  id: number;
  avatar: string;
}

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
}

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  onEndCall: () => void;
  participants: Participant[];
  onAddParticipant?: () => void;
  groupName?: string;
}

export function VideoCall({
  isOpen,
  onEndCall,
  participants,
  groupName = "Video call",
}: VideoCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const mockParticipants: Participant[] = [
    {
      id: 1,
      avatar: "/Rectangle 1.png",
    },
    {
      id: 2,
      avatar: "/Rectangle 2.png",
    },
    {
      id: 3,
      avatar: "/Rectangle 3.png",
    },
    {
      id: 4,
      avatar: "/Rectangle 4.png",
    },
    {
      id: 5,
      avatar: "/Rectangle 2.png",
    },
    {
      id: 6,
      avatar: "/Rectangle 1.png",
    },
    {
      id: 7,
      avatar: "/Rectangle 2.png",
    },
    {
      id: 8,
      avatar: "/Rectangle 3.png",
    },
    {
      id: 9,
      avatar: "/Rectangle 4.png",
    },
    {
      id: 10,
      avatar: "/Rectangle 2.png",
    },
    {
      id: 11,
      avatar: "/Rectangle 1.png",
    },
  ];

  const displayedParticipants =
    participants.length > 0 ? participants : mockParticipants;

  const handleEndCall = () => {
    setIsVideoOn(true);
    setIsVolumeOn(true);
    setIsExpanded(false);
    onEndCall();
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleVolume = () => {
    setIsVolumeOn(!isVolumeOn);
  };

  const handleAddParticipant = () => {
    setShowContactPopup(true);
  };

  const handleContactSelect = (selectedContacts: Contact[]) => {
    const newParticipants = selectedContacts.map(contact => ({
      id: contact.id,
      avatar: contact.avatar,
    }));
    
    console.log("Adding participants:", newParticipants);

    setShowContactPopup(false);
  };

  const chunkParticipants = (participants: Participant[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < participants.length; i += chunkSize) {
      chunks.push(participants.slice(i, i + chunkSize));
    }
    return chunks;
  };

  if (!isOpen) return null;

  // Mobile: 2 participants per row, Desktop: 5 participants per row
  const participantRowsMobile = chunkParticipants(displayedParticipants, 2);
  const participantRowsDesktop = chunkParticipants(displayedParticipants, 5);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[50] flex items-center justify-center">
        <div
          className={`bg-[#111827] rounded-xl shadow-2xl transition-all duration-300 p-3 sm:p-4 lg:p-6 border-none ${
            isExpanded 
              ? "w-full h-full rounded-none" 
              : "w-[90%] h-[85%] sm:w-[90%] sm:h-[90%] lg:w-[800px] lg:h-[600px] sm:rounded-xl"
          } relative flex flex-col`}
        >
          {/* Header with Group Name */}
          <div className="flex items-center justify-center mb-3 sm:mb-4 lg:mb-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {groupName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">Video call</p>
            </div>
          </div>

          {/* Video Grid - Mobile Layout */}
          <div className="flex-1 mb-3 sm:mb-4 lg:mb-6 overflow-y-auto block lg:hidden">
            {participantRowsMobile.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                {row.map((participant) => (
                  <div key={participant.id} className="relative">
                    <div className="relative overflow-hidden rounded-lg aspect-video">
                      <Image
                        src={participant.avatar}
                        alt={`Participant ${participant.id}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Video Grid - Desktop Layout */}
          <div className="flex-1 mb-6 overflow-y-auto hidden lg:block">
            {participantRowsDesktop.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-3 mb-4">
                {row.map((participant) => (
                  <div key={participant.id} className="relative">
                    <div className="relative overflow-hidden rounded-lg min-h-[120px]">
                      <Image
                        src={participant.avatar}
                        alt={`Participant ${participant.id}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Control Buttons - Mobile Layout */}
          <div className="flex justify-center space-x-2 sm:space-x-3 lg:hidden">
            {/* End call - Always visible */}
            <button
              onClick={handleEndCall}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              title="End call"
            >
              <MdCallEnd className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`w-10 h-10 sm:w-12 sm:h-12 bg-[#292F3D] rounded-full flex items-center justify-center transition-colors ${
                isVideoOn
                  ? "text-gray-600 hover:text-gray-300"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              title={isVideoOn ? "Turn off video" : "Turn on video"}
            >
              {isVideoOn ? (
                <BsCameraVideo className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              ) : (
                <BsCameraVideoOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              )}
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleVolume}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                isVolumeOn
                  ? "bg-[#292F3D] hover:bg-gray-300"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={isVolumeOn ? "Mute" : "Unmute"}
            >
              {isVolumeOn ? (
                <LuVolume2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              ) : (
                <LuVolumeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              )}
            </button>

            {/* Add participant */}
            <button
              onClick={handleAddParticipant}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              title="Add person"
            >
              <MdOutlinePersonAddAlt className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>

            {/* More options */}
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#292F3D] hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              aria-label="More options"
            >
              <HiDotsHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
          </div>

          {/* Control Buttons - Desktop Layout (unchanged) */}
          <div className="hidden lg:flex justify-center space-x-4">
            {/* More options */}
            <button
              className="w-12 h-12 bg-[#292F3D] hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              aria-label="More options"
            >
              <HiDotsHorizontal className="h-5 w-5 text-gray-600" />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 bg-[#292F3D] rounded-full flex items-center justify-center transition-colors ${
                isVideoOn
                  ? "text-gray-600 hover:text-gray-300"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              title={isVideoOn ? "Turn off video" : "Turn on video"}
            >
              {isVideoOn ? (
                <BsCameraVideo className="h-5 w-5 text-gray-600" />
              ) : (
                <BsCameraVideoOff className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* End call */}
            <button
              onClick={handleEndCall}
              className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              title="End call"
            >
              <MdCallEnd className="h-5 w-5 text-white" />
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleVolume}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVolumeOn
                  ? "bg-[#292F3D] hover:bg-gray-300"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={isVolumeOn ? "Mute" : "Unmute"}
            >
              {isVolumeOn ? (
                <LuVolume2 className="h-5 w-5 text-gray-600" />
              ) : (
                <LuVolumeOff className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Add participant */}
            <button
              onClick={handleAddParticipant}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              title="Add person"
            >
              <MdOutlinePersonAddAlt className="h-5 w-5 text-white" />
            </button>

            {/* Expand/Contract */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? (
                <BsArrowsAngleContract className="h-5 w-5 text-white" />
              ) : (
                <BsArrowsAngleExpand className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Popup */}
      <ContactPopup
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        onStartCall={handleContactSelect}
      />
    </>
  );
}